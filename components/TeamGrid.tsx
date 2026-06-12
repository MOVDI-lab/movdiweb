"use client";

import { useState } from "react";
import type { MiembroEquipo } from "@/lib/types";

export default function TeamGrid({ equipo }: { equipo: MiembroEquipo[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="team">
      {equipo.map((m) => (
        <div
          key={m.id}
          className={`tm${open === m.id ? " open" : ""}`}
          role="button"
          tabIndex={0}
          aria-label={m.nombre}
          onClick={() => setOpen((o) => (o === m.id ? null : m.id))}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setOpen((o) => (o === m.id ? null : m.id));
            }
          }}
        >
          <img src={m.foto} alt={m.nombre} loading="lazy" />
          <div className="tinfo">
            <div className="tn">{m.nombre}</div>
            <div className="tp">{m.puesto}</div>
            {m.frase && <div className="tf">&quot;{m.frase}&quot;</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
