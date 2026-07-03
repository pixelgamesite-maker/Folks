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
        background: "rgba(6,6,5,0.86)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
        borderBottom: "1px solid rgba(201,162,39,0.14)",
      }}
    >
      <a href="#home" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
        <FolksSeal size={30} />
        <span
          style={{
            fontFamily: display,
            fontSize: "1.15rem",
            fontWeight: 600,
            color: "#fff",
            letterSpacing: "0.12em",
          }}
        >
          FOLKS
        </span>
      </a>

      <nav style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        {([
          ["Folkslist", "#folkslist"],
          ["Mint", "#mint"],
          ["Questions", "#questions"],
        ] as [string, string][]).map(([l, h]) => (
          <a
            key={l}
            href={h}
            style={{
              fontFamily: body,
              fontSize: "0.64rem",
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgba(247,245,239,0.5)",
              padding: "8px 13px",
              borderRadius: "5px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(201,162,39,0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "rgba(247,245,239,0.5)";
              (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
            }}
          >
            {l}
          </a>
        ))}

        <button
          onClick={onOpenModal}
          style={{
            marginLeft: "10px",
            fontFamily: body,
            fontSize: "0.62rem",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: ink,
            background: gold,
            border: "none",
            borderRadius: "5px",
            padding: "9px 16px",
            cursor: "pointer",
          }}
        >
          Claim Early Role
        </button>

        <div style={{ width: "1px", height: "16px", background: "rgba(201,162,39,0.2)", margin: "0 6px" }} />

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
            borderRadius: "5px",
            color: "rgba(247,245,239,0.5)",
            border: "1px solid rgba(201,162,39,0.2)",
            transition: "all 0.2s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.color = "#fff";
            el.style.borderColor = `${gold}88`;
            el.style.background = "rgba(201,162,39,0.06)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.color = "rgba(247,245,239,0.5)";
            el.style.borderColor = "rgba(201,162,39,0.2)";
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
