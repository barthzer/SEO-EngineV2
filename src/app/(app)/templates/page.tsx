"use client";

/**
 * Écran A — Bibliothèque de templates de workflow.
 *
 * Filtres latéraux (contexte / type de page / tags / visibilité / auteur) +
 * grille de cartes. Prévisualisation en un clic via le Drawer DS. Cross-projet
 * (route top-level), cohérent avec le reste de l'app (DS bleu, composants réutilisés).
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/Button";
import { SearchInput } from "@/components/SearchInput";
import { SegmentedControl } from "@/components/SegmentedControl";
import { ResetFiltersButton } from "@/components/ResetFiltersButton";
import { Checkbox } from "@/components/Checkbox";
import { useDrawer } from "@/context/DrawerContext";
import { useToast } from "@/context/ToastContext";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { TemplatePreviewContent } from "@/components/templates/TemplatePreview";
import {
  getTemplates,
  sortTemplates,
  type WorkflowTemplate,
  type TemplateContext,
  type TemplateVisibility,
  CONTEXT_LABEL,
  PAGE_TYPE_LABEL,
  VISIBILITY_META,
} from "@/data/templates";

type SortKey = "recommande" | "recents" | "populaires";

/* ── Rangée de filtre (checkbox + label + compteur) ─────────────────── */
function FilterRow({
  label,
  count,
  checked,
  onToggle,
}: {
  label: string;
  count: number;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-[var(--bg-card-hover)]"
    >
      <Checkbox checked={checked} onChange={onToggle} />
      <span className="min-w-0 flex-1 truncate text-[13px] text-[var(--text-primary)]">{label}</span>
      <span className="text-[12px] tabular-nums text-[var(--text-muted)]">{count}</span>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 px-2 text-[12px] font-semibold text-[var(--text-secondary)]">{title}</p>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

export default function TemplatesPage() {
  const router = useRouter();
  const drawer = useDrawer();
  const toast = useToast();
  const all = getTemplates();

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("recommande");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const [selCtx, setSelCtx] = useState<string[]>([]);
  const [selType, setSelType] = useState<string[]>([]);
  const [selTag, setSelTag] = useState<string[]>([]);
  const [selVis, setSelVis] = useState<string[]>([]);
  const [selAuthor, setSelAuthor] = useState<string[]>([]);

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  // Ferme le drawer au démontage.
  useEffect(() => () => drawer.close(), []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Facettes (comptages sur toute la librairie) ── */
  const facets = useMemo(() => {
    const count = <T extends string>(pick: (t: WorkflowTemplate) => T[]) => {
      const m = new Map<string, number>();
      for (const t of all) for (const v of pick(t)) m.set(v, (m.get(v) ?? 0) + 1);
      return m;
    };
    return {
      ctx: count((t) => t.contexts),
      type: count((t) => [t.pageType]),
      tag: count((t) => t.tags),
      vis: count((t) => [t.visibility]),
      author: count((t) => [t.author]),
    };
  }, [all]);

  const CTX_KEYS: TemplateContext[] = ["from_scratch", "from_url_analysis"];
  const VIS_KEYS: TemplateVisibility[] = ["systeme", "agence", "equipe", "perso"];
  const typeKeys = [...facets.type.keys()];
  const tagKeys = [...facets.tag.keys()].sort();
  const authorKeys = [...facets.author.keys()].sort();

  /* ── Filtrage + tri ── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = all.filter((t) => {
      if (selCtx.length && !t.contexts.some((c) => selCtx.includes(c))) return false;
      if (selType.length && !selType.includes(t.pageType)) return false;
      if (selTag.length && !t.tags.some((tag) => selTag.includes(tag))) return false;
      if (selVis.length && !selVis.includes(t.visibility)) return false;
      if (selAuthor.length && !selAuthor.includes(t.author)) return false;
      if (favoritesOnly && !favorites.has(t.id)) return false;
      if (q) {
        const hay = `${t.name} ${t.description} ${t.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    if (sort === "recommande") list = sortTemplates(list);
    else if (sort === "recents") list = [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    else list = [...list].sort((a, b) => b.usageCount - a.usageCount);
    return list;
  }, [all, search, sort, selCtx, selType, selTag, selVis, selAuthor, favoritesOnly, favorites]);

  const hasFilters =
    search !== "" ||
    favoritesOnly ||
    selCtx.length > 0 ||
    selType.length > 0 ||
    selTag.length > 0 ||
    selVis.length > 0 ||
    selAuthor.length > 0;

  const resetFilters = () => {
    setSearch("");
    setFavoritesOnly(false);
    setSelCtx([]);
    setSelType([]);
    setSelTag([]);
    setSelVis([]);
    setSelAuthor([]);
  };

  const toggleFavorite = (id: string) =>
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  /* ── Actions (le sélecteur/configurateur/éditeur arrivent aux écrans suivants) ── */
  const useTemplate = (t: WorkflowTemplate) => {
    drawer.close();
    router.push(`/templates/configurer/${t.id}`);
  };
  const previewTemplate = (t: WorkflowTemplate) =>
    drawer.open("", <TemplatePreviewContent template={t} onUse={useTemplate} />);
  const configureTemplate = (t: WorkflowTemplate) =>
    toast.show(`Configurateur de « ${t.name} » (à venir)`);
  const duplicateTemplate = (t: WorkflowTemplate) =>
    toast.show(`« ${t.name} » dupliqué dans vos templates perso`);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto py-5">
      <div className="w-full px-5">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="mb-1 font-semibold leading-none tracking-heading text-[var(--text-primary)]">
              Bibliothèque de templates
            </h1>
            <p className="text-[14px] tracking-body text-[var(--text-secondary)]">
              {all.length} templates · process éprouvés prêts à l'emploi, partageables avec votre équipe.
            </p>
          </div>
          <Button variant="primary" onClick={() => toast.show("Nouveau template — configurateur (à venir)")}>
            <PlusIcon className="h-4 w-4" />
            Nouveau template
          </Button>
        </div>

        {/* Corps : rail de filtres + grille */}
        <div className="flex gap-6">
          {/* Rail de filtres */}
          <aside className="sticky top-0 hidden w-[216px] flex-shrink-0 flex-col gap-5 self-start lg:flex">
            <div
              role="button"
              tabIndex={0}
              onClick={() => setFavoritesOnly((v) => !v)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setFavoritesOnly((v) => !v);
                }
              }}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-[var(--bg-card-hover)]"
            >
              <Checkbox checked={favoritesOnly} onChange={() => setFavoritesOnly((v) => !v)} />
              <span className="flex-1 text-[13px] font-medium text-[var(--text-primary)]">Favoris</span>
              <span className="text-[12px] tabular-nums text-[var(--text-muted)]">{favorites.size}</span>
            </div>

            <FilterGroup title="Contexte d'usage">
              {CTX_KEYS.map((c) => (
                <FilterRow
                  key={c}
                  label={CONTEXT_LABEL[c]}
                  count={facets.ctx.get(c) ?? 0}
                  checked={selCtx.includes(c)}
                  onToggle={() => toggle(selCtx, setSelCtx, c)}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Type de page">
              {typeKeys.map((k) => (
                <FilterRow
                  key={k}
                  label={PAGE_TYPE_LABEL[k as keyof typeof PAGE_TYPE_LABEL]}
                  count={facets.type.get(k) ?? 0}
                  checked={selType.includes(k)}
                  onToggle={() => toggle(selType, setSelType, k)}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Tags">
              {tagKeys.map((k) => (
                <FilterRow
                  key={k}
                  label={k}
                  count={facets.tag.get(k) ?? 0}
                  checked={selTag.includes(k)}
                  onToggle={() => toggle(selTag, setSelTag, k)}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Visibilité">
              {VIS_KEYS.filter((v) => facets.vis.has(v)).map((v) => (
                <FilterRow
                  key={v}
                  label={VISIBILITY_META[v].label}
                  count={facets.vis.get(v) ?? 0}
                  checked={selVis.includes(v)}
                  onToggle={() => toggle(selVis, setSelVis, v)}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Auteur">
              {authorKeys.map((k) => (
                <FilterRow
                  key={k}
                  label={k}
                  count={facets.author.get(k) ?? 0}
                  checked={selAuthor.includes(k)}
                  onToggle={() => toggle(selAuthor, setSelAuthor, k)}
                />
              ))}
            </FilterGroup>
          </aside>

          {/* Grille */}
          <div className="min-w-0 flex-1">
            {/* Toolbar */}
            <div className="mb-4 flex items-center gap-3">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Rechercher un template…"
                expandedWidth={260}
              />
              <div className="ml-auto flex items-center gap-2">
                <ResetFiltersButton show={hasFilters} onReset={resetFilters} />
                <SegmentedControl<SortKey>
                  options={[
                    { key: "recommande", label: "Recommandés" },
                    { key: "recents", label: "Récents" },
                    { key: "populaires", label: "Populaires" },
                  ]}
                  value={sort}
                  onChange={setSort}
                />
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border-medium)] px-6 py-16 text-center">
                <p className="text-[14px] font-medium text-[var(--text-primary)]">Aucun template ne correspond</p>
                <p className="mt-1 text-[13px] text-[var(--text-muted)]">
                  Ajustez vos filtres ou réinitialisez la recherche.
                </p>
                {hasFilters && (
                  <button
                    onClick={resetFilters}
                    className="mt-3 text-[13px] font-medium text-[var(--text-secondary)] underline underline-offset-2 hover:text-[var(--text-primary)]"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {filtered.map((t) => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    favorite={favorites.has(t.id)}
                    onToggleFavorite={() => toggleFavorite(t.id)}
                    onPreview={() => previewTemplate(t)}
                    onUse={() => useTemplate(t)}
                    onDuplicate={() => duplicateTemplate(t)}
                    onConfigure={() => configureTemplate(t)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
