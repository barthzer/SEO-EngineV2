"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon, ArrowPathIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Tooltip } from "@/components/Tooltip";
import { Button } from "@/components/Button";
import { KpiCard } from "@/components/KpiCard";
import { KpiGroup } from "@/components/KpiGroup";
import { TableWide, type ColumnDef } from "@/components/TableWide";
import { ColPill } from "@/components/ColPill";
import { ResetFiltersButton } from "@/components/ResetFiltersButton";
import { SearchInput } from "@/components/SearchInput";
import { Layers, CircleCheck, Sparkles, Clock } from "lucide-react";

/* ── Types ────────────────────────────────────────────────────────────── */

type SemStatus = "opportunite" | "couvert";
type SemUrl = { url: string; pos: number };
type SemanticKw = {
  keyword: string;
  urls: SemUrl[];
  /** URLs supplémentaires masquées sous "+X autres" */
  extraUrls: SemUrl[];
  source: "PAA" | "Related";
  api: string;
  status: SemStatus;
  cannibCount?: number;
  volume: number;
  score: number | null;
};

/* ── Data ─────────────────────────────────────────────────────────────── */

const S = (keyword: string, urls: SemUrl[], extras: SemUrl[], src: "PAA"|"Related", status: SemStatus, cannibCount: number|undefined, vol: number, score: number|null): SemanticKw =>
  ({ keyword, urls, extraUrls: extras, source: src, api: "haloscan", status, cannibCount, volume: vol, score });

// Quelques URLs "réservoir" qu'on réutilise comme extras de cannibalisation
const X_LUXE = [
  { url: "/agence-marketing-digital-luxe/", pos: 14 },
  { url: "/blog/luxe-strategie-seo/",       pos: 41 },
];
const X_SEO_EXTRAS = [
  { url: "/blog/agence-seo-comparatif/",      pos: 11 },
  { url: "/services/audit-seo-technique/",    pos: 27 },
  { url: "/agence-marketing-digital-mode-pret-a-porter/", pos: 33 },
  { url: "/blog/seo-2026-tendances/",         pos: 52 },
];

