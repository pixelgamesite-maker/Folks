import { body, display, gold, ink } from "../lib/theme";
import { FolksSeal } from "./shared";

export const X_URL = "https://x.com/thefolkseth_";

export default function Header({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: "0 28px",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(5,6,5,0.86)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
        borderBottom: "1px solid rgba(0,200,5,0.14)",
      }}
    >
      <a href="#home" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
        <FolksSeal size={30} />
        <span
          style={{
            fontFamily: display,
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "0.02em",
          }}
        >
          FOLKS
        </span>
      </a>

      <nav style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button
          onClick={onOpenModal}
          style={{
            fontFamily: body,
            fontSize: "0.68rem",
            fontWeight: 700,
            letterSpacing: "0.04em",
            color: ink,
            background: gold,
            border: "none",
            borderRadius: "6px",
            padding: "9px 16px",
            cursor: "pointer",
          }}
        >
          Claim Early Role
        </button>

        <a
          href={X_URL}
          target="_blank"
          rel="noopener noreferrer"
          title="Follow on X"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "34px",
            height: "34px",
            borderRadius: "6px",
            color: "rgba(245,247,245,0.55)",
            border: "1px solid rgba(0,200,5,0.2)",
            transition: "all 0.2s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.color = "#fff";
            el.style.borderColor = `${gold}88`;
            el.style.background = "rgba(0,200,5,0.08)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.color = "rgba(245,247,245,0.55)";
            el.style.borderColor = "rgba(0,200,5,0.2)";
            el.style.background = "transparent";
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
          </svg>
        </a>
      </nav>
    </header>
  );
}
