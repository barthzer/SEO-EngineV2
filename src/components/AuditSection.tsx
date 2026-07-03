"use client";

import { useState, type ReactNode, type ElementType } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

/**
 * AuditSection — section d'audit repliable (accordéon), encartée.
 *
 * Entête : icône à gauche, titre (tout en main) + sous-titre, chevron à droite.
 * Le contenu se replie sous l'entête. `num` reste accepté pour compat callsites
 * mais n'est pas rendu ; `meta` est rendu comme sous-titre. Conserve l'`id` pour
 * l'ancrage.
 */
export function AuditSection({
  id,
  icon: Icon,
  title,
  em,
  meta,
  right,
  defaultOpen = false,
  children,
}: {
  id?: string;
  /** Icône affichée à gauche du titre. */
  icon?: ElementType;
  /** @deprecated non rendu — conservé pour compat callsites. */
  num?: string;
  title: string;
  /** Mot de précision accolé au titre, rendu lui aussi en main. */
  em?: string;
  /** Sous-titre sous le titre. */
  meta?: string;
  /** Contenu optionnel aligné à droite de l'entête, avant le chevron. */
  right?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section
      id={id}
      className="scroll-mt-24 overflow-hidden rounded-2xl border border-[var(--border-subtle)]"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group flex w-full cursor-pointer items-center gap-3 px-7 py-5 text-left"
      >
        {Icon && <Icon className="h-5 w-5 flex-shrink-0 text-[var(--text-muted)]" />}
        <div className="min-w-0">
          <h2 className="font-semibold text-[var(--text-primary)]">
            {title}
            {em && <span className="ml-1.5">{em}</span>}
          </h2>
          {meta && <p className="mt-0.5 text-[13px] text-[var(--text-muted)]">{meta}</p>}
        </div>
        <span className="flex-1" />
        {right}
        <ChevronDownIcon
          className="h-4 w-4 flex-shrink-0 text-[var(--text-muted)] transition-transform duration-200 group-hover:text-[var(--text-primary)]"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="px-7 pb-7 pt-1">{children}</div>
        </div>
      </div>
    </section>
  );
}