const SEMANTIC_KWS: SemanticKw[] = [
  S("agence seo définition",               [{url:"/agence-marketing-digital-banque-assurance/",pos:2},{url:"/agence-marketing-digital-b2b/",pos:8}], X_LUXE,       "PAA",     "couvert", undefined, 90,    80),
  S("agence digitale luxe",                [{url:"/",pos:50},{url:"/agence-marketing-digital-sante/",pos:59}],                                     [],            "Related", "couvert", undefined, 140,   82),
  S("agence seo",                          [{url:"/agence-marketing-digital-banque-assurance/",pos:2},{url:"/agence-marketing-digital-b2b/",pos:8}], X_SEO_EXTRAS,  "Related", "couvert", undefined, 2100,  80),
  S("google analytics",                    [], [], "Related", "opportunite", undefined, 61400, null),
  S("agence seo paris",                    [], [], "Related", "opportunite", undefined, 2400,  null),
  S("formation seo",                       [{url:"/formation/formation-seo/",pos:46}],                                                              [], "Related", "couvert",         undefined, 1700, 80),
  S("adveris",                             [], [], "Related", "opportunite", undefined, 1200,  null),
  S("agence digital paris",                [{url:"/",pos:50}],                                                                                      [], "Related", "couvert",         undefined, 800,  80),
  S("formation seo cpf",                   [], [], "Related", "opportunite", undefined, 390,   null),
  S("agence de communication tourisme",    [{url:"/agence-marketing-digital-tourisme-voyage/",pos:33}],                                             [], "Related", "couvert",         undefined, 210,  70),
  S("formation référencement naturel seo", [], [], "Related", "opportunite", undefined, 210,   null),
  S("formation seo en ligne gratuite",     [], [], "Related", "opportunite", undefined, 170,   null),
  S("vmed",                                [], [], "Related", "opportunite", undefined, 140,   null),
  S("interface tourisme",                  [], [], "Related", "opportunite", undefined, 140,   null),
  S("agence digitale paris",               [], [], "Related", "opportunite", undefined, 100,   null),
  S("agence digital santé",                [{url:"/agence-marketing-digital-sante/",pos:59}],                                                       [], "Related", "couvert",         undefined, 90,   100),
  S("agence digitale créative",            [{url:"/",pos:50}],                                                                                      [], "Related", "couvert",         undefined, 90,   78),
  S("agence de communication médicale",    [], [], "Related", "opportunite", undefined, 70,    null),
  S("agence communication touristique",    [{url:"/agence-marketing-digital-tourisme-voyage/",pos:33}],                                             [], "Related", "couvert",         undefined, 70,   70),
  S("agence communication tourisme",       [{url:"/agence-marketing-digital-tourisme-voyage/",pos:33}],                                             [], "Related", "couvert",         undefined, 70,   75),
  S("formation seo pôle emploi",           [], [], "Related", "opportunite", undefined, 70,    null),
  S("agence communication santé paris",    [], [], "Related", "opportunite", undefined, 50,    null),
  S("think tank santé",                    [], [], "Related", "opportunite", undefined, 50,    null),
  S("formation certifiante seo",           [], [], "Related", "opportunite", undefined, 50,    null),
  S("digital santé",                       [{url:"/agence-marketing-digital-sante/",pos:59}],                                                       [], "Related", "couvert",         undefined, 40,   92),
  S("club digital santé",                  [{url:"/agence-marketing-digital-sante/",pos:59}],                                                       [], "Related", "couvert",         undefined, 40,   78),
  S("télésanté définition",                [], [], "PAA",     "opportunite", undefined, 30,    null),
  S("comm santé",                          [], [], "Related", "opportunite", undefined, 30,    null),
  S("agence digitale site internet",       [{url:"/",pos:50}],                                                                                      [], "Related", "couvert",         undefined, 30,   76),
  S("agence digitale bordeaux",            [], [], "Related", "opportunite", undefined, 30,    null),
  S("agence marketing tourisme",           [{url:"/agence-marketing-digital-tourisme-voyage/",pos:33}],                                             [], "Related", "couvert",         undefined, 30,   78),
  S("formation seo prix",                  [], [], "PAA",     "opportunite", undefined, 30,    null),
  S("digitalisation de la santé",          [{url:"/agence-marketing-digital-sante/",pos:59}],                                                       [], "Related", "couvert",         undefined, 20,   77),
  S("transformation digitale santé",       [{url:"/agence-marketing-digital-sante/",pos:59}],                                                       [], "Related", "couvert",         undefined, 20,   77),
  S("kamui digital sante",                 [{url:"/agence-marketing-digital-sante/",pos:59}],                                                       [], "Related", "couvert",         undefined, 20,   71),
  S("agence marketing digital prix",       [], [], "PAA",     "opportunite", undefined, 20,    null),
  S("agence marketing digital c'est quoi", [{url:"/agence-marketing-digital-mode-pret-a-porter/",pos:5}],                                           [], "PAA",     "couvert",         undefined, 20,   77),
  S("agence communication digitale",       [{url:"/",pos:50}],                                                                                      [], "Related", "couvert",         undefined, 20,   83),
  S("agence digital",                      [{url:"/",pos:50}],                                                                                      [], "Related", "couvert",         undefined, 20,   100),
  S("agence influenceur voyage",            [], [], "Related", "opportunite", undefined, 20,    null),
  S("agence digitale tourisme",            [{url:"/agence-marketing-digital-tourisme-voyage/",pos:33}],                                             [], "Related", "couvert",         undefined, 20,   83),
  S("formation référencement naturel",     [], [], "Related", "opportunite", undefined, 20,    null),
  S("formation seo openclassroom",         [], [], "Related", "opportunite", undefined, 20,    null),
  S("mhealth definition",                  [], [], "PAA",     "opportunite", undefined, 10,    null),
  S("tic santé définition",               [], [], "PAA",     "opportunite", undefined, 10,    null),
  S("santé digitale définition",           [{url:"/agence-marketing-digital-sante/",pos:59}],                                                       [], "PAA",     "couvert",         undefined, 10,   77),
  S("agence communication santé lyon",     [], [], "Related", "opportunite", undefined, 10,    null),
  S("conférence e-santé",                  [], [], "Related", "opportunite", undefined, 10,    null),
  S("buzz e-santé",                        [], [], "Related", "opportunite", undefined, 10,    null),
  S("digital et santé",                    [{url:"/agence-marketing-digital-sante/",pos:59}],                                                       [], "Related", "couvert",         undefined, 10,   82),
];

