import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { extractXHandle } from "@/hooks/useAuth";
import { display, gold, ink, mono, muted } from "@/lib/theme";
import { FolksSeal } from "@/components/shared";

export default function AuthCallback() {
  const [, navigate] = useLocation();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let handled = false;

    const processAuth = async (session: any) => {
      if (handled || !session) return;
      handled = true;

      const u = session.user;
      const meta = u.user_metadata || {};
      const username = extractXHandle(u);
      const displayName = meta.name || meta.full_name || username || null;
      const avatarUrl = meta.avatar_url || meta.profile_image_url || null;
      const xId = meta.provider_id || meta.sub || null;

      // Optional: keep a lightweight profile row alongside the auth user.
      // Create a `folks_profiles` table (id, x_id, username, display_name,
      // avatar_url) if you want this, or delete this block if the
      // Folkslist submission itself is all the record you need.
      const { error: upsertError } = await supabase.from("folks_profiles").upsert(
        {
          id: u.id,
          x_id: xId,
          username,
          display_name: displayName,
          avatar_url: avatarUrl,
        },
        { onConflict: "id", ignoreDuplicates: false }
      );

      if (upsertError) {
        // Non-fatal — the person is still signed in even if this table
        // doesn't exist yet. Log it and continue back to the Folkslist.
        console.error("Profile upsert failed:", upsertError.message);
      }

      navigate("/");
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          await processAuth(session);
        }
      }
    );

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) processAuth(data.session);
    });

    const timeout = setTimeout(() => {
      if (!handled) setFailed(true);
    }, 15000);

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (failed) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: ink,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
        }}
      >
        <p style={{ fontFamily: mono, fontSize: "0.7rem", color: "#d96b5a", letterSpacing: "0.12em" }}>
          Connection failed
        </p>
        <button
          onClick={() => navigate("/")}
          style={{
            fontFamily: mono,
            fontSize: "0.62rem",
            letterSpacing: "0.1em",
            color: gold,
            background: "transparent",
            border: `1px solid ${gold}44`,
            borderRadius: "5px",
            padding: "10px 22px",
            cursor: "pointer",
          }}
        >
          Return
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: ink,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "18px",
      }}
    >
      <FolksSeal size={44} />
      <p style={{ fontFamily: display, fontStyle: "italic", fontSize: "0.92rem", color: muted, letterSpacing: "0.02em" }}>
        Confirming your account...
      </p>
    </div>
  );
}
