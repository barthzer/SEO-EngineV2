"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { FilterTabs } from "@/components/FilterTabs";
import { DonutChart } from "@/components/DonutChart";
import { AreaChart } from "@/components/AreaChart";
import { KpiCard } from "@/components/KpiCard";
import { SoftPanel } from "@/components/SoftPanel";
import { TriangleAlert, FileText, MousePointerClick, Percent } from "lucide-react";

/* ── Types ────────────────────────────────────────────────────────────── */

type CannibalSev = "HIGH" | "MEDIUM" | "LOW";

type CannibalUrl = {
  url: string; clickShare: number; avgPos: number;
  clicks: number; impressions: number; ctr: string;
};
type CannibalKw = {
  keyword: string; severity: CannibalSev; clicks: number; lostClicks: number | null;
  volume: number | null; action: string; status: "open" | "resolved" | "ignored";
  urls: CannibalUrl[];
};
type CannibalPage = {
  url: string; kwConflicts: number; clicksAtRisk: number; maxSeverity: CannibalSev;
};

/* ── Data ─────────────────────────────────────────────────────────────── */

const CANNIBAL_KWS: CannibalKw[] = [
  {
    keyword: "agence seo", severity: "MEDIUM", clicks: 151, lostClicks: -12, volume: 2100, action: "Garder", status: "open",
    urls: [
      { url: "aw-i.com/agence-seo/", clickShare: 78, avgPos: 3.2,  clicks: 118, impressions: 1325, ctr: "8.9%" },
      { url: "aw-i.com/",            clickShare: 22, avgPos: 7.1,  clicks: 33,  impressions: 890,  ctr: "3.7%" },
    ],
  },
  {
    keyword: "audit seo", severity: "MEDIUM", clicks: 84, lostClicks: -8, volume: 880, action: "Rediriger", status: "open",
    urls: [
      { url: "aw-i.com/audit-seo/", clickShare: 91, avgPos: 5.0,  clicks: 76, impressions: 980, ctr: "7.8%" },
      { url: "aw-i.com/services/",  clickShare: 9,  avgPos: 14.2, clicks: 8,  impressions: 310, ctr: "2.6%" },
    ],
  },
  {
    keyword: "formation seo", severity: "MEDIUM", clicks: 42, lostClicks: -5, volume: 1700, action: "Garder", status: "open",
    urls: [
      { url: "aw-i.com/formation/formation-seo/", clickShare: 88, avgPos: 4.8,  clicks: 37, impressions: 740, ctr: "5.0%" },
      { url: "aw-i.com/formation/",               clickShare: 12, avgPos: 11.3, clicks: 5,  impressions: 220, ctr: "2.3%" },
    ],
  },
  {
    keyword: "consultant seo", severity: "LOW", clicks: 18, lostClicks: -1, volume: 720, action: "Ignorer", status: "open",
    urls: [
      { url: "aw-i.com/consultant-seo/", clickShare: 83, avgPos: 9.1,  clicks: 15, impressions: 390, ctr: "3.8%" },
      { url: "aw-i.com/equipe/",         clickShare: 17, avgPos: 18.4, clicks: 3,  impressions: 179, ctr: "1.7%" },
    ],
  },
];

const CANNIBAL_PAGES: CannibalPage[] = [
  { url: "aw-i.com/",            kwConflicts: 2, clicksAtRisk: 41,  maxSeverity: "MEDIUM" },
  { url: "aw-i.com/agence-seo/", kwConflicts: 1, clicksAtRisk: 151, maxSeverity: "MEDIUM" },
  { url: "aw-i.com/services/",   kwConflicts: 1, clicksAtRisk: 8,   maxSeverity: "MEDIUM" },
  { url: "aw-i.com/equipe/",     kwConflicts: 1, clicksAtRisk: 3,   maxSeverity: "LOW"    },
];

