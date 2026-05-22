"use client";

/**
 * Indicateur de coche unifié pour l'onboarding (et au-delà).
 * - Coché : pastille accent-primary + check blanc
 * - Décoché : cercle outline border-medium
 *
 * Utilisé partout où l'utilisateur sélectionne quelque chose (cards, opt-in,
 * filtres futurs). Remplace les `<input type="checkbox">` natifs et les
 * mélanges d'icônes lucide pour garantir un visuel cohérent.
 */
export function CheckBox({
  checked,
  size = 18,
  className = "",
}: {
  checked: boolean;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`flex flex-shrink-0 items-center justify-center rounded-full transition-colors ${
        checked
          ? "bg-[var(--accent-primary)]"
          : "border border-[var(--border-medium)] bg-transparent"
      } ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {checked && (
        <svg
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          className="text-white"
          style={{ width: size * 0.55, height: size * 0.55 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 6.5 L5 9 L9.5 3" />
        </svg>
      )}
    </span>
  );
}
