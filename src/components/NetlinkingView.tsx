"use client";

import { useMemo, useState } from "react";
import { ShieldCheck, Globe, Trophy, Scale, TrendingUp, TrendingDown, MapPin, Languages, Network, ChevronDown } from "lucide-react";
import { ShieldExclamationIcon } from "@heroicons/react/24/outline";
import { KpiCard } from "@/components/KpiCard";
import { KpiGroup } from "@/components/KpiGroup";
import { TableWide, type ColumnDef } from "@/components/TableWide";
import { RadarChart } from "@/components/RadarChart";
import { Pill } from "@/components/Pill";
import { Callout } from "@/components/Callout";
import { AIInsight } from "@/components/AIInsight";
import { LineDotChart } from "@/components/LineDotChart";
import { SearchInput } from "@/components/SearchInput";
import { DropdownMenu, DropdownItem } from "@/components/DropdownMenu";

/* ════════════════════════════════════════════════════════════════════════
   MOCK DATA — issu du contenu fourni par le dev (prod aw-i.com)
   ══════════════════════════════════════════════════════════════════════ */

const YOUR_DOMAIN = "aw-i.com";

/* ── 01. KPIs ─────────────────────────────────────────────────────────── */

type BenchmarkRow = {
  domain: string;
  tf: number;
  cf: number;
  refDomains: number;
  backlinks: number;
  isYou?: boolean;
};

const BENCHMARK: BenchmarkRow[] = [
  { domain: "noiise.com",                          tf: 50, cf: 48, refDomains: 1647, backlinks: 42386 },
  { domain: "seo.fr",                              tf: 50, cf: 46, refDomains: 1623, backlinks: 30612 },
  { domain: "axess.fr",                            tf: 43, cf: 47, refDomains: 1249, backlinks: 93659 },
  { domain: "cybercite.fr",                        tf: 42, cf: 44, refDomains:  902, backlinks: 532580 },
  { domain: "adveris.fr",                          tf: 37, cf: 45, refDomains:  728, backlinks: 651758 },
  { domain: "eskimoz.fr",                          tf: 21, cf: 48, refDomains: 1426, backlinks: 8120 },
  { domain: "lk-interactive.fr",                   tf: 19, cf: 37, refDomains:  308, backlinks: 265756 },
  { domain: "centre-formation-referencement.fr",   tf: 16, cf: 32, refDomains:  136, backlinks: 243 },
  { domain: YOUR_DOMAIN,                           tf: 15, cf: 42, refDomains:  476, backlinks: 2272, isYou: true },
  { domain: "alioze.com",                          tf: 15, cf: 42, refDomains:  818, backlinks: 295949 },
  { domain: "agencebespoke.com",                   tf: 14, cf: 41, refDomains:  374, backlinks: 10304 },
];

const you = BENCHMARK.find((r) => r.isYou)!;
const competitors = BENCHMARK.filter((r) => !r.isYou);
const tfValues = competitors.map((c) => c.tf).sort((a, b) => b - a);
const refValues = competitors.map((c) => c.refDomains).sort((a, b) => b - a);
const tfAvg = Math.round((tfValues.reduce((s, v) => s + v, 0) / tfValues.length) * 10) / 10;
const refMedian = refValues[Math.floor(refValues.length / 2)];
const positionTF = [...BENCHMARK].sort((a, b) => b.tf - a.tf).findIndex((r) => r.isYou) + 1;
const tfCfRatio = (you.tf / you.cf).toFixed(2).replace(".", ",");

/* ── 02. Benchmark Radar ──────────────────────────────────────────────── */

const RADAR_AXES = ["TF", "CF", "TF/CF", "Backlinks", "RefDom"];
// Valeurs normalisées 0-100 (visualisation, pas brutes). Concurrents = polygone très large, Vous = petit.
const RADAR_YOU = [35, 78, 65, 12, 30];
const RADAR_COMPETITORS = [82, 88, 65, 90, 85];
const SPAM_RISK_DELTA = -46; // % vs concurrents (score global 48 vs moyenne conc. 94)

/* ── 03. Profil des liens ─────────────────────────────────────────────── */

const FOLLOW_NOFOLLOW = {
  vous: { follow: 72.9, nofollow: 27.1 },
  competitors: { follow: 78.3, nofollow: 21.7 },
};

const TEXT_IMAGE = {
  vous: { texte: 96.3, image: 3.7 },
  competitors: { texte: 79.3, image: 20.7 },
};

/* ── 05. Distribution géographique ────────────────────────────────────── */

type GeoRow = { code: string; label: string; pct: number; delta: number };

const COUNTRIES: GeoRow[] = [
  { code: "US", label: "États-Unis", pct: 83, delta: +79 },
  { code: "FR", label: "France",     pct: 16, delta: -80 },
  { code: "–",  label: "Autres",     pct:  1, delta:  +1 },
];

const LANGUAGES: GeoRow[] = [
  { code: "fr", label: "Français",  pct: 57, delta: -39 },
  { code: "–",  label: "Autres",    pct: 43, delta: +43 },
  { code: "de", label: "Allemand",  pct:  1, delta:  +1 },
];

/* ── 07. Évolution Trust Flow ─────────────────────────────────────────── */

const TF_HISTORY: { date: string; val: number }[] = [
  { date: "2026-02-06", val: 16 },
  { date: "2026-02-14", val: 16 },
  { date: "2026-02-21", val: 17 },
  { date: "2026-03-02", val: 17 },
  { date: "2026-03-06", val: 17 },
  { date: "2026-03-10", val: 16 },
  { date: "2026-03-17", val: 16 },
  { date: "2026-03-22", val: 16 },
  { date: "2026-03-28", val: 16 },
  { date: "2026-04-02", val: 16 },
  { date: "2026-04-09", val: 17 },
  { date: "2026-04-13", val: 17 },
  { date: "2026-04-16", val: 17 },
  { date: "2026-04-20", val: 16 },
  { date: "2026-04-23", val: 16 },
  { date: "2026-04-25", val: 16 },
  { date: "2026-04-28", val: 16 },
  { date: "2026-05-01", val: 15 },
  { date: "2026-05-03", val: 15 },
  { date: "2026-05-06", val: 15 },
  { date: "2026-05-09", val: 15 },
  { date: "2026-05-12", val: 15 },
  { date: "2026-05-14", val: 15 },
  { date: "2026-05-16", val: 15 },
  { date: "2026-05-18", val: 15 },
  { date: "2026-05-19", val: 15 },
  { date: "2026-05-20", val: 15 },
  { date: "2026-05-21", val: 15 },
];

