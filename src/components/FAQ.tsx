import { useState } from "react";
import { body, display, gold, line, muted } from "../lib/theme";
import { Label, RevealSection } from "./shared";

const FAQS = [
  { q: "What is Folks?", a: "A 10,000-member registry of hand-composed characters, launching on Robinhood." },
  { q: "What is the Folkslist?", a: "The only way to get whitelisted before mint — connect your X account, complete the tasks, and register your wallet." },
  { q: "Why does connecting X matter?", a: "It verifies you're a real account, not a duplicate or a bot, before you take a spot on the list." },
  { q: "What tasks do I need to complete?", a: "Follow the official account, like and retweet the pinned post, then submit your wallet." },
  { q: "Is there a limit on the Folkslist?", a: "Yes — 1,000 spots total. Once they're gone, you'll need to wait for the public mint." },
  { q: "What is the mint price?", a: "To be announced once the Folkslist closes." },
  { q: "Where does mint happen?", a: "OpenSea, on Ethereum." },
  { q: "Is this financial advice?", a: "No. Folks is a digital collectible. Do your own research." },
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
        background: "rgba(0,200,5,0.02)",
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
