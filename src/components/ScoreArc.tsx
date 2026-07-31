"use client";

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

/** Épaisseur du trait de la jauge. */
const STROKE = 8;

export function ScoreArc({ score, width = 176, color, hideTotal = false, valueColor }: ScoreArcProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const circumference = Math.PI * ARC_RADIUS; // longueur de l'arc 180°
  const c = color ?? defaultColor(clamped);
  const height = width * (95 / 181);
  const valueSize = Math.round(width * 0.18);

  // Gap constant en longueur d'arc : les round caps « mangent » ~STROKE (½ par extrémité),
  // on ajoute une marge fixe pour laisser un vide visible constant quel que soit le score.
  const gapLen = STROKE + 2.5;
  const half = gapLen / 2;
  const filledLen = (clamped / 100) * circumference;
  const both = clamped > 0 && clamped < 100;
  const fLen = both ? Math.max(0, filledLen - half) : filledLen;         // segment rempli
  const eLen = both ? Math.max(0, circumference - filledLen - half) : circumference - filledLen; // segment vide

  // Les deux segments s'animent ensemble → jonction (et donc le gap) reste constant pendant la maj.
  const ease = "0.55s cubic-bezier(0.4, 0, 0.2, 1)";

  return (
    <div className="relative inline-block flex-shrink-0" style={{ width, height }}>
      <svg viewBox="0 0 181 95" width={width} height={height}>
        {/* Segment vide (track) — démarre après le gap */}
        {clamped < 100 && (
          <path
            d={ARC_PATH}
            fill="none"
            stroke="var(--arc-bg)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${eLen} ${circumference}`}
            strokeDashoffset={both ? -(filledLen + half) : 0}
            style={{ transition: `stroke-dashoffset ${ease}, stroke-dasharray ${ease}` }}
          />
        )}
        {/* Segment rempli */}
        {clamped > 0 && (
          <path
            d={ARC_PATH}
            fill="none"
            stroke={c}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - fLen}
            style={{ transition: `stroke-dashoffset ${ease}, stroke ${ease}` }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-end justify-center">
        <span
          className="font-semibold tabular-nums leading-none tracking-tight"
          style={{ fontSize: valueSize, color: valueColor ?? "var(--text-primary)" }}
        >
          {clamped}
        </span>
        {!hideTotal && <span className="mb-1 ml-0.5 type-body-sm text-[var(--text-muted)]">/100</span>}
      </div>
    </div>
  );
}
