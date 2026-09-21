import type { RiskLevel } from "@/types";
import type { RepairSignal } from "./repair-cost";

export interface RiskInput {
  repairs: RepairSignal[];
  accidentReported: boolean;
  mileage: number;
}

const HIGH_MILEAGE_THRESHOLD = 180_000;

/**
 * Détermine le niveau de risque global d'un véhicule à partir de règles
 * déterministes et explicables — jamais d'un score arbitraire.
 *
 * Règles (par ordre de priorité) :
 * 1. Un accident déclaré => risque élevé.
 * 2. Une réparation "mecanique_majeure" ou "accident" à risque élevé => risque élevé.
 * 3. Deux réparations à risque moyen, ou un kilométrage très élevé combiné
 *    à au moins une réparation => risque moyen.
 * 4. Sinon => risque faible.
 */
export function computeRiskLevel(input: RiskInput): RiskLevel {
  const { repairs, accidentReported, mileage } = input;

  if (accidentReported) return "eleve";

  const hasMajorHighRisk = repairs.some(
    (r) =>
      r.riskLevel === "eleve" &&
      (r.category === "mecanique_majeure" || r.category === "accident")
  );
  if (hasMajorHighRisk) return "eleve";

  const mediumRiskCount = repairs.filter((r) => r.riskLevel === "moyen").length;
  const anyHighRisk = repairs.some((r) => r.riskLevel === "eleve");
  const highMileage = mileage >= HIGH_MILEAGE_THRESHOLD;

  if (anyHighRisk || mediumRiskCount >= 2 || (highMileage && repairs.length > 0)) {
    return "moyen";
  }

  return "faible";
}

/** Score "risque" sur 100, où 100 = aucun risque, utilisé par le Deal Score. */
export function riskLevelToScore(riskLevel: RiskLevel): number {
  switch (riskLevel) {
    case "faible":
      return 100;
    case "moyen":
      return 55;
    case "eleve":
      return 15;
  }
}
