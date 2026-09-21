"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--navy-950)",
        color: "rgba(255, 255, 255, 0.6)",
        borderTop: "1px solid rgba(255, 255, 255, 0.05)",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "5rem 1.5rem 3rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1.5fr",
            gap: "4rem",
            marginBottom: "4rem",
          }}
          className="footer-grid"
        >
          {/* Marque & Intro */}
          <div>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                textDecoration: "none",
                marginBottom: "1.25rem",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #2563EB 0%, #4338CA 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TrendingUp size={16} color="white" strokeWidth={2.5} />
              </div>
              <span
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: "white",
                }}
              >
                CARVIZO
              </span>
            </Link>
            <p style={{ fontSize: "0.875rem", lineHeight: 1.7, maxWidth: "320px", marginBottom: "1.5rem" }}>
              La première plateforme analytique dédiée aux professionnels et passionnés de l'achat-revente automobile. Données en temps réel, calculs déterministes.
            </p>
          </div>

          {/* Produit */}
          <div>
            <h4 style={{ fontSize: "0.875rem", fontWeight: 700, color: "white", marginBottom: "1.25rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Produit
            </h4>
            <ul style={{ display: "flex", flexDirection: "column", gap: "0.75rem", listStyle: "none", padding: 0 }}>
              {["Opportunités", "Deal Score", "Market Value Engine", "Tarifs"].map((item) => (
                <li key={item}>
                  <Link href="#" style={{ color: "inherit", textDecoration: "none", fontSize: "0.875rem", transition: "color 0.2s" }} onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "white")} onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "inherit")}>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 style={{ fontSize: "0.875rem", fontWeight: 700, color: "white", marginBottom: "1.25rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Légal
            </h4>
            <ul style={{ display: "flex", flexDirection: "column", gap: "0.75rem", listStyle: "none", padding: 0 }}>
              {["Mentions légales", "Confidentialité", "CGV", "Contact"].map((item) => (
                <li key={item}>
                  <Link href="#" style={{ color: "inherit", textDecoration: "none", fontSize: "0.875rem", transition: "color 0.2s" }} onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "white")} onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "inherit")}>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 style={{ fontSize: "0.875rem", fontWeight: 700, color: "white", marginBottom: "1.25rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Restez informé
            </h4>
            <p style={{ fontSize: "0.875rem", marginBottom: "1rem" }}>
              Recevez les meilleures opportunités directement dans votre boîte mail.
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="email"
                placeholder="Votre email"
                style={{
                  flex: 1,
                  padding: "0.625rem 1rem",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "white",
                  fontSize: "0.875rem",
                  outline: "none",
                }}
              />
              <button
                style={{
                  padding: "0.625rem 1rem",
                  borderRadius: "8px",
                  background: "var(--electric)",
                  color: "white",
                  border: "none",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                S'inscrire
              </button>
            </div>
          </div>
        </div>

        <div style={{ paddingTop: "2rem", borderTop: "1px solid rgba(255, 255, 255, 0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8125rem", flexWrap: "wrap", gap: "1rem" }}>
          <p>© {new Date().getFullYear()} Carvizo. Tous droits réservés.</p>
          <div style={{ display: "flex", gap: "1rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#34D399" }} />
              Système opérationnel
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 3rem !important; }
        }
        @media (max-width: 600px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
