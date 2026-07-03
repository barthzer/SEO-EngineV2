"use client";

/**
 * OpportunitesView — onglet "Opportunités" du projet (tab=opportunites).
 *
 * Le hub d'actions : centralise TOUTES les actions à mener sur le projet,
 * tous leviers confondus (on-page, contenu, netlinking, technique,
 * Visibilité IA), priorisées par impact et regroupées par statut.
 *
 * Deux niveaux :
 *   - Board : cartes épurées (catégorie + titre + sous-titre), groupées par
 *     statut, filtrables par catégorie (panneau gauche) / priorité / owner.
 *   - Détail : au clic, une page pleine largeur (back + pager + métadonnées
 *     éditables + checklist "comment faire" + rationale + suivi client).
 *
 * Prospectif : le backlog + l'en-cours. Le rétrospectif (livré) vit dans
 * l'onglet Suivi (HistoriqueView), source du rapport mensuel client.
 *
 * V1 : données mock + état local. Persistance réelle = tâche B1b.
 */

import { useMemo, useState, useEffect, type ElementType } from "react";
import { createPortal } from "react-dom";
import { DocumentTextIcon, PencilSquareIcon, LinkIcon, WrenchIcon, SparklesIcon } from "@heroicons/react/24/solid";
import { type ActionOwner, type ActionPriorityLevel } from "@/components/ActionCard";
import { type Status, STATUS_ORDER, STATUS_CONFIG, StatusPillDropdown } from "@/components/StatusPill";
import { TableWide } from "@/components/TableWide";
import { PriorityBadge, PRIORITY_LEVELS } from "@/components/PriorityBars";
import { CommentThread } from "@/components/CommentThread";
import { SearchInput } from "@/components/SearchInput";
import { ColPill } from "@/components/ColPill";
import { ResetFiltersButton } from "@/components/ResetFiltersButton";
import { DropdownMenu, DropdownHeader, DropdownItem } from "@/components/DropdownMenu";
import { TAB_SUBTITLES } from "@/components/analyse/constants";
import { pravatarUrl } from "@/lib/avatar";
import { ChevronRight, ChevronLeft, ChevronDown, ArrowLeft, Calendar, Check, List, Columns3, Globe, FileText, X, Repeat } from "lucide-react";

/* ════════════════════════════════════════════════════════════════════════
   TYPES + MOCK DATA
   ══════════════════════════════════════════════════════════════════════ */

type ActionModule = "onpage" | "contenu" | "netlinking" | "technique" | "geo";

const MODULE_CONFIG: Record<ActionModule, { label: string; color: string; icon: ElementType }> = {
  onpage:     { label: "On-page",       color: "#3D4FFF", icon: DocumentTextIcon },
  contenu:    { label: "Contenu",       color: "#10B981", icon: PencilSquareIcon },
  netlinking: { label: "Netlinking",    color: "#F59E0B", icon: LinkIcon },
  technique:  { label: "Technique",     color: "#8B5CF6", icon: WrenchIcon },
  geo:        { label: "Visibilité IA", color: "#EC4899", icon: SparklesIcon },
};
const MODULE_ORDER: ActionModule[] = ["onpage", "contenu", "netlinking", "technique", "geo"];

// Owners alignés sur TEAM (/equipe) — mêmes seeds pravatar que le reste de l'app.
const OWNERS: Record<string, ActionOwner> = {
  bl: { id: "bl", name: "Barthélemy L.", initials: "BL", photoSeed: "barthelemy-l-seo" },
  sm: { id: "sm", name: "Sophie M.",     initials: "SM", photoSeed: "5" },
  tl: { id: "tl", name: "Thomas L.",     initials: "TL", photoSeed: "thomas-l-seo" },
  mp: { id: "mp", name: "Marie P.",      initials: "MP", photoSeed: "marie-p-seo" },
};
const ALL_OWNERS: ActionOwner[] = Object.values(OWNERS);

type Opportunity = {
  id: string;
  module: ActionModule;
  priority: ActionPriorityLevel;
  title: string;
  description: string;
  rationale: string;
  steps?: string[];
  time?: string;
  impact?: string;
  ownerKey?: keyof typeof OWNERS;
  deadline?: string;
  status: Status;
};

