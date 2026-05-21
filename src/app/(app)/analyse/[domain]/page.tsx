"use client";

import { useState, useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { use } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { usePageMeta } from "@/context/PageMetaContext";
import { Button } from "@/components/Button";
import { useToast } from "@/context/ToastContext";
import { Tooltip, ChartTooltip } from "@/components/Tooltip";
import { AnimateIn } from "@/components/AnimateIn";
import { NumberInput } from "@/components/NumberInput";
import { BriefsView, TagList } from "@/components/BriefsView";
import { AuditTechniqueTab } from "@/components/AuditTechniqueTab";
import { AuditEditorialTab } from "@/components/AuditEditorialTab";
import { AuditNetlinkingTab } from "@/components/AuditNetlinkingTab";
import { Stepper } from "@/components/Stepper";
import { BlocCard, type BlocDef } from "@/components/BlocCard";
import { CannibalView } from "@/components/CannibalView";
import { DeltaIndicator } from "@/components/DeltaIndicator";
import { NetlinkingView } from "@/components/NetlinkingView";
import { UniversSemantiqueView } from "@/components/UniversSemantiqueView";
import { RankTracker } from "@/components/RankTracker";
import { AuditToc, type TocItem } from "@/components/AuditToc";
import { DropdownMenu, DropdownItem, DropdownSeparator } from "@/components/DropdownMenu";
import { SkeletonAnalyseHeader, SkeletonTabs, SkeletonAnalyseGeneral } from "@/components/Skeleton";
import {
  ChevronRightIcon,
  ArrowRightIcon,
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
import {
  TrendingUp,
  ChartBar as LChartBar,
  Trophy,
  Eye,
  Euro,
  Banknote,
  TriangleAlert,
  FilePlus,
  FileText,
  CircleCheck,
  FolderOpen as LFolderOpen,
  Link as LLink,
  Search as LSearch,
  MousePointerClick,
  Download,
  Upload,
  Trash2,
  X as LX,
  Sparkles as LSparkles,
  Settings,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  Layers as LLayers,
  Target as LTarget,
  Boxes,
  ArrowUpRight,
  Tag as LTag,
  Play as LPlay,
} from "lucide-react";
import { CheckCircleIcon as CheckCircleSolid, SparklesIcon } from "@heroicons/react/24/solid";
import { AIInsight } from "@/components/AIInsight";
import { KpiCard } from "@/components/KpiCard";
import { KpiGroup } from "@/components/KpiGroup";
import { VerticalBarChart } from "@/components/VerticalBarChart";
import { TableWide, type ColumnDef } from "@/components/TableWide";
import { SegmentedControl } from "@/components/SegmentedControl";
import { SearchInput } from "@/components/SearchInput";
import { EmptyState } from "@/components/EmptyState";
import { AreaChart } from "@/components/AreaChart";
import { FilterTabs } from "@/components/FilterTabs";

/* ── Helpers ─────────────────────────────────────────────────────────── */

type Tab = "general" | "briefs" | "seo" | "tracking" | "sea" | "forecast" | "netlinking" | "audit" | "cannibal" | "univers" | "recommandations";



const GRADIENTS = [
  "linear-gradient(to bottom, #3D4FFF, #6877FF)",
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
  const [faviconError, setFaviconError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(`project-logo:${domain}`);
    if (saved) setCustomImg(saved);
    setFaviconError(false);
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
        {/* Logo clickable area — même fallback que ProjectFavicon (dropdown) :
            custom → Google favicon → gradient + initial */}
        <div
          className="relative h-full w-full cursor-pointer overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]"
          onClick={() => inputRef.current?.click()}
        >
          {customImg ? (
            <img src={customImg} alt={domain} className="h-full w-full object-contain" />
          ) : !faviconError ? (
            <img
              src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
              alt={domain}
              onError={() => setFaviconError(true)}
              className="h-full w-full object-contain p-2"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[22px] font-semibold text-white" style={{ background: gradient }}>{initial}</div>
          )}

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
  const color  = score >= 70 ? "var(--color-success)" : score >= 50 ? "var(--color-warning)" : "var(--color-danger)";
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
    ? { color: "var(--color-danger)", bg: "var(--color-danger-bg)", label: count === 1 ? "critique" : "critiques" }
    : { color: "var(--color-warning)", bg: "rgba(245,158,11,0.09)", label: count === 1 ? "important" : "importants" };
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[12px] font-semibold" style={{ color: cfg.color, backgroundColor: cfg.bg }}>
      {count} {cfg.label}
    </span>
  );
}

function HealthCard({
  title, score, critiques, importants, visitesRisk, note, ctaHref, quote,
}: {
  title: string; score?: number; critiques: number; importants?: number;
  visitesRisk: string; actions?: HealthAction[]; note?: string;
  cta?: string; ctaHref?: string;
  color?: string; colorBg?: string; quote?: string;
}) {
  const inner = (
    <div className="group/health flex flex-1 flex-col min-w-0">
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
        <div className="mx-7 mb-4">
          <AIInsight>{quote}</AIInsight>
        </div>
      )}

      {/* Footer — note (optionnelle) à gauche, flèche bottom-right */}
      <div className="mt-auto flex items-center justify-between gap-4 px-7 pb-5 pt-2">
        {note ? (
          <span className="text-[11px] text-[var(--text-muted)]">{note}</span>
        ) : <span />}
        {ctaHref && (
          <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-[var(--text-secondary)] transition-colors duration-150 group-hover/health:text-[var(--accent-primary)]" />
        )}
      </div>
    </div>
  );

  return ctaHref ? <Link href={ctaHref} className="block">{inner}</Link> : inner;
}

/* ── Metric card ─────────────────────────────────────────────────────── */

/* ── Bloc stratégique ────────────────────────────────────────────────── */

/* ── PositionBarChart ────────────────────────────────────────────────── */

const POSITION_BARS = [
  { label: "Top 3",    value: 2  },
  { label: "4 – 10",   value: 3  },
  { label: "11 – 50",  value: 8  },
  { label: "51 – 100", value: 14 },
];

const POSITION_TOOLTIP_DETAILS: Record<string, { description: string; ctrEstime: string; recommandation: string }> = {
  "Top 3":    { description: "Première page, zone d'or",       ctrEstime: "~22–30 %", recommandation: "Maintenir et défendre les positions" },
  "4 – 10":   { description: "Première page, hors podium",     ctrEstime: "~4–9 %",   recommandation: "Pousser vers le top 3 (ROI ×3)" },
  "11 – 50":  { description: "Pages 2 à 5 — visibilité faible", ctrEstime: "~1–2 %",   recommandation: "Optimiser pour atteindre le top 10" },
  "51 – 100": { description: "Au-delà de la page 5",            ctrEstime: "<0,5 %",  recommandation: "Renforcer contenu + autorité" },
};

function PositionBarChart() {
  return (
    <VerticalBarChart
      data={POSITION_BARS}
      color="var(--accent-primary)"
      formatValue={(v) => v.toString()}
      tooltip={(item, _i, total) => {
        const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : "0";
        const d = POSITION_TOOLTIP_DETAILS[item.label];
        return (
          <div className="flex max-w-[260px] flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13px] font-semibold text-white">{item.label}</span>
              <span className="text-[11px] text-white/60">{pct} % du total</span>
            </div>
            <div className="text-[12px] font-medium text-white">{item.value.toLocaleString("fr-FR")} mots-clés</div>
            {d && (
              <div className="mt-1 space-y-1 border-t border-white/10 pt-2 text-[11px] leading-snug text-white/70">
                <div>{d.description}</div>
                <div><span className="text-white/55">CTR estimé : </span>{d.ctrEstime}</div>
                <div><span className="text-white/55">→ </span>{d.recommandation}</div>
              </div>
            )}
          </div>
        );
      }}
    />
  );
}

/* ── Concurrents organiques ──────────────────────────────────────────── */

type OrganicRow = { domain: string; tf: number; cf: number; bas: number; refDomains: number; isYou?: boolean };

const ORGANIC_YOU: OrganicRow = { domain: "votre-site.fr", tf: 28, cf: 41, bas: 12, refDomains: 520, isYou: true };

const ORGANIC_COMPETITORS: OrganicRow[] = [
  { domain: "noiise.com",                                 tf: 49, cf: 48, bas: 0,  refDomains: 1637 },
  { domain: "lk-interactive.fr",                          tf: 19, cf: 38, bas: 47, refDomains: 308 },
  { domain: "cybercite.fr",                               tf: 42, cf: 44, bas: 9,  refDomains: 902 },
  { domain: "eskimoz.fr",                                 tf: 21, cf: 47, bas: 13, refDomains: 1427 },
  { domain: "seo.fr",                                     tf: 51, cf: 46, bas: 16, refDomains: 1640 },
  { domain: "alioze.com",                                 tf: 14, cf: 42, bas: 0,  refDomains: 833 },
  { domain: "agencebespoke.com",                          tf: 13, cf: 42, bas: 48, refDomains: 369 },
  { domain: "adveris.fr",                                 tf: 37, cf: 45, bas: 47, refDomains: 736 },
  { domain: "axess.fr",                                   tf: 44, cf: 47, bas: 3,  refDomains: 1232 },
  { domain: "centre-formation-referencement-naturel.com", tf: 16, cf: 34, bas: 52, refDomains: 136 },
];

function DomainSquircle({ domain }: { domain: string }) {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[8px] bg-[var(--bg-subtle)] text-[10px] font-semibold uppercase tracking-micro text-[var(--text-muted)]">
        {domain.charAt(0)}
      </div>
    );
  }
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
      alt={domain}
      width={28}
      height={28}
      onError={() => setError(true)}
      className="h-7 w-7 flex-shrink-0 rounded-[8px] border border-[var(--border-subtle)] bg-[var(--bg-card)] object-contain p-0.5"
    />
  );
}

/* DeltaIndicator — déplacé vers @/components/DeltaIndicator (réutilisé en plusieurs endroits) */

