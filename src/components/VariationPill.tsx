"use client";

import type { ReactNode } from "react";
import { Tooltip } from "@/components/Tooltip";

/**
 * VariationPill — pill de variation normalisée (style Trade Republic).
 *
 * - PAS de fond : juste le triangle + la valeur, colorés vert (hausse) /
 *   rouge (baisse) / muted (neutre).
 * - Triangle plein orienté vers le haut (hausse) ou le bas (baisse).
 * - Tooltip optionnel au survol pour le détail (ex. "−18,4 % sur 7 j · …").
 *
 * Remplace tous les anciens chips de variation à fond coloré du DS.
 *
 * @example
 *   <VariationPill direction="up">0,39 %</VariationPill>
 *   <VariationPill value={-18.4} tooltip="−3 142 clics perdus sur 7 jours" />
 */

type Direction = "up" | "down" | "neutral";

interface VariationPillProps {
  /** Direction explicite. Sinon dérivée du signe de `value`. */
  direction?: Direction;
  /** Valeur numérique — sert au fallback de direction ET au rendu si pas de children. */
  value?: number;
  /** Label affiché. Si absent, on formate `value` en "+X,X %" / "−X,X %". */
  children?: ReactNode;
  /** Détail affiché en tooltip au survol. */
  tooltip?: ReactNode;
  className?: string;
}

const COLOR: Record<Direction, string> = {
  up: "var(--color-success)",
  down: "var(--color-danger)",
  neutral: "var(--text-muted)",
};

/** Triangle plein — pointe vers le haut par défaut, retourné via rotate pour le bas. */
function Triangle({ direction }: { direction: Direction }) {
  if (direction === "neutral") {
    // Neutre : petit tiret horizontal plutôt qu'un triangle.
    return <span className="inline-block h-[2px] w-2.5 rounded-full" style={{ backgroundColor: "currentColor" }} aria-hidden />;
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="9"
      height="9"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
      className="flex-shrink-0"
      style={{ transform: direction === "down" ? "rotate(180deg)" : undefined }}
    >
      <path d="M6.23784 1.30751C6.99212 -0.0985939 9.00843 -0.0985962 9.76271 1.3075L15.6196 12.2257C16.3343 13.5581 15.3691 15.1711 13.8571 15.1711H2.14341C0.631443 15.1711 -0.333754 13.5581 0.38097 12.2257L6.23784 1.30751Z" />
    </svg>
  );
}

function formatValue(v: number): string {
  const sign = v > 0 ? "+" : v < 0 ? "−" : "";
  return `${sign}${Math.abs(v).toFixed(2).replace(".", ",")} %`;
}

export function VariationPill({
  direction,
  value,
  children,
  tooltip,
  className = "",
}: VariationPillProps) {
  const dir: Direction =
    direction ?? (value === undefined || value === 0 ? "neutral" : value > 0 ? "up" : "down");
  const label = children ?? (value !== undefined ? formatValue(value) : null);

  const pill = (
    <span
      className={`inline-flex items-center gap-1 text-[12px] font-semibold tabular-nums ${className}`}
      style={{ color: COLOR[dir] }}
    >
      <Triangle direction={dir} />
      {label}
    </span>
  );

  if (!tooltip) return pill;
  return (
    <Tooltip label={tooltip} side="top" portal>
      {pill}
    </Tooltip>
  );
}
