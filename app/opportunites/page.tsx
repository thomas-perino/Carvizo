import OpportunitiesExplorer from "@/components/opportunities/OpportunitiesExplorer";
import { listOpportunities } from "@/lib/data/get-opportunities";
import { parseOpportunityFilters, parseOpportunitySort } from "@/lib/data/opportunity-query";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const opportunities = await listOpportunities();

  return (
    <OpportunitiesExplorer
      opportunities={opportunities}
      initialFilters={parseOpportunityFilters(sp)}
      initialSort={parseOpportunitySort(sp)}
    />
  );
}
