"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { PriorityBadge } from "@/components/PriorityBars";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { OpportunityDetail } from "@/components/analyse/OpportunitesView";
import { OPPORTUNITIES, OWNERS } from "@/data/actions";
import { SourcePill } from "@/components/SourcePill";
import { type ActionOwner } from "@/components/ActionCard";
import { type Status } from "@/components/StatusPill";
import { NET_VIEWS, type NetView } from "@/components/analyse/constants";
import { ShieldCheck, Globe, Trophy, Scale, TrendingUp, TrendingDown, MapPin, Languages, Network, ExternalLink } from "lucide-react";
import { ShieldExclamationIcon, PencilSquareIcon, XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";
import { KpiCard } from "@/components/KpiCard";
import { KpiGroup } from "@/components/KpiGroup";
import { Flag } from "@/components/Flag";
import { TableWide, type ColumnDef } from "@/components/TableWide";
import { RadarChart } from "@/components/RadarChart";
import { Pill } from "@/components/Pill";
import { VariationPill } from "@/components/VariationPill";
import { InfoNote } from "@/components/InfoNote";
import { ScoreRing } from "@/components/ScoreRing";
import { GeoLineChart } from "@/components/geo/GeoLineChart";
import { FilterTabs } from "@/components/FilterTabs";
import { Favicon } from "@/components/geo/views/OverviewView";
import { SegmentedBar } from "@/components/SegmentedBar";
import { SearchInput } from "@/components/SearchInput";
import { DropdownMenu, DropdownItem } from "@/components/DropdownMenu";
import { Button } from "@/components/Button";
import { ModalShell, fieldCls } from "@/components/analyse/modals/shared";

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

/* ════════════════════════════════════════════════════════════════════════
   HELPERS UI
   ══════════════════════════════════════════════════════════════════════ */

/** Badge de gap (Vous vs concurrent) — negative = vous devant (bon), positive = concurrent devant (mauvais) */
function GapBadge({ value }: { value: number }) {
  if (value === 0) return <span className="type-caption text-[var(--text-muted)]">=</span>;
  const ahead = value < 0; // vous devant
  const sign = value > 0 ? "+" : "−";
  return (
    <VariationPill direction={ahead ? "up" : "down"} className="justify-end">
      {sign}{Math.abs(value).toLocaleString("fr-FR")}
    </VariationPill>
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
          <span className={`block truncate type-label ${r.isYou ? "text-[var(--accent-primary)]" : "text-[var(--text-primary)]"}`}>
            {r.domain}
            {r.isYou && <span className="ml-2 type-micro">Vous</span>}
          </span>
          <a
            href={`https://${r.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Ouvrir ${r.domain} dans un nouvel onglet`}
            className="ml-1 flex-shrink-0 text-[var(--text-muted)] opacity-0 transition-opacity hover:text-[var(--accent-primary)] group-hover:opacity-100"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      ),
    },
    {
      key: "tf", header: "TF", width: 70, align: "right", sortable: true, sortValue: (r) => r.tf,
      render: (r) => <span className="type-label font-semibold tabular-nums text-[var(--text-primary)]">{r.tf}</span>,
    },
    {
      key: "cf", header: "CF", width: 70, align: "right", sortable: true, sortValue: (r) => r.cf,
      render: (r) => <span className="type-label tabular-nums text-[var(--text-secondary)]">{r.cf}</span>,
    },
    {
      key: "refDomains", header: "RefDomains", width: 110, align: "right", sortable: true, sortValue: (r) => r.refDomains,
      render: (r) => <span className="type-label tabular-nums text-[var(--text-secondary)]">{r.refDomains.toLocaleString("fr-FR")}</span>,
    },
    {
      key: "backlinks", header: "Backlinks", width: 110, align: "right", sortable: true, sortValue: (r) => r.backlinks,
      render: (r) => <span className="type-label tabular-nums text-[var(--text-primary)]">{r.backlinks.toLocaleString("fr-FR")}</span>,
    },
    {
      key: "gapTf", header: "Gap TF", width: 90, align: "right", sortable: true,
      sortValue: (r) => (r.isYou ? Number.NEGATIVE_INFINITY : r.tf - you.tf),
      render: (r) => r.isYou
        ? <span className="type-label text-[var(--text-muted)]">—</span>
        : <GapBadge value={r.tf - you.tf} />,
    },
    {
      key: "gapRef", header: "Gap RefDom", width: 110, align: "right", sortable: true,
      sortValue: (r) => (r.isYou ? Number.NEGATIVE_INFINITY : r.refDomains - you.refDomains),
      render: (r) => r.isYou
        ? <span className="type-label text-[var(--text-muted)]">—</span>
        : <GapBadge value={r.refDomains - you.refDomains} />,
    },
  ];
}

