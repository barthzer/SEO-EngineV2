"use client";

/**
 * ActionCard — l'unité économique d'une presta SEO/GEO en agence.
 *
 * B1 — refonte vers le modèle riche :
 *
 *  Collapsed row :
 *    [PRIO] · Titre + sous-meta (⏱ time / impact / 🔁 recurrence)
 *           ─ chevron ─ owner avatar ─ deadline ─ status dropdown (5 valeurs)
 *
 *  Expanded :
 *    - Description longue + Steps "comment faire" + Resources (déjà existait)
 *    - + Owner / Deadline / Récurrence pills (read-only, edit en B1b)
 *    - + Section "Implémentation" : URL preuve + narratif client
 *      (visibles dès qu'on passe en "done", éditables inline)
 *    - + Indicateur Impact (snapshot T+0/30/60/90 — placeholder pour B1b)
 *
 * Le cycle de redevabilité — ce qu'on facture / mesure / prouve — passe
 * désormais par cette carte. Voir src/db/schema.ts > action_cards.
 */

import { useState, type ReactNode } from "react";
import {
  ChevronDown,
  FileText,
  Sparkles,
  User,
  Calendar,
  Repeat,
  LinkIcon as Link2,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { PriorityBadge, type ActionPriorityLevel } from "@/components/PriorityBars";
import { type Status, StatusPillDropdown } from "@/components/StatusPill";
import { useToast } from "@/context/ToastContext";

export type { ActionPriorityLevel } from "@/components/PriorityBars";

export type ActionRecurrence = "none" | "weekly" | "monthly" | "quarterly";

const RECURRENCE_LABEL: Record<ActionRecurrence, string> = {
  none: "—",
  weekly: "Hebdo",
  monthly: "Mensuel",
  quarterly: "Trimestriel",
};

export type ActionOwner = {
  name: string;
  initials: string;
  /** Index couleur (0-3) pour l'avatar. */
  colorIndex?: number;
};

const AVATAR_COLORS = [
  "var(--accent-primary)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-danger)",
];

function OwnerAvatar({ owner, size = 24 }: { owner: ActionOwner; size?: number }) {
  const color = AVATAR_COLORS[(owner.colorIndex ?? 0) % AVATAR_COLORS.length];
  return (
    <div
      title={owner.name}
      className="flex flex-shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.42 }}
    >
      {owner.initials}
    </div>
  );
}

/** Format de deadline : "auj.", "demain", "dans 3j", "il y a 2j", ou date courte. */
function formatDeadline(iso: string): { label: string; tone: "neutral" | "warning" | "danger" } {
  const target = new Date(iso);
  const now = new Date();
  // Ramener à minuit pour comparer en jours
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - now.getTime()) / 86_400_000);

  if (diffDays < 0) {
    return {
      label: diffDays === -1 ? "Hier" : `Il y a ${Math.abs(diffDays)}j`,
      tone: "danger",
    };
  }
  if (diffDays === 0) return { label: "Aujourd'hui", tone: "danger" };
  if (diffDays === 1) return { label: "Demain", tone: "warning" };
  if (diffDays <= 7) return { label: `Dans ${diffDays}j`, tone: "warning" };

  const months = ["jan", "fév", "mar", "avr", "mai", "juin", "juil", "août", "sep", "oct", "nov", "déc"];
  return {
    label: `${target.getDate()} ${months[target.getMonth()]}`,
    tone: "neutral",
  };
}

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
  deadline,
  recurrence = "none",
  evidenceUrl,
  clientNarrative,
  timeSpentMinutes,
  onEvidenceChange,
  onNarrativeChange,
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
  /** Owner de l'action (consultant responsable). */
  owner?: ActionOwner;
  /** Deadline ISO (YYYY-MM-DD). */
  deadline?: string;
  /** Récurrence. */
  recurrence?: ActionRecurrence;
  /** URL preuve d'implémentation (visible quand done). */
  evidenceUrl?: string;
  /** Narratif client business (édité par le consultant pour le rapport). */
  clientNarrative?: string;
  /** Temps passé en minutes (saisie consultant). */
  timeSpentMinutes?: number;
  onEvidenceChange?: (v: string) => void;
  onNarrativeChange?: (v: string) => void;
}) {
  const { show: showToast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [localEvidence, setLocalEvidence] = useState(evidenceUrl ?? "");
  const [localNarrative, setLocalNarrative] = useState(clientNarrative ?? "");

  const isDone = status === "done";
  const isAbandoned = status === "abandoned";

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
    onStatusChange(next);
    if (next === "done" && status !== "done") {
      showToast("Action livrée");
      // Ouvre automatiquement la zone d'implémentation pour saisir la preuve.
      setExpanded(true);
    } else if (next === "blocked_client") {
      showToast("Action en attente du client");
    } else if (next === "abandoned") {
      showToast("Action abandonnée");
    }
  }

  function handleEvidenceBlur() {
    if (localEvidence !== evidenceUrl) onEvidenceChange?.(localEvidence);
  }
  function handleNarrativeBlur() {
    if (localNarrative !== clientNarrative) onNarrativeChange?.(localNarrative);
  }

  const deadlineInfo = deadline ? formatDeadline(deadline) : null;
  const deadlineColor =
    deadlineInfo?.tone === "danger"
      ? "var(--color-danger)"
      : deadlineInfo?.tone === "warning"
      ? "var(--color-warning)"
      : "var(--text-muted)";

  return (
    <div
      className={`group rounded-2xl border bg-[var(--bg-card)] transition-colors ${
        expanded
          ? "border-[var(--border-medium)]"
          : "border-[var(--border-subtle)] hover:border-[var(--border-medium)]"
      } ${isAbandoned ? "opacity-60" : ""}`}
    >
      {/* Collapsed row */}
      <div className="flex items-center gap-4 px-4 py-3">
        {/* Priority — col 1 */}
        <div className="w-[88px] flex-shrink-0">
          <PriorityBadge level={priority} />
        </div>

        {/* Title + meta — col 2 (cliquable pour expand) */}
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
              {(time || impact) && recurrence !== "none" && (
                <span className="text-[var(--border-medium)]">·</span>
              )}
              {recurrence !== "none" && (
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

        {/* Owner avatar */}
        {owner && (
          <div className="flex-shrink-0">
            <OwnerAvatar owner={owner} />
          </div>
        )}

        {/* Deadline */}
        {deadlineInfo && (
          <span
            className="hidden min-w-[64px] flex-shrink-0 items-center gap-1 text-right text-[12px] font-medium tabular-nums sm:inline-flex"
            style={{ color: deadlineColor }}
            title={deadline}
          >
            <Calendar className="h-3 w-3" />
            {deadlineInfo.label}
          </span>
        )}

        {/* Status — col 5 */}
        <div className="flex-shrink-0">
          <StatusPillDropdown status={status} onChange={handleStatusChange} />
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-[var(--border-subtle)] px-4 pb-5 pt-4">
          <div className="grid grid-cols-[88px_1fr] gap-4">
            <div /> {/* Spacer */}

            <div className="flex flex-col gap-5">
              {/* Meta row : owner + deadline + récurrence + temps passé */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px]">
                {owner && (
                  <span className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]">
                    <User className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                    <OwnerAvatar owner={owner} size={18} />
                    {owner.name}
                  </span>
                )}
                {deadline && (
                  <span
                    className="inline-flex items-center gap-1.5"
                    style={{ color: deadlineColor }}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    {deadlineInfo?.label} ({deadline})
                  </span>
                )}
                {recurrence !== "none" && (
                  <span className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]">
                    <Repeat className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                    {RECURRENCE_LABEL[recurrence]}
                  </span>
                )}
                {typeof timeSpentMinutes === "number" && timeSpentMinutes > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]">
                    <span className="font-medium tabular-nums">
                      {timeSpentMinutes < 60
                        ? `${timeSpentMinutes} min passées`
                        : `${(timeSpentMinutes / 60).toFixed(1)} h passées`}
                    </span>
                  </span>
                )}
              </div>

              {/* Description */}
              <div>
                <p className="mb-1.5 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  <FileText className="h-3 w-3" />
                  Description
                </p>
                <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
                  {effectiveDescription}
                </p>
              </div>

              {/* Steps */}
              <div>
                <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  <Sparkles className="h-3 w-3" />
                  Comment réaliser cette action
                </p>
                <ol className="flex flex-col gap-2">
                  {effectiveSteps.map((s, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent-primary-soft)] text-[11px] font-semibold tabular-nums text-[var(--accent-primary)]">
                        {i + 1}
                      </span>
                      <span className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
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

              {/* Implémentation — visible si done OU en cours OU bloqué client */}
              {(isDone || status === "in_progress" || status === "blocked_client") && (
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-hover)] p-4">
                  <p className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                    <TrendingUp className="h-3 w-3" />
                    Implémentation
                  </p>

                  {/* Evidence URL */}
                  <label className="mb-3 block">
                    <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-secondary)]">
                      <Link2 className="h-3 w-3" />
                      URL preuve
                    </span>
                    <input
                      type="url"
                      value={localEvidence}
                      onChange={(e) => setLocalEvidence(e.target.value)}
                      onBlur={handleEvidenceBlur}
                      placeholder="https://exemple.com/page-modifiée"
                      className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] focus:border-[var(--border-medium)]"
                    />
                  </label>

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

                  {/* Snapshots impact — placeholder UI (vrai cycle T+0/30/60/90 en B1b) */}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
