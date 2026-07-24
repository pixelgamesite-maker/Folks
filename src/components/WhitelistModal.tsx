import { useEffect, useState } from "react";
import { body, display, ink, mono, muted, violet, violetLight, violetLine } from "../lib/theme";
import { supabase } from "../lib/supabase";
import { isValidEvm, isValidUrl } from "./shared";

const X_HANDLE = "thefolkseth_";
const X_URL = `https://x.com/${X_HANDLE}`;

/** Placeholder — client will drop the real pinned post URL in later. */
const PINNED_TWEET_URL = "https://x.com/thefolkseth_/status/REPLACE_WITH_PINNED_TWEET_ID";

const FOLLOW_URL = `https://twitter.com/intent/follow?screen_name=${X_HANDLE}`;
const QUOTE_TEXT = "Bullish on @thefolkseth_. Ten thousand folks, one registry.";
const QUOTE_URL = `https://twitter.com/intent/tweet?text=${encodeURIComponent(QUOTE_TEXT)}&url=${encodeURIComponent(PINNED_TWEET_URL)}`;

const APPLICATIONS_TABLE = "folks_whitelist_applications";
const STORAGE_KEY = "folks_wl_draft_v3";
const SUBMITTED_KEY = "folks_wl_submitted";

/* ── Tiny inline icons — no external icon package needed ── */
function IconCheck({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 22 18" fill="none">
      <path d="M2 9L8 15L20 2" stroke={ink} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(0,0,0,0.35)",
  border: `1px solid ${violetLine}`,
  borderRadius: "8px",
  padding: "11px 12px",
  fontSize: "0.85rem",
  color: "#fff",
  fontFamily: body,
  outline: "none",
  boxSizing: "border-box",
};

const microLabel: React.CSSProperties = {
  fontFamily: mono,
  fontSize: "0.62rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "rgba(245,247,245,0.4)",
};

const confirmBtn: React.CSSProperties = {
  marginTop: "8px",
  width: "100%",
  fontFamily: mono,
  fontSize: "0.62rem",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: ink,
  background: violet,
  border: "none",
  borderRadius: "7px",
  padding: "8px",
  cursor: "pointer",
};

/* ── A single click-through task: open a link, then confirm ── */
function TaskRow({
  n,
  label,
  actionLabel,
  actionHref,
  confirmed,
  ready,
  onOpen,
  onConfirm,
}: {
  n: string;
  label: string;
  actionLabel: string;
  actionHref: string;
  confirmed: boolean;
  ready: boolean;
  onOpen: () => void;
  onConfirm: () => void;
}) {
  return (
    <div style={{ border: `1px solid ${violetLine}`, borderRadius: "10px", padding: "14px", marginBottom: "10px" }}>
      <p style={{ margin: "0 0 8px", ...microLabel }}>
        <span style={{ color: violet }}>{n}</span> {label}
      </p>
      <div style={{ display: "flex", gap: "8px" }}>
        <a
          href={actionHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onOpen}
          style={{
            flex: 1,
            textAlign: "center",
            fontFamily: mono,
            fontSize: "0.64rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#fff",
            border: `1px solid ${violetLight}55`,
            borderRadius: "7px",
            padding: "9px",
            textDecoration: "none",
          }}
        >
          {actionLabel}
        </a>
        <button
          disabled={!ready || confirmed}
          onClick={onConfirm}
          style={{
            flex: 1,
            fontFamily: mono,
            fontSize: "0.64rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: confirmed || ready ? ink : "rgba(245,247,245,0.3)",
            background: confirmed || ready ? violet : "rgba(255,255,255,0.04)",
            border: "none",
            borderRadius: "7px",
            padding: "9px",
            cursor: ready && !confirmed ? "pointer" : "default",
          }}
        >
          {confirmed ? "Confirmed" : "Confirm"}
        </button>
      </div>
    </div>
  );
}

/* ── A click-through task that also needs a submitted link (Quote / Comment) ── */
function LinkTaskRow({
  n,
  label,
  actionLabel,
  actionHref,
  placeholder,
  value,
  onChange,
  confirmed,
  onConfirm,
}: {
  n: string;
  label: string;
  actionLabel: string;
  actionHref: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  confirmed: boolean;
  onConfirm: () => void;
}) {
  return (
    <div style={{ border: `1px solid ${violetLine}`, borderRadius: "10px", padding: "14px", marginBottom: "10px" }}>
      <p style={{ margin: "0 0 8px", ...microLabel }}>
        <span style={{ color: violet }}>{n}</span> {label}
      </p>
      <a
        href={actionHref}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "block",
          textAlign: "center",
          fontFamily: mono,
          fontSize: "0.64rem",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "#fff",
          border: `1px solid ${violetLight}55`,
          borderRadius: "7px",
          padding: "9px",
          textDecoration: "none",
          marginBottom: "8px",
        }}
      >
        {actionLabel}
      </a>
      <input placeholder={placeholder} value={value} disabled={confirmed} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
      {value && !isValidUrl(value) && <p style={{ fontSize: "0.66rem", color: "#d96b5a", margin: "6px 0 0" }}>Needs a valid https:// link.</p>}
      {isValidUrl(value) && !confirmed && (
        <button onClick={onConfirm} style={confirmBtn}>
          Confirm Link
        </button>
      )}
      {confirmed && <p style={{ fontSize: "0.66rem", color: violet, margin: "8px 0 0" }}>Confirmed.</p>}
    </div>
  );
}

