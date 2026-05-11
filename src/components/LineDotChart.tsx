"use client";

import { useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { ChartTooltip } from "@/components/Tooltip";

interface LineDotChartProps {
  data: { val: number; date: string }[];
  color?: string;
  /** Fixed pixel height. Ignored when `fillHeight` is true. */
  height?: number;
  /** When true, chart fills its parent container's height (via ResizeObserver). */
  fillHeight?: boolean;
  /** true = lower value is "better" (drawn higher), e.g. position metric */
  invertY?: boolean;
  formatValue?: (v: number) => string;
  /** Date format used inside the hover tooltip (default: full localised date) */
  formatDate?: (d: string) => string;
  /** Date format used on the X axis labels — keep it short to avoid overcrowding (default: month only) */
  formatXLabel?: (d: string) => string;
  /** Number of Y-axis ticks (min 2) */
  yTicks?: number;
  /** Width reserved for Y axis labels on the left */
  yAxisWidth?: number;
}

export function LineDotChart({
  data,
  color = "#3E50F5",
  height: heightProp = 180,
  fillHeight = false,
  invertY = false,
  formatValue = (v) => v.toString(),
  formatDate = (d) => {
    const dt = new Date(d);
    return Number.isNaN(dt.getTime()) ? d : dt.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  },
  formatXLabel = (d) => {
    const dt = new Date(d);
    return Number.isNaN(dt.getTime()) ? d : dt.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "");
  },
  yTicks = 4,
  yAxisWidth = 36,
}: LineDotChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [containerW, setContainerW] = useState(0);
  const [containerH, setContainerH] = useState(0);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerW(entry.contentRect.width);
      if (fillHeight) setContainerH(entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [fillHeight]);

  const height = fillHeight ? containerH : heightProp;

  if (data.length < 2) return null;

  const PAD_TOP = 16;
  const PAD_BOTTOM = 22;
  const PAD_RIGHT = 12;

  const chartW = Math.max(1, containerW - yAxisWidth - PAD_RIGHT);
  const chartH = height - PAD_TOP - PAD_BOTTOM;

  const vals = data.map((d) => d.val);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const range = maxV - minV || 1;

  const yFor = (v: number) => {
    const t = (v - minV) / range;
    const tOnScreen = invertY ? t : 1 - t;
    return PAD_TOP + tOnScreen * chartH;
  };

  const xFor = (i: number) => yAxisWidth + (i / (data.length - 1)) * chartW;

  const pts = data.map((d, i) => ({
    x: xFor(i),
    y: yFor(d.val),
    val: d.val,
    date: d.date,
  }));

  const pathD = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const baselineY = (PAD_TOP + chartH).toFixed(1);
  const areaD = `${pathD} L ${pts[pts.length - 1].x.toFixed(1)} ${baselineY} L ${pts[0].x.toFixed(1)} ${baselineY} Z`;

  const gradId = `linedotchart-grad-${color.replace("#", "")}`;

  const tickCount = Math.max(2, yTicks);
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const t = i / (tickCount - 1);
    const v = invertY ? minV + t * range : maxV - t * range;
    const y = PAD_TOP + t * chartH;
    return { v, y };
  });

  function handleMove(e: MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < pts.length; i++) {
      const d = Math.abs(pts[i].x - x);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    setHoverIdx(best);
  }

  const hovPt = hoverIdx !== null ? pts[hoverIdx] : null;

  if (containerW === 0 || (fillHeight && containerH === 0)) {
    return <div ref={containerRef} className={fillHeight ? "h-full w-full" : ""} style={fillHeight ? undefined : { height }} />;
  }

  return (
    <div ref={containerRef} className={`relative ${fillHeight ? "h-full w-full" : ""}`} onMouseLeave={() => setHoverIdx(null)}>
      <svg
        ref={svgRef}
        width={containerW}
        height={height}
        className="overflow-visible"
        onMouseMove={handleMove}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.22} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Y axis labels + grid lines */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={yAxisWidth}
              y1={t.y}
              x2={yAxisWidth + chartW}
              y2={t.y}
              stroke="var(--border-subtle)"
              strokeWidth={1}
            />
            <text
              x={yAxisWidth - 6}
              y={t.y + 3}
              textAnchor="end"
              fontSize={10}
              fill="var(--text-muted)"
            >
              {formatValue(t.v)}
            </text>
          </g>
        ))}

        {/* Area gradient */}
        <path d={areaD} fill={`url(#${gradId})`} />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Date labels under each point — short month-only by default */}
        {pts.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={height - 4}
            textAnchor="middle"
            fontSize={10}
            fill="var(--text-muted)"
          >
            {formatXLabel(p.date)}
          </text>
        ))}

        {/* Dots */}
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={hoverIdx === i ? 5 : 4}
            fill={color}
            stroke="#FFFFFF"
            strokeWidth={2}
          />
        ))}

        {/* Hover crosshair */}
        {hovPt && (
          <line
            x1={hovPt.x}
            y1={PAD_TOP}
            x2={hovPt.x}
            y2={PAD_TOP + chartH}
            stroke="var(--border-subtle)"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
        )}
      </svg>

      {hovPt && (
        <ChartTooltip x={hovPt.x} y={hovPt.y - 8}>
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-white/60">{formatDate(hovPt.date)}</span>
            <span className="text-[13px] font-semibold text-white">{formatValue(hovPt.val)}</span>
          </div>
        </ChartTooltip>
      )}
    </div>
  );
}
