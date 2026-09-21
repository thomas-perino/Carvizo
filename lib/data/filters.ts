import { computeMarketPosition } from "@/lib/calculations";
import {
  getOpportunityInvestmentMode,
  opportunityMatchesRepairIssues,
} from "@/lib/data/investment-mode";
import type { Opportunity, OpportunityFilters, OpportunitySort } from "@/types";

export function applyOpportunityFilters(
  opportunities: Opportunity[],
  filters: OpportunityFilters
): Opportunity[] {
  return opportunities.filter((opportunity) => {
    const { vehicle, listing, analysis, repairs } = opportunity;

    if (filters.mode && getOpportunityInvestmentMode(opportunity) !== filters.mode) return false;
    if (filters.maxPrice !== undefined && listing.price > filters.maxPrice) return false;
    if (filters.minProfit !== undefined && analysis.profitRealistic < filters.minProfit)
      return false;
    if (filters.minDealScore !== undefined && analysis.dealScore < filters.minDealScore)
      return false;
    if (filters.make && vehicle.make.toLowerCase() !== filters.make.toLowerCase()) return false;
    if (filters.model && vehicle.model.toLowerCase() !== filters.model.toLowerCase()) return false;
    if (filters.fuelType && vehicle.fuelType !== filters.fuelType) return false;
    if (filters.transmission && vehicle.transmission !== filters.transmission) return false;
    if (filters.minYear !== undefined && vehicle.year < filters.minYear) return false;
    if (filters.maxYear !== undefined && vehicle.year > filters.maxYear) return false;
    if (filters.maxMileage !== undefined && vehicle.mileage > filters.maxMileage) return false;
    if (filters.riskLevel && analysis.riskLevel !== filters.riskLevel) return false;
    if (
      filters.location &&
      !vehicle.location.toLowerCase().includes(filters.location.toLowerCase())
    )
      return false;
    if (filters.search) {
      const haystack = `${vehicle.make} ${vehicle.model} ${vehicle.version ?? ""} ${listing.title}`
        .toLowerCase();
      if (!haystack.includes(filters.search.toLowerCase())) return false;
    }
    if (filters.repairIssues && filters.repairIssues.length > 0) {
      if (!opportunityMatchesRepairIssues(repairs, filters.repairIssues)) return false;
    }
    return true;
  });
}

export function applyOpportunitySort(
  opportunities: Opportunity[],
  sort: OpportunitySort
): Opportunity[] {
  const sorted = [...opportunities].sort((a, b) => {
    const valueOf = (o: Opportunity): number => {
      switch (sort.key) {
        case "deal_score":
          return o.analysis.dealScore;
        case "profit":
          return o.analysis.profitRealistic;
        case "roi":
          return o.analysis.roi;
        case "price":
          return o.listing.price;
        case "market_discount":
          return -computeMarketPosition(o.listing.price, o.analysis.marketValueEstimated)
            .differencePercent;
      }
    };
    return valueOf(a) - valueOf(b);
  });

  if (sort.direction === "desc") sorted.reverse();
  return sorted;
}

export function listModelsForMake(opportunities: Opportunity[], make?: string): string[] {
  const source = make
    ? opportunities.filter((o) => o.vehicle.make.toLowerCase() === make.toLowerCase())
    : opportunities;
  return Array.from(new Set(source.map((o) => o.vehicle.model))).sort();
}

export const DEFAULT_SORT: OpportunitySort = { key: "deal_score", direction: "desc" };
