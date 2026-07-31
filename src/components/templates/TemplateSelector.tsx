"use client";

/**
 * Écran C — le Sélecteur de template (layout façon Profound).
 *
 * Grande modale : rail « Favoris » à gauche, recherche + onglets de catégorie
 * (type de page) et grille de cartes à droite. Chaque carte = badge catégorie,
 * étoile favori, illustration document, titre + description, CTA « Utiliser ce
 * template ». Tout en gris/neutre (pas d'accent bleu).
 *
 * Deux points d'entrée (mêmes props qu'avant) :
 *  - « Créer du contenu » (CreationView)  → contexte from_scratch + « Partir de zéro ».
 *  - Drawer d'analyse (BriefsView)        → contexte from_url_analysis, pré-filtré sur l'URL.
 *
 * Portail custom + `useModalTransition` (mêmes transitions que le ModalShell DS),
 * mais header et rail pleine hauteur pour coller au design de référence.
 */

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  XMarkIcon,
  StarIcon as StarOutline,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { useModalTransition } from "@/hooks/useModalTransition";
import { Button } from "@/components/Button";
import { SearchInput } from "@/components/SearchInput";
import { FilterTabs, type FilterTab } from "@/components/FilterTabs";
import { templateIcon, DocStackIllustration } from "@/components/templates/ui";
import {
  getTemplates,
  sortTemplates,
  type WorkflowTemplate,
  type TemplateContext,
  type TemplatePageType,
  PAGE_TYPE_LABEL,
} from "@/data/templates";

/* ── Carte de template ─────────────────────────────────────────────────── */
function SelectorCard({
  template,
  favorite,
  onToggleFavorite,
  onUse,
}: {
  template: WorkflowTemplate;
  favorite: boolean;
  onToggleFavorite: () => void;
  onUse: () => void;
}) {
  const Icon = templateIcon(template.icon);
  return (
    <div className="flex flex-col rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 transition-all duration-200 hover:border-[var(--border-medium)] hover:shadow-[var(--shadow-card)]">
      {/* Badge catégorie + étoile */}
      <div className="flex items-start justify-between">
        <span className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card-static)] px-2 py-0.5 type-micro text-[var(--text-secondary)]">
          {PAGE_TYPE_LABEL[template.pageType]}
        </span>
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
      </div>

      {/* Illustration */}
      <div className="my-4 flex justify-center">
        <DocStackIllustration icon={Icon} className="w-[150px]" />
      </div>

      {/* Titre + description (centrés, façon Profound) */}
      <div className="flex items-center justify-center gap-1.5">
        <h3 className="text-center type-title">
          {template.name}
        </h3>
        {template.updateAvailable && (
          <span className="rounded-full bg-[var(--bg-subtle)] px-1.5 py-0.5 type-micro text-[var(--text-secondary)]">
            MàJ
          </span>
        )}
      </div>
      <p className="mt-1.5 line-clamp-2 text-center type-body-sm">
        {template.description}
      </p>

      {/* CTA (poussé en bas pour aligner les cartes) */}
      <div className="flex-1" />
      <Button variant="secondary" className="mt-4 w-full justify-center" onClick={onUse}>
        Utiliser ce template
      </Button>
    </div>
  );
}

