import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import CostBreakdown from "@/components/ui/CostBreakdown";
import DealScore from "@/components/ui/DealScore";
import MarketValueDisplay from "@/components/ui/MarketValueDisplay";
import MarketValueMethodology from "@/components/ui/MarketValueMethodology";
import RepairList from "@/components/ui/RepairList";
import RiskBadge from "@/components/ui/RiskBadge";
import ScenarioCard from "@/components/ui/ScenarioCard";
import ValueEstimateCard from "@/components/ui/ValueEstimateCard";
import { getOpportunityById } from "@/lib/data/get-opportunities";
import { formatCurrency, formatMileage } from "@/lib/format";
import { fuelTypeLabels, transmissionLabels } from "@/lib/labels";
import {
  ArrowLeft,
  Calendar,
  Gauge,
  Fuel,
  Settings,
  CarFront,
  ShieldAlert,
} from "lucide-react";

export default async function OpportunityDetailPage({ params }: { params: { id: string } }) {
  const opportunity = await getOpportunityById(params.id);
  if (!opportunity) notFound();

  const { vehicle, listing, analysis } = opportunity;

  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh" }}>
      {/* Background gradients */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 80% 40% at 50% -10%, rgba(37,99,235,0.06) 0%, transparent 60%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem 1.5rem 4rem", position: "relative", zIndex: 1 }}>
        {/* Navigation & Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
            <Link
              href="/opportunites"
              className="text-muted hover-electric"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                textDecoration: "none",
                transition: "color 0.2s",
              }}
            >
              <ArrowLeft size={16} />
              Retour aux opportunités
            </Link>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                padding: "0.375rem 0.875rem",
                borderRadius: "var(--radius-full)",
                background: "rgba(37,99,235,0.1)",
                border: "1px solid rgba(37,99,235,0.2)",
                fontSize: "0.6875rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--electric-strong)",
              }}
            >
              <span
                style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--electric)", animation: "pulse-soft 2s infinite" }}
              />
              Fiche de démonstration
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "2rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)" }}>
                  {vehicle.make} {vehicle.model}
                </h1>
                <RiskBadge level={analysis.riskLevel} />
              </div>
              <p style={{ fontSize: "1.125rem", color: "var(--text-muted)", fontWeight: 500 }}>
                {vehicle.version}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: "0.25rem" }}>
                  Prix affiché
                </p>
                <p style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", color: "var(--text)" }}>
                  {formatCurrency(listing.price)}
                </p>
              </div>
              <div
                style={{
                  background: "var(--surface)",
                  borderRadius: "20px",
                  padding: "1rem 1.5rem",
                  boxShadow: "var(--shadow-md)",
                  border: "1px solid var(--border)",
                }}
              >
                <DealScore score={analysis.dealScore} size="lg" />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem", alignItems: "start" }} className="detail-grid">
          {/* Colonne gauche : Contenu principal */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            
            {/* Photos */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gridTemplateRows: "repeat(2, 200px)",
                gap: "0.5rem",
                borderRadius: "20px",
                overflow: "hidden",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-sm)",
              }}
              className="photo-grid"
            >
              {listing.images[0] && (
                <div style={{ gridRow: "span 2", position: "relative" }}>
                  <Image src={listing.images[0]} alt="Vue principale" fill style={{ objectFit: "cover" }} />
                </div>
              )}
              {listing.images[1] && (
                <div style={{ position: "relative" }}>
                  <Image src={listing.images[1]} alt="Vue arrière" fill style={{ objectFit: "cover" }} />
                </div>
              )}
              {listing.images[2] && (
                <div style={{ position: "relative" }}>
                  <Image src={listing.images[2]} alt="Intérieur" fill style={{ objectFit: "cover" }} />
                </div>
              )}
            </div>

            {/* Market Value Engine */}
            <section>
              <SectionHeader title="Valeur de Marché" subtitle="Analyse algorithmique des annonces similaires (France)" />
              <div
                style={{
                  background: "var(--surface)",
                  borderRadius: "16px",
                  border: "1px solid var(--border)",
                  padding: "2rem",
                  boxShadow: "var(--shadow-sm)",
                  marginBottom: "1.5rem",
                }}
              >
                <MarketValueDisplay
                  price={listing.price}
                  marketValueLow={analysis.marketValueLow}
                  marketValueEstimated={analysis.marketValueEstimated}
                  marketValueHigh={analysis.marketValueHigh}
                />
              </div>
              {opportunity.valueAnalysis && (
                <MarketValueMethodology estimate={opportunity.valueAnalysis.currentValue} />
              )}
            </section>

            {/* Scénarios */}
            <section>
              <SectionHeader title="Scénarios de Revente" subtitle="Projections nettes après tous les frais de remise en état et de commercialisation" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }} className="scenarios-grid">
                <ScenarioCard
                  label="Pessimiste"
                  resalePrice={analysis.resalePriceConservative}
                  totalInvestment={analysis.totalInvestment}
                  profit={analysis.profitConservative}
                />
                <ScenarioCard
                  label="Réaliste"
                  resalePrice={analysis.resalePriceRealistic}
                  totalInvestment={analysis.totalInvestment}
                  profit={analysis.profitRealistic}
                  highlight
                />
                <ScenarioCard
                  label="Optimiste"
                  resalePrice={analysis.resalePriceOptimistic}
                  totalInvestment={analysis.totalInvestment}
                  profit={analysis.profitOptimistic}
                />
              </div>
            </section>

            {/* Réparations */}
            <section>
              <SectionHeader title="Remise en État" subtitle="Estimations basées sur l'analyse de l'annonce et l'historique du modèle" />
              <RepairList repairs={opportunity.repairs} />
            </section>
          </div>

          {/* Colonne droite : Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            
            <section>
              <CostBreakdown listing={listing} analysis={analysis} />
            </section>

            <section
              style={{
                background: "var(--surface)",
                borderRadius: "14px",
                border: "1px solid var(--border)",
                padding: "1.5rem",
                boxShadow: "var(--shadow-xs)",
              }}
            >
              <h3 style={{ fontSize: "0.875rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text)", marginBottom: "1rem" }}>
                Caractéristiques
              </h3>
              <ul style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {[
                  { icon: <Calendar size={16} />, label: "Année", value: vehicle.year },
                  { icon: <Gauge size={16} />, label: "Kilométrage", value: formatMileage(vehicle.mileage) },
                  { icon: <Fuel size={16} />, label: "Énergie", value: fuelTypeLabels[vehicle.fuelType] },
                  { icon: <Settings size={16} />, label: "Boîte", value: transmissionLabels[vehicle.transmission] },
                ].map(({ icon, label, value }) => (
                  <li key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                      {icon} {label}
                    </span>
                    <span style={{ fontWeight: 600, color: "var(--text)", fontSize: "0.875rem" }}>
                      {value}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {analysis.analysisSummary.negatives && analysis.analysisSummary.negatives.length > 0 && (
              <section
                style={{
                  background: "var(--amber-soft)",
                  borderRadius: "14px",
                  border: "1px solid var(--amber-border)",
                  padding: "1.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                  <ShieldAlert size={18} color="var(--amber-strong)" />
                  <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--amber-strong)" }}>
                    Points de vigilance
                  </h3>
                </div>
                <ul style={{ display: "flex", flexDirection: "column", gap: "0.75rem", paddingLeft: "1.25rem", listStyleType: "disc", color: "var(--amber-strong)", fontSize: "0.875rem" }}>
                  {analysis.analysisSummary.negatives.map((warning: string) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .detail-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .photo-grid { grid-template-columns: 1fr !important; grid-template-rows: 250px 150px 150px !important; }
          .photo-grid > div:first-child { grid-row: span 1 !important; }
          .scenarios-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text)", marginBottom: "0.25rem" }}>
        {title}
      </h2>
      <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>{subtitle}</p>
    </div>
  );
}
