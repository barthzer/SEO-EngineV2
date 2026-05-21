"use client";

import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

/**
 * ValidateSwitch — toggle iOS-style pour valider/dévalider une action en un clic.
 * - OFF (todo) : fond gris, thumb à gauche avec une petite croix
 * - ON  (done) : fond vert, thumb à droite avec un check
 */
export function ValidateSwitch({
  value,
  onChange,
  ariaLabel,
}: {
  value: boolean;
  onChange: (next: boolean) => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={ariaLabel ?? (value ? "Action validée — cliquer pour annuler" : "Cliquer pour valider l'action")}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!value);
      }}
      className="relative inline-block h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200"
      style={{ backgroundColor: value ? "var(--color-success)" : "var(--border-medium)" }}
    >
      <span
        className="absolute top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm transition-[left] duration-200"
        style={{ left: value ? "22px" : "2px" }}
      >
        {value
          ? <CheckIcon className="h-3 w-3 text-[var(--color-success)]" strokeWidth={3} />
          : <XMarkIcon className="h-3 w-3 text-[var(--text-muted)]" strokeWidth={3} />}
      </span>
    </button>
  );
}