/** Convertit un code pays ISO-2 en emoji drapeau (regional indicator symbols) */
/** Ligne pour distribution géographique (drapeau DS + code + label + barre + % + delta) */
function GeoRowItem({ row, max }: { row: GeoRow; max: number }) {
  const positive = row.delta >= 0;
  const hasFlag = !!row.code && row.code !== "–";
  return (
    <div className="grid grid-cols-[100px_1fr_60px_70px] items-center gap-3 py-2.5">
      <div className="flex items-center gap-2">
        {hasFlag ? (
          <Flag code={row.code} size={16} />
        ) : (
          <span className="inline-block h-4 w-4 rounded-full bg-[var(--bg-subtle)]" aria-hidden="true" />
        )}
        <span className="font-mono type-micro">{row.code}</span>
        <span className="type-caption truncate">{row.label}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
        <div
          className="h-full rounded-full"
          style={{ width: `${(row.pct / max) * 100}%`, backgroundColor: "var(--accent-primary)" }}
        />
      </div>
      <span className="text-right type-label font-semibold tabular-nums text-[var(--text-primary)]">{row.pct}%</span>
      <VariationPill direction={positive ? "up" : "down"} className="justify-end">
        {positive ? "+" : "−"}{Math.abs(row.delta)}%
      </VariationPill>
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
        <span className="flex items-center gap-1.5 type-caption">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--accent-primary)" }} />
          Marque <span className="ml-1 font-semibold tabular-nums text-[var(--text-primary)]">{marque}%</span>
        </span>
        <span className="flex items-center gap-1.5 type-caption">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--color-warning)" }} />
          Générique <span className="ml-1 font-semibold tabular-nums text-[var(--text-primary)]">{generique}%</span>
        </span>
        <span className="flex items-center gap-1.5 type-caption">
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

