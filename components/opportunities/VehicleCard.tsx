"use client";

import Image from "next/image";
import Link from "next/link";
import SaveOpportunityButton from "./SaveOpportunityButton";
import DealScore from "@/components/ui/DealScore";
import RiskBadge from "@/components/ui/RiskBadge";
import { computeMarketPosition } from "@/lib/calculations";
import {
  estimatedRepairCostFromAnalysis,
  getOpportunityInvestmentMode,
} from "@/lib/data/investment-mode";
import { formatCurrency, formatMileage, formatPercent, formatSignedCurrency } from "@/lib/format";
import { fuelTypeLabels, transmissionLabels } from "@/lib/labels";
import type { InvestmentMode, Opportunity } from "@/types";
import { Fuel, Settings, Calendar, Gauge } from "lucide-react";

export default function VehicleCard({
  opportunity,
  mode,
}: {
  opportunity: Opportunity;
  mode?: InvestmentMode;
}) {
  const { vehicle, listing, analysis } = opportunity;
  const displayMode = mode ?? getOpportunityInvestmentMode(opportunity);
  const position = computeMarketPosition(listing.price, analysis.marketValueEstimated);
  const discountAmount = analysis.marketValueEstimated - listing.price;
  const repairCost = estimatedRepairCostFromAnalysis(
    analysis.repairCostLow,
    analysis.repairCostHigh
  );
  const positiveProfit = analysis.profitRealistic >= 0;
  const discounted = discountAmount > 0;

  return (
    <article
      className="group"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRadius: "18px",
        border: "1px solid var(--border)",
        background: "var(--surface)",
        boxShadow: "var(--shadow-sm)",
        transition: "box-shadow 0.35s ease, transform 0.35s ease, border-color 0.35s ease",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(-4px)";
        el.style.boxShadow = "var(--shadow-card-hover)";
        el.style.borderColor = "rgba(37, 99, 235, 0.25)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "var(--shadow-sm)";
        el.style.borderColor = "var(--border)";
      }}
    >
      <SaveOpportunityButton listingId={listing.id} />

      <Link href={`/opportunites/${listing.id}`} style={{ display: "flex", flex: 1, flexDirection: "column", textDecoration: "none", color: "inherit" }}>
        {/* Image avec overlay */}
        <div style={{ position: "relative", aspectRatio: "16/10", background: "var(--surface-raised)", overflow: "hidden" }}>
          {listing.images[0] && (
            <Image
              src={listing.images[0]}
              alt={`${vehicle.make} ${vehicle.model}`}
              fill
              sizes="(max-width: 768px) 100vw, 380px"
              className="object-cover"
              style={{
                objectFit: "cover",
                transition: "transform 0.6s ease",
              }}
            />
          )}
          {/* Gradient overlay bas */}
          <div
            style={{
              position: "absolute",
              bottom: 0, left: 0, right: 0,
              height: "60%",
              background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)",
            }}
          />

          {/* Demo badge */}
          <span
            style={{
              position: "absolute",
              bottom: "0.75rem",
              left: "0.75rem",
              padding: "0.2rem 0.625rem",
              borderRadius: "var(--radius-full)",
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.15)",
              fontSize: "0.5625rem",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Démo
          </span>

          {/* Deal Score */}
          <div
            style={{
              position: "absolute",
              top: "0.75rem",
              right: "0.75rem",
            }}
          >
            <DealScore score={analysis.dealScore} size="sm" />
          </div>
        </div>

        {/* Content */}
        <div style={{ display: "flex", flex: 1, flexDirection: "column", gap: "1rem", padding: "1.25rem 1.25rem 1.25rem" }}>
          {/* Vehicle name */}
          <div>
            <h3
              style={{
                fontSize: "1.0625rem",
                fontWeight: 700,
                letterSpacing: "-0.015em",
                color: "var(--text)",
                marginBottom: "0.125rem",
              }}
            >
              {vehicle.make} {vehicle.model}
            </h3>
            {vehicle.version && (
              <p style={{ fontSize: "0.8125rem", color: "var(--text-faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {vehicle.version}
              </p>
            )}
          </div>

          {/* Tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
            <Tag icon={<Calendar size={11} />} label={String(vehicle.year)} />
            <Tag icon={<Gauge size={11} />} label={formatMileage(vehicle.mileage)} />
            <Tag icon={<Fuel size={11} />} label={fuelTypeLabels[vehicle.fuelType]} accent="blue" />
            <Tag icon={<Settings size={11} />} label={transmissionLabels[vehicle.transmission]} accent="indigo" />
          </div>

          {/* Métriques */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            {displayMode === "arbitrage" ? (
              <>
                <MetricBox
                  label="Décote nette"
                  value={discounted ? formatCurrency(discountAmount) : "À la cote"}
                  tone={discounted ? "positive" : "muted"}
                />
                <MetricBox
                  label="Écart marché"
                  value={formatPercent(position.differencePercent)}
                  tone={discounted ? "positive" : "muted"}
                />
              </>
            ) : (
              <>
                <MetricBox label="Réparations" value={formatCurrency(repairCost)} tone="warning" />
                <MetricBox
                  label="Marge estimée"
                  value={formatSignedCurrency(analysis.profitRealistic)}
                  tone={positiveProfit ? "positive" : "negative"}
                />
              </>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: "auto",
              paddingTop: "0.875rem",
              borderTop: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.75rem",
            }}
          >
            <p
              style={{
                fontSize: "1.5rem",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                fontVariantNumeric: "tabular-nums",
                color: "var(--text)",
              }}
            >
              {formatCurrency(listing.price)}
            </p>
            <RiskBadge level={analysis.riskLevel} />
          </div>
        </div>
      </Link>
    </article>
  );
}

/* ── Sub-components ──────────────────────────────────────────── */

function Tag({ icon, label, accent }: { icon: React.ReactNode; label: string; accent?: "blue" | "indigo" }) {
  const bg = accent === "blue"
    ? "rgba(37,99,235,0.06)"
    : accent === "indigo"
      ? "rgba(99,102,241,0.06)"
      : "var(--surface-raised)";
  const color = accent === "blue"
    ? "#1D4ED8"
    : accent === "indigo"
      ? "#4338CA"
      : "var(--text-muted)";
  const border = accent === "blue"
    ? "rgba(37,99,235,0.18)"
    : accent === "indigo"
      ? "rgba(99,102,241,0.18)"
      : "var(--border)";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
        padding: "0.25rem 0.625rem",
        borderRadius: "var(--radius-full)",
        background: bg,
        border: `1px solid ${border}`,
        fontSize: "0.6875rem",
        fontWeight: 500,
        color,
      }}
    >
      {icon}
      {label}
    </span>
  );
}

function MetricBox({ label, value, tone }: { label: string; value: string; tone: "positive" | "negative" | "warning" | "muted" }) {
  const valueColor =
    tone === "positive" ? "var(--green)"
    : tone === "negative" ? "var(--red)"
    : tone === "warning" ? "var(--amber)"
    : "var(--text)";

  const bg =
    tone === "positive" ? "rgba(5,150,105,0.04)"
    : tone === "negative" ? "rgba(220,38,38,0.04)"
    : tone === "warning" ? "rgba(217,119,6,0.04)"
    : "var(--surface-raised)";

  return (
    <div
      style={{
        borderRadius: "10px",
        padding: "0.625rem 0.75rem",
        background: bg,
        border: "1px solid var(--border)",
      }}
    >
      <p style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: "0.25rem" }}>
        {label}
      </p>
      <p
        style={{
          fontSize: "0.9375rem",
          fontWeight: 700,
          letterSpacing: "-0.01em",
          fontVariantNumeric: "tabular-nums",
          color: valueColor,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </p>
    </div>
  );
}
