"use client";

/**
 * HistoriqueView — onglet "Historique" du projet (tab=historique).
 *
 * V6 — basé sur le composant DS `TableWide` :
 *   - Plus de colonne sticky "mois" : on garde une simple table plate sortable par date desc
 *   - Toolbar : SearchInput + filtre Type (multi-select) + filtre Personne assignée
 *     (multi-select) + filtre Période + reset cross + Export PDF
 *   - Rows cliquables → redirection vers la page/élément concerné via `onRowClick`
 *   - Owners alignés sur TEAM canonique (photoSeed pravatar.cc)
 *
 * Source de vérité pour le rapport mensuel PDF (C1).
 */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { SearchInput } from "@/components/SearchInput";
import { pravatarUrl } from "@/lib/avatar";
import { ColPill } from "@/components/ColPill";
import { Button } from "@/components/Button";
import { DropdownItem, DropdownHeader } from "@/components/DropdownMenu";
import { TableWide, type ColumnDef } from "@/components/TableWide";
import { Tooltip } from "@/components/Tooltip";

/* ════════════════════════════════════════════════════════════════════════
   TYPES + MOCK DATA — owners alignés sur TEAM (/equipe)
   ══════════════════════════════════════════════════════════════════════ */

type ActionType = "article" | "page" | "audit" | "technique" | "netlinking" | "tracking";

type HistoryOwner = { name: string; initials: string; photoSeed: string };

const OWNERS: Record<string, HistoryOwner> = {
  bart:   { name: "Barthélemy L.", initials: "BL", photoSeed: "barthelemy-l-seo" },
  sophie: { name: "Sophie M.",     initials: "SM", photoSeed: "5" },
  thomas: { name: "Thomas L.",     initials: "TL", photoSeed: "thomas-l-seo" },
  marie:  { name: "Marie P.",      initials: "MP", photoSeed: "marie-p-seo" },
};

type HistoryAction = {
  id: string;
  date: string;
  title: string;
  description: string;
  ownerKey: keyof typeof OWNERS;
  type: ActionType;
  impact?: string;
  targetUrl: string;
};

