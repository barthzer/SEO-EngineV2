"use client";

import type { ReactNode } from "react";
import { GeoLineChart } from "@/components/geo/GeoLineChart";
import { VerticalBarChart } from "@/components/VerticalBarChart";
import {
  platformMatrix, sentimentByPlatform, sentimentByPlatformSeries, brandFromDomain,
  PLATFORM_LABEL, PLATFORM_DOMAIN, type MatrixRow,
} from "@/components/geo/analytics";
import type { GeoSetup, LlmPlatform } from "@/components/geo/types";
import { CARD, PLATFORM_COLOR } from "@/components/geo/ui";
import { Section, SplitCard } from "@/components/geo/views/VisibilityView";
import { Favicon } from "@/components/geo/views/OverviewView";

const fmtPct = (v: number) => `${v}%`;

export function PlatformsView({ setup, domain }: { setup: GeoSetup; domain: string }) {
  const brand = brandFromDomain(domain);
  const platforms = setup.platforms;
  const matrix = platformMatrix(setup, domain);
  const you = matrix.find((r) => r.isYou);

  // ── Score de visibilité par plateforme (marque suivie) ──
  const visRows = platforms
    .map((p) => ({ platform: p, value: you?.byPlatform[p] ?? 0 }))
    .sort((a, b) => b.value - a.value);
  const visBars = visRows.map((r) => ({ label: PLATFORM_LABEL(r.platform), value: r.value, color: PLATFORM_COLOR(r.platform) }));

  // ── Sentiment par plateforme ──
  const sentSeries = sentimentByPlatformSeries(setup, domain).map((s, i) => ({ ...s, color: PLATFORM_COLOR(platforms[i]) }));
  const sentRows = sentimentByPlatform(setup, domain)
    .map((s) => ({ platform: s.platform, value: s.score }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Vue matricielle — heatmap concurrents × plateformes */}
      <Section title="Vue matricielle" subtitle="Capture de chaque plateforme IA par concurrent, selon le score de visibilité">
        <MatrixHeatmap matrix={matrix} platforms={platforms} />
      </Section>

      {/* 2. Score de visibilité par plateforme — barres + classement */}
      <Section title="Score de visibilité par plateforme" subtitle={`Fréquence d'apparition de ${brand} sur chaque plateforme IA`}>
        <SplitCard
          left={
            <div className="flex flex-col">
              <p className="mb-5 text-[13px] text-[var(--text-muted)]">Score de visibilité</p>
              <VerticalBarChart
                data={visBars}
                chartHeight={232}
                barWidth={52}
                showYAxis
                formatValue={fmtPct}
                renderLabel={(_item, i) => <Favicon domain={PLATFORM_DOMAIN(visRows[i].platform)} size={18} />}
                tooltip={(item) => <span className="text-[12px] font-medium text-white">{item.label} · {fmtPct(item.value)}</span>}
              />
            </div>
          }
          right={<PlatformRankSide label="Classement — score de visibilité" valueHeader="Score de visibilité" rows={visRows} format={fmtPct} />}
        />
      </Section>

      {/* 3. Sentiment par plateforme — courbes + classement */}
      <Section title="Sentiment par plateforme" subtitle={`Tonalité de chaque plateforme IA à propos de ${brand}`}>
        <SplitCard
          left={
            <div className="flex flex-col">
              <p className="mb-5 text-[13px] text-[var(--text-muted)]">Sentiment</p>
              <GeoLineChart series={sentSeries} height={232} suffix="%" interactive />
            </div>
          }
          right={<PlatformRankSide label="Classement — sentiment" valueHeader="Sentiment" rows={sentRows} format={(v) => `${v}%`} />}
        />
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
            <div className="w-[210px] flex-shrink-0 px-4 py-3 text-[12px] font-medium text-[var(--text-muted)]">Concurrents</div>
            {platforms.map((p) => (
              <div key={p} className="flex flex-1 items-center justify-center gap-1.5 border-l border-[var(--border-subtle)] px-3 py-3 text-[12px] font-medium text-[var(--text-secondary)]">
                <Favicon domain={PLATFORM_DOMAIN(p)} size={16} />{PLATFORM_LABEL(p)}
              </div>
            ))}
          </div>
          {/* Lignes */}
          {rows.map((r) => (
            <div key={r.domain} className="flex items-stretch border-b border-[var(--border-subtle)] last:border-b-0">
              <div className={`flex w-[210px] flex-shrink-0 items-center gap-2 px-4 py-3.5 ${r.isYou ? "bg-[var(--accent-primary-soft)]" : ""}`}>
                <Favicon domain={r.domain} size={16} />
                <span className={`min-w-0 truncate text-[13px] font-medium ${r.isYou ? "text-[var(--accent-primary)]" : "text-[var(--text-primary)]"}`}>{r.name}</span>
                {r.isYou && (
                  <span className="flex-shrink-0 rounded-md bg-[var(--bg-subtle)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--text-muted)]">Vous</span>
                )}
              </div>
              {platforms.map((p) => {
                const v = r.byPlatform[p] ?? 0;
                const t = v / maxVal;
                return (
                  <div key={p} className="flex flex-1 items-center justify-center border-l border-[var(--border-subtle)] py-3.5"
                    style={{ backgroundColor: `color-mix(in oklab, var(--accent-primary) ${Math.round((0.06 + 0.94 * t) * 100)}%, var(--bg-card))` }}>
                    <span className={`text-[13px] font-semibold tabular-nums ${t > 0.5 ? "text-white" : "text-[var(--text-primary)]"}`}>{v}%</span>
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

/* ── Panneau de classement (à droite des SplitCards) ─────────────────────── */
function PlatformRankSide({ label, valueHeader, rows, format }: {
  label: string; valueHeader: string; rows: { platform: LlmPlatform; value: number }[]; format: (v: number) => string;
}) {
  return (
    <div className="flex h-full flex-col">
      <p className="mb-5 text-[13px] text-[var(--text-muted)]">{label}</p>
      <div className="flex items-center justify-between pb-1 text-[12px] text-[var(--text-muted)]">
        <span>Plateforme</span><span>{valueHeader}</span>
      </div>
      <div className="flex flex-col">
        {rows.map((r, i) => (
          <div key={r.platform} className="flex items-center gap-3 border-t border-[var(--border-subtle)] py-2.5 first:border-t-0">
            <span className="w-6 flex-shrink-0 text-[13px] tabular-nums text-[var(--text-muted)]">{i + 1}.</span>
            <Favicon domain={PLATFORM_DOMAIN(r.platform)} size={18} />
            <span className="min-w-0 flex-1 truncate text-[13px] text-[var(--text-primary)]">{PLATFORM_LABEL(r.platform)}</span>
            <span className="flex-shrink-0 text-[13px] font-medium tabular-nums text-[var(--text-primary)]">{format(r.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
