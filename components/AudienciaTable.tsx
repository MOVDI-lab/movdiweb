import type { Talento } from "@/lib/types";

// Tabla de audiencia (compartida entre el modal y la página de talento).
// Sin hooks → se puede usar en server y client components.
export default function AudienciaTable({ str }: { str: string }) {
  const parts = String(str).split("·").map((s) => s.trim()).filter(Boolean);
  if (!parts.length) {
    return (
      <div className="aud"><div className="aud-row"><div className="aud-k" /><div className="aud-v">{str}</div></div></div>
    );
  }
  return (
    <div className="aud">
      {parts.map((p, i) => {
        const idx = p.indexOf(":");
        if (idx < 0) return <div className="aud-row" key={i}><div className="aud-k" /><div className="aud-v">{p}</div></div>;
        return (
          <div className="aud-row" key={i}>
            <div className="aud-k">{p.slice(0, idx).trim()}</div>
            <div className="aud-v">{p.slice(idx + 1).trim()}</div>
          </div>
        );
      })}
    </div>
  );
}

// Contenido interno de la ficha de talento (top + cuerpo), sin overlay.
// `footer` recibe los CTAs (cotizar + WhatsApp), que difieren entre modal y página.
export function TalentSheetBody({ t, footer }: { t: Talento; footer: React.ReactNode }) {
  const plats = (t.plataformas || []).filter((p) => p.handle || p.link);
  const videos = t.videos || [];
  return (
    <>
      <div className="top">
        <img src={t.photo} alt={t.nombre} />
        <div className="meta">
          {t.tier && <div className="lbl">{t.tier} · {t.crew}</div>}
          <h2>{t.nombre}</h2>
          <div className="city">{t.ciudad || "México"}</div>
          <p className="bio">{t.bio}</p>
          <div className="chips">{(t.categorias || []).map((c) => <span className="c" key={c}>{c}</span>)}</div>
          {t.audiencia && (
            <>
              <div className="sub-t">Audiencia principal</div>
              <AudienciaTable str={t.audiencia} />
            </>
          )}
        </div>
      </div>
      <div className="body2">
        <div className="sub-t">Plataformas</div>
        {plats.length ? (
          plats.map((p, i) => (
            <div className="plat-row" key={i}>
              <a href={p.link} target="_blank" rel="noopener">
                {p.plataforma} <span style={{ color: "var(--muted)", fontWeight: 600 }}>{p.handle}</span>
              </a>
              <div className="seg">{p.seguidores || "-"}{p.er && <span className="er">ER {p.er}</span>}</div>
            </div>
          ))
        ) : (
          <div style={{ color: "var(--muted)" }}>Sin plataformas listadas</div>
        )}

        {(t.marcas || []).length > 0 && (
          <>
            <div className="sub-t">Marcas</div>
            <div className="chips">{t.marcas.map((m) => <span className="c" key={m}>{m}</span>)}</div>
          </>
        )}

        {videos.length > 0 && (
          <>
            <div className="sub-t">Contenido destacado</div>
            <div className="vids">
              {videos.map((v, i) => (
                <a className="vid" key={i} href={v.link} target="_blank" rel="noopener">
                  <div className="vt">{v.titulo}</div>
                  <div className="vk">{v.tipo}</div>
                </a>
              ))}
            </div>
          </>
        )}

        {footer}
      </div>
    </>
  );
}
