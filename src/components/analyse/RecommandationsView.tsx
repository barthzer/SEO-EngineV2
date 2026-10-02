"use client";

/**
 * Opportunités — vue regroupée par sujet.
 *
 * Une ligne = une opportunité (groupe de mots-clés de même sujet, issu de l'étude).
 * Le détail mot-clé par mot-clé s'affiche en dépliant la ligne. La recherche
 * fouille aussi les mots-clés des groupes et ouvre ceux qui correspondent.
 *
 * - Priorité calculée (back) : gain × difficulté × distance à la page 1,
 *   + bonus des « offres prioritaires » du projet. Affichée comme sur Actions.
 * - Classification Conquête / Consolidation (ex-P1/P2, qui n'étaient pas une priorité).
 * - Opportunités sans difficulté mesurée : bloc replié en bas, jamais en tête de liste.
 * - Statut (En attente / Traitée / Ignorée) : filtre multi-sélection comme Actions.
 */

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, ChevronRightIcon, ChevronDownIcon, ArrowUpRightIcon, PlusIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { Sparkles as LSparkles, Download, RefreshCw, Loader2, Layers, TrendingUp, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/Button";
import { Tooltip } from "@/components/Tooltip";
import { TableWide, type ColumnDef } from "@/components/TableWide";
import { SearchInput } from "@/components/SearchInput";
import { ColPill } from "@/components/ColPill";
import { ResetFiltersButton } from "@/components/ResetFiltersButton";
import { DropdownMenu, DropdownHeader, DropdownItem } from "@/components/DropdownMenu";
import { EmptyState } from "@/components/EmptyState";
import { KpiCard } from "@/components/KpiCard";
import { KpiGroup } from "@/components/KpiGroup";
import { Pill } from "@/components/Pill";
import { PriorityBadge, PRIORITY_LEVELS, type ActionPriorityLevel } from "@/components/PriorityBars";
import { useToast } from "@/context/ToastContext";
import { KeywordStudyModal } from "@/components/analyse/modals/KeywordStudyModal";
import {
  type OppGroup,
  type OppKeyword,
  type OppStatus,
  type OppClassification,
  type StudyIntent,
  OPP_GROUPS,
  EXTRA_GROUPS,
} from "@/data/opportunities";

/* ── Config de présentation (la donnée est dans src/data/opportunities.ts) ── */

const CLASSIF_ORDER: OppClassification[] = ["conquete", "consolidation"];
const CLASSIF_CFG: Record<OppClassification, { label: string; color: string; bg: string; tip: string }> = {
  conquete: {
    label: "Conquête",
    color: "var(--accent-primary)",
    bg: "var(--accent-primary-soft)",
    tip: "Le site n'est pas encore positionné sur cette opportunité : il faut gagner des positions, souvent avec une nouvelle page.",
  },
  consolidation: {
    label: "Consolidation",
    color: "#0D9488",
    bg: "rgba(13,148,136,0.10)",
    tip: "Le site est déjà positionné : il faut renforcer la page existante pour atteindre la première page.",
  },
};

const STATUS_ORDER: OppStatus[] = ["en_attente", "traitee", "ignoree"];
const STATUS_CFG: Record<OppStatus, { label: string; color: string }> = {
  en_attente: { label: "En attente", color: "var(--color-warning)" },
  traitee:    { label: "Traitée",    color: "var(--color-success)" },
  ignoree:    { label: "Ignorée",    color: "var(--text-muted)" },
};
const DEFAULT_STATUSES: OppStatus[] = ["en_attente"];

const PRIORITY_ORDER: ActionPriorityLevel[] = ["high", "mid", "low"];
const PRIO_RANK: Record<ActionPriorityLevel, number> = { high: 3, mid: 2, low: 1 };

const INTENT_CFG: Record<StudyIntent, { color: string; bg: string }> = {
  Commercial:     { color: "#0891B2", bg: "rgba(6,182,212,0.12)" },
  Transactionnel: { color: "#9333EA", bg: "rgba(168,85,247,0.10)" },
  Informationnel: { color: "#6B7280", bg: "rgba(107,114,128,0.10)" },
};

function diffLevel(d: number): { label: string; color: string; bg: string } {
  if (d <= 30) return { label: "Facile", color: "var(--color-success)", bg: "var(--color-success-bg)" };
  if (d <= 60) return { label: "Moyenne", color: "#B45309", bg: "var(--color-warning-bg)" };
  return { label: "Difficile", color: "var(--color-danger)", bg: "var(--color-danger-bg)" };
}

/** Pill colorée de colonne — même gabarit que le badge de priorité (Actions). */
function ColorPill({ color, bg, children }: { color: string; bg: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-1 type-caption font-medium" style={{ color, backgroundColor: bg }}>
      {children}
    </span>
  );
}

/** Quick win : proche de la page 1 (positions 8 à 20) et difficulté accessible. */
function isQuickWin(g: OppGroup) {
  return (
    g.status === "en_attente" &&
    g.difficulty != null && g.difficulty <= 45 &&
    g.bestPosition != null && g.bestPosition >= 8 && g.bestPosition <= 20
  );
}

const LOADING_STEPS = [
  "Lecture du fichier Semrush",
  "Croisement avec la Search Console",
  "Regroupement des mots-clés en opportunités",
  "Calcul du gain et de la priorité",
  "Génération du rapport",
];

/** Contenu de tooltip détaillé (titre + explication). */
function Tip({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="font-semibold">{title}</p>
      <p className="opacity-75">{desc}</p>
    </div>
  );
}

/* ── Petits composants de cellule ─────────────────────────────────────── */

function ClassifTag({ c }: { c: OppClassification }) {
  const cfg = CLASSIF_CFG[c];
  return (
    <Tooltip portal rich side="top" label={<Tip title={cfg.label} desc={cfg.tip} />}>
      <span className="inline-flex cursor-default">
        <ColorPill color={cfg.color} bg={cfg.bg}>{cfg.label}</ColorPill>
      </span>
    </Tooltip>
  );
}

function StatusDropdown({ status, onChange }: { status: OppStatus; onChange: (s: OppStatus) => void }) {
  const cfg = STATUS_CFG[status];
  return (
    <span className="inline-flex" onClick={(e) => e.stopPropagation()}>
      <DropdownMenu
        width={180}
        trigger={
          <button type="button" className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] px-2.5 py-1 type-caption text-[var(--text-primary)] transition-colors hover:border-[var(--border-medium)]">
            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: cfg.color }} />
            {cfg.label}
            <ChevronDownIcon className="h-3 w-3 text-[var(--text-muted)]" />
          </button>
        }
      >
        {STATUS_ORDER.map((s) => (
          <DropdownItem key={s} selected={s === status} onClick={() => onChange(s)}>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: STATUS_CFG[s].color }} />
              {STATUS_CFG[s].label}
            </span>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </span>
  );
}

