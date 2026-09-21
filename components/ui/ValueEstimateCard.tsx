import { confidenceLevelLabels } from "@/lib/labels";
import { formatCurrency } from "@/lib/format";
import type { ConfidenceLevel } from "@/lib/market-value/types";

const CONFIDENCE_STYLES: Record<ConfidenceLevel, { bg: string; color: string; border: string }> = {
  elevee: { bg: "rgba(5,150,105,0.08)", color: "var(--green-strong)", border: "rgba(5,150,105,0.2)" },
  moyenne: { bg: "rgba(217,119,6,0.08)", color: "var(--amber-strong)", border: "rgba(217,119,6,0.2)" },
  faible: { bg: "rgba(220,38,38,0.08)", color: "var(--red-strong)", border: "rgba(220,38,38,0.2)" },
};

interface ValueEstimateCardProps {
  label: string;
  estimated: number;
  low: number;
  high: number;
  confidence?: ConfidenceLevel;
  highlight?: boolean;
}

export default function ValueEstimateCard({
  label,
  estimated,
  low,
  high,
  confidence,
  highlight,
}: ValueEstimateCardProps) {
  return (
    <div
      style={{
        borderRadius: "14px",
        background: highlight ? "var(--electric-soft)" : "var(--surface)",
        border: `1px solid ${highlight ? "rgba(37,99,235,0.2)" : "var(--border)"}`,
        padding: "1.25rem",
        boxShadow: "var(--shadow-xs)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {highlight && (
        <div style={{ position: "absolute", top: 0, left: 0, width: "4px", height: "100%", background: "var(--electric)" }} />
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
        <div>
          <p
            style={{
              fontSize: "0.6875rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: highlight ? "var(--electric-strong)" : "var(--text-faint)",
              marginBottom: "0.5rem",
            }}
          >
            {label}
          </p>
          <p
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              fontVariantNumeric: "tabular-nums",
              color: "var(--text)",
              marginBottom: "0.25rem",
            }}
          >
            {formatCurrency(estimated)}
          </p>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
            Fourchette : {formatCurrency(low)} – {formatCurrency(high)}
          </p>
        </div>

        {confidence && (
          <span
            style={{
              display: "inline-block",
              padding: "0.25rem 0.625rem",
              borderRadius: "var(--radius-full)",
              background: CONFIDENCE_STYLES[confidence].bg,
              border: `1px solid ${CONFIDENCE_STYLES[confidence].border}`,
              color: CONFIDENCE_STYLES[confidence].color,
              fontSize: "0.6875rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              whiteSpace: "nowrap",
            }}
          >
            Confiance {confidenceLevelLabels[confidence].toLowerCase()}
          </span>
        )}
      </div>
    </div>
  );
}
