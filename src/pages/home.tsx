import { useEffect, useState } from "react";
import { body, FONT_LINK, gold, ink } from "../lib/theme";

import Header from "../components/Header";
import Hero from "../components/Hero";
import { Divider } from "../components/shared";
import MeetFolks from "../components/MeetFolks";
import Traits from "../components/Traits";
import Ranks from "../components/Ranks";
import Systems from "../components/Systems";
import FolksListCTA from "../components/FolksListCTA";
import MintSection from "../components/MintSection";
import Reserve from "../components/Reserve";
import Roadmap from "../components/Roadmap";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";
import WhitelistModal from "../components/WhitelistModal";

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = FONT_LINK;
    document.head.appendChild(l);
    return () => {
      document.head.removeChild(l);
    };
  }, []);

  return (
    <div style={{ background: ink, minHeight: "100vh", fontFamily: body, color: "#fff", overflowX: "hidden" }}>
      <style>{`
        @keyframes folksFadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes folksModalIn { from{opacity:0;transform:scale(0.96) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
        *{box-sizing:border-box;}
        ::placeholder{color:rgba(247,245,239,0.22);}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:${gold}44;border-radius:4px;}
        html{scroll-behavior:smooth;}
        a{color:inherit;text-decoration:none;}
      `}</style>

      <Header onOpenModal={() => setModalOpen(true)} />
      <Hero onOpenModal={() => setModalOpen(true)} />

      <Divider />
      <MeetFolks />
      <Divider />
      <Traits />
      <Divider />
      <Ranks />
      <Divider />
      <Systems />
      <Divider />
      <FolksListCTA onOpenModal={() => setModalOpen(true)} />
      <Divider />
      <MintSection />
      <Divider />
      <Reserve />
      <Divider />
      <Roadmap />
      <Divider />
      <FAQ />
      <Divider />
      <Footer />

      <WhitelistModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
