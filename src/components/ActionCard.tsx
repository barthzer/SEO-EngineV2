"use client";

/**
 * ActionCard — l'unité économique d'une presta SEO/GEO en agence.
 *
 * B1 v2 (post-feedback) :
 *
 *  Collapsed row :
 *    [PRIO] · Titre · meta (⏱ time / impact / 🔁 récurrence) · — ·
 *    chevron · owner (cliquable → édition) · deadline (cliquable → édition)
 *    · status dropdown (5 valeurs)
 *
 *  Expanded :
 *    - Description longue (mise en avant)
 *    - Steps "comment faire" (mise en avant)
 *    - Resources optionnelles
 *    - Narratif client (textarea inline) — affiché dès in_progress / done /
 *      blocked_client. PAS d'input "URL preuve" (abandonné).
 *    - Indicateur snapshot impact (placeholder, vrai cycle T+30/60/90 en B1b)
 *
 * Pas de couleur sur la deadline — un consultant juge l'urgence à la
 * lecture, pas via un code couleur rouge anxiogène.
 */

import { useState, useRef, useEffect, type ReactNode } from "react";
import {
  ChevronDown,
  FileText,
  Sparkles,
  Calendar,
  Repeat,
  MessageSquare,
  TrendingUp,
  ChevronDown as CaretDown,
} from "lucide-react";
import { PriorityBadge, type ActionPriorityLevel } from "@/components/PriorityBars";
import { pravatarUrl } from "@/lib/avatar";
import { type Status, StatusPillDropdown } from "@/components/StatusPill";
import { DropdownMenu, DropdownItem, DropdownHeader } from "@/components/DropdownMenu";
import { CommentThread } from "@/components/CommentThread";
import { useToast } from "@/context/ToastContext";

export type { ActionPriorityLevel } from "@/components/PriorityBars";

export type ActionRecurrence = "none" | "weekly" | "monthly" | "quarterly";

const RECURRENCE_LABEL: Record<ActionRecurrence, string> = {
  none: "—",
  weekly: "Hebdo",
  monthly: "Mensuel",
  quarterly: "Trimestriel",
};

/** Libellé pour le picker (none → "Ponctuelle" plus parlant qu'un tiret). */
const RECURRENCE_PICKER_LABEL: Record<ActionRecurrence, string> = {
  none: "Ponctuelle",
  weekly: "Hebdomadaire",
  monthly: "Mensuelle",
  quarterly: "Trimestrielle",
};

const RECURRENCE_OPTIONS: ActionRecurrence[] = ["none", "weekly", "monthly", "quarterly"];

/** Calcule la prochaine échéance d'une action récurrente (base = deadline ou aujourd'hui). */
function nextRecurrenceDate(iso: string | undefined, rec: ActionRecurrence): string {
  const base = iso ? new Date(iso) : new Date();
  if (Number.isNaN(base.getTime())) base.setTime(Date.now());
  if (rec === "weekly") base.setDate(base.getDate() + 7);
  else if (rec === "monthly") base.setMonth(base.getMonth() + 1);
  else if (rec === "quarterly") base.setMonth(base.getMonth() + 3);
  return base.toISOString().slice(0, 10);
}

export type ActionOwner = {
  /** Identifiant stable (slug ou id DB) — utilisé pour le picker. */
  id: string;
  name: string;
  initials: string;
  /** Seed photo pravatar.cc (optionnel — fallback initiales). */
  photoSeed?: string;
};

/** Photo avatar — vraie photo si seed, sinon initiales. */
function OwnerAvatar({ owner, size = 22 }: { owner: ActionOwner; size?: number }) {
  const [errored, setErrored] = useState(false);
  if (owner.photoSeed && !errored) {
    return (
      <img
        src={pravatarUrl(owner.photoSeed, size * 2)}
        alt={owner.name}
        title={owner.name}
        width={size}
        height={size}
        onError={() => setErrored(true)}
        className="flex-shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      title={owner.name}
      className="flex flex-shrink-0 items-center justify-center rounded-full bg-[var(--bg-secondary)] font-semibold text-[var(--text-secondary)]"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {owner.initials}
    </div>
  );
}

/** Format de deadline — neutre, sans code couleur. */
function formatDeadline(iso: string): string {
  const target = new Date(iso);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - now.getTime()) / 86_400_000);

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Demain";
  if (diffDays === -1) return "Hier";
  if (diffDays > 0 && diffDays <= 7) return `Dans ${diffDays}j`;
  if (diffDays < 0 && diffDays >= -7) return `Il y a ${Math.abs(diffDays)}j`;

  const months = ["jan", "fév", "mar", "avr", "mai", "juin", "juil", "août", "sep", "oct", "nov", "déc"];
  return `${target.getDate()} ${months[target.getMonth()]}`;
}

