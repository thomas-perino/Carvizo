import { confidenceLevelLabels } from "@/lib/labels";
import { formatSignedCurrency } from "@/lib/format";
import type { MarketValueEstimate } from "@/lib/market-value/types";
import { CheckCircle2, Database } from "lucide-react";

const CONFIDENCE_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  elevee:  { bg: "rgba(5,150,105,0.07)",  color: "var(--green-strong)",  border: "rgba(5,150,105,0.2)" },
  moyenne: { bg: "rgba(217,119,6,0.07)",  color: "var(--amber-strong)",  border: "rgba(217,119,6,0.2)" },
  faible:  { bg: "rgba(220,38,38,0.07)",  color: "var(--red-strong)",    border: "rgba(220,38,38,0.2)" },
};

/**
 * Rend explicable l'estimation de valeur — données affichées proviennent
 * directement du Market Value Engine, rien n'est recalculé.
 */
export default function MarketValueMethodology({ estimate }: { estimate: MarketValueEstimate }) {
  const confidenceStyle = CONFIDENCE_STYLES[estimate.confidence] ?? CONFIDENCE_STYLES.faible;

  return (
    <div
      style={{
        borderRadius: "14px",
        border: "1px solid var(--border)",
        background: "var(--surface)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "1rem 1.25rem",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface-raised)",
          display: "flex",
          alignItems: "center",
          gap: "0.625rem",
        }}
      >
        <Database size={15} color="var(--electric)" />
        <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text)" }}>
          Méthode de calcul — Market Value Engine
        </h3>
      </div>

      <div style={{ padding: "1.25rem" }}>
        {/* Stats comparables */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1px",
            background: "var(--border)",
            borderRadius: "10px",
            overflow: "hidden",
            marginBottom: "1.25rem",
          }}
        >
          {[
            { value: estimate.comparableCount, label: "Comparables trouvés" },
            { value: estimate.usedComparableCount, label: "Comparables utilisés" },
            {
              value: confidenceLevelLabels[estimate.confidence],
              label: "Confiance",
              custom: (
                <span
                  style={{
                    display: "inline-block",
                    padding: "0.2rem 0.625rem",
                    borderRadius: "var(--radius-full)",
                    fontSize: "0.8125rem",
                    fontWeight: 700,
                    background: confidenceStyle.bg,
                    color: confidenceStyle.color,
                    border: `1px solid ${confidenceStyle.border}`,
                  }}
                >
                  {confidenceLevelLabels[estimate.confidence]}
                </span>
              ),
            },
          ].map(({ value, label, custom }) => (
            <div
              key={label}
              style={{
                background: "var(--surface)",
                padding: "0.875rem",
                textAlign: "center",
              }}
            >
              {custom ? (
                <div style={{ marginBottom: "0.375rem" }}>{custom}</div>
              ) : (
                <p
                  style={{
                    fontSize: "1.375rem",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    fontVariantNumeric: "tabular-nums",
                    color: "var(--text)",
                    marginBottom: "0.25rem",
                  }}
                >
                  {value}
                </p>
              )}
              <p style={{ fontSize: "0.6875rem", color: "var(--text-faint)", fontWeight: 500 }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Raisons de confiance */}
        {estimate.confidenceReasons.length > 0 && (
          <ul style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: estimate.adjustments.length > 0 ? "1.25rem" : 0 }}>
            {estimate.confidenceReasons.map((reason) => (
              <li key={reason} style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                <CheckCircle2 size={14} color="var(--green)" style={{ flexShrink: 0, marginTop: "2px" }} />
                {reason}
              </li>
            ))}
          </ul>
        )}

        {/* Ajustements */}
        {estimate.adjustments.length > 0 && (
          <div
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: "1rem",
            }}
          >
            <p
              style={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--text-faint)",
                marginBottom: "0.75rem",
              }}
            >
              Ajustements appliqués
            </p>
            <ul style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {estimate.adjustments.map((adjustment) => {
                const isPositive = adjustment.amount >= 0;
                return (
                  <li
                    key={adjustment.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "1rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    <span style={{ color: "var(--text-muted)" }}>{adjustment.reason}</span>
                    <span
                      style={{
                        fontWeight: 700,
                        fontVariantNumeric: "tabular-nums",
                        color: isPositive ? "var(--green)" : "var(--red)",
                        flexShrink: 0,
                      }}
                    >
                      {formatSignedCurrency(adjustment.amount)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
