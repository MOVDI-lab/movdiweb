import { VALUES } from "@/lib/data";
import type { MiembroEquipo } from "@/lib/types";
import TeamGrid from "./TeamGrid";

export default function Nosotros({ equipo }: { equipo: MiembroEquipo[] }) {
  return (
    <section id="nosotros" className="sec-pad">
      <div className="wrap">
        <div className="lbl reveal in">Nosotros</div>
        <h2 className="sec-h reveal in">
          Más que una agencia.<br /><span className="em">Un movimiento digital.</span>
        </h2>
        <div className="nos-intro reveal in">
          <p>Nacimos en 2020 con una visión clara: no solo crear estrategias digitales, sino vivir las tendencias que definen esta generación.</p>
          <p>Somos tu socio estratégico y creativo. Pensamos como el target, actuamos como aliados y trabajamos como si fuéramos parte de tu equipo. Convertimos marcas en referentes culturales. Hacemos que tu mensaje conecte, no solo impacte.</p>
        </div>
        <div className="values">
          {VALUES.map((v) => (
            <div className="val glass reveal in" key={v[0]}>
              <div className="vn">{v[0]}</div>
              <h4>{v[1]}</h4>
              <p>{v[2]}</p>
            </div>
          ))}
        </div>
        <div className="lbl team-h reveal in">El equipo</div>
        <TeamGrid equipo={equipo} />
      </div>
    </section>
  );
}
