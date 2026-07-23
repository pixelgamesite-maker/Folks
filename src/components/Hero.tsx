import { useEffect, useState } from "react";
import { body, display, faint, gold, goldLight, ink, line, mono, muted } from "../lib/theme";
import { FolksSeal, Guilloche } from "./shared";
import { useFolksCount } from "../hooks/useFolksCount";

export default function Hero({ onOpenModal }: { onOpenModal: () => void }) {
  const [ready, setReady] = useState(false);
  const { count, cap } = useFolksCount(1000);

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
          top: "36%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: "620px",
          height: "620px",
          borderRadius: "50%",
          background: `radial-gradient(circle,${gold}14 0%,transparent 68%)`,
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
            fontFamily: body,
            fontWeight: 400,
            fontSize: "clamp(1rem,3vw,1.15rem)",
            color: muted,
            margin: "0 0 32px",
            maxWidth: "440px",
            lineHeight: 1.6,
            opacity: ready ? undefined : 0,
            animation: ready ? "folksFadeUp 0.7s ease 0.22s both" : "none",
          }}
        >
          Ten thousand faces, one registry. Launching on Robinhood — built for the folks who showed up first.
        </p>

        {/* Live whitelist counter */}
        <div
          style={{
            width: "100%",
            maxWidth: "320px",
            marginBottom: "36px",
            opacity: ready ? undefined : 0,
            animation: ready ? "folksFadeUp 0.7s ease 0.28s both" : "none",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontFamily: mono, fontSize: "0.62rem", letterSpacing: "0.08em", color: faint, textTransform: "uppercase" }}>
              Folkslist
            </span>
            <span style={{ fontFamily: mono, fontSize: "0.68rem", color: gold, fontWeight: 600 }}>
              {count !== null ? count.toLocaleString() : "—"} / {cap.toLocaleString()}
            </span>
          </div>
          <div style={{ height: "6px", borderRadius: "3px", background: "rgba(0,200,5,0.1)", overflow: "hidden" }}>
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

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            width: "100%",
            maxWidth: "300px",
            opacity: ready ? undefined : 0,
            animation: ready ? "folksFadeUp 0.7s ease 0.34s both" : "none",
          }}
        >
          <button
            onClick={onOpenModal}
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

          <button
            onClick={onOpenModal}
            style={{
              fontFamily: body,
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.03em",
              color: gold,
              background: "transparent",
              border: `1px solid ${gold}55`,
              borderRadius: "8px",
              padding: "16px 36px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = gold;
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,200,5,0.06)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = `${gold}55`;
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
          >
            Get Whitelisted
          </button>
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
