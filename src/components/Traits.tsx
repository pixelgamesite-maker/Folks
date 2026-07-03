import { display, faint, gold, line, mono, muted } from "../lib/theme";
import { Label, RevealSection } from "./shared";

const TRAITS: [string, string][] = [
  ["01", "Expression"],
  ["02", "Headwear"],
  ["03", "Outerwear"],
  ["04", "Accessory"],
  ["05", "Palette"],
  ["06", "Backdrop"],
  ["07", "Finish"],
  ["08", "Mark"],
];

export default function Traits() {
  return (
    <RevealSection>
      <Label text="The Details" index="02" />
      <h2
        style={{
          fontFamily: display,
          fontSize: "clamp(2rem,7vw,3.2rem)",
          fontWeight: 650,
          color: "#fff",
          margin: "0 0 16px",
        }}
      >
        Every Entry Is Composed
      </h2>
      <p
        style={{
          fontFamily: display,
          fontStyle: "italic",
          fontSize: "1rem",
          color: muted,
          margin: "0 0 34px",
          lineHeight: 1.75,
          maxWidth: "480px",
        }}
      >
        Each Folk is assembled from eight layers of trait data, logged in the order they are drawn.
        Some layers are common. Some are almost never seen twice.
      </p>

      <div style={{ border: `1px solid ${line}`, borderRadius: "10px", overflow: "hidden" }}>
        {TRAITS.map(([num, t], i) => (
          <div
            key={t}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "14px 18px",
              borderBottom: i < TRAITS.length - 1 ? `1px solid ${line}` : "none",
              background: i % 2 === 0 ? "rgba(201,162,39,0.025)" : "transparent",
            }}
          >
            <span style={{ fontFamily: mono, fontSize: "0.68rem", color: gold, letterSpacing: "0.05em", width: "22px" }}>{num}</span>
            <span style={{ fontFamily: display, fontSize: "1rem", color: "#fff", fontWeight: 500, flex: 1 }}>{t}</span>
            <span style={{ fontFamily: mono, fontSize: "0.58rem", color: faint, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Layer
            </span>
          </div>
        ))}
      </div>

      <p style={{ fontFamily: display, fontStyle: "italic", fontSize: "0.92rem", color: muted, margin: "26px 0 0", lineHeight: 1.7 }}>
        Rarity is a byproduct of the layering, not a marketing label. Some combinations were always
        going to be rare. Others earned it by accident.
      </p>
    </RevealSection>
  );
}
