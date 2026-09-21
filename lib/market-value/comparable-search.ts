import { computeSimilarity } from "./comparable-score";
import type { ComparableVehicle, TargetVehicle, WeightedComparable } from "./types";

/**
 * En dessous de ce score, un véhicule est jugé trop différent pour être
 * un comparable exploitable — il est conservé dans la liste retournée
 * (transparence) mais marqué `used: false`.
 */
export const MIN_SIMILARITY_THRESHOLD = 40;

/** Nombre maximal de comparables considérés, pour rester simple et rapide. */
export const MAX_COMPARABLES = 40;

function sameModel(a: { make: string; model: string }, b: { make: string; model: string }): boolean {
  return a.make.trim().toLowerCase() === b.make.trim().toLowerCase() &&
    a.model.trim().toLowerCase() === b.model.trim().toLowerCase();
}

function sameMake(a: { make: string }, b: { make: string }): boolean {
  return a.make.trim().toLowerCase() === b.make.trim().toLowerCase();
}

export interface ComparableSearchResult {
  comparables: WeightedComparable[];
  /** true si aucun comparable exact du même modèle n'a été trouvé et que la
   * recherche a dû être élargie à la marque (dégradation documentée, voir README). */
  widenedToMakeOnly: boolean;
}

/**
 * Sélectionne les véhicules comparables pour un véhicule cible.
 *
 * Étape 1 (filtre obligatoire) : même marque + même modèle. Un véhicule
 * d'un autre modèle n'est JAMAIS un comparable, quelle que soit sa
 * ressemblance par ailleurs (spec §6).
 *
 * Si cette étape ne renvoie aucun résultat, la recherche est élargie à la
 * marque seule (dégradation explicite et documentée plutôt qu'un échec
 * silencieux) — voir `widenedToMakeOnly`.
 *
 * Étape 2 : chaque candidat restant reçoit un score de similarité
 * (comparable-score.ts). Ceux sous `MIN_SIMILARITY_THRESHOLD` sont
 * conservés dans le résultat pour la transparence, mais marqués `used: false`.
 *
 * La détection des valeurs aberrantes et le calcul des poids se font
 * ensuite dans comparable-weight.ts, une fois ce filtre appliqué.
 */
export function findComparables(
  target: TargetVehicle,
  availableVehicles: ComparableVehicle[]
): ComparableSearchResult {
  let candidates = availableVehicles.filter((v) => sameModel(target, v));
  let widenedToMakeOnly = false;

  if (candidates.length === 0) {
    candidates = availableVehicles.filter((v) => sameMake(target, v));
    widenedToMakeOnly = true;
  }

  const scored = candidates
    .map((comparable) => {
      const similarity = computeSimilarity(target, comparable);
      return { comparable, similarity };
    })
    .sort((a, b) => b.similarity.score - a.similarity.score)
    .slice(0, MAX_COMPARABLES);

  const comparables: WeightedComparable[] = scored.map(({ comparable, similarity }) => ({
    comparable,
    similarity,
    weight: 0,
    isOutlier: false,
    used: similarity.score >= MIN_SIMILARITY_THRESHOLD,
  }));

  return { comparables, widenedToMakeOnly };
}
