import { useState } from "react";
import { body, display, gold, line, muted } from "../lib/theme";
import { Label, RevealSection } from "./shared";

const FAQS = [
  { q: "What is Folks?", a: "A registry of hand drawn characters, launching on Ethereum." },
  { q: "What is the Whitelist?", a: "Connect your X account and complete tasks to earn points. Everyone who earns points has a shot at a spot." },
  { q: "Why does connecting X matter?", a: "It verifies you're a real account, not a duplicate or a bot, before your tasks and points get counted." },
  { q: "What tasks do I need to complete?", a: "A few one-time tasks (like following and making a bullish post), plus daily tasks that refreshes every 24 hours." },
  { q: "What is the Marketplace?", a: "Where you'll spend your point balance to secure a Whitelist spot once it opens. It's currently Coming Soon." },
  { q: "Do I need to connect a wallet?", a: "No, but you can bind your wallet from the profile menu on the Whitelist page so you're ready once spots open." },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        border: `1px solid ${line}`,
        borderRadius: "10px",
        marginBottom: "8px",
        overflow: "hidden",
        background: "rgba(46,90,172,0.02)",
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "16px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <span style={{ fontFamily: display, fontSize: "0.98rem", fontWeight: 600, color: open ? "#fff" : "rgba(245,247,245,0.78)", textAlign: "left" }}>
          {q}
        </span>
        <span style={{ color: gold, fontSize: "1.1rem", flexShrink: 0, transition: "transform 0.25s", transform: open ? "rotate(45deg)" : "rotate(0)" }}>
          +
        </span>
      </button>
      {open && (
        <p style={{ fontFamily: body, fontSize: "0.86rem", color: muted, padding: "0 18px 16px", margin: 0, lineHeight: 1.65 }}>
          {a}
        </p>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <RevealSection id="questions">
      <Label text="FAQ" index="02" />
      <h2 style={{ fontFamily: display, fontSize: "clamp(1.8rem,6vw,2.6rem)", fontWeight: 700, color: "#fff", margin: "0 0 24px" }}>
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
