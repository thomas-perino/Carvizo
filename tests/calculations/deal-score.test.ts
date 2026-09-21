import { describe, expect, it } from "vitest";
import { computeDealScore, profitToScore } from "@/lib/calculations/deal-score";

describe("profitToScore", () => {
  it("plafonne à 100 au-delà du seuil de bénéfice", () => {
    expect(profitToScore(10_000)).toBe(100);
  });

  it("retourne 0 pour un bénéfice nul ou négatif", () => {
    expect(profitToScore(0)).toBe(0);
    expect(profitToScore(-500)).toBe(0);
  });
});

describe("computeDealScore", () => {
  it("donne un score élevé pour une excellente affaire", () => {
    const { score } = computeDealScore({
      profitRealistic: 3000,
      marketDifferencePercent: -18,
      riskLevel: "faible",
      resaleEaseScore: 85,
      conditionScore: 95,
    });

    expect(score).toBeGreaterThanOrEqual(80);
  });

  it("donne un score faible pour une affaire risquée et peu rentable", () => {
    const { score } = computeDealScore({
      profitRealistic: 100,
      marketDifferencePercent: 5,
      riskLevel: "eleve",
      resaleEaseScore: 40,
      conditionScore: 30,
    });

    expect(score).toBeLessThan(40);
  });

  it("reste toujours compris entre 0 et 100", () => {
    const { score } = computeDealScore({
      profitRealistic: -5000,
      marketDifferencePercent: 50,
      riskLevel: "eleve",
      resaleEaseScore: 0,
      conditionScore: 0,
    });

    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
