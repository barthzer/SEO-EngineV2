"use client";

import { useState } from "react";
import type { ElementType } from "react";
import {
  ChevronDownIcon, ChevronRightIcon, XMarkIcon,
  ChartBarIcon, TableCellsIcon,
  ShieldCheckIcon, ExclamationTriangleIcon, FlagIcon, ListBulletIcon, ArrowsRightLeftIcon,
} from "@heroicons/react/24/outline";
import { FilterTabs } from "@/components/FilterTabs";
import { StatusPillDropdown, type Status } from "@/components/StatusPill";
import { TableWide } from "@/components/TableWide";
import { Pill } from "@/components/Pill";
import { ScoreRing } from "@/components/ScoreRing";
import { AuditSection } from "@/components/AuditSection";
import { Callout } from "@/components/Callout";
import { DiagnosticCard } from "@/components/DiagnosticComplet";
import { KpiCard } from "@/components/KpiCard";
import { KpiGroup } from "@/components/KpiGroup";
import { SearchInput } from "@/components/SearchInput";
import { ResetFiltersButton } from "@/components/ResetFiltersButton";
import { ISSUES, LOTS, type Dimension, type Severity, type Issue } from "@/data/audit-editorial";

/* ── Config UI (présentation — la data est dans src/data/audit-editorial.ts) ── */

const TAG_KEYS = ["all","cat-jean","top-trafic","ymyl","formation","case-studies"];

/* ── Dimensions ───────────────────────────────────────────────────────── */

const DIMENSION_CONFIG: { key: Dimension; label: string; meta: string; icon: ElementType }[] = [
  { key: "eeat",   label: "E-E-A-T",          meta: "9 pages à risque · 2 issues",      icon: ShieldCheckIcon },
  { key: "soseo",  label: "SOSEO",             meta: "3 pages sous le top 3 · 4 issues",  icon: ChartBarIcon },
  { key: "suropt", label: "Sur-optimisation",  meta: "11 pages avec toxic_expr · 5 issues", icon: ExclamationTriangleIcon },
  { key: "intent", label: "Intent match",      meta: "2 pages mismatch · 1 issue",       icon: FlagIcon },
  { key: "hn",     label: "Structure Hn",      meta: "2 pages incomplètes · 1 issue",    icon: ListBulletIcon },
  { key: "canib",  label: "Cannibalisation",   meta: "2 requêtes en conflit · 1 issue",  icon: ArrowsRightLeftIcon },
];

const SEVERITY_CONFIG: Record<Severity, { label: string; color: string; bg: string }> = {
  critique:  { label: "Critique",  color: "var(--color-danger)",  bg: "var(--color-danger-bg)"  },
  important: { label: "Important", color: "var(--color-warning)", bg: "var(--color-warning-bg)" },
  moyen:     { label: "Moyen",     color: "var(--text-muted)",    bg: "var(--bg-subtle)"        },
};

/* ── Helpers ──────────────────────────────────────────────────────────── */

function scoreColor(n: number) {
  return n >= 70 ? "var(--color-success)" : n >= 50 ? "var(--color-warning)" : "var(--color-danger)";
}

/* Carte d'audit générique — contour, sans fond (convention DS). */
const CARD = "rounded-2xl border border-[var(--border-subtle)]";
const CARD_SM = "rounded-2xl border border-[var(--border-subtle)]";

/* ── Main ─────────────────────────────────────────────────────────────── */

