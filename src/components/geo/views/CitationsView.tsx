"use client";

import { useState } from "react";
import { BookOpenIcon, UsersIcon, FolderIcon, CheckCircleIcon, NoSymbolIcon } from "@heroicons/react/24/solid";
import { GeoLineChart } from "@/components/geo/GeoLineChart";
import { DonutChart } from "@/components/DonutChart";
import { TableWide } from "@/components/TableWide";
import { SearchInput } from "@/components/SearchInput";
import {
  topCitationDomains, citationShareSeries, citationTypes, topCitationPages,
  CITATION_CAT_CFG, type CitationCat, type CitationDomain, type CitationPage,
} from "@/data/geo-analytics";
import type { GeoSetup } from "@/components/geo/types";
import { Section, SplitCard } from "@/components/geo/views/VisibilityView";
import { Favicon } from "@/components/geo/views/OverviewView";

const CAT_ICON: Record<CitationCat, typeof BookOpenIcon> = { earned: BookOpenIcon, social: UsersIcon, owned: FolderIcon };

function CatPill({ cat }: { cat: CitationCat }) {
  const cfg = CITATION_CAT_CFG[cat];
  const Icon = CAT_ICON[cat];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 type-caption"
      style={{ color: cfg.color, backgroundColor: `color-mix(in oklab, ${cfg.color} 12%, transparent)` }}>
      <Icon className="h-3.5 w-3.5" />{cfg.label}
    </span>
  );
}

const fmtShare = (v: number) => (Number.isInteger(v) ? `${v}%` : `${v.toString().replace(".", ",")}%`);

