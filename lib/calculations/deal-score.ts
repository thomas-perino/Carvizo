import type { RiskLevel } from "@/types";
import { discountToScore } from "./market";
import { riskLevelToScore } from "./risk";

/**
 * Pondérations du Deal Score V1 (voir spec §6).
 * Modifiable ici sans toucher au reste du moteur de calcul.
 */
export const DEAL_SCORE_WEIGHTS = {
  profit: 0.3,
  marketDiscount: 0.2,
  risk: 0.2,
  resaleEase: 0.15,
  condition: 0.15,
} as const;

/** Bénéfice réaliste (en €) à partir duquel le sous-score "profit" est maximal. */
const PROFIT_SCORE_CEILING = 4000;

export function profitToScore(profitRealistic: number): number {
  const clamped = Math.max(0, Math.min(profitRealistic, PROFIT_SCORE_CEILING));
  return Math.round((clamped / PROFIT_SCORE_CEILING) * 100);
}

export interface DealScoreInput {
  profitRealistic: number;
  marketDifferencePercent: number;
  riskLevel: RiskLevel;
  resaleEaseScore: number; // 0-100, fourni par les données (voir lib/analysis)
  conditionScore: number; // 0-100, voir lib/calculations/repair-cost.ts
}

export interface DealScoreBreakdown {
  score: number;
  subScores: {
    profit: number;
    marketDiscount: number;
    risk: number;
    resaleEase: number;
    condition: number;
  };
}

export function computeDealScore(input: DealScoreInput): DealScoreBreakdown {
  const subScores = {
    profit: profitToScore(input.profitRealistic),
    marketDiscount: discountToScore(input.marketDifferencePercent),
    risk: riskLevelToScore(input.riskLevel),
    resaleEase: clampScore(input.resaleEaseScore),
    condition: clampScore(input.conditionScore),
  };

  const weighted =
    subScores.profit * DEAL_SCORE_WEIGHTS.profit +
    subScores.marketDiscount * DEAL_SCORE_WEIGHTS.marketDiscount +
    subScores.risk * DEAL_SCORE_WEIGHTS.risk +
    subScores.resaleEase * DEAL_SCORE_WEIGHTS.resaleEase +
    subScores.condition * DEAL_SCORE_WEIGHTS.condition;

  return {
    score: Math.max(0, Math.min(100, Math.round(weighted))),
    subScores,
  };
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
