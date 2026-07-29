import { useEffect, useRef, useState } from "react";
import { body, display, ink, mono, muted, violet, violetLight, violetLine } from "../lib/theme";
import { supabase } from "../lib/supabase";
import { useAuth, extractXHandle, setPostAuthAction } from "../hooks/useAuth";
import { isValidEvm, isValidUrl } from "../components/shared";

const X_HANDLE = "thefolkseth_";
/** Placeholder — client will drop the real pinned post ID/URL in later. */
const PINNED_TWEET_ID = "REPLACE_WITH_PINNED_TWEET_ID";
const PINNED_TWEET_URL = `https://x.com/${X_HANDLE}/status/${PINNED_TWEET_ID}`;
const FOLLOW_URL = `https://twitter.com/intent/follow?screen_name=${X_HANDLE}`;
const LIKE_URL = `https://twitter.com/intent/like?tweet_id=${PINNED_TWEET_ID}`;
const RETWEET_URL = `https://twitter.com/intent/retweet?tweet_id=${PINNED_TWEET_ID}`;

const APPLICATIONS_TABLE = "folks_whitelist_applications";
const STORAGE_KEY = "folks_wl_draft_v5";

/** Page background — lighter than the rest of the site on purpose, per feedback. */
const pageBg = "#15131c";
const cardBg = "rgba(255,255,255,0.03)";
const cardBorder = violetLine;

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(0,0,0,0.25)",
  border: `1px solid ${cardBorder}`,
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
  color: "rgba(245,247,245,0.42)",
};

const confirmBtn: React.CSSProperties = {
  marginTop: "10px",
  width: "100%",
  fontFamily: mono,
  fontSize: "0.62rem",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: ink,
  background: violet,
  border: "none",
  borderRadius: "7px",
  padding: "9px",
  cursor: "pointer",
};

function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ border: `1px solid ${cardBorder}`, borderRadius: "14px", padding: "18px", background: cardBg, ...style }}>
      {children}
    </div>
  );
}

