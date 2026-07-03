"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { Tooltip } from "@/components/Tooltip";

/**
 * Bouton de réinitialisation des filtres — fixture DS des toolbars multi-filtres
 * (SearchInput + plusieurs `ColPill`). Bouton rond ghost avec icône X + tooltip.
 *
 * Convention : affiché uniquement quand au moins un filtre est actif (`show`),
 * placé après le dernier `ColPill` et avant le compteur de résultats — exactement
 * comme sur la vue URLs. Le parent garde la source de vérité (état des filtres) et
 * fournit le `onReset` qui remet chaque filtre à sa valeur par défaut.
 *
 * @example
 * <ResetFiltersButton
 *   show={search !== "" || period !== "30j"}
 *   onReset={() => { setSearch(""); setPeriod("30j"); }}
 * />
 */
export function ResetFiltersButton({
  show,
  onReset,
  side = "top",
}: {
  /** Au moins un filtre est actif → affiche le bouton. Sinon ne rend rien. */
  show: boolean;
  onReset: () => void;
  /** Côté du tooltip (défaut "top"). */
  side?: "top" | "right" | "bottom" | "left";
}) {
  if (!show) return null;
  return (
    <Tooltip label="Réinitialiser les filtres" side={side} portal>
      <button
        type="button"
        onClick={onReset}
        aria-label="Réinitialiser les filtres"
        className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </Tooltip>
  );
}
