import type { FuelType, SellerType, Transmission, Vehicle, Listing } from "@/types";

/**
 * Forme "brute" d'une annonce telle que renvoyée par une source externe,
 * avant tout nettoyage. Les champs *Raw sont volontairement des chaînes de
 * caractères : c'est exactement la forme dans laquelle une vraie source
 * (flux, API, export) livre ses données, avant normalisation.
 *
 * IMPORTANT : aucune implémentation de ce fichier ne doit contenir de
 * scraping réel. Voir lib/sources/README.md.
 */
export interface RawListing {
  source: string;
  externalId: string;
  url: string;
  title: string;
  description: string;
  priceRaw: string;
  mileageRaw: string;
  yearRaw: string;
  fuelTypeRaw: string;
  transmissionRaw: string;
  horsepowerRaw?: string;
  fiscalPowerRaw?: string;
  sellerTypeRaw: string;
  location: string;
  images: string[];
  publishedAt: string;
  retrievedAt: string;
}

/** Forme normalisée, typée et prête à être persistée (vehicles + listings). */
export interface NormalizedListing {
  vehicle: Omit<Vehicle, "id" | "createdAt">;
  listing: Omit<Listing, "id" | "vehicleId" | "createdAt">;
}

/**
 * Contrat que doit implémenter toute source d'annonces (Le Bon Coin,
 * La Centrale, AutoScout24, un flux partenaire, etc.).
 *
 * Ajouter une nouvelle source = créer une nouvelle classe qui implémente
 * cette interface et la déclarer dans lib/sources/registry.ts — le reste
 * de l'application (normalisation, analyse, UI) n'a pas besoin de changer.
 */
export interface ListingSource {
  name: string;
  fetchListings(): Promise<RawListing[]>;
}

export interface FuelTypeParseResult {
  fuelType: FuelType;
}

export type { FuelType, SellerType, Transmission };
