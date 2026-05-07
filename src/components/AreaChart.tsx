"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ChartTooltip } from "@/components/Tooltip";

export interface AreaChartPoint {
  label: string;
  value: number;
}

interface ActionDot {
  idx: number;
}

interface AreaChartProps {
  data: AreaChartPoint[];
  color?: string;
  height?: number;
  yMin?: number;
  yMax?: number;
  inverted?: boolean;
  actionDots?: ActionDot[];
  formatTooltip?: (point: AreaChartPoint) => ReactNode;
  gradientId?: string;
}

export function AreaChart({
  data,
  color = "#3E50F5",
  height: chartH = 160,
  yMin: yMinProp,
  yMax: yMaxProp,
  inverted = false,
  actionDots,
  formatTooltip,
  gradientId,
}: AreaChartProps) {
  const [hovered, setHovered] = useState<{ idx: number; x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [containerW, setContainerW] = useState(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setContainerW(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const lm = 36, tm = 12, bm = 24;
  const chartW = Math.max(1, containerW - lm - 10);
  const svgH = chartH + tm + bm;

  const vals = data.map((d) => d.value);
  const autoMin = Math.min(...vals);
  const autoMax = Math.max(...vals);
  const range = autoMax - autoMin || 1;
  const yMin = yMinProp ?? (autoMin - range * 0.1);
  const yMax = yMaxProp ?? (autoMax + range * 0.1);
  const yRange = yMax - yMin || 1;

  const toY = (v: number) => {
    const pct = (v - yMin) / yRange;
    return inverted
      ? tm + chartH * pct
      : tm + chartH * (1 - pct);
  };

  const pts = data.map((d, i) => ({
    ...d,
    x: lm + (i / Math.max(1, data.length - 1)) * chartW,
    y: toY(d.value),
  }));

  let linePath = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cpX = (pts[i - 1].x + pts[i].x) / 2;
    linePath += ` C ${cpX} ${pts[i - 1].y}, ${cpX} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
  }
  const areaBase = inverted ? tm : tm + chartH;
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${areaBase} L ${pts[0].x} ${areaBase} Z`;

  const gradId = gradientId ?? `area-grad-${color.replace("#", "")}`;

  const yTick1 = yMin + yRange * 0.25;
  const yTick2 = yMin + yRange * 0.5;
  const yTick3 = yMin + yRange * 0.75;
  const yTicks = [yMin, yTick1, yTick2, yTick3, yMax].filter((v, i, a) => a.indexOf(v) === i);

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const svgEl = svgRef.current;
    const cEl = containerRef.current;
    if (!svgEl || !cEl) return;
    const rect = svgEl.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * containerW;
    let nearestIdx = 0;
    let minDist = Math.abs(pts[0].x - svgX);
    pts.forEach((pt, i) => { const d = Math.abs(pt.x - svgX); if (d < minDist) { minDist = d; nearestIdx = i; } });
    const cRect = cEl.getBoundingClientRect();
    setHovered({
      idx: nearestIdx,
      x: e.clientX - cRect.left,
      y: (pts[nearestIdx].y / svgH) * rect.height,
    });
  }

  const hovPt = hovered !== null ? pts[hovered.idx] : null;

  if (containerW === 0) return <div ref={containerRef} style={{ height: svgH }} />;

  return (
    <div ref={containerRef} className="relative" onMouseLeave={() => setHovered(null)}>
      <svg
        ref={svgRef}
        width={containerW}
        height={svgH}
        className="overflow-visible"
        onMouseMove={handleMouseMove}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={inverted ? "0" : "0.14"} />
            <stop offset="100%" stopColor={color} stopOpacity={inverted ? "0.14" : "0"} />
          </linearGradient>
        </defs>

        {/* Grid lines + Y labels */}
        {yTicks.map((v) => {
          const y = toY(v);
          const label = Number.isInteger(v) ? v : v.toFixed(0);
          return (
            <g key={v}>
              <line x1={lm} y1={y} x2={lm + chartW} y2={y} stroke="var(--border-subtle)" strokeWidth="1" />
              <text x={lm - 6} y={y + 4} textAnchor="end" fontSize={11} fill="var(--text-muted)">{label}</text>
            </g>
          );
        })}

        {/* X labels — show up to 6 evenly */}
        {pts
          .filter((_, i) => {
            if (pts.length <= 6) return true;
            const step = Math.ceil(pts.length / 6);
            return i === 0 || i === pts.length - 1 || i % step === 0;
          })
          .map((pt) => (
            <text key={pt.label} x={pt.x} y={tm + chartH + 16} textAnchor="middle" fontSize={11} fill="var(--text-muted)">{pt.label}</text>
          ))}

        {/* Area + line */}
        <path d={areaPath} fill={`url(#${gradId})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Action dots */}
        {actionDots?.map((dot) => {
          const pt = pts[dot.idx];
          if (!pt) return null;
          return (
            <circle key={dot.idx} cx={pt.x} cy={pt.y} r={4} fill="#F59E0B" stroke="var(--bg-card)" strokeWidth="2" />
          );
        })}

        {/* Hover crosshair + dot */}
        {hovPt && (
          <>
            <line x1={hovPt.x} y1={tm} x2={hovPt.x} y2={tm + chartH} stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="4 3" />
            <circle cx={hovPt.x} cy={hovPt.y} r={4} fill={color} stroke="var(--bg-card)" strokeWidth="2" />
          </>
        )}
      </svg>

      {hovered !== null && hovPt && (
        <ChartTooltip x={hovered.x} y={hovered.y - 8}>
          {formatTooltip
            ? formatTooltip(hovPt)
            : (
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-white/60">{hovPt.label}</span>
                <span className="text-[13px] font-semibold text-white">{hovPt.value}</span>
              </div>
            )}
        </ChartTooltip>
      )}
    </div>
  );
}
