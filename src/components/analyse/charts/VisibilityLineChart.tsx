"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { ChartTooltip } from "@/components/Tooltip";
import { FilterTabs } from "@/components/FilterTabs";

const VISIBILITY_DATA = [
  { month: "Mai",   value: 18  },
  { month: "Juin",  value: 28  },
  { month: "Juil",  value: 35  },
  { month: "Août",  value: 43  },
  { month: "Sept",  value: 58  },
  { month: "Oct",   value: 67  },
  { month: "Nov",   value: 72  },
  { month: "Déc",   value: 79  },
  { month: "Janv",  value: 87  },
  { month: "Févr",  value: 92  },
  { month: "Mars",  value: 99  },
  { month: "Avr",   value: 107 },
];

// Fluctuations déterministes pour les 4 sous-points entre chaque mois
const FLUC = [1, 0, 2, 0, 0, -2, 0, 1, 0, 3, 0, -1, 0, 0, 2, 0, -3, 0, 0, 1, 0, 2, 0, 0, -1, 0, 0, -2, 1, 0, 0, 3, 0, -1, 0, 0, 2, 0, -2, 0, 0, 1, 0, -3];

const VISIBILITY_BY_PERIOD = {
  "3m":  VISIBILITY_DATA.slice(-3),
  "6m":  VISIBILITY_DATA.slice(-6),
  "1an": VISIBILITY_DATA,
} as const;

