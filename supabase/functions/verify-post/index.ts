// supabase/functions/verify-post/index.ts
//
// Real verification against X's API, using the person's own access token
// (stored by store-x-session). All checks below hit "owned read" endpoints
// — the account's own data, not an arbitrary lookup — which is X's
// cheapest billing tier ($0.001/resource vs $0.005 for a general read).
//
// Body: { mode: "mention" | "like" | "retweet" | "reply", url?: string, targetTweetId?: string }
//
//   mode "mention"  — Early Role's bullish tweet. Needs `url` (an arbitrary
//     self-authored tweet, not tied to one fixed post). Passes if that
//     tweet mentions the target handle.
//
//   mode "like"     — Whitelist's Like task. Needs `targetTweetId` (the
//     pinned post). No `url` required at all — checks the account's own
//     liked-tweets list for that ID, so nobody has to submit anything.
//
//   mode "retweet"  — Whitelist's Retweet task. Needs `targetTweetId`.
//     Checks the account's own timeline for a tweet whose
//     referenced_tweets includes {type: "retweeted", id: targetTweetId}.
//
//   mode "reply"    — Whitelist's "comment and tag 2 frens" task. Needs
//     `targetTweetId`. Checks the account's own timeline for any tweet
//     whose referenced_tweets includes {type: "replied_to", id: targetTweetId}.
//
// Deploy: supabase functions deploy verify-post
// Secrets needed: X_CLIENT_ID, X_CLIENT_SECRET (same values already
// configured in Supabase Auth → Providers → X). SUPABASE_SERVICE_ROLE_KEY
// and SUPABASE_URL are provided automatically by Supabase.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const TARGET_HANDLE = (Deno.env.get("TARGET_X_HANDLE") ?? "TheFolksXyz").toLowerCase();

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

    const { url, mode, targetTweetId } = await req.json();

    const xUserId = user.user_metadata?.provider_id ?? user.user_metadata?.sub;
    if (!xUserId) return json({ verified: false, reason: "No X account ID on file — reconnect X and try again." });

    const adminClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const accessToken = await getValidAccessToken(adminClient, user.id);
    if (!accessToken) {
      return json({ verified: false, reason: "X session expired — reconnect X and try again." });
    }

    if (mode === "mention") {
      const tweetId = extractTweetId(url);
      if (!tweetId) return json({ verified: false, reason: "Couldn't find a tweet ID in that link." });

      const res = await fetch(
        `https://api.x.com/2/users/${xUserId}/tweets?max_results=25&tweet.fields=text`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!res.ok) return apiError(res);

      const tweets: any[] = (await res.json())?.data ?? [];
      const match = tweets.find((t) => t.id === tweetId);
      if (!match) return json({ verified: false, reason: "That post wasn't found on your recent timeline." });

      const mentionsHandle = (match.text ?? "").toLowerCase().includes(`@${TARGET_HANDLE}`);
      return json(
        mentionsHandle ? { verified: true } : { verified: false, reason: `Your post needs to mention @${TARGET_HANDLE}.` }
      );
    }

    if (!targetTweetId) return json({ verified: false, reason: "Missing target tweet." }, 400);

    if (mode === "like") {
      const res = await fetch(
        `https://api.x.com/2/users/${xUserId}/liked_tweets?max_results=100`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!res.ok) return apiError(res);

      const liked: any[] = (await res.json())?.data ?? [];
      const found = liked.some((t) => t.id === targetTweetId);
      return json(found ? { verified: true } : { verified: false, reason: "Didn't find a like on that post yet. Give it a moment and try again." });
    }

    if (mode === "retweet" || mode === "reply") {
      const res = await fetch(
        `https://api.x.com/2/users/${xUserId}/tweets?max_results=100&tweet.fields=referenced_tweets`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!res.ok) return apiError(res);

      const tweets: any[] = (await res.json())?.data ?? [];
      const refType = mode === "retweet" ? "retweeted" : "replied_to";
      const found = tweets.some((t) =>
        (t.referenced_tweets ?? []).some((r: any) => r.type === refType && r.id === targetTweetId)
      );
      return json(
        found
          ? { verified: true }
          : {
              verified: false,
              reason:
                mode === "retweet"
                  ? "Didn't find a retweet of that post yet. Give it a moment and try again."
                  : "Didn't find a reply to that post yet. Give it a moment and try again.",
            }
      );
    }

    return json({ verified: false, reason: "Unknown verification mode." }, 400);
  } catch (e) {
    console.error("verify-post error:", e);
    return json({ verified: false, reason: "Unexpected error." }, 500);
  }
});

async function apiError(res: Response) {
  const body = await res.text();
  console.error("X API error:", res.status, body);
  if (res.status === 401 || res.status === 403) {
    return json({
      verified: false,
      reason: "X account needs to reconnect — disconnect and connect X again to grant the latest permissions.",
    });
  }
  return json({ verified: false, reason: "Couldn't reach X right now. Try again shortly." });
}

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
