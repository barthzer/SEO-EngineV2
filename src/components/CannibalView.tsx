"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { FilterTabs } from "@/components/FilterTabs";
import { DonutChart } from "@/components/DonutChart";
import { AreaChart } from "@/components/AreaChart";
import { KpiCard } from "@/components/KpiCard";
import { KpiGroup } from "@/components/KpiGroup";
import { VariationPill } from "@/components/VariationPill";
import { TriangleAlert, FileText, MousePointerClick, Percent } from "lucide-react";
import { TableWide, type ColumnDef } from "@/components/TableWide";
import { DropdownMenu, DropdownItem, DropdownHeader } from "@/components/DropdownMenu";
import { useToast } from "@/context/ToastContext";
import { ColHeaderInfo, TruncatedText } from "@/components/analyse/RecommandationsView";
import { RiskBadge } from "@/components/RiskBadge";
import { useRiskGate } from "@/components/RiskConfirmModal";
import { isNewDecision } from "@/data/risk";
import {
  CANNIBAL_KWS, CANNIBAL_PAGES, CANNIBAL_HISTORY_BY_PERIOD, CANNIBAL_ACTIONS, ACTION_RISK, ACTION_UNDO, DECIDED_STATUSES,
  type CannibalSev, type CannibalStatus, type CannibalKw, type CannibalPage, type CannibalAction, type CannibalUrl,
} from "@/data/cannibal";


const CANNIBAL_SEV_CONFIG: Record<CannibalSev, { label: string; color: string; bg: string }> = {
  HIGH:   { label: "HIGH",   color: "var(--color-danger)", bg: "var(--color-danger-bg)"  },
  MEDIUM: { label: "MEDIUM", color: "var(--color-warning)", bg: "rgba(245,158,11,0.1)"  },
  LOW:    { label: "LOW",    color: "var(--color-success)", bg: "var(--color-success-bg)" },
};

const CANNIBAL_STATUS_ORDER: CannibalStatus[] = ["todo", "in_progress", "resolved", "ignored"];

const CANNIBAL_STATUS_CONFIG: Record<
  CannibalStatus,
  { label: string; color: string; bg: string; text: string }
> = {
  todo:        { label: "À traiter", color: "var(--color-warning)", bg: "var(--color-warning-bg)", text: "var(--color-warning)" },
  in_progress: { label: "En cours",  color: "#A855F7",              bg: "rgba(168,85,247,0.10)",   text: "#7E22CE"              },
  resolved:    { label: "Résolu",    color: "var(--color-success)", bg: "var(--color-success-bg)", text: "var(--color-success)" },
  ignored:     { label: "Ignoré",    color: "var(--text-muted)",    bg: "var(--bg-secondary)",     text: "var(--text-muted)"    },
};

/* ── Sub-components ───────────────────────────────────────────────────── */

function CannibalSevBadge({ sev }: { sev: CannibalSev }) {
  const c = CANNIBAL_SEV_CONFIG[sev];
  return (
    <span className="inline-flex rounded-full px-2 py-1 type-caption font-semibold"
      style={{ color: c.color, backgroundColor: c.bg }}>{c.label}</span>
  );
}

/** Action recommandée — dropdown DS ; les actions risquées sont signalées dans la liste. */
function CannibalActionDropdown({ value, onChange }: { value: CannibalAction; onChange: (next: CannibalAction) => void }) {
  return (
    <DropdownMenu
      width={240}
      trigger={
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] px-2.5 py-1 type-caption font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-card-hover)]"
        >
          {value}
          <ChevronDownIcon className="h-3 w-3 opacity-60" />
        </button>
      }
    >
      <DropdownHeader>Action recommandée</DropdownHeader>
      {CANNIBAL_ACTIONS.map((a) => (
        <DropdownItem key={a} onClick={() => onChange(a)} selected={value === a}>
          <span className="flex w-full items-center justify-between gap-3">
            {a}
            <RiskBadge level={ACTION_RISK[a]} tooltip={false} />
          </span>
        </DropdownItem>
      ))}
    </DropdownMenu>
  );
}

