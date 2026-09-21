import { describe, expect, it } from "vitest";
import { findComparables, MIN_SIMILARITY_THRESHOLD } from "@/lib/market-value/comparable-search";
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
  condition: "bon",
};

function comp(overrides: Partial<ComparableVehicle>): ComparableVehicle {
  return {
    id: "c",
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
    price: 12000,
    condition: "bon",
    ...overrides,
  };
}

describe("findComparables", () => {
  it("retient un véhicule très similaire", () => {
    const veryClose = comp({ id: "very-close", mileage: 94000, price: 11800 });
    const { comparables } = findComparables(target, [veryClose]);
    expect(comparables[0].used).toBe(true);
    expect(comparables[0].similarity.score).toBeGreaterThan(85);
  });

  it("retient mais pénalise un véhicule moyennement similaire", () => {
    const moderatelyClose = comp({
      id: "moderate",
      trim: "Attraction",
      transmission: "automatique",
      year: 2014,
      mileage: 140000,
      price: 9000,
    });
    const { comparables } = findComparables(target, [moderatelyClose]);
    const [result] = comparables;
    expect(result.similarity.score).toBeLessThan(85);
    expect(result.similarity.score).toBeGreaterThan(30);
  });

  it("exclut (marque/modèle différent) un véhicule trop différent", () => {
    const wrongModel: ComparableVehicle = comp({
      id: "wrong-model",
      make: "Peugeot",
      model: "208",
    });
    const { comparables, widenedToMakeOnly } = findComparables(target, [wrongModel]);
    // Aucun comparable Audi A1 : recherche élargie à la marque, mais
    // Peugeot 208 n'est pas non plus une Audi -> résultat vide.
    expect(comparables).toHaveLength(0);
    expect(widenedToMakeOnly).toBe(true);
  });

  it("marque used=false un comparable sous le seuil de similarité minimal", () => {
    const veryDifferent = comp({
      id: "very-different",
      generation: "A1 8X",
      trim: "Attraction",
      version: "1.6 TDI 116",
      horsepower: 116,
      fuelType: "diesel",
      transmission: "automatique",
      year: 2011,
      mileage: 210000,
    });
    const { comparables } = findComparables(target, [veryDifferent]);
    expect(comparables[0].similarity.score).toBeLessThan(MIN_SIMILARITY_THRESHOLD);
    expect(comparables[0].used).toBe(false);
  });

  it("élargit à la marque si aucun comparable du même modèle n'existe", () => {
    const sameMakeOtherModel = comp({ id: "a3", model: "A3" });
    const { comparables, widenedToMakeOnly } = findComparables(target, [sameMakeOtherModel]);
    expect(widenedToMakeOnly).toBe(true);
    expect(comparables).toHaveLength(1);
  });
});
