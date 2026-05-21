"use client";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  /** Override de la couleur. Par défaut, suit l'heuristique : rouge < 40, ambre < 70, vert >= 70. */
  color?: string;
  /** Cache le total "/100" sous le chiffre — utile pour les indicateurs de progression. */
  hideTotal?: boolean;
}

const defaultColor = (s: number) => s >= 70 ? "var(--color-success)" : s >= 40 ? "var(--color-warning)" : "var(--color-danger)";

export function ScoreRing({ score, size = 80, strokeWidth = 8, color, hideTotal = false }: ScoreRingProps) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;
  const dash = score > 0 ? (score / 100) * circumference : 0;
  const fontSize = Math.round(size * 0.24);
  const subSize = Math.round(size * 0.13);
  const c = color ?? defaultColor(score);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--border-subtle)" strokeWidth={strokeWidth} />
      {score > 0 && (
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={c} strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cx})`} />
      )}
      <text x={cx} y={cx + fontSize * 0.35} textAnchor="middle" fontSize={fontSize} fontWeight={700}
        fill={score > 0 ? c : "var(--text-muted)"}>
        {score > 0 ? score : "—"}
      </text>
      {!hideTotal && (
        <text x={cx} y={cx + fontSize * 0.35 + subSize + 2} textAnchor="middle" fontSize={subSize}
          fill="var(--text-muted)">/100</text>
      )}
    </svg>
  );
}
