import { describe, expect, it } from "vitest";
import { computeRiskLevel } from "@/lib/calculations/risk";
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

const gearboxHighRisk: RepairSignal = {
  name: "Boîte de vitesses",
  description: "",
  costLow: 1800,
  costHigh: 3000,
  difficulty: "difficile",
  riskLevel: "eleve",
  category: "mecanique_majeure",
};

describe("computeRiskLevel", () => {
  it("retourne 'faible' pour un véhicule sans réparation ni accident", () => {
    expect(computeRiskLevel({ repairs: [], accidentReported: false, mileage: 50_000 })).toBe(
      "faible"
    );
  });

  it("retourne 'eleve' en cas d'accident déclaré", () => {
    expect(computeRiskLevel({ repairs: [], accidentReported: true, mileage: 50_000 })).toBe(
      "eleve"
    );
  });

  it("retourne 'eleve' pour un problème mécanique majeur à risque élevé", () => {
    expect(
      computeRiskLevel({ repairs: [gearboxHighRisk], accidentReported: false, mileage: 100_000 })
    ).toBe("eleve");
  });

  it("retourne 'faible' pour une simple réparation d'usure à faible kilométrage", () => {
    expect(
      computeRiskLevel({ repairs: [tires], accidentReported: false, mileage: 60_000 })
    ).toBe("faible");
  });

  it("retourne 'moyen' pour un kilométrage très élevé combiné à une réparation", () => {
    expect(
      computeRiskLevel({ repairs: [tires], accidentReported: false, mileage: 220_000 })
    ).toBe("moyen");
  });
});
