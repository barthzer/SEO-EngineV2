import type { SVGProps } from "react";

/**
 * GaugeGlyph — glyphe « voyant / jauge » (Geist), icône DS de l'axe « Technique ».
 * Filled (currentColor), pour rester cohérent avec les icônes heroicons solid.
 * Utilisé partout où l'on représente l'axe Technique (anneaux, jauges, santé, nav…).
 */
export function GaugeGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" {...props}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 1.58A6.5 6.5 0 0 0 3.4 12.6l.53.53-1.06 1.06-.53-.53A8 8 0 0 1 9.97.24zm4.83 3.54a6.5 6.5 0 0 1-1.23 7.48l-.53.53 1.06 1.06.53-.53a8 8 0 0 0 1.15-9.87zM8 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2m0 1.5a2.5 2.5 0 0 0 1.98-4.03l3.47-4.33a8 8 0 0 0-1.2-.91L8.76 5.6A2.5 2.5 0 1 0 8 10.5"
      />
    </svg>
  );
}
