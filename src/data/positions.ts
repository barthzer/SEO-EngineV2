/**
 * Positions (rank tracking) — contrats de type + mock.
 *
 * Sorti de `src/components/RankTracker.tsx` (handoff back, cf. HANDOFF.md).
 * Contrat = `TrackedKw`. Vraie requête → `src/db/queries/positions.ts` (fallback mock).
 */

export type SerpEntry = {
  rank: number;
  url: string;
  posDesktop: number;
  delta: number;
};

export type HistoryPoint = {
  date: string;
  pos: number;
};

export type TrackedKw = {
  keyword: string;
  pos: number | null;
  delta: number | null;
  url: string | null;
  volume: number | null;
  freq: string;
  tag: string | null;
  spark: number[];
  history: HistoryPoint[];
  serp: SerpEntry[];
};

/* ── Mock history generator ── */

function makeHistory(finalPos: number, length: number): HistoryPoint[] {
  const now = new Date(2026, 4, 5); // 5 mai 2026
  const pts: HistoryPoint[] = [];
  let pos = finalPos + Math.floor(Math.random() * 8) + 4;
  for (let i = length - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * Math.ceil(365 / length));
    const label = d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    pos = Math.max(1, Math.min(50, pos + (Math.random() > 0.5 ? -1 : 1) * Math.floor(Math.random() * 3)));
    pts.push({ date: label, pos });
  }
  // force last point = current pos
  pts[pts.length - 1].pos = finalPos;
  return pts;
}

/* ── Data ── */

