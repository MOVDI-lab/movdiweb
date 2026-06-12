import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CotizarForm from "./CotizarForm";
import { getTalentoBySlug, getTalentos } from "@/lib/queries";
import { waLink } from "@/lib/data";
import { WaIcon } from "@/components/icons";

export const revalidate = 300;

// Pre-genera las páginas de cada talento publicado (rápidas + cacheadas).
export async function generateStaticParams() {
  const talentos = await getTalentos();
  return talentos.map((t) => ({ slug: t.slug }));
}

// === EL FIX ===
// Los crawlers de WhatsApp/Facebook/X NO ejecutan JavaScript: leen el HTML
// que devuelve el servidor. Aquí inyectamos og:image = foto del talento,
// así el preview del link comparte la foto del talento, no la pantalla MOVDI.
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const t = await getTalentoBySlug(params.slug);
  if (!t) return { title: "Talento no encontrado · MOVDI" };

  const title = `${t.nombre} · MOVDI`;
  const description = (t.bio || `${t.nombre}, creador del crew MOVDI.`).slice(0, 180);
  const url = `/talento/${t.slug}`;
  const image = t.photo;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "profile",
      url,
      title,
      description,
      images: image ? [{ url: image, width: 1200, height: 1500, alt: t.nombre }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

function AudienciaTable({ str }: { str: string }) {
  const parts = String(str).split("·").map((s) => s.trim()).filter(Boolean);
  if (!parts.length) {
    return (
      <div className="aud"><div className="aud-row"><div className="aud-k" /><div className="aud-v">{str}</div></div></div>
    );
  }
  return (
    <div className="aud">
      {parts.map((p, i) => {
        const idx = p.indexOf(":");
        if (idx < 0) return <div className="aud-row" key={i}><div className="aud-k" /><div className="aud-v">{p}</div></div>;
        return (
          <div className="aud-row" key={i}>
            <div className="aud-k">{p.slice(0, idx).trim()}</div>
            <div className="aud-v">{p.slice(idx + 1).trim()}</div>
          </div>
        );
      })}
    </div>
  );
}

export default async function TalentoPage({ params }: { params: { slug: string } }) {
  const t = await getTalentoBySlug(params.slug);
  if (!t) notFound();

  const plats = (t.plataformas || []).filter((p) => p.handle || p.link);
  const videos = t.videos || [];

  return (
    <>
      <Nav />
      <div className="talent-page">
        <Link href="/#roster" className="back-link">← Volver al roster</Link>

        <div className="sheet glass lux">
          <div className="top">
            <img src={t.photo} alt={t.nombre} />
            <div className="meta">
              {t.tier && <div className="lbl">{t.tier} · {t.crew}</div>}
              <h2>{t.nombre}</h2>
              <div className="city">{t.ciudad || "México"}</div>
              <p className="bio">{t.bio}</p>
              <div className="chips">{(t.categorias || []).map((c) => <span className="c" key={c}>{c}</span>)}</div>
              {t.audiencia && (
                <>
                  <div className="sub-t">Audiencia principal</div>
                  <AudienciaTable str={t.audiencia} />
                </>
              )}
            </div>
          </div>

          <div className="body2">
            <div className="sub-t">Plataformas</div>
            {plats.length ? (
              plats.map((p, i) => (
                <div className="plat-row" key={i}>
                  <a href={p.link} target="_blank" rel="noopener">
                    {p.plataforma} <span style={{ color: "var(--muted)", fontWeight: 600 }}>{p.handle}</span>
                  </a>
                  <div className="seg">
                    {p.seguidores || "-"}{p.er && <span className="er">ER {p.er}</span>}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: "var(--muted)" }}>Sin plataformas listadas</div>
            )}

            {(t.marcas || []).length > 0 && (
              <>
                <div className="sub-t">Marcas</div>
                <div className="chips">{t.marcas.map((m) => <span className="c" key={m}>{m}</span>)}</div>
              </>
            )}

            {videos.length > 0 && (
              <>
                <div className="sub-t">Contenido destacado</div>
                <div className="vids">
                  {videos.map((v, i) => (
                    <a className="vid" key={i} href={v.link} target="_blank" rel="noopener">
                      <div className="vt">{v.titulo}</div>
                      <div className="vk">{v.tipo}</div>
                    </a>
                  ))}
                </div>
              </>
            )}

            <CotizarForm
              talento={{ slug: t.slug, nombre: t.nombre, crew: t.crew, photo: t.photo }}
            />

            <a
              className="btn-wa"
              href={waLink(`Hola MOVDI 👋 me interesa trabajar con ${t.nombre}`)}
              target="_blank"
              rel="noopener"
            >
              <WaIcon />Escríbenos por WhatsApp
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