const CANNIBAL_HISTORY_BY_PERIOD = {
  "3m": [
    { label: "Fév", value: 7 },
    { label: "Mar", value: 6 },
    { label: "Avr", value: 5 },
  ],
  "6m": [
    { label: "Nov", value: 8 },
    { label: "Déc", value: 7 },
    { label: "Jan", value: 9 },
    { label: "Fév", value: 7 },
    { label: "Mar", value: 6 },
    { label: "Avr", value: 5 },
  ],
  "1an": [
    { label: "Mai 25",  value: 12 },
    { label: "Juin 25", value: 11 },
    { label: "Juil 25", value: 10 },
    { label: "Août 25", value: 13 },
    { label: "Sept 25", value: 11 },
    { label: "Oct 25",  value: 10 },
    { label: "Nov 25",  value: 8  },
    { label: "Déc 25",  value: 7  },
    { label: "Jan 26",  value: 9  },
    { label: "Fév 26",  value: 7  },
    { label: "Mar 26",  value: 6  },
    { label: "Avr 26",  value: 5  },
  ],
};

const CANNIBAL_SEV_CONFIG: Record<CannibalSev, { label: string; color: string; bg: string }> = {
  HIGH:   { label: "HIGH",   color: "#E11D48", bg: "rgba(225,29,72,0.08)"  },
  MEDIUM: { label: "MEDIUM", color: "#F59E0B", bg: "rgba(245,158,11,0.1)"  },
  LOW:    { label: "LOW",    color: "#10B981", bg: "rgba(16,185,129,0.09)" },
};

/* ── Sub-components ───────────────────────────────────────────────────── */

function CannibalSevBadge({ sev }: { sev: CannibalSev }) {
  const c = CANNIBAL_SEV_CONFIG[sev];
  return (
    <span className="inline-flex rounded-full px-2 py-1 text-[12px] font-semibold"
      style={{ color: c.color, backgroundColor: c.bg }}>{c.label}</span>
  );
}

