import type { RepairSignal } from "@/lib/calculations/repair-cost";
import type {
  ComparableVehicle,
  TargetVehicle,
  VehicleConditionIssue,
} from "@/lib/market-value/types";

/**
 * Un "AnalysisSignal" regroupe toutes les informations qui, dans les
 * prochaines étapes du produit, proviendront de sources externes :
 *
 * - targetVehicleProfile / comparables -> Market Value Engine (lib/market-value/)
 * - conditionIssues      -> extraction IA de la description / des photos
 * - resalePrice*         -> module de comparables (revente), non couvert par
 *                           cette étape (voir lib/market-value/README.md)
 * - repairs               -> extraction IA de la description / des photos
 * - resaleEaseScore       -> popularité du modèle, données de marché
 * - accidentReported      -> extraction IA de la description
 *
 * Pour cette étape, `targetVehicleProfile`, `comparables` et
 * `conditionIssues` sont saisis à la main dans les données de démo (voir
 * data/demo). Le moteur d'analyse (lib/analysis/analyze-listing.ts) ne
 * sait pas d'où viennent ces données : il se contente d'appeler le Market
 * Value Engine puis de combiner le résultat de façon déterministe avec le
 * reste des calculs. C'est cette frontière qui permettra de brancher l'IA
 * plus tard (description/photos -> comparables et conditionIssues) sans
 * jamais toucher au moteur de calcul ni au Market Value Engine.
 *
 * Historique : avant cette étape, `marketValueLow/Estimated/High` étaient
 * saisis directement à la main. Ils sont désormais calculés par le Market
 * Value Engine à partir de `targetVehicleProfile` + `comparables` — voir
 * lib/analysis/analyze-listing.ts.
 */
export interface AnalysisSignals {
  /** Profil du véhicule cible pour le Market Value Engine (génération, finition, état, équipements...). */
  targetVehicleProfile: TargetVehicle;
  /** Pool de véhicules comparables dans lequel le Market Value Engine doit chercher. */
  comparables: ComparableVehicle[];
  /** Problèmes d'état structurés, utilisés pour distinguer valeur saine / actuelle / après réparation. */
  conditionIssues: VehicleConditionIssue[];

  resalePriceConservative: number;
  resalePriceRealistic: number;
  resalePriceOptimistic: number;

  transportCost: number;
  preparationCost: number;

  repairs: RepairSignal[];

  /** 0-100, où 100 = modèle qui se revend très facilement. */
  resaleEaseScore: number;

  accidentReported: boolean;
}
