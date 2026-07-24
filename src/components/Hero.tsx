import { useEffect, useState } from "react";
import { body, display, faint, gold, goldLight, ink, line, mono, muted, violet, violetLight } from "../lib/theme";
import { FolksSeal, Guilloche } from "./shared";
import { useEarlyRoleCount } from "../hooks/useEarlyRoleCount";

const TICKER_ITEMS = ["ETHEREUM", "OPENSEA", "SUPPLY — TBA", "PRICE — TBA", "LAUNCHING ON ROBINHOOD"];

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
  const tickerLoop = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div id="home" style={{ position: "relative", overflow: "hidden" }}>
      {/* Ticker strip — the first thing that reads differently from a static hero */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          marginTop: "64px",
          borderBottom: `1px solid ${line}`,
          background: "rgba(46,125,74,0.04)",
          overflow: "hidden",
          whiteSpace: "nowrap",
          padding: "8px 0",
        }}
      >
        <div style={{ display: "inline-block", animation: "folksTicker 26s linear infinite" }}>
          {tickerLoop.map((t, i) => (
            <span
              key={i}
              style={{
                fontFamily: mono,
                fontSize: "0.6rem",
                letterSpacing: "0.18em",
                color: i % 2 === 0 ? gold : faint,
                marginRight: "34px",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div
        style={{
          minHeight: "calc(100vh - 96px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "56px 24px 64px",
          textAlign: "center",
          position: "relative",
        }}
      >
        <Guilloche opacity={0.4} />
        <div
          style={{
            position: "absolute",
            top: "38%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: "640px",
            height: "640px",
            borderRadius: "50%",
            background: `radial-gradient(circle,${gold}14 0%,transparent 60%),radial-gradient(circle,${violet}0f 30%,transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "420px" }}>
          {/* Seal + eyebrow, side by side instead of stacked */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "28px",
              opacity: ready ? undefined : 0,
              animation: ready ? "folksFadeUp 0.7s ease 0.05s both" : "none",
            }}
          >
            <FolksSeal size={30} />
            <span style={{ fontFamily: mono, fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: faint }}>
              Registry &middot; 10,000 Folks
            </span>
          </div>

          <h1
            style={{
              fontFamily: display,
              fontSize: "clamp(3.2rem,15vw,6.4rem)",
              fontWeight: 700,
              color: "#fff",
              margin: "0 0 14px",
              letterSpacing: "-0.02em",
              lineHeight: 0.92,
              opacity: ready ? undefined : 0,
              animation: ready ? "folksFadeUp 0.7s ease 0.12s both" : "none",
            }}
          >
            FOLKS
          </h1>

          <p
            style={{
              fontFamily: body,
              fontSize: "0.98rem",
              color: muted,
              margin: "0 0 32px",
              lineHeight: 1.6,
              opacity: ready ? undefined : 0,
              animation: ready ? "folksFadeUp 0.7s ease 0.18s both" : "none",
            }}
          >
            Built for the folks who showed up first — before Robinhood does.
          </p>

          {/* One console-style card holds every functional element, instead
              of three separate stacked blocks (buttons / counter / stats) */}
          <div
            style={{
              width: "100%",
              border: `1px solid ${line}`,
              borderRadius: "14px",
              background: "rgba(255,255,255,0.015)",
              backdropFilter: "blur(6px)",
              overflow: "hidden",
              opacity: ready ? undefined : 0,
              animation: ready ? "folksFadeUp 0.7s ease 0.26s both" : "none",
            }}
          >
            <div style={{ display: "flex", gap: "1px", background: line }}>
              <button
                onClick={onOpenEarlyRole}
                style={{
                  flex: 1,
                  fontFamily: body,
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                  color: ink,
                  background: `linear-gradient(180deg,${goldLight},${gold})`,
                  border: "none",
                  padding: "16px 10px",
                  cursor: "pointer",
                }}
              >
                Claim Early Role
              </button>
              <button
                onClick={onOpenWhitelist}
                style={{
                  flex: 1,
                  fontFamily: body,
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                  color: violetLight,
                  background: "rgba(139,107,240,0.08)",
                  border: "none",
                  padding: "16px 10px",
                  cursor: "pointer",
                }}
              >
                Get Whitelisted
              </button>
            </div>

            <div style={{ padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                <span style={{ fontFamily: mono, fontSize: "0.58rem", letterSpacing: "0.1em", color: faint, textTransform: "uppercase" }}>
                  Early Role &middot; Capped
                </span>
                <span style={{ fontFamily: mono, fontSize: "0.66rem", color: gold, fontWeight: 600 }}>
                  {count !== null ? count.toLocaleString() : "—"} / {cap.toLocaleString()}
                </span>
              </div>
              <div style={{ height: "5px", borderRadius: "3px", background: "rgba(46,125,74,0.1)", overflow: "hidden", marginBottom: "14px" }}>
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

              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center" }}>
                {["Ethereum", "OpenSea", "Whitelist — No Cap"].map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontFamily: mono,
                      fontSize: "0.58rem",
                      letterSpacing: "0.06em",
                      color: "rgba(245,247,245,0.5)",
                      border: `1px solid ${line}`,
                      borderRadius: "999px",
                      padding: "4px 10px",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
