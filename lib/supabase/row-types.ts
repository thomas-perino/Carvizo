/**
 * Types "ligne de base de données" (snake_case), qui reflètent exactement
 * supabase/schema.sql. Séparés des types de domaine (types/index.ts, en
 * camelCase) pour que la forme de la base de données puisse évoluer sans
 * casser le reste de l'application — toute la conversion passe par
 * lib/supabase/mappers.ts.
 */

export interface VehicleRow {
  id: string;
  make: string;
  model: string;
  version: string | null;
  year: number;
  mileage: number;
  fuel_type: string;
  transmission: string;
  horsepower: number | null;
  fiscal_power: number | null;
  location: string;
  created_at: string;
}

export interface ListingRow {
  id: string;
  vehicle_id: string;
  source: string;
  source_url: string;
  external_id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  seller_type: string;
  published_at: string;
  retrieved_at: string;
  created_at: string;
}

export interface AnalysisRow {
  id: string;
  listing_id: string;
  market_value_low: number;
  market_value_estimated: number;
  market_value_high: number;
  resale_price_conservative: number;
  resale_price_realistic: number;
  resale_price_optimistic: number;
  registration_cost: number;
  transport_cost: number;
  repair_cost_low: number;
  repair_cost_high: number;
  preparation_cost: number;
  unexpected_cost: number;
  total_investment: number;
  profit_conservative: number;
  profit_realistic: number;
  profit_optimistic: number;
  roi: number;
  risk_level: string;
  deal_score: number;
  analysis_summary: string;
  created_at: string;
}

export interface RepairRow {
  id: string;
  analysis_id: string;
  name: string;
  description: string;
  cost_low: number;
  cost_high: number;
  difficulty: string;
  risk_level: string;
  category: string;
}

export interface FavoriteRow {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
}
