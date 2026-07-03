import { useEffect, useState } from "react";
import { body, display, faint, gold, goldLight, ink, line, mono, muted } from "../lib/theme";
import { FolksSeal, Guilloche } from "./shared";

const STATS: [string, string][] = [
  ["TBA", "Supply"],
  ["TBA", "Mint Price"],
  ["Ethereum", "Chain"],
  ["OpenSea", "Launchpad"],
];

export default function Hero({ onOpenModal }: { onOpenModal: () => void }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      id="home"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 24px 80px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Guilloche opacity={0.55} />
      <div
        style={{
          position: "absolute",
          top: "36%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: "620px",
          height: "620px",
          borderRadius: "50%",
          background: `radial-gradient(circle,${gold}0d 0%,transparent 68%)`,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
        <div
          style={{
            marginBottom: "26px",
            opacity: ready ? undefined : 0,
            animation: ready ? "folksFadeUp 0.7s ease 0.05s both" : "none",
          }}
        >
          <FolksSeal size={54} />
        </div>

        <div
          style={{
            marginBottom: "22px",
            opacity: ready ? undefined : 0,
            animation: ready ? "folksFadeUp 0.7s ease 0.1s both" : "none",
          }}
        >
          <span
            style={{
              fontFamily: mono,
              fontSize: "0.62rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: gold,
              border: `1px solid ${line}`,
              borderRadius: "999px",
              padding: "5px 16px",
              display: "inline-block",
            }}
          >
            A Registry Of Ten Thousand
          </span>
        </div>

        <h1
          style={{
            fontFamily: display,
            fontSize: "clamp(3.6rem,16vw,7.2rem)",
            fontWeight: 650,
            color: "#fff",
            margin: "0",
            letterSpacing: "0.01em",
            lineHeight: 0.94,
            opacity: ready ? undefined : 0,
            animation: ready ? "folksFadeUp 0.7s ease 0.16s both" : "none",
          }}
        >
          FOLKS
        </h1>

        <div
          style={{
            width: "54px",
            height: "1px",
            background: `linear-gradient(90deg,transparent,${gold},transparent)`,
            margin: "22px auto",
          }}
        />

        <p
          style={{
            fontFamily: display,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(1rem,3vw,1.2rem)",
            color: muted,
            margin: "0 0 44px",
            maxWidth: "440px",
            lineHeight: 1.65,
            opacity: ready ? undefined : 0,
            animation: ready ? "folksFadeUp 0.7s ease 0.22s both" : "none",
          }}
        >
          Ten thousand faces, one registry. A collection built for the folks who showed up first.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            width: "100%",
            maxWidth: "300px",
            opacity: ready ? undefined : 0,
            animation: ready ? "folksFadeUp 0.7s ease 0.3s both" : "none",
          }}
        >
          <button
            onClick={onOpenModal}
            style={{
              fontFamily: body,
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: ink,
              background: `linear-gradient(180deg,${goldLight},${gold})`,
              border: "none",
              borderRadius: "6px",
              padding: "17px 36px",
              cursor: "pointer",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              boxShadow: `0 10px 34px ${gold}30`,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 16px 40px ${gold}44`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 10px 34px ${gold}30`;
            }}
          >
            Claim Early Role
          </button>
          <p style={{ margin: "2px 0 4px", fontFamily: mono, fontSize: "0.62rem", color: faint, letterSpacing: "0.04em" }}>
            If you can see this button, you're early.
          </p>
          <a
            href="#mint"
            style={{
              fontFamily: body,
              fontSize: "0.72rem",
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(247,245,239,0.55)",
              background: "transparent",
              border: `1px solid ${line}`,
              borderRadius: "6px",
              padding: "16px 36px",
              display: "block",
              textAlign: "center",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = `${gold}66`;
              (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = line;
              (e.currentTarget as HTMLAnchorElement).style.color = "rgba(247,245,239,0.55)";
            }}
          >
            View Mint Details
          </a>
        </div>

        <div
          style={{
            marginTop: "56px",
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            border: `1px solid ${line}`,
            borderRadius: "8px",
            overflow: "hidden",
            background: "rgba(201,162,39,0.02)",
            backdropFilter: "blur(6px)",
            opacity: ready ? undefined : 0,
            animation: ready ? "folksFadeUp 0.7s ease 0.38s both" : "none",
          }}
        >
          {STATS.map(([val, lbl], i) => (
            <div key={i} style={{ padding: "18px 14px", borderLeft: i > 0 ? `1px solid ${line}` : "none", textAlign: "center" }}>
              <p style={{ margin: 0, fontFamily: mono, fontSize: "0.98rem", fontWeight: 600, color: "#fff", letterSpacing: "0.02em" }}>
                {val}
              </p>
              <p
                style={{
                  margin: "4px 0 0",
                  fontFamily: body,
                  fontSize: "0.52rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: faint,
                  fontWeight: 600,
                }}
              >
                {lbl}
              </p>
            </div>
          ))}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "-40px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            opacity: 0.32,
          }}
        >
          <span style={{ fontFamily: mono, fontSize: "0.48rem", letterSpacing: "0.3em", textTransform: "uppercase", color: gold }}>
            Scroll
          </span>
          <div style={{ width: "1px", height: "28px", background: `linear-gradient(180deg,${gold},transparent)` }} />
        </div>
      </div>
    </div>
  );
}
