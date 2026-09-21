/**
 * Peuple un vrai projet Supabase avec le jeu de données de démonstration.
 *
 * Usage :
 *   npm run seed
 *
 * Nécessite NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans
 * l'environnement (voir .env.example). Sans ces variables, l'application
 * fonctionne déjà avec les données de démo en mémoire — ce script n'est
 * utile que pour tester le schéma Supabase avec de vraies données.
 */
import { getDemoOpportunities } from "../lib/data/demo-opportunities";
import {
  analysisToRow,
  listingToRow,
  repairToRow,
  vehicleToRow,
} from "../lib/supabase/mappers";
import { getSupabaseAdminClient } from "../lib/supabase/server";

async function main() {
  // On vérifie spécifiquement la clé service_role pour l'administration
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error(
      "✖ Supabase Admin n'est pas configuré. Renseignez NEXT_PUBLIC_SUPABASE_URL et " +
        "SUPABASE_SERVICE_ROLE_KEY (voir .env.example) avant de lancer ce script."
    );
    process.exit(1);
  }

  // On utilise le client Admin pour outrepasser les règles RLS lors du seed
  const supabase = getSupabaseAdminClient();
  const opportunities = await getDemoOpportunities();

  console.log(`→ ${opportunities.length} annonces de démonstration à insérer...`);

  for (const { vehicle, listing, analysis, repairs } of opportunities) {
    const { error: vehicleError } = await supabase
      .from("vehicles")
      .upsert(vehicleToRow(vehicle));
    if (vehicleError) throw vehicleError;

    const { error: listingError } = await supabase
      .from("listings")
      .upsert(listingToRow(listing));
    if (listingError) throw listingError;

    const { error: analysisError } = await supabase
      .from("analyses")
      .upsert(analysisToRow(analysis));
    if (analysisError) throw analysisError;

    if (repairs.length > 0) {
      const { error: repairsError } = await supabase
        .from("repairs")
        .upsert(repairs.map(repairToRow));
      if (repairsError) throw repairsError;
    }

    console.log(`  ✓ ${vehicle.make} ${vehicle.model} (${listing.externalId})`);
  }

  console.log("✔ Seed terminé.");
}

main().catch((error) => {
  console.error("✖ Échec du seed :", error);
  process.exit(1);
});