const OPPORTUNITIES: Opportunity[] = [
  {
    id: "o1", module: "onpage", priority: "high", status: "todo",
    title: "Réécrire les balises title des 8 pages en page 2",
    description: "8 pages positionnées #11 à #20 avec un CTR sous la médiane. Une title plus incitative peut les faire basculer en page 1.",
    rationale: "Les pages en page 2 captent presque tout leur potentiel de trafic dès qu'elles passent en page 1. Agir sur la title est le levier le plus rapide et le moins coûteux pour déclencher ce basculement.",
    steps: ["Extraire les 8 requêtes cibles depuis la GSC", "Réécrire chaque title avec le mot-clé en tête et un bénéfice", "Vérifier la longueur (moins de 60 caractères) et l'unicité", "Redéployer et suivre la position sur 3 semaines"],
    time: "2 h", impact: "+8 à +12 positions estimées", ownerKey: "sm", deadline: "2026-07-08",
  },
  {
    id: "o2", module: "contenu", priority: "high", status: "todo",
    title: "Créer l'article \"ROI content marketing B2B\"",
    description: "Trou de couverture identifié par l'analyse EMC : forte demande, aucun contenu propriétaire. Les concurrents sont tous positionnés.",
    rationale: "La demande existe et aucun contenu propriétaire ne la capte aujourd'hui. Créer cette page nous positionne sur une requête à fort volume avant que les concurrents ne consolident leur avance.",
    time: "6 h", impact: "+1 200 visites/mois estimées", ownerKey: "mp", deadline: "2026-07-15",
  },
  {
    id: "o3", module: "technique", priority: "high", status: "in_progress",
    title: "Corriger les 87 pages en erreur 404 dans le sitemap",
    description: "Le sitemap déclare 87 URLs qui renvoient un 404. Gaspillage de budget de crawl et signal de qualité négatif.",
    rationale: "Chaque 404 déclarée dans le sitemap gaspille du budget de crawl et dégrade la confiance de Google dans le site. Le correctif est rapide, sans risque, et débloque le crawl des pages utiles.",
    time: "3 h", impact: "Budget de crawl récupéré", ownerKey: "tl", deadline: "2026-07-03",
  },
  {
    id: "o4", module: "netlinking", priority: "mid", status: "todo",
    title: "Acquérir 3 backlinks DR 50+ sur le cluster \"tarifs\"",
    description: "La page tarifs plafonne faute d'autorité entrante. Cibler 3 médias B2B pour un lien contextuel.",
    rationale: "La page tarifs convertit bien mais manque d'autorité pour ranker sur ses requêtes commerciales. Quelques liens contextuels de qualité suffisent souvent à débloquer sa progression.",
    time: "5 h", impact: "+3 RefDom haute autorité", ownerKey: "bl", deadline: "2026-07-22",
  },
  {
    id: "o5", module: "geo", priority: "high", status: "todo",
    title: "Optimiser la page \"comparatif\" pour les réponses IA",
    description: "La marque est absente des réponses ChatGPT et Perplexity sur la requête comparatif, alors que 3 concurrents y sont cités.",
    rationale: "Les réponses IA deviennent une source de trafic clé et la marque en est absente sur une requête commerciale à forte intention. Structurer la page pour la rendre citable capte ce nouveau canal.",
    steps: ["Structurer la page en questions/réponses explicites", "Ajouter un tableau comparatif balisé", "Intégrer des données chiffrées citables", "Re-tester les prompts cibles à J+15"],
    time: "4 h", impact: "Entrée dans le top 3 des citations", ownerKey: "sm", deadline: "2026-07-18",
  },
  {
    id: "o6", module: "onpage", priority: "mid", status: "in_progress",
    title: "Ajouter un maillage interne vers les 5 pages piliers",
    description: "Pages piliers sous-maillées (moins de 4 liens internes). Renforcer depuis les articles de blog à fort trafic.",
    rationale: "Le maillage interne concentre l'autorité sur les pages stratégiques. C'est une action à faible effort dont l'effet se cumule sur l'ensemble du cocon sémantique.",
    time: "2 h", impact: "Distribution du PageRank interne", ownerKey: "mp", deadline: "2026-07-10",
  },
  {
    id: "o7", module: "contenu", priority: "mid", status: "blocked_client",
    title: "Refondre la page \"À propos\" (E-E-A-T)",
    description: "Manque de signaux d'expertise et d'autorité. En attente des bios équipe et des certifications côté client.",
    rationale: "Les signaux E-E-A-T pèsent sur la confiance perçue par Google et par les moteurs IA, surtout sur un secteur concurrentiel où l'autorité fait la différence.",
    time: "3 h", impact: "Signaux E-E-A-T renforcés", ownerKey: "bl", deadline: "2026-07-25",
  },
  {
    id: "o8", module: "technique", priority: "mid", status: "todo",
    title: "Améliorer le LCP mobile sous 2,5 s",
    description: "LCP mobile à 3,8 s sur les templates produit. Précharger l'image hero et différer le JS non critique.",
    rationale: "Un LCP mobile élevé pénalise à la fois le classement et le taux de rebond. Le gain est mesurable, durable, et profite à toutes les pages partageant le template.",
    time: "4 h", impact: "Core Web Vitals au vert", ownerKey: "tl", deadline: "2026-07-30",
  },
  {
    id: "o9", module: "geo", priority: "mid", status: "todo",
    title: "Publier une FAQ balisée sur les 4 requêtes IA prioritaires",
    description: "Les moteurs IA privilégient les formats question/réponse. Couvrir 4 questions récurrentes non traitées aujourd'hui.",
    rationale: "Le format question/réponse est le plus repris par les moteurs IA. Couvrir les questions manquantes multiplie mécaniquement les occasions d'être cité.",
    time: "3 h", impact: "Nouvelles occasions de citation", ownerKey: "sm", deadline: "2026-08-05",
  },
  {
    id: "o10", module: "netlinking", priority: "low", status: "todo",
    title: "Nettoyer 18 backlinks toxiques (disavow)",
    description: "18 domaines DR inférieur à 10 à thématique douteuse repérés via Majestic. Fichier de désaveu à soumettre.",
    rationale: "Un profil de liens sain protège le site des filtres algorithmiques. Le nettoyage est préventif, peu coûteux, et évite une pénalité bien plus difficile à corriger.",
    time: "1 h", impact: "Profil de liens assaini", ownerKey: "bl", deadline: "2026-08-12",
  },
  {
    id: "o11", module: "contenu", priority: "low", status: "todo",
    title: "Mettre à jour les 12 articles obsolètes (> 18 mois)",
    description: "12 articles à trafic déclinant. Rafraîchir les données, les exemples et l'année cible pour relancer la pertinence.",
    rationale: "Rafraîchir un contenu existant coûte bien moins cher qu'en créer un nouveau et relance souvent un trafic en déclin en quelques semaines.",
    time: "5 h", impact: "Trafic historique préservé", ownerKey: "mp", deadline: "2026-08-20",
  },
];

