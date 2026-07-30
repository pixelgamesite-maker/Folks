import { useEffect, useState } from "react";
import { body, display, faint, gold, ink, line, mono, muted, violet, violetLight } from "../lib/theme";
import { Guilloche } from "./shared";

const TICKER_ITEMS = ["ETHEREUM", "OPENSEA", "SUPPLY — TBA", "PRICE — TBA", "LAUNCHING ON ROBINHOOD"];

const MINT_STATS: [string, string][] = [
  ["TBA", "Supply"],
  ["TBA", "Mint Price"],
  ["Ethereum", "Chain"],
  ["OpenSea", "Launchpad"],
];

export default function Hero({ onOpenWhitelist }: { onOpenWhitelist: () => void }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  const tickerLoop = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div id="home" style={{ position: "relative", overflow: "hidden" }}>
      {/* Ticker strip */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          marginTop: "64px",
          borderBottom: `1px solid ${line}`,
          background: "rgba(46,90,172,0.04)",
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
                color: i % 2 === 0 ? violet : faint,
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
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "24px",
              opacity: ready ? undefined : 0,
              animation: ready ? "folksFadeUp 0.7s ease 0.05s both" : "none",
            }}
          >
            <img src="/Folks-logo.png" alt="Folks" style={{ width: "112px", height: "auto", display: "block" }} />
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
            Built for the folks who showed up first.
          </p>

          <div
            style={{
              width: "100%",
              opacity: ready ? undefined : 0,
              animation: ready ? "folksFadeUp 0.7s ease 0.26s both" : "none",
              marginBottom: "24px",
            }}
          >
            <button
              onClick={onOpenWhitelist}
              style={{
                width: "100%",
                fontFamily: body,
                fontSize: "0.82rem",
                fontWeight: 700,
                letterSpacing: "0.02em",
                color: ink,
                background: `linear-gradient(180deg,${violetLight},${violet})`,
                border: "none",
                borderRadius: "10px",
                padding: "17px",
                cursor: "pointer",
                boxShadow: `0 10px 34px ${violet}30`,
              }}
            >
              Get Whitelisted
            </button>
            <p style={{ margin: "8px 0 0", fontFamily: mono, fontSize: "0.6rem", color: faint }}>
              No cap &middot; connect X &middot; earn points
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              border: `1px solid ${line}`,
              borderRadius: "8px",
              overflow: "hidden",
              background: "rgba(46,90,172,0.02)",
              backdropFilter: "blur(8px)",
              width: "100%",
              opacity: ready ? undefined : 0,
              animation: ready ? "folksFadeUp 0.7s ease 0.34s both" : "none",
            }}
          >
            {MINT_STATS.map(([val, lbl], i) => (
              <div key={i} style={{ padding: "16px 10px", borderLeft: i > 0 ? `1px solid ${line}` : "none", textAlign: "center" }}>
                <p style={{ margin: 0, fontFamily: mono, fontSize: "0.86rem", fontWeight: 600, color: "#fff", letterSpacing: "0.02em" }}>{val}</p>
                <p style={{ margin: "4px 0 0", fontFamily: body, fontSize: "0.5rem", letterSpacing: "0.12em", textTransform: "uppercase", color: faint, fontWeight: 600 }}>
                  {lbl}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
