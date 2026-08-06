/**
 * Étude de mots-clés (modale) — mock.
 *
 * Sorti de `src/components/analyse/modals/KeywordStudyModal.tsx` (handoff back).
 * Sert à détecter les doublons vs les URLs déjà couvertes lors d'un import CSV.
 */


/** Mock : mots-clés du projet déjà couverts par une URL/analyse existante */
export const EXISTING_KEYWORDS = [
  "seo local", "audit seo", "core web vitals 2024", "maillage interne seo",
  "brief seo template", "optimiser balise title", "schema markup",
];

/** Mock : aperçu des doublons détectés dans le CSV uploadé */
export const DETECTED_DUPLICATES = [
  { keyword: "seo local",            existingUrl: "/blog/seo-local",                 lastAnalysis: "Il y a 8 jours" },
  { keyword: "audit seo",            existingUrl: "/services/audit-seo",             lastAnalysis: "Il y a 3 jours" },
  { keyword: "core web vitals 2024", existingUrl: "/blog/core-web-vitals",           lastAnalysis: "Il y a 12 jours" },
  { keyword: "maillage interne seo", existingUrl: "/blog/maillage-interne",          lastAnalysis: "Il y a 5 jours" },
  { keyword: "optimiser balise title", existingUrl: "/blog/balises-title-meta",      lastAnalysis: "Il y a 1 mois" },
];