const PRIORITY_ORDER: ActionPriorityLevel[] = ["high", "mid", "low"];

/* ── Helpers UI partagés ─────────────────────────────────────────────── */

/* ── Métadonnées mock : ancienneté (jours) + page liée (slug) par action ──
   - ancienneté → prioriser « nouveau vs ancien » à l'arrivée sur la vue ;
   - page liée absente = action globale au site (netlinking/technique site-wide). */
const ACTION_AGE_DAYS: Record<string, number> = {
  o1: 1, o2: 2, o3: 11, o4: 5, o5: 1, o6: 14, o7: 20, o8: 7, o9: 3, o10: 24, o11: 9,
};
const ACTION_PAGE_URL: Record<string, string> = {
  o1: "/blog", o2: "/solutions/comparatif", o4: "/tarifs", o5: "/comparatif",
  o7: "/a-propos", o9: "/guide-visibilite-ia", o11: "/blog/refresh-2026",
};
const fmtAge = (d: number) => (d <= 0 ? "aujourd'hui" : d === 1 ? "hier" : `il y a ${d} j`);
const byAge = (a: Opportunity, b: Opportunity) => (ACTION_AGE_DAYS[a.id] ?? 99) - (ACTION_AGE_DAYS[b.id] ?? 99);

function OwnerAvatar({ owner, size = 22 }: { owner: ActionOwner; size?: number }) {
  const [errored, setErrored] = useState(false);
  if (errored || !owner.photoSeed) {
    return (
      <span
        className="flex flex-shrink-0 items-center justify-center rounded-full bg-[var(--bg-subtle)] font-semibold text-[var(--text-secondary)]"
        style={{ width: size, height: size, fontSize: size * 0.4 }}
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

/** Chip de catégorie — même fond neutre que le badge priorité, icône colorée à gauche. */
function CategoryChip({ module }: { module: ActionModule }) {
  const cfg = MODULE_CONFIG[module];
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-subtle)] px-2 py-1 text-[12px] font-medium text-[var(--text-primary)]">
      <Icon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--text-muted)]" />
      {cfg.label}
    </span>
  );
}

const fmtDeadline = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

/** Onglet catégorie (style rangée de sidebar) — sélection unique. */
function CategoryTab({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-9 items-center justify-between gap-2 rounded-xl px-3 text-[14px] font-medium transition-colors ${
        active
          ? "bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]"
          : "text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
      }`}
    >
      <span className="truncate">{label}</span>
      <span className={`flex-shrink-0 text-[13px] tabular-nums ${active ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)]"}`}>{count}</span>
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   CARTE (board)
   ══════════════════════════════════════════════════════════════════════ */

/** Tag de portée : page liée (slug) ou action globale au site. */
function ScopeTag({ pageUrl }: { pageUrl?: string }) {
  return pageUrl ? (
    <span className="inline-flex min-w-0 items-center gap-1 rounded-md bg-[var(--bg-subtle)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-secondary)]">
      <FileText className="h-3 w-3 flex-shrink-0" />
      <span className="truncate">{pageUrl}</span>
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-md bg-[var(--bg-subtle)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-secondary)]">
      <Globe className="h-3 w-3" />
      Site global
    </span>
  );
}

