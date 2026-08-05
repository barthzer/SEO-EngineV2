/**
 * Popularité / Netlinking — contrat de type + mock (issu du contenu prod aw-i.com).
 *
 * Sorti de `src/components/NetlinkingView.tsx` pour le handoff back (voir HANDOFF.md).
 * Beaucoup de petits jeux de données de dataviz (benchmark, radar, ancres, backlinks,
 * autorité média, opportunités de liens). Contrats = les types exportés ci-dessous.
 * Vraies requêtes → `src/db/queries/netlinking.ts` avec fallback mock.
 *
 * NB : les valeurs dérivées (you/tfAvg/positionTF…) sont calculées ici à partir de
 * BENCHMARK — de la donnée dérivée, pas de la présentation.
 */

export const YOUR_DOMAIN = "aw-i.com";

/* ── 01. KPIs / Benchmark ─────────────────────────────────────────────── */

export type BenchmarkRow = {
  domain: string;
  tf: number;
  cf: number;
  refDomains: number;
  backlinks: number;
  isYou?: boolean;
};

export const BENCHMARK: BenchmarkRow[] = [
  { domain: "noiise.com",                          tf: 50, cf: 48, refDomains: 1647, backlinks: 42386 },
  { domain: "seo.fr",                              tf: 50, cf: 46, refDomains: 1623, backlinks: 30612 },
  { domain: "axess.fr",                            tf: 43, cf: 47, refDomains: 1249, backlinks: 93659 },
  { domain: "cybercite.fr",                        tf: 42, cf: 44, refDomains:  902, backlinks: 532580 },
  { domain: "adveris.fr",                          tf: 37, cf: 45, refDomains:  728, backlinks: 651758 },
  { domain: "eskimoz.fr",                          tf: 21, cf: 48, refDomains: 1426, backlinks: 8120 },
  { domain: "lk-interactive.fr",                   tf: 19, cf: 37, refDomains:  308, backlinks: 265756 },
  { domain: "centre-formation-referencement.fr",   tf: 16, cf: 32, refDomains:  136, backlinks: 243 },
  { domain: YOUR_DOMAIN,                           tf: 15, cf: 42, refDomains:  476, backlinks: 2272, isYou: true },
  { domain: "alioze.com",                          tf: 15, cf: 42, refDomains:  818, backlinks: 295949 },
  { domain: "agencebespoke.com",                   tf: 14, cf: 41, refDomains:  374, backlinks: 10304 },
];

export const you = BENCHMARK.find((r) => r.isYou)!;
export const competitors = BENCHMARK.filter((r) => !r.isYou);
export const tfValues = competitors.map((c) => c.tf).sort((a, b) => b - a);
export const refValues = competitors.map((c) => c.refDomains).sort((a, b) => b - a);
export const tfAvg = Math.round((tfValues.reduce((s, v) => s + v, 0) / tfValues.length) * 10) / 10;
export const refMedian = refValues[Math.floor(refValues.length / 2)];
export const positionTF = [...BENCHMARK].sort((a, b) => b.tf - a.tf).findIndex((r) => r.isYou) + 1;
export const tfCfRatio = (you.tf / you.cf).toFixed(2).replace(".", ",");

/* ── 02. Benchmark Radar ──────────────────────────────────────────────── */

export const RADAR_AXES = ["TF", "CF", "TF/CF", "Backlinks", "RefDom"];
// Valeurs normalisées 0-100 (visualisation, pas brutes). Concurrents = polygone très large, Vous = petit.
export const RADAR_YOU = [35, 78, 65, 12, 30];
export const RADAR_COMPETITORS = [82, 88, 65, 90, 85];
export const SPAM_RISK_DELTA = -46; // % vs concurrents (score global 48 vs moyenne conc. 94)

/* ── 03. Profil des liens ─────────────────────────────────────────────── */

export const FOLLOW_NOFOLLOW = {
  vous: { follow: 72.9, nofollow: 27.1 },
  competitors: { follow: 78.3, nofollow: 21.7 },
};

