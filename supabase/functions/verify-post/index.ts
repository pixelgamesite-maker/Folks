// supabase/functions/verify-post/index.ts
//
// Replaces "does this look like a URL" with "did X actually confirm this
// post exists, belongs to this person, and does what we asked." Uses the
// person's own X access token (stored by store-x-session) to call the
// "your tweets" endpoint — an owned-read endpoint, billed at X's cheapest
// tier ($0.001/resource) since it's the account's own data, not an
// arbitrary lookup.
//
// Body: { url: string, mode: "mention" | "reply", replyToTweetId?: string }
//   mode "mention" — used for Early Role's bullish tweet: passes if the
//     tweet's text mentions the target handle.
//   mode "reply"   — used for Whitelist's "comment and tag 2 frens": passes
//     if the tweet is an actual reply to replyToTweetId (the pinned post).
//
// Deploy: supabase functions deploy verify-post
// Secrets needed: X_CLIENT_ID, X_CLIENT_SECRET (same values already
// configured in Supabase Auth → Providers → X), SUPABASE_SERVICE_ROLE_KEY
// and SUPABASE_URL are provided automatically by Supabase.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const TARGET_HANDLE = (Deno.env.get("TARGET_X_HANDLE") ?? "thefolkseth_").toLowerCase();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ verified: false, reason: "Missing Authorization header" }, 401);

    const callerClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userError } = await callerClient.auth.getUser();
    if (userError || !user) return json({ verified: false, reason: "Invalid session" }, 401);

    const { url, mode, replyToTweetId } = await req.json();
    const tweetId = extractTweetId(url);
    if (!tweetId) return json({ verified: false, reason: "Couldn't find a tweet ID in that link." });

    const xUserId = user.user_metadata?.provider_id ?? user.user_metadata?.sub;
    if (!xUserId) return json({ verified: false, reason: "No X account ID on file — reconnect X and try again." });

    const adminClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const accessToken = await getValidAccessToken(adminClient, user.id);
    if (!accessToken) {
      return json({ verified: false, reason: "X session expired — reconnect X and try again." });
    }

    // Owned read: the account's own recent tweets, not an arbitrary lookup.
    const res = await fetch(
      `https://api.x.com/2/users/${xUserId}/tweets?max_results=25&tweet.fields=text,referenced_tweets`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!res.ok) {
      console.error("X API error:", res.status, await res.text());
      return json({ verified: false, reason: "Couldn't reach X right now. Try again shortly." });
    }

    const payload = await res.json();
    const tweets: any[] = payload?.data ?? [];
    const match = tweets.find((t) => t.id === tweetId);

    if (!match) {
      return json({ verified: false, reason: "That post wasn't found on your recent timeline." });
    }

    if (mode === "mention") {
      const mentionsHandle = (match.text ?? "").toLowerCase().includes(`@${TARGET_HANDLE}`);
      return json(
        mentionsHandle
          ? { verified: true }
          : { verified: false, reason: `Your post needs to mention @${TARGET_HANDLE}.` }
      );
    }

    if (mode === "reply") {
      const refs: any[] = match.referenced_tweets ?? [];
      const isReplyToTarget = refs.some((r) => r.type === "replied_to" && r.id === replyToTweetId);
      return json(
        isReplyToTarget
          ? { verified: true }
          : { verified: false, reason: "That post isn't a reply to the pinned post." }
      );
    }

    return json({ verified: false, reason: "Unknown verification mode." }, 400);
  } catch (e) {
    console.error("verify-post error:", e);
    return json({ verified: false, reason: "Unexpected error." }, 500);
  }
});

function extractTweetId(url: string): string | null {
  const match = /status\/(\d+)/.exec(url ?? "");
  return match ? match[1] : null;
}

/** Returns a usable access token, refreshing it first if it's expired. */
async function getValidAccessToken(adminClient: ReturnType<typeof createClient>, userId: string): Promise<string | null> {
  const { data: row } = await adminClient.from("folks_x_tokens").select("*").eq("user_id", userId).maybeSingle();
  if (!row) return null;

  if (new Date(row.expires_at).getTime() > Date.now() + 30_000) {
    return row.access_token;
  }
  if (!row.refresh_token) return null;

  const clientId = Deno.env.get("X_CLIENT_ID")!;
  const clientSecret = Deno.env.get("X_CLIENT_SECRET")!;

  const res = await fetch("https://api.x.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: row.refresh_token,
    }),
  });

  if (!res.ok) {
    console.error("X token refresh failed:", res.status, await res.text());
    return null;
  }

  const refreshed = await res.json();
  const expiresAt = new Date(Date.now() + (refreshed.expires_in ?? 7200) * 1000).toISOString();

  await adminClient
    .from("folks_x_tokens")
    .update({
      access_token: refreshed.access_token,
      refresh_token: refreshed.refresh_token ?? row.refresh_token,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  return refreshed.access_token;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