/** Statut de cannibalisation — pill éditable via dropdown DS. */
function CannibalStatusDropdown({ status, onChange }: { status: CannibalStatus; onChange: (next: CannibalStatus) => void }) {
  const cfg = CANNIBAL_STATUS_CONFIG[status];
  return (
    <DropdownMenu
      width={200}
      align="right"
      trigger={
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 type-caption font-semibold transition-opacity hover:opacity-80"
          style={{ color: cfg.text, backgroundColor: cfg.bg }}
        >
          <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: cfg.color }} />
          {cfg.label}
          <ChevronDownIcon className="h-3 w-3 opacity-60" />
        </button>
      }
    >
      <DropdownHeader>Statut de cannibalisation</DropdownHeader>
      {CANNIBAL_STATUS_ORDER.map((s) => {
        const c = CANNIBAL_STATUS_CONFIG[s];
        return (
          <DropdownItem key={s} onClick={() => onChange(s)} selected={status === s}>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 type-caption font-semibold"
              style={{ color: c.text, backgroundColor: c.bg }}
            >
              <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
              {c.label}
            </span>
          </DropdownItem>
        );
      })}
    </DropdownMenu>
  );
}

/** Détail d'un mot-clé cannibalisé (ligne dépliée) : tableau imbriqué TableWide,
 *  même style que le détail des Opportunités (lignes pleine taille, URL sticky). */
function ConflictUrlsDetail({ kw }: { kw: CannibalKw }) {
  const columns: ColumnDef<CannibalUrl>[] = [
    {
      key: "url", header: "URL", width: 260, flex: true, maxWidth: 420,
      render: (u) => (
        <span className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 flex-1">
            <TruncatedText text={u.url} className="font-mono text-[12px] text-[var(--text-primary)]" />
          </span>
          {u.url === kw.urls[0].url && (
            <span className="flex-shrink-0 rounded-full border border-[var(--border-subtle)] px-1.5 py-0.5 type-micro text-[var(--text-secondary)]">Principale</span>
          )}
        </span>
      ),
    },
    {
      key: "share", header: "Part des clics", width: 180, sortable: true, sortValue: (u) => u.clickShare,
      render: (u) => (
        <span className="flex items-center gap-2.5">
          <span className="h-1.5 flex-1 rounded-full bg-[var(--bg-card-hover)]">
            <span className="block h-full rounded-full bg-[var(--accent-primary)]" style={{ width: `${u.clickShare}%` }} />
          </span>
          <span className="w-9 shrink-0 type-label font-semibold tabular-nums text-[var(--text-primary)]">{u.clickShare}%</span>
        </span>
      ),
    },
    {
      key: "pos", width: 110, sortable: true, sortValue: (u) => u.avgPos,
      header: <ColHeaderInfo label="Pos. moy." tooltip={<div className="flex flex-col gap-1"><p className="font-semibold">Position moyenne</p><p className="opacity-75">Moyenne Search Console sur les 28 derniers jours.</p></div>} />,
      render: (u) => <span className="type-label tabular-nums text-[var(--text-primary)]">~{u.avgPos.toFixed(1)}</span>,
    },
    {
      key: "ctr", header: "CTR", width: 80,
      render: (u) => <span className="type-label tabular-nums text-[var(--text-secondary)]">{u.ctr}</span>,
    },
    {
      key: "clicks", header: "Clics", width: 90, sortable: true, sortValue: (u) => u.clicks,
      render: (u) => <span className="type-label tabular-nums text-[var(--text-primary)]">{u.clicks.toLocaleString("fr-FR")}</span>,
    },
    {
      key: "impressions", header: "Impressions", width: 110, sortable: true, sortValue: (u) => u.impressions,
      render: (u) => <span className="type-label tabular-nums text-[var(--text-secondary)]">{u.impressions.toLocaleString("fr-FR")}</span>,
    },
  ];
  return (
    <div className="py-3 pr-4" style={{ paddingLeft: "calc(var(--page-px) + 26px)" }}>
      <TableWide<CannibalUrl>
        columns={columns}
        data={kw.urls}
        rowKey={(u) => u.url}
        stickyLeft
        stickyHeader={false}
        bordered
        hidePagination
        edgePadding="16px"
        minWidth={900}
      />
    </div>
  );
}

/* ── Columns Pages (TableWide) ────────────────────────────────────────── */

const PAGES_COLUMNS: ColumnDef<CannibalPage>[] = [
  {
    key: "url",
    header: "Page URL",
    width: 320,
    flex: true,
    render: (p) => (
      <span className="block truncate type-caption font-mono text-[var(--text-secondary)]">{p.url}</span>
    ),
  },
  {
    key: "kwConflicts", header: "# KW en conflit", width: 140, align: "right",
    sortable: true, sortValue: (p) => p.kwConflicts,
    render: (p) => (
      <span className="type-label font-semibold tabular-nums text-[var(--text-primary)]">{p.kwConflicts}</span>
    ),
  },
  {
    key: "clicksAtRisk", header: "Clics à risque", width: 140, align: "right",
    sortable: true, sortValue: (p) => p.clicksAtRisk,
    render: (p) => (
      <VariationPill direction="down" className="justify-end">
        −{p.clicksAtRisk}
      </VariationPill>
    ),
  },
  {
    key: "maxSeverity",
    header: "Sévérité max",
    width: 130,
    render: (p) => <CannibalSevBadge sev={p.maxSeverity} />,
  },
];

