"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Nav from "./Nav";
import Hero from "./Hero";
import Marquee from "./Marquee";
import Servicios from "./Servicios";
import Roster from "./Roster";
import Nosotros from "./Nosotros";
import Unete from "./Unete";
import Contacto from "./Contacto";
import Footer from "./Footer";
import TalentModal from "./TalentModal";
import type { Talento, MiembroEquipo } from "@/lib/types";

export type Section = "home" | "roster" | "servicios" | "nosotros" | "unete" | "hablemos";

const SECTION_PATH: Record<Exclude<Section, "home">, string> = {
  roster: "/roster", servicios: "/servicios", nosotros: "/nosotros", unete: "/unete", hablemos: "/contacto",
};
const PATH_SECTION: Record<string, Section> = {
  "/roster": "roster", "/servicios": "servicios", "/nosotros": "nosotros",
  "/unete": "unete", "/contacto": "hablemos", "/hablemos": "hablemos",
};

const pathFor = (s: Section) => (s === "home" ? "/" : SECTION_PATH[s]);

export default function HomeClient({
  talentos, equipo, reach,
}: {
  talentos: Talento[]; equipo: MiembroEquipo[]; reach: number;
}) {
  const [section, setSection] = useState<Section>("home");
  const [slug, setSlug] = useState<string | null>(null);

  const selected = useMemo(
    () => (slug ? talentos.find((t) => t.slug === slug) ?? null : null),
    [slug, talentos]
  );

  const scrollTop = () => {
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 10);
  };

  // Cambio de sección (muestra un panel a la vez), actualiza URL y sube al inicio.
  const navigate = useCallback((s: Section) => {
    setSlug(null);
    setSection(s);
    const p = pathFor(s);
    if (window.location.pathname !== p) window.history.pushState({}, "", p);
    scrollTop();
  }, []);

  const openTalent = useCallback((s: string) => {
    setSlug(s);
    window.history.pushState({}, "", `/talento/${s}`);
  }, []);

  const closeTalent = useCallback(() => {
    setSlug(null);
    const back = pathFor(section === "home" ? "roster" : section);
    window.history.pushState({}, "", back);
  }, [section]);

  // Lee la URL al cargar y en back/forward del navegador.
  useEffect(() => {
    const apply = () => {
      const path = window.location.pathname.replace(/\/+$/, "") || "/";
      const m = path.match(/^\/talento\/(.+)$/);
      if (m) {
        setSection((cur) => (cur === "home" ? "roster" : cur));
        setSlug(decodeURIComponent(m[1]));
        return;
      }
      setSlug(null);
      setSection(path === "/" ? "home" : PATH_SECTION[path] ?? "home");
    };
    apply();
    window.addEventListener("popstate", apply);
    return () => window.removeEventListener("popstate", apply);
  }, []);

  return (
    <>
      <Nav active={section} onNavigate={navigate} />
      {section === "home" && (
        <>
          <Hero reach={reach} onNavigate={navigate} />
          <Marquee />
        </>
      )}
      <div className={`panel${section === "servicios" ? " show" : ""}`}><Servicios /></div>
      <div className={`panel${section === "roster" ? " show" : ""}`}><Roster talentos={talentos} onOpen={openTalent} /></div>
      <div className={`panel${section === "nosotros" ? " show" : ""}`}><Nosotros equipo={equipo} /></div>
      <div className={`panel${section === "unete" ? " show" : ""}`}><Unete /></div>
      <div className={`panel${section === "hablemos" ? " show" : ""}`}><Contacto /></div>
      <Footer />
      {selected && <TalentModal t={selected} onClose={closeTalent} />}
    </>
  );
}
