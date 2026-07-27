import { body, line, muted, panel } from "../lib/theme";
import { Label, RevealSection } from "./shared";

/**
 * Client-provided copy — three short paragraphs, no heading. Panel styling
 * (Label + card) stays the same as the rest of the site.
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
        <p style={{ fontFamily: body, fontSize: "0.94rem", color: muted, lineHeight: 1.75, margin: "0 0 16px" }}>
          Folks is for those who remember when NFTs felt different.
        </p>
        <p style={{ fontFamily: body, fontSize: "0.94rem", color: muted, lineHeight: 1.75, margin: "0 0 16px" }}>
          For those who were here from day one; the early believers, collectors, and degens who
          remember the feeling of the first era of NFTs.
        </p>
        <p style={{ fontFamily: body, fontSize: "0.94rem", color: muted, lineHeight: 1.75, margin: 0 }}>
          A nostalgic tribute to the culture, energy, and simplicity of those early days, Folks is
          about bringing back that feeling and keeping the spirit of the OG NFT era alive.
        </p>
      </div>
    </RevealSection>
  );
}
