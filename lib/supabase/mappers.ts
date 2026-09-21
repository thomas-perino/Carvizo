import type {
  Analysis,
  DealScoreExplanation,
  Difficulty,
  FuelType,
  Listing,
  Repair,
  RepairCategory,
  RiskLevel,
  SellerType,
  Transmission,
  Vehicle,
} from "@/types";
import type {
  AnalysisRow,
  FavoriteRow,
  ListingRow,
  RepairRow,
  VehicleRow,
} from "./row-types";
import type { Favorite } from "@/types";

// ---- Row -> Domain -----------------------------------------------------

export function vehicleFromRow(row: VehicleRow): Vehicle {
  return {
    id: row.id,
    make: row.make,
    model: row.model,
    version: row.version,
    year: row.year,
    mileage: row.mileage,
    fuelType: row.fuel_type as FuelType,
    transmission: row.transmission as Transmission,
    horsepower: row.horsepower,
    fiscalPower: row.fiscal_power,
    location: row.location,
    createdAt: row.created_at,
  };
}

export function listingFromRow(row: ListingRow): Listing {
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    source: row.source,
    sourceUrl: row.source_url,
    externalId: row.external_id,
    title: row.title,
    description: row.description,
    price: row.price,
    images: row.images ?? [],
    sellerType: row.seller_type as SellerType,
    publishedAt: row.published_at,
    retrievedAt: row.retrieved_at,
    createdAt: row.created_at,
  };
}

export function analysisFromRow(row: AnalysisRow): Analysis {
  let analysisSummary: DealScoreExplanation = { positives: [], negatives: [] };
  try {
    analysisSummary = JSON.parse(row.analysis_summary);
  } catch {
    // Résumé absent ou mal formé : on retombe sur un résumé vide plutôt
    // que de faire échouer l'affichage de l'analyse.
  }

  return {
    id: row.id,
    listingId: row.listing_id,
    marketValueLow: row.market_value_low,
    marketValueEstimated: row.market_value_estimated,
    marketValueHigh: row.market_value_high,
    resalePriceConservative: row.resale_price_conservative,
    resalePriceRealistic: row.resale_price_realistic,
    resalePriceOptimistic: row.resale_price_optimistic,
    registrationCost: row.registration_cost,
    transportCost: row.transport_cost,
    repairCostLow: row.repair_cost_low,
    repairCostHigh: row.repair_cost_high,
    preparationCost: row.preparation_cost,
    unexpectedCost: row.unexpected_cost,
    totalInvestment: row.total_investment,
    profitConservative: row.profit_conservative,
    profitRealistic: row.profit_realistic,
    profitOptimistic: row.profit_optimistic,
    roi: row.roi,
    riskLevel: row.risk_level as RiskLevel,
    dealScore: row.deal_score,
    analysisSummary,
    createdAt: row.created_at,
  };
}

export function repairFromRow(row: RepairRow): Repair {
  return {
    id: row.id,
    analysisId: row.analysis_id,
    name: row.name,
    description: row.description,
    costLow: row.cost_low,
    costHigh: row.cost_high,
    difficulty: row.difficulty as Difficulty,
    riskLevel: row.risk_level as RiskLevel,
    category: row.category as RepairCategory,
  };
}

export function favoriteFromRow(row: FavoriteRow): Favorite {
  return {
    id: row.id,
    userId: row.user_id,
    listingId: row.listing_id,
    createdAt: row.created_at,
  };
}

// ---- Domain -> Row (insertion, utilisé par le script de seed) ---------

export function vehicleToRow(vehicle: Vehicle): VehicleRow {
  return {
    id: vehicle.id,
    make: vehicle.make,
    model: vehicle.model,
    version: vehicle.version,
    year: vehicle.year,
    mileage: vehicle.mileage,
    fuel_type: vehicle.fuelType,
    transmission: vehicle.transmission,
    horsepower: vehicle.horsepower,
    fiscal_power: vehicle.fiscalPower,
    location: vehicle.location,
    created_at: vehicle.createdAt,
  };
}

export function listingToRow(listing: Listing): ListingRow {
  return {
    id: listing.id,
    vehicle_id: listing.vehicleId,
    source: listing.source,
    source_url: listing.sourceUrl,
    external_id: listing.externalId,
    title: listing.title,
    description: listing.description,
    price: listing.price,
    images: listing.images,
    seller_type: listing.sellerType,
    published_at: listing.publishedAt,
    retrieved_at: listing.retrievedAt,
    created_at: listing.createdAt,
  };
}

export function analysisToRow(analysis: Analysis): AnalysisRow {
  return {
    id: analysis.id,
    listing_id: analysis.listingId,
    market_value_low: analysis.marketValueLow,
    market_value_estimated: analysis.marketValueEstimated,
    market_value_high: analysis.marketValueHigh,
    resale_price_conservative: analysis.resalePriceConservative,
    resale_price_realistic: analysis.resalePriceRealistic,
    resale_price_optimistic: analysis.resalePriceOptimistic,
    registration_cost: analysis.registrationCost,
    transport_cost: analysis.transportCost,
    repair_cost_low: analysis.repairCostLow,
    repair_cost_high: analysis.repairCostHigh,
    preparation_cost: analysis.preparationCost,
    unexpected_cost: analysis.unexpectedCost,
    total_investment: analysis.totalInvestment,
    profit_conservative: analysis.profitConservative,
    profit_realistic: analysis.profitRealistic,
    profit_optimistic: analysis.profitOptimistic,
    roi: analysis.roi,
    risk_level: analysis.riskLevel,
    deal_score: analysis.dealScore,
    analysis_summary: JSON.stringify(analysis.analysisSummary),
    created_at: analysis.createdAt,
  };
}

export function repairToRow(repair: Repair): RepairRow {
  return {
    id: repair.id,
    analysis_id: repair.analysisId,
    name: repair.name,
    description: repair.description,
    cost_low: repair.costLow,
    cost_high: repair.costHigh,
    difficulty: repair.difficulty,
    risk_level: repair.riskLevel,
    category: repair.category,
  };
}
