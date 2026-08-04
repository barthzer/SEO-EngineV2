"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, ChevronRightIcon, ArrowUpRightIcon } from "@heroicons/react/24/outline";
import {
  Sparkles as LSparkles,
  Target as LTarget,
  CheckCircle2,
  Download,
  RefreshCw,
  X as LX,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/Button";
import { Tooltip } from "@/components/Tooltip";
import { TableWide, type ColumnDef } from "@/components/TableWide";
import { SearchInput } from "@/components/SearchInput";
import { ColPill } from "@/components/ColPill";
import { FilterTabs } from "@/components/FilterTabs";
import { EmptyState } from "@/components/EmptyState";
import { KpiCard } from "@/components/KpiCard";
import { KpiGroup } from "@/components/KpiGroup";
import { KeywordStudyModal } from "@/components/analyse/modals/KeywordStudyModal";

/* ── Opportunités — modèle unifié (étude de mots-clés + opportunités sémantiques) ── */

type StudyIntent = "Commercial" | "Transactionnel" | "Informationnel";
type StudyPrio = "P0" | "P1" | "P2" | "P3";
type OppType = "etude" | "semantique";
type OppStatus = "en_attente" | "traitee";
type SemUrl = { url: string; pos: number };

type OppRow = {
  id: string;
  keyword: string;
  type: OppType;
  source: "PAA" | "Related" | null;   // sémantique uniquement
  matchedUrls: SemUrl[];              // URLs GSC déjà positionnées (sémantique)
  volume: number;
  kd: number | null;
  kei: number | null;
  score: number | null;
  trafic: number | null;
  position: number | null;
  intent: StudyIntent | null;
  priority: StudyPrio;
  pageCible: string | null;
  status: OppStatus;
};

const mk = (p: Omit<OppRow, "id" | "status" | "matchedUrls"> & { matchedUrls?: SemUrl[] }): OppRow => ({
  id: `${p.type}-${p.keyword}`,
  status: "en_attente",
  matchedUrls: p.matchedUrls ?? [],
  ...p,
});

/* Opportunités issues de l'étude de mots-clés (ex-Recommandations). */
const ETUDE_ROWS: OppRow[] = [
  mk({ keyword: "agence seo paris",         type: "etude", source: null, volume: 5400, kd: 78,   kei: 369114, score: 80, trafic: null, position: 12,   intent: "Commercial",     priority: "P1", pageCible: "/agence-seo-paris/" }),
  mk({ keyword: "audit seo gratuit",        type: "etude", source: null, volume: 4400, kd: 70,   kei: 272676, score: 60, trafic: null, position: 25,   intent: "Transactionnel", priority: "P1", pageCible: "/audit-seo-gratuit/" }),
  mk({ keyword: "agence google ads",        type: "etude", source: null, volume: 3600, kd: 75,   kei: 170526, score: 80, trafic: null, position: 18,   intent: "Commercial",     priority: "P2", pageCible: "/nouvelle-taxe-google-ads/" }),
  mk({ keyword: "agence seo",               type: "etude", source: null, volume: 2100, kd: null, kei: null,   score: 0,  trafic: null, position: null, intent: "Commercial",     priority: "P1", pageCible: null }),
  mk({ keyword: "consultant seo freelance", type: "etude", source: null, volume: 1900, kd: 65,   kei: 54697,  score: 80, trafic: null, position: 15,   intent: "Commercial",     priority: "P1", pageCible: "/consultant-seo-freelance/" }),
  mk({ keyword: "consultant seo paris",     type: "etude", source: null, volume: 1900, kd: null, kei: null,   score: 0,  trafic: null, position: null, intent: "Commercial",     priority: "P1", pageCible: null }),
  mk({ keyword: "audit seo technique",      type: "etude", source: null, volume: 1000, kd: null, kei: null,   score: 0,  trafic: null, position: null, intent: "Commercial",     priority: "P1", pageCible: null }),
  mk({ keyword: "prix audit seo",           type: "etude", source: null, volume: 720,  kd: null, kei: null,   score: 0,  trafic: null, position: null, intent: "Transactionnel", priority: "P1", pageCible: null }),
  mk({ keyword: "devis audit seo",          type: "etude", source: null, volume: 210,  kd: null, kei: null,   score: 0,  trafic: null, position: null, intent: "Transactionnel", priority: "P1", pageCible: null }),
];

/* Opportunités sémantiques (rapatriées de l'ex-Univers sémantique — lignes « opportunité »). */
const SEM_ROWS: OppRow[] = [
  mk({ keyword: "seo pour saas b2b",         type: "semantique", source: "PAA",     volume: 880, kd: null, kei: null, score: 34, trafic: null, position: null, intent: "Informationnel", priority: "P2", pageCible: null, matchedUrls: [{ url: "/agence-marketing-digital-b2b/", pos: 12 }] }),
  mk({ keyword: "cocon sémantique exemple",  type: "semantique", source: "Related", volume: 720, kd: null, kei: null, score: 41, trafic: null, position: null, intent: "Informationnel", priority: "P2", pageCible: null, matchedUrls: [{ url: "/blog/cocon-semantique/", pos: 18 }, { url: "/blog/maillage-interne/", pos: 34 }] }),
  mk({ keyword: "netlinking prix 2026",      type: "semantique", source: "PAA",     volume: 590, kd: null, kei: null, score: 28, trafic: null, position: null, intent: "Transactionnel", priority: "P1", pageCible: null }),
  mk({ keyword: "agence geo chatgpt",        type: "semantique", source: "Related", volume: 480, kd: null, kei: null, score: 22, trafic: null, position: null, intent: "Commercial",     priority: "P1", pageCible: null, matchedUrls: [{ url: "/agence-ia/", pos: 9 }] }),
  mk({ keyword: "structured data seo",       type: "semantique", source: "PAA",     volume: 390, kd: null, kei: null, score: 55, trafic: null, position: null, intent: "Informationnel", priority: "P3", pageCible: null, matchedUrls: [{ url: "/blog/schema-org/", pos: 6 }] }),
  mk({ keyword: "eeat google 2026",          type: "semantique", source: "Related", volume: 320, kd: null, kei: null, score: 38, trafic: null, position: null, intent: "Informationnel", priority: "P2", pageCible: null }),
];

const INITIAL_ROWS: OppRow[] = [...ETUDE_ROWS, ...SEM_ROWS];

const EXTRA_ROWS: OppRow[] = [
  mk({ keyword: "agence seo lyon",   type: "etude",      source: null,      volume: 1600, kd: 66, kei: 24242, score: 70, trafic: null, position: null, intent: "Commercial",     priority: "P2", pageCible: null }),
  mk({ keyword: "tarif agence seo",  type: "etude",      source: null,      volume: 590,  kd: null, kei: null, score: 0,  trafic: null, position: null, intent: "Transactionnel", priority: "P1", pageCible: null }),
  mk({ keyword: "geo perplexity",    type: "semantique", source: "Related", volume: 260,  kd: null, kei: null, score: 24, trafic: null, position: null, intent: "Informationnel", priority: "P2", pageCible: null }),
];

const TYPE_CFG: Record<OppType, { label: string; color: string }> = {
  etude:      { label: "Étude",      color: "var(--accent-primary)" },
  semantique: { label: "Sémantique", color: "#A855F7" },
};

const SOURCE_CFG: Record<"PAA" | "Related", { label: string; color: string }> = {
  PAA:     { label: "PAA",     color: "#A855F7" },
  Related: { label: "Related", color: "var(--accent-primary)" },
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

/** Contenu de tooltip détaillé (titre + explication) — réutilisé sur Type/Source/Intent. */
function Tip({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="font-semibold">{title}</p>
      <p className="opacity-75">{desc}</p>
    </div>
  );
}

const TYPE_TIP: Record<OppType, { title: string; desc: string }> = {
  etude:      { title: "Opportunité d'étude", desc: "Mot-clé issu de l'étude concurrentielle (Semrush) — page manquante ou sous-optimisée face à la SERP." },
  semantique: { title: "Opportunité sémantique", desc: "Détectée via l'analyse sémantique (PAA / recherches associées) — thématique proche non encore couverte." },
};

const SOURCE_TIP: Record<"PAA" | "Related", { title: string; desc: string }> = {
  PAA:     { title: "People Also Ask", desc: "Questions « Autres questions posées » affichées par Google — fort signal d'intention informationnelle." },
  Related: { title: "Recherches associées", desc: "Requêtes proches suggérées par Google en bas de SERP — élargissent la couverture d'un cluster." },
};

const INTENT_TIP: Record<StudyIntent, { title: string; desc: string }> = {
  Commercial:     { title: "Intention commerciale", desc: "L'internaute compare des solutions ou prestataires avant de décider (ex. « meilleure agence seo »)." },
  Transactionnel: { title: "Intention transactionnelle", desc: "Proche de l'achat : demande de devis, tarif, prise de contact (ex. « prix audit seo »)." },
  Informationnel: { title: "Intention informationnelle", desc: "Recherche d'information, pas d'achat immédiat — idéal pour du contenu éducatif / TOFU." },
};

const LOADING_STEPS = [
  "Lecture du fichier Semrush",
  "Identification des concurrents",
  "Détection des clusters sémantiques",
  "Calcul des opportunités",
  "Génération du rapport",
];

/* ── Vue Opportunités ────────────────────────────────────────────────── */

export function RecommandationsView({
  title,
  subtitle,
  onOpenPageByUrl,
  onGoToCreation,
}: {
  title?: string;
  subtitle?: string;
  onOpenPageByUrl?: (url: string) => void;
  /** Ouvre la page « Création de contenus » (config du contenu généré). */
  onGoToCreation?: () => void;
} = {}) {
  const router = useRouter();
  const [studyOpen, setStudyOpen] = useState(false);
  const [studyState, setStudyState] = useState<"empty" | "loading" | "done">("done");
  const [loadingStep, setLoadingStep] = useState(0);
  const [rows, setRows] = useState<OppRow[]>(INITIAL_ROWS);
  const [tab, setTab] = useState<"en_attente" | "traitee">("en_attente");
  /* Filters & search */
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<"all" | StudyPrio>("all");
  const [filterType, setFilterType] = useState<"all" | OppType>("all");
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
    timersRef.current.push(setTimeout(() => {
      setStudyState("done");
      setRows((prev) => {
        const have = new Set(prev.map((r) => r.id));
        const found = EXTRA_ROWS.filter((r) => !have.has(r.id));
        return [...found, ...prev];
      });
    }, acc + 250));
  }

  /* Générer → redirige vers la page « Configuration du contenu » (nouvelle page, sans
     template pré-sélectionné), sujet pré-rempli avec le mot-clé de l'opportunité. */
  function goGenerate(r: OppRow) {
    router.push(`/templates/configurer/sans-template?subject=${encodeURIComponent(r.keyword)}`);
  }

  const pending = rows.filter((r) => r.status === "en_attente");
  const done = rows.filter((r) => r.status === "traitee");

  /* KPIs */
  const actionnables = pending.filter((r) => r.priority === "P1" || r.priority === "P2").length;

  /* Filtered rows for the active tab */
  const base = tab === "en_attente" ? pending : done;
  const filteredRows = base.filter((r) => {
    if (search && !r.keyword.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterPriority !== "all" && r.priority !== filterPriority) return false;
    if (filterType !== "all" && r.type !== filterType) return false;
    return true;
  });

  /* Colonnes communes (unifiées) */
  const baseCols: ColumnDef<OppRow>[] = [
    { key: "keyword", header: "Mot-clé", width: 220, flex: true,
      render: (r) => <span className="block truncate text-[13px] text-[var(--text-primary)]" title={r.keyword}>{r.keyword}</span> },
    { key: "type", header: "Type", width: 116,
      render: (r) => {
        const cfg = TYPE_CFG[r.type];
        return (
          <Tooltip portal rich side="top" label={<Tip {...TYPE_TIP[r.type]} />}>
            <span className="inline-flex cursor-default items-center gap-1.5 rounded-full bg-[var(--bg-subtle)] px-2.5 py-1 text-[12px] font-medium text-[var(--text-secondary)]">
              <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: cfg.color }} />
              {cfg.label}
            </span>
          </Tooltip>
        );
      } },
    { key: "source", header: "Source", width: 90,
      render: (r) => r.source
        ? <Tooltip portal rich side="top" label={<Tip {...SOURCE_TIP[r.source]} />}><span className="inline-flex cursor-default items-center rounded-md px-2 py-1 text-[12px] font-medium" style={{ color: SOURCE_CFG[r.source].color, backgroundColor: `color-mix(in oklab, ${SOURCE_CFG[r.source].color} 12%, transparent)` }}>{SOURCE_CFG[r.source].label}</span></Tooltip>
        : <span className="text-[13px] text-[var(--text-muted)]">—</span> },
    { key: "volume", header: "Volume", width: 90, align: "right", sortable: true, sortValue: (r) => r.volume,
      render: (r) => <span className="text-[13px] tabular-nums text-[var(--text-secondary)]">{r.volume.toLocaleString("fr-FR")}</span> },
    { key: "kd", header: <ColHeaderInfo label="KD" align="right" tooltip={<KdTip />} />, width: 70, align: "right", sortable: true, sortValue: (r) => r.kd ?? -1,
      render: (r) => r.kd != null ? <span className="text-[13px] tabular-nums text-[var(--text-secondary)]">{r.kd}</span> : <span className="text-[13px] text-[var(--text-muted)]">—</span> },
    { key: "kei", header: <ColHeaderInfo label="KEI" align="right" tooltip={<KeiTip />} />, width: 100, align: "right", sortable: true, sortValue: (r) => r.kei ?? -1,
      render: (r) => r.kei != null ? <span className="text-[13px] tabular-nums text-[var(--text-secondary)]">{r.kei.toLocaleString("fr-FR")}</span> : <span className="text-[13px] text-[var(--text-muted)]">—</span> },
    { key: "score", header: "Score", width: 64, align: "right", sortable: true, sortValue: (r) => r.score ?? -1,
      render: (r) => {
        if (r.score == null || r.score === 0) return <span className="text-[13px] text-[var(--text-muted)]">—</span>;
        const color = r.score >= 75 ? "var(--color-success)" : r.score >= 60 ? "var(--color-warning)" : "var(--color-danger)";
        return <span className="text-[13px] font-semibold tabular-nums" style={{ color }}>{r.score}</span>;
      } },
    { key: "trafic", header: "Trafic est.", width: 88, align: "right", sortable: true, sortValue: (r) => r.trafic ?? -1,
      render: (r) => r.trafic != null ? <span className="text-[13px] tabular-nums text-[var(--text-secondary)]">{r.trafic}</span> : <span className="text-[13px] text-[var(--text-muted)]">—</span> },
    { key: "position", header: "Position", width: 72, align: "right", sortable: true, sortValue: (r) => r.position ?? 9999,
      render: (r) => r.position != null ? <span className="text-[13px] font-semibold tabular-nums text-[var(--text-primary)]">#{r.position}</span> : <span className="text-[13px] text-[var(--text-muted)]">—</span> },
    { key: "intent", header: "Intent", width: 88,
      render: (r) => r.intent
        ? <Tooltip portal rich side="top" label={<Tip {...INTENT_TIP[r.intent]} />}><span className="inline-flex cursor-default items-center rounded-md px-2 py-1 text-[12px] font-medium" style={{ color: INTENT_CFG[r.intent].color, backgroundColor: INTENT_CFG[r.intent].bg }}>{INTENT_CFG[r.intent].label}</span></Tooltip>
        : <span className="text-[13px] text-[var(--text-muted)]">—</span> },
    { key: "priority", header: "Priorité", width: 80,
      render: (r) => <span className="inline-flex items-center rounded-md px-2 py-1 text-[12px] font-medium" style={{ color: PRIO_CFG[r.priority].color, backgroundColor: PRIO_CFG[r.priority].bg }}>{r.priority}</span> },
    { key: "matched", header: "URL(s) matchée(s)", width: 220,
      render: (r) => r.matchedUrls.length > 0
        ? (
          <span className="flex min-w-0 flex-col gap-0.5">
            {r.matchedUrls.slice(0, 2).map((u) => (
              <button key={u.url} type="button" onClick={(e) => { e.stopPropagation(); onOpenPageByUrl?.(u.url); }}
                className="inline-flex min-w-0 items-center gap-1.5 text-left">
                <span className="truncate font-mono text-[12px] text-[var(--text-secondary)] underline decoration-[var(--border-medium)] decoration-1 underline-offset-[3px] hover:text-[var(--text-primary)]">{u.url}</span>
                <span className="flex-shrink-0 rounded bg-[var(--bg-subtle)] px-1 text-[11px] tabular-nums text-[var(--text-muted)]">#{u.pos}</span>
              </button>
            ))}
          </span>
        )
        : <span className="text-[13px] text-[var(--text-muted)]">—</span> },
    { key: "pageCible", header: "Page cible", width: 220,
      render: (r) => r.pageCible
        ? (
          <button type="button" onClick={(e) => { e.stopPropagation(); onOpenPageByUrl?.(r.pageCible!); }}
            className="inline-flex max-w-full min-w-0 items-center rounded-md px-1 py-0.5 -mx-1 transition-colors hover:bg-[var(--bg-subtle)]">
            <span className="truncate font-mono text-[12px] text-[var(--text-secondary)] underline decoration-[var(--border-medium)] decoration-1 underline-offset-[3px] hover:text-[var(--text-primary)]">{r.pageCible}</span>
          </button>
        )
        : <span className="text-[13px] text-[var(--text-muted)]">—</span> },
  ];

  /* Action épinglée à droite, révélée au survol (comme le chevron du tableau URLs). */
  const trailingAction = (r: OppRow) =>
    tab === "en_attente" ? (
      <Button size="sm" onClick={(e) => { e.stopPropagation(); goGenerate(r); }}>
        Générer
        <ChevronRightIcon className="h-3.5 w-3.5" />
      </Button>
    ) : (
      <span className="flex items-center justify-end gap-2">
        <span className="type-caption text-[var(--text-muted)]">Nouvelle page</span>
        <button type="button"
          onClick={(e) => { e.stopPropagation(); onGoToCreation?.(); }}
          className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-2.5 py-1 type-caption font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-medium)] hover:text-[var(--text-primary)]">
          Voir le brief
          <ArrowUpRightIcon className="h-3 w-3" />
        </button>
      </span>
    );

  const columns = baseCols;

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          {title && <h1 className="type-h1 leading-none">{title}</h1>}
          {subtitle && <p className="mt-1 type-body-sm">{subtitle}</p>}
        </div>
        {studyState === "done" && (
          <div className="flex flex-shrink-0 items-center gap-2">
            <Button variant="secondary"><Download className="h-4 w-4" />Exporter</Button>
            <Button variant="secondary" onClick={startStudy}><RefreshCw className="h-4 w-4" />Relancer l&apos;étude</Button>
          </div>
        )}
      </div>

      {/* State : empty */}
      {studyState === "empty" && (
        <div className="rounded-2xl bg-[var(--bg-card)]">
          <EmptyState
            icon={<LSparkles className="h-7 w-7" />}
            title="Aucune opportunité"
            description="Lancez une étude pour identifier les mots-clés et opportunités face à vos concurrents."
            action={<Button onClick={() => setStudyOpen(true)}><LSparkles className="h-4 w-4" />Lancer une étude de mots-clés</Button>}
          />
        </div>
      )}

      {/* State : loading */}
      {studyState === "loading" && (
        <div className="rounded-2xl bg-[var(--bg-card)] p-10">
          <div className="mx-auto flex max-w-[420px] flex-col items-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-primary-soft)]">
              <Loader2 className="h-7 w-7 animate-spin text-[var(--accent-primary)]" />
            </div>
            <p className="type-h2">Étude en cours…</p>
            <p className="mt-1 type-body-sm">Import des données et croisement avec les concurrents.</p>
            <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
              <div className="h-full rounded-full bg-[var(--accent-primary)] transition-all duration-500 ease-out" style={{ width: `${(loadingStep / LOADING_STEPS.length) * 100}%` }} />
            </div>
            <ul className="mt-5 w-full space-y-2.5">
              {LOADING_STEPS.map((step, i) => {
                const d = i < loadingStep, a = i === loadingStep;
                return (
                  <li key={step} className="flex items-center gap-2.5 text-[13px]">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: d ? "var(--accent-primary)" : a ? "var(--accent-primary-soft)" : "var(--bg-subtle)", color: d ? "white" : "var(--accent-primary)" }}>
                      {d ? <CheckIcon className="h-3 w-3" strokeWidth={3} /> : a ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                    </span>
                    <span className={d || a ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}>{step}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* State : done */}
      {studyState === "done" && (
        <>
          <KpiGroup columns={3}>
            <KpiCard bare icon={LSparkles}   label="En attente"    value={pending.length.toString()} sub="opportunités à traiter" />
            <KpiCard bare icon={LTarget}     label="Actionnables"  value={actionnables.toString()} sub="P1 + P2 en attente" />
            <KpiCard bare icon={CheckCircle2} label="Traitées"     value={done.length.toString()} sub="briefs générés" />
          </KpiGroup>

          {/* Onglets En attente / Traitées, puis la toolbar (recherche + filtres) en dessous */}
          <div className="flex flex-col gap-3">
            <FilterTabs<"en_attente" | "traitee">
              tabs={[
                { key: "en_attente", label: "En attente", count: pending.length },
                { key: "traitee",    label: "Traitées",   count: done.length },
              ]}
              value={tab}
              onChange={setTab}
            />
            <div className="flex flex-wrap items-center gap-3">
              <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un mot-clé…" alwaysExpanded />
              <ColPill name="type" label={filterType === "all" ? "Tous les types" : TYPE_CFG[filterType].label} active={filterType !== "all"} value={filterType} onChange={(v) => setFilterType(v as "all" | OppType)}
                items={[{ value: "all", label: "Tous les types" }, { value: "etude", label: "Étude" }, { value: "semantique", label: "Sémantique" }]} />
              <ColPill name="priorité" label={filterPriority === "all" ? "Toutes les priorités" : `Priorité ${filterPriority}`} active={filterPriority !== "all"} value={filterPriority} onChange={(v) => setFilterPriority(v as "all" | StudyPrio)}
                items={[{ value: "all", label: "Toutes les priorités" }, { value: "P1", label: "P1" }, { value: "P2", label: "P2" }, { value: "P3", label: "P3" }]} />
              {(search || filterPriority !== "all" || filterType !== "all") && (
                <button onClick={() => { setSearch(""); setFilterPriority("all"); setFilterType("all"); }} className="flex items-center gap-1 text-[12px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
                  <LX className="h-3 w-3" />Réinitialiser
                </button>
              )}
            </div>
          </div>

          <TableWide<OppRow>
            columns={columns}
            data={filteredRows}
            rowKey={(r) => r.id}
            emptyState={tab === "en_attente" ? "Aucune opportunité en attente." : "Aucune opportunité traitée pour l'instant."}
            minWidth={1560}
            pageSize={25}
            stickyLeft
            bordered
            trailingAction={trailingAction}
            trailingActionWidth={tab === "en_attente" ? 150 : 230}
          />
        </>
      )}

      {studyOpen && <KeywordStudyModal onClose={() => setStudyOpen(false)} onLaunch={startStudy} />}
    </div>
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
      <p className="text-[11px] opacity-60">Plus c&apos;est haut, plus le site est référencé par des sources de confiance.</p>
    </div>
  );
}

export function CfTip() {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-semibold">Citation Flow (Majestic)</p>
      <p className="opacity-75">Score d&apos;influence basé sur le volume de backlinks (0 – 100). Mesure la quantité de liens reçus, indépendamment de leur qualité.</p>
      <p className="text-[11px] opacity-60">Comparé au TF, donne le ratio qualité/quantité du profil.</p>
    </div>
  );
}

export function BasTip() {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-semibold">Backlinks Authority Score</p>
      <p className="opacity-75">Score d&apos;autorité globale du profil de liens externes. Combine fraîcheur, diversité des ancres et qualité des domaines référents.</p>
      <p className="text-[11px] opacity-60">Indicateur synthétique du poids SEO off-site.</p>
    </div>
  );
}

export function RefDomTip() {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-semibold">Domaines référents</p>
      <p className="opacity-75">Nombre de domaines uniques qui pointent au moins un lien vers le site. Métrique clé d&apos;autorité — plus la diversité est large, plus le profil est solide.</p>
      <p className="text-[11px] opacity-60">À comparer au Trust Flow pour évaluer la qualité moyenne par référent.</p>
    </div>
  );
}
