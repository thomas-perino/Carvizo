import type { FuelType, SellerType, Transmission } from "@/types";
import type { NormalizedListing, RawListing } from "@/lib/sources/types";
import { normalizeRawListing } from "@/lib/sources/normalize";

export const MAX_IMPORT_BYTES = 2 * 1024 * 1024;
export const MAX_IMPORT_LISTINGS = 1000;

export interface ImportListing {
  source: string;
  externalId: string;
  url: string;
  make: string;
  model: string;
  version?: string | null;
  year: number;
  mileage: number;
  price: number;
  fuelType: FuelType;
  transmission: Transmission;
  sellerType: SellerType;
  location: string;
  publishedAt: string;
  description?: string;
  fiscalPower?: number | null;
  horsepower?: number | null;
  images?: string[];
}

export interface ImportReport {
  listings: ImportListing[];
  errors: { row: number; message: string }[];
  duplicates: number;
  received: number;
}

function text(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string" || !value.trim() || value.length > 10000)
    throw new Error(`${key} : texte obligatoire (10 000 caractères maximum).`);
  return value.trim();
}

function amount(record: Record<string, unknown>, key: string, min: number, max: number, integer = false): number {
  const value = record[key];
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value)))
    throw new Error(`${key} : nombre ${integer ? "entier " : ""}entre ${min} et ${max} attendu.`);
  return value;
}

function choice<T extends string>(record: Record<string, unknown>, key: string, values: readonly T[]): T {
  const value = record[key];
  if (typeof value !== "string" || !values.includes(value as T))
    throw new Error(`${key} : choisir ${values.join(", ")}.`);
  return value as T;
}

function webUrl(value: string): string {
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password)
    throw new Error("URL HTTP(S) sans identifiants attendue.");
  return url.href;
}

export function validateImportListing(value: unknown): ImportListing {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Objet annonce attendu.");
  const r = value as Record<string, unknown>;
  const publishedAt = text(r, "publishedAt");
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(publishedAt) || !Number.isFinite(Date.parse(publishedAt)))
    throw new Error("publishedAt : date ISO avec fuseau horaire attendue.");
  const listing: ImportListing = {
    source: text(r, "source"), externalId: text(r, "externalId"), url: webUrl(text(r, "url")),
    make: text(r, "make"), model: text(r, "model"),
    year: amount(r, "year", 1900, new Date().getFullYear() + 1, true),
    mileage: amount(r, "mileage", 0, 2000000, true), price: amount(r, "price", 0.01, 10000000),
    fuelType: choice(r, "fuelType", ["essence", "diesel", "hybride", "electrique"]),
    transmission: choice(r, "transmission", ["manuelle", "automatique"]),
    sellerType: choice(r, "sellerType", ["particulier", "professionnel"]),
    location: text(r, "location"), publishedAt: new Date(publishedAt).toISOString(),
  };
  for (const key of ["description", "version"] as const) {
    if (r[key] !== undefined && r[key] !== null) {
      if (typeof r[key] !== "string" || r[key].length > 10000) throw new Error(`${key} : texte trop long ou invalide.`);
      listing[key] = r[key];
    }
  }
  if (r.version === null) listing.version = null;
  for (const key of ["fiscalPower", "horsepower"] as const) {
    if (r[key] !== undefined && r[key] !== null) listing[key] = amount(r, key, 1, 3000, true);
  }
  if (r.images !== undefined) {
    if (!Array.isArray(r.images) || r.images.length > 30 || !r.images.every(v => typeof v === "string"))
      throw new Error("images : au maximum 30 URL attendues.");
    listing.images = r.images.map(v => webUrl(v as string));
  }
  return listing;
}

export function listingKey(listing: Pick<ImportListing, "source" | "externalId">): string {
  return JSON.stringify([listing.source.toLowerCase(), listing.externalId]);
}

/** Last row wins within a supplied snapshot; no guessed cross-site matching. */
export function parseListingImport(input: string): ImportReport {
  if (new TextEncoder().encode(input).byteLength > MAX_IMPORT_BYTES) throw new Error("Fichier trop volumineux : maximum 2 Mo.");
  let decoded: unknown;
  try { decoded = JSON.parse(input); } catch { throw new Error("JSON invalide. Utilisez le fichier exemple pour vérifier le format."); }
  const rows = Array.isArray(decoded) ? decoded : (decoded && typeof decoded === "object" ? (decoded as Record<string, unknown>).listings : undefined);
  if (!Array.isArray(rows)) throw new Error('Tableau ou objet { "listings": [...] } attendu.');
  if (rows.length > MAX_IMPORT_LISTINGS) throw new Error("Maximum 1 000 annonces par import.");
  const errors: ImportReport["errors"] = [];
  const unique = new Map<string, ImportListing>();
  let duplicates = 0;
  rows.forEach((row, i) => {
    try {
      const listing = validateImportListing(row);
      const key = listingKey(listing);
      if (unique.has(key)) duplicates++;
      unique.set(key, listing);
    } catch (error) { errors.push({ row: i + 1, message: error instanceof Error ? error.message : "Annonce invalide." }); }
  });
  return { listings: [...unique.values()], errors, duplicates, received: rows.length };
}

export function mergeImports(existing: ImportListing[], incoming: ImportListing[]): ImportListing[] {
  const unique = new Map(existing.map(v => [listingKey(v), v]));
  incoming.forEach(v => unique.set(listingKey(v), v));
  if (unique.size > MAX_IMPORT_LISTINGS) throw new Error("La collection dépasserait 1 000 annonces. Exportez puis videz-la avant un nouvel import.");
  return [...unique.values()];
}

export function toRawListing(listing: ImportListing, retrievedAt = new Date().toISOString()): RawListing {
  return {
    source: listing.source, externalId: listing.externalId, url: listing.url,
    title: [listing.make, listing.model, listing.version].filter(Boolean).join(" "),
    make: listing.make, model: listing.model, version: listing.version ?? null, price: listing.price,
    description: listing.description ?? "", priceRaw: String(listing.price), mileageRaw: String(listing.mileage), yearRaw: String(listing.year),
    fuelTypeRaw: listing.fuelType, transmissionRaw: listing.transmission, sellerTypeRaw: listing.sellerType,
    fiscalPowerRaw: listing.fiscalPower ? String(listing.fiscalPower) : undefined,
    horsepowerRaw: listing.horsepower ? String(listing.horsepower) : undefined,
    location: listing.location, images: listing.images ?? [], publishedAt: listing.publishedAt, retrievedAt,
  };
}

export function normalizeImport(listing: ImportListing, retrievedAt?: string): NormalizedListing {
  return normalizeRawListing(toRawListing(listing, retrievedAt));
}