export function CitationsView({ setup, domain }: { setup: GeoSetup; domain: string }) {
  const domains = topCitationDomains(setup, domain);
  const owned = domains.find((d) => d.cat === "owned");
  const ownedRank = domains.findIndex((d) => d.cat === "owned") + 1;
  const series = citationShareSeries(setup, domain);
  const types = citationTypes();
  const pages = topCitationPages(setup, domain);

  const [compare, setCompare] = useState(true);
  const [domSearch, setDomSearch] = useState("");
  const [pageSearch, setPageSearch] = useState("");

  const domRows = domains.filter((d) => !domSearch || d.domain.toLowerCase().includes(domSearch.toLowerCase()));
  const pageRows = pages.filter((p) => !pageSearch || p.url.toLowerCase().includes(pageSearch.toLowerCase()));
  const maxDom = Math.max(1, ...domains.map((d) => d.share));

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Origine des citations — donut (comme Share of voice) */}
      <Section title="Origine des citations" subtitle="Répartition des citations par origine sur la période">
        <SplitCard
          left={
            <div className="flex items-center justify-center py-2">
              <DonutChart
                slices={types.map((t) => ({ label: CITATION_CAT_CFG[t.cat].label, value: t.pct, color: CITATION_CAT_CFG[t.cat].color }))}
                size={208}
                strokeWidth={7}
                gapPercent={1}
                showTrack={false}
                formatTooltip={(slice, pct) => (
                  <div className="flex flex-col gap-0.5">
                    <span className="type-caption text-white">{slice.label}</span>
                    <span className="type-micro text-white/60"><span className="font-semibold text-white">{slice.value}%</span> · {pct}% du graphe</span>
                  </div>
                )}
              />
            </div>
          }
          right={
            <div className="flex h-full flex-col justify-center gap-4">
              {types.map((t) => {
                const cfg = CITATION_CAT_CFG[t.cat];
                const Icon = CAT_ICON[t.cat];
                return (
                  <div key={t.cat} className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md"
                        style={{ color: cfg.color, backgroundColor: `color-mix(in oklab, ${cfg.color} 12%, transparent)` }}>
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="flex-1 type-body-strong">{cfg.label}</span>
                      <span className="type-body-strong tabular-nums">{fmtShare(t.pct)}</span>
                    </div>
                    <span className="h-1.5 overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                      <span className="block h-full rounded-full" style={{ width: `${t.pct}%`, backgroundColor: cfg.color }} />
                    </span>
                  </div>
                );
              })}
            </div>
          }
        />
      </Section>

      {/* 2. Partage des citations — courbe + classement */}
      <Section title="Partage des citations" subtitle={`Fréquence à laquelle ${domain} est cité dans les réponses IA par rapport aux sites de vos concurrents`}>
        <SplitCard
          left={
            <div className="flex flex-col">
              <p className="type-label">Partage des citations</p>
              <p className="mb-5 mt-1 type-display leading-none">{fmtShare(owned?.share ?? 0)}</p>
              <GeoLineChart series={series} height={210} suffix="%" compare={compare} onCompareChange={setCompare} compareLabel="Comparer les sites" />
            </div>
          }
          right={
            <div className="flex h-full flex-col">
              <p className="type-label">Classement des citations</p>
              <p className="mb-5 mt-1 type-display leading-none">#{ownedRank}</p>
              <div className="flex items-center justify-between pb-1 type-caption"><span>Domaine</span><span>Partage</span></div>
              <div className="flex flex-col">
                {domains.slice(0, 5).map((d, i) => (
                  <div key={d.domain} className="flex items-center gap-3 border-t border-[var(--border-subtle)] py-2.5 first:border-t-0">
                    <span className="w-6 flex-shrink-0 type-label tabular-nums text-[var(--text-primary)]">{i + 1}.</span>
                    <Favicon domain={d.domain} size={18} />
                    <span className="min-w-0 flex-1 truncate type-label text-[var(--text-primary)]">{d.domain}</span>
                    {d.cat === "owned" && <span className="flex-shrink-0 rounded-md bg-[var(--bg-subtle)] px-1.5 py-0.5 type-micro">Déjà acquis</span>}
                    <span className="flex-shrink-0 type-label tabular-nums text-[var(--text-primary)]">{fmtShare(d.share)}</span>
                  </div>
                ))}
              </div>
            </div>
          }
        />
      </Section>

      {/* 3. Meilleurs domaines de citations */}
      <Section title="Meilleurs domaines de citations" subtitle="Les sites les plus fréquemment cités dans les réponses IA">
        <div className="flex flex-col gap-3">
          <div className="flex justify-start">
            <div className="w-full max-w-[260px]"><SearchInput value={domSearch} onChange={setDomSearch} placeholder="Rechercher un domaine…" alwaysExpanded /></div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
            <TableWide<CitationDomain>
              pageSize={10}
              rowKey={(d) => d.domain}
              data={domRows}
              emptyState={<div className="px-7 py-10 text-center type-body text-[var(--text-muted)]">Aucun domaine.</div>}
              columns={[
                { key: "rank", header: "Rang", width: 60, render: (_d, i) => <span className="type-label tabular-nums text-[var(--text-primary)]">{i + 1}.</span> },
                { key: "domain", header: "Domaine", width: 300, flex: true,
                  render: (d) => <span className="flex min-w-0 items-center gap-2"><Favicon domain={d.domain} size={16} /><span className="truncate type-body-strong">{d.domain}</span></span> },
                { key: "cat", header: "Catégorie", width: 140, render: (d) => <CatPill cat={d.cat} /> },
                { key: "share", header: "Partage", width: 220, sortable: true, sortValue: (d) => d.share,
                  render: (d) => (
                    <div className="flex items-center gap-3">
                      <span className="w-14 flex-shrink-0 type-label tabular-nums text-[var(--text-primary)]">{fmtShare(d.share)}</span>
                      <span className="type-caption tabular-nums text-[var(--color-success)]">+{fmtShare(d.delta)}</span>
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--bg-subtle)]"><span className="block h-full rounded-full" style={{ width: `${(d.share / maxDom) * 100}%`, backgroundColor: "var(--text-primary)" }} /></span>
                    </div>
                  ) },
              ]}
            />
          </div>
        </div>
      </Section>

      {/* 4. Meilleures pages de citations */}
      <Section title="Meilleures pages de citations" subtitle="Les pages web les plus référencées dans les réponses IA">
        <div className="flex flex-col gap-3">
          <div className="flex justify-start">
            <div className="w-full max-w-[260px]"><SearchInput value={pageSearch} onChange={setPageSearch} placeholder="Rechercher une page…" alwaysExpanded /></div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
            <TableWide<CitationPage>
              pageSize={10}
              rowKey={(p) => p.url}
              data={pageRows}
              emptyState={<div className="px-7 py-10 text-center type-body text-[var(--text-muted)]">Aucune page.</div>}
              columns={[
                { key: "rank", header: "Rang", width: 60, render: (_p, i) => <span className="type-label tabular-nums text-[var(--text-primary)]">{i + 1}.</span> },
                { key: "page", header: "Page", width: 380, flex: true,
                  render: (p) => <span className="flex min-w-0 items-center gap-2"><Favicon domain={p.url.split("/")[0]} size={16} /><span className="truncate font-mono type-label">{p.url}</span></span> },
                { key: "cat", header: "Catégorie", width: 130, render: (p) => <CatPill cat={p.cat} /> },
                { key: "mentioned", header: "Mention", width: 150,
                  render: (p) => p.mentioned
                    ? <span className="inline-flex items-center gap-1.5 type-label text-[var(--color-success)]"><CheckCircleIcon className="h-4 w-4" />Mentionné</span>
                    : <span className="inline-flex items-center gap-1.5 type-label text-[var(--text-secondary)]"><NoSymbolIcon className="h-4 w-4" />Non mentionné</span> },
                { key: "share", header: "Partage", width: 130, align: "right", sortable: true, sortValue: (p) => p.share,
                  render: (p) => <span className="inline-flex items-center justify-end gap-2"><span className="type-label tabular-nums text-[var(--text-primary)]">{fmtShare(p.share)}</span><span className="type-caption tabular-nums text-[var(--color-success)]">+{fmtShare(p.delta)}</span></span> },
              ]}
            />
          </div>
        </div>
      </Section>
    </div>
  );
}
