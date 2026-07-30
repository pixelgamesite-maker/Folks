import { useEffect, useState } from "react";
import { body, FONT_LINK, violet, ink } from "../lib/theme";
import { useAuth, consumePostAuthAction } from "../hooks/useAuth";

import Header from "../components/Header";
import Hero from "../components/Hero";
import { Divider } from "../components/shared";
import About from "../components/About";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";
import GetWhitelistedModal from "../components/GetWhitelistedModal";
import WhitelistModal from "../components/WhitelistModal";

export default function Home() {
  const auth = useAuth();
  const [connectOpen, setConnectOpen] = useState(false);
  const [choiceOpen, setChoiceOpen] = useState(false);

  useEffect(() => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = FONT_LINK;
    document.head.appendChild(l);
    return () => {
      document.head.removeChild(l);
    };
  }, []);

  // After connecting via the "Get Whitelisted" flow, /auth/callback sends
  // people back here — reopen the choice popup automatically.
  useEffect(() => {
    if (consumePostAuthAction() === "choice") setChoiceOpen(true);
  }, []);

  function openGetWhitelisted() {
    // Already signed in (from an earlier session, or from Marketplace/
    // Whitelist directly) — skip straight to the choice, no need to
    // connect again.
    if (auth.user) {
      setChoiceOpen(true);
    } else {
      setConnectOpen(true);
    }
  }

  return (
    <div style={{ background: ink, minHeight: "100vh", fontFamily: body, color: "#fff", overflowX: "hidden" }}>
      <style>{`
        @keyframes folksFadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes folksModalIn { from{opacity:0;transform:scale(0.96) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes folksTicker { from{transform:translateX(0)} to{transform:translateX(-33.333%)} }
        *{box-sizing:border-box;}
        ::placeholder{color:rgba(245,247,245,0.22);}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:${violet}44;border-radius:4px;}
        html{scroll-behavior:smooth;}
        a{color:inherit;text-decoration:none;}
      `}</style>

      <Header />
      <Hero onOpenWhitelist={openGetWhitelisted} />

      <Divider />
      <About />
      <Divider />
      <FAQ />

      <Footer />

      {/* Step 1 — Connect X (skipped entirely if already signed in) */}
      <WhitelistModal
        open={connectOpen}
        onClose={() => setConnectOpen(false)}
      />

      {/* Step 2 — Earn Points vs Marketplace, only reached once signed in.
          Opened either right after Step 1 succeeds (via the postAuthAction
          round trip) or immediately if already signed in. */}
      <GetWhitelistedModal open={choiceOpen} onClose={() => setChoiceOpen(false)} />
    </div>
  );
}
