import type { RiskLevel } from "@/types";

const STYLES: Record<RiskLevel, { bg: string; color: string; border: string; dot: string }> = {
  faible: {
    bg: "rgba(5,150,105,0.07)",
    color: "var(--green-strong)",
    border: "rgba(5,150,105,0.22)",
    dot: "var(--green)",
  },
  moyen: {
    bg: "rgba(217,119,6,0.07)",
    color: "var(--amber-strong)",
    border: "rgba(217,119,6,0.22)",
    dot: "var(--amber)",
  },
  eleve: {
    bg: "rgba(220,38,38,0.07)",
    color: "var(--red-strong)",
    border: "rgba(220,38,38,0.22)",
    dot: "var(--red)",
  },
};

const LABELS: Record<RiskLevel, string> = {
  faible: "Risque faible",
  moyen: "Risque modéré",
  eleve: "Risque élevé",
};

export default function RiskBadge({ level }: { level: RiskLevel }) {
  const s = STYLES[level];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.375rem",
        padding: "0.3rem 0.75rem",
        borderRadius: "var(--radius-full)",
        background: s.bg,
        border: `1px solid ${s.border}`,
        fontSize: "0.75rem",
        fontWeight: 600,
        color: s.color,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          background: s.dot,
          flexShrink: 0,
        }}
      />
      {LABELS[level]}
    </span>
  );
}
