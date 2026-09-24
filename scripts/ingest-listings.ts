/**
 * Script CLI d'ingestion d'annonces d'occasion pour Carvizo.
 *
 * Usage:
 *   npx tsx scripts/ingest-listings.ts [--save-supabase]
 */
import { ingestListings } from "../lib/sources/ingestion";

async function main() {
  const saveToSupabase = process.argv.includes("--save-supabase");

  console.log("🚀 Lancement de l'ingestion automatique des annonces...");
  if (saveToSupabase) {
    console.log("💾 Option --save-supabase active : les annonces seront insérées/mises à jour dans Supabase.");
  } else {
    console.log("ℹ Mode simulation (pas d'écriture Supabase). Passez --save-supabase pour persister.");
  }

  const result = await ingestListings(undefined, { saveToSupabase });

  console.log("\n📊 Rapport d'ingestion :");
  console.log(`  • Annonces récupérées : ${result.fetchedCount}`);
  console.log(`  • Doublons ignorés    : ${result.duplicateCount}`);
  console.log(`  • Annonces traitées  : ${result.opportunities.length}`);
  if (saveToSupabase) {
    console.log(`  • Insérées en base   : ${result.insertedCount}`);
  }

  if (result.errors.length > 0) {
    console.error("\n⚠️ Erreurs rencontrées :");
    for (const err of result.errors) {
      console.error(`  - ${err}`);
    }
  } else {
    console.log("\n✨ Ingestion terminée avec succès !");
  }
}

main().catch((err) => {
  console.error("✖ Échec critique de l'ingestion :", err);
  process.exit(1);
});
