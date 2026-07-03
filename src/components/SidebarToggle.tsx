"use client";

/**
 * SidebarToggle — bouton de rétractation/déploiement de la sidebar.
 *
 * Vit dans le Topbar (à gauche du sélecteur de projet). L'icône change selon
 * l'état : panneau plein quand la sidebar est repliée, fine barre quand elle
 * est déployée. Tooltip au survol.
 */

import { Tooltip } from "@/components/Tooltip";
import { useSidebar } from "@/context/SidebarContext";

export function SidebarToggle() {
  const { isExpanded, toggle } = useSidebar();
  return (
    <Tooltip label={isExpanded ? "Réduire le menu" : "Développer le menu"} side="right" portal>
      <button
        type="button"
        onClick={toggle}
        aria-label={isExpanded ? "Réduire le menu" : "Développer le menu"}
        aria-pressed={isExpanded}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-[var(--text-secondary)] transition-colors duration-150 hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          {isExpanded ? (
            <rect x="5.5" y="6.5" width="1.5" height="7" rx="0.75" fill="currentColor" />
          ) : (
            <rect x="10.5" y="6.5" width="7" height="5" rx="1" transform="rotate(90 10.5 6.5)" fill="currentColor" />
          )}
          <rect x="3" y="4" width="14" height="12" rx="2.8" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
    </Tooltip>
  );
}
