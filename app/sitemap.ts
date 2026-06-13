import type { MetadataRoute } from "next";
import { getTalentos } from "@/lib/queries";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://movdi.mx";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes = ["", "/roster", "/servicios", "/nosotros", "/unete", "/contacto"].map(
    (path) => ({
      url: `${SITE}${path || "/"}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })
  );

  let talentRoutes: MetadataRoute.Sitemap = [];
  try {
    const talentos = await getTalentos();
    talentRoutes = talentos.map((t) => ({
      url: `${SITE}/talento/${t.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    // Si Supabase no responde en build, solo se publican las rutas estáticas.
  }

  return [...staticRoutes, ...talentRoutes];
}
