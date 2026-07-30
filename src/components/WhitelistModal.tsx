import { useState } from "react";
import { body, display, ink, mono, muted, violet, violetLine } from "../lib/theme";
import { useAuth, setPostAuthAction } from "../hooks/useAuth";

/**
 * Connect-X gate for the "Get Whitelisted" flow. Just ensures someone's
 * signed in — home.tsx decides what happens next (opening the Earn
 * Points / Marketplace choice), not this component. If the person is
 * already signed in, home.tsx skips opening this entirely rather than
 * this modal deciding to redirect itself.
 */
export default function WhitelistModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const auth = useAuth();
  const [connecting, setConnecting] = useState(false);
  const [authError, setAuthError] = useState("");

  async function connectX() {
    setAuthError("");
    setConnecting(true);
    setPostAuthAction("choice");
    const error = await auth.signInWithX();
    if (error) {
      setConnecting(false);
      setAuthError("Could not open X sign-in. Try again.");
    }
    // On success the browser navigates to X, so nothing else to do here.
  }

  if (!open) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(4,3,10,0.9)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <style>{`
        @keyframes folksModalIn2{from{opacity:0;transform:translateY(14px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
      `}</style>

      <div
        style={{
          width: "100%",
          maxWidth: "360px",
          background: "#0b0a10",
          border: `1px solid ${violetLine}`,
          borderRadius: "14px",
          padding: "30px 24px 26px",
          animation: "folksModalIn2 0.25s ease both",
          position: "relative",
          textAlign: "center",
        }}
      >
        <button
          onClick={onClose}
          style={{ position: "absolute", top: "14px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "rgba(245,247,245,0.3)", fontSize: "1.1rem" }}
        >
          ✕
        </button>

        <p style={{ fontFamily: mono, fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", color: violet, margin: "0 0 10px" }}>
          Get Whitelisted
        </p>
        <p style={{ fontFamily: display, fontWeight: 700, fontSize: "1.2rem", margin: "0 0 10px", color: "#fff" }}>Connect X To Continue</p>
        <p style={{ fontFamily: body, fontSize: "0.82rem", color: muted, margin: "0 0 22px", lineHeight: 1.55 }}>
          Sign in with X to continue.
        </p>

        <button
          onClick={connectX}
          disabled={connecting}
          style={{
            width: "100%",
            fontFamily: body,
            fontSize: "0.74rem",
            fontWeight: 700,
            letterSpacing: "0.03em",
            color: connecting ? "rgba(245,247,245,0.4)" : ink,
            background: connecting ? "rgba(255,255,255,0.02)" : "#fff",
            border: `1px solid ${violetLine}`,
            borderRadius: "8px",
            padding: "13px",
            cursor: connecting ? "wait" : "pointer",
          }}
        >
          {connecting ? "Opening X..." : "Connect X Account"}
        </button>
        {authError && <p style={{ fontFamily: body, fontSize: "0.62rem", color: "#d96b5a", margin: "8px 0 0" }}>{authError}</p>}
      </div>
    </div>
  );
}
