import { useState } from "react";
import { Link } from "wouter";
import { body, display, ink, line, mono, muted, violet, violetLine } from "../lib/theme";
import { FolksSeal } from "../components/shared";
import { useAuth, setPostAuthAction } from "../hooks/useAuth";

export default function MarketplacePage() {
  const auth = useAuth();
  const [connecting, setConnecting] = useState(false);

  async function connectX() {
    setConnecting(true);
    setPostAuthAction("marketplace");
    await auth.signInWithX();
  }

  const wrap: React.CSSProperties = {
    minHeight: "100vh",
    background: ink,
    color: "#fff",
    fontFamily: body,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    textAlign: "center",
  };

  if (!auth.user) {
    return (
      <div style={wrap}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "18px" }}>
          <FolksSeal size={52} />
        </div>
        <p style={{ fontFamily: mono, fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: violet, margin: "0 0 8px" }}>
          Marketplace
        </p>
        <p style={{ fontFamily: display, fontWeight: 700, fontSize: "1.3rem", margin: "0 0 10px" }}>Connect X To Continue</p>
        <p style={{ fontFamily: body, fontSize: "0.85rem", color: muted, margin: "0 0 24px", lineHeight: 1.55, maxWidth: "340px" }}>
          Sign in with X to check out the Marketplace.
        </p>
        <button
          onClick={connectX}
          disabled={connecting}
          style={{
            width: "100%",
            maxWidth: "320px",
            fontFamily: body,
            fontSize: "0.74rem",
            fontWeight: 700,
            color: connecting ? "rgba(245,247,245,0.4)" : ink,
            background: connecting ? "rgba(255,255,255,0.04)" : "#fff",
            border: `1px solid ${violetLine}`,
            borderRadius: "8px",
            padding: "13px",
            cursor: connecting ? "wait" : "pointer",
          }}
        >
          {connecting ? "Opening X..." : "Connect X Account"}
        </button>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <div style={{ marginBottom: "22px" }}>
        <FolksSeal size={56} />
      </div>
      <p style={{ fontFamily: mono, fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: violet, margin: "0 0 10px" }}>
        Marketplace
      </p>
      <h1 style={{ fontFamily: display, fontSize: "clamp(2.2rem,10vw,3rem)", fontWeight: 700, color: "#fff", margin: "0 0 14px", letterSpacing: "-0.01em" }}>
        Coming Soon
      </h1>
      <p style={{ fontFamily: body, fontSize: "0.9rem", color: muted, margin: "0 0 30px", lineHeight: 1.6, maxWidth: "340px" }}>
        You will be able to buy whitelist spots with yout point balance when marketplace goes live.
      </p>
      <Link
        href="/"
        style={{
          fontFamily: mono,
          fontSize: "0.68rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#fff",
          border: `1px solid ${line}`,
          borderRadius: "8px",
          padding: "12px 24px",
          textDecoration: "none",
        }}
      >
        Back To Home
      </Link>
    </div>
  );
}
