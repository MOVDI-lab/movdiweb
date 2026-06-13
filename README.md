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