/* ── 08. Topical Trust Flow ───────────────────────────────────────────── */

const YOUR_TOPICS = [
  "Business/Publishing and Printing",
  "Business/Opportunities",
  "Computers/Education",
];

type CompTopic = { label: string; count: number; total: number };
const COMP_TOPICS: CompTopic[] = [
  { label: "Computers/Internet/Web Design and Development", count: 5, total: 10 },
  { label: "Business",                                       count: 4, total: 10 },
  { label: "Business/Marketing and Advertising",             count: 3, total: 10 },
  { label: "Business/Financial Services",                    count: 3, total: 10 },
  { label: "Regional/Europe",                                count: 2, total: 10 },
  { label: "Business/Business Services",                     count: 2, total: 10 },
];

/* ── 09. Distribution des ancres ──────────────────────────────────────── */

const ANCHOR_TYPES = {
  marque: 65,
  autre: 29,
  generique: 14, // l'overlap 8% est conservé pour matcher l'exemple
};

type Anchor = { text: string; count: number };
const TOP_ANCHORS: Anchor[] = [
  { text: "https://www.aw-i.com/contacts/", count: 14 },
  { text: "awi", count: 11 },
  { text: "(vide)", count: 5 },
  { text: "[www.aw-i.com](https://www.aw-i.com)", count: 2 },
  { text: "aw-i", count: 2 },
  { text: "34 % des leads qualifiés en b2b proviennent du seo", count: 2 },
  { text: "aw-i.com", count: 2 },
  { text: "agence de search digitale awi", count: 1 },
];

const ANCHOR_TOTAL = 56;
const ANCHOR_SCORE = 22; // /100

/* ── 10. Backlinks ────────────────────────────────────────────────────── */

type Backlink = {
  source: string;
  country: string;
  anchor: string;
  tf: number;
  cf: number;
  refDomains: number;
  type: "Texte" | "Image";
  status: "Follow" | "Nofollow";
};

const BACKLINKS: Backlink[] = [
  { source: "pulsads.com",         country: "FR", anchor: "awi",                              tf: 40, cf: 20, refDomains: 0,   type: "Texte", status: "Follow" },
  { source: "marketing-digital.eu",country: "FR", anchor: "agence search awi",                tf: 32, cf: 38, refDomains: 18,  type: "Texte", status: "Follow" },
  { source: "saas-blog.io",        country: "US", anchor: "aw-i.com",                         tf: 28, cf: 35, refDomains: 12,  type: "Texte", status: "Nofollow" },
  { source: "annuaire-seo.fr",     country: "FR", anchor: "(vide)",                           tf: 18, cf: 22, refDomains:  3,  type: "Texte", status: "Follow" },
  { source: "growth-stack.com",    country: "US", anchor: "https://www.aw-i.com/contacts/",   tf: 24, cf: 31, refDomains:  8,  type: "Texte", status: "Follow" },
  { source: "techcrunch-fr.io",    country: "FR", anchor: "agence de search digitale awi",    tf: 45, cf: 50, refDomains: 240, type: "Texte", status: "Nofollow" },
  { source: "directory-b2b.net",   country: "DE", anchor: "aw-i",                             tf: 12, cf: 18, refDomains:  2,  type: "Image", status: "Follow" },
];

/* ── 11. Benchmark visibilité (Haloscan / SEObserver) ─────────────────── */

type VisibilityRow = {
  domain: string;
  visibility: number | null;
  top3: number;
  top10: number;
  top50: number;
  top100: number;
  keywords: number;
  trafic: number;
  gap: number | null;
  isYou?: boolean;
};

const VISIBILITY: VisibilityRow[] = [
  { domain: YOUR_DOMAIN,        visibility: null, top3: 0, top10: 0, top50: 0, top100: 0, keywords: 0, trafic: 0,   gap: null, isYou: true },
  { domain: "nooki.fr",          visibility: 3100, top3: 1, top10: 4, top50: 5, top100: 5, keywords: 5, trafic: 680, gap: 3100 },
  { domain: "agence-slashr.fr",  visibility: 1200, top3: 3, top10: 5, top50: 5, top100: 5, keywords: 5, trafic: 349, gap: 1200 },
  { domain: "egoprod.fr",        visibility:   45, top3: 0, top10: 1, top50: 5, top100: 5, keywords: 5, trafic:   8, gap:   45 },
  { domain: "search-factory.fr", visibility:    2, top3: 0, top10: 1, top50: 3, top100: 4, keywords: 4, trafic:   0, gap:    2 },
  { domain: "optimize360.fr",    visibility: null, top3: 0, top10: 0, top50: 0, top100: 0, keywords: 0, trafic:   0, gap:    0 },
  { domain: "synerweb.fr",       visibility: null, top3: 0, top10: 0, top50: 0, top100: 0, keywords: 0, trafic:   0, gap:    0 },
  { domain: "elocos.be",         visibility:    0, top3: 0, top10: 0, top50: 1, top100: 4, keywords: 4, trafic:   0, gap:    0 },
  { domain: "yateo.com",         visibility: null, top3: 0, top10: 0, top50: 0, top100: 0, keywords: 0, trafic:   0, gap: null },
  { domain: "ekko-media.com",    visibility: null, top3: 0, top10: 0, top50: 0, top100: 0, keywords: 0, trafic:   0, gap: null },
  { domain: "netinshape.fr",     visibility: null, top3: 0, top10: 0, top50: 0, top100: 0, keywords: 0, trafic:   0, gap: null },
];

