/**
 * Case à cocher DS — source unique de vérité (à réutiliser partout, ne pas recréer).
 * Cochée : fond `--accent-primary` + coche blanche ; indéterminée : barre blanche ;
 * `rounded-[6px]`, 20px. Le clic stoppe la propagation (utilisable dans une ligne cliquable).
 */
export function Checkbox({ checked, indeterminate = false, onChange }: { checked: boolean; indeterminate?: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      aria-label={checked ? "Désélectionner" : "Sélectionner"}
      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-[6px] border transition-all ${
        checked || indeterminate
          ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]"
          : "border-[var(--border-medium)] hover:border-[var(--accent-primary)]"
      }`}
    >
      {indeterminate && !checked ? (
        <span className="block h-0.5 w-2 rounded-full bg-white" />
      ) : checked ? (
        <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 10 10" fill="none">
          <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </button>
  );
}
