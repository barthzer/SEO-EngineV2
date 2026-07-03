"use client";

import { useId } from "react";

/**
 * ScoreArc — jauge demi-cercle (180°) avec score au centre.
 *
 * Portée depuis le projet GlobalSearchIndex et alignée sur le DS SEO Engine :
 * piste en `--arc-bg`, remplissage en token statut (success / warning / danger)
 * par défaut, ou couleur fournie. SVG pur, sans dépendance.
 *
 * @example
 *   <ScoreArc score={100} color="var(--accent-primary)" />
 */

const ARC_PATH =
  "M4 90.3301C4 67.4339 13.0955 45.4755 29.2855 29.2855C45.4756 13.0955 67.434 4 90.3302 4C113.226 4 135.185 13.0955 151.375 29.2855C167.565 45.4755 176.66 67.4339 176.66 90.3301";
const ARC_RADIUS = 86.33;

const defaultColor = (s: number) =>
  s >= 70 ? "var(--color-success)" : s >= 40 ? "var(--color-warning)" : "var(--color-danger)";

interface ScoreArcProps {
  score: number;
  /** Largeur du gauge en px (le ratio hauteur est conservé). Défaut 176. */
  width?: number;
  /** Override de la couleur de remplissage. Par défaut : heuristique statut. */
  color?: string;
  /** Masque le "/100" sous le chiffre. */
  hideTotal?: boolean;
  /** Couleur du chiffre central. Défaut : text-primary. */
  valueColor?: string;
}

export function ScoreArc({ score, width = 176, color, hideTotal = false, valueColor }: ScoreArcProps) {
  const gradId = useId();
  const clamped = Math.max(0, Math.min(100, score));
  const circumference = Math.PI * ARC_RADIUS;
  const offset = circumference - (clamped / 100) * circumference;
  const c = color ?? defaultColor(clamped);
  const height = width * (95 / 181);
  const valueSize = Math.round(width * 0.18);

  return (
    <div className="relative inline-block flex-shrink-0" style={{ width, height }}>
      <svg viewBox="0 0 181 95" width={width} height={height}>
        <path d={ARC_PATH} fill="none" stroke="var(--arc-bg)" strokeWidth={8} strokeLinecap="round" />
        <path
          id={gradId}
          d={ARC_PATH}
          fill="none"
          stroke={c}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-end justify-center">
        <span
          className="font-semibold tabular-nums leading-none tracking-tight"
          style={{ fontSize: valueSize, color: valueColor ?? "var(--text-primary)" }}
        >
          {clamped}
        </span>
        {!hideTotal && <span className="mb-1 ml-0.5 text-[13px] text-[var(--text-muted)]">/100</span>}
      </div>
    </div>
  );
}
