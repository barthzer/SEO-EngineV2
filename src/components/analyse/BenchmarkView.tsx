"use client";

/**
 * BenchmarkView — section dédiée « Benchmark » du projet.
 *
 * Comparaison de visibilité SEO vs concurrents (positions, top 3/10/50,
 * mots-clés, trafic estimé, gap). Source Haloscan.
 *
 * Sorti de la Popularité : c'est de la performance / comparaison concurrents,
 * pas du profil de backlinks.
 */

import { TableWide } from "@/components/TableWide";
import { VariationPill } from "@/components/VariationPill";
import { KpiCard } from "@/components/KpiCard";
import { KpiGroup } from "@/components/KpiGroup";
import { SourcePill } from "@/components/SourcePill";
import { Eye, Trophy, Users } from "lucide-react";

const YOUR_DOMAIN = "aw-i.com";

type VisibilityRow = {
  domain: string;
  visibility: number | null;
  top3: number;
  top10: number;
  top50: number;
  top100: number;
  keywords: number;
  trafic: number;
  gap: number | null;
  isYou?: boolean;
};

const VISIBILITY: VisibilityRow[] = [
  { domain: YOUR_DOMAIN,        visibility: null, top3: 0, top10: 0, top50: 0, top100: 0, keywords: 0, trafic: 0,   gap: null, isYou: true },
  { domain: "nooki.fr",          visibility: 3100, top3: 1, top10: 4, top50: 5, top100: 5, keywords: 5, trafic: 680, gap: 3100 },
  { domain: "agence-slashr.fr",  visibility: 1200, top3: 3, top10: 5, top50: 5, top100: 5, keywords: 5, trafic: 349, gap: 1200 },
  { domain: "egoprod.fr",        visibility:   45, top3: 0, top10: 1, top50: 5, top100: 5, keywords: 5, trafic:   8, gap:   45 },
  { domain: "search-factory.fr", visibility:    2, top3: 0, top10: 1, top50: 3, top100: 4, keywords: 4, trafic:   0, gap:    2 },
  { domain: "optimize360.fr",    visibility: null, top3: 0, top10: 0, top50: 0, top100: 0, keywords: 0, trafic:   0, gap:    0 },
  { domain: "synerweb.fr",       visibility: null, top3: 0, top10: 0, top50: 0, top100: 0, keywords: 0, trafic:   0, gap:    0 },
  { domain: "elocos.be",         visibility:    0, top3: 0, top10: 0, top50: 1, top100: 4, keywords: 4, trafic:   0, gap:    0 },
  { domain: "yateo.com",         visibility: null, top3: 0, top10: 0, top50: 0, top100: 0, keywords: 0, trafic:   0, gap: null },
  { domain: "ekko-media.com",    visibility: null, top3: 0, top10: 0, top50: 0, top100: 0, keywords: 0, trafic:   0, gap: null },
  { domain: "netinshape.fr",     visibility: null, top3: 0, top10: 0, top50: 0, top100: 0, keywords: 0, trafic:   0, gap: null },
];

const COMPETITOR_COUNT = VISIBILITY.filter((r) => !r.isYou).length;
// Meilleur concurrent (visibilité max) — pour situer votre position.
const TOP_COMPETITOR = VISIBILITY
  .filter((r) => !r.isYou && r.visibility != null)
  .sort((a, b) => (b.visibility ?? 0) - (a.visibility ?? 0))[0];
const fmtVis = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1).replace(".", ",")}K` : String(v));

export function BenchmarkView() {
  return (
    <div className="flex flex-col gap-4">
      {/* Encart de synthèse — votre position vs concurrents (le titre de la vue
          vient de l'en-tête de page, on ne le redouble pas ici). */}
      <div className="rounded-2xl border border-[var(--border-subtle)] p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="type-title">Votre position vs concurrents</p>
          <SourcePill source="Haloscan" href="https://haloscan.com" />
        </div>
        <KpiGroup columns={3}>
          <KpiCard bare icon={Eye}    label="Votre visibilité"    value="10"                       sub="score Haloscan" />
          <KpiCard bare icon={Trophy} label="Meilleur concurrent" value={fmtVis(TOP_COMPETITOR.visibility ?? 0)} sub={TOP_COMPETITOR.domain} />
          <KpiCard bare icon={Users}  label="Concurrents suivis"  value={String(COMPETITOR_COUNT)} />
        </KpiGroup>
      </div>

      <TableWide<VisibilityRow>
        columns={[
          {
            key: "domain", header: "Domaine", width: 220, flex: true,
            render: (r) => (
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={`https://www.google.com/s2/favicons?domain=${r.domain}&sz=32`}
                  alt=""
                  width={16}
                  height={16}
                  className="h-4 w-4 flex-shrink-0 rounded-sm"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
                <span className={`block truncate type-label ${r.isYou ? "text-[var(--accent-primary)]" : "text-[var(--text-primary)]"}`}>
                  {r.domain}
                  {r.isYou && <span className="ml-2 type-micro">Vous</span>}
                </span>
              </div>
            ),
          },
          {
            key: "visibility", header: "Score visib.", width: 120, align: "right", sortable: true, sortValue: (r) => r.visibility ?? -1,
            render: (r) => (
              <span className="type-label tabular-nums text-[var(--text-primary)]">
                {r.visibility === null ? "—" : r.visibility >= 1000 ? `${(r.visibility / 1000).toFixed(1)}K` : r.visibility}
              </span>
            ),
          },
          { key: "top3",   header: "Top 3",   width: 70, align: "right", sortable: true, sortValue: (r) => r.top3,   render: (r) => <span className="type-label tabular-nums">{r.top3}</span> },
          { key: "top10",  header: "Top 10",  width: 70, align: "right", sortable: true, sortValue: (r) => r.top10,  render: (r) => <span className="type-label tabular-nums">{r.top10}</span> },
          { key: "top50",  header: "Top 50",  width: 70, align: "right", sortable: true, sortValue: (r) => r.top50,  render: (r) => <span className="type-label tabular-nums">{r.top50}</span> },
          { key: "top100", header: "Top 100", width: 80, align: "right", sortable: true, sortValue: (r) => r.top100, render: (r) => <span className="type-label tabular-nums">{r.top100}</span> },
          {
            key: "keywords", header: "Mots-clés", width: 90, align: "right", sortable: true, sortValue: (r) => r.keywords,
            render: (r) => <span className="type-label tabular-nums">{r.keywords}</span>,
          },
          {
            key: "trafic", header: "Trafic Est.", width: 110, align: "right", sortable: true, sortValue: (r) => r.trafic,
            render: (r) => <span className="type-label tabular-nums text-[var(--text-primary)]">{r.trafic.toLocaleString("fr-FR")}</span>,
          },
          {
            key: "gap", header: "Gap", width: 80, align: "right", sortable: true, sortValue: (r) => r.gap ?? 0,
            render: (r) => {
              if (r.gap === null) return <span className="type-label text-[var(--text-muted)]">—</span>;
              if (r.gap === 0) return <span className="type-label text-[var(--text-muted)]">0</span>;
              return (
                <VariationPill direction="down" className="justify-end">
                  +{r.gap.toLocaleString("fr-FR")}
                </VariationPill>
              );
            },
          },
        ]}
        data={VISIBILITY}
        rowKey={(r) => r.domain}
        isRowActive={(r) => !!r.isYou}
        minWidth={1000}
        hidePagination
        bordered
        edgePadding="24px"
      />
    </div>
  );
}
