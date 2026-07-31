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

/* ── Types ────────────────────────────────────────────────────────────── */

type Dimension = "eeat" | "soseo" | "suropt" | "intent" | "hn" | "canib";
type Severity  = "critique" | "important" | "moyen";

type IssueUrl = { url: string; clicks?: number | null; impr: string; tag?: string };
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
      { url: "/agence-marketing-digital-tourisme-voyage/", clicks: 17,   impr: "54.1k", tag: "Top trafic" },
      { url: "/agence-marketing-digital-sante/",          clicks: null,  impr: "41k",   tag: "Top trafic" },
      { url: "/formation/formation-seo/",                 clicks: null,  impr: "6.4k",  tag: "Formation"  },
    ],
  },
  {
    id: "kw-absent", label: "Mot-clé cible absent",
    pages: 3, visits: "17", severity: "critique", dimension: "soseo",
    description: "3 pages avec mot-clé cible absent vs la médiane SERP — signal de pertinence à ajuster. Google attend au minimum une occurrence dans le title, le H1 et le premier paragraphe.",
    fix: "Intégrer le mot-clé cible en title + H1 + premier paragraphe avec une densité proche de la médiane SERP.",
    urls: [
      { url: "/agence-marketing-digital-tourisme-voyage/", clicks: 17,   impr: "54.1k", tag: "Top trafic" },
      { url: "/agence-marketing-digital-sante/",          clicks: null,  impr: "41k",   tag: "Top trafic" },
      { url: "/formation/formation-seo/",                 clicks: null,  impr: "6.4k",  tag: "Formation"  },
    ],
  },
  /* ── IMPORTANT ── */
  {
    id: "eeat-1", label: "Signaux E-E-A-T insuffisants",
    pages: 9, visits: "1,4k", severity: "important", dimension: "eeat",
    description: "9 pages avec 0.6/3 signaux E-E-A-T détectés en moyenne — risque Core Update élevé. Google valorise désormais la traçabilité auteur, la fraîcheur et la richesse multimédia.",
    fix: "Ajouter une byline auteur visible, une date de publication/MAJ, et enrichir avec chiffres + images (≥ 800 mots, ≥ 1 image / 1000 mots).",
    urls: [
      { url: "/",                                                         clicks: 1528, impr: "173.6k", tag: "Top trafic" },
      { url: "/agence-marketing-digital-tourisme-voyage/",                clicks: 17,   impr: "54.1k",  tag: "Top trafic" },
      { url: "/agence-marketing-digital-b2b/",                           clicks: 7,    impr: "75k",    tag: "Top trafic" },
      { url: "/analyse-de-logs-seo-10-bonnes-raisons-de-les-exploiter/", clicks: 4,    impr: "8.9k"  },
      { url: "/agence-seo-mirakl/",                                       clicks: 2,    impr: "9.6k"  },
      { url: "/seo-et-erreur-404-le-guide-pratique/",                     clicks: 2,    impr: "6.4k"  },
      { url: "/agence-marketing-digital-mode-pret-a-porter/",             clicks: null, impr: "8k",    tag: "Top trafic" },
      { url: "/agence-marketing-digital-sante/",                         clicks: null, impr: "41k",   tag: "Top trafic" },
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
      { url: "/agence-marketing-digital-tourisme-voyage/", clicks: 17,   impr: "54.1k", tag: "Top trafic" },
      { url: "/agence-marketing-digital-sante/",          clicks: null,  impr: "41k",   tag: "Top trafic" },
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


/* ── Tags ─────────────────────────────────────────────────────────────── */

type TagData = {
  label: string; count: number; pct: number;
  visitsAtRisk: string; headlineEm: string; headlineTail: string;
  sub: string; score: number; grade: string;
  issues: string[];
  verdictBlocker: string; verdictOpp: string; verdictCov: string;
  dims: Record<Dimension, number>;
};

const LOTS: Record<string, TagData> = {
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
    verdictCov: "3 pages catégorie Jean analysées · 100% du tag couvert.",
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
    verdictCov: "2 pages YMYL identifiées · 100% du tag couvert.",
    dims: { eeat: 18, soseo: 52, suropt: 88, intent: 90, hn: 65, canib: 100 },
  },
  "formation": {
    label: "Formation & services", count: 4, pct: 3,
    visitsAtRisk: "850", headlineEm: "−850 visites/mois", headlineTail: "sur le tag\nFormation & services.",
    sub: "4 pages formation présentent une sur-optimisation modérée et un SOSEO inférieur de 25 points au top 3 SERP. Le mot-clé cible est mal placé.",
    score: 64, grade: "C",
    issues: ["toxic-cat","kw-absent","soseo","toxic-low"],
    verdictBlocker: "SOSEO −25 points vs top 3 sur 3 des 4 pages formation — champ lexical SERP insuffisamment couvert.",
    verdictOpp: "Enrichir avec termes manquants YTG + intégrer le mot-clé cible en intro = retour potentiel dans le top 5.",
    verdictCov: "4 pages formation/services · 100% du tag couvert.",
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
    verdictCov: "3 case studies · 100% du tag couvert.",
    dims: { eeat: 75, soseo: 80, suropt: 92, intent: 85, hn: 70, canib: 60 },
  },
};

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
