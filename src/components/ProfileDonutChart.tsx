"use client";

import { useState, useRef, type ReactNode } from "react";
import { ChartTooltip } from "@/components/Tooltip";

export interface ProfileDonutSlice {
  label: string;
  value: number;
  color: string;
}

interface ProfileDonutChartProps {
  data: ProfileDonutSlice[];
  /** Centre value (defaults to total of slice values) */
  centerValue?: ReactNode;
  /** Centre sub-label, e.g. "URLs" */
  centerLabel?: string;
  /** Donut diameter in px (default 184) */
  size?: number;
  /** Stroke width in px (default 7) */
  strokeWidth?: number;
  /** Gap between arcs in degrees (default 7) */
  gapDeg?: number;
}

export function ProfileDonutChart({
  data,
  centerValue,
  centerLabel,
  size = 184,
  strokeWidth = 7,
  gapDeg = 7,
}: ProfileDonutChartProps) {
  const [hovered, setHovered] = useState<{ label: string; value: number; color: string; x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const cx = size / 2, cy = size / 2;
  const r = size / 2 - strokeWidth / 2 - 1;

  const toRad = (deg: number) => (deg - 90) * Math.PI / 180;
  const pt = (deg: number) => ({ x: cx + r * Math.cos(toRad(deg)), y: cy + r * Math.sin(toRad(deg)) });

  let angle = 0;
  const arcs = data.map((d) => {
    const span = (d.value / total) * 360;
    const midDeg = angle + span / 2;
    const s = pt(angle + gapDeg / 2);
    const e = pt(angle + span - gapDeg / 2);
    const large = span - gapDeg > 180 ? 1 : 0;
    const path = `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
    angle += span;
    return { ...d, path, midDeg };
  });

  function handleMouseEnter(_e: React.MouseEvent<SVGPathElement>, d: typeof arcs[0]) {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const svgRect = svgEl.getBoundingClientRect();
    const mid = pt(d.midDeg);
    const scaleX = svgRect.width / size;
    const scaleY = svgRect.height / size;
    setHovered({
      label: d.label,
      value: d.value,
      color: d.color,
      x: mid.x * scaleX,
      y: mid.y * scaleY - strokeWidth * scaleY,
    });
  }

  return (
    <div className="flex items-center gap-8">
      <div className="relative flex-shrink-0">
        <svg
          ref={svgRef}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          onMouseLeave={() => setHovered(null)}
        >
          {arcs.map((d, i) => (
            <path
              key={i}
              d={d.path}
              fill="none"
              stroke={d.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              opacity={hovered && hovered.label !== d.label ? 0.35 : 1}
              style={{ cursor: "pointer", transition: "opacity 0.15s" }}
              onMouseEnter={(e) => handleMouseEnter(e, d)}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[24px] font-semibold tracking-heading leading-none text-[var(--text-primary)]">
            {centerValue ?? total}
          </span>
          {centerLabel && (
            <span className="mt-0.5 text-[11px] tracking-caption text-[var(--text-muted)]">{centerLabel}</span>
          )}
        </div>
        {hovered && (
          <ChartTooltip x={hovered.x} y={hovered.y}>
            <p className="text-[12px] font-semibold text-white">{hovered.label}</p>
            <p className="text-[11px] text-white/60">
              <span className="font-semibold text-white">{hovered.value}</span>
              {" — "}{Math.round(hovered.value / total * 100)}%
            </p>
          </ChartTooltip>
        )}
      </div>
      <div className="flex flex-col gap-2.5">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-[13px] tracking-body text-[var(--text-secondary)]">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
