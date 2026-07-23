import { useEffect, useState } from "react";
import { body, display, faint, gold, goldLight, ink, line, mono, muted } from "../lib/theme";
import { supabase } from "../lib/supabase";
import { useAuth, extractXHandle, setReopenFlag } from "../hooks/useAuth";
import {
  blurInp,
  FolksSeal,
  focusInp,
  inputStyle,
  isValidEvm,
  isValidTweetUrl,
  microLabel,
} from "./shared";

const INTENT_TEXT = "Feeling bullish on @thefolkseth_ — locking in my Early Role.";
const INTENT_URL = `https://twitter.com/intent/tweet?text=${encodeURIComponent(INTENT_TEXT)}`;

/** Renamed from folks_whitelist — see folks_rename_early_role.sql. */
const EARLY_ROLE_TABLE = "folks_early_role";

const STORAGE_KEY = "folks_early_role_v1";
const SUBMITTED_KEY = "folks_early_role_submitted";
const EARLY_ROLE_CAP = 1000;

/* ── Small step icons — plain geometric marks, no emoji ── */
function StepIcon({ kind }: { kind: "connect" | "post" | "wallet" }) {
  const common = { width: 16, height: 16, stroke: gold, strokeWidth: 1.4, fill: "none" } as const;
  if (kind === "connect")
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25z" strokeLinejoin="round" />
      </svg>
    );
  if (kind === "post")
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <path d="M4 4l16 8-16 8 4-8-4-8z" strokeLinejoin="round" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" {...common}>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 9h18" />
      <circle cx="16" cy="13.5" r="1.1" fill={gold} stroke="none" />
    </svg>
  );
}

