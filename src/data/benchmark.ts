/**
 * Benchmark sémantique (visibilité vs concurrents) — contrat de type + mock.
 *
 * Sorti de `src/components/analyse/BenchmarkView.tsx` (handoff back, cf. HANDOFF.md).
 * Contrat = `VisibilityRow`. Les valeurs dérivées (COMPETITOR_COUNT, TOP_COMPETITOR)
 * sont calculées ici — donnée dérivée, pas de la présentation.
 */

export const YOUR_DOMAIN = "aw-i.com";

export type VisibilityRow = {
  domain: string;
  visibility: number | null;
  top3: number;
  top10: number;
  top50: number;
  top100: number;
  keywords: number;
  trafic: number;
  gap: number | null;
  isYou?: boolean;
};

export const VISIBILITY: VisibilityRow[] = [
  { domain: YOUR_DOMAIN,        visibility: null, top3: 0, top10: 0, top50: 0, top100: 0, keywords: 0, trafic: 0,   gap: null, isYou: true },
  { domain: "nooki.fr",          visibility: 3100, top3: 1, top10: 4, top50: 5, top100: 5, keywords: 5, trafic: 680, gap: 3100 },
  { domain: "agence-slashr.fr",  visibility: 1200, top3: 3, top10: 5, top50: 5, top100: 5, keywords: 5, trafic: 349, gap: 1200 },
  { domain: "egoprod.fr",        visibility:   45, top3: 0, top10: 1, top50: 5, top100: 5, keywords: 5, trafic:   8, gap:   45 },
  { domain: "search-factory.fr", visibility:    2, top3: 0, top10: 1, top50: 3, top100: 4, keywords: 4, trafic:   0, gap:    2 },
  { domain: "optimize360.fr",    visibility: null, top3: 0, top10: 0, top50: 0, top100: 0, keywords: 0, trafic:   0, gap:    0 },
  { domain: "synerweb.fr",       visibility: null, top3: 0, top10: 0, top50: 0, top100: 0, keywords: 0, trafic:   0, gap:    0 },
  { domain: "elocos.be",         visibility:    0, top3: 0, top10: 0, top50: 1, top100: 4, keywords: 4, trafic:   0, gap:    0 },
  { domain: "yateo.com",         visibility: null, top3: 0, top10: 0, top50: 0, top100: 0, keywords: 0, trafic:   0, gap: null },
  { domain: "ekko-media.com",    visibility: null, top3: 0, top10: 0, top50: 0, top100: 0, keywords: 0, trafic:   0, gap: null },
  { domain: "netinshape.fr",     visibility: null, top3: 0, top10: 0, top50: 0, top100: 0, keywords: 0, trafic:   0, gap: null },
];

export const COMPETITOR_COUNT = VISIBILITY.filter((r) => !r.isYou).length;
// Meilleur concurrent (visibilité max) — pour situer votre position.
export const TOP_COMPETITOR = VISIBILITY
  .filter((r) => !r.isYou && r.visibility != null)
  .sort((a, b) => (b.visibility ?? 0) - (a.visibility ?? 0))[0];
