"use client";

import { useState, useRef } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { ChartTooltip } from "@/components/Tooltip";
import { FilterTabs } from "@/components/FilterTabs";
import { Button } from "@/components/Button";
import { AreaChart } from "@/components/AreaChart";
import { DonutChart } from "@/components/DonutChart";
import { Callout } from "@/components/Callout";
import { DeltaBadge } from "@/components/DeltaBadge";
import { SectionHead } from "@/components/SectionHead";

/* ── Benchmark data ───────────────────────────────────────────────────── */

type Competitor = {
  domain: string; tf: number; cf: number;
  refDomains: number; backlinks: number; isYou?: boolean;
};

const COMPETITORS: Competitor[] = [
  { domain: "marketingdigital-france.fr", tf: 16, cf: 31, refDomains: 281,  backlinks: 3156,  isYou: true },
  { domain: "abondance.com",              tf: 35, cf: 47, refDomains: 1243, backlinks: 18934 },
  { domain: "olivier-andrieu.com",        tf: 32, cf: 45, refDomains: 987,  backlinks: 12456 },
  { domain: "semji.com",                  tf: 38, cf: 54, refDomains: 1456, backlinks: 21345 },
  { domain: "digimood.com",               tf: 31, cf: 48, refDomains: 891,  backlinks: 11234 },
  { domain: "leptidigital.fr",            tf: 34, cf: 51, refDomains: 1089, backlinks: 14321 },
  { domain: "webmarketing-com.com",       tf: 33, cf: 52, refDomains: 1123, backlinks: 15678 },
  { domain: "seotraining.fr",             tf: 28, cf: 41, refDomains: 756,  backlinks: 9123  },
  { domain: "eskimoz.fr",                 tf: 29, cf: 43, refDomains: 634,  backlinks: 8765  },
  { domain: "youlovewords.com",           tf: 20, cf: 34, refDomains: 412,  backlinks: 4821  },
  { domain: "indexel.net",               tf: 26, cf: 39, refDomains: 578,  backlinks: 7234  },
];

const concurrents = COMPETITORS.filter((c) => !c.isYou);
const COMP_AVG_TF = Math.round(concurrents.reduce((s, c) => s + c.tf, 0) / concurrents.length * 10) / 10;
const COMP_AVG_RD = Math.round(concurrents.reduce((s, c) => s + c.refDomains, 0) / concurrents.length);

/* ── TF Evolution data (AreaChartPoint) ───────────────────────────────── */

const TF_DATA_1AN = [
  { label: "Mai 25",  value: 17 }, { label: "Juin 25",  value: 17 }, { label: "Juil 25",  value: 17 },
  { label: "Août 25", value: 16 }, { label: "Sept 25",  value: 17 }, { label: "Oct 25",   value: 16 },
  { label: "Nov 25",  value: 16 }, { label: "Déc 25",   value: 17 }, { label: "Janv 26",  value: 16 },
  { label: "Févr 26", value: 16 }, { label: "Mars 26",  value: 15 }, { label: "Avr 26",   value: 16 },
  { label: "Mai 26",  value: 15 },
];

const TF_DATA_6M = TF_DATA_1AN.slice(-7);
const TF_DATA_3M = TF_DATA_1AN.slice(-4);

/* ── Topical TTF ──────────────────────────────────────────────────────── */

const YOUR_TOPICS = [
  { label: "Marketing Digital", color: "#3E50F5" },
  { label: "SEO / SEM",         color: "#10B981" },
  { label: "Formation",         color: "#B888FF" },
];

const COMP_TOPICS = [
  { label: "SEO / SEM",         count: 9, max: 10 },
  { label: "Marketing Digital", count: 8, max: 10 },
  { label: "Actualités Web",    count: 7, max: 10 },
  { label: "E-commerce",        count: 6, max: 10 },
  { label: "Social Media",      count: 5, max: 10 },
  { label: "Formation",         count: 4, max: 10 },
  { label: "Webdesign",         count: 3, max: 10 },
];

/* ── Anchors ──────────────────────────────────────────────────────────── */

const ANCHOR_SEGS = [
  { label: "Marque",    pct: 59, color: "#3E50F5", count: 33 },
  { label: "Générique", pct: 27, color: "#B888FF", count: 15 },
  { label: "Autre",     pct: 14, color: "#94A3B8", count: 8  },
];

const TOP_ANCHORS = [
  { text: "marketing digital",              n: 8  },
  { text: "marketingdigital-france.fr",     n: 7  },
  { text: "agence marketing digital",       n: 6  },
  { text: "formation seo",                  n: 4  },
  { text: "cliquez ici",                    n: 4  },
  { text: "www.marketingdigital-france.fr", n: 3  },
  { text: "en savoir plus",                 n: 3  },
  { text: "agence seo",                     n: 3  },
  { text: "digital marketing agency",       n: 3  },
  { text: "voir le site",                   n: 2  },
];

/* ── Backlinks ────────────────────────────────────────────────────────── */

type BacklinkRow = {
  domain: string; url: string; country: string;
  tf: number; cf: number; rd: number;
  ancre: string; type: "Texte" | "Image"; statut: "Follow" | "Nofollow" | "Sponsored";
};

