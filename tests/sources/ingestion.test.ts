import { describe, expect, it } from "vitest";
import { ingestListings } from "@/lib/sources/ingestion";
import type { ListingSource, RawListing } from "@/lib/sources/types";

class MockSource implements ListingSource {
  name = "mock";
  async fetchListings(): Promise<RawListing[]> {
    return [
      {
        source: "mock",
        externalId: "ext-1",
        url: "https://example.com/1",
        title: "Renault Clio 1.2 75ch",
        description: "Bon état général, petite rayure carrosserie",
        priceRaw: "4 500 €",
        mileageRaw: "85 000 km",
        yearRaw: "2017",
        fuelTypeRaw: "essence",
        transmissionRaw: "manuelle",
        sellerTypeRaw: "particulier",
        location: "Paris (75)",
        images: ["https://example.com/img1.jpg"],
        publishedAt: "2025-01-01T10:00:00Z",
        retrievedAt: "2025-01-01T12:00:00Z",
      },
      // Doublon intentionnel
      {
        source: "mock",
        externalId: "ext-1",
        url: "https://example.com/1",
        title: "Renault Clio 1.2 75ch",
        description: "Bon état général, petite rayure carrosserie",
        priceRaw: "4 500 €",
        mileageRaw: "85 000 km",
        yearRaw: "2017",
        fuelTypeRaw: "essence",
        transmissionRaw: "manuelle",
        sellerTypeRaw: "particulier",
        location: "Paris (75)",
        images: ["https://example.com/img1.jpg"],
        publishedAt: "2025-01-01T10:00:00Z",
        retrievedAt: "2025-01-01T12:00:00Z",
      },
    ];
  }
}

describe("ingestListings", () => {
  it("ingests raw listings and eliminates duplicates in memory", async () => {
    const mock = new MockSource();
    const res = await ingestListings([mock]);

    expect(res.fetchedCount).toBe(2);
    expect(res.duplicateCount).toBe(1);
    expect(res.opportunities.length).toBe(1);

    const opp = res.opportunities[0];
    expect(opp.vehicle.make).toBe("Renault");
    expect(opp.vehicle.model).toBe("Clio");
    expect(opp.listing.price).toBe(4500);
    expect(opp.vehicle.mileage).toBe(85000);
    expect(opp.analysis.dealScore).toBeGreaterThanOrEqual(0);
  });
});
