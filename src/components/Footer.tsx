import { display, gold, line, mono } from "../lib/theme";
import { FolksSeal } from "./shared";
import { X_URL } from "./Header";

const CONTACT_EMAIL = "contactsupport@folkseth.xyz";

export default function Footer() {
  return (
    <footer style={{ padding: "56px 24px 40px", textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
        <FolksSeal size={40} />
      </div>
      <h3 style={{ fontFamily: display, fontSize: "1.3rem", fontWeight: 700, color: "#fff", margin: "0 0 6px", letterSpacing: "0.01em" }}>
        FOLKS
      </h3>
      <p style={{ fontFamily: display, fontSize: "0.82rem", color: "rgba(245,247,245,0.32)", margin: "0 0 22px" }}>
        Ten thousand folks. Launching on Robinhood.
      </p>

      <div style={{ display: "flex", gap: "14px", justifyContent: "center", marginBottom: "18px" }}>
        <a
          href={X_URL}
          target="_blank"
          rel="noopener noreferrer"
          title="X"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            border: `1px solid ${line}`,
            color: gold,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
          </svg>
        </a>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          title="Email"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            border: `1px solid ${line}`,
            color: gold,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 7l9 6 9-6" />
          </svg>
        </a>
      </div>

      <p style={{ fontFamily: mono, fontSize: "0.68rem", color: "rgba(245,247,245,0.4)", margin: "0 0 6px" }}>{CONTACT_EMAIL}</p>
      <p style={{ fontFamily: mono, fontSize: "0.6rem", color: "rgba(245,247,245,0.24)", margin: 0 }}>&copy; 2026 Folks</p>
    </footer>
  );
}
