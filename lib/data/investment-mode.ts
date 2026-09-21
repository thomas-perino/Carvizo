import type {
  InvestmentMode,
  Opportunity,
  Repair,
  RepairCategory,
  RepairIssueFilter,
} from "@/types";

/** Coût total estimé au-delà duquel l'annonce n'est plus de l'arbitrage « sain ». */
export const REPAIR_PROJECT_TOTAL_COST_THRESHOLD = 800;

/** Carrosserie suffisamment lourde pour basculer en projet, même sous le seuil total. */
export const REPAIR_PROJECT_BODYWORK_COST_THRESHOLD = 400;

const STRUCTURAL_CATEGORIES: RepairCategory[] = ["mecanique_majeure", "accident"];

const REPAIR_ISSUE_CATEGORIES: Record<RepairIssueFilter, RepairCategory[]> = {
  moteur: ["mecanique_majeure", "electrique"],
  carrosserie: ["carrosserie", "accident"],
  interieur: ["usure"],
};

function estimatedRepairCost(costLow: number, costHigh: number): number {
  return Math.round((costLow + costHigh) / 2);
}

/**
 * Classe une opportunité dans l'un des deux volets d'investissement.
 * Ne recalcule aucun score : lit uniquement réparations et fourchettes déjà produites.
 */
export function getOpportunityInvestmentMode(opportunity: Opportunity): InvestmentMode {
  const { repairs, analysis } = opportunity;
  const totalEstimated = estimatedRepairCost(analysis.repairCostLow, analysis.repairCostHigh);

  if (repairs.some((repair) => STRUCTURAL_CATEGORIES.includes(repair.category))) {
    return "reparations";
  }

  const bodyworkEstimated = repairs
    .filter((repair) => repair.category === "carrosserie")
    .reduce((sum, repair) => sum + estimatedRepairCost(repair.costLow, repair.costHigh), 0);

  if (bodyworkEstimated >= REPAIR_PROJECT_BODYWORK_COST_THRESHOLD) return "reparations";
  if (totalEstimated >= REPAIR_PROJECT_TOTAL_COST_THRESHOLD) return "reparations";

  return "arbitrage";
}

export function getRepairIssueTypes(repairs: Repair[]): RepairIssueFilter[] {
  const present = new Set<RepairIssueFilter>();

  for (const [issue, categories] of Object.entries(REPAIR_ISSUE_CATEGORIES) as Array<
    [RepairIssueFilter, RepairCategory[]]
  >) {
    if (repairs.some((repair) => categories.includes(repair.category))) {
      present.add(issue);
    }
  }

  return Array.from(present);
}

export function opportunityMatchesRepairIssues(
  repairs: Repair[],
  issues: RepairIssueFilter[]
): boolean {
  if (issues.length === 0) return true;
  const present = getRepairIssueTypes(repairs);
  return issues.some((issue) => present.includes(issue));
}

export function estimatedRepairCostFromAnalysis(repairCostLow: number, repairCostHigh: number): number {
  return estimatedRepairCost(repairCostLow, repairCostHigh);
}
