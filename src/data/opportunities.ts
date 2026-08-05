/**
 * Opportunités — contrat de type + mock (fixtures).
 *
 * Domaine de RÉFÉRENCE pour le handoff back : on a sorti le mock du composant
 * (RecommandationsView) vers ce module, comme `src/data/projects.ts`.
 *
 * - Le **type exporté `OppRow` est le contrat** : front et back s'alignent dessus.
 *   Ne pas le changer sans se coordonner (issue `needs-data`).
 * - La vraie requête vivra dans `src/db/queries/opportunities.ts` avec le
 *   **fallback mock** (voir HANDOFF.md §1) — elle réutilise ces fixtures tant
 *   qu'il n'y a pas de `DATABASE_URL`.
 */

export type StudyIntent = "Commercial" | "Transactionnel" | "Informationnel";
export type StudyPrio = "P0" | "P1" | "P2" | "P3";
export type OppType = "etude" | "semantique";
export type OppStatus = "en_attente" | "traitee";
export type SemUrl = { url: string; pos: number };

export type OppRow = {
  id: string;
  keyword: string;
  type: OppType;
  source: "PAA" | "Related" | null;   // sémantique uniquement
  matchedUrls: SemUrl[];              // URLs GSC déjà positionnées (sémantique)
  volume: number;
  kd: number | null;
  kei: number | null;
  score: number | null;
  trafic: number | null;
  position: number | null;
  intent: StudyIntent | null;
  priority: StudyPrio;
  pageCible: string | null;
  status: OppStatus;
};

const mk = (p: Omit<OppRow, "id" | "status" | "matchedUrls"> & { matchedUrls?: SemUrl[] }): OppRow => ({
  id: `${p.type}-${p.keyword}`,
  status: "en_attente",
  matchedUrls: p.matchedUrls ?? [],
  ...p,
});

/* Opportunités issues de l'étude de mots-clés (ex-Recommandations). */
export const ETUDE_ROWS: OppRow[] = [
  mk({ keyword: "agence seo paris",         type: "etude", source: null, volume: 5400, kd: 78,   kei: 369114, score: 80, trafic: null, position: 12,   intent: "Commercial",     priority: "P1", pageCible: "/agence-seo-paris/" }),
  mk({ keyword: "audit seo gratuit",        type: "etude", source: null, volume: 4400, kd: 70,   kei: 272676, score: 60, trafic: null, position: 25,   intent: "Transactionnel", priority: "P1", pageCible: "/audit-seo-gratuit/" }),
  mk({ keyword: "agence google ads",        type: "etude", source: null, volume: 3600, kd: 75,   kei: 170526, score: 80, trafic: null, position: 18,   intent: "Commercial",     priority: "P2", pageCible: "/nouvelle-taxe-google-ads/" }),
  mk({ keyword: "agence seo",               type: "etude", source: null, volume: 2100, kd: null, kei: null,   score: 0,  trafic: null, position: null, intent: "Commercial",     priority: "P1", pageCible: null }),
  mk({ keyword: "consultant seo freelance", type: "etude", source: null, volume: 1900, kd: 65,   kei: 54697,  score: 80, trafic: null, position: 15,   intent: "Commercial",     priority: "P1", pageCible: "/consultant-seo-freelance/" }),
  mk({ keyword: "consultant seo paris",     type: "etude", source: null, volume: 1900, kd: null, kei: null,   score: 0,  trafic: null, position: null, intent: "Commercial",     priority: "P1", pageCible: null }),
  mk({ keyword: "audit seo technique",      type: "etude", source: null, volume: 1000, kd: null, kei: null,   score: 0,  trafic: null, position: null, intent: "Commercial",     priority: "P1", pageCible: null }),
  mk({ keyword: "prix audit seo",           type: "etude", source: null, volume: 720,  kd: null, kei: null,   score: 0,  trafic: null, position: null, intent: "Transactionnel", priority: "P1", pageCible: null }),
  mk({ keyword: "devis audit seo",          type: "etude", source: null, volume: 210,  kd: null, kei: null,   score: 0,  trafic: null, position: null, intent: "Transactionnel", priority: "P1", pageCible: null }),
];

/* Opportunités sémantiques (rapatriées de l'ex-Univers sémantique — lignes « opportunité »). */
export const SEM_ROWS: OppRow[] = [
  mk({ keyword: "seo pour saas b2b",         type: "semantique", source: "PAA",     volume: 880, kd: null, kei: null, score: 34, trafic: null, position: null, intent: "Informationnel", priority: "P2", pageCible: null, matchedUrls: [{ url: "/agence-marketing-digital-b2b/", pos: 12 }] }),
  mk({ keyword: "cocon sémantique exemple",  type: "semantique", source: "Related", volume: 720, kd: null, kei: null, score: 41, trafic: null, position: null, intent: "Informationnel", priority: "P2", pageCible: null, matchedUrls: [{ url: "/blog/cocon-semantique/", pos: 18 }, { url: "/blog/maillage-interne/", pos: 34 }] }),
  mk({ keyword: "netlinking prix 2026",      type: "semantique", source: "PAA",     volume: 590, kd: null, kei: null, score: 28, trafic: null, position: null, intent: "Transactionnel", priority: "P1", pageCible: null }),
  mk({ keyword: "agence geo chatgpt",        type: "semantique", source: "Related", volume: 480, kd: null, kei: null, score: 22, trafic: null, position: null, intent: "Commercial",     priority: "P1", pageCible: null, matchedUrls: [{ url: "/agence-ia/", pos: 9 }] }),
  mk({ keyword: "structured data seo",       type: "semantique", source: "PAA",     volume: 390, kd: null, kei: null, score: 55, trafic: null, position: null, intent: "Informationnel", priority: "P3", pageCible: null, matchedUrls: [{ url: "/blog/schema-org/", pos: 6 }] }),
  mk({ keyword: "eeat google 2026",          type: "semantique", source: "Related", volume: 320, kd: null, kei: null, score: 38, trafic: null, position: null, intent: "Informationnel", priority: "P2", pageCible: null }),
];

/** Jeu d'opportunités initial (mock). */
export const INITIAL_ROWS: OppRow[] = [...ETUDE_ROWS, ...SEM_ROWS];

/** Opportunités additionnelles renvoyées lors d'une relance d'étude (mock). */
export const EXTRA_ROWS: OppRow[] = [
  mk({ keyword: "agence seo lyon",   type: "etude",      source: null,      volume: 1600, kd: 66, kei: 24242, score: 70, trafic: null, position: null, intent: "Commercial",     priority: "P2", pageCible: null }),
  mk({ keyword: "tarif agence seo",  type: "etude",      source: null,      volume: 590,  kd: null, kei: null, score: 0,  trafic: null, position: null, intent: "Transactionnel", priority: "P1", pageCible: null }),
  mk({ keyword: "geo perplexity",    type: "semantique", source: "Related", volume: 260,  kd: null, kei: null, score: 24, trafic: null, position: null, intent: "Informationnel", priority: "P2", pageCible: null }),
];
