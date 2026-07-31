"use client";

import type { ReactNode } from "react";

/**
 * Panel — encart outline générique du DS.
 *
 * Pattern récurrent : `rounded-2xl border border-subtle p-5` avec
 * un h2 + sous-titre optionnel + slot action à droite.
 *
 * Différent de :
 *   - BlocCard  : carte d'action stratégique avec icon gradient + flèche
 *   - SoftPanel : wrapper bg-subtle pour grouper visuellement (sans border)
 *   - Callout   : info block coloré (info/warning/error/success)
 *
 * Utiliser Panel à chaque fois qu'on a besoin d'un encart simple avec
 * un titre + du contenu.
 *
 * @example
 *   <Panel title="Vos pages préférées" subtitle="celles qui amènent le plus de visites">
 *     <MetricListRow ... />
 *   </Panel>
 */

interface PanelProps {
  /** Titre du panel (rendu en h2 14px semibold). Optionnel. */
  title?: ReactNode;
  /** Sous-titre 11px muted, sous le titre. */
  subtitle?: ReactNode;
  /** Slot à droite du header (badge, lien, count, etc.). */
  action?: ReactNode;
  /** Padding interne — défaut "md" (p-5). "sm" = p-4, "lg" = p-6, "none" = pas de padding (pour les listes pleine largeur). */
  padding?: "none" | "sm" | "md" | "lg";
  /** Espace vertical entre le header et le contenu. Défaut "md". */
  gap?: "sm" | "md" | "lg";
  /** Si true : flex-col + content area en flex-1 (pour qu'un chart enfant en h-full remplisse). */
  fill?: boolean;
  /** Surface : "outline" (bordered, défaut) ou "filled" (bg-card-static gris léger, sans border). */
  surface?: "outline" | "filled";
  children: ReactNode;
  className?: string;
}

const paddings = {
  none: "p-0",
  sm:   "p-4",
  md:   "p-5",
  lg:   "p-6",
} as const;

const gaps = {
  sm: "mt-3",
  md: "mt-4",
  lg: "mt-5",
} as const;

export function Panel({
  title,
  subtitle,
  action,
  padding = "md",
  gap = "md",
  fill = false,
  surface = "outline",
  children,
  className = "",
}: PanelProps) {
  const hasHeader = title || subtitle || action;
  const surfaceClass =
    surface === "filled"
      ? "bg-[var(--bg-card-static)]"
      : "border border-[var(--border-subtle)]";
  return (
    <section
      className={`overflow-hidden rounded-2xl ${surfaceClass} ${paddings[padding]} ${fill ? "flex h-full flex-col" : ""} ${className}`}
    >
      {hasHeader && (
        <div className="flex items-baseline justify-between gap-4">
          <div className="min-w-0 flex-1">
            {title && (
              <h2 className="type-title">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-0.5 type-micro leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div
        className={`${hasHeader ? gaps[gap] : ""} ${fill ? "min-h-0 flex-1" : ""}`}
      >
        {children}
      </div>
    </section>
  );
}
