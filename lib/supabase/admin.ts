import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente com a service role key: ignora RLS. Uso restrito a rotas server-side
// (ex: POST /api/orders revalidando preços, e as rotas de admin depois de checar o login).
// NUNCA importar este arquivo em código que roda no browser.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
