import { computeConfidence } from "./confidence";
import { detectOutliers, computeWeights } from "./comparable-weight";
import { findComparables } from "./comparable-search";
import {
  computeMileageAdjustment,
  computeOptionsAdjustment,
  computeTrimAdjustment,
  computeYearAdjustment,
  DemoOptionAdjustmentProvider,
  DemoTrimAdjustmentProvider,
  type OptionAdjustmentProvider,
  type TrimAdjustmentProvider,
} from "./adjustments";
import type {
  ComparableVehicle,
  MarketAdjustment,
  MarketValueEstimate,
  TargetVehicle,
  WeightedComparable,
} from "./types";

export class NoComparablesFoundError extends Error {
  constructor(target: TargetVehicle) {
    super(
      `Aucun comparable trouvé pour ${target.make} ${target.model}, même en élargissant à la marque.`
    );
    this.name = "NoComparablesFoundError";
  }
}

export interface EstimateMarketValueOptions {
  trimProvider?: TrimAdjustmentProvider;
  optionProvider?: OptionAdjustmentProvider;
}

/** Largeur de fourchette minimale/maximale, en proportion de la valeur estimée. */
const MIN_RANGE_RATIO = 0.04;
const MAX_RANGE_RATIO = 0.2;

function weightedAveragePrice(comparables: WeightedComparable[]): number {
  const usable = comparables.filter((c) => c.used && !c.isOutlier && c.weight > 0);
  const totalWeight = usable.reduce((s, c) => s + c.weight, 0);
  if (totalWeight === 0) return 0;
  return usable.reduce((s, c) => s + c.comparable.price * c.weight, 0) / totalWeight;
}

function weightedStdDev(comparables: WeightedComparable[], mean: number): number {
  const usable = comparables.filter((c) => c.used && !c.isOutlier && c.weight > 0);
  const totalWeight = usable.reduce((s, c) => s + c.weight, 0);
  if (totalWeight === 0 || usable.length < 2) return 0;
  const variance =
    usable.reduce((s, c) => s + c.weight * (c.comparable.price - mean) ** 2, 0) / totalWeight;
  return Math.sqrt(variance);
}

/**
 * Point d'entrée du Market Value Engine.
 *
 * Étapes (voir README du module pour le détail de chaque étape) :
 *   1. Sélection des comparables (comparable-search.ts)
 *   2. Détection des valeurs aberrantes (comparable-weight.ts)
 *   3. Pondération par similarité (comparable-weight.ts)
 *   4. Moyenne pondérée -> estimation brute
 *   5. Ajustements (kilométrage, année, finition, équipements)
 *   6. Fourchette basse/haute à partir de la dispersion réelle des comparables
 *   7. Niveau de confiance explicable
 */
export function estimateMarketValue(
  target: TargetVehicle,
  availableVehicles: ComparableVehicle[],
  options: EstimateMarketValueOptions = {}
): MarketValueEstimate {
  const trimProvider = options.trimProvider ?? new DemoTrimAdjustmentProvider();
  const optionProvider = options.optionProvider ?? new DemoOptionAdjustmentProvider();

  const { comparables: searched, widenedToMakeOnly } = findComparables(target, availableVehicles);

  if (searched.length === 0) {
    throw new NoComparablesFoundError(target);
  }

  const withOutliers = detectOutliers(searched);
  const weighted = computeWeights(withOutliers);

  const rawEstimate = Math.round(weightedAveragePrice(weighted));

  const missingDataNotes: string[] = [];
  if (widenedToMakeOnly) {
    missingDataNotes.push("Recherche élargie à la marque : aucun comparable exact du même modèle");
  }
  if (target.horsepower === undefined) missingDataNotes.push("Puissance du véhicule cible inconnue");
  if (!target.trim) missingDataNotes.push("Finition du véhicule cible inconnue");

  const adjustments: MarketAdjustment[] = [];
  const mileageAdj = computeMileageAdjustment(target, weighted);
  if (mileageAdj) adjustments.push(mileageAdj);

  const yearAdj = computeYearAdjustment(target, weighted, rawEstimate);
  if (yearAdj) adjustments.push(yearAdj);

  const { adjustment: trimAdj, missingData: trimMissing } = computeTrimAdjustment(
    target,
    rawEstimate,
    trimProvider
  );
  if (trimAdj) adjustments.push(trimAdj);
  if (trimMissing) missingDataNotes.push("Aucun coefficient de finition connu pour cette finition");

  const optionsAdj = computeOptionsAdjustment(target, optionProvider);
  if (optionsAdj) adjustments.push(optionsAdj);

  const estimated = Math.round(
    rawEstimate + adjustments.reduce((sum, a) => sum + a.amount, 0)
  );

  const usedCount = weighted.filter((c) => c.used && !c.isOutlier).length;
  const stdDev = weightedStdDev(weighted, rawEstimate);

  const rangeFromDispersion = usedCount >= 2 ? stdDev : estimated * MAX_RANGE_RATIO;
  const rangeWidth = Math.min(
    Math.max(rangeFromDispersion, estimated * MIN_RANGE_RATIO),
    estimated * MAX_RANGE_RATIO
  );

  const low = Math.round(estimated - rangeWidth);
  const high = Math.round(estimated + rangeWidth);

  const { level: confidence, reasons: confidenceReasons } = computeConfidence({
    usedComparables: weighted,
    missingDataNotes,
  });

  const outlierCount = weighted.filter((c) => c.isOutlier).length;
  const methodology = [
    `${searched.length} véhicule${searched.length > 1 ? "s" : ""} du même modèle identifié${
      searched.length > 1 ? "s" : ""
    }${widenedToMakeOnly ? " (recherche élargie à la marque)" : ""}`,
    `${usedCount} comparable${usedCount > 1 ? "s" : ""} retenu${usedCount > 1 ? "s" : ""} après filtrage par similarité${
      outlierCount > 0 ? ` et exclusion de ${outlierCount} valeur${outlierCount > 1 ? "s" : ""} aberrante${outlierCount > 1 ? "s" : ""}` : ""
    }`,
    "Moyenne pondérée par similarité (les comparables les plus proches comptent davantage)",
  ];
  if (adjustments.length > 0) {
    methodology.push(
      `${adjustments.length} ajustement${adjustments.length > 1 ? "s" : ""} appliqué${
        adjustments.length > 1 ? "s" : ""
      } (${adjustments.map((a) => a.label.toLowerCase()).join(", ")})`
    );
  }

  return {
    low,
    estimated,
    high,
    confidence,
    confidenceReasons,
    comparableCount: searched.length,
    usedComparableCount: usedCount,
    comparables: weighted,
    adjustments,
    methodology,
  };
}
