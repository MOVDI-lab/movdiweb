import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import CotizarForm from "./CotizarForm";
import { TalentSheetBody } from "@/components/AudienciaTable";
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

export default async function TalentoPage({ params }: { params: { slug: string } }) {
  const t = await getTalentoBySlug(params.slug);
  if (!t) notFound();

  return (
    <>
      <div className="talent-page">
        <Link href="/roster" className="back-link">← Volver al roster</Link>
        <div className="sheet glass lux">
          <TalentSheetBody
            t={t}
            footer={
              <>
                <CotizarForm talento={{ slug: t.slug, nombre: t.nombre, crew: t.crew, photo: t.photo }} />
                <a
                  className="btn-wa"
                  href={waLink(`Hola MOVDI 👋 me interesa trabajar con ${t.nombre}`)}
                  target="_blank"
                  rel="noopener"
                >
                  <WaIcon />Escríbenos por WhatsApp
                </a>
              </>
            }
          />
        </div>
      </div>
      <Footer />
    </>
  );
}
