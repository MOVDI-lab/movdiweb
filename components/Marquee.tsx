import { BRANDS } from "@/lib/data";

export default function Marquee() {
  const track = [...BRANDS, ...BRANDS]; // duplicado para scroll infinito
  return (
    <div className="marquee">
      <div className="mq-h">Marcas que confían en MOVDI</div>
      <div className="mq-track">
        {track.map((b, i) => (
          <span key={i}>{b}</span>
        ))}
      </div>
    </div>
  );
}
