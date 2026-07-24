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
    <img
      src="/Folks-logo.png"
      alt="Folks"
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
        border: `1px solid ${gold}55`,
        display: "block",
      }}
    />
  );
}

/* ── Ambient backdrop — faint ticker grid + soft glow, fintech-dashboard feel ── */
export function Guilloche({ opacity = 0.5 }: { opacity?: number }) {
  const cols = 14;
  const rows = 10;
  return (
    <svg
      viewBox="0 0 800 600"
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
      {Array.from({ length: cols + 1 }).map((_, i) => (
        <line key={`v${i}`} x1={(800 / cols) * i} y1="0" x2={(800 / cols) * i} y2="600" stroke={gold} strokeWidth="0.4" opacity="0.12" />
      ))}
      {Array.from({ length: rows + 1 }).map((_, i) => (
        <line key={`h${i}`} x1="0" y1={(600 / rows) * i} x2="800" y2={(600 / rows) * i} stroke={gold} strokeWidth="0.4" opacity="0.1" />
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
