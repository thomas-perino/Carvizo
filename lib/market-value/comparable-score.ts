import type {
  ComparableVehicle,
  SimilarityBreakdownItem,
  SimilarityResult,
  TargetVehicle,
} from "./types";

/**
 * Grille de score de similarité (0 à 100), documentée et déterministe.
 *
 * Le "même modèle" (marque + modèle) N'EST PAS noté ici : c'est un
 * prérequis appliqué en amont par `findComparables` (voir
 * comparable-search.ts) — un véhicule d'un autre modèle n'arrive jamais
 * jusqu'à cette fonction. Les 100 points restants se répartissent ainsi :
 *
 *   Critères très importants
 *     Génération                15 pts
 *     Motorisation (puissance)   20 pts
 *     Carburant                  10 pts
 *     Transmission               10 pts
 *   Critères importants
 *     Année                      14 pts
 *     Kilométrage                14 pts
 *     Finition                   10 pts
 *   Critères secondaires
 *     État déclaré                3 pts
 *     Localisation                2 pts
 *     Équipements                 2 pts
 *                       TOTAL   100 pts
 *
 * Quand une donnée est inconnue d'un côté ou de l'autre, le critère
 * reçoit un score partiel documenté plutôt qu'un 0 sec ou un 100 supposé
 * — l'incertitude qui en résulte est ensuite reflétée dans le niveau de
 * confiance (voir confidence.ts), jamais dans le score de similarité lui-même.
 */

const YEAR_DIFF_SCALE = [
  { maxDiff: 0, points: 14 },
  { maxDiff: 1, points: 11 },
  { maxDiff: 2, points: 8 },
  { maxDiff: 3, points: 5 },
  { maxDiff: 4, points: 2 },
];

const MILEAGE_DIFF_SCALE = [
  { maxDiff: 10_000, points: 14 },
  { maxDiff: 25_000, points: 10 },
  { maxDiff: 50_000, points: 6 },
  { maxDiff: 90_000, points: 3 },
];

const HORSEPOWER_DIFF_SCALE = [
  { maxDiff: 5, points: 20 },
  { maxDiff: 15, points: 14 },
  { maxDiff: 30, points: 7 },
];

function scaleLookup(diff: number, scale: { maxDiff: number; points: number }[]): number {
  for (const step of scale) {
    if (diff <= step.maxDiff) return step.points;
  }
  return 0;
}

function normalize(value: string | undefined): string | undefined {
  return value?.trim().toLowerCase() || undefined;
}

export function computeSimilarity(
  target: TargetVehicle,
  comparable: ComparableVehicle
): SimilarityResult {
  const breakdown: SimilarityBreakdownItem[] = [];

  // --- Génération (15 pts) ---
  const targetGen = normalize(target.generation);
  const compGen = normalize(comparable.generation);
  if (targetGen && compGen) {
    const points = targetGen === compGen ? 15 : 0;
    breakdown.push({
      criterion: "Génération",
      points,
      maxPoints: 15,
      note: points === 15 ? "Même génération" : "Génération différente",
    });
  } else {
    breakdown.push({
      criterion: "Génération",
      points: 7,
      maxPoints: 15,
      note: "Génération inconnue d'un côté au moins",
    });
  }

  // --- Motorisation / puissance (20 pts) ---
  if (target.horsepower !== undefined && comparable.horsepower !== undefined) {
    const diff = Math.abs(target.horsepower - comparable.horsepower);
    const points = scaleLookup(diff, HORSEPOWER_DIFF_SCALE);
    breakdown.push({
      criterion: "Motorisation",
      points,
      maxPoints: 20,
      note: `Écart de puissance : ${diff} ch`,
    });
  } else {
    const targetVersion = normalize(target.version);
    const compVersion = normalize(comparable.version);
    const looseMatch =
      targetVersion && compVersion
        ? targetVersion.includes(compVersion) || compVersion.includes(targetVersion)
        : false;
    breakdown.push({
      criterion: "Motorisation",
      points: looseMatch ? 10 : 0,
      maxPoints: 20,
      note: "Puissance inconnue, comparaison approximative sur le libellé moteur",
    });
  }

  // --- Carburant (10 pts) ---
  const sameFuel = normalize(target.fuelType) === normalize(comparable.fuelType);
  breakdown.push({
    criterion: "Carburant",
    points: sameFuel ? 10 : 0,
    maxPoints: 10,
    note: sameFuel ? "Même carburant" : "Carburant différent",
  });

  // --- Transmission (10 pts) ---
  const sameTransmission = normalize(target.transmission) === normalize(comparable.transmission);
  breakdown.push({
    criterion: "Transmission",
    points: sameTransmission ? 10 : 0,
    maxPoints: 10,
    note: sameTransmission ? "Même boîte" : "Boîte différente",
  });

  // --- Année (14 pts) ---
  const yearDiff = Math.abs(target.year - comparable.year);
  breakdown.push({
    criterion: "Année",
    points: scaleLookup(yearDiff, YEAR_DIFF_SCALE),
    maxPoints: 14,
    note: `Écart de ${yearDiff} an(s)`,
  });

  // --- Kilométrage (14 pts) ---
  const mileageDiff = Math.abs(target.mileage - comparable.mileage);
  breakdown.push({
    criterion: "Kilométrage",
    points: scaleLookup(mileageDiff, MILEAGE_DIFF_SCALE),
    maxPoints: 14,
    note: `Écart de ${mileageDiff.toLocaleString("fr-FR")} km`,
  });

  // --- Finition (10 pts) ---
  const targetTrim = normalize(target.trim);
  const compTrim = normalize(comparable.trim);
  if (targetTrim && compTrim) {
    const points = targetTrim === compTrim ? 10 : 2;
    breakdown.push({
      criterion: "Finition",
      points,
      maxPoints: 10,
      note: points === 10 ? "Même finition" : "Finition différente",
    });
  } else {
    breakdown.push({
      criterion: "Finition",
      points: 5,
      maxPoints: 10,
      note: "Finition inconnue d'un côté au moins",
    });
  }

  // --- État déclaré (3 pts) ---
  if (target.condition && comparable.condition) {
    breakdown.push({
      criterion: "État déclaré",
      points: target.condition === comparable.condition ? 3 : 1,
      maxPoints: 3,
    });
  } else {
    breakdown.push({ criterion: "État déclaré", points: 1, maxPoints: 3, note: "État inconnu" });
  }

  // --- Localisation (2 pts) ---
  const sameLocation =
    target.location && comparable.location
      ? normalize(comparable.location)?.includes(normalize(target.location) ?? "\0") ||
        normalize(target.location)?.includes(normalize(comparable.location) ?? "\0")
      : false;
  breakdown.push({ criterion: "Localisation", points: sameLocation ? 2 : 0, maxPoints: 2 });

  // --- Équipements (2 pts) ---
  const targetOptions = target.options ?? [];
  const compOptions = comparable.options ?? [];
  if (targetOptions.length > 0) {
    const overlap = targetOptions.filter((o) => compOptions.includes(o)).length;
    const ratio = overlap / targetOptions.length;
    breakdown.push({
      criterion: "Équipements",
      points: Math.round(ratio * 2),
      maxPoints: 2,
    });
  } else {
    breakdown.push({ criterion: "Équipements", points: 1, maxPoints: 2, note: "Non renseignés" });
  }

  const score = breakdown.reduce((sum, item) => sum + item.points, 0);

  return { score: Math.max(0, Math.min(100, score)), breakdown };
}