const BACKLINKS: BacklinkRow[] = [
  { domain: "pulsads.com",       url: "/ressources/outils-seo",       country: "FR", tf: 38, cf: 0,  rd: 18,   ancre: "awi",                       type: "Texte", statut: "Follow"   },
  { domain: "abondance.com",     url: "/blog/agences-seo-france",     country: "FR", tf: 35, cf: 47, rd: 1243, ancre: "marketing digital france",   type: "Texte", statut: "Follow"   },
  { domain: "semji.com",         url: "/ressources/glossaire-seo",    country: "FR", tf: 38, cf: 54, rd: 1456, ancre: "agence marketing digital",   type: "Texte", statut: "Follow"   },
  { domain: "bdm.fr",            url: "/outils/annuaire-agences",     country: "FR", tf: 31, cf: 42, rd: 876,  ancre: "marketingdigital-france.fr", type: "Texte", statut: "Nofollow" },
  { domain: "frenchweb.fr",      url: "/portraits/agences-2026",      country: "FR", tf: 29, cf: 41, rd: 654,  ancre: "voir le site",               type: "Texte", statut: "Follow"   },
  { domain: "youlovewords.com",  url: "/blog/outils-freelance",       country: "FR", tf: 20, cf: 34, rd: 412,  ancre: "formation seo",              type: "Texte", statut: "Follow"   },
  { domain: "leptidigital.fr",   url: "/marketing/agences",           country: "FR", tf: 34, cf: 51, rd: 1089, ancre: "en savoir plus",             type: "Texte", statut: "Nofollow" },
  { domain: "indexel.net",       url: "/ressources/liens-utiles",     country: "FR", tf: 26, cf: 39, rd: 578,  ancre: "agence seo paris",           type: "Image", statut: "Follow"   },
];

/* ── SEO Visibility ───────────────────────────────────────────────────── */

type VisRow = {
  domain: string; vis: string; top3: number; top10: number;
  top50: number; top100: number; kws: string; traffic: string; gap: string | null;
  isYou?: boolean;
};

const VISIBILITY: VisRow[] = [
  { domain: "semji.com",             vis: "18.4%", top3:  89, top10: 312, top50: 1456, top100: 3234, kws: "8.8K",  traffic: "24.5K", gap: "+22.4K" },
  { domain: "leptidigital.fr",       vis: "15.7%", top3:  74, top10: 267, top50: 1234, top100: 2891, kws: "7.4K",  traffic: "19.8K", gap: "+17.7K" },
  { domain: "abondance.com",         vis: "14.2%", top3:  67, top10: 234, top50: 1123, top100: 2654, kws: "6.9K",  traffic: "17.1K", gap: "+15.0K" },
  { domain: "webmarketing-com.com",  vis: "12.9%", top3:  58, top10: 198, top50: 967,  top100: 2234, kws: "5.8K",  traffic: "14.3K", gap: "+12.2K" },
  { domain: "olivier-andrieu.com",   vis: "11.8%", top3:  52, top10: 178, top50: 867,  top100: 1987, kws: "5.2K",  traffic: "12.6K", gap: "+10.5K" },
  { domain: "digimood.com",          vis: "10.3%", top3:  43, top10: 145, top50: 723,  top100: 1678, kws: "4.3K",  traffic: "10.2K", gap: "+8.1K"  },
  { domain: "eskimoz.fr",            vis: "8.7%",  top3:  36, top10: 121, top50: 612,  top100: 1423, kws: "3.7K",  traffic: "8.4K",  gap: "+6.3K"  },
  { domain: "seotraining.fr",        vis: "7.4%",  top3:  29, top10: 98,  top50: 498,  top100: 1156, kws: "2.9K",  traffic: "6.8K",  gap: "+4.7K"  },
  { domain: "indexel.net",           vis: "5.9%",  top3:  21, top10: 72,  top50: 367,  top100: 856,  kws: "2.1K",  traffic: "4.9K",  gap: "+2.8K"  },
  { domain: "youlovewords.com",      vis: "4.8%",  top3:  16, top10: 57,  top50: 289,  top100: 678,  kws: "1.6K",  traffic: "3.6K",  gap: "+1.5K"  },
  { domain: "marketingdigital-france.fr", vis: "3.2%", top3: 12, top10: 45, top50: 234, top100: 612, kws: "1.2K", traffic: "2.1K", gap: "—", isYou: true },
  { domain: "seo-jungle.fr",         vis: "3.2%",  top3:  11, top10: 43,  top50: 221,  top100: 589,  kws: "1.1K",  traffic: "2.1K",  gap: "0"      },
];

/* ── Helpers ──────────────────────────────────────────────────────────── */

/* SectionHead, Callout, DeltaBadge, AreaChart, DonutChart → DS components */

/* ── Radar Chart ──────────────────────────────────────────────────────── */

const RADAR_AXES = ["TF", "CF", "RefDom", "Backlinks", "TF/CF"];

const YOU_VALS:  Record<string, number> = { TF: 16/38, CF: 31/54, RefDom: 281/1456, Backlinks: 3156/21345, "TF/CF": (16/31)/(38/54) };
const COMP_VALS: Record<string, number> = { TF: 30.6/38, CF: 43.4/54, RefDom: 916/1456, Backlinks: 10617/21345, "TF/CF": 0.76 };

const RADAR_RAW: Record<string, { label: string; you: number; comp: number; unit: string }> = {
  "TF":        { label: "Trust Flow",         you: 16,   comp: 30.6,  unit: ""  },
  "CF":        { label: "Citation Flow",       you: 31,   comp: 43.4,  unit: ""  },
  "RefDom":    { label: "Domaines référents",  you: 281,  comp: 916,   unit: ""  },
  "Backlinks": { label: "Backlinks",           you: 3156, comp: 10617, unit: ""  },
  "TF/CF":     { label: "Ratio TF/CF",         you: 51.6, comp: 76,    unit: "%" },
};

