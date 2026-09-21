import { DEMO_SEEDS } from "@/data/demo/seed";
import type { ListingSource, RawListing } from "./types";

/**
 * Source "demo" : la seule source réellement implémentée à ce stade.
 *
 * Elle ne fait aucun scraping ni appel réseau : elle reformate les données
 * de démonstration (data/demo/seed.ts) sous la forme `RawListing` que
 * fournirait n'importe quelle vraie source, afin que le pipeline complet
 * (RawListing -> normalisation -> Vehicle/Listing) soit exercé même sans
 * source externe branchée.
 *
 * Pour ajouter une vraie source plus tard (Le Bon Coin, La Centrale,
 * AutoScout24, un flux partenaire...), créer une classe qui implémente
 * `ListingSource` et l'ajouter à `lib/sources/registry.ts`. Voir
 * lib/sources/README.md.
 */
export class DemoListingSource implements ListingSource {
  name = "demo";

  async fetchListings(): Promise<RawListing[]> {
    return DEMO_SEEDS.map((seed) => ({
      source: "demo",
      externalId: seed.externalId,
      url: `https://demo-source.carvizo.local/annonces/${seed.externalId}`,
      title: `${seed.make} ${seed.model} ${seed.version}`,
      description: seed.description,
      priceRaw: `${seed.price} €`,
      mileageRaw: `${seed.mileage} km`,
      yearRaw: String(seed.year),
      fuelTypeRaw: seed.fuelTypeRaw,
      transmissionRaw: seed.transmissionRaw,
      horsepowerRaw: `${seed.horsepower} ch`,
      fiscalPowerRaw: `${seed.fiscalPower} CV`,
      sellerTypeRaw: seed.sellerTypeRaw,
      location: seed.location,
      images: seed.images,
      publishedAt: seed.publishedAt,
      retrievedAt: seed.retrievedAt,
    }));
  }
}
