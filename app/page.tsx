import Link from "next/link";
import OpportunityGrid from "@/components/opportunities/OpportunityGrid";
import { DEAL_SCORE_WEIGHTS } from "@/lib/calculations/deal-score";
import { listOpportunities } from "@/lib/data/get-opportunities";
import {
  TrendingUp, BarChart2, Shield, Zap, ChevronRight,
  Target, Database, Star
} from "lucide-react";

export default async function HomePage() {
  const opportunities = await listOpportunities({}, { key: "deal_score", direction: "desc" });
  const topOpportunities = opportunities.slice(0, 3);

  // Statistiques dynamiques
  const avgScore = opportunities.length
    ? Math.round(opportunities.reduce((s, o) => s + o.analysis.dealScore, 0) / opportunities.length)
    : 0;
  const avgProfit = opportunities.length
    ? Math.round(opportunities.reduce((s, o) => s + o.analysis.profitRealistic, 0) / opportunities.length)
    : 0;

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          background: "var(--navy-950)",
          overflow: "hidden",
          minHeight: "calc(100vh - 68px)",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Background technique (global grid now handles this, but we keep halos if needed) */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "-20%",
            left: "-10%",
            width: "70%",
            height: "70%",
            background: "radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 60%)",
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />
        {/* Halos lumineux */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "20%",
            left: "30%",
            width: "600px",
            height: "500px",
            background: "radial-gradient(ellipse at center, rgba(37,99,235,0.12) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: "10%",
            right: "10%",
            width: "400px",
            height: "400px",
            background: "radial-gradient(ellipse at center, rgba(99,102,241,0.07) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "5rem 1.5rem 4rem",
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4rem",
            alignItems: "center",
          }}
          className="hero-grid"
        >
          {/* Texte */}
          <div style={{ animation: "fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) both 0.1s" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.375rem 0.875rem",
                borderRadius: "var(--radius-full)",
                background: "rgba(37,99,235,0.15)",
                border: "1px solid rgba(37,99,235,0.25)",
                marginBottom: "1.5rem",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#60A5FA",
                  animation: "pulse-soft 2s ease-in-out infinite",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#93C5FD",
                }}
              >
                Données de démonstration
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(2.25rem, 4vw, 3.75rem)",
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                color: "white",
                marginBottom: "1.25rem",
              }}
            >
              Repérez les meilleures{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #60A5FA, #818CF8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                opportunités
              </span>{" "}
              d&apos;achat-revente automobile.
            </h1>

            <p
              style={{
                fontSize: "1.0625rem",
                color: "rgba(255,255,255,0.5)",
                lineHeight: 1.7,
                maxWidth: "480px",
                marginBottom: "2.5rem",
              }}
            >
              Carvizo analyse chaque annonce de véhicule d&apos;occasion et calcule un{" "}
              <strong style={{ color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>Deal Score</strong>{" "}
              sur 100 : décote marché, coûts de remise en état, bénéfice potentiel et risque — en un coup d&apos;œil.
            </p>

            <div style={{ display: "flex", gap: "0.875rem", flexWrap: "wrap", marginBottom: "3rem" }}>
              <Link href="/opportunites" className="btn-primary">
                Voir les opportunités
                <ChevronRight size={16} strokeWidth={2.5} />
              </Link>
              <a href="#comment-ca-marche" className="btn-outline">
                Comment ça marche&nbsp;?
              </a>
            </div>

            {/* Stats bar */}
            <div
              style={{
                display: "flex",
                gap: "1.5rem",
                paddingTop: "1.75rem",
                borderTop: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {[
                { value: String(opportunities.length), label: "Opportunités analysées", icon: <Target size={14} /> },
                { value: `${avgScore}/100`, label: "Deal Score moyen", icon: <Star size={14} /> },
                { value: `+${(avgProfit / 1000).toFixed(1)}k€`, label: "Bénéfice moyen réaliste", icon: <TrendingUp size={14} /> },
              ].map(({ value, label, icon }) => (
                <div key={label}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      color: "#60A5FA",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {icon}
                    <span
                      style={{
                        fontSize: "1.375rem",
                        fontWeight: 700,
                        letterSpacing: "-0.02em",
                        fontVariantNumeric: "tabular-nums",
                        color: "white",
                      }}
                    >
                      {value}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Panneau décoratif — aperçu d'une card d'opportunité */}
          <div
            style={{
              position: "relative",
              animation: "fadeUp 0.9s cubic-bezier(0.22,1,0.36,1) both 0.3s",
            }}
            className="hero-panel"
          >
            {/* Card principale */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(17,27,58,0.95) 0%, rgba(11,18,38,0.98) 100%)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "20px",
                padding: "1.5rem",
                boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(37,99,235,0.12)",
                backdropFilter: "blur(20px)",
              }}
            >
              {/* Header card */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #1C2B52, #243566)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <BarChart2 size={18} color="#60A5FA" />
                  </div>
                  <div>
                    <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "white" }}>BMW Série 3</p>
                    <p style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.4)" }}>320d xDrive · 2020 · 87k km</p>
                  </div>
                </div>
                {/* Deal Score badge */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    background: "rgba(5,150,105,0.15)",
                    border: "1px solid rgba(5,150,105,0.3)",
                    borderRadius: "12px",
                    padding: "0.5rem 0.75rem",
                  }}
                >
                  <span style={{ fontSize: "1.375rem", fontWeight: 800, color: "#34D399", letterSpacing: "-0.03em" }}>
                    82
                  </span>
                  <span style={{ fontSize: "0.5625rem", fontWeight: 600, color: "rgba(52,211,153,0.7)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    Deal Score
                  </span>
                </div>
              </div>

              {/* Metrics grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem", marginBottom: "1rem" }}>
                {[
                  { label: "Prix affiché", value: "14 900 €", color: "white" },
                  { label: "Valeur marché", value: "17 200 €", color: "white" },
                  { label: "Bénéfice estimé", value: "+2 340 €", color: "#34D399" },
                  { label: "ROI", value: "+15.7%", color: "#34D399" },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      borderRadius: "10px",
                      padding: "0.625rem 0.75rem",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <p style={{ fontSize: "0.625rem", color: "rgba(255,255,255,0.35)", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {label}
                    </p>
                    <p style={{ fontSize: "0.9375rem", fontWeight: 700, color, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Décote bar */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.375rem" }}>
                  <span style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.4)" }}>Décote marché</span>
                  <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#34D399" }}>−13.6%</span>
                </div>
                <div style={{ height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ width: "13.6%", height: "100%", background: "linear-gradient(90deg, #059669, #34D399)", borderRadius: "2px" }} />
                </div>
              </div>

              {/* Risk badge */}
              <div style={{ marginTop: "0.875rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    color: "#34D399",
                    background: "rgba(5,150,105,0.12)",
                    border: "1px solid rgba(5,150,105,0.25)",
                    borderRadius: "var(--radius-full)",
                    padding: "0.25rem 0.625rem",
                  }}
                >
                  Risque faible
                </span>
                <span style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.3)" }}>
                  Annonce de démonstration
                </span>
              </div>
            </div>

            {/* Floating mini-card */}
            <div
              style={{
                position: "absolute",
                bottom: "-1.5rem",
                left: "-1.5rem",
                background: "rgba(17,27,58,0.95)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "14px",
                padding: "0.875rem 1rem",
                boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
                backdropFilter: "blur(12px)",
                maxWidth: "200px",
                animation: "float 4s ease-in-out infinite",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
                <Shield size={12} color="#34D399" />
                <span style={{ fontSize: "0.625rem", fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Market Value Engine
                </span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
                Estimation basée sur{" "}
                <span style={{ color: "white", fontWeight: 600 }}>12 comparables</span>
              </p>
            </div>

            {/* Floating score chip */}
            <div
              style={{
                position: "absolute",
                top: "-1rem",
                right: "-1rem",
                background: "linear-gradient(135deg, #2563EB, #4338CA)",
                borderRadius: "12px",
                padding: "0.625rem 0.875rem",
                boxShadow: "0 8px 24px rgba(37,99,235,0.4)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Zap size={13} color="rgba(255,255,255,0.9)" fill="rgba(255,255,255,0.3)" />
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "white" }}>
                Analyse instantanée
              </span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: "2rem",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
            animation: "fadeIn 1s ease both 1.2s",
          }}
        >
          <div
            style={{
              width: "1px",
              height: "40px",
              background: "linear-gradient(to bottom, rgba(255,255,255,0.25), transparent)",
              animation: "pulse-soft 2.5s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontSize: "0.5625rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.2)",
            }}
          >
            Défiler
          </span>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .hero-grid { grid-template-columns: 1fr !important; gap: 3rem !important; }
            .hero-panel { display: none !important; }
          }
        `}</style>
      </section>

      {/* ── OPPORTUNITÉS DU MOMENT ────────────────────────────────── */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "5rem 1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "2.5rem",
            gap: "1rem",
          }}
        >
          <div>
            <p className="text-eyebrow" style={{ marginBottom: "0.5rem" }}>
              Sélection automatique
            </p>
            <h2
              style={{
                fontSize: "1.875rem",
                fontWeight: 700,
                letterSpacing: "-0.025em",
                color: "var(--text)",
              }}
            >
              Opportunités du moment
            </h2>
            <p style={{ marginTop: "0.375rem", fontSize: "0.9375rem", color: "var(--text-muted)" }}>
              Classées par Deal Score décroissant — données de démonstration.
            </p>
          </div>
          <Link
            href="/opportunites"
            className="btn-outline-light"
          >
            Toutes les opportunités
            <ChevronRight size={16} />
          </Link>
        </div>

        <OpportunityGrid opportunities={topOpportunities} />
      </section>

      {/* ── COMMENT ÇA MARCHE ─────────────────────────────────────── */}
      <section
        id="comment-ca-marche"
        style={{
          background: "var(--navy-950)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grille dark */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "300px",
            background: "radial-gradient(ellipse at center top, rgba(37,99,235,0.1) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "5rem 1.5rem",
            position: "relative",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <p
              style={{
                fontSize: "0.6875rem",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#60A5FA",
                marginBottom: "0.75rem",
              }}
            >
              Méthodologie
            </p>
            <h2
              style={{
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                fontWeight: 700,
                letterSpacing: "-0.025em",
                color: "white",
              }}
            >
              Comment ça marche&nbsp;?
            </h2>
            <p style={{ marginTop: "0.75rem", color: "rgba(255,255,255,0.45)", maxWidth: "520px", margin: "0.75rem auto 0", lineHeight: 1.7 }}>
              Un moteur de calcul déterministe — pas d&apos;IA générative. Chaque point du score est traçable.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1px",
              background: "rgba(255,255,255,0.06)",
              borderRadius: "16px",
              overflow: "hidden",
            }}
            className="steps-grid"
          >
            {[
              {
                num: "01",
                icon: <Database size={22} color="#60A5FA" />,
                title: "Collecte des annonces",
                text: "Chaque annonce (marque, modèle, prix, description, photos) est normalisée dans un format commun, quelle que soit sa source d\u2019origine.",
                accent: "#60A5FA",
              },
              {
                num: "02",
                icon: <BarChart2 size={22} color="#818CF8" />,
                title: "Moteur de calcul",
                text: "Un moteur déterministe estime la valeur de marché, les coûts (carte grise, transport, réparations, préparation, imprévus) et le bénéfice potentiel sur trois scénarios.",
                accent: "#818CF8",
              },
              {
                num: "03",
                icon: <Star size={22} color="#34D399" />,
                title: "Deal Score",
                text: "Ces éléments sont combinés en un score explicable sur 100, avec les points forts et les points de vigilance de chaque annonce.",
                accent: "#34D399",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="hover:bg-[var(--navy-800)]"
                style={{
                  background: "var(--navy-900)",
                  padding: "2.5rem",
                  position: "relative",
                  overflow: "hidden",
                  transition: "background 0.3s",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0,
                    height: "2px",
                    background: `linear-gradient(90deg, transparent, ${step.accent}, transparent)`,
                    opacity: 0.6,
                  }}
                />
                <span
                  style={{
                    display: "block",
                    fontSize: "3rem",
                    fontWeight: 800,
                    color: "rgba(255,255,255,0.04)",
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                    marginBottom: "1.25rem",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {step.num}
                </span>
                <div style={{ marginBottom: "1rem" }}>{step.icon}</div>
                <p style={{ fontSize: "1rem", fontWeight: 600, color: "white", marginBottom: "0.625rem" }}>
                  {step.title}
                </p>
                <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>
                  {step.text}
                </p>
              </div>
            ))}
          </div>

          <style>{`
            @media (max-width: 720px) {
              .steps-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </div>
      </section>

      {/* ── DEAL SCORE ────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "5rem 1.5rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4rem",
            alignItems: "center",
          }}
          className="ds-grid"
        >
          <div>
            <p className="text-eyebrow" style={{ marginBottom: "0.75rem" }}>
              Scoring analytique
            </p>
            <h2
              style={{
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                fontWeight: 700,
                letterSpacing: "-0.025em",
                color: "var(--text)",
                marginBottom: "1rem",
              }}
            >
              Le Deal Score, expliqué
            </h2>
            <p
              style={{
                fontSize: "0.9375rem",
                color: "var(--text-muted)",
                lineHeight: 1.7,
                marginBottom: "2rem",
              }}
            >
              Le Deal Score combine cinq critères pondérés. Il n&apos;est jamais généré arbitrairement :
              chaque point du score peut être retracé jusqu&apos;à un calcul précis et transparent.
            </p>
            <Link href="/opportunites" className="btn-primary">
              Explorer les opportunités
              <ChevronRight size={16} />
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[
              { label: "Bénéfice potentiel", weight: DEAL_SCORE_WEIGHTS.profit, color: "var(--green)" },
              { label: "Décote marché", weight: DEAL_SCORE_WEIGHTS.marketDiscount, color: "var(--electric)" },
              { label: "Niveau de risque", weight: DEAL_SCORE_WEIGHTS.risk, color: "var(--red)" },
              { label: "Facilité de revente", weight: DEAL_SCORE_WEIGHTS.resaleEase, color: "var(--amber)" },
              { label: "État / réparations", weight: DEAL_SCORE_WEIGHTS.condition, color: "var(--navy-400)" },
            ].map((item, idx) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "0.875rem 1.125rem",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  boxShadow: "var(--shadow-xs)",
                  animation: `fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both ${idx * 0.07}s`,
                }}
              >
                <span
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    color: item.color,
                    fontVariantNumeric: "tabular-nums",
                    minWidth: "2.5rem",
                  }}
                >
                  {Math.round(item.weight * 100)}%
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.375rem" }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text)" }}>
                      {item.label}
                    </span>
                  </div>
                  <div
                    style={{
                      height: "3px",
                      background: "var(--border)",
                      borderRadius: "2px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.round(item.weight * 100)}%`,
                        background: item.color,
                        borderRadius: "2px",
                        transition: "width 1s ease",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @media (max-width: 760px) {
            .ds-grid { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
          }
        `}</style>
      </section>
    </div>
  );
}