function OpportunityCard({
  o,
  owner,
  onOpen,
  draggable,
  onDragStart,
}: {
  o: Opportunity;
  owner?: ActionOwner;
  onOpen: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}) {
  const ageDays = ACTION_AGE_DAYS[o.id] ?? 30;
  return (
    <button
      type="button"
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onOpen}
      className={`group flex w-full flex-col gap-2.5 rounded-2xl border border-[var(--border-subtle)] px-4 py-4 text-left transition-colors hover:border-[var(--border-medium)] ${draggable ? "cursor-grab bg-[var(--bg-primary)] active:cursor-grabbing" : "bg-[var(--bg-card)]"}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <CategoryChip module={o.module} />
          <PriorityBadge level={o.priority} />
        </div>
        <div className="flex flex-shrink-0 items-center gap-2.5">
          {owner && <OwnerAvatar owner={owner} size={22} />}
          <ChevronRight className="h-4 w-4 text-[var(--text-muted)] transition-colors group-hover:text-[var(--text-primary)]" />
        </div>
      </div>
      <div>
        <p className="text-[14px] font-semibold leading-snug text-[var(--text-primary)]">{o.title}</p>
        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-[var(--text-muted)]">{o.description}</p>
      </div>
      <div className="flex items-center justify-between gap-2">
        <ScopeTag pageUrl={ACTION_PAGE_URL[o.id]} />
        <span className="flex flex-shrink-0 items-center gap-1 text-[11px] text-[var(--text-muted)]">
          <Calendar className="h-3 w-3" />
          {fmtAge(ageDays)}
        </span>
      </div>
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   DÉTAIL (page pleine largeur)
   ══════════════════════════════════════════════════════════════════════ */

/* Récurrence — one-shot vs récurrent (config type Qatalog « Repeat »). */
const RECURRENCE_OPTIONS: { value: string; label: string }[] = [
  { value: "none",      label: "Ne se répète pas" },
  { value: "weekly",    label: "Chaque semaine" },
  { value: "monthly",   label: "Chaque mois" },
  { value: "quarterly", label: "Chaque trimestre" },
];
const recurrenceLabel = (v: string) => RECURRENCE_OPTIONS.find((o) => o.value === v)?.label ?? "Ne se répète pas";

/** Ligne du panneau latéral droit (label gauche · valeur droite). */
function PanelRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-[44px] items-center justify-between gap-3 border-b border-[var(--border-subtle)] py-2.5 last:border-0">
      <span className="flex-shrink-0 text-[13px] text-[var(--text-secondary)]">{label}</span>
      <div className="flex min-w-0 items-center justify-end text-right">{children}</div>
    </div>
  );
}

function OwnerPickerInline({ owner, onChange }: { owner?: ActionOwner; onChange: (o: ActionOwner | undefined) => void }) {
  return (
    <DropdownMenu
      width={220}
      trigger={
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full px-1.5 py-1 text-[13px] text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-card-hover)]"
        >
          {owner ? (
            <>
              <OwnerAvatar owner={owner} size={22} />
              <span>{owner.name}</span>
            </>
          ) : (
            <span className="text-[var(--text-muted)]">Assigner</span>
          )}
          <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)]" />
        </button>
      }
    >
      <DropdownHeader>Assigner à</DropdownHeader>
      {ALL_OWNERS.map((c) => (
        <DropdownItem key={c.id} selected={owner?.id === c.id} onClick={() => onChange(c)}>
          <span className="inline-flex items-center gap-2">
            <OwnerAvatar owner={c} size={20} />
            <span className="text-[13px] text-[var(--text-primary)]">{c.name}</span>
          </span>
        </DropdownItem>
      ))}
      {owner && (
        <>
          <div className="my-1 h-px bg-[var(--border-subtle)]" />
          <DropdownItem onClick={() => onChange(undefined)}>
            <span className="text-[12px] text-[var(--text-muted)]">Retirer l&apos;assignation</span>
          </DropdownItem>
        </>
      )}
    </DropdownMenu>
  );
}

function DeadlineInline({ deadline, onChange }: { deadline?: string; onChange: (d: string | undefined) => void }) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <input
        type="date"
        autoFocus
        defaultValue={deadline}
        onChange={(e) => onChange(e.target.value || undefined)}
        onBlur={() => setEditing(false)}
        className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-2 py-1 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--border-medium)]"
      />
    );
  }
  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="inline-flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-[13px] text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-card-hover)]"
    >
      <Calendar className="h-3.5 w-3.5 text-[var(--text-muted)]" />
      {deadline ? fmtDeadline(deadline) : <span className="text-[var(--text-muted)]">Ajouter</span>}
    </button>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 pt-6">
      <h2 className="text-[15px] font-semibold tracking-subheading text-[var(--text-primary)]">{title}</h2>
      {children}
    </section>
  );
}

function OpportunityDetail({
  o, owner, deadline, status, checked, narrative, recurrence, creator,
  onToggleStep, onStatusChange, onOwnerChange, onDeadlineChange, onNarrativeChange, onRecurrenceChange,
  onBack, index, total, onPrev, onNext,
}: {
  o: Opportunity;
  owner?: ActionOwner;
  deadline?: string;
  status: Status;
  checked: Set<number>;
  narrative: string;
  recurrence: string;
  creator: ActionOwner;
  onToggleStep: (i: number) => void;
  onStatusChange: (s: Status) => void;
  onOwnerChange: (o: ActionOwner | undefined) => void;
  onDeadlineChange: (d: string | undefined) => void;
  onNarrativeChange: (v: string) => void;
  onRecurrenceChange: (v: string) => void;
  onBack: () => void;
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const [localNarrative, setLocalNarrative] = useState(narrative);
  const [scrolled, setScrolled] = useState(false);
  // Animation d'apparition (fondu + léger scale), façon PromptModal.
  const [visible, setVisible] = useState(false);
  useEffect(() => { const id = setTimeout(() => setVisible(true), 10); return () => clearTimeout(id); }, []);
  const steps = o.steps ?? [
    `Auditer la situation : ${o.title.toLowerCase()}`,
    "Définir les changements précis à apporter (page, balise, contenu)",
    "Implémenter puis valider via GSC ou un crawl",
    "Mesurer l'impact sur 2 à 4 semaines",
  ];

  // Journal d'activité (mock) — qui a fait quoi / quand, façon Notion.
  const activity: { who?: ActionOwner; text: React.ReactNode; when: string }[] = [
    { who: owner, text: <>a changé le statut en <span className="font-medium text-[var(--text-primary)]">{STATUS_CONFIG[status].label}</span></>, when: "il y a 1 min" },
    { who: owner, text: "s'est assigné cette action", when: "il y a 2 min" },
    { who: creator, text: "a créé cette action", when: "il y a 3 min" },
  ];

  return createPortal(
    <div className={`fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`} onClick={onBack}>
      <div onClick={(e) => e.stopPropagation()} className={`flex max-h-[88vh] w-full max-w-[1000px] overflow-hidden rounded-2xl bg-[var(--modal-bg)] shadow-[var(--shadow-floating)] transition-all duration-200 ease-out ${visible ? "opacity-100 scale-100" : "opacity-0 scale-[0.97]"}`}>

        {/* ── Colonne gauche — contenu scrollable ── */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header : retour + pager (même composant que la modale URL) */}
          <div className="flex flex-shrink-0 items-center justify-between px-6 py-4">
            <button type="button" onClick={onBack} aria-label="Retour à la liste" className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-1">
              <button type="button" onClick={onPrev} disabled={index === 0} aria-label="Action précédente" className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-30">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button type="button" onClick={onNext} disabled={index === total - 1} aria-label="Action suivante" className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-30">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Titre + sous-titre — header fixe (hors scroll) ; bordure + bande d'ombre (même dégradé que les colonnes figées du tableau, adapté vertical) au scroll. */}
          <div className="relative z-10 flex-shrink-0 border-b border-[var(--border-subtle)] px-7 pb-4 pt-1">
            <ScopeTag pageUrl={ACTION_PAGE_URL[o.id]} />
            <h1 className="mt-2 text-[22px] font-semibold leading-tight tracking-heading text-[var(--text-primary)]">{o.title}</h1>
            <p className="mt-2 text-[14px] leading-relaxed text-[var(--text-secondary)]">{o.description}</p>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-6"
              style={{ transform: "translateY(100%)", background: "linear-gradient(to bottom, rgba(2,6,23,0.07), rgba(2,6,23,0.02) 55%, transparent)", opacity: scrolled ? 1 : 0, transition: "opacity 140ms ease" }}
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-7 pb-8" onScroll={(e) => { const s = e.currentTarget.scrollTop > 2; setScrolled((p) => (p === s ? p : s)); }}>
            {/* Sous-tâches — comment réaliser cette action */}
            <DetailSection title="Sous-tâches">
              <ol className="flex flex-col gap-3">
                {steps.map((s, i) => {
                  const done = checked.has(i);
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <button type="button" onClick={() => onToggleStep(i)} aria-pressed={done}
                        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border transition-colors ${done ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-white" : "border-[var(--border-medium)] text-transparent hover:border-[var(--accent-primary)]"}`}>
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </button>
                      <span className={`text-[14px] leading-relaxed ${done ? "text-[var(--text-muted)] line-through" : "text-[var(--text-primary)]"}`}>{s}</span>
                    </li>
                  );
                })}
              </ol>
            </DetailSection>

            {/* Pourquoi cette action */}
            <DetailSection title="Pourquoi cette action">
              <p className="text-[14px] leading-relaxed text-[var(--text-secondary)]">{o.rationale}</p>
            </DetailSection>

            {/* Suivi client — narratif */}
            <DetailSection title="Suivi client">
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-medium text-[var(--text-secondary)]">Narratif client (pour le rapport mensuel)</span>
                <textarea value={localNarrative} onChange={(e) => setLocalNarrative(e.target.value)} onBlur={() => localNarrative !== narrative && onNarrativeChange(localNarrative)}
                  placeholder="Comment expliquer cette action à votre client en 2 phrases business…" rows={2}
                  className="w-full resize-y rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-[13px] leading-relaxed text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] focus:border-[var(--border-medium)]" />
              </label>
            </DetailSection>

            {/* Commentaires — CommentThread porte son propre en-tête */}
            <section className="pt-6">
              <CommentThread target={{ type: "action", id: o.id, label: o.title }} />
            </section>

            {/* Activité — journal des logs de l'action */}
            <DetailSection title="Activité">
              <ul className="flex flex-col gap-4">
                {activity.map((a, i) => (
                  <li key={i} className="flex gap-3">
                    {a.who && <OwnerAvatar owner={a.who} size={26} />}
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] leading-snug text-[var(--text-secondary)]">
                        <span className="font-medium text-[var(--text-primary)]">{a.who?.name}</span> {a.text}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{a.when}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </DetailSection>
          </div>
        </div>

        {/* ── Colonne droite — panneau infos fixe ── */}
        <div className="flex w-[320px] flex-shrink-0 flex-col border-l border-[var(--border-subtle)] bg-[var(--bg-card-static)]">
          <div className="flex flex-shrink-0 items-center justify-end px-5 py-4">
            <button type="button" onClick={onBack} aria-label="Fermer" className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
            <PanelRow label="Statut"><StatusPillDropdown status={status} onChange={onStatusChange} /></PanelRow>
            <PanelRow label="Catégorie"><CategoryChip module={o.module} /></PanelRow>
            <PanelRow label="Assigné à"><OwnerPickerInline owner={owner} onChange={onOwnerChange} /></PanelRow>
            <PanelRow label="Échéance"><DeadlineInline deadline={deadline} onChange={onDeadlineChange} /></PanelRow>
            <PanelRow label="Créateur">
              <span className="inline-flex items-center gap-2 rounded-full px-1.5 py-1 text-[13px] text-[var(--text-primary)]">
                <OwnerAvatar owner={creator} size={22} />
                <span>{creator.name}</span>
              </span>
            </PanelRow>
            {o.time && <PanelRow label="Effort estimé"><span className="text-[13px] font-medium tabular-nums text-[var(--text-primary)]">{o.time}</span></PanelRow>}
            <PanelRow label="Priorité"><PriorityBadge level={o.priority} /></PanelRow>
            <PanelRow label="Récurrence">
              <DropdownMenu width={200} trigger={
                <button type="button" className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[13px] text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-card-hover)]">
                  <Repeat className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                  {recurrenceLabel(recurrence)}
                  <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                </button>
              }>
                <DropdownHeader>Récurrence</DropdownHeader>
                {RECURRENCE_OPTIONS.map((opt) => (
                  <DropdownItem key={opt.value} selected={recurrence === opt.value} onClick={() => onRecurrenceChange(opt.value)}>{opt.label}</DropdownItem>
                ))}
              </DropdownMenu>
            </PanelRow>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ════════════════════════════════════════════════════════════════════════
   MAIN VIEW
   ══════════════════════════════════════════════════════════════════════ */

