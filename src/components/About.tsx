import { body, display, faint, gold, line, mono, muted, panel } from "../lib/theme";
import { Label, RevealSection } from "./shared";

/**
 * Placeholder copy — swap once the actual art/lore direction is locked in.
 * Structure mirrors the Nerdio reference: eyebrow tags, a heading, then
 * short punchy paragraphs. Keep paragraphs short — this is a vibe section,
 * not a spec sheet.
 */
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
        <h2
          style={{
            fontFamily: display,
            fontSize: "clamp(1.6rem,6vw,2.3rem)",
            fontWeight: 700,
            color: "#fff",
            margin: "0 0 8px",
            letterSpacing: "-0.01em",
          }}
        >
          Ten thousand folks, one registry
        </h2>
        <p
          style={{
            fontFamily: mono,
            fontSize: "0.62rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: gold,
            margin: "0 0 20px",
          }}
        >
          Launching On Robinhood &middot; Whitelist Open
        </p>

        <p style={{ fontFamily: body, fontSize: "0.94rem", color: muted, lineHeight: 1.75, margin: "0 0 16px" }}>
          Folks started as a simple idea — a collection built for the people who show up before
          anyone tells them to. No lore department, no roadmap theater. Just ten thousand faces,
          numbered and registered, for whoever claims a spot first.
        </p>
        <p style={{ fontFamily: body, fontSize: "0.94rem", color: muted, lineHeight: 1.75, margin: "0 0 16px" }}>
          The Folkslist is the only way in before mint. Connect your X account, complete the tasks,
          register your wallet — that's the whole application. First thousand folks get the early
          role. Everyone else waits for whatever's left.
        </p>
        <p style={{ fontFamily: body, fontSize: "0.94rem", color: muted, lineHeight: 1.75, margin: 0 }}>
          Launching on Robinhood means this reaches further than the usual crowd. Get in before it does.
        </p>
      </div>
    </RevealSection>
  );
}
