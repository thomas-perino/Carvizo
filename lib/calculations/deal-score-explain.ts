import type { DealScoreExplanation, RiskLevel } from "@/types";
import type { DealScoreBreakdown } from "./deal-score";

/**
 * Transforme les sous-scores du Deal Score en points positifs / négatifs
 * lisibles, sur le modèle de l'exemple de la spec :
 *
 *   + forte décote par rapport au marché
 *   + faible coût de remise en état
 *   + modèle facile à revendre
 *   - kilométrage légèrement élevé
 *
 * Chaque règle est simple et déterministe : aucune génération par IA.
 */
export interface DealScoreExplanationInput {
  breakdown: DealScoreBreakdown;
  marketDifferencePercent: number;
  riskLevel: RiskLevel;
  mileage: number;
  repairCount: number;
}

const HIGH_MILEAGE_NOTICE = 150_000;
const VERY_HIGH_MILEAGE_NOTICE = 200_000;

export function explainDealScore(input: DealScoreExplanationInput): DealScoreExplanation {
  const { breakdown, marketDifferencePercent, riskLevel, mileage, repairCount } = input;
  const { subScores } = breakdown;

  const positives: string[] = [];
  const negatives: string[] = [];

  // Décote marché
  if (subScores.marketDiscount >= 70) {
    positives.push("Forte décote par rapport au marché");
  } else if (subScores.marketDiscount >= 35) {
    positives.push("Prix légèrement inférieur au marché");
  } else if (marketDifferencePercent > 5) {
    negatives.push("Prix proche ou au-dessus du marché");
  }

  // Profit
  if (subScores.profit >= 70) {
    positives.push("Bénéfice potentiel élevé");
  } else if (subScores.profit <= 20) {
    negatives.push("Marge potentielle faible");
  }

  // État / réparations
  if (subScores.condition >= 80) {
    positives.push("Faible coût de remise en état");
  } else if (subScores.condition <= 40) {
    negatives.push("Coût de remise en état significatif");
  }

  // Risque
  if (riskLevel === "eleve") {
    negatives.push("Risque mécanique ou accidentel élevé à vérifier");
  } else if (riskLevel === "faible" && repairCount === 0) {
    positives.push("Aucun problème majeur identifié dans les informations fournies");
  }

  // Facilité de revente
  if (subScores.resaleEase >= 75) {
    positives.push("Modèle facile à revendre");
  } else if (subScores.resaleEase <= 35) {
    negatives.push("Modèle plus difficile à revendre sur ce segment");
  }

  // Kilométrage
  if (mileage >= VERY_HIGH_MILEAGE_NOTICE) {
    negatives.push("Kilométrage élevé");
  } else if (mileage >= HIGH_MILEAGE_NOTICE) {
    negatives.push("Kilométrage légèrement élevé");
  }

  return { positives, negatives };
}
