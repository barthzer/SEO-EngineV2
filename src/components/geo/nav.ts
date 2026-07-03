/** Vues internes du module Visibilité IA — partagées entre la vue et la sidebar. */

export type GeoView =
  | "overview" | "visibility" | "concurrents" | "prompts" | "platforms"
  | "sentiment" | "citations" | "volume" | "opportunities" | "settings";

export const GEO_VIEWS: { key: GeoView; label: string; soon?: boolean }[] = [
  { key: "overview",      label: "Vue d'ensemble" },
  { key: "visibility",    label: "Visibilité" },
  { key: "concurrents",   label: "Concurrents" },
  { key: "prompts",       label: "Prompts" },
  { key: "platforms",     label: "Plateformes" },
  { key: "sentiment",     label: "Sentiment" },
  { key: "citations",     label: "Citations" },
  { key: "volume",        label: "Volume",       soon: true },
  { key: "opportunities", label: "Opportunités", soon: true },
  { key: "settings",      label: "Paramètres" },
];
