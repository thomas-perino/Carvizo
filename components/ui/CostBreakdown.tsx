import { formatCurrency } from "@/lib/format";
import type { Analysis, Listing } from "@/types";
import { Receipt } from "lucide-react";

interface CostBreakdownProps {
  listing: Listing;
  analysis: Analysis;
}

export default function CostBreakdown({ listing, analysis }: CostBreakdownProps) {
  const repairCostEstimated = Math.round(
    (analysis.repairCostLow + analysis.repairCostHigh) / 2
  );

  const rows: Array<{ label: string; value: number; highlight?: boolean }> = [
    { label: "Prix d'achat", value: listing.price },
    { label: "Carte grise estimée", value: analysis.registrationCost },
    { label: "Transport", value: analysis.transportCost },
    { label: "Réparations estimées", value: repairCostEstimated },
    { label: "Préparation (nettoyage, etc.)", value: analysis.preparationCost },
    { label: "Provision pour imprévus", value: analysis.unexpectedCost },
  ];

  return (
    <div
      style={{
        borderRadius: "14px",
        border: "1px solid var(--border)",
        background: "var(--surface)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "1rem 1.25rem",
          background: "var(--surface-raised)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: "0.625rem",
        }}
      >
        <Receipt size={16} color="var(--text-muted)" />
        <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text)" }}>Détail des coûts estimés</h3>
      </div>

      <div style={{ padding: "0.5rem 1.25rem" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "0.875rem 0", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                  {row.label}
                </td>
                <td
                  style={{
                    padding: "0.875rem 0",
                    fontSize: "0.9375rem",
                    fontWeight: 500,
                    fontVariantNumeric: "tabular-nums",
                    textAlign: "right",
                    color: "var(--text)",
                  }}
                >
                  {formatCurrency(row.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        style={{
          padding: "1.25rem",
          background: "rgba(37,99,235,0.03)",
          borderTop: "1px solid rgba(37,99,235,0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text)" }}>
          Investissement total estimé
        </span>
        <span
          style={{
            fontSize: "1.5rem",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            fontVariantNumeric: "tabular-nums",
            color: "var(--electric-strong)",
          }}
        >
          {formatCurrency(analysis.totalInvestment)}
        </span>
      </div>
    </div>
  );
}
