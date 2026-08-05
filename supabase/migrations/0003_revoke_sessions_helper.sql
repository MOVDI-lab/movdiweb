-- =====================================================================
-- 0003_revoke_sessions_helper.sql
-- El endpoint admin de logout de GoTrue no funcionó en los offboards
-- (admin_audit: sessions_revoked=false). Esta función revoca las
-- sesiones de un usuario directamente (refresh tokens + sesiones) y
-- solo puede ejecutarla el service role (la Edge Function).
-- Nota: los access tokens ya emitidos caducan solos (~1 h); sin
-- refresh token ni sesión no se pueden renovar.
--
-- APLICADA en producción el 2026-08-05 (migración
-- `revoke_sessions_helper`). Este archivo es el espejo en el repo.
-- =====================================================================

create or replace function public.revoke_user_sessions(target_user uuid)
returns void
language plpgsql security definer
set search_path = auth, public
as $$
begin
  delete from auth.refresh_tokens where user_id = target_user::text;
  delete from auth.sessions where user_id = target_user;
end $$;

revoke execute on function public.revoke_user_sessions(uuid) from public;
revoke execute on function public.revoke_user_sessions(uuid) from anon;
revoke execute on function public.revoke_user_sessions(uuid) from authenticated;
grant execute on function public.revoke_user_sessions(uuid) to service_role;
