"use client";

import { useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
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
  /** Si true : ignore `height` et adopte la hauteur du parent (ResizeObserver). */
  fillHeight?: boolean;
  yMin?: number;
  yMax?: number;
  inverted?: boolean;
  actionDots?: ActionDot[];
  formatTooltip?: (point: AreaChartPoint) => ReactNode;
  /** Format des labels sur l'axe Y. Défaut : suffixe k/M auto pour ≥1000. */
  formatYTick?: (v: number) => string;
  gradientId?: string;
}

/* ─── Nice-scale algorithm (Wilkinson-style) ───
 * Snappe min/max/ticks à des valeurs rondes (200k, 250k, 300k au lieu de
 * 218 300, 235 580, ...). Améliore drastiquement la lisibilité de l'axe Y. */
function niceNum(range: number, round: boolean): number {
  if (range <= 0) return 1;
  const exp = Math.floor(Math.log10(range));
  const fraction = range / Math.pow(10, exp);
  let niceFraction: number;
  if (round) {
    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
    else niceFraction = 10;
  } else {
    if (fraction <= 1) niceFraction = 1;
    else if (fraction <= 2) niceFraction = 2;
    else if (fraction <= 5) niceFraction = 5;
    else niceFraction = 10;
  }
  return niceFraction * Math.pow(10, exp);
}

function niceScale(min: number, max: number, maxTicks = 5): { min: number; max: number; ticks: number[] } {
  const range = niceNum(max - min, false);
  const step = niceNum(range / (maxTicks - 1), true);
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = niceMin; v <= niceMax + step * 1e-9; v += step) ticks.push(v);
  return { min: niceMin, max: niceMax, ticks };
}

/** Format par défaut : ≥1M → "1,2M", ≥1000 → "12k", sinon entier. */
function defaultYTickFormat(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) {
    return `${(v / 1_000_000).toFixed(1).replace(".", ",").replace(/,0$/, "")}M`;
  }
  if (abs >= 1000) {
    return `${Math.round(v / 1000)}k`;
  }
  return Math.round(v).toString();
}

