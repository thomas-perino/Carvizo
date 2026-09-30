"use client";

import { useSearchParams } from "next/navigation";
import OpportunitiesExplorer from "./OpportunitiesExplorer";
import { parseOpportunityFilters, parseOpportunitySort } from "@/lib/data/opportunity-query";
import type { Opportunity } from "@/types";

/** Read query filters in the browser so the catalog also works in a static export. */
export default function OpportunitiesWithQuery({ opportunities }: { opportunities: Opportunity[] }) {
  const query = useSearchParams();
  const params: Record<string, string | string[]> = {};
  query.forEach((_, key) => { const values = query.getAll(key); params[key] = values.length > 1 ? values : values[0]; });
  return <OpportunitiesExplorer opportunities={opportunities} initialFilters={parseOpportunityFilters(params)} initialSort={parseOpportunitySort(params)} />;
}
