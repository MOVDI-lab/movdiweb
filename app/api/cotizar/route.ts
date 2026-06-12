import { NextResponse } from "next/server";
import { getTalentoBySlug } from "@/lib/queries";

export async function POST(req: Request) {
  const endpoint = process.env.FORMSPREE_ENDPOINT;
  if (!endpoint) {
    return NextResponse.json({ error: "Config faltante" }, { status: 500 });
  }

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (body.website) return NextResponse.json({ ok: true }); // honeypot

  const nombre = (body.nombre || "").trim();
  const correo = (body.correo || "").trim();
  if (!nombre || !correo) {
    return NextResponse.json({ error: "Nombre y correo requeridos" }, { status: 400 });
  }

  // Resolvemos el talento en el servidor para obtener el pm_email confiable
  // (no se confía en lo que mande el cliente).
  const talento = body.slug ? await getTalentoBySlug(body.slug) : null;
  const ccBase = process.env.COTIZAR_CC_EMAIL || "daniela@movdi.mx";
  const cc = talento?.pm_email ? `${talento.pm_email},${ccBase}` : ccBase;

  const payload = {
    Talento: talento?.nombre || "(desconocido)",
    Crew: talento ? "Crew " + talento.crew : "",
    Nombre: nombre,
    Empresa: (body.empresa || "").trim(),
    Correo: correo,
    Telefono: (body.telefono || "").trim(),
    Mensaje: (body.mensaje || "").trim(),
    _subject: "Cotización: " + (talento?.nombre || nombre),
    _replyto: correo,
    _cc: cc,
  };

  try {
    const r = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    if (!r.ok) return NextResponse.json({ error: "Envío fallido" }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Envío fallido" }, { status: 502 });
  }
}
