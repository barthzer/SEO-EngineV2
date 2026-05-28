export type Tab = "general" | "briefs" | "seo" | "tracking" | "sea" | "forecast" | "netlinking" | "audit" | "cannibal" | "univers" | "recommandations" | "historique" | "notes" | "benchmark";

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
  benchmark:      "Benchmark",
};

export const TAB_SUBTITLES: Partial<Record<Tab, string>> = {
  cannibal: "Pages en conflit de positionnement — dilution du trafic et des signaux de pertinence.",
  univers:  "Identifiez les opportunités de contenu et résolvez les cannibalisations pour améliorer votre SEO.",
  tracking: "8 mots-clés · Dernier check : 04 mai, 14:00",
  recommandations: "Étude de mots-clés croisée avec vos concurrents — pages à créer et analyses priorisées.",
  historique: "Toutes les actions livrées par mois — source du rapport mensuel client.",
  notes: "Journal de bord du projet — décisions, échanges client et points de suivi.",
  benchmark: "Comparaison de visibilité SEO vs vos concurrents — source Haloscan.",
};

/* ── Arborescence regroupée (nav projet) ───────────────────────────────
   Regroupe les onglets en sections lisibles. Les sections multi-onglets
   affichent une barre de sous-onglets dans la page analyse. */

export type NavSection = { id: string; label: string; tabs: Tab[] };

export const NAV_SECTIONS: NavSection[] = [
  { id: "overview",    label: "Vue d'ensemble",       tabs: ["general"] },
  { id: "urls",        label: "URLs",                 tabs: ["briefs"] },
  { id: "contenu",     label: "Contenu & sémantique", tabs: ["recommandations", "univers", "cannibal"] },
  { id: "netlinking",  label: "Netlinking",           tabs: ["netlinking"] },
  { id: "performance", label: "Performance",          tabs: ["seo", "tracking", "sea", "forecast"] },
  { id: "benchmark",   label: "Benchmark",            tabs: ["benchmark"] },
  { id: "audit",       label: "Audit",                tabs: ["audit"] },
  { id: "suivi",       label: "Suivi",                tabs: ["historique", "notes"] },
];

/** Section contenant un onglet donné. */
export function sectionForTab(tab: Tab): NavSection | undefined {
  return NAV_SECTIONS.find((s) => s.tabs.includes(tab));
}
