"use client";

import type { ReactNode } from "react";

/**
 * KpiGroup — regroupe plusieurs KpiCard `bare` dans un seul encart visuel.
 *
 * Outer : rounded-3xl border bg-card
 * Inner : grid `columns` colonnes, sans dividers entre cellules
 *
 * Convention : passer des `<KpiCard bare ... />` en enfants directs (Tooltip-wrap autorisé).
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
    <div className={`overflow-hidden rounded-3xl bg-[var(--bg-card)] ${className}`}>
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {children}
      </div>
    </div>
  );
}
