import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { body, display, goldDeep, ink, mono, muted, violet, violetLight, violetLine } from "../lib/theme";
import { supabase } from "../lib/supabase";
import { useAuth, extractXHandle, setPostAuthAction, setReferralCode } from "../hooks/useAuth";
import { isValidEvm, isValidUrl, FolksSeal } from "../components/shared";

const X_HANDLE = "thefolksxyz";
/** Real pinned post — swap this ID whenever the client changes which post is pinned.
 * task_id for Like/Retweet/Comment stays the fixed "like"/"retweet"/"comment"
 * string (folks_task_completions.task_id has an FK to folks_task_definitions,
 * which only has those five fixed rows — it can't take arbitrary values).
 * Instead, completions are scoped by (task_id, tweet_id) in the DB, so
 * passing this tweet_id on every Like/Retweet/Comment completion is what
 * makes swapping this ID reset those three tasks for everyone — see
 * doneKey() and completeTask() below, and migration
 * 3_folks_task_completions_tweet_id.sql. */
const PINNED_TWEET_ID = "2095514146590564457";
const PINNED_TWEET_URL = `https://x.com/${X_HANDLE}/status/${PINNED_TWEET_ID}`;
const FOLLOW_URL = `https://twitter.com/intent/follow?screen_name=${X_HANDLE}`;
const LIKE_URL = `https://twitter.com/intent/like?tweet_id=${PINNED_TWEET_ID}`;
const RETWEET_URL = `https://twitter.com/intent/retweet?tweet_id=${PINNED_TWEET_ID}`;

/** Composite key used only for the client-side `done` lookup map — matches
 * (task_id, tweet_id) so a task shows "done" only for the tweet it was
 * actually completed on. Not a DB value; tweetId defaults to "" for tasks
 * that aren't tied to a specific tweet (follow, bullish_post), matching the
 * DB column's default. */
function doneKey(taskId: string, tweetId: string = "") {
  return `${taskId}::${tweetId}`;
}
/** Deliberately no pre-filled text — X flags accounts whose followers all
 * post identical wording as bot-like. People write their own post; the
 * only requirement is that it mentions Folks. */
const BULLISH_COMPOSE_URL = "https://twitter.com/intent/tweet";

const COUNTDOWN_SECS = 30;
const pageBg = "#15131c";
const cardBg = "rgba(255,255,255,0.03)";
const cardBorder = violetLine;

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(0,0,0,0.25)",
  border: `1px solid ${cardBorder}`,
  borderRadius: "8px",
  padding: "10px 12px",
  fontSize: "0.82rem",
  color: "#fff",
  fontFamily: body,
  outline: "none",
  boxSizing: "border-box",
};

const microLabel: React.CSSProperties = {
  fontFamily: mono,
  fontSize: "0.6rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "rgba(245,247,245,0.42)",
};

/** Fixed reference point the 48h cycle counts from — arbitrary, just has to
 * be the same for everyone. Re-anchored to a recent date rather than one
 * from months ago, since the remaining time on any given day is otherwise
 * unpredictable and impossible to sanity-check by eye (an old anchor can
 * make a genuine 48h cycle coincidentally look capped at 24h on some days
 * — that's what happened here, not an actual bug in the cycle length).
 * Change ROTATION_HOURS here if this ever needs to be a different length. */
const ROTATION_ANCHOR_MS = Date.UTC(2026, 6, 31, 0, 0, 0);
const ROTATION_HOURS = 48;
const ROTATION_MS = ROTATION_HOURS * 60 * 60 * 1000;

