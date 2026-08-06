/**
 * URLs / Briefs — contrats de type + mock.
 *
 * Sorti de `src/components/BriefsView.tsx` (handoff back, cf. HANDOFF.md).
 * Contrat = `Brief`. `TAG_COUNTS` est dérivé de BRIEFS.
 * Vraie requête → `src/db/queries/briefs.ts` (fallback mock).
 */

/* ── Types ───────────────────────────────────────────────────────────── */

export type BriefType = "optimiser" | "combler" | "creer";
export type Priority = "haute" | "moyenne" | "basse";

export type Brief = {
  id: number;
  title: string;
  url: string;
  type: BriefType;
  priority: Priority;
  keyword: string;
  volume: number;
  position?: number;
  tag?: string;
  semanticScore: number;
  wordCount: number;
  h2s: string[];
  internalLinks: string[];
  clics?: number;
  impressions?: number;
  positionGsc?: number;
  analysedAt?: string;
  analysisCount?: number;
  clicsDelta?: number;
  positionDelta?: number;
};

/* ── Mock data ───────────────────────────────────────────────────────── */

export const BRIEFS: Brief[] = [
  // Tag SEO — Optimisation Q2 (14 URLs)
  { id: 1,  title: "Guide SEO local complet",              url: "/blog/seo-local",              type: "optimiser", priority: "haute",   keyword: "seo local",                 volume: 4400, position: 8,  tag: "Lot SEO — Optimisation Q2",    semanticScore: 42, wordCount: 1800, h2s: ["Qu'est-ce que le SEO local ?", "Optimiser sa fiche Google Business", "Les signaux de proximité"], internalLinks: ["/blog/google-business", "/blog/citations-locales"] },
  { id: 2,  title: "Audit SEO technique",                  url: "/services/audit-seo",          type: "optimiser", priority: "haute",   keyword: "audit seo",                 volume: 3600, position: 14, tag: "Lot SEO — Optimisation Q2",    semanticScore: 38, wordCount: 1400, h2s: ["Pourquoi réaliser un audit SEO ?", "Les 5 axes d'un audit technique", "Core Web Vitals"], internalLinks: ["/services/seo", "/blog/core-web-vitals"] },
  { id: 10, title: "Balises title et meta description",    url: "/blog/balises-title-meta",     type: "optimiser", priority: "haute",   keyword: "optimiser balise title",    volume: 2800, position: 19, tag: "Lot SEO — Optimisation Q2",    semanticScore: 31, wordCount: 1200, h2s: ["Rôle de la balise title", "Longueur optimale", "Exemples concrets"], internalLinks: ["/blog/seo-on-page"] },
  { id: 11, title: "Maillage interne : guide complet",     url: "/blog/maillage-interne",       type: "optimiser", priority: "haute",   keyword: "maillage interne seo",      volume: 2200, position: 23, tag: "Lot SEO — Optimisation Q2",    semanticScore: 29, wordCount: 1600, h2s: ["Pourquoi le maillage interne ?", "Stratégies avancées", "Outils d'audit"], internalLinks: ["/blog/cocon-semantique"] },
  { id: 12, title: "Vitesse de chargement et Core Web Vitals", url: "/blog/core-web-vitals",   type: "optimiser", priority: "haute",   keyword: "core web vitals 2024",      volume: 1900, position: 27, tag: "Lot SEO — Optimisation Q2",    semanticScore: 44, wordCount: 1500, h2s: ["LCP, CLS, INP expliqués", "Optimiser son score", "Outils de mesure"], internalLinks: ["/blog/performance-web"] },
  { id: 13, title: "SEO on-page : checklist complète",     url: "/blog/seo-on-page",            type: "optimiser", priority: "moyenne", keyword: "seo on page checklist",     volume: 1700, position: 31, tag: "Lot SEO — Optimisation Q2",    semanticScore: 52, wordCount: 2000, h2s: ["Structure de page", "Optimisation sémantique", "Accessibilité"], internalLinks: ["/blog/balises-title-meta"] },
  { id: 14, title: "Données structurées pour e-commerce", url: "/blog/schema-ecommerce",       type: "optimiser", priority: "moyenne", keyword: "schema org ecommerce",      volume: 1400, position: 38, tag: "Lot SEO — Optimisation Q2",    semanticScore: 26, wordCount: 1300, h2s: ["Product schema", "Review schema", "BreadcrumbList"], internalLinks: ["/blog/schema-org"] },
  { id: 15, title: "Canonicalisation et duplicate content", url: "/blog/canonical-tag",        type: "optimiser", priority: "moyenne", keyword: "balise canonical seo",      volume: 1300, position: 42, tag: "Lot SEO — Optimisation Q2",    semanticScore: 18, wordCount: 1100, h2s: ["Qu'est-ce que le duplicate content ?", "La balise canonical", "Bonnes pratiques"], internalLinks: ["/blog/audit-seo"] },
  { id: 16, title: "Redirection 301 : quand et comment",  url: "/blog/redirection-301",        type: "optimiser", priority: "moyenne", keyword: "redirection 301 seo",       volume: 1100, position: 47, tag: "Lot SEO — Optimisation Q2",    semanticScore: 21, wordCount: 900,  h2s: ["Les types de redirections", "Impact SEO", "Migration de site"], internalLinks: ["/blog/audit-seo-technique"] },
  { id: 17, title: "Sitemap XML : optimisation",          url: "/blog/sitemap-xml",             type: "optimiser", priority: "basse",   keyword: "sitemap xml seo",           volume: 960,  position: 55, tag: "Lot SEO — Optimisation Q2",    semanticScore: 35, wordCount: 800,  h2s: ["Créer un sitemap", "Soumettre à Google Search Console", "Erreurs à éviter"], internalLinks: ["/blog/robots-txt"] },
  { id: 18, title: "Robots.txt : guide pratique",         url: "/blog/robots-txt",              type: "optimiser", priority: "basse",   keyword: "robots txt seo",            volume: 880,  position: 61, tag: "Lot SEO — Optimisation Q2",    semanticScore: 29, wordCount: 700,  h2s: ["Syntaxe du fichier robots.txt", "Directives Disallow et Allow", "Erreurs fréquentes"], internalLinks: ["/blog/sitemap-xml"] },
  { id: 19, title: "Pagination et SEO",                   url: "/blog/pagination-seo",          type: "optimiser", priority: "basse",   keyword: "pagination seo",            volume: 740,  position: 68, tag: "Lot SEO — Optimisation Q2",    semanticScore: 14, wordCount: 800,  h2s: ["Problèmes de pagination", "Solutions recommandées", "Infinite scroll"], internalLinks: ["/blog/canonical-tag"] },
  { id: 20, title: "Hreflang : SEO international",       url: "/blog/hreflang",                 type: "optimiser", priority: "basse",   keyword: "hreflang balise seo",       volume: 680,  position: 74, tag: "Lot SEO — Optimisation Q2",    semanticScore: 11, wordCount: 1000, h2s: ["Qu'est-ce que l'hreflang ?", "Implémentation", "Erreurs courantes"], internalLinks: ["/blog/seo-international"] },
  { id: 21, title: "Crawl budget : optimisation",        url: "/blog/crawl-budget",              type: "optimiser", priority: "basse",   keyword: "crawl budget googlebot",    volume: 590,  position: 81, tag: "Lot SEO — Optimisation Q2",    semanticScore: 8,  wordCount: 900,  h2s: ["Qu'est-ce que le crawl budget ?", "Facteurs d'influence", "Optimiser son crawl"], internalLinks: ["/blog/robots-txt", "/blog/sitemap-xml"] },

  // Tag Création — Blog expert (11 URLs)
  { id: 4,  title: "SEO vs SEA : quelle stratégie ?",    url: "/blog/seo-vs-sea",               type: "combler",   priority: "haute",   keyword: "seo vs sea",                volume: 2400, position: 31, tag: "Lot Création — Blog expert",   semanticScore: 0,  wordCount: 1600, h2s: ["Différences fondamentales", "Quand choisir le SEO ?", "Stratégie combinée"], internalLinks: ["/services/sea", "/services/seo"] },
  { id: 5,  title: "Optimisation du taux de clic (CTR)", url: "/blog/optimiser-ctr",            type: "combler",   priority: "haute",   keyword: "améliorer ctr google",      volume: 1900, position: 38, tag: "Lot Création — Blog expert",   semanticScore: 0,  wordCount: 1400, h2s: ["Comprendre le CTR en SEO", "Optimiser ses balises title", "Rich snippets"], internalLinks: ["/blog/meta-tags", "/blog/schema-org"] },
  { id: 22, title: "Cocon sémantique : la méthode",      url: "/blog/cocon-semantique",          type: "combler",   priority: "haute",   keyword: "cocon sémantique seo",      volume: 1800, position: 34, tag: "Lot Création — Blog expert",   semanticScore: 0,  wordCount: 1900, h2s: ["Définition du cocon sémantique", "Construire sa structure", "Exemples concrets"], internalLinks: ["/blog/maillage-interne"] },
  { id: 23, title: "Intention de recherche et SEO",      url: "/blog/intention-recherche",       type: "combler",   priority: "haute",   keyword: "search intent seo",         volume: 1600, position: 40, tag: "Lot Création — Blog expert",   semanticScore: 0,  wordCount: 1500, h2s: ["Les 4 types d'intention", "Aligner contenu et intention", "Outils"], internalLinks: ["/blog/redaction-seo"] },
  { id: 24, title: "Longue traîne : stratégie complète", url: "/blog/longue-traine",             type: "combler",   priority: "haute",   keyword: "longue traîne seo",         volume: 1400, position: 45, tag: "Lot Création — Blog expert",   semanticScore: 0,  wordCount: 1700, h2s: ["Qu'est-ce que la longue traîne ?", "Trouver ses mots-clés", "Créer le contenu"], internalLinks: ["/blog/recherche-mots-cles"] },
  { id: 25, title: "Content marketing B2B",              url: "/blog/content-marketing-b2b",     type: "combler",   priority: "moyenne", keyword: "content marketing b2b",     volume: 1200, position: 52, tag: "Lot Création — Blog expert",   semanticScore: 0,  wordCount: 2000, h2s: ["Spécificités du B2B", "Formats qui convertissent", "Mesurer le ROI"], internalLinks: ["/blog/strategie-contenu"] },
  { id: 26, title: "Analyse SEO : template et méthode",   url: "/blog/brief-seo",                  type: "combler",   priority: "moyenne", keyword: "brief seo template",        volume: 1100, position: 58, tag: "Lot Création — Blog expert",   semanticScore: 0,  wordCount: 1300, h2s: ["À quoi sert un brief SEO ?", "Les éléments clés", "Template téléchargeable"], internalLinks: ["/blog/redaction-seo"] },
  { id: 27, title: "Recherche de mots-clés avancée",    url: "/blog/recherche-mots-cles",         type: "combler",   priority: "moyenne", keyword: "keyword research avancé",   volume: 980,  position: 63, tag: "Lot Création — Blog expert",   semanticScore: 0,  wordCount: 1800, h2s: ["Outils de recherche", "Analyse de la concurrence", "Clustering"], internalLinks: ["/blog/longue-traine"] },
  { id: 28, title: "SERP : comprendre les résultats",   url: "/blog/serp-google",                 type: "combler",   priority: "basse",   keyword: "serp google features",      volume: 860,  position: 70, tag: "Lot Création — Blog expert",   semanticScore: 0,  wordCount: 1100, h2s: ["Anatomie d'une SERP", "Featured snippets", "Position zéro"], internalLinks: ["/blog/seo-local"] },
  { id: 29, title: "Taux de rebond et SEO",             url: "/blog/taux-rebond",                 type: "combler",   priority: "basse",   keyword: "taux de rebond seo",        volume: 720,  position: 77, tag: "Lot Création — Blog expert",   semanticScore: 0,  wordCount: 900,  h2s: ["Définition du taux de rebond", "Impact sur le SEO", "Comment le réduire"], internalLinks: ["/blog/ux-seo"] },
  { id: 30, title: "Google E-E-A-T : mise à jour 2024", url: "/blog/google-eeat-2024",            type: "combler",   priority: "basse",   keyword: "google eeat 2024",          volume: 640,  position: 84, tag: "Lot Création — Blog expert",   semanticScore: 0,  wordCount: 1200, h2s: ["Nouveautés E-E-A-T", "Signaux de confiance", "Stratégie d'auteur"], internalLinks: ["/blog/eeat-google"] },

  // Lot GEO — Structured data (10 URLs)
  { id: 7,  title: "E-E-A-T : Expérience, Expertise, Autorité", url: "/blog/eeat-google", type: "creer", priority: "haute",   keyword: "eeat google",               volume: 1300,             tag: "Lot GEO — Structured data",    semanticScore: 0,  wordCount: 2400, h2s: ["Qu'est-ce que l'E-E-A-T ?", "Comment améliorer ses signaux", "E-E-A-T et IA générative"], internalLinks: ["/blog/seo-ia", "/blog/contenu-expert"] },
  { id: 8,  title: "Schema.org et données structurées",         url: "/blog/schema-org",   type: "creer", priority: "haute",   keyword: "données structurées seo",   volume: 1100,             tag: "Lot GEO — Structured data",    semanticScore: 0,  wordCount: 1800, h2s: ["Introduction aux données structurées", "Les types de schema", "Implémenter JSON-LD"], internalLinks: ["/blog/rich-snippets"] },
  { id: 31, title: "SEO et IA générative : s'adapter",          url: "/blog/seo-ia",       type: "creer", priority: "haute",   keyword: "seo intelligence artificielle", volume: 2100,          tag: "Lot GEO — Structured data",    semanticScore: 0,  wordCount: 2200, h2s: ["Impact de l'IA sur le SEO", "SGE et Search Generative Experience", "Stratégies d'adaptation"], internalLinks: ["/blog/eeat-google"] },
  { id: 32, title: "Answer Engine Optimization (AEO)",          url: "/blog/aeo",          type: "creer", priority: "haute",   keyword: "answer engine optimization",volume: 1700,             tag: "Lot GEO — Structured data",    semanticScore: 0,  wordCount: 1900, h2s: ["Qu'est-ce que l'AEO ?", "Différence SEO / AEO", "Optimiser pour les IA"], internalLinks: ["/blog/seo-ia"] },
  { id: 33, title: "GEO : Generative Engine Optimization",      url: "/blog/geo-seo",      type: "creer", priority: "haute",   keyword: "generative engine optimization", volume: 1500,         tag: "Lot GEO — Structured data",    semanticScore: 0,  wordCount: 2000, h2s: ["Définition du GEO", "Facteurs de citation IA", "Mesurer sa visibilité IA"], internalLinks: ["/blog/aeo", "/blog/seo-ia"] },
  { id: 34, title: "Rich snippets : guide 2024",                url: "/blog/rich-snippets",type: "creer", priority: "moyenne", keyword: "rich snippets seo",         volume: 1200,             tag: "Lot GEO — Structured data",    semanticScore: 0,  wordCount: 1400, h2s: ["Types de rich snippets", "Implémenter les données structurées", "Tester avec l'outil Google"], internalLinks: ["/blog/schema-org"] },
  { id: 35, title: "FAQ schema et voice search",                url: "/blog/faq-schema",   type: "creer", priority: "moyenne", keyword: "faq schema seo",            volume: 950,              tag: "Lot GEO — Structured data",    semanticScore: 0,  wordCount: 1100, h2s: ["Qu'est-ce que le FAQ schema ?", "Implémentation", "Voice search et SEO"], internalLinks: ["/blog/rich-snippets"] },
  { id: 36, title: "Signaux E-E-A-T pour les PME",              url: "/blog/eeat-pme",     type: "creer", priority: "moyenne", keyword: "eeat pme site web",         volume: 780,              tag: "Lot GEO — Structured data",    semanticScore: 0,  wordCount: 1300, h2s: ["E-E-A-T adapté aux PME", "Construire son autorité", "Contenu expert à budget limité"], internalLinks: ["/blog/eeat-google"] },
  { id: 37, title: "Optimisation pour ChatGPT et Perplexity",  url: "/blog/seo-chatgpt",  type: "creer", priority: "basse",   keyword: "optimiser site pour chatgpt",volume: 660,             tag: "Lot GEO — Structured data",    semanticScore: 0,  wordCount: 1600, h2s: ["Comment ChatGPT cite les sources", "Stratégie de citation", "Cas pratiques"], internalLinks: ["/blog/geo-seo"] },
  { id: 38, title: "Structured data pour les articles",         url: "/blog/article-schema", type: "creer", priority: "basse", keyword: "article schema structured data", volume: 540,          tag: "Lot GEO — Structured data",    semanticScore: 0,  wordCount: 900,  h2s: ["Article schema expliqué", "Implémenter NewsArticle", "Erreurs fréquentes"], internalLinks: ["/blog/schema-org"] },

  // Lot Popularité — Autorité
  { id: 3,  title: "Création de liens (link building)", url: "/blog/link-building",  type: "optimiser", priority: "moyenne", keyword: "link building",    volume: 2900, position: 22, tag: "Lot Popularité — Autorité", semanticScore: 55, wordCount: 2200, h2s: ["Qu'est-ce que le link building ?", "Les meilleures stratégies", "Mesurer son profil de liens"], internalLinks: ["/blog/netlinking"] },
  { id: 6,  title: "Rédaction SEO : le guide",          url: "/blog/redaction-seo",  type: "combler",   priority: "moyenne", keyword: "rédaction seo",    volume: 1600, position: 44, tag: "Lot Popularité — Autorité", semanticScore: 0,  wordCount: 2000, h2s: ["Les fondamentaux de la rédaction SEO", "Structure d'un article optimisé"], internalLinks: ["/blog/cocon-semantique"] },
  { id: 9,  title: "Stratégie de contenu pilier",       url: "/blog/contenu-pilier", type: "creer",     priority: "basse",   keyword: "content hub seo",  volume: 880,              tag: "Lot Popularité — Autorité", semanticScore: 0,  wordCount: 2600, h2s: ["La méthode Hub & Spoke", "Créer une page pilier efficace"], internalLinks: ["/blog/cocon-semantique"] },

  // Pages "agence" — utilisées comme cibles dans Univers sémantique (cannibalisation / couvert)
  { id: 100, title: "Accueil — Agence marketing digital",            url: "/",                                                       type: "optimiser", priority: "haute",   keyword: "agence marketing digital",     volume: 9800, position: 9,  semanticScore: 64, wordCount: 1400, h2s: ["Notre vision", "Nos expertises", "Nos secteurs"], internalLinks: ["/agence-marketing-digital-sante/", "/agence-marketing-digital-b2b/"] },
  { id: 101, title: "Agence marketing digital — Santé",              url: "/agence-marketing-digital-sante/",                        type: "optimiser", priority: "haute",   keyword: "agence digital santé",         volume: 90,   position: 59, semanticScore: 71, wordCount: 1600, h2s: ["Spécificités du secteur santé", "Conformité HAS / ANSM", "Cas clients"], internalLinks: ["/", "/blog/seo-local"] },
  { id: 102, title: "Agence marketing digital — Tourisme & voyage", url: "/agence-marketing-digital-tourisme-voyage/",              type: "optimiser", priority: "haute",   keyword: "agence communication tourisme",volume: 70,   position: 33, semanticScore: 68, wordCount: 1500, h2s: ["Saisonnalité du tourisme", "SEO local touristique", "Réseaux sociaux"], internalLinks: ["/", "/blog/seo-local"] },
  { id: 103, title: "Agence marketing digital — Banque & assurance", url: "/agence-marketing-digital-banque-assurance/",            type: "optimiser", priority: "moyenne", keyword: "agence seo définition",        volume: 90,   position: 2,  semanticScore: 72, wordCount: 1400, h2s: ["Réglementation ACPR", "Conformité RGPD", "Cas clients"], internalLinks: ["/", "/agence-marketing-digital-b2b/"] },
  { id: 104, title: "Agence marketing digital — B2B",                url: "/agence-marketing-digital-b2b/",                          type: "optimiser", priority: "moyenne", keyword: "agence seo b2b",               volume: 1100, position: 8,  semanticScore: 70, wordCount: 1500, h2s: ["Cycles de vente longs", "Lead nurturing", "Account-based marketing"], internalLinks: ["/", "/blog/content-marketing-b2b"] },
  { id: 105, title: "Agence marketing digital — Mode prêt-à-porter", url: "/agence-marketing-digital-mode-pret-a-porter/",          type: "optimiser", priority: "moyenne", keyword: "agence marketing digital c'est quoi", volume: 20, position: 5, semanticScore: 65, wordCount: 1300, h2s: ["Tendances mode 2026", "Storytelling visuel", "E-shop SEO"], internalLinks: ["/"] },
  { id: 106, title: "Agence marketing digital — Luxe",              url: "/agence-marketing-digital-luxe/",                          type: "optimiser", priority: "moyenne", keyword: "agence digitale luxe",         volume: 140,  position: 14, semanticScore: 60, wordCount: 1400, h2s: ["Codes du luxe digital", "Premiumisation", "International"], internalLinks: ["/"] },
  { id: 107, title: "Formation SEO certifiante",                     url: "/formation/formation-seo/",                                type: "creer",     priority: "haute",   keyword: "formation seo",                volume: 1700, position: 46, semanticScore: 35, wordCount: 1800, h2s: ["Programme de la formation", "Certification reconnue", "Modalités CPF"], internalLinks: ["/blog/recherche-mots-cles"] },
  { id: 108, title: "Audit SEO technique avancé",                    url: "/services/audit-seo-technique/",                           type: "optimiser", priority: "moyenne", keyword: "audit seo technique",          volume: 1000, position: 27, semanticScore: 48, wordCount: 1700, h2s: ["Crawl & indexation", "Core Web Vitals", "Logs serveur"], internalLinks: ["/services/audit-seo"] },
  { id: 109, title: "Comparatif des agences SEO en 2026",            url: "/blog/agence-seo-comparatif/",                             type: "combler",   priority: "moyenne", keyword: "comparatif agence seo",        volume: 320,  position: 11, semanticScore: 0,  wordCount: 1900, h2s: ["Méthodologie du comparatif", "Top 10 des agences", "Comment choisir"], internalLinks: ["/blog/agence-seo"] },
  { id: 110, title: "Stratégie SEO pour le luxe",                    url: "/blog/luxe-strategie-seo/",                                type: "combler",   priority: "basse",   keyword: "seo luxe",                     volume: 90,   position: 41, semanticScore: 0,  wordCount: 1500, h2s: ["Spécificités du SEO luxe", "Branding et search", "International"], internalLinks: ["/agence-marketing-digital-luxe/"] },
  { id: 111, title: "Tendances SEO 2026",                            url: "/blog/seo-2026-tendances/",                                type: "creer",     priority: "basse",   keyword: "tendances seo 2026",           volume: 480,  position: 52, semanticScore: 0,  wordCount: 1600, h2s: ["IA générative et search", "Topical authority", "GEO et brand mentions"], internalLinks: ["/blog/seo-chatgpt"] },
];

export const TAG_COUNTS = BRIEFS.reduce<Record<string, number>>((acc, b) => {
  if (b.tag) acc[b.tag] = (acc[b.tag] || 0) + 1;
  return acc;
}, {});

// Couleurs de lots volontairement ternes / désaturées (tons sourds) pour ne
// pas entrer en compétition avec les couleurs d'état punchies (succès, danger,
// warning). Palette douce type lavande / sauge / taupe / ardoise.
export const TAG_COLORS_DEFAULT: Record<string, string> = {
  "Lot SEO — Optimisation Q2":  "#5B72E8",
  "Lot Création — Blog expert": "#2BB3A3",
  "Lot GEO — Structured data":  "#A06AE0",
  "Lot Popularité — Autorité":  "#C9974E",
  "Sans lot":                   "#8A93A6",
};

// Nombre de briefs "terminés" par tag (mock : 6, 4, 2, 1)
export const TAG_DONE: Record<string, number> = {
  "Lot SEO — Optimisation Q2":  6,
  "Lot Création — Blog expert": 4,
  "Lot GEO — Structured data":  2,
  "Lot Popularité — Autorité":  1,
};
