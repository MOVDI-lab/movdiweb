# Planeación y refactorización — MOVDI → Next.js + Supabase

Documento de la migración del sitio MOVDI desde un HTML monolítico a una
aplicación **Next.js (App Router) + TypeScript** con **Supabase** como backend,
mejorando la seguridad y resolviendo el problema de los previews al compartir
links de talento.

---

## 1. Punto de partida (lo que había)

| Pieza | Antes |
|-------|-------|
| Sitio público | `index.html` (~900 líneas) — SPA vanilla con secciones que se muestran/ocultan |
| Panel admin | `admin-roster.html` — login + CRUD con Supabase desde el navegador |
| Backend | Supabase (proyecto `movdi-web`, ref `bspnyanetywxysygnkaw`), tablas `talentos` y `equipo` |
| Formularios | Formspree (endpoint embebido en el HTML) |
| Hosting | Netlify (`_redirects`) |
| Claves | URL y `publishable key` de Supabase **hardcodeadas** en el HTML; endpoint de Formspree visible |

### Problemas detectados
1. **🔴 El link de talento comparte la pantalla de MOVDI, no la foto del talento.**
   Las meta tags Open Graph (`og:image`) se actualizaban con JavaScript
   (`setMeta(..., t.photo)`), pero **los crawlers de WhatsApp/Facebook/X no
   ejecutan JS**: solo leen el HTML del servidor, que tenía `og:image` fijo en
   `og-image.png`. → Hay que renderizar las meta tags **en el servidor**.
2. **🟠 Seguridad RLS**: las políticas `ALL` para `authenticated` usaban
   `USING(true)` → cualquier usuario autenticado podía hacer CRUD de todo.
3. **🟠 Secretos en el código**: claves y endpoints embebidos en el HTML.
4. **🟡 Auth de contraseñas filtradas desactivada** en Supabase Auth.
5. Sin tipado, sin build, difícil de mantener/escalar.

---

## 2. Arquitectura nueva

```
Next.js 14 (App Router, TypeScript)
├── Renderizado en servidor (SSR/ISR) para SEO y previews correctos
├── Supabase
│   ├── lectura pública (anon key) de talentos/equipo publicados → RLS
│   └── Auth (email/password) para el panel /admin
├── Variables de entorno (.env.local) para todas las claves
└── API Routes que hacen de proxy a Formspree (validación + honeypot)
```

### Mapa de migración

| Original | Ahora |
|----------|-------|
| `index.html` (secciones) | `app/page.tsx` + `components/*` (Hero, Marquee, Servicios, Roster, Nosotros, Únete, Contacto) |
| Modal de talento + router `/talento/:slug` | `app/talento/[slug]/page.tsx` — **página real SSR** con `generateMetadata` |
| `admin-roster.html` | `app/admin/*` (login + dashboard CRUD) |
| `sb.createClient(URL, KEY)` hardcoded | `lib/supabase/{server,client,middleware}.ts` con env vars |
| Formspree fetch desde el cliente | `app/api/contact` y `app/api/cotizar` (servidor) |
| Datos estáticos (SERVICES, BRANDS…) | `lib/data.ts` |
| Tipos | `lib/types.ts` |
| Imágenes/favicons/sitemap | `public/` |
| HTML original (referencia) | `legacy/` |

---

## 3. La mejora pedida: foto del talento al compartir

`app/talento/[slug]/page.tsx` implementa `generateMetadata()`, que corre **en el
servidor** y consulta el talento por `slug`. Devuelve:

```ts
openGraph: { images: [{ url: talento.photo, width: 1200, height: 1500 }] }
twitter:   { card: "summary_large_image", images: [talento.photo] }
```

Como el HTML ya sale del servidor con esas meta tags, al pegar el link en
WhatsApp/Instagram/Facebook el preview muestra **la foto del talento**. Además
`generateStaticParams` pre-genera cada página (rápidas y cacheadas) y la página
sirve de URL compartible con SEO propio (título = nombre, descripción = bio).

---

## 4. Mejoras de seguridad

1. **Secretos fuera del código** → `.env.local` (en `.gitignore`) y `.env.example`
   como plantilla. La `service_role` nunca lleva prefijo `NEXT_PUBLIC`.
2. **RLS endurecido** → `supabase/migrations/0001_tighten_rls.sql`: lista blanca
   de administradores (`admins` + `is_admin()`); el CRUD deja de ser abierto para
   cualquier autenticado. *(Pendiente de aplicar — ver §6.)*
3. **Formularios vía servidor** → API Routes validan, agregan honeypot anti-spam y
   ocultan el endpoint de Formspree; el `pm_email` del manager se resuelve en el
   servidor (no se confía en el cliente).
4. **Cabeceras de seguridad** → `next.config.mjs` (HSTS, X-Frame-Options,
   X-Content-Type-Options, Referrer-Policy, Permissions-Policy).
5. **Protección de rutas** → `middleware.ts` refresca la sesión y bloquea `/admin`
   sin sesión.
6. **Recomendado en el dashboard**: activar *Leaked Password Protection*
   (Auth > Policies).

---

## 5. Funcionalidades conservadas

- ✅ Hero con alcance combinado calculado desde el roster real
- ✅ Marquee de marcas
- ✅ Servicios con modales de resultados y casos
- ✅ Roster con búsqueda y filtros (Crew, Plataforma, Tier, Categoría)
- ✅ Ficha de talento: bio, audiencia, plataformas, marcas, videos
- ✅ Cotización por talento (CC al manager) y formulario de contacto general
- ✅ Sección Nosotros (valores + equipo desde Supabase) y Únete
- ✅ WhatsApp / redes / favicons / sitemap / robots
- ✅ Panel admin: login, CRUD de talentos y equipo, publicar/despublicar
- ✅ URLs antiguas (`/roster`, `/servicios`, …) redirigidas vía `next.config`

---

## 6. Cómo correr y desplegar

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar entorno
cp .env.example .env.local   # y rellenar SUPABASE_SERVICE_ROLE_KEY

# 3. Desarrollo
npm run dev        # http://localhost:3000   (admin en /admin)

# 4. Producción
npm run build && npm start
```

**Aplicar la migración de seguridad (cuando se quiera):**
```bash
supabase link --project-ref bspnyanetywxysygnkaw
supabase db push
# o pegar supabase/migrations/0001_tighten_rls.sql en el SQL Editor
```

**Deploy recomendado:** Vercel (host nativo de Next.js). Cargar las mismas
variables de entorno en el panel del proyecto. También funciona en Netlify con el
runtime de Next.

---

## 7. Siguientes pasos sugeridos (fuera de este PR)

- Imagen OG compuesta por talento (foto + nombre + logo) con `next/og`/ImageResponse.
- Subida de fotos a Supabase Storage desde el admin (hoy se pega URL).
- Migrar formularios de Formspree a una tabla `leads` en Supabase + email.
- Rate limiting en las API Routes.