export function OpportunitesView({ domain }: { domain: string }) {
  void domain; // réservé pour le scope projet (persistance B1b)

  const [search, setSearch] = useState("");
  const [activeModule, setActiveModule] = useState<ActionModule | null>(null); // catégorie = sélection unique (onglets)
  const [activePriorities, setActivePriorities] = useState<Set<ActionPriorityLevel>>(new Set());
  const [activeStatuses, setActiveStatuses] = useState<Set<Status>>(new Set());
  const [activeOwners, setActiveOwners] = useState<Set<string>>(new Set());

  // État éditable par action.
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [owners, setOwners] = useState<Record<string, ActionOwner | undefined>>({});
  const [deadlines, setDeadlines] = useState<Record<string, string | undefined>>({});
  const [narratives, setNarratives] = useState<Record<string, string>>({});
  const [checkedSteps, setCheckedSteps] = useState<Record<string, Set<number>>>({});
  const [recurrences, setRecurrences] = useState<Record<string, string>>({});

  // Détail ouvert (page pleine largeur).
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Vue board : liste (groupée) ou kanban (colonnes + drag & drop).
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [dragOverCol, setDragOverCol] = useState<Status | null>(null);
  // Colonnes kanban actuellement scrollées → ombre sous l'en-tête figé.
  const [scrolledCols, setScrolledCols] = useState<Record<string, boolean>>({});
  const moveAction = (id: string, status: Status) => setStatuses((prev) => ({ ...prev, [id]: status }));

  const statusOf = (o: Opportunity): Status => statuses[o.id] ?? o.status;
  const ownerOf = (o: Opportunity): ActionOwner | undefined =>
    o.id in owners ? owners[o.id] : o.ownerKey ? OWNERS[o.ownerKey] : undefined;
  const deadlineOf = (o: Opportunity): string | undefined => (o.id in deadlines ? deadlines[o.id] : o.deadline);

  const hasActiveFilters =
    search.trim() !== "" || activeModule !== null || activePriorities.size > 0 || activeStatuses.size > 0 || activeOwners.size > 0;

  function resetFilters() {
    setSearch("");
    setActiveModule(null);
    setActivePriorities(new Set());
    setActiveStatuses(new Set());
    setActiveOwners(new Set());
  }

  function toggleFrom<T>(setter: React.Dispatch<React.SetStateAction<Set<T>>>, v: T) {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      return next;
    });
  }

  function toggleStep(id: string, i: number) {
    setCheckedSteps((prev) => {
      const set = new Set(prev[id] ?? []);
      if (set.has(i)) set.delete(i);
      else set.add(i);
      return { ...prev, [id]: set };
    });
  }

  /* ── Filtrage : base (recherche + priorité + owner), puis catégorie ── */
  const baseFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return OPPORTUNITIES.filter((o) => {
      if (activePriorities.size > 0 && !activePriorities.has(o.priority)) return false;
      if (activeStatuses.size > 0 && !activeStatuses.has(statuses[o.id] ?? o.status)) return false;
      if (activeOwners.size > 0) {
        const ow = o.id in owners ? owners[o.id] : o.ownerKey ? OWNERS[o.ownerKey] : undefined;
        if (!ow || !activeOwners.has(ow.id)) return false;
      }
      if (q && !`${o.title} ${o.description}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, activePriorities, activeStatuses, statuses, activeOwners, owners]);

  const filtered = useMemo(
    () => baseFiltered.filter((o) => !activeModule || o.module === activeModule),
    [baseFiltered, activeModule],
  );

  const moduleCounts = useMemo(() => {
    const c = { onpage: 0, contenu: 0, netlinking: 0, technique: 0, geo: 0 } as Record<ActionModule, number>;
    for (const o of baseFiltered) c[o.module]++;
    return c;
  }, [baseFiltered]);

  /* ── Regroupement par statut (ordre canonique, groupes vides masqués) ── */
  const groups = useMemo(() => {
    return STATUS_ORDER.map((s) => ({
      status: s,
      items: filtered.filter((o) => statusOf(o) === s).sort(byAge),
    })).filter((g) => g.items.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, statuses]);

  // Colonnes kanban : tous les statuts (colonnes vides conservées comme cibles de drop).
  const kanbanColumns = useMemo(
    () => STATUS_ORDER.map((s) => ({ status: s, items: filtered.filter((o) => statusOf(o) === s).sort(byAge) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtered, statuses],
  );

  // Liste ordonnée à plat (ordre du board) — pour le pager du détail.
  const ordered = useMemo(() => groups.flatMap((g) => g.items), [groups]);


  /* ── Labels dynamiques des ColPill multi-select ── */
  const priorityLabel =
    activePriorities.size === 0 ? "Priorité"
      : activePriorities.size === 1 ? PRIORITY_LEVELS[Array.from(activePriorities)[0]].label
        : `Priorité · ${activePriorities.size}`;
  const statusLabel =
    activeStatuses.size === 0 ? "Statut"
      : activeStatuses.size === 1 ? STATUS_CONFIG[Array.from(activeStatuses)[0]].label
        : `Statut · ${activeStatuses.size}`;
  const ownerLabel =
    activeOwners.size === 0 ? "Assigné à"
      : activeOwners.size === 1 ? (ALL_OWNERS.find((o) => o.id === Array.from(activeOwners)[0])?.name ?? "Assigné à")
        : `Assigné à · ${activeOwners.size}`;
  const categoryLabel = activeModule ? MODULE_CONFIG[activeModule].label : "Catégorie";

  /* ══════════════ DÉTAIL (modale superposée au board) ══════════════ */
  const selected = selectedId ? OPPORTUNITIES.find((o) => o.id === selectedId) : undefined;
  const detailList = ordered.length > 0 ? ordered : OPPORTUNITIES;
  const detailIndex = selected ? detailList.findIndex((o) => o.id === selected.id) : -1;
  const detailModal = selected && detailIndex >= 0 ? (
    <OpportunityDetail
      key={selected.id}
      o={selected}
      owner={ownerOf(selected)}
      deadline={deadlineOf(selected)}
      status={statusOf(selected)}
      checked={checkedSteps[selected.id] ?? new Set()}
      narrative={narratives[selected.id] ?? ""}
      recurrence={recurrences[selected.id] ?? "none"}
      creator={OWNERS.bl}
      onToggleStep={(step) => toggleStep(selected.id, step)}
      onStatusChange={(s) => setStatuses((prev) => ({ ...prev, [selected.id]: s }))}
      onOwnerChange={(next) => setOwners((prev) => ({ ...prev, [selected.id]: next }))}
      onDeadlineChange={(d) => setDeadlines((prev) => ({ ...prev, [selected.id]: d }))}
      onNarrativeChange={(v) => setNarratives((prev) => ({ ...prev, [selected.id]: v }))}
      onRecurrenceChange={(v) => setRecurrences((prev) => ({ ...prev, [selected.id]: v }))}
      onBack={() => setSelectedId(null)}
      index={detailIndex}
      total={detailList.length}
      onPrev={() => detailIndex > 0 && setSelectedId(detailList[detailIndex - 1].id)}
      onNext={() => detailIndex < detailList.length - 1 && setSelectedId(detailList[detailIndex + 1].id)}
    />
  ) : null;

  /* ══════════════ BOARD ══════════════ */
  return (
    <div className={`flex flex-col gap-6 ${viewMode === "kanban" ? "h-[calc(100vh-100px)] overflow-hidden" : ""}`}>

      {/* Titre de la vue (rendu ici pour laisser le détail prendre toute la page) */}
      <div className="flex-shrink-0">
        <h1 className="font-semibold leading-none tracking-heading text-[var(--text-primary)]">Actions</h1>
        <p className="mt-1 text-[14px] tracking-body text-[var(--text-secondary)]">{TAB_SUBTITLES.opportunites}</p>
      </div>

      {/* Toolbar */}
          <div className="flex flex-shrink-0 flex-wrap items-center gap-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Rechercher une action…" alwaysExpanded />

            {/* Catégorie — sélection unique */}
            <ColPill name="catégorie" label={categoryLabel} active={activeModule !== null}>
              {() => (
                <>
                  <DropdownHeader>Filtrer par catégorie</DropdownHeader>
                  <DropdownItem selected={activeModule === null} onClick={() => setActiveModule(null)}>
                    <span className="flex w-full items-center justify-between gap-3">
                      Toutes les catégories
                      <span className="text-[12px] opacity-60">{baseFiltered.length}</span>
                    </span>
                  </DropdownItem>
                  {MODULE_ORDER.map((m) => (
                    <DropdownItem key={m} selected={activeModule === m} onClick={() => setActiveModule(m)}>
                      <span className="flex w-full items-center justify-between gap-3">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: MODULE_CONFIG[m].color }} />
                          {MODULE_CONFIG[m].label}
                        </span>
                        <span className="text-[12px] opacity-60">{moduleCounts[m]}</span>
                      </span>
                    </DropdownItem>
                  ))}
                </>
              )}
            </ColPill>

            {/* Priorité — multi-select */}
            <ColPill name="priorité" label={priorityLabel} active={activePriorities.size > 0}>
              {() => (
                <>
                  <DropdownHeader>Filtrer par priorité</DropdownHeader>
                  {PRIORITY_ORDER.map((p) => (
                    <DropdownItem key={p} selected={activePriorities.has(p)} onClick={() => toggleFrom(setActivePriorities, p)} keepOpen checkbox>
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: PRIORITY_LEVELS[p].color }} />
                        {PRIORITY_LEVELS[p].label}
                      </span>
                    </DropdownItem>
                  ))}
                </>
              )}
            </ColPill>

            {/* Statut — multi-select */}
            <ColPill name="statut" label={statusLabel} active={activeStatuses.size > 0}>
              {() => (
                <>
                  <DropdownHeader>Filtrer par statut</DropdownHeader>
                  {STATUS_ORDER.map((s) => (
                    <DropdownItem key={s} selected={activeStatuses.has(s)} onClick={() => toggleFrom(setActiveStatuses, s)} keepOpen checkbox>
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: STATUS_CONFIG[s].color }} />
                        {STATUS_CONFIG[s].label}
                      </span>
                    </DropdownItem>
                  ))}
                </>
              )}
            </ColPill>

            {/* Assigné à — multi-select avec avatar */}
            <ColPill name="assigné à" label={ownerLabel} active={activeOwners.size > 0}>
              {() => (
                <>
                  <DropdownHeader>Filtrer par personne assignée</DropdownHeader>
                  {ALL_OWNERS.map((o) => (
                    <DropdownItem key={o.id} selected={activeOwners.has(o.id)} onClick={() => toggleFrom(setActiveOwners, o.id)} keepOpen checkbox>
                      <span className="flex items-center gap-2">
                        <OwnerAvatar owner={o} size={18} />
                        {o.name}
                      </span>
                    </DropdownItem>
                  ))}
                </>
              )}
            </ColPill>

            <ResetFiltersButton show={hasActiveFilters} onReset={resetFilters} />

            {/* Switch de vue (icônes) — ferré à droite */}
            <div className="ml-auto flex items-center gap-0.5 rounded-lg border border-[var(--border-subtle)] p-0.5">
              {([["list", List, "Vue liste"], ["kanban", Columns3, "Vue kanban"]] as const).map(([mode, Icon, label]) => (
                <button
                  key={mode}
                  type="button"
                  aria-label={label}
                  onClick={() => setViewMode(mode)}
                  className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                    viewMode === mode
                      ? "bg-[var(--bg-card-static)] text-[var(--text-primary)] shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Board — vue liste (groupée) ou kanban (colonnes + drag & drop) */}
          {groups.length === 0 ? (
            <div className="rounded-2xl border border-[var(--border-subtle)] px-6 py-16 text-center text-[14px] text-[var(--text-muted)]">
              {search ? `Aucune action ne contient « ${search} ».` : "Aucune action avec ces filtres."}
            </div>
          ) : viewMode === "list" ? (
            <TableWide<Opportunity>
              columns={[
                { key: "title", header: "Nom", width: 340, flex: true, render: (o) => <span className="block truncate text-[14px] font-medium text-[var(--text-primary)]" title={o.title}>{o.title}</span> },
                { key: "module", header: "Catégorie", width: 150, render: (o) => <CategoryChip module={o.module} /> },
                { key: "status", header: "Statut", width: 160, render: (o) => <span className="inline-flex" onClick={(e) => e.stopPropagation()}><StatusPillDropdown status={statusOf(o)} onChange={(s) => moveAction(o.id, s)} /></span> },
                { key: "priority", header: "Priorité", width: 120, render: (o) => <PriorityBadge level={o.priority} /> },
                { key: "scope", header: "Portée", width: 150, render: (o) => <ScopeTag pageUrl={ACTION_PAGE_URL[o.id]} /> },
                { key: "owner", header: "Assigné à", width: 180, render: (o) => { const ow = ownerOf(o); return ow ? <span className="inline-flex min-w-0 items-center gap-2"><OwnerAvatar owner={ow} size={22} /><span className="truncate text-[13px] text-[var(--text-primary)]">{ow.name}</span></span> : <span className="text-[13px] text-[var(--text-muted)]">Non assigné</span>; } },
                { key: "age", header: "Créée", width: 120, render: (o) => <span className="whitespace-nowrap text-[13px] text-[var(--text-muted)]">{fmtAge(ACTION_AGE_DAYS[o.id] ?? 30)}</span> },
              ]}
              data={ordered}
              rowKey={(o) => o.id}
              onRowClick={(o) => setSelectedId(o.id)}
              isRowActive={(o) => o.id === selectedId}
              minWidth={1080}
              stickyLeft
              bordered
              hidePagination
            />
          ) : (
            <div className="flex min-h-0 flex-1 gap-4 overflow-x-auto pb-1">
              {kanbanColumns.map((col) => {
                const cfg = STATUS_CONFIG[col.status];
                const over = dragOverCol === col.status;
                const scrolled = scrolledCols[col.status];
                return (
                  <div
                    key={col.status}
                    onDragOver={(e) => { e.preventDefault(); if (dragOverCol !== col.status) setDragOverCol(col.status); }}
                    onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverCol((c) => (c === col.status ? null : c)); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const id = e.dataTransfer.getData("text/plain");
                      if (id) moveAction(id, col.status);
                      setDragOverCol(null);
                    }}
                    className={`flex h-full w-[300px] flex-shrink-0 flex-col overflow-hidden rounded-2xl border transition-colors ${
                      over ? "border-[var(--border-strong)] bg-[var(--bg-subtle)]" : "border-transparent bg-[var(--bg-card-static)]"
                    }`}
                  >
                    {/* En-tête figé — reste visible ; ombre sous l'en-tête au scroll. */}
                    <div
                      className="relative z-10 flex flex-shrink-0 items-center gap-2 px-3.5 pb-2.5 pt-3 transition-shadow"
                      style={scrolled ? { boxShadow: "0 6px 8px -6px rgba(0,0,0,0.18)" } : undefined}
                    >
                      <h2 className="text-[14px] font-semibold tracking-subheading text-[var(--text-primary)]">{cfg.label}</h2>
                      <span className="rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 text-[12px] font-medium tabular-nums text-[var(--text-muted)]">
                        {col.items.length}
                      </span>
                    </div>
                    {/* Liste scrollable interne à la colonne. */}
                    <div
                      onScroll={(e) => {
                        const s = e.currentTarget.scrollTop > 2;
                        setScrolledCols((prev) => (prev[col.status] === s ? prev : { ...prev, [col.status]: s }));
                      }}
                      className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-2.5 pb-2.5 pt-0.5"
                    >
                      {col.items.map((o) => (
                        <OpportunityCard
                          key={o.id}
                          o={o}
                          owner={ownerOf(o)}
                          onOpen={() => setSelectedId(o.id)}
                          draggable
                          onDragStart={(e) => { e.dataTransfer.setData("text/plain", o.id); e.dataTransfer.effectAllowed = "move"; }}
                        />
                      ))}
                      {col.items.length === 0 && (
                        <div className="rounded-xl border border-dashed border-[var(--border-subtle)] py-8 text-center text-[12px] text-[var(--text-muted)]">
                          Déposer ici
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

      {detailModal}
    </div>
  );
}
