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
import { DocumentTextIcon, PencilSquareIcon, LinkIcon, SparklesIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { GaugeGlyph } from "@/components/icons/GaugeGlyph";
import { type ActionOwner, type ActionPriorityLevel } from "@/components/ActionCard";
import { type Status, STATUS_ORDER, STATUS_CONFIG, StatusPillDropdown } from "@/components/StatusPill";
import { OWNERS, OPPORTUNITIES, type Opportunity, type ActionModule } from "@/data/actions";
import { TableWide } from "@/components/TableWide";
import { PriorityBadge, PRIORITY_LEVELS } from "@/components/PriorityBars";
import { DatePopover } from "@/components/DatePopover";
import { CommentThread } from "@/components/CommentThread";
import { useToast } from "@/context/ToastContext";
import { SearchInput } from "@/components/SearchInput";
import { ColPill } from "@/components/ColPill";
import { ResetFiltersButton } from "@/components/ResetFiltersButton";
import { DropdownMenu, DropdownHeader, DropdownItem } from "@/components/DropdownMenu";
import { TAB_SUBTITLES } from "@/components/analyse/constants";
import { pravatarUrl } from "@/lib/avatar";
import { ChevronRight, ChevronLeft, ChevronDown, ArrowLeft, Calendar, Check, List, Columns3, Globe, FileText, X, Repeat, ListTodo, Hourglass, CirclePause, CircleCheck } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { KpiGroup } from "@/components/KpiGroup";
import { RiskBadge } from "@/components/RiskBadge";
import { useRiskGate } from "@/components/RiskConfirmModal";
import { isNewDecision } from "@/data/risk";

/* ════════════════════════════════════════════════════════════════════════
   TYPES + MOCK DATA
   ══════════════════════════════════════════════════════════════════════ */

const MODULE_CONFIG: Record<ActionModule, { label: string; color: string; icon: ElementType }> = {
  onpage:     { label: "On-page",       color: "#3D4FFF", icon: DocumentTextIcon },
  contenu:    { label: "Contenu",       color: "#10B981", icon: PencilSquareIcon },
  netlinking: { label: "Popularité",    color: "#F59E0B", icon: LinkIcon },
  technique:  { label: "Technique",     color: "#8B5CF6", icon: GaugeGlyph },
  geo:        { label: "Visibilité IA", color: "#EC4899", icon: SparklesIcon },
};
const MODULE_ORDER: ActionModule[] = ["onpage", "contenu", "netlinking", "technique", "geo"];

const ALL_OWNERS: ActionOwner[] = Object.values(OWNERS);

const PRIORITY_ORDER: ActionPriorityLevel[] = ["high", "mid", "low"];

/* ── Helpers UI partagés ─────────────────────────────────────────────── */

/* ── Métadonnées mock : ancienneté (jours) + page liée (slug) par action ──
   - ancienneté → prioriser « nouveau vs ancien » à l'arrivée sur la vue ;
   - page liée absente = action globale au site (netlinking/technique site-wide). */
const ACTION_AGE_DAYS: Record<string, number> = {
  o1: 1, o2: 2, o3: 11, o4: 5, o5: 1, o6: 14, o7: 20, o8: 7, o9: 3, o10: 24, o11: 9, o13: 2, o14: 4,
};
const ACTION_PAGE_URL: Record<string, string> = {
  o1: "/blog", o2: "/solutions/comparatif", o4: "/tarifs", o5: "/comparatif",
  o7: "/a-propos", o9: "/guide-visibilite-ia", o11: "/blog/refresh-2026", o13: "/services",
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
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-subtle)] px-2 py-1 type-caption text-[var(--text-primary)]">
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
      className={`flex h-9 items-center justify-between gap-2 rounded-xl px-3 type-body-strong transition-colors ${
        active
          ? "bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]"
          : "text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
      }`}
    >
      <span className="truncate">{label}</span>
      <span className={`flex-shrink-0 type-label tabular-nums ${active ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)]"}`}>{count}</span>
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   CARTE (board)
   ══════════════════════════════════════════════════════════════════════ */