/* ── Main view ────────────────────────────────────────────────────────── */

export function CannibalView() {
  const [view, setView] = useState<"keywords" | "pages">("keywords");
  const [histPeriod, setHistPeriod] = useState<"3m" | "6m" | "1an">("6m");
  const toast = useToast();
  /* Mots-clés éditables (action + statut) et lignes dépliées. */
  const [kws, setKws] = useState<CannibalKw[]>(CANNIBAL_KWS);
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set());
  const toggleOpen = (k: string) => setOpenKeys((prev) => {
    const next = new Set(prev);
    if (next.has(k)) next.delete(k); else next.add(k);
    return next;
  });
  /* Confirmation quand une action coûteuse ou irréversible devient « décidée ». */
  const { gate, modal: riskModal } = useRiskGate();
  const apply = (keyword: string, status: CannibalStatus, action: CannibalAction) =>
    setKws((prev) => prev.map((k) => (k.keyword === keyword ? { ...k, status, action } : k)));
  function change(kw: CannibalKw, status: CannibalStatus, action: CannibalAction) {
    const needsConfirm = isNewDecision(DECIDED_STATUSES, kw.status, status) || (DECIDED_STATUSES.has(status) && action !== kw.action);
    const [keep, ...others] = kw.urls;
    const other = others[0]?.url ?? "";
    const title = action === "Rediriger" ? `Rediriger ${other} vers ${keep.url}`
      : action === "Fusionner" ? `Fusionner ${other} dans ${keep.url}`
      : `${action} : « ${kw.keyword} »`;
    gate(
      {
        risk: { level: ACTION_RISK[action], undo: ACTION_UNDO[action], evidence: kw.evidence },
        title,
        items: others.map((u) => ({ label: u.url, meta: `${u.clicks} clics / mois` })),
      },
      needsConfirm,
      () => {
        apply(kw.keyword, status, action);
        if (needsConfirm && ACTION_RISK[action] !== "reversible") toast.show(action === "Fusionner" ? "Fusion marquée comme décidée" : "Redirection marquée comme décidée");
      },
    );
  }

  const kwColumns: ColumnDef<CannibalKw>[] = [
    {
      key: "keyword", header: "Mot-clé", width: 220, flex: true,
      render: (kw) => (
        <span className="flex min-w-0 items-center gap-2.5">
          <ChevronRightIcon className={`h-4 w-4 flex-shrink-0 text-[var(--text-muted)] transition-transform duration-200 ${openKeys.has(kw.keyword) ? "rotate-90" : ""}`} />
          <span className="min-w-0 flex-1">
            <TruncatedText text={kw.keyword} className="type-body-strong text-[var(--text-primary)]" />
          </span>
        </span>
      ),
    },
    { key: "severity", header: "Sévérité", width: 100, render: (kw) => <CannibalSevBadge sev={kw.severity} /> },
    {
      key: "urls", header: "URLs", width: 70, sortable: true, sortValue: (kw) => kw.urls.length,
      render: (kw) => <span className="type-label tabular-nums text-[var(--text-primary)]">{kw.urls.length}</span>,
    },
    {
      key: "clicks", header: "Clics", width: 80, sortable: true, sortValue: (kw) => kw.urls.reduce((t, u) => t + u.clicks, 0),
      render: (kw) => <span className="type-label tabular-nums text-[var(--text-primary)]">{kw.urls.reduce((t, u) => t + u.clicks, 0)}</span>,
    },
    {
      key: "lost", header: "Perte est.", width: 100,
      render: (kw) => kw.lostClicks !== null
        ? <VariationPill direction="down">−{Math.abs(kw.lostClicks)}</VariationPill>
        : <span className="type-label text-[var(--text-muted)]">Non mesurée</span>,
    },
    {
      key: "volume", header: "Volume", width: 90, sortable: true, sortValue: (kw) => kw.volume ?? -1,
      render: (kw) => <span className="type-label tabular-nums text-[var(--text-primary)]">{kw.volume !== null ? kw.volume.toLocaleString("fr-FR") : "Non mesuré"}</span>,
    },
    {
      key: "action", header: "Action", width: 130,
      render: (kw) => (
        <span className="inline-flex" onClick={(e) => e.stopPropagation()}>
          <CannibalActionDropdown value={kw.action} onChange={(a) => change(kw, kw.status, a)} />
        </span>
      ),
    },
    {
      key: "risk", header: "Risque", width: 120,
      render: (kw) => <RiskBadge level={ACTION_RISK[kw.action]} undo={ACTION_UNDO[kw.action]} />,
    },
    {
      key: "status", header: "Statut", width: 140,
      render: (kw) => (
        <span className="inline-flex" onClick={(e) => e.stopPropagation()}>
          <CannibalStatusDropdown status={kw.status} onChange={(st) => change(kw, st, kw.action)} />
        </span>
      ),
    },
  ];

  const medium = CANNIBAL_KWS.filter(k => k.severity === "MEDIUM").length;
  const low    = CANNIBAL_KWS.filter(k => k.severity === "LOW").length;
  const total  = CANNIBAL_KWS.length;

  const donutSlices = [
    { label: "Medium", value: medium, color: "var(--color-warning)" },
    { label: "Low",    value: low,    color: "var(--color-success)" },
  ].filter(s => s.value > 0);

  return (
    <div className="flex flex-col gap-5">


      {/* KPI cards */}
      <KpiGroup columns={4}>
        <KpiCard bare icon={TriangleAlert}     label="Keywords cannibalisés" value={String(total)}                  sub="/ 53 suivis" />
        <KpiCard bare icon={FileText}          label="Pages impactées"       value={String(CANNIBAL_PAGES.length)}  sub="URLs en conflit" />
        <KpiCard bare icon={MousePointerClick} label="Trafic à risque"       value="295"                            sub="clics / mois" />
        <KpiCard bare icon={Percent}           label="% cannibalisation"     value="7,5 %"                          sub="du trafic SEO" />
      </KpiGroup>

      {/* Charts row — 1/3 + 2/3, hauteur étendue */}
      <div className="grid grid-cols-3 gap-4">

        {/* Donut — répartition sévérité (1/3) */}
        <div className="col-span-1 flex flex-col rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
          <p className="mb-4 type-h3">Répartition par sévérité</p>
          <div className="flex flex-1 items-center justify-center gap-6">
            <DonutChart
              slices={donutSlices}
              size={160}
              strokeWidth={7}
              center={
                <div className="flex flex-col items-center">
                  <span className="type-display leading-none">{total}</span>
                  <span className="mt-1 type-micro">KW</span>
                </div>
              }
              formatTooltip={(s, pct) => (
                <div className="flex flex-col gap-0.5">
                  <span className="type-caption font-semibold text-white">{s.label}</span>
                  <span className="type-micro text-white/60"><span className="font-semibold text-white">{s.value}</span> kw — {pct}%</span>
                </div>
              )}
            />
            <div className="flex flex-col gap-3">
              {donutSlices.map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="type-label">{s.label}</span>
                  <span className="ml-auto type-label font-semibold tabular-nums text-[var(--text-primary)]">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Evolution chart (2/3) */}
        <div className="col-span-2 flex flex-col rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="type-h3">Évolution des cannibalisations</p>
            <FilterTabs
              tabs={[{ key: "3m", label: "3m" }, { key: "6m", label: "6m" }, { key: "1an", label: "1 an" }]}
              value={histPeriod}
              onChange={setHistPeriod}
            />
          </div>
          <div className="flex-1">
            <AreaChart data={CANNIBAL_HISTORY_BY_PERIOD[histPeriod]} height={220} gradientId="cannibal-evol-grad" />
          </div>
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
          <TableWide<CannibalKw>
            columns={kwColumns}
            data={kws}
            rowKey={(kw) => kw.keyword}
            onRowClick={(kw) => toggleOpen(kw.keyword)}
            isExpanded={(kw) => openKeys.has(kw.keyword)}
            renderExpanded={(kw) => <ConflictUrlsDetail kw={kw} />}
            emptyState="Aucune cannibalisation détectée."
            minWidth={1170}
            stickyLeft
            bordered
            hidePagination
          />
        )}

        {view === "pages" && (
          <TableWide<CannibalPage>
            columns={PAGES_COLUMNS}
            data={CANNIBAL_PAGES}
            rowKey={(p) => p.url}
            emptyState="Aucune page en conflit."
            minWidth={900}
            bordered
            edgePadding="24px"
          />
        )}
      </div>

      {riskModal}
    </div>
  );
}
