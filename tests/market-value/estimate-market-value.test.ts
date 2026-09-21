import { describe, expect, it } from "vitest";
import {
  estimateMarketValue,
  NoComparablesFoundError,
} from "@/lib/market-value/estimate-market-value";
import type { ComparableVehicle, TargetVehicle } from "@/lib/market-value/types";

const target: TargetVehicle = {
  make: "Audi",
  model: "A1",
  generation: "A1 GB",
  trim: "S line",
  version: "1.0 TFSI 95",
  year: 2017,
  mileage: 92000,
  fuelType: "essence",
  transmission: "manuelle",
  horsepower: 95,
};

function comp(id: string, price: number, overrides: Partial<ComparableVehicle> = {}): ComparableVehicle {
  return {
    id,
    make: "Audi",
    model: "A1",
    generation: "A1 GB",
    trim: "S line",
    version: "1.0 TFSI 95",
    year: 2017,
    mileage: 90000,
    fuelType: "essence",
    transmission: "manuelle",
    horsepower: 95,
    price,
    ...overrides,
  };
}

describe("estimateMarketValue", () => {
  it("produit low <= estimated <= high", () => {
    const comparables = [comp("a", 11800), comp("b", 12000), comp("c", 12200), comp("d", 11900)];
    const estimate = estimateMarketValue(target, comparables);

    expect(estimate.low).toBeLessThanOrEqual(estimate.estimated);
    expect(estimate.estimated).toBeLessThanOrEqual(estimate.high);
  });

  it("exclut la valeur aberrante de l'exemple de la spec du calcul final", () => {
    const comparables = [
      comp("a", 10800),
      comp("b", 11000),
      comp("c", 11200),
      comp("d", 11100),
      comp("e", 17500),
    ];
    const estimate = estimateMarketValue(target, comparables);

    expect(estimate.estimated).toBeLessThan(13000);
    expect(estimate.usedComparableCount).toBe(4);
    expect(estimate.comparables.find((c) => c.comparable.id === "e")?.isOutlier).toBe(true);
  });

  it("lève NoComparablesFoundError si aucun comparable n'existe, même en élargissant à la marque", () => {
    expect(() => estimateMarketValue(target, [comp("wrong", 9000, { make: "Peugeot", model: "208" })])).toThrow(
      NoComparablesFoundError
    );
  });

  it("applique un ajustement de finition positif pour une finition mieux cotée", () => {
    const comparables = [comp("a", 12000), comp("b", 12100), comp("c", 11900), comp("d", 12050)];

    const sLine = estimateMarketValue(
      { ...target, make: "BMW", model: "Série 3", trim: "M Sport" },
      comparables.map((c) => ({ ...c, make: "BMW", model: "Série 3", trim: "M Sport" }))
    );
    const noTrimInfo = estimateMarketValue(
      { ...target, make: "BMW", model: "Série 3", trim: undefined },
      comparables.map((c) => ({ ...c, make: "BMW", model: "Série 3", trim: "M Sport" }))
    );

    const trimAdjustment = sLine.adjustments.find((a) => a.label === "Finition");
    expect(trimAdjustment?.amount).toBeGreaterThan(0);
    expect(noTrimInfo.adjustments.find((a) => a.label === "Finition")).toBeUndefined();
  });

  it("n'invente aucun ajustement de finition pour une finition inconnue de la table", () => {
    const comparables = [comp("a", 12000), comp("b", 12100), comp("c", 11900), comp("d", 12050)];
    const estimate = estimateMarketValue({ ...target, trim: "Finition Inconnue XYZ" }, comparables);

    expect(estimate.adjustments.find((a) => a.label === "Finition")).toBeUndefined();
    expect(estimate.confidenceReasons.some((r) => r.includes("finition"))).toBe(true);
  });

  it("réduit la fourchette quand les comparables sont homogènes, et l'élargit sinon", () => {
    const tight = estimateMarketValue(target, [
      comp("a", 11950),
      comp("b", 12000),
      comp("c", 12050),
      comp("d", 12000),
    ]);
    const loose = estimateMarketValue(target, [
      comp("a", 9500),
      comp("b", 12000),
      comp("c", 14500),
      comp("d", 11000),
    ]);

    const tightWidth = tight.high - tight.low;
    const looseWidth = loose.high - loose.low;
    expect(looseWidth).toBeGreaterThan(tightWidth);
  });
});
