"use client";

/**
 * SourcePill — indicateur de source de données (DS).
 *
 * Pill unique et cohérente utilisée partout où l'on cite la provenance d'une
 * donnée (Haloscan, Majestic, GSC…). Cliquable si `href` fourni (ouvre la
 * source dans un nouvel onglet). Remplace les mentions texte hétérogènes
 * (« source Haloscan », « Visibilité Haloscan », etc.).
 */

import { ArrowUpRightIcon } from "@heroicons/react/24/outline";

export function SourcePill({ source, href }: { source: string; href?: string }) {
  const inner = (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-2 py-0.5 type-micro text-[var(--text-secondary)] ${href ? "transition-colors hover:border-[var(--border-medium)] hover:text-[var(--text-primary)]" : ""}`}
    >
      <span>Source · {source}</span>
      {href && <ArrowUpRightIcon className="h-2.5 w-2.5 flex-shrink-0 text-[var(--text-muted)]" />}
    </span>
  );
  if (!href) return inner;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex">
      {inner}
    </a>
  );
}
