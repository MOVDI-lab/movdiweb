-- =====================================================================
-- 0001_tighten_rls.sql
-- Endurece las políticas RLS de `talentos` y `equipo`.
--
-- PROBLEMA (detectado por el linter de seguridad de Supabase):
--   Las políticas `ALL` para el rol `authenticated` usaban USING(true) /
--   WITH CHECK(true): CUALQUIER usuario autenticado podía crear, editar o
--   borrar cualquier talento o miembro del equipo.
--
-- SOLUCIÓN:
--   Lista blanca de administradores (tabla `admins`) + función is_admin().
--   El CRUD queda restringido a correos dados de alta como admin.
--   La lectura pública (anon, solo filas publicadas) NO se modifica.
--
-- Aplicar con:  supabase db push   (o desde el SQL Editor del dashboard)
-- =====================================================================

-- 1) Tabla de administradores
create table if not exists public.admins (
  email text primary key,
  created_at timestamptz default now()
);
alter table public.admins enable row level security;

drop policy if exists "admins read self" on public.admins;
create policy "admins read self" on public.admins
  for select to authenticated
  using (email = auth.email());

-- Da de alta a los administradores actuales. Añade aquí más correos si hace falta.
insert into public.admins (email) values
  ('daniela@movdi.mx'),
  ('diana@movdi.mx')
  on conflict (email) do nothing;

-- 2) Función helper: ¿el usuario actual es admin?
-- SECURITY INVOKER: la tabla admins ya deja que cada usuario lea su propia
-- fila, así que no hace falta DEFINER (evita exponer una función definer por RPC).
create or replace function public.is_admin()
returns boolean
language sql
security invoker
stable
set search_path = public
as $$
  select exists (select 1 from public.admins where email = auth.email());
$$;

-- 3) talentos: reemplaza la política permisiva
drop policy if exists "admin crud autenticado" on public.talentos;
create policy "admin crud talentos" on public.talentos
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 4) equipo: reemplaza la política permisiva
drop policy if exists "admin crud equipo autenticado" on public.equipo;
create policy "admin crud equipo" on public.equipo
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Nota: las políticas de lectura pública
--   "lectura publica de publicados" (talentos) y
--   "lectura publica equipo publicado" (equipo)
-- se conservan tal cual: el sitio público sigue mostrando solo lo publicado.
