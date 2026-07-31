"use client";

import type { ReactNode } from "react";

/**
 * MetricListRow — ligne d'une liste de métriques (titre + valeur + delta).
 *
 * Pattern récurrent : liste "Top pages" / "Rising keywords" / "Top performers".
 * Encapsule la séparation `border-b border-subtle` entre les lignes (sauf la dernière).
 *
 * @example
 *   <Panel title="Top pages" padding="md">
 *     {pages.map((p, i) => (
 *       <MetricListRow
 *         key={p.url}
 *         label={p.title}
 *         sub={p.url}
 *         value={p.monthlyVisits.toLocaleString("fr-FR")}
 *         delta={`${p.delta > 0 ? "+" : ""}${p.delta.toLocaleString("fr-FR")}`}
 *         deltaPositive={p.delta > 0}
 *         isLast={i === pages.length - 1}
 *       />
 *     ))}
 *   </Panel>
 */

interface MetricListRowProps {
  /** Texte principal (titre de la page, mot-clé, etc.). */
  label: ReactNode;
  /** Sous-texte optionnel (URL, volume, etc.). 11px muted. */
  sub?: ReactNode;
  /** Valeur principale (ex. "287 420"). 13px semibold tabular-nums. Optionnel si rightSlot est fourni. */
  value?: ReactNode;
  /** Delta optionnel à droite de la valeur (ex. "+8 230"). 10px semibold colorisé. */
  delta?: ReactNode;
  /** Si delta fourni, indique si positif (vert) ou négatif (rouge). */
  deltaPositive?: boolean;
  /** Custom right slot — utiliser si delta ne suffit pas (ex. icône, badge, RankingChange). Override value+delta. */
  rightSlot?: ReactNode;
  /** Si true, retire la border-bottom. À set pour la dernière ligne d'une liste. */
  isLast?: boolean;
}

export function MetricListRow({
  label,
  sub,
  value,
  delta,
  deltaPositive,
  rightSlot,
  isLast = false,
}: MetricListRowProps) {
  return (
    <div
      className={`flex items-center justify-between gap-3 py-2.5 ${
        isLast ? "" : "border-b border-[var(--border-subtle)]"
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate type-label text-[var(--text-primary)]">
          {label}
        </p>
        {sub && (
          <p className="mt-0.5 truncate type-micro tabular-nums">
            {sub}
          </p>
        )}
      </div>

      {rightSlot ?? (
        <div className="flex flex-shrink-0 items-baseline gap-2">
          <span className="type-label tabular-nums text-[var(--text-primary)]">
            {value}
          </span>
          {delta !== undefined && deltaPositive !== undefined && (
            <span
              className="type-micro tabular-nums"
              style={{
                color: deltaPositive ? "var(--color-success)" : "var(--color-danger)",
              }}
            >
              {delta}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
