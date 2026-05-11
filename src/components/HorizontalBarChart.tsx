"use client";

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
  className?: string;
}

function hexToRgb(hex: string) {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

/**
 * Bar chart horizontal — bars rounded-full avec intensité décroissante par index.
 * Item 0 = main color (alpha 1), suivants = variantes plus claires.
 * Valeur affichée à l'intérieur de la barre. Remplit la hauteur du conteneur.
 */
export function HorizontalBarChart({
  data,
  color = "#3E50F5",
  formatValue = (v) => v.toLocaleString("fr-FR"),
  labelWidth = 100,
  barHeight = 28,
  chartHeight = 238,
  className = "",
}: HorizontalBarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const rgb = hexToRgb(color);

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
                    className="relative flex items-center rounded-full transition-colors"
                    style={{
                      width: `${Math.max(ratio * 100, 8)}%`,
                      height: barHeight,
                      backgroundColor: `rgba(${rgb}, ${alpha})`,
                    }}
                  >
                    <span
                      className={`px-3 text-[12px] font-semibold tabular-nums ${textWhite ? "text-white" : "text-[var(--text-primary)]"}`}
                    >
                      {formatValue(d.value)}
                    </span>
                  </div>
                ) : (
                  <span className="relative pl-1 text-[12px] tabular-nums text-[var(--text-muted)]">
                    {formatValue(d.value)}
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