/* ── Helpers : tooltips contextuels ──────────────────────────────────── */

function SourceTip({ source }: { source: "PAA" | "Related" }) {
  if (source === "PAA") return (
    <div className="flex flex-col gap-1.5">
      <p className="font-semibold">Question "People Also Ask"</p>
      <p className="opacity-75">Ce keyword provient des questions fréquentes affichées par Google.</p>
      <p className="mt-0.5">💡 Idéal pour FAQ, H2/H3, featured snippets</p>
    </div>
  );
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-semibold">Keyword associé</p>
      <p className="opacity-75">Sémantiquement lié à votre sujet principal.</p>
      <p className="mt-0.5">💡 Enrichit votre champ sémantique</p>
    </div>
  );
}

function CouvertTip({ row }: { row: SemanticKw }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-semibold text-[var(--color-success)]">Keyword couvert ✓</p>
      <p className="opacity-75">Une page de votre site cible déjà ce keyword{row.score !== null ? ` (score : ${row.score} %)` : ""}.</p>
      <p className="opacity-50">Aucune action nécessaire.</p>
    </div>
  );
}

function OppTip({ row }: { row: SemanticKw }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-semibold">Opportunité de contenu 🎯</p>
      <p className="opacity-75">Aucune page de votre site ne cible ce keyword.</p>
      <p className="text-[11px] opacity-60">Volume : <span className="font-semibold text-white opacity-100">{row.volume.toLocaleString("fr-FR")}/mois</span></p>
    </div>
  );
}

/* ── Cell renderers ──────────────────────────────────────────────────── */

function SemStatusCell({ row }: { row: SemanticKw }) {
  if (row.status === "couvert") return (
    <Tooltip portal rich side="bottom" label={<CouvertTip row={row} />}>
      <span className="inline-flex w-fit cursor-help items-center rounded-full px-2 py-1 type-micro"
        style={{ color: "var(--color-success)", backgroundColor: "var(--color-success-bg)" }}>Couvert</span>
    </Tooltip>
  );
  return (
    <Tooltip portal rich side="bottom" label={<OppTip row={row} />}>
      <span className="inline-flex w-fit cursor-help items-center rounded-full px-2 py-1 type-micro"
        style={{ color: "var(--accent-primary)", backgroundColor: "rgba(62,80,245,0.08)" }}>Opportunité</span>
    </Tooltip>
  );
}

function SemScore({ score }: { score: number | null }) {
  if (score === null) return <span className="type-label text-[var(--text-muted)]">—</span>;
  const color = score >= 80 ? "var(--color-success)" : score >= 70 ? "var(--color-warning)" : "var(--color-danger)";
  return <span className="type-label tabular-nums" style={{ color }}>{score}%</span>;
}

/** Pills source — Related cyan, PAA purple */
function SourcePill({ source }: { source: "PAA" | "Related" }) {
  const cfg = source === "PAA"
    ? { color: "#9333EA", bg: "rgba(168,85,247,0.10)" }   // purple
    : { color: "#0891B2", bg: "rgba(6,182,212,0.12)" };   // cyan
  return (
    <Tooltip portal rich side="bottom" label={<SourceTip source={source} />}>
      <span className="inline-flex w-fit cursor-help items-center rounded-full px-2.5 py-1 type-micro"
        style={{ color: cfg.color, backgroundColor: cfg.bg }}>
        {source}
      </span>
    </Tooltip>
  );
}