/* ── Sélecteur ─────────────────────────────────────────────────────────── */
export function TemplateSelector({
  context,
  title = "Générer du contenu à partir d'un template",
  subtitle,
  allowBlank = false,
  onSelect,
  onBlank,
  onClose,
}: {
  /** Ne montre que les templates couvrant ce contexte d'usage. */
  context?: TemplateContext;
  /** Réservé (tri par type de page) — non utilisé pour l'instant. */
  pageType?: TemplatePageType;
  title?: string;
  subtitle?: string;
  /** Affiche la carte « Partir de zéro » (sans template). */
  allowBlank?: boolean;
  onSelect: (t: WorkflowTemplate) => void;
  onBlank?: () => void;
  onClose: () => void;
}) {
  const { phase, requestClose } = useModalTransition(onClose);

  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<TemplatePageType | "all">("all");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const base = useMemo(() => {
    let l = getTemplates();
    if (context) l = l.filter((t) => t.contexts.includes(context));
    return sortTemplates(l);
  }, [context]);

  // Onglets de catégorie = types de page présents dans le contexte courant.
  const cats = useMemo(() => {
    const seen = new Set<TemplatePageType>();
    const out: TemplatePageType[] = [];
    for (const t of base) if (!seen.has(t.pageType)) { seen.add(t.pageType); out.push(t.pageType); }
    return out;
  }, [base]);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return base.filter((t) => {
      if (cat !== "all" && t.pageType !== cat) return false;
      if (q && !`${t.name} ${t.description} ${t.tags.join(" ")}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [base, cat, search]);

  const favList = base.filter((t) => favorites.has(t.id));
  const toggleFav = (id: string) =>
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const catTabs: FilterTab<TemplatePageType | "all">[] = [
    { key: "all", label: "Tous" },
    ...cats.map((c) => ({ key: c, label: PAGE_TYPE_LABEL[c] })),
  ];

  if (typeof document === "undefined") return null;
  const cls = phase === "open" ? "is-open" : phase === "closing" ? "is-closing" : "";

  return createPortal(
    <div
      role="presentation"
      className={`t-modal-overlay ${cls} fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm sm:p-6`}
      onClick={(e) => e.target === e.currentTarget && requestClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`t-modal ${cls} relative flex max-h-[88vh] w-full max-w-[1200px] flex-col overflow-hidden rounded-2xl bg-[var(--modal-bg)] shadow-[var(--shadow-floating)]`}
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-start justify-between gap-4 border-b border-[var(--border-subtle)] px-6 py-4">
          <div className="min-w-0">
            <h2 className="type-h3">{title}</h2>
            {subtitle && <p className="mt-0.5 type-body-sm">{subtitle}</p>}
          </div>
          <button
            onClick={requestClose}
            aria-label="Fermer"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1">
          {/* Rail favoris */}
          <aside className="hidden w-[248px] flex-shrink-0 flex-col border-r border-[var(--border-subtle)] p-5 md:flex">
            <p className="type-label font-semibold text-[var(--text-primary)]">Templates favoris</p>
            {favList.length === 0 ? (
              <p className="mt-2 type-body-sm">
                Aucun template en favori. Vos favoris apparaîtront ici.
              </p>
            ) : (
              <div className="mt-3 flex flex-col gap-0.5">
                {favList.map((t) => {
                  const Icon = templateIcon(t.icon);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => onSelect(t)}
                      className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-[var(--bg-card-hover)]"
                    >
                      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1 truncate type-label text-[var(--text-primary)]">{t.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </aside>

          {/* Colonne principale */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Recherche + onglets */}
            <div className="flex-shrink-0 px-6 pt-5">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Rechercher un template…"
                alwaysExpanded
              />
              <div className="mt-3">
                <FilterTabs tabs={catTabs} value={cat} onChange={setCat} />
              </div>
            </div>

            {/* Grille */}
            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-4">
              {shown.length === 0 && !allowBlank ? (
                <div className="rounded-2xl border border-dashed border-[var(--border-medium)] px-6 py-16 text-center">
                  <p className="type-body-strong">Aucun template ne correspond</p>
                  <p className="mt-1 type-body-sm">Ajustez la recherche ou la catégorie.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {/* Carte « Partir de zéro » */}
                  {allowBlank && cat === "all" && search.trim() === "" && (
                    <button
                      type="button"
                      onClick={onBlank}
                      className="flex flex-col rounded-2xl border border-dashed border-[var(--border-medium)] p-4 text-center transition-colors hover:bg-[var(--bg-subtle)]"
                    >
                      {/* rangée vide : aligne l'illustration avec les cartes (badge + étoile) */}
                      <div className="h-7" />
                      <div className="my-4 flex justify-center">
                        <DocStackIllustration icon={PlusIcon} className="w-[150px]" />
                      </div>
                      <h3 className="type-title">Partir de zéro</h3>
                      <p className="mt-1.5 line-clamp-2 type-body-sm">
                        Créez une page sans partir d'un template.
                      </p>
                      <div className="flex-1" />
                      <span className="mt-4 w-full rounded-xl border border-[var(--border-subtle)] px-4 py-2 type-label text-[var(--text-primary)]">
                        Commencer
                      </span>
                    </button>
                  )}
                  {shown.map((t) => (
                    <SelectorCard
                      key={t.id}
                      template={t}
                      favorite={favorites.has(t.id)}
                      onToggleFavorite={() => toggleFav(t.id)}
                      onUse={() => onSelect(t)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
