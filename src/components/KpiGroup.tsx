"use client";

import { Children, type ReactNode } from "react";

/**
 * KpiGroup — rend une grille de KpiCards individuelles.
 *
 * NOTE : refondu (post-feedback) — auparavant le composant enveloppait tous
 * les bare KpiCard dans un seul gros encart "wide". On ne veut plus ça.
 * Maintenant chaque enfant est rendu dans son propre encart à contour
 * (border-subtle, sans fond), avec un gap entre eux. Le résultat visuel :
 * autant de cards séparées que de KPIs, en grille.
 *
 * Les call sites restent compatibles : ils passent toujours des
 * `<KpiCard bare ... />` enfants — chacun est wrappé pour récupérer le bg.
 *
 * @example
 *   <KpiGroup columns={4}>
 *     <KpiCard bare label="Top 1" value={top1} icon={Trophy} />
 *     <KpiCard bare label="Top 3" value={top3} icon={Medal} />
 *     ...
 *   </KpiGroup>
 */
export function KpiGroup({
  columns,
  children,
  className = "",
}: {
  columns: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`grid gap-3 ${className}`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {Children.map(children, (child, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
          {child}
        </div>
      ))}
    </div>
  );
}