export function AreaChart({
  data,
  color = "var(--accent-primary)",
  height: heightProp = 160,
  fillHeight = false,
  yMin: yMinProp,
  yMax: yMaxProp,
  inverted = false,
  actionDots,
  formatTooltip,
  formatYTick = defaultYTickFormat,
  gradientId,
}: AreaChartProps) {
  const [hovered, setHovered] = useState<{ idx: number; x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [containerW, setContainerW] = useState(0);
  const [containerH, setContainerH] = useState(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerW(entry.contentRect.width);
      setContainerH(entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const lm = 36, tm = 12, bm = 24;
  const chartW = Math.max(1, containerW - lm - 10);
  // En mode fillHeight, on déduit chartH de la hauteur observée ; sinon fixe via prop.
  const chartH = fillHeight ? Math.max(80, containerH - tm - bm) : heightProp;
  const svgH = chartH + tm + bm;

  const vals = data.map((d) => d.value);
  const autoMin = Math.min(...vals);
  const autoMax = Math.max(...vals);
  // Échelle "nice" : ticks ronds (200k, 250k…) au lieu de valeurs brutes
  const nice = niceScale(autoMin, autoMax, 5);
  const yMin = yMinProp ?? nice.min;
  const yMax = yMaxProp ?? nice.max;
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
  // Le fill descend toujours sous la ligne (même en mode inverted) — visuellement plus naturel.
  const areaBase = tm + chartH;
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${areaBase} L ${pts[0].x} ${areaBase} Z`;

  const reactId = useId().replace(/:/g, "");
  const gradId = gradientId ?? `area-grad-${reactId}`;

  // Si min/max custom passés (yMinProp/yMaxProp), recalcule des quartiles ;
  // sinon utilise les ticks nice issus de niceScale().
  const yTicks =
    yMinProp !== undefined || yMaxProp !== undefined
      ? [yMin, yMin + yRange * 0.25, yMin + yRange * 0.5, yMin + yRange * 0.75, yMax].filter(
          (v, i, a) => a.indexOf(v) === i,
        )
      : nice.ticks;

  // Positions de l'axe X retenues (≤ 6, espacées) — servent aux labels ET à la grille verticale.
  const xLabelPts = pts.filter((_, i) => {
    if (pts.length <= 6) return true;
    const step = Math.ceil(pts.length / 6);
    return i === 0 || i === pts.length - 1 || i % step === 0;
  });

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

  if (containerW === 0) {
    return (
      <div
        ref={containerRef}
        className={fillHeight ? "h-full w-full" : ""}
        style={fillHeight ? undefined : { height: svgH }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${fillHeight ? "h-full w-full" : ""}`}
      onMouseLeave={() => setHovered(null)}
    >
      <svg
        ref={svgRef}
        width={containerW}
        height={svgH}
        className="overflow-visible"
        onMouseMove={handleMouseMove}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.14 }} />
            <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
          </linearGradient>
          {/* Fade des extrémités : la courbe + l'aire s'estompent aux bords gauche/droit. */}
          <linearGradient id={`${gradId}-edge`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="white" stopOpacity="0" />
            <stop offset="0.08" stopColor="white" stopOpacity="1" />
            <stop offset="0.92" stopColor="white" stopOpacity="1" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id={`${gradId}-edgemask`}>
            <rect x={lm} y={0} width={chartW} height={svgH} fill={`url(#${gradId}-edge)`} />
          </mask>
        </defs>

        {/* Grille verticale — alignée sur les labels de l'axe X (plus de lignes horizontales) */}
        {xLabelPts.map((pt) => (
          <line key={`grid-${pt.label}`} x1={pt.x} y1={tm} x2={pt.x} y2={tm + chartH} stroke="var(--border-subtle)" strokeWidth="1" />
        ))}

        {/* Y labels (formatés avec suffixe k/M par défaut) */}
        {yTicks.map((v) => {
          const y = toY(v);
          return (
            <text key={v} x={lm - 6} y={y + 4} textAnchor="end" fontSize={12} fill="var(--text-muted)">{formatYTick(v)}</text>
          );
        })}

        {/* X labels */}
        {xLabelPts.map((pt) => (
          <text key={pt.label} x={pt.x} y={tm + chartH + 16} textAnchor="middle" fontSize={12} fill="var(--text-muted)">{pt.label}</text>
        ))}

        {/* Area + line — fade aux extrémités */}
        <g mask={`url(#${gradId}-edgemask)`}>
          <path d={areaPath} fill={`url(#${gradId})`} />
          <path d={linePath} fill="none" style={{ stroke: color }} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Action markers — trait vertical pointillé + petit triangle au sommet */}
        {actionDots?.map((dot) => {
          const pt = pts[dot.idx];
          if (!pt) return null;
          const accent = "var(--accent-primary)";
          return (
            <g key={dot.idx}>
              <line
                x1={pt.x}
                y1={tm}
                x2={pt.x}
                y2={tm + chartH}
                style={{ stroke: accent }}
                strokeWidth={1}
                strokeDasharray="3 3"
                opacity={0.5}
              />
              <polygon
                points={`${pt.x - 4},${tm} ${pt.x + 4},${tm} ${pt.x},${tm + 5}`}
                style={{ fill: accent }}
              />
            </g>
          );
        })}

        {/* Hover crosshair + dot */}
        {hovPt && (
          <>
            <line x1={hovPt.x} y1={tm} x2={hovPt.x} y2={tm + chartH} stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="4 3" />
            <circle cx={hovPt.x} cy={hovPt.y} r={4} style={{ fill: color }} stroke="var(--bg-card)" strokeWidth="2" />
          </>
        )}
      </svg>

      {hovered !== null && hovPt && (() => {
        // Portail position:fixed pour échapper aux conteneurs clippés et stacking contexts
        const rect = svgRef.current?.getBoundingClientRect();
        const tipX = (rect?.left ?? 0) + hovered.x;
        const tipY = (rect?.top ?? 0) + hovered.y - 8;
        return (
          <ChartTooltip x={tipX} y={tipY} portal>
            {formatTooltip
              ? formatTooltip(hovPt)
              : (
                <div className="flex flex-col gap-0.5">
                  <span className="type-micro text-white/60">{hovPt.label}</span>
                  <span className="type-label text-white">{hovPt.value}</span>
                </div>
              )}
          </ChartTooltip>
        );
      })()}
    </div>
  );
}
