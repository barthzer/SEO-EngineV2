/**
 * Cannibalisation — contrats de type + mock.
 *
 * Sorti de `src/components/CannibalView.tsx` (handoff back, cf. HANDOFF.md).
 * Contrats = `CannibalKw`, `CannibalPage`. Vraie requête →
 * `src/db/queries/cannibal.ts` (fallback mock).
 */

/* ── Types ────────────────────────────────────────────────────────────── */

export type CannibalSev = "HIGH" | "MEDIUM" | "LOW";

/** Statut de traitement d'une cannibalisation (éditable par le consultant). */
export type CannibalStatus = "todo" | "in_progress" | "resolved" | "ignored";

export type CannibalUrl = {
  url: string; clickShare: number; avgPos: number;
  clicks: number; impressions: number; ctr: string;
};
export type CannibalKw = {
  keyword: string; severity: CannibalSev; clicks: number; lostClicks: number | null;
  volume: number | null; action: string; status: CannibalStatus;
  urls: CannibalUrl[];
};
export type CannibalPage = {
  url: string; kwConflicts: number; clicksAtRisk: number; maxSeverity: CannibalSev;
};

/* ── Data ─────────────────────────────────────────────────────────────── */

export const CANNIBAL_KWS: CannibalKw[] = [
  {
    keyword: "agence seo", severity: "MEDIUM", clicks: 151, lostClicks: -12, volume: 2100, action: "Garder", status: "todo",
    urls: [
      { url: "aw-i.com/agence-seo/", clickShare: 78, avgPos: 3.2,  clicks: 118, impressions: 1325, ctr: "8.9%" },
      { url: "aw-i.com/",            clickShare: 22, avgPos: 7.1,  clicks: 33,  impressions: 890,  ctr: "3.7%" },
    ],
  },
  {
    keyword: "audit seo", severity: "MEDIUM", clicks: 84, lostClicks: -8, volume: 880, action: "Rediriger", status: "todo",
    urls: [
      { url: "aw-i.com/audit-seo/", clickShare: 91, avgPos: 5.0,  clicks: 76, impressions: 980, ctr: "7.8%" },
      { url: "aw-i.com/services/",  clickShare: 9,  avgPos: 14.2, clicks: 8,  impressions: 310, ctr: "2.6%" },
    ],
  },
  {
    keyword: "formation seo", severity: "MEDIUM", clicks: 42, lostClicks: -5, volume: 1700, action: "Garder", status: "todo",
    urls: [
      { url: "aw-i.com/formation/formation-seo/", clickShare: 88, avgPos: 4.8,  clicks: 37, impressions: 740, ctr: "5.0%" },
      { url: "aw-i.com/formation/",               clickShare: 12, avgPos: 11.3, clicks: 5,  impressions: 220, ctr: "2.3%" },
    ],
  },
  {
    keyword: "consultant seo", severity: "LOW", clicks: 18, lostClicks: -1, volume: 720, action: "Ignorer", status: "todo",
    urls: [
      { url: "aw-i.com/consultant-seo/", clickShare: 83, avgPos: 9.1,  clicks: 15, impressions: 390, ctr: "3.8%" },
      { url: "aw-i.com/equipe/",         clickShare: 17, avgPos: 18.4, clicks: 3,  impressions: 179, ctr: "1.7%" },
    ],
  },
];

export const CANNIBAL_PAGES: CannibalPage[] = [
  { url: "aw-i.com/",            kwConflicts: 2, clicksAtRisk: 41,  maxSeverity: "MEDIUM" },
  { url: "aw-i.com/agence-seo/", kwConflicts: 1, clicksAtRisk: 151, maxSeverity: "MEDIUM" },
  { url: "aw-i.com/services/",   kwConflicts: 1, clicksAtRisk: 8,   maxSeverity: "MEDIUM" },
  { url: "aw-i.com/equipe/",     kwConflicts: 1, clicksAtRisk: 3,   maxSeverity: "LOW"    },
];

export const CANNIBAL_HISTORY_BY_PERIOD = {
  "3m": [
    { label: "Fév", value: 7 },
    { label: "Mar", value: 6 },
    { label: "Avr", value: 5 },
  ],
  "6m": [
    { label: "Nov", value: 8 },
    { label: "Déc", value: 7 },
    { label: "Jan", value: 9 },
    { label: "Fév", value: 7 },
    { label: "Mar", value: 6 },
    { label: "Avr", value: 5 },
  ],
  "1an": [
    { label: "Mai 25",  value: 12 },
    { label: "Juin 25", value: 11 },
    { label: "Juil 25", value: 10 },
    { label: "Août 25", value: 13 },
    { label: "Sept 25", value: 11 },
    { label: "Oct 25",  value: 10 },
    { label: "Nov 25",  value: 8  },
    { label: "Déc 25",  value: 7  },
    { label: "Jan 26",  value: 9  },
    { label: "Fév 26",  value: 7  },
    { label: "Mar 26",  value: 6  },
    { label: "Avr 26",  value: 5  },
  ],
};
