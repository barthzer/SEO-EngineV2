import type { CSSProperties } from "react";

export type ActionPriorityLevel = "high" | "mid" | "low";

const PRIORITY_STYLE: Record<ActionPriorityLevel, { label: string; color: string; bg: string }> = {
  high: { label: "High",   color: "var(--color-danger)", bg: "var(--color-danger-bg)" },
  mid:  { label: "Medium", color: "#B45309", bg: "rgba(245,158,11,0.09)" },
  low:  { label: "Low",    color: "#1E40AF", bg: "rgba(62,80,245,0.09)" },
};

export const PRIORITY_LEVELS = PRIORITY_STYLE;

/**
 * PriorityBars — petit indicateur "signal bars" (3 barres de hauteur croissante)
 * pour représenter une priorité high (3 actives) / mid (2 actives) / low (1 active).
 * Les barres inactives passent en `text-muted` opacity 0.35.
 */
export function PriorityBars({
  level,
  className = "",
  style,
}: {
  level: ActionPriorityLevel;
  className?: string;
  style?: CSSProperties;
}) {
  const activeCount = level === "high" ? 3 : level === "mid" ? 2 : 1;
  // Les 3 barres : hauteurs 4, 7, 10 (px), espacement 1.5px — neutre (gris)
  return (
    <svg viewBox="0 0 12 12" width={12} height={12} className={`flex-shrink-0 ${className}`} style={style} aria-hidden="true">
      {[
        { x: 0,   h: 4,  active: activeCount >= 1 },
        { x: 4.5, h: 7,  active: activeCount >= 2 },
        { x: 9,   h: 10, active: activeCount >= 3 },
      ].map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={12 - b.h}
          width={3}
          height={b.h}
          rx={0.5}
          fill="var(--text-secondary)"
          opacity={b.active ? 1 : 0.25}
        />
      ))}
    </svg>
  );
}

/**
 * PriorityBadge — pill "Low / Medium / High" avec icône PriorityBars devant.
 */
export function PriorityBadge({ level }: { level: ActionPriorityLevel }) {
  const cfg = PRIORITY_STYLE[level];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-subtle)] px-2 py-1 text-[12px] font-medium text-[var(--text-primary)]">
      <PriorityBars level={level} />
      {cfg.label}
    </span>
  );
}
