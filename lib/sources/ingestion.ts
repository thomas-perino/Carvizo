import { DEMO_COMPARABLES } from "@/data/demo/comparables";
import { DEMO_SEEDS, type DemoSeed } from "@/data/demo/seed";
import type { RepairSignal } from "@/lib/calculations/repair-cost";
import { analyzeListing } from "@/lib/analysis/analyze-listing";
import type { VehicleConditionIssue } from "@/lib/market-value/types";
import { normalizeRawListing } from "./normalize";
import { LISTING_SOURCES } from "./registry";
import type { ListingSource, NormalizedListing, RawListing } from "./types";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { analysisToRow, listingToRow, repairToRow, vehicleToRow } from "@/lib/supabase/mappers";
import type { Opportunity } from "@/types";

export interface IngestionResult {
  fetchedCount: number;
  insertedCount: number;
  duplicateCount: number;
  errors: string[];
  opportunities: Opportunity[];
}

function repairsToConditionIssues(repairs: RepairSignal[]): VehicleConditionIssue[] {
  const severityMap = { faible: "low", moyen: "medium", eleve: "high" } as const;

  return repairs.map((repair) => ({
    category: repair.category,
    severity: severityMap[repair.riskLevel],
    repairCostLow: repair.costLow,
    repairCostHigh: repair.costHigh,
    confidence: repair.category === "accident" ? 0.6 : 0.75,
  }));
}

function buildTargetVehicleProfile(seed: DemoSeed) {
  return {
    make: seed.make,
    model: seed.model,
    generation: seed.generation,
    version: seed.version,
    trim: seed.trim,
    year: seed.year,
    mileage: seed.mileage,
    fuelType: seed.fuelTypeRaw.toLowerCase(),
    transmission: seed.transmissionRaw.toLowerCase(),
    horsepower: seed.horsepower,
    location: seed.location,
    condition: seed.condition,
    options: seed.options,
  };
}

/**
 * Aggregates and normalizes listings from registered sources.
 * Deduplicates in-memory by (source, externalId) and optionally upserts
 * records into Supabase DB using the unique (source, external_id) constraint.
 */
export async function ingestListings(
  sources: ListingSource[] = LISTING_SOURCES,
  options: { saveToSupabase?: boolean } = {}
): Promise<IngestionResult> {
  const result: IngestionResult = {
    fetchedCount: 0,
    insertedCount: 0,
    duplicateCount: 0,
    errors: [],
    opportunities: [],
  };

  const seenKeys = new Set<string>();
  const rawListings: RawListing[] = [];

  for (const source of sources) {
    try {
      const fetched = await source.fetchListings();
      result.fetchedCount += fetched.length;

      for (const item of fetched) {
        const key = `${item.source}:${item.externalId}`;
        if (seenKeys.has(key)) {
          result.duplicateCount++;
        } else {
          seenKeys.add(key);
          rawListings.push(item);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      result.errors.push(`Error fetching from source ${source.name}: ${msg}`);
    }
  }

  const supabase = options.saveToSupabase ? getSupabaseAdminClient() : null;
  const seedsById = new Map(DEMO_SEEDS.map((seed) => [seed.externalId, seed]));

  for (const raw of rawListings) {
    try {
      const normalized: NormalizedListing = normalizeRawListing(raw);
      const vehicleId = `v-${raw.source}-${raw.externalId}`;
      const listingId = `l-${raw.source}-${raw.externalId}`;
      const analysisId = `a-${raw.source}-${raw.externalId}`;

      const vehicle = {
        id: vehicleId,
        createdAt: raw.retrievedAt,
        ...normalized.vehicle,
      };

      const listing = {
        id: listingId,
        vehicleId,
        createdAt: raw.retrievedAt,
        ...normalized.listing,
      };

      const seed = seedsById.get(raw.externalId);
      const targetVehicleProfile = seed
        ? buildTargetVehicleProfile(seed)
        : {
            make: vehicle.make,
            model: vehicle.model,
            version: vehicle.version ?? undefined,
            year: vehicle.year,
            mileage: vehicle.mileage,
            fuelType: vehicle.fuelType,
            transmission: vehicle.transmission,
            horsepower: vehicle.horsepower ?? undefined,
            location: vehicle.location,
            condition: "bon" as const,
          };

      const repairsSignals = seed?.repairs ?? [];

      const analysisResult = analyzeListing(vehicle, listing, {
        targetVehicleProfile,
        comparables: DEMO_COMPARABLES,
        conditionIssues: repairsToConditionIssues(repairsSignals),
        resalePriceConservative: seed?.resalePriceConservative ?? Math.round(listing.price * 1.1),
        resalePriceRealistic: seed?.resalePriceRealistic ?? Math.round(listing.price * 1.2),
        resalePriceOptimistic: seed?.resalePriceOptimistic ?? Math.round(listing.price * 1.3),
        transportCost: seed?.transportCost ?? 100,
        preparationCost: seed?.preparationCost ?? 120,
        repairs: repairsSignals,
        resaleEaseScore: seed?.resaleEaseScore ?? 70,
        accidentReported: seed?.accidentReported ?? false,
      });

      const analysis = {
        id: analysisId,
        listingId,
        createdAt: raw.retrievedAt,
        ...analysisResult.analysis,
      };

      const repairs = (analysisResult.repairs ?? []).map((r, i) => ({
        id: `r-${raw.source}-${raw.externalId}-${i + 1}`,
        analysisId,
        ...r,
      }));

      const opportunity: Opportunity = {
        vehicle,
        listing,
        analysis,
        repairs,
        valueAnalysis: analysisResult.valueAnalysis,
      };

      result.opportunities.push(opportunity);

      if (supabase) {
        const { error: vehicleErr } = await supabase.from("vehicles").upsert(vehicleToRow(vehicle));
        if (vehicleErr) throw vehicleErr;

        const { error: listingErr } = await supabase.from("listings").upsert(listingToRow(listing));
        if (listingErr) throw listingErr;

        const { error: analysisErr } = await supabase.from("analyses").upsert(analysisToRow(analysis));
        if (analysisErr) throw analysisErr;

        if (repairs.length > 0) {
          const { error: repairsErr } = await supabase.from("repairs").upsert(repairs.map(repairToRow));
          if (repairsErr) throw repairsErr;
        }

        result.insertedCount++;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      result.errors.push(`Error processing raw listing ${raw.externalId}: ${msg}`);
    }
  }

  return result;
}