const ACTIONS: HistoryAction[] = [
  { id: "a1",  date: "2026-05-22", type: "article",    ownerKey: "sophie",
    title: "Article \"Migration headless CMS\"",
    description: "Guide long-form 2 800 mots ciblant la query principale + 12 questions PAA.",
    impact: "+1 200 visites/mois estimées", targetUrl: "#/blog/migration-headless-cms" },
  { id: "a2",  date: "2026-05-22", type: "technique",  ownerKey: "thomas",
    title: "Optimisation Core Web Vitals",
    description: "Lazy-load images + suppression JS bloquant. Lighthouse 64 → 91.",
    impact: "INP < 200ms · LCP −1,2s", targetUrl: "?tab=audit&section=tec-urgences" },
  { id: "a3",  date: "2026-05-18", type: "netlinking", ownerKey: "bart",
    title: "3 backlinks DR 50+",
    description: "Acquisition de 3 liens follow depuis des médias B2B (DR moyen 58).",
    impact: "+3 RefDom haute autorité", targetUrl: "?tab=netlinking" },
  { id: "a4",  date: "2026-05-12", type: "page",       ownerKey: "marie",
    title: "Refonte page tarifs",
    description: "Restructuration H1/H2 + FAQ schema + intégration témoignages clients.",
    impact: "+38 % temps passé sur la page", targetUrl: "#/tarifs" },
  { id: "a5",  date: "2026-05-04", type: "article",    ownerKey: "sophie",
    title: "Article \"Stack analytics 2026\"",
    description: "Comparatif Plausible / PostHog / GA4 — 1 800 mots + matrice de choix.",
    impact: "Pos. 6 sur 'plausible vs ga4'", targetUrl: "#/blog/stack-analytics-2026" },

  { id: "a6",  date: "2026-04-28", type: "audit",      ownerKey: "bart",
    title: "Audit éditorial trimestriel",
    description: "Analyse de 47 pages, identification de 12 pages obsolètes à fusionner.",
    impact: "12 pages à consolider", targetUrl: "?tab=audit&section=edi-synthese" },
  { id: "a7",  date: "2026-04-21", type: "article",    ownerKey: "marie",
    title: "Article \"AI Overviews 2026\"",
    description: "Guide sur l'impact des Google AI Overviews sur le SEO B2B.",
    impact: "+650 visites/mois", targetUrl: "#/blog/ai-overviews-2026" },
  { id: "a8",  date: "2026-04-14", type: "tracking",   ownerKey: "thomas",
    title: "Setup GA4 + GSC enrichi",
    description: "Branchement des events conversion + filtres trafic interne.",
    impact: "Tracking 100 % fiable", targetUrl: "?tab=tracking" },

  { id: "a9",  date: "2026-03-30", type: "netlinking", ownerKey: "bart",
    title: "Campagne Digital PR",
    description: "Diffusion étude propriétaire à 24 médias B2B, 5 reprises avec lien.",
    impact: "+5 backlinks DR 51", targetUrl: "?tab=netlinking" },
  { id: "a10", date: "2026-03-22", type: "page",       ownerKey: "marie",
    title: "Création landing \"Demo\"",
    description: "Page dédiée parcours essai gratuit, CTA en haut de fold, témoignages.",
    impact: "Pos. 8 sur 'demo SaaS B2B'", targetUrl: "#/demo" },
  { id: "a11", date: "2026-03-12", type: "technique",  ownerKey: "thomas",
    title: "Migration HTTPS strict",
    description: "HSTS preload + cookies sécurisés. Mixed content éliminé.",
    targetUrl: "?tab=audit&section=tec-diagnostic" },

  { id: "a12", date: "2026-02-26", type: "article",    ownerKey: "sophie",
    title: "Article \"AI Search 2026\"",
    description: "Tour d'horizon des moteurs IA cités (ChatGPT, Perplexity, Claude).",
    impact: "Pos. 4 sur 'AI search seo'", targetUrl: "#/blog/ai-search-2026" },
  { id: "a13", date: "2026-02-18", type: "audit",      ownerKey: "bart",
    title: "Audit technique complet",
    description: "Crawl 4 200 pages, 87 erreurs critiques identifiées et corrigées.",
    impact: "Score audit 64 → 89", targetUrl: "?tab=audit&section=tec-synthese" },

  { id: "a14", date: "2026-01-22", type: "page",       ownerKey: "marie",
    title: "Refonte navigation principale",
    description: "Mega-menu cocon sémantique + réduction profondeur des pages clés.",
    targetUrl: "#/" },
  { id: "a15", date: "2026-01-08", type: "netlinking", ownerKey: "bart",
    title: "Cleanup backlinks toxiques",
    description: "Disavow de 18 domaines DR < 10 à thématique douteuse (Majestic).",
    targetUrl: "?tab=netlinking" },

  { id: "a16", date: "2025-12-12", type: "tracking",   ownerKey: "thomas",
    title: "Dashboard hebdo automatique",
    description: "Looker Studio + flux GSC. Rapport hebdo en auto chaque lundi.",
    targetUrl: "?tab=tracking" },
];

const TYPE_LABEL: Record<ActionType, string> = {
  article:    "Article",
  page:       "Page",
  audit:      "Audit",
  technique:  "Technique",
  netlinking: "Netlinking",
  tracking:   "Tracking",
};

const TYPES_ORDER: ActionType[] = ["article", "page", "audit", "technique", "netlinking", "tracking"];
const OWNER_KEYS = Object.keys(OWNERS) as (keyof typeof OWNERS)[];

