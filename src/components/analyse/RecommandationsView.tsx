"use client";

import { useState, useEffect, useRef } from "react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";
import {
  Sparkles as LSparkles,
  Target as LTarget,
  Boxes,
  Download,
  RefreshCw,
  X as LX,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/Button";
import { Tooltip } from "@/components/Tooltip";
import { TableWide, type ColumnDef } from "@/components/TableWide";
import { SearchInput } from "@/components/SearchInput";
import { DropdownMenu, DropdownItem } from "@/components/DropdownMenu";
import { EmptyState } from "@/components/EmptyState";
import { KpiCard } from "@/components/KpiCard";
import { KpiGroup } from "@/components/KpiGroup";
import { KeywordStudyModal } from "@/components/analyse/modals/KeywordStudyModal";
import { NewBriefModal } from "@/components/analyse/modals/NewBriefModal";

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

export function RecommandationsView({
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
            <h1 className="font-semibold leading-none tracking-heading text-[var(--text-primary)]">{title}</h1>
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
                Analyser
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

export function FilterTabTrigger({ active, children }: { active: boolean; children: React.ReactNode }) {
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

export function InfoSvg() {
  return (
    <svg width="12" height="12" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7.5 6.5v4M7.5 4.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function ColHeaderInfo({ label, align, tooltip }: { label: string; align?: "left" | "right"; tooltip: React.ReactNode }) {
  return (
    <Tooltip portal rich side="bottom" label={tooltip}>
      <span className={`inline-flex w-full cursor-help items-center gap-1 text-[12px] font-medium text-[var(--text-muted)] ${align === "right" ? "justify-end" : ""}`}>
        {label}
        <InfoSvg />
      </span>
    </Tooltip>
  );
}

export function KdTip() {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-semibold">Keyword Difficulty</p>
      <p className="opacity-75">Indice de difficulté de positionnement (0 – 100). Plus la valeur est élevée, plus la SERP est concurrentielle.</p>
      <p className="text-[11px] opacity-60">0 – 30 facile · 30 – 60 modéré · 60 – 80 difficile · 80+ très difficile</p>
    </div>
  );
}

export function KeiTip() {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-semibold">Keyword Efficiency Index</p>
      <p className="opacity-75">Ratio opportunité / concurrence : <span className="font-mono">Volume² / Concurrence</span>. Plus le KEI est élevé, meilleur est le rapport gain potentiel vs effort.</p>
      <p className="text-[11px] opacity-60">Permet de prioriser les mots-clés à fort potentiel avec une concurrence accessible.</p>
    </div>
  );
}

export function TfTip() {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-semibold">Trust Flow (Majestic)</p>
      <p className="opacity-75">Score de confiance du profil de backlinks (0 – 100). Mesure la qualité et la fiabilité des sites qui pointent vers le domaine.</p>
      <p className="text-[11px] opacity-60">Plus c'est haut, plus le site est référencé par des sources de confiance.</p>
    </div>
  );
}

export function CfTip() {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-semibold">Citation Flow (Majestic)</p>
      <p className="opacity-75">Score d'influence basé sur le volume de backlinks (0 – 100). Mesure la quantité de liens reçus, indépendamment de leur qualité.</p>
      <p className="text-[11px] opacity-60">Comparé au TF, donne le ratio qualité/quantité du profil.</p>
    </div>
  );
}

export function BasTip() {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-semibold">Backlinks Authority Score</p>
      <p className="opacity-75">Score d'autorité globale du profil de liens externes. Combine fraîcheur, diversité des ancres et qualité des domaines référents.</p>
      <p className="text-[11px] opacity-60">Indicateur synthétique du poids SEO off-site.</p>
    </div>
  );
}

export function RefDomTip() {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-semibold">Domaines référents</p>
      <p className="opacity-75">Nombre de domaines uniques qui pointent au moins un lien vers le site. Métrique clé d'autorité — plus la diversité est large, plus le profil est solide.</p>
      <p className="text-[11px] opacity-60">À comparer au Trust Flow pour évaluer la qualité moyenne par référent.</p>
    </div>
  );
}
