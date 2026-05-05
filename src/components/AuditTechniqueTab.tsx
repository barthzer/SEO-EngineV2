"use client";

import { useState } from "react";
import {
  ChevronDownIcon, SparklesIcon, ArrowPathIcon, CheckCircleIcon,
  GlobeAltIcon, MagnifyingGlassIcon, DocumentTextIcon, BoltIcon,
  PhotoIcon, CodeBracketIcon, CpuChipIcon, ChatBubbleBottomCenterTextIcon,
  TagIcon, ExclamationTriangleIcon, CheckIcon, ArrowsRightLeftIcon,
  LinkIcon, ServerIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/Button";
import { Tooltip } from "@/components/Tooltip";
import { StatusPill, StatusPillDropdown, type Status } from "@/components/StatusPill";
import type { ElementType } from "react";

/* ── Types ────────────────────────────────────────────────────────────── */


type PilotFilter = "all" | "todo" | "doing" | "done" | "high";

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

const CRAWLERS = [
  { name: "GPTBot",        ok: true },
  { name: "OAI-SearchBot", ok: true },
  { name: "ChatGPT-User",  ok: true },
  { name: "ClaudeBot",     ok: true },
  { name: "PerplexityBot", ok: true },
  { name: "Bytespider",    ok: null },
  { name: "CCBot",         ok: null },
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
    slices: [{ label: "2xx", count: 133, color: "#10B981" }],
  },
  {
    label: "Indexabilité",
    total: 133,
    slices: [
      { label: "Indexable", count: 132, color: "#10B981" },
      { label: "Bloqué",    count: 1,   color: "#E11D48" },
    ],
  },
  {
    label: "Titles",
    total: 132,
    slices: [
      { label: "Unique",  count: 130, color: "#10B981" },
      { label: "Doublon", count: 2,   color: "#F59E0B" },
    ],
  },
  {
    label: "Méta-descriptions",
    total: 132,
    slices: [
      { label: "Unique",   count: 127, color: "#10B981" },
      { label: "Doublon",  count: 2,   color: "#F59E0B" },
      { label: "Manquant", count: 3,   color: "#E11D48" },
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

const STATUS_CYCLE: Status[] = ["todo", "doing", "done"];

function nextStatus(s: Status): Status {
  return STATUS_CYCLE[(STATUS_CYCLE.indexOf(s) + 1) % STATUS_CYCLE.length];
}

function scoreColor(n: number) {
  return n >= 70 ? "#10B981" : n >= 50 ? "#F59E0B" : "#E11D48";
}

function impactColor(impact: string) {
  if (impact.includes("fort")) return "#E11D48";
  if (impact === "moyen") return "#F59E0B";
  return "var(--text-muted)";
}

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

function InfoTip({ headline, detail }: { headline: string; detail: string }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-semibold leading-snug">{headline}</p>
      <p className="leading-relaxed opacity-75">{detail}</p>
    </div>
  );
}

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


function SectionHead({ num, title, em, meta }: { num: string; title: string; em: string; meta: string }) {
  return (
    <div className="mb-6 flex items-baseline justify-between">
      <h2 className="text-[22px] font-semibold tracking-tight text-[var(--text-primary)]">
        <span className="mr-2 text-[13px] font-medium text-[var(--text-muted)]">{num}</span>
        {title} <em className="not-italic text-[var(--text-primary)]">{em}</em>
      </h2>
      <span className="text-[13px] text-[var(--text-muted)]">{meta}</span>
    </div>
  );
}

/* Donut SVG chart */
function DonutChart({ slices, total }: { slices: { label: string; count: number; color: string }[]; total: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const arcs = slices.map((s) => {
    const dash = (s.count / total) * circ;
    const arc = { ...s, dasharray: circ, dashoffset: circ - dash, rotation: offset };
    offset += (s.count / total) * 360;
    return arc;
  });
  return (
    <svg width={84} height={84} viewBox="0 0 84 84">
      <circle cx={42} cy={42} r={r} fill="none" stroke="var(--border-subtle)" strokeWidth={7} />
      {arcs.map((a, i) => (
        <circle key={i} cx={42} cy={42} r={r} fill="none"
          stroke={a.color} strokeWidth={7}
          strokeDasharray={`${a.dasharray}`}
          strokeDashoffset={`${a.dashoffset}`}
          strokeLinecap="butt"
          style={{ transform: `rotate(${a.rotation - 90}deg)`, transformOrigin: "42px 42px" }}
        />
      ))}
      <text x={42} y={46} textAnchor="middle" fontSize={14} fontWeight={600} fill="var(--text-primary)">{total}</text>
    </svg>
  );
}

/* ── Main component ───────────────────────────────────────────────────── */

export function AuditTechniqueTab({ domain }: { domain: string }) {
  const [urgentStatus,  setUrgentStatus]  = useState<Record<string, Status>>({});
  const [actionStatus,  setActionStatus]  = useState<Record<number, Status>>({});
  const [schemaStatus,  setSchemaStatus]  = useState<Record<string, Status>>({});
  const [pilotStatus,   setPilotStatus]   = useState<Record<number, Status>>(
    Object.fromEntries(PILOT_DATA.map((p) => [p.id, p.defaultStatus]))
  );
  const [pilotFilter,   setPilotFilter]   = useState<PilotFilter>("all");
  const [expandedAction, setExpandedAction] = useState<number | null>(null);
  const [rawOpen,       setRawOpen]       = useState(false);
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({});

  const getU = (id: string): Status => urgentStatus[id] ?? "todo";
  const getA = (id: number): Status => actionStatus[id] ?? "todo";
  const getP = (id: number): Status => pilotStatus[id];

  const pilotCounts = {
    todo:  PILOT_DATA.filter((p) => getP(p.id) === "todo").length,
    doing: PILOT_DATA.filter((p) => getP(p.id) === "doing").length,
    done:  PILOT_DATA.filter((p) => getP(p.id) === "done").length,
  };
  const pilotPct = Math.round((pilotCounts.done / PILOT_DATA.length) * 100);

  const visiblePilot = PILOT_DATA.filter((p) => {
    if (pilotFilter === "all")   return true;
    if (pilotFilter === "high")  return ["fort", "très-fort"].includes(p.impact);
    return getP(p.id) === pilotFilter;
  });

  const toggleAccordion = (id: string) =>
    setOpenAccordions((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="flex flex-col gap-8">

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <div id="tec-synthese" className="overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-8">
        <div className="grid grid-cols-[2fr_1fr] gap-8 items-center">
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full bg-[rgba(16,185,129,0.1)] px-3 py-1.5 text-[12px] font-semibold text-[#10B981]">Audit terminé</span>
              <span className="text-[13px] text-[var(--text-muted)]">31 mars 2026</span>
              <span className="text-[13px] text-[var(--text-muted)]">·</span>
              <span className="text-[13px] text-[var(--text-muted)]">{domain}</span>
            </div>
            <h1 className="text-[32px] font-semibold leading-tight tracking-tight text-[var(--text-primary)]">
              Site sain mais{" "}
              <span style={{ color: "#E11D48" }}>~99 visites/mois</span>
              <br />menacées par 5 urgences techniques.
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--text-secondary)]">
              Score 84/100, performance solide (0.16s moyen), excellente indexation. Mais{" "}
              67% des pages ont des problèmes on-page critiques{" "}
              qui dégradent le CTR sur 246K impressions/mois. Trois urgences exigent une intervention dans les 7 jours.
            </p>
            <div className="mt-5 flex flex-wrap gap-6 text-[13px] text-[var(--text-muted)]">
              {[
                { v: "133",  l: "pages crawlées" },
                { v: "246K", l: "impressions/mois" },
                { v: "1620", l: "mots/page" },
              ].map((m) => (
                <span key={m.l}><strong className="text-[15px] text-[var(--text-primary)]">{m.v}</strong> {m.l}</span>
              ))}
            </div>
            <div className="mt-6">
              <Button size="sm" variant="secondary">
                <ArrowPathIcon className="h-4 w-4" />
                Relancer l'audit
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <svg width={160} height={160} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={80} cy={80} r={68} fill="none" stroke="var(--border-subtle)" strokeWidth={7} />
                <circle cx={80} cy={80} r={68} fill="none" stroke="#10B981" strokeWidth={7}
                  strokeDasharray={2 * Math.PI * 68} strokeDashoffset={2 * Math.PI * 68 * 0.16} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[44px] font-semibold leading-none text-[var(--text-primary)]">84</span>
                <span className="text-[14px] text-[var(--text-muted)]">/100</span>
              </div>
            </div>
            <p className="text-[13px] font-medium text-[var(--text-muted)]">Score technique</p>
            <p className="text-[12px] text-[var(--text-muted)]">Grade <strong style={{ color: "#10B981" }}>B</strong> · médiane secteur 72</p>
          </div>
        </div>
      </div>

      {/* Verdict cards — hors du hero */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { key: "blocker",     color: "#E11D48", label: "Bloqueur",     text: "67% des pages (88/133) ont des problèmes de titres ou méta — les snippets Google sont tronqués, le CTR est en baisse sur 246K impressions/mois." },
          { key: "opportunity", color: "#3E50F5", label: "Opportunité",  text: "Corriger les 45 titres mal dimensionnés — ratio impact/effort optimal car 88% des pages crawlées ont des impressions GSC." },
          { key: "crawl",       color: "#10B981", label: "Crawl budget", text: "Profondeur idéale (1.5), 0 erreur HTTP, 1 seule orpheline, sitemap correct. Le crawl budget est optimisé sur ce site de 133 pages." },
        ].map((v) => (
          <div key={v.key} className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]"
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

      {/* ── 01. URGENCES BUSINESS ───────────────────────────────────── */}
      <div id="tec-urgences">
        <SectionHead num="01." title="Urgences" em="business" meta="À traiter sous 7 jours" />

        {/* Callout */}
        <div className="mb-5 flex items-center gap-4 rounded-2xl border border-[rgba(225,29,72,0.25)] bg-[rgba(225,29,72,0.05)] px-6 py-5">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#E11D48] text-[14px] font-bold text-white">!</div>
          <p className="text-[14px] text-[var(--text-secondary)]">
            <strong className="text-[#E11D48]">~99 visites/mois à risque</strong>{" "}
            · 5 urgences techniques détectées impactent directement votre trafic actuel ou votre indexation. Chaque jour de retard équivaut à environ 3 visites perdues.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {URGENT_ISSUES.map((iss) => {
            const status = getU(iss.id);
            const isCritique = iss.severity === "critique";
            const accentColor = isCritique ? "#E11D48" : "#F59E0B";
            return (
              <div key={iss.id} className={`overflow-hidden rounded-2xl border bg-[var(--bg-card)] ${status === "done" ? "opacity-50" : ""}`}
                style={{ borderColor: "var(--border-subtle)", borderLeftColor: accentColor, borderLeftWidth: 3 }}>
                <div className="p-6">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md px-3 py-1.5 text-[12px] font-semibold"
                        style={{ color: accentColor, backgroundColor: isCritique ? "rgba(225,29,72,0.08)" : "rgba(245,158,11,0.1)" }}>
                        {iss.tag}
                      </span>
                    </div>
                    <StatusDot status={status} onClick={() => setUrgentStatus((p) => ({ ...p, [iss.id]: nextStatus(getU(iss.id)) }))} />
                  </div>
                  <p className="mb-1 text-[12px] font-medium text-[var(--text-muted)]">
                    Impact · <span style={{ color: accentColor }}>{iss.impactLabel}</span>
                  </p>
                  <p className={`mb-3 text-[15px] font-medium leading-snug ${status === "done" ? "line-through text-[var(--text-muted)]" : "text-[var(--text-primary)]"}`}>
                    {iss.title}
                  </p>
                  <p className="mb-4 text-[13px] leading-snug text-[var(--text-secondary)]">{iss.detail}</p>
                  <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card-hover)] px-3 py-2 font-mono text-[12px] text-[var(--text-muted)]">
                    {iss.url}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <StatusPill status={status} />
                    <span className="text-[12px] text-[var(--text-muted)]">détecté {iss.date}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 02. OPTIMISATIONS PRIORITAIRES ──────────────────────────── */}
      <div id="tec-optimisations">
        <SectionHead num="02." title="Optimisations" em="prioritaires" meta="8 actions · 58% du backlog" />

        {/* GSC × Crawl */}
        <div className="mb-4 overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-7">
          <div className="mb-5 flex items-baseline justify-between">
            <h3 className="text-[19px] font-semibold tracking-tight text-[var(--text-primary)]">
              Croisement <span className="text-[#3E50F5]">Crawl × GSC</span>
            </h3>
            <span className="text-[12px] text-[var(--text-muted)]">Snapshot · 27 avril 2026</span>
          </div>

          {/* Couverture headline */}
          <div className="mb-5 flex items-start gap-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6">
            <span className="text-[52px] font-semibold leading-none tracking-tight" style={{ color: "#10B981" }}>89<span className="text-[22px] text-[var(--text-muted)]">%</span></span>
            <div>
              <p className="mb-1 text-[12px] font-semibold text-[var(--text-muted)]">Couverture GSC</p>
              <p className="text-[14px] leading-relaxed text-[var(--text-secondary)]">
                <strong className="text-[var(--text-primary)]">118 pages crawlées sur 133 reçoivent des impressions.</strong>{" "}
                Excellente couverture globale. Mais 15 pages restantes sont indexées sans aucune visibilité : ranking trop bas, pas un problème d'indexation.
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="mb-5 grid grid-cols-5 divide-x divide-[var(--border-subtle)]">
            {[
              { v: "133",   l: "URLs crawlées",     c: "var(--text-primary)" },
              { v: "118",   l: "Avec impressions",  c: "#3E50F5" },
              { v: "15",    l: "Sans impression",   c: "#F59E0B" },
              { v: "214.1K",l: "Impressions/mois",  c: "var(--text-primary)" },
              { v: "246",   l: "Clics/mois",        c: "var(--text-primary)" },
            ].map((s) => (
              <div key={s.l} className="px-4 first:pl-0 last:pr-0">
                <p className="text-[26px] font-semibold leading-none tracking-tight" style={{ color: s.c }}>{s.v}</p>
                <p className="mt-1 text-[12px] text-[var(--text-muted)]">{s.l}</p>
              </div>
            ))}
          </div>

          {/* Stacked bar */}
          <div className="mb-2 flex h-7 overflow-hidden rounded-lg">
            <div className="flex items-center justify-center text-[12px] font-semibold text-white" style={{ flex: 118, backgroundColor: "#10B981" }}>118</div>
            <div className="flex items-center justify-center text-[12px] font-semibold text-white" style={{ flex: 15,  backgroundColor: "#F59E0B" }}>15</div>
          </div>
          <div className="mb-4 flex gap-5 text-[13px] text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{ backgroundColor: "#10B981" }} />Crawl + impressions GSC · 118 (89%)</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{ backgroundColor: "#F59E0B" }} />Crawlées sans impression · 15 (11%)</span>
          </div>
          <div className="rounded-2xl border border-[rgba(245,158,11,0.15)] bg-[rgba(245,158,11,0.07)] p-4 text-[14px] leading-relaxed text-[var(--text-secondary)]">
            <strong className="text-[var(--text-primary)]">À retenir :</strong> ces 15 pages sont bien indexées par Google (pas un blocage technique), mais leur ranking est trop bas pour apparaître en SERP. C'est un signal de pertinence ou de maillage interne insuffisant — à diagnostiquer page par page.
          </div>
        </div>

        {/* Actions + Schemas */}
        <div className="grid grid-cols-2 gap-4">
          {/* Actions */}
          <div className="overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
            <div className="flex items-center justify-between px-6 py-4">
              <p className="text-[14px] font-semibold text-[var(--text-primary)]">Actions prioritaires</p>
              <span className="text-[13px] text-[var(--text-muted)]">{PRIORITY_ACTIONS.length} actions</span>
            </div>
            <div className="border-t border-[var(--border-subtle)]">
              {PRIORITY_ACTIONS.map((action, i) => {
                const status = getA(action.id);
                const isOpen = expandedAction === action.id;
                const priorityColor = action.priority === "high" ? "#E11D48" : action.priority === "medium" ? "#F59E0B" : "var(--text-muted)";
                return (
                  <div key={action.id} className={i < PRIORITY_ACTIONS.length - 1 ? "border-b border-[var(--border-subtle)]" : ""}>
                    <button onClick={() => setExpandedAction(isOpen ? null : action.id)}
                      className={`flex w-full items-center gap-3 px-6 py-4 text-left cursor-pointer ${status === "done" ? "opacity-50" : ""}`}>
                      <StatusDot status={status} onClick={() => setActionStatus((p) => ({ ...p, [action.id]: nextStatus(getA(action.id)) }))} />
                      <span className="w-5 flex-shrink-0 text-center font-mono text-[12px] text-[var(--text-muted)]">{String(action.id).padStart(2, "0")}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[14px] font-medium ${status === "done" ? "line-through text-[var(--text-muted)]" : "text-[var(--text-primary)]"}`}>{action.title}</p>
                        <p className="text-[12px] text-[var(--text-muted)]">{action.sub}</p>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-1.5">
                        <span className="rounded-md px-3 py-1.5 text-[12px] font-semibold" style={{ color: priorityColor, backgroundColor: `${priorityColor}15` }}>{action.priority.toUpperCase()}</span>
                        <ChevronDownIcon className="h-3.5 w-3.5 text-[var(--text-muted)] transition-transform" style={{ transform: isOpen ? "rotate(180deg)" : "none" }} />
                      </div>
                    </button>
                    {isOpen && (
                      <div className="border-t border-[var(--border-subtle)] px-6 py-4">
                        <p className="mb-0.5 text-[12px] font-semibold text-[var(--text-muted)]">Impact</p>
                        <p className="mb-3 text-[13px] text-[var(--text-secondary)]">{action.impact}</p>
                        <p className="mb-0.5 text-[12px] font-semibold text-[var(--text-muted)]">Correction</p>
                        <p className="text-[13px] text-[var(--text-secondary)]">{action.fix}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Schemas */}
          <div className="overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
            <div className="px-6 py-4">
              <p className="text-[14px] font-semibold text-[var(--text-primary)]">
                Schemas <span style={{ color: "#E11D48" }}>25/100</span>
              </p>
              <p className="mt-0.5 text-[13px] text-[var(--text-muted)]">2 schemas critiques manquants · 3 présents</p>
            </div>
            <div className="border-t border-[var(--border-subtle)]">
              {SCHEMA_ITEMS.map((s) => {
                const overrideStatus = schemaStatus[s.id];
                const canToggle = s.status !== "ok";
                const effectiveStatus: Status = canToggle ? (overrideStatus ?? "todo") : "done";
                const statusColors = { ok: "#10B981", missing: "#E11D48", suggest: "#F59E0B" };
                const statusLabels = { ok: "Détecté", missing: "Critique", suggest: "Recommandé" };
                return (
                  <div key={s.id} className={`flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-6 py-4 last:border-0 ${effectiveStatus === "done" && canToggle ? "opacity-50" : ""}`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[14px] text-[var(--text-primary)]">{s.name}</span>
                      {s.detail && <span className="text-[12px] text-[var(--text-muted)]">{s.detail}</span>}
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <span className="rounded-full px-3 py-1.5 text-[12px] font-semibold"
                        style={{ color: statusColors[s.status], backgroundColor: `${statusColors[s.status]}15` }}>
                        {statusLabels[s.status]}
                      </span>
                      {canToggle && (
                        <StatusDot status={effectiveStatus} onClick={() => setSchemaStatus((p) => ({ ...p, [s.id]: nextStatus(effectiveStatus) }))} />
                      )}
                      {!canToggle && <CheckCircleIcon className="h-4 w-4 text-[#10B981]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── 03. DIAGNOSTIC COMPLET ──────────────────────────────────── */}
      <div id="tec-diagnostic">
        <SectionHead num="03." title="Diagnostic" em="complet" meta="État de santé par dimension" />

        {/* Subscores */}
        <div className="mb-4 grid grid-cols-4 gap-3">
          {CATEGORY_SCORES.map((c) => {
            const color = scoreColor(c.score);
            const Icon = c.icon;
            return (
              <div key={c.label} className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
                <div className="mb-3 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-4 w-4 text-[var(--text-muted)]" />
                    <p className="text-[12px] font-medium text-[var(--text-muted)]">{c.label}</p>
                  </div>
                  <Tooltip portal rich side="bottom" label={<InfoTip headline={c.headline} detail={c.detail} />}>
                    <span className="cursor-help text-[var(--text-muted)] opacity-40 transition-opacity hover:opacity-100">
                      <InfoIcon />
                    </span>
                  </Tooltip>
                </div>
                <p className="mb-2 text-[26px] font-semibold leading-none tracking-tight text-[var(--text-primary)]">
                  {c.score}<span className="text-[14px] font-normal text-[var(--text-muted)]">/100</span>
                </p>
                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bg-card-hover)]">
                  <div className="h-full rounded-full" style={{ width: `${c.score}%`, backgroundColor: color }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Circular crawl charts — 2×2 */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          {CRAWL_CHARTS.map((chart) => (
            <div key={chart.label} className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
              <p className="mb-4 text-[13px] font-semibold text-[var(--text-primary)]">{chart.label}</p>
              <div className="flex items-center gap-6">
                <DonutChart slices={chart.slices} total={chart.total} />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-center justify-between text-[12px] font-semibold text-[var(--text-muted)]">
                    <span>Total</span>
                    <span className="text-[var(--text-primary)]">{chart.total}</span>
                  </div>
                  <div className="h-px bg-[var(--border-subtle)]" />
                  {chart.slices.map((s) => (
                    <div key={s.label} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="text-[13px] text-[var(--text-secondary)]">{s.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[13px] font-semibold tabular-nums" style={{ color: s.color }}>{s.count}</span>
                        <span className="ml-1 text-[11px] text-[var(--text-muted)]">({Math.round(s.count / chart.total * 100)}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PageSpeed */}
        <div className="mb-4 overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
          <div className="flex items-center justify-between px-7 py-5">
            <p className="text-[15px] font-semibold text-[var(--text-primary)]">PageSpeed · 10 URLs les plus lentes</p>
            <span className="text-[13px] text-[var(--text-muted)]">desktop · cible LCP &lt; 2.5s</span>
          </div>
          <div className="grid grid-cols-[1fr_56px_64px_64px_56px_56px] gap-3 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-7 py-3 text-[12px] font-semibold text-[var(--text-muted)]">
            <span>URL</span><span className="text-right">Score</span><span className="text-right">LCP</span>
            <span className="text-right">FCP</span><span className="text-right">CLS</span><span className="text-right">TTFB</span>
          </div>
          {PAGESPEED_DATA.map((row, i) => {
            const sc = scoreColor(row.score);
            const lcpBad = parseFloat(row.lcp) > 4;
            return (
              <div key={i} className={`grid grid-cols-[1fr_56px_64px_64px_56px_56px] items-center gap-3 border-t border-[var(--border-subtle)] px-7 py-3 text-[13px]`}>
                <span className="truncate font-mono text-[var(--text-muted)]">{row.url}</span>
                <span className="text-right font-semibold text-[var(--text-primary)]">{row.score}</span>
                <span className="text-right" style={{ color: lcpBad ? "#E11D48" : "#F59E0B" }}>{row.lcp}</span>
                <span className="text-right text-[var(--text-muted)]">{row.fcp}</span>
                <span className="text-right text-[var(--text-muted)]">{row.cls}</span>
                <span className="text-right text-[var(--text-muted)]">{row.ttfb}</span>
              </div>
            );
          })}
        </div>

        {/* AI Readiness */}
        <div className="overflow-hidden rounded-3xl border border-[rgba(62,80,245,0.2)] bg-[rgba(62,80,245,0.04)] p-7">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-[52px] font-semibold leading-none tracking-tight" style={{ color: "#3E50F5" }}>100</span>
              <span className="text-[22px] text-[var(--text-muted)]">/100</span>
            </div>
            <div className="flex-1">
              <p className="mb-1 text-[17px] font-semibold tracking-tight text-[var(--text-primary)]">
                AI Readiness · <span style={{ color: "#3E50F5" }}>excellence GEO</span>
              </p>
              <p className="mb-3 text-[14px] leading-relaxed text-[var(--text-secondary)]">
                7 crawlers IA autorisés sur 7. Votre site est entièrement accessible à GPTBot, ClaudeBot, PerplexityBot et OAI-SearchBot.
              </p>
              <div className="flex flex-wrap gap-2">
                {CRAWLERS.map((c) => (
                  <span key={c.name} className="rounded-full px-3 py-1.5 text-[12px] font-semibold"
                    style={{ backgroundColor: c.ok === true ? "rgba(16,185,129,0.1)" : "var(--bg-secondary)", color: c.ok === true ? "#10B981" : "var(--text-muted)" }}>
                    {c.name}{c.ok === true ? " ✓" : ""}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 04. DONNÉES BRUTES ──────────────────────────────────────── */}
      <div id="tec-donnees">
        <SectionHead num="04." title="Données" em="brutes" meta="Pour aller plus loin" />

        <div className="flex flex-col gap-3">
          {/* Pilot table accordion */}
          <div className="overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
            <button onClick={() => setRawOpen((v) => !v)}
              className="flex w-full items-center justify-between px-7 py-5 text-left cursor-pointer">
              <div>
                <p className="text-[15px] font-semibold text-[var(--text-primary)]">Problèmes techniques · registre de pilotage</p>
                <p className="mt-0.5 text-[13px] text-[var(--text-muted)]">12 actions · {pilotCounts.todo} à faire</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-28 overflow-hidden rounded-full bg-[var(--bg-card-hover)]">
                    <div className="h-full rounded-full bg-[#10B981] transition-all" style={{ width: `${pilotPct}%` }} />
                  </div>
                  <span className="font-mono text-[13px] font-semibold" style={{ color: "#10B981" }}>{pilotPct}%</span>
                </div>
                <ChevronDownIcon className="h-4 w-4 text-[var(--text-muted)] transition-transform" style={{ transform: rawOpen ? "rotate(180deg)" : "none" }} />
              </div>
            </button>

            {rawOpen && (
              <div className="border-t border-[var(--border-subtle)]">
                {/* Counts + filters */}
                <div className="flex items-center justify-between gap-4 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-7 py-3">
                  <div className="flex gap-2">
                    {(["todo", "doing", "done"] as const).map((s) => (
                      <span key={s} className="rounded-full px-3 py-1.5 text-[12px] font-semibold"
                        style={{ backgroundColor: s === "todo" ? "rgba(225,29,72,0.08)" : s === "doing" ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)",
                                 color: s === "todo" ? "#E11D48" : s === "doing" ? "#F59E0B" : "#10B981" }}>
                        {pilotCounts[s]} {{ todo: "À faire", doing: "En cours", done: "Terminé" }[s].toLowerCase()}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    {(["all", "todo", "doing", "done", "high"] as const).map((f) => (
                      <button key={f} onClick={() => setPilotFilter(f)}
                        className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors ${pilotFilter === f ? "bg-[var(--text-primary)] text-[var(--bg-card)]" : "text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]"}`}>
                        {f === "all" ? "Tout" : f === "high" ? "Fort+" : { todo: "À faire", doing: "En cours", done: "Terminé" }[f as Status]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table */}
                <div className="grid grid-cols-[32px_48px_1fr_90px_90px_100px_100px] gap-3 border-b border-[var(--border-subtle)] px-7 py-3 text-[11px] font-semibold text-[var(--text-muted)]">
                  <span /><span>Pages</span><span>Description</span>
                  <span>Impact</span><span>Difficulté</span><span>Statut</span><span>Date</span>
                </div>
                {visiblePilot.map((p) => {
                  const st = getP(p.id);
                  return (
                    <div key={p.id} className={`grid grid-cols-[32px_48px_1fr_90px_90px_100px_100px] items-center gap-3 border-b border-[var(--border-subtle)] px-7 py-3 last:border-0 transition-opacity ${st === "done" ? "opacity-50" : ""}`}>
                      <StatusDot status={st} onClick={() => setPilotStatus((prev) => ({ ...prev, [p.id]: nextStatus(st) }))} />
                      <span className={`rounded-md px-2 py-0.5 text-center font-mono text-[13px] font-semibold ${p.count === 0 ? "bg-[rgba(16,185,129,0.1)] text-[#10B981]" : "bg-[rgba(225,29,72,0.08)] text-[#E11D48]"}`}>
                        {p.count}
                      </span>
                      <span className={`text-[14px] font-medium ${st === "done" ? "line-through text-[var(--text-muted)]" : "text-[var(--text-primary)]"}`}>
                        {p.label}
                      </span>
                      <span className="text-[13px] font-medium" style={{ color: impactColor(p.impact) }}>
                        {p.impact.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                      <span className="text-[13px] text-[var(--text-muted)]">{p.diff}</span>
                      <StatusPill status={st} />
                      <span className="text-[12px] text-[var(--text-muted)]">{p.date}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Extra accordions */}
          {EXTRA_ACCORDIONS.map((acc) => {
            const isOpen = openAccordions[acc.id];
            const Icon = acc.icon;
            return (
              <div key={acc.id} className="overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
                <button onClick={() => toggleAccordion(acc.id)}
                  className="flex w-full items-center justify-between px-7 py-5 text-left cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-[var(--text-muted)]" />
                    <div>
                      <p className="text-[15px] font-semibold text-[var(--text-primary)]">{acc.title}</p>
                      <p className="mt-0.5 text-[13px] text-[var(--text-muted)]">{acc.subtitle}</p>
                    </div>
                  </div>
                  <ChevronDownIcon className="h-4 w-4 flex-shrink-0 text-[var(--text-muted)] transition-transform" style={{ transform: isOpen ? "rotate(180deg)" : "none" }} />
                </button>

                {isOpen && (
                  <div className="border-t border-[var(--border-subtle)]">
                    <div className="grid grid-cols-[1fr_1fr_80px_80px] gap-4 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-7 py-3 text-[12px] font-semibold text-[var(--text-muted)]">
                      <span>URL source</span><span>Cible / Valeur</span><span>Type</span><span>Statut</span>
                    </div>
                    {acc.rows.map((row, i) => (
                      <div key={i} className={`grid grid-cols-[1fr_1fr_80px_80px] items-center gap-4 border-b border-[var(--border-subtle)] px-7 py-3 last:border-0 text-[13px]`}>
                        <span className="truncate font-mono text-[var(--text-muted)]">{row.url}</span>
                        <span className="truncate text-[var(--text-secondary)]">{row.target}</span>
                        <span className="font-mono text-[12px] text-[var(--text-muted)]">{row.type}</span>
                        <span className={`font-medium ${row.note === "OK" ? "text-[#10B981]" : row.note.includes("vérifier") || row.note.includes("Temporaire") ? "text-[#F59E0B]" : "text-[var(--text-muted)]"}`}>
                          {row.note}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-3 text-[12px] text-[var(--text-muted)]">
          Snapshot du 31 mars 2026 · prochain audit programmé le 30 avril 2026
        </p>
      </div>

    </div>
  );
}
