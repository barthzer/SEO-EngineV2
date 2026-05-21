"use client";

import { useState, type ReactNode } from "react";

export type TabbedChartView = {
  key: string;
  label: string;
  /** Contenu affiché à droite du header quand cette vue est active (valeur courante, delta, etc.). */
  meta?: ReactNode;
  render: () => ReactNode;
};

/**
 * TabbedChart — encart graphique unique avec switch entre plusieurs vues.
 *
 * Header : plusieurs titres cliquables (16px tracking-subheading).
 * Le titre actif est en text-primary font-semibold, les autres en text-muted.
 * Body : rend uniquement la vue sélectionnée.
 *
 * @example
 *   <TabbedChart views={[
 *     { key: "position", label: "Évolution position", render: () => <PositionSparkline history={h} /> },
 *     { key: "trafic",   label: "Évolution trafic",   render: () => <TrafficSparkline   history={h} /> },
 *   ]} />
 */
export function TabbedChart({
  views,
  defaultView,
  className = "",
}: {
  views: TabbedChartView[];
  defaultView?: string;
  className?: string;
}) {
  const [active, setActive] = useState(defaultView ?? views[0]?.key);
  const current = views.find((v) => v.key === active) ?? views[0];

  return (
    <div className={`flex flex-col rounded-2xl border border-[var(--border-subtle)] px-5 pt-5 pb-3 ${className}`}>
      {/* Header — titres cliquables à gauche, meta de la vue active à droite */}
      <div className="mb-4 flex flex-shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {views.map((v, i) => {
            const isActive = v.key === current?.key;
            return (
              <div key={v.key} className="flex items-center gap-2">
                {i > 0 && <span className="text-[14px] text-[var(--text-muted)]" aria-hidden="true">·</span>}
                <button
                  type="button"
                  onClick={() => setActive(v.key)}
                  className={`rounded-md text-[16px] font-semibold tracking-subheading transition-colors ${
                    isActive
                      ? "text-[var(--text-primary)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  }`}
                >
                  {v.label}
                </button>
              </div>
            );
          })}
        </div>
        {current?.meta && <div className="flex flex-shrink-0 items-center gap-2">{current.meta}</div>}
      </div>

      {/* Body — vue active */}
      <div className="flex-1">{current?.render()}</div>
    </div>
  );
}