const EVO_METRIC_CONFIG: Record<EvoMetric, { label: string; yMax: number; transform: (tfVal: number) => number; format: (v: number) => string }> = {
  tf:        { label: "Trust Flow",       yMax: 20,   transform: (v) => v,                       format: (v) => v.toString() },
  cf:        { label: "Citation Flow",    yMax: 50,   transform: (v) => Math.round(v * 2.8 + 5), format: (v) => v.toString() },
  refdom:    { label: "Domaines référents", yMax: 600, transform: (v) => Math.round(v * 32 + 80), format: (v) => v.toString() },
  backlinks: { label: "Backlinks",        yMax: 3000, transform: (v) => Math.round(v * 145 + 200), format: (v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toString() },
};

/* ── Autorité média (onglet dédié) ────────────────────────────────────── */
const MEDIA_AUTHORITY = {
  score: 74,
  backlinksTotal: 1284,
  backlinksDeltaPct: 18,
  medias: 126,
  domaines: 87,
  majorMedias: 9,
  articles: 42,
  bigNames: ["Le Figaro", "BFM Business", "Le Point", "Les Échos", "L'Usine Digitale"],
  rank: 3,
  rankTotal: 4,
};

type MediaBenchRow = { company: string; backlinks: number; medias: number; presence: string; score: number; isYou?: boolean };
const MEDIA_BENCHMARK: MediaBenchRow[] = [
  { company: "Pennylane",    backlinks: 2430, medias: 14, presence: "Les Échos, Le Figaro, BFM Business",   score: 82 },
  { company: "Sage France",  backlinks: 1760, medias: 11, presence: "La Tribune, Les Échos, L'Usine Digitale", score: 77 },
  { company: "Uplify Group", backlinks: 1284, medias:  9, presence: "Le Figaro, BFM Business, La Tribune",   score: 74, isYou: true },
  { company: "Qonto",        backlinks:  890, medias:  5, presence: "BFM Business, Le Point, Capital",        score: 61 },
];

/* ── Opportunités : sites les plus influents du secteur (link gap) ──────── */
type OppoRow = { domain: string; category: string; authority: number; competitorsLinked: number; youLinked: boolean };
const NET_OPPORTUNITIES: OppoRow[] = [
  { domain: "lesechos.fr",        category: "Média",     authority: 91, competitorsLinked: 3, youLinked: false },
  { domain: "journaldunet.com",   category: "Média",     authority: 84, competitorsLinked: 3, youLinked: false },
  { domain: "blogdumoderateur.com", category: "Blog",    authority: 78, competitorsLinked: 2, youLinked: true },
  { domain: "usine-digitale.fr",  category: "Média",     authority: 82, competitorsLinked: 2, youLinked: false },
  { domain: "codeur.com",         category: "Annuaire",  authority: 66, competitorsLinked: 3, youLinked: false },
  { domain: "webmarketing-com.com", category: "Blog",    authority: 61, competitorsLinked: 2, youLinked: true },
  { domain: "frenchweb.fr",       category: "Média",     authority: 72, competitorsLinked: 2, youLinked: false },
  { domain: "e-marketing.fr",     category: "Média",     authority: 74, competitorsLinked: 1, youLinked: false },
];

const OPPO_CAT_COLOR: Record<string, string> = {
  "Média": "#3D4FFF",
  "Blog": "#10B981",
  "Annuaire": "#F59E0B",
};


export function NetlinkingView() {
  /* ── Evolution : une série par métrique (grille 2×2), agrégée par mois ── */
  const metricSeries = useMemo(() => {
    const MONTHS_FR = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
    // 1 point / mois (dernière valeur du mois) → labels courts + tooltip lisible.
    const byMonth = new Map<string, number>();
    for (const d of TF_HISTORY) byMonth.set(d.date.slice(0, 7), d.val);
    const months = [...byMonth.entries()].map(([k, val]) => ({ label: MONTHS_FR[parseInt(k.slice(5, 7), 10) - 1], val }));
    return (Object.entries(EVO_METRIC_CONFIG) as [EvoMetric, typeof EVO_METRIC_CONFIG[EvoMetric]][]).map(([key, cfg]) => {
      const points = months.map((m) => ({ label: m.label, value: cfg.transform(m.val) }));
      const first = points[0]?.value ?? 0;
      const last = points[points.length - 1]?.value ?? 0;
      const delta = last - first;
      const deltaPct = first !== 0 ? Math.round((delta / first) * 100) : 0;
      return { key, cfg, points, last, delta, deltaPct };
    });
  }, []);

  /* ── Évolution : sélection de temporalité (3m / 6m / 1 an) ── */
  const [evoPeriod, setEvoPeriod] = useState<"3m" | "6m" | "1an">("6m");
  const evoN = evoPeriod === "3m" ? 3 : evoPeriod === "6m" ? 6 : 12;
  const metricByKey = useMemo(() => Object.fromEntries(metricSeries.map((m) => [m.key, m])) as Record<EvoMetric, typeof metricSeries[number]>, [metricSeries]);
  const evoLast = (key: EvoMetric) => metricByKey[key].cfg.format(metricByKey[key].last);
  const evoPts = (key: EvoMetric) => metricByKey[key].points.slice(-evoN);

  /* ── Benchmark concurrents : liste éditable (modale « Modifier ») ── */
  const [benchRows, setBenchRows] = useState<BenchmarkRow[]>(BENCHMARK);
  const [compModalOpen, setCompModalOpen] = useState(false);

  /** Classement Trust Flow (top 5) — « vous » toujours visible même hors top. */
  const benchRanking = useMemo(() => {
    const sorted = [...benchRows].sort((a, b) => b.tf - a.tf);
    const youIdx = sorted.findIndex((r) => r.isYou);
    if (youIdx >= 5) return [...sorted.slice(0, 4).map((r, i) => ({ r, pos: i + 1 })), { r: sorted[youIdx], pos: youIdx + 1 }];
    return sorted.slice(0, 5).map((r, i) => ({ r, pos: i + 1 }));
  }, [benchRows]);

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

  // Sous-vue active pilotée par l'URL (?view=) — la sidebar (drill-in) la contrôle.
  const viewParam = useSearchParams().get("view");
  const pathname = usePathname();
  const netActions = OPPORTUNITIES.filter((o) => o.module === "netlinking").slice(0, 3); // actions popularité réelles

  // Ouverture de la vraie modale d'action (OpportunityDetail) en place, sans quitter la vue.
  const [selActionId, setSelActionId] = useState<string | null>(null);
  const [aStatus, setAStatus] = useState<Record<string, Status>>({});
  const [aOwner, setAOwner] = useState<Record<string, ActionOwner | undefined>>({});
  const [aDeadline, setADeadline] = useState<Record<string, string | undefined>>({});
  const [aNarr, setANarr] = useState<Record<string, string>>({});
  const [aRec, setARec] = useState<Record<string, string>>({});
  const [aChecked, setAChecked] = useState<Record<string, Set<number>>>({});
  const selIdx = selActionId ? netActions.findIndex((a) => a.id === selActionId) : -1;
  const selAction = selIdx >= 0 ? netActions[selIdx] : null;
  const netTab: NetView = NET_VIEWS.some((v) => v.key === viewParam) ? (viewParam as NetView) : "overview";

  return (
    <div key={netTab} className="page-enter flex flex-col gap-6">

      {netTab === "overview" && (
      <>
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

      {/* ════════════════ Évolution du profil de liens — 2 graphes (2 courbes chacun) ════════════════ */}
      <section className="flex flex-col gap-4 rounded-2xl border border-[var(--border-subtle)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="type-h2">Évolution du profil de liens</h2>
            <p className="mt-0.5 type-caption">Trust Flow / Citation Flow et domaines référents / backlinks</p>
          </div>
          <FilterTabs
            tabs={[{ key: "3m", label: "3 mois" }, { key: "6m", label: "6 mois" }, { key: "1an", label: "1 an" }]}
            value={evoPeriod}
            onChange={(k) => setEvoPeriod(k as "3m" | "6m" | "1an")}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Graphe 1 — Trust Flow & Citation Flow */}
          <section className="flex flex-col rounded-2xl border border-[var(--border-subtle)] p-5">
            <p className="type-label">Trust Flow &amp; Citation Flow</p>
            <div className="mb-4 mt-1 flex items-baseline gap-5">
              <span className="type-h2 leading-none text-[var(--accent-primary)]">TF {evoLast("tf")}</span>
              <span className="type-h2 leading-none text-[#0EA5E9]">CF {evoLast("cf")}</span>
            </div>
            <GeoLineChart
              series={[
                { name: "Trust Flow", color: "var(--accent-primary)", isYou: true, points: evoPts("tf") },
                { name: "Citation Flow", color: "#0EA5E9", isYou: false, points: evoPts("cf") },
              ]}
              height={160}
              suffix=""
              interactive
            />
          </section>

          {/* Graphe 2 — Domaines référents & Backlinks */}
          <section className="flex flex-col rounded-2xl border border-[var(--border-subtle)] p-5">
            <p className="type-label">Domaines référents &amp; Backlinks</p>
            <div className="mb-4 mt-1 flex items-baseline gap-5">
              <span className="type-h2 leading-none text-[var(--accent-primary)]">RefDom {evoLast("refdom")}</span>
              <span className="type-h2 leading-none text-[#0EA5E9]">BL {evoLast("backlinks")}</span>
            </div>
            <GeoLineChart
              series={[
                { name: "Domaines référents", color: "var(--accent-primary)", isYou: true, points: evoPts("refdom") },
                { name: "Backlinks", color: "#0EA5E9", isYou: false, points: evoPts("backlinks") },
              ]}
              height={160}
              suffix=""
              interactive
            />
          </section>
        </div>
      </section>

      {/* ════════════════ Benchmark : Radar (2/3) + Classement (1/3) ════════════════ */}
      <section className="grid grid-cols-1 overflow-hidden rounded-2xl border border-[var(--border-subtle)] lg:grid-cols-[2fr_1fr]">
        {/* Gauche — Radar */}
        <div className="p-7">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="type-h2">Benchmark Radar</h2>
              <p className="mt-0.5 type-caption">Comparaison multi-métriques vs concurrents</p>
            </div>
            <div className="flex items-center gap-2">
              <Pill bg="var(--color-danger-bg)" color="var(--color-danger)">
                <ShieldExclamationIcon className="h-3.5 w-3.5" />
                Risque spam
              </Pill>
              <span className="inline-flex items-center rounded-full px-2.5 py-1 type-caption font-bold tabular-nums" style={{ backgroundColor: "var(--color-danger)", color: "white" }}>
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
              size={340}
            />
          </div>
          <div className="mt-2 flex items-center justify-center gap-6">
            <span className="flex items-center gap-2 type-caption"><span className="h-2 w-4 rounded-full" style={{ background: "var(--color-danger)" }} />Concurrents</span>
            <span className="flex items-center gap-2 type-caption"><span className="h-2 w-4 rounded-full" style={{ background: "var(--accent-primary)" }} />Vous</span>
          </div>
        </div>

        {/* Droite — Classement Trust Flow (top 5) */}
        <div className="flex flex-col border-t border-[var(--border-subtle)] p-6 lg:border-l lg:border-t-0">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <h2 className="type-h2">Classement Trust Flow</h2>
              <SourcePill source="Majestic" href="https://majestic.com" />
            </div>
            <p className="mt-0.5 type-caption">Top domaines du secteur</p>
          </div>
          <div className="flex items-center justify-between pb-1 type-caption">
            <span>Domaine</span>
            <span>Trust Flow</span>
          </div>
          <div className="flex flex-col">
            {benchRanking.map(({ r, pos }) => (
              <div key={r.domain} className="flex items-center gap-2.5 border-t border-[var(--border-subtle)] py-2.5 first:border-t-0">
                <span className="w-5 flex-shrink-0 type-label tabular-nums text-[var(--text-primary)]">{pos}.</span>
                <Favicon domain={r.domain} size={18} />
                <span className={`min-w-0 flex-1 truncate type-label ${r.isYou ? "font-semibold text-[var(--accent-primary)]" : "text-[var(--text-primary)]"}`}>{r.domain}</span>
                {r.isYou && <span className="flex-shrink-0 rounded-md bg-[var(--bg-subtle)] px-1.5 py-0.5 type-micro">Vous</span>}
                <span className="flex-shrink-0 type-label font-semibold tabular-nums text-[var(--text-primary)]">{r.tf}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ Distribution des ancres (aperçu) ════════════════ */}
      <section className="rounded-2xl border border-[var(--border-subtle)] p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="type-h2">Distribution des ancres</h2>
            <p className="mt-0.5 type-caption">Répartition par type d&apos;ancre de backlink</p>
          </div>
          <Pill bg="var(--color-danger-bg)" color="var(--color-danger)">
            <ShieldExclamationIcon className="h-3.5 w-3.5" />
            Risque : Élevé
          </Pill>
        </div>
        <AnchorStack marque={ANCHOR_TYPES.marque} generique={ANCHOR_TYPES.generique} autre={ANCHOR_TYPES.autre} />
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-4">
          <span className="type-caption">Total : <span className="font-semibold tabular-nums text-[var(--text-primary)]">{ANCHOR_TOTAL}</span> ancres</span>
          <span className="type-caption">Score de diversité : <span className="font-semibold tabular-nums text-[var(--color-danger)]">{ANCHOR_SCORE}/100</span></span>
        </div>
      </section>

      </>
      )}

      {netTab === "autorite" && (
      <>
      {/* ════════════════ Autorité média ════════════════ */}
      {/* Score d'autorité média + méthode de calcul */}
      <section className="flex flex-col gap-6 rounded-2xl border border-[var(--border-subtle)] p-7 sm:flex-row sm:items-center">
        <div className="flex flex-shrink-0 items-center gap-5">
          <ScoreRing score={MEDIA_AUTHORITY.score} size={120} strokeWidth={8} />
          <div>
            <h2 className="type-h2">Score d&apos;autorité média</h2>
            <p className="mt-1 max-w-[220px] type-body-sm leading-snug">Niveau de notoriété presse &amp; médias du domaine, noté sur 100.</p>
          </div>
        </div>
        <div className="flex-1 rounded-xl border border-[var(--border-subtle)] p-5">
          <p className="mb-3 type-caption font-semibold">Méthode de calcul</p>
          <ul className="flex flex-col gap-2 type-label">
            <li className="flex items-center justify-between gap-4"><span className="text-[var(--text-secondary)]">Médias majeurs référents</span><span className="font-semibold tabular-nums text-[var(--text-primary)]">35 %</span></li>
            <li className="flex items-center justify-between gap-4"><span className="text-[var(--text-secondary)]">Qualité des domaines presse (TF / CF)</span><span className="font-semibold tabular-nums text-[var(--text-primary)]">30 %</span></li>
            <li className="flex items-center justify-between gap-4"><span className="text-[var(--text-secondary)]">Volume de backlinks presse</span><span className="font-semibold tabular-nums text-[var(--text-primary)]">20 %</span></li>
            <li className="flex items-center justify-between gap-4"><span className="text-[var(--text-secondary)]">Fraîcheur des mentions (12 mois)</span><span className="font-semibold tabular-nums text-[var(--text-primary)]">15 %</span></li>
          </ul>
        </div>
      </section>

      {/* Grands médias + Position benchmark */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Grands médias */}
        <section className="rounded-2xl border border-[var(--border-subtle)] p-7">
          <h2 className="mb-4 type-h2">Grands médias</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="type-micro uppercase tracking-[0.08em]">Médias majeurs</p><p className="mt-1 type-h2 tabular-nums">{MEDIA_AUTHORITY.majorMedias}</p></div>
            <div><p className="type-micro uppercase tracking-[0.08em]">Articles</p><p className="mt-1 type-h2 tabular-nums">{MEDIA_AUTHORITY.articles}</p></div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {MEDIA_AUTHORITY.bigNames.map((n) => (
              <span key={n} className="inline-flex items-center rounded-lg border border-[var(--border-subtle)] px-2 py-1 type-caption font-medium">{n}</span>
            ))}
          </div>
        </section>

        {/* Position benchmark */}
        <section className="flex flex-col gap-4 rounded-2xl border border-[var(--border-subtle)] p-7">
          <h2 className="type-h2">Position benchmark</h2>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-warning-bg)] text-[var(--color-warning)]"><Trophy className="h-5 w-5" /></span>
            <span className="type-display tabular-nums">{MEDIA_AUTHORITY.rank}<span className="type-h3 text-[var(--text-muted)]"> / {MEDIA_AUTHORITY.rankTotal}</span></span>
          </div>
          <InfoNote>8 points sous Pennylane. Cible top 2 atteignable avec 3 émissions business + 2 tribunes d&apos;expert d&apos;ici 6 mois.</InfoNote>
        </section>
      </div>

      {/* Benchmark concurrents (pleine largeur) */}
      <section className="flex flex-col gap-3 rounded-2xl border border-[var(--border-subtle)] p-7">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="type-h2">Benchmark concurrents</h2>
          <span className="type-micro">Données 12 mois</span>
        </div>
        <TableWide<MediaBenchRow>
            columns={[
              { key: "company", header: "Entreprise", width: 160, flex: true, render: (r) => <span className={`type-label ${r.isYou ? "font-semibold text-[var(--accent-primary)]" : "font-medium text-[var(--text-primary)]"}`}>{r.company}</span> },
              { key: "backlinks", header: "Backlinks", width: 110, render: (r) => <span className="block type-label tabular-nums text-[var(--text-primary)]">{r.backlinks.toLocaleString("fr-FR")}</span> },
              { key: "medias", header: "Médias", width: 90, render: (r) => <span className="block type-label tabular-nums text-[var(--text-primary)]">{r.medias}</span> },
              { key: "presence", header: "Présence principale", width: 240, flex: true, render: (r) => <span className="block truncate type-label" title={r.presence}>{r.presence}</span> },
              { key: "score", header: "Score", width: 90, render: (r) => <span className="inline-flex items-center rounded-full px-2 py-0.5 type-caption font-semibold tabular-nums" style={{ color: r.score >= 75 ? "var(--color-success)" : "var(--color-warning)", backgroundColor: r.score >= 75 ? "var(--color-success-bg)" : "var(--color-warning-bg)" }}>{r.score}</span> },
            ]}
            data={MEDIA_BENCHMARK}
            rowKey={(r) => r.company}
            isRowActive={(r) => !!r.isYou}
            minWidth={640}
            bordered
            hidePagination
          />
        </section>

      </>
      )}

      {netTab === "opportunites" && (
      <>
      {/* ════════════════ Actions popularité — grille 3×3 ════════════════ */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="type-h2">Actions popularité</h2>
            <p className="mt-0.5 type-caption">Leviers netlinking à activer en priorité.</p>
          </div>
          <Link href={`${pathname}?tab=opportunites&cat=netlinking`} className="inline-flex items-center gap-1 type-label transition-colors hover:text-[var(--text-primary)]">
            Toutes les actions
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {netActions.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setSelActionId(a.id)}
              className="group flex flex-col gap-2.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 text-left transition-colors hover:border-[var(--border-medium)] hover:bg-[var(--bg-card-hover)]"
            >
              <div className="flex items-center justify-between gap-2">
                <PriorityBadge level={a.priority} />
                {a.time && <span className="type-caption tabular-nums text-[var(--text-muted)]">{a.time}</span>}
              </div>
              <p className="type-body-strong font-semibold leading-snug">{a.title}</p>
              <p className="line-clamp-2 type-body-sm leading-snug text-[var(--text-muted)]">{a.description}</p>
              <span className="mt-1 inline-flex w-max items-center rounded-full bg-[var(--bg-subtle)] px-2 py-1 type-caption font-medium">Popularité</span>
            </button>
          ))}
        </div>
      </div>

      {/* ════════════════ Opportunités de netlinking (link gap) ════════════════ */}
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="type-h2">Opportunités de netlinking</h2>
          <p className="mt-0.5 type-caption">Sites les plus influents du secteur qui lient vos concurrents — cibles prioritaires.</p>
        </div>
        <TableWide<OppoRow>
          columns={[
            { key: "rank", header: "#", width: 48, render: (_r, i) => <span className="type-label tabular-nums text-[var(--text-primary)]">{i + 1}.</span> },
            { key: "domain", header: "Domaine", width: 240, flex: true, render: (r) => <span className="flex min-w-0 items-center gap-2"><Favicon domain={r.domain} size={16} /><span className="truncate type-label text-[var(--text-primary)]">{r.domain}</span></span> },
            { key: "category", header: "Catégorie", width: 130, render: (r) => <span className="inline-flex items-center rounded-full px-2 py-0.5 type-caption font-medium" style={{ color: OPPO_CAT_COLOR[r.category] ?? "var(--text-secondary)", backgroundColor: `color-mix(in oklab, ${OPPO_CAT_COLOR[r.category] ?? "var(--text-muted)"} 12%, transparent)` }}>{r.category}</span> },
            { key: "authority", header: "Autorité", width: 170, flex: true, sortable: true, sortValue: (r) => r.authority, render: (r) => <div className="flex items-center gap-2"><span className="w-7 type-label font-semibold tabular-nums text-[var(--text-primary)]">{r.authority}</span><span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--bg-subtle)]"><span className="block h-full rounded-full" style={{ width: `${r.authority}%`, backgroundColor: "var(--accent-primary)" }} /></span></div> },
            { key: "competitorsLinked", header: "Concurrents liés", width: 150, render: (r) => <span className="block type-label tabular-nums text-[var(--text-primary)]">{r.competitorsLinked} / 4</span> },
            { key: "youLinked", header: "Vous", width: 120, render: (r) => r.youLinked
                ? <span className="inline-flex items-center rounded-full bg-[var(--color-success-bg)] px-2 py-0.5 type-micro text-[var(--color-success)]">Lié</span>
                : <span className="inline-flex items-center rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 type-micro">À conquérir</span> },
          ]}
          data={NET_OPPORTUNITIES}
          rowKey={(r) => r.domain}
          minWidth={840}
          bordered
          hidePagination
        />
      </div>

      </>
      )}

      {netTab === "benchmark" && (
      <>
      {/* ════════════════ Benchmark concurrents (Majestic / SEObserver) ════════════════ */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="type-h2">Benchmark concurrents</h2>
              <SourcePill source="Majestic" href="https://majestic.com" />
            </div>
            <p className="mt-0.5 type-caption">
              Comparaison TF / CF / Domaines référents
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setCompModalOpen(true)}>
            <PencilSquareIcon className="h-4 w-4" />
            Modifier
          </Button>
        </div>
        <TableWide<BenchmarkRow>
          columns={buildBenchmarkColumns()}
          data={benchRows}
          rowKey={(r) => r.domain}
          isRowActive={(r) => !!r.isYou}
          minWidth={900}
          bordered
          edgePadding="24px"
          hidePagination
        />
      </div>

      {compModalOpen && (
        <NetCompetitorModal rows={benchRows} onChange={setBenchRows} onClose={() => setCompModalOpen(false)} />
      )}

      </>
      )}

      {netTab === "profil" && (
      <>
      {/* ════════════════ 03. Profil des liens (Follow + Texte) ════════════════ */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-[var(--border-subtle)] p-7">
          <h3 className="mb-4 type-h3">Distribution Follow / Nofollow</h3>
          <SegmentedBar
            data={[
              { label: "Follow",   pct: Math.round(FOLLOW_NOFOLLOW.vous.follow),   color: "var(--color-success)" },
              { label: "Nofollow", pct: Math.round(FOLLOW_NOFOLLOW.vous.nofollow), color: "var(--color-warning)" },
            ]}
          />
          <p className="mt-4 type-caption">
            Concurrents (moy.) : <span className="font-medium text-[var(--text-secondary)]">{Math.round(FOLLOW_NOFOLLOW.competitors.follow)}% follow</span> · {Math.round(FOLLOW_NOFOLLOW.competitors.nofollow)}% nofollow
          </p>
        </section>

        <section className="rounded-2xl border border-[var(--border-subtle)] p-7">
          <h3 className="mb-4 type-h3">Distribution Texte / Image</h3>
          <SegmentedBar
            data={[
              { label: "Texte", pct: Math.round(TEXT_IMAGE.vous.texte), color: "var(--accent-primary)" },
              { label: "Image", pct: Math.round(TEXT_IMAGE.vous.image), color: "color-mix(in oklab, var(--accent-primary) 40%, white)" },
            ]}
          />
          <p className="mt-4 type-caption">
            Concurrents (moy.) : <span className="font-medium text-[var(--text-secondary)]">{Math.round(TEXT_IMAGE.competitors.texte)}% texte</span> · {Math.round(TEXT_IMAGE.competitors.image)}% image
          </p>
        </section>
      </div>

      {/* ════════════════ 04. Insights (Profil) ════════════════ */}
      <InfoNote>
        Votre ratio de liens follow est inférieur à la moyenne des concurrents.
      </InfoNote>

      {/* ════════════════ 05. Distribution géographique ════════════════ */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-[var(--border-subtle)] p-7">
          <div className="mb-5 flex items-baseline justify-between">
            <h3 className="type-h3">
              Distribution par pays
            </h3>
            <span className="type-micro">vs 5 concurrents</span>
          </div>
          <div className="divide-y divide-[var(--border-subtle)]">
            {COUNTRIES.map((c) => (
              <GeoRowItem key={c.code + c.label} row={c} max={100} />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border-subtle)] p-7">
          <h3 className="mb-5 type-h3">
            Distribution par langue
          </h3>
          <div className="divide-y divide-[var(--border-subtle)]">
            {LANGUAGES.map((l) => (
              <GeoRowItem key={l.code + l.label} row={l} max={100} />
            ))}
          </div>
        </section>
      </div>

      {/* ════════════════ 06. Insights géographiques ════════════════ */}
      <section className="rounded-2xl border border-[var(--border-subtle)] p-7">
        <h3 className="mb-5 type-h3">
          Insights géographiques
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* Card 1 — Principal pays */}
          <div className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]">
                <MapPin className="h-4 w-4" />
              </div>
              <Flag code="us" size={26} />
            </div>
            <p className="type-micro uppercase tracking-[0.08em]">Pays source #1</p>
            <p className="mt-1 type-h2 leading-tight">États-Unis</p>
            <p className="mt-1 type-caption">
              <span className="font-semibold tabular-nums text-[var(--text-primary)]">83 %</span> des backlinks
            </p>
          </div>

          {/* Card 2 — Langue dominante */}
          <div className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]">
                <Languages className="h-4 w-4" />
              </div>
              <Flag code="fr" size={26} />
            </div>
            <p className="type-micro uppercase tracking-[0.08em]">Langue dominante</p>
            <p className="mt-1 type-h2 leading-tight">Français</p>
            <p className="mt-1 type-caption">
              <span className="font-semibold tabular-nums text-[var(--text-primary)]">57 %</span> du profil
            </p>
          </div>

          {/* Card 3 — Diversité */}
          <div className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]">
                <Network className="h-4 w-4" />
              </div>
              <span className="rounded-full bg-[var(--color-warning-bg)] px-2 py-0.5 type-micro tabular-nums text-[var(--color-warning)]">faible</span>
            </div>
            <p className="type-micro uppercase tracking-[0.08em]">Diversité géo</p>
            <p className="mt-1 type-h2 leading-tight tabular-nums">3 pays</p>
            <p className="mt-1 type-caption">
              sources de backlinks
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════ 08. Topical Trust Flow ════════════════ */}
      <section className="rounded-2xl border border-[var(--border-subtle)] p-7">
        <div className="mb-6">
          <h2 className="type-h2">
            Topical Trust Flow
          </h2>
          <p className="mt-0.5 type-caption">
            Thématiques principales des backlinks
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Vos thématiques */}
          <div>
            <div className="mb-4 flex items-baseline gap-2">
              <h3 className="type-h3">Vos thématiques</h3>
              <span className="rounded-full bg-[var(--bg-secondary)] px-2 py-0.5 type-micro tabular-nums text-[var(--text-secondary)]">
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
              <h3 className="type-h3">Thématiques concurrents</h3>
            </div>
            <div className="flex flex-col gap-2.5">
              {COMP_TOPICS.map((t) => {
                const pct = Math.round((t.count / t.total) * 100);
                return (
                  <div key={t.label} className="grid grid-cols-[1fr_60px_60px] items-center gap-3">
                    <span className="type-caption truncate" title={t.label}>{t.label}</span>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: "var(--accent-primary)" }}
                      />
                    </div>
                    <span className="text-right type-caption font-semibold tabular-nums text-[var(--text-primary)]">
                      {t.count}/{t.total} · {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-[var(--border-subtle)] pt-5">
          <InfoNote>
            <strong className="font-semibold">Thématique non partagée</strong> — vous êtes positionné sur <em>Business/Publishing and Printing</em>, <em>Business/Opportunities</em> +1. Vos concurrents ne sont pas sur ce topic. Vérifiez si c&apos;est un avantage ou un décalage thématique.
          </InfoNote>
          <InfoNote>
            <strong className="font-semibold">Opportunité</strong> — 50 % des concurrents ont des backlinks <em>Computers/Internet/Web Design and Development</em>, 40 % sur <em>Business</em>.
          </InfoNote>
        </div>
      </section>

      {/* ════════════════ 09. Distribution des ancres ════════════════ */}
      <section className="rounded-2xl border border-[var(--border-subtle)] p-7">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="type-h2">
              Distribution des ancres
            </h2>
            <p className="mt-0.5 type-caption">
              Répartition par type d&apos;ancre de backlink
            </p>
          </div>
          <Pill bg="var(--color-danger-bg)" color="var(--color-danger)">
            <ShieldExclamationIcon className="h-3.5 w-3.5" />
            Risque : Élevé
          </Pill>
        </div>

        <AnchorStack marque={ANCHOR_TYPES.marque} generique={ANCHOR_TYPES.generique} autre={ANCHOR_TYPES.autre} />

        <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
          {/* Gauche — score circulaire */}
          <div className="flex flex-col items-center justify-center gap-3 p-6">
            <p className="type-micro uppercase tracking-[0.08em]">Score de distribution</p>
            <ScoreRing score={ANCHOR_SCORE} size={124} strokeWidth={8} />
            <p className="text-center type-micro">Diversité d&apos;ancres faible</p>
          </div>

          {/* Droite — tableau top ancres */}
          <div className="min-w-0">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <h3 className="type-h3">Top ancres</h3>
              <span className="type-micro">
                Total : <span className="font-semibold tabular-nums text-[var(--text-primary)]">{ANCHOR_TOTAL}</span> ancres
              </span>
            </div>
            <TableWide<typeof TOP_ANCHORS[number]>
              columns={[
                { key: "text", header: "Ancre", width: 300, flex: true, render: (a) => <span className="block truncate type-label font-mono text-[var(--text-secondary)]" title={a.text}>{a.text}</span> },
                { key: "count", header: "Occurrences", width: 130, render: (a) => <span className="block text-right type-label font-semibold tabular-nums text-[var(--text-primary)]">{a.count}</span> },
              ]}
              data={TOP_ANCHORS}
              rowKey={(a) => a.text}
              bordered
              hidePagination
            />
          </div>
        </div>
      </section>

      </>
      )}

      {netTab === "backlinks" && (
      <>
      {/* ════════════════ 10. Backlinks ════════════════ */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="type-h2">
              Backlinks
            </h2>
            <p className="mt-0.5 type-caption">
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
          <span className="ml-auto type-micro tabular-nums">
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
                  <span className="type-label text-[var(--text-primary)] truncate">{r.source}</span>
                  <span className="flex-shrink-0 rounded bg-[var(--bg-subtle)] px-1.5 py-0.5 type-micro font-mono text-[var(--text-muted)]">
                    {r.country}
                  </span>
                </div>
              ),
            },
            {
              key: "anchor", header: "Ancre", width: 260, flex: true,
              render: (r) => (
                <span className="type-label font-mono text-[var(--text-secondary)] truncate" title={r.anchor}>
                  {r.anchor}
                </span>
              ),
            },
            {
              key: "tf", header: "TF", width: 60, align: "right", sortable: true, sortValue: (r) => r.tf,
              render: (r) => <span className="type-label font-semibold tabular-nums text-[var(--text-primary)]">{r.tf}</span>,
            },
            {
              key: "cf", header: "CF", width: 60, align: "right", sortable: true, sortValue: (r) => r.cf,
              render: (r) => <span className="type-label tabular-nums text-[var(--text-secondary)]">{r.cf}</span>,
            },
            {
              key: "refDomains", header: "RefDom", width: 80, align: "right", sortable: true, sortValue: (r) => r.refDomains,
              render: (r) => <span className="type-label tabular-nums text-[var(--text-secondary)]">{r.refDomains}</span>,
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

      </>
      )}

      {/* Vraie modale d'action (OpportunityDetail), ouverte en place sur la vue Opportunités */}
      {selAction && (
        <OpportunityDetail
          key={selAction.id}
          o={selAction}
          owner={selAction.id in aOwner ? aOwner[selAction.id] : (selAction.ownerKey ? OWNERS[selAction.ownerKey] : undefined)}
          deadline={selAction.id in aDeadline ? aDeadline[selAction.id] : selAction.deadline}
          status={aStatus[selAction.id] ?? selAction.status}
          checked={aChecked[selAction.id] ?? new Set()}
          narrative={aNarr[selAction.id] ?? ""}
          recurrence={aRec[selAction.id] ?? "none"}
          creator={OWNERS.bl}
          onToggleStep={(i) => setAChecked((p) => { const s = new Set(p[selAction.id] ?? []); if (s.has(i)) s.delete(i); else s.add(i); return { ...p, [selAction.id]: s }; })}
          onStatusChange={(s) => setAStatus((p) => ({ ...p, [selAction.id]: s }))}
          onOwnerChange={(o) => setAOwner((p) => ({ ...p, [selAction.id]: o }))}
          onDeadlineChange={(d) => setADeadline((p) => ({ ...p, [selAction.id]: d }))}
          onNarrativeChange={(v) => setANarr((p) => ({ ...p, [selAction.id]: v }))}
          onRecurrenceChange={(v) => setARec((p) => ({ ...p, [selAction.id]: v }))}
          onBack={() => setSelActionId(null)}
          index={selIdx}
          total={netActions.length}
          onPrev={() => selIdx > 0 && setSelActionId(netActions[selIdx - 1].id)}
          onNext={() => selIdx < netActions.length - 1 && setSelActionId(netActions[selIdx + 1].id)}
        />
      )}

    </div>
  );
}

