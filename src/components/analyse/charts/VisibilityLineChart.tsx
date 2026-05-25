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

export function VisibilityLineChart() {
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
      <div className="mb-4 flex justify-end">
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
        </defs>
        {[11, 36, 61, 86, 111].map((v) => {
          const y = tm + chartH * (1 - (v - yMin) / (yMax - yMin));
          return (
            <g key={v}>
              <line x1={lm} y1={y} x2={lm + chartW} y2={y} stroke="var(--border-subtle)" strokeWidth="1" />
              <text x={lm - 6} y={y + 4} textAnchor="end" fontSize={12} fill="var(--text-muted)">{v}</text>
            </g>
          );
        })}
        {pts.filter(pt => pt.isMonth).map((pt, i) => (
          <text key={i} x={pt.x} y={tm + chartH + 18} textAnchor="middle" fontSize={12} fill="var(--text-muted)">{pt.month}</text>
        ))}
        <path d={areaPath} fill="url(#vis-grad)" />
        <path d={linePath} fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {hovPt && (
          <circle cx={hovPt.x} cy={hovPt.y} r={4} fill="var(--accent-primary)" stroke="var(--bg-card)" strokeWidth="2" />
        )}
      </svg>
      {hovered && hovPt && (
        <ChartTooltip x={hovered.mouseX} y={hovered.mouseY - 8}>
          {hovMonth && <p className="text-[11px] font-medium text-white/60">{hovMonth}</p>}
          <p className="text-[13px] font-semibold text-white">{hovPt.value}</p>
        </ChartTooltip>
      )}
      </div>
    </div>
  );
}
