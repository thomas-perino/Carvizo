/**
 * Types de domaine partagés par toute l'application Carvizo.
 *
 * Ces types reflètent directement le schéma Supabase (voir supabase/schema.sql)
 * afin qu'une ligne de base de données puisse être mappée vers ces objets
 * sans transformation supplémentaire.
 */

import type { VehicleValueAnalysis } from "@/lib/market-value/types";

export type FuelType = "essence" | "diesel" | "hybride" | "electrique";

export type Transmission = "manuelle" | "automatique";

export type SellerType = "particulier" | "professionnel";

export type RiskLevel = "faible" | "moyen" | "eleve";

export type Difficulty = "facile" | "moyenne" | "difficile";

/** Catégorie d'un point de réparation, utile pour distinguer les petites
 * réparations rentables des problèmes mécaniques lourds (voir spec §1). */
export type RepairCategory =
  | "usure" // pneus, plaquettes, batterie...
  | "carrosserie"
  | "electrique"
  | "mecanique_majeure" // moteur, boîte de vitesses
  | "accident";

/** Stratégie d'investissement affichée sur /opportunites (classification dérivée). */
export type InvestmentMode = "arbitrage" | "reparations";

/**
 * Types de panne exposés dans les filtres UI (Mode 2).
 * Ce n'est pas une colonne métier : c'est un regroupement de RepairCategory.
 */
export type RepairIssueFilter = "moteur" | "carrosserie" | "interieur";

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  version: string | null;
  year: number;
  mileage: number;
  fuelType: FuelType;
  transmission: Transmission;
  horsepower: number | null;
  fiscalPower: number | null;
  location: string;
  createdAt: string;
}

export interface Listing {
  id: string;
  vehicleId: string;
  source: string;
  sourceUrl: string;
  externalId: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  sellerType: SellerType;
  publishedAt: string;
  retrievedAt: string;
  createdAt: string;
}

export interface Repair {
  id: string;
  analysisId: string;
  name: string;
  description: string;
  costLow: number;
  costHigh: number;
  difficulty: Difficulty;
  riskLevel: RiskLevel;
  category: RepairCategory;
}

export interface Analysis {
  id: string;
  listingId: string;

  marketValueLow: number;
  marketValueEstimated: number;
  marketValueHigh: number;

  resalePriceConservative: number;
  resalePriceRealistic: number;
  resalePriceOptimistic: number;

  registrationCost: number;
  transportCost: number;
  repairCostLow: number;
  repairCostHigh: number;
  preparationCost: number;
  unexpectedCost: number;

  /** Coût total d'acquisition hors prix de revente (voir lib/calculations/profit.ts). */
  totalInvestment: number;

  profitConservative: number;
  profitRealistic: number;
  profitOptimistic: number;

  /** ROI du scénario réaliste, exprimé en pourcentage. */
  roi: number;

  riskLevel: RiskLevel;
  dealScore: number;

  /** Résumé explicable du Deal Score (points positifs / négatifs). */
  analysisSummary: DealScoreExplanation;

  createdAt: string;
}

export interface DealScoreExplanation {
  positives: string[];
  negatives: string[];
}

/** Une "Opportunity" est l'agrégat véhicule + annonce + analyse + réparations
 * utilisé par la quasi-totalité de l'interface. Ce n'est pas une table en
 * base : c'est la vue assemblée par la couche lib/data. */
export interface Opportunity {
  vehicle: Vehicle;
  listing: Listing;
  analysis: Analysis;
  repairs: Repair[];
  /**
   * Détail complet de l'estimation de valeur (comparables, ajustements,
   * confiance, valeur saine/actuelle/après réparation), produit par le
   * Market Value Engine (lib/market-value/). Optionnel car pas encore
   * persisté en base : présent pour les opportunités de démonstration,
   * absent si l'opportunité vient de Supabase sans cette donnée (voir
   * lib/market-value/README.md, section "Limites actuelles").
   */
  valueAnalysis?: VehicleValueAnalysis;
}

export interface FavoriteUser {
  id: string;
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  listingId: string;
  createdAt: string;
}

/** Filtres disponibles sur la page /opportunites. Tous les champs sont
 * optionnels : un filtre absent n'est simplement pas appliqué. */
export interface OpportunityFilters {
  maxPrice?: number;
  minProfit?: number;
  minDealScore?: number;
  make?: string;
  model?: string;
  fuelType?: FuelType;
  transmission?: Transmission;
  minYear?: number;
  maxYear?: number;
  maxMileage?: number;
  riskLevel?: RiskLevel;
  location?: string;
  search?: string;
  mode?: InvestmentMode;
  repairIssues?: RepairIssueFilter[];
}

export type OpportunitySortKey =
  | "deal_score"
  | "profit"
  | "roi"
  | "price"
  | "market_discount";

export interface OpportunitySort {
  key: OpportunitySortKey;
  direction: "asc" | "desc";
}
