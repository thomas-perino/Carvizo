import { describe, expect, it } from "vitest";
import { computeROI } from "@/lib/calculations/roi";

describe("computeROI", () => {
  it("calcule profit / investissement x 100, arrondi à une décimale", () => {
    expect(computeROI(1000, 8000)).toBe(12.5);
  });

  it("retourne un ROI négatif en cas de marge négative", () => {
    expect(computeROI(-500, 8000)).toBe(-6.2);
  });

  it("retourne 0 si l'investissement total est nul ou négatif", () => {
    expect(computeROI(500, 0)).toBe(0);
    expect(computeROI(500, -100)).toBe(0);
  });
});
