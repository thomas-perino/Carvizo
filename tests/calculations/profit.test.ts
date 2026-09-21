import { describe, expect, it } from "vitest";
import {
  computeProfit,
  computeProfitScenarios,
  computeTotalInvestment,
  computeUnexpectedCost,
} from "@/lib/calculations/profit";

describe("computeTotalInvestment", () => {
  it("additionne tous les postes de coût", () => {
    const total = computeTotalInvestment({
      purchasePrice: 8000,
      registrationCost: 200,
      transportCost: 100,
      repairCostEstimated: 300,
      preparationCost: 120,
      unexpectedCost: 240,
    });

    expect(total).toBe(8000 + 200 + 100 + 300 + 120 + 240);
  });
});

describe("computeProfit", () => {
  it("calcule un bénéfice positif quand le prix de revente dépasse l'investissement", () => {
    expect(computeProfit(10000, 8500)).toBe(1500);
  });

  it("calcule une marge négative quand l'investissement dépasse le prix de revente", () => {
    expect(computeProfit(8000, 9200)).toBe(-1200);
  });
});

describe("computeProfitScenarios", () => {
  it("calcule les trois scénarios à partir du même investissement total", () => {
    const scenarios = computeProfitScenarios(
      { conservative: 9000, realistic: 9500, optimistic: 10000 },
      8800
    );

    expect(scenarios).toEqual({
      conservative: 200,
      realistic: 700,
      optimistic: 1200,
    });
  });
});

describe("computeUnexpectedCost", () => {
  it("applique le taux par défaut de 3% du prix d'achat", () => {
    expect(computeUnexpectedCost(10000)).toBe(300);
  });
});
