// admin-reset-password — Reset de contraseña / offboarding, solo para admins.
//
// Acciones (POST JSON):
//   { action: "reset",    target_email, temp_password? }
//     Cambia la contraseña del usuario (la temporal dada, o una aleatoria
//     que se devuelve una sola vez) y cierra sus sesiones.
//   { action: "offboard", target_email }
//     Contraseña aleatoria NO revelada + cierra sesiones + desactiva su fila
//     en team_members. La persona queda fuera; su usuario de Auth NO se borra.
//   { action: "create", target_email, name?, role?, temp_password? }
//     Alta completa: crea el usuario de Auth (si no existe) con contraseña
//     temporal (la dada o una aleatoria que se devuelve una sola vez) y
//     upserta su fila en team_members con el rol elegido, active=true.
//     Si el usuario de Auth ya existía, NO se toca su contraseña.
//
// Seguridad: el JWT del caller se valida y debe corresponder a un
// team_member con role='admin' y active=true. La service role key vive solo
// aquí (secreto de la función), nunca en el navegador. Cada acción se
// registra en public.admin_audit.

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const ALLOWED_ORIGINS = new Set([
  "https://movdi.mx",
  "https://www.movdi.mx",
  "http://localhost:3000",
]);

// Deploy previews de Netlify del propio sitio (https://deploy-preview-N--movdiweb.netlify.app)
const PREVIEW_ORIGIN = /^https:\/\/deploy-preview-\d+--movdiweb\.netlify\.app$/;

function corsHeaders(origin: string | null) {
  const allowed = origin !== null && (ALLOWED_ORIGINS.has(origin) || PREVIEW_ORIGIN.test(origin));
  return {
    "Access-Control-Allow-Origin": allowed ? origin! : "https://movdi.mx",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };
}

// Charset de 64 símbolos: sin sesgo de módulo y sin caracteres ambiguos.
const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*-";
function randomPassword(len = 24) {
  const buf = new Uint32Array(len);
  crypto.getRandomValues(buf);
  return Array.from(buf, (n) => CHARSET[n % CHARSET.length]).join("");
}

