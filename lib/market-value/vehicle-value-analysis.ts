import { estimateMarketValue, type EstimateMarketValueOptions } from "./estimate-market-value";
import type {
  ComparableVehicle,
  ConfidenceLevel,
  MarketValueEstimate,
  TargetVehicle,
  VehicleConditionIssue,
  VehicleValueAnalysis,
} from "./types";

/**
 * Taux de "stigmate de marché" par catégorie de problème : la part de la
 * décote qui n'est PAS le coût de réparation lui-même, mais la méfiance
 * persistante d'un acheteur même après réparation (ex: un historique
 * d'accident reste un historique d'accident). Exprimé en % de la valeur
 * saine estimée.
 *
 * Volontairement limité à deux catégories : pour l'usure, l'électrique et
 * la carrosserie mineure, on considère que le coût de réparation (calculé
 * séparément par lib/calculations/repair-cost.ts) reflète déjà entièrement
 * l'écart de valeur — appliquer un stigmate en plus reviendrait à compter
 * deux fois la même perte (voir spec §16).
 */
const MARKET_STIGMA_RATE: Record<string, number> = {
  accident: 0.08,
  mecanique_majeure: 0.04,
};

function applyStigma(
  healthy: MarketValueEstimate,
  totalImpact: number,
  confidenceCap: ConfidenceLevel | null,
  reasons: string[]
): MarketValueEstimate {
  if (totalImpact === 0) {
    return healthy;
  }

  const shift = (value: number) => Math.round(value - totalImpact);

  return {
    ...healthy,
    low: shift(healthy.low),
    estimated: shift(healthy.estimated),
    high: shift(healthy.high),
    confidence: confidenceCap ?? healthy.confidence,
    confidenceReasons: [...healthy.confidenceReasons, ...reasons],
    methodology: [
      ...healthy.methodology,
      `Valeur saine ajustée de ${Math.round(totalImpact).toLocaleString("fr-FR")} € au titre de l'état actuel déclaré`,
    ],
  };
}

/**
 * Calcule l'impact "stigmate de marché" d'un problème d'état, en euros.
 *
 * - Si `estimatedMarketImpact` est déjà fourni (ex: par une future
 *   extraction IA), il est utilisé tel quel — le moteur ne l'invente jamais.
 * - Sinon, un taux par catégorie documenté ci-dessus est appliqué. Les
 *   catégories absentes de la table n'ont, par construction, aucun impact
 *   de marché séparé (le coût de réparation suffit à expliquer l'écart).
 */
function issueMarketImpact(issue: VehicleConditionIssue, healthyEstimate: number): number {
  if (issue.estimatedMarketImpact !== undefined) return issue.estimatedMarketImpact;

  const rate = MARKET_STIGMA_RATE[issue.category];
  if (!rate) return 0;

  const severityMultiplier = issue.severity === "high" ? 1 : issue.severity === "medium" ? 0.6 : 0.3;
  return Math.round(healthyEstimate * rate * severityMultiplier);
}

/**
 * Construit l'analyse complète de valeur d'un véhicule : valeur saine,
 * valeur actuelle (compte tenu de son état), et valeur après remise en
 * état.
 *
 * IMPORTANT (spec §16) : cette fonction ne calcule JAMAIS de coût de
 * réparation — c'est le rôle de `lib/calculations/repair-cost.ts`. Elle ne
 * calcule que l'écart de VALEUR PERÇUE (stigmate de marché), pour éviter
 * tout double comptage entre "ce que ça coûte à réparer" et "ce que ça
 * vaut avant réparation".
 *
 * `afterRepairValue` est, par construction, égal à `healthyValue` : une
 * fois les réparations effectuées, le véhicule est supposé revenir à un
 * état comparable aux comparables sains utilisés pour l'estimation.
 */
export function analyzeVehicleValue(
  target: TargetVehicle,
  availableVehicles: ComparableVehicle[],
  conditionIssues: VehicleConditionIssue[],
  options?: EstimateMarketValueOptions
): VehicleValueAnalysis {
  const healthyValue = estimateMarketValue(target, availableVehicles, options);

  const totalImpact = conditionIssues.reduce(
    (sum, issue) => sum + issueMarketImpact(issue, healthyValue.estimated),
    0
  );

  const lowConfidenceIssues = conditionIssues.some((issue) => issue.confidence < 0.5);
  const reasons = conditionIssues.length > 0
    ? [
        `${conditionIssues.length} point${conditionIssues.length > 1 ? "s" : ""} d'état déclaré${
          conditionIssues.length > 1 ? "s" : ""
        }`,
      ]
    : [];
  if (lowConfidenceIssues) reasons.push("Confiance limitée sur au moins un point d'état déclaré");

  const currentValue = applyStigma(
    healthyValue,
    totalImpact,
    lowConfidenceIssues ? "moyenne" : null,
    reasons
  );

  // La valeur après remise en état correspond à la valeur saine : les
  // réparations sont supposées ramener le véhicule à un état comparable
  // aux comparables utilisés pour l'estimation.
  const afterRepairValue: MarketValueEstimate = {
    ...healthyValue,
    methodology: [
      ...healthyValue.methodology,
      "Valeur après remise en état = valeur saine (les réparations ramènent le véhicule à un état comparable)",
    ],
  };

  return { healthyValue, currentValue, afterRepairValue, conditionIssues };
}
