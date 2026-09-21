import { describe, expect, it } from "vitest";
import { applyOpportunityFilters, listModelsForMake } from "@/lib/data/filters";
import { getOpportunityInvestmentMode } from "@/lib/data/investment-mode";
import type { Analysis, Listing, Opportunity, Repair, Vehicle } from "@/types";

const vehicle: Vehicle = {
  id: "vehicle-1",
  make: "Peugeot",
  model: "208",
  version: "Allure",
  year: 2019,
  mileage: 70000,
  fuelType: "essence",
  transmission: "manuelle",
  horsepower: 100,
  fiscalPower: 5,
  location: "Lyon",
  createdAt: "2026-01-01T00:00:00.000Z",
};

const listing: Listing = {
  id: "listing-1",
  vehicleId: "vehicle-1",
  source: "demo",
  sourceUrl: "https://example.test",
  externalId: "1",
  title: "Peugeot 208 Allure",
  description: "Annonce test",
  price: 8500,
  images: [],
  sellerType: "particulier",
  publishedAt: "2026-01-01T00:00:00.000Z",
  retrievedAt: "2026-01-01T00:00:00.000Z",
  createdAt: "2026-01-01T00:00:00.000Z",
};

const analysis: Analysis = {
  id: "analysis-1",
  listingId: "listing-1",
  marketValueLow: 9000,
  marketValueEstimated: 10000,
  marketValueHigh: 11000,
  resalePriceConservative: 9500,
  resalePriceRealistic: 10200,
  resalePriceOptimistic: 10800,
  registrationCost: 200,
  transportCost: 100,
  repairCostLow: 0,
  repairCostHigh: 0,
  preparationCost: 120,
  unexpectedCost: 200,
  totalInvestment: 9000,
  profitConservative: 500,
  profitRealistic: 1200,
  profitOptimistic: 1800,
  roi: 13,
  riskLevel: "faible",
  dealScore: 78,
  analysisSummary: { positives: [], negatives: [] },
  createdAt: "2026-01-01T00:00:00.000Z",
};

function repair(partial: Partial<Repair> & Pick<Repair, "category" | "costLow" | "costHigh">): Repair {
  return {
    id: "repair-1",
    analysisId: "analysis-1",
    name: "Réparation",
    description: "Test",
    difficulty: "facile",
    riskLevel: "faible",
    ...partial,
  };
}

function opportunity(overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    vehicle,
    listing,
    analysis,
    repairs: [],
    ...overrides,
  };
}

describe("getOpportunityInvestmentMode", () => {
  it("classe un véhicule sans réparation lourde en arbitrage immédiat", () => {
    const healthy = opportunity({
      repairs: [repair({ category: "carrosserie", costLow: 40, costHigh: 80 })],
      analysis: { ...analysis, repairCostLow: 40, repairCostHigh: 80 },
    });

    expect(getOpportunityInvestmentMode(healthy)).toBe("arbitrage");
  });

  it("classe une mécanique majeure en projet de réparation", () => {
    const engine = opportunity({
      repairs: [repair({ category: "mecanique_majeure", costLow: 900, costHigh: 1400 })],
      analysis: { ...analysis, repairCostLow: 900, repairCostHigh: 1400 },
    });

    expect(getOpportunityInvestmentMode(engine)).toBe("reparations");
  });

  it("classe une carrosserie lourde en projet de réparation", () => {
    const body = opportunity({
      repairs: [repair({ category: "carrosserie", costLow: 450, costHigh: 700 })],
      analysis: { ...analysis, repairCostLow: 450, repairCostHigh: 700 },
    });

    expect(getOpportunityInvestmentMode(body)).toBe("reparations");
  });
});

describe("applyOpportunityFilters", () => {
  const engine = opportunity({
    listing: { ...listing, id: "listing-engine" },
    repairs: [repair({ category: "mecanique_majeure", costLow: 900, costHigh: 1400 })],
    analysis: { ...analysis, listingId: "listing-engine", repairCostLow: 900, repairCostHigh: 1400 },
  });

  const wear = opportunity({
    listing: { ...listing, id: "listing-wear" },
    vehicle: { ...vehicle, make: "Renault", model: "Clio" },
    repairs: [repair({ category: "usure", costLow: 200, costHigh: 300 })],
    analysis: { ...analysis, listingId: "listing-wear", repairCostLow: 200, repairCostHigh: 300 },
  });

  const all = [engine, wear];

  it("filtre par mode d'investissement sans modifier les scores", () => {
    const arbitrage = applyOpportunityFilters(all, { mode: "arbitrage" });
    const projects = applyOpportunityFilters(all, { mode: "reparations" });

    expect(arbitrage.map((o) => o.listing.id)).toEqual(["listing-wear"]);
    expect(projects.map((o) => o.listing.id)).toEqual(["listing-engine"]);
    expect(engine.analysis.dealScore).toBe(78);
  });

  it("filtre par type de panne en mode réparation", () => {
    const filtered = applyOpportunityFilters(all, {
      mode: "reparations",
      repairIssues: ["moteur"],
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].listing.id).toBe("listing-engine");
  });

  it("filtre par modèle", () => {
    const filtered = applyOpportunityFilters(all, { make: "Renault", model: "Clio" });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].vehicle.model).toBe("Clio");
  });

  it("liste les modèles d'une marque", () => {
    expect(listModelsForMake(all, "Peugeot")).toEqual(["208"]);
    expect(listModelsForMake(all, "Renault")).toEqual(["Clio"]);
  });
});
