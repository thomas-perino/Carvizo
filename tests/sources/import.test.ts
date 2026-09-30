import { describe, expect, it } from "vitest";
import { mergeImports, normalizeImport, parseListingImport, type ImportListing } from "@/lib/import/listings";
import { JsonFeedSource } from "@/lib/sources/json-feed";
import { computeTotalInvestment, computeProfit } from "@/lib/calculations/profit";

const listing: ImportListing = {
  source: "partner", externalId: "42", url: "https://example.com/42", make: "Land Rover", model: "Range Rover Sport",
  year: 2018, mileage: 90000, price: 6000.50, fuelType: "diesel", transmission: "automatique", sellerType: "professionnel",
  location: "Marseille", publishedAt: "2026-09-30T12:00:00Z",
};

describe("import d’annonces autorisées", () => {
  it("préserve la marque, le modèle composé et les centimes dans le pipeline", () => {
    const normalized = normalizeImport(listing);
    expect(normalized.vehicle.make).toBe("Land Rover");
    expect(normalized.vehicle.model).toBe("Range Rover Sport");
    expect(normalized.listing.price).toBe(6000.50);
    expect(normalized.vehicle.fiscalPower).toBeNull();
  });
  it("isole une ligne invalide sans inventer de prix ou de carburant", () => {
    const report = parseListingImport(JSON.stringify([listing, { ...listing, price: "6000" }, { ...listing, fuelType: "inconnu" }]));
    expect(report.listings).toHaveLength(1);
    expect(report.errors.map(v => v.row)).toEqual([2, 3]);
  });
  it("refuse les liens exécutables", () => {
    expect(parseListingImport(JSON.stringify([{ ...listing, url: "javascript:alert(1)" }])).errors).toHaveLength(1);
  });
  it("fusionne les mêmes identifiants sans confondre deux sources", () => {
    const report = parseListingImport(JSON.stringify([listing, { ...listing, price: 5500 }, { ...listing, source: "other" }]));
    expect(report.duplicates).toBe(1);
    expect(report.listings).toHaveLength(2);
    expect(report.listings[0].price).toBe(5500);
    expect(mergeImports([listing], report.listings)).toHaveLength(2);
  });
  it("rejette le mauvais conteneur et les imports trop longs", () => {
    expect(() => parseListingImport('{"results":[]}')).toThrow("Tableau");
    expect(() => parseListingImport(JSON.stringify(Array(1001).fill(listing)))).toThrow("1 000");
  });
  it("inclut stockage et imprévus dans la marge et conserve les anciens appels", () => {
    const costs = { purchasePrice: 6000, registrationCost: 300, transportCost: 150, repairCostEstimated: 200, preparationCost: 50, unexpectedCost: 200 };
    expect(computeTotalInvestment(costs)).toBe(6900);
    expect(computeProfit(8000, computeTotalInvestment({ ...costs, storageCost: 100 }))).toBe(1000);
    expect(computeProfit(6500, computeTotalInvestment({ ...costs, storageCost: 100 }))).toBe(-500);
  });
  it("lit un flux JSON et conserve la provenance sans importer son score financier", async () => {
    const fetcher = (async () => new Response(JSON.stringify({ listings: [{ ...listing, dealScore: 100 }] }), { headers: { "Content-Type": "application/json" } })) as typeof fetch;
    const raw = await new JsonFeedSource("https://example.com/feed", undefined, fetcher).fetchListings();
    expect(raw[0].source).toBe("partner");
    expect(raw[0]).not.toHaveProperty("dealScore");
  });
  it("échoue explicitement sur un flux invalide ou une page HTML", async () => {
    const invalid = (async () => new Response(JSON.stringify([{ ...listing, price: -1 }]), { headers: { "Content-Type": "application/json" } })) as typeof fetch;
    await expect(new JsonFeedSource("https://example.com/feed", undefined, invalid).fetchListings()).rejects.toThrow("Flux rejeté");
    const html = (async () => new Response("<html></html>", { headers: { "Content-Type": "text/html" } })) as typeof fetch;
    await expect(new JsonFeedSource("https://example.com/feed", undefined, html).fetchListings()).rejects.toThrow("pas une page HTML");
  });
});
