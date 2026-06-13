"use client";

import { useState } from "react";

type TalentoMini = { slug: string; nombre: string; crew: string; photo: string };

export default function CotizarForm({ talento }: { talento: TalentoMini }) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ cls: string; msg: string }>({ cls: "", msg: "" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    if (data.website) return; // honeypot
    if (!data.nombre?.trim() || !data.correo?.trim()) {
      setStatus({ cls: "err", msg: "Pon al menos tu nombre y correo." });
      return;
    }
    setSending(true);
    setStatus({ cls: "", msg: "" });
    try {
      const r = await fetch("/api/cotizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, slug: talento.slug }),
      });
      if (r.ok) {
        setStatus({ cls: "ok", msg: "¡Solicitud enviada! El equipo MOVDI te contacta pronto." });
        form.reset();
        setTimeout(() => setOpen(false), 2600);
      } else {
        setStatus({ cls: "err", msg: "Error al enviar. Escríbenos a hola@movdi.mx" });
      }
    } catch {
      setStatus({ cls: "err", msg: "Error al enviar. Escríbenos a hola@movdi.mx" });
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button className="btn-p" style={{ width: "100%", marginTop: 26 }} onClick={() => setOpen(true)}>
        Hablemos de {talento.nombre}
      </button>

      {open && (
        <div className="ov open" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="sheet glass" style={{ maxWidth: 520 }}>
            <button className="close" onClick={() => setOpen(false)}>✕</button>
            <div style={{ padding: 30 }}>
              <div className="lbl">Solicitar cotización</div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", margin: "14px 0 22px", padding: 12, borderRadius: 12, background: "rgba(255,255,255,.05)" }}>
                <img src={talento.photo} alt="" style={{ width: 48, height: 48, borderRadius: 9, objectFit: "cover", objectPosition: "top" }} />
                <div>
                  <div className="cond" style={{ fontSize: 21 }}>{talento.nombre}</div>
                  <div className="lbl" style={{ fontSize: 11 }}>Crew {talento.crew}</div>
                </div>
              </div>
              <form onSubmit={onSubmit}>
                <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: "-9999px" }} aria-hidden="true" />
                <div className="frow" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="field"><label htmlFor="q_nombre">Nombre</label><input id="q_nombre" name="nombre" /></div>
                  <div className="field"><label htmlFor="q_empresa">Empresa / Marca</label><input id="q_empresa" name="empresa" /></div>
                </div>
                <div className="frow" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="field"><label htmlFor="q_correo">Correo</label><input id="q_correo" name="correo" type="email" /></div>
                  <div className="field"><label htmlFor="q_tel">Teléfono</label><input id="q_tel" name="telefono" /></div>
                </div>
                <div className="field">
                  <label htmlFor="q_msg">Brief / mensaje</label>
                  <textarea id="q_msg" name="mensaje" placeholder="Cuéntanos de la campaña, fechas y presupuesto aproximado…" />
                </div>
                <button className="btn-p" style={{ width: "100%" }} disabled={sending}>
                  {sending ? "Enviando…" : "Enviar solicitud"}
                </button>
                <div className={`form-status ${status.cls}`}>{status.msg}</div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
