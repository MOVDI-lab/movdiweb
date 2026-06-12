"use client";

import { useEffect, useState } from "react";

export default function Nav() {
  const [solid, setSolid] = useState(false);
  const [mobOpen, setMobOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMobOpen(false);
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: Math.max(0, el.offsetTop - 64), behavior: "smooth" });
  };

  return (
    <nav id="nav" className={solid ? "solid" : ""}>
      <div className="nav-in">
        <a className="logo" href="#hero" onClick={go("hero")}>
          MOV<span className="em">DI</span>
        </a>
        <div className="nav-tabs">
          <button className="nav-tab" onClick={go("roster")}>Roster</button>
          <button className="nav-tab" onClick={go("servicios")}>Servicios</button>
          <button className="nav-tab" onClick={go("nosotros")}>Nosotros</button>
          <button className="nav-tab" onClick={go("unete")}>Únete</button>
        </div>
        <div className="nav-sp" />
        <button className="nav-cta" onClick={go("hablemos")}>Hablemos</button>
        <button className="burger" aria-label="Menú" onClick={() => setMobOpen((v) => !v)}>
          <span /><span /><span />
        </button>
      </div>
      <div className={`nav-mob${mobOpen ? " open" : ""}`}>
        <button className="nav-tab" onClick={go("roster")}>Roster</button>
        <button className="nav-tab" onClick={go("servicios")}>Servicios</button>
        <button className="nav-tab" onClick={go("nosotros")}>Nosotros</button>
        <button className="nav-tab" onClick={go("unete")}>Únete</button>
        <button className="nav-tab" style={{ color: "var(--orange)" }} onClick={go("hablemos")}>Hablemos</button>
      </div>
    </nav>
  );
}
