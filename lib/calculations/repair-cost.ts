import type { Difficulty, RepairCategory, RiskLevel } from "@/types";

/**
 * Un "signal" de réparation : ce que l'on sait (ou suppose) d'un point de
 * réparation identifié sur une annonce, avant tout calcul financier.
 *
 * À ce stade, ces signaux sont saisis manuellement dans les données de démo.
 * Ils sont conçus pour être, à terme, produits par un module d'IA qui lit
 * la description/les photos d'une annonce — mais ce module de calcul n'a
 * aucune dépendance envers l'IA : il se contente d'agréger des nombres.
 */
export interface RepairSignal {
  name: string;
  description: string;
  costLow: number;
  costHigh: number;
  difficulty: Difficulty;
  riskLevel: RiskLevel;
  category: RepairCategory;
}

export interface RepairCostSummary {
  costLow: number;
  costHigh: number;
  /** Point médian utilisé pour les calculs de rentabilité. */
  costEstimated: number;
}

/** Agrège une liste de réparations en une fourchette de coût totale. */
export function summarizeRepairCosts(repairs: RepairSignal[]): RepairCostSummary {
  const costLow = repairs.reduce((sum, r) => sum + r.costLow, 0);
  const costHigh = repairs.reduce((sum, r) => sum + r.costHigh, 0);
  const costEstimated = Math.round((costLow + costHigh) / 2);

  return { costLow, costHigh, costEstimated };
}

/**
 * Convertit la charge de réparations en un score "état" sur 100
 * (100 = très bon état, peu ou pas de réparations coûteuses).
 *
 * Utilisé comme une des composantes du Deal Score.
 */
export function computeConditionScore(repairs: RepairSignal[]): number {
  if (repairs.length === 0) return 100;

  const { costEstimated } = summarizeRepairCosts(repairs);

  // Au-delà de 3000€ de remise en état estimée, le score "état" est à 0.
  const CONDITION_COST_CEILING = 3000;
  const costPenalty = Math.min(costEstimated / CONDITION_COST_CEILING, 1) * 100;

  // Une réparation à risque élevé pèse davantage qu'une simple usure.
  const highRiskCount = repairs.filter((r) => r.riskLevel === "eleve").length;
  const riskPenalty = Math.min(highRiskCount * 20, 60);

  const score = 100 - costPenalty * 0.6 - riskPenalty * 0.4;
  return Math.max(0, Math.round(score));
}
