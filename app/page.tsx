import HomeClient from "@/components/HomeClient";
import { getTalentos, getEquipo } from "@/lib/queries";
import { parseNum } from "@/lib/data";

// Revalida los datos del roster/equipo cada 5 minutos (ISR).
export const revalidate = 300;

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://movdi.mx";

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MOVDI",
  alternateName: "MOVDI · Digital Movement Agency",
  url: SITE,
  logo: `${SITE}/favicon-512.png`,
  description:
    "Agencia de talento y marketing de influencers en CDMX. Construimos creadores, posicionamos marcas y creamos oportunidades reales en el entorno digital.",
  address: { "@type": "PostalAddress", addressLocality: "Ciudad de México", addressCountry: "MX" },
  sameAs: ["https://www.instagram.com/movdimx/", "https://mx.linkedin.com/company/movdi"],
};

export default async function HomePage() {
  const [talentos, equipo] = await Promise.all([getTalentos(), getEquipo()]);

  const reach = talentos.reduce(
    (acc, t) => acc + (t.plataformas || []).reduce((a, p) => a + parseNum(p.seguidores), 0),
    0
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <HomeClient talentos={talentos} equipo={equipo} reach={reach} />
    </>
  );
}
