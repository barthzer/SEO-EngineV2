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
  gap?: number;
  formatTooltip?: (slice: DonutSlice, pct: number) => ReactNode;
  className?: string;
}

export function DonutChart({
  slices,
  size = 112,
  strokeWidth = 10,
  center,
  gap = 6,
  formatTooltip,
  className = "",
}: DonutChartProps) {
  const [hovered, setHovered] = useState<{ slice: DonutSlice; pct: number; x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const total = slices.reduce((s, d) => s + d.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - strokeWidth) / 2;
  const toRad = (deg: number) => (deg - 90) * Math.PI / 180;
  const pt = (deg: number) => ({
    x: cx + r * Math.cos(toRad(deg)),
    y: cy + r * Math.sin(toRad(deg)),
  });

  let angle = 0;
  const arcs = slices.map((d) => {
    const span = (d.value / total) * 360;
    const midDeg = angle + span / 2;
    const startDeg = angle + gap / 2;
    const endDeg = angle + span - gap / 2;
    const large = span - gap > 180 ? 1 : 0;
    const s = pt(startDeg);
    const e = pt(endDeg);
    const path = `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
    angle += span;
    return { ...d, path, midDeg, pct: Math.round((d.value / total) * 100) };
  });

  function handleMouseEnter(e: React.MouseEvent, arc: typeof arcs[0]) {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const svgRect = svgEl.getBoundingClientRect();
    const midPt = pt(arc.midDeg);
    const scaleX = svgRect.width / size;
    const scaleY = svgRect.height / size;
    setHovered({
      slice: { label: arc.label, value: arc.value, color: arc.color },
      pct: arc.pct,
      x: midPt.x * scaleX,
      y: midPt.y * scaleY - strokeWidth * scaleY,
    });
  }

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        onMouseLeave={() => setHovered(null)}
      >
        {/* Track ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border-subtle)" strokeWidth={strokeWidth} />

        {arcs.map((arc, i) => (
          <path
            key={i}
            d={arc.path}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity={hovered && hovered.slice.label !== arc.label ? 0.35 : 1}
            style={{ cursor: "pointer", transition: "opacity 0.15s" }}
            onMouseEnter={(e) => handleMouseEnter(e, arc)}
          />
        ))}

        {center && (
          <foreignObject x={strokeWidth} y={strokeWidth} width={size - strokeWidth * 2} height={size - strokeWidth * 2}>
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {center}
            </div>
          </foreignObject>
        )}
      </svg>

      {hovered && (
        <ChartTooltip x={hovered.x} y={hovered.y}>
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