export const TEXT_IMAGE = {
  vous: { texte: 96.3, image: 3.7 },
  competitors: { texte: 79.3, image: 20.7 },
};

/* ── 05. Distribution géographique ────────────────────────────────────── */

export type GeoRow = { code: string; label: string; pct: number; delta: number };

export const COUNTRIES: GeoRow[] = [
  { code: "US", label: "États-Unis", pct: 83, delta: +79 },
  { code: "FR", label: "France",     pct: 16, delta: -80 },
  { code: "–",  label: "Autres",     pct:  1, delta:  +1 },
];

export const LANGUAGES: GeoRow[] = [
  { code: "fr", label: "Français",  pct: 57, delta: -39 },
  { code: "–",  label: "Autres",    pct: 43, delta: +43 },
  { code: "de", label: "Allemand",  pct:  1, delta:  +1 },
];

/* ── 07. Évolution Trust Flow ─────────────────────────────────────────── */

export const TF_HISTORY: { date: string; val: number }[] = [
  { date: "2026-02-06", val: 16 },
  { date: "2026-02-14", val: 16 },
  { date: "2026-02-21", val: 17 },
  { date: "2026-03-02", val: 17 },
  { date: "2026-03-06", val: 17 },
  { date: "2026-03-10", val: 16 },
  { date: "2026-03-17", val: 16 },
  { date: "2026-03-22", val: 16 },
  { date: "2026-03-28", val: 16 },
  { date: "2026-04-02", val: 16 },
  { date: "2026-04-09", val: 17 },
  { date: "2026-04-13", val: 17 },
  { date: "2026-04-16", val: 17 },
  { date: "2026-04-20", val: 16 },
  { date: "2026-04-23", val: 16 },
  { date: "2026-04-25", val: 16 },
  { date: "2026-04-28", val: 16 },
  { date: "2026-05-01", val: 15 },
  { date: "2026-05-03", val: 15 },
  { date: "2026-05-06", val: 15 },
  { date: "2026-05-09", val: 15 },
  { date: "2026-05-12", val: 15 },
  { date: "2026-05-14", val: 15 },
  { date: "2026-05-16", val: 15 },
  { date: "2026-05-18", val: 15 },
  { date: "2026-05-19", val: 15 },
  { date: "2026-05-20", val: 15 },
  { date: "2026-05-21", val: 15 },
];

/* ── 08. Topical Trust Flow ───────────────────────────────────────────── */

export const YOUR_TOPICS = [
  "Business/Publishing and Printing",
  "Business/Opportunities",
  "Computers/Education",
];

export type CompTopic = { label: string; count: number; total: number };
export const COMP_TOPICS: CompTopic[] = [
  { label: "Computers/Internet/Web Design and Development", count: 5, total: 10 },
  { label: "Business",                                       count: 4, total: 10 },
  { label: "Business/Marketing and Advertising",             count: 3, total: 10 },
  { label: "Business/Financial Services",                    count: 3, total: 10 },
  { label: "Regional/Europe",                                count: 2, total: 10 },
  { label: "Business/Business Services",                     count: 2, total: 10 },
];

/* ── 09. Distribution des ancres ──────────────────────────────────────── */

export const ANCHOR_TYPES = {
  marque: 65,
  autre: 29,
  generique: 14, // l'overlap 8% est conservé pour matcher l'exemple
};

export type Anchor = { text: string; count: number };
export const TOP_ANCHORS: Anchor[] = [
  { text: "https://www.aw-i.com/contacts/", count: 14 },
  { text: "awi", count: 11 },
  { text: "(vide)", count: 5 },
  { text: "[www.aw-i.com](https://www.aw-i.com)", count: 2 },
  { text: "aw-i", count: 2 },
  { text: "34 % des leads qualifiés en b2b proviennent du seo", count: 2 },
  { text: "aw-i.com", count: 2 },
  { text: "agence de search digitale awi", count: 1 },
];

export const ANCHOR_TOTAL = 56;
export const ANCHOR_SCORE = 22; // /100

/* ── 10. Backlinks ────────────────────────────────────────────────────── */

