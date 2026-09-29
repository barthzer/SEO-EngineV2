/**
 * Opportunités — contrat de type + mock (fixtures).
 *
 * V2 « par besoin » : une opportunité = un GROUPE de mots-clés qui décrivent le
 * même besoin (ex. 7 requêtes autour de la résiliation de bail = 1 seule page à
 * construire). L'étude de mots-clés fournit déjà ces groupes.
 *
 * - `OppGroup` est le contrat : front et back s'alignent dessus.
 *   Ne pas le changer sans se coordonner (issue `needs-data`).
 * - `gain` est calculé côté back SUR LE GROUPE (pas la somme naïve des lignes).
 * - `priority` est calculée côté back : croise le gain, la difficulté et la
 *   distance à la page 1 (+ bonus « offres prioritaires » du projet).
 *   `null` quand la difficulté n'a pas pu être mesurée (« à qualifier ») :
 *   ces groupes ne remontent jamais en tête de liste.
 * - `classification` remplace les anciennes étiquettes P1/P2 : ce n'était pas
 *   une priorité mais le type d'opportunité (conquête / consolidation).
 * - La vraie requête vit dans `src/db/queries/opportunities.ts` (fallback mock).
 */

import type { ActionPriorityLevel } from "@/components/PriorityBars";

export type StudyIntent = "Commercial" | "Transactionnel" | "Informationnel";

/** Conquête = le site n'est pas positionné · Consolidation = déjà positionné, à renforcer. */
export type OppClassification = "conquete" | "consolidation";

/** Statut de traitement par le consultant. */
export type OppStatus = "en_attente" | "traitee" | "ignoree";

/** Détail d'un mot-clé du groupe (visible au dépliage de la ligne). */
export type OppKeyword = {
  keyword: string;
  volume: number;
  /** Position actuelle du site (null = hors top 100). */
  position: number | null;
  /** URL du site qui ranke actuellement sur ce mot-clé. */
  url: string | null;
  intent: StudyIntent | null;
  /** Difficulté individuelle (0-100), null = non mesurée. */
  kd: number | null;
  /** Mot-clé principal du groupe (celui qui donne son nom au besoin). */
  main?: boolean;
};

export type OppGroup = {
  id: string;
  /** Sujet = mot-clé principal du groupe. */
  subject: string;
  classification: OppClassification;
  /** Page du site qui devrait porter le besoin. null = page à créer. */
  targetUrl: string | null;
  /** Meilleure position actuelle du site sur le groupe (null = absent du top 100). */
  bestPosition: number | null;
  /** Gain estimé du groupe, en clics / mois (dédoublonné). */
  gain: number;
  /** Difficulté du groupe (0-100). null = à qualifier. */
  difficulty: number | null;
  /** Priorité calculée. null = à qualifier (difficulté inconnue). */
  priority: ActionPriorityLevel | null;
  /** Offre prioritaire du projet à laquelle le besoin se rattache (paramètres projet). */
  offer?: string;
  status: OppStatus;
  keywords: OppKeyword[];
};

/* ── Fixtures ──────────────────────────────────────────────────────────── */