/** Small placeholder avatar — swap for the real image whenever it's ready. */
function Avatar({ url, initial, size = 40 }: { url?: string | null; initial: string; size?: number }) {
  if (url) {
    return <img src={url} alt="" width={size} height={size} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />;
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(160deg,${violetLight},${violet})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: display,
        fontWeight: 700,
        fontSize: size * 0.42,
        color: ink,
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
}

function TaskAction({
  actionLabel,
  actionHref,
  done,
  ready,
  onOpen,
  onConfirm,
}: {
  actionLabel: string;
  actionHref: string;
  done: boolean;
  ready: boolean;
  onOpen: () => void;
  onConfirm: () => void;
}) {
  return (
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
        disabled={!ready || done}
        onClick={onConfirm}
        style={{
          flex: 1,
          fontFamily: mono,
          fontSize: "0.64rem",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: done || ready ? ink : "rgba(245,247,245,0.3)",
          background: done || ready ? violet : "rgba(255,255,255,0.05)",
          border: "none",
          borderRadius: "7px",
          padding: "9px",
          cursor: ready && !done ? "pointer" : "default",
        }}
      >
        {done ? "Done" : "Confirm"}
      </button>
    </div>
  );
}

export default function WhitelistPage() {
  const auth = useAuth();
  const handle = extractXHandle(auth.user);

  const [points, setPoints] = useState<number | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [followed, setFollowed] = useState(false);
  const [liked, setLiked] = useState(false);
  const [retweeted, setRetweeted] = useState(false);
  const [commentUrl, setCommentUrl] = useState("");
  const [wallet, setWallet] = useState("");
  const [walletConfirmed, setWalletConfirmed] = useState(false);

  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [checking, setChecking] = useState(true);
  const [err, setErr] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        setCommentUrl(p.commentUrl ?? "");
        setWallet(p.wallet ?? "");
      }
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ commentUrl, wallet }));
    } catch {}
  }, [commentUrl, wallet]);

  useEffect(() => {
    if (!auth.user) {
      setChecking(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const [{ data: profile }, { data: completions }, { data: application }] = await Promise.all([
        supabase.from("folks_profiles").select("points, avatar_url, referral_code").eq("id", auth.user!.id).maybeSingle(),
        supabase.from("folks_task_completions").select("task_id").eq("user_id", auth.user!.id),
        supabase.from(APPLICATIONS_TABLE).select("id").eq("user_id", auth.user!.id).maybeSingle(),
      ]);
      if (cancelled) return;
      if (profile) {
        setPoints(profile.points ?? 0);
        setAvatarUrl(profile.avatar_url ?? null);
        setReferralCode(profile.referral_code ?? null);
      }
      const map: Record<string, boolean> = {};
      (completions ?? []).forEach((r: any) => {
        map[r.task_id] = true;
      });
      setDone(map);
      if (application) setAlreadySubmitted(true);
      setChecking(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [auth.user]);

  async function refreshPoints() {
    if (!auth.user) return;
    const { data } = await supabase.from("folks_profiles").select("points").eq("id", auth.user.id).maybeSingle();
    if (data) setPoints(data.points ?? 0);
  }

  async function completeTask(taskId: string) {
    if (!auth.user || done[taskId]) return;
    setDone((prev) => ({ ...prev, [taskId]: true }));
    await supabase.from("folks_task_completions").insert({ task_id: taskId });
    refreshPoints();
  }

  async function connectX() {
    setConnecting(true);
    setPostAuthAction("whitelist");
    await auth.signInWithX();
  }

  const referralLink = referralCode ? `${typeof window !== "undefined" ? window.location.origin : ""}/whitelist?ref=${referralCode}` : "";

  function copyReferralLink() {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  const allValid = done.follow && done.like && done.retweet && done.comment && walletConfirmed && isValidEvm(wallet);

  async function submit() {
    if (!auth.user) return;
    if (!allValid) {
      setErr("Complete every task before submitting.");
      return;
    }
    setErr("");
    setSending(true);
    const { error } = await supabase.from(APPLICATIONS_TABLE).insert([
      {
        twitter_username: handle,
        wallet: wallet.trim(),
        comment_url: commentUrl.trim(),
      },
    ]);
    setSending(false);
    if (error) {
      if (error.code === "23505") {
        setAlreadySubmitted(true);
      } else {
        setErr("Something went wrong. Please try again.");
      }
      return;
    }
    setSuccess(true);
    setAlreadySubmitted(true);
  }

  const wrap: React.CSSProperties = { minHeight: "100vh", background: pageBg, color: "#fff", fontFamily: body, padding: "36px 20px 60px" };
  const inner: React.CSSProperties = { maxWidth: "440px", margin: "0 auto" };

  /* ── Not signed in ── */
  if (!auth.user) {
    return (
      <div style={wrap}>
        <div style={{ ...inner, textAlign: "center", paddingTop: "60px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "18px" }}>
            <Avatar url={null} initial="F" size={52} />
          </div>
          <p style={{ ...microLabel, color: violet, margin: "0 0 8px" }}>Whitelist &middot; No Cap</p>
          <p style={{ fontFamily: display, fontWeight: 700, fontSize: "1.3rem", margin: "0 0 10px" }}>Connect X To Continue</p>
          <p style={{ fontFamily: body, fontSize: "0.85rem", color: muted, margin: "0 0 24px", lineHeight: 1.55 }}>
            Sign in with X to see your tasks and start earning points toward the Whitelist.
          </p>
          <button
            onClick={connectX}
            disabled={connecting}
            style={{
              width: "100%",
              fontFamily: body,
              fontSize: "0.74rem",
              fontWeight: 700,
              color: connecting ? "rgba(245,247,245,0.4)" : ink,
              background: connecting ? "rgba(255,255,255,0.04)" : "#fff",
              border: `1px solid ${cardBorder}`,
              borderRadius: "8px",
              padding: "13px",
              cursor: connecting ? "wait" : "pointer",
            }}
          >
            {connecting ? "Opening X..." : "Connect X Account"}
          </button>
        </div>
      </div>
    );
  }

  if (checking) {
    return (
      <div style={wrap}>
        <div style={{ ...inner, textAlign: "center", paddingTop: "60px" }}>
          <p style={{ fontFamily: mono, fontSize: "0.7rem", color: muted }}>Loading your tasks...</p>
        </div>
      </div>
    );
  }

  /* ── Already applied / just applied ── */
  if (success || alreadySubmitted) {
    return (
      <div style={wrap}>
        <div style={{ ...inner, textAlign: "center", paddingTop: "50px" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: violet, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
            <svg width="20" height="16" viewBox="0 0 22 18" fill="none">
              <path d="M2 9L8 15L20 2" stroke={ink} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p style={{ ...microLabel, color: violet, margin: "0 0 8px" }}>Application Received</p>
          <p style={{ fontFamily: display, fontWeight: 700, fontSize: "1.4rem", margin: "0 0 10px" }}>You're on the list.</p>
          <p style={{ fontFamily: body, fontSize: "0.85rem", color: muted, lineHeight: 1.6, margin: 0 }}>
            {points !== null ? `${points} points earned. ` : ""}Selected wallets will be notified before mint.
          </p>
        </div>
      </div>
    );
  }

  /* ── Main page ── */
  return (
    <div style={wrap}>
      <div style={inner}>
        {/* Inline profile menu */}
        <div ref={menuRef} style={{ position: "relative", marginBottom: "22px" }}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: "14px",
              padding: "10px 14px",
              cursor: "pointer",
            }}
          >
            <Avatar url={avatarUrl} initial={handle ? handle[0].toUpperCase() : "F"} size={38} />
            <div style={{ flex: 1, textAlign: "left" }}>
              <p style={{ margin: 0, fontFamily: display, fontSize: "0.86rem", fontWeight: 600, color: "#fff" }}>@{handle}</p>
              <p style={{ margin: 0, ...microLabel }}>Whitelist Applicant</p>
            </div>
            <span style={{ fontFamily: mono, fontSize: "0.78rem", fontWeight: 700, color: violet }}>{(points ?? 0).toLocaleString()} pts</span>
          </button>

          {menuOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                background: "#1c1926",
                border: `1px solid ${cardBorder}`,
                borderRadius: "10px",
                overflow: "hidden",
                zIndex: 10,
                minWidth: "160px",
              }}
            >
              <button
                onClick={() => auth.signOut()}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 14px",
                  background: "none",
                  border: "none",
                  color: "rgba(245,247,245,0.7)",
                  fontFamily: body,
                  fontSize: "0.76rem",
                  cursor: "pointer",
                }}
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        {/* Points + referral */}
        <Panel style={{ marginBottom: "22px" }}>
          <p style={{ ...microLabel, margin: "0 0 4px", textAlign: "center" }}>Points Balance</p>
          <p style={{ fontFamily: display, fontSize: "2.4rem", fontWeight: 700, color: violet, margin: "0 0 18px", textAlign: "center" }}>
            {(points ?? 0).toLocaleString()}
          </p>
          <div style={{ height: "1px", background: cardBorder, margin: "0 0 16px" }} />
          <p style={{ ...microLabel, margin: "0 0 8px" }}>Your Referral Link</p>
          <div style={{ display: "flex", gap: "8px" }}>
            <div
              style={{
                flex: 1,
                background: "rgba(0,0,0,0.25)",
                borderRadius: "8px",
                padding: "10px 12px",
                fontFamily: mono,
                fontSize: "0.72rem",
                color: "#fff",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {referralLink || "generating..."}
            </div>
            <button
              onClick={copyReferralLink}
              disabled={!referralLink}
              style={{
                background: violet,
                color: ink,
                border: "none",
                borderRadius: "8px",
                padding: "0 16px",
                fontFamily: mono,
                fontSize: "0.68rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </Panel>

        {/* Follow — standalone, one-time */}
        <div style={{ marginBottom: "22px" }}>
          <p style={{ ...microLabel, color: violet, margin: "0 0 10px" }}>Step One</p>
          <Panel>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
              <div>
                <p style={{ margin: 0, fontFamily: display, fontSize: "0.98rem", fontWeight: 600, color: "#fff" }}>Follow Folks</p>
                <span
                  style={{
                    fontFamily: mono,
                    fontSize: "0.56rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "rgba(245,247,245,0.4)",
                    border: `1px solid ${cardBorder}`,
                    borderRadius: "999px",
                    padding: "2px 8px",
                    display: "inline-block",
                    marginTop: "4px",
                  }}
                >
                  One-Time
                </span>
              </div>
              <span style={{ fontFamily: mono, fontSize: "0.72rem", fontWeight: 700, color: done.follow ? violet : "rgba(245,247,245,0.35)" }}>+10 pts</span>
            </div>
            <TaskAction
              actionLabel="Follow"
              actionHref={FOLLOW_URL}
              done={!!done.follow}
              ready={followed}
              onOpen={() => setFollowed(true)}
              onConfirm={() => completeTask("follow")}
            />
          </Panel>
        </div>

        {/* Like / Retweet / Comment — vertical line */}
        <p style={{ ...microLabel, color: violet, margin: "0 0 10px" }}>Then Complete These</p>
        <div style={{ position: "relative", marginBottom: "22px" }}>
          <div style={{ position: "absolute", left: "13px", top: "14px", bottom: "14px", width: "1px", background: cardBorder }} />

          {[
            { n: "like", label: "Like the pinned post", pts: 25, actionLabel: "Open Post", href: LIKE_URL, kind: "click" as const },
            { n: "retweet", label: "Retweet the pinned post", pts: 25, actionLabel: "Retweet", href: RETWEET_URL, kind: "click" as const },
            { n: "comment", label: "Comment and tag 2 frens", pts: 50, actionLabel: "Open Post", href: PINNED_TWEET_URL, kind: "link" as const },
          ].map((task, i) => (
            <div key={task.n} style={{ display: "flex", gap: "14px", marginBottom: i < 2 ? "14px" : 0 }}>
              <div
                style={{
                  width: "27px",
                  height: "27px",
                  borderRadius: "50%",
                  border: `1px solid ${done[task.n] ? violet : cardBorder}`,
                  background: done[task.n] ? violet : pageBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  zIndex: 1,
                }}
              >
                {done[task.n] ? (
                  <svg width="10" height="8" viewBox="0 0 9 7" fill="none">
                    <path d="M1 3.5L3.2 5.8L8 1" stroke={ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span style={{ fontFamily: mono, fontSize: "0.6rem", color: "rgba(245,247,245,0.4)" }}>{i + 2}</span>
                )}
              </div>
              <Panel style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <p style={{ margin: 0, fontFamily: display, fontSize: "0.92rem", fontWeight: 600, color: "#fff" }}>{task.label}</p>
                  <span style={{ fontFamily: mono, fontSize: "0.68rem", fontWeight: 700, color: done[task.n] ? violet : "rgba(245,247,245,0.35)" }}>
                    +{task.pts} pts
                  </span>
                </div>
                {task.kind === "click" ? (
                  <TaskAction
                    actionLabel={task.actionLabel}
                    actionHref={task.href}
                    done={!!done[task.n]}
                    ready={task.n === "like" ? liked : retweeted}
                    onOpen={() => (task.n === "like" ? setLiked(true) : setRetweeted(true))}
                    onConfirm={() => completeTask(task.n)}
                  />
                ) : (
                  <>
                    <a
                      href={task.href}
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
                      {task.actionLabel}
                    </a>
                    <input placeholder="https://x.com/you/status/..." value={commentUrl} disabled={!!done.comment} onChange={(e) => setCommentUrl(e.target.value)} style={inputStyle} />
                    {commentUrl && !isValidUrl(commentUrl) && <p style={{ fontSize: "0.66rem", color: "#d96b5a", margin: "6px 0 0" }}>Needs a valid https:// link.</p>}
                    {isValidUrl(commentUrl) && !done.comment && (
                      <button onClick={() => completeTask("comment")} style={confirmBtn}>
                        Confirm Link
                      </button>
                    )}
                    {done.comment && <p style={{ fontSize: "0.66rem", color: violet, margin: "8px 0 0" }}>Confirmed.</p>}
                  </>
                )}
              </Panel>
            </div>
          ))}
        </div>

        {/* Wallet + submit */}
        <p style={{ ...microLabel, color: violet, margin: "0 0 10px" }}>Finally</p>
        <Panel style={{ marginBottom: "16px" }}>
          <p style={{ margin: "0 0 8px", fontFamily: display, fontSize: "0.92rem", fontWeight: 600, color: "#fff" }}>Submit your wallet</p>
          <input placeholder="0x..." value={wallet} disabled={walletConfirmed} onChange={(e) => setWallet(e.target.value)} style={{ ...inputStyle, fontFamily: mono }} />
          {wallet && !isValidEvm(wallet) && <p style={{ fontSize: "0.66rem", color: "#d96b5a", margin: "6px 0 0" }}>Not a valid EVM address.</p>}
          {isValidEvm(wallet) && !walletConfirmed && (
            <button onClick={() => setWalletConfirmed(true)} style={confirmBtn}>
              Confirm Wallet
            </button>
          )}
          {walletConfirmed && <p style={{ fontSize: "0.66rem", color: violet, margin: "8px 0 0" }}>Confirmed.</p>}
          <p style={{ fontSize: "0.62rem", color: "rgba(245,247,245,0.3)", margin: "8px 0 0", lineHeight: 1.4 }}>Never share your private key or seed phrase.</p>
        </Panel>

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
            background: allValid ? violet : "rgba(255,255,255,0.05)",
            border: `1px solid ${allValid ? violet : cardBorder}`,
            borderRadius: "8px",
            padding: "14px",
            cursor: allValid && !sending ? "pointer" : "not-allowed",
          }}
        >
          {sending ? "Submitting..." : "Submit Application"}
        </button>
      </div>
    </div>
  );
}
