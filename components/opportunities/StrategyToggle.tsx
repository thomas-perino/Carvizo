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
  arbitrage: <ArrowLeftRight className="w-4 h-4 shrink-0" strokeWidth={2} />,
  reparations: <Wrench className="w-4 h-4 shrink-0" strokeWidth={2} />,
};

export default function StrategyToggle({ mode, counts, onChange }: StrategyToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="Stratégie d'investissement"
      className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-1.5 w-full max-w-2xl rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-lg"
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
            className={`
              relative flex items-start sm:items-center gap-3 p-3.5 sm:px-4 rounded-xl text-left
              transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-500
              ${
                active
                  ? "bg-white/10 border border-white/15 text-white shadow-md backdrop-blur-sm"
                  : "bg-transparent border border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }
            `}
          >
            <div
              className={`p-2 rounded-lg shrink-0 transition-colors ${
                active ? "bg-blue-600/30 text-blue-400 border border-blue-500/30" : "bg-white/5 text-slate-400"
              }`}
            >
              {ICONS[value]}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span
                  className={`text-sm font-semibold truncate ${
                    active ? "text-white" : "text-slate-300"
                  }`}
                >
                  {investmentModeLabels[value]}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 tabular-nums transition-colors ${
                    active
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      : "bg-white/10 text-slate-400"
                  }`}
                >
                  {counts[value]}
                </span>
              </div>
              <p
                className={`text-xs truncate ${
                  active ? "text-slate-300/80" : "text-slate-400/70"
                }`}
                title={investmentModeDescriptions[value]}
              >
                {investmentModeDescriptions[value]}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