/* ═══════════════════════════ MAIN ═══════════════════════════ */

export default function WhitelistModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [followed, setFollowed] = useState(false);
  const [followConfirmed, setFollowConfirmed] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeConfirmed, setLikeConfirmed] = useState(false);
  const [quoteUrl, setQuoteUrl] = useState("");
  const [quoteConfirmed, setQuoteConfirmed] = useState(false);
  const [commentUrl, setCommentUrl] = useState("");
  const [commentConfirmed, setCommentConfirmed] = useState(false);
  const [twitterUsername, setTwitterUsername] = useState("");
  const [wallet, setWallet] = useState("");
  const [walletConfirmed, setWalletConfirmed] = useState(false);

  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        setQuoteUrl(p.quoteUrl ?? "");
        setCommentUrl(p.commentUrl ?? "");
        setTwitterUsername(p.twitterUsername ?? "");
        setWallet(p.wallet ?? "");
      }
      if (localStorage.getItem(SUBMITTED_KEY) === "true") setAlreadySubmitted(true);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ quoteUrl, commentUrl, twitterUsername, wallet }));
    } catch {}
  }, [quoteUrl, commentUrl, twitterUsername, wallet]);

  const allValid =
    followConfirmed &&
    likeConfirmed &&
    quoteConfirmed &&
    isValidUrl(quoteUrl) &&
    commentConfirmed &&
    isValidUrl(commentUrl) &&
    twitterUsername.trim().length > 0 &&
    walletConfirmed &&
    isValidEvm(wallet);

  async function submit() {
    if (!allValid) {
      setErr("Complete every task before submitting.");
      return;
    }
    if (alreadySubmitted) {
      setErr("This browser has already submitted an application.");
      return;
    }
    setErr("");
    setSending(true);
    const { error } = await supabase.from(APPLICATIONS_TABLE).insert([
      {
        twitter_username: twitterUsername.trim(),
        wallet: wallet.trim(),
        quote_url: quoteUrl.trim(),
        comment_url: commentUrl.trim(),
      },
    ]);
    setSending(false);
    if (error) {
      if (error.code === "23505") {
        setErr("");
        setAlreadySubmitted(true);
        try {
          localStorage.setItem(SUBMITTED_KEY, "true");
        } catch {}
      } else {
        setErr("Something went wrong. Please try again.");
      }
      return;
    }
    setSuccess(true);
    try {
      localStorage.setItem(SUBMITTED_KEY, "true");
    } catch {}
    setAlreadySubmitted(true);
  }

  function handleClose() {
    onClose();
    if (!alreadySubmitted) {
      setSuccess(false);
      setErr("");
    }
  }

  if (!open) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(4,3,10,0.9)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <style>{`
        @keyframes folksModalIn2{from{opacity:0;transform:translateY(14px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
      `}</style>

      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          maxHeight: "92vh",
          overflowY: "auto",
          background: "#0b0a10",
          border: `1px solid ${violetLine}`,
          borderRadius: "14px",
          padding: "26px 22px 22px",
          animation: "folksModalIn2 0.25s ease both",
          position: "relative",
        }}
      >
        <button
          onClick={handleClose}
          style={{ position: "absolute", top: "14px", right: "16px", zIndex: 2, background: "none", border: "none", cursor: "pointer", color: "rgba(245,247,245,0.3)", fontSize: "1.1rem" }}
        >
          ✕
        </button>

        {alreadySubmitted ? (
          <div style={{ textAlign: "center", padding: "34px 4px 8px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: violet, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <IconCheck size={18} />
            </div>
            <p style={{ fontFamily: mono, fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: violet, margin: "0 0 8px" }}>Application Received</p>
            <p style={{ fontFamily: display, fontWeight: 700, fontSize: "1.3rem", margin: "0 0 10px", color: "#fff" }}>You're on the list.</p>
            <p style={{ fontSize: "0.85rem", color: muted, lineHeight: 1.6, margin: 0 }}>This wallet's spot has been saved. Selected applicants will be notified before mint.</p>
          </div>
        ) : success ? (
          <div style={{ textAlign: "center", padding: "34px 4px 8px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: violet, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <IconCheck size={18} />
            </div>
            <p style={{ fontFamily: mono, fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: violet, margin: "0 0 8px" }}>Application Sent</p>
            <p style={{ fontFamily: display, fontWeight: 700, fontSize: "1.3rem", margin: "0 0 10px", color: "#fff" }}>You're under review.</p>
            <p style={{ fontSize: "0.85rem", color: muted, lineHeight: 1.6, margin: 0 }}>Selected wallets will be notified before mint. No cap here — take your time.</p>
          </div>
        ) : (
          <>
            <p style={{ fontFamily: mono, fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", color: violet, margin: "0 0 6px" }}>Whitelist Application</p>
            <p style={{ fontFamily: display, fontWeight: 700, fontSize: "1.3rem", margin: "0 0 6px", color: "#fff" }}>Get Whitelisted</p>
            <p style={{ fontFamily: body, fontSize: "0.82rem", color: muted, margin: "0 0 18px", lineHeight: 1.5 }}>
              No cap on this list. Complete the tasks below and submit your wallet.
            </p>

            <TaskRow
              n="01"
              label="Follow Folks on X"
              actionLabel="Follow"
              actionHref={FOLLOW_URL}
              confirmed={followConfirmed}
              ready={followed}
              onOpen={() => setFollowed(true)}
              onConfirm={() => setFollowConfirmed(true)}
            />
            <TaskRow
              n="02"
              label="Like the pinned post"
              actionLabel="Open Post"
              actionHref={PINNED_TWEET_URL}
              confirmed={likeConfirmed}
              ready={liked}
              onOpen={() => setLiked(true)}
              onConfirm={() => setLikeConfirmed(true)}
            />
            <LinkTaskRow
              n="03"
              label="Quote with a bullish caption, tag Folks"
              actionLabel="Quote Tweet"
              actionHref={QUOTE_URL}
              placeholder="https://x.com/you/status/..."
              value={quoteUrl}
              onChange={setQuoteUrl}
              confirmed={quoteConfirmed}
              onConfirm={() => setQuoteConfirmed(true)}
            />
            <LinkTaskRow
              n="04"
              label="Comment and tag 2 frens"
              actionLabel="Open Post"
              actionHref={PINNED_TWEET_URL}
              placeholder="https://x.com/you/status/..."
              value={commentUrl}
              onChange={setCommentUrl}
              confirmed={commentConfirmed}
              onConfirm={() => setCommentConfirmed(true)}
            />

            <div style={{ marginBottom: "12px" }}>
              <p style={{ margin: "0 0 6px", ...microLabel }}>X (Twitter) username</p>
              <input placeholder="@yourhandle" value={twitterUsername} onChange={(e) => setTwitterUsername(e.target.value)} style={{ ...inputStyle, fontFamily: mono }} />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <p style={{ margin: "0 0 6px", ...microLabel }}>
                <span style={{ color: violet }}>05</span> Submit EVM address
              </p>
              <input placeholder="0x..." value={wallet} disabled={walletConfirmed} onChange={(e) => setWallet(e.target.value)} style={{ ...inputStyle, fontFamily: mono }} />
              {wallet && !isValidEvm(wallet) && <p style={{ fontSize: "0.66rem", color: "#d96b5a", margin: "6px 0 0" }}>Not a valid EVM address.</p>}
              {isValidEvm(wallet) && !walletConfirmed && (
                <button onClick={() => setWalletConfirmed(true)} style={confirmBtn}>
                  Confirm Wallet
                </button>
              )}
              {walletConfirmed && <p style={{ fontSize: "0.66rem", color: violet, margin: "8px 0 0" }}>Confirmed.</p>}
              <p style={{ fontSize: "0.62rem", color: "rgba(245,247,245,0.3)", margin: "8px 0 0", lineHeight: 1.4 }}>Never share your private key or seed phrase.</p>
            </div>

            {err && <p style={{ fontSize: "0.78rem", color: "#d96b5a", margin: "0 0 10px" }}>{err}</p>}

            <button
              disabled={!allValid || sending}
              onClick={submit}
              style={{
                width: "100%",
                fontFamily: mono,
                fontWeight: 600,
                fontSize: "0.72rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: allValid ? ink : "rgba(245,247,245,0.3)",
                background: allValid ? violet : "rgba(255,255,255,0.04)",
                border: `1px solid ${allValid ? violet : violetLine}`,
                borderRadius: "8px",
                padding: "14px",
                cursor: allValid && !sending ? "pointer" : "not-allowed",
              }}
            >
              {sending ? "Submitting..." : "Submit Application"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
