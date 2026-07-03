import { display, muted } from "../lib/theme";
import { Label, RevealSection } from "./shared";

export default function Reserve() {
  return (
    <RevealSection>
      <Label text="Reserve" index="07" />
      <h2 style={{ fontFamily: display, fontSize: "clamp(2rem,7vw,3.2rem)", fontWeight: 650, color: "#fff", margin: "0 0 16px" }}>
        The Folks Reserve
      </h2>
      <p style={{ fontFamily: display, fontStyle: "italic", fontSize: "1rem", color: muted, lineHeight: 1.85 }}>
        A small allocation is held back from the Folkslist for collaborations, partnerships,
        community rewards, and future activations. This is not a public mint phase.
      </p>
    </RevealSection>
  );
}
