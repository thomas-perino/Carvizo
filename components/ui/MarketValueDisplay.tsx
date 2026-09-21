import { computeMarketPosition } from "@/lib/calculations/market";
import { formatCurrency, formatPercent } from "@/lib/format";
import { TrendingDown, TrendingUp } from "lucide-react";

interface MarketValueDisplayProps {
  price: number;
  marketValueLow: number;
  marketValueEstimated: number;
  marketValueHigh: number;
}

export default function MarketValueDisplay({
  price,
  marketValueLow,
  marketValueEstimated,
  marketValueHigh,
}: MarketValueDisplayProps) {
  const position = computeMarketPosition(price, marketValueEstimated);
  const isDiscounted = position.isDiscounted;

  // Position du prix sur la barre low→high (clampé 0-100%)
  const range = marketValueHigh - marketValueLow;
  const pricePos = range > 0
    ? Math.max(0, Math.min(100, ((price - marketValueLow) / range) * 100))
    : 50;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* En-tête : prix vs valeur */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <div>
          <p style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: "0.25rem" }}>
            Prix demandé
          </p>
          <p style={{ fontSize: "1.625rem", fontWeight: 800, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", color: "var(--text)" }}>
            {formatCurrency(price)}
          </p>
        </div>

        {/* Badge décote/surcote */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.25rem",
          }}
        >
          {isDiscounted
            ? <TrendingDown size={18} color="var(--green)" />
            : <TrendingUp size={18} color="var(--amber)" />}
          <span
            style={{
              fontSize: "0.875rem",
              fontWeight: 800,
              fontVariantNumeric: "tabular-nums",
              color: isDiscounted ? "var(--green)" : "var(--amber)",
            }}
          >
            {isDiscounted ? "−" : "+"}{formatPercent(Math.abs(position.differencePercent))}
          </span>
          <span style={{ fontSize: "0.5625rem", fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {isDiscounted ? "Décote" : "Surcote"}
          </span>
        </div>

        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: "0.25rem" }}>
            Valeur marché
          </p>
          <p style={{ fontSize: "1.625rem", fontWeight: 800, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", color: "var(--text)" }}>
            {formatCurrency(marketValueEstimated)}
          </p>
        </div>
      </div>

      {/* Barre de position */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.6875rem", color: "var(--text-faint)" }}>
            Bas : {formatCurrency(marketValueLow)}
          </span>
          <span style={{ fontSize: "0.6875rem", color: "var(--text-faint)" }}>
            Haut : {formatCurrency(marketValueHigh)}
          </span>
        </div>
        <div
          style={{
            position: "relative",
            height: "8px",
            background: "var(--border)",
            borderRadius: "4px",
            overflow: "visible",
          }}
        >
          {/* Zone de marché (full barre) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: isDiscounted
                ? "linear-gradient(90deg, rgba(5,150,105,0.12), rgba(5,150,105,0.04))"
                : "linear-gradient(90deg, rgba(217,119,6,0.04), rgba(217,119,6,0.12))",
              borderRadius: "4px",
            }}
          />
          {/* Curseur de position du prix */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: `${pricePos}%`,
              transform: "translate(-50%, -50%)",
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              background: isDiscounted ? "var(--green)" : "var(--amber)",
              border: "2px solid white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              zIndex: 1,
            }}
            title={`Prix : ${formatCurrency(price)}`}
          />
          {/* Ligne valeur estimée */}
          <div
            style={{
              position: "absolute",
              top: "-4px",
              bottom: "-4px",
              left: "50%",
              width: "2px",
              background: "var(--text-faint)",
              opacity: 0.4,
              borderRadius: "1px",
            }}
          />
        </div>
        <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
          <span style={{ fontSize: "0.6875rem", color: "var(--text-faint)" }}>
            Valeur estimée : {formatCurrency(marketValueEstimated)}
          </span>
        </div>
      </div>
    </div>
  );
}
