import { useEffect, useState } from "react";
import { body, display, ink, mono, muted, violet, violetLight, violetLine } from "../lib/theme";
import { supabase } from "../lib/supabase";
import { useAuth, extractXHandle, setPostAuthAction } from "../hooks/useAuth";
import { isValidEvm, isValidUrl, FolksSeal } from "../components/shared";

const X_HANDLE = "thefolkseth_";
/** Placeholder — client will drop the real pinned post URL in later. */
const PINNED_TWEET_URL = "https://x.com/thefolkseth_/status/REPLACE_WITH_PINNED_TWEET_ID";
const FOLLOW_URL = `https://twitter.com/intent/follow?screen_name=${X_HANDLE}`;

const APPLICATIONS_TABLE = "folks_whitelist_applications";
const STORAGE_KEY = "folks_wl_draft_v4";

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

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ border: `1px solid ${violetLine}`, borderRadius: "12px", padding: "16px", background: "rgba(139,107,240,0.03)", ...style }}>
      {children}
    </div>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <p style={{ ...microLabel, color: violet, margin: "0 0 10px" }}>{text}</p>
  );
}

function TaskRow({
  n,
  label,
  points,
  actionLabel,
  actionHref,
  done,
  onOpen,
  onConfirm,
  ready,
}: {
  n: string;
  label: string;
  points: number;
  actionLabel: string;
  actionHref: string;
  done: boolean;
  onOpen: () => void;
  onConfirm: () => void;
  ready: boolean;
}) {
  return (
    <Card style={{ marginBottom: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <p style={{ margin: 0, ...microLabel, color: "rgba(245,247,245,0.6)" }}>
          <span style={{ color: violet }}>{n}</span> {label}
        </p>
        <span style={{ fontFamily: mono, fontSize: "0.6rem", color: done ? violet : "rgba(245,247,245,0.3)" }}>+{points} pts</span>
      </div>
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
            background: done || ready ? violet : "rgba(255,255,255,0.04)",
            border: "none",
            borderRadius: "7px",
            padding: "9px",
            cursor: ready && !done ? "pointer" : "default",
          }}
        >
          {done ? "Done" : "Confirm"}
        </button>
      </div>
    </Card>
  );
}

