"use client";

import { useState } from "react";
import { ChevronDownIcon, CheckIcon, ArrowPathIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/Button";
import { Tooltip } from "@/components/Tooltip";
import { FilterTabs } from "@/components/FilterTabs";
import { StatusPill, StatusPillDropdown, type Status } from "@/components/StatusPill";
import { ScoreRing } from "@/components/ScoreRing";
import { SectionHead } from "@/components/SectionHead";
import { Callout } from "@/components/Callout";

/* ── Types ────────────────────────────────────────────────────────────── */

type Dimension = "eeat" | "soseo" | "suropt" | "intent" | "hn" | "canib";
type Severity  = "critique" | "important" | "moyen";

type IssueUrl = { url: string; clicks?: number | null; impr: string; lot?: string };
type Issue = {
  id: string; label: string; pages: number; visits: string | null;
  severity: Severity; dimension: Dimension;
  description: string; fix: string; urls?: IssueUrl[];
};

/* ── Issues ───────────────────────────────────────────────────────────── */

const ISSUES: Issue[] = [
  /* ── CRITIQUE ── */
  {
    id: "toxic-cat", label: "Expressions sur-optimisées présentes",
    pages: 3, visits: "17", severity: "critique", dimension: "suropt",
    description: "3 pages avec 30 expressions sur-optimisées (10.0 par page en moyenne). Ratio jugé toxique par les algorithmes de pertinence sémantique de Google.",
    fix: "Réduire les occurrences des mots listés. Cibler une densité de 1.5–2× la médiane SERP par expression.",
    urls: [
      { url: "/agence-marketing-digital-tourisme-voyage/", clicks: 17,   impr: "54.1k", lot: "Top trafic" },
      { url: "/agence-marketing-digital-sante/",          clicks: null,  impr: "41k",   lot: "Top trafic" },
      { url: "/formation/formation-seo/",                 clicks: null,  impr: "6.4k",  lot: "Formation"  },
    ],
  },
  {
    id: "kw-absent", label: "Mot-clé cible absent",
    pages: 3, visits: "17", severity: "critique", dimension: "soseo",
    description: "3 pages avec mot-clé cible absent vs la médiane SERP — signal de pertinence à ajuster. Google attend au minimum une occurrence dans le title, le H1 et le premier paragraphe.",
    fix: "Intégrer le mot-clé cible en title + H1 + premier paragraphe avec une densité proche de la médiane SERP.",
    urls: [
      { url: "/agence-marketing-digital-tourisme-voyage/", clicks: 17,   impr: "54.1k", lot: "Top trafic" },
      { url: "/agence-marketing-digital-sante/",          clicks: null,  impr: "41k",   lot: "Top trafic" },
      { url: "/formation/formation-seo/",                 clicks: null,  impr: "6.4k",  lot: "Formation"  },
    ],
  },
  /* ── IMPORTANT ── */
  {
    id: "eeat-1", label: "Signaux E-E-A-T insuffisants",
    pages: 9, visits: "1,4k", severity: "important", dimension: "eeat",
    description: "9 pages avec 0.6/3 signaux E-E-A-T détectés en moyenne — risque Core Update élevé. Google valorise désormais la traçabilité auteur, la fraîcheur et la richesse multimédia.",
    fix: "Ajouter une byline auteur visible, une date de publication/MAJ, et enrichir avec chiffres + images (≥ 800 mots, ≥ 1 image / 1000 mots).",
    urls: [
      { url: "/",                                                         clicks: 1528, impr: "173.6k", lot: "Top trafic" },
      { url: "/agence-marketing-digital-tourisme-voyage/",                clicks: 17,   impr: "54.1k",  lot: "Top trafic" },
      { url: "/agence-marketing-digital-b2b/",                           clicks: 7,    impr: "75k",    lot: "Top trafic" },
      { url: "/analyse-de-logs-seo-10-bonnes-raisons-de-les-exploiter/", clicks: 4,    impr: "8.9k"  },
      { url: "/agence-seo-mirakl/",                                       clicks: 2,    impr: "9.6k"  },
      { url: "/seo-et-erreur-404-le-guide-pratique/",                     clicks: 2,    impr: "6.4k"  },
      { url: "/agence-marketing-digital-mode-pret-a-porter/",             clicks: null, impr: "8k",    lot: "Top trafic" },
      { url: "/agence-marketing-digital-sante/",                         clicks: null, impr: "41k",   lot: "Top trafic" },
      { url: "/seo-salesforce-commerce-cloud/",                          clicks: null, impr: "22.8k" },
    ],
  },
  {
    id: "toxic-long", label: "Expressions sur-optimisées présentes (long tail)",
    pages: 7, visits: "1,3k", severity: "important", dimension: "suropt",
    description: "7 pages avec 68 expressions sur-optimisées (9.7 par page en moyenne). Sur-optimisation lexicale détectable par les modèles BERT/MUM.",
    fix: "Réduire les occurrences des mots identifiés comme toxiques sur chaque URL impactée.",
  },
  {
    id: "soseo", label: "SOSEO inférieur à la moyenne top 3",
    pages: 3, visits: "1,3k", severity: "important", dimension: "soseo",
    description: "3 pages avec SOSEO inférieur à la moyenne top 3 de 25 points en moyenne — optimisation sémantique insuffisante.",
    fix: "Enrichir le champ lexical SERP (termes manquants YTG) pour rattraper les top 3.",
  },
  {
    id: "intent", label: "Type de page différent de l'intent SERP dominante",
    pages: 2, visits: "17", severity: "important", dimension: "intent",
    description: "2 pages avec un type qui ne correspond pas à l'intention SERP majoritaire — risque majeur de perte de ranking.",
    fix: "Refondre la page pour matcher l'intent SERP majoritaire (ex. commercial → informationnel ou inverse).",
    urls: [
      { url: "/agence-marketing-digital-tourisme-voyage/", clicks: 17,   impr: "54.1k", lot: "Top trafic" },
      { url: "/agence-marketing-digital-sante/",          clicks: null,  impr: "41k",   lot: "Top trafic" },
    ],
  },
  {
    id: "dseo-1", label: "DSEO trop élevé vs concurrents top 5",
    pages: 4, visits: "13", severity: "important", dimension: "suropt",
    description: "4 pages avec DSEO 7.4× au-dessus des top 5 — risque de sur-optimisation détecté par Google.",
    fix: "Réduire la densité des termes sur-optimisés (word_gaps.over_optimized).",
  },
  {
    id: "hn", label: "Structure Hn insuffisante",
    pages: 2, visits: "4", severity: "important", dimension: "hn",
    description: "2 pages présentent une hiérarchie Hn déséquilibrée : H2/H3 manquants ou mal articulés — lecture algorithmique dégradée.",
    fix: "Compléter avec H2 thématiques (≥ 4) et H3 imbriqués pour structurer le contenu.",
    urls: [
      { url: "/agence-seo-mirakl/",                   clicks: 2, impr: "9.6k" },
      { url: "/seo-et-erreur-404-le-guide-pratique/", clicks: 2, impr: "6.4k" },
    ],
  },
  /* ── MOYEN ── */
  {
    id: "dseo-2", label: "DSEO trop élevé vs concurrents top 5 (catégorie 2)",
    pages: 2, visits: "17", severity: "moyen", dimension: "suropt",
    description: "2 pages avec DSEO 1.1× au-dessus des top 5 — risque de sur-optimisation détecté par Google.",
    fix: "Réduire la densité des termes sur-optimisés.",
  },
  {
    id: "canib", label: "Cannibalisation SERP GSC",
    pages: 2, visits: "2", severity: "moyen", dimension: "canib",
    description: "2 requêtes avec cannibalisation medium — 2 clics/mois à risque entre deux pages se positionnant sur la même intention.",
    fix: "Arbitrer (merge 301, réassigner l'intent, ou supprimer) les pages en conflit — voir l'onglet Cannibalisation.",
  },
  {
    id: "serpmantics", label: "Score sémantique global Serpmantics faible",
    pages: 1, visits: "2", severity: "moyen", dimension: "soseo",
    description: "1 page avec un score Serpmantics moyen de 60/100 — contenu jugé faible vs concurrents.",
    fix: "Enrichir les sections faibles (structure_recommendations et expressions_add).",
  },
  {
    id: "kw-overdensity", label: "Mot-clé cible sur-densité",
    pages: 1, visits: "4", severity: "moyen", dimension: "soseo",
    description: "1 page avec mot-clé cible en sur-densité vs la médiane SERP — signal de pertinence à ajuster (paradoxalement perçu comme spam).",
    fix: "Intégrer le mot-clé avec une densité proche de la médiane SERP.",
  },
  {
    id: "toxic-low", label: "Expressions sur-optimisées (faible volume)",
    pages: 1, visits: "4", severity: "moyen", dimension: "suropt",
    description: "1 page avec 3 expressions sur-optimisées (3.0 par page en moyenne).",
    fix: "Réduire les occurrences des mots identifiés comme toxiques.",
  },
  {
    id: "eeat-2", label: "Signaux E-E-A-T insuffisants (catégorie 2)",
    pages: 2, visits: "2", severity: "moyen", dimension: "eeat",
    description: "2 pages avec 2.0/3 signaux E-E-A-T détectés en moyenne — risque Core Update modéré.",
    fix: "Ajouter une byline auteur visible, une date de publication/MAJ et enrichir avec chiffres + images.",
  },
];


/* ── Lots ─────────────────────────────────────────────────────────────── */

type LotData = {
  label: string; count: number; pct: number;
  visitsAtRisk: string; headlineEm: string; headlineTail: string;
  sub: string; score: number; grade: string;
  issues: string[];
  verdictBlocker: string; verdictOpp: string; verdictCov: string;
  dims: Record<Dimension, number>;
};

const LOTS: Record<string, LotData> = {
  all: {
    label: "Tous les lots", count: 11, pct: 8,
    visitsAtRisk: "4,1k", headlineEm: "−4.1k visites/mois", headlineTail: "menacées\npar 9 signaux E-E-A-T faibles.",
    sub: "Neuf pages manquent de signaux d'expertise et d'autorité, mettant en danger 1 361 visites par mois. Priorité avant le prochain Core Update : enrichir le contenu et expliciter les sources.",
    score: 62, grade: "C",
    issues: ["toxic-cat","kw-absent","eeat-1","toxic-long","soseo","intent","dseo-1","hn","dseo-2","canib","serpmantics","kw-overdensity","toxic-low","eeat-2"],
    verdictBlocker: "9 pages sans signaux E-E-A-T explicites — risque direct de chute de trafic au prochain Core Update Google. Concerne 1,4k visites/mois.",
    verdictOpp: "Réduire la sur-optimisation lexicale sur les 3 pages catégorie : signal de pertinence ajusté — potentiel +20% de visibilité sur les requêtes commerciales.",
    verdictCov: "11 pages éditoriales analysées sur les 133 du site. Périmètre limité aux pages stratégiques importées dans Recommandation de page.",
    dims: { eeat: 35, soseo: 68, suropt: 42, intent: 82, hn: 75, canib: 88 },
  },
  "cat-jean": {
    label: "Catégorie Jean", count: 3, pct: 2,
    visitsAtRisk: "980", headlineEm: "−980 visites/mois", headlineTail: "à risque sur la\ncatégorie Jean.",
    sub: "Les 3 pages catégorie Jean cumulent 30 expressions sur-optimisées et un DSEO 7.4× au-dessus des concurrents top 5. Risque de sur-optimisation détecté par Google.",
    score: 48, grade: "D",
    issues: ["toxic-cat","kw-absent","dseo-1"],
    verdictBlocker: "30 expressions sur-optimisées détectées sur les 3 pages — densité jugée toxique par les modèles BERT/MUM.",
    verdictOpp: "Réintroduire le mot-clé cible en title, H1 et premier paragraphe sur les 3 pages — gain attendu : retour dans le top 10 SERP.",
    verdictCov: "3 pages catégorie Jean analysées · 100% du lot couvert.",
    dims: { eeat: 70, soseo: 30, suropt: 18, intent: 65, hn: 80, canib: 95 },
  },
  "top-trafic": {
    label: "Top pages trafic", count: 5, pct: 4,
    visitsAtRisk: "3,2k", headlineEm: "−3.2k visites/mois", headlineTail: "sur vos 5 pages\nles plus fortes.",
    sub: "Vos 5 pages top trafic sont aussi les plus à risque : 100% présentent des signaux E-E-A-T insuffisants, et 3 ont des expressions sur-optimisées. Priorité absolue.",
    score: 55, grade: "C",
    issues: ["toxic-cat","kw-absent","eeat-1","toxic-long","intent"],
    verdictBlocker: "5 pages à 1 528 + 17 + 7 + 0 + 0 clics/mois — toutes manquent d'auteur visible, date de MAJ et richesse multimédia.",
    verdictOpp: "Ajouter les 3 signaux E-E-A-T (auteur / date / images) sur ces 5 pages = +20% de visibilité estimée au prochain Core Update.",
    verdictCov: "5 pages top trafic · cumulent 73% du trafic SEO du site.",
    dims: { eeat: 22, soseo: 65, suropt: 50, intent: 70, hn: 85, canib: 92 },
  },
  "ymyl": {
    label: "Pages YMYL", count: 2, pct: 1.5,
    visitsAtRisk: "460", headlineEm: "−460 visites/mois", headlineTail: "sur le périmètre\nYour Money Your Life.",
    sub: "Les pages YMYL exigent une qualité E-E-A-T renforcée. Vos 2 pages n'ont aucune mention d'auteur ni source citée — un risque algorithmique élevé.",
    score: 38, grade: "D",
    issues: ["eeat-1","eeat-2","soseo"],
    verdictBlocker: "0 mention d'auteur sur les 2 pages YMYL — le facteur le plus pénalisant pour les sujets sensibles.",
    verdictOpp: "Ajouter une bio auteur experte + références scientifiques sur les 2 pages YMYL : priorité absolue.",
    verdictCov: "2 pages YMYL identifiées · 100% du lot couvert.",
    dims: { eeat: 18, soseo: 52, suropt: 88, intent: 90, hn: 65, canib: 100 },
  },
  "formation": {
    label: "Formation & services", count: 4, pct: 3,
    visitsAtRisk: "850", headlineEm: "−850 visites/mois", headlineTail: "sur le lot\nFormation & services.",
    sub: "4 pages formation présentent une sur-optimisation modérée et un SOSEO inférieur de 25 points au top 3 SERP. Le mot-clé cible est mal placé.",
    score: 64, grade: "C",
    issues: ["toxic-cat","kw-absent","soseo","toxic-low"],
    verdictBlocker: "SOSEO −25 points vs top 3 sur 3 des 4 pages formation — champ lexical SERP insuffisamment couvert.",
    verdictOpp: "Enrichir avec termes manquants YTG + intégrer le mot-clé cible en intro = retour potentiel dans le top 5.",
    verdictCov: "4 pages formation/services · 100% du lot couvert.",
    dims: { eeat: 65, soseo: 42, suropt: 55, intent: 88, hn: 80, canib: 100 },
  },
  "case-studies": {
    label: "Case studies", count: 3, pct: 2,
    visitsAtRisk: "120", headlineEm: "Périmètre case studies", headlineTail: "globalement sain.",
    sub: "Les 3 case studies sont en bonne santé éditoriale : structure Hn correcte, intent SERP aligné, mais 2 ont des problèmes de cannibalisation entre elles.",
    score: 78, grade: "B",
    issues: ["canib","hn"],
    verdictBlocker: "2 case studies en cannibalisation sur la même requête commerciale — clics dilués entre 2 URLs.",
    verdictOpp: "Merge 301 ou réassignation d'intent sur les 2 pages : voir l'onglet Cannibalisation.",
    verdictCov: "3 case studies · 100% du lot couvert.",
    dims: { eeat: 75, soseo: 80, suropt: 92, intent: 85, hn: 70, canib: 60 },
  },
};

const LOT_KEYS = ["all","cat-jean","top-trafic","ymyl","formation","case-studies"];

/* ── Dimensions ───────────────────────────────────────────────────────── */

const DIMENSION_CONFIG: { key: Dimension; label: string; meta: string }[] = [
  { key: "eeat",   label: "E-E-A-T",          meta: "9 pages à risque · 2 issues" },
  { key: "soseo",  label: "SOSEO",             meta: "3 pages sous le top 3 · 4 issues" },
  { key: "suropt", label: "Sur-optimisation",  meta: "11 pages avec toxic_expr · 5 issues" },
  { key: "intent", label: "Intent match",      meta: "2 pages mismatch · 1 issue" },
  { key: "hn",     label: "Structure Hn",      meta: "2 pages incomplètes · 1 issue" },
  { key: "canib",  label: "Cannibalisation",   meta: "2 requêtes en conflit · 1 issue" },
];

const SEVERITY_CONFIG: Record<Severity, { label: string; color: string; bg: string }> = {
  critique:  { label: "Critique",  color: "#E11D48", bg: "rgba(225,29,72,0.08)"  },
  important: { label: "Important", color: "#F59E0B", bg: "rgba(245,158,11,0.1)"  },
  moyen:     { label: "Moyen",     color: "#6B7280", bg: "rgba(107,114,128,0.1)" },
};

/* ── Helpers ──────────────────────────────────────────────────────────── */

const STATUS_CYCLE: Status[] = ["todo", "doing", "done"];

function nextStatus(s: Status): Status {
  return STATUS_CYCLE[(STATUS_CYCLE.indexOf(s) + 1) % STATUS_CYCLE.length];
}

function scoreColor(n: number) {
  return n >= 70 ? "#10B981" : n >= 50 ? "#F59E0B" : "#E11D48";
}

/* ── Micro-components ─────────────────────────────────────────────────── */

function StatusDot({ status, onClick }: { status: Status; onClick: () => void }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] transition-all ${
        status === "done"  ? "border-[#10B981] bg-[#10B981]" :
        status === "doing" ? "border-[#F59E0B] bg-[rgba(245,158,11,0.1)]" :
        "border-[var(--text-muted)]"
      }`}>
      {status === "done"  && <CheckIcon className="h-2.5 w-2.5 text-white" />}
      {status === "doing" && <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />}
    </button>
  );
}


/* ── Issue accordion ──────────────────────────────────────────────────── */

function IssueCard({ issue, status, onStatusChange }: {
  issue: Issue; status: Status; onStatusChange: () => void;
}) {
  const [open, setOpen] = useState(false);
  const c = SEVERITY_CONFIG[issue.severity];

  return (
    <div className={`border-b border-[var(--border-subtle)] last:border-0 ${status === "done" ? "opacity-50" : ""}`}
      style={{ borderLeftColor: c.color, borderLeftWidth: 3, borderLeftStyle: "solid" }}>
      <button onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-6 py-4 text-left cursor-pointer">
        <span className="rounded-md px-3 py-1.5 text-[12px] font-semibold flex-shrink-0"
          style={{ color: c.color, backgroundColor: c.bg }}>{c.label}</span>
        <StatusDot status={status} onClick={onStatusChange} />
        <span className={`flex-1 text-[14px] font-medium min-w-0 ${status === "done" ? "line-through text-[var(--text-muted)]" : "text-[var(--text-primary)]"}`}>
          {issue.label}
        </span>
        <div className="flex flex-shrink-0 items-center gap-3">
          <span className="text-[13px] text-[var(--text-muted)]">{issue.pages} pages</span>
          {issue.visits && (
            <span className="text-[13px] font-medium" style={{ color: c.color }}>{issue.visits} visites</span>
          )}
          <StatusPill status={status} />
          <ChevronDownIcon className="h-4 w-4 text-[var(--text-muted)] transition-transform"
            style={{ transform: open ? "rotate(180deg)" : "none" }} />
        </div>
      </button>

      {open && (
        <div className="border-t border-[var(--border-subtle)] px-6 py-5">
          <p className="mb-3 text-[14px] leading-relaxed text-[var(--text-secondary)]">{issue.description}</p>
          <div className="mb-4 rounded-r-xl border-l-2 border-[#3E50F5] bg-[rgba(62,80,245,0.05)] px-4 py-3 text-[14px] leading-snug text-[var(--text-secondary)]">
            <strong className="text-[#3E50F5]">Action :</strong> {issue.fix}
          </div>
          {issue.urls && issue.urls.length > 0 && (
            <>
              <p className="mb-2 text-[12px] font-semibold text-[var(--text-muted)]">URLs les plus impactées</p>
              <div className="grid grid-cols-[1fr_80px_96px] gap-3 border-t border-[var(--border-subtle)] py-2 text-[11px] font-semibold text-[var(--text-muted)]">
                <span>URL</span>
                <span className="text-right">Clics/mois</span>
                <span className="text-right">Impressions</span>
              </div>
              {(issue.urls ?? []).map((u, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_80px_96px] items-center gap-3 border-t border-[var(--border-subtle)] py-2.5 text-[13px]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate font-mono text-[var(--text-muted)]">{u.url}</span>
                    {u.lot && (
                      <span className="flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold"
                        style={{ backgroundColor: "rgba(62,80,245,0.1)", color: "#3E50F5" }}>{u.lot}</span>
                    )}
                  </div>
                  <span className="text-right font-medium text-[var(--text-primary)]">{u.clicks != null ? u.clicks : "—"}</span>
                  <span className="text-right text-[var(--text-muted)]">{u.impr}</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────────────────── */

export function AuditEditorialTab({ domain }: { domain: string }) {
  const [activeLot, setActiveLot]       = useState<string>("all");
  const [activeDim, setActiveDim]       = useState<Dimension | null>(null);
  const [issueStatuses, setIssueStatuses] = useState<Record<string, Status>>({});

  const lot = LOTS[activeLot];

  const visibleIssues = ISSUES.filter((iss) => {
    const inLot = lot.issues.includes(iss.id);
    const inDim = !activeDim || iss.dimension === activeDim;
    return inLot && inDim;
  });

  const countBySeverity = (sev: Severity) => visibleIssues.filter((i) => i.severity === sev).length;
  const getStatus = (id: string): Status => issueStatuses[id] ?? "todo";
  const toggleStatus = (id: string) =>
    setIssueStatuses((prev) => ({ ...prev, [id]: nextStatus(getStatus(id)) }));

  const scoreColor62 = scoreColor(lot.score);

  return (
    <div className="flex flex-col gap-8">

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <div id="edi-synthese" className="overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-8">
        <div className="grid grid-cols-[2fr_1fr] items-center gap-8">
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-[rgba(16,185,129,0.1)] px-3 py-1.5 text-[12px] font-semibold text-[#10B981]">GSC connecté</span>
              <span className="rounded-full bg-[rgba(62,80,245,0.08)] px-3 py-1.5 text-[12px] font-semibold text-[#3E50F5]">
                {lot.count} pages éditoriales · {lot.pct}% du site
              </span>
              <span className="text-[13px] text-[var(--text-muted)]">27 avril 2026</span>
            </div>
            <h1 className="text-[32px] font-semibold leading-tight tracking-tight text-[var(--text-primary)]">
              <span style={{ color: "#E11D48" }}>{lot.headlineEm}</span>
              {" "}{lot.headlineTail.split("\n")[0]}
              <br />{lot.headlineTail.split("\n")[1]}
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--text-secondary)]">{lot.sub}</p>
            <div className="mt-5 flex flex-wrap gap-6 text-[13px] text-[var(--text-muted)]">
              <span><strong className="text-[15px] text-[var(--text-primary)]">{lot.count}</strong> pages analysées / 133 crawlées</span>
              <span><strong className="text-[15px] text-[var(--text-primary)]">{visibleIssues.length}</strong> issues détectées</span>
              <span>Snapshot GSC <strong className="text-[var(--text-primary)]">27/04</strong></span>
            </div>
            <div className="mt-6">
              <Button size="sm" variant="secondary">
                <ArrowPathIcon className="h-4 w-4" />
                Relancer l'audit
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <ScoreRing score={lot.score} size={160} strokeWidth={7} />
            <p className="text-[13px] font-medium text-[var(--text-muted)]">Score éditorial</p>
            <p className="text-[12px] text-[var(--text-muted)]">
              Grade <strong style={{ color: scoreColor62 }}>{lot.grade}</strong> · pondéré par trafic
            </p>
          </div>
        </div>
      </div>

      {/* Verdict cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { color: "#E11D48", label: "Bloqueur",    text: lot.verdictBlocker },
          { color: "#3E50F5", label: "Opportunité", text: lot.verdictOpp },
          { color: "#B888FF", label: "Couverture",  text: lot.verdictCov },
        ].map((v) => (
          <div key={v.label} className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]"
            style={{ background: `linear-gradient(to bottom, ${v.color}12 0%, var(--bg-card) 60%)` }}>
            <div className="px-5 pt-5 pb-6">
              <div className="mb-3 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: v.color }} />
                <p className="text-[13px] font-semibold" style={{ color: v.color }}>{v.label}</p>
              </div>
              <p className="text-[14px] leading-snug text-[var(--text-secondary)]">{v.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── FILTRES PAR LOT ─────────────────────────────────────────── */}
      <div id="edi-lots" className="overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[13px] font-semibold text-[var(--text-primary)]">Filtrer par lot</p>
          <p className="text-[12px] text-[var(--text-muted)]">
            Lots définis dans <span className="text-[var(--text-secondary)]">Recommandation de page</span> · synchronisés il y a 2 jours
          </p>
        </div>
        <FilterTabs
          tabs={LOT_KEYS.map(key => ({ key, label: LOTS[key].label, count: LOTS[key].count }))}
          value={activeLot}
          onChange={(key) => { setActiveLot(key as string); setActiveDim(null); }}
        />
      </div>

      {/* ── 01. DIAGNOSTIC PAR IMPACT BUSINESS ─────────────────────── */}
      <div id="edi-diagnostic">
        <SectionHead
          num="01." title="Diagnostic" em="par impact business"
          meta={`${visibleIssues.length} issues · ${countBySeverity("critique")} critiques · ${countBySeverity("important")} importantes · ${countBySeverity("moyen")} moyennes`}
        />

        <Callout variant="error" className="mb-5">
          <strong>~{lot.visitsAtRisk} visites/mois à risque</strong>{" "}
          sur le périmètre {lot.label}{activeDim ? ` · filtre dimension actif` : ""}.
          {countBySeverity("critique") > 0 && ` Les ${countBySeverity("critique")} issues critiques concernent les pages les plus stratégiques.`}
        </Callout>

        {/* Active dimension filter banner */}
        {activeDim && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-[rgba(62,80,245,0.3)] bg-[rgba(62,80,245,0.05)] px-5 py-3">
            <p className="text-[14px] text-[var(--text-secondary)]">
              Filtre actif sur la dimension <strong className="text-[#3E50F5]">{DIMENSION_CONFIG.find((d) => d.key === activeDim)?.label}</strong> · {visibleIssues.length} issue(s) affichée(s)
            </p>
            <button onClick={() => setActiveDim(null)}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] cursor-pointer">
              <XMarkIcon className="h-3.5 w-3.5" />
              Effacer
            </button>
          </div>
        )}

        <div className="bg-[var(--bg-card)]">
          {/* Critiques */}
          {countBySeverity("critique") > 0 && (
            <>
              <div className="px-6 py-2.5 text-[11px] font-semibold text-[var(--text-muted)]">
                Impact critique · {countBySeverity("critique")} issue{countBySeverity("critique") > 1 ? "s" : ""}
              </div>
              {visibleIssues.filter((i) => i.severity === "critique").map((iss) => (
                <IssueCard key={iss.id} issue={iss} status={getStatus(iss.id)} onStatusChange={() => toggleStatus(iss.id)} />
              ))}
            </>
          )}

          {/* Importants */}
          {countBySeverity("important") > 0 && (
            <>
              <div className="border-t border-[var(--border-subtle)] px-6 py-2.5 text-[11px] font-semibold text-[var(--text-muted)]">
                Impact important · {countBySeverity("important")} issue{countBySeverity("important") > 1 ? "s" : ""}
              </div>
              {visibleIssues.filter((i) => i.severity === "important").map((iss) => (
                <IssueCard key={iss.id} issue={iss} status={getStatus(iss.id)} onStatusChange={() => toggleStatus(iss.id)} />
              ))}
            </>
          )}

          {/* Moyens */}
          {countBySeverity("moyen") > 0 && (
            <>
              <div className="border-t border-[var(--border-subtle)] px-6 py-2.5 text-[11px] font-semibold text-[var(--text-muted)]">
                Impact moyen · {countBySeverity("moyen")} issue{countBySeverity("moyen") > 1 ? "s" : ""}
              </div>
              {visibleIssues.filter((i) => i.severity === "moyen").map((iss) => (
                <IssueCard key={iss.id} issue={iss} status={getStatus(iss.id)} onStatusChange={() => toggleStatus(iss.id)} />
              ))}
            </>
          )}

          {visibleIssues.length === 0 && (
            <div className="px-7 py-10 text-center text-[14px] text-[var(--text-muted)]">
              Aucune issue pour ce périmètre.
            </div>
          )}
        </div>

        {/* Detector note */}
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-card-hover)] px-5 py-4">
          <span className="text-[#F59E0B] text-[16px]">⚠</span>
          <p className="text-[13px] text-[var(--text-secondary)]">
            <strong className="text-[#F59E0B]">3 détecteurs n'ont pas pu tourner</strong> — certaines données sont manquantes pour{" "}
            <span className="font-mono text-[12px]">detector_freshness</span>,{" "}
            <span className="font-mono text-[12px]">knowledge_graph_match</span> et{" "}
            <span className="font-mono text-[12px]">brand_mentions</span>. Reconnecter les sources pour activer ces analyses.
          </p>
        </div>
      </div>

      {/* ── 02. DIAGNOSTIC PAR DIMENSION ────────────────────────────── */}
      <div id="edi-dimensions">
        <SectionHead num="02." title="Diagnostic" em="par dimension" meta={`Score moyen sur ${lot.count} pages éditoriales`} />

        <div className="grid grid-cols-6 gap-3">
          {DIMENSION_CONFIG.map((dim) => {
            const score = lot.dims[dim.key];
            const color = scoreColor(score);
            const isActive = activeDim === dim.key;
            return (
              <button key={dim.key} onClick={() => setActiveDim(isActive ? null : dim.key)}
                className="relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-200 cursor-pointer"
                style={{
                  borderColor: isActive ? "#3E50F5" : "var(--border-subtle)",
                  background: isActive
                    ? "linear-gradient(to bottom, rgba(62,80,245,0.08) 0%, var(--bg-card) 100%)"
                    : "var(--bg-card)",
                }}>
                <p className="mb-2 text-[11px] font-semibold text-[var(--text-muted)]">{dim.label}</p>
                <p className="text-[26px] font-semibold leading-none tracking-tight text-[var(--text-primary)]">
                  {score}<span className="text-[13px] font-normal text-[var(--text-muted)]">/100</span>
                </p>
                <p className="mt-2 text-[11px] text-[var(--text-muted)]">{dim.meta}</p>
                {/* Bottom bar */}
                <div className="absolute bottom-0 left-0 h-[3px] rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 03. DONNÉES BRUTES ──────────────────────────────────────── */}
      <div id="edi-donnees">
        <SectionHead num="03." title="Données" em="brutes" meta="Pour aller plus loin" />

        <div className="flex flex-col divide-y divide-[var(--border-subtle)]">
          {[
            {
              id: "perimetre", title: "Couverture du périmètre éditorial", sub: `${lot.count} / 133 pages`,
              body: `${lot.count} pages importées dans Recommandation de page sont analysées sur les 133 du site. Les autres pages restent suivies en santé technique mais ne reçoivent pas d'analyse éditoriale (E-E-A-T, SOSEO, intent). Pour étendre le périmètre, importer plus de pages dans Recommandation de page.`,
            },
            {
              id: "detectors", title: "Détecteurs et statut", sub: "11 actifs / 14 disponibles",
              body: "11 détecteurs ont tourné sur ce périmètre. 3 inactifs : detector_freshness (date manquante), knowledge_graph_match (pas de schema Organization), brand_mentions (Ahrefs non connecté).",
            },
            {
              id: "lots-detail", title: "Lots éditoriaux", sub: "5 lots définis",
              body: "Catégorie Jean (3) · Top trafic (5) · YMYL (2) · Formation & services (4) · Case studies (3). Les lots sont définis dans l'onglet Recommandation de page et synchronisés à chaque audit.",
            },
            {
              id: "snapshot", title: "Snapshot GSC", sub: "27 avril 2026",
              body: `Données GSC utilisées pour pondérer les visites à risque : 246 clics/mois, 214.1k impressions sur le périmètre du site complet. Sur les ${lot.count} pages éditoriales analysées : 1 588 clics/mois cumulés, 343k impressions cumulées.`,
            },
          ].map((acc) => (
            <SimpleAccordion key={acc.id} title={acc.title} sub={acc.sub} body={acc.body} />
          ))}
        </div>

        <p className="mt-3 text-[12px] text-[var(--text-muted)]">
          Dernière analyse éditoriale : 27 avril 2026 · prochaine analyse : 30 avril 2026
        </p>
      </div>

    </div>
  );
}

function SimpleAccordion({ title, sub, body }: { title: string; sub: string; body: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-4 text-left cursor-pointer">
        <div>
          <p className="text-[15px] font-semibold text-[var(--text-primary)]">{title}</p>
          <p className="mt-0.5 text-[13px] text-[var(--text-muted)]">{sub}</p>
        </div>
        <ChevronDownIcon className="h-4 w-4 flex-shrink-0 text-[var(--text-muted)] transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      {open && (
        <div className="pb-4 text-[14px] leading-relaxed text-[var(--text-secondary)]">
          {body}
        </div>
      )}
    </div>
  );
}
