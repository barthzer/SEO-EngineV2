import type { ReactNode } from "react";

export interface SegmentedBarItem {
  label: string;
  pct: number;
  color: string;
  /** Icône/logo affiché dans le segment (blanc sur fond coloré). */
  icon?: ReactNode;
}

/**
 * Barre empilée segmentée — segments arrondis séparés par un gap de 4px, avec
 * icône + % dans chaque segment et légende dessous. Façon « Citation Types ».
 */
export function SegmentedBar({
  data,
  height = 36,
  className = "",
}: {
  data: SegmentedBarItem[];
  height?: number;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Barre — segments arrondis, gap 4px (gap-1) */}
      <div className="flex gap-1" style={{ height }}>
        {data.map((d) => (
          <div
            key={d.label}
            title={`${d.label} · ${d.pct}%`}
            className="flex min-w-0 items-center justify-center gap-1.5 overflow-hidden rounded-lg px-2 text-white"
            style={{ flex: Math.max(d.pct, 8), backgroundColor: d.color }}
          >
            {d.icon && <span className="flex flex-shrink-0 items-center">{d.icon}</span>}
            {d.pct >= 3 && <span className="text-[12px] font-semibold tabular-nums">{d.pct}%</span>}
          </div>
        ))}
      </div>
      {/* Légende */}
      <div className="flex flex-wrap gap-x-5 gap-y-1.5">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 flex-shrink-0 rounded-[3px]" style={{ backgroundColor: d.color }} />
            <span className="text-[13px] text-[var(--text-secondary)]">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
