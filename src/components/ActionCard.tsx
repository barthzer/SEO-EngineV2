"use client";

import type { ReactNode } from "react";
import { CheckIcon } from "@heroicons/react/24/outline";
import { PriorityBadge, type ActionPriorityLevel } from "@/components/PriorityBars";
import { type Status } from "@/components/StatusPill";
import { ValidateSwitch } from "@/components/ValidateSwitch";
import { useToast } from "@/context/ToastContext";

export type { ActionPriorityLevel } from "@/components/PriorityBars";

/**
 * ActionCard — carte d'action SEO (Synthèse / Contenu / Autorité / Technique).
 *
 * Layout : header (PriorityBadge + toggle valider), titre 14px font-semibold,
 * description optionnelle 13px secondary, footer meta (ETA + impact).
 *
 * Toggle valider : un clic = action validée (status "done", check vert) + toast.
 * Re-clic = retour à "todo".
 */
export function ActionCard({
  priority,
  title,
  description,
  time,
  impact,
  status,
  onStatusChange,
}: {
  priority: ActionPriorityLevel;
  title: string;
  description?: ReactNode;
  /** ETA / temps estimé (ex. "30 min", "2 sem.") */
  time?: string;
  /** Description courte de l'impact (ex. "+8 pts SEO", "+CTR") */
  impact?: string;
  status: Status;
  onStatusChange: (s: Status) => void;
}) {
  const { show: showToast } = useToast();
  const isDone = status === "done";

  function handleToggle() {
    if (isDone) {
      onStatusChange("todo");
    } else {
      onStatusChange("done");
      showToast(
        "Action validée",
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-success)]">
          <CheckIcon className="h-3.5 w-3.5 text-white" strokeWidth={3} />
        </span>,
      );
    }
  }

  return (
    <div className="group flex flex-col gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 transition-colors hover:border-[var(--border-medium)]">
      {/* Header — Priority + Toggle valider */}
      <div className="flex items-center justify-between gap-3">
        <PriorityBadge level={priority} />
        <ValidateSwitch value={isDone} onChange={handleToggle} />
      </div>

      {/* Title */}
      <p className="text-[14px] font-semibold leading-snug text-[var(--text-primary)]">
        {title}
      </p>

      {/* Description optionnelle */}
      {description && (
        <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">{description}</p>
      )}

      {/* Footer meta — ETA + impact, mêmes chips */}
      {(time || impact) && (
        <div className="flex flex-wrap items-center gap-2">
          {time && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-subtle)] px-2 py-1 text-[12px] font-medium tabular-nums text-[var(--text-secondary)]">
              <svg viewBox="0 0 12 12" width={12} height={12} className="flex-shrink-0" aria-hidden="true">
                <circle cx={6} cy={6} r={5} fill="none" stroke="currentColor" strokeWidth={1.2} />
                <path d="M6 3v3l2 1.5" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" />
              </svg>
              {time}
            </span>
          )}
          {impact && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-subtle)] px-2 py-1 text-[12px] font-medium text-[var(--text-secondary)]">
              <svg viewBox="0 0 12 12" width={12} height={12} className="flex-shrink-0" aria-hidden="true">
                <path d="M2 9 L5 6 L7 8 L10 3" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 3 L10 3 L10 6" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {impact}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
