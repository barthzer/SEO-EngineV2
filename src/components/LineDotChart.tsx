"use client";

import { useId, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
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
  /** Force min on Y axis (sinon = min des données). Utile pour aplatir les variations en partant de 0. */
  yMin?: number;
  /** Force max on Y axis (sinon = max des données) */
  yMax?: number;
}

export function LineDotChart({
  data,
  color = "var(--accent-primary)",
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
  yMin: yMinProp,
  yMax: yMaxProp,
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
  const minV = yMinProp ?? Math.min(...vals);
  const maxV = yMaxProp ?? Math.max(...vals);
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

  const reactId = useId().replace(/:/g, "");
  const gradId = `linedotchart-grad-${reactId}`;

  const tickCount = Math.max(2, yTicks);
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const t = i / (tickCount - 1);
    const v = invertY ? minV + t * range : maxV - t * range;
    const y = PAD_TOP + t * chartH;
    return { v, y };
  });

  // Positions X retenues (~7 max, espacées) — servent aux labels ET à la grille verticale.
  const xStep = Math.max(1, Math.ceil(pts.length / 7));
  const xGridPts = pts.filter((_, i) => i % xStep === 0 || i === pts.length - 1);

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
            <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.22 }} />
            <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
          </linearGradient>
        </defs>

        {/* Grille verticale — alignée sur les labels de l'axe X (plus de lignes horizontales) */}
        {xGridPts.map((p, i) => (
          <line
            key={`grid-${i}`}
            x1={p.x}
            y1={PAD_TOP}
            x2={p.x}
            y2={PAD_TOP + chartH}
            stroke="var(--border-subtle)"
            strokeWidth={1}
          />
        ))}

        {/* Y axis labels */}
        {ticks.map((t, i) => (
          <text
            key={i}
            x={yAxisWidth - 6}
            y={t.y + 4}
            textAnchor="end"
            fontSize={12}
            fill="var(--text-muted)"
          >
            {formatValue(t.v)}
          </text>
        ))}

        {/* Area gradient */}
        <path d={areaD} fill={`url(#${gradId})`} />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          style={{ stroke: color }}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Date labels — mêmes positions que la grille verticale (max ~7) */}
        {xGridPts.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={height - 4}
            textAnchor="middle"
            fontSize={12}
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
            style={{ fill: color }}
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

      {hovPt && (() => {
        // Coordonnées viewport (le tooltip est en portail position:fixed pour échapper
        // à tout conteneur clippé ou avec z-index plus haut autour de la modale).
        const rect = svgRef.current?.getBoundingClientRect();
        const tipX = (rect?.left ?? 0) + hovPt.x;
        const tipY = (rect?.top ?? 0) + hovPt.y - 8;
        return (
          <ChartTooltip x={tipX} y={tipY} portal>
            <div className="flex flex-col gap-0.5">
              <span className="type-micro text-white/60">{formatDate(hovPt.date)}</span>
              <span className="type-label text-white">{formatValue(hovPt.val)}</span>
            </div>
          </ChartTooltip>
        );
      })()}
    </div>
  );
}
