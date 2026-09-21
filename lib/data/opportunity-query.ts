import type {
  FuelType,
  InvestmentMode,
  OpportunityFilters,
  OpportunitySort,
  OpportunitySortKey,
  RepairIssueFilter,
  RiskLevel,
  Transmission,
} from "@/types";

type SearchParams = Record<string, string | string[] | undefined>;

const SORT_KEYS: OpportunitySortKey[] = ["deal_score", "profit", "roi", "price", "market_discount"];
const FUEL_TYPES: FuelType[] = ["essence", "diesel", "hybride", "electrique"];
const TRANSMISSIONS: Transmission[] = ["manuelle", "automatique"];
const RISK_LEVELS: RiskLevel[] = ["faible", "moyen", "eleve"];
const INVESTMENT_MODES: InvestmentMode[] = ["arbitrage", "reparations"];
const REPAIR_ISSUES: RepairIssueFilter[] = ["moteur", "carrosserie", "interieur"];

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseOpportunityFilters(sp: SearchParams): OpportunityFilters {
  const fuelType = first(sp.fuelType);
  const transmission = first(sp.transmission);
  const riskLevel = first(sp.riskLevel);
  const mode = first(sp.mode);
  const repairRaw = first(sp.repairIssues);

  const repairIssues = repairRaw
    ? repairRaw
        .split(",")
        .map((value) => value.trim())
        .filter((value): value is RepairIssueFilter =>
          REPAIR_ISSUES.includes(value as RepairIssueFilter)
        )
    : undefined;

  return {
    search: first(sp.search) || undefined,
    maxPrice: toNumber(first(sp.maxPrice)),
    minProfit: toNumber(first(sp.minProfit)),
    minDealScore: toNumber(first(sp.minDealScore)),
    make: first(sp.make) || undefined,
    model: first(sp.model) || undefined,
    fuelType: FUEL_TYPES.includes(fuelType as FuelType) ? (fuelType as FuelType) : undefined,
    transmission: TRANSMISSIONS.includes(transmission as Transmission)
      ? (transmission as Transmission)
      : undefined,
    minYear: toNumber(first(sp.minYear)),
    maxYear: toNumber(first(sp.maxYear)),
    maxMileage: toNumber(first(sp.maxMileage)),
    riskLevel: RISK_LEVELS.includes(riskLevel as RiskLevel) ? (riskLevel as RiskLevel) : undefined,
    location: first(sp.location) || undefined,
    mode: INVESTMENT_MODES.includes(mode as InvestmentMode) ? (mode as InvestmentMode) : undefined,
    repairIssues: repairIssues && repairIssues.length > 0 ? repairIssues : undefined,
  };
}

export function parseOpportunitySort(sp: SearchParams): OpportunitySort {
  const key = first(sp.sort);
  const direction = first(sp.direction);
  return {
    key: SORT_KEYS.includes(key as OpportunitySortKey) ? (key as OpportunitySortKey) : "deal_score",
    direction: direction === "asc" ? "asc" : "desc",
  };
}

export function serializeOpportunityQuery(
  filters: OpportunityFilters,
  sort: OpportunitySort
): string {
  const params = new URLSearchParams();

  const set = (key: string, value: string | number | undefined) => {
    if (value === undefined || value === "") return;
    params.set(key, String(value));
  };

  set("search", filters.search);
  set("maxPrice", filters.maxPrice);
  set("minProfit", filters.minProfit);
  set("minDealScore", filters.minDealScore);
  set("make", filters.make);
  set("model", filters.model);
  set("fuelType", filters.fuelType);
  set("transmission", filters.transmission);
  set("minYear", filters.minYear);
  set("maxYear", filters.maxYear);
  set("maxMileage", filters.maxMileage);
  set("riskLevel", filters.riskLevel);
  set("location", filters.location);
  set("mode", filters.mode);

  if (filters.repairIssues && filters.repairIssues.length > 0) {
    params.set("repairIssues", filters.repairIssues.join(","));
  }

  if (sort.key !== "deal_score") params.set("sort", sort.key);
  if (sort.direction !== "desc") params.set("direction", sort.direction);

  return params.toString();
}