/** Texte coupé sur une ligne ; tooltip avec le texte complet au survol, seulement s'il est coupé. */
export function TruncatedText({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [cut, setCut] = useState(false);
  // Re-mesure à chaque bascule : l'enveloppe du tooltip remonte le <span>.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCut(el.scrollWidth > el.clientWidth + 1));
    ro.observe(el);
    return () => ro.disconnect();
  }, [cut]);
  return (
    <Tooltip portal side="top" label={text} disabled={!cut} className="w-full min-w-0">
      <span ref={ref} className={`block min-w-0 truncate ${className}`}>{text}</span>
    </Tooltip>
  );
}

/** Détail mot-clé par mot-clé (ligne dépliée) : vrai tableau imbriqué (TableWide),
 *  mêmes hauteurs de ligne et en-têtes que le tableau des opportunités. Scroll horizontal
 *  propre au détail, colonne Mot-clé sticky. */
function KeywordDetail({ g, query, onOpenUrl }: { g: OppGroup; query: string; onOpenUrl?: (url: string) => void }) {
  const rows: OppKeyword[] = [...g.keywords].sort((a, b) => Number(!!b.main) - Number(!!a.main) || b.volume - a.volume);
  // Même logique que la ligne groupée : valeur (volume) → effort (difficulté) → distance (position) → page → contexte.
  const columns: ColumnDef<OppKeyword>[] = [
    {
      key: "keyword", header: "Mot-clé", width: 240, flex: true, maxWidth: 360,
      render: (k) => {
        const hit = !!query && k.keyword.toLowerCase().includes(query);
        return (
          <span className="flex min-w-0 items-center gap-2">
            <span className="min-w-0 flex-1">
              <TruncatedText text={k.keyword} className={`type-label text-[var(--text-primary)] ${hit ? "font-semibold" : ""}`} />
            </span>
            {k.main && (
              <span className="flex-shrink-0 rounded-full border border-[var(--border-subtle)] px-1.5 py-0.5 type-micro text-[var(--text-secondary)]">Principal</span>
            )}
          </span>
        );
      },
    },
    {
      key: "volume", header: "Volume", width: 100, sortable: true, sortValue: (k) => k.volume,
      render: (k) => (
        <span className="inline-flex items-center rounded-full bg-[var(--bg-subtle)] px-2 py-1 type-caption font-medium tabular-nums text-[var(--text-primary)]">
          {k.volume.toLocaleString("fr-FR")}
        </span>
      ),
    },
    {
      key: "kd", header: "Difficulté", width: 130, sortable: true, sortValue: (k) => k.kd ?? -1,
      render: (k) => k.kd != null ? (
        <ColorPill color={diffLevel(k.kd).color} bg={diffLevel(k.kd).bg}>
          {diffLevel(k.kd).label}
          <span className="tabular-nums opacity-70">{k.kd}</span>
        </ColorPill>
      ) : (
        <span className="type-caption text-[var(--text-muted)]">À mesurer</span>
      ),
    },
    {
      key: "position", header: "Position", width: 100, sortable: true, sortValue: (k) => k.position ?? 999,
      render: (k) => k.position != null
        ? <span className="type-label tabular-nums text-[var(--text-primary)]">#{k.position}</span>
        : <span className="type-caption text-[var(--text-muted)]">Hors top 100</span>,
    },
    {
      key: "url", header: "URL qui ranke", width: 220,
      render: (k) => k.url ? (
        <button type="button" onClick={() => onOpenUrl?.(k.url!)} className="block max-w-full truncate text-left font-mono text-[12px] text-[var(--text-secondary)] underline decoration-[var(--border-medium)] decoration-1 underline-offset-[3px] hover:text-[var(--text-primary)]">
          {k.url}
        </button>
      ) : (
        <span className="type-caption text-[var(--text-muted)]">Aucune</span>
      ),
    },
    {
      key: "intent", header: "Intention", width: 140,
      render: (k) => k.intent
        ? <ColorPill color={INTENT_CFG[k.intent].color} bg={INTENT_CFG[k.intent].bg}>{k.intent}</ColorPill>
        : <span className="type-caption text-[var(--text-muted)]">Non définie</span>,
    },
  ];
  return (
    <div className="py-3 pr-4" style={{ paddingLeft: "calc(var(--page-px) + 26px)" }}>
      <TableWide<OppKeyword>
        columns={columns}
        data={rows}
        rowKey={(k) => k.keyword}
        stickyLeft
        stickyHeader={false}
        bordered
        hidePagination
        edgePadding="16px"
        minWidth={980}
      />
    </div>
  );
}

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
  const { show: showToast } = useToast();
  const [studyOpen, setStudyOpen] = useState(false);
  const [studyState, setStudyState] = useState<"empty" | "loading" | "done">("done");
  const [loadingStep, setLoadingStep] = useState(0);
  const [groups, setGroups] = useState<OppGroup[]>(OPP_GROUPS);

  /* Filtres */
  const [search, setSearch] = useState("");
  const [activeStatuses, setActiveStatuses] = useState<Set<OppStatus>>(() => new Set(DEFAULT_STATUSES));
  const [activeClassif, setActiveClassif] = useState<Set<OppClassification>>(new Set());
  const [activePriorities, setActivePriorities] = useState<Set<ActionPriorityLevel>>(new Set());

  /* Dépliage : override manuel, sinon ouverture auto quand la recherche touche un mot-clé du groupe */
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const [qualifyOpen, setQualifyOpen] = useState(false);

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
      setGroups((prev) => {
        const have = new Set(prev.map((g) => g.id));
        return [...EXTRA_GROUPS.filter((g) => !have.has(g.id)), ...prev];
      });
    }, acc + 250));
  }

  /* Générer → page « Configuration du contenu », sujet pré-rempli avec l'opportunité. */
  function goGenerate(g: OppGroup) {
    router.push(`/templates/configurer/sans-template?subject=${encodeURIComponent(g.subject)}`);
  }

  function setStatus(g: OppGroup, s: OppStatus) {
    if (s === g.status) return;
    setGroups((prev) => prev.map((x) => (x.id === g.id ? { ...x, status: s } : x)));
    showToast(`« ${g.subject} » : ${STATUS_CFG[s].label.toLowerCase()}`, <CheckCircleIcon className="h-5 w-5" />);
  }

  const toggleFrom = <V,>(setter: React.Dispatch<React.SetStateAction<Set<V>>>, v: V) =>
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v); else next.add(v);
      return next;
    });

  /* ── Filtrage ── */
  const q = search.trim().toLowerCase();
  const filtered = useMemo(() => groups.filter((g) => {
    if (activeStatuses.size > 0 && !activeStatuses.has(g.status)) return false;
    if (activeClassif.size > 0 && !activeClassif.has(g.classification)) return false;
    if (activePriorities.size > 0 && (!g.priority || !activePriorities.has(g.priority))) return false;
    if (q && !g.subject.toLowerCase().includes(q) && !g.keywords.some((k) => k.keyword.toLowerCase().includes(q))) return false;
    return true;
  }), [groups, activeStatuses, activeClassif, activePriorities, q]);

  /* Classés (priorité > offre prioritaire > gain) — les « à qualifier » à part, jamais en tête. */
  const ranked = useMemo(() => filtered
    .filter((g) => g.difficulty != null)
    .sort((a, b) =>
      (b.priority ? PRIO_RANK[b.priority] : 0) - (a.priority ? PRIO_RANK[a.priority] : 0) ||
      Number(!!b.offer) - Number(!!a.offer) ||
      b.gain - a.gain,
    ), [filtered]);
  const toQualify = useMemo(() => filtered.filter((g) => g.difficulty == null).sort((a, b) => b.gain - a.gain), [filtered]);

  /* Ouverture auto : le mot-clé cherché est dans le groupe mais pas dans le sujet. */
  const autoOpen = useMemo(() => {
    if (!q) return new Set<string>();
    return new Set(filtered.filter((g) => !g.subject.toLowerCase().includes(q) && g.keywords.some((k) => k.keyword.toLowerCase().includes(q))).map((g) => g.id));
  }, [filtered, q]);
  const isOpen = (id: string) => openMap[id] ?? autoOpen.has(id);
  const toggleOpen = (g: OppGroup) => setOpenMap((m) => ({ ...m, [g.id]: !isOpen(g.id) }));

  /* ── KPIs (sur tout le projet, indépendants des filtres) ── */
  const pending = groups.filter((g) => g.status === "en_attente");
  const kwPending = pending.reduce((s, g) => s + g.keywords.length, 0);
  const gainPending = pending.reduce((s, g) => s + g.gain, 0);
  const quickWins = pending.filter(isQuickWin).length;
  const doneCount = groups.filter((g) => g.status === "traitee").length;

  /* ── Labels des filtres ── */
  const statusLabel = activeStatuses.size === 0 ? "Statut"
    : activeStatuses.size === 1 ? STATUS_CFG[Array.from(activeStatuses)[0]].label
      : `Statut · ${activeStatuses.size}`;
  const classifLabel = activeClassif.size === 0 ? "Type"
    : activeClassif.size === 1 ? CLASSIF_CFG[Array.from(activeClassif)[0]].label
      : `Type · ${activeClassif.size}`;
  const priorityLabel = activePriorities.size === 0 ? "Priorité"
    : activePriorities.size === 1 ? PRIORITY_LEVELS[Array.from(activePriorities)[0]].label
      : `Priorité · ${activePriorities.size}`;

  const statusesAreDefault = activeStatuses.size === DEFAULT_STATUSES.length && DEFAULT_STATUSES.every((s) => activeStatuses.has(s));
  const hasActiveFilters = search !== "" || !statusesAreDefault || activeClassif.size > 0 || activePriorities.size > 0;
  function resetFilters() {
    setSearch("");
    setActiveStatuses(new Set(DEFAULT_STATUSES));
    setActiveClassif(new Set());
    setActivePriorities(new Set());
  }

  /* ── Colonnes (une ligne = une opportunité) ── */
  const columns: ColumnDef<OppGroup>[] = [
    { key: "subject", header: "Opportunité", width: 280, flex: true,
      render: (g) => (
        <span className="flex min-w-0 items-center gap-2.5">
          <ChevronRightIcon className={`h-4 w-4 flex-shrink-0 text-[var(--text-muted)] transition-transform duration-200 ${isOpen(g.id) ? "rotate-90" : ""}`} />
          <span className="min-w-0">
            <TruncatedText text={g.subject} className="type-body-strong text-[var(--text-primary)]" />
            <span className="mt-1 flex min-w-0 flex-wrap items-center gap-1.5">
              <span className="whitespace-nowrap type-caption text-[var(--text-muted)]">{g.keywords.length} mots-clés</span>
              {isQuickWin(g) && (
                <Tooltip portal rich side="top" label={<Tip title="Quick win" desc="Déjà proche de la première page (positions 8 à 20) avec une difficulté accessible : c'est le plus rapide à rentabiliser." />}>
                  <span className="inline-flex cursor-default">
                    <Pill color="var(--color-success)" bg="var(--color-success-bg)">Quick win</Pill>
                  </span>
                </Tooltip>
              )}
              {g.offer && (
                <Tooltip portal rich side="top" label={<Tip title="Offre prioritaire" desc={`Rattaché à l'offre « ${g.offer} » déclarée dans les paramètres du projet : cette opportunité est favorisée dans l'ordre de la liste.`} />}>
                  <span className="inline-flex cursor-default">
                    <Pill color="#7C3AED" bg="rgba(124,58,237,0.10)">Offre prioritaire</Pill>
                  </span>
                </Tooltip>
              )}
            </span>
          </span>
        </span>
      ) },
    { key: "priority",
      header: <ColHeaderInfo label="Priorité" tooltip={<Tip title="Priorité calculée" desc="Croise le gain, la difficulté et la distance à la première page. Les opportunités liées aux offres prioritaires du projet sont favorisées." />} />,
      width: 120, sortable: true, sortValue: (g) => (g.priority ? PRIO_RANK[g.priority] : 0),
      render: (g) => g.priority ? <PriorityBadge level={g.priority} /> : <span className="type-caption text-[var(--text-muted)]">À qualifier</span> },
    { key: "gain",
      header: <ColHeaderInfo label="Gain / mois" tooltip={<Tip title="Gain estimé" desc="Clics mensuels supplémentaires si l'opportunité est traitée. Calculé sur le groupe entier, sans additionner les mots-clés entre eux." />} />,
      width: 120, sortable: true, sortValue: (g) => g.gain,
      render: (g) => (
        <span className="type-label tabular-nums text-[var(--text-primary)]">
          +{g.gain.toLocaleString("fr-FR")} <span className="type-caption text-[var(--text-muted)]">clics</span>
        </span>
      ) },
    { key: "difficulty", header: "Difficulté", width: 130, sortable: true, sortValue: (g) => g.difficulty ?? -1,
      render: (g) => {
        if (g.difficulty == null) return <span className="type-caption text-[var(--text-muted)]">À mesurer</span>;
        const lvl = diffLevel(g.difficulty);
        return (
          <ColorPill color={lvl.color} bg={lvl.bg}>
            {lvl.label}
            <span className="tabular-nums opacity-70">{g.difficulty}</span>
          </ColorPill>
        );
      } },
    { key: "position",
      header: <ColHeaderInfo label="Position" tooltip={<Tip title="Meilleure position" desc="Meilleure position actuelle du site parmi les mots-clés de l'opportunité. C'est la distance à la première page." />} />,
      width: 100, sortable: true, sortValue: (g) => g.bestPosition ?? 999,
      render: (g) => g.bestPosition != null
        ? <span className="type-label font-semibold tabular-nums text-[var(--text-primary)]">#{g.bestPosition}</span>
        : <span className="type-caption text-[var(--text-muted)]">Hors top 100</span> },
    { key: "classification", header: "Type", width: 130,
      render: (g) => <ClassifTag c={g.classification} /> },
    { key: "target", header: "Page cible", width: 200,
      render: (g) => g.targetUrl ? (
        <button type="button" onClick={(e) => { e.stopPropagation(); onOpenPageByUrl?.(g.targetUrl!); }}
          className="-mx-1 inline-flex max-w-full min-w-0 items-center rounded-md px-1 py-0.5 transition-colors hover:bg-[var(--bg-subtle)]">
          <span className="truncate font-mono text-[12px] text-[var(--text-secondary)] underline decoration-[var(--border-medium)] decoration-1 underline-offset-[3px] hover:text-[var(--text-primary)]">{g.targetUrl}</span>
        </button>
      ) : (
        <span className="inline-flex items-center gap-1 type-caption text-[var(--text-muted)]">
          <PlusIcon className="h-3.5 w-3.5" />
          À créer
        </span>
      ) },
    { key: "status", header: "Statut", width: 140,
      render: (g) => <StatusDropdown status={g.status} onChange={(s) => setStatus(g, s)} /> },
  ];

  /* Action épinglée à droite, révélée au survol (comme le chevron du tableau URLs). */
  const trailingAction = (g: OppGroup) => {
    if (g.status === "en_attente") {
      return (
        <Button size="sm" onClick={(e) => { e.stopPropagation(); goGenerate(g); }}>
          Générer
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </Button>
      );
    }
    if (g.status === "traitee") {
      return (
        <button type="button" onClick={(e) => { e.stopPropagation(); onGoToCreation?.(); }}
          className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-2.5 py-1 type-caption font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-medium)] hover:text-[var(--text-primary)]">
          Voir le brief
          <ArrowUpRightIcon className="h-3 w-3" />
        </button>
      );
    }
    return (
      <button type="button" onClick={(e) => { e.stopPropagation(); setStatus(g, "en_attente"); }}
        className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-2.5 py-1 type-caption font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-medium)] hover:text-[var(--text-primary)]">
        Remettre en attente
      </button>
    );
  };

  const tableProps = {
    columns,
    rowKey: (g: OppGroup) => g.id,
    onRowClick: (g: OppGroup) => toggleOpen(g),
    isExpanded: (g: OppGroup) => isOpen(g.id),
    renderExpanded: (g: OppGroup) => <KeywordDetail g={g} query={q} onOpenUrl={onOpenPageByUrl} />,
    trailingAction,
    trailingActionWidth: 170,
    minWidth: 1180,
    stickyLeft: true,
  };

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
            description="Lancez une étude pour identifier les opportunités face à vos concurrents."
            action={<Button onClick={() => setStudyOpen(true)}>Lancer une étude de mots-clés<ChevronRightIcon className="h-4 w-4" /></Button>}
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
            <p className="mt-1 type-body-sm">Import des données et regroupement des mots-clés en opportunités.</p>
            <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
              <div className="h-full rounded-full bg-[var(--accent-primary)] transition-all duration-500 ease-out" style={{ width: `${(loadingStep / LOADING_STEPS.length) * 100}%` }} />
            </div>
            <ul className="mt-5 w-full space-y-2.5">
              {LOADING_STEPS.map((step, i) => {
                const d = i < loadingStep, a = i === loadingStep;
                return (
                  <li key={step} className="flex items-center gap-2.5 type-label">
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
          <KpiGroup columns={4}>
            <KpiCard bare icon={Layers}       label="Opportunités à traiter" value={pending.length.toString()} sub={`${kwPending} mots-clés regroupés`} />
            <KpiCard bare icon={TrendingUp}   label="Gain potentiel"    value={`+${gainPending.toLocaleString("fr-FR")}`} sub="clics / mois, sans double comptage" />
            <KpiCard bare icon={Zap}          label="Quick wins"        value={quickWins.toString()} sub="proches de la page 1 et accessibles" />
            <KpiCard bare icon={CheckCircle2} label="Traitées"          value={doneCount.toString()} sub="briefs générés" />
          </KpiGroup>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Rechercher une opportunité ou un mot-clé…" alwaysExpanded />

            <ColPill name="statut" label={statusLabel} active={!statusesAreDefault}>
              {() => (
                <>
                  <DropdownHeader>Filtrer par statut</DropdownHeader>
                  {STATUS_ORDER.map((s) => (
                    <DropdownItem key={s} selected={activeStatuses.has(s)} onClick={() => toggleFrom(setActiveStatuses, s)} keepOpen checkbox>
                      <span className="flex w-full items-center justify-between gap-3">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: STATUS_CFG[s].color }} />
                          {STATUS_CFG[s].label}
                        </span>
                        <span className="type-caption opacity-60">{groups.filter((g) => g.status === s).length}</span>
                      </span>
                    </DropdownItem>
                  ))}
                </>
              )}
            </ColPill>

            <ColPill name="type" label={classifLabel} active={activeClassif.size > 0}>
              {() => (
                <>
                  <DropdownHeader>Filtrer par type</DropdownHeader>
                  {CLASSIF_ORDER.map((c) => (
                    <DropdownItem key={c} selected={activeClassif.has(c)} onClick={() => toggleFrom(setActiveClassif, c)} keepOpen checkbox>
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: CLASSIF_CFG[c].color }} />
                        {CLASSIF_CFG[c].label}
                      </span>
                    </DropdownItem>
                  ))}
                </>
              )}
            </ColPill>

            <ColPill name="priorité" label={priorityLabel} active={activePriorities.size > 0}>
              {() => (
                <>
                  <DropdownHeader>Filtrer par priorité</DropdownHeader>
                  {PRIORITY_ORDER.map((p) => (
                    <DropdownItem key={p} selected={activePriorities.has(p)} onClick={() => toggleFrom(setActivePriorities, p)} keepOpen checkbox>
                      <PriorityBadge level={p} />
                    </DropdownItem>
                  ))}
                </>
              )}
            </ColPill>

            <ResetFiltersButton show={hasActiveFilters} onReset={resetFilters} />
          </div>

          {/* Opportunités classées */}
          <TableWide<OppGroup>
            {...tableProps}
            data={ranked}
            emptyState={q ? `Aucune opportunité ni mot-clé ne contient « ${search} ».` : "Aucune opportunité avec ces filtres."}
            pageSize={25}
            bordered
          />

          {/* Opportunités à qualifier : difficulté non mesurée → bloc replié, jamais en tête de liste */}
          {toQualify.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
              <button
                type="button"
                onClick={() => setQualifyOpen((v) => !v)}
                aria-expanded={qualifyOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[var(--bg-card-hover)]"
              >
                <span className="flex items-center gap-2.5">
                  <ChevronRightIcon className={`h-4 w-4 text-[var(--text-muted)] transition-transform duration-200 ${qualifyOpen ? "rotate-90" : ""}`} />
                  <span className="type-body-strong text-[var(--text-primary)]">Difficulté non mesurée</span>
                  <span className="type-caption text-[var(--text-muted)]">{toQualify.length} opportunité{toQualify.length > 1 ? "s" : ""}</span>
                </span>
                <span className="hidden type-caption text-[var(--text-muted)] md:block">Non classées : elles ne remontent jamais en tête de liste</span>
              </button>
              {qualifyOpen && (
                <div className="border-t border-[var(--border-subtle)]">
                  <TableWide<OppGroup> {...tableProps} data={toQualify} hidePagination />
                </div>
              )}
            </div>
          )}
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
