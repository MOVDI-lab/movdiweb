"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import "../admin.css";

export default function ResetPassword() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [ready, setReady] = useState(false); // sesión de recuperación detectada
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ cls: string; text: string }>({ cls: "", text: "" });

  // El enlace del correo trae un token; Supabase lo procesa y abre una sesión
  // temporal de recuperación. Esperamos a que exista para permitir el cambio.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pwd.length < 8) { setMsg({ cls: "err", text: "La contraseña debe tener al menos 8 caracteres." }); return; }
    if (pwd !== pwd2) { setMsg({ cls: "err", text: "Las contraseñas no coinciden." }); return; }
    setLoading(true);
    setMsg({ cls: "", text: "" });
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setLoading(false);
    if (error) { setMsg({ cls: "err", text: error.message }); return; }
    setMsg({ cls: "ok", text: "¡Contraseña actualizada! Entrando al panel…" });
    setTimeout(() => { router.replace("/admin"); router.refresh(); }, 1500);
  }

  return (
    <div className="admin-root">
      <div className="a-login">
        <form className="a-login-card" onSubmit={onSubmit}>
          <div className="a-brand"><span className="dot" /><b>MOVDI</b></div>
          <h2>Nueva contraseña</h2>
          {ready ? (
            <>
              <p className="a-sub">Escribe tu nueva contraseña para el panel.</p>
              <label className="a-fld">
                <span>Nueva contraseña</span>
                <input className="a-ctrl" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} autoComplete="new-password" />
              </label>
              <label className="a-fld">
                <span>Repite la contraseña</span>
                <input className="a-ctrl" type="password" value={pwd2} onChange={(e) => setPwd2(e.target.value)} autoComplete="new-password" />
              </label>
              <button className="a-btn full" disabled={loading}>{loading ? "Guardando…" : "Guardar contraseña"}</button>
            </>
          ) : (
            <p className="a-sub">
              Abre esta página desde el enlace que te llegó por correo. Si el enlace
              expiró, vuelve al <a href="/admin/login" style={{ color: "var(--orange)" }}>inicio de sesión</a> y
              solicita uno nuevo.
            </p>
          )}
          <div className={`a-msg ${msg.cls}`}>{msg.text}</div>
        </form>
      </div>
    </div>
  );
}