/* ── Owner picker — dropdown DS pour choisir le consultant ────────────── */

function OwnerPicker({
  owner,
  candidates,
  onChange,
}: {
  owner?: ActionOwner;
  candidates: ActionOwner[];
  onChange?: (next: ActionOwner | undefined) => void;
}) {
  const trigger = (
    <button
      type="button"
      className="flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors hover:bg-[var(--bg-card-hover)]"
      onClick={(e) => e.stopPropagation()}
    >
      {owner ? (
        <>
          <OwnerAvatar owner={owner} size={20} />
          <CaretDown className="h-3 w-3 text-[var(--text-muted)]" />
        </>
      ) : (
        <span className="flex h-5 items-center text-[11px] text-[var(--text-muted)]">
          + Assigner
        </span>
      )}
    </button>
  );

  if (!onChange) {
    return owner ? <OwnerAvatar owner={owner} size={20} /> : null;
  }

  return (
    <DropdownMenu width={220} trigger={trigger}>
      <DropdownHeader>Assigner à</DropdownHeader>
      {candidates.map((c) => (
        <DropdownItem
          key={c.id}
          onClick={() => onChange(c)}
          selected={owner?.id === c.id}
        >
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

/* ── Deadline picker — input date inline ──────────────────────────────── */

function DeadlinePicker({
  deadline,
  onChange,
}: {
  deadline?: string;
  onChange?: (next: string | undefined) => void;
}) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  if (!onChange) {
    return deadline ? (
      <span className="inline-flex items-center gap-1 text-[12px] tabular-nums text-[var(--text-muted)]">
        <Calendar className="h-3 w-3" />
        {formatDeadline(deadline)}
      </span>
    ) : null;
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="date"
        defaultValue={deadline}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v || undefined);
        }}
        onBlur={() => setEditing(false)}
        className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-2 py-1 text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--border-medium)]"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[12px] tabular-nums text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
    >
      <Calendar className="h-3 w-3" />
      {deadline ? formatDeadline(deadline) : "Pas de deadline"}
    </button>
  );
}

/* ── Recurrence picker — dropdown DS pour la récurrence ───────────────── */

