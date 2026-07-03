import { display, faint, line, mono, muted } from "../lib/theme";
import { Label, RevealSection } from "./shared";

const SYSTEMS = [
  { name: "The Archive", desc: "Lore, backstory, and world details unlocked as the registry fills." },
  { name: "The Grounds", desc: "Holder meetups, community events, and collaborations with other registries." },
  { name: "The Table", desc: "A standing seat for holders in decisions that shape what comes next." },
  { name: "The Vault", desc: "Drops, giveaways, and rewards reserved for verified members." },
];

export default function Systems() {
  return (
    <RevealSection>
      <Label text="Holder Utility" index="04" />
      <h2
        style={{
          fontFamily: display,
          fontSize: "clamp(2rem,7vw,3.2rem)",
          fontWeight: 650,
          color: "#fff",
          margin: "0 0 16px",
        }}
      >
        What Membership Opens
      </h2>
      <p
        style={{
          fontFamily: display,
          fontStyle: "italic",
          fontSize: "1rem",
          color: muted,
          margin: "0 0 32px",
          lineHeight: 1.75,
          maxWidth: "480px",
        }}
      >
        Holding a Folk is a standing, not just an image. It carries access to four ongoing systems.
      </p>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {SYSTEMS.map((s, i) => (
          <div
            key={s.name}
            style={{
              padding: "22px 0",
              borderBottom: i < SYSTEMS.length - 1 ? `1px solid ${line}` : "none",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "16px",
            }}
          >
            <div>
              <p style={{ margin: 0, fontFamily: display, fontSize: "1.1rem", fontWeight: 600, color: "#fff" }}>{s.name}</p>
              <p style={{ margin: "5px 0 0", fontFamily: display, fontStyle: "italic", fontSize: "0.9rem", color: muted, lineHeight: 1.55 }}>
                {s.desc}
              </p>
            </div>
            <span style={{ fontFamily: mono, fontSize: "0.56rem", letterSpacing: "0.1em", color: faint, flexShrink: 0, paddingTop: "4px" }}>
              {String(i + 1).padStart(2, "0")}
            </span>
          </div>
        ))}
      </div>
    </RevealSection>
  );
}