/* ── Modale « Modifier » : ajout / retrait des concurrents suivis ────────── */
function NetCompetitorModal({
  rows,
  onChange,
  onClose,
}: {
  rows: BenchmarkRow[];
  onChange: (rows: BenchmarkRow[]) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState("");
  const competitors = rows.filter((r) => !r.isYou);

  const remove = (domain: string) => onChange(rows.filter((r) => r.domain !== domain));
  const add = () => {
    const d = draft.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!d || rows.some((r) => r.domain === d)) return;
    // Métriques placeholder — remplacées par la vraie donnée Majestic au crawl.
    onChange([...rows, { domain: d, tf: 0, cf: 0, refDomains: 0, backlinks: 0 }]);
    setDraft("");
  };

  return (
    <ModalShell onClose={onClose} maxWidth={520}>
      <h2 className="pr-10 type-h2">Concurrents suivis</h2>
      <p className="mt-1 type-body-sm">Ajoutez ou retirez les domaines comparés dans le benchmark netlinking.</p>

      <div className="mt-5 flex max-h-[280px] flex-col gap-2 overflow-y-auto">
        {competitors.map((c) => (
          <div key={c.domain} className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] px-3.5 py-2.5">
            <span className="flex-1 truncate type-label font-mono text-[var(--text-primary)]">{c.domain}</span>
            <button
              type="button"
              onClick={() => remove(c.domain)}
              aria-label={`Retirer ${c.domain}`}
              className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--color-danger)]"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
        {competitors.length === 0 && (
          <p className="rounded-xl border border-dashed border-[var(--border-subtle)] px-3.5 py-4 text-center type-body-sm text-[var(--text-muted)]">Aucun concurrent suivi.</p>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") add(); }}
          placeholder="domaine-concurrent.com"
          className={`${fieldCls} flex-1 font-mono`}
        />
        <Button variant="secondary" onClick={add} disabled={!draft.trim()}>
          <PlusIcon className="h-4 w-4" />
          Ajouter
        </Button>
      </div>

      <div className="mt-6 flex items-center justify-end">
        <Button variant="primary" onClick={onClose}>Terminé</Button>
      </div>
    </ModalShell>
  );
}
