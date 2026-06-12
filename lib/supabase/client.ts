import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase para componentes del navegador ("use client").
 * Solo expone la clave pública (anon); el acceso real lo controla RLS.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
