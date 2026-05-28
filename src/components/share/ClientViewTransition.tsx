"use client";

/**
 * ClientViewTransition — rejoue l'animation d'entrée `t-tab-enter` (fade + slide
 * + blur, ~200ms) à chaque changement de vue du portail client, pour aligner
 * les micro-transitions sur celles du portail consultant.
 *
 * Le `key={pathname}` force le remount du contenu → l'animation se relance.
 */

import { usePathname } from "next/navigation";

export function ClientViewTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="t-tab-enter">
      {children}
    </div>
  );
}
