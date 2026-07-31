"use client";

import { useState } from "react";
import { TableWide, type ColumnDef } from "@/components/TableWide";
import { DeltaIndicator } from "@/components/DeltaIndicator";
import { ColHeaderInfo, TfTip, CfTip, BasTip, RefDomTip } from "../RecommandationsView";

type OrganicRow = { domain: string; tf: number; cf: number; bas: number; refDomains: number; isYou?: boolean };

const ORGANIC_YOU: OrganicRow = { domain: "votre-site.fr", tf: 28, cf: 41, bas: 12, refDomains: 520, isYou: true };

const ORGANIC_COMPETITORS: OrganicRow[] = [
  { domain: "noiise.com",                                 tf: 49, cf: 48, bas: 0,  refDomains: 1637 },
  { domain: "lk-interactive.fr",                          tf: 19, cf: 38, bas: 47, refDomains: 308 },
  { domain: "cybercite.fr",                               tf: 42, cf: 44, bas: 9,  refDomains: 902 },
  { domain: "eskimoz.fr",                                 tf: 21, cf: 47, bas: 13, refDomains: 1427 },
  { domain: "seo.fr",                                     tf: 51, cf: 46, bas: 16, refDomains: 1640 },
  { domain: "alioze.com",                                 tf: 14, cf: 42, bas: 0,  refDomains: 833 },
  { domain: "agencebespoke.com",                          tf: 13, cf: 42, bas: 48, refDomains: 369 },
  { domain: "adveris.fr",                                 tf: 37, cf: 45, bas: 47, refDomains: 736 },
  { domain: "axess.fr",                                   tf: 44, cf: 47, bas: 3,  refDomains: 1232 },
  { domain: "centre-formation-referencement-naturel.com", tf: 16, cf: 34, bas: 52, refDomains: 136 },
];

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
