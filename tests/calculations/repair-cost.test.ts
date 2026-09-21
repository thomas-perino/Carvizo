import { describe, expect, it } from "vitest";
import { computeConditionScore, summarizeRepairCosts } from "@/lib/calculations/repair-cost";
import type { RepairSignal } from "@/lib/calculations/repair-cost";

const tires: RepairSignal = {
  name: "Pneus",
  description: "",
  costLow: 200,
  costHigh: 300,
  difficulty: "facile",
  riskLevel: "faible",
  category: "usure",
};

const gearbox: RepairSignal = {
  name: "Boîte de vitesses",
  description: "",
  costLow: 1800,
  costHigh: 3000,
  difficulty: "difficile",
  riskLevel: "eleve",
  category: "mecanique_majeure",
};

describe("summarizeRepairCosts", () => {
  it("retourne des totaux nuls sans réparation", () => {
    expect(summarizeRepairCosts([])).toEqual({ costLow: 0, costHigh: 0, costEstimated: 0 });
  });

  it("additionne les coûts bas/haut et calcule le point médian", () => {
    const summary = summarizeRepairCosts([tires]);
    expect(summary).toEqual({ costLow: 200, costHigh: 300, costEstimated: 250 });
  });
});

describe("computeConditionScore", () => {
  it("retourne 100 sans aucune réparation", () => {
    expect(computeConditionScore([])).toBe(100);
  });

  it("pénalise fortement un coût de réparation élevé et à risque", () => {
    const score = computeConditionScore([gearbox]);
    expect(score).toBeLessThan(50);
  });

  it("pénalise légèrement une petite réparation d'usure", () => {
    const score = computeConditionScore([tires]);
    expect(score).toBeGreaterThan(80);
  });
});
