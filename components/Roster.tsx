"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Talento } from "@/lib/types";
import { SearchIcon } from "./icons";

type FState = { crew: string; plat: string | null; cat: string | null; tier: string | null };

export default function Roster({ talentos }: { talentos: Talento[] }) {
  const [f, setF] = useState<FState>({ crew: "todos", plat: null, cat: null, tier: null });
  const [q, setQ] = useState("");

  const plats = useMemo(
    () => [...new Set(talentos.flatMap((t) => (t.plataformas || []).map((p) => p.plataforma)))].filter(Boolean).sort(),
    [talentos]
  );
  const cats = useMemo(
    () => [...new Set(talentos.flatMap((t) => t.categorias || []))].sort(),
    [talentos]
  );

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return talentos.filter((t) => {
      if (f.crew !== "todos" && t.crew !== f.crew) return false;
      if (f.tier && t.tier !== f.tier) return false;
      if (f.cat && !(t.categorias || []).includes(f.cat)) return false;
      if (f.plat && !(t.plataformas || []).some((p) => p.plataforma === f.plat)) return false;
      if (query && !((t.nombre || "").toLowerCase().includes(query) ||
        (t.categorias || []).join(" ").toLowerCase().includes(query))) return false;
      return true;
    });
  }, [talentos, f, q]);

  const toggle = (key: "plat" | "cat" | "tier", v: string) =>
    setF((s) => ({ ...s, [key]: s[key] === v ? null : v }));
  const clearF = () => { setF({ crew: "todos", plat: null, cat: null, tier: null }); setQ(""); };

  return (
    <section id="roster">
      <div className="wrap">
        <div className="r-head">
          <div>
            <div className="lbl">El talento</div>
            <h2>Nuestro <span className="em">Roster</span></h2>
            <p className="r-sub">Creadores que mueven audiencias. Filtra por plataforma, categoría o tier.</p>
          </div>
          <div className="r-search glass">
            <SearchIcon />
            <input
              placeholder="Buscar talento…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Buscar talento"
            />
          </div>
        </div>

        <div className="filterbar glass">
          <div className="fb-group">
            <span className="ft">Crew</span>
            <div className="pills">
              {["todos", "MOVDI", "UGC"].map((v) => (
                <button key={v} className={`pill${f.crew === v ? " on" : ""}`}
                  onClick={() => setF((s) => ({ ...s, crew: v }))}>
                  {v === "todos" ? "Todos" : v}
                </button>
              ))}
            </div>
          </div>
          <PillGroup label="Plataforma" values={plats} active={f.plat} onPick={(v) => toggle("plat", v)} />
          <PillGroup label="Tier" values={["Mega", "Macro", "Micro"]} active={f.tier} onPick={(v) => toggle("tier", v)} />
          <PillGroup label="Categoría" values={cats} active={f.cat} onPick={(v) => toggle("cat", v)} />
          <button className="clear" onClick={clearF}>Limpiar ✕</button>
        </div>

        <div className="rcount">{list.length} creador{list.length === 1 ? "" : "es"}</div>

        <div className="grid">
          {list.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>Sin resultados con esos filtros.</p>
          ) : (
            list.map((t) => <TalentCard key={t.id} t={t} />)
          )}
        </div>
      </div>
    </section>
  );
}

function PillGroup({ label, values, active, onPick }: {
  label: string; values: string[]; active: string | null; onPick: (v: string) => void;
}) {
  return (
    <div className="fb-group">
      <span className="ft">{label}</span>
      <div className="pills">
        {values.map((v) => (
          <button key={v} className={`pill${active === v ? " on" : ""}`} onClick={() => onPick(v)}>{v}</button>
        ))}
      </div>
    </div>
  );
}

function TalentCard({ t }: { t: Talento }) {
  const plats = (t.plataformas || []).slice(0, 3);
  return (
    <Link className="card" href={`/talento/${t.slug}`} aria-label={t.nombre}>
      <img src={t.photo} alt={t.nombre} loading="lazy" />
      <div className="grad" />
      {t.tier && <div className="tier">{t.tier}</div>}
      <div className="info">
        <div className="nm">{t.nombre}</div>
        <div className="cat">{(t.categorias || []).slice(0, 3).join(" · ")}</div>
        <div className="plats">
          {plats.map((p, i) => (
            <span className="p" key={i}>{p.plataforma} {p.seguidores || ""}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}
