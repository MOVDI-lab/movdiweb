"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import "../admin.css";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<{ cls: string; text: string }>({ cls: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setMsg({ cls: "err", text: "Pon tu correo y contraseña." });
      return;
    }
    setLoading(true);
    setMsg({ cls: "", text: "" });
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setMsg({
        cls: "err",
        text: error.message.includes("Invalid") ? "Correo o contraseña incorrectos." : error.message,
      });
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  async function onForgot() {
    if (!email) {
      setMsg({ cls: "err", text: "Escribe tu correo arriba y vuelve a dar clic en «¿Olvidaste tu contraseña?»." });
      return;
    }
    setResetting(true);
    setMsg({ cls: "", text: "" });
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset`,
    });
    setResetting(false);
    if (error) {
      setMsg({ cls: "err", text: error.message });
      return;
    }
    setMsg({ cls: "ok", text: "Te enviamos un correo para restablecer tu contraseña. Revisa tu bandeja (y spam)." });
  }

  return (
    <div className="admin-root">
      <div className="a-login">
        <form className="a-login-card" onSubmit={onSubmit}>
          <div className="a-brand"><span className="dot" /><b>MOVDI</b></div>
          <h2>Panel de Roster</h2>
          <p className="a-sub">Inicia sesión para administrar talentos y equipo.</p>
          <label className="a-fld">
            <span>Correo</span>
            <input className="a-ctrl" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </label>
          <label className="a-fld">
            <span>Contraseña</span>
            <input className="a-ctrl" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </label>
          <button className="a-btn full" disabled={loading}>{loading ? "Entrando…" : "Entrar"}</button>
          <button
            type="button"
            onClick={onForgot}
            disabled={resetting}
            style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 13, marginTop: 12, cursor: "pointer", textDecoration: "underline", padding: 0 }}
          >
            {resetting ? "Enviando…" : "¿Olvidaste tu contraseña?"}
          </button>
          <div className={`a-msg ${msg.cls}`}>{msg.text}</div>
        </form>
      </div>
    </div>
  );
}
