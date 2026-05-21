"use client";

import type { ReactNode } from "react";

export interface HorizontalBarChartItem {
  label: string;
  value: number;
}

interface HorizontalBarChartProps {
  data: HorizontalBarChartItem[];
  /** Couleur de base — les barres descendent en intensité par index */
  color?: string;
  /** Formatter pour la valeur affichée dans la barre */
  formatValue?: (v: number) => string;
  /** Largeur de la colonne label (à gauche) */
  labelWidth?: number;
  /** Hauteur fixe de la barre (la row remplit l'espace, la barre garde une taille raisonnable) */
  barHeight?: number;
  /** Hauteur totale du bloc graphique (défaut 238 pour matcher l'AreaChart standard) */
  chartHeight?: number;
  /** Contenu du tooltip au survol d'une barre — reçoit l'item + son index + total */
  tooltip?: (item: HorizontalBarChartItem, index: number, total: number) => ReactNode;
  className?: string;
}

/** Renvoie une couleur avec opacité, compatible hex et CSS vars via color-mix */
function withAlpha(color: string, alpha: number) {
  return `color-mix(in oklab, ${color} ${Math.round(alpha * 100)}%, transparent)`;
}

/**
 * Bar chart horizontal — bars rounded-full avec intensité décroissante par index.
 * Item 0 = main color (alpha 1), suivants = variantes plus claires.
 * Valeur affichée à l'intérieur de la barre. Remplit la hauteur du conteneur.
 */
export function HorizontalBarChart({
  data,
  color = "var(--accent-primary)",
  formatValue = (v) => v.toLocaleString("fr-FR"),
  labelWidth = 100,
  barHeight = 28,
  chartHeight = 238,
  tooltip,
  className = "",
}: HorizontalBarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const total = data.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className={`flex h-full flex-col justify-end ${className}`}>
      {/* Bars block — fixed chartHeight, anchored to bottom of any taller parent */}
      <div className="relative flex flex-col" style={{ height: chartHeight }}>
        {/* Continuous vertical gridlines — span exactly the chartHeight */}
        <div
          className="pointer-events-none absolute inset-y-0 flex justify-between"
          style={{ left: labelWidth + 8, right: 0 }}
          aria-hidden="true"
        >
          {[0, 1, 2, 3, 4].map((k) => (
            <div
              key={k}
              className="w-px"
              style={{
                background:
                  "repeating-linear-gradient(to bottom, var(--border-subtle) 0 6px, transparent 6px 14px)",
              }}
            />
          ))}
        </div>

        {data.map((d, i) => {
          const ratio = d.value / maxValue;
          // Index 0 → 1.0, decreases linearly with min 0.12
          const alpha = Math.max(0.12, 1 - i * 0.28);
          const textWhite = alpha >= 0.5;
          return (
            <div
              key={d.label}
              className="relative flex flex-1 items-center gap-2"
            >
              <span
                className="flex-shrink-0 text-[13px] tracking-body text-[var(--text-secondary)]"
                style={{ width: labelWidth }}
              >
                {d.label}
              </span>
              <div className="flex flex-1 items-center">
                {ratio > 0 ? (
                  <div
                    className={`group relative flex items-center rounded-full transition-all ${tooltip ? "cursor-default hover:brightness-110" : ""}`}
                    style={{
                      width: `${Math.max(ratio * 100, 8)}%`,
                      height: barHeight,
                      backgroundColor: withAlpha(color, alpha),
                    }}
                  >
                    <span
                      className={`px-3 text-[12px] font-semibold tabular-nums ${textWhite ? "text-white" : "text-[var(--text-primary)]"}`}
                    >
                      {formatValue(d.value)}
                    </span>
                    {tooltip && (
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-[rgba(20,20,20,0.92)] px-3.5 py-2.5 opacity-0 shadow-[var(--shadow-floating)] backdrop-blur-md transition-opacity duration-150 group-hover:opacity-100 dark:border dark:border-[var(--border-subtle)] dark:bg-[rgba(40,40,42,0.92)]">
                        {tooltip(d, i, total)}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className={`relative pl-1 text-[12px] tabular-nums text-[var(--text-muted)] ${tooltip ? "group cursor-default" : ""}`}>
                    {formatValue(d.value)}
                    {tooltip && (
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-[rgba(20,20,20,0.92)] px-3.5 py-2.5 opacity-0 shadow-[var(--shadow-floating)] backdrop-blur-md transition-opacity duration-150 group-hover:opacity-100 dark:border dark:border-[var(--border-subtle)] dark:bg-[rgba(40,40,42,0.92)]">
                        {tooltip(d, i, total)}
                      </div>
                    )}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
