"use client";

import { TOP_PAGES_ALL, type TopPage } from "@/data/charts-semantique";

import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { TableWide, type ColumnDef } from "@/components/TableWide";
import { SearchInput } from "@/components/SearchInput";
import { DropdownMenu, DropdownItem } from "@/components/DropdownMenu";


function MiniSparkline({ vals }: { vals: number[] }) {
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const range = max - min || 1;
  const w = 60, h = 22;
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts} fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function PosTag({ pos }: { pos: number }) {
  const color = pos <= 3 ? "var(--color-success)" : pos <= 10 ? "var(--accent-primary)" : pos <= 20 ? "var(--color-warning)" : "var(--text-muted)";
  return (
    <span className="inline-flex items-center rounded-full px-2 py-1 type-caption font-semibold" style={{ color, backgroundColor: `${color}18` }}>
      #{pos.toFixed(1)}
    </span>
  );
}

export function TopPages({ onUrlClick }: { onUrlClick?: (url: string) => void } = {}) {
  const [search, setSearch] = useState("");
  const [urlFilter, setUrlFilter] = useState<"all" | "/blog" | "/services" | "/">("all");

  const filtered = TOP_PAGES_ALL.filter((p) => {
    if (search && !p.url.toLowerCase().includes(search.toLowerCase())) return false;
    if (urlFilter === "all") return true;
    if (urlFilter === "/") return p.url === "/";
    return p.url.startsWith(urlFilter);
  });

  const columns: ColumnDef<TopPage>[] = [
    {
      key: "url",
      header: "URL",
      width: 280,
      flex: true,
      render: (p) => (
        <span className="block truncate font-mono type-label">{p.url}</span>
      ),
    },
    {
      key: "clicks", header: "Clics", width: 90, align: "right",
      sortable: true, sortValue: (p) => p.clicks,
      render: (p) => <span className="type-label font-semibold tabular-nums text-[var(--text-primary)]">{p.clicks.toLocaleString("fr-FR")}</span>,
    },
    {
      key: "impressions", header: "Impressions", width: 110, align: "right",
      sortable: true, sortValue: (p) => p.impressions,
      render: (p) => <span className="type-label tabular-nums">{p.impressions.toLocaleString("fr-FR")}</span>,
    },
    {
      key: "position", header: "Position", width: 90,
      sortable: true, sortValue: (p) => p.position,
      render: (p) => <PosTag pos={p.position} />,
    },
    {
      key: "ctr", header: "CTR", width: 70, align: "right",
      sortable: true, sortValue: (p) => parseFloat(p.ctr),
      render: (p) => <span className="type-label tabular-nums">{p.ctr}</span>,
    },
    {
      key: "trend", header: "Tendance", width: 90,
      render: (p) => <div className="flex justify-start"><MiniSparkline vals={p.trend} /></div>,
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar — search + filter button */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Rechercher une URL…" alwaysExpanded />
        <DropdownMenu
          width={200}
          trigger={
            <button
              type="button"
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 type-label transition-all ${urlFilter !== "all" ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] font-semibold" : "text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"}`}
            >
              {urlFilter === "all" ? "Toutes les URLs" : urlFilter === "/" ? "Accueil" : urlFilter}
              <ChevronDownIcon className="h-3 w-3 flex-shrink-0 opacity-70" />
            </button>
          }
        >
          <DropdownItem selected={urlFilter === "all"}       onClick={() => setUrlFilter("all")}>Toutes les URLs</DropdownItem>
          <DropdownItem selected={urlFilter === "/blog"}     onClick={() => setUrlFilter("/blog")}>/blog</DropdownItem>
          <DropdownItem selected={urlFilter === "/services"} onClick={() => setUrlFilter("/services")}>/services</DropdownItem>
          <DropdownItem selected={urlFilter === "/"}         onClick={() => setUrlFilter("/")}>/ (accueil)</DropdownItem>
        </DropdownMenu>
        <span className="ml-auto type-micro tabular-nums">
          {filtered.length} / {TOP_PAGES_ALL.length}
        </span>
      </div>

      <TableWide<TopPage>
        columns={columns}
        data={filtered}
        rowKey={(p) => p.url}
        onRowClick={onUrlClick ? (p) => onUrlClick(p.url) : undefined}
        emptyState="Aucune page pour ces filtres."
        minWidth={900}
        pageSize={25}
        bordered
        edgePadding="24px"
      />
    </div>
  );
}
