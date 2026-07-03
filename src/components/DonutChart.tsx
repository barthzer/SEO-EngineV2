"use client";

import { useRef, useState, type ReactNode } from "react";
import { ChartTooltip } from "@/components/Tooltip";

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  slices: DonutSlice[];
  size?: number;
  strokeWidth?: number;
  center?: ReactNode;
  /** Vide entre chaque part, en degrés (rétro-compat). Ignoré si `gapPercent` est fourni. */
  gap?: number;
  /** Vide entre chaque part exprimé en % du cercle (ex. 2 = 2%). Recommandé. */
  gapPercent?: number;
  /** Anneau de fond (track gris) derrière les segments. `false` → gaps transparents. */
  showTrack?: boolean;
  formatTooltip?: (slice: DonutSlice, pct: number) => ReactNode;
  className?: string;
}

export function DonutChart({
  slices,
  size = 112,
  strokeWidth = 10,
  center,
  gap = 6,
  gapPercent,
  showTrack = true,
  formatTooltip,
  className = "",
}: DonutChartProps) {
  const [hovered, setHovered] = useState<{ slice: DonutSlice; pct: number; x: number; y: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const total = slices.reduce((s, d) => s + d.value, 0) || 1;
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - strokeWidth) / 2;
  const toRad = (deg: number) => (deg - 90) * Math.PI / 180;
  const pt = (deg: number) => ({
    x: cx + r * Math.cos(toRad(deg)),
    y: cy + r * Math.sin(toRad(deg)),
  });

  // Vide entre chaque part. On compense l'extension du round-cap pour que le vide
  // *visible* corresponde toujours à la valeur demandée (par défaut 2% du cercle).
  const gapDeg = gapPercent != null ? (gapPercent / 100) * 360 : gap;
  const capDeg = ((strokeWidth / 2) / r) * (180 / Math.PI);
  const trim = gapDeg / 2 + capDeg;

  let angle = 0;
  const arcs = slices.map((d) => {
    const span = (d.value / total) * 360;
    const start = angle;
    const end = angle + span;
    const sDeg = start + trim;
    const eDeg = end - trim;
    const drawn = eDeg > sDeg;
    const large = (eDeg - sDeg) > 180 ? 1 : 0;
    const s = pt(sDeg);
    const e = pt(eDeg);
    const path = `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
    angle = end;
    return { ...d, start, end, path, drawn, pct: Math.round((d.value / total) * 100) };
  });

  // Détection par angle sur toute la surface du donut → pas besoin de viser le segment ;
  // le tooltip suit le curseur (lissé via la transition de ChartTooltip).
  function handleMove(e: React.MouseEvent) {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * size;
    const my = ((e.clientY - rect.top) / rect.height) * size;
    let deg = Math.atan2(my - cy, mx - cx) * (180 / Math.PI) + 90;
    deg = ((deg % 360) + 360) % 360;
    const arc = arcs.find((a) => deg >= a.start && deg < a.end) ?? arcs[arcs.length - 1];
    if (!arc) return;
    setHovered({
      slice: { label: arc.label, value: arc.value, color: arc.color },
      pct: arc.pct,
      // Coordonnées viewport → tooltip en portail (jamais clippé par un `overflow-hidden` parent).
      x: e.clientX,
      y: e.clientY,
    });
  }

  return (
    <div
      ref={wrapRef}
      onMouseMove={handleMove}
      onMouseLeave={() => setHovered(null)}
      className={`relative inline-flex flex-shrink-0 ${className}`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="pointer-events-none">
        {/* Track ring (fond) — masquable pour des gaps transparents */}
        {showTrack && (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border-subtle)" strokeWidth={strokeWidth} />
        )}

        {arcs.map((arc, i) => arc.drawn && (
          <path
            key={i}
            d={arc.path}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity={hovered && hovered.slice.label !== arc.label ? 0.35 : 1}
            style={{ transition: "opacity 0.15s" }}
          />
        ))}

        {center && (
          <foreignObject x={strokeWidth} y={strokeWidth} width={size - strokeWidth * 2} height={size - strokeWidth * 2}>
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {center}
            </div>
          </foreignObject>
        )}
      </svg>

      {hovered && (
        <ChartTooltip x={hovered.x} y={hovered.y} portal>
          {formatTooltip
            ? formatTooltip(hovered.slice, hovered.pct)
            : (
              <div className="flex flex-col gap-0.5">
                <span className="text-[12px] font-semibold text-white">{hovered.slice.label}</span>
                <span className="text-[11px] text-white/60">
                  <span className="font-semibold text-white">{hovered.slice.value}</span> — {hovered.pct}%
                </span>
              </div>
            )}
        </ChartTooltip>
      )}
    </div>
  );
}
