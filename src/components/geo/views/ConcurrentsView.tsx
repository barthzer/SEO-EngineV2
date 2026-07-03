"use client";

/**
 * ConcurrentsView — vue "Concurrents" du module Visibilité IA.
 * Graph d'évolution de la visibilité par marque + tableau de classement
 * de l'industrie (toutes les marques du marché, triées par visibilité).
 */

import { useState } from "react";
import { GeoLineChart } from "@/components/geo/GeoLineChart";
import { TableWide, type ColumnDef } from "@/components/TableWide";
import { Favicon } from "@/components/geo/views/OverviewView";
import { Section } from "@/components/geo/views/VisibilityView";
import { leaderboard, visibilitySeries, shareOfVoice, brandFromDomain, type LeaderRow } from "@/components/geo/analytics";
import type { GeoSetup } from "@/components/geo/types";
import { CARD } from "@/components/geo/ui";

const fmtPos = (v: number) => (Math.round(v * 10) / 10).toString().replace(".", ",");

type IndustryRow = LeaderRow & { sov: number; delta: number };

export function ConcurrentsView({ setup, domain }: { setup: GeoSetup; domain: string }) {
  const brand = brandFromDomain(domain);
  const board = leaderboard(setup, domain);
  const series = visibilitySeries(setup, domain);
  const sov = shareOfVoice(setup, domain);
  const [compare, setCompare] = useState(true);

  const sovByName = new Map(sov.map((s) => [s.name, s.pct]));
  const deltaByName = new Map(
    series.map((s) => [s.name, s.points.length > 1 ? s.points[s.points.length - 1].value - s.points[0].value : 0]),
  );

  const rows: IndustryRow[] = [...board]
    .sort((a, b) => b.visibility - a.visibility)
    .map((r) => ({ ...r, sov: Math.round((sovByName.get(r.name) ?? 0) * 10) / 10, delta: deltaByName.get(r.name) ?? 0 }));
  const maxVis = Math.max(1, ...rows.map((r) => r.visibility));

  const columns: ColumnDef<IndustryRow>[] = [
    { key: "rank", header: "#", width: 48,
      render: (_r, i) => <span className="text-[13px] tabular-nums text-[var(--text-muted)]">{i + 1}</span> },
    { key: "brand", header: "Marque", width: 220, flex: true,
      render: (r) => (
        <span className="flex min-w-0 items-center gap-2.5">
          <Favicon domain={r.domain} size={20} />
          <span className="truncate text-[14px] font-medium text-[var(--text-primary)]">{r.name}</span>
          {r.isYou && <span className="flex-shrink-0 rounded-md bg-[var(--accent-primary-soft)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--accent-primary)]">Vous</span>}
        </span>
      ) },
    { key: "vis", header: "Score de visibilité", width: 260, sortable: true, sortValue: (r) => r.visibility,
      render: (r) => (
        <div className="flex items-center gap-3">
          <span className="w-10 flex-shrink-0 text-[13px] font-semibold tabular-nums text-[var(--text-primary)]">{r.visibility}%</span>
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--bg-subtle)]">
            <span className="block h-full rounded-full" style={{ width: `${(r.visibility / maxVis) * 100}%`, backgroundColor: r.isYou ? "var(--accent-primary)" : "var(--text-primary)" }} />
          </span>
        </div>
      ) },
    { key: "sov", header: "Share of voice", width: 140, align: "right", sortable: true, sortValue: (r) => r.sov,
      render: (r) => <span className="text-[13px] tabular-nums text-[var(--text-secondary)]">{r.sov}%</span> },
    { key: "pos", header: "Position moyenne", width: 150, align: "right", sortable: true, sortValue: (r) => r.position,
      render: (r) => <span className="text-[13px] tabular-nums text-[var(--text-secondary)]">{fmtPos(r.position)}</span> },
    { key: "delta", header: "Évolution", width: 120, align: "right",
      render: (r) => r.delta === 0
        ? <span className="text-[13px] text-[var(--text-muted)]">–</span>
        : <span className="text-[13px] font-medium tabular-nums" style={{ color: r.delta > 0 ? "var(--color-success)" : "var(--color-danger)" }}>{r.delta > 0 ? "+" : ""}{r.delta} pts</span> },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Graph de visibilité — évolution par marque */}
      <Section title="Visibilité de l'industrie" subtitle={`Évolution du score de visibilité IA de ${brand} et des marques du marché`}>
        <div className={`p-6 ${CARD}`}>
          <GeoLineChart series={series} height={260} suffix="%" compare={compare} onCompareChange={setCompare} compareLabel="Comparer les marques" />
        </div>
      </Section>

      {/* Tableau de classement de l'industrie */}
      <Section title="Classement de l'industrie" subtitle="Toutes les marques du marché classées par visibilité IA">
        <div className={`overflow-hidden ${CARD}`}>
          <TableWide<IndustryRow> columns={columns} data={rows} rowKey={(r) => r.domain} hidePagination />
        </div>
      </Section>
    </div>
  );
}
