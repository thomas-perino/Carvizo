import VehicleCard from "./VehicleCard";
import type { InvestmentMode, Opportunity } from "@/types";
import { Search } from "lucide-react";

export default function OpportunityGrid({
  opportunities,
  mode,
}: {
  opportunities: Opportunity[];
  mode?: InvestmentMode;
}) {
  if (opportunities.length === 0) {
    return (
      <div
        style={{
          padding: "4rem 2rem",
          textAlign: "center",
          background: "var(--surface)",
          border: "1px dashed var(--border-strong)",
          borderRadius: "18px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: "var(--surface-raised)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Search size={24} color="var(--text-faint)" />
        </div>
        <div>
          <p style={{ fontWeight: 600, color: "var(--text)", marginBottom: "0.375rem" }}>
            Aucune opportunité trouvée
          </p>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Essayez de modifier ou de réinitialiser vos filtres.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "1.5rem",
      }}
    >
      {opportunities.map((opportunity) => (
        <VehicleCard key={opportunity.listing.id} opportunity={opportunity} mode={mode} />
      ))}
    </div>
  );
}
