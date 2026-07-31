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
    return <span className="ml-1.5 inline-block w-2 text-center type-micro">—</span>;
  }
  const isUp = value > refValue;
  // « plus haut = concurrent devant = mauvais » → up = rouge, down = vert.
  const color = isUp ? "var(--color-danger)" : "var(--color-success)";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      className="ml-1.5 inline-block h-2.5 w-2.5"
      style={{ fill: color, transform: isUp ? undefined : "rotate(180deg)" }}
      aria-hidden="true"
    >
      {/* Même triangle plein que VariationPill (DS) — cohérence visuelle. */}
      <path d="M6.23784 1.30751C6.99212 -0.0985939 9.00843 -0.0985962 9.76271 1.3075L15.6196 12.2257C16.3343 13.5581 15.3691 15.1711 13.8571 15.1711H2.14341C0.631443 15.1711 -0.333754 13.5581 0.38097 12.2257L6.23784 1.30751Z" />
    </svg>
  );
}
