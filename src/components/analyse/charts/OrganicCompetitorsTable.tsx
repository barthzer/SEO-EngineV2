"use client";

import { ORGANIC_YOU, ORGANIC_COMPETITORS, type OrganicRow } from "@/data/charts-semantique";

import { useState } from "react";
import { TableWide, type ColumnDef } from "@/components/TableWide";
import { DeltaIndicator } from "@/components/DeltaIndicator";
import { ColHeaderInfo, TfTip, CfTip, BasTip, RefDomTip } from "../RecommandationsView";


function DomainSquircle({ domain }: { domain: string }) {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[8px] bg-[var(--bg-subtle)] text-[10px] font-semibold uppercase tracking-micro text-[var(--text-muted)]">
        {domain.charAt(0)}
      </div>
    );
  }
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
      alt={domain}
      width={28}
      height={28}
      onError={() => setError(true)}
      className="h-7 w-7 flex-shrink-0 rounded-[8px] border border-[var(--border-subtle)] bg-[var(--bg-card)] object-contain p-0.5"
    />
  );
}

/* DeltaIndicator — déplacé vers @/components/DeltaIndicator (réutilisé en plusieurs endroits) */

export function OrganicCompetitorsTable() {
  const rows = [ORGANIC_YOU, ...ORGANIC_COMPETITORS];
  const youCols = ORGANIC_YOU;

  const columns: ColumnDef<OrganicRow>[] = [
    {
      key: "domain",
      header: "Domaine",
      width: 280,
      flex: true,
      render: (c) => (
        <div className="flex items-center gap-3 min-w-0">
          <DomainSquircle domain={c.domain} />
          <span className={`block truncate type-label ${c.isYou ? "font-semibold text-[var(--accent-primary)]" : "text-[var(--text-primary)]"}`}>
            {c.domain}
          </span>
          {c.isYou && (
            <span className="flex-shrink-0 rounded-full bg-[var(--accent-primary)] px-2 py-0.5 type-micro font-semibold uppercase text-white">
              Vous
            </span>
          )}
        </div>
      ),
    },
    {
      key: "tf",
      header: <ColHeaderInfo label="TF" align="right" tooltip={<TfTip />} />,
      width: 90, align: "right",
      sortable: true, sortValue: (c) => c.tf,
      render: (c) => (
        <span className="inline-flex items-center justify-end type-label font-semibold tabular-nums text-[var(--text-primary)]">
          {c.tf}
          {!c.isYou && <DeltaIndicator value={c.tf} ref={youCols.tf} />}
        </span>
      ),
    },
    {
      key: "cf",
      header: <ColHeaderInfo label="CF" align="right" tooltip={<CfTip />} />,
      width: 90, align: "right",
      sortable: true, sortValue: (c) => c.cf,
      render: (c) => (
        <span className="inline-flex items-center justify-end type-label font-semibold tabular-nums text-[var(--text-primary)]">
          {c.cf}
          {!c.isYou && <DeltaIndicator value={c.cf} ref={youCols.cf} />}
        </span>
      ),
    },
    {
      key: "bas",
      header: <ColHeaderInfo label="BAS" align="right" tooltip={<BasTip />} />,
      width: 90, align: "right",
      sortable: true, sortValue: (c) => c.bas,
      render: (c) => (
        <span className="inline-flex items-center justify-end type-label font-semibold tabular-nums text-[var(--text-primary)]">
          {c.bas}
          {!c.isYou && <DeltaIndicator value={c.bas} ref={youCols.bas} />}
        </span>
      ),
    },
    {
      key: "refDomains",
      header: <ColHeaderInfo label="Ref Domains" align="right" tooltip={<RefDomTip />} />,
      width: 120, align: "right",
      sortable: true, sortValue: (c) => c.refDomains,
      render: (c) => (
        <span className="inline-flex items-center justify-end type-label font-semibold tabular-nums text-[var(--text-primary)]">
          {c.refDomains.toLocaleString("fr-FR")}
          {!c.isYou && <DeltaIndicator value={c.refDomains} ref={youCols.refDomains} />}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <p className="type-h3">Concurrents organiques</p>
      <TableWide<OrganicRow>
        columns={columns}
        data={rows}
        rowKey={(r) => r.domain}
        isRowActive={(r) => !!r.isYou}
        minWidth={900}
        bordered
        edgePadding="24px"
        hidePagination
      />
    </div>
  );
}
