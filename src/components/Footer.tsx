import { display, gold, line, mono } from "../lib/theme";
import { FolksSeal } from "./shared";
import { X_URL } from "./Header";

const CONTACT_EMAIL = "contactsupport@folkseth.xyz";

export default function Footer() {
  return (
    <footer style={{ padding: "60px 24px 44px", textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
        <FolksSeal size={44} />
      </div>
      <h3 style={{ fontFamily: display, fontSize: "1.4rem", fontWeight: 650, color: "#fff", margin: "0 0 6px", letterSpacing: "0.1em" }}>
        FOLKS
      </h3>
      <p style={{ fontFamily: display, fontStyle: "italic", fontSize: "0.88rem", color: "rgba(247,245,239,0.32)", margin: "0 0 22px", lineHeight: 1.7 }}>
        A registry of ten thousand. Built on Ethereum, minted on OpenSea.
      </p>

      <div style={{ display: "flex", gap: "24px", justifyContent: "center", marginBottom: "18px", flexWrap: "wrap" }}>
        {([
          ["X", X_URL],
          ["Folkslist", "#folkslist"],
          ["Mint", "#mint"],
          ["Questions", "#questions"],
        ] as [string, string][]).map(([l, h]) => (
          <a
            key={l}
            href={h}
            target={h.startsWith("http") ? "_blank" : undefined}
            rel={h.startsWith("http") ? "noopener noreferrer" : undefined}
            style={{ fontFamily: mono, fontSize: "0.66rem", letterSpacing: "0.12em", textTransform: "uppercase", color: `${gold}99`, transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = `${gold}99`)}
          >
            {l}
          </a>
        ))}
      </div>

      <a
        href={`mailto:${CONTACT_EMAIL}`}
        style={{ fontFamily: mono, fontSize: "0.68rem", color: "rgba(247,245,239,0.4)", letterSpacing: "0.04em" }}
      >
        {CONTACT_EMAIL}
      </a>

      <div style={{ width: "40px", height: "1px", background: `linear-gradient(90deg,transparent,${line},transparent)`, margin: "22px auto 18px" }} />
      <p style={{ fontFamily: mono, fontSize: "0.55rem", letterSpacing: "0.26em", textTransform: "uppercase", color: `${gold}44` }}>
        The Registry Opens Soon
      </p>
    </footer>
  );
}
