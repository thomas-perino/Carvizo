import type { MarketAdjustment, TargetVehicle, WeightedComparable } from "./types";

/**
 * Fournisseur d'ajustement de finition. Retourne un coefficient
 * multiplicatif (ex: 0.06 = +6% de la valeur brute) pour une finition
 * connue, ou `null` si aucune donnée fiable n'existe — dans ce cas, le
 * moteur n'invente jamais une valeur (spec §13) : aucun ajustement n'est
 * appliqué, et la confiance est légèrement réduite ailleurs.
 *
 * Conçu comme une interface pour permettre, plus tard, de brancher une
 * vraie base de cotation par finition sans changer le reste du moteur.
 */
export interface TrimAdjustmentProvider {
  getAdjustment(make: string, model: string, trim: string): number | null;
}

/**
 * Fournisseur d'ajustement d'équipements. Retourne un montant fixe en
 * euros pour la liste d'options fournie (0 si aucune reconnue). Les
 * options inconnues sont simplement ignorées plutôt que refusées.
 */
export interface OptionAdjustmentProvider {
  getAdjustment(options: string[]): number;
}

/**
 * Exemple de coefficients de finition pour la démonstration (spec §13).
 * Volontairement partiel : seules quelques finitions réellement présentes
 * dans les données de démo sont couvertes, pour montrer le chemin
 * "trouvé" ET le chemin "non trouvé -> aucun ajustement".
 */
const DEMO_TRIM_COEFFICIENTS: Record<string, number> = {
  "peugeot|208|allure": 0.02,
  "peugeot|208|gt": 0.06,
  "renault|clio|business": 0,
  "renault|clio|intens": 0.04,
  "volkswagen|golf|confortline": 0,
  "volkswagen|golf|gti": 0.12,
  "bmw|série 3|m sport": 0.08,
  "bmw|série 1|m sport": 0.08,
  "toyota|yaris|dynamic": 0.03,
};

export class DemoTrimAdjustmentProvider implements TrimAdjustmentProvider {
  getAdjustment(make: string, model: string, trim: string): number | null {
    const key = `${make.trim().toLowerCase()}|${model.trim().toLowerCase()}|${trim
      .trim()
      .toLowerCase()}`;
    return key in DEMO_TRIM_COEFFICIENTS ? DEMO_TRIM_COEFFICIENTS[key] : null;
  }
}

/** Exemple de valorisation d'équipements pour la démonstration (spec §14). */
const DEMO_OPTION_VALUES: Record<string, number> = {
  toit_panoramique: 250,
  camera_recul: 150,
  gps: 100,
  cuir: 200,
  sieges_chauffants: 120,
};

export class DemoOptionAdjustmentProvider implements OptionAdjustmentProvider {
  getAdjustment(options: string[]): number {
    return options.reduce((sum, option) => sum + (DEMO_OPTION_VALUES[option] ?? 0), 0);
  }
}

/**
 * Ajustement kilométrage : compare le kilométrage du véhicule cible à la
 * moyenne pondérée des comparables réellement utilisés, et ajuste la
 * valeur brute en conséquence.
 *
 * V1 volontairement simple : taux fixe en €/km, documenté et isolé ici
 * pour pouvoir être remplacé plus tard par des coefficients par modèle,
 * des données historiques ou un modèle statistique (spec §12).
 */
export const MILEAGE_RATE_PER_KM = 0.045;
/** Taux d'ajustement par année d'écart, en % de la valeur brute. */
export const YEAR_RATE_PER_YEAR = 0.02;

function weightedAverage(comparables: WeightedComparable[], pick: (c: WeightedComparable) => number): number {
  const usable = comparables.filter((c) => c.used && !c.isOutlier && c.weight > 0);
  if (usable.length === 0) return 0;
  const totalWeight = usable.reduce((s, c) => s + c.weight, 0);
  return usable.reduce((s, c) => s + pick(c) * c.weight, 0) / totalWeight;
}

export function computeMileageAdjustment(
  target: TargetVehicle,
  usedComparables: WeightedComparable[]
): MarketAdjustment | null {
  const avgMileage = weightedAverage(usedComparables, (c) => c.comparable.mileage);
  if (avgMileage === 0) return null;

  const diff = avgMileage - target.mileage; // positif si le véhicule cible a moins roulé
  const amount = Math.round(diff * MILEAGE_RATE_PER_KM);
  if (amount === 0) return null;

  return {
    label: "Kilométrage",
    amount,
    reason:
      diff > 0
        ? `Kilométrage inférieur de ${Math.round(Math.abs(diff)).toLocaleString("fr-FR")} km à la moyenne des comparables`
        : `Kilométrage supérieur de ${Math.round(Math.abs(diff)).toLocaleString("fr-FR")} km à la moyenne des comparables`,
  };
}

export function computeYearAdjustment(
  target: TargetVehicle,
  usedComparables: WeightedComparable[],
  rawEstimate: number
): MarketAdjustment | null {
  const avgYear = weightedAverage(usedComparables, (c) => c.comparable.year);
  if (avgYear === 0) return null;

  const diff = target.year - avgYear; // positif si le véhicule cible est plus récent
  const amount = Math.round(rawEstimate * YEAR_RATE_PER_YEAR * diff);
  if (amount === 0) return null;

  return {
    label: "Année",
    amount,
    reason:
      diff > 0
        ? `Millésime plus récent que la moyenne des comparables (+${diff.toFixed(1)} an)`
        : `Millésime plus ancien que la moyenne des comparables (${diff.toFixed(1)} an)`,
  };
}

export function computeTrimAdjustment(
  target: TargetVehicle,
  rawEstimate: number,
  provider: TrimAdjustmentProvider
): { adjustment: MarketAdjustment | null; missingData: boolean } {
  if (!target.trim) return { adjustment: null, missingData: false };

  const coefficient = provider.getAdjustment(target.make, target.model, target.trim);
  if (coefficient === null) {
    return { adjustment: null, missingData: true };
  }
  if (coefficient === 0) return { adjustment: null, missingData: false };

  return {
    adjustment: {
      label: "Finition",
      amount: Math.round(rawEstimate * coefficient),
      reason: `Coefficient de finition "${target.trim}" (${coefficient > 0 ? "+" : ""}${Math.round(coefficient * 100)}%)`,
    },
    missingData: false,
  };
}

export function computeOptionsAdjustment(
  target: TargetVehicle,
  provider: OptionAdjustmentProvider
): MarketAdjustment | null {
  const options = target.options ?? [];
  if (options.length === 0) return null;

  const amount = provider.getAdjustment(options);
  if (amount === 0) return null;

  return {
    label: "Équipements",
    amount,
    reason: `Équipements valorisés : ${options.join(", ")}`,
  };
}
