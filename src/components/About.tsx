import { body, display, gold, line, mono, muted, panel } from "../lib/theme";
import { Label, RevealSection } from "./shared";

export default function About() {
  return (
    <RevealSection id="about">
      <Label text="About Folks" index="01" />
      <div
        style={{
          background: panel,
          border: `1px solid ${line}`,
          borderRadius: "14px",
          padding: "28px 24px",
        }}
      >
        <p style={{ fontFamily: mono, fontSize: "0.66rem", letterSpacing: "0.1em", textTransform: "uppercase", color: gold, margin: "0 0 18px" }}>
          A Collection By Mike Boyd
        </p>

        <p style={{ fontFamily: body, fontSize: "0.94rem", color: muted, lineHeight: 1.75, margin: "0 0 16px" }}>
          Consists of strange characters, unique personalities, and unapologetic individuality.
        </p>
        <p style={{ fontFamily: body, fontSize: "0.94rem", color: muted, lineHeight: 1.75, margin: "0 0 16px" }}>
          Built around a raw, hand-drawn style, each character brings its own look, attitude, and
          story. From the outfits they wear to the expressions on their faces, no two characters
          are meant to feel the same.
        </p>
        <p style={{ fontFamily: body, fontSize: "0.94rem", color: muted, lineHeight: 1.75, margin: "0 0 16px" }}>
          This collection is for the misfits, the weirdos, the degenerates, and the people who
          never cared about fitting in.
        </p>
        <p style={{ fontFamily: body, fontSize: "0.94rem", color: muted, lineHeight: 1.75, margin: "0 0 24px" }}>
          More than just a PFP, each character represents a different side of internet culture —
          the humor, chaos, creativity, and freedom that make this space what it is.
        </p>

        <p style={{ fontFamily: display, fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: 0, letterSpacing: "0.01em" }}>
          Be weird. Be different. Be one of the Folks.
        </p>
      </div>
    </RevealSection>
  );
}

