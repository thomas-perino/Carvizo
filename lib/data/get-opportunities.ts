import { isSupabaseConfigured } from "@/lib/supabase/server";
import type { Opportunity, OpportunityFilters, OpportunitySort } from "@/types";
import { getDemoOpportunities } from "./demo-opportunities";
import { applyOpportunityFilters, applyOpportunitySort, DEFAULT_SORT } from "./filters";
import {
  fetchOpportunitiesFromSupabase,
  fetchOpportunityByIdFromSupabase,
} from "./supabase-opportunities";

/**
 * Point d'entrée unique utilisé par les pages pour lister les opportunités.
 *
 * - Si Supabase est configuré (voir .env.example), les données viennent de
 *   la base réelle.
 * - Sinon (ou en cas d'erreur de connexion), l'application retombe sur le
 *   jeu de données de démonstration, ce qui permet de lancer le projet en
 *   local sans configuration préalable.
 *
 * Le filtrage/tri est actuellement appliqué en mémoire : c'est suffisant
 * pour le volume de données de cette étape, mais une future étape devra le
 * déplacer au niveau de la requête Supabase pour rester performant à plus
 * grande échelle (voir README, section "Prochaines étapes").
 */
export async function listOpportunities(
  filters: OpportunityFilters = {},
  sort: OpportunitySort = DEFAULT_SORT
): Promise<Opportunity[]> {
  const all = await fetchAllOpportunities();
  return applyOpportunitySort(applyOpportunityFilters(all, filters), sort);
}

export async function getOpportunityById(id: string): Promise<Opportunity | null> {
  if (isSupabaseConfigured()) {
    try {
      return await fetchOpportunityByIdFromSupabase(id);
    } catch (error) {
      console.error("[carvizo] Supabase indisponible, repli sur les données de démo.", error);
    }
  }

  const demo = await getDemoOpportunities();
  return demo.find((o) => o.listing.id === id) ?? null;
}

async function fetchAllOpportunities(): Promise<Opportunity[]> {
  if (isSupabaseConfigured()) {
    try {
      return await fetchOpportunitiesFromSupabase();
    } catch (error) {
      console.error("[carvizo] Supabase indisponible, repli sur les données de démo.", error);
    }
  }
  return getDemoOpportunities();
}

export async function listAvailableMakes(): Promise<string[]> {
  const all = await fetchAllOpportunities();
  return Array.from(new Set(all.map((o) => o.vehicle.make))).sort();
}

export async function listAvailableLocations(): Promise<string[]> {
  const all = await fetchAllOpportunities();
  return Array.from(new Set(all.map((o) => o.vehicle.location))).sort();
}