/* ════════════════════════════════════════════════════════════════════════
   HELPERS UI
   ══════════════════════════════════════════════════════════════════════ */

/** Badge de gap (Vous vs concurrent) — positive = concurrent devant (mauvais) */
function GapBadge({ value }: { value: number }) {
  if (value === 0) return <span className="text-[12px] text-[var(--text-muted)]">=</span>;
  const ahead = value < 0;
  const color = ahead ? "var(--color-success)" : "var(--color-danger)";
  const bg = ahead ? "var(--color-success-bg)" : "var(--color-danger-bg)";
  const sign = value > 0 ? "+" : "−";
  const abs = Math.abs(value);
  return (
    <span
      className="inline-flex rounded-full px-2 py-1 text-[12px] font-semibold tabular-nums"
      style={{ color, backgroundColor: bg }}
    >
      {sign}{abs.toLocaleString("fr-FR")}
    </span>
  );
}

/** Colonnes du tableau Benchmark concurrents */
function buildBenchmarkColumns(): ColumnDef<BenchmarkRow>[] {
  return [
    {
      key: "domain", header: "Domaine", width: 280, flex: true,
      render: (r) => (
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={`https://www.google.com/s2/favicons?domain=${r.domain}&sz=32`}
            alt=""
            width={16}
            height={16}
            className="h-4 w-4 flex-shrink-0 rounded-sm"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
          <span className={`block truncate text-[13px] ${r.isYou ? "font-semibold text-[var(--accent-primary)]" : "text-[var(--text-primary)]"}`}>
            {r.domain}
            {r.isYou && <span className="ml-2 text-[11px] font-medium text-[var(--text-muted)]">Vous</span>}
          </span>
        </div>
      ),
    },
    {
      key: "tf", header: "TF", width: 70, align: "right", sortable: true, sortValue: (r) => r.tf,
      render: (r) => <span className="text-[13px] font-semibold tabular-nums text-[var(--text-primary)]">{r.tf}</span>,
    },
    {
      key: "cf", header: "CF", width: 70, align: "right", sortable: true, sortValue: (r) => r.cf,
      render: (r) => <span className="text-[13px] tabular-nums text-[var(--text-secondary)]">{r.cf}</span>,
    },
    {
      key: "refDomains", header: "RefDomains", width: 110, align: "right", sortable: true, sortValue: (r) => r.refDomains,
      render: (r) => <span className="text-[13px] tabular-nums text-[var(--text-secondary)]">{r.refDomains.toLocaleString("fr-FR")}</span>,
    },
    {
      key: "backlinks", header: "Backlinks", width: 110, align: "right", sortable: true, sortValue: (r) => r.backlinks,
      render: (r) => <span className="text-[13px] tabular-nums text-[var(--text-muted)]">{r.backlinks.toLocaleString("fr-FR")}</span>,
    },
    {
      key: "gapTf", header: "Gap TF", width: 90, align: "right", sortable: true,
      sortValue: (r) => (r.isYou ? Number.NEGATIVE_INFINITY : r.tf - you.tf),
      render: (r) => r.isYou
        ? <span className="text-[13px] text-[var(--text-muted)]">—</span>
        : <GapBadge value={r.tf - you.tf} />,
    },
    {
      key: "gapRef", header: "Gap RefDom", width: 110, align: "right", sortable: true,
      sortValue: (r) => (r.isYou ? Number.NEGATIVE_INFINITY : r.refDomains - you.refDomains),
      render: (r) => r.isYou
        ? <span className="text-[13px] text-[var(--text-muted)]">—</span>
        : <GapBadge value={r.refDomains - you.refDomains} />,
    },
  ];
}

