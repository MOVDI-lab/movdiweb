"use client";

import { useEffect, useState } from "react";
import type { Section } from "./HomeClient";

export default function Nav({
  active,
  onNavigate,
}: {
  active: Section;
  onNavigate: (s: Section) => void;
}) {
  const [solid, setSolid] = useState(false);
  const [mobOpen, setMobOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (s: Section) => () => {
    setMobOpen(false);
    onNavigate(s);
  };

  const tab = (s: Section, label: string) => (
    <button className={`nav-tab${active === s ? " active" : ""}`} onClick={go(s)}>{label}</button>
  );

  return (
    <nav id="nav" className={solid ? "solid" : ""}>
      <div className="nav-in">
        <div className="logo" onClick={go("home")}>MOV<span className="em">DI</span></div>
        <div className="nav-tabs">
          {tab("roster", "Roster")}
          {tab("servicios", "Servicios")}
          {tab("nosotros", "Nosotros")}
          {tab("unete", "Únete")}
        </div>
        <div className="nav-sp" />
        <button className="nav-cta" onClick={go("hablemos")}>Hablemos</button>
        <button className="burger" aria-label="Menú" onClick={() => setMobOpen((v) => !v)}>
          <span /><span /><span />
        </button>
      </div>
      <div className={`nav-mob${mobOpen ? " open" : ""}`}>
        {tab("roster", "Roster")}
        {tab("servicios", "Servicios")}
        {tab("nosotros", "Nosotros")}
        {tab("unete", "Únete")}
        <button className="nav-tab" style={{ color: "var(--orange)" }} onClick={go("hablemos")}>Hablemos</button>
      </div>
    </nav>
  );
}
