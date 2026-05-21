"use client";

import { useId, useState } from "react";

/* ── Types ────────────────────────────────────────────────────────────── */

export interface RadarSeries {
  label: string;
  /** Valeurs normalisées 0-maxValue, mêmes index que `axes` */
  values: number[];
  /** Couleur CSS — tokens recommandés (var(--accent-primary), var(--color-danger)…) */
  color: string;
  /** Trace en pointillé (typique pour la moyenne concurrents) */
  dashed?: boolean;
}

interface RadarChartProps {
  axes: string[];
  series: RadarSeries[];
  /** Taille totale du SVG en px (carré). Défaut 360 */
  size?: number;
  /** Valeur max de l'échelle (graduations) — défaut 100 */
  maxValue?: number;
  /** Nombre de cercles concentriques (ticks). Défaut 4 (= 25, 50, 75, 100) */
  rings?: number;
  /** Marge interne pour laisser respirer les labels d'axes */
  padding?: number;
  className?: string;
}

/* ── Helpers ──────────────────────────────────────────────────────────── */

/** Angle (rad) pour chaque axe — start au top (12 o'clock), sens horaire */
function axisAngle(i: number, total: number) {
  return -Math.PI / 2 + (2 * Math.PI * i) / total;
}

function point(cx: number, cy: number, radius: number, angle: number) {
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)] as const;
}

function withAlpha(color: string, alpha: number) {
  return `color-mix(in oklab, ${color} ${Math.round(alpha * 100)}%, transparent)`;
}

/* ── Component ────────────────────────────────────────────────────────── */

/**
 * RadarChart — spider chart SVG sans dépendance.
 * Support multi-séries (solide + dashed), tooltip au hover des vertices,
 * compatible CSS vars via `style={{ fill, stroke }}` (les attributs SVG ne
 * résolvent pas `var(...)`).
 *
 * @example
 * ```tsx
 * <RadarChart
 *   axes={["TF", "CF", "TF/CF", "Backlinks", "RefDom"]}
 *   series={[
 *     { label: "Vous", values: [35, 45, 78, 12, 30], color: "var(--accent-primary)" },
 *     { label: "Concurrents", values: [82, 88, 65, 90, 85], color: "var(--color-danger)", dashed: true },
 *   ]}
 * />
 * ```
 */
export function RadarChart({
  axes,
  series,
  size = 360,
  maxValue = 100,
  rings = 4,
  padding = 48,
  className = "",
}: RadarChartProps) {
  const reactId = useId().replace(/:/g, "");
  const [hover, setHover] = useState<{ s: number; i: number } | null>(null);

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - padding;
  const n = axes.length;

  /* ── Grid : polygons concentriques ── */
  const gridPolys = Array.from({ length: rings }, (_, k) => {
    const r = ((k + 1) / rings) * radius;
    const pts = axes
      .map((_, i) => point(cx, cy, r, axisAngle(i, n)).join(","))
      .join(" ");
    return { pts, value: ((k + 1) / rings) * maxValue };
  });

  /* ── Axes radiaux ── */
  const axesLines = axes.map((label, i) => {
    const [x2, y2] = point(cx, cy, radius, axisAngle(i, n));
    const labelDist = radius + 22;
    const [lx, ly] = point(cx, cy, labelDist, axisAngle(i, n));
    return { x2, y2, lx, ly, label, i };
  });

  /* ── Séries ── */
  const seriesData = series.map((s) => {
    const pts = s.values.map((v, i) => {
      const r = (Math.max(0, Math.min(maxValue, v)) / maxValue) * radius;
      return point(cx, cy, r, axisAngle(i, n));
    });
    const polyPts = pts.map((p) => p.join(",")).join(" ");
    return { ...s, pts, polyPts };
  });

  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ shapeRendering: "geometricPrecision" }}
        onMouseLeave={() => setHover(null)}
      >
        {/* Grid concentrique */}
        {gridPolys.map((g, k) => (
          <polygon
            key={k}
            points={g.pts}
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth={1}
          />
        ))}

        {/* Axes radiaux */}
        {axesLines.map((a) => (
          <line
            key={a.i}
            x1={cx}
            y1={cy}
            x2={a.x2}
            y2={a.y2}
            stroke="var(--border-subtle)"
            strokeWidth={1}
          />
        ))}

        {/* Tick label sur l'axe vertical (top) */}
        {gridPolys.map((g, k) => {
          const [, ly] = point(cx, cy, ((k + 1) / rings) * radius, -Math.PI / 2);
          return (
            <text
              key={`tick-${k}`}
              x={cx + 4}
              y={ly + 3}
              fontSize={9}
              fill="var(--text-muted)"
              fontFamily="var(--font-mono), monospace"
              style={{ pointerEvents: "none" }}
            >
              {Math.round(g.value)}
            </text>
          );
        })}

        {/* Séries — rendu inverse pour mettre la 1ère par-dessus */}
        {seriesData.slice().reverse().map((s, idx) => {
          const realIdx = seriesData.length - 1 - idx;
          return (
            <g key={`s-${realIdx}-${reactId}`}>
              {/* Fill */}
              <polygon
                points={s.polyPts}
                style={{
                  fill: withAlpha(s.color, 0.16),
                  stroke: s.color,
                }}
                strokeWidth={1.8}
                strokeLinejoin="round"
                strokeDasharray={s.dashed ? "5 4" : undefined}
              />
              {/* Vertex dots */}
              {s.pts.map(([x, y], i) => {
                const isHover = hover?.s === realIdx && hover?.i === i;
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={isHover ? 5 : 3.5}
                    style={{ fill: s.color }}
                    stroke="var(--bg-card)"
                    strokeWidth={2}
                    onMouseEnter={() => setHover({ s: realIdx, i })}
                  />
                );
              })}
            </g>
          );
        })}

        {/* Axes labels */}
        {axesLines.map((a) => {
          // Anchor adaptatif selon la position
          let anchor: "start" | "middle" | "end" = "middle";
          const dx = a.lx - cx;
          if (Math.abs(dx) > 8) anchor = dx > 0 ? "start" : "end";
          return (
            <text
              key={`lbl-${a.i}`}
              x={a.lx}
              y={a.ly + 4}
              textAnchor={anchor}
              fontSize={12}
              fontWeight={500}
              fill="var(--text-primary)"
              fontFamily="var(--font-display), var(--font-sans), system-ui"
              style={{ pointerEvents: "none" }}
            >
              {a.label}
            </text>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hover && (() => {
        const s = seriesData[hover.s];
        const [hx, hy] = s.pts[hover.i];
        const value = s.values[hover.i];
        const label = axes[hover.i];
        return (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl bg-[rgba(20,20,20,0.92)] px-3 py-2 shadow-[var(--shadow-floating)] backdrop-blur-md"
            style={{ left: hx, top: hy - 8 }}
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: s.color }}
                aria-hidden="true"
              />
              <span className="text-[11px] font-medium text-white/70">{s.label}</span>
            </div>
            <div className="mt-0.5 flex items-baseline gap-2 whitespace-nowrap">
              <span className="text-[12px] text-white/55">{label}</span>
              <span className="text-[13px] font-semibold tabular-nums text-white">
                {value.toLocaleString("fr-FR")}
              </span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