function formatLongDate(iso: string): string {
  const d = new Date(iso);
  const months = ["jan", "fév", "mar", "avr", "mai", "juin", "juil", "août", "sep", "oct", "nov", "déc"];
  return `${d.getDate().toString().padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/* ════════════════════════════════════════════════════════════════════════
   Avatar — vraie photo pravatar.cc (cohérent avec /equipe).
   ══════════════════════════════════════════════════════════════════════ */

function OwnerAvatar({ owner, size = 24 }: { owner: HistoryOwner; size?: number }) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <span
        className="flex flex-shrink-0 items-center justify-center rounded-full bg-[var(--bg-subtle)] text-[10px] font-semibold text-[var(--text-secondary)]"
        style={{ width: size, height: size }}
        title={owner.name}
      >
        {owner.initials}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={pravatarUrl(owner.photoSeed, size * 2)}
      alt={owner.name}
      width={size}
      height={size}
      onError={() => setErrored(true)}
      className="flex-shrink-0 rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  );
}

/* ════════════════════════════════════════════════════════════════════════
   MAIN VIEW
   ══════════════════════════════════════════════════════════════════════ */

type Range = "3m" | "6m" | "12m" | "all";

const RANGE_LABELS: Record<Range, string> = {
  "3m":  "3 derniers mois",
  "6m":  "6 derniers mois",
  "12m": "12 derniers mois",
  all:   "Toute la période",
};

const DEFAULT_RANGE: Range = "12m";

export function HistoriqueView() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [range, setRange] = useState<Range>(DEFAULT_RANGE);
  const [activeTypes, setActiveTypes] = useState<Set<ActionType>>(new Set());
  const [activeOwners, setActiveOwners] = useState<Set<string>>(new Set());

  const hasActiveFilters =
    search.trim() !== "" ||
    range !== DEFAULT_RANGE ||
    activeTypes.size > 0 ||
    activeOwners.size > 0;

  function resetFilters() {
    setSearch("");
    setRange(DEFAULT_RANGE);
    setActiveTypes(new Set());
    setActiveOwners(new Set());
  }

  function toggleType(t: ActionType) {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }

  function toggleOwner(k: string) {
    setActiveOwners((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  }

  /* ── Filtrage + tri par date desc ── */
  const filteredActions = useMemo(() => {
    const q = search.trim().toLowerCase();
    const monthsBack: Record<Range, number> = { "3m": 3, "6m": 6, "12m": 12, all: 999 };
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - monthsBack[range]);
    return ACTIONS
      .filter((a) => {
        if (activeTypes.size > 0 && !activeTypes.has(a.type)) return false;
        if (activeOwners.size > 0 && !activeOwners.has(a.ownerKey)) return false;
        if (new Date(a.date) < cutoff) return false;
        if (q && !`${a.title} ${a.description}`.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((x, y) => y.date.localeCompare(x.date));
  }, [search, range, activeTypes, activeOwners]);

  /* ── Labels dynamiques pour les ColPill multi-select ── */
  const typeLabel =
    activeTypes.size === 0
      ? "Type"
      : activeTypes.size === 1
        ? TYPE_LABEL[Array.from(activeTypes)[0]]
        : `Type · ${activeTypes.size}`;
  const ownerLabel =
    activeOwners.size === 0
      ? "Personne assignée"
      : activeOwners.size === 1
        ? OWNERS[Array.from(activeOwners)[0]].name
        : `Personne assignée · ${activeOwners.size}`;

  /* ── Définition des colonnes TableWide ── */
  const columns: ColumnDef<HistoryAction>[] = [
    // Action seule en flex → absorbe TOUT l'espace dispo (colonne dominante).
    // Date, Type, Personne assignée → largeurs fixes plus serrées.
    {
      key: "action", header: "Action", width: 320, flex: true,
      render: (r) => (
        // `title` natif sur chaque <p> → tooltip OS au survol quand tronqué.
        <div className="min-w-0">
          <p className="truncate text-[13px] text-[var(--text-primary)]" title={r.title}>
            {r.title}
          </p>
          <p className="mt-0.5 truncate text-[12px] text-[var(--text-muted)]" title={r.description}>
            {r.description}
          </p>
        </div>
      ),
    },
    {
      key: "date", header: "Date", width: 110, sortable: true,
      sortValue: (r) => new Date(r.date).getTime(),
      render: (r) => (
        <span className="text-[13px] tabular-nums text-[var(--text-primary)]">
          {formatLongDate(r.date)}
        </span>
      ),
    },
    {
      key: "type", header: "Type", width: 90,
      render: (r) => (
        <span className="text-[13px] text-[var(--text-primary)]">{TYPE_LABEL[r.type]}</span>
      ),
    },
    {
      key: "owner", header: "Personne assignée", width: 170,
      render: (r) => {
        const owner = OWNERS[r.ownerKey];
        return (
          <span className="flex items-center gap-2 text-[13px] text-[var(--text-primary)]">
            <OwnerAvatar owner={owner} size={24} />
            <span className="truncate">{owner.name}</span>
          </span>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6">

      {/* ════════ Toolbar — px-[var(--page-px)] car le wrapper de page ne pad plus pour ce tab
           (full-bleed table comme la vue URLs) ════════ */}
      <div className="flex flex-wrap items-center gap-3 px-[var(--page-px)]">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Rechercher dans l'historique…"
          alwaysExpanded
        />

        {/* Type — multi-select */}
        <ColPill name="type" label={typeLabel} active={activeTypes.size > 0}>
          {() => (
            <>
              <DropdownHeader>Filtrer par type</DropdownHeader>
              {TYPES_ORDER.map((t) => (
                <DropdownItem
                  key={t}
                  selected={activeTypes.has(t)}
                  onClick={() => toggleType(t)}
                  keepOpen
                >
                  {TYPE_LABEL[t]}
                </DropdownItem>
              ))}
            </>
          )}
        </ColPill>

        {/* Personne assignée — multi-select */}
        <ColPill name="personne assignée" label={ownerLabel} active={activeOwners.size > 0}>
          {() => (
            <>
              <DropdownHeader>Filtrer par personne assignée</DropdownHeader>
              {OWNER_KEYS.map((k) => (
                <DropdownItem
                  key={k}
                  selected={activeOwners.has(k)}
                  onClick={() => toggleOwner(k)}
                  keepOpen
                >
                  <span className="flex items-center gap-2">
                    <OwnerAvatar owner={OWNERS[k]} size={18} />
                    {OWNERS[k].name}
                  </span>
                </DropdownItem>
              ))}
            </>
          )}
        </ColPill>

        {/* Période — single-select */}
        <ColPill
          name="période"
          label={RANGE_LABELS[range]}
          active={range !== DEFAULT_RANGE}
          value={range}
          onChange={(v) => setRange(v as Range)}
          items={[
            { value: "3m",  label: RANGE_LABELS["3m"] },
            { value: "6m",  label: RANGE_LABELS["6m"] },
            { value: "12m", label: RANGE_LABELS["12m"] },
            { value: "all", label: RANGE_LABELS.all },
          ]}
        />

        {hasActiveFilters && (
          <Tooltip label="Réinitialiser les filtres" side="top" portal>
            <button
              onClick={resetFilters}
              aria-label="Réinitialiser les filtres"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </Tooltip>
        )}

        <div className="ml-auto">
          <Button variant="primary" size="sm" onClick={() => {/* C1 hook */}}>
            Exporter en PDF
          </Button>
        </div>
      </div>

      {/* ════════ Tableau DS ════════ */}
      <TableWide<HistoryAction>
        columns={columns}
        data={filteredActions}
        rowKey={(r) => r.id}
        onRowClick={(r) => router.push(r.targetUrl)}
        emptyState={
          <div className="rounded-2xl border border-[var(--border-subtle)] px-6 py-16 text-center text-[14px] text-[var(--text-muted)]">
            {search
              ? `Aucune action ne contient « ${search} ».`
              : "Aucune action livrée sur cette période avec ces filtres."}
          </div>
        }
      />
    </div>
  );
}
