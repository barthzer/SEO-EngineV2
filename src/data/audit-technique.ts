/**
 * Audit Technique — contrat de type + mock.
 *
 * Sorti de `src/components/AuditTechniqueTab.tsx` pour le handoff back (voir HANDOFF.md).
 * Vraie requête → `src/db/queries/audit-technique.ts` (fallback mock).
 * NB : `CATEGORY_SCORES[].icon` est un choix UI — côté back, exposer plutôt une clé.
 */

import type { ElementType } from "react";
import {
  GlobeAltIcon, MagnifyingGlassIcon, TagIcon, BoltIcon, PhotoIcon,
  CodeBracketIcon, CpuChipIcon, ChatBubbleBottomCenterTextIcon,
  ArrowsRightLeftIcon, LinkIcon, DocumentTextIcon, ServerIcon,
} from "@heroicons/react/24/outline";
import { type Status } from "@/components/StatusPill";
import { type RiskInfo } from "@/data/risk";

/* ── Data ─────────────────────────────────────────────────────────────── */

/** `risk` (optionnel) : niveau de risque de la correction proposée, voir `src/data/risk.ts`. */
export const URGENT_ISSUES: {
  id: string; severity: string; tag: string; impactLabel: string; title: string; detail: string; url: string; date: string; risk?: RiskInfo;
}[] = [
  { id: "403",       severity: "critique", tag: "HTTP 403 · Critique",        impactLabel: "indexation bloquée",
    title: "3 backlinks pointent vers des pages renvoyant 403",
    detail: "Du jus de lien provenant de Journal du Net, Usine Nouvelle et l'AFP arrive sur des pages refusées. Perte sèche d'autorité.",
    url: "journaldunet.com → /solutions/seo-referencement/...",
    date: "31 mars 2026",
    risk: { level: "costly",
      undo: "Correction proposée : rediriger en 301 les 3 pages refusées vers leur équivalent actif. Revenir en arrière demande plusieurs semaines de recrawl, avec une perte de signal entre-temps.",
      evidence: "Les 3 URLs renvoient 403 depuis le 12 mars et leur contenu a été republié à une nouvelle adresse (même titre, même H1)." } },
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

export const PRIORITY_ACTIONS: {
  id: number; title: string; sub: string; effort: string; priority: string; category: string; impact: string; fix: string; risk?: RiskInfo;
}[] = [
  { id: 1, title: "Réécrire les 45 titres mal dimensionnés",          sub: "50-60 caractères · mot-clé + valeur ajoutée",                  effort: "3-4h",   priority: "high",   category: "On-Page",         impact: "CTR +5-15% sur les 45 pages corrigées. Délai d'effet : 2-6 semaines (Transition Rank).",          fix: "Réécrire en 50-60 caractères avec mot-clé principal + valeur ajoutée. Format : « Mot-clé | Valeur ajoutée | Marque »" },
  { id: 2, title: "Implémenter Schema Organization site-wide",        sub: "Knowledge Panel · signaux E-E-A-T",                            effort: "45 min", priority: "high",   category: "Structured Data", impact: "Knowledge Panel Google activé, signaux E-E-A-T renforcés, rich snippets améliorés.",               fix: "Ajouter JSON-LD dans le <head> : name, description, url, logo, sameAs, address, contactPoint" },
  { id: 3, title: "Réécrire les 43 meta descriptions trop longues",   sub: "140-155 caractères · CTA inclus",                              effort: "2-3h",   priority: "high",   category: "On-Page",         impact: "Snippets non tronqués, CTR +3-10%. Délai d'effet : 2-6 semaines.",                                 fix: "Inclure mot-clé + CTA en 140-155 chars. Prioriser les pages > 50 impressions/mois" },
  { id: 4, title: "Investiguer le TTFB de /formation/formation-seo/", sub: "4.69s actuel · cible < 1s · LCP critique",                     effort: "2-3h",   priority: "medium", category: "Performance",      impact: "Temps < 1s, LCP amélioré, expérience utilisateur optimisée sur page à trafic.",                   fix: "Cache serveur, optimisation BDD, lazy loading des ressources. 93 impressions GSC sur cette page" },
  { id: 5, title: "Schema WebSite avec sitelinks searchbox",          sub: "Sitelinks SERP · navigation directe",                          effort: "30 min", priority: "medium", category: "Structured Data", impact: "Sitelinks avec search box dans Google, navigation SERP améliorée.",                              fix: "JSON-LD avec name, url, potentialAction + SearchAction pour la recherche interne" },
  { id: 6, title: "Convertir 105 images PNG en WebP",                 sub: "53% des 199 images · ~40% de poids estimé",                    effort: "2-3h",   priority: "medium", category: "Images",           impact: "~40% de réduction du poids des images PNG, LCP amélioré.",                                        fix: "Script de conversion automatique ou plugin build. Vérifier les balises <picture> pour le fallback" },
  { id: 7, title: "Identifier et mailler la page orpheline",          sub: "1 page · 0 lien entrant interne",                              effort: "30 min", priority: "low",    category: "Crawl",            impact: "PageRank distribué, crawl budget optimisé.",                                                       fix: "Lien depuis page parent, menu, ou footer selon pertinence thématique" },
  { id: 9, title: "Passer /blog/ en redirection 301 vers /ressources/", sub: "Redirection 302 temporaire · signal non transmis",         effort: "15 min", priority: "medium", category: "Crawl",            impact: "Autorité de /blog/ transmise à /ressources/, une seule URL indexée.",                              fix: "Remplacer la 302 par une 301 côté serveur, mettre à jour le maillage interne vers /ressources/",
    risk: { level: "costly", undo: "Une 301 est mise en cache par Google et les navigateurs : revenir en arrière demande plusieurs semaines, avec une perte de signal entre-temps.", evidence: "/blog/ redirige en 302 vers /ressources/ depuis plus de 6 mois : la redirection est de fait permanente." } },
  { id: 10, title: "Désindexer les 38 pages de tags sans trafic",     sub: "noindex en masse · 0 clic sur 12 mois",                        effort: "30 min", priority: "low",    category: "Indexation",       impact: "Budget de crawl recentré sur les pages utiles, moins de contenu faible indexé.",                     fix: "Ajouter <meta name=\"robots\" content=\"noindex, follow\"> sur le template des pages de tags",
    risk: { level: "irreversible", undo: "38 pages sortent de l'index d'un coup. Les réindexer ne restaure ni leurs positions ni leur historique, et Google peut mettre des mois à les reprendre.", evidence: "Les 38 pages de tags n'ont reçu aucun clic et moins de 5 impressions chacune sur 12 mois (Search Console)." } },
  { id: 8, title: "Créer un fichier /llms.txt pour les LLM",         sub: "Citations IA mieux contextualisées",                           effort: "30 min", priority: "low",    category: "AI Readiness",     impact: "Citations IA mieux contextualisées et plus fréquentes.",                                          fix: "Format markdown avec description agence, services principaux, pages clés et signaux E-E-A-T" },
];

export const SCHEMA_ITEMS = [
  { id: "breadcrumb", name: "BreadcrumbList", detail: "52 pages",  status: "ok"      as const },
  { id: "blog",       name: "BlogPosting",    detail: "48 pages",  status: "ok"      as const },
  { id: "answer",     name: "Answer",         detail: "32 pages",  status: "ok"      as const },
  { id: "org",        name: "Organization",   detail: "",          status: "missing" as const },
  { id: "website",    name: "WebSite",        detail: "",          status: "missing" as const },
  { id: "article",    name: "Article",        detail: "",          status: "suggest" as const },
];

export const CRAWLERS: { name: string; ok: boolean | null; domain: string }[] = [
  { name: "GPTBot",        ok: true,  domain: "openai.com" },
  { name: "OAI-SearchBot", ok: true,  domain: "openai.com" },
  { name: "ChatGPT-User",  ok: true,  domain: "openai.com" },
  { name: "ClaudeBot",     ok: true,  domain: "anthropic.com" },
  { name: "PerplexityBot", ok: true,  domain: "perplexity.ai" },
  { name: "Bytespider",    ok: null,  domain: "bytedance.com" },
  { name: "CCBot",         ok: null,  domain: "commoncrawl.org" },
];

export const PILOT_DATA: { id: number; count: number; label: string; pct: string; impact: string; diff: string; defaultStatus: Status; date: string; risk?: RiskInfo }[] = [
  { id: 0,  count: 45, label: "Balises titres avec longueur incorrecte", pct: "33.8%", impact: "moyen",      diff: "Faible",      defaultStatus: "todo", date: "31 mars 2026" },
  { id: 1,  count: 43, label: "Balises description trop longues",        pct: "32.3%", impact: "très-faible",diff: "Faible",      defaultStatus: "todo", date: "31 mars 2026" },
  { id: 2,  count: 2,  label: "Temps de réponse lent (> 1s)",           pct: "1.5%",  impact: "moyen",      diff: "Faible",      defaultStatus: "todo", date: "31 mars 2026" },
  { id: 3,  count: 1,  label: "Pages non indexables",                    pct: "0.8%",  impact: "moyen",      diff: "Haute",       defaultStatus: "todo", date: "31 mars 2026" },
  { id: 4,  count: 1,  label: "Pages orphelines (0 lien entrant)",       pct: "0.8%",  impact: "fort",       diff: "Faible",      defaultStatus: "todo", date: "31 mars 2026" },
  { id: 12, count: 38, label: "Pages de tags à désindexer (noindex)",     pct: "28.6%", impact: "faible",     diff: "Faible",      defaultStatus: "todo", date: "31 mars 2026",
    risk: { level: "irreversible", undo: "38 pages sortent de l'index d'un coup. Les réindexer ne restaure ni leurs positions ni leur historique.", evidence: "Aucun clic et moins de 5 impressions par page sur 12 mois (Search Console)." } },
  { id: 13, count: 1,  label: "Redirection 302 à passer en 301 (/blog/)", pct: "0.8%",  impact: "moyen",      diff: "Faible",      defaultStatus: "todo", date: "31 mars 2026",
    risk: { level: "costly", undo: "Une 301 est mise en cache par Google et les navigateurs : revenir en arrière demande plusieurs semaines.", evidence: "/blog/ redirige en 302 vers /ressources/ depuis plus de 6 mois." } },
  { id: 5,  count: 0,  label: "Balises titres manquantes",               pct: "0%",    impact: "très-fort",  diff: "Faible",      defaultStatus: "done", date: "15 mars 2026" },
  { id: 6,  count: 0,  label: "Balises titres dupliquées",               pct: "0%",    impact: "très-fort",  diff: "Très faible", defaultStatus: "done", date: "12 mars 2026" },
  { id: 7,  count: 0,  label: "Balises description manquantes",          pct: "0%",    impact: "faible",     diff: "Faible",      defaultStatus: "done", date: "10 mars 2026" },
  { id: 8,  count: 0,  label: "Balises description dupliquées",          pct: "0%",    impact: "faible",     diff: "Faible",      defaultStatus: "done", date: "10 mars 2026" },
  { id: 9,  count: 0,  label: "Balises H1 manquantes",                   pct: "0%",    impact: "fort",       diff: "Faible",      defaultStatus: "done", date: "8 mars 2026"  },
  { id: 10, count: 0,  label: "Balises H1 dupliquées",                   pct: "0%",    impact: "fort",       diff: "Faible",      defaultStatus: "done", date: "8 mars 2026"  },
  { id: 11, count: 0,  label: "Erreurs HTTP (4xx / 5xx)",                pct: "0%",    impact: "fort",       diff: "Très haute",  defaultStatus: "done", date: "5 mars 2026"  },
];

export const PAGESPEED_DATA = [
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

export const CATEGORY_SCORES: { label: string; score: number; icon: ElementType; headline: string; detail: string }[] = [
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
export const CRAWL_CHARTS = [
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
export const EXTRA_ACCORDIONS = [
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
