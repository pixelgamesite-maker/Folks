// supabase/functions/store-x-session/index.ts
//
// Called once, right after signInWithX() completes (see useAuth.ts's
// onAuthStateChange handler). Supabase hands back session.provider_token
// only in that first SIGNED_IN event — it's not retrievable later from
// getSession() — so this function's whole job is to grab it while it's
// available and store it server-side for verify-post to use afterward.
//
// Deploy: supabase functions deploy store-x-session

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing Authorization header" }, 401);
    }

    // Client bound to the caller's own JWT — used only to find out *who*
    // is calling, never to write to folks_x_tokens (that table has no
    // policies for this role at all).
    const callerClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userError } = await callerClient.auth.getUser();
    if (userError || !user) {
      return json({ error: "Invalid session" }, 401);
    }

    const { access_token, refresh_token, expires_in } = await req.json();
    if (!access_token) {
      return json({ error: "Missing access_token" }, 400);
    }

    // Service-role client — the only thing allowed to write to
    // folks_x_tokens, since that table intentionally has zero RLS
    // policies for anon/authenticated.
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const expiresAt = new Date(Date.now() + (expires_in ?? 7200) * 1000).toISOString();

    const { error: upsertError } = await adminClient.from("folks_x_tokens").upsert({
      user_id: user.id,
      access_token,
      refresh_token,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    });

    if (upsertError) {
      console.error("folks_x_tokens upsert failed:", upsertError.message);
      return json({ error: "Failed to store session" }, 500);
    }

    return json({ ok: true });
  } catch (e) {
    console.error("store-x-session error:", e);
    return json({ error: "Unexpected error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
