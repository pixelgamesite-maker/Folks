import { useEffect, useState } from "react";
import { body, display, faint, gold, goldLight, ink, line, mono, muted } from "../lib/theme";
import { supabase } from "../lib/supabase";
import { useAuth, extractXHandle, setPostAuthAction } from "../hooks/useAuth";
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
const EARLY_ROLE_CAP = 1000;

/**
 * Draft (in-progress tweet link / wallet input) is scoped per signed-in
 * user, not a single shared key — otherwise a second X account on the same
 * browser would see the first person's half-typed wallet address. There is
 * no separate "already submitted" flag in localStorage anymore: that's
 * checked live against the database (below), which is the only thing that
 *'s actually authoritative, and can't go stale or leak across accounts the
 * way a cached flag can.
 */
function draftKey(userId: string) {
  return `folks_early_role_draft_${userId}`;
}

/* ── Small icon for the connect button ── */
function ConnectIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" stroke={gold} strokeWidth={1.4} fill="none">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25z" strokeLinejoin="round" />
    </svg>
  );
}

function Card({ children, done, locked }: { children: React.ReactNode; done?: boolean; locked?: boolean }) {
  if (locked) return null;
  return (
    <div
      style={{
        border: `1px solid ${done ? `${gold}55` : line}`,
        borderRadius: "12px",
        padding: "14px",
        marginBottom: "10px",
        background: "rgba(46,125,74,0.03)",
        boxShadow: done ? `0 0 18px ${gold}10` : "none",
      }}
    >
      {children}
    </div>
  );
}

function CardHeader({ n, title, done }: { n: string; title: string; done: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
      <p style={{ margin: 0, ...microLabel, color: "rgba(245,247,245,0.6)" }}>
        <span style={{ color: gold }}>{n}</span> {title}
      </p>
      {done && (
        <span
          style={{
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            background: gold,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="8" height="6" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3.2 5.8L8 1" stroke={ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
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
    setPostAuthAction("early_role");
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

  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState("");
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [checkingSubmitted, setCheckingSubmitted] = useState(false);
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

  /* Draft persistence — only once we know who's signed in, keyed to them. */
  useEffect(() => {
    if (!auth.user) return;
    try {
      const saved = localStorage.getItem(draftKey(auth.user.id));
      if (saved) {
        const p = JSON.parse(saved);
        setTweetUrl(p.tweetUrl ?? "");
        setPosted(!!p.posted);
        setWallet(p.wallet ?? "");
      }
    } catch {}
  }, [auth.user?.id]);

  useEffect(() => {
    if (!auth.user) return;
    try {
      localStorage.setItem(draftKey(auth.user.id), JSON.stringify({ tweetUrl, posted, wallet }));
    } catch {}
  }, [tweetUrl, posted, wallet, auth.user?.id]);

  /* The real "already applied" check — live against the database, not a cached flag. */
  useEffect(() => {
    if (!auth.user) return;
    let cancelled = false;
    setCheckingSubmitted(true);
    (async () => {
      const { data, error } = await supabase
        .from(EARLY_ROLE_TABLE)
        .select("id, entry_number")
        .eq("user_id", auth.user!.id)
        .maybeSingle();
      if (!cancelled) {
        if (!error && data) {
          setAlreadySubmitted(true);
          if (data.entry_number) setEntryNumber(data.entry_number);
        }
        setCheckingSubmitted(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [auth.user?.id]);

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
        // Row already exists for this user_id or wallet — checked live above,
        // this just catches a race (two tabs submitting at once, etc).
        setErr("");
        setAlreadySubmitted(true);
      } else {
        setErr("Something went wrong. Please try again.");
      }
    } else {
      if (data?.entry_number) setEntryNumber(data.entry_number);
      setSuccess(true);
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
          maxWidth: "420px",
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

        {checkingSubmitted ? (
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <p style={{ fontFamily: mono, fontSize: "0.68rem", color: muted }}>Checking your status...</p>
          </div>
        ) : alreadySubmitted ? (
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
            <div style={{ marginBottom: "18px" }}>
              <p style={{ ...microLabel, color: gold, margin: "0 0 4px" }}>Early Role Application</p>
              <h2 style={{ fontFamily: display, fontSize: "1.4rem", fontWeight: 650, color: "#fff", margin: "0 0 4px", letterSpacing: "0.01em" }}>
                Claim Your Early Role
              </h2>
              <p style={{ fontFamily: body, fontSize: "0.82rem", color: muted, margin: "0 0 14px", lineHeight: 1.5 }}>
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

            {/* Card 1 — Connect X */}
            <Card done={c1}>
              <CardHeader n="01" title="Connect Your X Account" done={c1} />
              {!c1 ? (
                <>
                  <p style={{ margin: "0 0 10px", fontFamily: body, fontSize: "0.82rem", color: muted, lineHeight: 1.5 }}>
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
                    <ConnectIcon />
                    {connecting ? "Opening X..." : "Connect X Account"}
                  </button>
                  {authError && <p style={{ fontFamily: body, fontSize: "0.6rem", color: "#d96b5a", margin: "6px 0 0" }}>{authError}</p>}
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
            </Card>

            {/* Card 2 — Post a bullish tweet */}
            <Card done={c2} locked={!c1}>
              <CardHeader n="02" title="Post A Bullish Tweet" done={c2} />
              {!c2 ? (
                <>
                  <p style={{ margin: "0 0 8px", fontFamily: body, fontSize: "0.82rem", color: muted, lineHeight: 1.5 }}>
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
            </Card>

            {/* Card 3 — Wallet */}
            <Card done={c3} locked={!c2}>
              <CardHeader n="03" title="Register Your Wallet" done={c3} />
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
            </Card>

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
      <p style={{ fontFamily: body, fontSize: "0.9rem", color: muted, margin: 0, lineHeight: 1.6, maxWidth: "320px", marginLeft: "auto", marginRight: "auto" }}>
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
