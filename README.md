# MOVDI · Digital Movement Agency

Sitio y panel de roster de MOVDI, construido con **Next.js (App Router) +
TypeScript** y **Supabase** como backend.

## Desarrollo

```bash
npm install
cp .env.example .env.local   # rellena SUPABASE_SERVICE_ROLE_KEY
npm run dev                  # http://localhost:3000
```

- Sitio público: `/`
- Ficha de talento (link compartible con foto en el preview): `/talento/[slug]`
- Panel de administración: `/admin`

## Estructura

| Carpeta | Contenido |
|---------|-----------|
| `app/` | Páginas y rutas (App Router) + API Routes |
| `components/` | Componentes de UI del sitio público |
| `lib/` | Clientes Supabase, queries, tipos y datos estáticos |
| `supabase/migrations/` | Migraciones SQL (incluye endurecimiento de RLS) |
| `public/` | Imágenes, favicons, sitemap, robots |
| `legacy/` | HTML original (referencia histórica) |

## Roles y accesos del panel

El acceso a `/admin` se controla con la tabla `public.team_members`
(roles `admin` / `editor` / `viewer` + bandera `active`) y las funciones
`is_team_admin()` / `can_edit_content()` (ver
`supabase/migrations/0002_team_members_roles.sql`):

- **admin** — CRUD de contenido y pestaña **Accesos**: roles, activar/desactivar,
  resetear contraseñas y dar de baja (offboarding).
- **editor** — CRUD de talentos/equipo, sin gestión de accesos.
- **viewer** — panel en solo lectura.

La pestaña Accesos gestiona todo el ciclo: **+ Agregar acceso** crea también el
usuario de Auth con contraseña temporal (visible una sola vez), y los botones de
reset/baja cierran sesiones y bloquean el acceso. Todo pasa por la Edge Function
`supabase/functions/admin-reset-password/` (service role solo en el servidor,
invocable únicamente por un admin activo; deja traza en `public.admin_audit`).

## Variables de entorno

Ver `.env.example`. Las claves reales van en `.env.local` (ignorado por git).

## Documentación

- [`PLAN.md`](./PLAN.md) — planeación de la migración, decisiones y seguridad.

## Despliegue

Recomendado en **Vercel**. Cargar las variables de entorno en el panel del
proyecto. Para aplicar la migración de seguridad de RLS:

```bash
supabase link --project-ref bspnyanetywxysygnkaw
supabase db push
```
