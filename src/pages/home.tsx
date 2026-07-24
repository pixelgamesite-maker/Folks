import { useEffect, useState } from "react";
import { body, FONT_LINK, gold, ink } from "../lib/theme";
import { consumeReopenFlag } from "../hooks/useAuth";

import Header from "../components/Header";
import Hero from "../components/Hero";
import { Divider } from "../components/shared";
import About from "../components/About";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";
import EarlyRoleModal from "../components/EarlyRoleModal";
import WhitelistModal from "../components/WhitelistModal";

export default function Home() {
  const [earlyRoleOpen, setEarlyRoleOpen] = useState(false);
  const [whitelistOpen, setWhitelistOpen] = useState(false);

  useEffect(() => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = FONT_LINK;
    document.head.appendChild(l);
    return () => {
      document.head.removeChild(l);
    };
  }, []);

  // Only Early Role uses real X OAuth, so only it needs to reopen after the
  // /auth/callback redirect brings the person back to this page.
  useEffect(() => {
    if (consumeReopenFlag()) setEarlyRoleOpen(true);
  }, []);

  return (
    <div style={{ background: ink, minHeight: "100vh", fontFamily: body, color: "#fff", overflowX: "hidden" }}>
      <style>{`
        @keyframes folksFadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes folksModalIn { from{opacity:0;transform:scale(0.96) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes folksTicker { from{transform:translateX(0)} to{transform:translateX(-33.333%)} }
        *{box-sizing:border-box;}
        ::placeholder{color:rgba(245,247,245,0.22);}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:${gold}44;border-radius:4px;}
        html{scroll-behavior:smooth;}
        a{color:inherit;text-decoration:none;}
      `}</style>

      <Header />
      <Hero onOpenEarlyRole={() => setEarlyRoleOpen(true)} onOpenWhitelist={() => setWhitelistOpen(true)} />

      <Divider />
      <About />
      <Divider />
      <FAQ />

      <Footer />

      <EarlyRoleModal open={earlyRoleOpen} onClose={() => setEarlyRoleOpen(false)} />
      <WhitelistModal open={whitelistOpen} onClose={() => setWhitelistOpen(false)} />
    </div>
  );
}
