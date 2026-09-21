/**
 * Calcul du bénéfice et de l'investissement total.
 *
 * Formule (voir spec §5) :
 *
 *   Investissement total =
 *     Prix d'achat
 *     + Carte grise
 *     + Transport
 *     + Réparations (estimation médiane)
 *     + Préparation
 *     + Imprévus
 *
 *   Profit(scénario) = Prix de revente(scénario) - Investissement total
 *
 * L'investissement total ne dépend PAS du scénario de revente : seul le
 * prix de revente varie entre les scénarios prudent / réaliste / optimiste.
 */

export interface TotalInvestmentInput {
  purchasePrice: number;
  registrationCost: number;
  transportCost: number;
  repairCostEstimated: number;
  preparationCost: number;
  unexpectedCost: number;
}

export function computeTotalInvestment(input: TotalInvestmentInput): number {
  const {
    purchasePrice,
    registrationCost,
    transportCost,
    repairCostEstimated,
    preparationCost,
    unexpectedCost,
  } = input;

  return (
    purchasePrice +
    registrationCost +
    transportCost +
    repairCostEstimated +
    preparationCost +
    unexpectedCost
  );
}

export function computeProfit(resalePrice: number, totalInvestment: number): number {
  return resalePrice - totalInvestment;
}

export interface ProfitScenarios {
  conservative: number;
  realistic: number;
  optimistic: number;
}

export function computeProfitScenarios(
  resalePrices: { conservative: number; realistic: number; optimistic: number },
  totalInvestment: number
): ProfitScenarios {
  return {
    conservative: computeProfit(resalePrices.conservative, totalInvestment),
    realistic: computeProfit(resalePrices.realistic, totalInvestment),
    optimistic: computeProfit(resalePrices.optimistic, totalInvestment),
  };
}

/** Marge de sécurité par défaut pour les imprévus, en pourcentage du prix d'achat. */
export const DEFAULT_UNEXPECTED_COST_RATE = 0.03;

export function computeUnexpectedCost(purchasePrice: number): number {
  return Math.round(purchasePrice * DEFAULT_UNEXPECTED_COST_RATE);
}
