import { display, faint, gold, goldLight, ink, line, mono, muted } from "../lib/theme";
import { Label, RevealSection } from "./shared";

const STATS: [string, string][] = [
  ["TBA", "Supply"],
  ["TBA", "Price"],
  ["Ethereum", "Chain"],
  ["OpenSea", "Launchpad"],
];

/** Update once the collection is live on OpenSea. */
const OPENSEA_URL = "https://opensea.io/collection/folks";

export default function MintSection() {
  return (
    <RevealSection id="mint">
      <Label text="The Mint" index="06" />
      <h2 style={{ fontFamily: display, fontSize: "clamp(2rem,7vw,3.2rem)", fontWeight: 650, color: "#fff", margin: "0 0 16px" }}>
        One Phase. One Mint.
      </h2>
      <p style={{ fontFamily: display, fontStyle: "italic", fontSize: "1rem", color: muted, margin: "0 0 32px", lineHeight: 1.75 }}>
        The Folkslist is the mint. Full pricing and supply details are announced once the registry
        closes.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1px",
          border: `1px solid ${line}`,
          borderRadius: "10px",
          overflow: "hidden",
          marginBottom: "28px",
        }}
      >
        {STATS.map(([v, l], i) => (
          <div
            key={i}
            style={{
              padding: "20px 18px",
              background: "rgba(201,162,39,0.025)",
              borderBottom: i < 2 ? `1px solid ${line}` : "none",
              borderRight: i % 2 === 0 ? `1px solid ${line}` : "none",
            }}
          >
            <p style={{ margin: 0, fontFamily: mono, fontSize: "1.2rem", fontWeight: 600, color: "#fff" }}>{v}</p>
            <p style={{ margin: "4px 0 0", fontFamily: display, fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", color: faint }}>
              {l}
            </p>
          </div>
        ))}
      </div>

      <a
        href={OPENSEA_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          width: "100%",
          fontFamily: mono,
          fontSize: "0.75rem",
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: ink,
          background: `linear-gradient(180deg,${goldLight},${gold})`,
          border: "none",
          borderRadius: "6px",
          padding: "16px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          textDecoration: "none",
          transition: "transform 0.15s ease, box-shadow 0.2s ease",
          boxShadow: `0 8px 30px ${gold}30`,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.transform = "";
        }}
      >
        <span>View On OpenSea</span>
      </a>
    </RevealSection>
  );
}
