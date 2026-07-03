export type Tab = "general" | "briefs" | "seo" | "tracking" | "sea" | "forecast" | "netlinking" | "audit" | "cannibal" | "univers" | "recommandations" | "opportunites" | "creation" | "historique" | "notes" | "benchmark" | "geo";

export const TABS: { key: Tab; label: string }[] = [
  { key: "general",          label: "Général" },
  { key: "briefs",           label: "URLs" },
  { key: "seo",              label: "Vue d'ensemble" },
  { key: "tracking",         label: "Tracking" },
  { key: "sea",              label: "SEA & Paid" },
  { key: "forecast",         label: "Forecast" },
  { key: "netlinking",       label: "Netlinking" },
  { key: "cannibal",         label: "Cannibalisation" },
  { key: "univers",          label: "Univers sémantique" },
  { key: "recommandations",  label: "Opportunités" },
  { key: "geo",              label: "Visibilité IA" },
  { key: "audit",            label: "Audit" },
  { key: "opportunites",     label: "Actions" },
  { key: "creation",         label: "Créer du contenu" },
  { key: "historique",       label: "Suivi" },
  { key: "notes",            label: "Notes" },
];

export const TAB_TITLES: Record<Tab, string> = {
  general:    "Vue d'ensemble",
  briefs:     "URLs",
  seo:        "Vue d'ensemble",
  tracking:   "Tracking",
  sea:        "SEA & Paid",
  forecast:   "Forecast",
  netlinking: "Netlinking",
  cannibal:   "Cannibalisation",
  univers:        "Univers sémantique",
  recommandations: "Opportunités",
  audit:          "Audit",
  opportunites:   "Actions",
  creation:       "Créer du contenu",
  historique:     "Suivi",
  notes:          "Notes",
  benchmark:      "Benchmark",
  geo:            "Visibilité IA",
};

export const TAB_SUBTITLES: Partial<Record<Tab, string>> = {
  cannibal: "Pages en conflit de positionnement — dilution du trafic et des signaux de pertinence.",
  univers:  "Identifiez les opportunités de contenu et résolvez les cannibalisations pour améliorer votre SEO.",
  tracking: "8 mots-clés · Dernier check : 04 mai, 14:00",
  recommandations: "Étude de mots-clés croisée avec vos concurrents — pages à créer et analyses priorisées.",
  opportunites: "Toutes les actions à mener sur le projet, priorisées par impact et regroupées par statut.",
  creation: "Créez une nouvelle page : partez de zéro ou d'un template éprouvé.",
  historique: "Toutes les actions livrées par mois, source du rapport mensuel client.",
  notes: "Journal de bord du projet : décisions, échanges client et points de suivi.",
  benchmark: "Comparaison de visibilité SEO vs vos concurrents — source Haloscan.",
};

/* ── Arborescence regroupée (nav projet) ───────────────────────────────
   Regroupe les onglets en sections lisibles. Les sections multi-onglets
   affichent une barre de sous-onglets dans la page analyse. */

/** Groupe de nav sidebar : Analyse (les données) vs Actions (le pilotage). */
export type NavGroup = "analyse" | "actions";
export type NavSection = { id: string; label: string; tabs: Tab[]; group: NavGroup };

export const NAV_SECTIONS: NavSection[] = [
  // ── Analyse : les données du projet ──
  { id: "overview",    label: "Vue d'ensemble",       tabs: ["general"],                                       group: "analyse" },
  { id: "urls",        label: "URLs",                 tabs: ["briefs"],                                        group: "analyse" },
  { id: "contenu",     label: "Sémantique",           tabs: ["seo", "tracking", "univers", "cannibal", "benchmark"], group: "analyse" },
  { id: "netlinking",  label: "Netlinking",           tabs: ["netlinking"],                                    group: "analyse" },
  { id: "performance", label: "Rapports",             tabs: ["forecast", "sea"],                               group: "analyse" },
  { id: "geo",         label: "Visibilité IA",        tabs: ["geo"],                                           group: "analyse" },
  { id: "audit",       label: "Audit",                tabs: ["audit"],                                         group: "analyse" },
  // ── Actions : le pilotage de la presta ──
  { id: "emc",          label: "Opportunités",        tabs: ["recommandations"],                               group: "actions" },
  { id: "opportunites", label: "Actions",             tabs: ["opportunites"],                                  group: "actions" },
  { id: "creation",     label: "Créer du contenu",    tabs: ["creation"],                                      group: "actions" },
  { id: "suivi",        label: "Suivi",               tabs: ["historique"],                                    group: "actions" },
  { id: "notes",        label: "Notes",               tabs: ["notes"],                                         group: "actions" },
];

/** Ordre d'affichage des groupes de nav + libellé de section sidebar. */
export const NAV_GROUPS: { id: NavGroup; label: string }[] = [
  { id: "analyse", label: "Analyse" },
  { id: "actions", label: "Actions" },
];

/** Section contenant un onglet donné. */
export function sectionForTab(tab: Tab): NavSection | undefined {
  return NAV_SECTIONS.find((s) => s.tabs.includes(tab));
}

/* ── Sous-vues internes du Netlinking (pilotées par ?view=, exposées en sidebar) ── */
export type NetView = "overview" | "autorite" | "benchmark" | "profil" | "opportunites" | "backlinks";
export const NET_VIEWS: { key: NetView; label: string }[] = [
  { key: "overview",     label: "Vue d'ensemble" },
  { key: "autorite",     label: "Autorité média" },
  { key: "benchmark",    label: "Concurrents" },
  { key: "profil",       label: "Profil & ancres" },
  { key: "opportunites", label: "Opportunités" },
  { key: "backlinks",    label: "Backlinks" },
];
