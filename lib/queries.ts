import { createPublicClient } from "@/lib/supabase/public";
import type { Talento, MiembroEquipo } from "@/lib/types";

// Lecturas públicas: solo filas publicadas, ordenadas por `orden`.
// Usa un cliente sin cookies para que funcione también en build (ISR/SSG).

export async function getTalentos(): Promise<Talento[]> {
  const sb = createPublicClient();
  const { data, error } = await sb
    .from("talentos")
    .select("*")
    .eq("publicado", true)
    .order("orden", { ascending: true });
  if (error) {
    console.error("getTalentos:", error.message);
    return [];
  }
  return (data ?? []) as Talento[];
}

export async function getEquipo(): Promise<MiembroEquipo[]> {
  const sb = createPublicClient();
  const { data, error } = await sb
    .from("equipo")
    .select("*")
    .eq("publicado", true)
    .order("orden", { ascending: true });
  if (error) {
    console.error("getEquipo:", error.message);
    return [];
  }
  return (data ?? []) as MiembroEquipo[];
}

export async function getTalentoBySlug(slug: string): Promise<Talento | null> {
  const sb = createPublicClient();
  const { data, error } = await sb
    .from("talentos")
    .select("*")
    .eq("slug", slug)
    .eq("publicado", true)
    .maybeSingle();
  if (error) {
    console.error("getTalentoBySlug:", error.message);
    return null;
  }
  return (data as Talento) ?? null;
}
