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
  const clamped = Math.max(0, Math.min(100, score));
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const fontSize = Math.round(size * 0.26);
  const c = color ?? defaultColor(clamped);

  // Gap dynamique : le linecap rond « mange » le vide (rayon = strokeWidth/2).
  // On dimensionne le gap pour laisser ~3px visibles entre les segments quel que soit le stroke / rayon.
  const GAP_DEG = ((strokeWidth / 2 + 1.5) / r) * (180 / Math.PI) * 2;

  const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;
  const pt = (deg: number) => ({ x: cx + r * Math.cos(toRad(deg)), y: cx + r * Math.sin(toRad(deg)) });
  const arc = (startDeg: number, spanDeg: number) => {
    const s = pt(startDeg + GAP_DEG / 2);
    const e = pt(startDeg + spanDeg - GAP_DEG / 2);
    const large = spanDeg - GAP_DEG > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  const filledSpan = (clamped / 100) * 360;
  const emptySpan = 360 - filledSpan;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      {/* Segment vide (track) — trimé pour laisser un gap aux deux jonctions */}
      {emptySpan > GAP_DEG && (
        <path d={arc(filledSpan, emptySpan)} fill="none" stroke="var(--border-subtle)" strokeWidth={strokeWidth} strokeLinecap="round" />
      )}
      {/* Segment rempli */}
      {clamped > 0 && filledSpan > GAP_DEG && (
        <path d={arc(0, filledSpan)} fill="none" stroke={c} strokeWidth={strokeWidth} strokeLinecap="round" />
      )}
      {/* Chiffre en main (text-primary), jamais teinté par la couleur du score. */}
      <text x={cx} y={cx} textAnchor="middle" dominantBaseline="central" fontSize={fontSize} fontWeight={700}
        fill={clamped > 0 ? "var(--text-primary)" : "var(--text-muted)"}>
        {clamped > 0 ? clamped : "—"}
      </text>
    </svg>
  );
}
