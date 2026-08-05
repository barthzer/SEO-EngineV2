/**
 * Suivi — historique des actions livrées (timeline mensuelle, source du rapport client).
 *
 * Sorti de `src/components/analyse/HistoriqueView.tsx` pour le handoff back
 * (voir HANDOFF.md). Contrat = `HistoryAction`. Owners alignés sur TEAM (/equipe).
 * Vraie requête → `src/db/queries/suivi.ts` avec fallback mock.
 */

export type ActionType = "article" | "page" | "audit" | "technique" | "netlinking" | "tracking";

export type HistoryOwner = { name: string; initials: string; photoSeed: string };

export const OWNERS: Record<string, HistoryOwner> = {
  bart:   { name: "Barthélemy L.", initials: "BL", photoSeed: "barthelemy-l-seo" },
  sophie: { name: "Sophie M.",     initials: "SM", photoSeed: "5" },
  thomas: { name: "Thomas L.",     initials: "TL", photoSeed: "thomas-l-seo" },
  marie:  { name: "Marie P.",      initials: "MP", photoSeed: "marie-p-seo" },
};

export type HistoryAction = {
  id: string;
  date: string;
  title: string;
  description: string;
  ownerKey: keyof typeof OWNERS;
  type: ActionType;
  impact?: string;
  targetUrl: string;
};

export const ACTIONS: HistoryAction[] = [
  { id: "a1",  date: "2026-05-22", type: "article",    ownerKey: "sophie",
    title: "Article \"Migration headless CMS\"",
    description: "Guide long-form 2 800 mots ciblant la query principale + 12 questions PAA.",
    impact: "+1 200 visites/mois estimées", targetUrl: "#/blog/migration-headless-cms" },
  { id: "a2",  date: "2026-05-22", type: "technique",  ownerKey: "thomas",
    title: "Optimisation Core Web Vitals",
    description: "Lazy-load images + suppression JS bloquant. Lighthouse 64 → 91.",
    impact: "INP < 200ms · LCP −1,2s", targetUrl: "?tab=audit&section=tec-urgences" },
  { id: "a3",  date: "2026-05-18", type: "netlinking", ownerKey: "bart",
    title: "3 backlinks DR 50+",
    description: "Acquisition de 3 liens follow depuis des médias B2B (DR moyen 58).",
    impact: "+3 RefDom haute autorité", targetUrl: "?tab=netlinking" },
  { id: "a4",  date: "2026-05-12", type: "page",       ownerKey: "marie",
    title: "Refonte page tarifs",
    description: "Restructuration H1/H2 + FAQ schema + intégration témoignages clients.",
    impact: "+38 % temps passé sur la page", targetUrl: "#/tarifs" },
  { id: "a5",  date: "2026-05-04", type: "article",    ownerKey: "sophie",
    title: "Article \"Stack analytics 2026\"",
    description: "Comparatif Plausible / PostHog / GA4 — 1 800 mots + matrice de choix.",
    impact: "Pos. 6 sur 'plausible vs ga4'", targetUrl: "#/blog/stack-analytics-2026" },

  { id: "a6",  date: "2026-04-28", type: "audit",      ownerKey: "bart",
    title: "Audit éditorial trimestriel",
    description: "Analyse de 47 pages, identification de 12 pages obsolètes à fusionner.",
    impact: "12 pages à consolider", targetUrl: "?tab=audit&section=edi-synthese" },
  { id: "a7",  date: "2026-04-21", type: "article",    ownerKey: "marie",
    title: "Article \"AI Overviews 2026\"",
    description: "Guide sur l'impact des Google AI Overviews sur le SEO B2B.",
    impact: "+650 visites/mois", targetUrl: "#/blog/ai-overviews-2026" },
  { id: "a8",  date: "2026-04-14", type: "tracking",   ownerKey: "thomas",
    title: "Setup GA4 + GSC enrichi",
    description: "Branchement des events conversion + filtres trafic interne.",
    impact: "Tracking 100 % fiable", targetUrl: "?tab=tracking" },

  { id: "a9",  date: "2026-03-30", type: "netlinking", ownerKey: "bart",
    title: "Campagne Digital PR",
    description: "Diffusion étude propriétaire à 24 médias B2B, 5 reprises avec lien.",
    impact: "+5 backlinks DR 51", targetUrl: "?tab=netlinking" },
  { id: "a10", date: "2026-03-22", type: "page",       ownerKey: "marie",
    title: "Création landing \"Demo\"",
    description: "Page dédiée parcours essai gratuit, CTA en haut de fold, témoignages.",
    impact: "Pos. 8 sur 'demo SaaS B2B'", targetUrl: "#/demo" },
  { id: "a11", date: "2026-03-12", type: "technique",  ownerKey: "thomas",
    title: "Migration HTTPS strict",
    description: "HSTS preload + cookies sécurisés. Mixed content éliminé.",
    targetUrl: "?tab=audit&section=tec-diagnostic" },

  { id: "a12", date: "2026-02-26", type: "article",    ownerKey: "sophie",
    title: "Article \"AI Search 2026\"",
    description: "Tour d'horizon des moteurs IA cités (ChatGPT, Perplexity, Claude).",
    impact: "Pos. 4 sur 'AI search seo'", targetUrl: "#/blog/ai-search-2026" },
  { id: "a13", date: "2026-02-18", type: "audit",      ownerKey: "bart",
    title: "Audit technique complet",
    description: "Crawl 4 200 pages, 87 erreurs critiques identifiées et corrigées.",
    impact: "Score audit 64 → 89", targetUrl: "?tab=audit&section=tec-synthese" },

  { id: "a14", date: "2026-01-22", type: "page",       ownerKey: "marie",
    title: "Refonte navigation principale",
    description: "Mega-menu cocon sémantique + réduction profondeur des pages clés.",
    targetUrl: "#/" },
  { id: "a15", date: "2026-01-08", type: "netlinking", ownerKey: "bart",
    title: "Cleanup backlinks toxiques",
    description: "Disavow de 18 domaines DR < 10 à thématique douteuse (Majestic).",
    targetUrl: "?tab=netlinking" },

  { id: "a16", date: "2025-12-12", type: "tracking",   ownerKey: "thomas",
    title: "Dashboard hebdo automatique",
    description: "Looker Studio + flux GSC. Rapport hebdo en auto chaque lundi.",
    targetUrl: "?tab=tracking" },
];
