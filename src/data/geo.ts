/**
 * Fixtures mock du module Visibilité IA.
 *
 * Listes suggérées + prompts (avec volume estimé) + concurrents proposés,
 * déduits du domaine. Sert d'amorce au wizard de configuration.
 */

import type { TopicList, Competitor, Prompt, GeoSetup } from "@/components/geo/types";

let _id = 0;
const pid = () => `p-${_id++}`;

function prompt(text: string, volume: number, active = true): Prompt {
  return { id: pid(), text, volume, language: "fr", region: "FR", active };
}

/** Listes de prompts suggérées (mock), pré-sélectionnées. */
export const SUGGESTED_LISTS: TopicList[] = [
  {
    id: "list-agence-seo",
    name: "Agence SEO",
    source: "suggested",
    selected: true,
    prompts: [
      prompt("Quelle est la meilleure agence SEO en France ?", 2400),
      prompt("Quelle agence SEO choisir pour une PME ?", 1300),
      prompt("Agence SEO vs consultant SEO freelance", 880),
      prompt("Combien coûte une prestation SEO en agence ?", 720),
      prompt("Meilleures agences SEO B2B", 590),
    ],
  },
  {
    id: "list-formation-seo",
    name: "Formation SEO",
    source: "suggested",
    selected: true,
    prompts: [
      prompt("Quelle est la meilleure formation SEO ?", 3100),
      prompt("Formation SEO certifiante reconnue", 1600),
      prompt("Apprendre le SEO en 2026", 1200),
      prompt("Formation référencement naturel pour débutant", 980),
    ],
  },
  {
    id: "list-geo",
    name: "Visibilité IA / GEO",
    source: "suggested",
    selected: true,
    prompts: [
      prompt("Comment être cité par ChatGPT ?", 1900),
      prompt("Optimiser son site pour les réponses IA", 1100),
      prompt("Qu'est-ce que le GEO en SEO ?", 640),
      prompt("Outils pour suivre sa visibilité dans les IA", 410),
    ],
  },
  {
    id: "list-marketing-digital",
    name: "Marketing digital",
    source: "suggested",
    selected: false,
    prompts: [
      prompt("Meilleure agence marketing digital", 2900),
      prompt("Stratégie d'acquisition pour une startup", 1400),
      prompt("Agence marketing digital santé", 320),
    ],
  },
  {
    id: "list-audit-seo",
    name: "Audit SEO",
    source: "suggested",
    selected: false,
    prompts: [
      prompt("Comment réaliser un audit SEO complet ?", 1700),
      prompt("Meilleur outil d'audit SEO", 1300),
      prompt("Audit technique SEO : par où commencer", 720),
      prompt("Combien coûte un audit SEO ?", 480),
    ],
  },
  {
    id: "list-netlinking",
    name: "Popularité",
    source: "suggested",
    selected: false,
    prompts: [
      prompt("Meilleure agence de netlinking", 1900),
      prompt("Comment obtenir des backlinks de qualité ?", 2200),
      prompt("Stratégie de netlinking pour une PME", 640),
      prompt("Acheter des backlinks : bonne ou mauvaise idée", 880),
    ],
  },
  {
    id: "list-ecommerce-seo",
    name: "SEO e-commerce",
    source: "suggested",
    selected: false,
    prompts: [
      prompt("Meilleure agence SEO e-commerce", 1500),
      prompt("Optimiser le SEO d'une boutique Shopify", 1100),
      prompt("SEO pour fiches produits", 590),
    ],
  },
  {
    id: "list-seo-local",
    name: "SEO local",
    source: "suggested",
    selected: false,
    prompts: [
      prompt("Comment améliorer son référencement local ?", 2400),
      prompt("Agence SEO local", 720),
      prompt("Optimiser sa fiche Google Business Profile", 1600),
    ],
  },
  {
    id: "list-strategie-contenu",
    name: "Stratégie de contenu",
    source: "suggested",
    selected: false,
    prompts: [
      prompt("Construire une stratégie de contenu SEO", 1300),
      prompt("Calendrier éditorial SEO", 880),
      prompt("Content marketing pour le B2B", 1000),
    ],
  },
];

/** Volume agrégé d'un sujet (estimé, mock) — formaté façon Profound. */
export function topicVolume(prompts: { volume: number }[]): string {
  const total = prompts.reduce((s, p) => s + p.volume, 0);
  if (total < 1000) return "<1k";
  return `${(total / 1000).toFixed(1).replace(".", ",")}k`;
}

/** Concurrents proposés au tracking (mock). */
export const SUGGESTED_COMPETITORS: Competitor[] = [
  { id: "c-semji",       name: "Semji",         domain: "semji.com",        tracked: true },
  { id: "c-abondance",   name: "Abondance",     domain: "abondance.com",    tracked: true },
  { id: "c-eskimoz",     name: "Eskimoz",       domain: "eskimoz.fr",       tracked: true },
  { id: "c-leptidigital",name: "Leptidigital",  domain: "leptidigital.fr",  tracked: false },
];

/** Banque de prompts pour la (re)génération IA mock. */
export const AI_PROMPT_BANK: string[] = [
  "Quelle agence SEO recommande-t-on pour le e-commerce ?",
  "Comment choisir son agence de référencement naturel ?",
  "Tarif moyen d'un accompagnement SEO mensuel",
  "Agence SEO spécialisée dans la santé",
  "Quel ROI attendre d'une prestation SEO ?",
  "Différence entre SEO et GEO",
  "Comment mesurer sa visibilité sur Perplexity ?",
  "Meilleurs outils de suivi de positions en 2026",
];

export function randomVolume(): number {
  // Volume pseudo-aléatoire stable-ish pour la démo (pas de Math.random au render).
  const pool = [180, 260, 340, 480, 590, 720, 910, 1200, 1600, 2100];
  return pool[(_id * 7) % pool.length];
}

/** Top mots-clés (volume de prompts estimé, mock) — façon Profound. */
export const TOP_KEYWORDS: { keyword: string; volume: number }[] = [
  { keyword: "agence seo",            volume: 74000 },
  { keyword: "référencement naturel", volume: 60500 },
  { keyword: "audit seo",             volume: 33100 },
  { keyword: "consultant seo",        volume: 27400 },
  { keyword: "netlinking",            volume: 22300 },
  { keyword: "seo local",             volume: 18200 },
  { keyword: "rédaction web seo",     volume: 12100 },
  { keyword: "stratégie de contenu",  volume: 9900 },
  { keyword: "backlinks",             volume: 8100 },
  { keyword: "seo technique",         volume: 6600 },
];

/** Formate un volume en notation compacte (74000 → "74k", 1300000 → "1,3M"). */
export function formatVolume(n: number): string {
  const fmt = (v: number) => (Number.isInteger(v) ? `${v}` : v.toFixed(1).replace(".", ","));
  if (n >= 1_000_000) return `${fmt(Math.round(n / 1e5) / 10)}M`;
  if (n >= 1_000) return `${fmt(Math.round(n / 100) / 10)}k`;
  return `${n}`;
}

/**
 * Setup par défaut (mock) — pré-configuré pour atterrir directement sur le
 * dashboard sans repasser par le wizard. Le wizard reste accessible via « Reconfigurer ».
 */
export const DEFAULT_SETUP: GeoSetup = {
  configured: true,
  platforms: ["chatgpt", "perplexity", "gemini", "claude"],
  regions: ["FR"],
  language: "fr",
  lists: SUGGESTED_LISTS.filter((l) => l.selected),
  competitors: SUGGESTED_COMPETITORS.filter((c) => c.tracked),
};
