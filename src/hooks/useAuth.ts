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
 * Small handoff so the page that triggered sign-in can reopen whatever UI
 * (e.g. the Folkslist modal) the person was in once /auth/callback sends
 * them back to "/". Call `setReopenFlag()` right before `signInWithX()`,
 * and `consumeReopenFlag()` once on mount wherever they land.
 */
const REOPEN_FLAG = "folks_reopen_modal";

export function setReopenFlag() {
  try {
    localStorage.setItem(REOPEN_FLAG, "1");
  } catch {}
}

export function consumeReopenFlag(): boolean {
  try {
    if (localStorage.getItem(REOPEN_FLAG) === "1") {
      localStorage.removeItem(REOPEN_FLAG);
      return true;
    }
  } catch {}
  return false;
}
