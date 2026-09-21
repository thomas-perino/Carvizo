import { describe, expect, it } from "vitest";
import { analyzeVehicleValue } from "@/lib/market-value/vehicle-value-analysis";
import type { ComparableVehicle, TargetVehicle } from "@/lib/market-value/types";

const target: TargetVehicle = {
  make: "Audi",
  model: "A1",
  year: 2017,
  mileage: 92000,
  fuelType: "essence",
  transmission: "manuelle",
  horsepower: 95,
};

function comp(id: string, price: number): ComparableVehicle {
  return {
    id,
    make: "Audi",
    model: "A1",
    year: 2017,
    mileage: 90000,
    fuelType: "essence",
    transmission: "manuelle",
    horsepower: 95,
    price,
  };
}

const comparables = [comp("a", 12000), comp("b", 12100), comp("c", 11900), comp("d", 12050)];

describe("analyzeVehicleValue", () => {
  it("sans problème d'état, la valeur actuelle égale la valeur saine", () => {
    const { healthyValue, currentValue } = analyzeVehicleValue(target, comparables, []);
    expect(currentValue.estimated).toBe(healthyValue.estimated);
  });

  it("un problème d'accident réduit la valeur actuelle sans changer la valeur saine", () => {
    const { healthyValue, currentValue } = analyzeVehicleValue(target, comparables, [
      {
        category: "accident",
        severity: "high",
        repairCostLow: 600,
        repairCostHigh: 1200,
        confidence: 0.6,
      },
    ]);

    expect(currentValue.estimated).toBeLessThan(healthyValue.estimated);
  });

  it("la valeur après réparation revient à la valeur saine", () => {
    const { healthyValue, afterRepairValue } = analyzeVehicleValue(target, comparables, [
      {
        category: "accident",
        severity: "high",
        repairCostLow: 600,
        repairCostHigh: 1200,
        confidence: 0.6,
      },
    ]);

    expect(afterRepairValue.estimated).toBe(healthyValue.estimated);
  });

  it("n'applique aucun stigmate de marché pour une simple usure (évite le double comptage)", () => {
    const { healthyValue, currentValue } = analyzeVehicleValue(target, comparables, [
      {
        category: "usure",
        severity: "low",
        repairCostLow: 200,
        repairCostHigh: 300,
        confidence: 0.9,
      },
    ]);

    // Le coût de réparation est géré ailleurs (lib/calculations/repair-cost.ts) :
    // une simple usure ne doit pas, en plus, faire baisser la valeur de marché.
    expect(currentValue.estimated).toBe(healthyValue.estimated);
  });

  it("respecte un estimatedMarketImpact fourni explicitement plutôt que le taux par défaut", () => {
    const { healthyValue, currentValue } = analyzeVehicleValue(target, comparables, [
      {
        category: "accident",
        severity: "high",
        estimatedMarketImpact: 1000,
        confidence: 0.9,
      },
    ]);

    expect(healthyValue.estimated - currentValue.estimated).toBe(1000);
  });
});
