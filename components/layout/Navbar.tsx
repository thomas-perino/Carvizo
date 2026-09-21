"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { TrendingUp, BarChart2 } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        transition: "background 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease",
        background: scrolled
          ? "rgba(11, 18, 38, 0.88)"
          : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(37, 99, 235, 0.08)"
          : "1px solid transparent",
        boxShadow: scrolled ? "0 2px 24px rgba(15, 22, 41, 0.06)" : "none",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 1.5rem",
          height: "68px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "2rem",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #111B3A 0%, #2563EB 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
              flexShrink: 0,
            }}
          >
            <TrendingUp size={16} color="white" strokeWidth={2.5} />
          </div>
          <span
            style={{
              fontSize: "1.0625rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "var(--text)",
            }}
          >
            CARVIZO
          </span>
        </Link>

        {/* Nav links */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
        >
          {[
            { href: "/", label: "Accueil" },
            { href: "/opportunites", label: "Opportunités" },
          ].map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontWeight: active ? 600 : 500,
                  color: active ? "var(--electric)" : "var(--text-muted)",
                  background: active ? "var(--electric-soft)" : "transparent",
                  textDecoration: "none",
                  transition: "color 0.2s, background 0.2s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.color = "var(--text)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(37,99,235,0.04)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }
                }}
              >
                {label}
              </Link>
            );
          })}

          {/* Separator */}
          <div
            style={{
              width: "1px",
              height: "20px",
              background: "var(--border-strong)",
              margin: "0 0.5rem",
              flexShrink: 0,
            }}
          />

          {/* CTA */}
          <Link
            href="/opportunites"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.5rem 1.125rem",
              background: "var(--electric)",
              color: "white",
              fontSize: "0.875rem",
              fontWeight: 600,
              borderRadius: "9px",
              textDecoration: "none",
              boxShadow: "0 2px 10px rgba(37, 99, 235, 0.25)",
              transition: "background 0.2s, box-shadow 0.2s, transform 0.2s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--electric-strong)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 18px rgba(37, 99, 235, 0.4)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--electric)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 10px rgba(37, 99, 235, 0.25)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            <BarChart2 size={14} strokeWidth={2.5} />
            Voir les opportunités
          </Link>
        </nav>
      </div>
    </header>
  );
}