function LinkTaskRow({
  n,
  label,
  points,
  actionHref,
  placeholder,
  value,
  onChange,
  done,
  onConfirm,
}: {
  n: string;
  label: string;
  points: number;
  actionHref: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  done: boolean;
  onConfirm: () => void;
}) {
  return (
    <Card style={{ marginBottom: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <p style={{ margin: 0, ...microLabel, color: "rgba(245,247,245,0.6)" }}>
          <span style={{ color: violet }}>{n}</span> {label}
        </p>
        <span style={{ fontFamily: mono, fontSize: "0.6rem", color: done ? violet : "rgba(245,247,245,0.3)" }}>+{points} pts</span>
      </div>
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
        Open Post
      </a>
      <input placeholder={placeholder} value={value} disabled={done} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
      {value && !isValidUrl(value) && <p style={{ fontSize: "0.66rem", color: "#d96b5a", margin: "6px 0 0" }}>Needs a valid https:// link.</p>}
      {isValidUrl(value) && !done && (
        <button onClick={onConfirm} style={confirmBtn}>
          Confirm Link
        </button>
      )}
      {done && <p style={{ fontSize: "0.66rem", color: violet, margin: "8px 0 0" }}>Confirmed.</p>}
    </Card>
  );
}

export default function WhitelistPage() {
  const auth = useAuth();
  const handle = extractXHandle(auth.user);

  const [points, setPoints] = useState<number | null>(null);
  const [done, setDone] = useState<Record<string, boolean>>({});

  const [followed, setFollowed] = useState(false);
  const [liked, setLiked] = useState(false);
  const [quoteUrl, setQuoteUrl] = useState("");
  const [commentUrl, setCommentUrl] = useState("");
  const [wallet, setWallet] = useState("");
  const [walletConfirmed, setWalletConfirmed] = useState(false);

  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [checking, setChecking] = useState(true);
  const [err, setErr] = useState("");
  const [connecting, setConnecting] = useState(false);

  /* Restore in-progress link inputs (task completion itself is server-tracked, not local). */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        setQuoteUrl(p.quoteUrl ?? "");
        setCommentUrl(p.commentUrl ?? "");
        setWallet(p.wallet ?? "");
      }
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ quoteUrl, commentUrl, wallet }));
    } catch {}
  }, [quoteUrl, commentUrl, wallet]);

  /* Load points, task completions, and whether an application already exists. */
  useEffect(() => {
    if (!auth.user) {
      setChecking(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const [{ data: profile }, { data: completions }, { data: application }] = await Promise.all([
        supabase.from("folks_profiles").select("points").eq("id", auth.user!.id).maybeSingle(),
        supabase.from("folks_task_completions").select("task_id").eq("user_id", auth.user!.id),
        supabase.from(APPLICATIONS_TABLE).select("id").eq("user_id", auth.user!.id).maybeSingle(),
      ]);
      if (cancelled) return;
      if (profile) setPoints(profile.points ?? 0);
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

  const allTasksDone = done.follow && done.like && done.quote && done.comment;
  const allValid = allTasksDone && walletConfirmed && isValidEvm(wallet);

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
        quote_url: quoteUrl.trim(),
        comment_url: commentUrl.trim(),
      },
    ]);
    if (!error) {
      await supabase.from("folks_task_completions").insert({ task_id: "wallet" });
      refreshPoints();
    }
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

  const wrap: React.CSSProperties = {
    minHeight: "100vh",
    background: ink,
    color: "#fff",
    fontFamily: body,
    padding: "80px 20px 60px",
  };
  const inner: React.CSSProperties = { maxWidth: "420px", margin: "0 auto" };

  if (!auth.user) {
    return (
      <div style={wrap}>
        <div style={{ ...inner, textAlign: "center", paddingTop: "40px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "18px" }}>
            <FolksSeal size={48} />
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
              background: connecting ? "rgba(255,255,255,0.02)" : "#fff",
              border: `1px solid ${violetLine}`,
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

  if (success || alreadySubmitted) {
    return (
      <div style={wrap}>
        <div style={{ ...inner, textAlign: "center", paddingTop: "40px" }}>
          <div
            style={{ width: "48px", height: "48px", borderRadius: "50%", background: violet, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}
          >
            <svg width="20" height="16" viewBox="0 0 22 18" fill="none">
              <path d="M2 9L8 15L20 2" stroke={ink} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p style={{ ...microLabel, color: violet, margin: "0 0 8px" }}>Application Received</p>
          <p style={{ fontFamily: display, fontWeight: 700, fontSize: "1.3rem", margin: "0 0 10px" }}>You're on the list.</p>
          <p style={{ fontFamily: body, fontSize: "0.85rem", color: muted, lineHeight: 1.6, margin: "0 0 20px" }}>
            {points !== null ? `${points} points earned. ` : ""}Selected wallets will be notified before mint.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <div style={inner}>
        <Card style={{ textAlign: "center", marginBottom: "24px" }}>
          <p style={{ ...microLabel, margin: "0 0 4px" }}>Points Balance</p>
          <p style={{ fontFamily: display, fontSize: "2.2rem", fontWeight: 700, color: violet, margin: "0 0 4px" }}>
            {(points ?? 0).toLocaleString()}
          </p>
          <p style={{ ...microLabel, margin: 0 }}>Connected as @{handle}</p>
        </Card>

        <SectionLabel text="Whitelist Tasks" />
        <TaskRow
          n="01"
          label="Follow Folks on X"
          points={10}
          actionLabel="Follow"
          actionHref={FOLLOW_URL}
          done={!!done.follow}
          ready={followed}
          onOpen={() => setFollowed(true)}
          onConfirm={() => completeTask("follow")}
        />
        <TaskRow
          n="02"
          label="Like the pinned post"
          points={10}
          actionLabel="Open Post"
          actionHref={PINNED_TWEET_URL}
          done={!!done.like}
          ready={liked}
          onOpen={() => setLiked(true)}
          onConfirm={() => completeTask("like")}
        />
        <LinkTaskRow
          n="03"
          label="Quote with a bullish caption, tag Folks"
          points={25}
          actionHref={PINNED_TWEET_URL}
          placeholder="https://x.com/you/status/..."
          value={quoteUrl}
          onChange={setQuoteUrl}
          done={!!done.quote}
          onConfirm={() => completeTask("quote")}
        />
        <LinkTaskRow
          n="04"
          label="Comment and tag 2 frens"
          points={25}
          actionHref={PINNED_TWEET_URL}
          placeholder="https://x.com/you/status/..."
          value={commentUrl}
          onChange={setCommentUrl}
          done={!!done.comment}
          onConfirm={() => completeTask("comment")}
        />

        <SectionLabel text="Wallet" />
        <Card style={{ marginBottom: "16px" }}>
          <p style={{ margin: "0 0 8px", ...microLabel }}>
            <span style={{ color: violet }}>05</span> Submit EVM address <span style={{ color: "rgba(245,247,245,0.3)" }}>+30 pts</span>
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
        </Card>

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
      </div>
    </div>
  );
}
