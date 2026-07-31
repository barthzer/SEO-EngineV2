"use client";

import { useState } from "react";
import type { ElementType } from "react";
import { ScoreArc } from "@/components/ScoreArc";

/**
 * Diagnostic complet — encarts de sous-score cliquables + zone de détail.
 *
 * Composant partagé entre les onglets d'audit (Technique, Sémantique, Visibilité IA)
 * pour garantir une parité visuelle stricte : même carte, même grille, même zone de
 * détail. Ne jamais dupliquer / diverger ce style dans un onglet.
 */

export type DiagnosticItem = {
  label: string;
  score: number;
  icon: ElementType;
  headline: string;
  detail: string;
};

const CARD = "rounded-2xl border border-[var(--border-subtle)]";

export function diagnosticScoreColor(n: number) {
  return n >= 70 ? "var(--color-success)" : n >= 50 ? "var(--color-warning)" : "var(--color-danger)";
}

/** Carte de sous-score cliquable — style de référence partagé. */
export function DiagnosticCard({
  label,
  score,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  score: number;
  icon: ElementType;
  active: boolean;
  onClick: () => void;
}) {
  const color = diagnosticScoreColor(score);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`${CARD} p-5 text-left transition-colors ${active ? "" : "hover:bg-[var(--bg-card-hover)]"}`}
      style={active ? { borderColor: "var(--accent-primary)", backgroundColor: "color-mix(in srgb, var(--accent-primary) 5%, transparent)" } : undefined}
    >
      <div className="mb-3 flex items-center gap-1.5">
        <Icon className="h-4 w-4 text-[var(--text-muted)]" />
        <p className="type-caption font-medium">{label}</p>
      </div>
      <p className="type-h1 mb-2 leading-none">
        {score}
        <span className="type-caption font-normal text-[var(--text-muted)]">/100</span>
      </p>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bg-subtle)]">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </button>
  );
}

/** Zone de détail — reflète l'encart sélectionné (ScoreArc + headline + detail). */
export function DiagnosticDetailPanel({ item }: { item: DiagnosticItem }) {
  const Icon = item.icon;
  return (
    <div className={`${CARD} p-7`}>
      <div className="flex items-center gap-8">
        <ScoreArc score={item.score} width={168} />
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <Icon className="h-4 w-4 text-[var(--text-muted)]" />
            <p className="type-h3">{item.label}</p>
          </div>
          <p className="type-body-strong mb-3 leading-snug">{item.headline}</p>
          <p className="type-body leading-relaxed text-[var(--text-secondary)]">{item.detail}</p>
        </div>
      </div>
    </div>
  );
}

const GRID_COLS: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};

/**
 * Grille de cartes de sous-score + zone de détail, avec sélection interne.
 * Par défaut, la dimension la plus faible est sélectionnée (celle qui mérite l'attention).
 */
export function DiagnosticComplet({
  items,
  cols = 4,
  className,
}: {
  items: DiagnosticItem[];
  cols?: number;
  className?: string;
}) {
  const worst = items.reduce((min, c, i, arr) => (c.score < arr[min].score ? i : min), 0);
  const [selected, setSelected] = useState(worst);
  const safe = Math.min(selected, items.length - 1);
  return (
    <div className={className}>
      <div className={`mb-3 grid ${GRID_COLS[cols] ?? "grid-cols-4"} gap-3`}>
        {items.map((c, i) => (
          <DiagnosticCard
            key={c.label}
            label={c.label}
            score={c.score}
            icon={c.icon}
            active={i === safe}
            onClick={() => setSelected(i)}
          />
        ))}
      </div>
      <DiagnosticDetailPanel item={items[safe]} />
    </div>
  );
}
