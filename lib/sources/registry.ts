import { DemoListingSource } from "./demo-source";
import type { ListingSource } from "./types";

/**
 * Registre central des sources d'annonces actives.
 *
 * Pour brancher une nouvelle source, implémenter `ListingSource` dans un
 * nouveau fichier (ex: lib/sources/leboncoin.ts) puis l'ajouter ici. Aucune
 * autre partie de l'application n'a besoin de changer : la normalisation et
 * le moteur d'analyse fonctionnent pour n'importe quelle source conforme.
 *
 * À ce stade du projet, seule la source "demo" est implémentée — voir
 * spec §4 et §14 (pas de scraping réel dans cette étape).
 */
export const LISTING_SOURCES: ListingSource[] = [new DemoListingSource()];