export type Backlink = {
  source: string;
  country: string;
  anchor: string;
  tf: number;
  cf: number;
  refDomains: number;
  type: "Texte" | "Image";
  status: "Follow" | "Nofollow";
};

export const BACKLINKS: Backlink[] = [
  { source: "pulsads.com",         country: "FR", anchor: "awi",                              tf: 40, cf: 20, refDomains: 0,   type: "Texte", status: "Follow" },
  { source: "marketing-digital.eu",country: "FR", anchor: "agence search awi",                tf: 32, cf: 38, refDomains: 18,  type: "Texte", status: "Follow" },
  { source: "saas-blog.io",        country: "US", anchor: "aw-i.com",                         tf: 28, cf: 35, refDomains: 12,  type: "Texte", status: "Nofollow" },
  { source: "annuaire-seo.fr",     country: "FR", anchor: "(vide)",                           tf: 18, cf: 22, refDomains:  3,  type: "Texte", status: "Follow" },
  { source: "growth-stack.com",    country: "US", anchor: "https://www.aw-i.com/contacts/",   tf: 24, cf: 31, refDomains:  8,  type: "Texte", status: "Follow" },
  { source: "techcrunch-fr.io",    country: "FR", anchor: "agence de search digitale awi",    tf: 45, cf: 50, refDomains: 240, type: "Texte", status: "Nofollow" },
  { source: "directory-b2b.net",   country: "DE", anchor: "aw-i",                             tf: 12, cf: 18, refDomains:  2,  type: "Image", status: "Follow" },
];

/* ── Autorité média (onglet dédié) ────────────────────────────────────── */

export const MEDIA_AUTHORITY = {
  score: 74,
  backlinksTotal: 1284,
  backlinksDeltaPct: 18,
  medias: 126,
  domaines: 87,
  majorMedias: 9,
  articles: 42,
  bigNames: ["Le Figaro", "BFM Business", "Le Point", "Les Échos", "L'Usine Digitale"],
  rank: 3,
  rankTotal: 4,
};

export type MediaBenchRow = { company: string; backlinks: number; medias: number; presence: string; score: number; isYou?: boolean };
export const MEDIA_BENCHMARK: MediaBenchRow[] = [
  { company: "Pennylane",    backlinks: 2430, medias: 14, presence: "Les Échos, Le Figaro, BFM Business",   score: 82 },
  { company: "Sage France",  backlinks: 1760, medias: 11, presence: "La Tribune, Les Échos, L'Usine Digitale", score: 77 },
  { company: "Uplify Group", backlinks: 1284, medias:  9, presence: "Le Figaro, BFM Business, La Tribune",   score: 74, isYou: true },
  { company: "Qonto",        backlinks:  890, medias:  5, presence: "BFM Business, Le Point, Capital",        score: 61 },
];

/* ── Opportunités : sites les plus influents du secteur (link gap) ──────── */

export type OppoRow = { domain: string; category: string; authority: number; competitorsLinked: number; youLinked: boolean };
export const NET_OPPORTUNITIES: OppoRow[] = [
  { domain: "lesechos.fr",        category: "Média",     authority: 91, competitorsLinked: 3, youLinked: false },
  { domain: "journaldunet.com",   category: "Média",     authority: 84, competitorsLinked: 3, youLinked: false },
  { domain: "blogdumoderateur.com", category: "Blog",    authority: 78, competitorsLinked: 2, youLinked: true },
  { domain: "usine-digitale.fr",  category: "Média",     authority: 82, competitorsLinked: 2, youLinked: false },
  { domain: "codeur.com",         category: "Annuaire",  authority: 66, competitorsLinked: 3, youLinked: false },
  { domain: "webmarketing-com.com", category: "Blog",    authority: 61, competitorsLinked: 2, youLinked: true },
  { domain: "frenchweb.fr",       category: "Média",     authority: 72, competitorsLinked: 2, youLinked: false },
  { domain: "e-marketing.fr",     category: "Média",     authority: 74, competitorsLinked: 1, youLinked: false },
];
