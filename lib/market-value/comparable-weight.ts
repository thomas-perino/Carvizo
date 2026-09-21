import type { WeightedComparable } from "./types";

/**
 * Détection des valeurs aberrantes par MAD (Median Absolute Deviation).
 *
 * Méthode : on calcule la médiane des prix, puis l'écart absolu médian
 * (MAD) autour de cette médiane. Pour chaque prix, on calcule un
 * "modified z-score" = 0.6745 × (prix - médiane) / MAD. Un score dont la
 * valeur absolue dépasse `OUTLIER_Z_SCORE_THRESHOLD` est considéré comme
 * aberrant.
 *
 * On préfère le MAD à un simple écart-type/z-score classique car il est
 * beaucoup moins sensible aux valeurs extrêmes qu'il doit justement
 * détecter (un écart-type classique est "tiré" par l'aberration elle-même).
 */
const OUTLIER_Z_SCORE_THRESHOLD = 3.5;
const MAD_CONSTANT = 0.6745;

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function detectOutliers(comparables: WeightedComparable[]): WeightedComparable[] {
  const usable = comparables.filter((c) => c.used);
  if (usable.length < 4) {
    // Avec moins de 4 comparables utilisables, une détection statistique
    // d'aberrants n'est pas fiable : on ne marque rien comme aberrant, mais
    // la confiance en tiendra compte (voir confidence.ts).
    return comparables;
  }

  const prices = usable.map((c) => c.comparable.price);
  const med = median(prices);
  const mad = median(prices.map((p) => Math.abs(p - med)));

  if (mad === 0) return comparables; // tous les prix identiques : rien d'aberrant.

  return comparables.map((c) => {
    if (!c.used) return c;
    const modifiedZ = (MAD_CONSTANT * (c.comparable.price - med)) / mad;
    const isOutlier = Math.abs(modifiedZ) > OUTLIER_Z_SCORE_THRESHOLD;
    return isOutlier ? { ...c, isOutlier: true, used: false } : c;
  });
}

/**
 * Pondération : le poids de chaque comparable est proportionnel au CARRÉ
 * de son score de similarité (plutôt que le score lui-même), afin que les
 * comparables les plus proches pèsent nettement plus que les comparables
 * moyennement similaires — c'est la demande explicite de la spec ("les
 * véhicules les plus similaires doivent avoir un poids plus important").
 * Les poids sont ensuite normalisés pour sommer à 1.
 */
export function computeWeights(comparables: WeightedComparable[]): WeightedComparable[] {
  const usable = comparables.filter((c) => c.used && !c.isOutlier);
  const totalSquaredScore = usable.reduce((sum, c) => sum + c.similarity.score ** 2, 0);

  if (totalSquaredScore === 0) return comparables;

  return comparables.map((c) => {
    if (!c.used || c.isOutlier) return { ...c, weight: 0 };
    return { ...c, weight: c.similarity.score ** 2 / totalSquaredScore };
  });
}
