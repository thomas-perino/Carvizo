"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FilterPanel, { type FilterBounds } from "./FilterPanel";
import OpportunityGrid from "./OpportunityGrid";
import StrategyToggle from "./StrategyToggle";
import { applyOpportunityFilters, applyOpportunitySort } from "@/lib/data/filters";
import { getOpportunityInvestmentMode } from "@/lib/data/investment-mode";
import { serializeOpportunityQuery } from "@/lib/data/opportunity-query";
import type { InvestmentMode, Opportunity, OpportunityFilters, OpportunitySort } from "@/types";
import { BarChart2, SlidersHorizontal, TrendingUp } from "lucide-react";

interface OpportunitiesExplorerProps {
  opportunities: Opportunity[];
  initialFilters: OpportunityFilters;
  initialSort: OpportunitySort;
}

export default function OpportunitiesExplorer({
  opportunities,
  initialFilters,
  initialSort,
}: OpportunitiesExplorerProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<OpportunityFilters>({
    ...initialFilters,
    mode: initialFilters.mode ?? "arbitrage",
  });
  const [sort, setSort] = useState<OpportunitySort>(initialSort);

  const mode: InvestmentMode = filters.mode ?? "arbitrage";

  const bounds = useMemo(() => computeBounds(opportunities), [opportunities]);
  const makes = useMemo(
    () => Array.from(new Set(opportunities.map((o) => o.vehicle.make))).sort(),
    [opportunities]
  );
  const locations = useMemo(
    () => Array.from(new Set(opportunities.map((o) => o.vehicle.location))).sort(),
    [opportunities]
  );

  const counts = useMemo(() => {
    const withoutMode = applyOpportunityFilters(opportunities, { ...filters, mode: undefined });
    return {
      arbitrage: withoutMode.filter((item) => getOpportunityInvestmentMode(item) === "arbitrage").length,
      reparations: withoutMode.filter((item) => getOpportunityInvestmentMode(item) === "reparations").length,
    };
  }, [opportunities, filters]);

  const visible = useMemo(
    () => applyOpportunitySort(applyOpportunityFilters(opportunities, filters), sort),
    [opportunities, filters, sort]
  );

  const avgScore = visible.length
    ? Math.round(visible.reduce((s, o) => s + o.analysis.dealScore, 0) / visible.length)
    : 0;
  const bestProfit = visible.length
    ? Math.max(...visible.map((o) => o.analysis.profitRealistic))
    : 0;

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const query = serializeOpportunityQuery(filters, sort);
      const next = query ? `/opportunites?${query}` : "/opportunites";
      router.replace(next, { scroll: false });
    }, 250);
    return () => window.clearTimeout(handle);
  }, [filters, sort, router]);

  const handleModeChange = (nextMode: InvestmentMode) => {
    setFilters((current) => ({
      ...current,
      mode: nextMode,
      repairIssues: nextMode === "arbitrage" ? undefined : current.repairIssues,
    }));
  };

  const handleReset = () => {
    setFilters({ mode });
    setSort({ key: "deal_score", direction: "desc" });
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Background subtil */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(37,99,235,0.035) 0%, transparent 60%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Page header */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          borderBottom: "1px solid var(--border)",
          background: "rgba(11,18,38,0.8)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "2.5rem 1.5rem 2rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "2rem", flexWrap: "wrap" }}>
            <div>
              <p
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--electric)",
                  marginBottom: "0.5rem",
                }}
              >
                Marché secondaire
              </p>
              <h1
                style={{
                  fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: "var(--text)",
                  marginBottom: "0.375rem",
                }}
              >
                Opportunités
              </h1>
              <p style={{ fontSize: "0.9375rem", color: "var(--text-muted)" }}>
                <strong style={{ color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>{visible.length}</strong>{" "}
                annonce{visible.length > 1 ? "s" : ""} — stratégie{" "}
                <span style={{ color: "var(--electric)", fontWeight: 600 }}>
                  {mode === "arbitrage" ? "arbitrage immédiat" : "projets de réparation"}
                </span>
              </p>
            </div>

            {/* Quick stats */}
            <div style={{ display: "flex", gap: "1px", background: "var(--border)", borderRadius: "14px", overflow: "hidden", border: "1px solid var(--border)" }}>
              {[
                { icon: <BarChart2 size={14} />, label: "Deal Score moyen", value: `${avgScore}/100`, color: "var(--electric)" },
                { icon: <TrendingUp size={14} />, label: "Meilleur profit", value: `+${(bestProfit / 1000).toFixed(1)}k€`, color: "var(--green)" },
              ].map(({ icon, label, value, color }) => (
                <div
                  key={label}
                  style={{
                    padding: "0.875rem 1.25rem",
                    background: "var(--surface)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                  }}
                >
                  <span style={{ color }}>{icon}</span>
                  <div>
                    <p style={{ fontSize: "0.625rem", color: "var(--text-faint)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.125rem" }}>
                      {label}
                    </p>
                    <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <StrategyToggle mode={mode} counts={counts} onChange={handleModeChange} />
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "2rem 1.5rem 4rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "280px 1fr",
            gap: "1.75rem",
            alignItems: "start",
          }}
          className="explorer-grid"
        >
          {/* Sidebar filtres */}
          <aside style={{ position: "sticky", top: "84px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
                padding: "0 0.125rem",
              }}
            >
              <SlidersHorizontal size={14} color="var(--text-faint)" />
              <span style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-faint)" }}>
                Filtres
              </span>
            </div>
            <FilterPanel
              filters={filters}
              sort={sort}
              bounds={bounds}
              opportunities={opportunities}
              makes={makes}
              locations={locations}
              mode={mode}
              onFiltersChange={setFilters}
              onSortChange={setSort}
              onReset={handleReset}
            />
          </aside>

          {/* Grille résultats */}
          <div>
            <OpportunityGrid opportunities={visible} mode={mode} />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .explorer-grid { grid-template-columns: 1fr !important; }
          aside { position: static !important; }
        }
      `}</style>
    </div>
  );
}

function computeBounds(opportunities: Opportunity[]): FilterBounds {
  if (opportunities.length === 0) {
    return { minYear: 2000, maxYear: 2026, maxMileage: 200000, maxPrice: 50000, maxProfit: 5000 };
  }
  return {
    minYear: Math.min(...opportunities.map((o) => o.vehicle.year)),
    maxYear: Math.max(...opportunities.map((o) => o.vehicle.year)),
    maxMileage: Math.max(...opportunities.map((o) => o.vehicle.mileage)),
    maxPrice: Math.max(...opportunities.map((o) => o.listing.price)),
    maxProfit: Math.max(0, ...opportunities.map((o) => o.analysis.profitRealistic)),
  };
}
