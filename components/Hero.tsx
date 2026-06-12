import { fmt } from "@/lib/data";
import { IgIcon, LinkedInIcon } from "./icons";
import HeroActions from "./HeroActions";

// Servidor: recibe el alcance combinado ya calculado desde el roster.
export default function Hero({ reach }: { reach: number }) {
  return (
    <section id="hero">
      <div className="hero-word">MOVDI</div>
      <div className="hero-side">Ciudad de México · Digital Agency</div>
      <div className="wrap hero-grid">
        <div className="lbl fi d1">Agencia de Marketing Digital</div>
        <h1 className="hero-h fi d2">
          No seguimos<br />tendencias.<br />
          <span className="em">Las convertimos</span><br />en valor.
        </h1>
        <p className="hero-sub fi d3">
          Construimos creadores, posicionamos marcas y creamos oportunidades reales en el entorno digital.
        </p>
        <HeroActions />
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
