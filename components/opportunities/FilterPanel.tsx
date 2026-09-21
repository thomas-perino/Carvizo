"use client";

import type { ReactNode } from "react";
import { listModelsForMake } from "@/lib/data/filters";
import { formatCurrency, formatMileage } from "@/lib/format";
import {
  fuelTypeLabels,
  repairIssueLabels,
  riskLevelLabels,
  sortLabels,
  transmissionLabels,
} from "@/lib/labels";
import type {
  FuelType,
  InvestmentMode,
  Opportunity,
  OpportunityFilters,
  OpportunitySort,
  RepairIssueFilter,
  RiskLevel,
  Transmission,
} from "@/types";
import { RotateCcw } from "lucide-react";

export interface FilterBounds {
  minYear: number;
  maxYear: number;
  maxMileage: number;
  maxPrice: number;
  maxProfit: number;
}

interface FilterPanelProps {
  filters: OpportunityFilters;
  sort: OpportunitySort;
  bounds: FilterBounds;
  opportunities: Opportunity[];
  makes: string[];
  locations: string[];
  mode: InvestmentMode;
  onFiltersChange: (filters: OpportunityFilters) => void;
  onSortChange: (sort: OpportunitySort) => void;
  onReset: () => void;
}

const REPAIR_ISSUES: RepairIssueFilter[] = ["moteur", "carrosserie", "interieur"];

export default function FilterPanel({
  filters,
  sort,
  bounds,
  opportunities,
  makes,
  locations,
  mode,
  onFiltersChange,
  onSortChange,
  onReset,
}: FilterPanelProps) {
  const models = filters.make ? listModelsForMake(opportunities, filters.make) : [];
  const patch = (partial: Partial<OpportunityFilters>) =>
    onFiltersChange({ ...filters, ...partial });

  const inputStyle = {
    width: "100%",
    padding: "0.625rem 0.875rem",
    borderRadius: "10px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    fontSize: "0.875rem",
    color: "var(--text)",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  return (
    <div
      style={{
        background: "var(--surface)",
        borderRadius: "16px",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Basiques */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <BlockTitle title="Véhicule" />
          
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.375rem" }}>
              Recherche
            </label>
            <input
              type="text"
              value={filters.search ?? ""}
              onChange={(e) => patch({ search: e.target.value || undefined })}
              placeholder="Ex. 208, Golf..."
              style={inputStyle}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.375rem" }}>
                Marque
              </label>
              <select
                value={filters.make ?? ""}
                onChange={(e) => patch({ make: e.target.value || undefined, model: undefined })}
                style={inputStyle}
              >
                <option value="">Toutes</option>
                {makes.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.375rem" }}>
                Modèle
              </label>
              <select
                value={filters.model ?? ""}
                onChange={(e) => patch({ model: e.target.value || undefined })}
                disabled={!filters.make}
                style={{ ...inputStyle, opacity: !filters.make ? 0.6 : 1 }}
              >
                <option value="">{filters.make ? "Tous" : "—"}</option>
                {models.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <SliderField
            label="Budget max."
            min={0} max={bounds.maxPrice} step={500}
            value={filters.maxPrice ?? bounds.maxPrice}
            format={formatCurrency}
            onChange={(v) => patch({ maxPrice: v >= bounds.maxPrice ? undefined : v })}
          />
          <SliderField
            label="Kilométrage max."
            min={0} max={bounds.maxMileage} step={5000}
            value={filters.maxMileage ?? bounds.maxMileage}
            format={formatMileage}
            onChange={(v) => patch({ maxMileage: v >= bounds.maxMileage ? undefined : v })}
          />
        </div>

        {/* Investisseur */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <BlockTitle title="Investissement" />
          
          <SliderField
            label="Deal Score minimum"
            min={0} max={100}
            value={filters.minDealScore ?? 0}
            format={(v) => `${v}/100`}
            onChange={(v) => patch({ minDealScore: v <= 0 ? undefined : v })}
          />
          <SliderField
            label="Bénéfice attendu"
            min={0} max={Math.max(bounds.maxProfit, 0)} step={100}
            value={filters.minProfit ?? 0}
            format={(v) => (v > 0 ? `≥ ${formatCurrency(v)}` : "Tous")}
            onChange={(v) => patch({ minProfit: v <= 0 ? undefined : v })}
          />
        </div>

        {/* Réparations */}
        {mode === "reparations" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <BlockTitle title="Dommages acceptés" />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {REPAIR_ISSUES.map((issue) => {
                const checked = filters.repairIssues?.includes(issue) ?? false;
                return (
                  <label
                    key={issue}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.75rem",
                      borderRadius: "10px",
                      border: checked ? "1px solid var(--electric)" : "1px solid var(--border)",
                      background: checked ? "var(--electric-soft)" : "var(--surface)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const current = filters.repairIssues ?? [];
                        const next = checked ? current.filter(i => i !== issue) : [...current, issue];
                        patch({ repairIssues: next.length > 0 ? next : undefined });
                      }}
                      style={{ accentColor: "var(--electric)", width: "16px", height: "16px" }}
                    />
                    <span style={{ fontSize: "0.875rem", fontWeight: checked ? 600 : 500, color: checked ? "var(--electric-strong)" : "var(--text)" }}>
                      {repairIssueLabels[issue]}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Tris */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.375rem" }}>
                Trier par
              </label>
              <select
                value={sort.key}
                onChange={(e) => onSortChange({ ...sort, key: e.target.value as OpportunitySort["key"] })}
                style={inputStyle}
              >
                {Object.entries(sortLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.375rem" }}>
                Ordre
              </label>
              <select
                value={sort.direction}
                onChange={(e) => onSortChange({ ...sort, direction: e.target.value as "asc" | "desc" })}
                style={inputStyle}
              >
                <option value="desc">Décroissant</option>
                <option value="asc">Croissant</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "1rem 1.5rem", background: "var(--surface-raised)", borderTop: "1px solid var(--border)" }}>
        <button
          onClick={onReset}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            padding: "0.75rem",
            borderRadius: "10px",
            background: "white",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--surface-raised)";
            (e.currentTarget as HTMLElement).style.color = "var(--text)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "white";
            (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
          }}
        >
          <RotateCcw size={16} />
          Réinitialiser les filtres
        </button>
      </div>
    </div>
  );
}

function BlockTitle({ title }: { title: string }) {
  return (
    <h3 style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-faint)" }}>
      {title}
    </h3>
  );
}

function SliderField({
  label, min, max, step = 1, value, format, onChange,
}: {
  label: string; min: number; max: number; step?: number;
  value: number; format: (v: number) => string; onChange: (v: number) => void;
}) {
  const safeMax = Math.max(min, max);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
        <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>{label}</label>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--electric)", fontVariantNumeric: "tabular-nums" }}>
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={safeMax}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: "100%",
          height: "6px",
          borderRadius: "3px",
          background: "var(--border)",
          appearance: "none",
          outline: "none",
          cursor: "pointer",
        }}
      />
    </div>
  );
}
