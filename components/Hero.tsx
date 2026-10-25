import { fmt } from "@/lib/data";
import { IgIcon, LinkedInIcon } from "./icons";
import HeroActions from "./HeroActions";
import type { Section } from "./HomeClient";

// Recibe el alcance combinado ya calculado desde el roster.
export default function Hero({ reach, onNavigate }: { reach: number; onNavigate: (s: Section) => void }) {
  return (
    <section id="hero">
      <div className="hero-word">MOVDI</div>
      <div className="hero-side">Ciudad de México · Digital Agency</div>
      <div className="wrap hero-grid">
        <div className="lbl fi d1">Agencia de talento, marketing y estrategia digital</div>
        <h1 className="hero-h fi d2">
          Hacemos crecer<br />a <span className="em">creadores y marcas</span><br />
          dentro de la<br />cultura digital.
        </h1>
        <p className="hero-sub fi d3">
          Representamos creadores, diseñamos campañas de influencer marketing y construimos estrategia y tecnología para marcas. De gaming a lifestyle, desde CDMX.
        </p>
        <div className="hero-pillars fi d3">
          <span>Talento</span><span>Campañas</span><span>Estrategia &amp; Tech</span>
        </div>
        <HeroActions onNavigate={onNavigate} />
        <div className="hero-stats fi d5">
          <div className="hstat glass warm lux">
            <div className="n">+<span className="em">{fmt(reach)}</span></div>
            <div className="t">Alcance combinado</div>
          </div>
          <div className="hstat glass warm lux"><div className="n">+5</div><div className="t">Años de experiencia</div></div>
          <div className="hstat glass warm lux"><div className="n">+1500</div><div className="t">Proyectos ejecutados</div></div>
          <div className="hstat glass warm lux"><div className="n">+5K</div><div className="t">Creadores en el crew</div></div>
        </div>
        <div className="hero-social fi d5">
          <a href="https://www.instagram.com/movdimx/" target="_blank" rel="noopener" aria-label="Instagram"><IgIcon />Instagram</a>
          <a href="https://mx.linkedin.com/company/movdi" target="_blank" rel="noopener" aria-label="LinkedIn"><LinkedInIcon />LinkedIn</a>
        </div>
      </div>
    </section>
  );
}
