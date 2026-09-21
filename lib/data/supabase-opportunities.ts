import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  analysisFromRow,
  listingFromRow,
  repairFromRow,
  vehicleFromRow,
} from "@/lib/supabase/mappers";
import type { AnalysisRow, ListingRow, RepairRow, VehicleRow } from "@/lib/supabase/row-types";
import type { Opportunity } from "@/types";

type ListingWithRelations = ListingRow & {
  vehicle: VehicleRow;
  analysis: (AnalysisRow & { repairs: RepairRow[] }) | null;
};

const OPPORTUNITY_SELECT = `
  *,
  vehicle:vehicles(*),
  analysis:analyses(*, repairs(*))
`;

function rowToOpportunity(row: ListingWithRelations): Opportunity | null {
  if (!row.analysis) return null;

  return {
    vehicle: vehicleFromRow(row.vehicle),
    listing: listingFromRow(row),
    analysis: analysisFromRow(row.analysis),
    repairs: (row.analysis.repairs ?? []).map(repairFromRow),
  };
}

/** Récupère toutes les opportunités depuis Supabase (vehicles + listings + analyses + repairs). */
export async function fetchOpportunitiesFromSupabase(): Promise<Opportunity[]> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("listings")
    .select(OPPORTUNITY_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as unknown as ListingWithRelations[])
    .map(rowToOpportunity)
    .filter((o): o is Opportunity => o !== null);
}

export async function fetchOpportunityByIdFromSupabase(
  listingId: string
): Promise<Opportunity | null> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("listings")
    .select(OPPORTUNITY_SELECT)
    .eq("id", listingId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return rowToOpportunity(data as unknown as ListingWithRelations);
}