export const INITIAL_KWS: TrackedKw[] = [
  {
    keyword: "agence seo paris", pos: 4, delta: -2,
    url: "/agence-seo/", volume: 2400, freq: "7j", tag: "Agence",
    spark: [14, 11, 9, 7, 6, 5, 4],
    history: makeHistory(4, 52),
    serp: [
      { rank: 1, url: "https://www.junto.fr/agence-seo-paris/",       posDesktop: 1, delta: 0  },
      { rank: 2, url: "https://www.rankwell.fr/",                     posDesktop: 2, delta: 0  },
      { rank: 3, url: "https://www.eskimoz.fr/agence-seo/",           posDesktop: 3, delta: -1 },
      { rank: 4, url: "https://www.votredomaine.fr/agence-seo/",      posDesktop: 4, delta: -2 },
      { rank: 5, url: "https://www.1min30.com/agence-seo/",           posDesktop: 5, delta: 1  },
      { rank: 6, url: "https://www.tictoc.agency/seo/",               posDesktop: 6, delta: 0  },
      { rank: 7, url: "https://www.digimood.com/agence-seo-paris/",   posDesktop: 7, delta: -1 },
      { rank: 8, url: "https://www.semrush.com/agencies/seo/france/", posDesktop: 8, delta: 0  },
      { rank: 9, url: "https://www.webrankinfo.com/agences/",         posDesktop: 9, delta: 2  },
      { rank: 10, url: "https://www.agence-seo-paris.net/",           posDesktop: 10, delta: 0 },
    ],
  },
  {
    keyword: "formation seo", pos: 12, delta: 3,
    url: "/formation/formation-seo/", volume: 1700, freq: "7j", tag: "Formation",
    spark: [8, 9, 10, 11, 12, 13, 12],
    history: makeHistory(12, 52),
    serp: [
      { rank: 1,  url: "https://www.elephorm.com/formation-seo",         posDesktop: 1,  delta: 0  },
      { rank: 2,  url: "https://www.hubspot.fr/resources/seo",            posDesktop: 2,  delta: 0  },
      { rank: 3,  url: "https://openclassrooms.com/fr/courses/seo",       posDesktop: 3,  delta: 1  },
      { rank: 4,  url: "https://www.udemy.com/topic/seo/",                posDesktop: 4,  delta: -1 },
      { rank: 5,  url: "https://www.webrankinfo.com/formation/",          posDesktop: 5,  delta: 0  },
      { rank: 6,  url: "https://www.1min30.com/formation-seo/",           posDesktop: 6,  delta: 2  },
      { rank: 7,  url: "https://www.semrush.com/academy/",                posDesktop: 7,  delta: 0  },
      { rank: 8,  url: "https://ahrefs.com/academy/",                     posDesktop: 8,  delta: 0  },
      { rank: 9,  url: "https://moz.com/learn/seo/",                      posDesktop: 9,  delta: -1 },
      { rank: 10, url: "https://www.votredomaine.fr/formation/formation-seo/", posDesktop: 12, delta: 3 },
    ],
  },
  {
    keyword: "audit seo", pos: 7, delta: -1,
    url: "/audit-seo/", volume: 880, freq: "7j", tag: null,
    spark: [10, 9, 9, 8, 8, 7, 7],
    history: makeHistory(7, 52),
    serp: [
      { rank: 1,  url: "https://www.semrush.com/seo-audit/",             posDesktop: 1,  delta: 0  },
      { rank: 2,  url: "https://ahrefs.com/site-audit",                  posDesktop: 2,  delta: 0  },
      { rank: 3,  url: "https://www.hubspot.fr/website-grader",          posDesktop: 3,  delta: 1  },
      { rank: 4,  url: "https://www.eskimoz.fr/audit-seo/",              posDesktop: 4,  delta: -1 },
      { rank: 5,  url: "https://www.junto.fr/audit-seo/",                posDesktop: 5,  delta: 0  },
      { rank: 6,  url: "https://www.rankmath.com/blog/seo-audit/",       posDesktop: 6,  delta: 2  },
      { rank: 7,  url: "https://www.votredomaine.fr/audit-seo/",         posDesktop: 7,  delta: -1 },
      { rank: 8,  url: "https://screaming-frog.co.uk/seo-spider/",       posDesktop: 8,  delta: 0  },
      { rank: 9,  url: "https://www.oncrawl.com/audit/",                 posDesktop: 9,  delta: -1 },
      { rank: 10, url: "https://www.digimood.com/audit-seo/",            posDesktop: 10, delta: 0  },
    ],
  },
  {
    keyword: "agence marketing digital", pos: 18, delta: 0,
    url: "/", volume: 5400, freq: "7j", tag: "Agence",
    spark: [20, 20, 19, 18, 18, 18, 18],
    history: makeHistory(18, 52),
    serp: [
      { rank: 1,  url: "https://www.jellyfish.com/fr/",                  posDesktop: 1,  delta: 0  },
      { rank: 2,  url: "https://www.havas.com/fr/",                      posDesktop: 2,  delta: 0  },
      { rank: 3,  url: "https://www.publicisgroupe.com/",                posDesktop: 3,  delta: 0  },
      { rank: 4,  url: "https://www.valtech.com/fr-fr/",                 posDesktop: 4,  delta: 1  },
      { rank: 5,  url: "https://www.fullsix.com/",                       posDesktop: 5,  delta: -1 },
      { rank: 6,  url: "https://www.isobar.com/fr/",                     posDesktop: 6,  delta: 0  },
      { rank: 7,  url: "https://www.wunderman.fr/",                      posDesktop: 7,  delta: 0  },
      { rank: 8,  url: "https://www.ogilvy.com/fr/",                     posDesktop: 8,  delta: 2  },
      { rank: 9,  url: "https://www.dentsu.com/fr/fr/",                  posDesktop: 9,  delta: -1 },
      { rank: 10, url: "https://www.votredomaine.fr/",                   posDesktop: 18, delta: 0  },
    ],
  },
  {
    keyword: "consultant seo", pos: 31, delta: 4,
    url: "/consultant-seo/", volume: 720, freq: "7j", tag: null,
    spark: [25, 27, 28, 29, 30, 30, 31],
    history: makeHistory(31, 52),
    serp: [
      { rank: 1,  url: "https://www.malt.fr/s?q=consultant+seo",        posDesktop: 1,  delta: 0  },
      { rank: 2,  url: "https://www.quantalys.fr/consultants-seo/",      posDesktop: 2,  delta: 1  },
      { rank: 3,  url: "https://www.webrankinfo.com/consultant-seo/",    posDesktop: 3,  delta: 0  },
      { rank: 4,  url: "https://consultant-seo.com/",                    posDesktop: 4,  delta: -1 },
      { rank: 5,  url: "https://www.digimood.com/consultant-seo/",       posDesktop: 5,  delta: 0  },
      { rank: 6,  url: "https://www.rankwell.fr/consultant-seo/",        posDesktop: 6,  delta: 2  },
      { rank: 7,  url: "https://www.eskimoz.fr/consultant-seo/",         posDesktop: 7,  delta: 0  },
      { rank: 8,  url: "https://www.junto.fr/consultant-seo/",           posDesktop: 8,  delta: -1 },
      { rank: 9,  url: "https://www.1min30.com/consultant-seo/",         posDesktop: 9,  delta: 0  },
      { rank: 10, url: "https://www.referencement-naturel.fr/",          posDesktop: 10, delta: 1  },
    ],
  },
  { keyword: "seo technique",  pos: null, delta: null, url: null, volume: 390,  freq: "7j", tag: null, spark: [], history: [], serp: [] },
  { keyword: "test",           pos: null, delta: null, url: null, volume: null, freq: "7j", tag: null, spark: [], history: [], serp: [] },
  { keyword: "bonjour",        pos: null, delta: null, url: null, volume: null, freq: "7j", tag: null, spark: [], history: [], serp: [] },
];

/* ── Courbe de visibilité ── */
export const VIS_DATA = [
  { label: "9 fév", value: 18 },
  { label: "16 fév", value: 21 },
  { label: "23 fév", value: 20 },
  { label: "2 mar", value: 24 },
  { label: "9 mar", value: 27 },
  { label: "16 mar", value: 25 },
  { label: "23 mar", value: 30 },
  { label: "30 mar", value: 34 },
  { label: "6 avr", value: 31 },
  { label: "13 avr", value: 37 },
  { label: "20 avr", value: 42 },
  { label: "27 avr", value: 45 },
  { label: "4 mai", value: 48 },
];
