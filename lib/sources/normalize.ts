import type { FuelType, SellerType, Transmission } from "@/types";
import type { NormalizedListing, RawListing } from "./types";

/**
 * Normalisation : transforme une annonce brute (chaînes de caractères,
 * format propre à la source) en objets Vehicle/Listing typés.
 *
 * C'est la seule couche qui a le droit de connaître le format texte
 * imprécis d'une source. Tout le reste de l'application ne manipule que
 * des types stricts.
 */

export function parsePrice(raw: string): number {
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

export function parseMileage(raw: string): number {
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

export function parseYear(raw: string): number {
  const match = raw.match(/\d{4}/);
  return match ? parseInt(match[0], 10) : 0;
}

export function parseFuelType(raw: string): FuelType {
  const normalized = raw.trim().toLowerCase();
  if (normalized.includes("électr") || normalized.includes("electr")) return "electrique";
  if (normalized.includes("hybrid")) return "hybride";
  if (normalized.includes("diesel")) return "diesel";
  return "essence";
}

export function parseTransmission(raw: string): Transmission {
  const normalized = raw.trim().toLowerCase();
  return normalized.includes("auto") ? "automatique" : "manuelle";
}

export function parseSellerType(raw: string): SellerType {
  const normalized = raw.trim().toLowerCase();
  return normalized.includes("pro") ? "professionnel" : "particulier";
}

export function parseNumericField(raw: string | undefined): number | null {
  if (!raw) return null;
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : null;
}

/**
 * Extrait marque / modèle / version à partir d'un titre d'annonce du type
 * "Peugeot 208 1.2 PureTech 100ch Allure". On suppose que le premier mot
 * est la marque, le second le modèle, et le reste la version — une
 * heuristique volontairement simple, à affiner (ou remplacer par une
 * table de correspondance / IA) lorsque de vraies sources seront branchées.
 */
export function parseMakeModelVersion(title: string): {
  make: string;
  model: string;
  version: string | null;
} {
  const parts = title.trim().split(/\s+/);
  const make = parts[0] ?? "Inconnu";
  const model = parts[1] ?? "Inconnu";
  const version = parts.slice(2).join(" ") || null;
  return { make, model, version };
}

export function normalizeRawListing(raw: RawListing): NormalizedListing {
  const { make, model, version } = parseMakeModelVersion(raw.title);

  return {
    vehicle: {
      make,
      model,
      version,
      year: parseYear(raw.yearRaw),
      mileage: parseMileage(raw.mileageRaw),
      fuelType: parseFuelType(raw.fuelTypeRaw),
      transmission: parseTransmission(raw.transmissionRaw),
      horsepower: parseNumericField(raw.horsepowerRaw),
      fiscalPower: parseNumericField(raw.fiscalPowerRaw),
      location: raw.location,
    },
    listing: {
      source: raw.source,
      sourceUrl: raw.url,
      externalId: raw.externalId,
      title: raw.title,
      description: raw.description,
      price: parsePrice(raw.priceRaw),
      images: raw.images,
      sellerType: parseSellerType(raw.sellerTypeRaw),
      publishedAt: raw.publishedAt,
      retrievedAt: raw.retrievedAt,
    },
  };
}
