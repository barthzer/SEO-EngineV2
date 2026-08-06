/**
 * Audit Popularité (netlinking) — contrat de type + mock.
 *
 * Sorti de `src/components/AuditNetlinkingTab.tsx` pour le handoff back (voir HANDOFF.md).
 * Distinct de `src/data/netlinking.ts` (module Popularité) : ici c'est l'onglet d'audit.
 * Vraie requête → `src/db/queries/audit-netlinking.ts` (fallback mock).
 */

/* ── Benchmark data ───────────────────────────────────────────────────── */

export type Competitor = {
  domain: string; tf: number; cf: number;
  refDomains: number; backlinks: number; isYou?: boolean;
};

export const COMPETITORS: Competitor[] = [
  { domain: "marketingdigital-france.fr", tf: 16, cf: 31, refDomains: 281,  backlinks: 3156,  isYou: true },
  { domain: "abondance.com",              tf: 35, cf: 47, refDomains: 1243, backlinks: 18934 },
  { domain: "olivier-andrieu.com",        tf: 32, cf: 45, refDomains: 987,  backlinks: 12456 },
  { domain: "semji.com",                  tf: 38, cf: 54, refDomains: 1456, backlinks: 21345 },
  { domain: "digimood.com",               tf: 31, cf: 48, refDomains: 891,  backlinks: 11234 },
  { domain: "leptidigital.fr",            tf: 34, cf: 51, refDomains: 1089, backlinks: 14321 },
  { domain: "webmarketing-com.com",       tf: 33, cf: 52, refDomains: 1123, backlinks: 15678 },
  { domain: "seotraining.fr",             tf: 28, cf: 41, refDomains: 756,  backlinks: 9123  },
  { domain: "eskimoz.fr",                 tf: 29, cf: 43, refDomains: 634,  backlinks: 8765  },
  { domain: "youlovewords.com",           tf: 20, cf: 34, refDomains: 412,  backlinks: 4821  },
  { domain: "indexel.net",               tf: 26, cf: 39, refDomains: 578,  backlinks: 7234  },
];

export const concurrents = COMPETITORS.filter((c) => !c.isYou);
export const COMP_AVG_TF = Math.round(concurrents.reduce((s, c) => s + c.tf, 0) / concurrents.length * 10) / 10;
export const COMP_AVG_RD = Math.round(concurrents.reduce((s, c) => s + c.refDomains, 0) / concurrents.length);

/* ── TF Evolution data (AreaChartPoint) ───────────────────────────────── */

export const TF_DATA_1AN = [
  { label: "Mai 25",  value: 17 }, { label: "Juin 25",  value: 17 }, { label: "Juil 25",  value: 17 },
  { label: "Août 25", value: 16 }, { label: "Sept 25",  value: 17 }, { label: "Oct 25",   value: 16 },
  { label: "Nov 25",  value: 16 }, { label: "Déc 25",   value: 17 }, { label: "Janv 26",  value: 16 },
  { label: "Févr 26", value: 16 }, { label: "Mars 26",  value: 15 }, { label: "Avr 26",   value: 16 },
  { label: "Mai 26",  value: 15 },
];

export const TF_DATA_6M = TF_DATA_1AN.slice(-7);
export const TF_DATA_3M = TF_DATA_1AN.slice(-4);

/* ── Topical TTF ──────────────────────────────────────────────────────── */

export const YOUR_TOPICS = [
  { label: "Marketing Digital", color: "var(--accent-primary)" },
  { label: "SEO / SEM",         color: "var(--color-success)" },
  { label: "Formation",         color: "color-mix(in oklab, var(--accent-primary) 55%, white)" },
];

export const COMP_TOPICS = [
  { label: "SEO / SEM",         count: 9, max: 10 },
  { label: "Marketing Digital", count: 8, max: 10 },
  { label: "Actualités Web",    count: 7, max: 10 },
  { label: "E-commerce",        count: 6, max: 10 },
  { label: "Social Media",      count: 5, max: 10 },
  { label: "Formation",         count: 4, max: 10 },
  { label: "Webdesign",         count: 3, max: 10 },
];

/* ── Anchors ──────────────────────────────────────────────────────────── */

export const ANCHOR_SEGS = [
  { label: "Marque",    pct: 59, color: "var(--accent-primary)", count: 33 },
  { label: "Générique", pct: 27, color: "color-mix(in oklab, var(--accent-primary) 55%, white)", count: 15 },
  { label: "Autre",     pct: 14, color: "var(--text-muted)", count: 8  },
];

export const TOP_ANCHORS = [
  { text: "marketing digital",              n: 8  },
  { text: "marketingdigital-france.fr",     n: 7  },
  { text: "agence marketing digital",       n: 6  },
  { text: "formation seo",                  n: 4  },
  { text: "cliquez ici",                    n: 4  },
  { text: "www.marketingdigital-france.fr", n: 3  },
  { text: "en savoir plus",                 n: 3  },
  { text: "agence seo",                     n: 3  },
  { text: "digital marketing agency",       n: 3  },
  { text: "voir le site",                   n: 2  },
];

