import { Link } from "wouter";
import { body, display, ink, line, mono, muted, violet } from "../lib/theme";
import { FolksSeal } from "../components/shared";

export default function MarketplacePage() {
  return (
    <div
      style={{
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
      }}
    >
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
        Buying, selling, and trading Folks will live here once the collection is live. Check back after mint.
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
