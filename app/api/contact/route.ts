import { NextResponse } from "next/server";

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

  // Honeypot anti-spam: si viene relleno, fingimos éxito y descartamos.
  if (body.website) return NextResponse.json({ ok: true });

  const nombre = (body.nombre || "").trim();
  const correo = (body.correo || "").trim();
  if (!nombre || !correo) {
    return NextResponse.json({ error: "Nombre y correo requeridos" }, { status: 400 });
  }

  const payload = {
    Nombre: nombre,
    Empresa: (body.empresa || "").trim(),
    Correo: correo,
    Telefono: (body.telefono || "").trim(),
    Servicio: (body.servicio || "").trim(),
    Mensaje: (body.mensaje || "").trim(),
    _subject: "Nuevo proyecto: " + ((body.empresa || "").trim() || nombre),
    _replyto: correo,
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