function StepShell({
  index,
  total,
  title,
  subtitle,
  done,
  locked,
  children,
}: {
  index: number;
  total: number;
  title: string;
  subtitle: string;
  done: boolean;
  locked: boolean;
  children: React.ReactNode;
}) {
  if (locked) return null;
  return (
    <div
      style={{
        border: `1px solid ${done ? `${gold}55` : line}`,
        borderRadius: "10px",
        padding: "16px 16px 15px",
        marginBottom: "12px",
        background: done ? "linear-gradient(160deg,#0f1710 0%,#0a0d0a 100%)" : "linear-gradient(160deg,#0d100d 0%,#0a0d0a 100%)",
        animation: "folksFadeUp 0.45s ease both",
        boxShadow: done ? `0 0 22px ${gold}12` : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
        <div
          style={{
            width: "26px",
            height: "26px",
            borderRadius: "50%",
            border: `1px solid ${done ? gold : line}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            background: done ? gold : "transparent",
          }}
        >
          {done ? (
            <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
              <path d="M1 4.5L4 7.5L10 1" stroke={ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <span style={{ fontFamily: mono, fontSize: "0.66rem", color: gold }}>{index}</span>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontFamily: display, fontSize: "0.98rem", fontWeight: 600, color: "#fff" }}>{title}</p>
          <p style={{ margin: 0, fontFamily: mono, fontSize: "0.56rem", letterSpacing: "0.1em", textTransform: "uppercase", color: faint }}>
            {subtitle} · Step {index} of {total}
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}

const confirmBtn: React.CSSProperties = {
  marginTop: "10px",
  width: "100%",
  background: `${gold}1e`,
  color: gold,
  border: `1px solid ${gold}44`,
  borderRadius: "5px",
  padding: "9px",
  fontFamily: body,
  fontSize: "0.66rem",
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  cursor: "pointer",
  transition: "all 0.2s",
};

export default function EarlyRoleModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const auth = useAuth();
  const handle = extractXHandle(auth.user);
  const [connecting, setConnecting] = useState(false);
  const [authError, setAuthError] = useState("");

  async function connectX() {
    setAuthError("");
    setConnecting(true);
    setReopenFlag();
    const error = await auth.signInWithX();
    if (error) {
      setConnecting(false);
      setAuthError("Could not open X sign-in. Try again.");
    }
    // On success the browser navigates to X, so nothing else to do here.
  }

  const [tweetUrl, setTweetUrl] = useState("");
  const [posted, setPosted] = useState(false);
  const [composeOpened, setComposeOpened] = useState(false);

  const [wallet, setWallet] = useState("");
  const [walletConfirmed, setWalletConfirmed] = useState(false);

  const [ready, setReady] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState("");
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [claimedCount, setClaimedCount] = useState<number | null>(null);
  const [full, setFull] = useState(false);
  const [entryNumber, setEntryNumber] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("folks_early_role_counter").select("count").eq("id", 1).maybeSingle();
      if (!cancelled && data) {
        setClaimedCount(data.count);
        if (data.count >= EARLY_ROLE_CAP) setFull(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        setTweetUrl(p.tweetUrl ?? "");
        setPosted(!!p.posted);
        setWallet(p.wallet ?? "");
      }
      if (localStorage.getItem(SUBMITTED_KEY) === "true") setAlreadySubmitted(true);
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tweetUrl, posted, wallet }));
    } catch {}
  }, [tweetUrl, posted, wallet, ready]);

  useEffect(() => {
    if (!auth.user) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from(EARLY_ROLE_TABLE)
        .select("id")
        .eq("user_id", auth.user!.id)
        .maybeSingle();
      if (!cancelled && !error && data) {
        setAlreadySubmitted(true);
        try {
          localStorage.setItem(SUBMITTED_KEY, "true");
        } catch {}
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [auth.user]);

  const c1 = !!auth.user;
  const c2 = posted && isValidTweetUrl(tweetUrl);
  const c3 = walletConfirmed && isValidEvm(wallet);
  const allDone = c1 && c2 && c3;

  async function submit() {
    if (!allDone) {
      setErr("Complete every step before submitting.");
      return;
    }
    if (alreadySubmitted) {
      setErr("You have already submitted an application.");
      return;
    }
    if (full) {
      setErr("Early Role is full.");
      return;
    }
    setErr("");
    setSending(true);
    const { data, error } = await supabase
      .from(EARLY_ROLE_TABLE)
      .insert([{ twitter: handle.trim(), tweet_url: tweetUrl.trim(), wallet: wallet.trim() }])
      .select("entry_number")
      .maybeSingle();
    setSending(false);
    if (error) {
      if (error.message?.includes("FOLKSLIST_FULL")) {
        setFull(true);
        setClaimedCount(EARLY_ROLE_CAP);
      } else if (error.code === "23505") {
        // Row already exists for this user_id or wallet — they've applied before,
        // localStorage just didn't know about it (cleared, different device, etc).
        setErr("");
        setAlreadySubmitted(true);
        try {
          localStorage.setItem(SUBMITTED_KEY, "true");
        } catch {}
      } else {
        setErr("Something went wrong. Please try again.");
      }
    } else {
      if (data?.entry_number) setEntryNumber(data.entry_number);
      setSuccess(true);
      try {
        localStorage.setItem(SUBMITTED_KEY, "true");
      } catch {}
      setAlreadySubmitted(true);
    }
  }

  function close() {
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
        if (e.target === e.currentTarget) close();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.88)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          maxHeight: "94vh",
          overflowY: "auto",
          background: "#0a0d0a",
          border: `1px solid ${line}`,
          borderRadius: "14px",
          padding: "26px 20px 22px",
          animation: "folksModalIn 0.3s ease both",
          position: "relative",
          boxShadow: "0 40px 80px rgba(0,0,0,0.9), 0 0 60px rgba(46,125,74,0.08)",
        }}
      >
        <button
          onClick={close}
          style={{
            position: "absolute",
            top: "14px",
            right: "16px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "rgba(245,247,245,0.25)",
            fontSize: "1.1rem",
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        {alreadySubmitted ? (
          <StatusView
            seal
            eyebrow="Already Registered"
            title="Your Role Is Secured."
            body={
              entryNumber
                ? `You're Early Role #${entryNumber}. Verified wallets will be added ahead of mint.`
                : "Your application has been saved. Verified wallets will be added ahead of mint."
            }
            onClose={close}
          />
        ) : success ? (
          <StatusView
            seal
            eyebrow="Application Sent"
            title="You Are Under Review."
            body={
              entryNumber
                ? `You're Early Role #${entryNumber} of ${EARLY_ROLE_CAP}. Verified wallets will be added ahead of mint.`
                : "Verified wallets will be added ahead of mint."
            }
            onClose={close}
          />
        ) : full ? (
          <StatusView
            seal
            eyebrow="Early Role Full"
            title="All 1,000 Slots Are Claimed."
            body="Early Role has reached capacity. Get Whitelisted is still open if you want in."
            onClose={close}
          />
        ) : (
          <>
            <div style={{ marginBottom: "20px" }}>
              <p style={{ ...microLabel, color: gold, margin: "0 0 4px" }}>Early Role Application</p>
              <h2 style={{ fontFamily: display, fontSize: "1.44rem", fontWeight: 650, color: "#fff", margin: "0 0 4px", letterSpacing: "0.01em" }}>
                Claim Your Early Role
              </h2>
              <p style={{ fontFamily: display, fontStyle: "italic", fontSize: "0.82rem", color: muted, margin: "0 0 14px", lineHeight: 1.5 }}>
                Connect your X account, post a bullish tweet, then register your wallet. Capped at 1,000.
              </p>
              <div style={{ height: "2px", background: `${gold}18`, borderRadius: "2px", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    borderRadius: "2px",
                    background: `linear-gradient(90deg,${gold},${goldLight})`,
                    width: `${([c1, c2, c3].filter(Boolean).length / 3) * 100}%`,
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
              <p style={{ fontFamily: mono, fontSize: "0.6rem", color: `${gold}99`, margin: "6px 0 0", letterSpacing: "0.06em" }}>
                {[c1, c2, c3].filter(Boolean).length} of 3 steps complete
                {claimedCount !== null && ` · ${claimedCount} / ${EARLY_ROLE_CAP} claimed`}
              </p>
            </div>

            {/* Step 1 — Connect X */}
            <StepShell index={1} total={3} title="Connect Your X Account" subtitle="Identity" done={c1} locked={false}>
              {!c1 ? (
                <>
                  <p style={{ margin: "0 0 10px", fontFamily: display, fontStyle: "italic", fontSize: "0.82rem", color: muted, lineHeight: 1.5 }}>
                    Sign in with X to verify it's really you. This opens X's own login screen.
                  </p>
                  <button
                    onClick={connectX}
                    disabled={connecting}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      width: "100%",
                      background: connecting ? "rgba(255,255,255,0.02)" : "#fff",
                      border: `1px solid ${line}`,
                      borderRadius: "5px",
                      padding: "10px",
                      color: connecting ? "rgba(245,247,245,0.4)" : "#0a0a08",
                      fontFamily: body,
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      cursor: connecting ? "wait" : "pointer",
                    }}
                  >
                    <StepIcon kind="connect" />
                    {connecting ? "Opening X..." : "Connect X Account"}
                  </button>
                  {authError && (
                    <p style={{ fontFamily: body, fontSize: "0.6rem", color: "#d96b5a", margin: "6px 0 0" }}>{authError}</p>
                  )}
                </>
              ) : (
                <>
                  <p style={{ fontFamily: mono, fontSize: "0.66rem", color: gold, margin: 0 }}>Connected as @{handle}</p>
                  <button
                    onClick={auth.signOut}
                    style={{
                      marginTop: "6px",
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      fontFamily: body,
                      fontSize: "0.6rem",
                      color: faint,
                      textDecoration: "underline",
                    }}
                  >
                    Not you? Disconnect
                  </button>
                </>
              )}
            </StepShell>

            {/* Step 2 — Post a bullish tweet */}
            <StepShell index={2} total={3} title="Post A Bullish Tweet" subtitle="Verification" done={c2} locked={!c1}>
              {!c2 ? (
                <>
                  <p style={{ margin: "0 0 8px", fontFamily: display, fontStyle: "italic", fontSize: "0.82rem", color: muted, lineHeight: 1.5 }}>
                    Post something bullish about Folks on X, then paste the link below.
                  </p>
                  <a
                    href={INTENT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setComposeOpened(true)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      width: "100%",
                      background: "rgba(255,255,255,0.03)",
                      border: `1px solid ${line}`,
                      borderRadius: "5px",
                      padding: "9px",
                      color: "#fff",
                      fontFamily: body,
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textDecoration: "none",
                      marginBottom: "8px",
                    }}
                  >
                    <StepIcon kind="post" />
                    {composeOpened ? "Reopen Composer" : "Compose Tweet"}
                  </a>
                  <p style={{ ...microLabel, margin: "0 0 6px" }}>Link to your post</p>
                  <input
                    type="url"
                    placeholder="https://x.com/yourhandle/status/..."
                    value={tweetUrl}
                    onChange={(e) => setTweetUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && isValidTweetUrl(tweetUrl)) setPosted(true);
                    }}
                    style={inputStyle}
                    onFocus={focusInp}
                    onBlur={blurInp}
                  />
                  {tweetUrl && !isValidTweetUrl(tweetUrl) && (
                    <p style={{ fontFamily: body, fontSize: "0.6rem", color: "#d96b5a", margin: "5px 0 0" }}>
                      Needs a valid x.com or twitter.com link.
                    </p>
                  )}
                  {isValidTweetUrl(tweetUrl) && (
                    <button onClick={() => setPosted(true)} style={confirmBtn}>
                      Confirm Post
                    </button>
                  )}
                </>
              ) : (
                <p style={{ fontFamily: mono, fontSize: "0.66rem", color: gold, margin: 0 }}>Post confirmed</p>
              )}
            </StepShell>

            {/* Step 3 — Wallet */}
            <StepShell index={3} total={3} title="Register Your Wallet" subtitle="Early Role" done={c3} locked={!c2}>
              {!c3 ? (
                <>
                  <p style={{ ...microLabel, margin: "0 0 6px" }}>EVM address</p>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={wallet}
                    onChange={(e) => setWallet(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && isValidEvm(wallet)) setWalletConfirmed(true);
                    }}
                    style={inputStyle}
                    onFocus={focusInp}
                    onBlur={blurInp}
                  />
                  {wallet && !isValidEvm(wallet) && (
                    <p style={{ fontFamily: body, fontSize: "0.6rem", color: "#d96b5a", margin: "5px 0 0" }}>Invalid address.</p>
                  )}
                  {isValidEvm(wallet) && (
                    <button onClick={() => setWalletConfirmed(true)} style={confirmBtn}>
                      Confirm Wallet
                    </button>
                  )}
                  <p style={{ fontFamily: body, fontSize: "0.58rem", color: faint, margin: "8px 0 0", lineHeight: 1.4 }}>
                    Never share private keys or seed phrases.
                  </p>
                </>
              ) : (
                <p style={{ fontFamily: mono, fontSize: "0.66rem", color: gold, margin: 0 }}>Wallet registered</p>
              )}
            </StepShell>

            {err && <p style={{ fontFamily: body, fontSize: "0.78rem", color: "#d96b5a", margin: "4px 0 10px", fontWeight: 500 }}>{err}</p>}

            <button
              onClick={submit}
              disabled={sending || !allDone}
              style={{
                width: "100%",
                background: allDone ? `linear-gradient(180deg,${goldLight},${gold})` : "rgba(255,255,255,0.04)",
                color: allDone ? ink : "rgba(245,247,245,0.2)",
                border: `1px solid ${allDone ? gold : "rgba(255,255,255,0.06)"}`,
                borderRadius: "6px",
                padding: "15px",
                fontFamily: body,
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                cursor: allDone && !sending ? "pointer" : "not-allowed",
                transition: "all 0.3s ease",
                boxShadow: allDone ? `0 8px 24px ${gold}30` : "none",
                marginTop: "4px",
              }}
            >
              {sending ? "Submitting..." : allDone ? "Claim Early Role" : "Complete every step to unlock"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function StatusView({
  eyebrow,
  title,
  body,
  onClose,
  seal,
}: {
  eyebrow: string;
  title: string;
  body: string;
  onClose: () => void;
  seal?: boolean;
}) {
  return (
    <div style={{ textAlign: "center", padding: "34px 0 8px" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
        {seal ? (
          <FolksSeal size={50} />
        ) : (
          <div
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              background: gold,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="20" height="16" viewBox="0 0 22 18" fill="none">
              <path d="M2 9L8 15L20 2" stroke={ink} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>
      <p style={{ fontFamily: mono, fontSize: "0.58rem", letterSpacing: "0.22em", textTransform: "uppercase", color: gold, margin: "0 0 6px" }}>
        {eyebrow}
      </p>
      <h2 style={{ fontFamily: display, fontSize: "1.5rem", fontWeight: 650, color: "#fff", margin: "0 0 10px" }}>{title}</h2>
      <p style={{ fontFamily: display, fontStyle: "italic", fontSize: "0.9rem", color: muted, margin: 0, lineHeight: 1.6, maxWidth: "320px", marginLeft: "auto", marginRight: "auto" }}>
        {body}
      </p>
      <button
        onClick={onClose}
        style={{
          marginTop: "24px",
          fontFamily: body,
          fontSize: "0.66rem",
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: ink,
          background: gold,
          border: "none",
          borderRadius: "5px",
          padding: "11px 26px",
          cursor: "pointer",
        }}
      >
        Back To Home
      </button>
    </div>
  );
}
