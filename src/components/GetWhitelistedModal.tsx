import { useLocation } from "wouter";
import { body, gold, goldLight, ink, violet, violetLight, violetLine } from "../lib/theme";

export default function GetWhitelistedModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [, navigate] = useLocation();

  if (!open) return null;

  function goEarnPoints() {
    onClose();
    navigate("/whitelist");
  }
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
          padding: "24px 22px",
          animation: "folksModalIn 0.25s ease both",
          position: "relative",
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

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "22px" }}>
          <button
            onClick={goEarnPoints}
            style={{
              width: "100%",
              fontFamily: body,
              fontSize: "0.86rem",
              fontWeight: 700,
              color: ink,
              background: `linear-gradient(180deg,${violetLight},${violet})`,
              border: "none",
              borderRadius: "10px",
              padding: "17px",
              cursor: "pointer",
            }}
          >
            Earn Points
          </button>

          <button
            onClick={goMarketplace}
            style={{
              width: "100%",
              fontFamily: body,
              fontSize: "0.86rem",
              fontWeight: 700,
              color: "#fff",
              background: `linear-gradient(180deg,${goldLight},${gold})`,
              border: "none",
              borderRadius: "10px",
              padding: "17px",
              cursor: "pointer",
            }}
          >
            Marketplace
          </button>
        </div>
      </div>
    </div>
  );
}

