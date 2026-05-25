/**
 * ScoreGauges — 3 jauges verticales (Technique / Contenu / Netlinking).
 *
 * Remplace l'ancien ScoreCircle 0-100 opaque. Plus transparent et honnête :
 * le consultant peut défendre chaque sous-score face au client.
 *
 * Couleur par jauge :
 *  - ≥70  → success
 *  - ≥50  → warning
 *  - <50  → danger
 */

type Props = {
  technique: number | null;
  contenu: number | null;
  netlinking: number | null;
  /** Hauteur des barres (px). Largeur du composant ≈ 3 × 14px = 42px. */
  height?: number;
  /** Si true, n'affiche pas le label T/C/N (utile en très compact). */
  compact?: boolean;
};

function gaugeColor(v: number | null): string {
  if (v == null) return "var(--border-subtle)";
  if (v >= 70) return "var(--color-success)";
  if (v >= 50) return "var(--color-warning)";
  return "var(--color-danger)";
}

function Gauge({
  label,
  value,
  height,
  compact,
}: {
  label: string;
  value: number | null;
  height: number;
  compact: boolean;
}) {
  const filled = value ?? 0;
  const color = gaugeColor(value);

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Score chiffré au-dessus */}
      <span
        className="text-[10px] font-semibold leading-none tabular-nums"
        style={{ color: value == null ? "var(--text-muted)" : "var(--text-primary)" }}
      >
        {value ?? "—"}
      </span>
      {/* La jauge verticale */}
      <div
        className="relative w-[6px] overflow-hidden rounded-full bg-[var(--border-subtle)]"
        style={{ height }}
        aria-label={`${label} ${value ?? "non renseigné"}`}
      >
        <div
          className="absolute inset-x-0 bottom-0 rounded-full transition-[height] duration-500"
          style={{
            height: `${filled}%`,
            backgroundColor: color,
            transitionTimingFunction: "var(--ease-expo, cubic-bezier(0.16, 1, 0.3, 1))",
          }}
        />
      </div>
      {/* Label en-dessous */}
      {!compact && (
        <span className="text-[9px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
          {label}
        </span>
      )}
    </div>
  );
}

export function ScoreGauges({
  technique,
  contenu,
  netlinking,
  height = 28,
  compact = false,
}: Props) {
  return (
    <div className="flex flex-shrink-0 items-end gap-[6px]">
      <Gauge label="T" value={technique} height={height} compact={compact} />
      <Gauge label="C" value={contenu} height={height} compact={compact} />
      <Gauge label="N" value={netlinking} height={height} compact={compact} />
    </div>
  );
}