/** Barre stackée 2 segments — Vous vs Concurrents */
function CompareBar({
  label,
  rows,
  legend,
}: {
  label: string;
  rows: { who: string; segments: { color: string; pct: number; label: string }[]; suffix: string }[];
  legend: { color: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-[15px] font-semibold tracking-subheading text-[var(--text-primary)]">{label}</p>
      <div className="flex flex-col gap-4">
        {rows.map((r) => (
          <div key={r.who} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[13px] text-[var(--text-secondary)]">{r.who}</span>
              <span className="text-[13px] font-semibold tabular-nums text-[var(--text-primary)]">
                {r.segments[0].pct.toFixed(1)}% {r.suffix}
              </span>
            </div>
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
              {r.segments.map((seg, i) => (
                <div
                  key={i}
                  style={{ width: `${seg.pct}%`, backgroundColor: seg.color }}
                  aria-label={`${seg.label} ${seg.pct.toFixed(1)}%`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {legend.map((l) => (
          <span key={l.label} className="flex items-center gap-1.5 text-[12px] text-[var(--text-secondary)]">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Convertit un code pays ISO-2 en emoji drapeau (regional indicator symbols) */
function countryFlag(code: string): string {
  if (!code || code.length !== 2) return "";
  return code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join("");
}

/** Map d'une langue ISO vers code pays pour récupérer un drapeau associé */
const LANGUAGE_TO_COUNTRY: Record<string, string> = {
  fr: "FR", en: "GB", de: "DE", es: "ES", it: "IT", pt: "PT", nl: "NL",
  pl: "PL", sv: "SE", da: "DK", no: "NO", fi: "FI", ja: "JP", zh: "CN",
  ru: "RU", ar: "SA", ko: "KR",
};

/** Ligne pour distribution géographique (drapeau + code + label + barre + % + delta) */
function GeoRowItem({ row, max, kind }: { row: GeoRow; max: number; kind: "country" | "language" }) {
  const positive = row.delta >= 0;
  const deltaColor = positive ? "var(--color-success)" : "var(--color-danger)";
  const flag = (() => {
    if (!row.code || row.code === "–") return null;
    if (kind === "country") return countryFlag(row.code);
    const c = LANGUAGE_TO_COUNTRY[row.code.toLowerCase()];
    return c ? countryFlag(c) : null;
  })();
  return (
    <div className="grid grid-cols-[100px_1fr_60px_70px] items-center gap-3 py-2.5">
      <div className="flex items-center gap-2">
        {flag ? (
          <span className="text-[16px] leading-none" aria-hidden="true">{flag}</span>
        ) : (
          <span className="inline-block h-4 w-5 rounded-sm bg-[var(--bg-subtle)]" aria-hidden="true" />
        )}
        <span className="font-mono text-[11px] font-semibold text-[var(--text-muted)]">{row.code}</span>
        <span className="text-[12px] text-[var(--text-secondary)] truncate">{row.label}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
        <div
          className="h-full rounded-full"
          style={{ width: `${(row.pct / max) * 100}%`, backgroundColor: "var(--accent-primary)" }}
        />
      </div>
      <span className="text-right text-[13px] font-semibold tabular-nums text-[var(--text-primary)]">{row.pct}%</span>
      <span
        className="text-right text-[12px] font-semibold tabular-nums"
        style={{ color: deltaColor }}
      >
        {positive ? "+" : ""}{row.delta}%
      </span>
    </div>
  );
}

/** Stacked bar 3 segments pour types d'ancres */
function AnchorStack({ marque, generique, autre }: { marque: number; generique: number; autre: number }) {
  const total = marque + generique + autre;
  return (
    <div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full">
        <div style={{ width: `${(marque / total) * 100}%`, backgroundColor: "var(--accent-primary)" }} />
        <div style={{ width: `${(generique / total) * 100}%`, backgroundColor: "var(--color-warning)" }} />
        <div style={{ width: `${(autre / total) * 100}%`, backgroundColor: "var(--color-danger)" }} />
      </div>
      <div className="mt-3 flex flex-wrap gap-4">
        <span className="flex items-center gap-1.5 text-[12px] text-[var(--text-secondary)]">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--accent-primary)" }} />
          Marque <span className="ml-1 font-semibold tabular-nums text-[var(--text-primary)]">{marque}%</span>
        </span>
        <span className="flex items-center gap-1.5 text-[12px] text-[var(--text-secondary)]">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--color-warning)" }} />
          Générique <span className="ml-1 font-semibold tabular-nums text-[var(--text-primary)]">{generique}%</span>
        </span>
        <span className="flex items-center gap-1.5 text-[12px] text-[var(--text-secondary)]">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--color-danger)" }} />
          Autre <span className="ml-1 font-semibold tabular-nums text-[var(--text-primary)]">{autre}%</span>
        </span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   MAIN VIEW
   ══════════════════════════════════════════════════════════════════════ */

/** Métriques disponibles dans le graphique d'évolution historique */
type EvoMetric = "tf" | "cf" | "refdom" | "backlinks";
type EvoRange = "3m" | "6m" | "12m";

const EVO_METRIC_CONFIG: Record<EvoMetric, { label: string; yMax: number; transform: (tfVal: number) => number; format: (v: number) => string }> = {
  tf:        { label: "Trust Flow",       yMax: 20,   transform: (v) => v,                       format: (v) => v.toString() },
  cf:        { label: "Citation Flow",    yMax: 50,   transform: (v) => Math.round(v * 2.8 + 5), format: (v) => v.toString() },
  refdom:    { label: "Domaines référents", yMax: 600, transform: (v) => Math.round(v * 32 + 80), format: (v) => v.toString() },
  backlinks: { label: "Backlinks",        yMax: 3000, transform: (v) => Math.round(v * 145 + 200), format: (v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toString() },
};

const EVO_RANGE_CONFIG: Record<EvoRange, { label: string; pointCount: number }> = {
  "3m":  { label: "3 mois",  pointCount: 12 },
  "6m":  { label: "6 mois",  pointCount: 20 },
  "12m": { label: "12 mois", pointCount: 28 },
};

export function NetlinkingView() {
  /* ── Evolution chart state ── */
  const [evoMetric, setEvoMetric] = useState<EvoMetric>("tf");
  const [evoRange, setEvoRange]   = useState<EvoRange>("12m");

  const evoCfg = EVO_METRIC_CONFIG[evoMetric];
  const evoRangeCfg = EVO_RANGE_CONFIG[evoRange];

  /** Données filtrées + transformées selon métrique + range */
  const evoData = TF_HISTORY
    .slice(-evoRangeCfg.pointCount)
    .map((d) => ({ date: d.date, val: evoCfg.transform(d.val) }));

  const evoFirst = evoData[0]?.val ?? 0;
  const evoLast = evoData[evoData.length - 1]?.val ?? 0;
  const evoDelta = evoLast - evoFirst;
  const evoDeltaPct = evoFirst !== 0 ? Math.round((evoDelta / evoFirst) * 100) : 0;

  /* ── Backlinks filters ── */
  const [blQuery, setBlQuery] = useState("");
  const [blStatus, setBlStatus] = useState<"all" | "Follow" | "Nofollow">("all");
  const [blType, setBlType] = useState<"all" | "Texte" | "Image">("all");

  const filteredBacklinks = useMemo(() => {
    return BACKLINKS.filter((b) => {
      if (blStatus !== "all" && b.status !== blStatus) return false;
      if (blType !== "all" && b.type !== blType) return false;
      if (blQuery && !`${b.source} ${b.anchor}`.toLowerCase().includes(blQuery.toLowerCase())) return false;
      return true;
    });
  }, [blQuery, blStatus, blType]);

  return (
    <div className="flex flex-col gap-6">

      {/* ════════════════ 01. KPIs ════════════════ */}
      <KpiGroup columns={4}>
        <KpiCard
          bare
          icon={ShieldCheck}
          label="Trust Flow"
          value={String(you.tf)}
          delta={`${you.tf - Math.round(tfAvg)}`}
          deltaPositiveIsGood
          sub={`Moyenne concurrents : ${tfAvg.toString().replace(".", ",")}`}
        />
        <KpiCard
          bare
          icon={Globe}
          label="Domaines référents"
          value={you.refDomains.toLocaleString("fr-FR")}
          delta={`${you.refDomains - refMedian}`}
          deltaPositiveIsGood
          sub={`Médiane concurrents : ${refMedian.toLocaleString("fr-FR")}`}
        />
        <KpiCard
          bare
          icon={Trophy}
          label="Position TF"
          value={`${positionTF}/${BENCHMARK.length}`}
          sub="Parmi tous les domaines"
        />
        <KpiCard
          bare
          icon={Scale}
          label="Ratio TF/CF"
          value={tfCfRatio}
          sub={`CF : ${you.cf}`}
        />
      </KpiGroup>

      {/* ════════════════ 02. Benchmark concurrents (Majestic / SEObserver) ════════════════ */}
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="font-semibold tracking-subheading text-[var(--text-primary)]">
            Benchmark concurrents
          </h2>
          <p className="mt-0.5 text-[12px] tracking-caption text-[var(--text-muted)]">
            Comparaison TF / CF / Domaines référents · source Majestic
          </p>
        </div>
        <TableWide<BenchmarkRow>
          columns={buildBenchmarkColumns()}
          data={BENCHMARK}
          rowKey={(r) => r.domain}
          isRowActive={(r) => !!r.isYou}
          minWidth={900}
          bordered
          edgePadding="24px"
          hidePagination
        />
      </div>

      {/* ════════════════ 03. Benchmark Radar + Évolution Trust Flow (côte à côte) ════════════════ */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Left — Benchmark Radar */}
        <section className="rounded-3xl bg-[var(--bg-card)] p-7">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold tracking-subheading text-[var(--text-primary)]">
                Benchmark Radar
              </h2>
              <p className="mt-0.5 text-[12px] tracking-caption text-[var(--text-muted)]">
                Comparaison multi-métriques vs concurrents
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Pill bg="var(--color-danger-bg)" color="var(--color-danger)">
                <ShieldExclamationIcon className="h-3.5 w-3.5" />
                Risque spam
              </Pill>
              <span
                className="inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-bold tabular-nums"
                style={{ backgroundColor: "var(--color-danger)", color: "white" }}
              >
                {SPAM_RISK_DELTA}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <RadarChart
              axes={RADAR_AXES}
              series={[
                { label: "Concurrents", values: RADAR_COMPETITORS, color: "var(--color-danger)", dashed: true },
                { label: "Vous",        values: RADAR_YOU,         color: "var(--accent-primary)" },
              ]}
              size={280}
            />
          </div>

          <div className="mt-2 flex items-center justify-center gap-6">
            <span className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
              <span className="h-2 w-4 rounded-full" style={{ background: "var(--color-danger)" }} />
              Concurrents
            </span>
            <span className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
              <span className="h-2 w-4 rounded-full" style={{ background: "var(--accent-primary)" }} />
              Vous
            </span>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-[var(--border-subtle)] pt-4">
            <span className="text-[12px] text-[var(--text-muted)]">
              Score global : <span className="font-semibold text-[var(--text-primary)]">48%</span>
            </span>
            <span className="text-[12px] text-[var(--text-muted)]">
              Moyenne concurrents : <span className="font-semibold text-[var(--text-primary)]">94%</span>
            </span>
          </div>
        </section>

        {/* Right — Évolution historique (métrique + range configurables) */}
        <section className="rounded-3xl bg-[var(--bg-card)] p-7 flex flex-col">
          <div className="mb-4 flex items-start justify-between gap-4">
            {/* Left — Title + valeur courante immédiatement dessous */}
            <div>
              <h2 className="font-semibold tracking-subheading text-[var(--text-primary)]">
                Évolution historique
              </h2>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[24px] font-semibold tabular-nums leading-none text-[var(--text-primary)]">{evoCfg.format(evoLast)}</span>
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums"
                  style={{
                    color: evoDelta >= 0 ? "var(--color-success)" : "var(--color-danger)",
                    backgroundColor: evoDelta >= 0 ? "var(--color-success-bg)" : "var(--color-danger-bg)",
                  }}
                >
                  {evoDelta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {evoDelta >= 0 ? "+" : ""}{evoCfg.format(Math.abs(evoDelta))} ({evoDelta >= 0 ? "+" : ""}{evoDeltaPct}%)
                </span>
              </div>
            </div>

            {/* Right — dropdowns alignés top */}
            <div className="flex items-center gap-2">
              {/* Dropdown métrique */}
              <DropdownMenu
                width={200}
                trigger={
                  <button className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--border-medium)]">
                    {evoCfg.label}
                    <ChevronDown className="h-3 w-3 text-[var(--text-muted)]" />
                  </button>
                }
              >
                {(Object.entries(EVO_METRIC_CONFIG) as [EvoMetric, typeof EVO_METRIC_CONFIG[EvoMetric]][]).map(([k, c]) => (
                  <DropdownItem key={k} onClick={() => setEvoMetric(k)}>
                    <span className={evoMetric === k ? "font-semibold text-[var(--text-primary)]" : ""}>{c.label}</span>
                  </DropdownItem>
                ))}
              </DropdownMenu>
              {/* Dropdown range */}
              <DropdownMenu
                width={140}
                trigger={
                  <button className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--border-medium)]">
                    {evoRangeCfg.label}
                    <ChevronDown className="h-3 w-3 text-[var(--text-muted)]" />
                  </button>
                }
              >
                {(Object.entries(EVO_RANGE_CONFIG) as [EvoRange, typeof EVO_RANGE_CONFIG[EvoRange]][]).map(([k, c]) => (
                  <DropdownItem key={k} onClick={() => setEvoRange(k)}>
                    <span className={evoRange === k ? "font-semibold text-[var(--text-primary)]" : ""}>{c.label}</span>
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </div>
          </div>

          <div className="flex-1 min-h-[220px]">
            <LineDotChart
              key={`${evoMetric}-${evoRange}`}
              data={evoData}
              fillHeight
              yTicks={5}
              yMin={0}
              yMax={evoCfg.yMax}
              formatValue={evoCfg.format}
            />
          </div>
        </section>

      </div>

      {/* ════════════════ 03. Profil des liens (Follow + Texte) ════════════════ */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-3xl bg-[var(--bg-card)] p-7">
          <CompareBar
            label="Distribution Follow / Nofollow"
            rows={[
              {
                who: "Vous",
                suffix: "follow",
                segments: [
                  { color: "var(--color-success)", pct: FOLLOW_NOFOLLOW.vous.follow,   label: "Follow" },
                  { color: "var(--color-warning)", pct: FOLLOW_NOFOLLOW.vous.nofollow, label: "Nofollow" },
                ],
              },
              {
                who: "Concurrents (moy.)",
                suffix: "follow",
                segments: [
                  { color: "color-mix(in oklab, var(--color-success) 55%, white)", pct: FOLLOW_NOFOLLOW.competitors.follow,   label: "Follow" },
                  { color: "color-mix(in oklab, var(--color-warning) 55%, white)", pct: FOLLOW_NOFOLLOW.competitors.nofollow, label: "Nofollow" },
                ],
              },
            ]}
            legend={[
              { color: "var(--color-success)", label: "Follow" },
              { color: "var(--color-warning)", label: "Nofollow" },
            ]}
          />
        </section>

        <section className="rounded-3xl bg-[var(--bg-card)] p-7">
          <CompareBar
            label="Distribution Texte / Image"
            rows={[
              {
                who: "Vous",
                suffix: "texte",
                segments: [
                  { color: "var(--accent-primary)", pct: TEXT_IMAGE.vous.texte, label: "Texte" },
                  { color: "color-mix(in oklab, var(--accent-primary) 45%, white)", pct: TEXT_IMAGE.vous.image, label: "Image" },
                ],
              },
              {
                who: "Concurrents (moy.)",
                suffix: "texte",
                segments: [
                  { color: "color-mix(in oklab, var(--accent-primary) 55%, white)", pct: TEXT_IMAGE.competitors.texte, label: "Texte" },
                  { color: "color-mix(in oklab, var(--accent-primary) 25%, white)", pct: TEXT_IMAGE.competitors.image, label: "Image" },
                ],
              },
            ]}
            legend={[
              { color: "var(--accent-primary)", label: "Texte" },
              { color: "color-mix(in oklab, var(--accent-primary) 45%, white)", label: "Image" },
            ]}
          />
        </section>
      </div>

      {/* ════════════════ 04. Insights (Profil) ════════════════ */}
      <Callout variant="warning">
        Votre ratio de liens follow est inférieur à la moyenne des concurrents.
      </Callout>

      {/* ════════════════ 05. Distribution géographique ════════════════ */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-3xl bg-[var(--bg-card)] p-7">
          <div className="mb-5 flex items-baseline justify-between">
            <h3 className="font-semibold tracking-subheading text-[var(--text-primary)]">
              Distribution par pays
            </h3>
            <span className="text-[11px] text-[var(--text-muted)]">vs 5 concurrents</span>
          </div>
          <div className="divide-y divide-[var(--border-subtle)]">
            {COUNTRIES.map((c) => (
              <GeoRowItem key={c.code + c.label} row={c} max={100} kind="country" />
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-[var(--bg-card)] p-7">
          <h3 className="mb-5 font-semibold tracking-subheading text-[var(--text-primary)]">
            Distribution par langue
          </h3>
          <div className="divide-y divide-[var(--border-subtle)]">
            {LANGUAGES.map((l) => (
              <GeoRowItem key={l.code + l.label} row={l} max={100} kind="language" />
            ))}
          </div>
        </section>
      </div>

      {/* ════════════════ 06. Insights géographiques ════════════════ */}
      <section className="rounded-3xl bg-[var(--bg-card)] p-7">
        <h3 className="mb-5 font-semibold tracking-subheading text-[var(--text-primary)]">
          Insights géographiques
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* Card 1 — Principal pays */}
          <div className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]">
                <MapPin className="h-4 w-4" />
              </div>
              <span className="text-[26px] leading-none" aria-hidden="true">🇺🇸</span>
            </div>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">Pays source #1</p>
            <p className="mt-1 text-[20px] font-semibold leading-tight text-[var(--text-primary)]">États-Unis</p>
            <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
              <span className="font-semibold tabular-nums text-[var(--text-primary)]">83 %</span> des backlinks
            </p>
          </div>

          {/* Card 2 — Langue dominante */}
          <div className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]">
                <Languages className="h-4 w-4" />
              </div>
              <span className="text-[26px] leading-none" aria-hidden="true">🇫🇷</span>
            </div>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">Langue dominante</p>
            <p className="mt-1 text-[20px] font-semibold leading-tight text-[var(--text-primary)]">Français</p>
            <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
              <span className="font-semibold tabular-nums text-[var(--text-primary)]">57 %</span> du profil
            </p>
          </div>

          {/* Card 3 — Diversité */}
          <div className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]">
                <Network className="h-4 w-4" />
              </div>
              <span className="rounded-full bg-[var(--color-warning-bg)] px-2 py-0.5 text-[10px] font-semibold tabular-nums text-[var(--color-warning)]">faible</span>
            </div>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">Diversité géo</p>
            <p className="mt-1 text-[20px] font-semibold leading-tight tabular-nums text-[var(--text-primary)]">3 pays</p>
            <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
              sources de backlinks
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════ 08. Topical Trust Flow ════════════════ */}
      <section className="rounded-3xl bg-[var(--bg-card)] p-7">
        <div className="mb-6">
          <h2 className="font-semibold tracking-subheading text-[var(--text-primary)]">
            Topical Trust Flow
          </h2>
          <p className="mt-0.5 text-[12px] tracking-caption text-[var(--text-muted)]">
            Thématiques principales des backlinks
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Vos thématiques */}
          <div>
            <div className="mb-4 flex items-baseline gap-2">
              <h3 className="font-semibold text-[var(--text-primary)]">Vos thématiques</h3>
              <span className="rounded-full bg-[var(--bg-secondary)] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[var(--text-secondary)]">
                {YOUR_TOPICS.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {YOUR_TOPICS.map((t) => (
                <Pill key={t} color="var(--accent-primary)" bg="var(--accent-primary-soft)">
                  {t}
                </Pill>
              ))}
            </div>
          </div>

          {/* Thématiques concurrents */}
          <div>
            <div className="mb-4">
              <h3 className="font-semibold text-[var(--text-primary)]">Thématiques concurrents</h3>
            </div>
            <div className="flex flex-col gap-2.5">
              {COMP_TOPICS.map((t) => {
                const pct = Math.round((t.count / t.total) * 100);
                return (
                  <div key={t.label} className="grid grid-cols-[1fr_60px_60px] items-center gap-3">
                    <span className="text-[12px] text-[var(--text-secondary)] truncate" title={t.label}>{t.label}</span>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: "var(--accent-primary)" }}
                      />
                    </div>
                    <span className="text-right text-[12px] font-semibold tabular-nums text-[var(--text-primary)]">
                      {t.count}/{t.total} · {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-[var(--border-subtle)] pt-5">
          <AIInsight>
            <strong>Thématique non partagée</strong> — vous êtes positionné sur <em>Business/Publishing and Printing</em>, <em>Business/Opportunities</em> +1. Vos concurrents ne sont pas sur ce topic. Vérifiez si c'est un avantage ou un décalage thématique.
          </AIInsight>
          <AIInsight>
            <strong>Opportunité</strong> — 50 % des concurrents ont des backlinks <em>Computers/Internet/Web Design and Development</em>, 40 % sur <em>Business</em>.
          </AIInsight>
        </div>
      </section>

      {/* ════════════════ 09. Distribution des ancres ════════════════ */}
      <section className="rounded-3xl bg-[var(--bg-card)] p-7">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold tracking-subheading text-[var(--text-primary)]">
              Distribution des ancres
            </h2>
            <p className="mt-0.5 text-[12px] tracking-caption text-[var(--text-muted)]">
              Répartition par type d'ancre de backlink
            </p>
          </div>
          <Pill bg="var(--color-danger-bg)" color="var(--color-danger)">
            <ShieldExclamationIcon className="h-3.5 w-3.5" />
            Risque : Élevé
          </Pill>
        </div>

        <AnchorStack marque={ANCHOR_TYPES.marque} generique={ANCHOR_TYPES.generique} autre={ANCHOR_TYPES.autre} />

        <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_220px]">
          <div>
            <h3 className="mb-3 font-semibold text-[var(--text-primary)]">Top ancres</h3>
            <ul className="divide-y divide-[var(--border-subtle)]">
              {TOP_ANCHORS.map((a, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="truncate text-[12.5px] font-mono text-[var(--text-secondary)]" title={a.text}>
                    {a.text}
                  </span>
                  <span className="flex-shrink-0 text-[12px] font-semibold tabular-nums text-[var(--text-primary)]">
                    {a.count}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] text-[var(--text-muted)]">
              Total : <span className="font-semibold tabular-nums text-[var(--text-primary)]">{ANCHOR_TOTAL}</span> ancres
            </p>
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl bg-[var(--bg-subtle)] p-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">Score</p>
            <p className="mt-2 text-[40px] font-bold leading-none tabular-nums tracking-heading text-[var(--color-danger)]">
              {ANCHOR_SCORE}
              <span className="text-[18px] font-semibold text-[var(--text-muted)]">/100</span>
            </p>
            <p className="mt-2 text-center text-[11px] text-[var(--text-muted)]">
              Diversité d'ancres faible
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════ 10. Backlinks ════════════════ */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold tracking-subheading text-[var(--text-primary)]">
              Backlinks
            </h2>
            <p className="mt-0.5 text-[12px] tracking-caption text-[var(--text-muted)]">
              Pages qui font un lien vers votre domaine · mis à jour le 21/05/2026
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full border border-[var(--border-medium)] bg-transparent px-3 py-1.5 text-[12px] font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-secondary)]"
            >
              Export CSV
            </button>
            <button
              type="button"
              className="rounded-full bg-[var(--cta-bg)] px-3 py-1.5 text-[12px] font-medium text-[var(--cta-text)] transition-colors hover:bg-[var(--cta-bg-hover)]"
            >
              Actualiser
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SearchInput value={blQuery} onChange={setBlQuery} placeholder="Rechercher URL ou ancre…" alwaysExpanded />
          <DropdownMenu
            trigger={
              <button className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-secondary)] hover:border-[var(--border-medium)]">
                Statut : {blStatus === "all" ? "Tous" : blStatus}
              </button>
            }
          >
            {(["all", "Follow", "Nofollow"] as const).map((s) => (
              <DropdownItem key={s} onClick={() => setBlStatus(s)}>{s === "all" ? "Tous" : s}</DropdownItem>
            ))}
          </DropdownMenu>
          <DropdownMenu
            trigger={
              <button className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-secondary)] hover:border-[var(--border-medium)]">
                Type : {blType === "all" ? "Tous" : blType}
              </button>
            }
          >
            {(["all", "Texte", "Image"] as const).map((t) => (
              <DropdownItem key={t} onClick={() => setBlType(t)}>{t === "all" ? "Tous" : t}</DropdownItem>
            ))}
          </DropdownMenu>
          <span className="ml-auto text-[11px] tabular-nums text-[var(--text-muted)]">
            {filteredBacklinks.length} / {BACKLINKS.length}
          </span>
        </div>

        <TableWide<Backlink>
          columns={[
            {
              key: "source", header: "Source", width: 280, flex: true,
              render: (r) => (
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${r.source}&sz=32`}
                    alt=""
                    width={16}
                    height={16}
                    className="h-4 w-4 flex-shrink-0 rounded-sm"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                  <span className="text-[13px] text-[var(--text-primary)] truncate">{r.source}</span>
                  <span className="flex-shrink-0 rounded bg-[var(--bg-subtle)] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[var(--text-muted)]">
                    {r.country}
                  </span>
                </div>
              ),
            },
            {
              key: "anchor", header: "Ancre", width: 260, flex: true,
              render: (r) => (
                <span className="text-[12.5px] font-mono text-[var(--text-secondary)] truncate" title={r.anchor}>
                  {r.anchor}
                </span>
              ),
            },
            {
              key: "tf", header: "TF", width: 60, align: "right", sortable: true, sortValue: (r) => r.tf,
              render: (r) => <span className="text-[13px] font-semibold tabular-nums text-[var(--text-primary)]">{r.tf}</span>,
            },
            {
              key: "cf", header: "CF", width: 60, align: "right", sortable: true, sortValue: (r) => r.cf,
              render: (r) => <span className="text-[13px] tabular-nums text-[var(--text-secondary)]">{r.cf}</span>,
            },
            {
              key: "refDomains", header: "RefDom", width: 80, align: "right", sortable: true, sortValue: (r) => r.refDomains,
              render: (r) => <span className="text-[13px] tabular-nums text-[var(--text-secondary)]">{r.refDomains}</span>,
            },
            {
              key: "type", header: "Type", width: 80, align: "right",
              render: (r) => (
                <Pill
                  color={r.type === "Texte" ? "var(--accent-primary)" : "color-mix(in oklab, var(--accent-primary) 60%, white)"}
                  bg="var(--accent-primary-soft)"
                >
                  {r.type}
                </Pill>
              ),
            },
            {
              key: "status", header: "Statut", width: 90, align: "right",
              render: (r) => (
                <Pill
                  color={r.status === "Follow" ? "var(--color-success)" : "var(--color-warning)"}
                  bg={r.status === "Follow" ? "var(--color-success-bg)" : "var(--color-warning-bg)"}
                >
                  {r.status}
                </Pill>
              ),
            },
          ]}
          data={filteredBacklinks}
          rowKey={(r) => r.source + r.anchor}
          minWidth={900}
          pageSize={10}
          bordered
          edgePadding="24px"
        />
      </div>

      {/* ════════════════ 11. Benchmark SEO Visibilité ════════════════ */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold tracking-subheading text-[var(--text-primary)]">
              Benchmark SEO — Visibilité
            </h2>
            <p className="mt-0.5 text-[12px] tracking-caption text-[var(--text-muted)]">
              Visibilité organique vs concurrents · source Haloscan
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-[var(--text-muted)]">
              Votre visibilité : <span className="font-semibold text-[var(--text-primary)]">10</span>
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">
              Concurrents : <span className="font-semibold text-[var(--text-primary)]">{competitors.length}</span>
            </span>
          </div>
        </div>

        <TableWide<VisibilityRow>
          columns={[
            {
              key: "domain", header: "Domaine", width: 220, flex: true,
              render: (r) => (
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${r.domain}&sz=32`}
                    alt=""
                    width={16}
                    height={16}
                    className="h-4 w-4 flex-shrink-0 rounded-sm"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                  <span className={`block truncate text-[13px] ${r.isYou ? "font-semibold text-[var(--accent-primary)]" : "text-[var(--text-primary)]"}`}>
                    {r.domain}
                    {r.isYou && <span className="ml-2 text-[11px] font-medium text-[var(--text-muted)]">Vous</span>}
                  </span>
                </div>
              ),
            },
            {
              key: "visibility", header: "Visibilité", width: 110, align: "right", sortable: true, sortValue: (r) => r.visibility ?? -1,
              render: (r) => (
                <span className="text-[13px] font-semibold tabular-nums text-[var(--text-primary)]">
                  {r.visibility === null ? "—" : r.visibility >= 1000 ? `${(r.visibility / 1000).toFixed(1)}K` : r.visibility}
                </span>
              ),
            },
            { key: "top3",   header: "Top 3",   width: 70, align: "right", sortable: true, sortValue: (r) => r.top3,   render: (r) => <span className="text-[13px] tabular-nums text-[var(--text-secondary)]">{r.top3}</span> },
            { key: "top10",  header: "Top 10",  width: 70, align: "right", sortable: true, sortValue: (r) => r.top10,  render: (r) => <span className="text-[13px] tabular-nums text-[var(--text-secondary)]">{r.top10}</span> },
            { key: "top50",  header: "Top 50",  width: 70, align: "right", sortable: true, sortValue: (r) => r.top50,  render: (r) => <span className="text-[13px] tabular-nums text-[var(--text-secondary)]">{r.top50}</span> },
            { key: "top100", header: "Top 100", width: 80, align: "right", sortable: true, sortValue: (r) => r.top100, render: (r) => <span className="text-[13px] tabular-nums text-[var(--text-secondary)]">{r.top100}</span> },
            {
              key: "keywords", header: "Mots-clés", width: 90, align: "right", sortable: true, sortValue: (r) => r.keywords,
              render: (r) => <span className="text-[13px] tabular-nums text-[var(--text-secondary)]">{r.keywords}</span>,
            },
            {
              key: "trafic", header: "Trafic Est.", width: 110, align: "right", sortable: true, sortValue: (r) => r.trafic,
              render: (r) => <span className="text-[13px] tabular-nums text-[var(--text-muted)]">{r.trafic.toLocaleString("fr-FR")}</span>,
            },
            {
              key: "gap", header: "Gap", width: 80, align: "right", sortable: true, sortValue: (r) => r.gap ?? 0,
              render: (r) => {
                if (r.gap === null) return <span className="text-[13px] text-[var(--text-muted)]">—</span>;
                if (r.gap === 0) return <span className="text-[13px] text-[var(--text-muted)]">0</span>;
                return (
                  <span
                    className="inline-flex rounded-full px-2 py-0.5 text-[12px] font-semibold tabular-nums"
                    style={{
                      color: "var(--color-danger)",
                      backgroundColor: "var(--color-danger-bg)",
                    }}
                  >
                    +{r.gap.toLocaleString("fr-FR")}
                  </span>
                );
              },
            },
          ]}
          data={VISIBILITY}
          rowKey={(r) => r.domain}
          isRowActive={(r) => !!r.isYou}
          minWidth={1000}
          hidePagination
          bordered
          edgePadding="24px"
        />
      </div>

    </div>
  );
}
