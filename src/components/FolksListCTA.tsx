import { display, faint, gold, goldLight, ink, mono, muted } from "../lib/theme";
import { Guilloche, Label } from "./shared";

export default function FolksListCTA({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <section
      id="folkslist"
      style={{
        background: "linear-gradient(180deg,#060605 0%,#0e0b06 50%,#060605 100%)",
        padding: "104px 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Guilloche opacity={0.3} />
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "0 24px", textAlign: "center", position: "relative" }}>
        <Label text="Access" index="05" />
        <h2 style={{ fontFamily: display, fontSize: "clamp(2rem,7vw,3.2rem)", fontWeight: 650, color: "#fff", margin: "0 0 20px" }}>
          Join The Folkslist
        </h2>
        <p
          style={{
            fontFamily: display,
            fontStyle: "italic",
            fontSize: "1rem",
            color: muted,
            margin: "0 0 8px",
            lineHeight: 1.85,
            maxWidth: "480px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          The Folkslist is the only mint access phase. Connect your X account, post your early
          alpha, and register your wallet. Verified wallets mint on OpenSea.
        </p>
        <button
          onClick={onOpenModal}
          style={{
            marginTop: "26px",
            fontFamily: mono,
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: ink,
            background: `linear-gradient(180deg,${goldLight},${gold})`,
            border: "none",
            borderRadius: "6px",
            padding: "16px 40px",
            cursor: "pointer",
            transition: "transform 0.15s ease, box-shadow 0.2s ease",
            boxShadow: `0 8px 30px ${gold}30`,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "";
          }}
        >
          Claim Early Role
        </button>
        <p style={{ margin: "12px 0 0", fontFamily: mono, fontSize: "0.6rem", color: faint, letterSpacing: "0.04em" }}>
          If you can see this button, you're early.
        </p>
      </div>
    </section>
  );
}
