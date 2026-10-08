/**
 * Confirmation du projet pendant l'étude — contrats + mocks (handoff back).
 *
 * Juste après la création d'un projet, l'étude tourne en arrière-plan. Pendant ce
 * temps, un panneau flottant (non bloquant, réductible) propose 3 vérifications,
 * pré-remplies à partir du site et corrigeables :
 *  1. le profil SEO : nom exact de la marque, langue, type de marché ;
 *  2. l'activité et les offres ;
 *  3. les 5 concurrents principaux proposés, à valider.
 *
 * TODO(back) : `getSetupSuggestions` = ce que l'étude a déjà déduit du site
 * (crawl de la home, balises, mentions légales, SERP). Les confirmations sont
 * renvoyées au back pour affiner l'étude en cours.
 */

export type MarketType = "city" | "national" | "international";

export type SetupSuggestions = {
  /** Nom de la marque tel qu'il s'écrit (sert à repérer les recherches de marque). */
  brand: string;
  /** Langues du site (un site peut être multilingue). Noms tels que dans `LANGUAGES`. */
  languages: string[];
  /** Marché : une ou plusieurs villes (local), un pays (national) ou plusieurs pays (international). */
  market: { type: MarketType; cities?: string[]; country?: string; countries?: string[] };
  /** Activité résumée en une phrase. */
  activity: string;
  /** Offres détectées (alimentent les « Offres prioritaires » du Contexte métier). */
  offers: string[];
  /** Concurrents proposés, du plus proche au moins proche. */
  competitors: { domain: string; sharedKeywords: number }[];
};

export type SetupStepKey = "profile" | "activity" | "competitors";

/** Pays proposés (national : liste déroulante ; international : autocomplétion). */
export const COUNTRIES = [
  "France", "Belgique", "Suisse", "Luxembourg", "Canada", "Monaco", "Maroc", "Tunisie", "Algérie", "Sénégal",
  "Côte d'Ivoire", "Allemagne", "Espagne", "Italie", "Portugal", "Pays-Bas", "Royaume-Uni", "Irlande", "Autriche",
  "Suède", "Norvège", "Danemark", "Finlande", "Pologne", "République tchèque", "Grèce", "États-Unis", "Mexique",
  "Brésil", "Argentine", "Japon", "Chine", "Inde", "Australie", "Émirats arabes unis",
];

/** Langues proposées (code = drapeau de référence via `<Flag>`). */
export const LANGUAGES: { name: string; code: string }[] = [
  { name: "Français", code: "fr" }, { name: "Anglais", code: "en" }, { name: "Espagnol", code: "es" },
  { name: "Allemand", code: "de" }, { name: "Italien", code: "it" }, { name: "Portugais", code: "pt" },
  { name: "Néerlandais", code: "nl" },
];

/** Villes suggérées pour un marché local (saisie libre aussi acceptée). */
export const CITIES = [
  "Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Nantes", "Montpellier", "Strasbourg", "Bordeaux", "Lille",
  "Rennes", "Reims", "Toulon", "Grenoble", "Dijon", "Angers", "Nîmes", "Clermont-Ferrand", "Le Mans",
  "Aix-en-Provence", "Brest", "Tours", "Amiens", "Limoges", "Annecy", "Metz", "Perpignan", "Besançon",
  "Orléans", "Rouen", "Caen", "Nancy", "Bruxelles", "Genève", "Lausanne", "Luxembourg", "Montréal",
];

/** Nom du pays → code ISO 3166-1 (drapeau via le composant DS `<Flag>`). */
export const COUNTRY_CODE: Record<string, string> = {
  "France": "fr", "Belgique": "be", "Suisse": "ch", "Luxembourg": "lu", "Canada": "ca", "Monaco": "mc",
  "Maroc": "ma", "Tunisie": "tn", "Algérie": "dz", "Sénégal": "sn", "Côte d'Ivoire": "ci", "Allemagne": "de",
  "Espagne": "es", "Italie": "it", "Portugal": "pt", "Pays-Bas": "nl", "Royaume-Uni": "gb", "Irlande": "ie",
  "Autriche": "at", "Suède": "se", "Norvège": "no", "Danemark": "dk", "Finlande": "fi", "Pologne": "pl",
  "République tchèque": "cz", "Grèce": "gr", "États-Unis": "us", "Mexique": "mx", "Brésil": "br",
  "Argentine": "ar", "Japon": "jp", "Chine": "cn", "Inde": "in", "Australie": "au", "Émirats arabes unis": "ae",
};

/** Phases de l'étude affichées pendant le chargement (libellés + poids en %). */
export const STUDY_PHASES: { label: string; until: number }[] = [
  { label: "Exploration du site", until: 25 },
  { label: "Étude des mots-clés", until: 60 },
  { label: "Analyse des concurrents", until: 85 },
  { label: "Calcul des opportunités", until: 100 },
];

/** Durée simulée de l'étude (ms). */
export const STUDY_DURATION_MS = 150_000;

/** MOCK — suggestions déduites du site. */
export function getSetupSuggestions(domain: string): SetupSuggestions {
  const base = domain.split(".")[0];
  const brand = base.length <= 4 ? base.toUpperCase() : base.charAt(0).toUpperCase() + base.slice(1);
  return {
    brand,
    languages: ["Français"],
    market: { type: "city", cities: ["Paris"], country: "France", countries: ["France", "Belgique", "Suisse"] },
    activity: "Agence SEO et GEO : audit, accompagnement et formation pour les entreprises B2B.",
    offers: ["Audit SEO", "Accompagnement SEO", "Accompagnement GEO", "Formation SEO"],
    competitors: [
      { domain: "nooki.fr", sharedKeywords: 48 },
      { domain: "agence-slashr.fr", sharedKeywords: 41 },
      { domain: "search-factory.fr", sharedKeywords: 33 },
      { domain: "egoprod.fr", sharedKeywords: 27 },
      { domain: "optimize360.fr", sharedKeywords: 19 },
    ],
  };
}
