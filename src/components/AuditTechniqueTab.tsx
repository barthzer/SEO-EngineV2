"use client";

import { useState } from "react";
import {
  ChevronDownIcon, CheckCircleIcon,
  MagnifyingGlassIcon, BoltIcon, LinkIcon, ServerIcon,
  ExclamationTriangleIcon, ChartBarIcon, TableCellsIcon,
} from "@heroicons/react/24/outline";
import { Tooltip } from "@/components/Tooltip";
import { StatusPillDropdown, STATUS_CONFIG, type Status } from "@/components/StatusPill";
import { AuditActionsTable } from "@/components/analyse/AuditActionsTable";
import { RiskBadge } from "@/components/RiskBadge";
import { useRiskGate } from "@/components/RiskConfirmModal";
import { isNewDecision } from "@/data/risk";
import { useToast } from "@/context/ToastContext";
import { Pill } from "@/components/Pill";
import { ScoreRing } from "@/components/ScoreRing";
import { ScoreArc } from "@/components/ScoreArc";
import { DonutChart } from "@/components/DonutChart";
import { AuditSection } from "@/components/AuditSection";
import { Callout } from "@/components/Callout";
import { TableWide } from "@/components/TableWide";
import { DiagnosticComplet } from "@/components/DiagnosticComplet";
import { KpiCard } from "@/components/KpiCard";
import { KpiGroup } from "@/components/KpiGroup";
import { SearchInput } from "@/components/SearchInput";
import { ColPill } from "@/components/ColPill";
import { ResetFiltersButton } from "@/components/ResetFiltersButton";
import { DropdownItem, DropdownHeader } from "@/components/DropdownMenu";
import {
  URGENT_ISSUES, PRIORITY_ACTIONS, SCHEMA_ITEMS, CRAWLERS, PILOT_DATA,
  PAGESPEED_DATA, CATEGORY_SCORES, CRAWL_CHARTS, EXTRA_ACCORDIONS,
} from "@/data/audit-technique";

/* ── Types ────────────────────────────────────────────────────────────── */


/* Statuts et impacts filtrables sur le registre de pilotage (toolbar DS). */
const PILOT_STATUS_FILTERS: Status[] = ["todo", "in_progress", "done"];
const PILOT_IMPACT_ORDER = ["très-fort", "fort", "moyen", "faible", "très-faible"];
const fmtImpact = (v: string) => v.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());


/* ── Helpers ──────────────────────────────────────────────────────────── */

function scoreColor(n: number) {
  return n >= 70 ? "var(--color-success)" : n >= 50 ? "var(--color-warning)" : "var(--color-danger)";
}

function impactColor(impact: string) {
  if (impact.includes("fort")) return "var(--color-danger)";
  if (impact === "moyen") return "var(--color-warning)";
  return "var(--text-muted)";
}

/** Mapping état d'un schema → libellé + tokens couleur DS */
const SCHEMA_CFG: Record<"ok" | "missing" | "suggest", { label: string; color: string; bg: string }> = {
  ok:      { label: "Détecté",    color: "var(--color-success)", bg: "var(--color-success-bg)" },
  missing: { label: "Critique",   color: "var(--color-danger)",  bg: "var(--color-danger-bg)" },
  suggest: { label: "Recommandé", color: "var(--color-warning)", bg: "var(--color-warning-bg)" },
};

/** Libellé court d'un lien/contexte pour la pastille (adresse complète en tooltip). */
function shortLink(u: string): string {
  const head = u.split(" · ")[0].split(" → ")[0].trim();
  return head.length > 34 ? head.slice(0, 33) + "…" : head;
}

type ExtraRow = { url: string; target: string; type: string; note: string };

/* ── Micro components ─────────────────────────────────────────────────── */

function InfoIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
      <circle cx={7} cy={7} r={6} stroke="currentColor" strokeWidth={1.2} />
      <rect x={6.3} y={5.8} width={1.4} height={4.6} rx={0.7} fill="currentColor" />
      <circle cx={7} cy={3.6} r={0.8} fill="currentColor" />
    </svg>
  );
}

