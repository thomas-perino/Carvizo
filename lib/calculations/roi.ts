/**
 * ROI = Profit / Investissement total × 100
 *
 * Isolé dans son propre module pour rester facilement testable et
 * remplaçable (ex: ROI annualisé) sans toucher au calcul du profit.
 */
export function computeROI(profit: number, totalInvestment: number): number {
  if (totalInvestment <= 0) return 0;
  return Math.round((profit / totalInvestment) * 1000) / 10; // 1 décimale
}
