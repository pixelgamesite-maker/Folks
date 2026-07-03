import { display, gold, mono, muted } from "../lib/theme";
import { Label, RevealSection } from "./shared";

const ROADMAP = [
  { phase: "Phase I", title: "Folkslist Opens", desc: "Registration opens. Connect, post, and submit your wallet for review." },
  { phase: "Phase II", title: "Mint Opens", desc: "Verified Folkslist wallets mint on OpenSea." },
  { phase: "Phase III", title: "Reveal", desc: "Folks reveal with full traits, ranks, and registry numbers." },
  { phase: "Phase IV", title: "Utility Reveal", desc: "Holder benefits and access details are shared in full." },
  { phase: "Phase V", title: "Systems Open", desc: "The Archive, The Grounds, The Table, and The Vault begin opening." },
];

export default function Roadmap() {
  return (
    <RevealSection>
      <Label text="The Plan" index="08" />
      <h2 style={{ fontFamily: display, fontSize: "clamp(2rem,7vw,3.2rem)", fontWeight: 650, color: "#fff", margin: "0 0 36px" }}>
        What Comes After Mint
      </h2>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: "16px", top: 0, bottom: 0, width: "1px", background: `linear-gradient(180deg,${gold}55,${gold}0d)` }} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          {ROADMAP.map((r, i) => (
            <div
              key={r.phase}
              style={{
                display: "flex",
                gap: "24px",
                paddingBottom: i < ROADMAP.length - 1 ? "28px" : "0",
                paddingLeft: "40px",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "4px",
                  width: "13px",
                  height: "13px",
                  borderRadius: "50%",
                  border: `1px solid ${gold}`,
                  background: "#060605",
                  flexShrink: 0,
                }}
              />
              <div>
                <p style={{ margin: 0, fontFamily: mono, fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", color: gold, marginBottom: "4px" }}>
                  {r.phase}
                </p>
                <p style={{ margin: 0, fontFamily: display, fontSize: "1.02rem", fontWeight: 600, color: "#fff" }}>{r.title}</p>
                <p style={{ margin: "4px 0 0", fontFamily: display, fontStyle: "italic", fontSize: "0.88rem", color: muted, lineHeight: 1.55 }}>
                  {r.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}