/* ── Backlinks ────────────────────────────────────────────────────────── */

export type BacklinkRow = {
  domain: string; url: string; country: string;
  tf: number; cf: number; rd: number;
  ancre: string; type: "Texte" | "Image"; statut: "Follow" | "Nofollow" | "Sponsored";
};

export const BACKLINKS: BacklinkRow[] = [
  { domain: "pulsads.com",       url: "/ressources/outils-seo",       country: "FR", tf: 38, cf: 0,  rd: 18,   ancre: "awi",                       type: "Texte", statut: "Follow"   },
  { domain: "abondance.com",     url: "/blog/agences-seo-france",     country: "FR", tf: 35, cf: 47, rd: 1243, ancre: "marketing digital france",   type: "Texte", statut: "Follow"   },
  { domain: "semji.com",         url: "/ressources/glossaire-seo",    country: "FR", tf: 38, cf: 54, rd: 1456, ancre: "agence marketing digital",   type: "Texte", statut: "Follow"   },
  { domain: "bdm.fr",            url: "/outils/annuaire-agences",     country: "FR", tf: 31, cf: 42, rd: 876,  ancre: "marketingdigital-france.fr", type: "Texte", statut: "Nofollow" },
  { domain: "frenchweb.fr",      url: "/portraits/agences-2026",      country: "FR", tf: 29, cf: 41, rd: 654,  ancre: "voir le site",               type: "Texte", statut: "Follow"   },
  { domain: "youlovewords.com",  url: "/blog/outils-freelance",       country: "FR", tf: 20, cf: 34, rd: 412,  ancre: "formation seo",              type: "Texte", statut: "Follow"   },
  { domain: "leptidigital.fr",   url: "/marketing/agences",           country: "FR", tf: 34, cf: 51, rd: 1089, ancre: "en savoir plus",             type: "Texte", statut: "Nofollow" },
  { domain: "indexel.net",       url: "/ressources/liens-utiles",     country: "FR", tf: 26, cf: 39, rd: 578,  ancre: "agence seo paris",           type: "Image", statut: "Follow"   },
];

/* ── SEO Visibility ───────────────────────────────────────────────────── */

export type VisRow = {
  domain: string; vis: string; top3: number; top10: number;
  top50: number; top100: number; kws: string; traffic: string; gap: string | null;
  isYou?: boolean;
};

export const VISIBILITY: VisRow[] = [
  { domain: "semji.com",             vis: "18.4%", top3:  89, top10: 312, top50: 1456, top100: 3234, kws: "8.8K",  traffic: "24.5K", gap: "+22.4K" },
  { domain: "leptidigital.fr",       vis: "15.7%", top3:  74, top10: 267, top50: 1234, top100: 2891, kws: "7.4K",  traffic: "19.8K", gap: "+17.7K" },
  { domain: "abondance.com",         vis: "14.2%", top3:  67, top10: 234, top50: 1123, top100: 2654, kws: "6.9K",  traffic: "17.1K", gap: "+15.0K" },
  { domain: "webmarketing-com.com",  vis: "12.9%", top3:  58, top10: 198, top50: 967,  top100: 2234, kws: "5.8K",  traffic: "14.3K", gap: "+12.2K" },
  { domain: "olivier-andrieu.com",   vis: "11.8%", top3:  52, top10: 178, top50: 867,  top100: 1987, kws: "5.2K",  traffic: "12.6K", gap: "+10.5K" },
  { domain: "digimood.com",          vis: "10.3%", top3:  43, top10: 145, top50: 723,  top100: 1678, kws: "4.3K",  traffic: "10.2K", gap: "+8.1K"  },
  { domain: "eskimoz.fr",            vis: "8.7%",  top3:  36, top10: 121, top50: 612,  top100: 1423, kws: "3.7K",  traffic: "8.4K",  gap: "+6.3K"  },
  { domain: "seotraining.fr",        vis: "7.4%",  top3:  29, top10: 98,  top50: 498,  top100: 1156, kws: "2.9K",  traffic: "6.8K",  gap: "+4.7K"  },
  { domain: "indexel.net",           vis: "5.9%",  top3:  21, top10: 72,  top50: 367,  top100: 856,  kws: "2.1K",  traffic: "4.9K",  gap: "+2.8K"  },
  { domain: "youlovewords.com",      vis: "4.8%",  top3:  16, top10: 57,  top50: 289,  top100: 678,  kws: "1.6K",  traffic: "3.6K",  gap: "+1.5K"  },
  { domain: "marketingdigital-france.fr", vis: "3.2%", top3: 12, top10: 45, top50: 234, top100: 612, kws: "1.2K", traffic: "2.1K", gap: "—", isYou: true },
  { domain: "seo-jungle.fr",         vis: "3.2%",  top3:  11, top10: 43,  top50: 221,  top100: 589,  kws: "1.1K",  traffic: "2.1K",  gap: "0"      },
];
