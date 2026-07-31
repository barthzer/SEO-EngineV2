"use client";

/**
 * Carte de template dans la bibliothèque (Écran A).
 * Corps cliquable → prévisualisation ; footer : CTA « Utiliser » + menu « … »
 * (Prévisualiser / Dupliquer / Configurer). Étoile favori en haut à droite.
 */

import {
  StarIcon as StarOutline,
  EyeIcon,
  DocumentDuplicateIcon,
  Cog6ToothIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { Button } from "@/components/Button";
import { IconBadge } from "@/components/IconBadge";
import { DropdownMenu, DropdownItem } from "@/components/DropdownMenu";
import { type WorkflowTemplate, PAGE_TYPE_LABEL } from "@/data/templates";
import { templateIcon, TemplateTagPill, VisibilityBadge } from "@/components/templates/ui";

export function TemplateCard({
  template,
  favorite,
  onToggleFavorite,
  onPreview,
  onUse,
  onDuplicate,
  onConfigure,
}: {
  template: WorkflowTemplate;
  favorite: boolean;
  onToggleFavorite: () => void;
  onPreview: () => void;
  onUse: () => void;
  onDuplicate: () => void;
  onConfigure: () => void;
}) {
  const Icon = templateIcon(template.icon);
  const extra = template.tags.length - 3;

  return (
    <div className="flex flex-col rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 transition-all duration-200 hover:border-[var(--border-medium)] hover:shadow-[var(--shadow-card)]">
      {/* Top : icône + favori + visibilité */}
      <div className="mb-4 flex items-start justify-between">
        <IconBadge icon={Icon} size="lg" />
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)]"
          >
            {favorite ? (
              <StarSolid className="h-4 w-4" style={{ color: "var(--color-warning)" }} />
            ) : (
              <StarOutline className="h-4 w-4" />
            )}
          </button>
          <VisibilityBadge visibility={template.visibility} />
        </div>
      </div>

      {/* Corps cliquable → preview */}
      <button onClick={onPreview} className="flex flex-1 flex-col items-start text-left">
        <div className="flex items-center gap-2">
          <h3 className="type-title">
            {template.name}
          </h3>
          {template.updateAvailable && (
            <span className="rounded-full bg-[var(--bg-subtle)] px-1.5 py-0.5 type-micro text-[var(--text-secondary)]">
              MàJ dispo
            </span>
          )}
        </div>
        <p className="mt-1.5 line-clamp-2 type-body-sm">
          {template.description}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {template.tags.slice(0, 3).map((t) => (
            <TemplateTagPill key={t} tag={t} />
          ))}
          {extra > 0 && (
            <span className="type-micro">+{extra}</span>
          )}
        </div>
      </button>

      {/* Méta */}
      <div className="mt-4 flex items-center gap-1.5 type-caption text-[var(--text-muted)]">
        <span className="truncate">{template.author}</span>
        <span>·</span>
        <span className="whitespace-nowrap">{template.usageCount} utilisations</span>
        <span>·</span>
        <span className="truncate">{PAGE_TYPE_LABEL[template.pageType]}</span>
      </div>

      {/* Footer : CTA + menu */}
      <div className="mt-4 flex items-center gap-2 border-t border-[var(--border-subtle)] pt-4">
        <Button variant="secondary" size="sm" className="flex-1 justify-center" onClick={onUse}>
          Utiliser
        </Button>
        <DropdownMenu
          align="right"
          width={190}
          trigger={
            <button
              type="button"
              aria-label="Plus d'actions"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            >
              <EllipsisHorizontalIcon className="h-5 w-5" />
            </button>
          }
        >
          <DropdownItem icon={EyeIcon} onClick={onPreview}>
            Prévisualiser
          </DropdownItem>
          <DropdownItem icon={DocumentDuplicateIcon} onClick={onDuplicate}>
            Dupliquer
          </DropdownItem>
          <DropdownItem icon={Cog6ToothIcon} onClick={onConfigure}>
            Configurer
          </DropdownItem>
        </DropdownMenu>
      </div>
    </div>
  );
}