function radarFmt(axis: string, v: number): string {
  if (axis === "Backlinks" || axis === "RefDom") return v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(Math.round(v));
  return String(Math.round(v * 10) / 10);
}

function radarPt(axis: string, vals: Record<string, number>, cx: number, cy: number, R: number, i: number, n: number) {
  const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
  const r = (vals[axis] ?? 0) * R;
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function RadarChart() {
  const [hoveredAxis, setHoveredAxis] = useState<string | null>(null);
  const [tipPos, setTipPos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const cx = 130, cy = 120, R = 90;
  const n = RADAR_AXES.length;

  const youPts  = RADAR_AXES.map((a, i) => radarPt(a, YOU_VALS,  cx, cy, R, i, n));
  const compPts = RADAR_AXES.map((a, i) => radarPt(a, COMP_VALS, cx, cy, R, i, n));
  const toPoints = (pts: { x: number; y: number }[]) => pts.map((p) => `${p.x},${p.y}`).join(" ");

  const labelPts = RADAR_AXES.map((_, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + (R + 18) * Math.cos(angle), y: cy + (R + 18) * Math.sin(angle) };
  });

  const onAxisEnter = (axis: string, e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHoveredAxis(axis);
    setTipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const onAxisMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={containerRef}
        className="relative"
        onMouseLeave={() => { setHoveredAxis(null); setTipPos(null); }}
      >
        <svg width={260} height={260} viewBox="0 0 260 260">
          {/* Grid circles */}
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <circle key={f} cx={cx} cy={cy} r={R * f} fill="none" stroke="var(--border-subtle)" strokeWidth="1" />
          ))}
          {/* Axes */}
          {RADAR_AXES.map((_, i) => {
            const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
            return (
              <line key={i}
                x1={cx} y1={cy}
                x2={cx + R * Math.cos(angle)} y2={cy + R * Math.sin(angle)}
                stroke="var(--border-subtle)" strokeWidth="1"
              />
            );
          })}
          {/* Competitors polygon */}
          <polygon points={toPoints(compPts)}
            fill="rgba(148,163,184,0.08)" stroke="rgba(148,163,184,0.5)" strokeWidth="1.5" strokeLinejoin="round" />
          {/* Vous polygon */}
          <polygon points={toPoints(youPts)}
            fill="rgba(62,80,245,0.15)" stroke="#3E50F5" strokeWidth="2" strokeLinejoin="round" />
          {/* Vertex dots — Competitors */}
          {compPts.map((pt, i) => (
            <circle key={`cd-${i}`} cx={pt.x} cy={pt.y} r={3} fill="rgba(148,163,184,0.8)" stroke="white" strokeWidth="1.5" />
          ))}
          {/* Vertex dots — Vous */}
          {youPts.map((pt, i) => (
            <circle key={`yd-${i}`} cx={pt.x} cy={pt.y} r={3.5} fill="#3E50F5" stroke="white" strokeWidth="1.5" />
          ))}
          {/* Labels */}
          {RADAR_AXES.map((label, i) => (
            <text key={i}
              x={labelPts[i].x} y={labelPts[i].y + 4}
              textAnchor="middle" fontSize={11} fontWeight={600}
              fill={hoveredAxis === label ? "#3E50F5" : "var(--text-secondary)"}
              style={{ transition: "fill 0.1s" }}
            >
              {label}
            </text>
          ))}
          {/* Hit zones at each label */}
          {RADAR_AXES.map((axis, i) => (
            <circle
              key={`hz-${axis}`}
              cx={labelPts[i].x} cy={labelPts[i].y} r={24}
              fill="transparent"
              style={{ cursor: "pointer" }}
              onMouseEnter={(e) => onAxisEnter(axis, e)}
              onMouseMove={onAxisMove}
            />
          ))}
        </svg>
        {hoveredAxis && tipPos && (() => {
          const raw = RADAR_RAW[hoveredAxis];
          const diff = raw.you - raw.comp;
          return (
            <ChartTooltip x={tipPos.x} y={tipPos.y}>
              <div className="flex flex-col gap-1.5" style={{ minWidth: 140 }}>
                <span className="text-[11px] font-semibold text-white">{raw.label}</span>
                <div className="flex flex-col gap-0.5 text-[11px]">
                  <div className="flex items-center justify-between gap-5 text-white">
                    <span className="opacity-60">Vous</span>
                    <strong>{radarFmt(hoveredAxis, raw.you)}{raw.unit}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-5 text-white">
                    <span className="opacity-60">Concurrents</span>
                    <strong>{radarFmt(hoveredAxis, raw.comp)}{raw.unit}</strong>
                  </div>
                  <div className={`mt-1 flex items-center justify-between gap-5 font-semibold ${diff < 0 ? "text-[#F87171]" : "text-[#34D399]"}`}>
                    <span>Écart</span>
                    <span>{diff > 0 ? "+" : "−"}{radarFmt(hoveredAxis, Math.abs(diff))}{raw.unit}</span>
                  </div>
                </div>
              </div>
            </ChartTooltip>
          );
        })()}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-5 text-[12px] text-[var(--text-muted)]">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#3E50F5]" />
          Vous <strong className="ml-0.5 text-[var(--text-primary)]">48%</strong>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[rgba(148,163,184,0.6)]" />
          Concurrents <strong className="ml-0.5 text-[var(--text-primary)]">94%</strong>
        </span>
      </div>
    </div>
  );
}

