"use client";

import { useState } from "react";
import {
  ChevronDownIcon, CheckCircleIcon,
  GlobeAltIcon, MagnifyingGlassIcon, DocumentTextIcon, BoltIcon,
  PhotoIcon, CodeBracketIcon, CpuChipIcon, ChatBubbleBottomCenterTextIcon,
  TagIcon, ArrowsRightLeftIcon, LinkIcon, ServerIcon,
  ExclamationTriangleIcon, ChartBarIcon, TableCellsIcon,
} from "@heroicons/react/24/outline";
import { Tooltip } from "@/components/Tooltip";
import { StatusPillDropdown, STATUS_CONFIG, type Status } from "@/components/StatusPill";
import { AuditActionsTable } from "@/components/analyse/AuditActionsTable";
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
import type { ElementType } from "react";

/* ── Types ────────────────────────────────────────────────────────────── */


/* Statuts et impacts filtrables sur le registre de pilotage (toolbar DS). */
const PILOT_STATUS_FILTERS: Status[] = ["todo", "in_progress", "done"];
const PILOT_IMPACT_ORDER = ["très-fort", "fort", "moyen", "faible", "très-faible"];
const fmtImpact = (v: string) => v.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());

/* ── Data ─────────────────────────────────────────────────────────────── */

const URGENT_ISSUES = [
  { id: "403",       severity: "critique", tag: "HTTP 403 · Critique",        impactLabel: "indexation bloquée",
    title: "3 backlinks pointent vers des pages renvoyant 403",
    detail: "Du jus de lien provenant de Journal du Net, Usine Nouvelle et l'AFP arrive sur des pages refusées. Perte sèche d'autorité.",
    url: "journaldunet.com → /solutions/seo-referencement/...",
    date: "31 mars 2026" },
  { id: "ttfb",      severity: "warning",  tag: "TTFB · Warning",              impactLabel: "~93 impressions",
    title: "2 pages dépassent 3.7s de temps de réponse",
    detail: "/formation/formation-seo/ (4.69s) et /case-studies/page/2/ (3.75s). Au-delà de 2.5s, Google déclasse en mobile-first.",
    url: "aw-i.com/formation/formation-seo/ · 93 impressions GSC",
    date: "31 mars 2026" },
  { id: "index-gap", severity: "critique", tag: "Index gap · Critique",        impactLabel: "~23 pages perdues",
    title: "23 pages crawlées par vous, ignorées par Google",
    detail: "Ces pages existent et sont liées en interne, mais Google ne les remonte pas en GSC. Maillage trop faible ou contenu jugé peu pertinent.",
    url: "17% des pages du site sont concernées",
    date: "31 mars 2026" },
  { id: "ghost",     severity: "warning",  tag: "Pages fantômes · Warning",    impactLabel: "+27 pages à intégrer",
    title: "27 pages reçoivent du trafic GSC mais sont orphelines",
    detail: "Pages indexées et performantes en SERP que votre maillage interne ignore complètement. Potentiel d'amplification fort.",
    url: "20% du périmètre indexé non maillé",
    date: "31 mars 2026" },
];