function OrganicCompetitorsTable() {
  const rows = [ORGANIC_YOU, ...ORGANIC_COMPETITORS];
  const youCols = ORGANIC_YOU;

  const columns: ColumnDef<OrganicRow>[] = [
    {
      key: "domain",
      header: "Domaine",
      width: 280,
      flex: true,
      render: (c) => (
        <div className="flex items-center gap-3 min-w-0">
          <DomainSquircle domain={c.domain} />
          <span className={`block truncate text-[13px] ${c.isYou ? "font-semibold text-[var(--accent-primary)]" : "font-medium text-[var(--text-primary)]"}`}>
            {c.domain}
          </span>
          {c.isYou && (
            <span className="flex-shrink-0 rounded-full bg-[var(--accent-primary)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-micro text-white">
              Vous
            </span>
          )}
        </div>
      ),
    },
    {
      key: "tf",
      header: <ColHeaderInfo label="TF" align="right" tooltip={<TfTip />} />,
      width: 90, align: "right",
      sortable: true, sortValue: (c) => c.tf,
      render: (c) => (
        <span className="inline-flex items-center justify-end text-[13px] font-semibold tabular-nums text-[var(--text-primary)]">
          {c.tf}
          {!c.isYou && <DeltaIndicator value={c.tf} ref={youCols.tf} />}
        </span>
      ),
    },
    {
      key: "cf",
      header: <ColHeaderInfo label="CF" align="right" tooltip={<CfTip />} />,
      width: 90, align: "right",
      sortable: true, sortValue: (c) => c.cf,
      render: (c) => (
        <span className="inline-flex items-center justify-end text-[13px] font-semibold tabular-nums text-[var(--text-primary)]">
          {c.cf}
          {!c.isYou && <DeltaIndicator value={c.cf} ref={youCols.cf} />}
        </span>
      ),
    },
    {
      key: "bas",
      header: <ColHeaderInfo label="BAS" align="right" tooltip={<BasTip />} />,
      width: 90, align: "right",
      sortable: true, sortValue: (c) => c.bas,
      render: (c) => (
        <span className="inline-flex items-center justify-end text-[13px] font-semibold tabular-nums text-[var(--text-primary)]">
          {c.bas}
          {!c.isYou && <DeltaIndicator value={c.bas} ref={youCols.bas} />}
        </span>
      ),
    },
    {
      key: "refDomains",
      header: <ColHeaderInfo label="Ref Domains" align="right" tooltip={<RefDomTip />} />,
      width: 120, align: "right",
      sortable: true, sortValue: (c) => c.refDomains,
      render: (c) => (
        <span className="inline-flex items-center justify-end text-[13px] font-semibold tabular-nums text-[var(--text-primary)]">
          {c.refDomains.toLocaleString("fr-FR")}
          {!c.isYou && <DeltaIndicator value={c.refDomains} ref={youCols.refDomains} />}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[16px] font-semibold tracking-subheading text-[var(--text-primary)]">Concurrents organiques</p>
      <TableWide<OrganicRow>
        columns={columns}
        data={rows}
        rowKey={(r) => r.domain}
        isRowActive={(r) => !!r.isYou}
        minWidth={900}
        bordered
        edgePadding="24px"
        hidePagination
      />
    </div>
  );
}

/* ── VisibilityLineChart ─────────────────────────────────────────────── */

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

function VisibilityLineChart() {
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

/* BlocDef + BlocCard sont définis dans le DS : @/components/BlocCard */

/* ── Traffic chart ───────────────────────────────────────────────────── */

const TRAFFIC_BY_PERIOD = {
  "3m": [
    { label: "S1 Fév", value: 2840 },
    { label: "S2 Fév", value: 3120 },
    { label: "S3 Fév", value: 2980 },
    { label: "S4 Fév", value: 3340 },
    { label: "S1 Mar", value: 3690 },
    { label: "S2 Mar", value: 3470 },
    { label: "S3 Mar", value: 3810 },
    { label: "S4 Mar", value: 3750 },
    { label: "S1 Avr", value: 4020 },
    { label: "S2 Avr", value: 4280 },
    { label: "S3 Avr", value: 3960 },
    { label: "S4 Avr", value: 4490 },
  ],
  "6m": [
    { label: "S1 Nov", value: 1820 },
    { label: "S2 Nov", value: 1950 },
    { label: "S3 Nov", value: 2080 },
    { label: "S4 Nov", value: 2010 },
    { label: "S1 Déc", value: 2140 },
    { label: "S2 Déc", value: 2280 },
    { label: "S3 Déc", value: 2190 },
    { label: "S4 Déc", value: 2350 },
    { label: "S1 Jan", value: 2420 },
    { label: "S2 Jan", value: 2580 },
    { label: "S3 Jan", value: 2510 },
    { label: "S4 Jan", value: 2680 },
    { label: "S1 Fév", value: 2840 },
    { label: "S2 Fév", value: 3120 },
    { label: "S3 Fév", value: 2980 },
    { label: "S4 Fév", value: 3340 },
    { label: "S1 Mar", value: 3690 },
    { label: "S2 Mar", value: 3470 },
    { label: "S3 Mar", value: 3810 },
    { label: "S4 Mar", value: 3750 },
    { label: "S1 Avr", value: 4020 },
    { label: "S2 Avr", value: 4280 },
    { label: "S3 Avr", value: 3960 },
    { label: "S4 Avr", value: 4490 },
  ],
  "1an": [
    { label: "Mai 25",  value: 1240 },
    { label: "Juin 25", value: 1380 },
    { label: "Juil 25", value: 1520 },
    { label: "Août 25", value: 1490 },
    { label: "Sept 25", value: 1680 },
    { label: "Oct 25",  value: 1840 },
    { label: "Nov 25",  value: 1960 },
    { label: "Déc 25",  value: 2190 },
    { label: "Jan 26",  value: 2540 },
    { label: "Fév 26",  value: 3070 },
    { label: "Mar 26",  value: 3680 },
    { label: "Avr 26",  value: 4190 },
  ],
};

function TrafficChart() {
  const [period, setPeriod] = useState<"3m" | "6m" | "1an">("3m");
  return (
    <div className="rounded-2xl bg-[var(--bg-card)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[16px] font-semibold tracking-subheading text-[var(--text-primary)]">Évolution du trafic organique</p>
        <FilterTabs
          tabs={[{ key: "3m", label: "3m" }, { key: "6m", label: "6m" }, { key: "1an", label: "1 an" }]}
          value={period}
          onChange={setPeriod}
        />
      </div>
      <AreaChart data={TRAFFIC_BY_PERIOD[period]} height={128} gradientId="traffic-organic-grad" />
    </div>
  );
}

/* ── Chart placeholder ───────────────────────────────────────────────── */

function ChartBar({ label, color = "var(--accent-primary)" }: { label: string; color?: string }) {
  const bars = [42, 55, 48, 67, 74, 62, 81, 77, 85, 91, 79, 96];
  return (
    <div className="rounded-2xl bg-[var(--bg-card)] p-5">
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
    <div className="rounded-2xl bg-[var(--bg-card)] p-5">
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

type TopPage = {
  url: string;
  clicks: number;
  impressions: number;
  position: number;
  ctr: string;
  trend: number[];
};

const TOP_PAGES_ALL: TopPage[] = [
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

function MiniSparkline({ vals }: { vals: number[] }) {
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const range = max - min || 1;
  const w = 60, h = 22;
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts} fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function PosTag({ pos }: { pos: number }) {
  const color = pos <= 3 ? "var(--color-success)" : pos <= 10 ? "var(--accent-primary)" : pos <= 20 ? "var(--color-warning)" : "var(--text-muted)";
  return (
    <span className="inline-flex items-center rounded-full px-2 py-1 text-[12px] font-semibold" style={{ color, backgroundColor: `${color}18` }}>
      #{pos.toFixed(1)}
    </span>
  );
}

function TopPages() {
  const [search, setSearch] = useState("");
  const [urlFilter, setUrlFilter] = useState<"all" | "/blog" | "/services" | "/">("all");

  const filtered = TOP_PAGES_ALL.filter((p) => {
    if (search && !p.url.toLowerCase().includes(search.toLowerCase())) return false;
    if (urlFilter === "all") return true;
    if (urlFilter === "/") return p.url === "/";
    return p.url.startsWith(urlFilter);
  });

  const columns: ColumnDef<TopPage>[] = [
    {
      key: "url",
      header: "URL",
      width: 280,
      flex: true,
      render: (p) => (
        <span className="block truncate font-mono text-[13px] text-[var(--text-secondary)]">{p.url}</span>
      ),
    },
    {
      key: "clicks", header: "Clics", width: 90, align: "right",
      sortable: true, sortValue: (p) => p.clicks,
      render: (p) => <span className="text-[13px] font-semibold tabular-nums text-[var(--text-primary)]">{p.clicks.toLocaleString("fr-FR")}</span>,
    },
    {
      key: "impressions", header: "Impressions", width: 110, align: "right",
      sortable: true, sortValue: (p) => p.impressions,
      render: (p) => <span className="text-[13px] tabular-nums text-[var(--text-secondary)]">{p.impressions.toLocaleString("fr-FR")}</span>,
    },
    {
      key: "position", header: "Position", width: 90,
      sortable: true, sortValue: (p) => p.position,
      render: (p) => <PosTag pos={p.position} />,
    },
    {
      key: "ctr", header: "CTR", width: 70, align: "right",
      sortable: true, sortValue: (p) => parseFloat(p.ctr),
      render: (p) => <span className="text-[13px] tabular-nums text-[var(--text-secondary)]">{p.ctr}</span>,
    },
    {
      key: "trend", header: "Tendance", width: 90,
      render: (p) => <div className="flex justify-start"><MiniSparkline vals={p.trend} /></div>,
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar — search + filter button */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Rechercher une URL…" alwaysExpanded />
        <DropdownMenu
          width={200}
          trigger={
            <button
              type="button"
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-all ${urlFilter !== "all" ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] font-semibold" : "text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"}`}
            >
              {urlFilter === "all" ? "Toutes les URLs" : urlFilter === "/" ? "Accueil" : urlFilter}
              <ChevronDownIcon className="h-3 w-3 flex-shrink-0 opacity-70" />
            </button>
          }
        >
          <DropdownItem selected={urlFilter === "all"}       onClick={() => setUrlFilter("all")}>Toutes les URLs</DropdownItem>
          <DropdownItem selected={urlFilter === "/blog"}     onClick={() => setUrlFilter("/blog")}>/blog</DropdownItem>
          <DropdownItem selected={urlFilter === "/services"} onClick={() => setUrlFilter("/services")}>/services</DropdownItem>
          <DropdownItem selected={urlFilter === "/"}         onClick={() => setUrlFilter("/")}>/ (accueil)</DropdownItem>
        </DropdownMenu>
        <span className="ml-auto text-[12px] tabular-nums text-[var(--text-muted)]">
          {filtered.length} / {TOP_PAGES_ALL.length}
        </span>
      </div>

      <TableWide<TopPage>
        columns={columns}
        data={filtered}
        rowKey={(p) => p.url}
        emptyState="Aucune page pour ces filtres."
        minWidth={900}
        pageSize={25}
        bordered
        edgePadding="24px"
      />
    </div>
  );
}

/* ── Forecast timeline ───────────────────────────────────────────────── */

function ForecastTimeline() {
  const steps = [
    { month: "M+1", action: "Optimisation technique", gain: "+5 %", color: "var(--color-danger)", done: false },
    { month: "M+2", action: "Briefs Bloc 01 publiés", gain: "+12 %", color: "var(--color-warning)", done: false },
    { month: "M+3", action: "Maillage interne déployé", gain: "+22 %", color: "var(--color-success)", done: false },
    { month: "M+6", action: "Plan complet exécuté", gain: "+38 %", color: "var(--accent-primary)", done: false },
  ];
  return (
    <div className="rounded-2xl bg-[var(--bg-card)] p-5">
      <p className="mb-5 text-[12px] font-medium text-[var(--text-muted)]">Projection d'exécution</p>
      <div className="space-y-4">
        {steps.map((s) => (
          <div key={s.month} className="flex items-center gap-4">
            <span className="w-8 flex-shrink-0 text-[11px] font-medium text-[var(--text-muted)]">{s.month}</span>
            <div className="h-px flex-1 border-t border-dashed border-[var(--border-medium)]" />
            <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
              <span className="truncate text-[13px] text-[var(--text-secondary)]">{s.action}</span>
              <span className="flex-shrink-0 rounded-full px-2 py-1 text-[12px] font-semibold" style={{ color: s.color, backgroundColor: `color-mix(in oklab, ${s.color} 8%, transparent)` }}>
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
  const color = value >= 85 ? "var(--color-success)" : value >= 70 ? "var(--color-warning)" : "var(--accent-primary)";
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
  { key: "seo",              label: "Analytics SEO" },
  { key: "tracking",         label: "Tracking" },
  { key: "sea",              label: "SEA & Paid" },
  { key: "forecast",         label: "Forecast" },
  { key: "netlinking",       label: "Netlinking" },
  { key: "cannibal",         label: "Cannibalisation" },
  { key: "univers",          label: "Univers sémantique" },
  { key: "recommandations",  label: "Recommandations" },
  { key: "audit",            label: "Audit" },
];

const TAB_TITLES: Record<Tab, string> = {
  general:    "Vue d'ensemble",
  briefs:     "URLs",
  seo:        "Analytics SEO",
  tracking:   "Tracking",
  sea:        "SEA & Paid",
  forecast:   "Forecast",
  netlinking: "Netlinking",
  cannibal:   "Cannibalisation",
  univers:        "Univers sémantique",
  recommandations: "Recommandations",
  audit:          "Audit",
};

const TAB_SUBTITLES: Partial<Record<Tab, string>> = {
  cannibal: "Pages en conflit de positionnement — dilution du trafic et des signaux de pertinence.",
  univers:  "Identifiez les opportunités de contenu et résolvez les cannibalisations pour améliorer votre SEO.",
  tracking: "8 mots-clés · Dernier check : 04 mai, 14:00",
  recommandations: "Étude de mots-clés croisée avec vos concurrents — pages à créer et briefs priorisés.",
};

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
const SEGMENT_INFO: { label: string; info: ReactNode }[] = [
  {
    label: "Vache à lait",
    info: (
      <div className="space-y-2">
        <p className="font-semibold text-white">Vache à lait (Cash Cows)</p>
        <p className="text-white/70">Pages qui rapportent gros, à protéger.</p>
        <div className="space-y-0.5 text-white/80">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-white/40">Critères cumulatifs</p>
          <p>· Position ≤ 3 (Top 3 Google)</p>
          <p>· Clics ≥ 50 sur la période</p>
          <p>· &gt; 180 jours sans modif → flag "à rafraîchir"</p>
        </div>
        <p className="text-white/50 italic">Protéger · rafraîchir si vieillissant</p>
      </div>
    ),
  },
  {
    label: "Étoiles montantes",
    info: (
      <div className="space-y-2">
        <p className="font-semibold text-white">Étoiles montantes (Rising Stars)</p>
        <p className="text-white/70">Quick Wins — pages proches du Top 3.</p>
        <div className="space-y-0.5 text-white/80">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-white/40">Critères cumulatifs</p>
          <p>· Position 4–10 (page 1 hors Top 3)</p>
          <p>· Impressions ≥ 100</p>
          <p>· ≥ 2 positions gagnées vs N-1 → vraie Rising Star</p>
        </div>
        <p className="text-white/50 italic">Optimiser en priorité (fort ROI, faible effort)</p>
      </div>
    ),
  },
  {
    label: "En chute",
    info: (
      <div className="space-y-2">
        <p className="font-semibold text-white">En chute (Drops)</p>
        <p className="text-white/70">Pages qui perdent du trafic — urgent.</p>
        <div className="space-y-0.5 text-white/80">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-white/40">Critères (au moins un)</p>
          <p>· Clics ↓ ≥ 20 % vs N-1</p>
          <p>· Chute réelle : clics ↓ + position ↓ 3 places</p>
          <p>· Zero-click : clics ↓ mais position stable</p>
        </div>
        <p className="text-white/50 italic">Diagnostic technique/contenu urgent</p>
      </div>
    ),
  },
  {
    label: "Pages zombies",
    info: (
      <div className="space-y-2">
        <p className="font-semibold text-white">Pages zombies</p>
        <p className="text-white/70">Pages mortes — visibles mais sans clic.</p>
        <div className="space-y-0.5 text-white/80">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-white/40">Critères cumulatifs</p>
          <p>· Clics ≤ 10</p>
          <p>· CTR ≤ 1 %</p>
          <p>· Impressions ≥ 50 (sinon = invisible)</p>
        </div>
        <p className="text-white/50 italic">Pruning · désindexation · redirection · refonte</p>
      </div>
    ),
  },
  {
    label: "Nouveau contenu",
    info: (
      <div className="space-y-2">
        <p className="font-semibold text-white">Nouveau contenu</p>
        <p className="text-white/70">Pages récentes (&lt; 30 jours) — patience.</p>
        <p className="text-white/50 italic">Surveiller sans sur-optimiser</p>
      </div>
    ),
  },
];

const SEGMENT_PRIORITY_INFO = (
  <div className="space-y-2">
    <p className="font-semibold text-white">Ordre de priorité d'attribution</p>
    <p className="text-white/60">Si une page coche plusieurs segments :</p>
    <div className="space-y-0.5 text-white/80">
      <p>1. Cannibals <span className="text-white/40">(bloque tout)</span></p>
      <p>2. En chute <span className="text-white/40">(urgent)</span></p>
      <p>3. Étoiles montantes <span className="text-white/40">(opportunité)</span></p>
      <p>4. Pages zombies <span className="text-white/40">(nettoyage)</span></p>
      <p>5. Vache à lait <span className="text-white/40">(protection)</span></p>
      <p>6. Nouveau contenu <span className="text-white/40">(&lt; 30 jours)</span></p>
      <p>7. Stable <span className="text-white/40">(par défaut)</span></p>
    </div>
  </div>
);

const INFO_ICON_SVG = (
  <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
    <path d="M8 7v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <circle cx="8" cy="5.2" r="0.8" fill="currentColor" />
  </svg>
);

function InfoIcon({ content }: { content: ReactNode }) {
  return (
    <Tooltip label={content} rich portal side="top">
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        className="flex items-center justify-center text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
      >
        {INFO_ICON_SVG}
      </button>
    </Tooltip>
  );
}

function SegmentPill({ label, info, active, onToggle }: { label: string; info: ReactNode; active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all ${
        active
          ? "border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg-primary)]"
          : "border-[var(--border-medium)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]"
      }`}
    >
      {label}
      <Tooltip label={info} rich portal side="top">
        <span
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="flex items-center justify-center opacity-40 transition-opacity hover:opacity-80"
        >
          {INFO_ICON_SVG}
        </span>
      </Tooltip>
    </button>
  );
}

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
  if (typeof document === "undefined") return null;
  return createPortal(
    <div role="presentation" className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" className="relative w-full max-w-[480px] rounded-3xl bg-[var(--modal-bg)] p-8 shadow-[var(--shadow-floating)]">
        <button onClick={onClose} className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]">
          <XMarkIcon className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}

function FormField({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-secondary)]">
        {label}
        {required && <span className="ml-0.5 text-[var(--color-danger)]">*</span>}
        {hint && <span className="ml-1.5 font-normal text-[var(--text-muted)]">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

const fieldCls = "w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--card-inner-bg)] px-3.5 py-2.5 text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] focus:border-[var(--border-medium)] transition-colors";

/* ── Import CSV Modal ────────────────────────────────────────────────── */

type ParsedUrl = { url: string; keyword: string | null; volume: number | null };

function ImportCSVModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"csv" | "paste">("csv");
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedUrl[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pasted, setPasted] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    setError(null);
    if (!/\.csv$/i.test(f.name)) {
      setError("Le fichier doit être au format .csv");
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = String(e.target?.result ?? "");
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const startIdx = /url|page/i.test(lines[0]?.split(",")[0] ?? "") ? 1 : 0;
      const rows = lines.slice(startIdx).map(line => {
        const cells = line.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
        const vol = cells[2] ? Number(cells[2].replace(/\s/g, "")) : null;
        return {
          url: cells[0] ?? "",
          keyword: cells[1] && cells[1].length > 0 ? cells[1] : null,
          volume: vol !== null && Number.isFinite(vol) ? vol : null,
        };
      }).filter(r => r.url.length > 0);
      if (rows.length === 0) {
        setError("Aucune URL valide détectée dans le fichier.");
        setParsed([]);
        return;
      }
      setParsed(rows);
    };
    reader.readAsText(f);
  }

  const pastedCount = pasted.split(/\r?\n/).map(l => l.trim()).filter(Boolean).length;
  const canImport = tab === "csv" ? parsed.length > 0 : pastedCount > 0;

  return (
    <ModalShell onClose={onClose}>
      <h2 className="pr-10 text-[22px] font-semibold tracking-heading text-[var(--text-primary)]">Importer des URLs</h2>
      <p className="mt-1 text-[13px] tracking-body text-[var(--text-muted)]">Choisissez votre méthode d'importation</p>

      <div className="mt-5 flex items-center gap-1 rounded-2xl bg-[var(--bg-secondary)] p-1">
        {([["csv", "Importer CSV"], ["paste", "Coller des URLs"]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className="flex-1 rounded-xl py-1.5 text-[13px] font-medium transition-all"
            style={tab === key ? { backgroundColor: "var(--modal-bg)", color: "var(--text-primary)", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" } : { color: "var(--text-muted)" }}>
            {label}
          </button>
        ))}
      </div>

      {tab === "csv" && (
        <div className="mt-5 flex flex-col gap-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 transition-colors ${dragging ? "border-[var(--accent-primary)] bg-[var(--accent-primary-soft)]" : "border-[var(--border-subtle)] hover:border-[var(--border-medium)] hover:bg-[var(--bg-secondary)]"}`}
          >
            {file ? (
              <>
                <FileSpreadsheet className="h-8 w-8 text-[var(--color-success)]" />
                <p className="text-[14px] font-medium text-[var(--text-primary)]">{file.name}</p>
                <p className="text-[12px] tracking-caption text-[var(--text-muted)]">
                  {parsed.length} URL{parsed.length > 1 ? "s" : ""} détectée{parsed.length > 1 ? "s" : ""} · cliquez pour changer
                </p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-[var(--text-muted)]" />
                <p className="text-[14px] font-medium text-[var(--text-primary)]">Glissez un fichier CSV ou cliquez pour parcourir</p>
                <p className="text-[12px] tracking-caption text-[var(--text-muted)]">Colonnes : <code className="font-mono text-[11px]">url</code> · <code className="font-mono text-[11px]">keyword</code> (optionnel) · <code className="font-mono text-[11px]">volume</code> (optionnel)</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>

          {error && <p className="text-[12px] tracking-caption text-[var(--color-danger)]">{error}</p>}

          {parsed.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <p className="text-[13px] font-medium text-[var(--text-secondary)]">Aperçu ({Math.min(5, parsed.length)} premier{parsed.length > 1 ? "s" : ""} sur {parsed.length})</p>
              <div className="rounded-xl border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)]">
                {parsed.slice(0, 5).map((p, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 px-3 py-2 text-[13px]">
                    <span className="truncate font-mono text-[12px] text-[var(--text-primary)]">{p.url}</span>
                    {p.keyword && (
                      <span className="ml-3 flex-shrink-0 rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 text-[11px] tracking-caption text-[var(--text-muted)]">{p.keyword}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {tab === "paste" && (
        <div className="mt-5">
          <textarea value={pasted} onChange={(e) => setPasted(e.target.value)}
            placeholder={"https://exemple.com/page-1\nhttps://exemple.com/page-2"}
            className="w-full resize-none rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4 font-mono text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] focus:border-[var(--border-medium)] transition-colors"
            rows={7} autoFocus />
          <p className="mt-1.5 text-[11px] tracking-caption text-[var(--text-muted)]">Une URL par ligne · {pastedCount} détectée{pastedCount > 1 ? "s" : ""}</p>
        </div>
      )}

      <div className="mt-6 flex items-center justify-end gap-3">
        <button onClick={onClose} className="rounded-full px-4 py-2 text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">Annuler</button>
        <Button disabled={!canImport} onClick={onClose}>
          Importer {tab === "csv" && parsed.length > 0 ? `${parsed.length} URL${parsed.length > 1 ? "s" : ""}` : tab === "paste" && pastedCount > 0 ? `${pastedCount} URL${pastedCount > 1 ? "s" : ""}` : ""}
        </Button>
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

function NewBriefModal({ onClose, initialKeyword = "" }: { onClose: () => void; initialKeyword?: string }) {
  const [keyword, setKeyword] = useState(initialKeyword);
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
      <div role="dialog" aria-modal="true" className="w-full max-w-2xl rounded-3xl bg-[var(--modal-bg)] p-8 shadow-[var(--shadow-floating)]">

        <Stepper steps={3} current={step} onClose={onClose} />

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
                        : "border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--border-medium)] hover:bg-[var(--bg-secondary)]"
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
                      <span key={kw} className="animate-slide-down flex items-center gap-1 rounded-full bg-[var(--text-primary)] px-3 py-1.5 text-[12px] font-medium text-[var(--bg-primary)]">
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
                        <span key={tag} className="animate-slide-down flex items-center gap-1 rounded-full bg-[var(--text-primary)] px-3 py-1.5 text-[12px] font-medium text-[var(--bg-primary)]">
                          {tag}
                          <button onClick={() => f.setTags((p) => p.filter((x) => x !== tag))} className="opacity-60 hover:opacity-100"><XMarkIcon className="h-3 w-3" /></button>
                        </span>
                      ))}
                    </div>
                  </AnimateIn>
                </div>
              ))}

              <div>
                <div className="mb-2 flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-[var(--text-muted)]">Filtrer par segments GSC</span>
                  <InfoIcon content={SEGMENT_PRIORITY_INFO} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {SEGMENT_INFO.map(({ label, info }) => (
                    <SegmentPill
                      key={label}
                      label={label}
                      info={info}
                      active={segments.includes(label)}
                      onToggle={() => setSegments((p) => p.includes(label) ? p.filter((x) => x !== label) : [...p, label])}
                    />
                  ))}
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
                      Fusionner avec un autre tag
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
      <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-3xl bg-[var(--modal-bg)] p-8 shadow-[var(--shadow-floating)]">
        <div className="flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
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
              <CheckCircleSolid className="h-3.5 w-3.5 text-[var(--color-success)]" />
              {label}
              <EllipsisHorizontalIcon className="h-5 w-5 text-[var(--text-muted)]" />
            </Button>
          </Tooltip>
        }
      >
        <DropdownItem icon={Download} onClick={onImport}>Importer des pages GSC</DropdownItem>
        <DropdownItem icon={Trash2}>Supprimer des pages GSC</DropdownItem>
        <DropdownSeparator />
        <DropdownItem danger icon={LX} onClick={onClick}>Déconnecter GSC</DropdownItem>
      </DropdownMenu>
    );
  }

  if (connected) {
    return (
      <Button size="md" variant="secondary" className="text-[14px]" onClick={onClick}>
        <CheckCircleSolid className="h-3.5 w-3.5 text-[var(--color-success)]" />
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
  { id: "cuik",      name: "Cuik",           desc: "Plateforme de création de contenu IA",        initials: "CK", color: "var(--color-success)", bg: "var(--color-success-soft)" },
  { id: "haloscan",  name: "Haloscan",       desc: "Scraping SERP · données Google",             initials: "HS", color: "var(--color-warning)", bg: "rgba(245,158,11,0.12)" },
  { id: "openai",    name: "OpenAI",         desc: "Génération IA · modèles GPT",                initials: "OA", color: "#10A37F", bg: "rgba(16,163,127,0.12)" },
  { id: "seobs",     name: "SEObserver",     desc: "Visibilité SEO · snapshots",                 initials: "SO", color: "var(--accent-primary)", bg: "rgba(62,80,245,0.12)"  },
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
    <div className="flex items-center justify-between rounded-2xl bg-[var(--bg-card)] px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--bg-subtle)]">
          {logo}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-semibold text-[var(--text-primary)]">{name}</p>
            <span className="inline-flex items-center rounded-full px-2 py-1 text-[12px] font-medium"
              style={{ color: connected ? "var(--color-success)" : "var(--text-muted)", backgroundColor: connected ? "var(--color-success-bg)" : "var(--bg-secondary)" }}>
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
  const [projectStatus, setProjectStatus] = useState<"actif" | "archive">("actif");
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
        className="flex w-full max-w-2xl flex-col rounded-3xl bg-[var(--modal-bg)] shadow-[var(--shadow-floating)]"
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
                <div key={card.title} className="rounded-2xl bg-[var(--bg-card)] p-5">
                  <div className="flex items-start gap-5">
                    {/* Icon */}
                    <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl ${card.configured ? "bg-[rgba(16,185,129,0.1)]" : "bg-[var(--bg-secondary)]"}`}>
                      {card.configured ? (
                        <CheckCircleSolid className="h-7 w-7 text-[var(--color-success)]" />
                      ) : (
                        <DocumentTextIcon className="h-7 w-7 text-[var(--text-muted)]" strokeWidth={1.5} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[14px] font-semibold text-[var(--text-primary)]">{card.title}</p>
                        {card.configured && (
                          <button onClick={card.onRemove} className="flex-shrink-0 text-[var(--text-muted)] transition-colors hover:text-[var(--color-danger)]">
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {card.configured ? (
                        <>
                          <p className="mt-1 text-[13px] font-medium text-[var(--color-success)]">Configuré</p>
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
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(16,185,129,0.09)] px-3 py-1.5 text-[12px] font-medium text-[var(--color-success)]">
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
                  <span key={tag} className="flex items-center gap-1 rounded-full bg-[var(--text-primary)] px-3 py-1.5 text-[12px] font-medium text-[var(--bg-primary)]">
                    {tag}
                    <button onClick={() => setTags((p) => p.filter((t) => t !== tag))} className="opacity-60 transition-opacity hover:opacity-100">
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Statut du projet ──────────────────────────────────────── */}
          <div>
            <p className="mb-1 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Statut du projet</p>
            <p className="mb-4 text-[13px] text-[var(--text-muted)]">
              Un projet archivé conserve ses données mais n'apparaît plus dans les listes actives et ses analyses récurrentes sont mises en pause.
            </p>
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border-subtle)] px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <span
                  className="h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: projectStatus === "actif" ? "var(--color-success)" : "var(--text-muted)" }}
                />
                <div>
                  <p className="text-[13px] font-medium text-[var(--text-primary)]">
                    {projectStatus === "actif" ? "Projet actif" : "Projet archivé"}
                  </p>
                  <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">
                    {projectStatus === "actif"
                      ? "Analyses récurrentes activées, visible dans toutes les vues."
                      : "Lecture seule, masqué des dashboards par défaut."}
                  </p>
                </div>
              </div>
              <SegmentedControl
                options={[
                  { key: "actif",   label: "Actif" },
                  { key: "archive", label: "Archivé" },
                ]}
                value={projectStatus}
                onChange={setProjectStatus}
              />
            </div>
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

/* ── Recommandations ──────────────────────────────────────────────────── */

function SemrushFileField({
  label,
  required = false,
  file,
  onFile,
}: {
  label: string;
  required?: boolean;
  file: File | null;
  onFile: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-medium text-[var(--text-secondary)]">
        {label} {required && <span className="text-[var(--color-danger)]">*</span>}
      </label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files[0];
          if (f) onFile(f);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed px-5 py-4 transition-colors ${
          dragOver
            ? "border-[var(--accent-primary)] bg-[var(--accent-primary-soft)]"
            : file
            ? "border-[var(--border-medium)] bg-[var(--bg-secondary)]"
            : "border-[var(--border-subtle)] hover:border-[var(--border-medium)] hover:bg-[var(--bg-secondary)]"
        }`}
      >
        {file ? (
          <>
            <FileSpreadsheet className="h-6 w-6 flex-shrink-0 text-[var(--color-success)]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-[var(--text-primary)]">{file.name}</p>
              <p className="text-[11px] tracking-caption text-[var(--text-muted)]">{(file.size / 1024).toFixed(1)} Ko · cliquez pour changer</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onFile(null); }}
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
              aria-label="Retirer"
            >
              <LX className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <Upload className="h-6 w-6 flex-shrink-0 text-[var(--text-muted)]" />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-[var(--text-primary)]">Aucun fichier choisi</p>
              <p className="text-[11px] tracking-caption text-[var(--text-muted)]">Glissez un export CSV / XLSX ou cliquez pour parcourir</p>
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls,text/csv"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  );
}

function KeywordStudyModal({ onClose, onLaunch }: { onClose: () => void; onLaunch: () => void }) {
  const [clientFile, setClientFile] = useState<File | null>(null);
  const [compFile,   setCompFile]   = useState<File | null>(null);

  const canLaunch = clientFile !== null;

  function handleLaunch() {
    if (!canLaunch) return;
    onLaunch();
    onClose();
  }

  return (
    <ModalShell onClose={onClose}>
      <h2 className="pr-10 text-[22px] font-semibold tracking-heading text-[var(--text-primary)]">Identifier les pages manquantes</h2>
      <p className="mt-1 text-[13px] tracking-body text-[var(--text-muted)]">
        Détectez les mots-clés que vos concurrents ont et que vous n'avez pas.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <SemrushFileField
          label="Export Semrush — positions organiques du client"
          required
          file={clientFile}
          onFile={setClientFile}
        />
        <SemrushFileField
          label="Export Semrush — concurrent (optionnel)"
          file={compFile}
          onFile={setCompFile}
        />
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button onClick={onClose} className="rounded-full px-4 py-2 text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">Annuler</button>
        <Button disabled={!canLaunch} onClick={handleLaunch}>
          <LSparkles className="h-4 w-4" />
          Lancer l'étude de mots-clés
        </Button>
      </div>
    </ModalShell>
  );
}

/* ── Recommandations — données mock de l'étude de mots-clés ────────── */

type StudyIntent = "Commercial" | "Transactionnel" | "Informationnel";
type StudyPrio = "P0" | "P1" | "P2" | "P3";
type StudyRow = {
  keyword: string;
  cluster: string;
  volume: number;
  kd: number | null;
  kei: number | null;
  score: number | null;
  trafic: number | null;
  position: number | null;
  intent: StudyIntent;
  priority: StudyPrio;
  pageCible: string | null;
};

const STUDY_ROWS: StudyRow[] = [
  { keyword: "agence seo paris",         cluster: "SEO",           volume: 5400, kd: 78,   kei: 369114, score: 80, trafic: null, position: 12,   intent: "Commercial",     priority: "P1", pageCible: "/agence-seo-paris/" },
  { keyword: "audit seo gratuit",        cluster: "SEO",           volume: 4400, kd: 70,   kei: 272676, score: 60, trafic: null, position: 25,   intent: "Transactionnel", priority: "P1", pageCible: "/audit-seo-gratuit/" },
  { keyword: "agence google ads",        cluster: "SEA / Ads",     volume: 3600, kd: 75,   kei: 170526, score: 80, trafic: null, position: 18,   intent: "Commercial",     priority: "P2", pageCible: "/nouvelle-taxe-google-ads-nos-experts-vous-guident/" },
  { keyword: "agence sea",               cluster: "SEA / Ads",     volume: 2900, kd: 72,   kei: 115206, score: 80, trafic: 15,   position: 8,    intent: "Commercial",     priority: "P2", pageCible: "/agence-sea/" },
  { keyword: "agence seo",               cluster: "SEO",           volume: 2100, kd: null, kei: null,   score: 0,  trafic: null, position: null, intent: "Commercial",     priority: "P1", pageCible: null },
  { keyword: "consultant seo freelance", cluster: "SEO",           volume: 1900, kd: 65,   kei: 54697,  score: 80, trafic: null, position: 15,   intent: "Commercial",     priority: "P1", pageCible: "/consultant-seo-freelance/" },
  { keyword: "consultant seo paris",     cluster: "SEO",           volume: 1900, kd: null, kei: null,   score: 0,  trafic: null, position: null, intent: "Commercial",     priority: "P1", pageCible: null },
  { keyword: "consultant google ads",    cluster: "SEA / Ads",     volume: 1300, kd: null, kei: null,   score: 0,  trafic: null, position: null, intent: "Commercial",     priority: "P2", pageCible: null },
  { keyword: "agence sea paris",         cluster: "SEA / Ads",     volume: 1300, kd: 68,   kei: 24493,  score: 80, trafic: null, position: 14,   intent: "Commercial",     priority: "P2", pageCible: "/agence-sea-paris/" },
  { keyword: "seo b2b",                  cluster: "SEO",           volume: 1100, kd: 58,   kei: 20509,  score: 80, trafic: null, position: 19,   intent: "Commercial",     priority: "P1", pageCible: "/seo-b2b/" },
  { keyword: "audit seo technique",      cluster: "SEO Technique", volume: 1000, kd: null, kei: null,   score: 0,  trafic: null, position: null, intent: "Commercial",     priority: "P1", pageCible: null },
  { keyword: "agence digitale ia",       cluster: "IA / GEO",      volume: 880,  kd: 58,   kei: 13125,  score: 70, trafic: 42,   position: 6,    intent: "Commercial",     priority: "P2", pageCible: "/agence-ia/" },
  { keyword: "expert google ads",        cluster: "SEA / Ads",     volume: 880,  kd: null, kei: null,   score: 0,  trafic: null, position: null, intent: "Commercial",     priority: "P2", pageCible: null },
  { keyword: "prix audit seo",           cluster: "SEO",           volume: 720,  kd: null, kei: null,   score: 0,  trafic: null, position: null, intent: "Transactionnel", priority: "P1", pageCible: null },
  { keyword: "agence social ads",        cluster: "Social Ads",    volume: 590,  kd: 55,   kei: 6216,   score: 70, trafic: 28,   position: 9,    intent: "Commercial",     priority: "P2", pageCible: "/agence-social-ads/" },
  { keyword: "agence ia paris",          cluster: "IA / GEO",      volume: 590,  kd: 52,   kei: 6568,   score: 70, trafic: null, position: 13,   intent: "Commercial",     priority: "P2", pageCible: "/agence-ia-paris/" },
  { keyword: "agence ia marketing",      cluster: "IA / GEO",      volume: 320,  kd: 48,   kei: 2090,   score: 70, trafic: 15,   position: 7,    intent: "Commercial",     priority: "P2", pageCible: "/agence-ia-marketing/" },
  { keyword: "devis audit seo",          cluster: "SEO",           volume: 210,  kd: null, kei: null,   score: 0,  trafic: null, position: null, intent: "Transactionnel", priority: "P1", pageCible: null },
  { keyword: "audit seo complet",        cluster: "SEO",           volume: 200,  kd: null, kei: null,   score: 0,  trafic: null, position: null, intent: "Commercial",     priority: "P1", pageCible: null },
  { keyword: "prix google ads",          cluster: "SEA / Ads",     volume: 170,  kd: null, kei: null,   score: 0,  trafic: null, position: null, intent: "Transactionnel", priority: "P2", pageCible: null },
];

const CLUSTER_COLOR: Record<string, string> = {
  "SEO":           "var(--accent-primary)",
  "SEA / Ads":     "var(--color-warning)",
  "IA / GEO":      "#A855F7",
  "Social Ads":    "#0891B2",
  "SEO Technique": "var(--accent-primary)",
};

const INTENT_CFG: Record<StudyIntent, { label: string; color: string; bg: string }> = {
  Commercial:     { label: "Comm.",  color: "#0891B2", bg: "rgba(6,182,212,0.12)" },
  Transactionnel: { label: "Trans.", color: "#9333EA", bg: "rgba(168,85,247,0.10)" },
  Informationnel: { label: "Info.",  color: "#6B7280", bg: "rgba(107,114,128,0.10)" },
};

const PRIO_CFG: Record<StudyPrio, { color: string; bg: string }> = {
  P0: { color: "var(--color-danger)", bg: "var(--color-danger-bg)" },
  P1: { color: "var(--color-danger)", bg: "var(--color-danger-bg)" },
  P2: { color: "#B45309", bg: "rgba(245,158,11,0.12)" },
  P3: { color: "#6B7280", bg: "rgba(107,114,128,0.10)" },
};

const LOADING_STEPS = [
  "Lecture du fichier Semrush",
  "Identification des concurrents",
  "Détection des clusters sémantiques",
  "Calcul des opportunités",
  "Génération du rapport",
];

/* ── Vue Recommandations ────────────────────────────────────────────── */

function RecommandationsView({
  title,
  subtitle,
  onOpenPageByUrl,
}: {
  title?: string;
  subtitle?: string;
  onOpenPageByUrl?: (url: string) => void;
} = {}) {
  const [studyOpen, setStudyOpen] = useState(false);
  const [studyState, setStudyState] = useState<"empty" | "loading" | "done">("done");
  const [loadingStep, setLoadingStep] = useState(0);
  const [briefKeyword, setBriefKeyword] = useState<string | null>(null);
  /* Filters & search on the recommandations table */
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<"all" | StudyPrio>("all");
  const [filterCluster, setFilterCluster] = useState<"all" | string>("all");
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearTimers() {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }
  useEffect(() => clearTimers, []);

  function startStudy() {
    clearTimers();
    setStudyState("loading");
    setLoadingStep(0);
    const stepDurations = [600, 700, 800, 700, 600];
    let acc = 0;
    stepDurations.forEach((ms, i) => {
      acc += ms;
      timersRef.current.push(setTimeout(() => setLoadingStep(i + 1), acc));
    });
    timersRef.current.push(setTimeout(() => setStudyState("done"), acc + 250));
  }

  /* KPIs */
  const totalOpps = STUDY_ROWS.length;
  const actionnables = STUDY_ROWS.filter((r) => r.priority === "P1" || r.priority === "P2").length;
  const clusters = new Set(STUDY_ROWS.map((r) => r.cluster)).size;

  /* Filtered rows */
  const uniqueClusters = Array.from(new Set(STUDY_ROWS.map((r) => r.cluster)));
  const filteredRows = STUDY_ROWS.filter((r) => {
    if (search && !r.keyword.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterPriority !== "all" && r.priority !== filterPriority) return false;
    if (filterCluster !== "all" && r.cluster !== filterCluster) return false;
    return true;
  });

  /* Columns */
  const columns: ColumnDef<StudyRow>[] = [
    {
      key: "keyword",
      header: "Mot-clé",
      width: 220,
      flex: true,
      render: (r) => (
        <span className="block truncate text-[13px] text-[var(--text-primary)]" title={r.keyword}>{r.keyword}</span>
      ),
    },
    {
      key: "cluster",
      header: "Cluster",
      width: 140,
      render: (r) => (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-subtle)] px-2.5 py-1 text-[12px] font-medium text-[var(--text-secondary)]">
          <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: CLUSTER_COLOR[r.cluster] ?? "var(--text-muted)" }} />
          {r.cluster}
        </span>
      ),
    },
    { key: "volume", header: "Volume", width: 90, align: "right",
      sortable: true, sortValue: (r) => r.volume,
      render: (r) => <span className="text-[13px] tabular-nums text-[var(--text-secondary)]">{r.volume.toLocaleString("fr-FR")}</span> },
    { key: "kd", header: <ColHeaderInfo label="KD" align="right" tooltip={<KdTip />} />, width: 70, align: "right",
      sortable: true, sortValue: (r) => r.kd ?? -1,
      render: (r) => r.kd != null
        ? <span className="text-[13px] tabular-nums text-[var(--text-secondary)]">{r.kd}</span>
        : <span className="text-[13px] text-[var(--text-muted)]">—</span> },
    { key: "kei", header: <ColHeaderInfo label="KEI" align="right" tooltip={<KeiTip />} />, width: 100, align: "right",
      sortable: true, sortValue: (r) => r.kei ?? -1,
      render: (r) => r.kei != null
        ? <span className="text-[13px] tabular-nums text-[var(--text-secondary)]">{r.kei.toLocaleString("fr-FR")}</span>
        : <span className="text-[13px] text-[var(--text-muted)]">—</span> },
    { key: "score", header: "Score", width: 64, align: "right",
      sortable: true, sortValue: (r) => r.score ?? -1,
      render: (r) => {
        if (r.score == null || r.score === 0) return <span className="text-[13px] text-[var(--text-muted)]">—</span>;
        const color = r.score >= 75 ? "var(--color-success)" : r.score >= 60 ? "var(--color-warning)" : "var(--color-danger)";
        return <span className="text-[13px] font-semibold tabular-nums" style={{ color }}>{r.score}</span>;
      } },
    { key: "trafic", header: "Trafic est.", width: 88, align: "right",
      sortable: true, sortValue: (r) => r.trafic ?? -1,
      render: (r) => r.trafic != null
        ? <span className="text-[13px] tabular-nums text-[var(--text-secondary)]">{r.trafic}</span>
        : <span className="text-[13px] text-[var(--text-muted)]">—</span> },
    { key: "position", header: "Position", width: 72, align: "right",
      sortable: true, sortValue: (r) => r.position ?? 9999,
      render: (r) => r.position != null
        ? <span className="text-[13px] font-semibold tabular-nums text-[var(--text-primary)]">#{r.position}</span>
        : <span className="text-[13px] text-[var(--text-muted)]">—</span> },
    { key: "intent", header: "Intent", width: 88,
      render: (r) => {
        const cfg = INTENT_CFG[r.intent];
        return <span className="inline-flex items-center rounded-md px-2 py-1 text-[12px] font-medium" style={{ color: cfg.color, backgroundColor: cfg.bg }}>{cfg.label}</span>;
      } },
    { key: "priority", header: "Priorité", width: 80,
      render: (r) => {
        const cfg = PRIO_CFG[r.priority];
        return <span className="inline-flex items-center rounded-md px-2 py-1 text-[12px] font-medium" style={{ color: cfg.color, backgroundColor: cfg.bg }}>{r.priority}</span>;
      } },
    { key: "pageCible", header: "Page cible", width: 240,
      render: (r) => r.pageCible
        ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onOpenPageByUrl?.(r.pageCible!); }}
            className="inline-flex max-w-full min-w-0 items-center rounded-md px-1 py-0.5 -mx-1 transition-colors hover:bg-[var(--bg-subtle)]"
          >
            <span className="truncate font-mono text-[12px] text-[var(--text-secondary)] underline decoration-[var(--border-medium)] decoration-1 underline-offset-[3px] hover:text-[var(--text-primary)] hover:decoration-[var(--text-primary)]">
              {r.pageCible}
            </span>
          </button>
        )
        : <span className="text-[13px] text-[var(--text-muted)]">—</span> },
  ];

  return (
    <div className="flex flex-col gap-5">

      {/* Header — title (passed by parent) on the left, CTAs on the right (space-between) */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          {title && (
            <h2 className="text-[24px] font-semibold leading-none tracking-heading text-[var(--text-primary)]">{title}</h2>
          )}
          {subtitle && (
            <p className="mt-1 text-[14px] tracking-body text-[var(--text-secondary)]">{subtitle}</p>
          )}
        </div>
        {studyState === "done" && (
          <div className="flex flex-shrink-0 items-center gap-2">
            <Button variant="secondary">
              <Download className="h-4 w-4" />
              Exporter
            </Button>
            <Button variant="secondary" onClick={() => setStudyOpen(true)}>
              <RefreshCw className="h-4 w-4" />
              Relancer
            </Button>
          </div>
        )}
      </div>

      {/* ── State : empty ── */}
      {studyState === "empty" && (
        <div className="rounded-3xl bg-[var(--bg-card)]">
          <EmptyState
            icon={<LSparkles className="h-7 w-7" />}
            title="Aucune étude de mots-clés"
            description="Lancez une étude pour identifier les pages manquantes et les opportunités face à vos concurrents."
            action={
              <Button onClick={() => setStudyOpen(true)}>
                <LSparkles className="h-4 w-4" />
                Lancer une étude de mots-clés
              </Button>
            }
          />
        </div>
      )}

      {/* ── State : loading ── */}
      {studyState === "loading" && (
        <div className="rounded-3xl bg-[var(--bg-card)] p-10">
          <div className="mx-auto flex max-w-[420px] flex-col items-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-primary-soft)]">
              <Loader2 className="h-7 w-7 animate-spin text-[var(--accent-primary)]" />
            </div>
            <p className="text-[18px] font-semibold tracking-subheading text-[var(--text-primary)]">
              Étude en cours…
            </p>
            <p className="mt-1 text-[13px] tracking-body text-[var(--text-secondary)]">
              Import des données Semrush et croisement avec les concurrents.
            </p>

            {/* Progress bar */}
            <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
              <div
                className="h-full rounded-full bg-[var(--accent-primary)] transition-all duration-500 ease-out"
                style={{ width: `${(loadingStep / LOADING_STEPS.length) * 100}%` }}
              />
            </div>

            {/* Steps */}
            <ul className="mt-5 w-full space-y-2.5">
              {LOADING_STEPS.map((step, i) => {
                const done = i < loadingStep;
                const active = i === loadingStep;
                return (
                  <li key={step} className="flex items-center gap-2.5 text-[13px]">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: done ? "var(--accent-primary)" : active ? "var(--accent-primary-soft)" : "var(--bg-subtle)",
                        color: done ? "white" : "var(--accent-primary)",
                      }}>
                      {done ? <CheckIcon className="h-3 w-3" strokeWidth={3} /> : active ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                    </span>
                    <span className={done || active ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}>
                      {step}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* ── State : done ── */}
      {studyState === "done" && (
        <>
          <KpiGroup columns={3}>
            <KpiCard bare icon={LSparkles} label="Opportunités"           value={totalOpps.toString()} sub="mots-clés identifiés" />
            <KpiCard bare icon={LTarget}   label="Actionnables (P1 + P2)" value={actionnables.toString()} sub={`sur ${totalOpps} opportunités`} />
            <KpiCard bare icon={Boxes}     label="Clusters"               value={clusters.toString()} sub="thématiques détectées" />
          </KpiGroup>

          {/* Toolbar — search + filtres priorité / cluster (button-styled dropdowns) */}
          <div className="flex flex-wrap items-center gap-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un mot-clé…" alwaysExpanded />

            <DropdownMenu
              width={200}
              trigger={
                <FilterTabTrigger active={filterPriority !== "all"}>
                  {filterPriority === "all" ? "Toutes les priorités" : `Priorité ${filterPriority}`}
                </FilterTabTrigger>
              }
            >
              <DropdownItem selected={filterPriority === "all"} onClick={() => setFilterPriority("all")}>Toutes les priorités</DropdownItem>
              <DropdownItem selected={filterPriority === "P1"}  onClick={() => setFilterPriority("P1")}>P1</DropdownItem>
              <DropdownItem selected={filterPriority === "P2"}  onClick={() => setFilterPriority("P2")}>P2</DropdownItem>
              <DropdownItem selected={filterPriority === "P3"}  onClick={() => setFilterPriority("P3")}>P3</DropdownItem>
            </DropdownMenu>

            <DropdownMenu
              width={240}
              trigger={
                <FilterTabTrigger active={filterCluster !== "all"}>
                  {filterCluster === "all" ? "Tous les clusters" : filterCluster}
                </FilterTabTrigger>
              }
            >
              <DropdownItem selected={filterCluster === "all"} onClick={() => setFilterCluster("all")}>Tous les clusters</DropdownItem>
              {uniqueClusters.map((c) => (
                <DropdownItem key={c} selected={filterCluster === c} onClick={() => setFilterCluster(c)}>{c}</DropdownItem>
              ))}
            </DropdownMenu>

            {(search || filterPriority !== "all" || filterCluster !== "all") && (
              <button
                onClick={() => { setSearch(""); setFilterPriority("all"); setFilterCluster("all"); }}
                className="flex items-center gap-1 text-[12px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
              >
                <LX className="h-3 w-3" />
                Réinitialiser
              </button>
            )}
            <span className="ml-auto text-[12px] tabular-nums text-[var(--text-muted)]">
              {filteredRows.length} / {STUDY_ROWS.length}
            </span>
          </div>

          <TableWide<StudyRow>
            columns={columns}
            data={filteredRows}
            rowKey={(r) => r.keyword}
            emptyState="Aucun mot-clé pour ces filtres."
            minWidth={1400}
            pageSize={25}
            bordered
            edgePadding="24px"
            trailingAction={(r) => (
              <Button size="sm" onClick={(e) => { e.stopPropagation(); setBriefKeyword(r.keyword); }}>
                <SparklesIcon className="h-3.5 w-3.5" />
                Brief
              </Button>
            )}
            trailingActionWidth={120}
          />
        </>
      )}

      {studyOpen && (
        <KeywordStudyModal
          onClose={() => setStudyOpen(false)}
          onLaunch={startStudy}
        />
      )}

      {briefKeyword != null && (
        <NewBriefModal
          initialKeyword={briefKeyword}
          onClose={() => setBriefKeyword(null)}
        />
      )}
    </div>
  );
}

/* ── Helper : trigger button reprenant le style FilterTabs ───────────── */

function FilterTabTrigger({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-all"
      style={active
        ? { color: "var(--text-primary)", fontWeight: 600, backgroundColor: "var(--bg-secondary)" }
        : { color: "var(--text-muted)" }}
      onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-secondary)"; }}
      onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = ""; }}
    >
      {children}
      <ChevronDownIcon className="h-3 w-3 flex-shrink-0 opacity-70" />
    </button>
  );
}

/* ── Helpers : tooltips d'info dans les headers de TableWide ─────────── */

function InfoSvg() {
  return (
    <svg width="12" height="12" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7.5 6.5v4M7.5 4.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function ColHeaderInfo({ label, align, tooltip }: { label: string; align?: "left" | "right"; tooltip: React.ReactNode }) {
  return (
    <Tooltip portal rich side="bottom" label={tooltip}>
      <span className={`inline-flex w-full cursor-help items-center gap-1 text-[12px] font-medium text-[var(--text-muted)] ${align === "right" ? "justify-end" : ""}`}>
        {label}
        <InfoSvg />
      </span>
    </Tooltip>
  );
}

function KdTip() {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-semibold">Keyword Difficulty</p>
      <p className="opacity-75">Indice de difficulté de positionnement (0 – 100). Plus la valeur est élevée, plus la SERP est concurrentielle.</p>
      <p className="text-[11px] opacity-60">0 – 30 facile · 30 – 60 modéré · 60 – 80 difficile · 80+ très difficile</p>
    </div>
  );
}

function KeiTip() {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-semibold">Keyword Efficiency Index</p>
      <p className="opacity-75">Ratio opportunité / concurrence : <span className="font-mono">Volume² / Concurrence</span>. Plus le KEI est élevé, meilleur est le rapport gain potentiel vs effort.</p>
      <p className="text-[11px] opacity-60">Permet de prioriser les mots-clés à fort potentiel avec une concurrence accessible.</p>
    </div>
  );
}

function TfTip() {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-semibold">Trust Flow (Majestic)</p>
      <p className="opacity-75">Score de confiance du profil de backlinks (0 – 100). Mesure la qualité et la fiabilité des sites qui pointent vers le domaine.</p>
      <p className="text-[11px] opacity-60">Plus c'est haut, plus le site est référencé par des sources de confiance.</p>
    </div>
  );
}

function CfTip() {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-semibold">Citation Flow (Majestic)</p>
      <p className="opacity-75">Score d'influence basé sur le volume de backlinks (0 – 100). Mesure la quantité de liens reçus, indépendamment de leur qualité.</p>
      <p className="text-[11px] opacity-60">Comparé au TF, donne le ratio qualité/quantité du profil.</p>
    </div>
  );
}

function BasTip() {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-semibold">Backlinks Authority Score</p>
      <p className="opacity-75">Score d'autorité globale du profil de liens externes. Combine fraîcheur, diversité des ancres et qualité des domaines référents.</p>
      <p className="text-[11px] opacity-60">Indicateur synthétique du poids SEO off-site.</p>
    </div>
  );
}

function RefDomTip() {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-semibold">Domaines référents</p>
      <p className="opacity-75">Nombre de domaines uniques qui pointent au moins un lien vers le site. Métrique clé d'autorité — plus la diversité est large, plus le profil est solide.</p>
      <p className="text-[11px] opacity-60">À comparer au Trust Flow pour évaluer la qualité moyenne par référent.</p>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────── */

export default function AnalysePage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = use(params);
  const decodedDomain = decodeURIComponent(domain);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { show: showToast } = useToast();
  // Tab state is driven by `?tab=` in the URL so the sidebar can navigate to it directly.
  const rawTab = (searchParams.get("tab") ?? "general") as Tab;
  const tab: Tab = (["general","briefs","seo","tracking","sea","forecast","netlinking","audit","cannibal","univers","recommandations"] as Tab[]).includes(rawTab) ? rawTab : "general";
  const setTab = (next: Tab) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (next === "general") sp.delete("tab"); else sp.set("tab", next);
    router.replace(`${pathname}${sp.toString() ? `?${sp.toString()}` : ""}`, { scroll: false });
  };
  const [auditTab, setAuditTab] = useState<"technique" | "editorial" | "netlinking">("technique");
  const [seoTab, setSeoTab] = useState<"analytics" | "top-pages">("analytics");
  const [loading, setLoading] = useState(true);
  const [parametresOpen, setParametresOpen] = useState(false);
  const [urlModal, setUrlModal] = useState<"import-csv" | "add-url" | "new-brief" | null>(null);
  const [gscConnected, setGscConnected] = useState(true);
  const [ga4Connected, setGa4Connected] = useState(true);
  const [connectModal, setConnectModal] = useState<Tool | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [returnToParametres, setReturnToParametres] = useState(false);
  // URL ouverte depuis une autre vue (ex. UniversSemantique) — ouvre la SidePanel
  // par-dessus l'onglet courant (BriefsView reste monté en permanence pour ça).
  const [pendingBriefUrl, setPendingBriefUrl] = useState<string | null>(null);
  function openPageByUrl(url: string) {
    setPendingBriefUrl(url);
  }

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, [decodedDomain]);

  /* ── Push project actions (GSC, GA4, ...) into the Topbar's right slot ── */
  const { setMeta } = usePageMeta();
  useEffect(() => {
    setMeta({
      rightSlot: (
        <>
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
            <DropdownItem icon={Upload}     onClick={() => setUrlModal("import-csv")}>Importer des URLs</DropdownItem>
            <DropdownItem icon={LLink}      onClick={() => setUrlModal("add-url")}>Ajouter une URL</DropdownItem>
            <DropdownItem icon={LSparkles}  onClick={() => setUrlModal("new-brief")}>Nouveau brief</DropdownItem>
            <DropdownSeparator />
            <DropdownItem icon={Settings}   onClick={() => setParametresOpen(true)}>Paramètres du projet</DropdownItem>
            <DropdownSeparator />
            <DropdownItem icon={Trash2} danger>Supprimer le projet</DropdownItem>
          </DropdownMenu>
        </>
      ),
    });
    return () => setMeta({ rightSlot: null });
  }, [gscConnected, ga4Connected, setMeta]);

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
    <div className="flex flex-1 flex-col">
      {/* Header projet retiré — le nom du projet et la subtitle sont intégrés au bloc
          titre de l'onglet "Vue d'ensemble" plus bas. */}

      {/* La nav entre onglets de la vue analyse se fait via la Sidebar (?tab=).
          Pour Audit, la barre Technique/Éditorial/Netlinking est rendue inline dans le main,
          juste sous le titre (cf. bloc `tab === "audit"` plus bas). */}

      {/* ── Tab content ── */}
      <div className={`mx-auto w-full max-w-[var(--page-max-w)] py-[var(--page-py)] ${tab !== "briefs" ? "px-[var(--page-px)]" : ""}`}>
        {loading ? <SkeletonAnalyseGeneral /> : null}
        <div className={loading ? "hidden" : "animate-fade-in"}>

        {/* Titre de la vue + sous-titre éventuel. Skipped pour briefs / tracking / univers /
            recommandations qui rendent leur propre header (title + CTAs sur la même ligne).
            Vue d'ensemble : on accole le nom du projet (lien externe) à droite du titre,
            et la subtitle reprend l'info de fraîcheur GSC/GA4. */}
        {!["briefs", "tracking", "univers", "recommandations"].includes(tab) && (
          <div className="mb-6">
            <div className="flex items-baseline gap-2">
              <h2 className="text-[24px] font-semibold leading-none tracking-heading text-[var(--text-primary)]">
                {TAB_TITLES[tab]}
              </h2>
              {tab === "general" && (
                <Tooltip label="Ouvrir dans un nouvel onglet" side="top" portal>
                  <a
                    href={`https://${decodedDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/proj inline-flex items-center gap-2 transition-colors"
                  >
                    <span className="text-[24px] font-semibold leading-none tracking-heading text-[var(--accent-primary)] transition-opacity group-hover/proj:opacity-70">
                      {decodedDomain}
                    </span>
                    <ArrowTopRightOnSquareIcon className="h-5 w-5 text-[var(--accent-primary)] opacity-0 transition-opacity group-hover/proj:opacity-100" />
                  </a>
                </Tooltip>
              )}
            </div>
            {tab === "general" && (gscConnected || ga4Connected) ? (
              <p className="mt-1 text-[14px] tracking-body text-[var(--text-secondary)]">
                Mis à jour aujourd'hui · 133 pages crawlées
              </p>
            ) : TAB_SUBTITLES[tab] && (
              <p className="mt-1 text-[14px] tracking-body text-[var(--text-secondary)]">
                {TAB_SUBTITLES[tab]}
              </p>
            )}
          </div>
        )}

        {/* Général tab */}
        {tab === "general" && (
          <div className="flex flex-col gap-8">

            {/* Stats globales */}
            <KpiGroup columns={3}>
              <KpiCard bare icon={TrendingUp} label="Trafic organique / mois" value="42 800" delta="+8,4 %" sub="vs N−1" />
              <KpiCard bare icon={LFolderOpen} label="Tags créés"              value="18"     sub="6 actifs · 12 terminés" />
              <KpiCard bare icon={FileText}    label="Briefs générés"          value="147"    sub="63 livrés (43 %)" />
            </KpiGroup>

            {/* 3 blocs stratégiques (GEO retiré — conservé dans le DS pour usage futur) */}
            <div>
              <p className="mb-4 text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">Blocs stratégiques</p>
              <div className="grid grid-cols-3 gap-3">
                {([
                  {
                    gradFrom: "#00CCFF", gradTo: "#3265FF", iconBottomColor: "#3265FF",
                    color: "#3265FF", colorBg: "rgba(50,101,255,0.08)",
                    title: "Optimiser l'existant",
                    description: "Scoring auto, priorisation, brief d'optimisation",
                    features: ["Brief EMC par page","Score sémantique","Maillage interne","Balises meta & titres","Core Web Vitals"],
                    cta: `/analyse/${encodeURIComponent(decodedDomain)}?tab=briefs`,
                    iconPaths: (fill: string) => (<>
                      <path fillRule="evenodd" fill={fill} d="M12 6.75a5.25 5.25 0 0 1 6.775-5.025.75.75 0 0 1 .313 1.248l-3.32 3.319c.063.475.276.934.641 1.299.365.365.824.578 1.3.64l3.318-3.319a.75.75 0 0 1 1.248.313 5.25 5.25 0 0 1-5.472 6.756c-1.018-.086-1.87.1-2.309.634L7.344 21.3A3.298 3.298 0 1 1 2.7 16.657l8.684-7.151c.533-.44.72-1.291.634-2.309A5.342 5.342 0 0 1 12 6.75ZM4.117 19.125a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Z" clipRule="evenodd" />
                      <path fill={fill} d="m10.076 8.64-2.201-2.2V4.874a.75.75 0 0 0-.364-.643l-3.75-2.25a.75.75 0 0 0-.916.113l-.75.75a.75.75 0 0 0-.113.916l2.25 3.75a.75.75 0 0 0 .643.364h1.564l2.062 2.062 1.575-1.297Z" />
                      <path fillRule="evenodd" fill={fill} d="m12.556 17.329 4.183 4.182a3.375 3.375 0 0 0 4.773-4.773l-3.306-3.305a6.803 6.803 0 0 1-1.53.043c-.394-.034-.682-.006-.867.042a.589.589 0 0 0-.167.063l-3.086 3.748Zm3.414-1.36a.75.75 0 0 1 1.06 0l1.875 1.876a.75.75 0 1 1-1.06 1.06L15.97 17.03a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </>),
                  },
                  {
                    gradFrom: "#FFB930", gradTo: "#FB5F26", iconBottomColor: "#FFB930",
                    color: "#FB5F26", colorBg: "rgba(251,95,38,0.08)",
                    title: "Identifier les pages manquantes",
                    description: "Moteur EMC : détecte thématiques non couvertes",
                    features: ["Analyse concurrentielle","Gaps de mots-clés","Pages intermédiaires","Cocon sémantique","Intentions de recherche"],
                    cta: `/analyse/${encodeURIComponent(decodedDomain)}?tab=recommandations`,
                    iconPaths: (fill: string) => (<>
                      <path fill={fill} d="M12 .75a8.25 8.25 0 0 0-4.135 15.39c.686.398 1.115 1.008 1.134 1.623a.75.75 0 0 0 .577.706c.352.083.71.148 1.074.195.323.041.6-.218.6-.544v-4.661a6.714 6.714 0 0 1-.937-.171.75.75 0 1 1 .374-1.453 5.261 5.261 0 0 0 2.626 0 .75.75 0 1 1 .374 1.452 6.712 6.712 0 0 1-.937.172v4.66c0 .327.277.586.6.545.364-.047.722-.112 1.074-.195a.75.75 0 0 0 .577-.706c.02-.615.448-1.225 1.134-1.623A8.25 8.25 0 0 0 12 .75Z" />
                      <path fillRule="evenodd" fill={fill} d="M9.013 19.9a.75.75 0 0 1 .877-.597 11.319 11.319 0 0 0 4.22 0 .75.75 0 1 1 .28 1.473 12.819 12.819 0 0 1-4.78 0 .75.75 0 0 1-.597-.876ZM9.754 22.344a.75.75 0 0 1 .824-.668 13.682 13.682 0 0 0 2.844 0 .75.75 0 1 1 .156 1.492 15.156 15.156 0 0 1-3.156 0 .75.75 0 0 1-.668-.824Z" clipRule="evenodd" />
                    </>),
                  },
                  {
                    gradFrom: "#6270F7", gradTo: "var(--accent-primary)", iconBottomColor: "var(--accent-primary)",
                    color: "var(--accent-primary)", colorBg: "rgba(62,80,245,0.08)",
                    title: "Créer page from scratch",
                    description: "Mot-clé + type de page, filtre SERP automatique",
                    features: ["Recherche de mots-clés","Brief IA complet","Structure d'URL","Maillage cible","Calendrier éditorial"],
                    onClick: () => setUrlModal("new-brief"),
                    iconPaths: (fill: string) => (<>
                      <path fillRule="evenodd" fill={fill} d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 0 1 .75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 0 1 9.75 22.5a.75.75 0 0 1-.75-.75v-4.131A15.838 15.838 0 0 1 6.382 15H2.25a.75.75 0 0 1-.75-.75 6.75 6.75 0 0 1 7.815-6.666ZM15 6.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" clipRule="evenodd" />
                      <path fill={fill} d="M5.26 17.242a.75.75 0 1 0-.897-1.203 5.243 5.243 0 0 0-2.05 5.022.75.75 0 0 0 .625.627 5.243 5.243 0 0 0 5.022-2.051.75.75 0 1 0-1.202-.897 3.744 3.744 0 0 1-3.008 1.51c0-1.23.592-2.323 1.51-3.008Z" />
                    </>),
                  },
                ] satisfies BlocDef[]).map((bloc, index) => (
                  <BlocCard key={bloc.title} bloc={bloc} index={index} />
                ))}
              </div>
            </div>

            {/* Bilans santé — 2 cards cliquables avec hover bg (comme les Blocs stratégiques) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] transition-colors hover:bg-[var(--bg-subtle)]">
                <HealthCard
                  title="Santé technique"
                  score={healthScores.tech}
                  critiques={3}
                  visitesRisk="99"
                  quote="3 problèmes techniques critiques impactent 99 visites/mois. Priorité : corriger les balises titres et réduire les temps de réponse pour récupérer ce trafic."
                  ctaHref={`/analyse/${domain}/audit`}
                />
              </div>
              <div className="overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] transition-colors hover:bg-[var(--bg-subtle)]">
                <HealthCard
                  title="Santé éditoriale"
                  score={61}
                  critiques={2}
                  importants={6}
                  visitesRisk="4,1k"
                  quote="Vos 9 pages manquent de signaux E-E-A-T, exposant 1 361 visites/mois. Priorité : renforcer la crédibilité et l'expertise avant le prochain Core Update pour sécuriser ce trafic."
                  note="3 détecteurs avec données partielles"
                  ctaHref={`/analyse/${domain}/audit?tab=editorial`}
                />
              </div>
            </div>

            {/* Core Web Vitals — bloc indépendant */}
            <div className="overflow-hidden rounded-3xl bg-[var(--bg-card)]">
              <div className="p-7">
                <p className="text-[18px] font-semibold tracking-subheading text-[var(--text-primary)]">Core Web Vitals</p>
                <p className="mt-0.5 text-[12px] tracking-caption text-[var(--text-muted)]">Simulation Lighthouse · 10 URLs · 26 avr.</p>
              </div>
              <div className="flex px-7 pb-7 gap-4">
                {[
                  { key: "LCP", label: "Largest Contentful Paint", icon: PhotoIcon,            value: "4.52 s", status: "Mauvais", threshold: "≤ 2.5s",  color: "var(--color-danger)", bg: "var(--color-danger-bg)" },
                  { key: "INP", label: "Interaction to Next Paint", icon: CursorArrowRaysIcon,  value: "4 ms",   status: "Bon",     threshold: "≤ 200ms", color: "var(--color-success)", bg: "var(--color-success-bg)" },
                  { key: "CLS", label: "Cumulative Layout Shift",   icon: ArrowsPointingOutIcon, value: "0.05",  status: "Bon",     threshold: "≤ 0.1",   color: "var(--color-success)", bg: "var(--color-success-bg)" },
                ].map((m) => (
                  <div key={m.key} className="flex flex-1 items-center gap-4 px-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[var(--border-medium)]">
                      <m.icon className="h-5 w-5 text-[var(--text-primary)]" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-semibold text-[var(--text-muted)]">{m.key}</span>
                      <p className="text-[24px] font-semibold leading-none tracking-tight text-[var(--text-primary)]">{m.value}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-[12px] font-semibold" style={{ color: m.color, backgroundColor: m.bg }}>{m.status}</span>
                        <span className="text-[11px] text-[var(--text-muted)]">{m.threshold}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Distribution des positions + Visibilité — 2 colonnes */}
            <div className="grid grid-cols-2 gap-4">

              {/* Distribution des positions — bar chart */}
              <div className="flex flex-col rounded-3xl bg-[var(--bg-card)] p-7">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[18px] font-semibold tracking-subheading text-[var(--text-primary)]">Distribution des positions</p>
                    <p className="mt-0.5 text-[12px] tracking-caption text-[var(--text-muted)]">Visibilité Haloscan</p>
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
                <div className="flex-1">
                  <PositionBarChart />
                </div>
              </div>

              {/* Visibilité et trafic organique */}
              <div className="overflow-hidden rounded-3xl bg-[var(--bg-card)] p-7">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[18px] font-semibold tracking-subheading text-[var(--text-primary)]">Visibilité et trafic organique</p>
                    <p className="mt-0.5 text-[12px] tracking-caption text-[var(--text-muted)]">Visibilité Haloscan</p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => setTab("seo")}>
                    Voir Analytics SEO
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <VisibilityLineChart />
              </div>

            </div>

            {/* Concurrents organiques */}
            <OrganicCompetitorsTable />

            {/* Tags actifs */}
            <div>
              <p className="mb-4 text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">Tags récents</p>
              <TagList onNavigate={() => setTab("briefs")} />
            </div>

            {/* Activités récentes */}
            <div>
              <div className="mb-4 flex items-baseline justify-between">
                <p className="text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">Activités récentes</p>
                <button className="text-[12px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">Voir tout</button>
              </div>
              <div className="overflow-hidden rounded-2xl bg-[var(--bg-card)]">
                {[
                  { label: "Brief publié",      desc: "Guide SEO local complet · optimisé",          time: "Il y a 2h",  color: "var(--color-success)", Icon: FileText },
                  { label: "Score mis à jour",  desc: "Score sémantique /blog/link-building : 55 → 67", time: "Il y a 5h",  color: "var(--color-warning)", Icon: TrendingUp },
                  { label: "Tag créé",          desc: "Tag GEO — Structured data · 6 URLs",          time: "Hier",       color: "#A855F7", Icon: LTag },
                  { label: "Analyse lancée",    desc: "Nouveau crawl GSC · 1 048 pages indexées",    time: "28 avr.",    color: "var(--accent-primary)", Icon: LPlay },
                  { label: "Brief livré",       desc: "Schema.org et données structurées",           time: "27 avr.",    color: "var(--color-success)", Icon: CircleCheck },
                ].map((a, i, arr) => (
                  <button
                    key={i}
                    type="button"
                    className={`group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--bg-card-hover)] ${i < arr.length - 1 ? "border-b border-[var(--border-subtle)]" : ""}`}
                  >
                    <span
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: `color-mix(in oklab, ${a.color} 12%, transparent)`, color: a.color }}
                    >
                      <a.Icon className="h-4 w-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-[13px] font-semibold text-[var(--text-primary)]">{a.label}</p>
                      <p className="truncate text-[12px] text-[var(--text-secondary)]">{a.desc}</p>
                    </div>
                    <span className="flex-shrink-0 text-[11px] tracking-caption text-[var(--text-muted)]">{a.time}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Briefs tab — toujours monté pour que la SidePanel reste accessible
            depuis n'importe quel onglet (ex. clic d'URL depuis Univers sémantique).
            Visuellement masqué quand tab !== "briefs". */}
        <div className={tab === "briefs" ? "" : "hidden"} aria-hidden={tab !== "briefs"}>
          <BriefsView
            initialBriefUrl={pendingBriefUrl}
            onPendingHandled={() => setPendingBriefUrl(null)}
          />
        </div>

        {/* SEO tab */}
        {tab === "seo" && (
          <div className="flex flex-col gap-6">
            {/* Sub-tab bar — inline sous le titre, même pattern qu'Audit */}
            <div className="relative flex h-14 items-center gap-1 border-b border-[var(--border-subtle)]">
              {(["analytics", "top-pages"] as const).map((t) => {
                const isActive = seoTab === t;
                const label = t === "analytics" ? "Analytics" : "Top pages SEO";
                return (
                  <button
                    key={t}
                    onClick={() => setSeoTab(t)}
                    className={`relative flex h-full cursor-pointer items-center px-3 text-[14px] font-semibold tracking-tight transition-colors ${isActive ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
                  >
                    {label}
                    {isActive && (
                      <span className="pointer-events-none absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-accent-primary" />
                    )}
                  </button>
                );
              })}
            </div>

            {seoTab === "analytics" && (
              <div className="flex flex-col gap-4">
                {(() => {
                  const trendLabels = ["8 fév", "15 fév", "22 fév", "1 mar", "8 mar", "15 mar", "22 mar", "1 avr", "15 avr", "1 mai"];
                  return (
                    <div className="grid grid-cols-3 gap-3">
                      <KpiCard icon={TrendingUp}        label="Trafic organique (30j)" value="14 280"  delta="+12 %"        sub="vs mois préc." trendLabels={trendLabels} trendFormatValue={(v) => `${Math.round(v).toLocaleString("fr-FR")} clics`} trend={[10800, 11200, 11400, 11900, 12400, 12800, 13100, 13600, 14000, 14280]} />
                      <KpiCard icon={LChartBar}         label="Position moyenne"       value="18,4"    delta="−2,1 pts" deltaPositiveIsGood={false} sub="ce mois" trendLabels={trendLabels} trendFormatValue={(v) => `Pos. ${v.toFixed(1).replace(".", ",")}`} trend={[16.3, 16.7, 17.1, 17.4, 17.8, 18.0, 18.2, 18.3, 18.4, 18.4]} />
                      <KpiCard icon={MousePointerClick} label="CTR moyen"              value="3,2 %"                       sub="stable"        trendLabels={trendLabels} trendFormatValue={(v) => `${v.toFixed(1).replace(".", ",")} %`} trend={[3.1, 3.0, 3.2, 3.1, 3.2, 3.3, 3.2, 3.1, 3.2, 3.2]} />
                      <KpiCard icon={Trophy}            label="Mots-clés top 10"       value="312"     delta="+8"          sub="ce mois"       trendLabels={trendLabels} trendFormatValue={(v) => `${Math.round(v)} mots-clés`} trend={[280, 286, 289, 293, 298, 302, 305, 308, 310, 312]} />
                      <KpiCard icon={FileText}          label="Pages indexées"         value="1 048"                                            trendLabels={trendLabels} trendFormatValue={(v) => `${Math.round(v).toLocaleString("fr-FR")} pages`} trend={[1010, 1015, 1022, 1028, 1033, 1038, 1042, 1045, 1047, 1048]} />
                      <KpiCard icon={Eye}               label="Impressions (30j)"      value="447 000" delta="+8 %"        sub="vs mois préc." trendLabels={trendLabels} trendFormatValue={(v) => `${Math.round(v).toLocaleString("fr-FR")} impr.`} trend={[380000, 395000, 405000, 412000, 420000, 428000, 434000, 440000, 444000, 447000]} />
                    </div>
                  );
                })()}
                <div className="grid grid-cols-2 gap-4">

                  {/* Distribution des positions */}
                  <div className="flex flex-col rounded-3xl bg-[var(--bg-card)] p-7">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-[18px] font-semibold tracking-subheading text-[var(--text-primary)]">Distribution des positions</p>
                        <p className="mt-0.5 text-[12px] tracking-caption text-[var(--text-muted)]">Visibilité Haloscan</p>
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
                    <div className="flex-1">
                      <PositionBarChart />
                    </div>
                  </div>

                  {/* Visibilité et trafic organique */}
                  <div className="overflow-hidden rounded-3xl bg-[var(--bg-card)] p-7">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-[18px] font-semibold tracking-subheading text-[var(--text-primary)]">Visibilité et trafic organique</p>
                        <p className="mt-0.5 text-[12px] tracking-caption text-[var(--text-muted)]">Visibilité Haloscan</p>
                      </div>
                    </div>
                    <VisibilityLineChart />
                  </div>

                </div>
                <InsightList items={[
                  "8 mots-clés ont progressé en top 3 ce mois",
                  "La page /blog/seo-local est la plus performante avec 6,1% de CTR",
                  "3 pages en position 11–15 sont à optimiser en priorité",
                  "Le taux d'indexation est excellent (98,4%)",
                ]} />
              </div>
            )}

            {seoTab === "top-pages" && <TopPages />}
          </div>
        )}

        {/* Tracking tab */}
        {tab === "tracking" && (
          <RankTracker title={TAB_TITLES.tracking} subtitle={TAB_SUBTITLES.tracking} />
        )}

        {/* SEA tab */}
        {tab === "sea" && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              <KpiCard icon={Euro}              label="CPC moyen"         value="0,42 €"  sub="stable vs mois préc." />
              <KpiCard icon={MousePointerClick} label="CTR campagnes"     value="5,8 %"   delta="+0,4 pts" />
              <KpiCard icon={CircleCheck}       label="Conversions (30j)" value="384"     delta="+6 %" />
              <KpiCard icon={Banknote}          label="Coût total (30j)"  value="1 890 €" sub="budget consommé à 94%" />
              <KpiCard icon={Euro}              label="CPA moyen"         value="4,92 €"  delta="−0,3 €" deltaPositiveIsGood={false} sub="vs mois préc." />
              <KpiCard icon={Eye}               label="Impressions (30j)" value="210 000" delta="+3 %" sub="vs mois préc." />
            </div>
            <ChartBar label="Évolution du CPC — 12 semaines" color="var(--accent-primary)" />
            <InsightList color="var(--accent-primary)" items={[
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
            <div className="grid grid-cols-3 gap-3">
              <KpiCard icon={TrendingUp} label="Trafic estimé M+3"      value="+22 %" valueColor="var(--color-success)" sub="Blocs 01 + 02 exécutés" />
              <KpiCard icon={TrendingUp} label="Trafic estimé M+6"      value="+38 %" valueColor="var(--color-success)" sub="Plan complet exécuté" />
              <KpiCard icon={LChartBar}   label="ROI SEO estimé 6 mois"  value="×3,2"  valueColor="var(--color-success)" sub="basé sur 87 opportunités" />
              <KpiCard icon={LSearch}    label="Mots-clés opportunités" value="87 KW" sub="volume ≥ 100/mois" />
              <KpiCard icon={FilePlus}   label="Pages à créer"          value="24"    sub="Bloc 03 — création" />
              <KpiCard icon={FileText}   label="Pages à optimiser"      value="36"    sub="Bloc 01 — existant" />
            </div>
            <ForecastTimeline />
            <ChartBar label="Courbe de trafic projetée — 6 mois" color="var(--color-success)" />
            <InsightList color="var(--color-success)" items={[
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
        {tab === "netlinking" && <NetlinkingView />}

        {tab === "cannibal" && <CannibalView />}

        {tab === "univers" && <UniversSemantiqueView title={TAB_TITLES.univers} subtitle={TAB_SUBTITLES.univers} onOpenPageByUrl={openPageByUrl} />}

        {tab === "recommandations" && (
          <RecommandationsView
            title={TAB_TITLES.recommandations}
            subtitle={TAB_SUBTITLES.recommandations}
            onOpenPageByUrl={openPageByUrl}
          />
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
            { id: "edi-tags",            label: "Tags" },
            { id: "edi-diagnostic",      label: "01 · Diagnostic" },
            { id: "edi-dimensions",      label: "02 · Dimensions" },
            { id: "edi-donnees",         label: "03 · Données brutes" },
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
                {/* Switch Technique / Éditorial / Netlinking — inline, juste sous le titre */}
                <div className="relative flex h-14 items-center gap-1 border-b border-[var(--border-subtle)]">
                  {(["technique", "editorial", "netlinking"] as const).map((t) => {
                    const isActive = auditTab === t;
                    const label = t === "technique" ? "Technique" : t === "editorial" ? "Éditorial" : "Netlinking";
                    return (
                      <button
                        key={t}
                        onClick={() => setAuditTab(t)}
                        className={`relative flex h-full cursor-pointer items-center px-3 text-[14px] font-semibold tracking-tight transition-colors ${isActive ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
                      >
                        {label}
                        {isActive && (
                          <span className="pointer-events-none absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-accent-primary" />
                        )}
                      </button>
                    );
                  })}
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
