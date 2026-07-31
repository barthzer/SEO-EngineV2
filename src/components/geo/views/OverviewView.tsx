"use client";

import { useState } from "react";
import {
  ChartBarIcon, ArrowTrendingUpIcon, ChevronRightIcon,
  PencilSquareIcon, AdjustmentsHorizontalIcon, MegaphoneIcon,
} from "@heroicons/react/24/outline";
import { GeoLineChart } from "@/components/geo/GeoLineChart";
import { VerticalBarChart } from "@/components/VerticalBarChart";
import { TableWide } from "@/components/TableWide";
import {
  leaderboard, geoSummary, visibilityByPlatform, visibilityByPlatformSeries, geoOpportunities, visibilitySeries,
  TOP_DOMAINS, type GeoOpportunity, type PlatformVisibility, type Series, type LeaderRow, type CitedDomain,
} from "@/components/geo/analytics";
import { TOP_KEYWORDS, formatVolume } from "@/components/geo/data";
import type { GeoSetup } from "@/components/geo/types";
import { CARD, CARD_SM, visColor } from "@/components/geo/ui";

export function OverviewView({ setup, domain, onNavigate }: { setup: GeoSetup; domain: string; onNavigate?: (view: string) => void }) {
  const board = leaderboard(setup, domain);
  const you = board.find((r) => r.isYou)!;
  const summary = geoSummary(setup, domain);
  const platforms = visibilityByPlatform(setup, domain);
  const platformSeries = visibilityByPlatformSeries(setup, domain);
  const opportunities = geoOpportunities(setup, domain);
  const yPts = visibilitySeries(setup, domain).find((s) => s.isYou)?.points ?? [];
  const scoreDelta = yPts.length > 1 ? yPts[yPts.length - 1].value - yPts[0].value : 0;

  return (
    <div className="flex flex-col gap-5">
      {/* ── Résumé IA + Score de visibilité — une seule carte, séparateur central ── */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 ${CARD}`}>
        <SummaryCard headline={summary.headline} body={summary.body} />
        <ScorePanel score={you.visibility} delta={scoreDelta} platformSeries={platformSeries} platforms={platforms} />
      </div>

      {/* ── Top concurrents + Top sources ── */}
      <div className="grid grid-cols-2 gap-4">
        <TopConcurrents board={board} />
        <TopSources sources={TOP_DOMAINS} />
      </div>

      {/* ── Top mots-clés ── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="type-title">Top mots-clés</p>
            <p className="mt-0.5 type-caption">Requêtes à fort volume qui alimentent les mentions IA de votre marché</p>
          </div>
          <SeeAll onClick={() => onNavigate?.("volume")} />
        </div>
        <div className={`overflow-hidden ${CARD_SM}`}>
          <TableWide<{ keyword: string; volume: number }>
            hidePagination
            rowKey={(k) => k.keyword}
            data={TOP_KEYWORDS}
            columns={[
              { key: "rank", header: "#", width: 40,
                render: (_k, i) => <span className="type-label tabular-nums text-[var(--text-primary)]">{i + 1}</span> },
              { key: "keyword", header: "Mot-clé", width: 200, flex: true,
                render: (k) => <span className="truncate type-body">{k.keyword}</span> },
              { key: "volume", header: "Volume de prompts", width: 260, sortable: true, sortValue: (k) => k.volume,
                render: (k) => (
                  <div className="flex items-center gap-3">
                    <span className="w-14 flex-shrink-0 text-right type-label tabular-nums text-[var(--text-primary)]">{formatVolume(k.volume)}</span>
                    <div className="hidden h-2 flex-1 overflow-hidden rounded-full bg-[var(--bg-subtle)] sm:block">
                      <div className="h-full rounded-full bg-[var(--text-primary)]" style={{ width: `${(k.volume / TOP_KEYWORDS[0].volume) * 100}%` }} />
                    </div>
                  </div>
                ) },
            ]}
          />
        </div>
      </section>

      {/* ── Top opportunités (cards) ── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="type-title">Top opportunités</p>
            <p className="mt-0.5 type-caption">Les actions à plus fort potentiel de visibilité IA</p>
          </div>
          <SeeAll onClick={() => onNavigate?.("opportunities")} />
        </div>
        <div className="flex flex-col gap-3">
          {opportunities.map((o) => <OpportunityCard key={o.id} opp={o} />)}
        </div>
      </section>
    </div>
  );
}

/* ── Résumé IA ────────────────────────────────────────────────────────── */

function SummaryCard({ headline, body }: { headline: string; body: string }) {
  return (
    <div className="flex h-full flex-col p-6">
      <p className="type-title">Quoi de neuf</p>
      <div className="flex flex-1 flex-col justify-center py-4">
        <p className="type-title leading-snug">{headline}</p>
        <p className="mt-2 type-body leading-relaxed text-[var(--text-secondary)]">{body}</p>
      </div>
      <p className="type-micro">Généré le 17/06/2026</p>
    </div>
  );
}

/* ── Panneau Score de visibilité (switch barres / courbe) ─────────────── */

function ScorePanel({ score, delta, platformSeries, platforms }: { score: number; delta: number; platformSeries: Series[]; platforms: PlatformVisibility[] }) {
  const [mode, setMode] = useState<"bar" | "line">("bar");

  return (
    <div className="flex h-full flex-col border-t border-[var(--border-subtle)] p-6 lg:border-l lg:border-t-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="type-title">Score de visibilité IA</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="type-display">{score}%</span>
            {delta === 0 ? (
              <span className="type-label">stable</span>
            ) : (
              <span className="type-label tabular-nums" style={{ color: delta > 0 ? "var(--color-success)" : "var(--color-danger)" }}>
                {delta > 0 ? `+${delta}` : `${delta}`} pts
              </span>
            )}
          </div>
        </div>
        {/* Switch barres / courbe */}
        <div className="flex flex-shrink-0 items-center gap-0.5 rounded-lg border border-[var(--border-subtle)] p-0.5">
          <ModeButton active={mode === "bar"} onClick={() => setMode("bar")} label="Barres"><ChartBarIcon className="h-4 w-4" /></ModeButton>
          <ModeButton active={mode === "line"} onClick={() => setMode("line")} label="Courbe"><ArrowTrendingUpIcon className="h-4 w-4" /></ModeButton>
        </div>
      </div>

      <div className="mt-5">
        {mode === "bar" ? (
          <VerticalBarChart
            data={platforms.map((p) => ({ label: p.label, value: p.value, color: p.color }))}
            formatValue={(v) => `${v}%`}
            chartHeight={200}
            showYAxis
            renderLabel={(_, i) => <Favicon domain={platforms[i].domain} size={20} />}
            tooltip={(item) => <span className="type-caption font-medium text-white">{item.label} · {item.value}%</span>}
          />
        ) : (
          <GeoLineChart series={platformSeries} height={180} suffix="%" interactive />
        )}
      </div>
    </div>
  );
}

function ModeButton({ active, onClick, label, children }: { active: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} aria-pressed={active}
      className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${active ? "bg-[var(--bg-subtle)] text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}>
      {children}
    </button>
  );
}

/* ── Carte opportunité ────────────────────────────────────────────────── */

const CAT_ICON: Record<string, typeof PencilSquareIcon> = {
  "Création de contenu": PencilSquareIcon,
  "Optimisation de page": AdjustmentsHorizontalIcon,
  "Relations presse": MegaphoneIcon,
};

function OpportunityCard({ opp }: { opp: GeoOpportunity }) {
  const Icon = CAT_ICON[opp.category] ?? PencilSquareIcon;
  return (
    <button type="button" className={`${CARD} group flex items-center gap-4 p-5 text-left transition-colors hover:border-[var(--border-medium)]`}>
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-[var(--accent-primary-soft)] px-2.5 py-1 type-micro text-[var(--accent-primary)]">
            <Icon className="h-3.5 w-3.5" />{opp.category}
          </span>
          <span className="truncate type-body-sm italic">« {opp.topic} »</span>
        </div>
        <p className="type-title leading-snug">{opp.title}</p>
        <p className="mt-1 line-clamp-2 type-body-sm leading-relaxed">{opp.description}</p>
      </div>
      <div className="flex flex-shrink-0 flex-col items-end gap-2">
        <span className="type-caption font-semibold tabular-nums text-[var(--color-success)]">{opp.impact}</span>
        <ChevronRightIcon className="h-4 w-4 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>
  );
}

/* ── Sous-composants partagés (réutilisés par d'autres vues) ──────────── */

/* ── Top concurrents (leaderboard) ────────────────────────────────────── */

function RankBadge({ rank }: { rank: number }) {
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
  return medal
    ? <span className="text-[15px] leading-none" aria-label={`#${rank}`}>{medal}</span>
    : <span className="type-label tabular-nums text-[var(--text-primary)]">{rank}</span>;
}

function TopConcurrents({ board }: { board: LeaderRow[] }) {
  return (
    <Panel title="Top concurrents" sub="Les marques les plus visibles dans les réponses IA">
      <TableWide<LeaderRow>
        hidePagination
        rowKey={(r) => r.domain}
        data={board}
        isRowActive={(r) => r.isYou}
        columns={[
          { key: "rank", header: "#", width: 44,
            render: (_r, i) => <RankBadge rank={i + 1} /> },
          { key: "brand", header: "Marque", width: 170, flex: true,
            render: (r) => (
              <div className="flex min-w-0 items-center gap-2.5">
                <Favicon domain={r.domain} size={18} />
                <div className="min-w-0">
                  <p className={`truncate type-label ${r.isYou ? "text-[var(--accent-primary)]" : "text-[var(--text-primary)]"}`}>{r.name}{r.isYou ? " (vous)" : ""}</p>
                  <p className="truncate type-micro">{r.domain}</p>
                </div>
              </div>
            ) },
          { key: "pos", header: "Position", width: 84, align: "right",
            render: (r) => <span className="type-label tabular-nums text-[var(--text-primary)]">{r.position.toString().replace(".", ",")}</span> },
          { key: "vis", header: "Visibilité", width: 90, align: "right", sortable: true, sortValue: (r) => r.visibility,
            render: (r) => <span className="type-label font-semibold tabular-nums" style={{ color: visColor(r.visibility) }}>{r.visibility}%</span> },
        ]}
      />
    </Panel>
  );
}

/* ── Top sources (domaines cités) — liste à barres ────────────────────── */

function TopSources({ sources }: { sources: CitedDomain[] }) {
  const top = sources.slice(0, 5);
  const max = Math.max(...top.map((d) => d.used), 1);
  return (
    <Panel title="Top sources" sub="Domaines les plus cités comme sources par les IA">
      <div className="flex flex-col gap-2 p-4">
        {top.map((d) => (
          <div key={d.domain} className="relative flex items-center gap-3 overflow-hidden rounded-xl bg-[var(--bg-card-static)] px-2.5 py-2">
            <div className="absolute inset-y-0 left-0 rounded-xl bg-[var(--accent-primary-soft)]"
              style={{ width: `${(d.used / max) * 100}%` }} aria-hidden="true" />
            <span className="relative flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-[var(--bg-primary)]">
              <Favicon domain={d.domain} size={16} />
            </span>
            <span className="relative min-w-0 flex-1 truncate font-mono type-label text-[var(--text-primary)]">{d.domain}</span>
            <span className="relative flex h-6 min-w-[30px] items-center justify-center rounded-md border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-1.5 type-caption font-semibold tabular-nums text-[var(--text-primary)]">{d.used}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/** Lien « Voir tout » — même style que la vue d'ensemble d'un projet. */
function SeeAll({ onClick }: { onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="flex-shrink-0 type-body-strong text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">
      Voir tout
    </button>
  );
}

export function Panel({ title, sub, meta, action, children }: { title: string; sub?: string; meta?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className={`overflow-hidden ${CARD_SM}`}>
      <div className="flex items-center justify-between gap-3 px-6 py-4">
        <div>
          <p className="type-title">{title}</p>
          {sub && <p className="mt-0.5 type-caption">{sub}</p>}
        </div>
        {action ?? (meta && <span className="flex-shrink-0 type-caption">{meta}</span>)}
      </div>
      <div className="border-t border-[var(--border-subtle)]">{children}</div>
    </div>
  );
}

export function Favicon({ domain, size = 16 }: { domain: string; size?: number }) {
  return (
    <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`} alt="" width={size} height={size}
      className="flex-shrink-0 rounded-sm" style={{ width: size, height: size }}
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
  );
}
