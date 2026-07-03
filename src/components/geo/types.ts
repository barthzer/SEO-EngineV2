/**
 * Modèle de données du module « Visibilité IA » (GEO).
 *
 * Socle : entités de configuration (ce qu'on suit) + types analytics
 * (ce que ça donne). Tout est mock pour l'instant ; le branchement réel
 * (Ahrefs Brand Radar) viendra plus tard.
 */

/* ── Plateformes LLM suivies ──────────────────────────────────────────── */

export type LlmPlatform =
  | "chatgpt"
  | "perplexity"
  | "gemini"
  | "claude"
  | "copilot"
  | "google-ai";

export const LLM_PLATFORMS: { key: LlmPlatform; label: string; domain: string }[] = [
  { key: "chatgpt",    label: "ChatGPT",        domain: "openai.com" },
  { key: "perplexity", label: "Perplexity",     domain: "perplexity.ai" },
  { key: "gemini",     label: "Gemini",         domain: "gemini.google.com" },
  { key: "claude",     label: "Claude",         domain: "claude.ai" },
  { key: "copilot",    label: "Copilot",        domain: "copilot.microsoft.com" },
  { key: "google-ai",  label: "Google AI Overviews", domain: "google.com" },
];

/* ── Zone géographique / langue ───────────────────────────────────────── */

/** Le drapeau est rendu via le composant DS [[Flag]] à partir du `code` (plus d'emoji). */
export type Region = { code: string; label: string };

export const REGIONS: Region[] = [
  { code: "FR", label: "France" },
  { code: "BE", label: "Belgique" },
  { code: "CH", label: "Suisse" },
  { code: "CA", label: "Canada" },
  { code: "US", label: "États-Unis" },
  { code: "UK", label: "Royaume-Uni" },
];

export const LANGUAGES: { code: string; label: string }[] = [
  { code: "fr", label: "Français" },
  { code: "en", label: "Anglais" },
  { code: "es", label: "Espagnol" },
  { code: "de", label: "Allemand" },
];

/* ── Prompt ───────────────────────────────────────────────────────────── */

export type PromptSentiment = "positive" | "neutral" | "negative" | null;

export type Prompt = {
  id: string;
  text: string;
  /** Volume estimé de requêtes mensuelles (prompt volume). */
  volume: number;
  language: string;
  region: string;
  /** Suivi actif (compte dans le tracking) ou en pause. */
  active: boolean;
  /** Métriques calculées (mock) — présentes une fois le tracking lancé. */
  visibility?: number;       // % de réponses où le site est mentionné
  position?: number | null;  // rang moyen de mention
  sentiment?: PromptSentiment;
  mentions?: number;
};

/* ── Liste de prompts (topic) ─────────────────────────────────────────── */

export type TopicList = {
  id: string;
  name: string;
  source: "suggested" | "manual";
  prompts: Prompt[];
  /** Sélectionnée pour le tracking (étape de config). */
  selected: boolean;
};

/* ── Concurrent suivi ─────────────────────────────────────────────────── */

export type Competitor = {
  id: string;
  name: string;
  domain: string;
  tracked: boolean;
};

/* ── Configuration complète du module ─────────────────────────────────── */

export type GeoSetup = {
  configured: boolean;
  platforms: LlmPlatform[];
  regions: string[];
  language: string;
  lists: TopicList[];
  competitors: Competitor[];
};

/* ── Filtres globaux du module (partagés par toutes les sous-vues) ─────── */

export type GeoFilters = {
  period: string;           // "7j" | "30j" | "90j" | "custom"
  dateStart?: string;       // ISO yyyy-mm-dd (si period === "custom")
  dateEnd?: string;
  platforms: string[];      // [] = tous les modèles
  lists: string[];          // [] = toutes les listes
  competitors: string[];    // [] = tous les concurrents
};

export const DEFAULT_GEO_FILTERS: GeoFilters = { period: "30j", platforms: [], lists: [], competitors: [] };
