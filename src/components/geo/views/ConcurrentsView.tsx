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
import {
  leaderboard, visibilitySeries, shareOfVoice, brandFromDomain, platformMatrix,
  PLATFORM_LABEL, PLATFORM_DOMAIN, type LeaderRow, type MatrixRow,
} from "@/components/geo/analytics";
import type { GeoSetup, LlmPlatform } from "@/components/geo/types";
import { CARD } from "@/components/geo/ui";

const fmtPos = (v: number) => (Math.round(v * 10) / 10).toString().replace(".", ",");

type IndustryRow = LeaderRow & { sov: number; delta: number };

export function ConcurrentsView({ setup, domain }: { setup: GeoSetup; domain: string }) {
  const brand = brandFromDomain(domain);
  const board = leaderboard(setup, domain);
  const series = visibilitySeries(setup, domain);
  const sov = shareOfVoice(setup, domain);
  const platforms = setup.platforms;
  const matrix = platformMatrix(setup, domain);
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
      render: (_r, i) => <span className="type-label tabular-nums text-[var(--text-primary)]">{i + 1}</span> },
    { key: "brand", header: "Marque", width: 220, flex: true,
      render: (r) => (
        <span className="flex min-w-0 items-center gap-2.5">
          <Favicon domain={r.domain} size={20} />
          <span className="truncate type-body-strong">{r.name}</span>
          {r.isYou && <span className="flex-shrink-0 rounded-md bg-[var(--accent-primary-soft)] px-1.5 py-0.5 type-micro text-[var(--accent-primary)]">Vous</span>}
        </span>
      ) },
    { key: "vis", header: "Score de visibilité", width: 260, sortable: true, sortValue: (r) => r.visibility,
      render: (r) => (
        <div className="flex items-center gap-3">
          <span className="w-10 flex-shrink-0 type-label font-semibold tabular-nums text-[var(--text-primary)]">{r.visibility}%</span>
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--bg-subtle)]">
            <span className="block h-full rounded-full" style={{ width: `${(r.visibility / maxVis) * 100}%`, backgroundColor: r.isYou ? "var(--accent-primary)" : "var(--text-primary)" }} />
          </span>
        </div>
      ) },
    { key: "sov", header: "Share of voice", width: 140, align: "right", sortable: true, sortValue: (r) => r.sov,
      render: (r) => <span className="type-label tabular-nums">{r.sov}%</span> },
    { key: "pos", header: "Position moyenne", width: 150, align: "right", sortable: true, sortValue: (r) => r.position,
      render: (r) => <span className="type-label tabular-nums">{fmtPos(r.position)}</span> },
    { key: "delta", header: "Évolution", width: 120, align: "right",
      render: (r) => r.delta === 0
        ? <span className="type-label text-[var(--text-muted)]">–</span>
        : <span className="type-label tabular-nums" style={{ color: r.delta > 0 ? "var(--color-success)" : "var(--color-danger)" }}>{r.delta > 0 ? "+" : ""}{r.delta} pts</span> },
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

      {/* Vue matricielle — heatmap concurrents × plateformes */}
      <Section title="Vue matricielle" subtitle="Capture de chaque plateforme IA par concurrent, selon le score de visibilité">
        <MatrixHeatmap matrix={matrix} platforms={platforms} />
      </Section>
    </div>
  );
}

/* ── Heatmap : concurrents (lignes) × plateformes (colonnes) ──────────────
   Fond dégradé sur l'accent (plus foncé = score élevé), marque suivie épinglée
   en bas avec un badge « Sélectionné ». */
function MatrixHeatmap({ matrix, platforms }: { matrix: MatrixRow[]; platforms: LlmPlatform[] }) {
  const sum = (r: MatrixRow) => platforms.reduce((s, p) => s + (r.byPlatform[p] ?? 0), 0);
  const others = matrix.filter((r) => !r.isYou).sort((a, b) => sum(b) - sum(a));
  const you = matrix.find((r) => r.isYou);
  const rows = you ? [...others, you] : others;
  const maxVal = Math.max(1, ...matrix.flatMap((r) => platforms.map((p) => r.byPlatform[p] ?? 0)));

  return (
    <div className={`overflow-hidden ${CARD}`}>
      <div className="overflow-x-auto">
        <div className="min-w-[680px]">
          {/* En-tête */}
          <div className="flex items-stretch border-b border-[var(--border-subtle)] bg-[var(--bg-card-static)]">
            <div className="w-[210px] flex-shrink-0 px-4 py-3 type-caption">Concurrents</div>
            {platforms.map((p) => (
              <div key={p} className="flex flex-1 items-center justify-center gap-1.5 border-l border-[var(--border-subtle)] px-3 py-3 type-caption">
                <Favicon domain={PLATFORM_DOMAIN(p)} size={16} />{PLATFORM_LABEL(p)}
              </div>
            ))}
          </div>
          {/* Lignes */}
          {rows.map((r) => (
            <div key={r.domain} className="flex items-stretch border-b border-[var(--border-subtle)] last:border-b-0">
              <div className={`flex w-[210px] flex-shrink-0 items-center gap-2 px-4 py-3.5 ${r.isYou ? "bg-[var(--accent-primary-soft)]" : ""}`}>
                <Favicon domain={r.domain} size={16} />
                <span className={`min-w-0 truncate type-label ${r.isYou ? "text-[var(--accent-primary)]" : "text-[var(--text-primary)]"}`}>{r.name}</span>
                {r.isYou && (
                  <span className="flex-shrink-0 rounded-md bg-[var(--bg-subtle)] px-1.5 py-0.5 type-micro">Vous</span>
                )}
              </div>
              {platforms.map((p) => {
                const v = r.byPlatform[p] ?? 0;
                const t = v / maxVal;
                return (
                  <div key={p} className="flex flex-1 items-center justify-center border-l border-[var(--border-subtle)] py-3.5"
                    style={{ backgroundColor: `color-mix(in oklab, var(--accent-primary) ${Math.round((0.06 + 0.94 * t) * 100)}%, var(--bg-card))` }}>
                    <span className={`type-label font-semibold tabular-nums ${t > 0.5 ? "text-white" : "text-[var(--text-primary)]"}`}>{v}%</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
