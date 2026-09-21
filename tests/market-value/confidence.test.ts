import { describe, expect, it } from "vitest";
import { computeConfidence } from "@/lib/market-value/confidence";
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
    weight: 1 / 6,
    isOutlier: false,
    used: true,
  };
}

describe("computeConfidence", () => {
  it("retourne une confiance élevée avec de nombreux comparables très similaires et peu de dispersion", () => {
    const comparables = [
      weighted("a", 11000, 92),
      weighted("b", 11050, 90),
      weighted("c", 10950, 91),
      weighted("d", 11100, 89),
      weighted("e", 10900, 93),
      weighted("f", 11020, 90),
    ];
    const { level, reasons } = computeConfidence({ usedComparables: comparables });
    expect(level).toBe("elevee");
    expect(reasons.length).toBeGreaterThan(0);
  });

  it("retourne une confiance faible avec peu de comparables", () => {
    const comparables = [weighted("a", 11000, 90), weighted("b", 10800, 85)];
    const { level } = computeConfidence({ usedComparables: comparables });
    expect(level).toBe("faible");
  });

  it("retourne une confiance faible en cas de forte dispersion des prix", () => {
    const comparables = [
      weighted("a", 8000, 90),
      weighted("b", 10000, 88),
      weighted("c", 12500, 91),
      weighted("d", 15000, 89),
      weighted("e", 9000, 87),
      weighted("f", 14000, 90),
    ];
    const { level } = computeConfidence({ usedComparables: comparables });
    expect(level).toBe("faible");
  });

  it("dégrade la confiance quand des données sont manquantes", () => {
    const comparables = [
      weighted("a", 11000, 92),
      weighted("b", 11050, 90),
      weighted("c", 10950, 91),
      weighted("d", 11100, 89),
      weighted("e", 10900, 93),
      weighted("f", 11020, 90),
    ];
    const withoutMissing = computeConfidence({ usedComparables: comparables });
    const withMissing = computeConfidence({
      usedComparables: comparables,
      missingDataNotes: ["Finition du véhicule cible inconnue"],
    });
    expect(withMissing.level).not.toBe("elevee");
    expect(withoutMissing.level).toBe("elevee");
  });
});
