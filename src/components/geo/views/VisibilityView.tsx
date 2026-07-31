"use client";

import { Fragment, useState, useMemo, type ReactNode } from "react";
import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import { GeoLineChart } from "@/components/geo/GeoLineChart";
import { DonutChart } from "@/components/DonutChart";
import { VerticalBarChart } from "@/components/VerticalBarChart";
import { Tooltip } from "@/components/Tooltip";
import { Favicon } from "@/components/geo/views/OverviewView";
import { PromptModal } from "@/components/geo/PromptModal";
import {
  visibilitySeries, averagePositionSeries, shareOfVoice, leaderboard, topicRankings,
  brandFromDomain, enrichPrompts, platformMatrix, PLATFORM_LABEL, PLATFORM_DOMAIN,
  type TopicRanking, type RankBrand, type PromptRanking, type EnrichedPrompt,
} from "@/components/geo/analytics";
import type { GeoSetup, LlmPlatform } from "@/components/geo/types";
import { CARD, PLATFORM_COLOR } from "@/components/geo/ui";

/**
 * Hook interne : retrouve l'`EnrichedPrompt` correspondant au texte d'une ligne
 * de classement, et pilote l'ouverture de la `PromptModal`. Partagé par les
 * tables « Classement par sujet » et « Classement par prompt ».
 */
function usePromptModal(setup?: GeoSetup) {
  const enriched = useMemo(() => (setup ? enrichPrompts(setup) : []), [setup]);
  const [modalPrompt, setModalPrompt] = useState<EnrichedPrompt | null>(null);
  const openByText = (text: string) => {
    const ep = enriched.find((e) => e.text === text);
    if (ep) setModalPrompt(ep);
  };
  return { enriched, modalPrompt, setModalPrompt, openByText };
}

/** Rang formaté façon position (1 décimale, virgule française). */
const fmtPos = (v: number) => (Math.round(v * 10) / 10).toString().replace(".", ",");
const fmtPct = (v: number) => `${v}%`;

type RankRowData = { name: string; domain: string; isYou: boolean; value: number };

export function VisibilityView({ setup, domain }: { setup: GeoSetup; domain: string }) {
  const brand = brandFromDomain(domain);
  const topics = topicRankings(setup, domain);

  // ── Score de visibilité par plateforme (marque suivie) ──
  const platforms = setup.platforms;
  const you = platformMatrix(setup, domain).find((r) => r.isYou);
  const platVisRows = platforms
    .map((p) => ({ platform: p, value: you?.byPlatform[p] ?? 0 }))
    .sort((a, b) => b.value - a.value);
  const platVisBars = platVisRows.map((r) => ({ label: PLATFORM_LABEL(r.platform), value: r.value, color: PLATFORM_COLOR(r.platform) }));

  return (
    <div className="flex flex-col gap-8">
      <VisibilityAnalytics setup={setup} domain={domain} />

      {/* 4. Classement par sujet */}
      <Section title="Classement par sujet" subtitle={`Classement de visibilité de ${brand} par sujet, comparé aux marques de votre marché`}>
        <TopicRankingTable topics={topics} setup={setup} domain={domain} />
      </Section>

      {/* 5. Score de visibilité par plateforme — barres + classement */}
      <Section title="Score de visibilité par plateforme" subtitle={`Fréquence d'apparition de ${brand} sur chaque plateforme IA`}>
        <SplitCard
          left={
            <div className="flex flex-col">
              <p className="mb-5 type-label">Score de visibilité</p>
              <VerticalBarChart
                data={platVisBars}
                chartHeight={232}
                barWidth={52}
                showYAxis
                formatValue={fmtPct}
                renderLabel={(_item, i) => <Favicon domain={PLATFORM_DOMAIN(platVisRows[i].platform)} size={18} />}
                tooltip={(item) => <span className="type-caption font-medium text-white">{item.label} · {fmtPct(item.value)}</span>}
              />
            </div>
          }
          right={<PlatformRankSide label="Classement — score de visibilité" valueHeader="Score de visibilité" rows={platVisRows} format={fmtPct} />}
        />
      </Section>
    </div>
  );
}

