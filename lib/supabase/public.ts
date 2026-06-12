import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase SIN cookies, para lecturas públicas (roster, equipo,
 * ficha de talento). Funciona en build (generateStaticParams/Metadata) y en
 * runtime. RLS solo permite leer filas publicadas con la anon key.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
