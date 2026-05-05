"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { use } from "react";
import { Button } from "@/components/Button";
import { useToast } from "@/context/ToastContext";
import { Tooltip, ChartTooltip } from "@/components/Tooltip";
import { AnimateIn } from "@/components/AnimateIn";
import { NumberInput } from "@/components/NumberInput";
import { BriefsView, LotList } from "@/components/BriefsView";
import { AuditTechniqueTab } from "@/components/AuditTechniqueTab";
import { AuditEditorialTab } from "@/components/AuditEditorialTab";
import { AuditNetlinkingTab } from "@/components/AuditNetlinkingTab";
import { RankTracker } from "@/components/RankTracker";
import { AuditToc, type TocItem } from "@/components/AuditToc";
import { DropdownMenu, DropdownItem, DropdownSeparator } from "@/components/DropdownMenu";
import { SkeletonAnalyseHeader, SkeletonTabs, SkeletonAnalyseGeneral } from "@/components/Skeleton";
import {
  ChevronRightIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
  ArrowTopRightOnSquareIcon,
  XMarkIcon,
  EllipsisHorizontalIcon,
  EllipsisVerticalIcon,
  Cog6ToothIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  LinkIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  FolderOpenIcon,
  BoltIcon,
  ChevronDownIcon,
  PhotoIcon,
  CursorArrowRaysIcon,
  ArrowsPointingOutIcon,
  PlusIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid, SparklesIcon } from "@heroicons/react/24/solid";

/* ── Helpers ─────────────────────────────────────────────────────────── */

type Tab = "general" | "briefs" | "seo" | "sea" | "forecast" | "netlinking" | "audit";



const GRADIENTS = [
  "linear-gradient(to bottom, #3E50F5, #7B8FF8)",
  "linear-gradient(to bottom, #2563eb, #93c5fd)",
  "linear-gradient(to bottom, #4f46e5, #a5b4fc)",
  "linear-gradient(to bottom, #0284c7, #7dd3fc)",
];

function domainGradient(domain: string) {
  let hash = 0;
  for (let i = 0; i < domain.length; i++) hash = (hash * 31 + domain.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

function FaviconStretch({ domain }: { domain: string }) {
  const [customImg, setCustomImg] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(`project-logo:${domain}`);
    if (saved) setCustomImg(saved);
  }, [domain]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target?.result as string;
      setCustomImg(data);
      localStorage.setItem(`project-logo:${domain}`, data);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const initial = domain.replace(/^www\./, "")[0].toUpperCase();
  const gradient = domainGradient(domain);

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomImg(null);
    localStorage.removeItem(`project-logo:${domain}`);
  };

  return (
    <Tooltip label="Changer le logo du projet" side="top" portal>
      <div
        className="relative h-16 w-16 flex-shrink-0"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Logo clickable area */}
        <div
          className="relative h-full w-full cursor-pointer overflow-hidden rounded-2xl border border-[var(--border-subtle)]"
          onClick={() => inputRef.current?.click()}
        >
          {customImg
            ? <img src={customImg} alt={domain} className="h-full w-full object-contain" />
            : <div className="flex h-full w-full items-center justify-center text-[22px] font-semibold text-white" style={{ background: gradient }}>{initial}</div>
          }

          {/* Hover overlay — "+" icon */}
          <div className={`absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity duration-150 ${hovered ? "opacity-100" : "opacity-0"}`}>
            <PlusIcon className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Remove button — superposé en haut à droite sur la bordure */}
        {customImg && hovered && (
          <button
            onClick={handleRemove}
            className="absolute -right-2 -top-2 z-10 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm transition-colors hover:bg-black/90"
          >
            <XMarkIcon className="h-3 w-3" />
          </button>
        )}

        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    </Tooltip>
  );
}

function ScoreRing({ score, lg = false, md = false }: { score: number; lg?: boolean; md?: boolean }) {
  const color  = score >= 70 ? "#10B981" : score >= 50 ? "#F97316" : "#E11D48";
  const r = lg ? 44 : md ? 32 : 28;
  const stroke = lg ? 5 : md ? 4 : 3.5;
  const sz = (r + stroke) * 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  return (
    <div className="relative flex-shrink-0" style={{ width: sz, height: sz }}>
      <svg width={sz} height={sz} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke="var(--border-subtle)" strokeWidth={stroke} />
        <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-semibold leading-none text-[var(--text-primary)] ${lg ? "text-[22px]" : md ? "text-[17px]" : "text-[15px]"}`}>{score}</span>
        <span className={`text-[var(--text-muted)] ${lg ? "text-[11px]" : "text-[9px]"}`}>/100</span>
      </div>
    </div>
  );
}

/* ── Health panel ────────────────────────────────────────────────────── */

type HealthAction = { label: string; visits?: string };

function SeverityBadge({ level, count }: { level: "critique" | "important"; count: number }) {
  const cfg = level === "critique"
    ? { color: "#E11D48", bg: "rgba(225,29,72,0.09)", label: count === 1 ? "critique" : "critiques" }
    : { color: "#F59E0B", bg: "rgba(245,158,11,0.09)", label: count === 1 ? "important" : "importants" };
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ color: cfg.color, backgroundColor: cfg.bg }}>
      {count} {cfg.label}
    </span>
  );
}

function HealthCard({
  title, score, critiques, importants, visitesRisk, actions, note, cta, ctaHref, color, colorBg, quote,
}: {
  title: string; score?: number; critiques: number; importants?: number;
  visitesRisk: string; actions: HealthAction[]; note?: string; cta: string; ctaHref?: string;
  color: string; colorBg: string; quote?: string;
}) {
  return (
    <div className="flex flex-1 flex-col min-w-0">
      {/* Header */}
      <div className="flex items-start gap-4 p-7 min-h-[128px]">
        <div className="flex-1 min-w-0">
          <p className="text-[18px] font-semibold tracking-tight text-[var(--text-primary)]">{title}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <SeverityBadge level="critique" count={critiques} />
            {importants !== undefined && <SeverityBadge level="important" count={importants} />}
            <span className="text-[11px] text-[var(--text-muted)]">~{visitesRisk} vis./mois à risque</span>
          </div>
        </div>
        {score !== undefined && <ScoreRing score={score} md />}
      </div>

      {quote && (
        <div className="mx-7 mb-4 rounded-2xl bg-[var(--bg-card-hover)] p-3.5">
          <div className="flex items-start gap-2">
            <SparklesIcon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[var(--text-muted)]" />
            <p className="text-[14px] leading-relaxed text-[var(--text-secondary)]">{quote}</p>
          </div>
        </div>
      )}
      <div className="px-7 pb-4">
        <p className="mb-3 text-[13px] font-semibold text-[var(--text-secondary)]">Top actions</p>
        <div className="flex flex-col gap-2.5">
          {actions.map((a, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--bg-card-hover)] text-[15px] font-bold text-[var(--text-secondary)]">
                {i + 1}
              </span>
              <span className="flex-1 text-[13px] font-medium leading-snug text-[var(--text-primary)]">{a.label}</span>
              {a.visits && (
                <span className="flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums" style={{ color, backgroundColor: colorBg }}>
                  {a.visits} vis.
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between px-7 pb-7 pt-1">
        {note ? <span className="text-[11px] text-[var(--text-muted)]">{note}</span> : <span />}
        {ctaHref
          ? <Link href={ctaHref}><Button size="sm" variant="secondary">{cta}</Button></Link>
          : <Button size="sm" variant="secondary">{cta}</Button>
        }
      </div>
    </div>
  );
}

/* ── Metric card ─────────────────────────────────────────────────────── */

/* ── Bloc stratégique ────────────────────────────────────────────────── */

/* ── PositionBarChart ────────────────────────────────────────────────── */

const POSITION_BARS = [
  { label: "Top 3",    value: 2, pct: "40%", color: "#10B981" },
  { label: "4 – 10",   value: 3, pct: "60%", color: "#3E50F5" },
  { label: "11 – 50",  value: 0, pct: "0%",  color: "#EAB308" },
  { label: "51 – 100", value: 0, pct: "0%",  color: "#F97316" },
];

function PositionBarChart() {
  const [hovered, setHovered] = useState<{ bar: typeof POSITION_BARS[0]; x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setContainerW(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const maxY = 4, chartH = 180, lm = 30, tm = 8;
  const chartW = Math.max(1, containerW - lm - 10);
  const slotW = chartW / 4;
  const barW = Math.min(56, slotW * 0.65);

  function handleMouseEnter(e: React.MouseEvent<SVGRectElement>, bar: typeof POSITION_BARS[0]) {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const svgRect = svgEl.getBoundingClientRect();
    const barRect = (e.target as SVGRectElement).getBoundingClientRect();
    setHovered({
      bar,
      x: barRect.left + barRect.width / 2 - svgRect.left,
      y: barRect.top - svgRect.top,
    });
  }

  return (
    <div ref={containerRef} className="relative">
      {containerW > 0 && (
        <svg
          ref={svgRef}
          width={containerW}
          height={chartH + tm + 30}
          className="overflow-visible"
          onMouseLeave={() => setHovered(null)}
        >
          {[0, 1, 2, 3, 4].map((v) => {
            const y = tm + chartH * (1 - v / maxY);
            return (
              <g key={v}>
                <line x1={lm} y1={y} x2={lm + chartW} y2={y} stroke="var(--border-subtle)" strokeWidth="1" />
                <text x={lm - 6} y={y + 4} textAnchor="end" fontSize={12} fill="var(--text-muted)">{v}</text>
              </g>
            );
          })}
          {POSITION_BARS.map((bar, i) => {
            const barH = chartH * bar.value / maxY;
            const x = lm + slotW * i + (slotW - barW) / 2;
            const y = tm + chartH - barH;
            const isHovered = hovered?.bar.label === bar.label;
            return (
              <g key={bar.label}>
                {barH > 0 && (
                  <rect
                    x={x} y={y} width={barW} height={barH} rx={7}
                    fill={bar.color}
                    opacity={hovered && !isHovered ? 0.35 : 1}
                    style={{ cursor: "pointer", transition: "opacity 0.15s" }}
                    onMouseEnter={(e) => handleMouseEnter(e, bar)}
                  />
                )}
                <text x={x + barW / 2} y={tm + chartH + 18} textAnchor="middle" fontSize={12} fill="var(--text-muted)">{bar.label}</text>
              </g>
            );
          })}
        </svg>
      )}

      {/* Tooltip */}
      {hovered && (
        <ChartTooltip x={hovered.x} y={hovered.y - 8}>
          <p className="text-[12px] font-semibold text-white">{hovered.bar.label}</p>
          <p className="text-[11px] font-medium text-white/60">
            <span className="font-semibold text-white">{hovered.bar.value}</span> mot{hovered.bar.value > 1 ? "s" : ""}-clé — {hovered.bar.pct}
          </p>
        </ChartTooltip>
      )}
    </div>
  );
}

/* ── ProfileDonutChart ───────────────────────────────────────────────── */

const PROFILE_DATA = [
  { label: "Données partielles", value: 4, color: "#F59E0B" },
  { label: "Quick Win",          value: 2, color: "#10B981" },
  { label: "Déficit contenu",    value: 2, color: "#EF4444" },
  { label: "Volume faible",      value: 2, color: "#3B82F6" },
  { label: "Mature",             value: 1, color: "#8B5CF6" },
];

function ProfileDonutChart() {
  const [hovered, setHovered] = useState<{ label: string; value: number; color: string; x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const total = 11, r = 82, sw = 7, cx = 92, cy = 92, gapDeg = 7;
  const toRad = (deg: number) => (deg - 90) * Math.PI / 180;
  const pt = (deg: number) => ({ x: cx + r * Math.cos(toRad(deg)), y: cy + r * Math.sin(toRad(deg)) });
  let angle = 0;
  const arcs = PROFILE_DATA.map(d => {
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
    const scaleX = svgRect.width / 184;
    const scaleY = svgRect.height / 184;
    setHovered({ label: d.label, value: d.value, color: d.color, x: mid.x * scaleX, y: mid.y * scaleY - sw * scaleY });
  }

  return (
    <div className="flex items-center gap-8">
      <div className="relative flex-shrink-0">
        <svg ref={svgRef} width="184" height="184" viewBox="0 0 184 184" onMouseLeave={() => setHovered(null)}>
          {arcs.map((d, i) => (
            <path
              key={i} d={d.path} fill="none" stroke={d.color} strokeWidth={sw} strokeLinecap="round"
              opacity={hovered && hovered.label !== d.label ? 0.35 : 1}
              style={{ cursor: "pointer", transition: "opacity 0.15s" }}
              onMouseEnter={(e) => handleMouseEnter(e, d)}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[24px] font-semibold leading-none text-[var(--text-primary)]">11</span>
          <span className="mt-0.5 text-[11px] text-[var(--text-muted)]">URLs</span>
        </div>
        {hovered && (
          <ChartTooltip x={hovered.x} y={hovered.y}>
            <p className="text-[12px] font-semibold text-white">{hovered.label}</p>
            <p className="text-[11px] text-white/60">
              <span className="font-semibold text-white">{hovered.value}</span> URL{hovered.value > 1 ? "s" : ""} — {Math.round(hovered.value / total * 100)}%
            </p>
          </ChartTooltip>
        )}
      </div>
      <div className="flex flex-col gap-2.5">
        {PROFILE_DATA.map((d) => (
          <div key={d.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-[13px] text-[var(--text-secondary)]">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── VisibilityLineChart ─────────────────────────────────────────────── */

const VISIBILITY_DATA = [
  { month: "Mai 25",   value: 18  },
  { month: "Juin 25",  value: 28  },
  { month: "Juil 25",  value: 35  },
  { month: "Août 25",  value: 43  },
  { month: "Sept 25",  value: 58  },
  { month: "Oct 25",   value: 67  },
  { month: "Nov 25",   value: 72  },
  { month: "Déc 25",   value: 79  },
  { month: "Janv 26",  value: 87  },
  { month: "Févr 26",  value: 92  },
  { month: "Mars 26",  value: 99  },
  { month: "Avr 26",   value: 107 },
];

// Fluctuations déterministes pour les 4 sous-points entre chaque mois
const FLUC = [1, 0, 2, 0, 0, -2, 0, 1, 0, 3, 0, -1, 0, 0, 2, 0, -3, 0, 0, 1, 0, 2, 0, 0, -1, 0, 0, -2, 1, 0, 0, 3, 0, -1, 0, 0, 2, 0, -2, 0, 0, 1, 0, -3];

function VisibilityLineChart() {
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

  const chartH = 200, lm = 38, tm = 12, bm = 26;
  const chartW = Math.max(1, containerW - lm - 10);
  const svgH = chartH + tm + bm;
  // kept for coordinate math below (no viewBox → SVG units = px)
  const vbW = containerW, vbH = svgH;
  const yMin = 0, yMax = 120;

  // Expand: 4 sub-points between each monthly anchor
  const expanded: { value: number; month?: string; isMonth: boolean }[] = [];
  for (let i = 0; i < VISIBILITY_DATA.length; i++) {
    expanded.push({ value: VISIBILITY_DATA[i].value, month: VISIBILITY_DATA[i].month, isMonth: true });
    if (i < VISIBILITY_DATA.length - 1) {
      const v0 = VISIBILITY_DATA[i].value;
      const v1 = VISIBILITY_DATA[i + 1].value;
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
    <div ref={containerRef} className="relative" onMouseLeave={() => setHovered(null)}>
      <svg ref={svgRef} width={containerW || undefined} height={svgH} className="overflow-visible" onMouseMove={handleMouseMove}>
        <defs>
          <linearGradient id="vis-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3E50F5" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#3E50F5" stopOpacity="0" />
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
        <path d={linePath} fill="none" stroke="#3E50F5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {hovPt && (
          <circle cx={hovPt.x} cy={hovPt.y} r={4} fill="#3E50F5" stroke="var(--bg-card)" strokeWidth="2" />
        )}
      </svg>
      {hovered && hovPt && (
        <ChartTooltip x={hovered.mouseX} y={hovered.mouseY - 8}>
          {hovMonth && <p className="text-[11px] font-medium text-white/60">{hovMonth}</p>}
          <p className="text-[13px] font-semibold text-white">{hovPt.value}</p>
        </ChartTooltip>
      )}
    </div>
  );
}

/* ── BlocDef ─────────────────────────────────────────────────────────── */

type BlocDef = {
  iconPaths: (fill: string) => React.ReactNode;
  gradFrom: string;
  gradTo: string;
  iconBottomColor: string;
  title: string;
  metric: string;
  metricLabel: string;
  color: string;
  colorBg: string;
  features: string[];
  cta: string;
};

function BlocCard({ bloc, index }: { bloc: BlocDef; index: number }) {
  const iconGradId = `bloc-icon-${index}`;
  return (
    <Link
      href={bloc.cta}
      className="group/bloc relative flex flex-col rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-5 transition-colors duration-200 hover:bg-[var(--bg-secondary)]"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div
          className="flex-shrink-0 overflow-hidden rounded-xl p-px"
          style={{ background: `linear-gradient(to bottom, ${bloc.gradFrom}99, ${bloc.gradTo}80)` }}
        >
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[11px]" style={{ background: `linear-gradient(to bottom, ${bloc.gradFrom}, ${bloc.gradTo})` }}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <defs>
                <linearGradient id={iconGradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="white" stopOpacity="1" />
                  <stop offset="100%" stopColor="white" stopOpacity="0.60" />
                </linearGradient>
              </defs>
              {bloc.iconPaths(`url(#${iconGradId})`)}
            </svg>
          </div>
        </div>
        <div className="group/info relative" onClick={(e) => e.preventDefault()}>
          <button className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M7.5 6.5v4M7.5 4.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </button>
          <div className="pointer-events-none absolute bottom-8 right-0 z-50 w-48 rounded-2xl border border-[var(--border-subtle)] bg-[var(--modal-bg)] p-3 opacity-0 shadow-[var(--shadow-floating)] transition-opacity duration-150 group-hover/info:opacity-100">
            <ul className="space-y-1.5">
              {bloc.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
                  <span className="h-1 w-1 flex-shrink-0 rounded-full bg-[var(--text-muted)]" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {/* Title */}
      <p className="mt-4 text-[14px] font-semibold leading-tight text-[var(--text-primary)]">{bloc.title}</p>
      {/* Metric */}
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-[32px] font-semibold leading-none tracking-tight text-[var(--text-primary)]">{bloc.metric}</span>
        <span className="text-[11px] text-[var(--text-muted)]">{bloc.metricLabel}</span>
      </div>
      {/* Arrow */}
      <div className="mt-auto flex justify-end pt-5">
        <ArrowRightIcon className="h-4 w-4 text-[var(--text-muted)]" />
      </div>
    </Link>
  );
}

/* ── Metric card ─────────────────────────────────────────────────────── */

function MetricCard({ label, value, sub, trend }: { label: string; value: string; sub?: string; trend?: "up" | "down" | "neutral" }) {
  const TrendIcon = trend === "up" ? ArrowUpIcon : trend === "down" ? ArrowDownIcon : MinusIcon;
  const trendColor = trend === "up" ? "#10B981" : trend === "down" ? "#E11D48" : "var(--text-muted)";
  return (
    <div className="p-2">
      <p className="text-[14px] font-medium text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-[26px] font-semibold leading-none tracking-tight text-[var(--text-primary)]">{value}</p>
      {sub && (
        <div className="mt-2 flex items-center gap-1" style={{ color: trendColor }}>
          {trend && <TrendIcon className="h-3 w-3" />}
          <span className="text-[12px]">{sub}</span>
        </div>
      )}
    </div>
  );
}

/* ── Chart placeholder ───────────────────────────────────────────────── */

function ChartBar({ label, color = "var(--accent-primary)" }: { label: string; color?: string }) {
  const bars = [42, 55, 48, 67, 74, 62, 81, 77, 85, 91, 79, 96];
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
      <p className="mb-4 text-[12px] font-medium text-[var(--text-muted)]">{label}</p>
      <div className="flex h-32 items-end gap-1.5">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, backgroundColor: color, opacity: 0.15 + (h / 96) * 0.6 }} />
        ))}
      </div>
      <div className="mt-3 flex justify-between text-[11px] text-[var(--text-muted)]">
        <span>Avr.</span><span>Mai</span><span>Juin</span>
      </div>
    </div>
  );
}

