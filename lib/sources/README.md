# Ajouter une nouvelle source d'annonces

Cette étape du projet ne contient volontairement **aucun scraping réel** et
ne contourne aucune protection anti-bot ni condition d'utilisation. Le but
de ce dossier est de préparer l'architecture pour de futures sources
autorisées (API officielle, flux partenaire, export, etc.).

## Étapes

1. Créer un fichier `lib/sources/<nom-source>.ts`.
2. Implémenter l'interface `ListingSource` :

   ```ts
   import type { ListingSource, RawListing } from "./types";

   export class LeboncoinSource implements ListingSource {
     name = "leboncoin";

     async fetchListings(): Promise<RawListing[]> {
       // Appeler une API/un flux autorisé et retourner des RawListing.
       // Ne jamais scraper le HTML ni contourner une protection technique.
     }
   }
   ```

3. Ajouter une instance dans `lib/sources/registry.ts` (`LISTING_SOURCES`).
4. Les `RawListing` renvoyés passent automatiquement par
   `lib/sources/normalize.ts`, qui les convertit en `Vehicle` / `Listing`
   typés. Si le format de la nouvelle source diffère (ex: prix déjà
   numérique), adapter les fonctions de `normalize.ts` ou en ajouter de
   nouvelles — ne dupliquez pas la logique de parsing dans l'adapter lui-même.
5. Les signaux d'analyse (valeur de marché, réparations détectées...) ne
   viennent pas de la source : ils seront produits par un futur module
   dédié (comparables de marché, extraction IA) qui appellera ensuite
   `lib/analysis/analyze-listing.ts`. Un adapter de source ne doit jamais
   calculer de Deal Score ou de profit lui-même.

## Ce qu'une source ne doit jamais faire

- Contourner un système anti-bot ou une mesure technique de protection.
- Ignorer les conditions d'utilisation du site source.
- Calculer directement des données financières (profit, ROI, Deal Score).
