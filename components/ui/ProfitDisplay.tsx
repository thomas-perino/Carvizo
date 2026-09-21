import { formatPercent, formatSignedCurrency } from "@/lib/format";

interface ProfitDisplayProps {
  profit: number;
  roi?: number;
  label?: string;
  size?: "sm" | "lg";
}

export default function ProfitDisplay({ profit, roi, label, size = "lg" }: ProfitDisplayProps) {
  const positive = profit >= 0;
  const color = positive ? "var(--color-opportunity)" : "var(--color-risk)";

  return (
    <div>
      {label && <p className="text-xs font-medium text-[var(--color-text-muted)]">{label}</p>}
      <p
        className={`tabular font-bold ${size === "lg" ? "text-2xl" : "text-lg"}`}
        style={{ color }}
      >
        {formatSignedCurrency(profit)}
      </p>
      {roi !== undefined && (
        <p className="tabular text-sm font-medium" style={{ color }}>
          ROI {formatPercent(roi)}
        </p>
      )}
    </div>
  );
}