/* ── Insight list ────────────────────────────────────────────────────── */

function InsightList({ items, color = "var(--accent-primary)" }: { items: string[]; color?: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
      <p className="mb-3 text-[12px] font-medium text-[var(--text-muted)]">Insights clés</p>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-[13px] text-[var(--text-secondary)]">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: color }} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Top pages table ─────────────────────────────────────────────────── */

function TopPages() {
  const ALL_PAGES = [
    { url: "/blog/seo-local",            clicks: 3240, impressions: 53100, position: 4.2,  ctr: "6.1%", trend: [18,22,28,24,32,30,36] },
    { url: "/services/audit-seo",        clicks: 2180, impressions: 50700, position: 7.8,  ctr: "4.3%", trend: [20,18,22,25,21,24,22] },
    { url: "/blog/link-building",        clicks: 1640, impressions: 52900, position: 11.2, ctr: "3.1%", trend: [12,14,13,16,15,18,17] },
    { url: "/",                          clicks: 1320, impressions: 15200, position: 3.1,  ctr: "8.7%", trend: [10,11,10,12,13,11,13] },
    { url: "/blog/core-web-vitals",      clicks:  980, impressions: 25800, position: 9.4,  ctr: "3.8%", trend: [8,9,11,10,12,11,12]  },
    { url: "/services/netlinking",       clicks:  870, impressions: 19400, position: 12.1, ctr: "4.5%", trend: [6,7,8,7,9,8,10]      },
    { url: "/blog/balises-title",        clicks:  730, impressions: 17800, position: 8.6,  ctr: "4.1%", trend: [5,6,7,7,8,9,9]       },
    { url: "/services/seo-ecommerce",    clicks:  610, impressions: 22300, position: 14.3, ctr: "2.7%", trend: [4,5,4,6,5,7,6]       },
    { url: "/blog/redirection-301",      clicks:  540, impressions: 14600, position: 10.8, ctr: "3.7%", trend: [4,4,5,5,6,5,7]       },
    { url: "/blog/schema-markup",        clicks:  490, impressions: 16200, position: 13.5, ctr: "3.0%", trend: [3,4,4,5,5,5,6]       },
  ];

  const URL_FILTERS = [
    { value: "all",       label: "Toutes les URLs" },
    { value: "/blog",     label: "/blog" },
    { value: "/services", label: "/services" },
    { value: "/",         label: "/ (accueil)" },
  ];

  const [urlFilter, setUrlFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [filterPos, setFilterPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!filterOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [filterOpen]);

  function openFilter(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setFilterPos({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX });
    setFilterOpen((v) => !v);
  }

  const pages = urlFilter === "all"
    ? ALL_PAGES
    : urlFilter === "/"
    ? ALL_PAGES.filter((p) => p.url === "/")
    : ALL_PAGES.filter((p) => p.url.startsWith(urlFilter));

  const activeLabel = URL_FILTERS.find((f) => f.value === urlFilter)?.label ?? "URL";

  function MiniSparkline({ vals }: { vals: number[] }) {
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    const range = max - min || 1;
    const w = 52, h = 20;
    const pts = vals.map((v, i) => {
      const x = (i / (vals.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    }).join(" ");
    return (
      <svg width={w} height={h} className="overflow-visible">
        <polyline points={pts} fill="none" stroke="#3E50F5" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    );
  }

  function PosTag({ pos }: { pos: number }) {
    const color = pos <= 3 ? "#10B981" : pos <= 10 ? "#3E50F5" : pos <= 20 ? "#F59E0B" : "#94A3B8";
    return (
      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ color, backgroundColor: `${color}18` }}>
        #{pos.toFixed(1)}
      </span>
    );
  }

  return (
    <>
    <div className="bg-[var(--bg-card)]">
      <div className="border-b border-[var(--border-subtle)] px-5 py-3">
        <p className="text-[13px] font-semibold text-[var(--text-secondary)]">Top pages organiques</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col style={{ width: "35%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "13%" }} />
          </colgroup>
          <thead>
            <tr className="border-b border-[var(--border-subtle)]">
              <th className="px-4 py-2.5 text-left">
                <button
                  onClick={openFilter}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${urlFilter !== "all" ? "bg-[rgba(62,80,245,0.08)] text-[#3E50F5]" : "text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"}`}
                >
                  {activeLabel}
                  <ChevronDownIcon className="h-3 w-3 flex-shrink-0" />
                </button>
              </th>
              {[
                { label: "Clics",        align: "text-right"  },
                { label: "Impressions",  align: "text-right"  },
                { label: "Position",     align: "text-center" },
                { label: "CTR",          align: "text-right"  },
                { label: "Tendance",     align: "text-center" },
              ].map(({ label, align }) => (
                <th key={label} className={`px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)] ${align}`}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {pages.map((p) => (
              <tr key={p.url} className="group hover:bg-[var(--bg-secondary)] transition-colors">
                <td className="px-4 py-3">
                  <span className="block truncate font-mono text-[12px] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                    {p.url}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-[13px] font-semibold text-[var(--text-primary)]">{p.clicks.toLocaleString()}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-[13px] text-[var(--text-secondary)]">{p.impressions.toLocaleString()}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <PosTag pos={p.position} />
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-[13px] text-[var(--text-secondary)]">{p.ctr}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center">
                    <MiniSparkline vals={p.trend} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {filterOpen && typeof window !== "undefined" && (
      <div
        ref={filterRef}
        className="fixed z-50 min-w-[180px] overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-1 shadow-lg"
        style={{ top: filterPos.top, left: filterPos.left }}
      >
        {URL_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setUrlFilter(f.value); setFilterOpen(false); }}
            className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-[13px] transition-colors hover:bg-[var(--bg-secondary)]"
          >
            <span className={urlFilter === f.value ? "font-medium text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}>
              {f.label}
            </span>
            {urlFilter === f.value && <CheckIcon className="h-3.5 w-3.5 text-[#3E50F5]" />}
          </button>
        ))}
      </div>
    )}
    </>
  );
}

/* ── Forecast timeline ───────────────────────────────────────────────── */

function ForecastTimeline() {
  const steps = [
    { month: "M+1", action: "Optimisation technique", gain: "+5 %", color: "#E11D48", done: false },
    { month: "M+2", action: "Briefs Bloc 01 publiés", gain: "+12 %", color: "#F59E0B", done: false },
    { month: "M+3", action: "Maillage interne déployé", gain: "+22 %", color: "#10B981", done: false },
    { month: "M+6", action: "Plan complet exécuté", gain: "+38 %", color: "#6366F1", done: false },
  ];
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
      <p className="mb-5 text-[12px] font-medium text-[var(--text-muted)]">Projection d'exécution</p>
      <div className="space-y-4">
        {steps.map((s) => (
          <div key={s.month} className="flex items-center gap-4">
            <span className="w-8 flex-shrink-0 text-[11px] font-medium text-[var(--text-muted)]">{s.month}</span>
            <div className="h-px flex-1 border-t border-dashed border-[var(--border-medium)]" />
            <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
              <span className="truncate text-[13px] text-[var(--text-secondary)]">{s.action}</span>
              <span className="flex-shrink-0 rounded-full px-2.5 py-0.5 text-[12px] font-semibold" style={{ color: s.color, backgroundColor: `${s.color}14` }}>
                {s.gain}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Netlinking data ─────────────────────────────────────────────────── */

type LinkPlan = {
  source: string;
  anchor: string;
  target: string;
  impact: number;
};

const LINK_PLAN: LinkPlan[] = [
  { source: "/collections/robes-femme",      anchor: "robe lin été",      target: "/collections/robe-lin-ete",  impact: 88 },
  { source: "/collections/pulls-cachemire",  anchor: "cachemire doux",    target: "/p/pull-col-v-laine",        impact: 74 },
  { source: "/guides/comment-choisir-robe",  anchor: "robes courtes",     target: "/collections/robes-courtes", impact: 91 },
  { source: "/collections/blouses",          anchor: "blouse légère",     target: "/collections/tops-femme",    impact: 65 },
  { source: "/p/robe-lin-marine",            anchor: "collection lin",    target: "/collections/robe-lin-ete",  impact: 82 },
];

function ImpactBar({ value }: { value: number }) {
  const color = value >= 85 ? "#10B981" : value >= 70 ? "#F59E0B" : "#6366F1";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--bg-card-hover)]">
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="text-[12px] font-medium tabular-nums" style={{ color }}>{value}</span>
    </div>
  );
}

/* ── Tabs ────────────────────────────────────────────────────────────── */

const TABS: { key: Tab; label: string }[] = [
  { key: "general",          label: "Général" },
  { key: "briefs",           label: "URLs" },
  { key: "seo",              label: "SEO Organique" },
  { key: "sea",              label: "SEA & Paid" },
  { key: "forecast",         label: "Forecast" },
  { key: "netlinking",       label: "Netlinking" },
  { key: "audit",            label: "Audit" },
];

/* ── GSC Import ──────────────────────────────────────────────────────── */

type ImportType = "keyword" | "typology" | "tree" | "quickwins";

const IMPORT_TYPES: { key: ImportType; icon: React.ElementType; label: string; desc: string }[] = [
  { key: "keyword",   icon: MagnifyingGlassIcon, label: "Par mot-clé",       desc: "Entrez un ou plusieurs mots-clés" },
  { key: "typology",  icon: Squares2X2Icon,      label: "Par typologie",      desc: "Articles, produits, blog…" },
  { key: "tree",      icon: FolderOpenIcon,      label: "Par arborescence",   desc: "Naviguez dans la structure du site" },
  { key: "quickwins", icon: BoltIcon,            label: "Quick Wins",         desc: "Sélectionnez une catégorie" },
];

const QUICK_WINS_OPTIONS = ["Top 10 articles", "Pages les moins visibles", "Meilleur CTR", "Fort potentiel", "Positions 11–20"];
const TYPOLOGY_OPTIONS   = ["Articles de blog", "Pages produits", "Pages catégories", "Landing pages", "Pages guides", "Pages FAQ"];
const SEGMENTS = ["Vache à lait", "Étoiles montantes", "En chute", "Pages zombies", "Nouveau contenu"];

const MOCK_PAGES = [
  { url: "/blog/seo-local",         clicks: 3240, impressions: 48200, position: 4.2 },
  { url: "/services/audit-seo",     clicks: 2180, impressions: 31400, position: 7.8 },
  { url: "/blog/link-building",     clicks: 1640, impressions: 28100, position: 11.2 },
  { url: "/",                       clicks: 1320, impressions: 15200, position: 3.1 },
  { url: "/blog/core-web-vitals",   clicks: 980,  impressions: 19400, position: 9.4 },
  { url: "/blog/audit-technique",   clicks: 840,  impressions: 14700, position: 12.6 },
  { url: "/blog/maillage-interne",  clicks: 720,  impressions: 11200, position: 8.3 },
  { url: "/blog/schema-org",        clicks: 610,  impressions: 9800,  position: 14.1 },
  { url: "/services/contenu-seo",   clicks: 540,  impressions: 8400,  position: 16.7 },
  { url: "/blog/eeat-google",       clicks: 480,  impressions: 7600,  position: 18.2 },
];

type TreeNode = { id: string; label: string; children?: TreeNode[] };
const SITE_TREE: TreeNode[] = [
  { id: "blog",     label: "/blog",     children: [
    { id: "blog/seo",       label: "/seo" },
    { id: "blog/contenu",   label: "/contenu" },
    { id: "blog/technique", label: "/technique" },
  ]},
  { id: "services", label: "/services", children: [
    { id: "services/audit",          label: "/audit-seo" },
    { id: "services/accompagnement", label: "/accompagnement" },
  ]},
  { id: "produits", label: "/produits", children: [] },
  { id: "guides",   label: "/guides",   children: [] },
  { id: "a-propos", label: "/a-propos", children: [] },
];

function TreeNodeItem({ node, depth = 0, selected, expanded, onSelect, onToggle }: {
  node: TreeNode; depth?: number; selected: string; expanded: string[];
  onSelect: (id: string) => void; onToggle: (id: string) => void;
}) {
  const isSelected = selected === node.id;
  const isExpanded = expanded.includes(node.id);
  const hasChildren = !!node.children?.length;
  return (
    <div>
      <button
        style={{ paddingLeft: depth * 14 + 8 }}
        onClick={() => { onSelect(node.id); if (hasChildren) onToggle(node.id); }}
        className={`flex w-full items-center gap-2 rounded-lg py-1.5 pr-3 text-left transition-colors ${isSelected ? "bg-[var(--text-primary)] text-[var(--bg-primary)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"}`}
      >
        <ChevronRightIcon className={`h-3 w-3 flex-shrink-0 transition-transform ${hasChildren ? (isExpanded ? "rotate-90" : "") : "opacity-0"}`} />
        <FolderOpenIcon className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="font-mono text-[12px]">{node.label}</span>
      </button>
      {hasChildren && isExpanded && node.children!.map((c) => (
        <TreeNodeItem key={c.id} node={c} depth={depth + 1} selected={selected} expanded={expanded} onSelect={onSelect} onToggle={onToggle} />
      ))}
    </div>
  );
}

/* ── Shared modal shell ──────────────────────────────────────────────── */

function ModalShell({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" className="relative w-full max-w-[480px] rounded-3xl border border-[var(--border-subtle)] bg-[var(--modal-bg)] p-8 shadow-[var(--shadow-floating)]">
        <button onClick={onClose} className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]">
          <XMarkIcon className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-secondary)]">
        {label}
        {required && <span className="ml-0.5 text-[#E11D48]">*</span>}
        {hint && <span className="ml-1.5 font-normal text-[var(--text-muted)]">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

const fieldCls = "w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--card-inner-bg)] px-3.5 py-2.5 text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] focus:border-[var(--border-medium)] transition-colors";

/* ── Import CSV Modal ────────────────────────────────────────────────── */

function ImportCSVModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"csv" | "paste">("csv");
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pasted, setPasted] = useState("");
  const canImport = tab === "csv" ? !!file : pasted.trim().length > 0;

  return (
    <ModalShell onClose={onClose}>
      <h2 className="pr-10 text-[22px] font-semibold tracking-tight text-[var(--text-primary)]">Importer des URLs</h2>
      <p className="mt-1 text-[13px] text-[var(--text-muted)]">Choisissez votre méthode d'importation</p>

      <div className="mt-5 flex items-center gap-1 rounded-2xl bg-[var(--bg-secondary)] p-1">
        {([["csv", "Importer CSV"], ["paste", "Coller des URLs"]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className="flex-1 rounded-xl py-1.5 text-[13px] font-medium transition-all"
            style={tab === key ? { backgroundColor: "var(--modal-bg)", color: "var(--text-primary)", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" } : { color: "var(--text-muted)" }}>
            {label}
          </button>
        ))}
      </div>

      {tab === "csv" && (
        <div
          className={`mt-5 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${dragging ? "border-[#3E50F5] bg-[rgba(62,80,245,0.04)]" : "border-[var(--border-subtle)] bg-[var(--bg-secondary)]"}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
        >
          <ArrowUpTrayIcon className="h-8 w-8 text-[var(--text-muted)]" />
          <p className="text-[14px] font-medium text-[var(--text-primary)]">{file ? file.name : "Glissez votre fichier CSV ici"}</p>
          <label className="cursor-pointer rounded-full border border-[var(--border-subtle)] px-4 py-1.5 text-[13px] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]">
            Parcourir
            <input type="file" accept=".csv" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
          </label>
          <p className="text-[11px] text-[var(--text-muted)]">Colonnes requises : url · keyword (optionnel : volume)</p>
        </div>
      )}
      {tab === "paste" && (
        <div className="mt-5">
          <textarea value={pasted} onChange={(e) => setPasted(e.target.value)}
            placeholder={"https://exemple.com/page-1\nhttps://exemple.com/page-2"}
            className="w-full resize-none rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4 font-mono text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] focus:border-[var(--border-medium)] transition-colors"
            rows={7} autoFocus />
          <p className="mt-1.5 text-[11px] text-[var(--text-muted)]">Une URL par ligne</p>
        </div>
      )}

      <div className="mt-6 flex items-center justify-end gap-3">
        <button onClick={onClose} className="rounded-full px-4 py-2 text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">Annuler</button>
        <Button disabled={!canImport} onClick={onClose}>Importer</Button>
      </div>
    </ModalShell>
  );
}

/* ── Add URL Modal ───────────────────────────────────────────────────── */

function AddUrlModal({ onClose }: { onClose: () => void }) {
  const [url, setUrl] = useState("");
  const [keyword, setKeyword] = useState("");
  const [volume, setVolume] = useState("");

  return (
    <ModalShell onClose={onClose}>
      <h2 className="pr-10 text-[22px] font-semibold tracking-tight text-[var(--text-primary)]">Ajouter une URL manuellement</h2>
      <p className="mt-1 text-[13px] text-[var(--text-muted)]">Pour les pages hors GSC (nouvelle page, concurrent, etc.)</p>
      <div className="mt-6 flex flex-col gap-4">
        <FormField label="URL" required>
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://exemple.com/ma-page" autoFocus className={fieldCls} />
        </FormField>
        <FormField label="Mot-clé cible" required>
          <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="ex : seo local paris" className={fieldCls} />
        </FormField>
        <FormField label="Volume estimé" hint="optionnel">
          <input type="number" value={volume} onChange={(e) => setVolume(e.target.value)} placeholder="ex : 1 200" className={fieldCls} />
        </FormField>
      </div>
      <div className="mt-6 flex items-center justify-end gap-3">
        <button onClick={onClose} className="rounded-full px-4 py-2 text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">Annuler</button>
        <Button disabled={!url.trim() || !keyword.trim()} onClick={onClose}>Ajouter et Analyser</Button>
      </div>
    </ModalShell>
  );
}

/* ── New Brief Modal ─────────────────────────────────────────────────── */

const PAGE_TYPES = [
  { value: "auto",     label: "Auto-détection (recommandé)" },
  { value: "category", label: "Page catégorie (e-commerce)" },
  { value: "product",  label: "Fiche produit" },
  { value: "blog",     label: "Article de blog" },
  { value: "service",  label: "Page service / prestation" },
  { value: "landing",  label: "Landing page" },
  { value: "guide",    label: "Guide / tutoriel" },
  { value: "faq",      label: "FAQ" },
  { value: "home",     label: "Page d'accueil" },
  { value: "other",    label: "Autre" },
];

function NewBriefModal({ onClose }: { onClose: () => void }) {
  const [keyword, setKeyword] = useState("");
  const [lang, setLang] = useState("fr");
  const [pageType, setPageType] = useState("auto");

  return (
    <ModalShell onClose={onClose}>
      <h2 className="pr-10 text-[22px] font-semibold tracking-tight text-[var(--text-primary)]">Créer un Brief SEO</h2>
      <p className="mt-1 text-[13px] text-[var(--text-muted)]">Générez un brief complet pour un nouveau contenu (mot-clé sans page existante)</p>
      <div className="mt-6 flex flex-col gap-4">
        <FormField label="Mot-clé cible" required>
          <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="ex : meilleur aspirateur sans fil" autoFocus className={fieldCls} />
        </FormField>
        <FormField label="Langue">
          <div className="relative">
            <select value={lang} onChange={(e) => setLang(e.target.value)} className={`${fieldCls} appearance-none cursor-pointer pr-9`}>
              <option value="fr">Français</option>
              <option value="en">Anglais</option>
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          </div>
        </FormField>
        <FormField label="Type de page souhaité">
          <div className="relative">
            <select value={pageType} onChange={(e) => setPageType(e.target.value)} className={`${fieldCls} appearance-none cursor-pointer pr-9`}>
              {PAGE_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          </div>
        </FormField>
        <div className="flex gap-2.5 rounded-2xl bg-[var(--bg-secondary)] p-3.5">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 flex-shrink-0" aria-hidden>
            <circle cx="8" cy="8" r="7" stroke="var(--text-muted)" strokeWidth="1.5" />
            <rect x="7.25" y="6.5" width="1.5" height="5" rx="0.75" fill="var(--text-muted)" />
            <rect x="7.25" y="4" width="1.5" height="1.5" rx="0.75" fill="var(--text-muted)" />
          </svg>
          <p className="text-[12px] leading-relaxed text-[var(--text-muted)]">
            Le brief analysera la SERP et générera : intention de recherche, structure recommandée, thématiques à couvrir, Top 3 concurrents.
          </p>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-3">
        <button onClick={onClose} className="rounded-full px-4 py-2 text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">Annuler</button>
        <Button disabled={!keyword.trim()} onClick={onClose}>
          <SparklesIcon className="h-4 w-4" />
          Générer le Brief
        </Button>
      </div>
    </ModalShell>
  );
}

function ImportModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [importType, setImportType] = useState<ImportType | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [typology, setTypology] = useState("");
  const [quickWin, setQuickWin] = useState("");
  const [treeSelected, setTreeSelected] = useState("");
  const [treeExpanded, setTreeExpanded] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({ minClics: "", minImpressions: "", posMax: "", maxUrls: "100" });
  const [mustContainTags, setMustContainTags] = useState<string[]>([]);
  const [mustContainInput, setMustContainInput] = useState("");
  const [mustExcludeTags, setMustExcludeTags] = useState<string[]>([]);
  const [mustExcludeInput, setMustExcludeInput] = useState("");
  const [segments, setSegments] = useState<string[]>([]);

  const addTag = (val: string, tags: string[], set: (t: string[]) => void, setInput: (v: string) => void) => {
    const trimmed = val.trim();
    if (trimmed && !tags.includes(trimmed)) set([...tags, trimmed]);
    setInput("");
  };

  const goStep3 = () => {
    setStep(3);
    setLoading(true);
    setTimeout(() => {
      setSelectedPages(new Set(MOCK_PAGES.map((p) => p.url)));
      setLoading(false);
    }, 1600);
  };

  const togglePage = (url: string) =>
    setSelectedPages((prev) => { const s = new Set(prev); s.has(url) ? s.delete(url) : s.add(url); return s; });

  const allSelected = selectedPages.size === MOCK_PAGES.length;
  const toggleAll = () => setSelectedPages(allSelected ? new Set() : new Set(MOCK_PAGES.map((p) => p.url)));

  const toggleTree = (id: string) =>
    setTreeExpanded((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  return (
    <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" className="w-full max-w-2xl rounded-3xl border border-[var(--border-subtle)] bg-[var(--modal-bg)] p-8 shadow-[var(--shadow-floating)]">

        {/* Stepper + close */}
        <div className="mb-7 flex items-center gap-4">
          <div className="flex flex-1 items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${s <= step ? "bg-[var(--text-primary)]" : "bg-[var(--border-subtle)]"}`} />
            ))}
          </div>
          <button onClick={onClose} className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)]">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* ── Step 1 — Méthode ── */}
        {step === 1 && (
          <div>
            <h2 className="mb-6 text-center text-[26px] font-semibold tracking-tight text-[var(--text-primary)]">Comment voulez-vous importer vos pages ?</h2>
            <div className="grid grid-cols-2 gap-3">
              {IMPORT_TYPES.map((t) => {
                const active = importType === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setImportType((prev) => prev === t.key ? null : t.key)}
                    className={`flex flex-col items-center gap-3 rounded-2xl border p-6 text-center transition-all ${
                      active
                        ? "border-2 border-[var(--text-primary)] bg-[var(--bg-secondary)]"
                        : "border border-[var(--border-subtle)] bg-[var(--bg-primary)] hover:border-[var(--border-medium)] hover:bg-[var(--bg-secondary)]"
                    }`}
                  >
                    <t.icon className={`h-9 w-9 transition-colors ${active ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`} />
                    <div>
                      <p className="text-[13px] font-semibold text-[var(--text-primary)]">{t.label}</p>
                      <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{t.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Sub-panels — smooth expand with AnimateIn */}
            <AnimateIn show={importType === "keyword"}>
              <div className="mt-4">
                <div className="flex gap-2">
                  <input type="text" value={keywordInput} placeholder="Ajouter un mot-clé…"
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTag(keywordInput, keywords, setKeywords, setKeywordInput)}
                    className="flex-1 rounded-xl border border-[var(--border-medium)] bg-[var(--input-bg)] px-3 py-2 text-[14px] text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]" />
                  <button onClick={() => addTag(keywordInput, keywords, setKeywords, setKeywordInput)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-medium)] bg-[var(--input-bg)] text-[var(--text-muted)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]">
                    +
                  </button>
                </div>
                {keywords.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {keywords.map((kw) => (
                      <span key={kw} className="animate-slide-down flex items-center gap-1 rounded-full bg-[var(--text-primary)] px-2.5 py-1 text-[12px] font-medium text-[var(--bg-primary)]">
                        {kw}
                        <button onClick={() => setKeywords((p) => p.filter((x) => x !== kw))} className="opacity-60 hover:opacity-100"><XMarkIcon className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </AnimateIn>

            <AnimateIn show={importType === "typology"}>
              <div className="relative mt-4">
                <select value={typology} onChange={(e) => setTypology(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-[var(--border-medium)] bg-[var(--input-bg)] p-2 pr-9 text-[14px] font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]">
                  <option value="">Sélectionner une typologie…</option>
                  {TYPOLOGY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
              </div>
            </AnimateIn>

            <AnimateIn show={importType === "tree"}>
              <div className="mt-4 max-h-52 overflow-y-auto rounded-2xl border border-[var(--border-subtle)] p-2">
                {SITE_TREE.map((node) => (
                  <TreeNodeItem key={node.id} node={node} selected={treeSelected} expanded={treeExpanded} onSelect={setTreeSelected} onToggle={toggleTree} />
                ))}
              </div>
            </AnimateIn>

            <AnimateIn show={importType === "quickwins"}>
              <div className="relative mt-4">
                <select value={quickWin} onChange={(e) => setQuickWin(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-[var(--border-medium)] bg-[var(--input-bg)] p-2 pr-9 text-[14px] font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]">
                  <option value="">Sélectionner une catégorie…</option>
                  {QUICK_WINS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
              </div>
            </AnimateIn>

            <div className="mt-6 flex items-center justify-between">
              <div />
              <div className="flex items-center gap-3">
                <button onClick={() => setStep(2)} className="text-[13px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
                  Passer cette étape
                </button>
                <Button size="md" onClick={() => setStep(2)} disabled={!importType}>
                  Suivant <ChevronRightIcon className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2 — Filtres ── */}
        {step === 2 && (
          <div>
            <h2 className="mb-6 text-center text-[26px] font-semibold tracking-tight text-[var(--text-primary)]">Filtrez votre import</h2>
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: "minClics",       label: "Min. clics" },
                  { key: "minImpressions", label: "Min. impressions" },
                  { key: "posMax",         label: "Position max" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="mb-1.5 block text-[11px] font-medium text-[var(--text-muted)]">{f.label}</label>
                    <NumberInput
                      placeholder="—"
                      value={filters[f.key as keyof typeof filters]}
                      onChange={(val) => setFilters((p) => ({ ...p, [f.key]: val }))}
                      min={0}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>

              {/* Tag inputs */}
              {[
                { label: "La page doit contenir", tags: mustContainTags, setTags: setMustContainTags, input: mustContainInput, setInput: setMustContainInput, placeholder: "ex : /blog" },
                { label: "La page exclut",         tags: mustExcludeTags, setTags: setMustExcludeTags, input: mustExcludeInput, setInput: setMustExcludeInput, placeholder: "ex : /admin" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="mb-1.5 block text-[11px] font-medium text-[var(--text-muted)]">{f.label}</label>
                  <div className="flex gap-2">
                    <input type="text" value={f.input} placeholder={f.placeholder}
                      onChange={(e) => f.setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addTag(f.input, f.tags, f.setTags, f.setInput)}
                      className="flex-1 rounded-xl border border-[var(--border-medium)] bg-[var(--input-bg)] px-3 py-2 text-[14px] text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]" />
                    <button onClick={() => addTag(f.input, f.tags, f.setTags, f.setInput)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-medium)] bg-[var(--input-bg)] text-[var(--text-muted)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]">
                      +
                    </button>
                  </div>
                  <AnimateIn show={f.tags.length > 0}>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {f.tags.map((tag) => (
                        <span key={tag} className="animate-slide-down flex items-center gap-1 rounded-full bg-[var(--text-primary)] px-2.5 py-1 text-[12px] font-medium text-[var(--bg-primary)]">
                          {tag}
                          <button onClick={() => f.setTags((p) => p.filter((x) => x !== tag))} className="opacity-60 hover:opacity-100"><XMarkIcon className="h-3 w-3" /></button>
                        </span>
                      ))}
                    </div>
                  </AnimateIn>
                </div>
              ))}

              <div>
                <label className="mb-2 block text-[11px] font-medium text-[var(--text-muted)]">Filtrer par segments GSC</label>
                <div className="flex flex-wrap gap-2">
                  {SEGMENTS.map((s) => {
                    const active = segments.includes(s);
                    return (
                      <button key={s} onClick={() => setSegments((p) => active ? p.filter((x) => x !== s) : [...p, s])}
                        className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all ${active ? "border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg-primary)]" : "border-[var(--border-medium)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]"}`}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="max-w-[160px]">
                <label className="mb-1.5 block text-[11px] font-medium text-[var(--text-muted)]">Nombre max d'URL</label>
                <NumberInput
                  value={filters.maxUrls}
                  onChange={(val) => setFilters((p) => ({ ...p, maxUrls: val }))}
                  min={1}
                  className="w-full"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button onClick={() => setStep(1)} className="flex items-center gap-1 text-[13px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
                <ChevronRightIcon className="h-3.5 w-3.5 rotate-180" /> Retour
              </button>
              <div className="flex items-center gap-3">
                <button onClick={goStep3} className="text-[13px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
                  Passer cette étape
                </button>
                <Button size="md" onClick={goStep3}>
                  Appliquer les filtres <ChevronRightIcon className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3 — Résultats ── */}
        {step === 3 && (
          <div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="h-14 w-14 animate-spin rounded-full border-[3px] border-[var(--border-subtle)] border-t-[var(--text-primary)]" />
                <p className="mt-6 text-[26px] font-semibold tracking-tight text-[var(--text-primary)]">Analyse en cours…</p>
              </div>
            ) : (
              <>
                <div className="mb-5 animate-slide-down text-center">
                  <h2 className="text-[26px] font-semibold tracking-tight text-[var(--text-primary)]">{MOCK_PAGES.length} pages correspondent aux filtres !</h2>
                  <p className="mt-1 text-[12px] text-[var(--text-muted)]">Données du 29/04/2026</p>
                </div>
                <div className="animate-slide-up overflow-hidden rounded-2xl border border-[var(--border-subtle)]" style={{ animationDelay: "60ms" }}>
                  {/* Sticky header */}
                  <div className="grid grid-cols-[24px_1fr_72px_80px_52px] items-center gap-3 border-b border-[var(--border-subtle)] bg-[var(--modal-bg)] px-4 py-2.5">
                    <button
                      onClick={toggleAll}
                      className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${allSelected ? "border-[var(--text-primary)] bg-[var(--text-primary)]" : "border-[var(--border-medium)]"}`}
                    >
                      {allSelected && <CheckIcon className="h-2.5 w-2.5 text-[var(--bg-primary)]" />}
                    </button>
                    {["Page", "Clics", "Impr.", "Pos."].map((h, i) => (
                      <span key={h} className={`text-[10px] font-medium text-[var(--text-muted)] ${i > 0 ? "text-right" : ""}`}>{h}</span>
                    ))}
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    {MOCK_PAGES.map((p, i) => {
                      const checked = selectedPages.has(p.url);
                      return (
                        <div
                          key={p.url}
                          onClick={() => togglePage(p.url)}
                          className={`grid cursor-pointer grid-cols-[24px_1fr_72px_80px_52px] items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--bg-secondary)] ${i < MOCK_PAGES.length - 1 ? "border-b border-[var(--border-subtle)]" : ""} ${!checked ? "opacity-40" : ""}`}
                        >
                          <div className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${checked ? "border-[var(--text-primary)] bg-[var(--text-primary)]" : "border-[var(--border-medium)]"}`}>
                            {checked && <CheckIcon className="h-2.5 w-2.5 text-[var(--bg-primary)]" />}
                          </div>
                          <div className="flex items-center gap-2 min-w-0">
                            <LinkIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--text-muted)]" />
                            <span className="truncate font-mono text-[12px] text-[var(--text-secondary)]">{p.url}</span>
                          </div>
                          <span className="text-right text-[13px] font-medium tabular-nums text-[var(--text-primary)]">{p.clicks.toLocaleString()}</span>
                          <span className="text-right text-[13px] tabular-nums text-[var(--text-muted)]">{p.impressions.toLocaleString()}</span>
                          <span className="text-right text-[13px] font-medium tabular-nums text-[var(--text-primary)]">#{p.position}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <button onClick={() => setStep(2)} className="flex items-center gap-1 text-[13px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
                    <ChevronRightIcon className="h-3.5 w-3.5 rotate-180" /> Retour
                  </button>
                  <div className="flex items-center gap-3">
                    <Button size="md" variant="secondary" onClick={onClose}>
                      Fusionner avec un autre lot
                    </Button>
                    <Button size="md" onClick={onClose} disabled={selectedPages.size === 0}>
                      Valider l'import ({selectedPages.size} pages) <ChevronRightIcon className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

/* ── Connect modal ───────────────────────────────────────────────────── */

type Tool = "gsc" | "ga4";

const TOOL_CONFIG: Record<Tool, { name: string; description: string; color: string; logo: React.ReactNode }> = {
  gsc: {
    name: "Google Search Console",
    description: "Accédez aux données de trafic organique, mots-clés, impressions et positions de votre site.",
    color: "#4285F4",
    logo: (
      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#4285F4"/>
        <path d="M12 6l-6 10h12L12 6z" fill="#fff" opacity=".9"/>
      </svg>
    ),
  },
  ga4: {
    name: "Google Analytics 4",
    description: "Suivez le comportement des utilisateurs, les conversions et les performances de votre site.",
    color: "#E37400",
    logo: (
      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none">
        <rect width="24" height="24" rx="4" fill="#E37400"/>
        <path d="M7 17V10h2.5v7H7zM14.5 17V7H17v10h-2.5zM10.75 17v-4.5h2.5V17h-2.5z" fill="#fff"/>
      </svg>
    ),
  },
};

function ConnectModal({ tool, onClose, onConnect }: { tool: Tool; onClose: () => void; onConnect: () => void }) {
  const config = TOOL_CONFIG[tool];

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-3xl border border-[var(--border-subtle)] bg-[var(--modal-bg)] p-8 shadow-[var(--shadow-floating)]">
        <div className="flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-primary)]">
            {config.logo}
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <h2 className="mt-5 text-[18px] font-semibold tracking-tight text-[var(--text-primary)]">
          Connecter {config.name}
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-muted)]">{config.description}</p>

        <div className="mt-6 flex flex-col gap-2">
          <Button
            size="lg"
            className="w-full"
            onClick={() => { onConnect(); onClose(); }}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff" opacity=".8"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#fff" opacity=".6"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff" opacity=".4"/></svg>
            Se connecter avec Google
          </Button>
          <Button size="lg" variant="secondary" className="w-full" onClick={onClose}>
            Annuler
          </Button>
        </div>
      </div>
    </div>
  );
}

function ConnBadge({ tool, connected, onClick, onImport }: { tool: Tool; connected: boolean; onClick: () => void; onImport?: () => void }) {
  const label = tool === "gsc" ? "GSC" : "GA4";
  const tooltipLabel = tool === "gsc" ? "Se connecter à Google Search Console" : "Se connecter à Google Analytics 4";

  if (connected && tool === "gsc") {
    return (
      <DropdownMenu
        width={256}
        trigger={
          <Tooltip label="Importer et plus" side="bottom">
            <Button size="md" variant="secondary" className="text-[14px]">
              <CheckCircleSolid className="h-3.5 w-3.5 text-emerald-500" />
              {label}
              <EllipsisHorizontalIcon className="h-5 w-5 text-[var(--text-muted)]" />
            </Button>
          </Tooltip>
        }
      >
        <DropdownItem onClick={onImport}>
          <ArrowDownTrayIcon className="h-5 w-5 text-[var(--text-muted)]" />
          Importer des pages GSC
        </DropdownItem>
        <DropdownItem>
          <TrashIcon className="h-5 w-5 text-[var(--text-muted)]" />
          Supprimer des pages GSC
        </DropdownItem>
        <DropdownSeparator />
        <DropdownItem danger onClick={onClick}>
          <XMarkIcon className="h-5 w-5" />
          Déconnecter GSC
        </DropdownItem>
      </DropdownMenu>
    );
  }

  if (connected) {
    return (
      <Button size="md" variant="secondary" className="text-[14px]" onClick={onClick}>
        <CheckCircleSolid className="h-3.5 w-3.5 text-emerald-500" />
        {label}
      </Button>
    );
  }

  return (
    <Tooltip label={tooltipLabel} side="bottom">
      <Button size="md" variant="dark" className="text-[14px]" onClick={onClick}>
        {label} — Connecter
      </Button>
    </Tooltip>
  );
}

/* ── Paramètres modal ────────────────────────────────────────────────── */

const PROJ_INTEGRATIONS = [
  { id: "anthropic", name: "Anthropic",     desc: "Génération IA · modèles Claude",             initials: "AN", color: "#E36D25", bg: "rgba(227,109,37,0.12)" },
  { id: "babbar",    name: "Babbar",         desc: "Autorité de domaine · BabbarAuthority",      initials: "BB", color: "#7C3AED", bg: "rgba(124,58,237,0.12)" },
  { id: "crazysrp",  name: "CrazySERP",      desc: "Analyse SERP · suivi de positions",           initials: "CS", color: "#2563EB", bg: "rgba(37,99,235,0.12)"  },
  { id: "cuik",      name: "Cuik",           desc: "Plateforme de création de contenu IA",        initials: "CK", color: "#10B981", bg: "rgba(16,185,129,0.12)" },
  { id: "haloscan",  name: "Haloscan",       desc: "Scraping SERP · données Google",             initials: "HS", color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  { id: "openai",    name: "OpenAI",         desc: "Génération IA · modèles GPT",                initials: "OA", color: "#10A37F", bg: "rgba(16,163,127,0.12)" },
  { id: "seobs",     name: "SEObserver",     desc: "Visibilité SEO · snapshots",                 initials: "SO", color: "#3E50F5", bg: "rgba(62,80,245,0.12)"  },
  { id: "serpm",     name: "Serpmantics",    desc: "Analyse sémantique des SERPs",               initials: "SM", color: "#EC4899", bg: "rgba(236,72,153,0.12)" },
  { id: "ytg",       name: "YourText.Guru",  desc: "Score sémantique · optimisation éditoriale", initials: "YG", color: "#14B8A6", bg: "rgba(20,184,166,0.12)" },
];

const PROJ_TAGS = [
  { key: "produit",   label: "Produit"        },
  { key: "categorie", label: "Catégorie"      },
  { key: "blog",      label: "Blog / Article" },
  { key: "landing",   label: "Landing page"   },
  { key: "marque",    label: "Page marque"    },
];

function ProjIntegRow({ name, logo, desc, account, connected, onToggle }: {
  name: string; logo: React.ReactNode; desc: string; account?: string;
  connected: boolean; onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--bg-subtle)]">
          {logo}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-semibold text-[var(--text-primary)]">{name}</p>
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{ color: connected ? "#10B981" : "var(--text-muted)", backgroundColor: connected ? "rgba(16,185,129,0.09)" : "var(--bg-secondary)" }}>
              {connected ? "Connecté" : "Non connecté"}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{connected && account ? account : desc}</p>
        </div>
      </div>
      <Button size="sm" variant={connected ? "secondary" : "dark"} onClick={onToggle}>
        {connected ? "Déconnecter" : "Connecter"}
      </Button>
    </div>
  );
}

function ParametresModal({ domain, gscConnected, ga4Connected, onToggleGsc, onToggleGa4, onClose }: {
  domain: string; gscConnected: boolean; ga4Connected: boolean;
  onToggleGsc: () => void; onToggleGa4: () => void; onClose: () => void;
}) {
  const [briefConfigured, setBriefConfigured] = useState(false);
  const [skillConfigured, setSkillConfigured] = useState(false);
  const [cuikDomain, setCuikDomain] = useState("www.example.com");
  const [tags, setTags] = useState<string[]>(["Produit", "Catégorie", "Blog / Article"]);
  const [tagInput, setTagInput] = useState("");
  const [integStatus, setIntegStatus] = useState<Record<string, boolean>>(
    Object.fromEntries(PROJ_INTEGRATIONS.map((i) => [i.id, i.id === "cuik"]))
  );
  const [templateOpen, setTemplateOpen] = useState<"brief" | "skill" | null>(null);
  const [templateText, setTemplateText] = useState("");

  const TEMPLATE_BRIEF = `# BRIEF MÉTIER CLIENT — [NOM DU CLIENT / SITE]
# À remplir par le consultant SEO. Ce brief est injecté dans les prompts LLM
# pour contextualiser les recommandations au secteur et aux objectifs du client.

---

## IDENTITÉ

**Nom commercial :** [ex: Ma Boutique]
**Secteur :** [ex: E-commerce mode, B2B industriel, santé, formation...]
**Positionnement :** [ex: Spécialiste français du segment X]
**USP (avantage différenciant) :** [ex: Livraison 24h, prix le plus bas, expertise reconnue...]
**Zone géographique :** [ex: France, Europe, International]

---

## CIBLE

**Persona principal :** [ex: Femmes 30-50 ans, professionnels IT, parents...]
**Persona secondaire :** [ex: Prescripteurs, revendeurs, aidants...]
**Niveau de maturité :** [ex: Découverte, considération, décision d'achat]
**Canaux d'acquisition :** [ex: SEO organique, SEA, réseaux sociaux, emailing...]

---

## OBJECTIFS BUSINESS

**Objectif principal :** [ex: Générer des ventes, des leads, des inscriptions...]
**KPI prioritaire :** [ex: Chiffre d'affaires, leads qualifiés, trafic organique...]
**Saisonnalité :** [ex: Pic en décembre (Noël), stable toute l'année...]
**Budget SEO mensuel :** [ex: 1-3K€, 5-10K€, pas de budget dédié...]

---

## CONCURRENCE

**Concurrents directs :** [ex: Concurrent A, Concurrent B, Concurrent C]
**Avantage concurrentiel SEO :** [ex: Contenu expert, ancienneté du domaine...]
**Faiblesse concurrentielle SEO :** [ex: Peu de backlinks, contenu peu mis à jour...]

---

## CONTRAINTES

**Contraintes légales :** [ex: Pas de comparaison de prix, RGPD, mentions obligatoires...]
**Contraintes techniques :** [ex: CMS limité, temps de chargement lent...]
**Sujets sensibles :** [ex: Ne pas mentionner X, ne pas promettre Y...]
**Ton à éviter :** [ex: Trop agressif commercialement, trop technique...]`;

  const TEMPLATE_SKILL = `# SKILL RÉDACTIONNEL — [NOM DU PROJET]
# Définit le style, le ton et les règles de rédaction injectés dans les prompts LLM.

---

## STYLE & TON

**Ton général :** [ex: Expert et pédagogue, conversationnel, institutionnel...]
**Registre de langue :** [ex: Vouvoiement, tutoiement, neutre...]
**Personnalité éditoriale :** [ex: Rassurant, dynamique, premium, accessible...]

---

## STRUCTURE

**Longueur cible :** [ex: 800-1200 mots pour les articles, 300 mots pour les fiches...]
**Format préféré :** [ex: Listes à puces, titres courts, paragraphes courts...]
**Appel à l'action :** [ex: CTA en fin d'article, bannière intermédiaire...]

---

## RÈGLES ÉDITORIALES

**Mots à privilégier :** [ex: "solution", "accompagnement", "expertise"...]
**Mots à éviter :** [ex: "problème", "cheap", "basique"...]
**Formulations interdites :** [ex: Superlatifs non sourcés, promesses de résultats...]

---

## RÉFÉRENCES

**Exemples d'articles approuvés :** [ex: URL d'articles de référence]
**Ligne éditoriale de référence :** [ex: Nom du média ou blog de référence]`;

  const openTemplate = (key: "brief" | "skill") => {
    setTemplateText(key === "brief" ? TEMPLATE_BRIEF : TEMPLATE_SKILL);
    setTemplateOpen(key);
  };

  const saveTemplate = (key: "brief" | "skill") => {
    if (key === "brief") setBriefConfigured(true);
    else setSkillConfigured(true);
    setTemplateOpen(null);
  };

  const addTag = () => {
    const val = tagInput.trim();
    if (val && !tags.includes(val)) setTags((p) => [...p, val]);
    setTagInput("");
  };

  const toggleInteg = (id: string) =>
    setIntegStatus((s) => ({ ...s, [id]: !s[id] }));

  return (
    <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true"
        className="flex w-full max-w-2xl flex-col rounded-3xl border border-[var(--border-subtle)] bg-[var(--modal-bg)] shadow-[var(--shadow-floating)]"
        style={{ maxHeight: "90vh" }}>

        {/* Header */}
        <div className="flex flex-shrink-0 items-start justify-between px-8 pt-7 pb-5">
          <div>
            <p className="text-[20px] font-semibold tracking-tight text-[var(--text-primary)]">Paramètres du projet</p>
            <p className="mt-0.5 text-[13px] text-[var(--text-muted)]">{domain}</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="h-px flex-shrink-0 bg-[var(--border-subtle)]" />

        {/* Scrollable body */}
        <div className="flex flex-col gap-7 overflow-y-auto px-8 py-6">

          {/* ── Contexte métier ──────────────────────────────────────── */}
          <div>
            <p className="mb-1 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Contexte métier</p>
            <p className="mb-4 text-[13px] text-[var(--text-muted)]">Ces documents adaptent les recommandations SEO à votre activité et vos standards rédactionnels.</p>
            <div className="flex flex-col gap-3">
              {([
                { key: "brief" as const, title: "Brief Métier Client", configured: briefConfigured, fileName: "brief-metier.md", empty: "Aucun brief métier configuré", desc: "Ce brief adapte les recommandations SEO à votre activité.", onRemove: () => setBriefConfigured(false) },
                { key: "skill" as const, title: "Skill rédactionnel",  configured: skillConfigured, fileName: "skill-redactionnel.md", empty: "Aucun skill rédactionnel configuré", desc: "Définit le style, le ton et les règles de rédaction.", onRemove: () => setSkillConfigured(false) },
              ]).map((card) => (
                <div key={card.title} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-5">
                  <div className="flex items-start gap-5">
                    {/* Icon */}
                    <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl ${card.configured ? "bg-[rgba(16,185,129,0.1)]" : "bg-[var(--bg-secondary)]"}`}>
                      {card.configured ? (
                        <CheckCircleSolid className="h-7 w-7 text-[#10B981]" />
                      ) : (
                        <DocumentTextIcon className="h-7 w-7 text-[var(--text-muted)]" strokeWidth={1.5} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[14px] font-semibold text-[var(--text-primary)]">{card.title}</p>
                        {card.configured && (
                          <button onClick={card.onRemove} className="flex-shrink-0 text-[var(--text-muted)] transition-colors hover:text-[#E11D48]">
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {card.configured ? (
                        <>
                          <p className="mt-1 text-[13px] font-medium text-[#10B981]">Configuré</p>
                          <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-[var(--bg-secondary)] px-2.5 py-1.5">
                            <DocumentTextIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--text-muted)]" />
                            <span className="font-mono text-[12px] text-[var(--text-secondary)]">{card.fileName}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="mt-1 text-[13px] text-[var(--text-muted)]">{card.empty}</p>
                          <p className="mt-1 text-[12px] text-[var(--text-muted)] opacity-70">{card.desc}</p>
                          <div className="mt-3 flex items-center gap-2">
                            <button onClick={() => openTemplate(card.key)} className="text-[12px] font-medium text-[var(--accent-primary)] transition-opacity hover:opacity-70">
                              Charger le template
                            </button>
                            <span className="text-[var(--text-muted)]">·</span>
                            <button onClick={() => openTemplate(card.key)} className="flex items-center gap-1 text-[12px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
                              <ArrowUpTrayIcon className="h-3.5 w-3.5" />
                              Importer .md
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Inline template editor */}
                  {templateOpen === card.key && (
                    <div className="mt-4 flex flex-col gap-3">
                      <textarea
                        value={templateText}
                        onChange={(e) => setTemplateText(e.target.value)}
                        rows={16}
                        className="w-full resize-none rounded-xl border border-[var(--border-medium)] bg-[var(--bg-secondary)] px-3.5 py-3 font-mono text-[12px] leading-relaxed text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-medium)] placeholder:text-[var(--text-muted)]"
                        spellCheck={false}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => saveTemplate(card.key)}
                          className="rounded-xl bg-[var(--text-primary)] px-4 py-2 text-[13px] font-semibold text-[var(--bg-primary)] transition-opacity hover:opacity-80"
                        >
                          Enregistrer
                        </button>
                        <button
                          onClick={() => setTemplateOpen(null)}
                          className="rounded-xl px-4 py-2 text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Configuration Cuik ───────────────────────────────────── */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <p className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Configuration Cuik</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(16,185,129,0.09)] px-2.5 py-1 text-[12px] font-medium text-[#10B981]">
                <SparklesIcon className="h-3 w-3" />
                Connecté
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-[var(--text-secondary)]">Domaine Cuik</label>
              <input
                value={cuikDomain}
                onChange={(e) => setCuikDomain(e.target.value)}
                placeholder="www.example.com"
                className="h-9 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] transition-colors focus:border-[var(--border-medium)]"
              />
              <p className="text-[11px] text-[var(--text-muted)]">Si vide, le domaine du projet sera utilisé.</p>
            </div>
          </div>

          {/* ── Intégrations ─────────────────────────────────────────── */}
          <div>
            <p className="mb-1 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Intégrations</p>
            <p className="mb-4 text-[13px] text-[var(--text-muted)]">Connectez les outils tiers utilisés dans vos analyses.</p>
            <div className="flex flex-col gap-2">
              <ProjIntegRow
                name="Google Search Console" desc="Données de trafic organique et mots-clés"
                account="clients.lagenceweb@gmail.com" connected={gscConnected} onToggle={onToggleGsc}
                logo={<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#4285F4"/><path d="M12 6l-6 10h12L12 6z" fill="#fff" opacity=".9"/></svg>}
              />
              <ProjIntegRow
                name="Google Analytics 4" desc="Comportement utilisateurs et conversions"
                account="UA-XXXXXXX · monsite.fr" connected={ga4Connected} onToggle={onToggleGa4}
                logo={<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none"><rect width="24" height="24" rx="4" fill="#E37400"/><path d="M7 17V10h2.5v7H7zM14.5 17V7H17v10h-2.5zM10.75 17v-4.5h2.5V17h-2.5z" fill="#fff"/></svg>}
              />
              {PROJ_INTEGRATIONS.map((integ) => (
                <ProjIntegRow
                  key={integ.id}
                  name={integ.name} desc={integ.desc}
                  connected={integStatus[integ.id]} onToggle={() => toggleInteg(integ.id)}
                  logo={
                    <div className="flex h-full w-full items-center justify-center rounded-xl text-[12px] font-bold"
                      style={{ backgroundColor: integ.bg, color: integ.color }}>
                      {integ.initials}
                    </div>
                  }
                />
              ))}
            </div>
          </div>

          {/* ── Tags du projet ────────────────────────────────────────── */}
          <div>
            <p className="mb-1 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Tags du projet</p>
            <p className="mb-4 text-[13px] text-[var(--text-muted)]">Catégorisez vos pages pour filtrer les recommandations et organiser vos briefs.</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                placeholder="Ajoutez votre tag…"
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTag()}
                className="flex-1 rounded-xl border border-[var(--border-medium)] bg-[var(--input-bg)] px-3 py-2 text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] transition-colors focus:border-[var(--text-primary)]"
              />
              <button
                onClick={addTag}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-medium)] bg-[var(--input-bg)] text-[var(--text-muted)] transition-colors hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]"
              >
                +
              </button>
            </div>
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 rounded-full bg-[var(--text-primary)] px-2.5 py-1 text-[12px] font-medium text-[var(--bg-primary)]">
                    {tag}
                    <button onClick={() => setTags((p) => p.filter((t) => t !== tag))} className="opacity-60 transition-opacity hover:opacity-100">
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Danger zone ───────────────────────────────────────────── */}
          <div>
            <p className="mb-3 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Zone de danger</p>
            <div className="flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] px-4 py-3.5">
              <div>
                <p className="text-[13px] font-medium text-[var(--text-primary)]">Supprimer ce projet</p>
                <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">Efface toutes les données et analyses associées à {domain}</p>
              </div>
              <Button variant="danger" size="sm">Supprimer</Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────── */

export default function AnalysePage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = use(params);
  const decodedDomain = decodeURIComponent(domain);
  const { show: showToast } = useToast();
  const [tab, setTab] = useState<Tab>("general");
  const [auditTab, setAuditTab] = useState<"technique" | "editorial" | "netlinking">("technique");
  const [loading, setLoading] = useState(true);
  const tabNavRef = useRef<HTMLDivElement>(null);
  const [tabIndicator, setTabIndicator] = useState({ left: 0, width: 0 });
  useLayoutEffect(() => {
    const btn = tabNavRef.current?.querySelector<HTMLElement>(`[data-tab="${tab}"]`);
    if (btn) setTabIndicator({ left: btn.offsetLeft, width: btn.offsetWidth });
  }, [tab, loading]);
  const [parametresOpen, setParametresOpen] = useState(false);
  const [urlModal, setUrlModal] = useState<"import-csv" | "add-url" | "new-brief" | null>(null);
  const [gscConnected, setGscConnected] = useState(true);
  const [ga4Connected, setGa4Connected] = useState(true);
  const [connectModal, setConnectModal] = useState<Tool | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [returnToParametres, setReturnToParametres] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTab("general");
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, [decodedDomain]);

  const DOMAIN_HEALTH: Record<string, { tech: number }> = {
    "leboncoin.fr":   { tech: 84 },
    "doctolib.fr":    { tech: 61 },
    "backmarket.com": { tech: 73 },
    "sephora.fr":     { tech: 91 },
    "fnac.com":       { tech: 78 },
    "mano-mano.fr":   { tech: 69 },
    "cdiscount.com":  { tech: 82 },
    "lemonde.fr":     { tech: 88 },
    "kiabi.com":      { tech: 38 },
  };
  const healthScores = DOMAIN_HEALTH[decodedDomain] ?? { tech: 84 };

  return (
    <>
    <div className="flex flex-1 flex-col overflow-y-auto">
      {/* ── Header ── */}
      <div className="relative z-30 w-full px-[var(--page-px)] pt-8">
        {loading ? <SkeletonAnalyseHeader /> : null}
        <div className={loading ? "hidden" : "animate-fade-in"}>

        {/* Header */}
        <div className="mb-5">
          <nav className="mb-5 inline-flex items-center gap-1 text-[12px]">
            <Link
              href="/"
              className="rounded-full px-2.5 py-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
            >
              Projets
            </Link>
            <ChevronRightIcon className="h-3 w-3 flex-shrink-0 text-[var(--text-muted)]" />
            <span className="rounded-full px-2.5 py-1 text-[var(--text-secondary)]">
              {decodedDomain}
            </span>
          </nav>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-5">
                <FaviconStretch domain={decodedDomain} />
                <div>
                  <Tooltip label="Ouvrir dans un nouvel onglet" side="top">
                  <a
                    href={`https://${decodedDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/title inline-flex items-center gap-2 transition-colors"
                  >
                    <h1 className="text-[28px] font-semibold leading-none tracking-tight text-[var(--text-primary)] transition-opacity group-hover/title:opacity-70">
                      {decodedDomain}
                    </h1>
                    <ArrowTopRightOnSquareIcon className="h-5 w-5 text-[var(--text-muted)] opacity-0 transition-opacity group-hover/title:opacity-100" />
                  </a>
                  </Tooltip>
                  {(gscConnected || ga4Connected) && (
                    <div className="mt-0.5 flex items-center gap-2 text-[14px] text-[var(--text-muted)]">
                      <span>Mis à jour aujourd'hui</span>
                      <span className="h-3 w-px bg-[var(--border-medium)]" />
                      <span>1 048 URLs</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ConnBadge
                tool="gsc"
                connected={gscConnected}
                onClick={() => gscConnected ? setGscConnected(false) : setConnectModal("gsc")}
                onImport={() => setImportModalOpen(true)}
              />
              <ConnBadge
                tool="ga4"
                connected={ga4Connected}
                onClick={() => ga4Connected ? setGa4Connected(false) : setConnectModal("ga4")}
              />
              <DropdownMenu
                trigger={
                  <button className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]">
                    <EllipsisVerticalIcon className="h-5 w-5" />
                  </button>
                }
                align="right"
                width={220}
              >
                <DropdownItem onClick={() => setUrlModal("import-csv")}>
                  <ArrowUpTrayIcon className="h-4 w-4" />
                  Importer des URLs
                </DropdownItem>
                <DropdownItem onClick={() => setUrlModal("add-url")}>
                  <LinkIcon className="h-4 w-4" />
                  Ajouter une URL
                </DropdownItem>
                <DropdownItem onClick={() => setUrlModal("new-brief")}>
                  <SparklesIcon className="h-4 w-4" />
                  Nouveau brief
                </DropdownItem>
                <DropdownSeparator />
                <DropdownItem onClick={() => setParametresOpen(true)}>
                  <Cog6ToothIcon className="h-4 w-4" />
                  Paramètres du projet
                </DropdownItem>
                <DropdownSeparator />
                <DropdownItem danger>
                  <TrashIcon className="h-4 w-4" />
                  Supprimer le projet
                </DropdownItem>
              </DropdownMenu>
            </div>
          </div>
        </div>

        </div>{/* end header animate-fade-in */}
      </div>{/* end header max-w-5xl */}

      {/* ── Sticky Tabs ── */}
      <div className="sticky top-0 z-20 bg-[var(--bg-primary)]/75 backdrop-blur-md">
        <div className="w-full px-[var(--page-px)]">
          {loading ? <SkeletonTabs count={4} /> : (
            <div ref={tabNavRef} className="relative flex h-16 items-center gap-1">
              <span
                className="pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-accent-primary"
                style={{
                  left: tabIndicator.left,
                  width: tabIndicator.width,
                  transition: "left 0.2s ease-out, width 0.2s ease-out",
                  willChange: "left, width",
                }}
              />
              {TABS.filter(t => !["sea","forecast","netlinking"].includes(t.key)).map((t) => (
                <button
                  key={t.key}
                  data-tab={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex h-full cursor-pointer items-center px-4 text-[16px] font-semibold tracking-tight transition-colors ${tab === t.key ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="w-full px-[var(--page-px)] py-6">
        {loading ? <SkeletonAnalyseGeneral /> : null}
        <div className={loading ? "hidden" : "animate-fade-in"}>

        {/* Général tab */}
        {tab === "general" && (
          <div className="flex flex-col gap-8">

            {/* Stats globales */}
            <div className="grid grid-cols-5 gap-x-2 gap-y-4">
              <MetricCard label="Trafic organique / mois" value="42 800" sub="+8,4 % vs mois dernier" trend="up" />
              <MetricCard label="Lots créés" value="18" sub="6 actifs · 12 terminés" />
              <MetricCard label="URLs générées" value="147" sub="63 livrées (43 %)" />
              <MetricCard label="Score GEO Meteoria" value="65" sub="+7 pts ce mois" trend="up" />
              <MetricCard label="Score maillage global" value="62 %" sub="23 orphelines" trend="down" />
            </div>

            {/* 4 blocs stratégiques */}
            <div>
              <p className="mb-4 text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">Blocs stratégiques</p>
              <div className="grid grid-cols-4 gap-3">
                {[
                  {
                    gradFrom: "#00CCFF", gradTo: "#3265FF", iconBottomColor: "#3265FF",
                    color: "#3265FF", colorBg: "rgba(50,101,255,0.08)",
                    title: "Optimiser l'existant", metric: "36", metricLabel: "pages",
                    features: ["Brief EMC par page","Score sémantique","Maillage interne","Balises meta & titres","Core Web Vitals"], cta: "/briefs",
                    iconPaths: (fill: string) => (<>
                      <path fillRule="evenodd" fill={fill} d="M12 6.75a5.25 5.25 0 0 1 6.775-5.025.75.75 0 0 1 .313 1.248l-3.32 3.319c.063.475.276.934.641 1.299.365.365.824.578 1.3.64l3.318-3.319a.75.75 0 0 1 1.248.313 5.25 5.25 0 0 1-5.472 6.756c-1.018-.086-1.87.1-2.309.634L7.344 21.3A3.298 3.298 0 1 1 2.7 16.657l8.684-7.151c.533-.44.72-1.291.634-2.309A5.342 5.342 0 0 1 12 6.75ZM4.117 19.125a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Z" clipRule="evenodd" />
                      <path fill={fill} d="m10.076 8.64-2.201-2.2V4.874a.75.75 0 0 0-.364-.643l-3.75-2.25a.75.75 0 0 0-.916.113l-.75.75a.75.75 0 0 0-.113.916l2.25 3.75a.75.75 0 0 0 .643.364h1.564l2.062 2.062 1.575-1.297Z" />
                      <path fillRule="evenodd" fill={fill} d="m12.556 17.329 4.183 4.182a3.375 3.375 0 0 0 4.773-4.773l-3.306-3.305a6.803 6.803 0 0 1-1.53.043c-.394-.034-.682-.006-.867.042a.589.589 0 0 0-.167.063l-3.086 3.748Zm3.414-1.36a.75.75 0 0 1 1.06 0l1.875 1.876a.75.75 0 1 1-1.06 1.06L15.97 17.03a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </>),
                  },
                  {
                    gradFrom: "#FFB930", gradTo: "#FB5F26", iconBottomColor: "#FFB930",
                    color: "#FB5F26", colorBg: "rgba(251,95,38,0.08)",
                    title: "Combler les manques", metric: "28", metricLabel: "gaps",
                    features: ["Analyse concurrentielle","Gaps de mots-clés","Pages intermédiaires","Cocon sémantique","Intentions de recherche"], cta: "/briefs",
                    iconPaths: (fill: string) => (<>
                      <path fill={fill} d="M12 .75a8.25 8.25 0 0 0-4.135 15.39c.686.398 1.115 1.008 1.134 1.623a.75.75 0 0 0 .577.706c.352.083.71.148 1.074.195.323.041.6-.218.6-.544v-4.661a6.714 6.714 0 0 1-.937-.171.75.75 0 1 1 .374-1.453 5.261 5.261 0 0 0 2.626 0 .75.75 0 1 1 .374 1.452 6.712 6.712 0 0 1-.937.172v4.66c0 .327.277.586.6.545.364-.047.722-.112 1.074-.195a.75.75 0 0 0 .577-.706c.02-.615.448-1.225 1.134-1.623A8.25 8.25 0 0 0 12 .75Z" />
                      <path fillRule="evenodd" fill={fill} d="M9.013 19.9a.75.75 0 0 1 .877-.597 11.319 11.319 0 0 0 4.22 0 .75.75 0 1 1 .28 1.473 12.819 12.819 0 0 1-4.78 0 .75.75 0 0 1-.597-.876ZM9.754 22.344a.75.75 0 0 1 .824-.668 13.682 13.682 0 0 0 2.844 0 .75.75 0 1 1 .156 1.492 15.156 15.156 0 0 1-3.156 0 .75.75 0 0 1-.668-.824Z" clipRule="evenodd" />
                    </>),
                  },
                  {
                    gradFrom: "#6270F7", gradTo: "#3E50F5", iconBottomColor: "#3E50F5",
                    color: "#3E50F5", colorBg: "rgba(62,80,245,0.08)",
                    title: "Créer de zéro", metric: "24", metricLabel: "pages",
                    features: ["Recherche de mots-clés","Brief IA complet","Structure d'URL","Maillage cible","Calendrier éditorial"], cta: "/production",
                    iconPaths: (fill: string) => (<>
                      <path fillRule="evenodd" fill={fill} d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 0 1 .75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 0 1 9.75 22.5a.75.75 0 0 1-.75-.75v-4.131A15.838 15.838 0 0 1 6.382 15H2.25a.75.75 0 0 1-.75-.75 6.75 6.75 0 0 1 7.815-6.666ZM15 6.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" clipRule="evenodd" />
                      <path fill={fill} d="M5.26 17.242a.75.75 0 1 0-.897-1.203 5.243 5.243 0 0 0-2.05 5.022.75.75 0 0 0 .625.627 5.243 5.243 0 0 0 5.022-2.051.75.75 0 1 0-1.202-.897 3.744 3.744 0 0 1-3.008 1.51c0-1.23.592-2.323 1.51-3.008Z" />
                    </>),
                  },
                  {
                    gradFrom: "#DA5CF6", gradTo: "#8B5CF6", iconBottomColor: "#8B5CF6",
                    color: "#8B5CF6", colorBg: "rgba(139,92,246,0.09)",
                    title: "GEO — IA Générative", metric: "62", metricLabel: "score / 100",
                    features: ["Optimisation réponses IA","Structured data","Signaux E-E-A-T","Sources & citations","Couverture thématique"], cta: "/briefs",
                    iconPaths: (fill: string) => (<>
                      <path fillRule="evenodd" fill={fill} d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z" clipRule="evenodd" />
                    </>),
                  },
                ].map((bloc, index) => (
                  <BlocCard key={bloc.title} bloc={bloc} index={index} />
                ))}
              </div>
            </div>

            {/* Bilans santé */}
            <div className="grid grid-cols-2 gap-4">
              <div className="overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
                <HealthCard
                  title="Santé technique"
                  score={healthScores.tech}
                  critiques={3}
                  visitesRisk="99"
                  color="#F59E0B"
                  colorBg="rgba(245,158,11,0.09)"
                  quote="3 problèmes techniques critiques impactent 99 visites/mois. Priorité : corriger les balises titres et réduire les temps de réponse pour récupérer ce trafic."
                  actions={[
                    { label: "Balises titres avec longueur incorrecte", visits: "68" },
                    { label: "Balises description trop longues", visits: "31" },
                    { label: "Temps de réponse lent (> 1s)" },
                  ]}
                  cta="Voir l'audit technique"
                  ctaHref={`/analyse/${domain}/audit`}
                />
              </div>
              <div className="overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
                <HealthCard
                  title="Santé éditoriale"
                  score={61}
                  critiques={2}
                  importants={6}
                  visitesRisk="4,1k"
                  color="#E11D48"
                  colorBg="rgba(225,29,72,0.07)"
                  quote="Vos 9 pages manquent de signaux E-E-A-T, exposant 1 361 visites/mois. Priorité : renforcer la crédibilité et l'expertise avant le prochain Core Update pour sécuriser ce trafic."
                  actions={[
                    { label: "Signaux E-E-A-T insuffisants", visits: "1,4k" },
                    { label: "Expressions sur-optimisées présentes", visits: "1,3k" },
                    { label: "SOSEO inférieur à la moyenne top 3", visits: "1,3k" },
                  ]}
                  note="3 détecteurs avec données partielles"
                  cta="Voir l'audit éditorial"
                  ctaHref={`/analyse/${domain}/audit?tab=editorial`}
                />
              </div>
            </div>

            {/* Core Web Vitals */}
            <div className="overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
              <div className="flex items-center gap-2.5 p-7">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl">
                  <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M2 13A8 8 0 1 1 18 13" />
                    <path d="M10 13L13.5 9.5" strokeWidth="1.75" />
                    <circle cx="10" cy="13" r="1.25" fill="currentColor" stroke="none" />
                  </svg>
                </div>
                <div>
                  <p className="text-[18px] font-semibold tracking-tight text-[var(--text-primary)]">Core Web Vitals</p>
                  <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">Simulation Lighthouse · 10 URLs · 26 avr.</p>
                </div>
              </div>
              <div className="flex px-7 pb-7 gap-4">
                {[
                  { key: "LCP", label: "Largest Contentful Paint", icon: PhotoIcon,            value: "4.52 s", status: "Mauvais", threshold: "≤ 2.5s",  color: "#E11D48", bg: "rgba(225,29,72,0.08)" },
                  { key: "INP", label: "Interaction to Next Paint", icon: CursorArrowRaysIcon,  value: "4 ms",   status: "Bon",     threshold: "≤ 200ms", color: "#10B981", bg: "rgba(16,185,129,0.08)" },
                  { key: "CLS", label: "Cumulative Layout Shift",   icon: ArrowsPointingOutIcon, value: "0.05",  status: "Bon",     threshold: "≤ 0.1",   color: "#10B981", bg: "rgba(16,185,129,0.08)" },
                ].map((m) => (
                  <div key={m.key} className="flex flex-1 items-center gap-4 px-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[var(--border-medium)]">
                      <m.icon className="h-5 w-5 text-[var(--text-primary)]" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-semibold text-[var(--text-muted)]">{m.key}</span>
                      <p className="text-[24px] font-semibold leading-none tracking-tight text-[var(--text-primary)]">{m.value}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ color: m.color, backgroundColor: m.bg }}>{m.status}</span>
                        <span className="text-[11px] text-[var(--text-muted)]">{m.threshold}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Distribution des positions + Profils de pages */}
            <div className="grid grid-cols-2 gap-4">

              {/* Bar chart */}
              <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-7">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[18px] font-semibold tracking-tight text-[var(--text-primary)]">Distribution des positions</p>
                    <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">Visibilité Haloscan</p>
                  </div>
                  <Tooltip
                    side="top"
                    label={<>
                      <span className="block text-[12px] text-white"><span className="font-semibold">5</span> mots-clés dans le top 100 / <span className="font-semibold">2 081</span> détectés (Haloscan)</span>
                      <span className="mt-1 block text-[11px] text-white/70">2 076 mots-clés au-delà de la position 100</span>
                    </>}
                  >
                    <button className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]">
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                        <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
                        <path d="M7.5 6.5v4M7.5 4.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </Tooltip>
                </div>
                <PositionBarChart />
              </div>

              {/* Donut chart */}
              <div className="overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-7">
                <p className="mb-4 text-[18px] font-semibold tracking-tight text-[var(--text-primary)]">
                  Profils d'URLs <span className="text-[var(--text-muted)]">(11)</span>
                </p>
                <ProfileDonutChart />
              </div>

            </div>

            {/* Visibilité et trafic organique */}
            <div className="overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-7">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[18px] font-semibold tracking-tight text-[var(--text-primary)]">Visibilité et trafic organique</p>
                  <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">Visibilité Haloscan</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(16,185,129,0.09)] px-2.5 py-1 text-[12px] font-medium text-emerald-600">
                    ↗ Visibilité en progression
                  </span>
                </div>
              </div>
              <VisibilityLineChart />
            </div>

            {/* Lots actifs */}
            <div>
              <p className="mb-4 text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">Lots actifs</p>
              <LotList onNavigate={() => setTab("briefs")} />
            </div>

            {/* Activités récentes */}
            <div>
              <p className="mb-4 text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">Activités récentes</p>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Brief publié", desc: "Guide SEO local complet · optimisé", time: "Il y a 2h",   color: "#10B981" },
                  { label: "Score mis à jour", desc: "Score sémantique /blog/link-building : 55 → 67", time: "Il y a 5h",   color: "#F59E0B" },
                  { label: "Lot créé",    desc: "Lot GEO — Structured data · 6 URLs", time: "Hier",        color: "#A855F7" },
                  { label: "Analyse lancée", desc: "Nouveau crawl GSC · 1 048 pages indexées", time: "28 avr.", color: "#E11D48" },
                  { label: "Brief livré", desc: "Schema.org et données structurées", time: "27 avr.",      color: "#10B981" },
                ].map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: a.color }} />
                    <div className="flex-1 min-w-0">
                      <span className="text-[12px] font-semibold text-[var(--text-primary)]">{a.label} </span>
                      <span className="text-[12px] text-[var(--text-secondary)]">— {a.desc}</span>
                    </div>
                    <span className="flex-shrink-0 text-[11px] text-[var(--text-muted)]">{a.time}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Briefs tab */}
        {tab === "briefs" && (
          <div className="flex h-[calc(100vh-280px)] flex-col">
            <BriefsView />
          </div>
        )}

        {/* SEO tab */}
        {tab === "seo" && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-x-2 gap-y-4">
              <MetricCard label="Trafic organique (30j)" value="14 280" sub="+12 % vs mois préc." trend="up" />
              <MetricCard label="Position moyenne" value="18,4" sub="−2,1 pts ce mois" trend="up" />
              <MetricCard label="CTR moyen" value="3,2 %" sub="stable" trend="neutral" />
              <MetricCard label="Mots-clés top 10" value="312" sub="+8 ce mois" trend="up" />
              <MetricCard label="Pages indexées" value="1 048" />
              <MetricCard label="Impressions (30j)" value="447 000" sub="+8 % vs mois préc." trend="up" />
            </div>
            <ChartBar label="Évolution du trafic organique — 12 semaines" />
            <TopPages />
            <RankTracker />
            <InsightList items={[
              "8 mots-clés ont progressé en top 3 ce mois",
              "La page /blog/seo-local est la plus performante avec 6,1% de CTR",
              "3 pages en position 11–15 sont à optimiser en priorité",
              "Le taux d'indexation est excellent (98,4%)",
            ]} />
          </div>
        )}

        {/* SEA tab */}
        {tab === "sea" && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-x-2 gap-y-4">
              <MetricCard label="CPC moyen" value="0,42 €" sub="stable vs mois préc." trend="neutral" />
              <MetricCard label="CTR campagnes" value="5,8 %" sub="+0,4 pts" trend="up" />
              <MetricCard label="Conversions (30j)" value="384" sub="+6 %" trend="up" />
              <MetricCard label="Coût total (30j)" value="1 890 €" sub="budget consommé à 94%" />
              <MetricCard label="CPA moyen" value="4,92 €" sub="−0,3 € vs mois préc." trend="up" />
              <MetricCard label="Impressions (30j)" value="210 000" sub="+3 % vs mois préc." trend="up" />
            </div>
            <ChartBar label="Évolution du CPC — 12 semaines" color="#6366F1" />
            <InsightList color="#6366F1" items={[
              "Le budget est pleinement utilisé — aucune fuite détectée",
              "2 groupes d'annonces affichent un CTR < 2% à revoir",
              "Les mots-clés de marque génèrent 38% des conversions",
              "Le score de qualité moyen est de 7,4/10 — potentiel d'amélioration",
            ]} />
          </div>
        )}

        {/* Forecast tab */}
        {tab === "forecast" && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-x-2 gap-y-4">
              <MetricCard label="Trafic estimé M+3" value="+22 %" sub="Blocs 01 + 02 exécutés" trend="up" />
              <MetricCard label="Trafic estimé M+6" value="+38 %" sub="Plan complet exécuté" trend="up" />
              <MetricCard label="ROI SEO estimé 6 mois" value="×3,2" sub="basé sur 87 opportunités" trend="up" />
              <MetricCard label="Mots-clés opportunités" value="87 KW" sub="volume ≥ 100/mois" />
              <MetricCard label="Pages à créer" value="24" sub="Bloc 03 — création" />
              <MetricCard label="Pages à optimiser" value="36" sub="Bloc 01 — existant" />
            </div>
            <ForecastTimeline />
            <ChartBar label="Courbe de trafic projetée — 6 mois" color="#10B981" />
            <InsightList color="#10B981" items={[
              "Cadence minimale recommandée : 4 contenus/mois",
              "Optimisation technique à compléter en M+1 pour activer les gains rapides",
              "Le maillage interne représente 30% du gain estimé",
              "Les pages GEO (Bloc 04) pourraient capter 15% de trafic IA supplémentaire",
            ]} />

            <div className="flex justify-start">
              <Button size="md" onClick={() => setTab("briefs")}>
                Démarrer le plan
                <ChevronRightIcon className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Netlinking tab */}
        {tab === "netlinking" && (
          <div className="flex flex-col gap-6">

            {/* 3 key metrics */}
            <div className="grid grid-cols-3 gap-x-2 gap-y-4">
              <MetricCard label="Pages orphelines détectées" value="23" />
              <MetricCard label="Score maillage global" value="62 %" />
              <MetricCard label="Liens internes à créer" value="184" />
            </div>

            {/* Sub-sections tabs */}
            <div className="flex items-center gap-4 border-b border-[var(--border-subtle)] pb-0">
              {["Audit maillage existant", "Plan de liens total", "Backlinks recommandés"].map((s, i) => (
                <span
                  key={s}
                  className={`pb-3 text-[13px] font-medium ${i === 1 ? "border-b-2 border-accent-primary text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}
                >
                  {s}
                </span>
              ))}
            </div>

            {/* Description */}
            <p className="text-[12px] text-[var(--text-muted)]">
              Cartographie complète · pages, liens entrants/sortants, score de maillage par page · synchronisé avec Forecast N1
            </p>

            {/* Link plan table */}
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
              {/* Head */}
              <div className="grid grid-cols-[1fr_1fr_1fr_auto_auto] items-center gap-6 border-b border-[var(--border-subtle)] px-5 py-3">
                {["Page source", "Ancre suggérée", "Page cible", "Impact", ""].map((h) => (
                  <span key={h} className="text-[11px] font-medium text-[var(--text-muted)]">{h}</span>
                ))}
              </div>

              {/* Rows */}
              {LINK_PLAN.map((row, i) => (
                <div
                  key={i}
                  className={`group grid grid-cols-[1fr_1fr_1fr_auto_auto] items-center gap-6 px-5 py-4 transition-colors hover:bg-[var(--bg-secondary)] ${
                    i < LINK_PLAN.length - 1 ? "border-b border-[var(--border-subtle)]" : ""
                  }`}
                >
                  <span className="truncate font-mono text-[12px] text-[var(--text-secondary)]">{row.source}</span>
                  <span className="truncate text-[13px] italic text-[var(--text-primary)]">"{row.anchor}"</span>
                  <span className="truncate font-mono text-[12px] text-[var(--text-secondary)]">{row.target}</span>
                  <ImpactBar value={row.impact} />
                  <button className="flex items-center gap-1 text-[12px] font-medium text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100 hover:text-[var(--text-primary)]">
                    Ajouter
                    <ChevronRightIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}

        {tab === "audit" && (() => {
          const TECH_TOC: TocItem[] = [
            { id: "tec-synthese",      label: "Synthèse" },
            { id: "tec-urgences",      label: "01 · Urgences" },
            { id: "tec-optimisations", label: "02 · Optimisations" },
            { id: "tec-diagnostic",    label: "03 · Diagnostic" },
            { id: "tec-donnees",       label: "04 · Données brutes" },
          ];
          const EDI_TOC: TocItem[] = [
            { id: "edi-synthese",        label: "Synthèse" },
            { id: "edi-lots",            label: "Lots" },
            { id: "edi-diagnostic",      label: "01 · Diagnostic" },
            { id: "edi-dimensions",      label: "02 · Dimensions" },
            { id: "edi-donnees",         label: "03 · Données brutes" },
            { id: "edi-cannibalisation", label: "05 · Cannibalisation" },
            { id: "edi-univers",         label: "06 · Univers sémantique" },
          ];
          const NET_TOC: TocItem[] = [
            { id: "net-benchmark",  label: "01 · Benchmark concurrents" },
            { id: "net-liens",      label: "02 · Profil des liens" },
            { id: "net-evolution",  label: "03 · Évolution TF" },
            { id: "net-topical",    label: "04 · Topical Trust Flow" },
            { id: "net-ancres",     label: "05 · Ancres" },
            { id: "net-visibilite", label: "06 · Visibilité SEO" },
          ];
          const currentToc = auditTab === "technique" ? TECH_TOC : auditTab === "editorial" ? EDI_TOC : NET_TOC;
          return (
            <div className="flex gap-10 items-start">
              <div className="min-w-0 flex-1 flex flex-col gap-6">
                <div className="flex justify-start">
                  <div className="flex h-9 items-center gap-0.5 rounded-full bg-[var(--bg-secondary)] p-1">
                    {(["technique", "editorial", "netlinking"] as const).map((t) => (
                      <button key={t} onClick={() => setAuditTab(t)}
                        className={`h-7 rounded-full px-3 text-[13px] font-medium transition-all duration-200 ${auditTab === t ? "bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}>
                        {t === "technique" ? "Technique" : t === "editorial" ? "Éditorial" : "Netlinking"}
                      </button>
                    ))}
                  </div>
                </div>
                {auditTab === "technique"  && <AuditTechniqueTab domain={decodedDomain} />}
                {auditTab === "editorial"  && <AuditEditorialTab domain={decodedDomain} />}
                {auditTab === "netlinking" && <AuditNetlinkingTab domain={decodedDomain} />}
              </div>
              <aside className="w-40 flex-shrink-0 self-stretch">
                <AuditToc items={currentToc} />
              </aside>
            </div>
          );
        })()}

        </div>{/* end content animate-fade-in */}
      </div>{/* end content max-w-5xl */}
    </div>{/* end overflow-y-auto */}

    {connectModal && (
      <ConnectModal
        tool={connectModal}
        onClose={() => {
          setConnectModal(null);
          if (returnToParametres) { setReturnToParametres(false); setParametresOpen(true); }
        }}
        onConnect={() => {
          if (connectModal === "gsc") {
            setGscConnected(true);
            showToast("Google Search Console connectée", <LinkIcon className="h-5 w-5" />);
          }
          if (connectModal === "ga4") {
            setGa4Connected(true);
            showToast("Google Analytics 4 connecté", <LinkIcon className="h-5 w-5" />);
          }
        }}
      />
    )}

    {importModalOpen && <ImportModal onClose={() => setImportModalOpen(false)} />}
    {urlModal === "import-csv" && <ImportCSVModal onClose={() => setUrlModal(null)} />}
    {urlModal === "add-url"    && <AddUrlModal    onClose={() => setUrlModal(null)} />}
    {urlModal === "new-brief"  && <NewBriefModal  onClose={() => setUrlModal(null)} />}

    {parametresOpen && (
      <ParametresModal
        domain={decodedDomain}
        gscConnected={gscConnected}
        ga4Connected={ga4Connected}
        onToggleGsc={() => {
          if (gscConnected) { setGscConnected(false); }
          else { setParametresOpen(false); setReturnToParametres(true); setConnectModal("gsc"); }
        }}
        onToggleGa4={() => {
          if (ga4Connected) { setGa4Connected(false); }
          else { setParametresOpen(false); setReturnToParametres(true); setConnectModal("ga4"); }
        }}
        onClose={() => setParametresOpen(false)}
      />
    )}
  </>
  );
}