const PRIORITY_ACTIONS = [
  { id: 1, title: "Réécrire les 45 titres mal dimensionnés",          sub: "50-60 caractères · mot-clé + valeur ajoutée",                  effort: "3-4h",   priority: "high",   category: "On-Page",         impact: "CTR +5-15% sur les 45 pages corrigées. Délai d'effet : 2-6 semaines (Transition Rank).",          fix: "Réécrire en 50-60 caractères avec mot-clé principal + valeur ajoutée. Format : « Mot-clé | Valeur ajoutée | Marque »" },
  { id: 2, title: "Implémenter Schema Organization site-wide",        sub: "Knowledge Panel · signaux E-E-A-T",                            effort: "45 min", priority: "high",   category: "Structured Data", impact: "Knowledge Panel Google activé, signaux E-E-A-T renforcés, rich snippets améliorés.",               fix: "Ajouter JSON-LD dans le <head> : name, description, url, logo, sameAs, address, contactPoint" },
  { id: 3, title: "Réécrire les 43 meta descriptions trop longues",   sub: "140-155 caractères · CTA inclus",                              effort: "2-3h",   priority: "high",   category: "On-Page",         impact: "Snippets non tronqués, CTR +3-10%. Délai d'effet : 2-6 semaines.",                                 fix: "Inclure mot-clé + CTA en 140-155 chars. Prioriser les pages > 50 impressions/mois" },
  { id: 4, title: "Investiguer le TTFB de /formation/formation-seo/", sub: "4.69s actuel · cible < 1s · LCP critique",                     effort: "2-3h",   priority: "medium", category: "Performance",      impact: "Temps < 1s, LCP amélioré, expérience utilisateur optimisée sur page à trafic.",                   fix: "Cache serveur, optimisation BDD, lazy loading des ressources. 93 impressions GSC sur cette page" },
  { id: 5, title: "Schema WebSite avec sitelinks searchbox",          sub: "Sitelinks SERP · navigation directe",                          effort: "30 min", priority: "medium", category: "Structured Data", impact: "Sitelinks avec search box dans Google, navigation SERP améliorée.",                              fix: "JSON-LD avec name, url, potentialAction + SearchAction pour la recherche interne" },
  { id: 6, title: "Convertir 105 images PNG en WebP",                 sub: "53% des 199 images · ~40% de poids estimé",                    effort: "2-3h",   priority: "medium", category: "Images",           impact: "~40% de réduction du poids des images PNG, LCP amélioré.",                                        fix: "Script de conversion automatique ou plugin build. Vérifier les balises <picture> pour le fallback" },
  { id: 7, title: "Identifier et mailler la page orpheline",          sub: "1 page · 0 lien entrant interne",                              effort: "30 min", priority: "low",    category: "Crawl",            impact: "PageRank distribué, crawl budget optimisé.",                                                       fix: "Lien depuis page parent, menu, ou footer selon pertinence thématique" },
  { id: 8, title: "Créer un fichier /llms.txt pour les LLM",         sub: "Citations IA mieux contextualisées",                           effort: "30 min", priority: "low",    category: "AI Readiness",     impact: "Citations IA mieux contextualisées et plus fréquentes.",                                          fix: "Format markdown avec description agence, services principaux, pages clés et signaux E-E-A-T" },
];

const SCHEMA_ITEMS = [
  { id: "breadcrumb", name: "BreadcrumbList", detail: "52 pages",  status: "ok"      as const },
  { id: "blog",       name: "BlogPosting",    detail: "48 pages",  status: "ok"      as const },
  { id: "answer",     name: "Answer",         detail: "32 pages",  status: "ok"      as const },
  { id: "org",        name: "Organization",   detail: "",          status: "missing" as const },
  { id: "website",    name: "WebSite",        detail: "",          status: "missing" as const },
  { id: "article",    name: "Article",        detail: "",          status: "suggest" as const },
];

const CRAWLERS: { name: string; ok: boolean | null; domain: string }[] = [
  { name: "GPTBot",        ok: true,  domain: "openai.com" },
  { name: "OAI-SearchBot", ok: true,  domain: "openai.com" },
  { name: "ChatGPT-User",  ok: true,  domain: "openai.com" },
  { name: "ClaudeBot",     ok: true,  domain: "anthropic.com" },
  { name: "PerplexityBot", ok: true,  domain: "perplexity.ai" },
  { name: "Bytespider",    ok: null,  domain: "bytedance.com" },
  { name: "CCBot",         ok: null,  domain: "commoncrawl.org" },
];

