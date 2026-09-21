"use client";

import { investmentModeDescriptions, investmentModeLabels } from "@/lib/labels";
import type { InvestmentMode } from "@/types";
import { ArrowLeftRight, Wrench } from "lucide-react";

interface StrategyToggleProps {
  mode: InvestmentMode;
  counts: Record<InvestmentMode, number>;
  onChange: (mode: InvestmentMode) => void;
}

const ICONS: Record<InvestmentMode, React.ReactNode> = {
  arbitrage: <ArrowLeftRight size={15} strokeWidth={2} />,
  reparations: <Wrench size={15} strokeWidth={2} />,
};

export default function StrategyToggle({ mode, counts, onChange }: StrategyToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="Stratégie d'investissement"
      style={{
        display: "flex",
        gap: "0.5rem",
        background: "var(--surface-raised)",
        border: "1px solid var(--border)",
        borderRadius: "14px",
        padding: "0.375rem",
        maxWidth: "600px",
      }}
    >
      {(["arbitrage", "reparations"] as const).map((value) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(value)}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              padding: "0.75rem 1.125rem",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              transition: "all 0.25s ease",
              textAlign: "left",
              background: active
                ? "var(--navy-900)"
                : "transparent",
              boxShadow: active
                ? "0 4px 16px rgba(6,11,24,0.25)"
                : "none",
            }}
          >
            <span
              style={{
                color: active ? "rgba(255,255,255,0.7)" : "var(--text-faint)",
                flexShrink: 0,
                transition: "color 0.2s",
              }}
            >
              {ICONS[value]}
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.1rem" }}>
                <span
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: active ? "white" : "var(--text-muted)",
                    transition: "color 0.2s",
                  }}
                >
                  {investmentModeLabels[value]}
                </span>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    fontVariantNumeric: "tabular-nums",
                    padding: "0.1rem 0.5rem",
                    borderRadius: "var(--radius-full)",
                    background: active ? "rgba(255,255,255,0.12)" : "var(--electric-soft)",
                    color: active ? "rgba(255,255,255,0.8)" : "var(--electric)",
                    transition: "all 0.2s",
                  }}
                >
                  {counts[value]}
                </span>
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  color: active ? "rgba(255,255,255,0.4)" : "var(--text-faint)",
                  lineHeight: 1.4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  transition: "color 0.2s",
                }}
              >
                {investmentModeDescriptions[value]}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
