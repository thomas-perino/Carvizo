import { DEMO_COMPARABLES } from "@/data/demo/comparables";
import { DEMO_SEEDS, type DemoSeed } from "@/data/demo/seed";
import type { RepairSignal } from "@/lib/calculations/repair-cost";
import { analyzeListing } from "@/lib/analysis/analyze-listing";
import type { VehicleConditionIssue } from "@/lib/market-value/types";
import { DemoListingSource } from "@/lib/sources/demo-source";
import { normalizeRawListing } from "@/lib/sources/normalize";
import type { Analysis, Opportunity, Repair } from "@/types";

/**
 * Construit le jeu de données de démonstration en faisant réellement
 * transiter les données par le pipeline d'architecture :
 *
 *   DemoListingSource (RawListing)
 *     -> normalizeRawListing (Vehicle/Listing)
 *     -> analyzeListing (Analysis/Repair), qui délègue la valeur de
 *        marché au Market Value Engine (lib/market-value/) à partir du
 *        profil cible + du pool de comparables + des points d'état
 *        construits ci-dessous.
 *
 * Le résultat est mis en cache en mémoire (les données de démo sont
 * statiques) pour éviter de refaire ce calcul à chaque requête.
 */
let cachedOpportunities: Opportunity[] | null = null;

/**
 * Traduit les réparations "métier" (RepairSignal, utilisées pour le coût
 * de réparation) en points d'état structurés pour le Market Value Engine
 * (VehicleConditionIssue). Les deux représentations coexistent
 * volontairement : `lib/calculations/repair-cost.ts` reste la seule
 * source du COÛT de réparation ; le Market Value Engine ne calcule qu'un
 * éventuel stigmate de marché séparé (voir lib/market-value/README.md,
 * section "éviter le double comptage"). Cette fonction ne fait AUCUNE
 * hypothèse de coût supplémentaire : elle recopie simplement les bornes
 * déjà connues, et laisse `estimatedMarketImpact` non renseigné pour que
 * le moteur applique ses propres règles documentées par catégorie.
 */
function repairsToConditionIssues(repairs: RepairSignal[]): VehicleConditionIssue[] {
  const severityMap = { faible: "low", moyen: "medium", eleve: "high" } as const;

  return repairs.map((repair) => ({
    category: repair.category,
    severity: severityMap[repair.riskLevel],
    repairCostLow: repair.costLow,
    repairCostHigh: repair.costHigh,
    // Confiance forfaitaire pour les données de démo : un vrai pipeline
    // IA fournira une confiance calculée à partir de la source (texte
    // explicite vs. supposition, qualité de la photo, etc.).
    confidence: repair.category === "accident" ? 0.6 : 0.75,
  }));
}

function buildTargetVehicleProfile(seed: DemoSeed) {
  return {
    make: seed.make,
    model: seed.model,
    generation: seed.generation,
    version: seed.version,
    trim: seed.trim,
    year: seed.year,
    mileage: seed.mileage,
    fuelType: seed.fuelTypeRaw.toLowerCase(),
    transmission: seed.transmissionRaw.toLowerCase(),
    horsepower: seed.horsepower,
    location: seed.location,
    condition: seed.condition,
    options: seed.options,
  };
}

export async function getDemoOpportunities(): Promise<Opportunity[]> {
  if (cachedOpportunities) return cachedOpportunities;

  const source = new DemoListingSource();
  const rawListings = await source.fetchListings();
  const seedsById = new Map(DEMO_SEEDS.map((seed) => [seed.externalId, seed]));

  const opportunities: Opportunity[] = rawListings.map((raw) => {
    const seed = seedsById.get(raw.externalId);
    if (!seed) {
      throw new Error(`Aucun signal d'analyse trouvé pour l'annonce ${raw.externalId}`);
    }

    const normalized = normalizeRawListing(raw);

    const vehicle = {
      ...normalized.vehicle,
      id: `vehicle-${seed.externalId}`,
      createdAt: seed.publishedAt,
    };

    const listing = {
      ...normalized.listing,
      id: `listing-${seed.externalId}`,
      vehicleId: vehicle.id,
      createdAt: seed.retrievedAt,
    };

    const {
      analysis: computedAnalysis,
      repairs: computedRepairs,
      valueAnalysis,
    } = analyzeListing(vehicle, listing, {
      targetVehicleProfile: buildTargetVehicleProfile(seed),
      comparables: DEMO_COMPARABLES,
      conditionIssues: repairsToConditionIssues(seed.repairs),
      resalePriceConservative: seed.resalePriceConservative,
      resalePriceRealistic: seed.resalePriceRealistic,
      resalePriceOptimistic: seed.resalePriceOptimistic,
      transportCost: seed.transportCost,
      preparationCost: seed.preparationCost,
      repairs: seed.repairs,
      resaleEaseScore: seed.resaleEaseScore,
      accidentReported: seed.accidentReported,
    });

    const analysis: Analysis = {
      ...computedAnalysis,
      id: `analysis-${seed.externalId}`,
      listingId: listing.id,
      createdAt: seed.retrievedAt,
    };

    const repairs: Repair[] = computedRepairs.map((repair, index) => ({
      ...repair,
      id: `repair-${seed.externalId}-${index}`,
      analysisId: analysis.id,
    }));

    return { vehicle, listing, analysis, repairs, valueAnalysis };
  });

  cachedOpportunities = opportunities;
  return opportunities;
}
