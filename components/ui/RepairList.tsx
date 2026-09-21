import { difficultyLabels, repairCategoryLabels } from "@/lib/labels";
import { formatCurrency } from "@/lib/format";
import type { Repair } from "@/types";
import RiskBadge from "./RiskBadge";
import { Wrench } from "lucide-react";

export default function RepairList({ repairs }: { repairs: Repair[] }) {
  if (repairs.length === 0) {
    return (
      <div
        style={{
          borderRadius: "14px",
          background: "var(--green-soft)",
          border: "1px solid var(--green-border)",
          padding: "1.25rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--green-strong)" }}>
          Aucune réparation majeure identifiée dans l'annonce.
        </span>
      </div>
    );
  }

  return (
    <ul style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {repairs.map((repair) => (
        <li
          key={repair.id}
          style={{
            borderRadius: "14px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            padding: "1.25rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "1.25rem",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "var(--surface-raised)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Wrench size={18} color="var(--text-muted)" />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text)" }}>
                  {repair.name}
                </p>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.25rem", lineHeight: 1.5 }}>
                  {repair.description}
                </p>

                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--navy-400)",
                      background: "rgba(74,111,165,0.1)",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "6px",
                    }}
                  >
                    {repairCategoryLabels[repair.category]}
                  </span>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--text-faint)",
                      background: "var(--surface-raised)",
                      border: "1px solid var(--border)",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "6px",
                    }}
                  >
                    Difficulté {difficultyLabels[repair.difficulty].toLowerCase()}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                <span
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    fontVariantNumeric: "tabular-nums",
                    color: "var(--text)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatCurrency(repair.costLow)} – {formatCurrency(repair.costHigh)}
                </span>
                <RiskBadge level={repair.riskLevel} />
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
