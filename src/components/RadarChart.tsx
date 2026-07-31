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

  /* ── Hover : détection du vertex le plus proche du curseur (pas besoin d'être pile dessus) ── */
  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * size;
    const my = ((e.clientY - rect.top) / rect.height) * size;
    let best = { s: 0, i: 0 };
    let bestDist = Infinity;
    for (let s = 0; s < seriesData.length; s++) {
      for (let i = 0; i < n; i++) {
        const [vx, vy] = seriesData[s].pts[i];
        const d = Math.hypot(mx - vx, my - vy);
        if (d < bestDist) { bestDist = d; best = { s, i }; }
      }
    }
    setHover(best);
  }

  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ shapeRendering: "geometricPrecision" }}
        onMouseMove={handleMouseMove}
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

        {/* Connecteur entre les vertices au survol — relie visuellement les deux points
            sur l'axe survolé (Concurrents ↔ Vous) pour matérialiser le différentiel. */}
        {hover && seriesData.length >= 2 && (() => {
          const [x1, y1] = seriesData[0].pts[hover.i];
          const [x2, y2] = seriesData[seriesData.length - 1].pts[hover.i];
          return (
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="var(--text-primary)"
              strokeWidth={1.2}
              strokeDasharray="3 3"
              opacity={0.45}
              style={{ pointerEvents: "none" }}
            />
          );
        })()}

        {/* Séries — rendu en ordre direct : la DERNIÈRE série passée est rendue par-dessus.
            Convention NetlinkingView : [Concurrents, Vous] → Vous au-dessus. */}
        {seriesData.map((s, realIdx) => {
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
                    style={{ fill: s.color, pointerEvents: "none" }}
                    stroke="var(--bg-card)"
                    strokeWidth={2}
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

      {/* Tooltip — toutes les séries sur cet axe + delta */}
      {hover && (() => {
        const axisIdx = hover.i;
        const [hx, hy] = seriesData[hover.s].pts[axisIdx];
        const label = axes[axisIdx];
        // Référence (1ère série) vs Vous (dernière série) pour calculer le différentiel
        const ref = seriesData[0]?.values[axisIdx] ?? 0;
        const you = seriesData[seriesData.length - 1]?.values[axisIdx] ?? 0;
        const delta = you - ref;
        const deltaPct = ref !== 0 ? Math.round((delta / ref) * 100) : null;
        return (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl bg-[rgba(20,20,20,0.92)] px-3.5 py-2.5 shadow-[var(--shadow-floating)] backdrop-blur-md min-w-[180px] transition-[left,top] duration-200 ease-out"
            style={{ left: hx, top: hy - 10 }}
          >
            <p className="mb-2 type-micro uppercase tracking-[0.06em] text-white/55">{label}</p>
            {seriesData.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3 py-0.5">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} aria-hidden="true" />
                  <span className="type-caption text-white/75">{s.label}</span>
                </span>
                <span className="type-caption tabular-nums text-white">
                  {s.values[axisIdx].toLocaleString("fr-FR")}
                </span>
              </div>
            ))}
            {seriesData.length >= 2 && (
              <div className="mt-2 flex items-center justify-between gap-3 border-t border-white/10 pt-1.5">
                <span className="type-micro text-white/55">Δ vs concurrents</span>
                <span
                  className="type-caption tabular-nums"
                  style={{ color: delta >= 0 ? "#34D399" : "#FB7185" }}
                >
                  {delta >= 0 ? "+" : ""}{delta.toLocaleString("fr-FR")}
                  {deltaPct != null && <span className="ml-1 opacity-70">({delta >= 0 ? "+" : ""}{deltaPct}%)</span>}
                </span>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
