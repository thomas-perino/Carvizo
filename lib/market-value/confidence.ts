import type { ConfidenceLevel, WeightedComparable } from "./types";

/**
 * Calcule le niveau de confiance d'une estimation, ainsi que les raisons
 * qui l'expliquent (voir spec §11 et §22 : jamais une boîte noire).
 *
 * Le niveau dépend de quatre facteurs, chacun pouvant faire baisser (mais
 * jamais remonter au-delà de ce que les autres permettent) le niveau final :
 *
 * 1. Nombre de comparables utilisés (usedComparableCount).
 * 2. Similarité moyenne des comparables utilisés.
 * 3. Dispersion des prix (coefficient de variation).
 * 4. Données manquantes signalées par l'appelant (ex: finition/puissance
 *    inconnue), qui réduisent la confiance d'un cran.
 */
export interface ConfidenceInput {
  usedComparables: WeightedComparable[];
  missingDataNotes?: string[];
}

export interface ConfidenceResult {
  level: ConfidenceLevel;
  reasons: string[];
}

function coefficientOfVariation(prices: number[]): number {
  if (prices.length === 0) return 0;
  const mean = prices.reduce((s, p) => s + p, 0) / prices.length;
  if (mean === 0) return 0;
  const variance = prices.reduce((s, p) => s + (p - mean) ** 2, 0) / prices.length;
  return Math.sqrt(variance) / mean;
}

const LEVEL_RANK: Record<ConfidenceLevel, number> = { faible: 0, moyenne: 1, elevee: 2 };

function min(a: ConfidenceLevel, b: ConfidenceLevel): ConfidenceLevel {
  return LEVEL_RANK[a] <= LEVEL_RANK[b] ? a : b;
}

export function computeConfidence(input: ConfidenceInput): ConfidenceResult {
  const used = input.usedComparables.filter((c) => c.used && !c.isOutlier);
  const reasons: string[] = [];

  reasons.push(
    `${used.length} véhicule${used.length > 1 ? "s" : ""} comparable${used.length > 1 ? "s" : ""} utilisé${used.length > 1 ? "s" : ""}`
  );

  // 1. Nombre de comparables
  let countLevel: ConfidenceLevel;
  if (used.length >= 6) countLevel = "elevee";
  else if (used.length >= 3) countLevel = "moyenne";
  else countLevel = "faible";

  // 2. Similarité moyenne
  const avgSimilarity =
    used.length > 0 ? used.reduce((s, c) => s + c.similarity.score, 0) / used.length : 0;
  reasons.push(`Similarité moyenne : ${Math.round(avgSimilarity)} %`);

  let similarityLevel: ConfidenceLevel;
  if (avgSimilarity >= 80) similarityLevel = "elevee";
  else if (avgSimilarity >= 60) similarityLevel = "moyenne";
  else similarityLevel = "faible";

  // 3. Dispersion des prix
  const cv = coefficientOfVariation(used.map((c) => c.comparable.price));
  let dispersionLevel: ConfidenceLevel;
  if (cv <= 0.06) {
    dispersionLevel = "elevee";
    reasons.push("Faible dispersion des prix");
  } else if (cv <= 0.15) {
    dispersionLevel = "moyenne";
    reasons.push("Dispersion des prix modérée");
  } else {
    dispersionLevel = "faible";
    reasons.push("Forte dispersion des prix");
  }

  let level = min(min(countLevel, similarityLevel), dispersionLevel);

  // 4. Données manquantes : dégrade d'un cran, sans jamais remonter.
  if (input.missingDataNotes && input.missingDataNotes.length > 0) {
    level = min(level, level === "elevee" ? "moyenne" : "faible");
    reasons.push(...input.missingDataNotes);
  }

  return { level, reasons };
}
