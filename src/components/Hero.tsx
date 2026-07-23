import { useEffect, useState } from "react";
import { body, display, faint, gold, goldLight, ink, line, mono, muted, violet, violetLight, violetLine } from "../lib/theme";
import { FolksSeal, Guilloche } from "./shared";
import { useEarlyRoleCount } from "../hooks/useEarlyRoleCount";

const MINT_STATS: [string, string][] = [
  ["TBA", "Supply"],
  ["TBA", "Mint Price"],
  ["Ethereum", "Chain"],
  ["OpenSea", "Launchpad"],
];

export default function Hero({
  onOpenEarlyRole,
  onOpenWhitelist,
}: {
  onOpenEarlyRole: () => void;
  onOpenWhitelist: () => void;
}) {
  const [ready, setReady] = useState(false);
  const { count, cap } = useEarlyRoleCount(1000);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  const pct = count !== null ? Math.min(100, (count / cap) * 100) : 0;

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
      <Guilloche opacity={0.45} />
      <div
        style={{
          position: "absolute",
          top: "34%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: "640px",
          height: "640px",
          borderRadius: "50%",
          background: `radial-gradient(circle,${gold}14 0%,transparent 60%),radial-gradient(circle,${violet}0f 30%,transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
        <div style={{ marginBottom: "26px", opacity: ready ? undefined : 0, animation: ready ? "folksFadeUp 0.7s ease 0.05s both" : "none" }}>
          <FolksSeal size={54} />
        </div>

        <div style={{ marginBottom: "22px", opacity: ready ? undefined : 0, animation: ready ? "folksFadeUp 0.7s ease 0.1s both" : "none" }}>
          <span
            style={{
              fontFamily: mono,
              fontSize: "0.62rem",
              letterSpacing: "0.22em",
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
            fontWeight: 700,
            color: "#fff",
            margin: "0",
            letterSpacing: "-0.01em",
            lineHeight: 0.94,
            opacity: ready ? undefined : 0,
            animation: ready ? "folksFadeUp 0.7s ease 0.16s both" : "none",
          }}
        >
          FOLKS
        </h1>

        <div style={{ width: "54px", height: "1px", background: `linear-gradient(90deg,transparent,${gold},transparent)`, margin: "22px auto" }} />

        <p
          style={{
            fontFamily: body,
            fontWeight: 400,
            fontSize: "clamp(1rem,3vw,1.15rem)",
            color: muted,
            margin: "0 0 28px",
            maxWidth: "440px",
            lineHeight: 1.6,
            opacity: ready ? undefined : 0,
            animation: ready ? "folksFadeUp 0.7s ease 0.22s both" : "none",
          }}
        >
          Ten thousand faces, one registry. Launching on Robinhood — built for the folks who showed up first.
        </p>

        {/* Live Early Role counter — only Early Role is capped */}
        <div
          style={{
            width: "100%",
            maxWidth: "320px",
            marginBottom: "28px",
            opacity: ready ? undefined : 0,
            animation: ready ? "folksFadeUp 0.7s ease 0.28s both" : "none",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontFamily: mono, fontSize: "0.62rem", letterSpacing: "0.08em", color: faint, textTransform: "uppercase" }}>
              Early Role Slots
            </span>
            <span style={{ fontFamily: mono, fontSize: "0.68rem", color: gold, fontWeight: 600 }}>
              {count !== null ? count.toLocaleString() : "—"} / {cap.toLocaleString()}
            </span>
          </div>
          <div style={{ height: "6px", borderRadius: "3px", background: "rgba(46,125,74,0.1)", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                borderRadius: "3px",
                background: `linear-gradient(90deg,${gold},${goldLight})`,
                transition: "width 0.5s ease",
              }}
            />
          </div>
        </div>

        {/* Two distinct CTAs — green for the capped Early Role, violet for the open Whitelist */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            width: "100%",
            maxWidth: "300px",
            marginBottom: "40px",
            opacity: ready ? undefined : 0,
            animation: ready ? "folksFadeUp 0.7s ease 0.34s both" : "none",
          }}
        >
          <button
            onClick={onOpenEarlyRole}
            style={{
              fontFamily: body,
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.03em",
              color: ink,
              background: `linear-gradient(180deg,${goldLight},${gold})`,
              border: "none",
              borderRadius: "8px",
              padding: "17px 36px",
              cursor: "pointer",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              boxShadow: `0 10px 34px ${gold}33`,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 16px 40px ${gold}4d`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 10px 34px ${gold}33`;
            }}
          >
            Claim Early Role
          </button>
          <p style={{ margin: "0 0 2px", fontFamily: mono, fontSize: "0.58rem", color: faint }}>Capped at 1,000 &middot; connect X + post required</p>

          <button
            onClick={onOpenWhitelist}
            style={{
              fontFamily: body,
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.03em",
              color: violet,
              background: "transparent",
              border: `1px solid ${violetLight}66`,
              borderRadius: "8px",
              padding: "16px 36px",
              cursor: "pointer",
              marginTop: "8px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = violet;
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(139,107,240,0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = `${violetLight}66`;
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
          >
            Get Whitelisted
          </button>
          <p style={{ margin: 0, fontFamily: mono, fontSize: "0.58rem", color: faint }}>No cap &middot; application, no X login needed</p>
        </div>

        {/* Mint details */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            border: `1px solid ${line}`,
            borderRadius: "8px",
            overflow: "hidden",
            background: "rgba(46,125,74,0.02)",
            backdropFilter: "blur(8px)",
            opacity: ready ? undefined : 0,
            animation: ready ? "folksFadeUp 0.7s ease 0.4s both" : "none",
          }}
        >
          {MINT_STATS.map(([val, lbl], i) => (
            <div key={i} style={{ padding: "18px 14px", borderLeft: i > 0 ? `1px solid ${line}` : "none", textAlign: "center" }}>
              <p style={{ margin: 0, fontFamily: mono, fontSize: "0.98rem", fontWeight: 600, color: "#fff", letterSpacing: "0.02em" }}>{val}</p>
              <p style={{ margin: "4px 0 0", fontFamily: body, fontSize: "0.52rem", letterSpacing: "0.14em", textTransform: "uppercase", color: faint, fontWeight: 600 }}>
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
          <span style={{ fontFamily: mono, fontSize: "0.48rem", letterSpacing: "0.3em", textTransform: "uppercase", color: gold }}>Scroll</span>
          <div style={{ width: "1px", height: "28px", background: `linear-gradient(180deg,${gold},transparent)` }} />
        </div>
      </div>
    </div>
  );
}
