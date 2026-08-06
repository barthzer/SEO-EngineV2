"use client";

import { useState, useRef } from "react";
import {
  TrophyIcon, LinkIcon, ArrowTrendingUpIcon,
  Squares2X2Icon, TagIcon, EyeIcon, ArrowsRightLeftIcon,
} from "@heroicons/react/24/outline";
import { ChartTooltip } from "@/components/Tooltip";
import { FilterTabs } from "@/components/FilterTabs";
import { AreaChart } from "@/components/AreaChart";
import { DonutChart } from "@/components/DonutChart";
import { Callout } from "@/components/Callout";
import { DeltaBadge } from "@/components/DeltaBadge";
import { KpiCard } from "@/components/KpiCard";
import { KpiGroup } from "@/components/KpiGroup";
import { Pill } from "@/components/Pill";
import { ScoreRing } from "@/components/ScoreRing";
import { TableWide } from "@/components/TableWide";
import { AuditSection } from "@/components/AuditSection";
import {
  COMPETITORS, COMP_AVG_TF, COMP_AVG_RD,
  TF_DATA_1AN, TF_DATA_6M, TF_DATA_3M,
  YOUR_TOPICS, COMP_TOPICS, ANCHOR_SEGS, TOP_ANCHORS,
  BACKLINKS, VISIBILITY,
  type Competitor, type BacklinkRow, type VisRow,
} from "@/data/audit-netlinking";

/* ── Helpers ──────────────────────────────────────────────────────────── */

/* SectionHead, Callout, DeltaBadge, AreaChart, DonutChart → DS components */

/* ── Radar Chart ──────────────────────────────────────────────────────── */

const RADAR_AXES = ["TF", "CF", "RefDom", "Backlinks", "TF/CF"];

const YOU_VALS:  Record<string, number> = { TF: 16/38, CF: 31/54, RefDom: 281/1456, Backlinks: 3156/21345, "TF/CF": (16/31)/(38/54) };
const COMP_VALS: Record<string, number> = { TF: 30.6/38, CF: 43.4/54, RefDom: 916/1456, Backlinks: 10617/21345, "TF/CF": 0.76 };

const RADAR_RAW: Record<string, { label: string; you: number; comp: number; unit: string }> = {
  "TF":        { label: "Trust Flow",         you: 16,   comp: 30.6,  unit: ""  },
  "CF":        { label: "Citation Flow",       you: 31,   comp: 43.4,  unit: ""  },
  "RefDom":    { label: "Domaines référents",  you: 281,  comp: 916,   unit: ""  },
  "Backlinks": { label: "Backlinks",           you: 3156, comp: 10617, unit: ""  },
  "TF/CF":     { label: "Ratio TF/CF",         you: 51.6, comp: 76,    unit: "%" },
};

function radarFmt(axis: string, v: number): string {
  if (axis === "Backlinks" || axis === "RefDom") return v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(Math.round(v));
  return String(Math.round(v * 10) / 10);
}

