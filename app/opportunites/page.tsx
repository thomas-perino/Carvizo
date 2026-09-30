import { Suspense } from "react";
import OpportunitiesWithQuery from "@/components/opportunities/OpportunitiesWithQuery";
import { listOpportunities } from "@/lib/data/get-opportunities";
export default async function OpportunitiesPage() {
  const opportunities = await listOpportunities();

  return (
    <Suspense fallback={<p style={{ padding: "2rem" }}>Chargement des opportunités…</p>}>
      <OpportunitiesWithQuery opportunities={opportunities} />
    </Suspense>
  );
}
