/**
 * HealthScoreBar — affichage "grand format" d'un score 0-100 dans un dashboard.
 *
 * Différent de :
 *  - ScoreGauges : 3 mini jauges compactes, pour listes / cards denses
 *  - ScoreRing : anneau circulaire (1 score)
 *
 * Pattern : [icon] label + status pill + big number + horizontal bar + hint.
 * Conçu pour être empilé verticalement quand on doit montrer plusieurs
 * axes dans un panel (Technique / Contenu / Netlinking par exemple).
 *
 * @example
 *   <Panel title="Santé de votre site">
 *     <HealthScoreBar icon={WrenchIcon}      label="Technique" score={91} hint="..." />
 *     <HealthScoreBar icon={DocumentTextIcon} label="Contenu"   score={88} hint="..." />
 *     <HealthScoreBar icon={LinkIcon}         label="Notoriété" score={94} hint="..." />
 *   </Panel>
 */

import type { ElementType } from "react";
import { IconBadge } from "@/components/IconBadge";

interface HealthScoreBarProps {
  label: string;
  /** Score 0-100. */
  score: number;
  /** Texte explicatif court sous le bar. */
  hint?: string;
  /** Icône optionnelle représentant l'axe (Wrench pour technique, etc.). */
  icon?: ElementType;
  /** Espacement vertical entre les rows quand stackés. Défaut "md". */
  spacing?: "sm" | "md" | "lg";
}

function scoreColor(score: number): string {
  if (score >= 70) return "var(--color-success)";
  if (score >= 50) return "var(--color-warning)";
  return "var(--color-danger)";
}

/** Bg tinté correspondant — tokens "soft" (22% light / 30% dark) pour un
 *  contraste lisible en light comme en dark mode. */
function scoreBg(score: number): string {
  if (score >= 70) return "var(--color-success-soft)";
  if (score >= 50) return "var(--color-warning-soft)";
  return "var(--color-danger-soft)";
}

function scoreStatus(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Bon";
  if (score >= 50) return "Correct";
  return "À améliorer";
}

const spacings = {
  sm: "py-2.5",
  md: "py-3.5",
  lg: "py-5",
} as const;

export function HealthScoreBar({
  label,
  score,
  hint,
  icon,
  spacing = "md",
}: HealthScoreBarProps) {
  const color = scoreColor(score);
  const status = scoreStatus(score);

  return (
    <div className={`flex flex-col gap-2 ${spacings[spacing]}`}>
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {icon && (
            <IconBadge
              icon={icon}
              size="sm"
              color={color}
              bg={scoreBg(score)}
            />
          )}
          <p className="text-[13px] font-medium text-[var(--text-primary)]">{label}</p>
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color }}
          >
            {status}
          </span>
          <span className="text-[28px] font-semibold leading-none tabular-nums text-[var(--text-primary)]">
            {score}
          </span>
          <span className="text-[12px] text-[var(--text-muted)]">/100</span>
        </div>
      </div>

      <div
        className="relative h-2 w-full overflow-hidden rounded-full bg-[var(--bg-card-static)]"
        aria-hidden
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${score}%`,
            backgroundColor: color,
            transitionTimingFunction: "var(--ease-expo, cubic-bezier(0.16,1,0.3,1))",
          }}
        />
      </div>

      {hint && (
        <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">{hint}</p>
      )}
    </div>
  );
}
