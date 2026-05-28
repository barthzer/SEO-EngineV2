"use client";

/**
 * TaskRow — ligne compacte type Linear pour vues de tâches scalables.
 *
 * Format : status dot · title · meta (owner + date) · chevron expand.
 * Cliquable pour révéler un panneau de détails inline (description, lien preuve).
 *
 * Conçu pour vivre dans un TaskGroup. Au scale (50+ items), reste lisible
 * grâce à la hauteur fixe par row.
 *
 * @example
 *   <TaskGroup ...>
 *     <TaskRow
 *       title="Optimisation balises title"
 *       statusColor="var(--color-success)"
 *       owner={{ name: "Sophie M.", photoSeed: "sm" }}
 *       date="14 mai"
 *       description="Nous avons réécrit les balises..."
 *       evidenceUrl="https://..."
 *       isLast
 *     />
 *   </TaskGroup>
 */

import { useState, type ReactNode } from "react";
import { ChevronDownIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { LinkButton } from "@/components/Button";
import { pravatarUrl } from "@/lib/avatar";

export interface TaskRowOwner {
  name: string;
  photoSeed: string;
}

interface TaskRowProps {
  title: string;
  /** Couleur du dot statut à gauche. */
  statusColor: string;
  owner?: TaskRowOwner;
  /** Texte court de date (ex. "14 mai", "Demain"). */
  date?: string;
  /** Description longue affichée à l'expand. */
  description?: ReactNode;
  /** URL preuve d'implémentation (LinkButton à l'expand). */
  evidenceUrl?: string;
  /** Contenu additionnel rendu en bas de la zone dépliée (ex. commentaires). */
  footer?: ReactNode;
  /** Case à cocher de sélection multiple (hors du bouton d'expand). */
  selectable?: boolean;
  selected?: boolean;
  onSelectChange?: (v: boolean) => void;
  /** Pas de border-bottom sur la dernière row du groupe. */
  isLast?: boolean;
}

/** Petit avatar avec fallback initiales — minimal pour éviter import croisé. */
function MiniAvatar({ name, photoSeed }: TaskRowOwner) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <span
        className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--bg-secondary)] text-[9px] font-semibold text-[var(--text-secondary)]"
        title={name}
      >
        {name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
      </span>
    );
  }
  return (
    <img
      src={pravatarUrl(photoSeed, 40)}
      alt={name}
      title={name}
      width={20}
      height={20}
      onError={() => setErrored(true)}
      className="h-5 w-5 flex-shrink-0 rounded-full object-cover"
    />
  );
}

export function TaskRow({
  title,
  statusColor,
  owner,
  date,
  description,
  evidenceUrl,
  footer,
  selectable = false,
  selected = false,
  onSelectChange,
  isLast = false,
}: TaskRowProps) {
  const [expanded, setExpanded] = useState(false);
  const canExpand = Boolean(description || evidenceUrl || footer);

  return (
    <div className={isLast ? "" : "border-b border-[var(--border-subtle)]"}>
      <div className="flex items-center">
        {selectable && (
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelectChange?.(e.target.checked)}
            aria-label="Sélectionner la mission"
            className="ml-5 h-4 w-4 flex-shrink-0 cursor-pointer rounded border-[var(--border-medium)] accent-[var(--accent-primary)]"
          />
        )}
      <button
        type="button"
        onClick={() => canExpand && setExpanded((v) => !v)}
        disabled={!canExpand}
        className={`flex min-w-0 flex-1 items-center gap-3 py-3 text-left transition-colors ${selectable ? "pl-3 pr-5" : "px-5"} ${canExpand ? "hover:bg-[var(--bg-card-hover)] cursor-pointer" : "cursor-default"}`}
        aria-expanded={canExpand ? expanded : undefined}
      >
        <span
          className="h-2 w-2 flex-shrink-0 rounded-full"
          style={{ backgroundColor: statusColor }}
          aria-hidden
        />
        <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-[var(--text-primary)]">
          {title}
        </p>
        {owner && <MiniAvatar name={owner.name} photoSeed={owner.photoSeed} />}
        {date && (
          <span className="flex-shrink-0 text-[11px] tabular-nums text-[var(--text-muted)]">
            {date}
          </span>
        )}
        {canExpand && (
          <ChevronDownIcon
            className={`h-3.5 w-3.5 flex-shrink-0 text-[var(--text-muted)] transition-transform duration-200 ${expanded ? "" : "-rotate-90"}`}
            strokeWidth={2.5}
          />
        )}
      </button>
      </div>

      {expanded && canExpand && (
        <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-card-static)] px-5 py-4">
          {description && (
            <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
              {description}
            </p>
          )}
          {evidenceUrl && (
            <div className={description ? "mt-3" : ""}>
              <LinkButton
                href={evidenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
                size="sm"
              >
                Voir la page
                <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
              </LinkButton>
            </div>
          )}
          {footer && <div className={description || evidenceUrl ? "mt-4" : ""}>{footer}</div>}
        </div>
      )}
    </div>
  );
}
