import type { Analysis, Listing, Repair, Vehicle } from "@/types";
import {
  computeDealScore,
  computeMarketPosition,
  computeProfitScenarios,
  computeRegistrationCostForVehicle,
  computeConditionScore,
  computeRiskLevel,
  computeROI,
  computeTotalInvestment,
  computeUnexpectedCost,
  explainDealScore,
  summarizeRepairCosts,
} from "@/lib/calculations";
import { analyzeVehicleValue } from "@/lib/market-value/vehicle-value-analysis";
import type { VehicleValueAnalysis } from "@/lib/market-value/types";
import type { AnalysisSignals } from "./types";

export type ComputedAnalysis = Omit<Analysis, "id" | "listingId" | "createdAt">;
export type ComputedRepair = Omit<Repair, "id" | "analysisId">;

export interface AnalysisResult {
  analysis: ComputedAnalysis;
  repairs: ComputedRepair[];
  /** Détail complet de l'estimation de valeur, produit par le Market Value Engine. */
  valueAnalysis: VehicleValueAnalysis;
}

/**
 * Le moteur d'analyse : point d'entrée unique qui transforme un
 * (véhicule, annonce, signaux) en une analyse financière complète.
 *
 * C'est ici, et uniquement ici, que les modules de `lib/calculations` et
 * le Market Value Engine (`lib/market-value/`) sont assemblés. Toute
 * nouvelle source d'annonces ou tout futur module d'IA doit produire des
 * `AnalysisSignals` puis appeler cette fonction — jamais recalculer le
 * profit, la valeur de marché ou le Deal Score par un autre chemin.
 *
 * Valeur de marché : la fonction délègue entièrement au Market Value
 * Engine (via `analyzeVehicleValue`) pour obtenir une valeur saine, une
 * valeur actuelle (compte tenu de l'état déclaré) et une valeur après
 * remise en état. C'est la **valeur actuelle** qui alimente le reste des
 * calculs (décote de marché, champs `marketValue*` de l'Analysis stockée
 * en base) : comparer le prix demandé à la valeur actuelle du véhicule
 * (et non à une valeur "saine" théorique) est la comparaison pertinente
 * pour juger si le prix est intéressant compte tenu de l'état réel de
 * CETTE annonce.
 */
export function analyzeListing(
  vehicle: Vehicle,
  listing: Listing,
  signals: AnalysisSignals
): AnalysisResult {
  const registrationCost = computeRegistrationCostForVehicle(vehicle);
  const unexpectedCost = computeUnexpectedCost(listing.price);
  const repairSummary = summarizeRepairCosts(signals.repairs);

  const valueAnalysis = analyzeVehicleValue(
    signals.targetVehicleProfile,
    signals.comparables,
    signals.conditionIssues
  );
  const { currentValue } = valueAnalysis;

  const totalInvestment = computeTotalInvestment({
    purchasePrice: listing.price,
    registrationCost,
    transportCost: signals.transportCost,
    repairCostEstimated: repairSummary.costEstimated,
    preparationCost: signals.preparationCost,
    unexpectedCost,
  });

  const profitScenarios = computeProfitScenarios(
    {
      conservative: signals.resalePriceConservative,
      realistic: signals.resalePriceRealistic,
      optimistic: signals.resalePriceOptimistic,
    },
    totalInvestment
  );

  const roi = computeROI(profitScenarios.realistic, totalInvestment);

  const marketPosition = computeMarketPosition(listing.price, currentValue.estimated);

  const riskLevel = computeRiskLevel({
    repairs: signals.repairs,
    accidentReported: signals.accidentReported,
    mileage: vehicle.mileage,
  });

  const conditionScore = computeConditionScore(signals.repairs);

  const dealScoreBreakdown = computeDealScore({
    profitRealistic: profitScenarios.realistic,
    marketDifferencePercent: marketPosition.differencePercent,
    riskLevel,
    resaleEaseScore: signals.resaleEaseScore,
    conditionScore,
  });

  const analysisSummary = explainDealScore({
    breakdown: dealScoreBreakdown,
    marketDifferencePercent: marketPosition.differencePercent,
    riskLevel,
    mileage: vehicle.mileage,
    repairCount: signals.repairs.length,
  });

  const analysis: ComputedAnalysis = {
    marketValueLow: currentValue.low,
    marketValueEstimated: currentValue.estimated,
    marketValueHigh: currentValue.high,

    resalePriceConservative: signals.resalePriceConservative,
    resalePriceRealistic: signals.resalePriceRealistic,
    resalePriceOptimistic: signals.resalePriceOptimistic,

    registrationCost,
    transportCost: signals.transportCost,
    repairCostLow: repairSummary.costLow,
    repairCostHigh: repairSummary.costHigh,
    preparationCost: signals.preparationCost,
    unexpectedCost,

    totalInvestment,

    profitConservative: profitScenarios.conservative,
    profitRealistic: profitScenarios.realistic,
    profitOptimistic: profitScenarios.optimistic,

    roi,

    riskLevel,
    dealScore: dealScoreBreakdown.score,
    analysisSummary,
  };

  const repairs: ComputedRepair[] = signals.repairs.map((signal) => ({
    name: signal.name,
    description: signal.description,
    costLow: signal.costLow,
    costHigh: signal.costHigh,
    difficulty: signal.difficulty,
    riskLevel: signal.riskLevel,
    category: signal.category,
  }));

  return { analysis, repairs, valueAnalysis };
}
