"use client";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  /** Override de la couleur. Par défaut, suit l'heuristique : rouge < 40, ambre < 70, vert >= 70. */
  color?: string;
  /** @deprecated le "/100" n'est plus rendu — conservé pour compat des callsites. */
  hideTotal?: boolean;
}

const defaultColor = (s: number) => s >= 70 ? "var(--color-success)" : s >= 40 ? "var(--color-warning)" : "var(--color-danger)";

export function ScoreRing({ score, size = 80, strokeWidth = 5, color }: ScoreRingProps) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;
  const dash = score > 0 ? (score / 100) * circumference : 0;
  const fontSize = Math.round(size * 0.26);
  const c = color ?? defaultColor(score);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--border-subtle)" strokeWidth={strokeWidth} />
      {score > 0 && (
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={c} strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cx})`} />
      )}
      {/* Chiffre en main (text-primary), jamais teinté par la couleur du score. */}
      <text x={cx} y={cx} textAnchor="middle" dominantBaseline="central" fontSize={fontSize} fontWeight={700}
        fill={score > 0 ? "var(--text-primary)" : "var(--text-muted)"}>
        {score > 0 ? score : "—"}
      </text>
    </svg>
  );
}
