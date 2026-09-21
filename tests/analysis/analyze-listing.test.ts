import { describe, expect, it } from "vitest";
import { analyzeListing } from "@/lib/analysis/analyze-listing";
import type { AnalysisSignals } from "@/lib/analysis/types";
import type { ComparableVehicle, TargetVehicle } from "@/lib/market-value/types";
import type { Listing, Vehicle } from "@/types";

const baseVehicle: Vehicle = {
  id: "vehicle-test",
  make: "Peugeot",
  model: "208",
  version: "1.2 PureTech",
  year: 2019,
  mileage: 70_000,
  fuelType: "essence",
  transmission: "manuelle",
  horsepower: 100,
  fiscalPower: 5,
  location: "Île-de-France",
  createdAt: "2026-01-01T00:00:00.000Z",
};

const baseListing: Listing = {
  id: "listing-test",
  vehicleId: "vehicle-test",
  source: "demo",
  sourceUrl: "https://demo-source.carvizo.local/annonces/test",
  externalId: "test",
  title: "Peugeot 208 1.2 PureTech",
  description: "Annonce de test.",
  price: 8000,
  images: [],
  sellerType: "particulier",
  publishedAt: "2026-01-01T00:00:00.000Z",
  retrievedAt: "2026-01-01T00:00:00.000Z",
  createdAt: "2026-01-01T00:00:00.000Z",
};

const targetProfile: TargetVehicle = {
  make: "Peugeot",
  model: "208",
  version: "1.2 PureTech",
  year: 2019,
  mileage: 70_000,
  fuelType: "essence",
  transmission: "manuelle",
  horsepower: 100,
};

function makeComparable(id: string, price: number, mileage = 70_000): ComparableVehicle {
  return {
    id,
    make: "Peugeot",
    model: "208",
    version: "1.2 PureTech",
    year: 2019,
    mileage,
    fuelType: "essence",
    transmission: "manuelle",
    horsepower: 100,
    price,
  };
}

const richComparables: ComparableVehicle[] = [
  makeComparable("c1", 9400),
  makeComparable("c2", 9600),
  makeComparable("c3", 9500),
  makeComparable("c4", 9700),
  makeComparable("c5", 9450),
];

const baseSignals: AnalysisSignals = {
  targetVehicleProfile: targetProfile,
  comparables: richComparables,
  conditionIssues: [],
  resalePriceConservative: 9000,
  resalePriceRealistic: 9600,
  resalePriceOptimistic: 10000,
  transportCost: 100,
  preparationCost: 120,
  repairs: [],
  resaleEaseScore: 80,
  accidentReported: false,
};

describe("analyzeListing", () => {
  it("calcule un bénéfice positif et un Deal Score élevé pour une bonne affaire", () => {
    const { analysis } = analyzeListing(baseVehicle, baseListing, baseSignals);

    expect(analysis.profitRealistic).toBeGreaterThan(0);
    expect(analysis.riskLevel).toBe("faible");
    expect(analysis.dealScore).toBeGreaterThan(60);
  });

  it("calcule une marge négative quand le prix de revente est trop bas", () => {
    const { analysis } = analyzeListing(baseVehicle, baseListing, {
      ...baseSignals,
      resalePriceConservative: 6000,
      resalePriceRealistic: 6500,
      resalePriceOptimistic: 7000,
    });

    expect(analysis.profitRealistic).toBeLessThan(0);
    expect(analysis.roi).toBeLessThan(0);
  });

  it("intègre le coût des réparations dans l'investissement total", () => {
    const withoutRepairs = analyzeListing(baseVehicle, baseListing, baseSignals);
    const withRepairs = analyzeListing(baseVehicle, baseListing, {
      ...baseSignals,
      repairs: [
        {
          name: "Pneus",
          description: "Train de pneus avant à changer",
          costLow: 200,
          costHigh: 300,
          difficulty: "facile",
          riskLevel: "faible",
          category: "usure",
        },
      ],
    });

    expect(withRepairs.analysis.totalInvestment).toBeGreaterThan(
      withoutRepairs.analysis.totalInvestment
    );
    expect(withRepairs.analysis.repairCostLow).toBe(200);
    expect(withRepairs.analysis.repairCostHigh).toBe(300);
    expect(withRepairs.repairs).toHaveLength(1);
  });

  it("classe le véhicule en risque élevé en cas d'accident déclaré", () => {
    const { analysis } = analyzeListing(baseVehicle, baseListing, {
      ...baseSignals,
      accidentReported: true,
    });

    expect(analysis.riskLevel).toBe("eleve");
    expect(analysis.analysisSummary.negatives.length).toBeGreaterThan(0);
  });

  it("délègue la valeur de marché au Market Value Engine (currentValue)", () => {
    const { analysis, valueAnalysis } = analyzeListing(baseVehicle, baseListing, baseSignals);

    expect(analysis.marketValueEstimated).toBe(valueAnalysis.currentValue.estimated);
    expect(analysis.marketValueLow).toBe(valueAnalysis.currentValue.low);
    expect(analysis.marketValueHigh).toBe(valueAnalysis.currentValue.high);
  });

  it("distingue valeur actuelle et valeur après réparation en cas de problème d'accident", () => {
    const { valueAnalysis } = analyzeListing(baseVehicle, baseListing, {
      ...baseSignals,
      conditionIssues: [
        {
          category: "accident",
          severity: "high",
          repairCostLow: 600,
          repairCostHigh: 1200,
          confidence: 0.6,
        },
      ],
    });

    expect(valueAnalysis.currentValue.estimated).toBeLessThan(valueAnalysis.healthyValue.estimated);
    expect(valueAnalysis.afterRepairValue.estimated).toBe(valueAnalysis.healthyValue.estimated);
  });
});
