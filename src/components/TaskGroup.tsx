"use client";

/**
 * TaskGroup — section collapsible groupant des tâches par statut.
 *
 * Pattern Linear : header avec icon coloré + label + count + chevron qui
 * collapse / expand la section. Conçu pour passer à l'échelle (10 ou 50
 * items, même UX).
 *
 * Utilisé pour les vues "to-do" / "avancement" / "deliverables" filtrées
 * par statut.
 *
 * @example
 *   <TaskGroup label="En cours" count={5} color="var(--color-warning)" icon={ClockIcon}>
 *     <TaskRow ... />
 *     <TaskRow ... />
 *   </TaskGroup>
 */

import { useState, type ElementType, type ReactNode } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { IconBadge } from "@/components/IconBadge";

interface TaskGroupProps {
  label: string;
  count: number;
  /** Couleur d'accent (point + icon background). */
  color: string;
  icon: ElementType;
  /** État initial : collapsed ou expanded. Défaut expanded. */
  defaultExpanded?: boolean;
  children: ReactNode;
}

export function TaskGroup({
  label,
  count,
  color,
  icon,
  defaultExpanded = true,
  children,
}: TaskGroupProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-[var(--bg-card-hover)]"
        aria-expanded={expanded}
      >
        <IconBadge
          icon={icon}
          size="sm"
          color={color}
          bg={`color-mix(in oklab, ${color} 14%, transparent)`}
        />
        <p className="text-[14px] font-semibold tracking-tight text-[var(--text-primary)]">
          {label}
        </p>
        <span className="rounded-full bg-[var(--bg-card-static)] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[var(--text-muted)]">
          {count}
        </span>
        <span className="flex-1" />
        <ChevronDownIcon
          className={`h-3.5 w-3.5 flex-shrink-0 text-[var(--text-muted)] transition-transform duration-200 ${expanded ? "" : "-rotate-90"}`}
          strokeWidth={2.5}
        />
      </button>

      {expanded && (
        <div className="border-t border-[var(--border-subtle)]">
          {children}
        </div>
      )}
    </section>
  );
}
