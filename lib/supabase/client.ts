import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase pour le navigateur (composants client uniquement).
 * Utilise la clé publique "anon" : ne jamais y mettre la clé service_role.
 */
export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase n'est pas configuré côté navigateur (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY manquants)."
    );
  }

  return createClient(url, anonKey);
}
