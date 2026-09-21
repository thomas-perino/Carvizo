function scoreConfig(score: number): { color: string; bg: string; border: string; label: string; trackColor: string } {
  if (score >= 70) {
    return {
      color: "var(--green)",
      bg: "rgba(5,150,105,0.08)",
      border: "rgba(5,150,105,0.2)",
      label: "Excellente",
      trackColor: "rgba(5,150,105,0.15)",
    };
  }
  if (score >= 45) {
    return {
      color: "var(--amber)",
      bg: "rgba(217,119,6,0.08)",
      border: "rgba(217,119,6,0.2)",
      label: "Correcte",
      trackColor: "rgba(217,119,6,0.15)",
    };
  }
  return {
    color: "var(--red)",
    bg: "rgba(220,38,38,0.08)",
    border: "rgba(220,38,38,0.2)",
    label: "Risquée",
    trackColor: "rgba(220,38,38,0.15)",
  };
}

interface DealScoreProps {
  score: number;
  size?: "sm" | "lg";
}

/** Deal Score — version sm (badge compact sur card) ou lg (scorecard analytique) */
export default function DealScore({ score, size = "lg" }: DealScoreProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const config = scoreConfig(clamped);

  if (size === "sm") {
    return (
      <div
        role="img"
        aria-label={`Deal Score ${clamped} sur 100`}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          background: config.bg,
          border: `1px solid ${config.border}`,
        }}
      >
        <span
          style={{
            fontSize: "1rem",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: config.color,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {clamped}
        </span>
        <span
          style={{
            fontSize: "0.4375rem",
            fontWeight: 600,
            color: config.color,
            opacity: 0.7,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            marginTop: "0.125rem",
          }}
        >
          /100
        </span>
      </div>
    );
  }

  // Size "lg" — version scorecard complète
  const circumference = 2 * Math.PI * 36;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div
      role="img"
      aria-label={`Deal Score ${clamped} sur 100 — opportunité ${config.label}`}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      {/* Arc SVG */}
      <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="88" height="88" style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx="44" cy="44" r="36"
            fill="none"
            stroke={config.trackColor}
            strokeWidth="7"
          />
          <circle
            cx="44" cy="44" r="36"
            fill="none"
            stroke={config.color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}
        >
          <span
            style={{
              fontSize: "1.625rem",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: config.color,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {clamped}
          </span>
          <span style={{ fontSize: "0.5rem", fontWeight: 600, color: "var(--text-faint)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "0.1rem" }}>
            /100
          </span>
        </div>
      </div>
      <span
        style={{
          fontSize: "0.75rem",
          fontWeight: 600,
          color: config.color,
          background: config.bg,
          border: `1px solid ${config.border}`,
          borderRadius: "var(--radius-full)",
          padding: "0.2rem 0.625rem",
        }}
      >
        {config.label}
      </span>
    </div>
  );
}