/* Carte d'audit générique — contour, sans fond (convention DS). */
const CARD = "rounded-2xl border border-[var(--border-subtle)]";
const CARD_SM = "rounded-2xl border border-[var(--border-subtle)]";

/* ── Main component ───────────────────────────────────────────────────── */

export function AuditTechniqueTab({ domain, onSeeActions }: { domain: string; onSeeActions?: () => void }) {
  const [urgentStatus,  setUrgentStatus]  = useState<Record<string, Status>>({});
  const [schemaStatus,  setSchemaStatus]  = useState<Record<string, Status>>({});
  const [pilotStatus,   setPilotStatus]   = useState<Record<number, Status>>(
    Object.fromEntries(PILOT_DATA.map((p) => [p.id, p.defaultStatus]))
  );
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({});

  // Registre de pilotage — filtres DS (SearchInput + ColPill multi-select + reset).
  const [pilotSearch, setPilotSearch] = useState("");
  const [pilotStatusFilter, setPilotStatusFilter] = useState<Set<Status>>(new Set());
  const [pilotImpactFilter, setPilotImpactFilter] = useState<Set<string>>(new Set());

  const getU = (id: string): Status => urgentStatus[id] ?? "todo";
  /* Correction coûteuse ou irréversible : confirmation quand elle passe En cours ou Livré. */
  const { gate, modal: riskModal } = useRiskGate();
  const toast = useToast();
  const DECIDED = new Set<Status>(["in_progress", "done"]);
  function decide(from: Status, to: Status, content: Parameters<typeof gate>[0], apply: () => void) {
    const needsConfirm = isNewDecision(DECIDED, from, to);
    gate(content, needsConfirm, () => {
      apply();
      if (needsConfirm && content.risk && content.risk.level !== "reversible") toast.show("Correction marquée comme décidée");
    });
  }
  const getP = (id: number): Status => pilotStatus[id];

  const pilotCounts = {
    todo:        PILOT_DATA.filter((p) => getP(p.id) === "todo").length,
    in_progress: PILOT_DATA.filter((p) => getP(p.id) === "in_progress").length,
    done:        PILOT_DATA.filter((p) => getP(p.id) === "done").length,
  };
  const pilotPct = Math.round((pilotCounts.done / PILOT_DATA.length) * 100);

  const visiblePilot = PILOT_DATA.filter((p) => {
    if (pilotStatusFilter.size > 0 && !pilotStatusFilter.has(getP(p.id))) return false;
    if (pilotImpactFilter.size > 0 && !pilotImpactFilter.has(p.impact)) return false;
    const q = pilotSearch.trim().toLowerCase();
    if (q && !p.label.toLowerCase().includes(q)) return false;
    return true;
  });

  const hasPilotFilters =
    pilotSearch.trim() !== "" || pilotStatusFilter.size > 0 || pilotImpactFilter.size > 0;

  function resetPilotFilters() {
    setPilotSearch("");
    setPilotStatusFilter(new Set());
    setPilotImpactFilter(new Set());
  }

  function togglePilotStatus(s: Status) {
    setPilotStatusFilter((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s); else next.add(s);
      return next;
    });
  }

  function togglePilotImpact(v: string) {
    setPilotImpactFilter((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v); else next.add(v);
      return next;
    });
  }

  const pilotStatusLabel =
    pilotStatusFilter.size === 0
      ? "Statut"
      : pilotStatusFilter.size === 1
        ? STATUS_CONFIG[Array.from(pilotStatusFilter)[0]].label
        : `Statut · ${pilotStatusFilter.size}`;
  const pilotImpactLabel =
    pilotImpactFilter.size === 0
      ? "Impact"
      : pilotImpactFilter.size === 1
        ? fmtImpact(Array.from(pilotImpactFilter)[0])
        : `Impact · ${pilotImpactFilter.size}`;

  const toggleAccordion = (id: string) =>
    setOpenAccordions((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="flex flex-col gap-5">

      {/* Chiffres clés — composant DS KpiGroup/KpiCard (cohérence inter-pages) */}
      <KpiGroup columns={4}>
        {[
          { label: "Pages crawlées",   val: "133",   bench: "profondeur moyenne 1.5",     icon: ServerIcon },
          { label: "Couverture GSC",   val: "89%",   bench: "118 / 133 avec impressions", icon: MagnifyingGlassIcon },
          { label: "Impressions/mois", val: "246K",  bench: "214.1K sur le périmètre",    icon: ChartBarIcon },
          { label: "Temps de réponse", val: "0.16s", bench: "96% des pages < 0.5s",       icon: BoltIcon },
        ].map((kpi) => (
          <KpiCard bare key={kpi.label} label={kpi.label} value={kpi.val} sub={kpi.bench} icon={kpi.icon} />
        ))}
      </KpiGroup>

      {/* ── HERO (résumé + note) ────────────────────────────────────── */}
      <div className={`${CARD} p-8`}>
        <div className="grid grid-cols-[2fr_1fr] gap-8 items-center">
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2">
              <Pill color="var(--color-success)" bg="var(--color-success-bg)">Audit terminé</Pill>
              <span className="type-micro">il y a 3 jours</span>
            </div>
            <p className="type-title leading-relaxed">
              Site sain mais ~99 visites/mois menacées par 5 urgences techniques.
            </p>
            <p className="type-body mt-0 max-w-xl leading-relaxed text-[var(--text-secondary)]">
              Score 84/100, performance solide (0.16s moyen), excellente indexation. Mais{" "}
              67% des pages ont des problèmes on-page critiques{" "}
              qui dégradent le CTR sur 246K impressions/mois. Trois urgences exigent une intervention dans les 7 jours.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <ScoreRing score={84} size={160} strokeWidth={7} />
            <p className="type-label">Score technique</p>
            <p className="type-caption flex items-center gap-1">
              Grade <strong style={{ color: "var(--color-success)" }}>B</strong> · médiane secteur 72
              <Tooltip
                portal
                rich
                side="left"
                label="Médiane des scores techniques relevés sur un échantillon de sites du même secteur (agences marketing / SEO). Un score au-dessus de 72 place le site dans le haut du panier."
              >
                <span className="cursor-help text-[var(--text-muted)] opacity-40 transition-opacity hover:opacity-100">
                  <InfoIcon />
                </span>
              </Tooltip>
            </p>
          </div>
        </div>
      </div>

      {/* Verdict cards — contour, accent par dot + label */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { key: "blocker",     color: "var(--color-danger)", label: "Bloquant",     text: "67% des pages (88/133) ont des problèmes de titres ou méta — les snippets Google sont tronqués, le CTR est en baisse sur 246K impressions/mois." },
          { key: "opportunity", color: "var(--accent-primary)", label: "Opportunité",  text: "Corriger les 45 titres mal dimensionnés — ratio impact/effort optimal car 88% des pages crawlées ont des impressions GSC." },
          { key: "crawl",       color: "var(--color-success)", label: "Budget Crawl", text: "Profondeur idéale (1.5), 0 erreur HTTP, 1 seule orpheline, sitemap correct. Le budget crawl est optimisé sur ce site de 133 pages." },
        ].map((v) => (
          <div key={v.key} className={`${CARD_SM} px-5 pt-5 pb-6`}>
            <div className="mb-3 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: v.color }} />
              <p className="type-label font-semibold" style={{ color: v.color }}>{v.label}</p>
            </div>
            <p className="type-body leading-snug text-[var(--text-secondary)]">{v.text}</p>
          </div>
        ))}
      </div>

      {/* ── DIAGNOSTIC COMPLET (remonté directement sous les 3 cartes) ── */}
      <AuditSection id="tec-diagnostic" icon={ChartBarIcon} title="Diagnostic" em="complet" meta="État de santé par dimension">

        {/* Subscores cliquables + zone de détail — composant partagé (parité visuelle inter-onglets) */}
        <DiagnosticComplet items={CATEGORY_SCORES} cols={4} className="mb-4" />

        {/* Circular crawl charts — 2×2 */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          {CRAWL_CHARTS.map((chart) => (
            <div key={chart.label} className={`${CARD_SM} p-5`}>
              <p className="type-title mb-4">{chart.label}</p>
              <div className="flex items-center gap-6">
                <DonutChart
                  slices={chart.slices.map(s => ({ label: s.label, value: s.count, color: s.color }))}
                  size={84}
                  strokeWidth={7}
                  center={<span className="type-body-strong">{chart.total}</span>}
                />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="type-caption flex items-center justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-[var(--text-primary)]">{chart.total}</span>
                  </div>
                  <div className="h-px bg-[var(--border-subtle)]" />
                  {chart.slices.map((s) => (
                    <div key={s.label} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="type-label">{s.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="type-label font-semibold tabular-nums" style={{ color: s.color }}>{s.count}</span>
                        <span className="type-micro ml-1">({Math.round(s.count / chart.total * 100)}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PageSpeed — TableWide contour */}
        <div className="mb-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="type-title">Performances · 10 URLs les plus lentes</p>
            <span className="type-caption">desktop · cible LCP &lt; 2.5s</span>
          </div>
          <div className={`overflow-hidden ${CARD_SM}`}>
            <TableWide<(typeof PAGESPEED_DATA)[number]>
              hidePagination
              rowKey={(r) => r.url}
              data={PAGESPEED_DATA}
              columns={[
                { key: "url", header: "URL", width: 240, flex: true,
                  render: (r) => <span className="type-label truncate font-mono text-[var(--text-primary)]">{r.url}</span> },
                { key: "score", header: "Score", width: 64, align: "right", sortable: true, sortValue: (r) => r.score,
                  render: (r) => <span className="type-label font-semibold tabular-nums" style={{ color: scoreColor(r.score) }}>{r.score}</span> },
                { key: "lcp", header: "LCP", width: 64, align: "right", sortable: true, sortValue: (r) => parseFloat(r.lcp),
                  render: (r) => <span className="type-label tabular-nums" style={{ color: parseFloat(r.lcp) > 4 ? "var(--color-danger)" : "var(--color-warning)" }}>{r.lcp}</span> },
                { key: "fcp", header: "FCP", width: 64, align: "right",
                  render: (r) => <span className="type-label tabular-nums text-[var(--text-primary)]">{r.fcp}</span> },
                { key: "cls", header: "CLS", width: 56, align: "right",
                  render: (r) => <span className="type-label tabular-nums text-[var(--text-primary)]">{r.cls}</span> },
                { key: "ttfb", header: "TTFB", width: 60, align: "right",
                  render: (r) => <span className="type-label tabular-nums text-[var(--text-primary)]">{r.ttfb}</span> },
              ]}
            />
          </div>
        </div>

        {/* AI Readiness — demi-cercle ScoreArc */}
        <div className={`${CARD} p-7`}>
          <div className="flex items-center gap-8">
            <ScoreArc score={100} width={168} />
            <div className="flex-1">
              <p className="type-h3 mb-1">
                AI Readiness · <span style={{ color: "var(--color-success)" }}>excellence GEO</span>
              </p>
              <p className="type-body mb-3 leading-relaxed text-[var(--text-secondary)]">
                7 crawlers IA autorisés sur 7. Votre site est entièrement accessible à GPTBot, ClaudeBot, PerplexityBot et OAI-SearchBot.
              </p>
              <div className="flex flex-wrap gap-2">
                {CRAWLERS.map((c) => (
                  <Pill key={c.name}
                    color={c.ok === true ? "var(--color-success)" : "var(--text-muted)"}
                    bg={c.ok === true ? "var(--color-success-bg)" : "var(--bg-subtle)"}>
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${c.domain}&sz=64`}
                      alt=""
                      width={14}
                      height={14}
                      className="h-3.5 w-3.5 flex-shrink-0 rounded-sm"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                    {c.name}{c.ok === true ? " ✓" : ""}
                  </Pill>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AuditSection>

      {/* ── 01. URGENCES BUSINESS ───────────────────────────────────── */}
      <AuditSection id="tec-urgences" icon={ExclamationTriangleIcon} title="Urgences" em="business" meta="À traiter sous 7 jours">

        <Callout variant="error" className="mb-5">
          <strong>~99 visites/mois à risque</strong>{" "}
          · 5 urgences techniques détectées impactent directement votre trafic actuel ou votre indexation. Chaque jour de retard équivaut à environ 3 visites perdues.
        </Callout>

        {/* Grille de cartes — même style visuel que les cartes du module Actions (cohérence app) */}
        <div className="grid grid-cols-2 gap-4">
          {URGENT_ISSUES.map((iss) => {
            const status = getU(iss.id);
            const isCritique = iss.severity === "critique";
            const accentColor = isCritique ? "var(--color-danger)" : "var(--color-warning)";
            return (
              <div
                key={iss.id}
                className={`group flex flex-col gap-2.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-5 py-5 transition-colors hover:border-[var(--border-medium)] ${status === "done" ? "opacity-50" : ""}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2">
                    <Pill color={accentColor} bg={isCritique ? "var(--color-danger-bg)" : "var(--color-warning-bg)"}>{iss.tag}</Pill>
                    {iss.risk && <RiskBadge level={iss.risk.level} undo={iss.risk.undo} />}
                  </span>
                  <StatusPillDropdown status={status} onChange={(s) => decide(status, s, { risk: iss.risk, title: iss.title }, () => setUrgentStatus((p) => ({ ...p, [iss.id]: s })))} />
                </div>
                <div>
                  <p className="type-caption mb-1 font-medium">
                    Impact · <span style={{ color: accentColor }}>{iss.impactLabel}</span>
                  </p>
                  <p className={`type-title leading-snug ${status === "done" ? "text-[var(--text-muted)] line-through" : ""}`}>{iss.title}</p>
                  <p className="type-body-sm mt-1 line-clamp-2 leading-relaxed" title={iss.detail}>{iss.detail}</p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Tooltip portal side="top" label={<span className="type-caption font-mono [color:inherit]">{iss.url}</span>}>
                    <Pill color="var(--text-secondary)" bg="var(--bg-subtle)" className="cursor-default font-mono">
                      <LinkIcon className="h-3 w-3 flex-shrink-0" />
                      {shortLink(iss.url)}
                    </Pill>
                  </Tooltip>
                  <span className="type-micro flex-shrink-0">détecté {iss.date}</span>
                </div>
              </div>
            );
          })}
        </div>
      </AuditSection>

      {/* ── 02. OPTIMISATIONS PRIORITAIRES ──────────────────────────── */}
      <AuditSection id="tec-optimisations" icon={BoltIcon} title="Optimisations" em="prioritaires" meta={`${PRIORITY_ACTIONS.length} actions · 58% du backlog`}>

        {/* Couverture GSC — même style que l'encart AI Readiness (demi-cercle + texte + pills) */}
        <div className={`mb-4 ${CARD} p-7`}>
          <div className="flex items-center gap-8">
            <ScoreArc score={89} width={168} />
            <div className="flex-1">
              <p className="type-h3 mb-1">
                Couverture GSC · <span style={{ color: "var(--color-success)" }}>excellente</span>
              </p>
              <p className="type-body mb-3 leading-relaxed text-[var(--text-secondary)]">
                118 pages crawlées sur 133 reçoivent des impressions. Les 15 restantes sont indexées sans visibilité : ranking trop bas, pas un problème d'indexation.
              </p>
              <div className="flex flex-wrap gap-2">
                <Pill color="var(--color-success)" bg="var(--color-success-bg)">118 avec impressions</Pill>
                <Pill color="var(--text-muted)" bg="var(--bg-subtle)">15 sans impression</Pill>
                <Pill color="var(--text-muted)" bg="var(--bg-subtle)">133 URLs crawlées</Pill>
                <Pill color="var(--text-muted)" bg="var(--bg-subtle)">246 clics/mois</Pill>
              </div>
            </div>
          </div>
          <Callout variant="warning" className="mt-5">
            <strong>À retenir :</strong> ces 15 pages sont bien indexées par Google (pas un blocage technique), mais leur ranking est trop bas pour apparaître en SERP. C'est un signal de pertinence ou de maillage interne insuffisant — à diagnostiquer page par page.
          </Callout>
        </div>

        {/* Actions prioritaires — style tableau du module Actions */}
        <AuditActionsTable actions={PRIORITY_ACTIONS} onSeeActions={onSeeActions} />

        {/* Schemas */}
        <div className={`mt-4 overflow-hidden ${CARD}`}>
          <div className="px-6 py-4">
            <p className="type-title">
              Schemas <span style={{ color: "var(--color-danger)" }}>25/100</span>
            </p>
            <p className="type-caption mt-0.5">2 schemas critiques manquants · 3 présents</p>
          </div>
          <div className="border-t border-[var(--border-subtle)]">
            {SCHEMA_ITEMS.map((s) => {
              const canToggle = s.status !== "ok";
              const workStatus: Status = canToggle ? (schemaStatus[s.id] ?? "todo") : "done";
              const cfg = SCHEMA_CFG[s.status];
              return (
                <div key={s.id} className={`flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-6 py-4 last:border-0 ${workStatus === "done" && canToggle ? "opacity-50" : ""}`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="type-label font-mono text-[var(--text-primary)]">{s.name}</span>
                    {s.detail && <span className="type-caption">{s.detail}</span>}
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <Pill color={cfg.color} bg={cfg.bg}>{cfg.label}</Pill>
                    {canToggle
                      ? <StatusPillDropdown status={workStatus} onChange={(st) => setSchemaStatus((p) => ({ ...p, [s.id]: st }))} />
                      : <CheckCircleIcon className="h-4 w-4 text-[var(--color-success)]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AuditSection>

      {/* ── 04. DONNÉES BRUTES ──────────────────────────────────────── */}
      <AuditSection id="tec-donnees" icon={TableCellsIcon} title="Données" em="brutes" meta="Pour aller plus loin">

        <div className="flex flex-col gap-4">
          {/* Pilot registry — TableWide contour */}
          <div>
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <p className="type-title">Problèmes techniques · registre de pilotage</p>
                <p className="type-caption mt-0.5">12 actions · {pilotCounts.todo} à faire</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-28 overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                  <div className="h-full rounded-full bg-[var(--color-success)] transition-all" style={{ width: `${pilotPct}%` }} />
                </div>
                <span className="type-label font-mono font-semibold" style={{ color: "var(--color-success)" }}>{pilotPct}%</span>
              </div>
            </div>

            {/* Toolbar filtres DS (SearchInput + ColPill multi-select + reset) + compteurs */}
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <SearchInput
                value={pilotSearch}
                onChange={setPilotSearch}
                placeholder="Rechercher un problème…"
                alwaysExpanded
              />

              <ColPill name="statut" label={pilotStatusLabel} active={pilotStatusFilter.size > 0}>
                {() => (
                  <>
                    <DropdownHeader>Filtrer par statut</DropdownHeader>
                    {PILOT_STATUS_FILTERS.map((s) => (
                      <DropdownItem key={s} selected={pilotStatusFilter.has(s)} onClick={() => togglePilotStatus(s)} keepOpen checkbox>
                        {STATUS_CONFIG[s].label}
                      </DropdownItem>
                    ))}
                  </>
                )}
              </ColPill>

              <ColPill name="impact" label={pilotImpactLabel} active={pilotImpactFilter.size > 0}>
                {() => (
                  <>
                    <DropdownHeader>Filtrer par impact</DropdownHeader>
                    {PILOT_IMPACT_ORDER.map((v) => (
                      <DropdownItem key={v} selected={pilotImpactFilter.has(v)} onClick={() => togglePilotImpact(v)} keepOpen checkbox>
                        {fmtImpact(v)}
                      </DropdownItem>
                    ))}
                  </>
                )}
              </ColPill>

              <ResetFiltersButton show={hasPilotFilters} onReset={resetPilotFilters} />

              <div className="ml-auto flex gap-2">
                <Pill color="var(--color-danger)" bg="var(--color-danger-bg)">{pilotCounts.todo} à faire</Pill>
                <Pill color="var(--color-warning)" bg="var(--color-warning-bg)">{pilotCounts.in_progress} en cours</Pill>
                <Pill color="var(--color-success)" bg="var(--color-success-bg)">{pilotCounts.done} terminé</Pill>
              </div>
            </div>

            <div className={`overflow-hidden ${CARD_SM}`}>
              <TableWide<(typeof PILOT_DATA)[number]>
                hidePagination
                rowKey={(p) => p.id}
                data={visiblePilot}
                emptyState={<div className="type-body px-7 py-10 text-center text-[var(--text-muted)]">Aucun problème pour ce filtre.</div>}
                columns={[
                  { key: "count", header: "Pages", width: 60, align: "right",
                    render: (p) => (
                      <span className={`type-label rounded-md px-2 py-0.5 font-mono font-semibold ${p.count === 0 ? "bg-[var(--color-success-bg)] text-[var(--color-success)]" : "bg-[var(--color-danger-bg)] text-[var(--color-danger)]"}`}>
                        {p.count}
                      </span>
                    ) },
                  { key: "label", header: "Description", width: 220, flex: true,
                    render: (p) => <span className={`type-body-strong ${getP(p.id) === "done" ? "line-through text-[var(--text-muted)]" : ""}`}>{p.label}</span> },
                  { key: "risk", header: "Risque", width: 120,
                    render: (p) => p.risk ? <RiskBadge level={p.risk.level} undo={p.risk.undo} /> : null },
                  { key: "impact", header: "Impact", width: 90,
                    render: (p) => <span className="type-label font-medium" style={{ color: impactColor(p.impact) }}>{p.impact.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</span> },
                  { key: "diff", header: "Difficulté", width: 90,
                    render: (p) => <span className="type-label">{p.diff}</span> },
                  { key: "status", header: "Statut", width: 150,
                    render: (p) => <StatusPillDropdown status={getP(p.id)} onChange={(s) => decide(getP(p.id), s, { risk: p.risk, title: p.label }, () => setPilotStatus((prev) => ({ ...prev, [p.id]: s })))} /> },
                  { key: "date", header: "Date", width: 100, align: "right",
                    render: (p) => <span className="type-caption">{p.date}</span> },
                ]}
              />
            </div>
          </div>

          {/* Extra accordions */}
          {EXTRA_ACCORDIONS.map((acc) => {
            const isOpen = openAccordions[acc.id];
            const Icon = acc.icon;
            return (
              <div key={acc.id} className={`overflow-hidden ${CARD}`}>
                <button onClick={() => toggleAccordion(acc.id)}
                  className="flex w-full items-center justify-between px-7 py-5 text-left cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-[var(--text-muted)]" />
                    <div>
                      <p className="type-title">{acc.title}</p>
                      <p className="type-caption mt-0.5">{acc.subtitle}</p>
                    </div>
                  </div>
                  <ChevronDownIcon className="h-4 w-4 flex-shrink-0 text-[var(--text-muted)] transition-transform" style={{ transform: isOpen ? "rotate(180deg)" : "none" }} />
                </button>

                {isOpen && (
                  <div className="border-t border-[var(--border-subtle)]">
                    <TableWide<ExtraRow>
                      hidePagination
                      rowKey={(row) => row.url}
                      data={acc.rows}
                      columns={[
                        { key: "url", header: "URL source", width: 200, flex: true,
                          render: (row) => <span className="type-label truncate font-mono text-[var(--text-primary)]">{row.url}</span> },
                        { key: "target", header: "Cible / Valeur", width: 200, flex: true,
                          render: (row) => <span className="type-label truncate">{row.target}</span> },
                        { key: "type", header: "Type", width: 90,
                          render: (row) => <span className="type-caption font-mono">{row.type}</span> },
                        { key: "note", header: "Statut", width: 120, align: "right",
                          render: (row) => (
                            <span className={`type-label font-medium ${row.note === "OK" ? "text-[var(--color-success)]" : row.note.includes("vérifier") || row.note.includes("Temporaire") ? "text-[var(--color-warning)]" : "text-[var(--text-secondary)]"}`}>
                              {row.note}
                            </span>
                          ) },
                      ]}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="type-micro mt-3">
          Snapshot du 31 mars 2026 · prochain audit programmé le 30 avril 2026
        </p>
      </AuditSection>

      {riskModal}
    </div>
  );
}
