"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { ChartTooltip } from "@/components/Tooltip";

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  inverted?: boolean;
  strokeWidth?: number;
  /** Render a filled area under the line (flat semi-transparent fill — Semrush-style) */
  area?: boolean;
  /** Show data point dots on parent hover (uses Tailwind `group-hover`) */
  showDotsOnHover?: boolean;
  /** Interactive mode — tracks cursor, shows dot + ChartTooltip at nearest point */
  interactive?: boolean;
  /** Labels per data point (typically dates) — shown in tooltip when interactive */
  labels?: string[];
  /** Custom tooltip body — overrides default `label · value` rendering */
  formatTooltip?: (value: number, label?: string, index?: number) => ReactNode;
  /** Value formatter for the default tooltip body */
  formatValue?: (value: number) => string;
}

export function Sparkline({
  data,
  color = "var(--accent-primary)",
  width = 56,
  height = 22,
  inverted = false,
  strokeWidth = 1.5,
  area = false,
  showDotsOnHover = false,
  interactive = false,
  labels,
  formatTooltip,
  formatValue = (v) => v.toLocaleString("fr-FR"),
}: SparklineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (data.length < 2) {
    return <span className="type-body-sm text-[var(--text-muted)]">—</span>;
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const pct = (v - min) / range;
    const y = inverted ? height * pct : height - height * pct;
    return { x, y };
  });

  const lineD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaD = `${lineD} L ${pts[pts.length - 1].x.toFixed(1)} ${height} L ${pts[0].x.toFixed(1)} ${height} Z`;

  const reactId = useId().replace(/:/g, "");
  const gradId = `sparkline-grad-${reactId}`;
  const svg = (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        {area && (
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.28 }} />
            <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
          </linearGradient>
        )}
        {/* Fade des extrémités : la courbe (et l'aire) s'estompent aux bords. */}
        <linearGradient id={`${gradId}-edge`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="white" stopOpacity="0" />
          <stop offset="0.08" stopColor="white" stopOpacity="1" />
          <stop offset="0.92" stopColor="white" stopOpacity="1" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id={`${gradId}-edgemask`}>
          <rect x={0} y={0} width={width} height={height} fill={`url(#${gradId}-edge)`} />
        </mask>
      </defs>
      <g mask={`url(#${gradId}-edgemask)`}>
        {area && <path d={areaD} fill={`url(#${gradId})`} />}
        <path
          d={lineD}
          fill="none"
          style={{ stroke: color }}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      {showDotsOnHover && pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={2.5}
          style={{ fill: color }}
          stroke="#FFFFFF"
          strokeWidth={1.5}
          className="opacity-0 transition-opacity group-hover:opacity-100"
        />
      ))}
    </svg>
  );

  if (!interactive) return svg;

  function handleMove(e: React.MouseEvent) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const xViewBox = ((e.clientX - rect.left) / rect.width) * width;
    let best = 0;
    let bestDist = Infinity;
    pts.forEach((p, i) => {
      const d = Math.abs(p.x - xViewBox);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    setHoverIdx(best);
  }

  const hov = hoverIdx !== null ? pts[hoverIdx] : null;
  const hovValue = hoverIdx !== null ? data[hoverIdx] : null;
  const hovLabel = hoverIdx !== null ? labels?.[hoverIdx] : undefined;
  let tipX = 0, tipY = 0;
  if (hov && containerRef.current) {
    const rect = containerRef.current.getBoundingClientRect();
    tipX = (hov.x / width) * rect.width;
    tipY = (hov.y / height) * rect.height;
  }

  return (
    <div
      ref={containerRef}
      className="relative cursor-crosshair"
      style={{ width, height }}
      onMouseMove={handleMove}
      onMouseLeave={() => setHoverIdx(null)}
    >
      {svg}
      {hov && (
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="pointer-events-none absolute inset-0 overflow-visible"
        >
          <circle cx={hov.x} cy={hov.y} r={3} style={{ fill: color }} stroke="#FFFFFF" strokeWidth={1.5} />
        </svg>
      )}
      {hov && hovValue !== null && (
        <ChartTooltip x={tipX} y={tipY - 4}>
          {formatTooltip ? (
            formatTooltip(hovValue, hovLabel, hoverIdx ?? 0)
          ) : (
            <div className="flex flex-col gap-0.5">
              {hovLabel && <span className="type-micro text-white/60">{hovLabel}</span>}
              <span className="type-label text-white">{formatValue(hovValue)}</span>
            </div>
          )}
        </ChartTooltip>
      )}
    </div>
  );
}
