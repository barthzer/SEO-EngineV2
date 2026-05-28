"use client";

import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { VariationPill } from "@/components/VariationPill";

/**
 * RankingChange — pill "avant → après" pour montrer une évolution de position.
 *
 * Utilisé pour les mots-clés en progression (et autres rankings).
 *
 * @example
 *   <RankingChange before={14} after={4} />
 */

interface RankingChangeProps {
  /** Position avant (rendue en pill grise). */
  before: number;
  /** Position après (rendue en pill verte si meilleure, rouge si pire). */
  after: number;
  /** Si true, affiche le delta de places (+X) à droite. Défaut true. */
  showDelta?: boolean;
}

export function RankingChange({ before, after, showDelta = true }: RankingChangeProps) {
  const delta = before - after; // positif si on progresse (rang plus bas = meilleur)
  const improved = delta > 0;

  return (
    <div className="flex items-center gap-1.5">
      {/* Pills avant/après neutres — le signal couleur vit dans la VariationPill du delta. */}
      <span className="rounded-full bg-[var(--bg-card-static)] px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-[var(--text-muted)]">
        #{before}
      </span>
      <ArrowRightIcon className="h-3 w-3 text-[var(--text-muted)]" />
      <span className="rounded-full bg-[var(--bg-card-static)] px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-[var(--text-primary)]">
        #{after}
      </span>
      {showDelta && delta !== 0 && (
        <VariationPill direction={improved ? "up" : "down"} className="ml-1 !text-[11px]">
          {improved ? "+" : "−"}{Math.abs(delta)}
        </VariationPill>
      )}
    </div>
  );
}