/** Cellule URL cliquable — clique = openPageByUrl, stopPropagation pour ne pas trigger le rowClick */
function ClickableUrl({ url, pos, onOpen }: { url: string; pos: number; onOpen: (url: string) => void }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onOpen(url); }}
      className="group/url inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-md px-1 py-0.5 -mx-1 transition-colors hover:bg-[var(--bg-subtle)]"
    >
      <span className="truncate font-mono type-caption underline decoration-[var(--border-medium)] decoration-1 underline-offset-[3px] group-hover/url:text-[var(--text-primary)] group-hover/url:decoration-[var(--text-primary)]">
        {url}
      </span>
      <span className="flex-shrink-0 rounded px-1 py-0.5 type-micro tabular-nums"
        style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-muted)" }}>#{pos}</span>
    </button>
  );
}

/** Tooltip popover pour le bouton "+X autres" — liste cliquable */
function ExtraUrlsPopover({ extras, onOpen }: { extras: SemUrl[]; onOpen: (url: string) => void }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (popRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function toggle(e: React.MouseEvent) {
    e.stopPropagation();
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left });
    setOpen((o) => !o);
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        className="inline-flex items-center gap-1 rounded-md px-1 py-0.5 type-caption text-[var(--accent-primary)] transition-colors hover:bg-[var(--accent-primary-soft)]"
      >
        +{extras.length} autre{extras.length > 1 ? "s" : ""}
        <ChevronDownIcon className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && typeof document !== "undefined" && createPortal(
        <div
          ref={popRef}
          onClick={(e) => e.stopPropagation()}
          className="animate-dropdown-down fixed z-[1000] min-w-[280px] max-w-[420px] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-2 shadow-[var(--shadow-floating)]"
          style={{ top: pos.top, left: pos.left, transformOrigin: "top center" }}
        >
          <p className="px-3 pt-2 pb-1 type-micro">
            URLs supplémentaires en conflit
          </p>
          <div className="flex flex-col gap-0.5 px-1 pb-1">
            {extras.map((u, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { onOpen(u.url); setOpen(false); }}
                className="group/x flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-[var(--bg-subtle)]"
              >
                <span className="truncate font-mono type-caption underline decoration-[var(--border-medium)] decoration-1 underline-offset-[3px] group-hover/x:text-[var(--text-primary)] group-hover/x:decoration-[var(--text-primary)]">
                  {u.url}
                </span>
                <span className="ml-auto flex-shrink-0 rounded px-1 py-0.5 type-micro tabular-nums"
                  style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-muted)" }}>#{u.pos}</span>
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

function SemUrlList({ urls, extras, onOpen }: { urls: SemUrl[]; extras: SemUrl[]; onOpen: (url: string) => void }) {
  if (urls.length === 0) return <span className="type-label text-[var(--text-muted)]">—</span>;
  return (
    <div className="flex min-w-0 flex-col gap-1">
      {urls.map((u, i) => (
        <ClickableUrl key={i} url={u.url} pos={u.pos} onOpen={onOpen} />
      ))}
      {extras.length > 0 && <ExtraUrlsPopover extras={extras} onOpen={onOpen} />}
    </div>
  );
}

/* ── Main view ────────────────────────────────────────────────────────── */

export function UniversSemantiqueView({
  title,
  subtitle,
  onOpenPageByUrl,
}: {
  title?: string;
  subtitle?: string;
  onOpenPageByUrl?: (url: string) => void;
} = {}) {
  const [semStatus, setSemStatus] = useState<SemStatus | "all">("all");
  const [semSource, setSemSource] = useState<"PAA" | "Related" | "all">("all");
  const [semSearch, setSemSearch] = useState("");

  const hasActiveFilters = semStatus !== "all" || semSource !== "all" || semSearch !== "";

  const filteredKws = SEMANTIC_KWS.filter(k =>
    (semStatus === "all" || k.status === semStatus) &&
    (semSource === "all" || k.source === semSource) &&
    (semSearch === "" || k.keyword.toLowerCase().includes(semSearch.toLowerCase()))
  );

  const handleOpen = onOpenPageByUrl ?? (() => {});

  const columns: ColumnDef<SemanticKw>[] = [
    {
      key: "keyword",
      header: "Keyword",
      width: 260,
      render: (kw) => (
        <span className="block truncate type-label" title={kw.keyword}>
          {kw.keyword}
        </span>
      ),
    },
    {
      key: "urls",
      header: "URL(s) matchée(s)",
      width: 320,
      render: (kw) => <SemUrlList urls={kw.urls} extras={kw.extraUrls} onOpen={handleOpen} />,
    },
    {
      key: "source", header: "Source", width: 110,
      render: (kw) => <SourcePill source={kw.source} />,
    },
    {
      key: "status", header: "Statut", width: 180,
      render: (kw) => <SemStatusCell row={kw} />,
    },
    {
      key: "volume", header: "Volume", width: 110, align: "right",
      sortable: true, sortValue: (kw) => kw.volume,
      render: (kw) => (
        <span className="type-label tabular-nums">
          {kw.volume.toLocaleString("fr-FR")}
        </span>
      ),
    },
    {
      key: "score", header: "Score", width: 80, align: "right",
      sortable: true, sortValue: (kw) => kw.score ?? -1,
      render: (kw) => <SemScore score={kw.score} />,
    },
  ];

  return (
    <div className="flex flex-col gap-5">

      {/* Header — title (passed by parent) on the left, CTAs on the right (space-between) */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          {title && (
            <h1 className="type-h1 leading-none">{title}</h1>
          )}
          {subtitle && (
            <p className="mt-1 type-body text-[var(--text-secondary)]">{subtitle}</p>
          )}
        </div>
        <div className="flex flex-shrink-0 items-center gap-3">
          <span className="hidden items-center gap-1.5 type-caption sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
            Dernière MAJ il y a 3 j
          </span>
          <Button variant="secondary">
            <ArrowPathIcon className="h-4 w-4" />
            Actualiser
          </Button>
          <Button variant="secondary">Matcher</Button>
        </div>
      </div>

      {/* KPI cards — cannibalisation gérée dans son propre onglet (pas de doublon ici) */}
      <KpiGroup columns={4}>
        <KpiCard bare icon={Layers}        label="Total"        value="303" />
        <KpiCard bare icon={Sparkles}      label="Opportunités" value="223" />
        <KpiCard bare icon={CircleCheck}   label="Couverts"     value="80" />
        <KpiCard bare icon={Clock}         label="En attente"   value="0" />
      </KpiGroup>

      {/* Toolbar — search + filtres Source/Statut + reset + count */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={semSearch} onChange={setSemSearch} placeholder="Rechercher un mot-clé…" alwaysExpanded />
        <ColPill
          name="Source"
          label={semSource === "all" ? "Source" : semSource}
          active={semSource !== "all"}
          value={semSource}
          onChange={(v) => setSemSource(v as "PAA" | "Related" | "all")}
          items={[
            { value: "all",     label: "Toutes" },
            { value: "PAA",     label: "PAA" },
            { value: "Related", label: "Related" },
          ]}
        />
        <ColPill
          name="Statut"
          label={
            semStatus === "all"
              ? "Statut"
              : ({ opportunite: "Opportunité", couvert: "Couvert" } as const)[semStatus]
          }
          active={semStatus !== "all"}
          value={semStatus}
          onChange={(v) => setSemStatus(v as SemStatus | "all")}
          items={[
            { value: "all",             label: "Tous" },
            { value: "opportunite",     label: "Opportunité" },
            { value: "couvert",         label: "Couvert" },
          ]}
        />
        <ResetFiltersButton
          show={hasActiveFilters}
          onReset={() => { setSemStatus("all"); setSemSource("all"); setSemSearch(""); }}
        />
        <span className="ml-auto type-caption text-[var(--text-muted)] tabular-nums">{filteredKws.length} / {SEMANTIC_KWS.length}</span>
      </div>

      {/* Table — DS TableWide bordered (même look que Recommandations) */}
      <TableWide<SemanticKw>
        columns={columns}
        data={filteredKws}
        rowKey={(kw) => kw.keyword}
        emptyState="Aucun mot-clé pour ces filtres."
        minWidth={1100}
        bordered
        edgePadding="24px"
      />
    </div>
  );
}
