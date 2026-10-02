export type Tab = "general" | "briefs" | "seo" | "tracking" | "sea" | "forecast" | "netlinking" | "technique" | "audit" | "cannibal" | "univers" | "recommandations" | "opportunites" | "creation" | "historique" | "notes" | "benchmark" | "geo";

export const TABS: { key: Tab; label: string }[] = [
  { key: "general",          label: "Général" },
  { key: "briefs",           label: "URLs" },
  { key: "seo",              label: "Vue d'ensemble" },
  { key: "tracking",         label: "Positions" },
  { key: "sea",              label: "SEA & Paid" },
  { key: "forecast",         label: "Forecast" },
  { key: "netlinking",       label: "Popularité" },
  { key: "technique",        label: "Technique" },
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
  tracking:   "Positions",
  sea:        "SEA & Paid",
  forecast:   "Forecast",
  netlinking: "Popularité",
  technique:  "Technique",
  cannibal:   "Cannibalisation",
  univers:        "Univers sémantique",
  recommandations: "Opportunités",
  audit:          "Audits",
  opportunites:   "Actions",
  creation:       "Créer du contenu",
  historique:     "Suivi",
  notes:          "Notes",
  benchmark:      "Benchmark",
  geo:            "Visibilité IA",
};

export const TAB_SUBTITLES: Partial<Record<Tab, string>> = {
  cannibal: "Pages en conflit de positionnement — dilution du trafic et des signaux de pertinence.",
  univers:  "Identifiez les opportunités de contenu pour renforcer votre couverture sémantique.",
  tracking: "8 mots-clés · Dernier check : 04 mai, 14:00",
  recommandations: "Les opportunités à saisir, regroupées par sujet et classées par priorité.",
  opportunites: "Toutes les actions à mener sur le projet, priorisées par impact et regroupées par statut.",
  creation: "Créez une nouvelle page : partez de zéro ou d'un template éprouvé.",
  historique: "Toutes les actions livrées par mois, source du rapport mensuel client.",
  notes: "Journal de bord du projet : décisions, échanges client et points de suivi.",
  benchmark: "Comparaison de votre visibilité organique vs vos concurrents.",
};

/* ── Arborescence regroupée (nav projet) ───────────────────────────────
   Regroupe les onglets en sections lisibles. Les sections multi-onglets
   affichent une barre de sous-onglets dans la page analyse. */

/** Groupe de nav sidebar : entrées principales (sans en-tête) puis Analyse / Actions. */
export type NavGroup = "principal" | "analyse" | "actions";
export type NavSection = { id: string; label: string; tabs: Tab[]; group: NavGroup };

export const NAV_SECTIONS: NavSection[] = [
  // ── Entrées principales (hors « Analyse », sans en-tête, tout en haut) ──
  { id: "overview",    label: "Vue d'ensemble",       tabs: ["general"],                                       group: "principal" },
  { id: "urls",        label: "URLs",                 tabs: ["briefs"],                                        group: "principal" },
  // ── Analyse : les données du projet (ordre : axes de score alignés) ──
  { id: "audit",       label: "Audits",               tabs: ["audit"],                                         group: "analyse" },
  { id: "contenu",     label: "Sémantique",           tabs: ["seo", "tracking", "cannibal", "benchmark"], group: "analyse" },
  { id: "netlinking",  label: "Popularité",           tabs: ["netlinking"],                                    group: "analyse" },
  { id: "geo",         label: "Visibilité IA",        tabs: ["geo"],                                           group: "analyse" },
  { id: "performance", label: "Rapports",             tabs: ["forecast", "sea"],                               group: "analyse" },
  // ── Actions : le pilotage de la presta ──
  { id: "opportunites", label: "Toutes les actions",     tabs: ["opportunites"],                               group: "actions" },
  { id: "emc",          label: "Opportunités",           tabs: ["recommandations"],                            group: "actions" },
  { id: "creation",     label: "Création de contenus",   tabs: ["creation"],                                   group: "actions" },
  { id: "suivi",        label: "Historique des actions", tabs: ["historique"],                                 group: "actions" },
  { id: "notes",        label: "Notes",                  tabs: ["notes"],                                      group: "actions" },
];

/** Ordre d'affichage des groupes de nav + libellé de section sidebar. */
export const NAV_GROUPS: { id: NavGroup; label: string }[] = [
  { id: "principal", label: "" },
  { id: "analyse",   label: "Analyse" },
  { id: "actions",   label: "Actions" },
];

/** Section contenant un onglet donné. */
export function sectionForTab(tab: Tab): NavSection | undefined {
  return NAV_SECTIONS.find((s) => s.tabs.includes(tab));
}

/* ── Sous-vues internes de la Popularité (pilotées par ?view=, exposées en sidebar) ── */
export type NetView = "overview" | "autorite" | "benchmark" | "profil" | "opportunites" | "backlinks";
export const NET_VIEWS: { key: NetView; label: string }[] = [
  { key: "overview",     label: "Vue d'ensemble" },
  { key: "backlinks",    label: "Backlinks" },
  { key: "benchmark",    label: "Concurrents" },
  { key: "opportunites", label: "Opportunités" },
  { key: "profil",       label: "Profil & ancres" },
  { key: "autorite",     label: "Autorité média" },
];
