"use client";

import { useState, useEffect, type ReactNode } from "react";
import { ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { DropdownMenu, DropdownItem } from "@/components/DropdownMenu";

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
  /** Wraps the whole table in a card (rounded-3xl + border + bg-card).
   *  Le comportement de scroll reste page-level (sticky header top-12 et
   *  sticky pagination bottom-0). Le card est purement visuel et grandit
   *  naturellement avec le contenu. */
  bordered?: boolean;
  className?: string;
}

/* ── Component ────────────────────────────────────────────────────────── */

/**
 * TableWide — DS pour les grands tableaux applicatifs.
 *
 * - Header sticky (`top-12` sous la barre d'onglets) bg-subtle
 * - Body horizontal-scroll si `minWidth` > largeur du conteneur
 * - Rows = `<button>` quand `onRowClick`, sinon `<div>` (border-b last:border-0)
 * - Pagination sticky bottom (range + "X par page" + flèches prev/next)
 * - Optional sticky trailing chevron (sticky right, full-bleed bg primary)
 *
 * @example
 * ```tsx
 * <TableWide
 *   columns={[
 *     { key: "kw",  header: "Keyword",  width: 220, render: (r) => r.keyword },
 *     { key: "vol", header: "Volume",   width: 100, align: "right", render: (r) => r.volume },
 *   ]}
 *   data={rows}
 *   rowKey={(r) => r.id}
 *   onRowClick={(r) => openModal(r)}
 *   minWidth={1200}
 *   trailingChevron
 * />
 * ```
 */
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
  className = "",
}: TableWideProps<T>) {
  /* Sort interne — clé de colonne + direction. Cycle desc → asc → off au clic header. */
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
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

  /* Header element — always sticky to viewport (top-12). When bordered, rounded-t-3xl
     pour matcher les coins arrondis de la card sans casser le scroll horizontal interne. */
  const headerEl = (
    <div className={`sticky top-0 z-[15] overflow-hidden border-b border-[var(--border-subtle)] bg-[var(--bg-card)] ${bordered ? "rounded-t-3xl" : ""}`}>
      <div style={bodyStyle} className="flex h-10 items-center gap-3">
        <div className="flex flex-1 items-center gap-3" style={rowPadStyles}>
          {columns.map((col) => {
            const isSortable = !!col.sortable && !!col.sortValue;
            const active = sortKey === col.key;
            const labelClass = `text-[12px] font-medium ${active ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`;
            return (
              <div
                key={col.key}
                className={`flex-shrink-0 min-w-0 ${col.flex ? "flex-1" : ""}`}
                style={col.flex ? { minWidth: col.width } : { width: col.width }}
              >
                {isSortable ? (
                  <button
                    type="button"
                    onClick={() => toggleSort(col.key)}
                    className={`group/sort inline-flex w-full items-center gap-1 rounded-md transition-colors ${col.align === "right" ? "justify-end" : ""} ${typeof col.header === "string" ? `${labelClass} hover:text-[var(--text-primary)]` : ""}`}
                  >
                    {col.header}
                    <span className="flex flex-col leading-none">
                      <ChevronDownIcon
                        className={`h-3 w-3 -mb-0.5 rotate-180 transition-opacity ${active && sortDir === "asc" ? "opacity-100" : "opacity-30 group-hover/sort:opacity-60"}`}
                      />
                      <ChevronDownIcon
                        className={`h-3 w-3 transition-opacity ${active && sortDir === "desc" ? "opacity-100" : "opacity-30 group-hover/sort:opacity-60"}`}
                      />
                    </span>
                  </button>
                ) : typeof col.header === "string" ? (
                  <span className={`${labelClass} ${col.align === "right" ? "block text-right" : ""}`}>
                    {col.header}
                  </span>
                ) : (
                  col.header
                )}
              </div>
            );
          })}
          {trailingChevron && <div className="w-12 flex-shrink-0 min-w-0" />}
        </div>
        {trailingChevron && <div className="sticky right-0 w-16 flex-shrink-0 min-w-0 bg-[var(--bg-card)]" />}
        {/* trailingAction n'occupe pas de colonne dans le header : c'est un overlay absolu sur les rows */}
      </div>
    </div>
  );

  /* Rows — same in both modes */
  const rowsEl = data.length === 0 ? (
    <div className="px-7 py-10 text-center text-[14px] text-[var(--text-muted)]">
      {emptyState ?? "Aucune donnée."}
    </div>
  ) : (
    pageRows.map((row, i) => {
      const k = rowKey(row);
      const active = isRowActive?.(row) ?? false;
      const interactive = !!onRowClick;
      // Row hover bg applies whenever the row has any interactive affordance
      // (click handler or trailing action revealed on hover).
      const hoverable = interactive || !!trailingAction;
      const wrapperClass = `group relative w-full text-left transition-colors ${
        i < pageRows.length - 1 ? "border-b border-[var(--border-subtle)]" : ""
      } ${active ? "bg-[var(--bg-card-hover)]" : hoverable ? "hover:bg-[var(--bg-card-hover)]" : ""}`;
      const innerClass = "flex items-center gap-3 py-3";

      // Trailing action — sticky right-0 IN flex flow, identique au chevron de la vue URLs.
      // Toujours visible à droite du viewport pendant le scroll horizontal. Invisible sans hover,
      // apparaît sur hover de ligne avec gradient transparent → bg-card-hover.
      const inner = (
        <>
          {columns.map((col) => (
            <div
              key={col.key}
              className={`flex-shrink-0 min-w-0 ${col.flex ? "flex-1" : ""} ${col.align === "right" ? "text-right" : ""}`}
              style={col.flex ? { minWidth: col.width } : { width: col.width }}
            >
              {col.render(row, (safePage - 1) * pageSize + i)}
            </div>
          ))}
          {trailingChevron && (
            <div className="w-12 flex-shrink-0 min-w-0 flex items-center justify-end">
              <ChevronRightIcon className="h-4 w-4 text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          )}
          {trailingAction && (
            <div
              className="sticky right-0 flex flex-shrink-0 items-center justify-end self-stretch pr-3 opacity-0 transition-opacity group-hover:opacity-100"
              style={{
                width: trailingActionWidth,
                background: "linear-gradient(to right, transparent, var(--bg-card-hover) 50%)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {trailingAction(row, (safePage - 1) * pageSize + i)}
            </div>
          )}
        </>
      );

      return interactive ? (
        <button key={k} type="button" onClick={() => onRowClick!(row, (safePage - 1) * pageSize + i)} className={wrapperClass}>
          <div className={innerClass} style={rowPadStyles}>{inner}</div>
          {trailingChevron && (
            <div className="absolute inset-y-0 right-0 w-16 bg-[var(--bg-primary)] group-hover:bg-[var(--bg-card-hover)]" />
          )}
        </button>
      ) : (
        <div key={k} className={wrapperClass}>
          <div className={innerClass} style={rowPadStyles}>{inner}</div>
        </div>
      );
    })
  );

  /* Pagination — sticky bottom of viewport in both modes. When bordered, rounded-b-3xl
     pour matcher les coins arrondis bas de la card. */
  const paginationEl = !hidePagination && data.length > 0 ? (
    <div
      className={`sticky bottom-0 z-30 flex items-center justify-between gap-4 border-t border-[var(--border-subtle)] py-3 backdrop-blur ${bordered ? "bg-[var(--bg-card)]/95 rounded-b-3xl" : "bg-[var(--bg-primary)]/95"}`}
      style={{ paddingLeft: edgePadding, paddingRight: edgePadding }}
    >
      <span className="text-[12px] tabular-nums text-[var(--text-muted)]">
        {pageStart.toLocaleString("fr-FR")} – {pageEnd.toLocaleString("fr-FR")} sur {data.length.toLocaleString("fr-FR")}
      </span>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[var(--text-muted)]">Par page</span>
          <DropdownMenu
            upward
            width={88}
            align="right"
            trigger={
              <button className="flex items-center gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-2.5 py-1 text-[12px] font-medium tabular-nums text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-card-hover)]">
                {pageSize}
                <ChevronDownIcon className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              </button>
            }
          >
            {pageSizeOptions.map((n) => (
              <DropdownItem key={n} selected={pageSize === n} onClick={() => setPageSize(n)}>
                {n}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-1">
          <button
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Page précédente"
          >
            <ChevronRightIcon className="h-4 w-4 rotate-180" />
          </button>
          <button
            disabled={safePage >= pageCount}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Page suivante"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  ) : null;

  /* ── Layout — single mode : page-level scroll, sticky header (top-12)
       et pagination (bottom-0). `bordered` ajoute le visuel card (border + rounded +
       bg-card) avec `clipPath: inset(round)` pour forcer le clipping rond.
       `clipPath` clippe VISUELLEMENT sans établir de scrolling mechanism, donc
       les sticky enfants restent attachés à leurs vrais ancêtres scrollables
       (page pour top/bottom, body wrapper pour right). */
  return (
    <div
      className={`flex flex-col ${bordered ? "rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)]" : ""} ${className}`}
      style={bordered ? { clipPath: "inset(0 round 1.5rem)" } : undefined}
    >
      {headerEl}
      <div className={minWidth ? "overflow-x-auto" : ""}>
        <div className="w-full" style={bodyStyle}>
          {rowsEl}
        </div>
      </div>
      {paginationEl}
    </div>
  );
}
