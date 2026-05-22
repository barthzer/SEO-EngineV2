"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, FileText, Sparkles } from "lucide-react";
import { PriorityBadge, type ActionPriorityLevel } from "@/components/PriorityBars";
import { type Status } from "@/components/StatusPill";
import { ValidateSwitch } from "@/components/ValidateSwitch";
import { SuccessCheck } from "@/components/SuccessCheck";
import { useToast } from "@/context/ToastContext";

export type { ActionPriorityLevel } from "@/components/PriorityBars";

/**
 * ActionCard — row horizontale + détails expansibles (pattern Linear).
 *
 * Collapsed : PriorityBadge + title + meta + chevron + ValidateSwitch.
 * Expanded  : description longue, steps "comment faire", ressources.
 *
 * Toggle valider : un clic = action validée (status "done", check vert) + toast.
 * Re-clic = retour à "todo". L'expand est indépendant du statut.
 */
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
}: {
  priority: ActionPriorityLevel;
  title: string;
  /** Description longue affichée dans la zone expandable (sinon générée depuis le titre) */
  description?: ReactNode;
  /** Étapes "comment faire" (sinon 3 steps génériques générés à partir du titre) */
  steps?: string[];
  /** Liens ressources documentaires (optionnels) */
  resources?: { label: string; url?: string }[];
  /** ETA / temps estimé (ex. "30 min", "2 sem.") */
  time?: string;
  /** Description courte de l'impact (ex. "+8 pts SEO", "+CTR") */
  impact?: string;
  status: Status;
  onStatusChange: (s: Status) => void;
}) {
  const { show: showToast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const isDone = status === "done";

  function handleToggle() {
    if (isDone) {
      onStatusChange("todo");
    } else {
      onStatusChange("done");
      showToast(
        "Action validée",
        <SuccessCheck size={14} bg="var(--color-success)" replayKey={Date.now()} />,
      );
    }
  }

  /** Steps de fallback générés depuis le titre — déterministes, utilisés en mock */
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

  return (
    <div
      className={`group rounded-2xl border bg-[var(--bg-card)] transition-colors ${
        expanded
          ? "border-[var(--border-medium)]"
          : "border-[var(--border-subtle)] hover:border-[var(--border-medium)]"
      }`}
    >
      {/* Collapsed row — toujours visible */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-4 px-4 py-3 text-left"
        aria-expanded={expanded}
      >
        {/* Priority badge — largeur fixe pour aligner toutes les rows */}
        <div className="w-[88px] flex-shrink-0">
          <PriorityBadge level={priority} />
        </div>

        {/* Corps : title + meta */}
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-medium leading-snug text-[var(--text-primary)]">
            {title}
          </p>
          {(time || impact) && (
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-[var(--text-muted)]">
              {time && <span className="tabular-nums">⏱ {time}</span>}
              {time && impact && <span className="text-[var(--border-medium)]">·</span>}
              {impact && <span className="font-medium text-[var(--text-secondary)]">{impact}</span>}
            </div>
          )}
        </div>

        {/* Chevron + toggle valider */}
        <div className="flex flex-shrink-0 items-center gap-3">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-muted)] transition-all group-hover:text-[var(--text-primary)] ${
              expanded ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          >
            <ChevronDown className="h-4 w-4" />
          </span>
          <span onClick={(e) => e.stopPropagation()}>
            <ValidateSwitch value={isDone} onChange={handleToggle} />
          </span>
        </div>
      </button>

      {/* Expanded — détails de l'action */}
      {expanded && (
        <div className="border-t border-[var(--border-subtle)] px-4 pb-5 pt-4">
          <div className="grid grid-cols-[88px_1fr] gap-4">
            <div /> {/* Spacer pour aligner avec la priority badge column */}

            <div className="flex flex-col gap-5">
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

              {/* Resources optionnelles */}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