const PILOT_DATA: { id: number; count: number; label: string; pct: string; impact: string; diff: string; defaultStatus: Status; date: string }[] = [
  { id: 0,  count: 45, label: "Balises titres avec longueur incorrecte", pct: "33.8%", impact: "moyen",      diff: "Faible",      defaultStatus: "todo", date: "31 mars 2026" },
  { id: 1,  count: 43, label: "Balises description trop longues",        pct: "32.3%", impact: "très-faible",diff: "Faible",      defaultStatus: "todo", date: "31 mars 2026" },
  { id: 2,  count: 2,  label: "Temps de réponse lent (> 1s)",           pct: "1.5%",  impact: "moyen",      diff: "Faible",      defaultStatus: "todo", date: "31 mars 2026" },
  { id: 3,  count: 1,  label: "Pages non indexables",                    pct: "0.8%",  impact: "moyen",      diff: "Haute",       defaultStatus: "todo", date: "31 mars 2026" },
  { id: 4,  count: 1,  label: "Pages orphelines (0 lien entrant)",       pct: "0.8%",  impact: "fort",       diff: "Faible",      defaultStatus: "todo", date: "31 mars 2026" },
  { id: 5,  count: 0,  label: "Balises titres manquantes",               pct: "0%",    impact: "très-fort",  diff: "Faible",      defaultStatus: "done", date: "15 mars 2026" },
  { id: 6,  count: 0,  label: "Balises titres dupliquées",               pct: "0%",    impact: "très-fort",  diff: "Très faible", defaultStatus: "done", date: "12 mars 2026" },
  { id: 7,  count: 0,  label: "Balises description manquantes",          pct: "0%",    impact: "faible",     diff: "Faible",      defaultStatus: "done", date: "10 mars 2026" },
  { id: 8,  count: 0,  label: "Balises description dupliquées",          pct: "0%",    impact: "faible",     diff: "Faible",      defaultStatus: "done", date: "10 mars 2026" },
  { id: 9,  count: 0,  label: "Balises H1 manquantes",                   pct: "0%",    impact: "fort",       diff: "Faible",      defaultStatus: "done", date: "8 mars 2026"  },
  { id: 10, count: 0,  label: "Balises H1 dupliquées",                   pct: "0%",    impact: "fort",       diff: "Faible",      defaultStatus: "done", date: "8 mars 2026"  },
  { id: 11, count: 0,  label: "Erreurs HTTP (4xx / 5xx)",                pct: "0%",    impact: "fort",       diff: "Très haute",  defaultStatus: "done", date: "5 mars 2026"  },
];

const PAGESPEED_DATA = [
  { url: "/formation/formation-seo/",                       score: 69, lcp: "6.00s", fcp: "3.45s", cls: "0.00", ttfb: "6ms"  },
  { url: "/seo-et-erreur-404-le-guide-pratique/",           score: 70, lcp: "4.44s", fcp: "3.75s", cls: "0.15", ttfb: "4ms"  },
  { url: "/analyse-de-logs-seo-10-bonnes-raisons/",         score: 72, lcp: "4.60s", fcp: "3.60s", cls: "0.00", ttfb: "5ms"  },
  { url: "/",                                               score: 69, lcp: "5.28s", fcp: "4.68s", cls: "0.00", ttfb: "9ms"  },
  { url: "/agence-marketing-digital-sante/",                score: 75, lcp: "4.28s", fcp: "3.60s", cls: "0.00", ttfb: "5ms"  },
  { url: "/agence-marketing-digital-banque-assurance/",     score: 76, lcp: "4.21s", fcp: "3.60s", cls: "0.09", ttfb: "16ms" },
  { url: "/agence-marketing-digital-mode-pret-a-porter/",   score: 76, lcp: "4.20s", fcp: "3.60s", cls: "0.09", ttfb: "8ms"  },
  { url: "/agence-marketing-digital-b2b/",                  score: 78, lcp: "3.90s", fcp: "3.75s", cls: "0.08", ttfb: "53ms" },
  { url: "/agence-seo-mirakl/",                             score: 86, lcp: "3.60s", fcp: "2.10s", cls: "0.08", ttfb: "5ms"  },
];

