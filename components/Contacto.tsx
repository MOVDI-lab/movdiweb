"use client";

import { useState } from "react";

export default function Contacto() {
  const [status, setStatus] = useState<{ cls: string; msg: string }>({ cls: "", msg: "" });
  const [sending, setSending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    if (data.website) return; // honeypot anti-spam
    if (!data.nombre?.trim() || !data.correo?.trim()) {
      setStatus({ cls: "err", msg: "Pon al menos tu nombre y correo." });
      return;
    }
    setSending(true);
    setStatus({ cls: "", msg: "" });
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (r.ok) {
        setStatus({ cls: "ok", msg: "¡Mensaje enviado! Te contactamos en menos de 24h." });
        form.reset();
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
    <section id="hablemos" className="sec-pad">
      <div className="wrap">
        <div className="lbl reveal in">Contacto</div>
        <h2 className="sec-h reveal in">¿Tienes un proyecto <span className="em">en mente?</span></h2>
        <div className="contact">
          <div className="cinfo glass warm reveal in">
            <div className="ci"><div className="k">Correo</div><div className="v"><a href="mailto:hola@movdi.mx">hola@movdi.mx</a></div></div>
            <div className="ci"><div className="k">Teléfono / WhatsApp</div><div className="v"><a href="https://wa.me/525548418158" target="_blank" rel="noopener">+52 (55) 4841 8158</a></div></div>
            <div className="ci"><div className="k">Ubicación</div><div className="v">Ciudad de México, México</div></div>
            <div className="ci"><div className="k">Redes</div><div className="v"><a href="https://www.instagram.com/movdimx/" target="_blank" rel="noopener">Instagram</a> · <a href="https://wa.me/525548418158" target="_blank" rel="noopener">WhatsApp</a></div></div>
          </div>
          <form className="cform glass reveal in" onSubmit={onSubmit}>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: "-9999px" }} aria-hidden="true" />
            <div className="frow">
              <div className="field"><label htmlFor="c_nombre">Nombre</label><input id="c_nombre" name="nombre" /></div>
              <div className="field"><label htmlFor="c_empresa">Empresa / Marca</label><input id="c_empresa" name="empresa" /></div>
            </div>
            <div className="frow">
              <div className="field"><label htmlFor="c_correo">Correo</label><input id="c_correo" name="correo" type="email" /></div>
              <div className="field"><label htmlFor="c_tel">Teléfono</label><input id="c_tel" name="telefono" /></div>
            </div>
            <div className="field">
              <label htmlFor="c_serv">¿En qué podemos ayudarte?</label>
              <select id="c_serv" name="servicio" defaultValue="">
                <option value="">Selecciona un servicio</option>
                <option>Influencer Marketing / UGC</option>
                <option>We Speak Gaming</option>
                <option>Social Media &amp; Consultoría Estratégica</option>
                <option>Web Design</option>
                <option>Data Driven</option>
                <option>Branding</option>
              </select>
            </div>
            <div className="field"><label htmlFor="c_msg">Mensaje</label><textarea id="c_msg" name="mensaje" /></div>
            <button className="btn-p" style={{ width: "100%" }} disabled={sending}>
              {sending ? "Enviando…" : "Enviar mensaje"}
            </button>
            <div className={`form-status ${status.cls}`}>{status.msg}</div>
          </form>
        </div>
      </div>
    </section>
  );
}