export function AuditEditorialTab({ onSeeActions }: { domain: string; onSeeActions?: () => void }) {
  const [activeTag, setActiveTag]       = useState<string>("all");
  const [activeDim, setActiveDim]       = useState<Dimension | null>(null);
  const [issueSearch, setIssueSearch]   = useState("");
  const [issueStatuses, setIssueStatuses] = useState<Record<string, Status>>({});

  const GLOBAL = LOTS.all;       // note + score toujours globaux (indépendants du lot)
  const lot = LOTS[activeTag];   // le lot ne filtre QUE la liste d'issues ci-dessous

  const issueQuery = issueSearch.trim().toLowerCase();
  const visibleIssues = ISSUES.filter((iss) => {
    const inLot = lot.issues.includes(iss.id);
    const inDim = !activeDim || iss.dimension === activeDim;
    const inSearch = !issueQuery || `${iss.label} ${iss.description}`.toLowerCase().includes(issueQuery);
    return inLot && inDim && inSearch;
  });

  const hasIssueFilters = activeTag !== "all" || activeDim !== null || issueSearch.trim() !== "";
  function resetIssueFilters() {
    setActiveTag("all");
    setActiveDim(null);
    setIssueSearch("");
  }

  const countBySeverity = (sev: Severity) => visibleIssues.filter((i) => i.severity === sev).length;
  const getStatus = (id: string): Status => issueStatuses[id] ?? "todo";
  const setStatus = (id: string, s: Status) =>
    setIssueStatuses((prev) => ({ ...prev, [id]: s }));

  const globalScoreColor = scoreColor(GLOBAL.score);
  const globalCrit = ISSUES.filter((i) => i.severity === "critique").length;
  const globalImp  = ISSUES.filter((i) => i.severity === "important").length;

  return (
    <div className="flex flex-col gap-5">

      {/* Chiffres clés — composant DS KpiGroup/KpiCard (cohérence inter-pages) */}
      <KpiGroup columns={4}>
        {[
          { label: "Pages analysées",  val: `${GLOBAL.count}`,   bench: "/ 133 crawlées",                                    icon: ListBulletIcon },
          { label: "Issues détectées", val: `${ISSUES.length}`,  bench: `${globalCrit} critiques · ${globalImp} importantes`, icon: ExclamationTriangleIcon },
          { label: "Visites à risque", val: GLOBAL.visitsAtRisk, bench: "périmètre éditorial complet",                       icon: FlagIcon },
          { label: "Snapshot GSC",     val: "27/04",             bench: "246 clics/mois",                                    icon: ChartBarIcon },
        ].map((kpi) => (
          <KpiCard bare key={kpi.label} label={kpi.label} value={kpi.val} sub={kpi.bench} icon={kpi.icon} />
        ))}
      </KpiGroup>

      {/* ── HERO (résumé + note) ────────────────────────────────────── */}
      <div id="edi-synthese" className={`${CARD} p-8`}>
        <div className="grid grid-cols-[2fr_1fr] items-center gap-8">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Pill color="var(--color-success)" bg="var(--color-success-bg)">GSC connecté</Pill>
              <Pill color="var(--accent-primary)" bg="var(--accent-primary-soft)">
                {GLOBAL.count} pages éditoriales · {GLOBAL.pct}% du site
              </Pill>
              <span className="type-micro">il y a 3 jours</span>
            </div>
            <p className="type-title leading-relaxed">
              {GLOBAL.headlineEm} {GLOBAL.headlineTail.replace("\n", " ")}
            </p>
            <p className="type-body mt-0 max-w-xl leading-relaxed text-[var(--text-secondary)]">{GLOBAL.sub}</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <ScoreRing score={GLOBAL.score} size={160} strokeWidth={7} />
            <p className="type-label">Score sémantique</p>
            <p className="type-caption">
              Grade <strong style={{ color: globalScoreColor }}>{GLOBAL.grade}</strong> · pondéré par trafic
            </p>
          </div>
        </div>
      </div>

      {/* Verdict cards — contour */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { color: "var(--color-danger)",   label: "Bloquant",    text: GLOBAL.verdictBlocker },
          { color: "var(--accent-primary)", label: "Opportunité", text: GLOBAL.verdictOpp },
          { color: "var(--color-success)",  label: "Couverture",  text: GLOBAL.verdictCov },
        ].map((v) => (
          <div key={v.label} className={`${CARD_SM} px-5 pt-5 pb-6`}>
            <div className="mb-3 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: v.color }} />
              <p className="type-label font-semibold" style={{ color: v.color }}>{v.label}</p>
            </div>
            <p className="type-body leading-snug text-[var(--text-secondary)]">{v.text}</p>
          </div>
        ))}
      </div>

      {/* ── DIAGNOSTIC COMPLET : 6 encarts (score global) + liste filtrable par lot ── */}
      <AuditSection id="edi-diagnostic"
        icon={ChartBarIcon} title="Diagnostic" em="complet"
        meta={`${DIMENSION_CONFIG.length} dimensions · ${ISSUES.length} issues · liste filtrable par lot`}
      >

        {/* 6 encarts de dimension — même carte que l'onglet Technique (composant DS partagé
            DiagnosticCard) ; cliquer filtre la liste d'issues ci-dessous */}
        <div className="mb-5 grid grid-cols-6 gap-3">
          {DIMENSION_CONFIG.map((dim) => {
            const isActive = activeDim === dim.key;
            return (
              <DiagnosticCard
                key={dim.key}
                label={dim.label}
                score={GLOBAL.dims[dim.key]}
                icon={dim.icon}
                active={isActive}
                onClick={() => setActiveDim(isActive ? null : dim.key)}
              />
            );
          })}
        </div>

        {/* Filtrer la liste par lot — n'affecte QUE les issues ci-dessous, jamais le score global */}
        <div id="edi-tags" className={`mb-4 ${CARD} p-4`}>
          <div className="mb-3 flex items-center justify-between">
            <p className="type-title">Filtrer la liste par lot</p>
            <p className="type-caption">
              Lots définis dans <span className="text-[var(--text-secondary)]">Recommandation de page</span> · synchronisés il y a 2 jours
            </p>
          </div>
          <FilterTabs
            tabs={TAG_KEYS.map(key => ({ key, label: LOTS[key].label, count: LOTS[key].count }))}
            value={activeTag}
            onChange={(key) => { setActiveTag(key as string); }}
          />
        </div>

        <Callout variant="error" className="mb-5">
          <strong>~{lot.visitsAtRisk} visites/mois à risque</strong>{" "}
          sur le périmètre {lot.label}{activeDim ? ` · filtre dimension actif` : ""}.
          {countBySeverity("critique") > 0 && ` Les ${countBySeverity("critique")} issues critiques concernent les pages les plus stratégiques.`}
        </Callout>

        {/* Active dimension filter banner */}
        {activeDim && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-[var(--accent-primary-mid)] bg-[var(--accent-primary-soft)] px-5 py-3">
            <p className="type-body text-[var(--text-secondary)]">
              Filtre actif sur la dimension <strong className="text-[var(--accent-primary)]">{DIMENSION_CONFIG.find((d) => d.key === activeDim)?.label}</strong> · {visibleIssues.length} issue(s) affichée(s)
            </p>
            <button onClick={() => setActiveDim(null)}
              className="type-caption flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] cursor-pointer">
              <XMarkIcon className="h-3.5 w-3.5" />
              Effacer
            </button>
          </div>
        )}

        {/* En-tête liste — compteur + toolbar filtres DS (SearchInput + reset) + lien module Actions */}
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <div className="flex items-baseline gap-2">
            <h3 className="type-title">Issues détectées</h3>
            <span className="rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 text-[12px] font-medium tabular-nums text-[var(--text-secondary)]">{visibleIssues.length}</span>
          </div>
          <SearchInput
            value={issueSearch}
            onChange={setIssueSearch}
            placeholder="Rechercher une issue…"
            alwaysExpanded
          />
          <ResetFiltersButton show={hasIssueFilters} onReset={resetIssueFilters} />
          <button
            type="button"
            onClick={onSeeActions}
            className="type-label ml-auto inline-flex items-center gap-1 transition-colors hover:text-[var(--text-primary)]"
          >
            voir dans les actions
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>

        {(() => {
          const sevRank: Record<Severity, number> = { critique: 0, important: 1, moyen: 2 };
          const rows = [...visibleIssues].sort((a, b) => sevRank[a.severity] - sevRank[b.severity]);
          const dimLabel = (d: Dimension) => DIMENSION_CONFIG.find((x) => x.key === d)?.label ?? d;
          return (
            <div className={`overflow-hidden ${CARD_SM}`}>
              <TableWide<Issue>
                hidePagination
                rowKey={(i) => i.id}
                data={rows}
                emptyState={<div className="type-body px-7 py-10 text-center text-[var(--text-muted)]">Aucune issue pour ce périmètre.</div>}
                columns={[
                  { key: "label", header: "Nom", width: 300, flex: true,
                    render: (i) => <span className="type-body-strong block truncate" title={i.description}>{i.label}</span> },
                  { key: "dimension", header: "Dimension", width: 150,
                    render: (i) => <span className="type-caption inline-flex items-center rounded-full bg-[var(--bg-subtle)] px-2 py-1 font-medium text-[var(--text-primary)]">{dimLabel(i.dimension)}</span> },
                  { key: "severity", header: "Sévérité", width: 120, sortable: true, sortValue: (i) => sevRank[i.severity],
                    render: (i) => { const c = SEVERITY_CONFIG[i.severity]; return <Pill color={c.color} bg={c.bg}>{c.label}</Pill>; } },
                  { key: "pages", header: "Pages", width: 72, align: "right", sortable: true, sortValue: (i) => i.pages,
                    render: (i) => <span className="type-label tabular-nums">{i.pages}</span> },
                  { key: "visits", header: "Visites", width: 90, align: "right",
                    render: (i) => <span className="type-label font-medium tabular-nums" style={{ color: i.visits ? SEVERITY_CONFIG[i.severity].color : "var(--text-muted)" }}>{i.visits ?? "—"}</span> },
                  { key: "status", header: "Statut", width: 160,
                    render: (i) => <span className="inline-flex" onClick={(e) => e.stopPropagation()}><StatusPillDropdown status={getStatus(i.id)} onChange={(s) => setStatus(i.id, s)} /></span> },
                ]}
              />
            </div>
          );
        })()}

        {/* Detector note */}
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-dashed border-[var(--border-subtle)] px-5 py-4">
          <span className="text-[16px] text-[var(--color-warning)]">⚠</span>
          <p className="type-body-sm">
            <strong className="text-[var(--color-warning)]">3 détecteurs n'ont pas pu tourner</strong> — certaines données sont manquantes pour{" "}
            <span className="type-caption font-mono">detector_freshness</span>,{" "}
            <span className="type-caption font-mono">knowledge_graph_match</span> et{" "}
            <span className="type-caption font-mono">brand_mentions</span>. Reconnecter les sources pour activer ces analyses.
          </p>
        </div>
      </AuditSection>

      {/* ── DONNÉES BRUTES ──────────────────────────────────────────── */}
      <AuditSection id="edi-donnees" icon={TableCellsIcon} title="Données" em="brutes" meta="Pour aller plus loin">

        <div className={`overflow-hidden ${CARD_SM}`}>
          {[
            {
              id: "perimetre", title: "Couverture du périmètre éditorial", sub: `${GLOBAL.count} / 133 pages`,
              body: `${GLOBAL.count} pages importées dans Recommandation de page sont analysées sur les 133 du site. Les autres pages restent suivies en santé technique mais ne reçoivent pas d'analyse éditoriale (E-E-A-T, SOSEO, intent). Pour étendre le périmètre, importer plus de pages dans Recommandation de page.`,
            },
            {
              id: "detectors", title: "Détecteurs et statut", sub: "11 actifs / 14 disponibles",
              body: "11 détecteurs ont tourné sur ce périmètre. 3 inactifs : detector_freshness (date manquante), knowledge_graph_match (pas de schema Organization), brand_mentions (Ahrefs non connecté).",
            },
            {
              id: "tags-detail", title: "Lots éditoriaux", sub: "5 lots définis",
              body: "Catégorie Jean (3) · Top trafic (5) · YMYL (2) · Formation & services (4) · Case studies (3). Les lots sont définis dans l'onglet Recommandation de page et synchronisés à chaque audit.",
            },
            {
              id: "snapshot", title: "Snapshot GSC", sub: "27 avril 2026",
              body: `Données GSC utilisées pour pondérer les visites à risque : 246 clics/mois, 214.1k impressions sur le périmètre du site complet. Sur les ${GLOBAL.count} pages éditoriales analysées : 1 588 clics/mois cumulés, 343k impressions cumulées.`,
            },
          ].map((acc) => (
            <SimpleAccordion key={acc.id} title={acc.title} sub={acc.sub} body={acc.body} />
          ))}
        </div>

        <p className="type-micro mt-3">
          Dernière analyse éditoriale : 27 avril 2026 · prochaine analyse : 30 avril 2026
        </p>
      </AuditSection>

    </div>
  );
}

function SimpleAccordion({ title, sub, body }: { title: string; sub: string; body: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[var(--border-subtle)] last:border-0">
      <button onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-4 text-left cursor-pointer">
        <div>
          <p className="type-title">{title}</p>
          <p className="type-caption mt-0.5">{sub}</p>
        </div>
        <ChevronDownIcon className="h-4 w-4 flex-shrink-0 text-[var(--text-muted)] transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      {open && (
        <div className="type-body px-6 pb-4 leading-relaxed text-[var(--text-secondary)]">
          {body}
        </div>
      )}
    </div>
  );
}