const CATEGORY_SCORES: { label: string; score: number; icon: ElementType; headline: string; detail: string }[] = [
  { label: "Crawlabilité",    score: 95,  icon: GlobeAltIcon,
    headline: "Robots.txt correct, sitemap référencé, 0 erreur HTTP, profondeur parfaite 1.5 — crawl budget optimisé",
    detail: "Architecture technique exemplaire : robots.txt bien configuré avec sitemap référencé, aucune erreur HTTP (133/133 en 200), profondeur moyenne de 1.5 (idéal < 3), une seule page orpheline. 126 pages avec canonical auto-référençant (correct), 7 sans canonical (mineur). Le crawl budget n'est pas gaspillé." },
  { label: "Indexabilité",    score: 85,  icon: MagnifyingGlassIcon,
    headline: "89% de couverture GSC (118/133 pages crawlées avec impressions) — excellente visibilité, 1 noindex intentionnel",
    detail: "Indexation très saine : 132 pages indexables sur 133, 1 seule page en noindex (probablement intentionnel). Couverture GSC excellente avec 118 pages dans le crawl ET GSC sur 133 crawlées (89%). 15 pages crawlées sans impression GSC = problème de visibilité (ranking bas ou mots-clés sans volume), PAS d'indexation. 0 page noindex avec trafic = aucune perte active." },
  { label: "On-Page",         score: 45,  icon: TagIcon,
    headline: "67% des pages ont des problèmes critiques : 45 titres mal dimensionnés + 43 meta trop longues impactent le CTR sur 246K impressions",
    detail: "Problèmes on-page majeurs : 45 titres avec longueur incorrecte (34% du site), 43 meta descriptions trop longues (32%), 2 titres dupliqués, 2 meta dupliquées, 5 H1 dupliqués. Sur un site avec 246K impressions GSC, ces snippets tronqués représentent une perte de CTR significative. 3 meta absentes complètent le tableau." },
  { label: "Performance",     score: 85,  icon: BoltIcon,
    headline: "Performance excellente : temps moyen 0.16s, 96% des pages < 0.5s, seulement 2 pages critiques > 2s",
    detail: "Performance remarquable : temps de réponse moyen de 0.16s, 128 pages rapides < 0.5s (96%), 2 pages acceptables 0.5–1s, seulement 2 pages critiques > 2s. Les pages lentes identifiées : /formation/formation-seo/ (4.69s, 93 impressions) et /case-studies/page/2/ (3.75s). Impact limité sur le crawl budget." },
  { label: "Images",          score: 75,  icon: PhotoIcon,
    headline: "199 images avec 53% en PNG — opportunité WebP significative pour réduire le poids (238KB moyen acceptable)",
    detail: "Optimisation images correcte mais perfectible : 199 images avec poids moyen acceptable (238KB), mais seulement 21% en WebP vs 53% PNG. Répartition : 53% PNG, 25% JPG, 21% WebP, 1% GIF. La conversion des PNG vers WebP pourrait économiser ~40% de bande passante. Score 84/100 correct mais marge de progression." },
  { label: "Structured Data", score: 25,  icon: CodeBracketIcon,
    headline: "Schemas critiques manquants : Organization et WebSite absents, seulement Answer + BreadcrumbList + BlogPosting détectés",
    detail: "Données structurées insuffisantes pour un site agence : schemas détectés (Answer: 32, BreadcrumbList: 52, BlogPosting: 48) mais manque Organization (identité de l'agence) et WebSite (sitelinks search box). Article recommandé pour les contenus éditoriaux. Score 25/100 critique — rich results perdus." },
  { label: "AI Readiness",    score: 100, icon: CpuChipIcon,
    headline: "Tous les crawlers IA autorisés — visibilité maximale pour ChatGPT, Perplexity, Claude et citations IA",
    detail: "Configuration AI optimale : tous les crawlers IA de recherche autorisés (GPTBot, ClaudeBot, PerplexityBot, etc.). Le site peut être cité dans ChatGPT, Perplexity, Claude et autres assistants IA. Robots.txt bloque uniquement des crawlers SEO indésirables (AhrefsBot, etc.) — stratégie cohérente." },
  { label: "Contenu",         score: 95,  icon: ChatBubbleBottomCenterTextIcon,
    headline: "Contenu riche : 1620 mots moyens, seulement 4 pages thin content (3%) — qualité éditoriale excellente",
    detail: "Qualité de contenu remarquable : 1620 mots en moyenne, distribution équilibrée (67 pages 1000–2000 mots, 26 pages 2000+ mots). Seulement 4 pages thin content < 300 mots (3% du site). 35 pages 500–1000 mots complètent un profil éditorial solide pour une agence SEO." },
];

