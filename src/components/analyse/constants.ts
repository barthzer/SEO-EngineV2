export type Tab = "general" | "briefs" | "seo" | "tracking" | "sea" | "forecast" | "netlinking" | "audit" | "cannibal" | "univers" | "recommandations" | "historique" | "notes";

export const TABS: { key: Tab; label: string }[] = [
  { key: "general",          label: "Général" },
  { key: "briefs",           label: "URLs" },
  { key: "seo",              label: "Analytics SEO" },
  { key: "tracking",         label: "Tracking" },
  { key: "sea",              label: "SEA & Paid" },
  { key: "forecast",         label: "Forecast" },
  { key: "netlinking",       label: "Netlinking" },
  { key: "cannibal",         label: "Cannibalisation" },
  { key: "univers",          label: "Univers sémantique" },
  { key: "recommandations",  label: "Études de mots-clés" },
  { key: "audit",            label: "Audit" },
  { key: "historique",       label: "Historique" },
  { key: "notes",            label: "Notes" },
];

export const TAB_TITLES: Record<Tab, string> = {
  general:    "Vue d'ensemble",
  briefs:     "URLs",
  seo:        "Analytics SEO",
  tracking:   "Tracking",
  sea:        "SEA & Paid",
  forecast:   "Forecast",
  netlinking: "Netlinking",
  cannibal:   "Cannibalisation",
  univers:        "Univers sémantique",
  recommandations: "Études de mots-clés",
  audit:          "Audit",
  historique:     "Historique",
  notes:          "Notes",
};

export const TAB_SUBTITLES: Partial<Record<Tab, string>> = {
  cannibal: "Pages en conflit de positionnement — dilution du trafic et des signaux de pertinence.",
  univers:  "Identifiez les opportunités de contenu et résolvez les cannibalisations pour améliorer votre SEO.",
  tracking: "8 mots-clés · Dernier check : 04 mai, 14:00",
  recommandations: "Étude de mots-clés croisée avec vos concurrents — pages à créer et analyses priorisées.",
  historique: "Toutes les actions livrées par mois — source du rapport mensuel client.",
  notes: "Journal de bord du projet — décisions, échanges client et points de suivi.",
};
