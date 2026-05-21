/**
 * DeltaIndicator — triangle haut/bas pour signaler qu'une valeur est au-dessus/en-dessous d'une référence.
 *
 * Convention « plus haut = mieux » (TF/CF/Backlinks/etc.) :
 * - value > ref → concurrent au-dessus de vous = rouge (mauvais pour vous)
 * - value < ref → concurrent en-dessous = vert (vous êtes devant)
 * - value === ref → tiret muted
 *
 * Utiliser à côté de la valeur dans les tableaux comparatifs concurrents.
 */
export function DeltaIndicator({ value, ref: refValue }: { value: number; ref: number }) {
  if (value === refValue) {
    return <span className="ml-1.5 inline-block w-2 text-center text-[10px] tracking-micro text-[var(--text-muted)]">—</span>;
  }
  const isUp = value > refValue;
  const color = isUp ? "var(--color-danger)" : "var(--color-success)";
  return (
    <svg
      viewBox="0 0 10 10"
      className="ml-1.5 inline-block h-2.5 w-2.5"
      style={{ fill: color }}
      aria-hidden="true"
    >
      {isUp ? <polygon points="5,1.5 9,8 1,8" /> : <polygon points="5,8.5 1,2 9,2" />}
    </svg>
  );
}
