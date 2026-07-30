import { useLocation } from "wouter";
import { body, display, ink, line, mono, violet, violetLight, violetLine } from "../lib/theme";

export default function GetWhitelistedModal({
  open,
  onClose,
  onEarnPoints,
}: {
  open: boolean;
  onClose: () => void;
  onEarnPoints: () => void;
}) {
  const [, navigate] = useLocation();

  if (!open) return null;

  function goMarketplace() {
    onClose();
    navigate("/marketplace");
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "360px",
          background: "#0b0a10",
          border: `1px solid ${violetLine}`,
          borderRadius: "14px",
          padding: "28px 22px 24px",
          animation: "folksModalIn 0.25s ease both",
          position: "relative",
          textAlign: "center",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "14px",
            right: "16px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "rgba(245,247,245,0.3)",
            fontSize: "1.1rem",
          }}
        >
          ✕
        </button>

        <p style={{ fontFamily: mono, fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", color: violet, margin: "0 0 10px" }}>
          Get Whitelisted
        </p>
        <p style={{ fontFamily: display, fontWeight: 700, fontSize: "1.2rem", margin: "0 0 22px", color: "#fff" }}>What are you here for?</p>

        <button
          onClick={onEarnPoints}
          style={{
            width: "100%",
            fontFamily: body,
            fontSize: "0.8rem",
            fontWeight: 700,
            color: ink,
            background: `linear-gradient(180deg,${violetLight},${violet})`,
            border: "none",
            borderRadius: "9px",
            padding: "15px",
            cursor: "pointer",
            marginBottom: "10px",
          }}
        >
          Earn Points
        </button>
        <p style={{ fontFamily: mono, fontSize: "0.6rem", color: "rgba(245,247,245,0.35)", margin: "0 0 18px" }}>
          Complete tasks, climb the Whitelist
        </p>

        <button
          onClick={goMarketplace}
          style={{
            width: "100%",
            fontFamily: body,
            fontSize: "0.8rem",
            fontWeight: 700,
            color: "#fff",
            background: "transparent",
            border: `1px solid ${line}`,
            borderRadius: "9px",
            padding: "15px",
            cursor: "pointer",
          }}
        >
          Marketplace
        </button>
        <p style={{ fontFamily: mono, fontSize: "0.6rem", color: "rgba(245,247,245,0.35)", margin: "8px 0 0" }}>Buy, sell, trade Folks</p>
      </div>
    </div>
  );
}
