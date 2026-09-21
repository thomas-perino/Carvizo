import { describe, expect, it } from "vitest";
import { computeWeights, detectOutliers } from "@/lib/market-value/comparable-weight";
import type { ComparableVehicle, SimilarityResult, WeightedComparable } from "@/lib/market-value/types";

function fakeComparable(id: string, price: number): ComparableVehicle {
  return {
    id,
    make: "Audi",
    model: "A1",
    year: 2017,
    mileage: 90000,
    fuelType: "essence",
    transmission: "manuelle",
    price,
  };
}

function weighted(id: string, price: number, score: number): WeightedComparable {
  const similarity: SimilarityResult = { score, breakdown: [] };
  return {
    comparable: fakeComparable(id, price),
    similarity,
    weight: 0,
    isOutlier: false,
    used: true,
  };
}

describe("detectOutliers", () => {
  it("détecte la valeur aberrante de l'exemple de la spec (10800/11000/11200/11100/17500)", () => {
    const comparables = [
      weighted("a", 10800, 80),
      weighted("b", 11000, 80),
      weighted("c", 11200, 80),
      weighted("d", 11100, 80),
      weighted("e", 17500, 80),
    ];

    const result = detectOutliers(comparables);
    const outlier = result.find((c) => c.comparable.id === "e");
    const normal = result.filter((c) => c.comparable.id !== "e");

    expect(outlier?.isOutlier).toBe(true);
    expect(outlier?.used).toBe(false);
    expect(normal.every((c) => !c.isOutlier)).toBe(true);
  });

  it("ne détecte rien avec moins de 4 comparables utilisables", () => {
    const comparables = [weighted("a", 10000, 80), weighted("b", 20000, 80), weighted("c", 9000, 80)];
    const result = detectOutliers(comparables);
    expect(result.every((c) => !c.isOutlier)).toBe(true);
  });

  it("ne détecte rien quand tous les prix sont identiques", () => {
    const comparables = [
      weighted("a", 10000, 80),
      weighted("b", 10000, 80),
      weighted("c", 10000, 80),
      weighted("d", 10000, 80),
    ];
    const result = detectOutliers(comparables);
    expect(result.every((c) => !c.isOutlier)).toBe(true);
  });
});

describe("computeWeights", () => {
  it("donne un poids nettement supérieur à un comparable très similaire", () => {
    const comparables = [weighted("high", 11000, 96), weighted("low", 11000, 55)];
    const [high, low] = computeWeights(comparables);

    expect(high.weight).toBeGreaterThan(low.weight);
    // Pondération au carré : 96² / 55² ≈ 3.05, largement plus que le ratio linéaire (~1.75).
    expect(high.weight / low.weight).toBeGreaterThan(2.5);
  });

  it("normalise les poids pour qu'ils somment à 1", () => {
    const comparables = [weighted("a", 11000, 90), weighted("b", 10500, 70), weighted("c", 11200, 60)];
    const weightedComparables = computeWeights(comparables);
    const total = weightedComparables.reduce((sum, c) => sum + c.weight, 0);
    expect(total).toBeCloseTo(1, 5);
  });

  it("exclut du poids les comparables non utilisés ou aberrants", () => {
    const notUsed: WeightedComparable = { ...weighted("excluded", 9000, 20), used: false };
    const outlier: WeightedComparable = { ...weighted("outlier", 30000, 90), isOutlier: true };
    const normal = weighted("normal", 11000, 85);

    const result = computeWeights([notUsed, outlier, normal]);
    expect(result.find((c) => c.comparable.id === "excluded")?.weight).toBe(0);
    expect(result.find((c) => c.comparable.id === "outlier")?.weight).toBe(0);
    expect(result.find((c) => c.comparable.id === "normal")?.weight).toBe(1);
  });
});