/* ── Panneau de classement par plateforme (à droite des SplitCards) ──────── */
function PlatformRankSide({ label, valueHeader, rows, format }: {
  label: string; valueHeader: string; rows: { platform: LlmPlatform; value: number }[]; format: (v: number) => string;
}) {
  return (
    <div className="flex h-full flex-col">
      <p className="mb-5 type-label">{label}</p>
      <div className="flex items-center justify-between pb-1 type-caption">
        <span>Plateforme</span><span>{valueHeader}</span>
      </div>
      <div className="flex flex-col">
        {rows.map((r, i) => (
          <div key={r.platform} className="flex items-center gap-3 border-t border-[var(--border-subtle)] py-2.5 first:border-t-0">
            <span className="w-6 flex-shrink-0 type-label tabular-nums text-[var(--text-primary)]">{i + 1}.</span>
            <Favicon domain={PLATFORM_DOMAIN(r.platform)} size={18} />
            <span className="min-w-0 flex-1 truncate type-label text-[var(--text-primary)]">{PLATFORM_LABEL(r.platform)}</span>
            <span className="flex-shrink-0 type-label tabular-nums text-[var(--text-primary)]">{format(r.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Trois sections analytics réutilisables (Score de visibilité / Share of voice /
 * Position moyenne), avec courbe+classement. `seedOffset` permet de scoper les
 * chiffres à un lot précis (cf. [[LotDetailView]]) ; 0 = vue globale.
 */
export function VisibilityAnalytics({ setup, domain, seedOffset = 0 }: { setup: GeoSetup; domain: string; seedOffset?: number }) {
  const brand = brandFromDomain(domain);
  const board = leaderboard(setup, domain, seedOffset);
  const you = board.find((r) => r.isYou)!;

  // ── Score de visibilité ──
  const visSeries = visibilitySeries(setup, domain, seedOffset);
  const yVisPts = visSeries.find((s) => s.isYou)?.points ?? [];
  const visDelta = yVisPts.length > 1 ? yVisPts[yVisPts.length - 1].value - yVisPts[0].value : 0;
  const visRows: RankRowData[] = [...board]
    .sort((a, b) => b.visibility - a.visibility)
    .map((r) => ({ name: r.name, domain: r.domain, isYou: r.isYou, value: r.visibility }));
  const visRank = visRows.findIndex((r) => r.isYou) + 1;

  // ── Share of voice ──
  const totalVis = board.reduce((s, r) => s + r.visibility, 0) || 1;
  const sovRows: RankRowData[] = [...board]
    .sort((a, b) => b.visibility - a.visibility)
    .map((r) => ({ name: r.name, domain: r.domain, isYou: r.isYou, value: Math.round((r.visibility / totalVis) * 1000) / 10 }));
  const sovRank = sovRows.findIndex((r) => r.isYou) + 1;
  const youSov = sovRows.find((r) => r.isYou)?.value ?? 0;

  // ── Position moyenne ──
  const posSeries = averagePositionSeries(setup, domain, seedOffset);
  const posRows: RankRowData[] = [...board]
    .sort((a, b) => a.position - b.position)
    .map((r) => ({ name: r.name, domain: r.domain, isYou: r.isYou, value: r.position }));
  const posRank = posRows.findIndex((r) => r.isYou) + 1;

  const [visCompare, setVisCompare] = useState(true);
  const [posCompare, setPosCompare] = useState(true);

  return (
    <>
      {/* 1. Score de visibilité — courbe à gauche, classement à droite */}
      <Section title="Score de visibilité" subtitle={`Fréquence d'apparition de ${brand} dans les réponses IA`}>
        <SplitCard
          left={
            <ChartSide label="Score de visibilité" value={`${you.visibility}%`} delta={visDelta} deltaSuffix=" pts">
              <GeoLineChart series={visSeries} height={210} suffix="%" compare={visCompare} onCompareChange={setVisCompare} />
            </ChartSide>
          }
          right={<RankSide label="Classement visibilité" rank={visRank} valueHeader="Score de visibilité" rows={visRows} format={(v) => `${v}%`} />}
        />
      </Section>

      {/* 2. Share of voice — donut à gauche, classement à droite */}
      <Section title="Share of voice" subtitle={`Mentions de ${brand} dans les réponses IA, en relation avec les concurrents`}>
        <SplitCard
          left={
            <ChartSide label="Share of voice" value={`${youSov}%`} delta={0}>
              <SovDonut setup={setup} domain={domain} seedOffset={seedOffset} />
            </ChartSide>
          }
          right={<RankSide label="Classement share of voice" rank={sovRank} valueHeader="Share of voice" rows={sovRows} format={(v) => `${v}%`} />}
        />
      </Section>

      {/* 3. Position moyenne — courbe (axe inversé) à gauche, classement à droite */}
      <Section title="Position moyenne" subtitle={`Rang moyen de ${brand} dans les réponses IA`}>
        <SplitCard
          left={
            <ChartSide label="Position moyenne" value={fmtPos(you.position)} delta={0}>
              <GeoLineChart series={posSeries} height={210} suffix="" invert compare={posCompare} onCompareChange={setPosCompare} />
            </ChartSide>
          }
          right={<RankSide label="Classement position moyenne" rank={posRank} valueHeader="Position moyenne" rows={posRows} format={fmtPos} />}
        />
      </Section>
    </>
  );
}

/* ── En-tête de section (titre + sous-titre) ──────────────────────────── */

export function Section({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <p className="type-title">{title}</p>
        <p className="mt-0.5 type-caption">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

/* ── Carte scindée : métrique/graph à gauche, classement à droite ─────── */

export function SplitCard({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className={`grid grid-cols-1 overflow-hidden lg:grid-cols-[1.5fr_1fr] ${CARD}`}>
      <div className="min-w-0 p-6">{left}</div>
      <div className="min-w-0 border-t border-[var(--border-subtle)] p-6 lg:border-l lg:border-t-0">{right}</div>
    </div>
  );
}

function ChartSide({ label, value, delta, deltaSuffix = "", children }: { label: string; value: string; delta: number; deltaSuffix?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col">
      <p className="type-label">{label}</p>
      <div className="mb-5 mt-1 flex items-baseline gap-2">
        <span className="type-display leading-none">{value}</span>
        <DeltaBadge delta={delta} suffix={deltaSuffix} />
      </div>
      {children}
    </div>
  );
}

function DeltaBadge({ delta, suffix = "" }: { delta: number; suffix?: string }) {
  if (!delta) return <span className="type-body text-[var(--text-muted)]">–</span>;
  const up = delta > 0;
  return (
    <span className="type-label tabular-nums" style={{ color: up ? "var(--color-success)" : "var(--color-danger)" }}>
      {up ? "+" : ""}{delta}{suffix}
    </span>
  );
}

/* ── Panneau de classement (à droite) ─────────────────────────────────── */

function RankSide({ label, rank, valueHeader, rows, format }: {
  label: string; rank: number; valueHeader: string; rows: RankRowData[]; format: (v: number) => string;
}) {
  const [expanded, setExpanded] = useState(false);
  const youInTop = rows.slice(0, 5).some((r) => r.isYou);
  const youRow = rows.find((r) => r.isYou);
  const youRank = rows.findIndex((r) => r.isYou) + 1;
  const shown = expanded ? rows : rows.slice(0, 5);

  return (
    <div className="flex h-full flex-col">
      <p className="type-label">{label}</p>
      <p className="mb-5 mt-1 type-display leading-none">#{rank}</p>
      <div className="flex items-center justify-between pb-1 type-caption">
        <span>Marque</span><span>{valueHeader}</span>
      </div>
      <div className="flex flex-col">
        {shown.map((r, i) => <RankRow key={r.domain} pos={i + 1} r={r} format={format} />)}
        {!expanded && !youInTop && youRow && <RankRow pos={youRank} r={youRow} format={format} />}
      </div>
      {rows.length > 5 && (
        <button type="button" onClick={() => setExpanded((e) => !e)}
          className="mt-3 self-end rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 type-caption font-medium transition-colors hover:bg-[var(--bg-subtle)]">
          {expanded ? "Réduire" : "Voir tout"}
        </button>
      )}
    </div>
  );
}

function RankRow({ pos, r, format }: { pos: number; r: RankRowData; format: (v: number) => string }) {
  return (
    <div className="flex items-center gap-3 border-t border-[var(--border-subtle)] py-2.5 first:border-t-0">
      <span className="w-6 flex-shrink-0 type-label tabular-nums text-[var(--text-primary)]">{pos}.</span>
      <Favicon domain={r.domain} size={18} />
      <span className={`min-w-0 flex-1 truncate type-body-sm text-[var(--text-primary)] ${r.isYou ? "font-medium" : ""}`}>{r.name}</span>
      {r.isYou && <span className="flex-shrink-0 rounded-md bg-[var(--bg-subtle)] px-1.5 py-0.5 type-micro">Vous</span>}
      <span className="flex-shrink-0 type-label tabular-nums text-[var(--text-primary)]">{format(r.value)}</span>
    </div>
  );
}

/* ── Donut Share of voice (concurrents cochables) ─────────────────────── */

function SovDonut({ setup, domain, seedOffset = 0 }: { setup: GeoSetup; domain: string; seedOffset?: number }) {
  const sov = shareOfVoice(setup, domain, seedOffset);
  const otherPct = Math.round(Math.max(0, 100 - sov.reduce((s, x) => s + x.pct, 0)) * 10) / 10;
  const items = [
    ...sov.map((s) => ({ key: s.name, label: s.name.replace(" (vous)", ""), value: s.pct, color: s.color })),
    ...(otherPct > 0.1 ? [{ key: "__other__", label: "Autres", value: otherPct, color: "var(--text-muted)" }] : []),
  ];
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  const toggle = (k: string) =>
    setHidden((h) => { const n = new Set(h); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const slices = items.filter((s) => !hidden.has(s.key)).map((s) => ({ label: s.label, value: s.value, color: s.color }));

  return (
    <div className="flex flex-col items-center gap-6 pt-2">
      <DonutChart
        slices={slices}
        size={208}
        strokeWidth={7}
        gapPercent={1}
        showTrack={false}
        formatTooltip={(slice, pct) => (
          <div className="flex flex-col gap-0.5">
            <span className="type-caption font-semibold text-white">{slice.label}</span>
            <span className="type-micro text-white/60"><span className="font-semibold text-white">{slice.value}%</span> · {pct}% du graphe</span>
          </div>
        )}
      />
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {items.map((s) => {
          const on = !hidden.has(s.key);
          return (
            <button key={s.key} type="button" onClick={() => toggle(s.key)} className="flex items-center gap-1.5 type-caption">
              <span className="flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-[5px] border-2 transition-colors"
                style={{ borderColor: s.color, backgroundColor: on ? s.color : "transparent" }}>
                {on && (
                  <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" aria-hidden="true">
                    <path d="M2.5 6.2l2 2 4.6-4.8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className={on ? "font-medium text-[var(--text-primary)]" : "text-[var(--text-muted)]"}>{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Classement par sujet (table dépliable + pagination) ──────────────── */

const TOPIC_PAGE = 10;
const TOPIC_COLS = Array.from({ length: 10 }, (_, i) => i + 1);

function TopicRankingTable({ topics, setup, domain }: { topics: TopicRanking[]; setup?: GeoSetup; domain?: string }) {
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const { enriched, modalPrompt, setModalPrompt, openByText } = usePromptModal(setup);
  const pages = Math.max(1, Math.ceil(topics.length / TOPIC_PAGE));
  const start = page * TOPIC_PAGE;
  const slice = topics.slice(start, start + TOPIC_PAGE);

  return (
    <>
    <div className={`overflow-hidden ${CARD}`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[940px] border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-card-static)]">
              <th className="px-5 py-3 text-left type-caption">Sujets</th>
              {TOPIC_COLS.map((c) => (
                <th key={c} className="w-16 px-1 py-3 text-center type-caption">#{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((t) => (
              <Fragment key={t.topic}>
                <tr className="cursor-pointer border-b border-[var(--border-subtle)] transition-colors last:border-b-0 hover:bg-[var(--bg-subtle)]"
                  onClick={() => setOpen((o) => (o === t.topic ? null : t.topic))}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <ChevronRightIcon className={`h-4 w-4 flex-shrink-0 text-[var(--text-muted)] transition-transform ${open === t.topic ? "rotate-90" : ""}`} />
                      <span className="max-w-[210px] truncate type-label text-[var(--text-primary)]">{t.topic}</span>
                      <StatusBadge status={t.status} />
                    </div>
                  </td>
                  {TOPIC_COLS.map((c) => {
                    const b = t.brands[c - 1];
                    return (
                      <td key={c} className="px-1 py-2">
                        <div className="flex justify-center">{b ? <BrandAvatar b={b} /> : null}</div>
                      </td>
                    );
                  })}
                </tr>
                {open === t.topic && t.prompts.map((pr) => (
                  <tr key={pr.text}
                    className={`border-b border-[var(--border-subtle)] last:border-b-0 ${setup && domain ? "group cursor-pointer transition-colors hover:bg-[var(--bg-subtle)]" : ""}`}
                    onClick={setup && domain ? () => openByText(pr.text) : undefined}>
                    <td className="py-2.5 pl-12 pr-5">
                      <span className={`block max-w-[260px] truncate type-label ${setup && domain ? "group-hover:text-[var(--accent-primary)]" : ""}`}>{pr.text}</span>
                    </td>
                    {TOPIC_COLS.map((c) => {
                      const b = pr.brands[c - 1];
                      return (
                        <td key={c} className="px-1 py-2">
                          <div className="flex justify-center">{b ? <BrandAvatar b={b} /> : null}</div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-[var(--border-subtle)] px-5 py-3">
        <span className="type-caption text-[var(--text-muted)]">
          {start + 1} – {Math.min(start + TOPIC_PAGE, topics.length)} sur {topics.length} sujets
        </span>
        <div className="flex items-center gap-1">
          <PagerBtn dir="prev" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} />
          <PagerBtn dir="next" disabled={page >= pages - 1} onClick={() => setPage((p) => Math.min(pages - 1, p + 1))} />
        </div>
      </div>
    </div>
    {modalPrompt && setup && domain && (
      <PromptModal prompt={modalPrompt} prompts={enriched} setup={setup} domain={domain} onNavigate={setModalPrompt} onClose={() => setModalPrompt(null)} />
    )}
    </>
  );
}

/* ── Classement par prompt (même grille #1..#10 que « Classement par sujet », mais une
   ligne par prompt — sans niveau sujet ni dépliage) ──────────────────────────────── */

export function PromptRankingTable({ prompts, setup, domain }: { prompts: PromptRanking[]; setup?: GeoSetup; domain?: string }) {
  const { enriched, modalPrompt, setModalPrompt, openByText } = usePromptModal(setup);
  return (
    <>
    <div className={`overflow-hidden ${CARD}`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[940px] border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-card-static)]">
              <th className="px-5 py-3 text-left type-caption">Prompt</th>
              {TOPIC_COLS.map((c) => (
                <th key={c} className="w-16 px-1 py-3 text-center type-caption">#{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {prompts.map((pr) => (
              <tr key={pr.text}
                className={`border-b border-[var(--border-subtle)] transition-colors last:border-b-0 hover:bg-[var(--bg-subtle)] ${setup && domain ? "group cursor-pointer" : ""}`}
                onClick={setup && domain ? () => openByText(pr.text) : undefined}>
                <td className="px-5 py-3">
                  <span className={`block max-w-[260px] truncate type-label text-[var(--text-primary)] ${setup && domain ? "group-hover:text-[var(--accent-primary)]" : ""}`}>{pr.text}</span>
                </td>
                {TOPIC_COLS.map((c) => {
                  const b = pr.brands[c - 1];
                  return (
                    <td key={c} className="px-1 py-2">
                      <div className="flex justify-center">{b ? <BrandAvatar b={b} /> : null}</div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    {modalPrompt && setup && domain && (
      <PromptModal prompt={modalPrompt} prompts={enriched} setup={setup} domain={domain} onNavigate={setModalPrompt} onClose={() => setModalPrompt(null)} />
    )}
    </>
  );
}

function StatusBadge({ status }: { status: TopicRanking["status"] }) {
  return status === "leader" ? (
    <span className="flex-shrink-0 rounded-md bg-[var(--color-success-bg)] px-1.5 py-0.5 type-micro text-[var(--color-success)]">Leader</span>
  ) : (
    <span className="flex-shrink-0 rounded-md bg-[var(--color-danger-bg)] px-1.5 py-0.5 type-micro text-[var(--color-danger)]">À travailler</span>
  );
}

/** Avatar de marque dans un Tooltip portant le nom (concurrent ou « vous »). */
function BrandAvatar({ b, size = "md" }: { b: RankBrand; size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const fav = size === "sm" ? 16 : 20;
  const inner = b.isYou ? (
    <span className={`flex ${box} items-center justify-center rounded-full bg-[var(--accent-primary-soft)] type-micro font-semibold text-[var(--accent-primary)]`}>
      {b.name.slice(0, 2).toUpperCase()}
    </span>
  ) : (
    <span className={`flex ${box} items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card-static)]`}>
      <Favicon domain={b.domain} size={fav} />
    </span>
  );
  return <Tooltip label={`${b.name}${b.isYou ? " (vous)" : ""}`} side="top" portal>{inner}</Tooltip>;
}

function PagerBtn({ dir, disabled, onClick }: { dir: "prev" | "next"; disabled: boolean; onClick: () => void }) {
  const Icon = dir === "prev" ? ChevronLeftIcon : ChevronRightIcon;
  return (
    <button type="button" disabled={disabled} onClick={onClick} aria-label={dir === "prev" ? "Précédent" : "Suivant"}
      className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] disabled:cursor-not-allowed disabled:opacity-40">
      <Icon className="h-4 w-4" />
    </button>
  );
}
