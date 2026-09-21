/**
 * Calculs liés à la position d'une annonce par rapport au marché.
 *
 * `marketValueEstimated` est pour l'instant une estimation saisie dans les
 * données de démo (représentant ce que produirait, à terme, un module de
 * comparables). Ce module ne fait que du calcul déterministe à partir de
 * cette estimation — il ne l'invente jamais.
 */

export interface MarketPosition {
  /** Écart en euros par rapport à la valeur de marché estimée (négatif = décote). */
  differenceAmount: number;
  /** Écart en pourcentage. Négatif = décote, positif = surcote. */
  differencePercent: number;
  isDiscounted: boolean;
}

export function computeMarketPosition(
  price: number,
  marketValueEstimated: number
): MarketPosition {
  const differenceAmount = price - marketValueEstimated;
  const differencePercent =
    marketValueEstimated > 0 ? (differenceAmount / marketValueEstimated) * 100 : 0;

  return {
    differenceAmount,
    differencePercent,
    isDiscounted: differenceAmount < 0,
  };
}

/**
 * Score "décote marché" sur 100 utilisé par le Deal Score.
 * Une décote de 20% ou plus atteint le score maximal ; une surcote donne 0.
 */
export function discountToScore(differencePercent: number): number {
  const DISCOUNT_CEILING_PERCENT = 20;
  if (differencePercent >= 0) return 0;

  const discount = Math.min(Math.abs(differencePercent), DISCOUNT_CEILING_PERCENT);
  return Math.round((discount / DISCOUNT_CEILING_PERCENT) * 100);
}
