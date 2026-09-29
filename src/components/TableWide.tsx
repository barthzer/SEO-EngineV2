"use client";

import { Fragment, useState, useEffect, useRef, type ReactNode } from "react";
import { ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { DropdownMenu, DropdownItem } from "@/components/DropdownMenu";
import { Checkbox } from "@/components/Checkbox";

/* ── Types ────────────────────────────────────────────────────────────── */

export type ColumnDef<T> = {
  /** Unique key for the column */
  key: string;
  /** Header content — plain string or any ReactNode (e.g. a ColPill).
   *  Quand `sortable=true`, ne passer qu'un string : le composant ajoute lui-même
   *  les chevrons de tri à côté du label. */
  header: ReactNode;
  /** Fixed pixel width (or minimum width when `flex` is true) */
  width: number;
  /** Text alignment for the cell */
  align?: "left" | "right";
  /** When true, the column grows to fill remaining horizontal space (still respects `width` as min-width). */
  flex?: boolean;
  /** Plafond optionnel quand `flex=true` — au-delà, la colonne ne s'étire plus. */
  maxWidth?: number;
  /** Renderer for the cell content */
  render: (row: T, index: number) => ReactNode;
  /** Active le tri sur cette colonne (cycle desc → asc → off au clic). Requiert `sortValue`. */
  sortable?: boolean;
  /** Accesseur de valeur pour le tri (numérique ou date converti en timestamp recommandé). */
  sortValue?: (row: T) => number | string;
};

interface TableWideProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  rowKey: (row: T) => string | number;
  /** Click handler — when provided, rows render as <button> with hover effect */
  onRowClick?: (row: T, index: number) => void;
  /** State of the current row (active = highlight bg). Index-based against `data` */
  isRowActive?: (row: T) => boolean;
  /** Empty state ReactNode shown when filtered.length === 0 */
  emptyState?: ReactNode;
  /** Page size — defaults to 25 */
  pageSize?: number;
  /** Page size options for the dropdown — defaults to [10, 25, 50, 100] */
  pageSizeOptions?: number[];
  /** Hide pagination footer entirely (default: shown) */
  hidePagination?: boolean;
  /** Min width of the body — enables horizontal scroll when narrower viewport */
  minWidth?: number;
  /** Extra horizontal padding inside cells. Defaults to var(--page-px) on the left edge, 16px on the right */
  edgePadding?: string;
  /** Trailing chevron column rendered sticky-right (e.g. drilldown indicator) */
  trailingChevron?: boolean;
  /** Custom action visible on row hover, rendered in a sticky-right column.
   *  Use for contextual CTAs ("Brief", "Voir", "…"). The action's container
   *  has a card-matching bg so it overlays content cleanly during horizontal scroll. */
  trailingAction?: (row: T, index: number) => ReactNode;
  /** Width of the trailing column (sticky-right). Default 96 px. */
  trailingActionWidth?: number;
  /** Wraps the whole table in a card (rounded-2xl + border + bg-card). */
  bordered?: boolean;
  /** Active la colonne de sélection (cases à cocher) en tête de ligne. */
  selectable?: boolean;
  /** Clés sélectionnées (contrôlé par le parent). */
  selected?: Set<string | number>;
  /** Toggle d'une ligne. */
  onToggleRow?: (key: string | number) => void;
  /** Toggle « tout sélectionner » (reçoit les clés de la page + l'état courant). */
  onToggleAll?: (keys: (string | number)[], allSelected: boolean) => void;
  /** Épingle horizontalement la colonne de sélection + la 1re colonne (nom).
   *  Requiert `minWidth` pour produire un scroll horizontal. */
  stickyLeft?: boolean;
  /** Lignes dépliables (modes standard et stickyLeft) : contenu rendu sous la ligne quand
   *  `isExpanded(row)` est vrai. L'état ouvert/fermé est contrôlé par le parent
   *  (typiquement via `onRowClick`). Ex. : détail mot-clé par mot-clé d'un groupe. */
  renderExpanded?: (row: T) => ReactNode;
  isExpanded?: (row: T) => boolean;
  className?: string;
}

