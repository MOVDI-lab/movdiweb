-- =====================================================================
-- 0002_team_members_roles.sql
-- Sustituye la lista blanca binaria `admins` + is_admin() por un modelo
-- de roles: `team_members` (admin / editor / viewer) + is_team_admin().
--
--   admin  → gestiona contenido Y accesos (pestaña Accesos, resets)
--   editor → CRUD de talentos/equipo, sin poderes de administración
--   viewer → entra al panel en solo-lectura
--
-- Incluye tabla de auditoría `admin_audit` (escritura solo via service
-- role desde la Edge Function admin-reset-password).
--
-- APLICADA en producción el 2026-08-05 (migración
-- `team_members_roles_and_audit`). Este archivo es el espejo en el repo.
-- =====================================================================

-- 1) Tabla de accesos del panel
create table if not exists public.team_members (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  name       text not null default '',
  role       text not null default 'viewer' check (role in ('admin','editor','viewer')),
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.team_members enable row level security;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists team_members_touch on public.team_members;
create trigger team_members_touch
  before update on public.team_members
  for each row execute function public.touch_updated_at();

-- 2) Helpers de rol.
-- SECURITY DEFINER: las políticas de team_members llaman a estas funciones;
-- con INVOKER habría recursión de RLS sobre la propia tabla.
create or replace function public.is_team_admin()
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from public.team_members
    where lower(email) = lower(auth.email()) and role = 'admin' and active
  );
$$;

create or replace function public.is_team_member()
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from public.team_members
    where lower(email) = lower(auth.email()) and active
  );
$$;

create or replace function public.can_edit_content()
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from public.team_members
    where lower(email) = lower(auth.email())
      and role in ('admin','editor') and active
  );
$$;

-- 3) Políticas de team_members
drop policy if exists "miembros leen su propia fila" on public.team_members;
create policy "miembros leen su propia fila" on public.team_members
  for select to authenticated
  using (lower(email) = lower(auth.email()));

drop policy if exists "admins gestionan accesos" on public.team_members;
create policy "admins gestionan accesos" on public.team_members
  for all to authenticated
  using (public.is_team_admin())
  with check (public.is_team_admin());

-- 4) Protección: nunca puede quedar el panel sin un admin activo
create or replace function public.ensure_active_admin_remains()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if old.role = 'admin' and old.active
     and not exists (select 1 from public.team_members where role = 'admin' and active) then
    raise exception 'Debe quedar al menos un admin activo en team_members.';
  end if;
  return null;
end $$;

drop trigger if exists team_members_keep_admin on public.team_members;
create trigger team_members_keep_admin
  after update or delete on public.team_members
  for each row execute function public.ensure_active_admin_remains();

-- 5) Migración de datos desde la lista blanca anterior (public.admins):
--    daniela → admin (única), diana → editor (conserva acceso de edición).
insert into public.team_members (email, name, role) values
  ('daniela@movdi.mx', 'Daniela', 'admin'),
  ('diana@movdi.mx',   'Diana',   'editor')
  on conflict (email) do nothing;

-- 6) Contenido (talentos/equipo): admins y editores editan; cualquier
--    miembro activo (incluye viewers) puede LEER todo desde el panel.
drop policy if exists "admin crud talentos" on public.talentos;
create policy "equipo edita talentos" on public.talentos
  for all to authenticated
  using (public.can_edit_content())
  with check (public.can_edit_content());

drop policy if exists "miembros leen talentos" on public.talentos;
create policy "miembros leen talentos" on public.talentos
  for select to authenticated
  using (public.is_team_member());

drop policy if exists "admin crud equipo" on public.equipo;
create policy "equipo edita equipo" on public.equipo
  for all to authenticated
  using (public.can_edit_content())
  with check (public.can_edit_content());

drop policy if exists "miembros leen equipo" on public.equipo;
create policy "miembros leen equipo" on public.equipo
  for select to authenticated
  using (public.is_team_member());

-- 7) Auditoría mínima: quién hizo qué a quién y cuándo.
--    Sin política de INSERT para authenticated: solo el service role
--    (Edge Function) escribe; los admins pueden leerla.
create table if not exists public.admin_audit (
  id           bigint generated always as identity primary key,
  actor_email  text not null,
  action       text not null,
  target_email text,
  detail       jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);
alter table public.admin_audit enable row level security;

drop policy if exists "admins leen auditoria" on public.admin_audit;
create policy "admins leen auditoria" on public.admin_audit
  for select to authenticated
  using (public.is_team_admin());

-- 8) Retira el sistema anterior (datos ya migrados en el paso 5).
drop policy if exists "admins read self" on public.admins;
drop function if exists public.is_admin();
drop table if exists public.admins;
