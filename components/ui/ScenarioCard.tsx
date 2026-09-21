import { computeROI } from "@/lib/calculations/roi";
import { formatCurrency, formatPercent, formatSignedCurrency } from "@/lib/format";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ScenarioCardProps {
  label: string;
  resalePrice: number;
  totalInvestment: number;
  profit: number;
  highlight?: boolean;
}

export default function ScenarioCard({
  label,
  resalePrice,
  totalInvestment,
  profit,
  highlight,
}: ScenarioCardProps) {
  const roi = computeROI(profit, totalInvestment);
  const positive = profit >= 0;

  if (highlight) {
    return (
      <div
        style={{
          borderRadius: "14px",
          background: "var(--navy-900)",
          border: "1px solid rgba(255,255,255,0.1)",
          padding: "1.5rem",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(6,11,24,0.3)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            height: "2px",
            background: positive
              ? "linear-gradient(90deg, transparent, var(--green), transparent)"
              : "linear-gradient(90deg, transparent, var(--red), transparent)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "0.75rem",
            right: "0.875rem",
            fontSize: "0.5625rem",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.35)",
          }}
        >
          Recommandé
        </div>

        <p
          style={{
            fontSize: "0.6875rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)",
            marginBottom: "0.75rem",
          }}
        >
          {label}
        </p>

        <p
          style={{
            fontSize: "1.875rem",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            fontVariantNumeric: "tabular-nums",
            color: "white",
            marginBottom: "0.125rem",
          }}
        >
          {formatCurrency(resalePrice)}
        </p>
        <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", marginBottom: "1.25rem" }}>
          Prix de revente estimé
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: "1rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.4)" }}>Investissement</span>
            <span style={{ fontSize: "0.8125rem", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: "rgba(255,255,255,0.7)" }}>
              {formatCurrency(totalInvestment)}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.9375rem", fontWeight: 600, color: positive ? "#34D399" : "#F87171" }}>
              {positive ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
              Bénéfice
            </span>
            <span style={{ fontSize: "1.0625rem", fontWeight: 800, fontVariantNumeric: "tabular-nums", color: positive ? "#34D399" : "#F87171" }}>
              {formatSignedCurrency(profit)}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.4)" }}>ROI</span>
            <span style={{ fontSize: "0.9375rem", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: positive ? "#34D399" : "#F87171" }}>
              {formatPercent(roi)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Scénario standard
  return (
    <div
      style={{
        borderRadius: "14px",
        border: "1px solid var(--border)",
        background: "var(--surface)",
        padding: "1.25rem",
        boxShadow: "var(--shadow-xs)",
      }}
    >
      <p
        style={{
          fontSize: "0.6875rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--text-faint)",
          marginBottom: "0.625rem",
        }}
      >
        {label}
      </p>

      <p
        style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          fontVariantNumeric: "tabular-nums",
          color: "var(--text)",
          marginBottom: "0.125rem",
        }}
      >
        {formatCurrency(resalePrice)}
      </p>
      <p style={{ fontSize: "0.75rem", color: "var(--text-faint)", marginBottom: "1rem" }}>
        Prix de revente estimé
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.375rem",
          borderTop: "1px solid var(--border)",
          paddingTop: "0.875rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>Investissement</span>
          <span style={{ fontSize: "0.8125rem", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: "var(--text-muted)" }}>
            {formatCurrency(totalInvestment)}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: positive ? "var(--green)" : "var(--red)" }}>
            Bénéfice
          </span>
          <span style={{ fontSize: "0.875rem", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: positive ? "var(--green)" : "var(--red)" }}>
            {formatSignedCurrency(profit)}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>ROI</span>
          <span style={{ fontSize: "0.8125rem", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: positive ? "var(--green)" : "var(--red)" }}>
            {formatPercent(roi)}
          </span>
        </div>
      </div>
    </div>
  );
}
