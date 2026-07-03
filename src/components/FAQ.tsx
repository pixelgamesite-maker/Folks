import { useState } from "react";
import { display, gold, line, muted } from "../lib/theme";
import { Label, RevealSection } from "./shared";

const FAQS = [
  { q: "What is Folks?", a: "A 10,000-member registry of hand-composed characters on Ethereum." },
  { q: "What is the mint price?", a: "To be announced once the Folkslist closes." },
  { q: "Where does mint happen?", a: "OpenSea." },
  { q: "What is the Folkslist?", a: "The only mint access phase. Registration requires connecting your X account, posting your early alpha, and submitting a wallet for review." },
  { q: "Is there a public mint?", a: "If entries remain after the Folkslist, yes." },
  { q: "Is this financial advice?", a: "No. Folks is a digital collectible. Do your own research." },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${line}` }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "16px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <span style={{ fontFamily: display, fontSize: "1rem", fontWeight: 600, color: open ? "#fff" : "rgba(247,245,239,0.78)", textAlign: "left" }}>
          {q}
        </span>
        <span style={{ color: gold, fontSize: "1.1rem", flexShrink: 0, transition: "transform 0.25s", transform: open ? "rotate(45deg)" : "rotate(0)" }}>
          +
        </span>
      </button>
      {open && (
        <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: "0.88rem", color: muted, padding: "0 0 16px", margin: 0, lineHeight: 1.65 }}>
          {a}
        </p>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <RevealSection id="questions">
      <Label text="FAQ" index="09" />
      <h2 style={{ fontFamily: display, fontSize: "clamp(2rem,7vw,3.2rem)", fontWeight: 650, color: "#fff", margin: "0 0 32px" }}>
        Questions
      </h2>
      <div>
        {FAQS.map((f) => (
          <FaqItem key={f.q} q={f.q} a={f.a} />
        ))}
      </div>
    </RevealSection>
  );
}