Deno.serve(async (req: Request) => {
  const headers = corsHeaders(req.headers.get("origin"));
  const reply = (status: number, body: Record<string, unknown>) =>
    new Response(JSON.stringify(body), { status, headers });

  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST") return reply(405, { error: "Método no permitido." });

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1) ¿Quién llama? (JWT ya validado por el gateway; aquí lo resolvemos a usuario)
  const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: { user: caller }, error: authError } = await admin.auth.getUser(jwt);
  if (authError || !caller?.email) return reply(401, { error: "Sesión inválida." });

  // 2) ¿Es admin activo del equipo?
  const { data: membership } = await admin
    .from("team_members")
    .select("role, active")
    .ilike("email", caller.email)
    .maybeSingle();
  if (!membership || membership.role !== "admin" || !membership.active) {
    return reply(403, { error: "Solo un administrador activo puede usar esta función." });
  }

  // 3) Payload
  let body: { action?: string; target_email?: string; temp_password?: string; name?: string; role?: string };
  try { body = await req.json(); } catch { return reply(400, { error: "JSON inválido." }); }
  const action = body.action;
  const target = (body.target_email ?? "").trim().toLowerCase();
  const tempPassword = body.temp_password;
  const memberName = typeof body.name === "string" ? body.name.trim() : "";
  const memberRole = typeof body.role === "string" ? body.role : "viewer";

  if (action !== "reset" && action !== "offboard" && action !== "create") {
    return reply(400, { error: "action debe ser 'reset', 'offboard' o 'create'." });
  }
  if (!target) return reply(400, { error: "Falta target_email." });
  if (action !== "create" && target === caller.email.toLowerCase()) {
    return reply(400, { error: "No puedes resetearte o darte de baja a ti misma desde aquí. Usa «¿Olvidaste tu contraseña?»." });
  }
  if (tempPassword !== undefined && (typeof tempPassword !== "string" || tempPassword.length < 12)) {
    return reply(400, { error: "La contraseña temporal debe tener al menos 12 caracteres." });
  }

  // 4) Usuario de Auth destino (el equipo es pequeño: una página basta)
  const { data: usersPage, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) return reply(500, { error: "No se pudo consultar usuarios: " + listError.message });
  const targetUser = usersPage.users.find((u) => u.email?.toLowerCase() === target);

  // 4b) Alta completa (action=create)
  if (action === "create") {
    if (!["admin", "editor", "viewer"].includes(memberRole)) return reply(400, { error: "Rol inválido." });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(target)) return reply(400, { error: "Correo inválido." });

    const generatedForCreate = randomPassword();
    let authCreated = false;
    if (!targetUser) {
      const { error: createError } = await admin.auth.admin.createUser({
        email: target,
        password: tempPassword || generatedForCreate,
        email_confirm: true,
      });
      if (createError) return reply(500, { error: "No se pudo crear el usuario de Auth: " + createError.message });
      authCreated = true;
    }

    const row: Record<string, unknown> = { email: target, role: memberRole, active: true };
    if (memberName) row.name = memberName;
    const { error: upsertError } = await admin.from("team_members").upsert(row, { onConflict: "email" });
    if (upsertError) {
      return reply(500, { error: (authCreated ? "Usuario de Auth creado, pero " : "") + "no se pudo guardar el acceso: " + upsertError.message });
    }

    await admin.from("admin_audit").insert({
      actor_email: caller.email,
      action: "user_create",
      target_email: target,
      detail: { role: memberRole, auth_created: authCreated, temp_password_provided: !!tempPassword },
    });

    return reply(200, {
      ok: true,
      action,
      target_email: target,
      auth_created: authCreated,
      // Solo si se creó el usuario con contraseña generada: se muestra una vez.
      ...(authCreated && !tempPassword ? { temp_password: generatedForCreate } : {}),
    });
  }

  if (!targetUser) return reply(404, { error: "No existe un usuario de Auth con ese correo." });

  // 5) Nueva contraseña: la temporal del admin (solo en reset) o una aleatoria
  const generated = randomPassword();
  const newPassword = action === "reset" && tempPassword ? tempPassword : generated;
  const { error: updateError } = await admin.auth.admin.updateUserById(targetUser.id, { password: newPassword });
  if (updateError) return reply(500, { error: "No se pudo cambiar la contraseña: " + updateError.message });

  // 6) Revoca sus sesiones via RPC (migración 0003). El endpoint admin de
  //    logout de GoTrue resultó no fiable; el RPC borra refresh tokens y
  //    sesiones directamente. Si fallara, la contraseña ya cambió: solo
  //    tardarían en caducar los access tokens vivos (~1 h).
  const { error: revokeError } = await admin.rpc("revoke_user_sessions", { target_user: targetUser.id });
  const sessionsRevoked = !revokeError;

  // 7) Offboarding: desactiva su acceso al panel (la fila se conserva como traza)
  if (action === "offboard") {
    const { error: deactivateError } = await admin
      .from("team_members")
      .update({ active: false })
      .ilike("email", target);
    if (deactivateError) return reply(500, { error: "Contraseña reseteada, pero no se pudo desactivar en team_members: " + deactivateError.message });
  }

  // 8) Traza
  await admin.from("admin_audit").insert({
    actor_email: caller.email,
    action: action === "reset" ? "password_reset" : "offboard",
    target_email: target,
    detail: {
      temp_password_provided: action === "reset" && !!tempPassword,
      sessions_revoked: sessionsRevoked,
    },
  });

  return reply(200, {
    ok: true,
    action,
    target_email: target,
    sessions_revoked: sessionsRevoked,
    // Solo en reset sin contraseña dada: se muestra una única vez.
    ...(action === "reset" && !tempPassword ? { temp_password: generated } : {}),
  });
});
