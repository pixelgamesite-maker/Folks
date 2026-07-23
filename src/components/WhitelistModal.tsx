import { useEffect, useState } from "react";
import { body, display, ink, mono, muted, violet, violetLight, violetLine } from "../lib/theme";
import { supabase } from "../lib/supabase";
import { isValidEvm, isValidUrl } from "./shared";

const X_URL = "https://x.com/thefolkseth_";
const PINNED_TWEET_URL = "https://x.com/thefolkseth_/status/REPLACE_WITH_PINNED_TWEET_ID";

const APPLICATIONS_TABLE = "folks_whitelist_applications";
const STORAGE_KEY = "folks_wl_draft_v1";
const SUBMITTED_KEY = "folks_wl_submitted";
const TOTAL_STEPS = 3;

/* ── Tiny inline icons — no external icon package needed ── */
function IconCheck({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 22 18" fill="none">
      <path d="M2 9L8 15L20 2" stroke={ink} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconArrow({ dir = "right" }: { dir?: "left" | "right" }) {
  return (
    <svg width="13" height="10" viewBox="0 0 16 12" fill="none" style={{ transform: dir === "left" ? "rotate(180deg)" : "none" }}>
      <path d="M9 1l6 5-6 5M1 6h13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
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
  resize: "vertical" as const,
};

/* ───────────────────────── question building blocks ───────────────────────── */

function QLabel({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: mono, fontSize: "0.72rem", letterSpacing: "0.02em", color: "#fff", margin: "0 0 10px", lineHeight: 1.5 }}>
      <span style={{ color: violet }}>{n}</span> {children}
    </p>
  );
}

function TextQuestion({
  n,
  label,
  value,
  onChange,
  placeholder,
}: {
  n: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div style={{ marginBottom: "22px" }}>
      <QLabel n={n}>{label}</QLabel>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder ?? "Type your answer..."} rows={3} style={inputStyle} />
    </div>
  );
}

function YesNoQuestion({
  n,
  label,
  value,
  onChange,
  detailValue,
  onDetailChange,
  detailPlaceholder,
}: {
  n: string;
  label: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
  detailValue: string;
  onDetailChange: (v: string) => void;
  detailPlaceholder: string;
}) {
  return (
    <div style={{ marginBottom: "22px" }}>
      <QLabel n={n}>{label}</QLabel>
      <div style={{ display: "flex", gap: "8px", marginBottom: value === true ? "10px" : 0 }}>
        {([["Yes", true], ["No", false]] as [string, boolean][]).map(([label2, v]) => (
          <button
            key={String(v)}
            onClick={() => onChange(v)}
            style={{
              flex: 1,
              fontFamily: mono,
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "10px",
              borderRadius: "7px",
              cursor: "pointer",
              color: value === v ? ink : "rgba(245,247,245,0.55)",
              background: value === v ? violet : "transparent",
              border: `1px solid ${value === v ? violet : violetLine}`,
              transition: "all 0.15s ease",
            }}
          >
            {label2}
          </button>
        ))}
      </div>
      {value === true && (
        <div style={{ animation: "folksRevealDown 0.3s ease both" }}>
          <textarea value={detailValue} onChange={(e) => onDetailChange(e.target.value)} placeholder={detailPlaceholder} rows={2} style={inputStyle} />
        </div>
      )}
    </div>
  );
}

