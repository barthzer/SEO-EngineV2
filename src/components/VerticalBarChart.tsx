"use client";

import type { ReactNode } from "react";

export interface VerticalBarChartItem {
  label: string;
  value: number;
}

interface VerticalBarChartProps {
  data: VerticalBarChartItem[];
  /** Couleur de base — les barres descendent en intensité par index */
  color?: string;
  /** Formatter pour la valeur affichée au-dessus de la barre */
  formatValue?: (v: number) => string;
  /** Largeur fixe d'une barre (la colonne remplit l'espace, la barre garde une taille raisonnable) */
  barWidth?: number;
  /** Hauteur totale du bloc graphique (défaut 238 pour matcher l'AreaChart standard) */
  chartHeight?: number;
  /** Contenu du tooltip au survol d'une barre — reçoit l'item + son index + total */
  tooltip?: (item: VerticalBarChartItem, index: number, total: number) => ReactNode;
  className?: string;
}

/** Renvoie une couleur avec opacité, compatible hex et CSS vars via color-mix */
function withAlpha(color: string, alpha: number) {
  return `color-mix(in oklab, ${color} ${Math.round(alpha * 100)}%, transparent)`;
}

/**
 * Bar chart vertical — bars rounded-full avec intensité décroissante par index.
 * Item 0 = main color (alpha 1), suivants = variantes plus claires.
 * Valeur affichée au-dessus (ou à l'intérieur si la barre est assez haute), label en dessous.
 */
export function VerticalBarChart({
  data,
  color = "var(--accent-primary)",
  formatValue = (v) => v.toLocaleString("fr-FR"),
  barWidth = 56,
  chartHeight = 238,
  tooltip,
  className = "",
}: VerticalBarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const total = data.reduce((acc, d) => acc + d.value, 0);

  const LABEL_GAP = 28; // espace pour le label en dessous
  const VALUE_GAP = 22; // espace réservé pour la valeur au-dessus
  const barsAreaHeight = chartHeight - LABEL_GAP;

  return (
    <div className={`flex h-full flex-col justify-end ${className}`}>
      <div className="relative" style={{ height: chartHeight }}>
        {/* Continuous horizontal gridlines */}
        <div
          className="pointer-events-none absolute inset-x-0 flex flex-col justify-between"
          style={{ top: 0, height: barsAreaHeight }}
          aria-hidden="true"
        >
          {[0, 1, 2, 3, 4].map((k) => (
            <div
              key={k}
              className="h-px w-full"
              style={{
                background:
                  "repeating-linear-gradient(to right, var(--border-subtle) 0 6px, transparent 6px 14px)",
              }}
            />
          ))}
        </div>

        {/* Bars row */}
        <div className="absolute inset-x-0 top-0 flex items-end justify-around" style={{ height: barsAreaHeight }}>
          {data.map((d, i) => {
            const ratio = d.value / maxValue;
            // Index 0 → 1.0, decreases linearly with min 0.12
            const alpha = Math.max(0.12, 1 - i * 0.28);
            // Réserve VALUE_GAP px en haut pour que la valeur tienne toujours
            const barHeight = Math.max(ratio * (barsAreaHeight - VALUE_GAP), ratio > 0 ? 6 : 0);
            const valueInside = barHeight >= 36 && alpha >= 0.5;
            return (
              <div
                key={d.label}
                className={`group relative flex flex-1 flex-col items-center justify-end rounded-xl transition-colors ${tooltip ? "cursor-default hover:bg-[var(--bg-subtle)]" : ""}`}
                style={{ height: barsAreaHeight }}
              >
                {ratio > 0 ? (
                  <div className="relative flex flex-col items-center justify-end">
                    <span
                      className={`absolute left-1/2 -translate-x-1/2 text-[12px] font-semibold tabular-nums ${valueInside ? "top-2 text-white" : "-top-5 text-[var(--text-primary)]"}`}
                      style={{ zIndex: 1 }}
                    >
                      {formatValue(d.value)}
                    </span>
                    <div
                      className="rounded-md transition-[filter] group-hover:brightness-110"
                      style={{
                        width: barWidth,
                        height: barHeight,
                        backgroundColor: withAlpha(color, alpha),
                      }}
                    />
                  </div>
                ) : (
                  <span className="pb-1 text-[12px] tabular-nums text-[var(--text-muted)]">
                    {formatValue(d.value)}
                  </span>
                )}
                {tooltip && (
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-[rgba(20,20,20,0.92)] px-3.5 py-2.5 opacity-0 shadow-[var(--shadow-floating)] backdrop-blur-md transition-opacity duration-150 group-hover:opacity-100 dark:border dark:border-[var(--border-subtle)] dark:bg-[rgba(40,40,42,0.92)]">
                    {tooltip(d, i, total)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Labels */}
        <div className="absolute inset-x-0 bottom-0 flex justify-around" style={{ height: LABEL_GAP }}>
          {data.map((d) => (
            <div key={d.label} className="flex flex-1 items-center justify-center">
              <span className="text-[13px] tracking-body text-[var(--text-secondary)]">{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
