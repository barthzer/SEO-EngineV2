/**
 * Charts Sémantique (vue d'ensemble) — contrats de type + mock.
 *
 * Regroupe les jeux de données des 4 graphiques, sortis de
 * `src/components/analyse/charts/*` pour le handoff back (cf. HANDOFF.md).
 * Vraie requête → `src/db/queries/charts-semantique.ts` (fallback mock).
 */

/* ── Concurrents organiques ─────────────────────────────────────────── */
export type OrganicRow = { domain: string; tf: number; cf: number; bas: number; refDomains: number; isYou?: boolean };

export const ORGANIC_YOU: OrganicRow = { domain: "votre-site.fr", tf: 28, cf: 41, bas: 12, refDomains: 520, isYou: true };

export const ORGANIC_COMPETITORS: OrganicRow[] = [
  { domain: "noiise.com",                                 tf: 49, cf: 48, bas: 0,  refDomains: 1637 },
  { domain: "lk-interactive.fr",                          tf: 19, cf: 38, bas: 47, refDomains: 308 },
  { domain: "cybercite.fr",                               tf: 42, cf: 44, bas: 9,  refDomains: 902 },
  { domain: "eskimoz.fr",                                 tf: 21, cf: 47, bas: 13, refDomains: 1427 },
  { domain: "seo.fr",                                     tf: 51, cf: 46, bas: 16, refDomains: 1640 },
  { domain: "alioze.com",                                 tf: 14, cf: 42, bas: 0,  refDomains: 833 },
  { domain: "agencebespoke.com",                          tf: 13, cf: 42, bas: 48, refDomains: 369 },
  { domain: "adveris.fr",                                 tf: 37, cf: 45, bas: 47, refDomains: 736 },
  { domain: "axess.fr",                                   tf: 44, cf: 47, bas: 3,  refDomains: 1232 },
  { domain: "centre-formation-referencement-naturel.com", tf: 16, cf: 34, bas: 52, refDomains: 136 },
];

/* ── Top pages ──────────────────────────────────────────────────────── */
export type TopPage = {
  url: string;
  clicks: number;
  impressions: number;
  position: number;
  ctr: string;
  trend: number[];
};

export const TOP_PAGES_ALL: TopPage[] = [
  { url: "/blog/seo-local",            clicks: 3240, impressions: 53100, position: 4.2,  ctr: "6.1%", trend: [18,22,28,24,32,30,36] },
  { url: "/services/audit-seo",        clicks: 2180, impressions: 50700, position: 7.8,  ctr: "4.3%", trend: [20,18,22,25,21,24,22] },
  { url: "/blog/link-building",        clicks: 1640, impressions: 52900, position: 11.2, ctr: "3.1%", trend: [12,14,13,16,15,18,17] },
  { url: "/",                          clicks: 1320, impressions: 15200, position: 3.1,  ctr: "8.7%", trend: [10,11,10,12,13,11,13] },
  { url: "/blog/core-web-vitals",      clicks:  980, impressions: 25800, position: 9.4,  ctr: "3.8%", trend: [8,9,11,10,12,11,12]  },
  { url: "/services/netlinking",       clicks:  870, impressions: 19400, position: 12.1, ctr: "4.5%", trend: [6,7,8,7,9,8,10]      },
  { url: "/blog/balises-title",        clicks:  730, impressions: 17800, position: 8.6,  ctr: "4.1%", trend: [5,6,7,7,8,9,9]       },
  { url: "/services/seo-ecommerce",    clicks:  610, impressions: 22300, position: 14.3, ctr: "2.7%", trend: [4,5,4,6,5,7,6]       },
  { url: "/blog/redirection-301",      clicks:  540, impressions: 14600, position: 10.8, ctr: "3.7%", trend: [4,4,5,5,6,5,7]       },
  { url: "/blog/schema-markup",        clicks:  490, impressions: 16200, position: 13.5, ctr: "3.0%", trend: [3,4,4,5,5,5,6]       },
];

/* ── Distribution des positions ─────────────────────────────────────── */
export const POSITION_BARS = [
  { label: "Top 3",    value: 2  },
  { label: "4 – 10",   value: 3  },
  { label: "11 – 50",  value: 8  },
  { label: "51 – 100", value: 14 },
];

/* ── Visibilité & trafic organique ──────────────────────────────────── */
export const VISIBILITY_DATA = [
  { month: "Mai",   value: 18  },
  { month: "Juin",  value: 28  },
  { month: "Juil",  value: 35  },
  { month: "Août",  value: 43  },
  { month: "Sept",  value: 58  },
  { month: "Oct",   value: 67  },
  { month: "Nov",   value: 72  },
  { month: "Déc",   value: 79  },
  { month: "Janv",  value: 87  },
  { month: "Févr",  value: 92  },
  { month: "Mars",  value: 99  },
  { month: "Avr",   value: 107 },
];

// Fluctuations déterministes pour les 4 sous-points entre chaque mois
export const FLUC = [1, 0, 2, 0, 0, -2, 0, 1, 0, 3, 0, -1, 0, 0, 2, 0, -3, 0, 0, 1, 0, 2, 0, 0, -1, 0, 0, -2, 1, 0, 0, 3, 0, -1, 0, 0, 2, 0, -2, 0, 0, 1, 0, -3];

export const VISIBILITY_BY_PERIOD = {
  "3m":  VISIBILITY_DATA.slice(-3),
  "6m":  VISIBILITY_DATA.slice(-6),
  "1an": VISIBILITY_DATA,
} as const;