/** Tag de portée : page liée (slug) ou action globale au site. */
function ScopeTag({ pageUrl }: { pageUrl?: string }) {
  return pageUrl ? (
    <span className="inline-flex min-w-0 items-center gap-1 rounded-md bg-[var(--bg-subtle)] px-2 py-0.5 type-micro text-[var(--text-secondary)]">
      <FileText className="h-3 w-3 flex-shrink-0" />
      <span className="truncate">{pageUrl}</span>
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-md bg-[var(--bg-subtle)] px-2 py-0.5 type-micro text-[var(--text-secondary)]">
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
          {o.risk && <RiskBadge level={o.risk.level} undo={o.risk.undo} />}
        </div>
        <div className="flex flex-shrink-0 items-center gap-2.5">
          {owner && <OwnerAvatar owner={owner} size={22} />}
          <ChevronRight className="h-4 w-4 text-[var(--text-muted)] transition-colors group-hover:text-[var(--text-primary)]" />
        </div>
      </div>
      <div>
        <p className="type-body-strong leading-snug">{o.title}</p>
        <p className="mt-1 line-clamp-2 type-body-sm leading-relaxed">{o.description}</p>
      </div>
      <div className="flex items-center justify-between gap-2">
        <ScopeTag pageUrl={ACTION_PAGE_URL[o.id]} />
        <span className="flex flex-shrink-0 items-center gap-1 type-micro">
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
      <span className="flex-shrink-0 type-label">{label}</span>
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
          className="inline-flex items-center gap-2 rounded-full px-1.5 py-1 type-label text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-card-hover)]"
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
            <span className="type-label text-[var(--text-primary)]">{c.name}</span>
          </span>
        </DropdownItem>
      ))}
      {owner && (
        <>
          <div className="my-1 h-px bg-[var(--border-subtle)]" />
          <DropdownItem onClick={() => onChange(undefined)}>
            <span className="type-caption text-[var(--text-muted)]">Retirer l&apos;assignation</span>
          </DropdownItem>
        </>
      )}
    </DropdownMenu>
  );
}

function DeadlineInline({ deadline, onChange }: { deadline?: string; onChange: (d: string | undefined) => void }) {
  return (
    <DatePopover value={deadline} onChange={onChange} align="right" confirm>
      {({ toggle }) => (
        <button
          type="button"
          onClick={toggle}
          className="inline-flex items-center gap-1.5 rounded-lg px-1.5 py-1 type-label text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-card-hover)]"
        >
          <Calendar className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          {deadline ? fmtDeadline(deadline) : <span className="text-[var(--text-muted)]">Ajouter</span>}
        </button>
      )}
    </DatePopover>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 pt-6">
      <h2 className="type-title">{title}</h2>
      {children}
    </section>
  );
}

export function OpportunityDetail({
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
  const { show: showToast } = useToast();
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
            <div className="flex flex-wrap items-center gap-2">
              <ScopeTag pageUrl={ACTION_PAGE_URL[o.id]} />
              {o.risk && <RiskBadge level={o.risk.level} undo={o.risk.undo} />}
            </div>
            <h1 className="mt-2 type-h2">{o.title}</h1>
            <p className="mt-2 type-body leading-relaxed text-[var(--text-secondary)]">{o.description}</p>
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
                      <span className={`type-body leading-relaxed ${done ? "text-[var(--text-muted)] line-through" : ""}`}>{s}</span>
                    </li>
                  );
                })}
              </ol>
            </DetailSection>

            {/* Pourquoi cette action */}
            <DetailSection title="Pourquoi cette action">
              <p className="type-body leading-relaxed text-[var(--text-secondary)]">{o.rationale}</p>
            </DetailSection>

            {/* Suivi client — narratif */}
            <DetailSection title="Suivi client">
              <label className="block">
                <span className="mb-1.5 block type-caption">Narratif client (pour le rapport mensuel)</span>
                <textarea value={localNarrative} onChange={(e) => setLocalNarrative(e.target.value)} onBlur={() => localNarrative !== narrative && onNarrativeChange(localNarrative)}
                  placeholder="Comment expliquer cette action à votre client en 2 phrases business…" rows={2}
                  className="w-full resize-y rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 type-body-sm leading-relaxed text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] focus:border-[var(--border-medium)]" />
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
                      <p className="type-body-sm leading-snug">
                        <span className="font-medium text-[var(--text-primary)]">{a.who?.name}</span> {a.text}
                      </p>
                      <p className="mt-0.5 type-micro">{a.when}</p>
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
            <PanelRow label="Échéance"><DeadlineInline deadline={deadline} onChange={(d) => { onDeadlineChange(d); showToast("Échéance mise à jour", <CheckCircleIcon className="h-5 w-5" />); }} /></PanelRow>
            <PanelRow label="Créateur">
              <span className="inline-flex items-center gap-2 rounded-full px-1.5 py-1 type-label text-[var(--text-primary)]">
                <OwnerAvatar owner={creator} size={22} />
                <span>{creator.name}</span>
              </span>
            </PanelRow>
            {o.time && <PanelRow label="Effort estimé"><span className="type-label tabular-nums text-[var(--text-primary)]">{o.time}</span></PanelRow>}
            <PanelRow label="Priorité"><PriorityBadge level={o.priority} /></PanelRow>
            <PanelRow label="Récurrence">
              <DropdownMenu width={200} trigger={
                <button type="button" className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 type-label text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-card-hover)]">
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

