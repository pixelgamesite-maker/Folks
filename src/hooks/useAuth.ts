import { useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const signInWithX = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "x",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) console.error(error.message);
    return error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { session, user, loading, signInWithX, signOut };
}

/**
 * X's OAuth payload lands in different user_metadata fields depending on
 * how Supabase maps it. Shared here so useAuth consumers and the callback
 * page read the handle the same way.
 */
export function extractXHandle(user: User | null | undefined): string {
  if (!user) return "";
  const meta = user.user_metadata ?? {};
  return meta.preferred_username || meta.user_name || meta.screen_name || meta.name || "";
}

/**
 * Small handoff so /auth/callback knows where to send someone once X signs
 * them back in — Early Role reopens the modal on "/", Whitelist goes to the
 * dedicated "/whitelist" page. Call `setPostAuthAction(...)` right before
 * `signInWithX()`, `peekPostAuthAction()` to read it without clearing it
 * (used by callback.tsx to pick a route), and `consumePostAuthAction()` to
 * read-and-clear it (used by whichever page actually needs to react to it).
 */
export type PostAuthAction = "early_role" | "whitelist";
const POST_AUTH_ACTION_KEY = "folks_post_auth_action";

export function setPostAuthAction(action: PostAuthAction) {
  try {
    localStorage.setItem(POST_AUTH_ACTION_KEY, action);
  } catch {}
}

export function peekPostAuthAction(): PostAuthAction | null {
  try {
    const v = localStorage.getItem(POST_AUTH_ACTION_KEY);
    return v === "early_role" || v === "whitelist" ? v : null;
  } catch {
    return null;
  }
}

export function consumePostAuthAction(): PostAuthAction | null {
  const v = peekPostAuthAction();
  try {
    localStorage.removeItem(POST_AUTH_ACTION_KEY);
  } catch {}
  return v;
}