function msUntilNextRotation() {
  const elapsed = Date.now() - ROTATION_ANCHOR_MS;
  const msIntoCycle = ((elapsed % ROTATION_MS) + ROTATION_MS) % ROTATION_MS;
  return ROTATION_MS - msIntoCycle;
}
function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function ListContainer({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ border: `1px solid ${cardBorder}`, borderRadius: "14px", overflow: "hidden", background: cardBg }}>
      {children}
    </div>
  );
}
function ListRow({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return <div style={{ padding: "14px 16px", borderBottom: last ? "none" : `1px solid ${cardBorder}` }}>{children}</div>;
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

/** Compact status/action control shared by every row's right-hand side. */
function RowAction({
  phase,
  secs,
  actionLabel,
  onStart,
  failReason,
}: {
  phase: "idle" | "counting" | "checking" | "failed" | "done" | "locked";
  secs: number;
  actionLabel: string;
  onStart: () => void;
  failReason?: string;
}) {
  if (phase === "locked") {
    return (
      <span
        style={{
          display: "inline-block",
          padding: "7px 14px",
          borderRadius: "6px",
          background: "rgba(255,255,255,0.04)",
          color: "rgba(245,247,245,0.3)",
          fontFamily: mono,
          fontSize: "0.62rem",
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          cursor: "not-allowed",
        }}
      >
        Locked
      </span>
    );
  }
  if (phase === "done") {
    return (
      <span
        style={{
          display: "inline-block",
          padding: "7px 14px",
          borderRadius: "6px",
          background: goldDeep,
          color: "#fff",
          fontFamily: mono,
          fontSize: "0.62rem",
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          cursor: "not-allowed",
        }}
      >
        Completed
      </span>
    );
  }
  if (phase === "counting") {
    return <span style={{ fontFamily: mono, fontSize: "0.66rem", fontWeight: 700, color: violet }}>{secs}s</span>;
  }
  if (phase === "checking") {
    return <span style={{ fontFamily: mono, fontSize: "0.62rem", color: violet }}>Checking...</span>;
  }
  return (
    <div style={{ textAlign: "right" }}>
      <button
        onClick={onStart}
        style={{
          fontFamily: mono,
          fontSize: "0.62rem",
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: ink,
          background: violet,
          border: "none",
          borderRadius: "6px",
          padding: "7px 14px",
          cursor: "pointer",
        }}
      >
        {phase === "failed" ? "Retry" : actionLabel}
      </button>
      {phase === "failed" && failReason && (
        <p style={{ fontSize: "0.58rem", color: "#d96b5a", margin: "4px 0 0", maxWidth: "120px" }}>{failReason}</p>
      )}
    </div>
  );
}

/** Click → opens the link → counts down → done. verifyMode is optional and
 * currently unused by any task (Follow/Like/Retweet/Comment all just award
 * on timer completion, cost-driven decision) — the plumbing to re-enable a
 * real X check on any of them is still here, just pass verifyMode +
 * targetTweetId again if that's ever worth turning back on for one. */
function CountdownRow({
  label,
  points,
  actionLabel,
  actionHref,
  done,
  onComplete,
  verifyMode,
  targetTweetId,
  locked,
  last,
}: {
  label: string;
  points: number;
  actionLabel: string;
  actionHref: string;
  done: boolean;
  onComplete: () => void;
  verifyMode?: "like" | "retweet" | "reply";
  targetTweetId?: string;
  locked?: boolean;
  last?: boolean;
}) {
  const [phase, setPhase] = useState<"idle" | "counting" | "checking" | "failed">("idle");
  const [secs, setSecs] = useState(COUNTDOWN_SECS);
  const [failReason, setFailReason] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  async function finish() {
    if (!verifyMode) {
      onComplete();
      return;
    }
    setPhase("checking");
    const { data, error } = await supabase.functions.invoke("verify-post", { body: { mode: verifyMode, targetTweetId } });
    if (error || !data?.verified) {
      setFailReason(data?.reason || "Couldn't verify yet.");
      setPhase("failed");
      return;
    }
    onComplete();
  }

  function start() {
    if (locked || done || phase === "counting" || phase === "checking") return;
    window.open(actionHref, "_blank");
    setPhase("counting");
    setSecs(COUNTDOWN_SECS);
    timerRef.current = setInterval(() => {
      setSecs((s) => {
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          finish();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  return (
    <ListRow last={last}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
        <div>
          <p style={{ margin: 0, fontFamily: display, fontSize: "0.9rem", fontWeight: 600, color: locked ? "rgba(245,247,245,0.35)" : "#fff" }}>{label}</p>
          <p style={{ margin: "2px 0 0", fontFamily: mono, fontSize: "0.62rem", color: done ? violet : "rgba(245,247,245,0.4)" }}>+{points} pts</p>
        </div>
        <RowAction phase={done ? "done" : locked ? "locked" : phase} secs={secs} actionLabel={actionLabel} onStart={start} failReason={failReason} />
      </div>
    </ListRow>
  );
}

/** The one task that needs a submitted link — an arbitrary self-authored
 * post, not tied to one fixed tweet, so it can't be auto-detected the way
 * Like/Retweet/Comment can. */
function BullishPostRow({ done, onComplete, last }: { done: boolean; onComplete: () => void; last?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [url, setUrl] = useState("");
  const [checking, setChecking] = useState(false);
  const [failReason, setFailReason] = useState("");

  async function verify() {
    setChecking(true);
    setFailReason("");
    const { data, error } = await supabase.functions.invoke("verify-post", { body: { mode: "mention", url } });
    setChecking(false);
    if (error || !data?.verified) {
      setFailReason(data?.reason || "Couldn't verify that post.");
      return;
    }
    onComplete();
  }

  return (
    <ListRow last={last}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: expanded && !done ? "10px" : 0 }}>
        <div>
          <p style={{ margin: 0, fontFamily: display, fontSize: "0.9rem", fontWeight: 600, color: "#fff" }}>Make a bullish post about Folks</p>
          <p style={{ margin: "2px 0 0", fontFamily: body, fontSize: "0.68rem", color: "rgba(245,247,245,0.4)", lineHeight: 1.4, maxWidth: "220px" }}>
            Write a post about Folks and mention @{X_HANDLE}.
          </p>
          <p style={{ margin: "4px 0 0", fontFamily: mono, fontSize: "0.62rem", color: done ? violet : "rgba(245,247,245,0.4)" }}>+500 pts</p>
        </div>
        {done ? (
          <span
            style={{
              display: "inline-block",
              padding: "7px 14px",
              borderRadius: "6px",
              background: goldDeep,
              color: "#fff",
              fontFamily: mono,
              fontSize: "0.62rem",
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              cursor: "not-allowed",
            }}
          >
            Completed
          </span>
        ) : (
          !expanded && (
            <button
              onClick={() => {
                window.open(BULLISH_COMPOSE_URL, "_blank");
                setExpanded(true);
              }}
              style={{
                fontFamily: mono,
                fontSize: "0.62rem",
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: ink,
                background: violet,
                border: "none",
                borderRadius: "6px",
                padding: "7px 14px",
                cursor: "pointer",
              }}
            >
              Compose
            </button>
          )
        )}
      </div>
      {expanded && !done && (
        <div>
          <input placeholder="https://x.com/you/status/..." value={url} onChange={(e) => setUrl(e.target.value)} style={inputStyle} />
          {url && !isValidUrl(url) && <p style={{ fontSize: "0.6rem", color: "#d96b5a", margin: "5px 0 0" }}>Needs a valid https:// link.</p>}
          {isValidUrl(url) && (
            <button
              onClick={verify}
              disabled={checking}
              style={{
                marginTop: "8px",
                width: "100%",
                fontFamily: mono,
                fontSize: "0.62rem",
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: ink,
                background: violet,
                border: "none",
                borderRadius: "6px",
                padding: "8px",
                cursor: checking ? "wait" : "pointer",
              }}
            >
              {checking ? "Checking..." : "Verify Post"}
            </button>
          )}
          {failReason && <p style={{ fontSize: "0.6rem", color: "#d96b5a", margin: "6px 0 0" }}>{failReason}</p>}
        </div>
      )}
    </ListRow>
  );
}

export default function WhitelistPage() {
  const auth = useAuth();
  const handle = extractXHandle(auth.user);

  const [points, setPoints] = useState<number | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [referralCode, setReferralCodeState] = useState<string | null>(null);
  const [referralCount, setReferralCount] = useState(0);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletInput, setWalletInput] = useState("");
  const [walletErr, setWalletErr] = useState("");
  const [savingWallet, setSavingWallet] = useState(false);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [checking, setChecking] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(formatCountdown(msUntilNextRotation()));

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) setReferralCode(ref);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setLockCountdown(formatCountdown(msUntilNextRotation())), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!auth.user) {
      setChecking(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const [{ data: profile }, { data: completions }] = await Promise.all([
        supabase.from("folks_profiles").select("points, avatar_url, referral_code, referral_count, wallet_address").eq("id", auth.user!.id).maybeSingle(),
        supabase.from("folks_task_completions").select("task_id, tweet_id").eq("user_id", auth.user!.id),
      ]);
      if (cancelled) return;
      if (profile) {
        setPoints(profile.points ?? 0);
        setAvatarUrl(profile.avatar_url ?? null);
        setReferralCodeState(profile.referral_code ?? null);
        setReferralCount(profile.referral_count ?? 0);
        setWalletAddress(profile.wallet_address ?? null);
      }
      const map: Record<string, boolean> = {};
      (completions ?? []).forEach((r: any) => { map[doneKey(r.task_id, r.tweet_id ?? "")] = true; });
      setDone(map);
      setChecking(false);
    })();
    return () => { cancelled = true; };
  }, [auth.user]);

  async function refreshPoints() {
    if (!auth.user) return;
    const { data } = await supabase.from("folks_profiles").select("points").eq("id", auth.user.id).maybeSingle();
    if (data) setPoints(data.points ?? 0);
  }

  async function completeTask(taskId: string, tweetId: string = "") {
    const key = doneKey(taskId, tweetId);
    if (!auth.user || done[key]) return;
    const { error } = await supabase.from("folks_task_completions").insert({ task_id: taskId, tweet_id: tweetId });
    if (error && error.code !== "23505") {
      // 23505 = already recorded (e.g. a duplicate click) — treat as done.
      // Anything else means it genuinely didn't save; don't mark it done
      // locally, or the UI would show "complete" for something the
      // database never actually has, exactly the bug this replaces.
      console.error("completeTask failed:", error.message);
      return;
    }
    setDone((prev) => ({ ...prev, [key]: true }));
    refreshPoints();
  }

  async function connectX() {
    setConnecting(true);
    setPostAuthAction("whitelist");
    await auth.signInWithX();
  }

  async function saveWallet() {
    if (!auth.user || !isValidEvm(walletInput)) return;
    setWalletErr("");
    setSavingWallet(true);
    const { error } = await supabase.from("folks_profiles").update({ wallet_address: walletInput.trim() }).eq("id", auth.user.id);
    setSavingWallet(false);
    if (error) {
      setWalletErr(error.code === "23505" ? "That wallet is already bound to another profile." : "Something went wrong. Try again.");
      return;
    }
    setWalletAddress(walletInput.trim());
  }

  const referralLink = referralCode ? `${typeof window !== "undefined" ? window.location.origin : ""}/whitelist?ref=${referralCode}` : "";
  function copyReferralLink() {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  const wrap: React.CSSProperties = { minHeight: "100vh", background: pageBg, color: "#fff", fontFamily: body };
  const inner: React.CSSProperties = { maxWidth: "440px", margin: "0 auto", padding: "24px 20px 60px" };

  if (!auth.user) {
    return (
      <div style={wrap}>
        <div style={{ ...inner, textAlign: "center", paddingTop: "60px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "18px" }}>
            <FolksSeal size={52} />
          </div>
          <p style={{ ...microLabel, color: violet, margin: "0 0 8px" }}>Whitelist</p>
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

  return (
    <div style={wrap}>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          padding: "14px 20px",
          background: "rgba(21,19,28,0.9)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: `1px solid ${cardBorder}`,
        }}
      >
        <div style={{ maxWidth: "440px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
            <FolksSeal size={26} />
            <span style={{ fontFamily: display, fontSize: "0.94rem", fontWeight: 700, color: "#fff", letterSpacing: "0.01em" }}>FOLKS</span>
          </Link>

          <div ref={menuRef} style={{ position: "relative" }}>
            <button onClick={() => setMenuOpen((o) => !o)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", lineHeight: 0 }}>
              <Avatar url={avatarUrl} initial={handle ? handle[0].toUpperCase() : "F"} size={34} />
            </button>

            {menuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 10px)",
                  right: 0,
                  width: "270px",
                  background: "#1c1926",
                  border: `1px solid ${cardBorder}`,
                  borderRadius: "14px",
                  overflow: "hidden",
                  zIndex: 30,
                  boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                }}
              >
                <div style={{ padding: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                    <Avatar url={avatarUrl} initial={handle ? handle[0].toUpperCase() : "F"} size={34} />
                    <p style={{ margin: 0, fontFamily: display, fontSize: "0.88rem", fontWeight: 600, color: "#fff" }}>@{handle}</p>
                  </div>

                  <p style={{ ...microLabel, margin: "0 0 2px" }}>Points Balance</p>
                  <p style={{ fontFamily: display, fontSize: "1.7rem", fontWeight: 700, color: violet, margin: "0 0 14px" }}>
                    {(points ?? 0).toLocaleString()}
                  </p>

                  <p style={{ ...microLabel, margin: "0 0 6px" }}>Wallet</p>
                  {walletAddress ? (
                    <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "7px", padding: "8px 10px", marginBottom: "14px" }}>
                      <span style={{ fontFamily: mono, fontSize: "0.66rem", color: violet }}>
                        {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                      </span>
                      <span style={{ fontFamily: mono, fontSize: "0.58rem", color: "rgba(245,247,245,0.35)", marginLeft: "6px" }}>Bound</span>
                    </div>
                  ) : (
                    <div style={{ marginBottom: "14px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <input
                          placeholder="0x..."
                          value={walletInput}
                          onChange={(e) => setWalletInput(e.target.value)}
                          style={{ ...inputStyle, fontFamily: mono, fontSize: "0.7rem", padding: "8px 10px" }}
                        />
                        <button
                          onClick={saveWallet}
                          disabled={!isValidEvm(walletInput) || savingWallet}
                          style={{
                            background: isValidEvm(walletInput) ? violet : "rgba(255,255,255,0.06)",
                            color: isValidEvm(walletInput) ? ink : "rgba(245,247,245,0.3)",
                            border: "none",
                            borderRadius: "7px",
                            padding: "0 12px",
                            fontFamily: mono,
                            fontSize: "0.62rem",
                            fontWeight: 700,
                            cursor: isValidEvm(walletInput) ? "pointer" : "default",
                          }}
                        >
                          {savingWallet ? "..." : "Bind"}
                        </button>
                      </div>
                      {walletInput && !isValidEvm(walletInput) && (
                        <p style={{ fontSize: "0.58rem", color: "#d96b5a", margin: "5px 0 0" }}>Not a valid EVM address.</p>
                      )}
                      {walletErr && <p style={{ fontSize: "0.58rem", color: "#d96b5a", margin: "5px 0 0" }}>{walletErr}</p>}
                    </div>
                  )}

                  <p style={{ ...microLabel, margin: "0 0 6px" }}>Your Referral Link</p>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <div
                      style={{
                        flex: 1,
                        background: "rgba(0,0,0,0.3)",
                        borderRadius: "7px",
                        padding: "8px 10px",
                        fontFamily: mono,
                        fontSize: "0.66rem",
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
                        borderRadius: "7px",
                        padding: "0 12px",
                        fontFamily: mono,
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <p style={{ fontFamily: mono, fontSize: "0.6rem", color: referralCount >= 10 ? "#d96b5a" : "rgba(245,247,245,0.4)", margin: "6px 0 0" }}>
                    {referralCount} / 10 referrals{referralCount >= 10 ? " — cap reached" : ""}
                  </p>
                </div>

                <button
                  onClick={() => auth.signOut()}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "12px 16px",
                    background: "rgba(255,255,255,0.03)",
                    border: "none",
                    borderTop: `1px solid ${cardBorder}`,
                    color: "rgba(245,247,245,0.65)",
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
        </div>
      </div>

      <div style={inner}>
        <p style={{ fontFamily: display, fontSize: "1.05rem", fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>Earn Your Spot</p>
        <p style={{ fontFamily: body, fontSize: "0.82rem", color: muted, margin: "0 0 24px", lineHeight: 1.55 }}>
          Earn points by completing tasks. Daily tasks refresh every 24 hours.
        </p>

        {/* One-time tasks */}
        <p style={{ ...microLabel, color: violet, margin: "0 0 10px" }}>One-Time Tasks</p>
        <ListContainer>
          <CountdownRow label="Follow Folks" points={100} actionLabel="Follow" actionHref={FOLLOW_URL} done={!!done[doneKey("follow")]} onComplete={() => completeTask("follow")} />
          <BullishPostRow done={!!done[doneKey("bullish_post")]} onComplete={() => completeTask("bullish_post")} last />
        </ListContainer>

        {/* Today's tasks */}
        <p style={{ ...microLabel, color: violet, margin: "22px 0 10px" }}>Today's Tasks</p>
        <ListContainer>
          <CountdownRow label="Like the pinned post" points={25} actionLabel="Like" actionHref={LIKE_URL} done={!!done[doneKey("like", PINNED_TWEET_ID)]} onComplete={() => completeTask("like", PINNED_TWEET_ID)} />
          <CountdownRow label="Retweet the pinned post" points={25} actionLabel="Retweet" actionHref={RETWEET_URL} done={!!done[doneKey("retweet", PINNED_TWEET_ID)]} onComplete={() => completeTask("retweet", PINNED_TWEET_ID)} />
          <CountdownRow label="Comment and tag 2 frens" points={50} actionLabel="Comment" actionHref={PINNED_TWEET_URL} done={!!done[doneKey("comment", PINNED_TWEET_ID)]} onComplete={() => completeTask("comment", PINNED_TWEET_ID)} last />
        </ListContainer>

        {/* Tomorrow's tasks — locked */}
        <p style={{ ...microLabel, color: "rgba(245,247,245,0.35)", margin: "22px 0 10px" }}>Tomorrow's Tasks</p>
        <div style={{ border: `1px solid ${cardBorder}`, borderRadius: "14px", padding: "20px", textAlign: "center", opacity: 0.6 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(245,247,245,0.4)" strokeWidth="1.6" style={{ marginBottom: "8px" }}>
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          <p style={{ fontFamily: display, fontSize: "0.88rem", fontWeight: 600, color: "#fff", margin: "0 0 4px" }}>New tasks unlock in</p>
          <p style={{ fontFamily: mono, fontSize: "1.1rem", fontWeight: 700, color: violet, margin: 0 }}>{lockCountdown}</p>
        </div>
      </div>
    </div>
  );
}
