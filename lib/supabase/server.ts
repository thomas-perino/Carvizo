import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * ⚠️ Ce module expose les clients Supabase côté serveur.
 * Il ne doit être importé que depuis des Server Components, 
 * des Route Handlers, ou des scripts serveur.
 */

/**
 * Indique si Supabase est configuré pour l'application (URL + clé publique).
 * Permet le fallback sur les données de démonstration si non configuré.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

let cachedClient: SupabaseClient | null = null;

/**
 * Client Supabase côté serveur (RESTREINT par les RLS).
 * Utilise la clé publique "anon" pour sécuriser la lecture des données.
 * Idéal pour les requêtes depuis l'application Next.js (App Router).
 */
export function getSupabaseServerClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase n'est pas configuré (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY manquants)."
    );
  }

  if (!cachedClient) {
    cachedClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );
  }

  return cachedClient;
}

/**
 * Client Supabase côté serveur (ADMINISTRATEUR - CONTOURNE LES RLS).
 * ⚠️ À n'utiliser STRICTEMENT QUE dans des scripts isolés (ex: script de seed).
 * Ne jamais utiliser ce client pour des requêtes provenant de l'UI.
 */
export function getSupabaseAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase Admin n'est pas configuré (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants)."
    );
  }

  // Pas de cache ici, on veut une instance fraîche pour les scripts lourds
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}