export function OpportunitesView({ domain, initialModule }: { domain: string; initialModule?: string | null }) {
  void domain; // réservé pour le scope projet (persistance B1b)

  // Filtre catégorie initial (ex. arrivée depuis un audit « voir dans les actions »).
  const seedModule = initialModule && initialModule in MODULE_CONFIG ? (initialModule as ActionModule) : null;

  const [search, setSearch] = useState("");
  const [activeModule, setActiveModule] = useState<ActionModule | null>(seedModule); // catégorie = sélection unique (onglets)
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
  /* Changement de statut : confirmation si l'action est coûteuse ou irréversible et
     qu'elle devient décidée (En cours ou Livré). Liste, kanban et détail passent ici. */
  const { gate, modal: riskModal } = useRiskGate();
  const { show: showToast } = useToast();
  const moveAction = (id: string, status: Status) => {
    const o = OPPORTUNITIES.find((x) => x.id === id);
    if (!o) return;
    const needsConfirm = isNewDecision(new Set<Status>(["in_progress", "done"]), statuses[id] ?? o.status, status);
    gate({ risk: o.risk, title: o.title }, needsConfirm, () => {
      setStatuses((prev) => ({ ...prev, [id]: status }));
      if (needsConfirm && o.risk && o.risk.level !== "reversible") showToast("Action marquée comme décidée");
    });
  };

  const statusOf = (o: Opportunity): Status => statuses[o.id] ?? o.status;
  const ownerOf = (o: Opportunity): ActionOwner | undefined =>
    o.id in owners ? owners[o.id] : o.ownerKey ? OWNERS[o.ownerKey] : undefined;
  const deadlineOf = (o: Opportunity): string | undefined => (o.id in deadlines ? deadlines[o.id] : o.deadline);

  /* ── Chiffres clés (projet entier, indépendants des filtres ; suivent les changements de statut) ── */
  const kpi = (() => {
    const by = (s: Status) => OPPORTUNITIES.filter((o) => statusOf(o) === s);
    const todo = by("todo");
    const inProgress = by("in_progress");
    const blocked = by("blocked_client");
    const done = by("done");
    const planned = OPPORTUNITIES.filter((o) => statusOf(o) !== "abandoned").length;
    const people = new Set(inProgress.map((o) => ownerOf(o)?.id).filter(Boolean)).size;
    return {
      todo: todo.length,
      todoHigh: todo.filter((o) => o.priority === "high").length,
      inProgress: inProgress.length,
      people,
      blocked: blocked.length,
      done: done.length,
      donePct: planned > 0 ? Math.round((done.length / planned) * 100) : 0,
    };
  })();

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
      onStatusChange={(s) => moveAction(selected.id, s)}
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
        <h1 className="type-h1 leading-none">Actions</h1>
        <p className="mt-1 type-body text-[var(--text-secondary)]">{TAB_SUBTITLES.opportunites}</p>
      </div>

      {/* Chiffres clés */}
      <div className="flex-shrink-0">
        <KpiGroup columns={4}>
          <KpiCard bare icon={ListTodo}    label="À faire"              value={kpi.todo.toString()}       sub={kpi.todoHigh > 0 ? `dont ${kpi.todoHigh} en priorité haute` : "aucune en priorité haute"} />
          <KpiCard bare icon={Hourglass}   label="En cours"             value={kpi.inProgress.toString()} sub={`${kpi.people} personne${kpi.people > 1 ? "s" : ""} mobilisée${kpi.people > 1 ? "s" : ""}`} />
          <KpiCard bare icon={CirclePause} label="Bloquées côté client" value={kpi.blocked.toString()}    sub="en attente d'un retour client" valueColor={kpi.blocked > 0 ? "var(--color-danger)" : undefined} />
          <KpiCard bare icon={CircleCheck} label="Livrées"              value={kpi.done.toString()}       sub={`${kpi.donePct} % du plan d'action`} />
        </KpiGroup>
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
                      <span className="type-caption opacity-60">{baseFiltered.length}</span>
                    </span>
                  </DropdownItem>
                  {MODULE_ORDER.map((m) => (
                    <DropdownItem key={m} selected={activeModule === m} onClick={() => setActiveModule(m)}>
                      <span className="flex w-full items-center justify-between gap-3">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: MODULE_CONFIG[m].color }} />
                          {MODULE_CONFIG[m].label}
                        </span>
                        <span className="type-caption opacity-60">{moduleCounts[m]}</span>
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
                      <PriorityBadge level={p} />
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
                      ? "bg-[var(--bg-secondary)] text-[var(--text-primary)]"
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
            <div className="rounded-2xl border border-[var(--border-subtle)] px-6 py-16 text-center type-body text-[var(--text-muted)]">
              {search ? `Aucune action ne contient « ${search} ».` : "Aucune action avec ces filtres."}
            </div>
          ) : viewMode === "list" ? (
            <TableWide<Opportunity>
              columns={[
                { key: "title", header: "Nom", width: 340, flex: true, render: (o) => <span className="block truncate type-body-strong" title={o.title}>{o.title}</span> },
                { key: "module", header: "Catégorie", width: 150, render: (o) => <CategoryChip module={o.module} /> },
                { key: "status", header: "Statut", width: 160, render: (o) => <span className="inline-flex" onClick={(e) => e.stopPropagation()}><StatusPillDropdown status={statusOf(o)} onChange={(s) => moveAction(o.id, s)} /></span> },
                { key: "priority", header: "Priorité", width: 120, render: (o) => <PriorityBadge level={o.priority} /> },
                { key: "risk", header: "Risque", width: 120, render: (o) => o.risk ? <RiskBadge level={o.risk.level} undo={o.risk.undo} /> : null },
                { key: "scope", header: "Portée", width: 150, render: (o) => <ScopeTag pageUrl={ACTION_PAGE_URL[o.id]} /> },
                { key: "owner", header: "Assigné à", width: 180, render: (o) => { const ow = ownerOf(o); return ow ? <span className="inline-flex min-w-0 items-center gap-2"><OwnerAvatar owner={ow} size={22} /><span className="truncate type-label text-[var(--text-primary)]">{ow.name}</span></span> : <span className="type-label text-[var(--text-muted)]">Non assigné</span>; } },
                { key: "age", header: "Créée", width: 120, render: (o) => <span className="whitespace-nowrap type-caption text-[var(--text-muted)]">{fmtAge(ACTION_AGE_DAYS[o.id] ?? 30)}</span> },
              ]}
              data={ordered}
              rowKey={(o) => o.id}
              onRowClick={(o) => setSelectedId(o.id)}
              isRowActive={(o) => o.id === selectedId}
              minWidth={1210}
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
                      <h2 className="type-body-strong">{cfg.label}</h2>
                      <span className="rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 type-caption tabular-nums text-[var(--text-muted)]">
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
                        <div className="rounded-xl border border-dashed border-[var(--border-subtle)] py-8 text-center type-caption text-[var(--text-muted)]">
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
      {riskModal}
    </div>
  );
}
