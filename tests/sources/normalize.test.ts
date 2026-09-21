import { describe, expect, it } from "vitest";
import {
  normalizeRawListing,
  parseFuelType,
  parseMakeModelVersion,
  parseMileage,
  parsePrice,
  parseTransmission,
} from "@/lib/sources/normalize";
import type { RawListing } from "@/lib/sources/types";

describe("parsers", () => {
  it("parsePrice extrait un nombre depuis une chaîne formatée", () => {
    expect(parsePrice("8 990 €")).toBe(8990);
  });

  it("parseMileage extrait le kilométrage", () => {
    expect(parseMileage("89 000 km")).toBe(89000);
  });

  it("parseFuelType reconnaît les variantes courantes", () => {
    expect(parseFuelType("Essence")).toBe("essence");
    expect(parseFuelType("Diesel")).toBe("diesel");
    expect(parseFuelType("Hybride")).toBe("hybride");
    expect(parseFuelType("Électrique")).toBe("electrique");
  });

  it("parseTransmission distingue manuelle et automatique", () => {
    expect(parseTransmission("Manuelle")).toBe("manuelle");
    expect(parseTransmission("Automatique")).toBe("automatique");
  });

  it("parseMakeModelVersion sépare marque, modèle et version", () => {
    expect(parseMakeModelVersion("Peugeot 208 1.2 PureTech Allure")).toEqual({
      make: "Peugeot",
      model: "208",
      version: "1.2 PureTech Allure",
    });
  });
});

describe("normalizeRawListing", () => {
  const raw: RawListing = {
    source: "demo",
    externalId: "demo-001",
    url: "https://demo-source.carvizo.local/annonces/demo-001",
    title: "Peugeot 208 1.2 PureTech Allure",
    description: "Description de test",
    priceRaw: "8 500 €",
    mileageRaw: "68 000 km",
    yearRaw: "2019",
    fuelTypeRaw: "Essence",
    transmissionRaw: "Manuelle",
    horsepowerRaw: "100 ch",
    fiscalPowerRaw: "5 CV",
    sellerTypeRaw: "Particulier",
    location: "Toulouse, Occitanie",
    images: [],
    publishedAt: "2026-08-28T09:00:00.000Z",
    retrievedAt: "2026-08-28T10:15:00.000Z",
  };

  it("produit un Vehicle et un Listing correctement typés", () => {
    const normalized = normalizeRawListing(raw);

    expect(normalized.vehicle).toMatchObject({
      make: "Peugeot",
      model: "208",
      year: 2019,
      mileage: 68000,
      fuelType: "essence",
      transmission: "manuelle",
      horsepower: 100,
      fiscalPower: 5,
    });

    expect(normalized.listing).toMatchObject({
      source: "demo",
      externalId: "demo-001",
      price: 8500,
      sellerType: "particulier",
    });
  });
});