export function VisibilityLineChart({ title, subtitle }: { title?: string; subtitle?: string } = {}) {
  const [period, setPeriod] = useState<"3m" | "6m" | "1an">("1an");
  const [hovered, setHovered] = useState<{ idx: number; mouseX: number; mouseY: number } | null>(null);
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

  useEffect(() => setHovered(null), [period]);

  const visData = VISIBILITY_BY_PERIOD[period];

  const chartH = 200, lm = 38, tm = 12, bm = 26;
  const chartW = Math.max(1, containerW - lm - 10);
  const svgH = chartH + tm + bm;
  // kept for coordinate math below (no viewBox → SVG units = px)
  const vbW = containerW, vbH = svgH;
  const yMin = 0, yMax = 120;

  // Expand: 4 sub-points between each monthly anchor
  const expanded: { value: number; month?: string; isMonth: boolean }[] = [];
  for (let i = 0; i < visData.length; i++) {
    expanded.push({ value: visData[i].value, month: visData[i].month, isMonth: true });
    if (i < visData.length - 1) {
      const v0 = visData[i].value;
      const v1 = visData[i + 1].value;
      for (let j = 0; j < 4; j++) {
        const t = (j + 1) / 5;
        const base = v0 + (v1 - v0) * t;
        const fluct = FLUC[(i * 4 + j) % FLUC.length];
        expanded.push({ value: Math.round(base + fluct), isMonth: false });
      }
    }
  }

  const n = expanded.length;
  const pts = expanded.map((d, i) => ({
    ...d,
    x: lm + (i / (n - 1)) * chartW,
    y: tm + chartH * (1 - (d.value - yMin) / (yMax - yMin)),
  }));

  // Repères verticaux (grille + labels) : au plus 6, à espacement CONSTANT et
  // bornés aux extrêmes (1er repère au bord gauche, dernier au bord droit). On place
  // K positions uniformes sur toute la largeur, puis on étiquette avec le mois le plus
  // proche — écart identique quelle que soit la période, pas de décalage en fin de graph.
  const monthPts = pts.filter((pt) => pt.isMonth);
  const MAX_TICKS = 6;
  const K = Math.min(MAX_TICKS, monthPts.length);
  const firstX = monthPts[0].x;
  const lastX = monthPts[monthPts.length - 1].x;
  const tickPts = Array.from({ length: K }, (_, k) => {
    const x = K === 1 ? firstX : firstX + (k / (K - 1)) * (lastX - firstX);
    const month = monthPts.reduce((a, b) => (Math.abs(b.x - x) < Math.abs(a.x - x) ? b : a)).month;
    return { x, month };
  });

  let linePath = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cpX = (pts[i - 1].x + pts[i].x) / 2;
    linePath += ` C ${cpX} ${pts[i - 1].y}, ${cpX} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
  }
  const areaPath = `${linePath} L ${pts[n - 1].x} ${tm + chartH} L ${pts[0].x} ${tm + chartH} Z`;

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const svgEl = svgRef.current;
    const containerEl = containerRef.current;
    if (!svgEl || !containerEl) return;
    const rect = svgEl.getBoundingClientRect();
    const svgX = (e.clientX - rect.left) / rect.width * vbW;
    let nearestIdx = 0;
    let minDist = Math.abs(pts[0].x - svgX);
    pts.forEach((pt, i) => { const d = Math.abs(pt.x - svgX); if (d < minDist) { minDist = d; nearestIdx = i; } });
    const cRect = containerEl.getBoundingClientRect();
    const nearPt = pts[nearestIdx];
    setHovered({ idx: nearestIdx, mouseX: e.clientX - cRect.left, mouseY: nearPt.y / vbH * rect.height });
  }

  const hovPt = hovered !== null ? pts[hovered.idx] : null;
  // Label de la tooltip : mois le plus proche à gauche
  const hovMonth = hovered !== null ? expanded.slice(0, hovered.idx + 1).reverse().find(d => d.isMonth)?.month : null;

  return (
    <div>
      <div className={`mb-4 flex gap-3 ${title ? "items-start justify-between" : "justify-end"}`}>
        {title && (
          <div className="min-w-0">
            <p className="type-h3">{title}</p>
            {subtitle && <p className="mt-1.5 type-body leading-snug text-[var(--text-secondary)]">{subtitle}</p>}
          </div>
        )}
        <FilterTabs
          tabs={[{ key: "3m", label: "3m" }, { key: "6m", label: "6m" }, { key: "1an", label: "1 an" }]}
          value={period}
          onChange={setPeriod}
        />
      </div>
      <div ref={containerRef} className="relative" onMouseLeave={() => setHovered(null)}>
      <svg ref={svgRef} width={containerW || undefined} height={svgH} className="overflow-visible" onMouseMove={handleMouseMove}>
        <defs>
          <linearGradient id="vis-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--accent-primary)", stopOpacity: 0.12 }} />
            <stop offset="100%" style={{ stopColor: "var(--accent-primary)", stopOpacity: 0 }} />
          </linearGradient>
          {/* Fade des extrémités : la courbe + l'aire s'estompent aux bords gauche/droit. */}
          <linearGradient id="vis-edge-fade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="white" stopOpacity="0" />
            <stop offset="0.08" stopColor="white" stopOpacity="1" />
            <stop offset="0.92" stopColor="white" stopOpacity="1" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="vis-edge-mask">
            <rect x={lm} y={0} width={chartW} height={svgH} fill="url(#vis-edge-fade)" />
          </mask>
        </defs>
        {/* Grille verticale — repères thinés (≤ 6) pour ne pas surcharger sur « 1 an » */}
        {tickPts.map((pt, i) => (
          <line key={`grid-${i}`} x1={pt.x} y1={tm} x2={pt.x} y2={tm + chartH} stroke="var(--border-subtle)" strokeWidth="1" />
        ))}
        {/* Y labels */}
        {[11, 36, 61, 86, 111].map((v) => {
          const y = tm + chartH * (1 - (v - yMin) / (yMax - yMin));
          return (
            <text key={v} x={lm - 6} y={y + 4} textAnchor="end" fontSize={12} fill="var(--text-muted)">{v}</text>
          );
        })}
        {/* X labels — mêmes repères thinés que la grille */}
        {tickPts.map((pt, i) => (
          <text key={i} x={pt.x} y={tm + chartH + 18} textAnchor="middle" fontSize={12} fill="var(--text-muted)">{pt.month}</text>
        ))}
        <g mask="url(#vis-edge-mask)">
          <path d={areaPath} fill="url(#vis-grad)" />
          <path d={linePath} fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        {hovPt && (
          <circle cx={hovPt.x} cy={hovPt.y} r={4} fill="var(--accent-primary)" stroke="var(--bg-card)" strokeWidth="2" />
        )}
      </svg>
      {hovered && hovPt && (
        <ChartTooltip x={hovered.mouseX} y={hovered.mouseY - 8}>
          {hovMonth && <p className="type-micro text-white/60">{hovMonth}</p>}
          <p className="type-label font-semibold text-white">{hovPt.value}</p>
        </ChartTooltip>
      )}
      </div>
    </div>
  );
}
