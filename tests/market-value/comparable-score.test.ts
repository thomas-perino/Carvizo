import { describe, expect, it } from "vitest";
import { computeSimilarity } from "@/lib/market-value/comparable-score";
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

const identicalComparable: ComparableVehicle = {
  id: "identical",
  make: "Audi",
  model: "A1",
  generation: "A1 GB",
  trim: "S line",
  version: "1.0 TFSI 95",
  year: 2017,
  mileage: 91000,
  fuelType: "essence",
  transmission: "manuelle",
  horsepower: 95,
  price: 12000,
};

describe("computeSimilarity", () => {
  it("attribue un score très élevé à un comparable quasi identique", () => {
    const { score } = computeSimilarity(target, identicalComparable);
    expect(score).toBeGreaterThan(90);
  });

  it("pénalise une motorisation différente", () => {
    const { score: baseline } = computeSimilarity(target, identicalComparable);
    const { score } = computeSimilarity(target, {
      ...identicalComparable,
      id: "diff-engine",
      horsepower: 150,
      version: "2.0 TFSI 150",
    });
    expect(score).toBeLessThan(baseline);
  });

  it("pénalise un écart d'année important", () => {
    const { score: baseline } = computeSimilarity(target, identicalComparable);
    const { score } = computeSimilarity(target, { ...identicalComparable, id: "old", year: 2011 });
    expect(score).toBeLessThan(baseline);
  });

  it("pénalise un écart de kilométrage important", () => {
    const { score: baseline } = computeSimilarity(target, identicalComparable);
    const { score } = computeSimilarity(target, {
      ...identicalComparable,
      id: "high-mileage",
      mileage: 230000,
    });
    expect(score).toBeLessThan(baseline);
  });

  it("pénalise une finition différente", () => {
    const { score: baseline } = computeSimilarity(target, identicalComparable);
    const { score } = computeSimilarity(target, {
      ...identicalComparable,
      id: "diff-trim",
      trim: "Attraction",
    });
    expect(score).toBeLessThan(baseline);
  });

  it("attribue un score partiel documenté quand une donnée est inconnue, jamais 0 sec", () => {
    const { score, breakdown } = computeSimilarity(
      { ...target, horsepower: undefined, trim: undefined },
      { ...identicalComparable, horsepower: undefined, trim: undefined }
    );
    const motorisation = breakdown.find((b) => b.criterion === "Motorisation");
    expect(motorisation).toBeDefined();
    expect(score).toBeGreaterThan(0);
  });

  it("reste toujours compris entre 0 et 100", () => {
    const { score } = computeSimilarity(target, {
      ...identicalComparable,
      id: "worst-case",
      year: 1990,
      mileage: 400000,
      fuelType: "diesel",
      transmission: "automatique",
      horsepower: 300,
      trim: "Base",
      condition: "mauvais",
    });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