/** Ombre DS des colonnes sticky-left — bande dégradée verticale collée au bord DROIT
 *  uniquement (pleine hauteur → aucune bavure haut/bas, continue entre les lignes). */
export const STICKY_EDGE = "linear-gradient(to right, rgba(2,6,23,0.07), rgba(2,6,23,0.02) 55%, transparent)";

/* ── Component ────────────────────────────────────────────────────────── */

export function TableWide<T>({
  columns,
  data,
  rowKey,
  onRowClick,
  isRowActive,
  emptyState,
  pageSize: initialPageSize = 25,
  pageSizeOptions = [10, 25, 50, 100],
  hidePagination = false,
  minWidth,
  edgePadding = "var(--page-px)",
  trailingChevron = false,
  bordered = false,
  trailingAction,
  trailingActionWidth = 96,
  selectable = false,
  selected,
  onToggleRow,
  onToggleAll,
  stickyLeft = false,
  renderExpanded,
  isExpanded,
  className = "",
}: TableWideProps<T>) {
  /* Sort interne — clé de colonne + direction. Cycle desc → asc → off au clic header. */
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  /* Scroll horizontal — l'ombre des colonnes sticky n'apparaît qu'une fois défilé. */
  const [scrolled, setScrolled] = useState(false);
  /* Largeur visible du conteneur horizontal (mode sticky) : le panneau déplié y est
     épinglé pour rester fixe pendant que les colonnes de la ligne défilent. */
  const scrollRef = useRef<HTMLDivElement>(null);
  const [viewportW, setViewportW] = useState(0);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !renderExpanded) return;
    const ro = new ResizeObserver(() => setViewportW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, [stickyLeft, renderExpanded]);
  function toggleSort(k: string) {
    if (sortKey !== k) { setSortKey(k); setSortDir("desc"); return; }
    if (sortDir === "desc") { setSortDir("asc"); return; }
    setSortKey(null);
  }
  const sortedData = (() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return data;
    const mult = sortDir === "asc" ? 1 : -1;
    const accessor = col.sortValue;
    return [...data].sort((a, b) => {
      const va = accessor(a);
      const vb = accessor(b);
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * mult;
      return String(va).localeCompare(String(vb)) * mult;
    });
  })();

  /* Pagination */
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [sortedData.length, pageSize]);
  const pageCount = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageStart = sortedData.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const pageEnd = Math.min(safePage * pageSize, sortedData.length);
  const pageRows = sortedData.slice((safePage - 1) * pageSize, safePage * pageSize);

  const rowPadStyles: React.CSSProperties = { paddingLeft: edgePadding, paddingRight: 16 };
  const bodyStyle = minWidth ? { minWidth } : undefined;

  /* Contenu d'en-tête d'une colonne (label statique ou bouton de tri). */
  function headerInner(col: ColumnDef<T>) {
    const isSortable = !!col.sortable && !!col.sortValue;
    const active = sortKey === col.key;
    // En-tête standard : type-caption (12px/500/secondary). Colonne triée active → primary.
    const labelClass = `type-caption ${active ? "text-[var(--text-primary)]" : ""}`;
    if (isSortable) {
      return (
        <button type="button" onClick={() => toggleSort(col.key)}
          className={`group/sort inline-flex w-full items-center gap-1 rounded-md transition-colors ${col.align === "right" ? "justify-end" : ""} ${typeof col.header === "string" ? `${labelClass} hover:text-[var(--text-primary)]` : ""}`}>
          {col.header}
          <span className="flex flex-col leading-none">
            <ChevronDownIcon className={`h-3 w-3 -mb-0.5 rotate-180 transition-opacity ${active && sortDir === "asc" ? "opacity-100" : "opacity-30 group-hover/sort:opacity-60"}`} />
            <ChevronDownIcon className={`h-3 w-3 transition-opacity ${active && sortDir === "desc" ? "opacity-100" : "opacity-30 group-hover/sort:opacity-60"}`} />
          </span>
        </button>
      );
    }
    if (typeof col.header === "string") {
      return <span className={`${labelClass} ${col.align === "right" ? "block text-right" : ""}`}>{col.header}</span>;
    }
    return col.header;
  }

  // Règle DS : la ligne d'en-tête (colonnes/filtres) a TOUJOURS un fond `--bg-card-static`.
  const headerBgClass = "bg-[var(--bg-card-static)]";

  /* ════════════════════════════════════════════════════════════════════
     Mode sticky-left (opt-in) — colonne sélection + 1re colonne épinglées,
     scroll horizontal dans un conteneur unique (header + rows ensemble).
     `overflow-y-clip` : le sticky-top reste relatif au scroll de page,
     le sticky-left au conteneur horizontal. ════════════════════════════ */
  if (stickyLeft) {
    const [firstCol, ...restCols] = columns;
    // Largeur du contenu :
    //  - avec une colonne `flex` : `w-full` (largeur définie = parent) pour que la
    //    colonne flex absorbe l'espace libre sur écran large ; le scroll horizontal
    //    en vue étroite est assuré par `min-width` (bodyStyle). `w-max` ne marcherait
    //    pas ici (max-content ne laisse aucun espace libre pour flex-grow).
    //  - sans colonne `flex` : `w-max` pour que le contenu atteigne toute la largeur
    //    scrollable (lignes qui vont jusqu'au bout, pas d'arrêt prématuré).
    const contentWidthClass = columns.some((c) => c.flex) ? "w-full" : "w-max min-w-full";
    // Plancher de scroll horizontal : au moins la somme des largeurs de colonnes
    // (+ marges/gaps), sinon la colonne `flex` (min-width) déborde et se superpose
    // aux colonnes fixes en vue étroite. On prend le max avec le `minWidth` fourni.
    const stickyMinWidth = Math.max(
      minWidth ?? 0,
      columns.reduce((sum, c) => sum + c.width, 0) + 12 * columns.length + 80 + (trailingAction ? trailingActionWidth : 0)
    );
    const pageKeys = pageRows.map(rowKey);
    const allSelected = selectable && pageKeys.length > 0 && pageKeys.every((k) => selected?.has(k));
    const someSelected = selectable && pageKeys.some((k) => selected?.has(k));

    // Fond TOUJOURS opaque (le contenu défilant passe dessous) ; ombre droite au scroll.
    // `grow` : la colonne épinglée absorbe l'espace libre (colonne `flex`) au lieu
    // d'une largeur fixe — sinon sur écran large les colonnes se tassent à gauche.
    const StickyGroup = ({ children, header, active, grow }: { children: ReactNode; header?: boolean; active?: boolean; grow?: boolean }) => (
      <div
        className={`sticky left-0 z-[3] relative flex items-center gap-3 self-stretch transition-colors ${grow ? "flex-1 min-w-0" : "flex-shrink-0"} ${
          header ? headerBgClass
            : active ? "bg-[var(--bg-card-hover-flat)]"
              : "bg-[var(--bg-primary)] group-hover:bg-[var(--bg-card-hover-flat)]"
        }`}
        style={{ paddingLeft: edgePadding, paddingRight: 12 }}
      >
        {children}
        {/* Bande d'ombre : pleine hauteur (self-stretch → 40px y compris en-tête), collée au
            bord droit, plus large/diffuse, visible au scroll horizontal uniquement. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-6"
          style={{ transform: "translateX(100%)", background: STICKY_EDGE, opacity: scrolled ? 1 : 0, transition: "opacity 140ms ease" }}
        />
      </div>
    );

    return (
      <div className={`flex flex-col ${bordered ? "overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]" : ""} ${className}`}>
        <div ref={scrollRef} className="overflow-x-auto overflow-y-clip" onScroll={(e) => setScrolled(e.currentTarget.scrollLeft > 0)}>
          <div style={{ minWidth: stickyMinWidth }} className={contentWidthClass}>
            {/* Header */}
            <div className={`sticky top-0 z-[15] flex h-10 items-center border-b border-[var(--border-subtle)] ${headerBgClass}`}>
              <StickyGroup header grow={firstCol.flex}>
                {selectable && <Checkbox checked={!!allSelected} indeterminate={!!someSelected && !allSelected} onChange={() => onToggleAll?.(pageKeys, !!allSelected)} />}
                <div className={`min-w-0 ${firstCol.flex ? "flex-1" : ""}`} style={firstCol.flex ? { minWidth: firstCol.width, maxWidth: firstCol.maxWidth } : { width: firstCol.width }}>{headerInner(firstCol)}</div>
              </StickyGroup>
              <div className="flex flex-shrink-0 items-center gap-3 pr-4" style={{ paddingLeft: 12 }}>
                {restCols.map((col) => (
                  <div key={col.key} className="flex-shrink-0 min-w-0" style={{ width: col.width }}>{headerInner(col)}</div>
                ))}
                {/* Emplacement réservé à l'action de survol (même largeur en en-tête et en ligne). */}
                {trailingAction && <div aria-hidden className="flex-shrink-0" style={{ width: trailingActionWidth }} />}
              </div>
            </div>

            {/* Rows */}
            {data.length === 0 ? (
              <div className="px-7 py-10 text-center text-[14px] text-[var(--text-muted)]">{emptyState ?? "Aucune donnée."}</div>
            ) : (
              pageRows.map((row, i) => {
                const k = rowKey(row);
                const idx = (safePage - 1) * pageSize + i;
                const active = isRowActive?.(row) ?? false;
                const isSel = !!selected?.has(k);
                const expanded = !!renderExpanded && (isExpanded?.(row) ?? false);
                const isLast = i === pageRows.length - 1;
                const rowBg = active || expanded ? "bg-[var(--bg-card-hover-flat)]" : "bg-[var(--bg-primary)] hover:bg-[var(--bg-card-hover-flat)]";
                return (
                  <Fragment key={k}>
                  <div
                    role={onRowClick ? "button" : undefined}
                    aria-expanded={renderExpanded ? expanded : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
                    onClick={onRowClick ? () => onRowClick(row, idx) : undefined}
                    onKeyDown={onRowClick ? (e) => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onRowClick(row, idx); } } : undefined}
                    className={`group flex w-full items-stretch text-left transition-colors ${onRowClick ? "cursor-pointer" : ""} ${!isLast && !expanded ? "border-b border-[var(--border-subtle)]" : ""} ${rowBg}`}
                  >
                    <StickyGroup active={active || expanded} grow={firstCol.flex}>
                      {selectable && <Checkbox checked={isSel} onChange={() => onToggleRow?.(k)} />}
                      <div className={`min-w-0 self-center py-3 font-normal text-[var(--text-secondary)] ${firstCol.flex ? "flex-1" : ""}`} style={firstCol.flex ? { minWidth: firstCol.width, maxWidth: firstCol.maxWidth } : { width: firstCol.width }}>{firstCol.render(row, idx)}</div>
                    </StickyGroup>
                    <div className="flex flex-shrink-0 items-center gap-3 py-3 pr-4" style={{ paddingLeft: 12 }}>
                      {restCols.map((col) => (
                        <div key={col.key} className={`flex-shrink-0 min-w-0 font-normal text-[var(--text-secondary)] ${col.align === "right" ? "text-right" : ""}`} style={{ width: col.width }}>
                          {col.render(row, idx)}
                        </div>
                      ))}
                      {/* Emplacement réservé : l'action de survol s'y pose sans masquer la dernière colonne. */}
                      {trailingAction && <div aria-hidden className="flex-shrink-0" style={{ width: trailingActionWidth }} />}
                    </div>
                    {trailingAction && (
                      /* Ancre 0-largeur épinglée à droite : ne réserve AUCUNE place dans
                         le flux (sinon elle rognerait la colonne flex sticky à gauche).
                         L'action est un overlay absolu qui déborde vers la gauche. */
                      <div className="sticky right-0 z-[2] w-0 flex-shrink-0 self-stretch">
                        <div className="absolute inset-y-0 right-0 flex items-center justify-end pr-3 opacity-0 transition-opacity group-hover:opacity-100"
                          style={{ width: trailingActionWidth, background: "linear-gradient(to right, transparent, var(--bg-card-hover-flat) 45%)" }}
                          onClick={(e) => e.stopPropagation()}>
                          {trailingAction(row, idx)}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Panneau déplié (ex. détail mot-clé d'un groupe) : épinglé sur la zone
                      visible, il ne défile pas horizontalement avec les colonnes. */}
                  {expanded && (
                    <div className={!isLast ? "border-b border-[var(--border-subtle)]" : ""}>
                      <div className="sticky left-0" style={viewportW ? { width: viewportW } : undefined}>
                        {renderExpanded!(row)}
                      </div>
                    </div>
                  )}
                  </Fragment>
                );
              })
            )}
          </div>
        </div>
        {!hidePagination && data.length > 0 && (
          <Pagination
            edgePadding={edgePadding} bordered={bordered} pageStart={pageStart} pageEnd={pageEnd}
            total={data.length} pageSize={pageSize} pageSizeOptions={pageSizeOptions} setPageSize={setPageSize}
            safePage={safePage} pageCount={pageCount} setPage={setPage}
          />
        )}
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════════
     Mode standard (inchangé) ════════════════════════════════════════════ */
  const headerEl = (
    <div className={`sticky top-0 z-[15] overflow-hidden border-b border-[var(--border-subtle)] ${headerBgClass} ${bordered ? "rounded-t-2xl" : ""}`}>
      <div style={bodyStyle} className="flex h-10 items-center gap-3">
        <div className="flex flex-1 items-center gap-3" style={rowPadStyles}>
          {columns.map((col) => (
            <div key={col.key} className={`flex-shrink-0 min-w-0 ${col.flex ? "flex-1" : ""}`}
              style={col.flex ? { minWidth: col.width, maxWidth: col.maxWidth } : { width: col.width }}>
              {headerInner(col)}
            </div>
          ))}
          {trailingChevron && <div className="w-12 flex-shrink-0 min-w-0" />}
          {trailingAction && <div aria-hidden className="flex-shrink-0" style={{ width: trailingActionWidth }} />}
        </div>
        {trailingChevron && <div className={`sticky right-0 w-16 flex-shrink-0 min-w-0 ${headerBgClass}`} />}
      </div>
    </div>
  );

  const rowsEl = data.length === 0 ? (
    <div className="px-7 py-10 text-center text-[14px] text-[var(--text-muted)]">{emptyState ?? "Aucune donnée."}</div>
  ) : (
    pageRows.map((row, i) => {
      const k = rowKey(row);
      const active = isRowActive?.(row) ?? false;
      const interactive = !!onRowClick;
      const hoverable = interactive || !!trailingAction;
      const expanded = !!renderExpanded && (isExpanded?.(row) ?? false);
      const isLast = i === pageRows.length - 1;
      const wrapperClass = `group relative w-full text-left transition-colors ${
        !isLast && !expanded ? "border-b border-[var(--border-subtle)]" : ""
      } ${active || expanded ? "bg-[var(--bg-card-hover)]" : hoverable ? "hover:bg-[var(--bg-card-hover)]" : ""}`;
      const innerClass = "flex items-center gap-3 py-3";

      const inner = (
        <>
          {columns.map((col) => (
            <div key={col.key}
              className={`flex-shrink-0 min-w-0 font-normal text-[var(--text-secondary)] ${col.flex ? "flex-1" : ""} ${col.align === "right" ? "text-right" : ""}`}
              style={col.flex ? { minWidth: col.width, maxWidth: col.maxWidth } : { width: col.width }}>
              {col.render(row, (safePage - 1) * pageSize + i)}
            </div>
          ))}
          {trailingAction && <div aria-hidden className="flex-shrink-0" style={{ width: trailingActionWidth }} />}
          {trailingChevron && (
            <div className="w-12 flex-shrink-0 min-w-0 flex items-center justify-end">
              <ChevronRightIcon className="h-4 w-4 text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          )}
          {trailingAction && (
            /* Ancre 0-largeur épinglée à droite : ne réserve aucune place dans le flux
               (sinon la colonne flex se rétrécit et les colonnes se décalent vs l'en-tête). */
            <div className="sticky right-0 z-[2] w-0 flex-shrink-0 self-stretch">
              <div className="absolute inset-y-0 right-0 flex items-center justify-end pr-3 opacity-0 transition-opacity group-hover:opacity-100"
                style={{ width: trailingActionWidth, background: "linear-gradient(to right, transparent, var(--bg-card-hover-flat) 45%)" }}
                onClick={(e) => e.stopPropagation()}>
                {trailingAction(row, (safePage - 1) * pageSize + i)}
              </div>
            </div>
          )}
        </>
      );

      const rowEl = interactive ? (
        <button type="button" aria-expanded={renderExpanded ? expanded : undefined} onClick={() => onRowClick!(row, (safePage - 1) * pageSize + i)} className={wrapperClass}>
          <div className={innerClass} style={rowPadStyles}>{inner}</div>
          {trailingChevron && (
            <div className="absolute inset-y-0 right-0 w-16 bg-[var(--bg-primary)] group-hover:bg-[var(--bg-card-hover)]" />
          )}
        </button>
      ) : (
        <div className={wrapperClass}>
          <div className={innerClass} style={rowPadStyles}>{inner}</div>
        </div>
      );

      return (
        <Fragment key={k}>
          {rowEl}
          {/* Panneau déplié — hors du <button> de ligne (contenu interactif autorisé). */}
          {expanded && (
            <div className={!isLast ? "border-b border-[var(--border-subtle)]" : ""}>
              {renderExpanded!(row)}
            </div>
          )}
        </Fragment>
      );
    })
  );

  return (
    <div
      className={`flex flex-col ${bordered ? "rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]" : ""} ${className}`}
      style={bordered ? { clipPath: "inset(0 round 1.5rem)" } : undefined}
    >
      {headerEl}
      <div className={minWidth ? "overflow-x-auto" : ""}>
        <div className="w-full" style={bodyStyle}>{rowsEl}</div>
      </div>
      {!hidePagination && data.length > 0 && (
        <Pagination
          edgePadding={edgePadding} bordered={bordered} pageStart={pageStart} pageEnd={pageEnd}
          total={data.length} pageSize={pageSize} pageSizeOptions={pageSizeOptions} setPageSize={setPageSize}
          safePage={safePage} pageCount={pageCount} setPage={setPage}
        />
      )}
    </div>
  );
}

/* ── Pagination (partagée par les deux modes) ─────────────────────────── */

function Pagination({
  edgePadding, bordered, pageStart, pageEnd, total, pageSize, pageSizeOptions, setPageSize, safePage, pageCount, setPage,
}: {
  edgePadding: string; bordered: boolean; pageStart: number; pageEnd: number; total: number;
  pageSize: number; pageSizeOptions: number[]; setPageSize: (n: number) => void;
  safePage: number; pageCount: number; setPage: (fn: (p: number) => number) => void;
}) {
  return (
    <div
      className={`sticky bottom-0 z-30 flex items-center justify-between gap-4 border-t border-[var(--border-subtle)] py-3 backdrop-blur ${bordered ? "bg-[var(--bg-card)]/95 rounded-b-2xl" : "bg-[var(--bg-primary)]/95"}`}
      style={{ paddingLeft: edgePadding, paddingRight: edgePadding }}
    >
      <span className="text-[12px] tabular-nums text-[var(--text-muted)]">
        {pageStart.toLocaleString("fr-FR")} – {pageEnd.toLocaleString("fr-FR")} sur {total.toLocaleString("fr-FR")}
      </span>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[var(--text-muted)]">Par page</span>
          <DropdownMenu upward width={88} align="right"
            trigger={
              <button className="flex items-center gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-2.5 py-1 text-[12px] font-medium tabular-nums text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-card-hover)]">
                {pageSize}
                <ChevronDownIcon className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              </button>
            }>
            {pageSizeOptions.map((n) => (
              <DropdownItem key={n} selected={pageSize === n} onClick={() => setPageSize(n)}>{n}</DropdownItem>
            ))}
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-1">
          <button disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Page précédente">
            <ChevronRightIcon className="h-4 w-4 rotate-180" />
          </button>
          <button disabled={safePage >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Page suivante">
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
