import { ImageResponse } from "next/og";
import { getTalentoBySlug } from "@/lib/queries";

// Imagen Open Graph generada por talento (1200x630): foto + nombre + logo.
// Next la enlaza automáticamente como og:image de /talento/[slug].
export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "MOVDI · Talento";

export default async function Image({ params }: { params: { slug: string } }) {
  const t = await getTalentoBySlug(params.slug);
  const name = (t?.nombre || "MOVDI").toUpperCase();
  const photo = t?.photo;
  const badge = [t?.tier, t?.crew].filter(Boolean).join(" · ").toUpperCase();
  const cats = (t?.categorias || []).slice(0, 3).join("  ·  ");

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#070707", color: "#f4f1ea" }}>
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} width={470} height={630} style={{ objectFit: "cover", objectPosition: "top" }} alt="" />
        ) : null}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "58px 64px",
            flex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", fontSize: 40, fontWeight: 800, letterSpacing: 3 }}>
            <span>MOV</span>
            <span style={{ color: "#FF4B00" }}>DI</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {badge ? (
              <div style={{ color: "#FF4B00", fontSize: 26, fontWeight: 700, letterSpacing: 4, marginBottom: 16 }}>
                {badge}
              </div>
            ) : null}
            <div style={{ fontSize: name.length > 14 ? 78 : 100, fontWeight: 800, lineHeight: 1 }}>{name}</div>
            {cats ? <div style={{ color: "#bdbdba", fontSize: 30, marginTop: 22 }}>{cats}</div> : null}
          </div>

          <div style={{ color: "#8d8d8a", fontSize: 24, letterSpacing: 3 }}>DIGITAL MOVEMENT AGENCY</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