function radarPt(axis: string, vals: Record<string, number>, cx: number, cy: number, R: number, i: number, n: number) {
  const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
  const r = (vals[axis] ?? 0) * R;
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function RadarChart() {
  const [hoveredAxis, setHoveredAxis] = useState<string | null>(null);
  const [tipPos, setTipPos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const cx = 130, cy = 120, R = 90;
  const n = RADAR_AXES.length;

  const youPts  = RADAR_AXES.map((a, i) => radarPt(a, YOU_VALS,  cx, cy, R, i, n));
  const compPts = RADAR_AXES.map((a, i) => radarPt(a, COMP_VALS, cx, cy, R, i, n));
  const toPoints = (pts: { x: number; y: number }[]) => pts.map((p) => `${p.x},${p.y}`).join(" ");

  const labelPts = RADAR_AXES.map((_, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + (R + 18) * Math.cos(angle), y: cy + (R + 18) * Math.sin(angle) };
  });

  const onAxisEnter = (axis: string, e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHoveredAxis(axis);
    setTipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const onAxisMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={containerRef}
        className="relative"
        onMouseLeave={() => { setHoveredAxis(null); setTipPos(null); }}
      >
        <svg width={260} height={260} viewBox="0 0 260 260">
          {/* Grid circles */}
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <circle key={f} cx={cx} cy={cy} r={R * f} fill="none" stroke="var(--border-subtle)" strokeWidth="1" />
          ))}
          {/* Axes */}
          {RADAR_AXES.map((_, i) => {
            const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
            return (
              <line key={i}
                x1={cx} y1={cy}
                x2={cx + R * Math.cos(angle)} y2={cy + R * Math.sin(angle)}
                stroke="var(--border-subtle)" strokeWidth="1"
              />
            );
          })}
          {/* Competitors polygon */}
          <polygon points={toPoints(compPts)}
            fill="var(--color-neutral-bg)" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinejoin="round" />
          {/* Vous polygon */}
          <polygon points={toPoints(youPts)}
            fill="var(--accent-primary-mid)" stroke="var(--accent-primary)" strokeWidth="2" strokeLinejoin="round" />
          {/* Vertex dots — Competitors */}
          {compPts.map((pt, i) => (
            <circle key={`cd-${i}`} cx={pt.x} cy={pt.y} r={3} fill="var(--text-muted)" stroke="white" strokeWidth="1.5" />
          ))}
          {/* Vertex dots — Vous */}
          {youPts.map((pt, i) => (
            <circle key={`yd-${i}`} cx={pt.x} cy={pt.y} r={3.5} fill="var(--accent-primary)" stroke="white" strokeWidth="1.5" />
          ))}
          {/* Labels */}
          {RADAR_AXES.map((label, i) => (
            <text key={i}
              x={labelPts[i].x} y={labelPts[i].y + 4}
              textAnchor="middle" fontSize={11} fontWeight={600}
              fill={hoveredAxis === label ? "var(--accent-primary)" : "var(--text-secondary)"}
              style={{ transition: "fill 0.1s" }}
            >
              {label}
            </text>
          ))}
          {/* Hit zones at each label */}
          {RADAR_AXES.map((axis, i) => (
            <circle
              key={`hz-${axis}`}
              cx={labelPts[i].x} cy={labelPts[i].y} r={24}
              fill="transparent"
              style={{ cursor: "pointer" }}
              onMouseEnter={(e) => onAxisEnter(axis, e)}
              onMouseMove={onAxisMove}
            />
          ))}
        </svg>
        {hoveredAxis && tipPos && (() => {
          const raw = RADAR_RAW[hoveredAxis];
          const diff = raw.you - raw.comp;
          return (
            <ChartTooltip x={tipPos.x} y={tipPos.y}>
              <div className="flex flex-col gap-1.5" style={{ minWidth: 140 }}>
                <span className="type-micro font-semibold text-white">{raw.label}</span>
                <div className="type-micro flex flex-col gap-0.5">
                  <div className="flex items-center justify-between gap-5 text-white">
                    <span className="opacity-60">Vous</span>
                    <strong>{radarFmt(hoveredAxis, raw.you)}{raw.unit}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-5 text-white">
                    <span className="opacity-60">Concurrents</span>
                    <strong>{radarFmt(hoveredAxis, raw.comp)}{raw.unit}</strong>
                  </div>
                  <div className={`mt-1 flex items-center justify-between gap-5 font-semibold ${diff < 0 ? "text-[var(--color-danger)]" : "text-[var(--color-success)]"}`}>
                    <span>Écart</span>
                    <span>{diff > 0 ? "+" : "−"}{radarFmt(hoveredAxis, Math.abs(diff))}{raw.unit}</span>
                  </div>
                </div>
              </div>
            </ChartTooltip>
          );
        })()}
      </div>
      {/* Legend */}
      <div className="type-caption flex items-center gap-5">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent-primary)]" />
          Vous <strong className="ml-0.5 text-[var(--text-primary)]">48%</strong>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--text-muted)]" />
          Concurrents <strong className="ml-0.5 text-[var(--text-primary)]">94%</strong>
        </span>
      </div>
    </div>
  );
}

/* AnchorDonut → DonutChart DS · TfAreaChart → AreaChart DS */

const ANCHOR_DONUT_SLICES = ANCHOR_SEGS.map((s) => ({ label: s.label, value: s.count, color: s.color }));
const anchorTotal = ANCHOR_SEGS.reduce((a, s) => a + s.count, 0);

/* ── Score ring helper ────────────────────────────────────────────────── */

function scoreColor(s: number) {
  if (s >= 70) return "var(--color-success)";
  if (s >= 45) return "var(--color-warning)";
  return "var(--color-danger)";
}