export const OPP_GROUPS: OppGroup[] = [
  {
    id: "g-agence-geo", subject: "agence geo chatgpt", classification: "consolidation",
    targetUrl: "/agence-ia/", bestPosition: 9, gain: 260, difficulty: 38, priority: "high",
    offer: "Accompagnement GEO", status: "en_attente",
    keywords: [
      { keyword: "agence geo chatgpt",     volume: 480,  position: 9,  url: "/agence-ia/", intent: "Commercial",     kd: 35, main: true },
      { keyword: "seo chatgpt",            volume: 2400, position: 17, url: "/agence-ia/", intent: "Informationnel", kd: 46 },
      { keyword: "référencement chatgpt",  volume: 1600, position: 14, url: "/agence-ia/", intent: "Commercial",     kd: 41 },
      { keyword: "agence geo",             volume: 880,  position: 11, url: "/agence-ia/", intent: "Commercial",     kd: 33 },
    ],
  },
  {
    id: "g-agence-seo-paris", subject: "agence seo paris", classification: "consolidation",
    targetUrl: "/agence-seo-paris/", bestPosition: 12, gain: 420, difficulty: 62, priority: "high",
    offer: "Accompagnement SEO", status: "en_attente",
    keywords: [
      { keyword: "agence seo paris",           volume: 5400, position: 12,   url: "/agence-seo-paris/", intent: "Commercial", kd: 78, main: true },
      { keyword: "agence référencement paris", volume: 2900, position: 14,   url: "/agence-seo-paris/", intent: "Commercial", kd: 71 },
      { keyword: "consultant seo paris",       volume: 1900, position: 19,   url: "/agence-seo-paris/", intent: "Commercial", kd: 58 },
      { keyword: "cabinet seo paris",          volume: 720,  position: 23,   url: "/agence-seo-paris/", intent: "Commercial", kd: 49 },
      { keyword: "meilleure agence seo paris", volume: 480,  position: null, url: null,                 intent: "Commercial", kd: 55 },
    ],
  },
  {
    id: "g-cocon", subject: "cocon sémantique", classification: "consolidation",
    targetUrl: "/blog/cocon-semantique/", bestPosition: 18, gain: 150, difficulty: 29, priority: "high",
    status: "en_attente",
    keywords: [
      { keyword: "cocon sémantique exemple", volume: 720,  position: 18, url: "/blog/cocon-semantique/", intent: "Informationnel", kd: 24, main: true },
      { keyword: "cocon sémantique seo",     volume: 1300, position: 21, url: "/blog/cocon-semantique/", intent: "Informationnel", kd: 32 },
      { keyword: "maillage interne seo",     volume: 1900, position: 34, url: "/blog/maillage-interne/", intent: "Informationnel", kd: 36 },
    ],
  },
  {
    id: "g-audit-seo", subject: "audit seo", classification: "consolidation",
    targetUrl: "/audit-seo-gratuit/", bestPosition: 25, gain: 310, difficulty: 48, priority: "high",
    offer: "Audit SEO", status: "en_attente",
    keywords: [
      { keyword: "audit seo gratuit",    volume: 4400, position: 25,   url: "/audit-seo-gratuit/", intent: "Transactionnel", kd: 70, main: true },
      { keyword: "audit site internet",  volume: 1300, position: 42,   url: "/audit-seo-gratuit/", intent: "Commercial",     kd: 51 },
      { keyword: "audit seo technique",  volume: 1000, position: 31,   url: "/audit-seo-gratuit/", intent: "Commercial",     kd: 44 },
      { keyword: "prix audit seo",       volume: 720,  position: null, url: null,                  intent: "Transactionnel", kd: 38 },
      { keyword: "devis audit seo",      volume: 210,  position: null, url: null,                  intent: "Transactionnel", kd: 29 },
    ],
  },
  {
    id: "g-google-ads", subject: "agence google ads", classification: "consolidation",
    targetUrl: "/agence-sea/", bestPosition: 18, gain: 230, difficulty: 71, priority: "mid",
    status: "en_attente",
    keywords: [
      { keyword: "agence google ads",            volume: 3600, position: 18,   url: "/nouvelle-taxe-google-ads/", intent: "Commercial", kd: 75, main: true },
      { keyword: "agence sea",                   volume: 1600, position: 27,   url: "/agence-sea/",               intent: "Commercial", kd: 68 },
      { keyword: "consultant google ads",        volume: 880,  position: null, url: null,                         intent: "Commercial", kd: 60 },
      { keyword: "gestion campagne google ads",  volume: 590,  position: null, url: null,                         intent: "Commercial", kd: 54 },
    ],
  },
  {
    id: "g-freelance", subject: "consultant seo freelance", classification: "consolidation",
    targetUrl: "/consultant-seo-freelance/", bestPosition: 15, gain: 180, difficulty: 55, priority: "mid",
    status: "en_attente",
    keywords: [
      { keyword: "consultant seo freelance", volume: 1900, position: 15,   url: "/consultant-seo-freelance/", intent: "Commercial",     kd: 65, main: true },
      { keyword: "freelance seo",            volume: 2400, position: 22,   url: "/consultant-seo-freelance/", intent: "Commercial",     kd: 58 },
      { keyword: "tarif consultant seo",     volume: 390,  position: null, url: null,                         intent: "Transactionnel", kd: 34 },
    ],
  },
  {
    id: "g-saas", subject: "seo saas b2b", classification: "conquete",
    targetUrl: null, bestPosition: null, gain: 140, difficulty: 34, priority: "mid",
    status: "en_attente",
    keywords: [
      { keyword: "seo pour saas b2b",   volume: 880, position: null, url: null, intent: "Informationnel", kd: 30, main: true },
      { keyword: "stratégie seo saas",  volume: 590, position: null, url: null, intent: "Informationnel", kd: 36 },
      { keyword: "seo startup",         volume: 480, position: null, url: null, intent: "Informationnel", kd: 38 },
    ],
  },
  {
    id: "g-netlinking", subject: "netlinking prix", classification: "conquete",
    targetUrl: null, bestPosition: null, gain: 95, difficulty: 44, priority: "low",
    status: "en_attente",
    keywords: [
      { keyword: "netlinking prix 2026",  volume: 590, position: null, url: null, intent: "Transactionnel", kd: 41, main: true },
      { keyword: "prix backlink",         volume: 720, position: null, url: null, intent: "Transactionnel", kd: 47 },
      { keyword: "acheter des backlinks", volume: 390, position: null, url: null, intent: "Transactionnel", kd: 52 },
    ],
  },
  {
    id: "g-seo-lyon", subject: "agence seo lyon", classification: "conquete",
    targetUrl: null, bestPosition: null, gain: 170, difficulty: 66, priority: "low",
    status: "en_attente",
    keywords: [
      { keyword: "agence seo lyon",   volume: 1600, position: null, url: null, intent: "Commercial", kd: 66, main: true },
      { keyword: "référencement lyon", volume: 880, position: null, url: null, intent: "Commercial", kd: 60 },
    ],
  },
  {
    id: "g-schema", subject: "données structurées", classification: "consolidation",
    targetUrl: "/blog/schema-org/", bestPosition: 6, gain: 60, difficulty: 25, priority: "low",
    status: "en_attente",
    keywords: [
      { keyword: "structured data seo",     volume: 390,  position: 6,  url: "/blog/schema-org/", intent: "Informationnel", kd: 22, main: true },
      { keyword: "données structurées seo", volume: 590,  position: 8,  url: "/blog/schema-org/", intent: "Informationnel", kd: 28 },
      { keyword: "schema org",              volume: 1300, position: 13, url: "/blog/schema-org/", intent: "Informationnel", kd: 31 },
    ],
  },

  /* ── Déjà traitées / ignorées ── */
  {
    id: "g-formation", subject: "formation seo", classification: "conquete",
    targetUrl: null, bestPosition: null, gain: 120, difficulty: 52, priority: "mid",
    status: "traitee",
    keywords: [
      { keyword: "formation seo",                    volume: 2900, position: null, url: null, intent: "Commercial", kd: 58, main: true },
      { keyword: "formation référencement naturel",  volume: 720,  position: null, url: null, intent: "Commercial", kd: 45 },
    ],
  },
  {
    id: "g-seo-gratuit", subject: "seo gratuit", classification: "conquete",
    targetUrl: null, bestPosition: null, gain: 80, difficulty: 40, priority: "low",
    status: "ignoree",
    keywords: [
      { keyword: "seo gratuit",       volume: 1900, position: null, url: null, intent: "Informationnel", kd: 38, main: true },
      { keyword: "outil seo gratuit", volume: 2400, position: null, url: null, intent: "Informationnel", kd: 42 },
    ],
  },

  /* ── À qualifier : difficulté non mesurée → jamais en tête de liste ── */
  {
    id: "g-eeat", subject: "eeat google", classification: "conquete",
    targetUrl: null, bestPosition: null, gain: 70, difficulty: null, priority: null,
    status: "en_attente",
    keywords: [
      { keyword: "eeat google 2026", volume: 320, position: null, url: null, intent: "Informationnel", kd: null, main: true },
      { keyword: "e-e-a-t seo",      volume: 260, position: null, url: null, intent: "Informationnel", kd: null },
    ],
  },
  {
    id: "g-seo-local", subject: "seo local", classification: "consolidation",
    targetUrl: "/seo-local/", bestPosition: 28, gain: 110, difficulty: null, priority: null,
    status: "en_attente",
    keywords: [
      { keyword: "seo local",            volume: 3600, position: 28, url: "/seo-local/", intent: "Commercial", kd: null, main: true },
      { keyword: "référencement local",  volume: 1300, position: 35, url: "/seo-local/", intent: "Commercial", kd: null },
    ],
  },
  {
    id: "g-perplexity", subject: "geo perplexity", classification: "conquete",
    targetUrl: null, bestPosition: null, gain: 45, difficulty: null, priority: null,
    status: "en_attente",
    keywords: [
      { keyword: "geo perplexity",            volume: 260, position: null, url: null, intent: "Informationnel", kd: null, main: true },
      { keyword: "référencement perplexity",  volume: 170, position: null, url: null, intent: "Informationnel", kd: null },
    ],
  },
];

/** Groupes supplémentaires renvoyés lors d'une relance d'étude (mock). */
export const EXTRA_GROUPS: OppGroup[] = [
  {
    id: "g-tarif-agence", subject: "tarif agence seo", classification: "conquete",
    targetUrl: null, bestPosition: null, gain: 110, difficulty: 39, priority: "mid",
    offer: "Accompagnement SEO", status: "en_attente",
    keywords: [
      { keyword: "tarif agence seo", volume: 590, position: null, url: null, intent: "Transactionnel", kd: 36, main: true },
      { keyword: "prix agence seo",  volume: 480, position: null, url: null, intent: "Transactionnel", kd: 41 },
    ],
  },
];
