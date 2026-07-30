import { useEffect, useRef, useState } from "react";
import { body, display, ink, mono, muted, violet, violetLight, violetLine } from "../lib/theme";
import { supabase } from "../lib/supabase";
import { useAuth, extractXHandle, setPostAuthAction, setReferralCode } from "../hooks/useAuth";
import { FolksSeal } from "../components/shared";

const X_HANDLE = "thefolkseth_";
/** Real pinned post — swap this ID whenever the client changes which post is pinned. */
const PINNED_TWEET_ID = "2081432607011549197";
const PINNED_TWEET_URL = `https://x.com/${X_HANDLE}/status/${PINNED_TWEET_ID}`;
const FOLLOW_URL = `https://twitter.com/intent/follow?screen_name=${X_HANDLE}`;
const LIKE_URL = `https://twitter.com/intent/like?tweet_id=${PINNED_TWEET_ID}`;
const RETWEET_URL = `https://twitter.com/intent/retweet?tweet_id=${PINNED_TWEET_ID}`;

/** How long someone has to be "away" on X before a task auto-completes.
 *  Same trade-off as most social-quest platforms: not real verification,
 *  just enough friction that instant-clicking without doing anything is a
 *  little less trivial. Real API verification (see verify-post) is still
 *  there if you want it for a higher-value one-off task later. */
const COUNTDOWN_SECS = 60;

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

/** Click → opens the link → counts down → then (if a verify mode is given)
 * actually checks with X before marking done. Falls back to the old
 * simple auto-complete if no verifyMode is passed (used for Follow, where
 * checking "did they follow" reliably via the API is murkier and the
 * task is low-stakes enough not to bother). */
