"use client";

import { useState } from "react";
import {
  SERVICES, RESULTS, parseAlcance, fmtAlcance,
  type Service,
} from "@/lib/data";
import { IgIcon, TtIcon } from "./icons";

export default function Servicios() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [proj, setProj] = useState<{ id: string; i: number } | null>(null);

  const closeAll = () => { setOpenId(null); setProj(null); };

  return (
    <section id="servicios" className="sec-pad">
      <div className="wrap">
        <div className="lbl reveal in">Lo que hacemos</div>
        <h2 className="sec-h reveal in">
          Servicios que <span className="em">generan movimiento.</span>
        </h2>
        <div style={{ marginTop: 44 }}>
          {SERVICES.map((s) => (
            <ServiceBlock key={s.id} s={s} onResults={() => setOpenId(s.id)} />
          ))}
        </div>
      </div>

      {openId && (
        <ResultsModal
          id={openId}
          onClose={closeAll}
          onProj={(i) => setProj({ id: openId, i })}
        />
      )}
      {proj && (
        <ProjModal id={proj.id} i={proj.i} onClose={() => setProj(null)} />
      )}
    </section>
  );
}

function ServiceBlock({ s, onResults }: { s: Service; onResults: () => void }) {
  const hasResults = !!RESULTS[s.id];
  return (
    <div className="serv glass reveal in">
      <div className="serv-top"><span className="ico">{s.ico}</span><h3>{s.title}</h3></div>
      <p className="desc">{s.desc}</p>
      {s.body && <p className="body">{s.body}</p>}
      {hasResults ? (
        <button className="serv-cta" onClick={onResults}>
          Ver resultados <span>→</span>
        </button>
      ) : s.projects.length ? (
        <div className="projs">
          {s.projects.map((p) => (
            <a key={p.name} className="proj" href={p.link} target="_blank" rel="noopener">
              {p.img && <img src={p.img} alt={p.name} loading="lazy" />}
              <div className="pn">{p.name}</div>
              <div className="pd">{p.desc}</div>
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ResultsModal({ id, onClose, onProj }: { id: string; onClose: () => void; onProj: (i: number) => void }) {
  const s = SERVICES.find((x) => x.id === id)!;
  const res = RESULTS[id];
  const proyectos = res.length;
  const perfiles = res.reduce((a, r) => a + (r.perfiles || 0), 0);
  const alcance = fmtAlcance(res.reduce((a, r) => a + parseAlcance(r.alcance), 0));

  return (
    <div className="ov open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet glass lux" style={{ maxWidth: 720 }}>
        <button className="close" onClick={onClose}>✕</button>
        <div style={{ padding: 34 }}>
          <div className="lbl">{s.title}</div>
          <h2 className="cond" style={{ fontSize: "clamp(30px,5vw,44px)", margin: "8px 0 4px" }}>Resultados</h2>
          <div className="svc-sum">
            <div><div className="n">{proyectos}</div><div className="t">Proyectos</div></div>
            <div><div className="n"><em>+</em>{perfiles}</div><div className="t">Perfiles activados</div></div>
            <div><div className="n"><em>+</em>{alcance}</div><div className="t">Alcance combinado</div></div>
          </div>
          <div className="sub-t">Casos</div>
          <div className="svc-projs">
            {s.projects.map((p, i) => {
              const r = res[i];
              if (!r) return null;
              return (
                <button key={p.name} className="svc-pcard" onClick={() => onProj(i)}>
                  {p.img && <img src={p.img} alt={p.name} loading="lazy" />}
                  <div className="svc-pc-body">
                    <div className="svc-pc-name">{p.name}</div>
                    <div className="svc-pc-mini">
                      <span>+{r.perfiles} perfiles</span><span>+{r.alcance} alcance</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjModal({ id, i, onClose }: { id: string; i: number; onClose: () => void }) {
  const s = SERVICES.find((x) => x.id === id)!;
  const p = s.projects[i];
  const r = RESULTS[id][i];
  if (!p || !r) return null;

  return (
    <div className="ov open" style={{ zIndex: 210 }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet glass lux" style={{ maxWidth: 600 }}>
        <button className="close" onClick={onClose}>✕</button>
        {p.img && <div className="pres-hero"><img src={p.img} alt={p.name} /></div>}
        <div style={{ padding: 28 }}>
          <div className="lbl">{s.title}</div>
          <h2 className="cond" style={{ fontSize: "clamp(28px,5vw,40px)", margin: "6px 0 14px" }}>{p.name}</h2>
          {p.desc && <p style={{ color: "#cfcbc2", fontWeight: 300, margin: "0 0 20px" }}>{p.desc}</p>}
          <div className="pres-metrics">
            <div className="pres-metric">
              <div className="n">+{r.perfiles}{r.perfilesNota && <small> {r.perfilesNota}</small>}</div>
              <div className="t">Perfiles activados</div>
            </div>
            <div className="pres-metric"><div className="n">+{r.alcance}</div><div className="t">Alcance</div></div>
          </div>
          <div className="sub-t">Top perfiles</div>
          <div className="chips">{r.top.map((t) => <span key={t} className="c">{t}</span>)}</div>
          <div className="sub-t">Contenido destacado</div>
          <div className="pres-links">
            {r.contenidos.map((c, k) => (
              <a key={k} className="lnk" href={c.url} target="_blank" rel="noopener">
                {c.p === "ig" ? <IgIcon /> : <TtIcon />}{c.p === "ig" ? "Instagram" : "TikTok"}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
