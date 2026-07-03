import { useEffect, useRef, useState } from "react";
import { display, faint, gold, line, mono, muted } from "../lib/theme";
import { GALLERY_IMAGES as FOLKS } from "../lib/folksAssets";
import { Label, RevealSection } from "./shared";

export default function MeetFolks() {
  const [cur, setCur] = useState(0);
  const [fading, setFading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    timer.current = setTimeout(next, 3400);
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur]);

  function next() {
    go((cur + 1) % FOLKS.length);
  }
  function go(i: number) {
    if (i === cur) return;
    clearTimeout(timer.current);
    setFading(true);
    setTimeout(() => {
      setCur(i);
      setFading(false);
    }, 280);
  }

  return (
    <RevealSection id="meet-the-folks">
      <Label text="The Collection" index="01" />
      <h2
        style={{
          fontFamily: display,
          fontSize: "clamp(2rem,7vw,3.2rem)",
          fontWeight: 650,
          color: "#fff",
          margin: "0 0 16px",
          letterSpacing: "0.01em",
        }}
      >
        Meet The Folks
      </h2>
      <p
        style={{
          fontFamily: display,
          fontStyle: "italic",
          fontSize: "1rem",
          color: muted,
          margin: "0 0 40px",
          lineHeight: 1.75,
          maxWidth: "480px",
        }}
      >
        Ten thousand individually rendered members, each entered into the registry with its own
        number, likeness, and standing. No two entries read the same.
      </p>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "18px" }}>
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "320px",
          }}
        >
          <div
            style={{
              width: "100%",
              aspectRatio: "1/1",
              borderRadius: "14px",
              overflow: "hidden",
              border: `1px solid ${gold}44`,
              background: "#0a0a08",
              boxShadow: `0 0 0 6px rgba(0,0,0,0.4), 0 20px 50px rgba(0,0,0,0.5)`,
              position: "relative",
            }}
          >
            <img
              src={FOLKS[cur]}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                opacity: fading ? 0 : 1,
                transition: "opacity 0.28s ease",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.06)`,
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Registry tag — the "membership card" signature detail */}
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              left: "10px",
              right: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(6,6,5,0.72)",
              backdropFilter: "blur(6px)",
              border: `1px solid ${line}`,
              borderRadius: "6px",
              padding: "6px 10px",
            }}
          >
            <span style={{ fontFamily: mono, fontSize: "0.62rem", color: gold, letterSpacing: "0.06em" }}>
              No. {String(cur + 1).padStart(4, "0")}
            </span>
            <span style={{ fontFamily: mono, fontSize: "0.58rem", color: faint, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Registry Entry
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center", maxWidth: "300px" }}>
          {FOLKS.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Show registry entry ${i + 1}`}
              style={{
                width: i === cur ? "20px" : "5px",
                height: "5px",
                borderRadius: "3px",
                background: i === cur ? gold : "rgba(247,245,239,0.16)",
                border: "none",
                padding: 0,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
      </div>
    </RevealSection>
  );
}
