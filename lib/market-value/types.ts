/**
 * Types du Market Value Engine.
 *
 * Ce module est volontairement indépendant du reste de l'application :
 * il ne connaît ni l'UI, ni Supabase, ni les sources d'annonces, ni l'IA.
 * Il travaille uniquement sur des objets `ComparableVehicle` / `TargetVehicle`
 * qu'on lui fournit, et retourne des types qui lui appartiennent. C'est
 * `lib/analysis/analyze-listing.ts` qui fait le pont avec le reste de
 * Carvizo (voir lib/market-value/README.md).
 */

export type VehicleCondition = "mauvais" | "moyen" | "bon" | "excellent";

/**
 * Niveau de confiance d'une estimation. Volontairement aligné sur les
 * valeurs françaises déjà utilisées par `RiskLevel` (faible/moyen/eleve)
 * ailleurs dans le code, pour rester cohérent — la spec autorisait
 * indifféremment "low/medium/high" ou une variante équivalente.
 */
export type ConfidenceLevel = "faible" | "moyenne" | "elevee";

/** Un véhicule réellement vendu (ou en vente), utilisé comme point de comparaison. */
export interface ComparableVehicle {
  id: string;

  make: string;
  model: string;
  /** Génération/plateforme (ex: "Golf Mk7"). Optionnelle : toutes les sources ne la fourniront pas. */
  generation?: string;

  /** Libellé moteur libre, ex: "1.2 PureTech 100". */
  version?: string;
  /** Finition commerciale, ex: "S line", "Allure". */
  trim?: string;

  year: number;
  mileage: number;

  fuelType: string;
  transmission: string;

  horsepower?: number;

  price: number;

  location?: string;
  condition?: VehicleCondition;

  /** Équipements significatifs reconnus (voir OptionAdjustmentProvider). */
  options?: string[];

  source?: string;
}

/**
 * Le véhicule pour lequel on cherche une estimation. Mêmes attributs que
 * `ComparableVehicle` sans id/prix/source (c'est justement ce qu'on ignore).
 */
export type TargetVehicle = Omit<ComparableVehicle, "id" | "price" | "source">;

/** Un point de la grille de score de similarité (voir comparable-score.ts). */
export interface SimilarityBreakdownItem {
  criterion: string;
  points: number;
  maxPoints: number;
  note?: string;
}

export interface SimilarityResult {
  score: number; // 0-100
  breakdown: SimilarityBreakdownItem[];
}

/** Un comparable après passage dans le moteur : score, poids, statut. */
export interface WeightedComparable {
  comparable: ComparableVehicle;
  similarity: SimilarityResult;
  /** Poids normalisé (0-1) réellement utilisé dans la moyenne pondérée. 0 si exclu. */
  weight: number;
  isOutlier: boolean;
  /** false si en dessous du seuil de similarité minimal, ou si valeur aberrante. */
  used: boolean;
}

/** Un ajustement appliqué à l'estimation brute (finition, options, kilométrage, année...). */
export interface MarketAdjustment {
  label: string;
  /** Montant en euros, positif ou négatif. */
  amount: number;
  reason: string;
}

export interface MarketValueEstimate {
  low: number;
  estimated: number;
  high: number;

  confidence: ConfidenceLevel;
  confidenceReasons: string[];

  /** Nombre de comparables du même modèle trouvés (avant filtre de similarité / aberrants). */
  comparableCount: number;
  /** Nombre de comparables effectivement utilisés dans la moyenne pondérée. */
  usedComparableCount: number;

  comparables: WeightedComparable[];
  adjustments: MarketAdjustment[];

  /** Explication générale, lisible, de la méthode utilisée pour CETTE estimation. */
  methodology: string[];
}

/**
 * Un problème d'état structuré, tel qu'il proviendra plus tard d'une
 * extraction IA (description ou photos). Le Market Value Engine ne décide
 * jamais lui-même qu'une réparation est nécessaire : il se contente de
 * recevoir ces objets et de les traduire en impact sur la valeur actuelle.
 */
export interface VehicleConditionIssue {
  category: string;
  severity: "low" | "medium" | "high";
  /** Impact estimé sur la valeur perçue, en euros, en plus du coût de réparation lui-même. */
  estimatedMarketImpact?: number;
  repairCostLow?: number;
  repairCostHigh?: number;
  /** 0-1 : confiance dans cette évaluation. */
  confidence: number;
}

/**
 * Distingue trois valeurs pour un même véhicule (voir spec §15-16) :
 * - healthyValue      : valeur d'un comparable sain, sans les problèmes du véhicule analysé ;
 * - currentValue      : valeur compte tenu de son état réel actuel (stigmate de marché uniquement,
 *                       jamais le coût de réparation — voir lib/market-value/condition-impact.ts) ;
 * - afterRepairValue  : valeur attendue une fois les réparations effectuées (= healthyValue).
 *
 * Le coût pour passer de currentValue à afterRepairValue est calculé
 * ailleurs, par lib/calculations/repair-cost.ts — jamais ici, pour éviter
 * tout double comptage.
 */
export interface VehicleValueAnalysis {
  healthyValue: MarketValueEstimate;
  currentValue: MarketValueEstimate;
  afterRepairValue: MarketValueEstimate;
  conditionIssues: VehicleConditionIssue[];
}