function CountdownTask({
  actionLabel,
  actionHref,
  done,
  onComplete,
  verifyMode,
  targetTweetId,
}: {
  actionLabel: string;
  actionHref: string;
  done: boolean;
  onComplete: () => void;
  verifyMode?: "like" | "retweet" | "reply";
  targetTweetId?: string;
}) {
  const [phase, setPhase] = useState<"idle" | "counting" | "checking" | "failed">("idle");
  const [secs, setSecs] = useState(COUNTDOWN_SECS);
  const [failReason, setFailReason] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  async function finish() {
    if (!verifyMode) {
      onComplete();
      return;
    }
    setPhase("checking");
    const { data, error } = await supabase.functions.invoke("verify-post", {
      body: { mode: verifyMode, targetTweetId },
    });
    if (error || !data?.verified) {
      setFailReason(data?.reason || "Couldn't verify that yet. Try again.");
      setPhase("failed");
      return;
    }
    onComplete();
  }

  function start() {
    if (done || phase === "counting" || phase === "checking") return;
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

  if (done) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "9px",
          borderRadius: "7px",
          background: `${violet}22`,
          color: violet,
          fontFamily: mono,
          fontSize: "0.64rem",
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        Completed
      </div>
    );
  }
  if (phase === "counting") {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "9px",
          borderRadius: "7px",
          border: `1px solid ${cardBorder}`,
          color: violet,
          fontFamily: mono,
          fontSize: "0.7rem",
          fontWeight: 700,
        }}
      >
        Waiting... {secs}s
      </div>
    );
  }
  if (phase === "checking") {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "9px",
          borderRadius: "7px",
          border: `1px solid ${cardBorder}`,
          color: violet,
          fontFamily: mono,
          fontSize: "0.68rem",
          fontWeight: 700,
        }}
      >
        Checking with X...
      </div>
    );
  }
  return (
    <>
      <button
        onClick={start}
        style={{
          width: "100%",
          textAlign: "center",
          fontFamily: mono,
          fontSize: "0.64rem",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: ink,
          background: violet,
          border: "none",
          borderRadius: "7px",
          padding: "9px",
          cursor: "pointer",
        }}
      >
        {phase === "failed" ? "Try Again" : actionLabel}
      </button>
      {phase === "failed" && <p style={{ fontSize: "0.62rem", color: "#d96b5a", margin: "6px 0 0", textAlign: "center" }}>{failReason}</p>}
    </>
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

  const [checking, setChecking] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) setReferralCode(ref);
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
        supabase.from("folks_profiles").select("points, avatar_url, referral_code").eq("id", auth.user!.id).maybeSingle(),
        supabase.from("folks_task_completions").select("task_id").eq("user_id", auth.user!.id),
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

  const allTasksDone = !!(done.follow && done.like && done.retweet && done.comment);

  const wrap: React.CSSProperties = { minHeight: "100vh", background: pageBg, color: "#fff", fontFamily: body };
  const inner: React.CSSProperties = { maxWidth: "440px", margin: "0 auto", padding: "24px 20px 60px" };

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

  /* ── Main page ── */
  return (
    <div style={wrap}>
      {/* Header — brand mark left, profile avatar right, matching a real app header. Full-bleed and sticky, independent of the content column's max-width. */}
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FolksSeal size={26} />
            <span style={{ fontFamily: display, fontSize: "0.94rem", fontWeight: 700, color: "#fff", letterSpacing: "0.01em" }}>FOLKS</span>
          </div>

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
                  width: "260px",
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
                  <p style={{ fontFamily: display, fontSize: "1.9rem", fontWeight: 700, color: violet, margin: "0 0 14px" }}>
                    {(points ?? 0).toLocaleString()}
                  </p>

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
            <CountdownTask actionLabel="Follow" actionHref={FOLLOW_URL} done={!!done.follow} onComplete={() => completeTask("follow")} />
          </Panel>
        </div>

        {/* Like / Retweet / Comment — vertical line, daily-rotating tasks live here */}
        <p style={{ ...microLabel, color: violet, margin: "0 0 10px" }}>Then Complete These</p>
        <div style={{ position: "relative", marginBottom: "22px" }}>
          <div style={{ position: "absolute", left: "13px", top: "14px", bottom: "14px", width: "1px", background: cardBorder }} />

          {[
            { n: "like", label: "Like the pinned post", pts: 25, actionLabel: "Like", href: LIKE_URL, mode: "like" as const },
            { n: "retweet", label: "Retweet the pinned post", pts: 25, actionLabel: "Retweet", href: RETWEET_URL, mode: "retweet" as const },
            { n: "comment", label: "Comment and tag 2 frens", pts: 50, actionLabel: "Comment", href: PINNED_TWEET_URL, mode: "reply" as const },
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
                <CountdownTask
                  actionLabel={task.actionLabel}
                  actionHref={task.href}
                  done={!!done[task.n]}
                  onComplete={() => completeTask(task.n)}
                  verifyMode={task.mode}
                  targetTweetId={PINNED_TWEET_ID}
                />
              </Panel>
            </div>
          ))}
        </div>

        {allTasksDone && (
          <Panel style={{ textAlign: "center", marginBottom: "22px" }}>
            <p style={{ ...microLabel, color: violet, margin: "0 0 6px" }}>All Tasks Complete</p>
            <p style={{ fontFamily: display, fontWeight: 700, fontSize: "1.1rem", margin: "0 0 6px", color: "#fff" }}>
              {(points ?? 0).toLocaleString()} points earned
            </p>
            <p style={{ fontFamily: body, fontSize: "0.8rem", color: muted, margin: 0, lineHeight: 1.5 }}>
              Check back for new tasks — this list updates regularly.
            </p>
          </Panel>
        )}

        {/* Wallet — visible so people know it's coming, not interactive yet */}
        <p style={{ ...microLabel, color: "rgba(245,247,245,0.35)", margin: "0 0 10px" }}>Coming Soon</p>
        <Panel style={{ opacity: 0.55 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <p style={{ margin: 0, fontFamily: display, fontSize: "0.92rem", fontWeight: 600, color: "#fff" }}>Submit Your Wallet</p>
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
              }}
            >
              Locked
            </span>
          </div>
          <input placeholder="0x... (opens soon)" disabled value="" style={{ ...inputStyle, cursor: "not-allowed" }} />
          <p style={{ fontFamily: body, fontSize: "0.72rem", color: muted, margin: "8px 0 0", lineHeight: 1.5 }}>
            Wallet submission opens once whitelist selection begins. Keep earning points until then.
          </p>
        </Panel>
      </div>
    </div>
  );
}
