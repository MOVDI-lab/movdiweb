"use client";

import { useEffect } from "react";
import type { Talento } from "@/lib/types";
import { TalentSheetBody } from "./AudienciaTable";
import CotizarForm from "@/app/talento/[slug]/CotizarForm";
import { WaIcon } from "./icons";
import { waLink } from "@/lib/data";

// Modal del talento (encima del roster, que queda detrás difuminado).
export default function TalentModal({ t, onClose }: { t: Talento; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="ov open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet glass lux">
        <button className="close" onClick={onClose} aria-label="Cerrar">✕</button>
        <TalentSheetBody
          t={t}
          footer={
            <>
              <CotizarForm talento={{ slug: t.slug, nombre: t.nombre, crew: t.crew, photo: t.photo }} />
              <a
                className="btn-wa"
                href={waLink(`Hola MOVDI 👋 me interesa trabajar con ${t.nombre}`)}
                target="_blank"
                rel="noopener"
              >
                <WaIcon />Escríbenos por WhatsApp
              </a>
            </>
          }
        />
      </div>
    </div>
  );
}