function CannibalActionSelect({ value }: { value: string }) {
  const opts = ["Garder", "Rediriger", "Fusionner", "Ignorer"];
  return (
    <div className="relative inline-flex">
      <select
        defaultValue={value}
        onClick={(e) => e.stopPropagation()}
        className="cursor-pointer appearance-none rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] py-1 pl-2.5 pr-6 text-[12px] font-medium text-[var(--text-secondary)] focus:outline-none"
      >
        {opts.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[var(--text-muted)]" />
    </div>
  );
}

function CannibalKwRow({ kw }: { kw: CannibalKw }) {
  const [open, setOpen] = useState(false);
  const totalClicks = kw.urls.reduce((s, u) => s + u.clicks, 0);

  return (
    <>
      <tr
        onClick={() => setOpen(v => !v)}
        className={`cursor-pointer border-b border-[var(--border-subtle)] last:border-0 transition-colors hover:bg-[var(--bg-card-hover)] ${open ? "bg-[var(--bg-card-hover)]" : ""}`}
      >
        <td className="px-6 py-3.5 align-middle">
          <div className="flex items-center gap-2">
            <ChevronDownIcon className={`h-3.5 w-3.5 flex-shrink-0 text-[var(--text-muted)] transition-transform ${open ? "rotate-180" : ""}`} />
            <span className="text-[13px] font-medium text-[var(--text-primary)]">{kw.keyword}</span>
          </div>
        </td>
        <td className="px-4 py-3.5 align-middle"><CannibalSevBadge sev={kw.severity} /></td>
        <td className="px-4 py-3.5 text-center align-middle">
          <span className="text-[13px] tabular-nums text-[var(--text-secondary)]">{kw.urls.length}</span>
        </td>
        <td className="px-4 py-3.5 text-right align-middle">
          <span className="text-[13px] tabular-nums font-medium text-[var(--text-primary)]">{totalClicks}</span>
        </td>
        <td className="px-4 py-3.5 text-right align-middle">
          <span className="text-[13px] tabular-nums text-[#E11D48]">
            {kw.lostClicks !== null ? kw.lostClicks : "—"}
          </span>
        </td>
        <td className="px-4 py-3.5 text-right align-middle">
          <span className="text-[13px] tabular-nums text-[var(--text-muted)]">
            {kw.volume !== null ? kw.volume.toLocaleString("fr-FR") : "—"}
          </span>
        </td>
        <td className="px-4 py-3.5 align-middle" onClick={e => e.stopPropagation()}>
          <CannibalActionSelect value={kw.action} />
        </td>
        <td className="pr-6 py-3.5 align-middle">
          <span className={`inline-flex rounded-full px-2 py-1 text-[12px] font-semibold ${
            kw.status === "resolved" ? "bg-[rgba(16,185,129,0.1)] text-[#10B981]" :
            kw.status === "ignored"  ? "bg-[var(--bg-secondary)] text-[var(--text-muted)]" :
            "bg-[rgba(245,158,11,0.1)] text-[#F59E0B]"}`}>
            {kw.status === "resolved" ? "Résolu" : kw.status === "ignored" ? "Ignoré" : "Ouvert"}
          </span>
        </td>
      </tr>

      {open && (
        <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          <td colSpan={8} className="px-6 py-3">
            <p className="mb-2 text-[11px] font-semibold text-[var(--text-muted)]">
              URLs en conflit · Positions = moyenne GSC 28j
            </p>
            <table className="w-full border-collapse">
              <colgroup>
                <col style={{ width: "30%" }} />
                <col style={{ width: "24%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "15%" }} />
              </colgroup>
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[10px] font-semibold text-[var(--text-muted)]">
                  <th className="pb-2 text-left font-semibold">URL</th>
                  <th className="px-3 pb-2 text-left font-semibold">Click share</th>
                  <th className="px-3 pb-2 text-right font-semibold">Pos. moy.</th>
                  <th className="px-3 pb-2 text-right font-semibold">CTR</th>
                  <th className="px-3 pb-2 text-right font-semibold">Clics</th>
                  <th className="pb-2 text-right font-semibold">Impressions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {kw.urls.map((u, i) => (
                  <tr key={i}>
                    <td className="py-2.5 pr-3">
                      <span className="block truncate font-mono text-[11px] text-[var(--text-secondary)]">{u.url}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-[var(--bg-card-hover)]">
                          <div className="h-full rounded-full bg-[#3E50F5]" style={{ width: `${u.clickShare}%` }} />
                        </div>
                        <span className="w-8 shrink-0 text-right text-[12px] font-semibold tabular-nums text-[var(--text-primary)]">{u.clickShare}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-[12px] tabular-nums text-[var(--text-secondary)]">~{u.avgPos.toFixed(1)}</span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-[12px] tabular-nums text-[var(--text-secondary)]">{u.ctr}</span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-[12px] tabular-nums text-[var(--text-secondary)]">{u.clicks.toLocaleString("fr-FR")}</span>
                    </td>
                    <td className="py-2.5 text-right">
                      <span className="text-[12px] tabular-nums text-[var(--text-muted)]">{u.impressions.toLocaleString("fr-FR")}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </>
  );
}

/* ── Main view ────────────────────────────────────────────────────────── */

export function CannibalView() {
  const [view, setView] = useState<"keywords" | "pages">("keywords");
  const [histPeriod, setHistPeriod] = useState<"3m" | "6m" | "1an">("6m");

  const medium = CANNIBAL_KWS.filter(k => k.severity === "MEDIUM").length;
  const low    = CANNIBAL_KWS.filter(k => k.severity === "LOW").length;
  const total  = CANNIBAL_KWS.length;

  const donutSlices = [
    { label: "Medium", value: medium, color: "#F59E0B" },
    { label: "Low",    value: low,    color: "#10B981" },
  ].filter(s => s.value > 0);

  return (
    <div className="flex flex-col gap-5">


      {/* KPI cards */}
      <SoftPanel>
        <div className="grid grid-cols-4 gap-3">
          <KpiCard icon={TriangleAlert}     label="Keywords cannibalisés" value={String(total)}                  sub="/ 53 suivis"     valueColor="#E11D48" />
          <KpiCard icon={FileText}          label="Pages impactées"       value={String(CANNIBAL_PAGES.length)}  sub="URLs en conflit"  valueColor="#F59E0B" />
          <KpiCard icon={MousePointerClick} label="Trafic à risque"       value="295"                            sub="clics / mois"    valueColor="#F59E0B" />
          <KpiCard icon={Percent}           label="% cannibalisation"     value="7.5%"                           sub="du trafic SEO" />
        </div>
      </SoftPanel>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4">

        {/* Donut — répartition sévérité */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
          <p className="mb-4 text-[16px] font-semibold tracking-subheading text-[var(--text-primary)]">Répartition par sévérité</p>
          <div className="flex items-center gap-8">
            <DonutChart
              slices={donutSlices}
              size={112}
              strokeWidth={9}
              center={
                <div className="flex flex-col items-center">
                  <span className="text-[22px] font-semibold leading-none text-[var(--text-primary)]">{total}</span>
                  <span className="mt-0.5 text-[10px] text-[var(--text-muted)]">KW</span>
                </div>
              }
              formatTooltip={(s, pct) => (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[12px] font-semibold text-white">{s.label}</span>
                  <span className="text-[11px] text-white/60"><span className="font-semibold text-white">{s.value}</span> kw — {pct}%</span>
                </div>
              )}
            />
            <div className="flex flex-col gap-2.5">
              {donutSlices.map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-[13px] text-[var(--text-secondary)]">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Evolution chart */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[16px] font-semibold tracking-subheading text-[var(--text-primary)]">Évolution des cannibalisations</p>
            <FilterTabs
              tabs={[{ key: "3m", label: "3m" }, { key: "6m", label: "6m" }, { key: "1an", label: "1 an" }]}
              value={histPeriod}
              onChange={setHistPeriod}
            />
          </div>
          <AreaChart data={CANNIBAL_HISTORY_BY_PERIOD[histPeriod]} color="#E11D48" height={64} gradientId="cannibal-evol-grad" />
        </div>
      </div>

      {/* Table — Keywords / Pages switch */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <FilterTabs
            tabs={[
              { key: "keywords", label: "Mots-clés", count: CANNIBAL_KWS.length },
              { key: "pages",    label: "Pages",      count: CANNIBAL_PAGES.length },
            ]}
            value={view}
            onChange={setView}
          />
        </div>

        {view === "keywords" && (
          <div className="bg-[var(--bg-card)]">
            <table className="w-full table-fixed border-collapse">
              <colgroup>
                <col style={{ width: "22%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
              </colgroup>
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[11px] font-semibold text-[var(--text-muted)]">
                  <th className="px-6 py-3 text-left font-semibold">Mot-clé</th>
                  <th className="px-4 py-3 text-left font-semibold">Sévérité</th>
                  <th className="px-4 py-3 text-center font-semibold">URLs</th>
                  <th className="px-4 py-3 text-right font-semibold">Clics</th>
                  <th className="px-4 py-3 text-right font-semibold">Perte est.</th>
                  <th className="px-4 py-3 text-right font-semibold">Volume</th>
                  <th className="px-4 py-3 text-left font-semibold">Action</th>
                  <th className="pr-6 py-3 text-left font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody>
                {CANNIBAL_KWS.map((kw, i) => <CannibalKwRow key={i} kw={kw} />)}
              </tbody>
            </table>
          </div>
        )}

        {view === "pages" && (
          <div className="bg-[var(--bg-card)]">
            <table className="w-full table-fixed border-collapse">
              <colgroup>
                <col style={{ width: "46%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "18%" }} />
              </colgroup>
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[11px] font-semibold text-[var(--text-muted)]">
                  <th className="px-6 py-3 text-left font-semibold">Page URL</th>
                  <th className="px-4 py-3 text-center font-semibold"># KW en conflit</th>
                  <th className="px-4 py-3 text-right font-semibold">Clics à risque</th>
                  <th className="pr-6 py-3 text-left font-semibold">Sévérité max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {CANNIBAL_PAGES.map((p, i) => (
                  <tr key={i} className="transition-colors hover:bg-[var(--bg-card-hover)]">
                    <td className="overflow-hidden px-6 py-3.5 align-middle">
                      <span className="block truncate font-mono text-[12px] text-[var(--text-secondary)]">{p.url}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center align-middle">
                      <span className="text-[13px] font-semibold text-[var(--text-primary)]">{p.kwConflicts}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right align-middle">
                      <span className="text-[13px] tabular-nums text-[#E11D48] font-medium">{p.clicksAtRisk}</span>
                    </td>
                    <td className="pr-6 py-3.5 align-middle">
                      <CannibalSevBadge sev={p.maxSeverity} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
