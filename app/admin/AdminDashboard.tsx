"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIAS, PLATAFORMAS } from "@/lib/data";
import type { Talento, MiembroEquipo, Plataforma, TeamAccess, TeamRole, Video } from "@/lib/types";
import "./admin.css";

export default function AdminDashboard({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [view, setView] = useState<"roster" | "equipo" | "accesos">("roster");
  const [talentos, setTalentos] = useState<Talento[]>([]);
  const [equipo, setEquipo] = useState<MiembroEquipo[]>([]);
  const [access, setAccess] = useState<TeamAccess[]>([]);
  const [myRole, setMyRole] = useState<TeamRole | null>(null);
  const [accessModal, setAccessModal] = useState<{ kind: "reset" | "offboard"; member: TeamAccess } | { kind: "add" } | null>(null);
  const [accessMsg, setAccessMsg] = useState("");
  const [search, setSearch] = useState("");
  const [crew, setCrew] = useState("todos");
  const [editTal, setEditTal] = useState<Talento | "new" | null>(null);
  const [editMem, setEditMem] = useState<MiembroEquipo | "new" | null>(null);

  const loadTalentos = useCallback(async () => {
    const { data, error } = await supabase.from("talentos").select("*").order("orden", { ascending: true });
    if (error) { alert("Error cargando talentos: " + error.message); return; }
    setTalentos((data ?? []) as Talento[]);
  }, [supabase]);

  const loadEquipo = useCallback(async () => {
    const { data, error } = await supabase.from("equipo").select("*").order("orden", { ascending: true });
    if (error) { console.error(error); return; }
    setEquipo((data ?? []) as MiembroEquipo[]);
  }, [supabase]);

  // RLS: un admin ve todas las filas; editor/viewer solo la suya (para conocer su rol).
  const loadAccess = useCallback(async () => {
    const { data, error } = await supabase.from("team_members").select("*").order("created_at", { ascending: true });
    if (error) { console.error(error); return; }
    const list = (data ?? []) as TeamAccess[];
    setAccess(list);
    setMyRole(list.find((m) => m.email.toLowerCase() === userEmail.toLowerCase())?.role ?? null);
  }, [supabase, userEmail]);

  useEffect(() => { loadTalentos(); loadEquipo(); loadAccess(); }, [loadTalentos, loadEquipo, loadAccess]);

  const isAdmin = myRole === "admin";
  const isMe = (m: TeamAccess) => m.email.toLowerCase() === userEmail.toLowerCase();

  // Nada de prompt/confirm/alert aquí: el navegador puede suprimir los
  // diálogos nativos sin avisar (y el botón parece muerto). Todo el flujo
  // de Accesos usa modales propios con estados visibles.
  async function changeRole(m: TeamAccess, role: TeamRole) {
    const { error } = await supabase.from("team_members").update({ role }).eq("id", m.id);
    setAccessMsg(error ? "No se pudo cambiar el rol: " + error.message : "");
    loadAccess();
  }

  async function toggleAccessActive(m: TeamAccess, val: boolean) {
    const { error } = await supabase.from("team_members").update({ active: val }).eq("id", m.id);
    setAccessMsg(error ? "No se pudo actualizar: " + error.message : "");
    loadAccess();
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  // ---- Talentos ----
  const filteredTal = useMemo(() => {
    const q = search.trim().toLowerCase();
    return talentos.filter((t) => {
      if (crew !== "todos" && t.crew !== crew) return false;
      if (!q) return true;
      return (t.nombre || "").toLowerCase().includes(q)
        || (t.slug || "").toLowerCase().includes(q)
        || (t.categorias || []).join(" ").toLowerCase().includes(q);
    });
  }, [talentos, search, crew]);

  async function toggleTalPub(id: string, val: boolean) {
    const { error } = await supabase.from("talentos").update({ publicado: val }).eq("id", id);
    if (error) { alert("No se pudo actualizar: " + error.message); loadTalentos(); return; }
    setTalentos((l) => l.map((t) => (t.id === id ? { ...t, publicado: val } : t)));
  }
  async function delTal(id: string, nombre: string) {
    if (!confirm(`¿Eliminar a ${nombre} del roster? Esta acción no se puede deshacer.`)) return;
    const { error } = await supabase.from("talentos").delete().eq("id", id);
    if (error) { alert("No se pudo eliminar: " + error.message); return; }
    loadTalentos();
  }

  async function toggleMemPub(id: string, val: boolean) {
    const { error } = await supabase.from("equipo").update({ publicado: val }).eq("id", id);
    if (error) { alert("No se pudo actualizar: " + error.message); loadEquipo(); return; }
    setEquipo((l) => l.map((m) => (m.id === id ? { ...m, publicado: val } : m)));
  }
  async function delMem(id: string, nombre: string) {
    if (!confirm(`¿Eliminar a ${nombre} del equipo?`)) return;
    const { error } = await supabase.from("equipo").delete().eq("id", id);
    if (error) { alert("No se pudo eliminar: " + error.message); return; }
    loadEquipo();
  }

  return (
    <div className="admin-root">
      <div className="a-wrap">
        <div className="a-top">
          <div className="a-brand"><span className="dot" /><b>MOVDI</b></div>
          <span className="who">{userEmail}</span>
          <div className="sp" />
          <button className="a-btn ghost sm" onClick={logout}>Salir</button>
        </div>

        <div className="a-tabs">
          <button className={`a-tab${view === "roster" ? " active" : ""}`} onClick={() => setView("roster")}>Roster</button>
          <button className={`a-tab${view === "equipo" ? " active" : ""}`} onClick={() => setView("equipo")}>Equipo</button>
          {isAdmin && (
            <button className={`a-tab${view === "accesos" ? " active" : ""}`} onClick={() => setView("accesos")}>Accesos</button>
          )}
        </div>

        {view === "roster" ? (
          <>
            <div className="a-bar">
              <input className="a-ctrl" style={{ maxWidth: 260 }} placeholder="Buscar talento…" value={search} onChange={(e) => setSearch(e.target.value)} />
              {["todos", "MOVDI", "UGC"].map((c) => (
                <button key={c} className={`a-tab${crew === c ? " active" : ""}`} onClick={() => setCrew(c)}>{c === "todos" ? "Todos" : c}</button>
              ))}
              <span className="count">{filteredTal.length} de {talentos.length}</span>
              <div className="sp" />
              <button className="a-btn sm" onClick={() => setEditTal("new")}>+ Nuevo talento</button>
            </div>
            <div className="a-card">
              {filteredTal.length === 0 ? (
                <div className="a-empty">Sin resultados.</div>
              ) : filteredTal.map((t) => (
                <div className="a-row" key={t.id}>
                  <img className="a-ph" src={t.photo} alt="" />
                  <div><div className="a-nm">{t.nombre}</div><div className="a-slug">/{t.slug}</div></div>
                  <div className="c-tier"><span className="a-tag">{t.tier || "—"}</span></div>
                  <div><span className="a-tag">{t.crew}</span></div>
                  <label className="a-switch">
                    <input type="checkbox" checked={!!t.publicado} onChange={(e) => toggleTalPub(t.id, e.target.checked)} />
                    <span className="a-slider" />
                  </label>
                  <div className="a-acts">
                    <button className="a-btn ghost sm" onClick={() => setEditTal(t)}>Editar</button>
                    <button className="a-btn ghost sm" onClick={() => delTal(t.id, t.nombre)} style={{ color: "var(--red)" }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : view === "equipo" ? (
          <>
            <div className="a-bar">
              <span className="count">{equipo.length} en el equipo</span>
              <div className="sp" />
              <button className="a-btn sm" onClick={() => setEditMem("new")}>+ Nueva persona</button>
            </div>
            <div className="a-card">
              {equipo.length === 0 ? (
                <div className="a-empty">Aún no hay personas.</div>
              ) : equipo.map((m) => (
                <div className="a-row team" key={m.id}>
                  <img className="a-ph" src={m.foto} alt="" />
                  <div><div className="a-nm">{m.nombre}</div></div>
                  <div className="c-puesto a-slug">{m.puesto}</div>
                  <label className="a-switch">
                    <input type="checkbox" checked={!!m.publicado} onChange={(e) => toggleMemPub(m.id, e.target.checked)} />
                    <span className="a-slider" />
                  </label>
                  <div className="a-acts">
                    <button className="a-btn ghost sm" onClick={() => setEditMem(m)}>Editar</button>
                    <button className="a-btn ghost sm" onClick={() => delMem(m.id, m.nombre)} style={{ color: "var(--red)" }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="a-bar">
              <span className="count">{access.length} accesos · los usuarios de Auth se crean a mano en el dashboard de Supabase</span>
              {accessMsg && <span className="a-msg err" style={{ marginTop: 0 }}>{accessMsg}</span>}
              <div className="sp" />
              <button className="a-btn sm" onClick={() => setAccessModal({ kind: "add" })}>+ Agregar acceso</button>
            </div>
            <div className="a-card">
              {access.length === 0 ? (
                <div className="a-empty">Sin accesos.</div>
              ) : access.map((m) => (
                <div className="a-row access" key={m.id}>
                  <div>
                    <div className="a-nm">{m.name || m.email}{isMe(m) ? " (tú)" : ""}</div>
                    <div className="a-slug">{m.email}</div>
                  </div>
                  <select className="a-ctrl" value={m.role} onChange={(e) => changeRole(m, e.target.value as TeamRole)}>
                    <option value="admin">admin</option>
                    <option value="editor">editor</option>
                    <option value="viewer">viewer</option>
                  </select>
                  <label className="a-switch" title={m.active ? "Acceso activo" : "Acceso desactivado"}>
                    <input type="checkbox" checked={m.active} onChange={(e) => toggleAccessActive(m, e.target.checked)} />
                    <span className="a-slider" />
                  </label>
                  <div className="a-acts">
                    <button className="a-btn ghost sm" onClick={() => setAccessModal({ kind: "reset", member: m })} disabled={isMe(m)} title={isMe(m) ? "Para tu propia cuenta usa «¿Olvidaste tu contraseña?»" : ""}>Resetear contraseña</button>
                    <button className="a-btn ghost sm" onClick={() => setAccessModal({ kind: "offboard", member: m })} disabled={isMe(m)} style={{ color: "var(--red)" }}>Dar de baja</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {editTal && (
        <TalentEditor
          supabase={supabase}
          talento={editTal === "new" ? null : editTal}
          orderHint={talentos.length}
          onClose={() => setEditTal(null)}
          onSaved={() => { setEditTal(null); loadTalentos(); }}
        />
      )}
      {editMem && (
        <TeamEditor
          supabase={supabase}
          miembro={editMem === "new" ? null : editMem}
          orderHint={equipo.length}
          onClose={() => setEditMem(null)}
          onSaved={() => { setEditMem(null); loadEquipo(); }}
        />
      )}
      {accessModal && accessModal.kind !== "add" && (
        <AccessActionModal
          supabase={supabase}
          kind={accessModal.kind}
          member={accessModal.member}
          onClose={() => setAccessModal(null)}
          onChanged={loadAccess}
        />
      )}
      {accessModal?.kind === "add" && (
        <AccessAddModal
          supabase={supabase}
          onClose={() => setAccessModal(null)}
          onSaved={() => { setAccessModal(null); loadAccess(); }}
        />
      )}
    </div>
  );
}

/* ============================ EDITOR DE TALENTO ============================ */
type SB = ReturnType<typeof createClient>;

/* ===================== MODALES DE ACCESOS (solo admin) ===================== */

function AccessActionModal({ supabase, kind, member, onClose, onChanged }: {
  supabase: SB; kind: "reset" | "offboard"; member: TeamAccess; onClose: () => void; onChanged: () => void;
}) {
  const [temp, setTemp] = useState("");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ temp_password?: string; sessions_revoked?: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  const title = kind === "reset" ? "Resetear contraseña" : "Dar de baja";

  async function run() {
    if (kind === "reset" && temp && temp.length < 12) {
      setError("La contraseña temporal debe tener al menos 12 caracteres.");
      return;
    }
    setError("");
    setWorking(true);
    const { data, error: fnError } = await supabase.functions.invoke("admin-reset-password", {
      body: { action: kind, target_email: member.email, ...(kind === "reset" && temp ? { temp_password: temp } : {}) },
    });
    setWorking(false);
    if (fnError) {
      let msg = fnError.message;
      try { msg = (await (fnError as unknown as { context: Response }).context.json()).error ?? msg; } catch { /* se queda el genérico */ }
      setError(msg);
      return;
    }
    setDone((data ?? {}) as { temp_password?: string; sessions_revoked?: boolean });
    onChanged();
  }

  async function copy(text: string) {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { /* el <code> permite seleccionar a mano */ }
  }

  return (
    <div className="a-overlay" onClick={(e) => { if (e.target === e.currentTarget && !working) onClose(); }}>
      <div className="a-modal" style={{ maxWidth: 460 }}>
        <header><h3>{title}</h3></header>
        <div className="body">
          {done ? (
            <>
              <div className="a-msg ok" style={{ marginTop: 0 }}>
                {kind === "reset"
                  ? `Contraseña de ${member.email} cambiada${done.sessions_revoked ? " y sesiones cerradas" : ""}.`
                  : `${member.email} quedó fuera del panel: contraseña aleatoria, sesiones cerradas y acceso desactivado.`}
              </div>
              {done.temp_password && (
                <>
                  <p className="a-sub" style={{ margin: 0 }}>Contraseña temporal — se muestra solo una vez, cópiala ahora:</p>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <code style={{ flex: 1, padding: "10px 12px", background: "#f0ebe1", borderRadius: 10, fontSize: 14, wordBreak: "break-all", userSelect: "all" }}>{done.temp_password}</code>
                    <button className="a-btn ghost sm" onClick={() => copy(done.temp_password!)}>{copied ? "¡Copiada!" : "Copiar"}</button>
                  </div>
                </>
              )}
            </>
          ) : kind === "reset" ? (
            <>
              <p className="a-sub" style={{ margin: 0 }}>
                Se cambiará la contraseña de <b>{member.email}</b> y se cerrarán sus sesiones.
                Escribe una temporal, o deja el campo vacío para generar una aleatoria segura (se mostrará aquí una sola vez).
              </p>
              <label className="a-fld" style={{ marginBottom: 0 }}>
                <span>Contraseña temporal (opcional · mínimo 12 caracteres)</span>
                <input className="a-ctrl" type="text" value={temp} onChange={(e) => setTemp(e.target.value)} placeholder="Vacío = aleatoria segura" autoComplete="off" />
              </label>
            </>
          ) : (
            <p className="a-sub" style={{ margin: 0 }}>
              <b>{member.email}</b> quedará fuera del panel: su contraseña cambia a una aleatoria que nadie
              conoce, se cierran sus sesiones y su acceso se desactiva. Su usuario de Auth no se borra.
            </p>
          )}
          {error && <div className="a-msg err" style={{ marginTop: 0 }}>{error}</div>}
        </div>
        <footer>
          {done ? (
            <button className="a-btn" onClick={onClose}>Cerrar</button>
          ) : (
            <>
              <button className="a-btn ghost" onClick={onClose} disabled={working}>Cancelar</button>
              <button className="a-btn" style={kind === "offboard" ? { background: "var(--red)" } : undefined} onClick={run} disabled={working}>
                {working ? "Aplicando…" : title}
              </button>
            </>
          )}
        </footer>
      </div>
    </div>
  );
}

function AccessAddModal({ supabase, onClose, onSaved }: { supabase: SB; onClose: () => void; onSaved: () => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<TeamRole>("viewer");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    const mail = email.trim().toLowerCase();
    if (!mail || !mail.includes("@")) { setError("Escribe un correo válido."); return; }
    setError("");
    setSaving(true);
    const { error: dbError } = await supabase.from("team_members").insert({ email: mail, name: name.trim(), role });
    setSaving(false);
    if (dbError) { setError("No se pudo agregar: " + dbError.message); return; }
    onSaved();
  }

  return (
    <div className="a-overlay" onClick={(e) => { if (e.target === e.currentTarget && !saving) onClose(); }}>
      <div className="a-modal" style={{ maxWidth: 460 }}>
        <header><h3>Agregar acceso</h3></header>
        <div className="body">
          <p className="a-sub" style={{ margin: 0 }}>
            Aquí solo se otorga el rol en el panel. Su usuario de Auth (correo y contraseña)
            se crea aparte, en el dashboard de Supabase.
          </p>
          <label className="a-fld" style={{ marginBottom: 0 }}>
            <span>Correo</span>
            <input className="a-ctrl" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />
          </label>
          <label className="a-fld" style={{ marginBottom: 0 }}>
            <span>Nombre</span>
            <input className="a-ctrl" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
          </label>
          <label className="a-fld" style={{ marginBottom: 0 }}>
            <span>Rol</span>
            <select className="a-ctrl" value={role} onChange={(e) => setRole(e.target.value as TeamRole)}>
              <option value="viewer">viewer</option>
              <option value="editor">editor</option>
              <option value="admin">admin</option>
            </select>
          </label>
          {error && <div className="a-msg err" style={{ marginTop: 0 }}>{error}</div>}
        </div>
        <footer>
          <button className="a-btn ghost" onClick={onClose} disabled={saving}>Cancelar</button>
          <button className="a-btn" onClick={save} disabled={saving}>{saving ? "Guardando…" : "Agregar"}</button>
        </footer>
      </div>
    </div>
  );
}

function TalentEditor({ supabase, talento, orderHint, onClose, onSaved }: {
  supabase: SB; talento: Talento | null; orderHint: number; onClose: () => void; onSaved: () => void;
}) {
  const [f, setF] = useState({
    nombre: talento?.nombre || "",
    slug: talento?.slug || "",
    crew: talento?.crew || "MOVDI",
    tier: talento?.tier || "Mega",
    orden: String(talento?.orden ?? orderHint),
    ciudad: talento?.ciudad || "México",
    photo: talento?.photo || "",
    bio: talento?.bio || "",
    audiencia: talento?.audiencia || "",
    pm_email: talento?.pm_email || "",
    publicado: talento ? !!talento.publicado : true,
  });
  const [cats, setCats] = useState<string[]>([...(talento?.categorias || [])]);
  const [brands, setBrands] = useState<string[]>([...(talento?.marcas || [])]);
  const [plats, setPlats] = useState<Plataforma[]>(
    talento?.plataformas?.length ? [...talento.plataformas] : [{ plataforma: "TikTok" }]
  );
  const [vids, setVids] = useState<Video[]>([...(talento?.videos || [])]);
  const [catInput, setCatInput] = useState("");
  const [brandInput, setBrandInput] = useState("");
  const [msg, setMsg] = useState<{ cls: string; text: string }>({ cls: "", text: "" });
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof f, v: string | boolean) => setF((s) => ({ ...s, [k]: v }));
  const addChip = (arr: string[], setArr: (a: string[]) => void, v: string, clear: () => void) => {
    const val = v.trim(); if (!val) return;
    if (!arr.includes(val)) setArr([...arr, val]);
    clear();
  };

  async function save() {
    setMsg({ cls: "", text: "" });
    const nombre = f.nombre.trim();
    const slug = f.slug.trim().toLowerCase().replace(/\s+/g, "-");
    if (!nombre || !slug) { setMsg({ cls: "err", text: "Nombre y slug son obligatorios." }); return; }

    const plataformas = plats
      .map((p) => ({
        plataforma: p.plataforma, handle: (p.handle || "").trim(),
        link: (p.link || "").trim(), seguidores: (p.seguidores || "").trim(), er: (p.er || "").trim(),
      }))
      .filter((p) => p.handle || p.link);
    const videos = vids
      .map((v) => ({ titulo: (v.titulo || "").trim(), link: (v.link || "").trim(), tipo: v.tipo || "Orgánico" }))
      .filter((v) => v.titulo || v.link);

    const payload = {
      nombre, slug, crew: f.crew, tier: f.tier,
      orden: parseInt(f.orden || "0", 10), ciudad: f.ciudad.trim(),
      photo: f.photo.trim(), bio: f.bio.trim(), audiencia: f.audiencia.trim(),
      pm_email: f.pm_email.trim(), categorias: cats, marcas: brands, plataformas, videos,
      publicado: f.publicado,
    };

    setSaving(true);
    const { error } = talento
      ? await supabase.from("talentos").update(payload).eq("id", talento.id)
      : await supabase.from("talentos").insert(payload);
    setSaving(false);
    if (error) {
      setMsg({ cls: "err", text: error.code === "23505" ? "Ese slug ya existe, usa otro." : error.message });
      return;
    }
    onSaved();
  }

  return (
    <div className="a-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="a-modal">
        <header><h3>{talento ? "Editar talento" : "Nuevo talento"}</h3></header>
        <div className="body">
          <div className="a-grid2">
            <label className="a-fld"><span>Nombre</span><input className="a-ctrl" value={f.nombre} onChange={(e) => set("nombre", e.target.value)} /></label>
            <label className="a-fld"><span>Slug</span><input className="a-ctrl" value={f.slug} onChange={(e) => set("slug", e.target.value)} /></label>
          </div>
          <div className="a-grid3">
            <label className="a-fld"><span>Crew</span>
              <select className="a-ctrl" value={f.crew} onChange={(e) => set("crew", e.target.value)}><option>MOVDI</option><option>UGC</option></select>
            </label>
            <label className="a-fld"><span>Tier</span>
              <select className="a-ctrl" value={f.tier} onChange={(e) => set("tier", e.target.value)}><option>Mega</option><option>Macro</option><option>Micro</option></select>
            </label>
            <label className="a-fld"><span>Orden</span><input className="a-ctrl" type="number" value={f.orden} onChange={(e) => set("orden", e.target.value)} /></label>
          </div>
          <div className="a-grid2">
            <label className="a-fld"><span>Ciudad</span><input className="a-ctrl" value={f.ciudad} onChange={(e) => set("ciudad", e.target.value)} /></label>
            <label className="a-fld"><span>Correo del manager (pm_email)</span><input className="a-ctrl" value={f.pm_email} onChange={(e) => set("pm_email", e.target.value)} /></label>
          </div>
          <label className="a-fld"><span>Foto (URL)</span><input className="a-ctrl" value={f.photo} onChange={(e) => set("photo", e.target.value)} /></label>
          {f.photo && <img className="a-prev" src={f.photo} alt="" />}
          <label className="a-fld"><span>Bio</span><textarea className="a-ctrl" rows={3} value={f.bio} onChange={(e) => set("bio", e.target.value)} /></label>
          <label className="a-fld"><span>Audiencia (ej. &quot;Edad: 18-24 · Género: 60% F · País: México&quot;)</span><textarea className="a-ctrl" rows={2} value={f.audiencia} onChange={(e) => set("audiencia", e.target.value)} /></label>

          <div>
            <span className="a-slug" style={{ display: "block", marginBottom: 6 }}>Categorías</span>
            <div className="a-chips" style={{ marginBottom: 8 }}>
              {cats.length ? cats.map((c, i) => (
                <span className="a-chip" key={c}>{c}<b onClick={() => setCats(cats.filter((_, j) => j !== i))}>✕</b></span>
              )) : <span className="a-slug">Ninguna aún</span>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="a-ctrl" list="cat-list" value={catInput} onChange={(e) => setCatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addChip(cats, setCats, catInput, () => setCatInput("")); } }} />
              <datalist id="cat-list">{CATEGORIAS.map((c) => <option key={c} value={c} />)}</datalist>
              <button className="a-btn ghost sm" onClick={() => addChip(cats, setCats, catInput, () => setCatInput(""))}>Añadir</button>
            </div>
          </div>

          <div>
            <span className="a-slug" style={{ display: "block", marginBottom: 6 }}>Marcas</span>
            <div className="a-chips" style={{ marginBottom: 8 }}>
              {brands.length ? brands.map((c, i) => (
                <span className="a-chip brand" key={c}>{c}<b onClick={() => setBrands(brands.filter((_, j) => j !== i))}>✕</b></span>
              )) : <span className="a-slug">Ninguna aún</span>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="a-ctrl" value={brandInput} onChange={(e) => setBrandInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addChip(brands, setBrands, brandInput, () => setBrandInput("")); } }} />
              <button className="a-btn ghost sm" onClick={() => addChip(brands, setBrands, brandInput, () => setBrandInput(""))}>Añadir</button>
            </div>
          </div>

          <div>
            <span className="a-slug" style={{ display: "block", marginBottom: 6 }}>Plataformas</span>
            {plats.map((p, i) => (
              <div className="a-rowedit" key={i} style={{ marginBottom: 8 }}>
                <button className="a-rm" onClick={() => setPlats(plats.filter((_, j) => j !== i))}>✕</button>
                <div className="a-grid3">
                  <select className="a-ctrl" value={p.plataforma} onChange={(e) => setPlats(plats.map((x, j) => j === i ? { ...x, plataforma: e.target.value } : x))}>
                    {PLATAFORMAS.map((x) => <option key={x}>{x}</option>)}
                  </select>
                  <input className="a-ctrl" placeholder="@handle" value={p.handle || ""} onChange={(e) => setPlats(plats.map((x, j) => j === i ? { ...x, handle: e.target.value } : x))} />
                  <input className="a-ctrl" placeholder="ER %" value={p.er || ""} onChange={(e) => setPlats(plats.map((x, j) => j === i ? { ...x, er: e.target.value } : x))} />
                </div>
                <input className="a-ctrl" placeholder="https://…" value={p.link || ""} onChange={(e) => setPlats(plats.map((x, j) => j === i ? { ...x, link: e.target.value } : x))} />
                <input className="a-ctrl" placeholder="Seguidores (ej. 1.2M)" value={p.seguidores || ""} onChange={(e) => setPlats(plats.map((x, j) => j === i ? { ...x, seguidores: e.target.value } : x))} />
              </div>
            ))}
            <button className="a-btn ghost sm" onClick={() => setPlats([...plats, { plataforma: "TikTok" }])}>+ Plataforma</button>
          </div>

          <div>
            <span className="a-slug" style={{ display: "block", marginBottom: 6 }}>Videos destacados</span>
            {vids.map((v, i) => (
              <div className="a-rowedit" key={i} style={{ marginBottom: 8 }}>
                <button className="a-rm" onClick={() => setVids(vids.filter((_, j) => j !== i))}>✕</button>
                <input className="a-ctrl" placeholder="Título del video" value={v.titulo || ""} onChange={(e) => setVids(vids.map((x, j) => j === i ? { ...x, titulo: e.target.value } : x))} />
                <div className="a-grid2">
                  <input className="a-ctrl" placeholder="https://…" value={v.link || ""} onChange={(e) => setVids(vids.map((x, j) => j === i ? { ...x, link: e.target.value } : x))} />
                  <select className="a-ctrl" value={v.tipo || "Orgánico"} onChange={(e) => setVids(vids.map((x, j) => j === i ? { ...x, tipo: e.target.value } : x))}>
                    <option>Orgánico</option><option>Marca</option>
                  </select>
                </div>
              </div>
            ))}
            <button className="a-btn ghost sm" onClick={() => setVids([...vids, { titulo: "", link: "", tipo: "Orgánico" }])}>+ Video</button>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input type="checkbox" checked={f.publicado} onChange={(e) => set("publicado", e.target.checked)} /> Publicado
          </label>
          <div className={`a-msg ${msg.cls}`}>{msg.text}</div>
        </div>
        <footer>
          <button className="a-btn ghost" onClick={onClose}>Cancelar</button>
          <button className="a-btn" onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</button>
        </footer>
      </div>
    </div>
  );
}

/* ============================ EDITOR DE EQUIPO ============================ */
function TeamEditor({ supabase, miembro, orderHint, onClose, onSaved }: {
  supabase: SB; miembro: MiembroEquipo | null; orderHint: number; onClose: () => void; onSaved: () => void;
}) {
  const [f, setF] = useState({
    nombre: miembro?.nombre || "", puesto: miembro?.puesto || "", frase: miembro?.frase || "",
    foto: miembro?.foto || "", orden: String(miembro?.orden ?? orderHint), publicado: miembro ? !!miembro.publicado : true,
  });
  const [msg, setMsg] = useState<{ cls: string; text: string }>({ cls: "", text: "" });
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof f, v: string | boolean) => setF((s) => ({ ...s, [k]: v }));

  async function save() {
    setMsg({ cls: "", text: "" });
    if (!f.nombre.trim()) { setMsg({ cls: "err", text: "El nombre es obligatorio." }); return; }
    const payload = {
      nombre: f.nombre.trim(), puesto: f.puesto.trim(), frase: f.frase.trim(),
      foto: f.foto.trim(), orden: parseInt(f.orden || "0", 10), publicado: f.publicado,
    };
    setSaving(true);
    const { error } = miembro
      ? await supabase.from("equipo").update(payload).eq("id", miembro.id)
      : await supabase.from("equipo").insert(payload);
    setSaving(false);
    if (error) { setMsg({ cls: "err", text: error.message }); return; }
    onSaved();
  }

  return (
    <div className="a-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="a-modal">
        <header><h3>{miembro ? "Editar persona" : "Nueva persona"}</h3></header>
        <div className="body">
          <div className="a-grid2">
            <label className="a-fld"><span>Nombre</span><input className="a-ctrl" value={f.nombre} onChange={(e) => set("nombre", e.target.value)} /></label>
            <label className="a-fld"><span>Puesto</span><input className="a-ctrl" value={f.puesto} onChange={(e) => set("puesto", e.target.value)} /></label>
          </div>
          <label className="a-fld"><span>Frase</span><textarea className="a-ctrl" rows={2} value={f.frase} onChange={(e) => set("frase", e.target.value)} /></label>
          <label className="a-fld"><span>Foto (URL)</span><input className="a-ctrl" value={f.foto} onChange={(e) => set("foto", e.target.value)} /></label>
          {f.foto && <img className="a-prev" src={f.foto} alt="" />}
          <label className="a-fld"><span>Orden</span><input className="a-ctrl" type="number" value={f.orden} onChange={(e) => set("orden", e.target.value)} /></label>
          <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input type="checkbox" checked={f.publicado} onChange={(e) => set("publicado", e.target.checked)} /> Publicado
          </label>
          <div className={`a-msg ${msg.cls}`}>{msg.text}</div>
        </div>
        <footer>
          <button className="a-btn ghost" onClick={onClose}>Cancelar</button>
          <button className="a-btn" onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</button>
        </footer>
      </div>
    </div>
  );
}