function TaskRow({
  label,
  actionLabel,
  actionHref,
  confirmed,
  ready,
  onOpen,
  onConfirm,
  children,
}: {
  label: string;
  actionLabel: string;
  actionHref: string;
  confirmed: boolean;
  ready: boolean;
  onOpen: () => void;
  onConfirm: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div style={{ border: `1px solid ${violetLine}`, borderRadius: "10px", padding: "14px", marginBottom: "10px" }}>
      <p style={{ margin: "0 0 8px", fontFamily: mono, fontSize: "0.68rem", letterSpacing: "0.06em", color: muted }}>{label}</p>
      {children}
      <div style={{ display: "flex", gap: "8px", marginTop: children ? "8px" : 0 }}>
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

/* ═══════════════════════════ MAIN ═══════════════════════════ */

export default function WhitelistModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);

  const [why, setWhy] = useState("");
  const [valuable, setValuable] = useState("");
  const [isCollector, setIsCollector] = useState<boolean | null>(null);
  const [collectorDetail, setCollectorDetail] = useState("");

  const [hasContributed, setHasContributed] = useState<boolean | null>(null);
  const [contributedDetail, setContributedDetail] = useState("");
  const [supportPlan, setSupportPlan] = useState("");

  const [followed, setFollowed] = useState(false);
  const [followConfirmed, setFollowConfirmed] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeConfirmed, setLikeConfirmed] = useState(false);
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
        setWhy(p.why ?? "");
        setValuable(p.valuable ?? "");
        setIsCollector(p.isCollector ?? null);
        setCollectorDetail(p.collectorDetail ?? "");
        setHasContributed(p.hasContributed ?? null);
        setContributedDetail(p.contributedDetail ?? "");
        setSupportPlan(p.supportPlan ?? "");
        setCommentUrl(p.commentUrl ?? "");
        setTwitterUsername(p.twitterUsername ?? "");
        setWallet(p.wallet ?? "");
      }
      if (localStorage.getItem(SUBMITTED_KEY) === "true") setAlreadySubmitted(true);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ why, valuable, isCollector, collectorDetail, hasContributed, contributedDetail, supportPlan, commentUrl, twitterUsername, wallet })
      );
    } catch {}
  }, [why, valuable, isCollector, collectorDetail, hasContributed, contributedDetail, supportPlan, commentUrl, twitterUsername, wallet]);

  const step0Valid = why.trim().length > 0 && valuable.trim().length > 0 && isCollector !== null && (isCollector === false || collectorDetail.trim().length > 0);

  const step1Valid = hasContributed !== null && (hasContributed === false || contributedDetail.trim().length > 0) && supportPlan.trim().length > 0;

  const step2Valid =
    followConfirmed &&
    likeConfirmed &&
    commentConfirmed &&
    isValidUrl(commentUrl) &&
    twitterUsername.trim().length > 0 &&
    walletConfirmed &&
    isValidEvm(wallet);

  const stepValid = [step0Valid, step1Valid, step2Valid][step];

  function goNext() {
    if (!stepValid) return;
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }
  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function submit() {
    if (!step2Valid) {
      setErr("Complete every step before submitting.");
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
        comment_url: commentUrl.trim(),
        why_whitelisted: why.trim(),
        valuable_member: valuable.trim(),
        is_collector: isCollector,
        collector_detail: isCollector ? collectorDetail.trim() : null,
        has_contributed: hasContributed,
        contributed_detail: hasContributed ? contributedDetail.trim() : null,
        support_plan: supportPlan.trim(),
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
        @keyframes folksRevealDown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          maxHeight: "92vh",
          overflow: "hidden",
          background: "#0b0a10",
          border: `1px solid ${violetLine}`,
          borderRadius: "14px",
          animation: "folksModalIn2 0.25s ease both",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 40px 80px rgba(0,0,0,0.9), 0 0 60px rgba(139,107,240,0.08)",
        }}
      >
        <button
          onClick={handleClose}
          style={{ position: "absolute", top: "14px", right: "16px", zIndex: 2, background: "none", border: "none", cursor: "pointer", color: "rgba(245,247,245,0.3)", fontSize: "1.1rem" }}
        >
          ✕
        </button>

        {alreadySubmitted ? (
          <div style={{ textAlign: "center", padding: "44px 26px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: violet, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <IconCheck size={18} />
            </div>
            <p style={{ fontFamily: mono, fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: violet, margin: "0 0 8px" }}>Application Received</p>
            <p style={{ fontFamily: display, fontWeight: 700, fontSize: "1.3rem", margin: "0 0 10px", color: "#fff" }}>You're on the list.</p>
            <p style={{ fontSize: "0.85rem", color: muted, lineHeight: 1.6, margin: 0 }}>This wallet's spot has been saved. Selected applicants will be notified before mint.</p>
          </div>
        ) : success ? (
          <div style={{ textAlign: "center", padding: "44px 26px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: violet, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <IconCheck size={18} />
            </div>
            <p style={{ fontFamily: mono, fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: violet, margin: "0 0 8px" }}>Application Sent</p>
            <p style={{ fontFamily: display, fontWeight: 700, fontSize: "1.3rem", margin: "0 0 10px", color: "#fff" }}>You're under review.</p>
            <p style={{ fontSize: "0.85rem", color: muted, lineHeight: 1.6, margin: 0 }}>Selected wallets will be notified before mint. No cap here — take your time.</p>
          </div>
        ) : (
          <>
            {/* header / progress */}
            <div style={{ padding: "26px 22px 16px" }}>
              <p style={{ fontFamily: mono, fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", color: violet, margin: "0 0 6px" }}>Whitelist Application</p>
              <p style={{ fontFamily: display, fontWeight: 700, fontSize: "1.25rem", margin: "0 0 14px", color: "#fff" }}>
                {step < 2 ? "Tell us about you" : "Verify & submit"}
              </p>
              <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
                {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                  <div key={i} style={{ flex: 1, height: "3px", borderRadius: "2px", background: i <= step ? violet : violetLine, transition: "background 0.3s ease" }} />
                ))}
              </div>
              <p style={{ fontFamily: mono, fontSize: "0.6rem", color: "rgba(245,247,245,0.32)", margin: 0 }}>
                Step {step + 1} of {TOTAL_STEPS} · No cap on this list
              </p>
            </div>

            {/* carousel */}
            <div style={{ overflow: "hidden", flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  width: `${TOTAL_STEPS * 100}%`,
                  transform: `translateX(-${(step * 100) / TOTAL_STEPS}%)`,
                  transition: "transform 0.42s cubic-bezier(0.65,0,0.35,1)",
                }}
              >
                {/* step 0 */}
                <div style={{ width: `${100 / TOTAL_STEPS}%`, padding: "0 22px 4px", boxSizing: "border-box", overflowY: "auto", maxHeight: "58vh" }}>
                  <TextQuestion n="01" label="Why do you want to be whitelisted for Folks?" value={why} onChange={setWhy} />
                  <TextQuestion n="02" label="What makes you a valuable member of the Folks community?" value={valuable} onChange={setValuable} />
                  <YesNoQuestion
                    n="03"
                    label="Are you an NFT collector?"
                    value={isCollector}
                    onChange={setIsCollector}
                    detailValue={collectorDetail}
                    onDetailChange={setCollectorDetail}
                    detailPlaceholder="Which chains or collections do you mainly collect?"
                  />
                </div>

                {/* step 1 */}
                <div style={{ width: `${100 / TOTAL_STEPS}%`, padding: "0 22px 4px", boxSizing: "border-box", overflowY: "auto", maxHeight: "58vh" }}>
                  <YesNoQuestion
                    n="04"
                    label="Have you launched or contributed to an NFT/web3 project before?"
                    value={hasContributed}
                    onChange={setHasContributed}
                    detailValue={contributedDetail}
                    onDetailChange={setContributedDetail}
                    detailPlaceholder="Tell us about it."
                  />
                  <TextQuestion n="05" label="How do you plan to support Folks after mint?" value={supportPlan} onChange={setSupportPlan} />
                </div>

                {/* step 2 — tasks + identity */}
                <div style={{ width: `${100 / TOTAL_STEPS}%`, padding: "0 22px 4px", boxSizing: "border-box", overflowY: "auto", maxHeight: "58vh" }}>
                  <TaskRow
                    label="STEP 06 — Follow us on X"
                    actionLabel="Follow"
                    actionHref={X_URL}
                    confirmed={followConfirmed}
                    ready={followed}
                    onOpen={() => setFollowed(true)}
                    onConfirm={() => setFollowConfirmed(true)}
                  />
                  <TaskRow
                    label="STEP 07 — Like the pinned post"
                    actionLabel="Open Post"
                    actionHref={PINNED_TWEET_URL}
                    confirmed={likeConfirmed}
                    ready={liked}
                    onOpen={() => setLiked(true)}
                    onConfirm={() => setLikeConfirmed(true)}
                  />
                  <div style={{ border: `1px solid ${violetLine}`, borderRadius: "10px", padding: "14px", marginBottom: "10px" }}>
                    <p style={{ margin: "0 0 8px", fontFamily: mono, fontSize: "0.68rem", letterSpacing: "0.06em", color: muted }}>STEP 08 — Comment and tag two friends</p>
                    <a
                      href={PINNED_TWEET_URL}
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
                    <input
                      placeholder="https://x.com/you/status/..."
                      value={commentUrl}
                      disabled={commentConfirmed}
                      onChange={(e) => setCommentUrl(e.target.value)}
                      style={inputStyle}
                    />
                    {commentUrl && !isValidUrl(commentUrl) && <p style={{ fontSize: "0.66rem", color: "#d96b5a", margin: "6px 0 0" }}>Needs a valid https:// link.</p>}
                    {isValidUrl(commentUrl) && !commentConfirmed && (
                      <button
                        onClick={() => setCommentConfirmed(true)}
                        style={{
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
                        }}
                      >
                        Confirm Link
                      </button>
                    )}
                    {commentConfirmed && <p style={{ fontSize: "0.66rem", color: violet, margin: "8px 0 0" }}>Confirmed.</p>}
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <QLabel n="09">What is your X (Twitter) username?</QLabel>
                    <input placeholder="@yourhandle" value={twitterUsername} onChange={(e) => setTwitterUsername(e.target.value)} style={{ ...inputStyle, fontFamily: mono }} />
                  </div>

                  <div style={{ marginBottom: "6px" }}>
                    <QLabel n="10">What is your wallet address?</QLabel>
                    <input placeholder="0x..." value={wallet} disabled={walletConfirmed} onChange={(e) => setWallet(e.target.value)} style={{ ...inputStyle, fontFamily: mono }} />
                    {wallet && !isValidEvm(wallet) && <p style={{ fontSize: "0.66rem", color: "#d96b5a", margin: "6px 0 0" }}>Not a valid EVM address.</p>}
                    {isValidEvm(wallet) && !walletConfirmed && (
                      <button
                        onClick={() => setWalletConfirmed(true)}
                        style={{
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
                        }}
                      >
                        Confirm Wallet
                      </button>
                    )}
                    {walletConfirmed && <p style={{ fontSize: "0.66rem", color: violet, margin: "8px 0 0" }}>Confirmed.</p>}
                    <p style={{ fontSize: "0.64rem", color: "rgba(245,247,245,0.3)", margin: "8px 0 0", lineHeight: 1.4 }}>Never share your private key or seed phrase.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* footer controls */}
            <div style={{ padding: "16px 22px 22px" }}>
              {err && <p style={{ fontSize: "0.78rem", color: "#d96b5a", margin: "0 0 10px" }}>{err}</p>}
              <div style={{ display: "flex", gap: "8px" }}>
                {step > 0 && (
                  <button
                    onClick={goBack}
                    style={{
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: mono,
                      fontSize: "0.72rem",
                      color: "#fff",
                      background: "transparent",
                      border: `1px solid ${violetLight}55`,
                      borderRadius: "8px",
                      padding: "0 16px",
                      cursor: "pointer",
                    }}
                  >
                    <IconArrow dir="left" />
                  </button>
                )}
                {step < TOTAL_STEPS - 1 ? (
                  <button
                    disabled={!stepValid}
                    onClick={goNext}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      fontFamily: mono,
                      fontWeight: 600,
                      fontSize: "0.72rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: stepValid ? ink : "rgba(245,247,245,0.3)",
                      background: stepValid ? violet : "rgba(255,255,255,0.04)",
                      border: `1px solid ${stepValid ? violet : violetLine}`,
                      borderRadius: "8px",
                      padding: "14px",
                      cursor: stepValid ? "pointer" : "not-allowed",
                    }}
                  >
                    Next <IconArrow />
                  </button>
                ) : (
                  <button
                    disabled={!step2Valid || sending}
                    onClick={submit}
                    style={{
                      flex: 1,
                      fontFamily: mono,
                      fontWeight: 600,
                      fontSize: "0.72rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: step2Valid ? ink : "rgba(245,247,245,0.3)",
                      background: step2Valid ? violet : "rgba(255,255,255,0.04)",
                      border: `1px solid ${step2Valid ? violet : violetLine}`,
                      borderRadius: "8px",
                      padding: "14px",
                      cursor: step2Valid && !sending ? "pointer" : "not-allowed",
                    }}
                  >
                    {sending ? "Submitting..." : "Submit Application"}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