function RecurrencePicker({
  recurrence,
  onChange,
}: {
  recurrence: ActionRecurrence;
  onChange?: (next: ActionRecurrence) => void;
}) {
  // Lecture seule (client / contextes sans handler) → badge discret.
  if (!onChange) {
    return recurrence !== "none" ? (
      <span className="inline-flex items-center gap-1 text-[12px] text-[var(--text-muted)]">
        <Repeat className="h-3 w-3" />
        {RECURRENCE_LABEL[recurrence]}
      </span>
    ) : null;
  }

  const trigger = (
    <button
      type="button"
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[12px] transition-colors hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] ${
        recurrence === "none" ? "text-[var(--text-muted)]" : "text-[var(--text-secondary)]"
      }`}
    >
      <Repeat className="h-3 w-3" />
      {recurrence === "none" ? "Ponctuelle" : RECURRENCE_LABEL[recurrence]}
    </button>
  );

  return (
    <DropdownMenu width={190} trigger={trigger}>
      <DropdownHeader>Récurrence</DropdownHeader>
      {RECURRENCE_OPTIONS.map((r) => (
        <DropdownItem key={r} onClick={() => onChange(r)} selected={recurrence === r}>
          <span className="text-[13px] text-[var(--text-primary)]">{RECURRENCE_PICKER_LABEL[r]}</span>
        </DropdownItem>
      ))}
    </DropdownMenu>
  );
}

/* ── Composant principal ──────────────────────────────────────────────── */

export function ActionCard({
  priority,
  title,
  description,
  steps,
  resources,
  time,
  impact,
  status,
  onStatusChange,
  owner,
  ownerCandidates = [],
  onOwnerChange,
  deadline,
  onDeadlineChange,
  recurrence = "none",
  onRecurrenceChange,
  clientNarrative,
  timeSpentMinutes,
  onNarrativeChange,
  commentTarget,
  selectable = false,
  selected = false,
  onSelectChange,
}: {
  priority: ActionPriorityLevel;
  title: string;
  description?: ReactNode;
  steps?: string[];
  resources?: { label: string; url?: string }[];
  time?: string;
  impact?: string;
  status: Status;
  onStatusChange: (s: Status) => void;
  owner?: ActionOwner;
  /** Liste de consultants candidats pour l'assignation. */
  ownerCandidates?: ActionOwner[];
  onOwnerChange?: (next: ActionOwner | undefined) => void;
  deadline?: string;
  onDeadlineChange?: (next: string | undefined) => void;
  recurrence?: ActionRecurrence;
  onRecurrenceChange?: (next: ActionRecurrence) => void;
  clientNarrative?: string;
  timeSpentMinutes?: number;
  onNarrativeChange?: (v: string) => void;
  /** Active un fil de commentaires contextuel dans la zone dépliée. */
  commentTarget?: { id: string; label: string };
  /** Affiche une case à cocher de sélection multiple à gauche de la carte. */
  selectable?: boolean;
  selected?: boolean;
  onSelectChange?: (v: boolean) => void;
}) {
  const { show: showToast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [localNarrative, setLocalNarrative] = useState(clientNarrative ?? "");

  const isDone = status === "done";
  const isAbandoned = status === "abandoned";
  const showImplementation = isDone || status === "in_progress" || status === "blocked_client";

  const fallbackSteps = [
    `Auditer la situation actuelle : ${title.toLowerCase().slice(0, 80)}`,
    "Identifier les changements précis à apporter (page, balise, contenu)",
    "Implémenter la modification puis valider via GSC ou un crawl",
    "Mesurer l'impact sur 2-4 semaines (position, trafic, CTR)",
  ];
  const effectiveSteps = steps && steps.length > 0 ? steps : fallbackSteps;
  const effectiveDescription =
    description ??
    "Détaillez l'action ci-dessous. Cette section sera prochainement enrichie automatiquement par l'IA en fonction du contenu de la page et des recommandations EMC.";

  function handleStatusChange(next: Status) {
    // Action récurrente complétée → on enregistre l'occurrence et on
    // régénère la suivante (deadline avancée d'une période, statut remis à faire).
    if (next === "done" && status !== "done" && recurrence !== "none") {
      const nd = nextRecurrenceDate(deadline, recurrence);
      onDeadlineChange?.(nd);
      onStatusChange("todo");
      showToast(`Occurrence enregistrée — prochaine échéance le ${formatDeadline(nd)}`);
      return;
    }
    onStatusChange(next);
    if (next === "done" && status !== "done") {
      showToast("Action livrée");
      setExpanded(true);
    } else if (next === "blocked_client") {
      showToast("Action en attente du client");
    } else if (next === "abandoned") {
      showToast("Action abandonnée");
    }
  }

  function handleNarrativeBlur() {
    if (localNarrative !== clientNarrative) onNarrativeChange?.(localNarrative);
  }

  return (
    <div
      className={`group rounded-2xl border bg-[var(--bg-card)] transition-colors ${
        expanded
          ? "border-[var(--border-medium)]"
          : "border-[var(--border-subtle)] hover:border-[var(--border-medium)]"
      } ${isAbandoned ? "opacity-60" : ""}`}
    >
      {/* ── COLLAPSED ROW ── */}
      <div className="flex items-center gap-3 px-4 py-3">
        {selectable && (
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelectChange?.(e.target.checked)}
            onClick={(e) => e.stopPropagation()}
            aria-label="Sélectionner l'action"
            className="h-4 w-4 flex-shrink-0 cursor-pointer rounded border-[var(--border-medium)] accent-[var(--accent-primary)]"
          />
        )}
        {/* Priority */}
        <div className="w-[88px] flex-shrink-0">
          <PriorityBadge level={priority} />
        </div>

        {/* Title + meta — cliquable pour expand */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="min-w-0 flex-1 text-left"
          aria-expanded={expanded}
        >
          <p
            className={`text-[14px] font-medium leading-snug text-[var(--text-primary)] ${
              isAbandoned ? "line-through" : ""
            }`}
          >
            {title}
          </p>
          {(time || impact || recurrence !== "none") && (
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-[var(--text-muted)]">
              {time && <span className="tabular-nums">⏱ {time}</span>}
              {time && impact && <span className="text-[var(--border-medium)]">·</span>}
              {impact && (
                <span className="font-medium text-[var(--text-secondary)]">{impact}</span>
              )}
              {/* Badge récurrence dans la meta uniquement en lecture seule
                  (sinon le picker éditable de la barre de contrôles fait foi). */}
              {!onRecurrenceChange && (time || impact) && recurrence !== "none" && (
                <span className="text-[var(--border-medium)]">·</span>
              )}
              {!onRecurrenceChange && recurrence !== "none" && (
                <span className="inline-flex items-center gap-1">
                  <Repeat className="h-3 w-3" />
                  {RECURRENCE_LABEL[recurrence]}
                </span>
              )}
            </div>
          )}
        </button>

        {/* Chevron */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] transition-all hover:text-[var(--text-primary)] ${
            expanded ? "rotate-180" : ""
          }`}
          aria-label={expanded ? "Réduire" : "Étendre"}
        >
          <ChevronDown className="h-4 w-4" />
        </button>

        {/* Owner picker — éditable */}
        <div className="flex-shrink-0">
          <OwnerPicker owner={owner} candidates={ownerCandidates} onChange={onOwnerChange} />
        </div>

        {/* Recurrence picker — éditable (none / hebdo / mensuel / trimestriel) */}
        {onRecurrenceChange && (
          <div className="hidden flex-shrink-0 md:block">
            <RecurrencePicker recurrence={recurrence} onChange={onRecurrenceChange} />
          </div>
        )}

        {/* Deadline picker — éditable, neutre (pas de code couleur) */}
        <div className="hidden flex-shrink-0 sm:block">
          <DeadlinePicker deadline={deadline} onChange={onDeadlineChange} />
        </div>

        {/* Status dropdown */}
        <div className="flex-shrink-0">
          <StatusPillDropdown status={status} onChange={handleStatusChange} />
        </div>
      </div>

      {/* ── EXPANDED ── */}
      {expanded && (
        <div className="border-t border-[var(--border-subtle)] px-6 pb-6 pt-5">
          <div className="flex flex-col gap-5">
            {/* Description — typo plus présente (15px / leading-relaxed / text-primary) */}
            <div>
              <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                <FileText className="h-3 w-3" />
                Description
              </p>
              <p className="text-[15px] leading-relaxed text-[var(--text-primary)]">
                {effectiveDescription}
              </p>
            </div>

            {/* Steps — typo plus présente, chiffre plus gros */}
            <div>
              <p className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                <Sparkles className="h-3 w-3" />
                Comment réaliser cette action
              </p>
              <ol className="flex flex-col gap-3">
                {effectiveSteps.map((s, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent-primary-soft)] text-[12px] font-semibold tabular-nums text-[var(--accent-primary)]">
                      {i + 1}
                    </span>
                    <span className="text-[14px] leading-relaxed text-[var(--text-primary)]">
                      {s}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Resources */}
            {resources && resources.length > 0 && (
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  Ressources
                </p>
                <div className="flex flex-wrap gap-2">
                  {resources.map((r, i) => (
                    <a
                      key={i}
                      href={r.url ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] px-3 py-1 text-[12px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-medium)] hover:text-[var(--text-primary)]"
                    >
                      {r.label}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Implémentation — visible si in_progress / done / blocked_client.
                PLUS de champ "URL preuve". Juste narratif + indicateur impact. */}
            {showImplementation && (
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-hover)] p-4">
                <p className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  <TrendingUp className="h-3 w-3" />
                  Implémentation
                </p>

                {/* Narratif client */}
                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-secondary)]">
                    <MessageSquare className="h-3 w-3" />
                    Narratif client (pour le rapport mensuel)
                  </span>
                  <textarea
                    value={localNarrative}
                    onChange={(e) => setLocalNarrative(e.target.value)}
                    onBlur={handleNarrativeBlur}
                    placeholder="Comment expliquer cette action à votre client en 2 phrases business…"
                    rows={2}
                    className="w-full resize-y rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-[13px] leading-relaxed text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] focus:border-[var(--border-medium)]"
                  />
                </label>

                {/* Temps passé (read-only pour l'instant) */}
                {typeof timeSpentMinutes === "number" && timeSpentMinutes > 0 && (
                  <p className="mt-2 text-[11px] text-[var(--text-muted)]">
                    Temps passé :{" "}
                    <span className="font-medium tabular-nums text-[var(--text-secondary)]">
                      {timeSpentMinutes < 60
                        ? `${timeSpentMinutes} min`
                        : `${(timeSpentMinutes / 60).toFixed(1)} h`}
                    </span>
                  </p>
                )}

                {isDone && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-[11px] text-[var(--text-muted)]">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>
                      Impact mesuré à T+30 / +60 / +90 jours (programmé automatiquement)
                    </span>
                  </div>
                )}
              </div>
            )}

            {commentTarget && (
              <div className="border-t border-[var(--border-subtle)] pt-5">
                <CommentThread
                  target={{ type: "action", id: commentTarget.id, label: commentTarget.label }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
