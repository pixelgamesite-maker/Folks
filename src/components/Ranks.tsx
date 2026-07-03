import { display, faint, gold, line, mono, muted } from "../lib/theme";
import { RANK_IMAGES } from "../lib/folksAssets";
import { Label, RevealSection } from "./shared";

const RANKS = [
  { name: "Regulars", desc: "The baseline of the registry. Clean, honest, and easy to recognize.", art: RANK_IMAGES[0] },
  { name: "Notables", desc: "A stronger read — sharper styling and a more deliberate presence.", art: RANK_IMAGES[1] },
  { name: "Rare Folks", desc: "Uncommon layer combinations that stand apart in a crowd.", art: RANK_IMAGES[2] },
  { name: "Icons", desc: "Scarce by design. The entries collectors go looking for first.", art: RANK_IMAGES[3] },
  { name: "Founders", desc: "The rarest standing in the registry, reserved for the earliest folks.", art: RANK_IMAGES[4] },
];

export default function Ranks() {
  return (
    <RevealSection>
      <Label text="The Standing" index="03" />
      <h2
        style={{
          fontFamily: display,
          fontSize: "clamp(2rem,7vw,3.2rem)",
          fontWeight: 650,
          color: "#fff",
          margin: "0 0 32px",
        }}
      >
        Every Folk Holds A Rank
      </h2>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {RANKS.map((r, i) => (
          <div
            key={r.name}
            style={{
              padding: "22px 0",
              borderBottom: `1px solid ${line}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontFamily: display, fontSize: "1.14rem", fontWeight: 600, color: "#fff" }}>{r.name}</p>
              <p style={{ margin: "5px 0 0", fontFamily: display, fontStyle: "italic", fontSize: "0.9rem", color: muted, lineHeight: 1.55 }}>
                {r.desc}
              </p>
            </div>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div
                style={{
                  width: "68px",
                  height: "68px",
                  borderRadius: "10px",
                  overflow: "hidden",
                  border: `1px solid ${gold}33`,
                  background: "#0a0a08",
                }}
              >
                <img src={r.art} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
              <div style={{ position: "absolute", inset: 0, borderRadius: "10px", boxShadow: `inset 0 0 18px ${gold}18`, pointerEvents: "none" }} />
            </div>
            <span style={{ fontFamily: mono, fontSize: "0.58rem", letterSpacing: "0.1em", color: faint, flexShrink: 0 }}>
              {String(i + 1).padStart(2, "0")} / {String(RANKS.length).padStart(2, "0")}
            </span>
          </div>
        ))}
      </div>
    </RevealSection>
  );
}
