import { body, faint, gold, line, mono } from "../lib/theme";
import { useScrollReveal } from "../hooks/useScrollReveal";

/* ── Validators ───────────────────────────────────────────────── */
export function isValidEvm(a: string) {
  return /^0x[0-9a-fA-F]{40}$/.test(a.trim());
}
export function isValidUrl(u: string) {
  try {
    const url = new URL(u.trim());
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
export function isValidTweetUrl(u: string) {
  if (!isValidUrl(u)) return false;
  try {
    const host = new URL(u.trim()).hostname.replace("www.", "");
    return host === "x.com" || host === "twitter.com";
  } catch {
    return false;
  }
}

export function RevealSection({
  children,
  bg = "transparent",
  id,
  extra,
  delay = 0,
  maxWidth = "720px",
}: {
  children: React.ReactNode;
  bg?: string;
  id?: string;
  extra?: React.CSSProperties;
  delay?: number;
  maxWidth?: string;
}) {
  const { ref, visible } = useScrollReveal();
  return (
    <section
      id={id}
      ref={ref}
      style={{
        background: bg,
        padding: "92px 0",
        position: "relative",
        ...extra,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(36px)",
        transition: `opacity 0.75s ease ${delay}s, transform 0.75s ease ${delay}s`,
      }}
    >
      <div style={{ maxWidth, margin: "0 auto", padding: "0 24px" }}>{children}</div>
    </section>
  );
}

/* ── Eyebrow / section label — a ledger-style entry marker ─────── */
export function Label({ text, index }: { text: string; index?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
      {index && (
        <span
          style={{
            fontFamily: mono,
            fontSize: "0.62rem",
            letterSpacing: "0.1em",
            color: gold,
            border: `1px solid ${line}`,
            borderRadius: "3px",
            padding: "2px 6px",
          }}
        >
          {index}
        </span>
      )}
      <span
        style={{
          fontFamily: body,
          fontSize: "0.62rem",
          fontWeight: 700,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: gold,
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </span>
      <div style={{ height: "1px", flex: 1, background: `linear-gradient(90deg,${line},transparent)` }} />
    </div>
  );
}

export function Divider() {
  return (
    <div
      style={{
        height: "1px",
        background: `linear-gradient(90deg,transparent,${line},transparent)`,
        margin: 0,
      }}
    />
  );
}

/* ── The Folks seal — signature emblem used in header, hero & modal ── */
export function FolksSeal({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="30.5" stroke={gold} strokeWidth="1" />
      <circle cx="32" cy="32" r="25" stroke={gold} strokeWidth="0.6" opacity="0.55" />
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i / 24) * Math.PI * 2;
        const x1 = 32 + Math.cos(a) * 27.5;
        const y1 = 32 + Math.sin(a) * 27.5;
        const x2 = 32 + Math.cos(a) * 30.5;
        const y2 = 32 + Math.sin(a) * 30.5;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={gold} strokeWidth="0.6" opacity="0.5" />;
      })}
      <text
        x="32"
        y="38"
        textAnchor="middle"
        style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "20px", fill: gold }}
      >
        F
      </text>
    </svg>
  );
}

/* ── Ambient guilloché backdrop — fine engraved rings, certificate-like ── */
export function Guilloche({ opacity = 0.5 }: { opacity?: number }) {
  const rings = Array.from({ length: 7 });
  return (
    <svg
      viewBox="0 0 800 800"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity,
        pointerEvents: "none",
      }}
      preserveAspectRatio="xMidYMid slice"
    >
      {rings.map((_, i) => (
        <ellipse
          key={i}
          cx="400"
          cy="360"
          rx={120 + i * 46}
          ry={90 + i * 34}
          fill="none"
          stroke={gold}
          strokeWidth="0.5"
          opacity={0.16 - i * 0.012}
        />
      ))}
      {rings.map((_, i) => (
        <ellipse
          key={`b${i}`}
          cx="400"
          cy="360"
          rx={90 + i * 46}
          ry={130 + i * 34}
          fill="none"
          stroke={gold}
          strokeWidth="0.5"
          opacity={0.1 - i * 0.008}
        />
      ))}
    </svg>
  );
}

export const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(0,0,0,0.55)",
  border: `1px solid ${line}`,
  borderRadius: "5px",
  padding: "10px 12px",
  fontSize: "0.82rem",
  color: "#fff",
  fontFamily: body,
  outline: "none",
  transition: "border 0.2s",
  boxSizing: "border-box",
};

export function focusInp(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = `${gold}88`;
}
export function blurInp(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = line;
}

export const microLabel: React.CSSProperties = {
  fontFamily: mono,
  fontSize: "0.6rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: faint,
};