/* Carte d'audit générique — contour, sans fond (convention DS). */
const CARD_SM = "rounded-2xl border border-[var(--border-subtle)]";

/* ── Main component ───────────────────────────────────────────────────── */

export function AuditNetlinkingTab({ domain }: { domain: string }) {
  const [tfPeriod, setTfPeriod] = useState<"3m" | "6m" | "1an">("6m");

  const tfData = tfPeriod === "3m" ? TF_DATA_3M : tfPeriod === "6m" ? TF_DATA_6M : TF_DATA_1AN;
  const tfMin  = Math.min(...tfData.map((d) => d.value));
  const tfMax  = Math.max(...tfData.map((d) => d.value));
  const tfDelta = tfData[tfData.length - 1].value - tfData[0].value;

  const you = COMPETITORS.find((c) => c.isYou)!;
  const score = 48;
  const color48 = scoreColor(score);

  return (
    <div className="flex flex-col gap-5">

        {/* Chiffres clés — composant DS KpiGroup/KpiCard (cohérence inter-pages) */}
        <KpiGroup columns={4}>
          {[
            { label: "Trust Flow",         val: "16",  bench: `conc. moy. ${COMP_AVG_TF}`,                         delta: 16 - Math.round(COMP_AVG_TF), icon: ArrowTrendingUpIcon },
            { label: "Domaines référents", val: "281", bench: `conc. moy. ${COMP_AVG_RD.toLocaleString("fr-FR")}`, delta: 281 - COMP_AVG_RD,            icon: LinkIcon },
            { label: "Position TF",        val: "3e",  bench: "conc. 1er",                                         delta: -2,                           icon: TrophyIcon },
            { label: "Ratio TF/CF",        val: "51%", bench: "conc. moy. 53%",                                    delta: -2, suffix: "pp",             icon: Squares2X2Icon },
          ].map((kpi) => (
            <KpiCard
              bare
              key={kpi.label}
              label={kpi.label}
              value={kpi.val}
              sub={kpi.bench}
              icon={kpi.icon}
              delta={`${kpi.delta > 0 ? "+" : ""}${kpi.delta}${kpi.suffix ?? ""}`}
            />
          ))}
        </KpiGroup>

        {/* ── HERO (résumé + note) ──────────────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] p-8">
          <div className="grid grid-cols-[2fr_1fr] items-center gap-8">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Pill color="var(--color-warning)" bg="var(--color-warning-bg)">Popularité · rapport Majestic</Pill>
                <span className="type-micro">il y a 3 jours</span>
              </div>
              <p className="type-title leading-relaxed">
                Profil de liens fragile face aux concurrents
              </p>
              <p className="type-body mt-0 max-w-xl leading-relaxed text-[var(--text-secondary)]">
                Le TF est 2× inférieur à la médiane concurrents et le nombre de domaines référents est limité. Le ratio TF/CF reste correct mais la masse globale manque.
              </p>
            </div>
            {/* Score ring */}
            <div className="flex flex-col items-center gap-3">
              <ScoreRing score={score} size={160} strokeWidth={7} color={color48} />
              <p className="type-label">Score popularité</p>
              <p className="type-caption">Grade <strong style={{ color: color48 }}>C</strong> · benchmark 10 sites</p>
            </div>
          </div>
        </div>

        {/* ── 01. BACKLINKS ─────────────────────────────────────────────── */}
        <AuditSection id="net-backlinks" icon={ArrowsRightLeftIcon} num="01." title="Backlinks" em="entrants"
            meta={`${BACKLINKS.length} liens · Mis à jour 04/05/2026`}>
          <div className="flex flex-col gap-5">

          <div className={`overflow-hidden ${CARD_SM}`}>
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
              <p className="type-caption">
                Liste des pages qui font un lien vers votre domaine
              </p>
              <span className="type-caption tabular-nums">
                1 – {BACKLINKS.length} / {BACKLINKS.length}
              </span>
            </div>
            <TableWide<BacklinkRow>
              hidePagination
              rowKey={(row) => `${row.domain}-${row.url}`}
              data={BACKLINKS}
              columns={[
                { key: "source", header: "Source", width: 240, flex: true,
                  render: (row) => (
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <img src={`https://www.google.com/s2/favicons?domain=${row.domain}&sz=32`} alt="" width={14} height={14}
                          className="h-3.5 w-3.5 flex-shrink-0 rounded-sm"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                        <span className="type-label truncate font-mono text-[var(--text-primary)]">{row.domain}</span>
                        <span className="type-micro flex-shrink-0 rounded bg-[var(--bg-subtle)] px-1 py-0.5 font-semibold">{row.country}</span>
                      </div>
                      <span className="type-caption truncate font-mono">{row.url}</span>
                    </div>
                  ) },
                { key: "tf", header: "TF", width: 56, align: "right", sortable: true, sortValue: (row) => row.tf,
                  render: (row) => <span className="type-label font-semibold tabular-nums text-[var(--text-primary)]">{row.tf}</span> },
                { key: "cf", header: "CF", width: 56, align: "right", sortable: true, sortValue: (row) => row.cf,
                  render: (row) => <span className="type-label tabular-nums">{row.cf}</span> },
                { key: "rd", header: "RefDom", width: 72, align: "right", sortable: true, sortValue: (row) => row.rd,
                  render: (row) => <span className="type-label tabular-nums">{row.rd.toLocaleString("fr-FR")}</span> },
                { key: "ancre", header: "Ancre", width: 200, flex: true,
                  render: (row) => <span className="type-label truncate font-mono" title={row.ancre}>{row.ancre}</span> },
                { key: "type", header: "Type", width: 80, align: "right",
                  render: (row) => <Pill color="var(--text-muted)" bg="var(--bg-subtle)">{row.type}</Pill> },
                { key: "statut", header: "Statut", width: 96, align: "right",
                  render: (row) => (
                    <Pill
                      color={row.statut === "Follow" ? "var(--color-success)" : row.statut === "Sponsored" ? "var(--color-warning)" : "var(--text-muted)"}
                      bg={row.statut === "Follow" ? "var(--color-success-bg)" : row.statut === "Sponsored" ? "var(--color-warning-bg)" : "var(--bg-subtle)"}>
                      {row.statut}
                    </Pill>
                  ) },
              ]}
            />
          </div>
          </div>
        </AuditSection>

        {/* ── 02. PROFIL DES LIENS ──────────────────────────────────────── */}
        <AuditSection id="net-liens" icon={LinkIcon} num="02." title="Profil" em="des liens" meta="Follow · Texte · Pays · Langue">
          <div className="flex flex-col gap-5">

          {/* Follow/Nofollow + Texte/Image horizontal bars */}
          <div className="grid grid-cols-2 gap-4">
            {/* Follow/Nofollow */}
            <div className="rounded-2xl border border-[var(--border-subtle)] px-6 py-5">
              <p className="mb-5 type-label font-semibold">Follow vs Nofollow</p>
              <div className="flex flex-col gap-5">
                {[
                  { label: "Vous",              follow: 70.9, nofollow: 29.1 },
                  { label: "Concurrents (moy.)", follow: 76,   nofollow: 24   },
                ].map((row) => (
                  <div key={row.label} className="flex flex-col gap-2">
                    <div className="type-caption flex items-center justify-between">
                      <span className="text-[var(--text-muted)]">{row.label}</span>
                      <span className="flex items-center gap-3 text-[var(--text-muted)]">
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[var(--accent-primary)]" />
                          Follow {row.follow}%
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[var(--text-muted)]" />
                          Nofollow {row.nofollow}%
                        </span>
                      </span>
                    </div>
                    <div className="flex h-3 overflow-hidden rounded-full">
                      <div style={{ width: `${row.follow}%`, backgroundColor: "var(--accent-primary)" }} />
                      <div style={{ width: `${row.nofollow}%`, backgroundColor: "var(--text-muted)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Texte/Image */}
            <div className="rounded-2xl border border-[var(--border-subtle)] px-6 py-5">
              <p className="mb-5 type-label font-semibold">Texte vs Image</p>
              <div className="flex flex-col gap-5">
                {[
                  { label: "Vous",              texte: 96.7, image: 3.3 },
                  { label: "Concurrents (moy.)", texte: 80,   image: 20  },
                ].map((row) => (
                  <div key={row.label} className="flex flex-col gap-2">
                    <div className="type-caption flex items-center justify-between">
                      <span className="text-[var(--text-muted)]">{row.label}</span>
                      <span className="flex items-center gap-3 text-[var(--text-muted)]">
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[var(--color-success)]" />
                          Texte {row.texte}%
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[var(--text-muted)]" />
                          Image {row.image}%
                        </span>
                      </span>
                    </div>
                    <div className="flex h-3 overflow-hidden rounded-full">
                      <div style={{ width: `${row.texte}%`, backgroundColor: "var(--color-success)" }} />
                      <div style={{ width: `${row.image}%`, backgroundColor: "var(--text-muted)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Country + Language distribution */}
          <div className="grid grid-cols-2 gap-4">
            {/* Pays */}
            <div className="rounded-2xl border border-[var(--border-subtle)] px-6 py-5">
              <p className="mb-4 type-label font-semibold">Distribution pays</p>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-card-static)]">
                    <th className="pb-2 text-left type-caption">Pays</th>
                    <th className="pb-2 text-right type-caption">Vous</th>
                    <th className="pb-2 text-right type-caption">Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {[
                    { pays: "France",   you: 45.2, delta: -13.2 },
                    { pays: "USA",      you: 18.7, delta: +6.4  },
                    { pays: "UK",       you: 9.1,  delta: +1.3  },
                    { pays: "Belgique", you: 6.8,  delta: -2.4  },
                    { pays: "Suisse",   you: 4.2,  delta: +0.1  },
                  ].map((row) => (
                    <tr key={row.pays} className="transition-colors hover:bg-[var(--bg-card-hover)]">
                      <td className="type-label py-2.5">{row.pays}</td>
                      <td className="type-label py-2.5 text-right font-semibold text-[var(--text-primary)]">{row.you}%</td>
                      <td className="py-2.5 text-right">
                        <span className={`type-caption rounded-full px-2 py-1 font-semibold ${row.delta < 0 ? "bg-[var(--color-danger-bg)] text-[var(--color-danger)]" : "bg-[var(--color-success-bg)] text-[var(--color-success)]"}`}>
                          {row.delta > 0 ? "+" : ""}{row.delta}pp
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Langue */}
            <div className="rounded-2xl border border-[var(--border-subtle)] px-6 py-5">
              <p className="mb-4 type-label font-semibold">Distribution langue</p>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-card-static)]">
                    <th className="pb-2 text-left type-caption">Langue</th>
                    <th className="pb-2 text-right type-caption">Vous</th>
                    <th className="pb-2 text-right type-caption">Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {[
                    { langue: "Français",  you: 72.4, delta: -8.8 },
                    { langue: "Anglais",   you: 19.3, delta: +7.9 },
                    { langue: "Espagnol",  you: 4.1,  delta: +0.9 },
                    { langue: "Allemand",  you: 2.1,  delta: -0.7 },
                  ].map((row) => (
                    <tr key={row.langue} className="transition-colors hover:bg-[var(--bg-card-hover)]">
                      <td className="type-label py-2.5">{row.langue}</td>
                      <td className="type-label py-2.5 text-right font-semibold text-[var(--text-primary)]">{row.you}%</td>
                      <td className="py-2.5 text-right">
                        <span className={`type-caption rounded-full px-2 py-1 font-semibold ${row.delta < 0 ? "bg-[var(--color-danger-bg)] text-[var(--color-danger)]" : "bg-[var(--color-success-bg)] text-[var(--color-success)]"}`}>
                          {row.delta > 0 ? "+" : ""}{row.delta}pp
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Callout variant="info">La sous-représentation française (45.2% vs 58.4% pour les concurrents) indique un profil de liens trop international pour un site ciblant le marché FR. Prioriser des partenariats avec des éditeurs .fr ou des médias spécialisés français.</Callout>
          </div>
        </AuditSection>

        {/* ── 03. DISTRIBUTION DES ANCRES ──────────────────────────────── */}
        <AuditSection id="net-ancres" icon={TagIcon} num="03." title="Distribution" em="des ancres"
            meta={`${TOP_ANCHORS.reduce((s, a) => s + a.n, 0)} ancres analysées · risque élevé`}>
          <div className="flex flex-col gap-5">

          <div className="grid grid-cols-[auto_1fr] gap-6 items-start">
            {/* Donut + risk */}
            <div className="rounded-2xl border border-[var(--border-subtle)] px-6 py-5 flex flex-col items-center gap-4 min-w-[220px]">
              <div className="flex w-full items-center justify-between">
                <p className="type-label font-semibold">Répartition</p>
                <span className="type-caption rounded-full bg-[var(--color-danger-bg)] px-3 py-1.5 font-semibold text-[var(--color-danger)]">
                  Risque élevé
                </span>
              </div>
              <DonutChart
                slices={ANCHOR_DONUT_SLICES}
                size={112}
                strokeWidth={7}
                center={
                  <div className="flex flex-col items-center">
                    <span className="type-h3 leading-none">{anchorTotal}</span>
                    <span className="type-micro">ancres</span>
                  </div>
                }
                formatTooltip={(s, pct) => (
                  <span className="type-caption text-white">{s.label} · <strong>{pct}%</strong> ({s.value})</span>
                )}
              />
              <div className="flex flex-col gap-1.5 self-stretch">
                {ANCHOR_SEGS.map((s) => (
                  <div key={s.label} className="type-caption flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                      {s.label}
                    </span>
                    <span className="font-semibold text-[var(--text-primary)]">{s.pct}%</span>
                  </div>
                ))}
              </div>
              <div className="flex w-full items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-hover)] px-3.5 py-2.5">
                <span className="type-caption">Score ancres</span>
                <span className="type-h3 text-[var(--color-danger)]">22<span className="type-caption font-medium text-[var(--text-muted)]">/100</span></span>
              </div>
            </div>

            {/* Top anchors table */}
            <div className="rounded-2xl border border-[var(--border-subtle)]">
              <p className="px-6 py-4 type-label font-semibold">Top ancres</p>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-card-static)]">
                    <th className="px-6 pb-3 text-left type-caption">Texte d'ancre</th>
                    <th className="pr-6 pb-3 text-right type-caption">Occurrences</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {TOP_ANCHORS.map((a) => (
                    <tr key={a.text} className="transition-colors hover:bg-[var(--bg-card-hover)]">
                      <td className="type-label px-6 py-3 font-mono">{a.text}</td>
                      <td className="type-label pr-6 py-3 text-right font-semibold tabular-nums text-[var(--text-primary)]">{a.n}</td>
                    </tr>
                  ))}
                  <tr className="bg-[var(--bg-secondary)]">
                    <td className="type-caption px-6 py-3 font-semibold">Total</td>
                    <td className="type-label pr-6 py-3 text-right font-semibold text-[var(--text-primary)]">
                      {TOP_ANCHORS.reduce((s, a) => s + a.n, 0)} ancres
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <Callout variant="warning">59% d'ancres de marque est élevé (idéal : 30–40%). Un sur-ancrage exact-match de marque peut diluer la valeur thématique transmise. Diversifier vers des ancres de type « agence marketing digital Paris » ou « formation SEO certifiée ».</Callout>
          </div>
        </AuditSection>

        {/* ── 04. TOPICAL TRUST FLOW ────────────────────────────────────── */}
        <AuditSection id="net-topical" icon={Squares2X2Icon} num="04." title="Topical" em="Trust Flow" meta="Thématiques identifiées par Majestic">
          <div className="flex flex-col gap-5">

          <div className="grid grid-cols-2 gap-4">
            {/* Vos thématiques */}
            <div className="rounded-2xl border border-[var(--border-subtle)] px-6 py-5">
              <p className="mb-4 type-label font-semibold">Vos thématiques</p>
              <div className="flex flex-wrap gap-2">
                {YOUR_TOPICS.map((t) => (
                  <span key={t.label}
                    className="type-label rounded-full px-3.5 py-1.5 font-medium text-white"
                    style={{ backgroundColor: t.color }}>
                    {t.label}
                  </span>
                ))}
              </div>
            </div>
            {/* Thématiques concurrents */}
            <div className="rounded-2xl border border-[var(--border-subtle)] px-6 py-5">
              <p className="mb-4 type-label font-semibold">Thématiques concurrents</p>
              <div className="flex flex-col gap-2.5">
                {COMP_TOPICS.map((t) => {
                  const isYours = YOUR_TOPICS.some((y) => y.label === t.label);
                  return (
                    <div key={t.label} className="flex items-center gap-3">
                      <span className={`type-caption w-28 flex-shrink-0 font-medium truncate ${isYours ? "text-[var(--accent-primary)]" : "text-[var(--text-secondary)]"}`}>
                        {t.label}
                      </span>
                      <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-card-hover)]">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${(t.count / t.max) * 100}%`, backgroundColor: isYours ? "var(--accent-primary)" : "var(--text-muted)" }} />
                      </div>
                      <span className="type-micro w-8 flex-shrink-0 text-right">{t.count}/{t.max}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <Callout variant="info">La thématique « Actualités Web » est présente chez 7/10 concurrents mais absente de votre profil. Des liens depuis des médias tech/marketing (BDM, FrenchWeb, JDN) renforceraient cette dimension et diversifieraient les sources thématiques.</Callout>
          </div>
        </AuditSection>

        {/* ── 05. ÉVOLUTION TRUST FLOW ──────────────────────────────────── */}
        <AuditSection id="net-evolution" icon={ArrowTrendingUpIcon} num="05." title="Évolution" em="Trust Flow" meta="Source Majestic · historique mensuel">
          <div className="flex flex-col gap-5">

          <div className="rounded-2xl border border-[var(--border-subtle)] px-6 py-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="type-caption flex items-center gap-4">
                <span>Min <strong className="text-[var(--text-primary)]">{tfMin}</strong></span>
                <span>Max <strong className="text-[var(--text-primary)]">{tfMax}</strong></span>
                <span className={`type-caption rounded-full px-2 py-1 font-semibold ${tfDelta < 0 ? "bg-[var(--color-danger-bg)] text-[var(--color-danger)]" : "bg-[var(--color-success-bg)] text-[var(--color-success)]"}`}>
                  Delta {tfDelta > 0 ? "+" : ""}{tfDelta} ({tfDelta > 0 ? "+" : ""}{Math.round(tfDelta / tfData[0].value * 100)}%)
                </span>
              </div>
              <FilterTabs
                tabs={[
                  { key: "3m",  label: "3 mois" },
                  { key: "6m",  label: "6 mois" },
                  { key: "1an", label: "1 an" },
                ]}
                value={tfPeriod}
                onChange={(k) => setTfPeriod(k as "3m" | "6m" | "1an")}
              />
            </div>
            <AreaChart
                data={tfData}
                formatTooltip={(p) => (
                  <div className="flex flex-col gap-0.5">
                    <span className="type-micro text-white/60">{p.label}</span>
                    <span className="type-label font-semibold text-white">TF {p.value}</span>
                  </div>
                )}
              />
          </div>
          </div>
        </AuditSection>

        {/* ── 06. BENCHMARK CONCURRENTS ─────────────────────────────────── */}
        <AuditSection id="net-benchmark" icon={TrophyIcon} num="06." title="Benchmark" em="concurrents"
            meta={`${COMPETITORS.length - 1} concurrents · source Majestic`}>
          <div className="flex flex-col gap-5">

          {/* Table */}
          <div className={`overflow-hidden ${CARD_SM}`}>
            <TableWide<Competitor>
              hidePagination
              rowKey={(c) => c.domain}
              data={COMPETITORS}
              isRowActive={(c) => !!c.isYou}
              columns={[
                { key: "domain", header: "Domaine", width: 220, flex: true,
                  render: (c) => (
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={`https://www.google.com/s2/favicons?domain=${c.domain}&sz=32`} alt="" width={16} height={16}
                        className="h-4 w-4 flex-shrink-0 rounded-sm"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                      <span className={`type-label truncate font-mono ${c.isYou ? "font-semibold text-[var(--accent-primary)]" : ""}`}>
                        {c.domain}{c.isYou ? " (vous)" : ""}
                      </span>
                    </div>
                  ) },
                { key: "tf", header: "TF", width: 60, align: "right", sortable: true, sortValue: (c) => c.tf,
                  render: (c) => <span className={`type-label font-semibold tabular-nums ${c.isYou ? "text-[var(--accent-primary)]" : "text-[var(--text-primary)]"}`}>{c.tf}</span> },
                { key: "cf", header: "CF", width: 60, align: "right", sortable: true, sortValue: (c) => c.cf,
                  render: (c) => <span className="type-label tabular-nums">{c.cf}</span> },
                { key: "rd", header: "RefDom", width: 80, align: "right", sortable: true, sortValue: (c) => c.refDomains,
                  render: (c) => <span className="type-label tabular-nums">{c.refDomains.toLocaleString("fr-FR")}</span> },
                { key: "bl", header: "Backlinks", width: 90, align: "right", sortable: true, sortValue: (c) => c.backlinks,
                  render: (c) => <span className="type-label tabular-nums">{c.backlinks.toLocaleString("fr-FR")}</span> },
                { key: "gaptf", header: "Gap TF", width: 80, align: "right",
                  render: (c) => c.isYou ? <span className="type-label text-[var(--text-muted)]">—</span> : <DeltaBadge value={c.tf - you.tf} /> },
                { key: "gaprd", header: "Gap RefDom", width: 96, align: "right",
                  render: (c) => c.isYou ? <span className="type-label text-[var(--text-muted)]">—</span> : <DeltaBadge value={c.refDomains - you.refDomains} /> },
              ]}
            />
          </div>

          {/* Radar with context */}
          <div className="rounded-2xl border border-[var(--border-subtle)] px-6 py-5">
            <p className="type-h3">Vue radar — 5 axes normalisés</p>
            <p className="type-caption mt-1 mb-5">
              Chaque axe est normalisé par rapport au maximum observé parmi les 11 sites. Plus la surface est grande, meilleur est le profil netlinking.
            </p>
            <div className="flex justify-center">
              <RadarChart />
            </div>
          </div>
          </div>
        </AuditSection>

        {/* ── 07. BENCHMARK VISIBILITÉ SEO ─────────────────────────────── */}
        <AuditSection id="net-visibilite" icon={EyeIcon} num="07." title="Benchmark" em="visibilité SEO"
            meta="Source SEObserver · snapshot 5 mai 2026">
          <div className="flex flex-col gap-5">

          <div className={`overflow-hidden ${CARD_SM}`}>
            <TableWide<VisRow>
              hidePagination
              rowKey={(row) => row.domain}
              data={VISIBILITY}
              isRowActive={(row) => !!row.isYou}
              columns={[
                { key: "domain", header: "Domaine", width: 200, flex: true,
                  render: (row) => (
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={`https://www.google.com/s2/favicons?domain=${row.domain}&sz=32`} alt="" width={16} height={16}
                        className="h-4 w-4 flex-shrink-0 rounded-sm"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                      <span className={`type-label truncate font-mono ${row.isYou ? "font-semibold text-[var(--accent-primary)]" : ""}`}>
                        {row.domain}{row.isYou ? " (vous)" : ""}
                      </span>
                    </div>
                  ) },
                { key: "vis", header: "Visibilité", width: 80, align: "right",
                  render: (row) => <span className={`type-label font-semibold tabular-nums ${row.isYou ? "text-[var(--accent-primary)]" : "text-[var(--text-primary)]"}`}>{row.vis}</span> },
                { key: "top3", header: "Top 3", width: 64, align: "right", sortable: true, sortValue: (row) => row.top3,
                  render: (row) => <span className="type-label tabular-nums">{row.top3}</span> },
                { key: "top10", header: "Top 10", width: 64, align: "right", sortable: true, sortValue: (row) => row.top10,
                  render: (row) => <span className="type-label tabular-nums">{row.top10}</span> },
                { key: "top50", header: "Top 50", width: 70, align: "right",
                  render: (row) => <span className="type-label tabular-nums">{row.top50.toLocaleString("fr-FR")}</span> },
                { key: "top100", header: "Top 100", width: 72, align: "right",
                  render: (row) => <span className="type-label tabular-nums">{row.top100.toLocaleString("fr-FR")}</span> },
                { key: "kws", header: "Mots-clés", width: 80, align: "right",
                  render: (row) => <span className="type-label tabular-nums">{row.kws}</span> },
                { key: "traffic", header: "Trafic est.", width: 84, align: "right",
                  render: (row) => <span className="type-label tabular-nums">{row.traffic}</span> },
                { key: "gap", header: "Gap", width: 80, align: "right",
                  render: (row) => (row.gap === "—" || row.gap === "0")
                    ? <span className="type-label text-[var(--text-muted)]">{row.gap}</span>
                    : <span className="type-label font-semibold tabular-nums text-[var(--color-success)]">{row.gap}</span> },
              ]}
            />
          </div>
          <p className="type-caption">
            Visibilité SEObserver = part de clics organiques estimée sur l'ensemble des mots-clés du marché. Trafic estimé en visiteurs/mois.
          </p>
          </div>
        </AuditSection>

    </div>
  );
}