/* AnchorDonut → DonutChart DS · TfAreaChart → AreaChart DS */

const ANCHOR_DONUT_SLICES = ANCHOR_SEGS.map((s) => ({ label: s.label, value: s.count, color: s.color }));
const anchorTotal = ANCHOR_SEGS.reduce((a, s) => a + s.count, 0);

/* ── Score ring helper ────────────────────────────────────────────────── */

function scoreColor(s: number) {
  if (s >= 70) return "#10B981";
  if (s >= 45) return "#F59E0B";
  return "#E11D48";
}

/* ── Main component ───────────────────────────────────────────────────── */

export function AuditNetlinkingTab({ domain }: { domain: string }) {
  const [tfPeriod, setTfPeriod] = useState<"3m" | "6m" | "1an">("6m");

  const tfData = tfPeriod === "3m" ? TF_DATA_3M : tfPeriod === "6m" ? TF_DATA_6M : TF_DATA_1AN;
  const tfMin  = Math.min(...tfData.map((d) => d.value));
  const tfMax  = Math.max(...tfData.map((d) => d.value));
  const tfDelta = tfData[tfData.length - 1].value - tfData[0].value;

  const you = COMPETITORS.find((c) => c.isYou)!;
  const score = 48;
  const color48 = scoreColor(score);

  return (
    <div className="flex flex-col gap-8">

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-8">
          <div className="grid grid-cols-[2fr_1fr] items-center gap-8">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[rgba(245,158,11,0.1)] px-3 py-1.5 text-[12px] font-semibold text-[#F59E0B]">Netlinking · rapport Majestic</span>
                <span className="text-[13px] text-[var(--text-muted)]">5 mai 2026</span>
                <span className="text-[13px] text-[var(--text-muted)]">·</span>
                <span className="text-[13px] text-[var(--text-muted)]">{domain}</span>
              </div>
              <h1 className="text-[32px] font-semibold leading-tight tracking-tight text-[var(--text-primary)]">
                Profil de liens <span style={{ color: color48 }}>fragile</span>
                <br />face aux concurrents
              </h1>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--text-secondary)]">
                Le TF est 2× inférieur à la médiane concurrents et le nombre de domaines référents est limité. Le ratio TF/CF reste correct mais la masse globale manque.
              </p>
              <div className="mt-6">
                <Button size="sm" variant="secondary">
                  <ArrowPathIcon className="h-4 w-4" />
                  Relancer l'analyse
                </Button>
              </div>
            </div>
            {/* Score ring */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <svg width={160} height={160} style={{ transform: "rotate(-90deg)" }}>
                  <circle cx={80} cy={80} r={68} fill="none" stroke="var(--border-subtle)" strokeWidth={7} />
                  <circle cx={80} cy={80} r={68} fill="none" stroke={color48} strokeWidth={7}
                    strokeDasharray={2 * Math.PI * 68}
                    strokeDashoffset={2 * Math.PI * 68 * (1 - score / 100)}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[44px] font-semibold leading-none text-[var(--text-primary)]">{score}</span>
                  <span className="text-[14px] text-[var(--text-muted)]">/100</span>
                </div>
              </div>
              <p className="text-[13px] font-medium text-[var(--text-muted)]">Score netlinking</p>
              <p className="text-[12px] text-[var(--text-muted)]">Grade <strong style={{ color: color48 }}>C</strong> · benchmark 10 sites</p>
            </div>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Trust Flow",         val: "16",  bench: `conc. moy. ${COMP_AVG_TF}`,                         delta: 16 - Math.round(COMP_AVG_TF) },
            { label: "Domaines référents", val: "281", bench: `conc. moy. ${COMP_AVG_RD.toLocaleString("fr-FR")}`, delta: 281 - COMP_AVG_RD },
            { label: "Position TF",        val: "3e",  bench: "conc. 1er",                                         delta: -2 },
            { label: "Ratio TF/CF",        val: "51%", bench: "conc. moy. 53%",                                    delta: -2, suffix: "pp" },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-5 py-4">
              <p className="text-[12px] text-[var(--text-muted)]">{kpi.label}</p>
              <p className="mt-1 text-[28px] font-semibold leading-none text-[var(--text-primary)]">{kpi.val}</p>
              <p className="mt-2 text-[11px] text-[var(--text-muted)]">{kpi.bench}</p>
              <p className={`mt-0.5 text-[11px] font-medium ${kpi.delta < 0 ? "text-[#E11D48]" : "text-[#10B981]"}`}>
                {kpi.delta > 0 ? "+" : ""}{kpi.delta}{kpi.suffix ?? ""}
              </p>
            </div>
          ))}
        </div>

        {/* ── 01. BENCHMARK CONCURRENTS ─────────────────────────────────── */}
        <div id="net-benchmark" className="flex flex-col gap-5">
          <SectionHead num="01." title="Benchmark" em="concurrents"
            meta={`${COMPETITORS.length - 1} concurrents · source Majestic`} />

          {/* Table */}
          <div className="bg-[var(--bg-card)]">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-[var(--text-muted)]">Domaine</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-[var(--text-muted)]">TF</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-[var(--text-muted)]">CF</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-[var(--text-muted)]">RefDom</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-[var(--text-muted)]">Backlinks</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-[var(--text-muted)]">Gap TF</th>
                  <th className="pr-4 py-3 text-center text-[11px] font-semibold text-[var(--text-muted)]">Gap RefDom</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {COMPETITORS.map((c) => {
                  const gapTf = c.isYou ? 0 : c.tf - you.tf;
                  const gapRd = c.isYou ? 0 : c.refDomains - you.refDomains;
                  return (
                    <tr key={c.domain}
                      className="transition-colors hover:bg-[var(--bg-card-hover)]"
                      style={c.isYou ? { backgroundColor: "rgba(62,80,245,0.04)" } : {}}>
                      <td className="px-4 py-3 align-middle">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${c.domain}&sz=16`}
                            alt="" width={14} height={14} className="flex-shrink-0 rounded-sm"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                          <span className={`truncate font-mono text-[12px] ${c.isYou ? "font-semibold text-[#3E50F5]" : "text-[var(--text-secondary)]"}`}>
                            {c.domain}{c.isYou ? " (vous)" : ""}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center align-middle">
                        <span className={`font-semibold ${c.isYou ? "text-[#3E50F5]" : "text-[var(--text-primary)]"}`}>{c.tf}</span>
                      </td>
                      <td className="px-4 py-3 text-center align-middle text-[var(--text-secondary)]">{c.cf}</td>
                      <td className="px-4 py-3 text-center align-middle text-[var(--text-secondary)]">{c.refDomains.toLocaleString("fr-FR")}</td>
                      <td className="px-4 py-3 text-center align-middle text-[var(--text-secondary)]">{c.backlinks.toLocaleString("fr-FR")}</td>
                      <td className="px-4 py-3 text-center align-middle">
                        {c.isYou ? <span className="text-[13px] text-[var(--text-muted)]">—</span> : <DeltaBadge value={gapTf} />}
                      </td>
                      <td className="pr-4 py-3 text-center align-middle">
                        {c.isYou ? <span className="text-[13px] text-[var(--text-muted)]">—</span> : <DeltaBadge value={gapRd} />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Radar with context */}
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-6 py-5">
            <p className="text-[16px] font-semibold tracking-subheading text-[var(--text-primary)]">Vue radar — 5 axes normalisés</p>
            <p className="mt-1 mb-5 text-[12px] text-[var(--text-muted)]">
              Chaque axe est normalisé par rapport au maximum observé parmi les 11 sites. Plus la surface est grande, meilleur est le profil netlinking.
            </p>
            <div className="flex justify-center">
              <RadarChart />
            </div>
          </div>
        </div>

        {/* ── 02. PROFIL DES LIENS ──────────────────────────────────────── */}
        <div id="net-liens" className="flex flex-col gap-5">
          <SectionHead num="02." title="Profil" em="des liens" meta="Follow · Texte · Pays · Langue" />

          {/* Follow/Nofollow + Texte/Image horizontal bars */}
          <div className="grid grid-cols-2 gap-4">
            {/* Follow/Nofollow */}
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-6 py-5">
              <p className="mb-5 text-[13px] font-semibold text-[var(--text-secondary)]">Follow vs Nofollow</p>
              <div className="flex flex-col gap-5">
                {[
                  { label: "Vous",              follow: 70.9, nofollow: 29.1 },
                  { label: "Concurrents (moy.)", follow: 76,   nofollow: 24   },
                ].map((row) => (
                  <div key={row.label} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-[var(--text-muted)]">{row.label}</span>
                      <span className="flex items-center gap-3 text-[var(--text-muted)]">
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[#3E50F5]" />
                          Follow {row.follow}%
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[#94A3B8]" />
                          Nofollow {row.nofollow}%
                        </span>
                      </span>
                    </div>
                    <div className="flex h-3 overflow-hidden rounded-full">
                      <div style={{ width: `${row.follow}%`, backgroundColor: "#3E50F5" }} />
                      <div style={{ width: `${row.nofollow}%`, backgroundColor: "#94A3B8" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Texte/Image */}
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-6 py-5">
              <p className="mb-5 text-[13px] font-semibold text-[var(--text-secondary)]">Texte vs Image</p>
              <div className="flex flex-col gap-5">
                {[
                  { label: "Vous",              texte: 96.7, image: 3.3 },
                  { label: "Concurrents (moy.)", texte: 80,   image: 20  },
                ].map((row) => (
                  <div key={row.label} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-[var(--text-muted)]">{row.label}</span>
                      <span className="flex items-center gap-3 text-[var(--text-muted)]">
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[#10B981]" />
                          Texte {row.texte}%
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[#94A3B8]" />
                          Image {row.image}%
                        </span>
                      </span>
                    </div>
                    <div className="flex h-3 overflow-hidden rounded-full">
                      <div style={{ width: `${row.texte}%`, backgroundColor: "#10B981" }} />
                      <div style={{ width: `${row.image}%`, backgroundColor: "#94A3B8" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Country + Language distribution */}
          <div className="grid grid-cols-2 gap-4">
            {/* Pays */}
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-6 py-5">
              <p className="mb-4 text-[13px] font-semibold text-[var(--text-secondary)]">Distribution pays</p>
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)]">
                    <th className="pb-2 text-left text-[11px] font-semibold text-[var(--text-muted)]">Pays</th>
                    <th className="pb-2 text-right text-[11px] font-semibold text-[var(--text-muted)]">Vous</th>
                    <th className="pb-2 text-right text-[11px] font-semibold text-[var(--text-muted)]">Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {[
                    { pays: "France",   you: 45.2, delta: -13.2 },
                    { pays: "USA",      you: 18.7, delta: +6.4  },
                    { pays: "UK",       you: 9.1,  delta: +1.3  },
                    { pays: "Belgique", you: 6.8,  delta: -2.4  },
                    { pays: "Suisse",   you: 4.2,  delta: +0.1  },
                  ].map((row) => (
                    <tr key={row.pays} className="transition-colors hover:bg-[var(--bg-card-hover)]">
                      <td className="py-2.5 text-[var(--text-secondary)]">{row.pays}</td>
                      <td className="py-2.5 text-right font-semibold text-[var(--text-primary)]">{row.you}%</td>
                      <td className="py-2.5 text-right">
                        <span className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${row.delta < 0 ? "bg-[rgba(225,29,72,0.1)] text-[#E11D48]" : "bg-[rgba(16,185,129,0.1)] text-[#10B981]"}`}>
                          {row.delta > 0 ? "+" : ""}{row.delta}pp
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Langue */}
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-6 py-5">
              <p className="mb-4 text-[13px] font-semibold text-[var(--text-secondary)]">Distribution langue</p>
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)]">
                    <th className="pb-2 text-left text-[11px] font-semibold text-[var(--text-muted)]">Langue</th>
                    <th className="pb-2 text-right text-[11px] font-semibold text-[var(--text-muted)]">Vous</th>
                    <th className="pb-2 text-right text-[11px] font-semibold text-[var(--text-muted)]">Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {[
                    { langue: "Français",  you: 72.4, delta: -8.8 },
                    { langue: "Anglais",   you: 19.3, delta: +7.9 },
                    { langue: "Espagnol",  you: 4.1,  delta: +0.9 },
                    { langue: "Allemand",  you: 2.1,  delta: -0.7 },
                  ].map((row) => (
                    <tr key={row.langue} className="transition-colors hover:bg-[var(--bg-card-hover)]">
                      <td className="py-2.5 text-[var(--text-secondary)]">{row.langue}</td>
                      <td className="py-2.5 text-right font-semibold text-[var(--text-primary)]">{row.you}%</td>
                      <td className="py-2.5 text-right">
                        <span className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${row.delta < 0 ? "bg-[rgba(225,29,72,0.1)] text-[#E11D48]" : "bg-[rgba(16,185,129,0.1)] text-[#10B981]"}`}>
                          {row.delta > 0 ? "+" : ""}{row.delta}pp
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Callout variant="info">La sous-représentation française (45.2% vs 58.4% pour les concurrents) indique un profil de liens trop international pour un site ciblant le marché FR. Prioriser des partenariats avec des éditeurs .fr ou des médias spécialisés français.</Callout>
        </div>

        {/* ── 03. ÉVOLUTION TRUST FLOW ──────────────────────────────────── */}
        <div id="net-evolution" className="flex flex-col gap-5">
          <SectionHead num="03." title="Évolution" em="Trust Flow" meta="Source Majestic · historique mensuel" />

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-6 py-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-4 text-[13px] text-[var(--text-muted)]">
                <span>Min <strong className="text-[var(--text-primary)]">{tfMin}</strong></span>
                <span>Max <strong className="text-[var(--text-primary)]">{tfMax}</strong></span>
                <span className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${tfDelta < 0 ? "bg-[rgba(225,29,72,0.1)] text-[#E11D48]" : "bg-[rgba(16,185,129,0.1)] text-[#10B981]"}`}>
                  Delta {tfDelta > 0 ? "+" : ""}{tfDelta} ({tfDelta > 0 ? "+" : ""}{Math.round(tfDelta / tfData[0].value * 100)}%)
                </span>
              </div>
              <FilterTabs
                tabs={[
                  { key: "3m",  label: "3 mois" },
                  { key: "6m",  label: "6 mois" },
                  { key: "1an", label: "1 an" },
                ]}
                value={tfPeriod}
                onChange={(k) => setTfPeriod(k as "3m" | "6m" | "1an")}
              />
            </div>
            <AreaChart
                data={tfData}
                formatTooltip={(p) => (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] text-white/60">{p.label}</span>
                    <span className="text-[13px] font-semibold text-white">TF {p.value}</span>
                  </div>
                )}
              />
          </div>
        </div>

        {/* ── 04. TOPICAL TRUST FLOW ────────────────────────────────────── */}
        <div id="net-topical" className="flex flex-col gap-5">
          <SectionHead num="04." title="Topical" em="Trust Flow" meta="Thématiques identifiées par Majestic" />

          <div className="grid grid-cols-2 gap-4">
            {/* Vos thématiques */}
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-6 py-5">
              <p className="mb-4 text-[13px] font-semibold text-[var(--text-secondary)]">Vos thématiques</p>
              <div className="flex flex-wrap gap-2">
                {YOUR_TOPICS.map((t) => (
                  <span key={t.label}
                    className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-white"
                    style={{ backgroundColor: t.color }}>
                    {t.label}
                  </span>
                ))}
              </div>
            </div>
            {/* Thématiques concurrents */}
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-6 py-5">
              <p className="mb-4 text-[13px] font-semibold text-[var(--text-secondary)]">Thématiques concurrents</p>
              <div className="flex flex-col gap-2.5">
                {COMP_TOPICS.map((t) => {
                  const isYours = YOUR_TOPICS.some((y) => y.label === t.label);
                  return (
                    <div key={t.label} className="flex items-center gap-3">
                      <span className={`w-28 flex-shrink-0 text-[12px] font-medium truncate ${isYours ? "text-[#3E50F5]" : "text-[var(--text-secondary)]"}`}>
                        {t.label}
                      </span>
                      <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-card-hover)]">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${(t.count / t.max) * 100}%`, backgroundColor: isYours ? "#3E50F5" : "var(--text-muted)" }} />
                      </div>
                      <span className="w-8 flex-shrink-0 text-right text-[11px] text-[var(--text-muted)]">{t.count}/{t.max}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <Callout variant="info">La thématique « Actualités Web » est présente chez 7/10 concurrents mais absente de votre profil. Des liens depuis des médias tech/marketing (BDM, FrenchWeb, JDN) renforceraient cette dimension et diversifieraient les sources thématiques.</Callout>
        </div>

        {/* ── 05. DISTRIBUTION DES ANCRES ──────────────────────────────── */}
        <div id="net-ancres" className="flex flex-col gap-5">
          <SectionHead num="05." title="Distribution" em="des ancres"
            meta={`${TOP_ANCHORS.reduce((s, a) => s + a.n, 0)} ancres analysées · risque élevé`} />

          <div className="grid grid-cols-[auto_1fr] gap-6 items-start">
            {/* Donut + risk */}
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-6 py-5 flex flex-col items-center gap-4 min-w-[220px]">
              <div className="flex w-full items-center justify-between">
                <p className="text-[13px] font-semibold text-[var(--text-secondary)]">Répartition</p>
                <span className="rounded-full bg-[rgba(225,29,72,0.1)] px-3 py-1.5 text-[12px] font-semibold text-[#E11D48]">
                  Risque élevé
                </span>
              </div>
              <DonutChart
                slices={ANCHOR_DONUT_SLICES}
                size={112}
                strokeWidth={9}
                center={
                  <div className="flex flex-col items-center">
                    <span className="text-[18px] font-bold leading-none text-[var(--text-primary)]">{anchorTotal}</span>
                    <span className="text-[11px] text-[var(--text-muted)]">ancres</span>
                  </div>
                }
                formatTooltip={(s, pct) => (
                  <span className="text-[12px] text-white">{s.label} · <strong>{pct}%</strong> ({s.value})</span>
                )}
              />
              <div className="flex flex-col gap-1.5 self-stretch">
                {ANCHOR_SEGS.map((s) => (
                  <div key={s.label} className="flex items-center justify-between text-[12px]">
                    <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                      {s.label}
                    </span>
                    <span className="font-semibold text-[var(--text-primary)]">{s.pct}%</span>
                  </div>
                ))}
              </div>
              <div className="flex w-full items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-hover)] px-3.5 py-2.5">
                <span className="text-[12px] text-[var(--text-muted)]">Score ancres</span>
                <span className="text-[18px] font-semibold text-[#E11D48]">22<span className="text-[12px] font-medium text-[var(--text-muted)]">/100</span></span>
              </div>
            </div>

            {/* Top anchors table */}
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
              <p className="px-6 py-4 text-[13px] font-semibold text-[var(--text-secondary)]">Top ancres</p>
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)]">
                    <th className="px-6 pb-3 text-left text-[11px] font-semibold text-[var(--text-muted)]">Texte d'ancre</th>
                    <th className="pr-6 pb-3 text-right text-[11px] font-semibold text-[var(--text-muted)]">Occurrences</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {TOP_ANCHORS.map((a) => (
                    <tr key={a.text} className="transition-colors hover:bg-[var(--bg-card-hover)]">
                      <td className="px-6 py-3 font-mono text-[12px] text-[var(--text-secondary)]">{a.text}</td>
                      <td className="pr-6 py-3 text-right font-semibold tabular-nums text-[var(--text-primary)]">{a.n}</td>
                    </tr>
                  ))}
                  <tr className="bg-[var(--bg-secondary)]">
                    <td className="px-6 py-3 text-[12px] font-semibold text-[var(--text-muted)]">Total</td>
                    <td className="pr-6 py-3 text-right text-[13px] font-semibold text-[var(--text-primary)]">
                      {TOP_ANCHORS.reduce((s, a) => s + a.n, 0)} ancres
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <Callout variant="warning">59% d'ancres de marque est élevé (idéal : 30–40%). Un sur-ancrage exact-match de marque peut diluer la valeur thématique transmise. Diversifier vers des ancres de type « agence marketing digital Paris » ou « formation SEO certifiée ».</Callout>
        </div>

        {/* ── 06. BENCHMARK VISIBILITÉ SEO ─────────────────────────────── */}
        <div id="net-visibilite" className="flex flex-col gap-5">
          <SectionHead num="06." title="Benchmark" em="visibilité SEO"
            meta="Source SEObserver · snapshot 5 mai 2026" />

          <div className="bg-[var(--bg-card)]">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-[var(--text-muted)]">Domaine</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-[var(--text-muted)]">Visibilité</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-[var(--text-muted)]">Top 3</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-[var(--text-muted)]">Top 10</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-[var(--text-muted)]">Top 50</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-[var(--text-muted)]">Top 100</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-[var(--text-muted)]">Mots-clés</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-[var(--text-muted)]">Trafic est.</th>
                  <th className="pr-4 py-3 text-right text-[11px] font-semibold text-[var(--text-muted)]">Gap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {VISIBILITY.map((row) => (
                  <tr key={row.domain}
                    className="transition-colors hover:bg-[var(--bg-card-hover)]"
                    style={row.isYou ? { backgroundColor: "rgba(62,80,245,0.04)" } : {}}>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${row.domain}&sz=16`}
                          alt="" width={14} height={14} className="flex-shrink-0 rounded-sm"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                        <span className={`truncate font-mono text-[12px] ${row.isYou ? "font-semibold text-[#3E50F5]" : "text-[var(--text-secondary)]"}`}>
                          {row.domain}{row.isYou ? " (vous)" : ""}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center align-middle">
                      <span className={`font-semibold ${row.isYou ? "text-[#3E50F5]" : "text-[var(--text-primary)]"}`}>{row.vis}</span>
                    </td>
                    <td className="px-4 py-3 text-center align-middle text-[var(--text-secondary)]">{row.top3}</td>
                    <td className="px-4 py-3 text-center align-middle text-[var(--text-secondary)]">{row.top10}</td>
                    <td className="px-4 py-3 text-center align-middle text-[var(--text-secondary)]">{row.top50.toLocaleString("fr-FR")}</td>
                    <td className="px-4 py-3 text-center align-middle text-[var(--text-secondary)]">{row.top100.toLocaleString("fr-FR")}</td>
                    <td className="px-4 py-3 text-center align-middle text-[var(--text-secondary)]">{row.kws}</td>
                    <td className="px-4 py-3 text-center align-middle text-[var(--text-secondary)]">{row.traffic}</td>
                    <td className="pr-4 py-3 text-right align-middle">
                      {row.gap === "—" ? (
                        <span className="text-[13px] text-[var(--text-muted)]">—</span>
                      ) : row.gap === "0" ? (
                        <span className="text-[13px] text-[var(--text-muted)]">0</span>
                      ) : (
                        <span className="text-[13px] font-semibold text-[#10B981]">{row.gap}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[12px] text-[var(--text-muted)]">
            Visibilité SEObserver = part de clics organiques estimée sur l'ensemble des mots-clés du marché. Trafic estimé en visiteurs/mois.
          </p>
        </div>

        {/* ── 07. BACKLINKS ─────────────────────────────────────────────── */}
        <div id="net-backlinks" className="flex flex-col gap-5">
          <SectionHead num="07." title="Backlinks" em="entrants"
            meta={`${BACKLINKS.length} liens · Mis à jour 04/05/2026`} />

          <div className="bg-[var(--bg-card)]">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
              <p className="text-[12px] text-[var(--text-muted)]">
                Liste des pages qui font un lien vers votre domaine
              </p>
              <span className="text-[12px] tabular-nums text-[var(--text-muted)]">
                1 – {BACKLINKS.length} / {BACKLINKS.length}
              </span>
            </div>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-[var(--text-muted)]">Source</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-[var(--text-muted)]">TF</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-[var(--text-muted)]">CF</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-[var(--text-muted)]">RefDom</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-[var(--text-muted)]">Ancre</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-[var(--text-muted)]">Type</th>
                  <th className="pr-4 py-3 text-center text-[11px] font-semibold text-[var(--text-muted)]">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {BACKLINKS.map((row) => (
                  <tr key={`${row.domain}-${row.url}`} className="transition-colors hover:bg-[var(--bg-card-hover)]">
                    {/* Source */}
                    <td className="px-4 py-3 align-middle">
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${row.domain}&sz=16`}
                            alt="" width={13} height={13} className="flex-shrink-0 rounded-sm"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                          <span className="truncate font-mono text-[12px] font-medium text-[var(--text-primary)]">{row.domain}</span>
                          <span className="flex-shrink-0 rounded px-1 py-0.5 text-[10px] font-semibold bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                            {row.country}
                          </span>
                        </div>
                        <span className="truncate font-mono text-[11px] text-[var(--text-muted)]">{row.url}</span>
                      </div>
                    </td>
                    {/* TF */}
                    <td className="px-4 py-3 text-center align-middle">
                      <span className="font-semibold tabular-nums text-[var(--text-primary)]">{row.tf}</span>
                    </td>
                    {/* CF */}
                    <td className="px-4 py-3 text-center align-middle">
                      <span className="tabular-nums text-[var(--text-secondary)]">{row.cf}</span>
                    </td>
                    {/* RefDom */}
                    <td className="px-4 py-3 text-center align-middle">
                      <span className="tabular-nums text-[var(--text-secondary)]">{row.rd.toLocaleString("fr-FR")}</span>
                    </td>
                    {/* Ancre */}
                    <td className="px-4 py-3 align-middle">
                      <span className="font-mono text-[12px] text-[var(--text-secondary)]">{row.ancre}</span>
                    </td>
                    {/* Type */}
                    <td className="px-4 py-3 text-center align-middle">
                      <span className="rounded-full bg-[var(--bg-secondary)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-muted)]">
                        {row.type}
                      </span>
                    </td>
                    {/* Statut */}
                    <td className="pr-4 py-3 text-center align-middle">
                      <span className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${
                        row.statut === "Follow"
                          ? "bg-[rgba(16,185,129,0.1)] text-[#10B981]"
                          : row.statut === "Sponsored"
                          ? "bg-[rgba(245,158,11,0.1)] text-[#F59E0B]"
                          : "bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                      }`}>
                        {row.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

    </div>
  );
}