/* Circular chart data */
const CRAWL_CHARTS = [
  {
    label: "Codes de réponse",
    total: 133,
    slices: [{ label: "2xx", count: 133, color: "var(--color-success)" }],
  },
  {
    label: "Indexabilité",
    total: 133,
    slices: [
      { label: "Indexable", count: 132, color: "var(--color-success)" },
      { label: "Bloqué",    count: 1,   color: "var(--color-danger)" },
    ],
  },
  {
    label: "Titles",
    total: 132,
    slices: [
      { label: "Unique",  count: 130, color: "var(--color-success)" },
      { label: "Doublon", count: 2,   color: "var(--color-warning)" },
    ],
  },
  {
    label: "Méta-descriptions",
    total: 132,
    slices: [
      { label: "Unique",   count: 127, color: "var(--color-success)" },
      { label: "Doublon",  count: 2,   color: "var(--color-warning)" },
      { label: "Manquant", count: 3,   color: "var(--color-danger)" },
    ],
  },
];

/* Extra accordions data */
const EXTRA_ACCORDIONS = [
  {
    id: "redirects",
    icon: ArrowsRightLeftIcon,
    title: "Redirections",
    subtitle: "3 redirections détectées · 0 chaîne",
    rows: [
      { url: "/old-formation-seo/",              target: "/formation/formation-seo/",      type: "301", note: "OK" },
      { url: "/agence-seo-paris/",               target: "/agence-seo/",                   type: "301", note: "OK" },
      { url: "/blog/",                           target: "/ressources/",                   type: "302", note: "Temporaire → à passer en 301" },
    ],
  },
  {
    id: "canonicals",
    icon: LinkIcon,
    title: "Balises canoniques",
    subtitle: "133 pages · 131 auto-canoniques · 2 cross-domain",
    rows: [
      { url: "/formation/formation-seo/",        target: "https://aw-i.com/formation/formation-seo/", type: "self",  note: "OK" },
      { url: "/case-studies/page/2/",            target: "https://aw-i.com/case-studies/",            type: "cross", note: "À vérifier" },
      { url: "/agence-seo-mirakl/",              target: "https://aw-i.com/agence-seo-mirakl/",       type: "self",  note: "OK" },
    ],
  },
  {
    id: "h1",
    icon: DocumentTextIcon,
    title: "Balises H1 & H2",
    subtitle: "133 pages · 0 H1 manquant · 0 H1 dupliqué",
    rows: [
      { url: "/formation/formation-seo/",                      target: "Formation SEO : devenez expert en référencement",     type: "H1", note: "OK" },
      { url: "/agence-marketing-digital-sante/",               target: "Agence Marketing Digital Santé",                      type: "H1", note: "OK" },
      { url: "/agence-marketing-digital-banque-assurance/",    target: "Agence Marketing Digital Banque & Assurance",         type: "H1", note: "OK" },
    ],
  },
  {
    id: "sitemap",
    icon: ServerIcon,
    title: "Fichiers techniques",
    subtitle: "sitemap.xml · robots.txt · Core Web Vitals",
    rows: [
      { url: "/sitemap.xml",   target: "133 URLs · valide · soumis GSC",            type: "Sitemap",    note: "OK" },
      { url: "/robots.txt",   target: "Disallow: /wp-admin/ · Allow: /",            type: "Robots",     note: "OK" },
      { url: "/.well-known/", target: "security.txt présent",                       type: "Sécurité",   note: "OK" },
    ],
  },
];

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
                  <Pill color={accentColor} bg={isCritique ? "var(--color-danger-bg)" : "var(--color-warning-bg)"}>{iss.tag}</Pill>
                  <StatusPillDropdown status={status} onChange={(s) => setUrgentStatus((p) => ({ ...p, [iss.id]: s }))} />
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
      <AuditSection id="tec-optimisations" icon={BoltIcon} title="Optimisations" em="prioritaires" meta="8 actions · 58% du backlog">

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
                  { key: "impact", header: "Impact", width: 90,
                    render: (p) => <span className="type-label font-medium" style={{ color: impactColor(p.impact) }}>{p.impact.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</span> },
                  { key: "diff", header: "Difficulté", width: 90,
                    render: (p) => <span className="type-label">{p.diff}</span> },
                  { key: "status", header: "Statut", width: 150,
                    render: (p) => <StatusPillDropdown status={getP(p.id)} onChange={(s) => setPilotStatus((prev) => ({ ...prev, [p.id]: s }))} /> },
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

    </div>
  );
}
