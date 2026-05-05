"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon, ArrowPathIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/Button";
import { Tooltip, ChartTooltip } from "@/components/Tooltip";
import { FilterTabs } from "@/components/FilterTabs";
import { StatusPill, StatusPillDropdown, type Status } from "@/components/StatusPill";

/* ── Types ────────────────────────────────────────────────────────────── */

type Dimension = "eeat" | "soseo" | "suropt" | "intent" | "hn" | "canib";
type Severity  = "critique" | "important" | "moyen";

type IssueUrl = { url: string; clicks?: number | null; impr: string; lot?: string };
type Issue = {
  id: string; label: string; pages: number; visits: string | null;
  severity: Severity; dimension: Dimension;
  description: string; fix: string; urls?: IssueUrl[];
};

type CannibalSev = "HIGH" | "MEDIUM" | "LOW";

type CannibalUrl = {
  url: string; clickShare: number; avgPos: number;
  clicks: number; impressions: number; ctr: string;
};

type CannibalKw = {
  keyword: string; severity: CannibalSev; urls: CannibalUrl[];
  clicks: number; lostClicks: number | null; volume: number | null;
  action: string; status: "open" | "resolved" | "ignored";
};

type CannibalPage = {
  url: string; kwConflicts: number; clicksAtRisk: number; maxSeverity: CannibalSev;
};

type SemStatus = "cannibalisation" | "opportunite" | "couvert";
type SemanticKw = {
  keyword: string;
  urls: { url: string; pos: number }[];
  extraUrls: number;
  source: "PAA" | "Related";
  api: string;
  status: SemStatus;
  cannibCount?: number;
  volume: number;
  score: number | null;
};

/* ── Issues ───────────────────────────────────────────────────────────── */

const ISSUES: Issue[] = [
  /* ── CRITIQUE ── */
  {
    id: "toxic-cat", label: "Expressions sur-optimisées présentes",
    pages: 3, visits: "17", severity: "critique", dimension: "suropt",
    description: "3 pages avec 30 expressions sur-optimisées (10.0 par page en moyenne). Ratio jugé toxique par les algorithmes de pertinence sémantique de Google.",
    fix: "Réduire les occurrences des mots listés. Cibler une densité de 1.5–2× la médiane SERP par expression.",
    urls: [
      { url: "/agence-marketing-digital-tourisme-voyage/", clicks: 17,   impr: "54.1k", lot: "Top trafic" },
      { url: "/agence-marketing-digital-sante/",          clicks: null,  impr: "41k",   lot: "Top trafic" },
      { url: "/formation/formation-seo/",                 clicks: null,  impr: "6.4k",  lot: "Formation"  },
    ],
  },
  {
    id: "kw-absent", label: "Mot-clé cible absent",
    pages: 3, visits: "17", severity: "critique", dimension: "soseo",
    description: "3 pages avec mot-clé cible absent vs la médiane SERP — signal de pertinence à ajuster. Google attend au minimum une occurrence dans le title, le H1 et le premier paragraphe.",
    fix: "Intégrer le mot-clé cible en title + H1 + premier paragraphe avec une densité proche de la médiane SERP.",
    urls: [
      { url: "/agence-marketing-digital-tourisme-voyage/", clicks: 17,   impr: "54.1k", lot: "Top trafic" },
      { url: "/agence-marketing-digital-sante/",          clicks: null,  impr: "41k",   lot: "Top trafic" },
      { url: "/formation/formation-seo/",                 clicks: null,  impr: "6.4k",  lot: "Formation"  },
    ],
  },
  /* ── IMPORTANT ── */
  {
    id: "eeat-1", label: "Signaux E-E-A-T insuffisants",
    pages: 9, visits: "1,4k", severity: "important", dimension: "eeat",
    description: "9 pages avec 0.6/3 signaux E-E-A-T détectés en moyenne — risque Core Update élevé. Google valorise désormais la traçabilité auteur, la fraîcheur et la richesse multimédia.",
    fix: "Ajouter une byline auteur visible, une date de publication/MAJ, et enrichir avec chiffres + images (≥ 800 mots, ≥ 1 image / 1000 mots).",
    urls: [
      { url: "/",                                                         clicks: 1528, impr: "173.6k", lot: "Top trafic" },
      { url: "/agence-marketing-digital-tourisme-voyage/",                clicks: 17,   impr: "54.1k",  lot: "Top trafic" },
      { url: "/agence-marketing-digital-b2b/",                           clicks: 7,    impr: "75k",    lot: "Top trafic" },
      { url: "/analyse-de-logs-seo-10-bonnes-raisons-de-les-exploiter/", clicks: 4,    impr: "8.9k"  },
      { url: "/agence-seo-mirakl/",                                       clicks: 2,    impr: "9.6k"  },
      { url: "/seo-et-erreur-404-le-guide-pratique/",                     clicks: 2,    impr: "6.4k"  },
      { url: "/agence-marketing-digital-mode-pret-a-porter/",             clicks: null, impr: "8k",    lot: "Top trafic" },
      { url: "/agence-marketing-digital-sante/",                         clicks: null, impr: "41k",   lot: "Top trafic" },
      { url: "/seo-salesforce-commerce-cloud/",                          clicks: null, impr: "22.8k" },
    ],
  },
  {
    id: "toxic-long", label: "Expressions sur-optimisées présentes (long tail)",
    pages: 7, visits: "1,3k", severity: "important", dimension: "suropt",
    description: "7 pages avec 68 expressions sur-optimisées (9.7 par page en moyenne). Sur-optimisation lexicale détectable par les modèles BERT/MUM.",
    fix: "Réduire les occurrences des mots identifiés comme toxiques sur chaque URL impactée.",
  },
  {
    id: "soseo", label: "SOSEO inférieur à la moyenne top 3",
    pages: 3, visits: "1,3k", severity: "important", dimension: "soseo",
    description: "3 pages avec SOSEO inférieur à la moyenne top 3 de 25 points en moyenne — optimisation sémantique insuffisante.",
    fix: "Enrichir le champ lexical SERP (termes manquants YTG) pour rattraper les top 3.",
  },
  {
    id: "intent", label: "Type de page différent de l'intent SERP dominante",
    pages: 2, visits: "17", severity: "important", dimension: "intent",
    description: "2 pages avec un type qui ne correspond pas à l'intention SERP majoritaire — risque majeur de perte de ranking.",
    fix: "Refondre la page pour matcher l'intent SERP majoritaire (ex. commercial → informationnel ou inverse).",
    urls: [
      { url: "/agence-marketing-digital-tourisme-voyage/", clicks: 17,   impr: "54.1k", lot: "Top trafic" },
      { url: "/agence-marketing-digital-sante/",          clicks: null,  impr: "41k",   lot: "Top trafic" },
    ],
  },
  {
    id: "dseo-1", label: "DSEO trop élevé vs concurrents top 5",
    pages: 4, visits: "13", severity: "important", dimension: "suropt",
    description: "4 pages avec DSEO 7.4× au-dessus des top 5 — risque de sur-optimisation détecté par Google.",
    fix: "Réduire la densité des termes sur-optimisés (word_gaps.over_optimized).",
  },
  {
    id: "hn", label: "Structure Hn insuffisante",
    pages: 2, visits: "4", severity: "important", dimension: "hn",
    description: "2 pages présentent une hiérarchie Hn déséquilibrée : H2/H3 manquants ou mal articulés — lecture algorithmique dégradée.",
    fix: "Compléter avec H2 thématiques (≥ 4) et H3 imbriqués pour structurer le contenu.",
    urls: [
      { url: "/agence-seo-mirakl/",                   clicks: 2, impr: "9.6k" },
      { url: "/seo-et-erreur-404-le-guide-pratique/", clicks: 2, impr: "6.4k" },
    ],
  },
  /* ── MOYEN ── */
  {
    id: "dseo-2", label: "DSEO trop élevé vs concurrents top 5 (catégorie 2)",
    pages: 2, visits: "17", severity: "moyen", dimension: "suropt",
    description: "2 pages avec DSEO 1.1× au-dessus des top 5 — risque de sur-optimisation détecté par Google.",
    fix: "Réduire la densité des termes sur-optimisés.",
  },
  {
    id: "canib", label: "Cannibalisation SERP GSC",
    pages: 2, visits: "2", severity: "moyen", dimension: "canib",
    description: "2 requêtes avec cannibalisation medium — 2 clics/mois à risque entre deux pages se positionnant sur la même intention.",
    fix: "Arbitrer (merge 301, réassigner l'intent, ou supprimer) les pages en conflit — voir l'onglet Cannibalisation.",
  },
  {
    id: "serpmantics", label: "Score sémantique global Serpmantics faible",
    pages: 1, visits: "2", severity: "moyen", dimension: "soseo",
    description: "1 page avec un score Serpmantics moyen de 60/100 — contenu jugé faible vs concurrents.",
    fix: "Enrichir les sections faibles (structure_recommendations et expressions_add).",
  },
  {
    id: "kw-overdensity", label: "Mot-clé cible sur-densité",
    pages: 1, visits: "4", severity: "moyen", dimension: "soseo",
    description: "1 page avec mot-clé cible en sur-densité vs la médiane SERP — signal de pertinence à ajuster (paradoxalement perçu comme spam).",
    fix: "Intégrer le mot-clé avec une densité proche de la médiane SERP.",
  },
  {
    id: "toxic-low", label: "Expressions sur-optimisées (faible volume)",
    pages: 1, visits: "4", severity: "moyen", dimension: "suropt",
    description: "1 page avec 3 expressions sur-optimisées (3.0 par page en moyenne).",
    fix: "Réduire les occurrences des mots identifiés comme toxiques.",
  },
  {
    id: "eeat-2", label: "Signaux E-E-A-T insuffisants (catégorie 2)",
    pages: 2, visits: "2", severity: "moyen", dimension: "eeat",
    description: "2 pages avec 2.0/3 signaux E-E-A-T détectés en moyenne — risque Core Update modéré.",
    fix: "Ajouter une byline auteur visible, une date de publication/MAJ et enrichir avec chiffres + images.",
  },
];

/* ── Univers sémantique — données ────────────────────────────────────── */

const S = (keyword: string, urls: {url:string;pos:number}[], extra: number, src: "PAA"|"Related", status: SemStatus, cannibCount: number|undefined, vol: number, score: number|null): SemanticKw =>
  ({ keyword, urls, extraUrls: extra, source: src, api: "haloscan", status, cannibCount, volume: vol, score });

const SEMANTIC_KWS: SemanticKw[] = [
  S("agence seo définition",               [{url:"/agence-marketing-digital-banque-assurance/",pos:2},{url:"/agence-marketing-digital-b2b/",pos:8}], 2, "PAA",     "cannibalisation", 4, 90,    80),
  S("agence digitale luxe",                [{url:"/",pos:50},{url:"/agence-marketing-digital-sante/",pos:59}],                                     0, "Related", "cannibalisation", 2, 140,   82),
  S("agence seo",                          [{url:"/agence-marketing-digital-banque-assurance/",pos:2},{url:"/agence-marketing-digital-b2b/",pos:8}], 4, "Related", "cannibalisation", 6, 2100,  80),
  S("google analytics",                    [], 0, "Related", "opportunite", undefined, 61400, null),
  S("agence seo paris",                    [], 0, "Related", "opportunite", undefined, 2400,  null),
  S("formation seo",                       [{url:"/formation/formation-seo/",pos:46}],                                                              0, "Related", "couvert",         undefined, 1700, 80),
  S("adveris",                             [], 0, "Related", "opportunite", undefined, 1200,  null),
  S("agence digital paris",                [{url:"/",pos:50}],                                                                                      0, "Related", "couvert",         undefined, 800,  80),
  S("formation seo cpf",                   [], 0, "Related", "opportunite", undefined, 390,   null),
  S("agence de communication tourisme",    [{url:"/agence-marketing-digital-tourisme-voyage/",pos:33}],                                             0, "Related", "couvert",         undefined, 210,  70),
  S("formation référencement naturel seo", [], 0, "Related", "opportunite", undefined, 210,   null),
  S("formation seo en ligne gratuite",     [], 0, "Related", "opportunite", undefined, 170,   null),
  S("vmed",                                [], 0, "Related", "opportunite", undefined, 140,   null),
  S("interface tourisme",                  [], 0, "Related", "opportunite", undefined, 140,   null),
  S("agence digitale paris",               [], 0, "Related", "opportunite", undefined, 100,   null),
  S("agence digital santé",                [{url:"/agence-marketing-digital-sante/",pos:59}],                                                       0, "Related", "couvert",         undefined, 90,   100),
  S("agence digitale créative",            [{url:"/",pos:50}],                                                                                      0, "Related", "couvert",         undefined, 90,   78),
  S("agence de communication médicale",    [], 0, "Related", "opportunite", undefined, 70,    null),
  S("agence communication touristique",    [{url:"/agence-marketing-digital-tourisme-voyage/",pos:33}],                                             0, "Related", "couvert",         undefined, 70,   70),
  S("agence communication tourisme",       [{url:"/agence-marketing-digital-tourisme-voyage/",pos:33}],                                             0, "Related", "couvert",         undefined, 70,   75),
  S("formation seo pôle emploi",           [], 0, "Related", "opportunite", undefined, 70,    null),
  S("agence communication santé paris",    [], 0, "Related", "opportunite", undefined, 50,    null),
  S("think tank santé",                    [], 0, "Related", "opportunite", undefined, 50,    null),
  S("formation certifiante seo",           [], 0, "Related", "opportunite", undefined, 50,    null),
  S("digital santé",                       [{url:"/agence-marketing-digital-sante/",pos:59}],                                                       0, "Related", "couvert",         undefined, 40,   92),
  S("club digital santé",                  [{url:"/agence-marketing-digital-sante/",pos:59}],                                                       0, "Related", "couvert",         undefined, 40,   78),
  S("télésanté définition",                [], 0, "PAA",     "opportunite", undefined, 30,    null),
  S("comm santé",                          [], 0, "Related", "opportunite", undefined, 30,    null),
  S("agence digitale site internet",       [{url:"/",pos:50}],                                                                                      0, "Related", "couvert",         undefined, 30,   76),
  S("agence digitale bordeaux",            [], 0, "Related", "opportunite", undefined, 30,    null),
  S("agence marketing tourisme",           [{url:"/agence-marketing-digital-tourisme-voyage/",pos:33}],                                             0, "Related", "couvert",         undefined, 30,   78),
  S("formation seo prix",                  [], 0, "PAA",     "opportunite", undefined, 30,    null),
  S("digitalisation de la santé",          [{url:"/agence-marketing-digital-sante/",pos:59}],                                                       0, "Related", "couvert",         undefined, 20,   77),
  S("transformation digitale santé",       [{url:"/agence-marketing-digital-sante/",pos:59}],                                                       0, "Related", "couvert",         undefined, 20,   77),
  S("kamui digital sante",                 [{url:"/agence-marketing-digital-sante/",pos:59}],                                                       0, "Related", "couvert",         undefined, 20,   71),
  S("agence marketing digital prix",       [], 0, "PAA",     "opportunite", undefined, 20,    null),
  S("agence marketing digital c'est quoi", [{url:"/agence-marketing-digital-mode-pret-a-porter/",pos:5}],                                           0, "PAA",     "couvert",         undefined, 20,   77),
  S("agence communication digitale",       [{url:"/",pos:50}],                                                                                      0, "Related", "couvert",         undefined, 20,   83),
  S("agence digital",                      [{url:"/",pos:50}],                                                                                      0, "Related", "couvert",         undefined, 20,   100),
  S("agence influenceur voyage",            [], 0, "Related", "opportunite", undefined, 20,    null),
  S("agence digitale tourisme",            [{url:"/agence-marketing-digital-tourisme-voyage/",pos:33}],                                             0, "Related", "couvert",         undefined, 20,   83),
  S("formation référencement naturel",     [], 0, "Related", "opportunite", undefined, 20,    null),
  S("formation seo openclassroom",         [], 0, "Related", "opportunite", undefined, 20,    null),
  S("mhealth definition",                  [], 0, "PAA",     "opportunite", undefined, 10,    null),
  S("tic santé définition",               [], 0, "PAA",     "opportunite", undefined, 10,    null),
  S("santé digitale définition",           [{url:"/agence-marketing-digital-sante/",pos:59}],                                                       0, "PAA",     "couvert",         undefined, 10,   77),
  S("agence communication santé lyon",     [], 0, "Related", "opportunite", undefined, 10,    null),
  S("conférence e-santé",                  [], 0, "Related", "opportunite", undefined, 10,    null),
  S("buzz e-santé",                        [], 0, "Related", "opportunite", undefined, 10,    null),
  S("digital et santé",                    [{url:"/agence-marketing-digital-sante/",pos:59}],                                                       0, "Related", "couvert",         undefined, 10,   82),
];

/* ── Cannibalisation data ─────────────────────────────────────────────── */

const CANNIBAL_KWS: CannibalKw[] = [
  {
    keyword: "agence seo", severity: "MEDIUM", clicks: 151, lostClicks: -12, volume: 2100, action: "Garder", status: "open",
    urls: [
      { url: "aw-i.com/agence-seo/",          clickShare: 78, avgPos: 3.2,  clicks: 118, impressions: 1325, ctr: "8.9%"  },
      { url: "aw-i.com/",                     clickShare: 22, avgPos: 7.1,  clicks: 33,  impressions: 890,  ctr: "3.7%"  },
    ],
  },
  {
    keyword: "audit seo", severity: "MEDIUM", clicks: 84, lostClicks: -8, volume: 880, action: "Rediriger", status: "open",
    urls: [
      { url: "aw-i.com/audit-seo/",           clickShare: 91, avgPos: 5.0,  clicks: 76,  impressions: 980,  ctr: "7.8%"  },
      { url: "aw-i.com/services/",            clickShare: 9,  avgPos: 14.2, clicks: 8,   impressions: 310,  ctr: "2.6%"  },
    ],
  },
  {
    keyword: "formation seo", severity: "MEDIUM", clicks: 42, lostClicks: -5, volume: 1700, action: "Garder", status: "open",
    urls: [
      { url: "aw-i.com/formation/formation-seo/", clickShare: 88, avgPos: 4.8, clicks: 37, impressions: 740, ctr: "5.0%" },
      { url: "aw-i.com/formation/",              clickShare: 12, avgPos: 11.3, clicks: 5,  impressions: 220, ctr: "2.3%" },
    ],
  },
  {
    keyword: "consultant seo", severity: "LOW", clicks: 18, lostClicks: -1, volume: 720, action: "Ignorer", status: "open",
    urls: [
      { url: "aw-i.com/consultant-seo/",      clickShare: 83, avgPos: 9.1,  clicks: 15,  impressions: 390,  ctr: "3.8%"  },
      { url: "aw-i.com/equipe/",              clickShare: 17, avgPos: 18.4, clicks: 3,   impressions: 179,  ctr: "1.7%"  },
    ],
  },
];

const CANNIBAL_PAGES: CannibalPage[] = [
  { url: "aw-i.com/",                     kwConflicts: 2, clicksAtRisk: 41,  maxSeverity: "MEDIUM" },
  { url: "aw-i.com/agence-seo/",          kwConflicts: 1, clicksAtRisk: 151, maxSeverity: "MEDIUM" },
  { url: "aw-i.com/services/",            kwConflicts: 1, clicksAtRisk: 8,   maxSeverity: "MEDIUM" },
  { url: "aw-i.com/equipe/",              kwConflicts: 1, clicksAtRisk: 3,   maxSeverity: "LOW"    },
];

const CANNIBAL_HISTORY = [
  { label: "Nov",  value: 8 },
  { label: "Déc",  value: 7 },
  { label: "Jan",  value: 9 },
  { label: "Fév",  value: 7 },
  { label: "Mar",  value: 6 },
  { label: "Avr",  value: 5 },
  { label: "Mai",  value: 4 },
];

const CANNIBAL_SEV_CONFIG: Record<CannibalSev, { label: string; color: string; bg: string }> = {
  HIGH:   { label: "HIGH",   color: "#E11D48", bg: "rgba(225,29,72,0.08)"  },
  MEDIUM: { label: "MEDIUM", color: "#F59E0B", bg: "rgba(245,158,11,0.1)"  },
  LOW:    { label: "LOW",    color: "#10B981", bg: "rgba(16,185,129,0.09)" },
};

/* ── Lots ─────────────────────────────────────────────────────────────── */

type LotData = {
  label: string; count: number; pct: number;
  visitsAtRisk: string; headlineEm: string; headlineTail: string;
  sub: string; score: number; grade: string;
  issues: string[];
  verdictBlocker: string; verdictOpp: string; verdictCov: string;
  dims: Record<Dimension, number>;
};

const LOTS: Record<string, LotData> = {
  all: {
    label: "Tous les lots", count: 11, pct: 8,
    visitsAtRisk: "4,1k", headlineEm: "−4.1k visites/mois", headlineTail: "menacées\npar 9 signaux E-E-A-T faibles.",
    sub: "Neuf pages manquent de signaux d'expertise et d'autorité, mettant en danger 1 361 visites par mois. Priorité avant le prochain Core Update : enrichir le contenu et expliciter les sources.",
    score: 62, grade: "C",
    issues: ["toxic-cat","kw-absent","eeat-1","toxic-long","soseo","intent","dseo-1","hn","dseo-2","canib","serpmantics","kw-overdensity","toxic-low","eeat-2"],
    verdictBlocker: "9 pages sans signaux E-E-A-T explicites — risque direct de chute de trafic au prochain Core Update Google. Concerne 1,4k visites/mois.",
    verdictOpp: "Réduire la sur-optimisation lexicale sur les 3 pages catégorie : signal de pertinence ajusté — potentiel +20% de visibilité sur les requêtes commerciales.",
    verdictCov: "11 pages éditoriales analysées sur les 133 du site. Périmètre limité aux pages stratégiques importées dans Recommandation de page.",
    dims: { eeat: 35, soseo: 68, suropt: 42, intent: 82, hn: 75, canib: 88 },
  },
  "cat-jean": {
    label: "Catégorie Jean", count: 3, pct: 2,
    visitsAtRisk: "980", headlineEm: "−980 visites/mois", headlineTail: "à risque sur la\ncatégorie Jean.",
    sub: "Les 3 pages catégorie Jean cumulent 30 expressions sur-optimisées et un DSEO 7.4× au-dessus des concurrents top 5. Risque de sur-optimisation détecté par Google.",
    score: 48, grade: "D",
    issues: ["toxic-cat","kw-absent","dseo-1"],
    verdictBlocker: "30 expressions sur-optimisées détectées sur les 3 pages — densité jugée toxique par les modèles BERT/MUM.",
    verdictOpp: "Réintroduire le mot-clé cible en title, H1 et premier paragraphe sur les 3 pages — gain attendu : retour dans le top 10 SERP.",
    verdictCov: "3 pages catégorie Jean analysées · 100% du lot couvert.",
    dims: { eeat: 70, soseo: 30, suropt: 18, intent: 65, hn: 80, canib: 95 },
  },
  "top-trafic": {
    label: "Top pages trafic", count: 5, pct: 4,
    visitsAtRisk: "3,2k", headlineEm: "−3.2k visites/mois", headlineTail: "sur vos 5 pages\nles plus fortes.",
    sub: "Vos 5 pages top trafic sont aussi les plus à risque : 100% présentent des signaux E-E-A-T insuffisants, et 3 ont des expressions sur-optimisées. Priorité absolue.",
    score: 55, grade: "C",
    issues: ["toxic-cat","kw-absent","eeat-1","toxic-long","intent"],
    verdictBlocker: "5 pages à 1 528 + 17 + 7 + 0 + 0 clics/mois — toutes manquent d'auteur visible, date de MAJ et richesse multimédia.",
    verdictOpp: "Ajouter les 3 signaux E-E-A-T (auteur / date / images) sur ces 5 pages = +20% de visibilité estimée au prochain Core Update.",
    verdictCov: "5 pages top trafic · cumulent 73% du trafic SEO du site.",
    dims: { eeat: 22, soseo: 65, suropt: 50, intent: 70, hn: 85, canib: 92 },
  },
  "ymyl": {
    label: "Pages YMYL", count: 2, pct: 1.5,
    visitsAtRisk: "460", headlineEm: "−460 visites/mois", headlineTail: "sur le périmètre\nYour Money Your Life.",
    sub: "Les pages YMYL exigent une qualité E-E-A-T renforcée. Vos 2 pages n'ont aucune mention d'auteur ni source citée — un risque algorithmique élevé.",
    score: 38, grade: "D",
    issues: ["eeat-1","eeat-2","soseo"],
    verdictBlocker: "0 mention d'auteur sur les 2 pages YMYL — le facteur le plus pénalisant pour les sujets sensibles.",
    verdictOpp: "Ajouter une bio auteur experte + références scientifiques sur les 2 pages YMYL : priorité absolue.",
    verdictCov: "2 pages YMYL identifiées · 100% du lot couvert.",
    dims: { eeat: 18, soseo: 52, suropt: 88, intent: 90, hn: 65, canib: 100 },
  },
  "formation": {
    label: "Formation & services", count: 4, pct: 3,
    visitsAtRisk: "850", headlineEm: "−850 visites/mois", headlineTail: "sur le lot\nFormation & services.",
    sub: "4 pages formation présentent une sur-optimisation modérée et un SOSEO inférieur de 25 points au top 3 SERP. Le mot-clé cible est mal placé.",
    score: 64, grade: "C",
    issues: ["toxic-cat","kw-absent","soseo","toxic-low"],
    verdictBlocker: "SOSEO −25 points vs top 3 sur 3 des 4 pages formation — champ lexical SERP insuffisamment couvert.",
    verdictOpp: "Enrichir avec termes manquants YTG + intégrer le mot-clé cible en intro = retour potentiel dans le top 5.",
    verdictCov: "4 pages formation/services · 100% du lot couvert.",
    dims: { eeat: 65, soseo: 42, suropt: 55, intent: 88, hn: 80, canib: 100 },
  },
  "case-studies": {
    label: "Case studies", count: 3, pct: 2,
    visitsAtRisk: "120", headlineEm: "Périmètre case studies", headlineTail: "globalement sain.",
    sub: "Les 3 case studies sont en bonne santé éditoriale : structure Hn correcte, intent SERP aligné, mais 2 ont des problèmes de cannibalisation entre elles.",
    score: 78, grade: "B",
    issues: ["canib","hn"],
    verdictBlocker: "2 case studies en cannibalisation sur la même requête commerciale — clics dilués entre 2 URLs.",
    verdictOpp: "Merge 301 ou réassignation d'intent sur les 2 pages : voir l'onglet Cannibalisation.",
    verdictCov: "3 case studies · 100% du lot couvert.",
    dims: { eeat: 75, soseo: 80, suropt: 92, intent: 85, hn: 70, canib: 60 },
  },
};

const LOT_KEYS = ["all","cat-jean","top-trafic","ymyl","formation","case-studies"];

/* ── Dimensions ───────────────────────────────────────────────────────── */

const DIMENSION_CONFIG: { key: Dimension; label: string; meta: string }[] = [
  { key: "eeat",   label: "E-E-A-T",          meta: "9 pages à risque · 2 issues" },
  { key: "soseo",  label: "SOSEO",             meta: "3 pages sous le top 3 · 4 issues" },
  { key: "suropt", label: "Sur-optimisation",  meta: "11 pages avec toxic_expr · 5 issues" },
  { key: "intent", label: "Intent match",      meta: "2 pages mismatch · 1 issue" },
  { key: "hn",     label: "Structure Hn",      meta: "2 pages incomplètes · 1 issue" },
  { key: "canib",  label: "Cannibalisation",   meta: "2 requêtes en conflit · 1 issue" },
];

const SEVERITY_CONFIG: Record<Severity, { label: string; color: string; bg: string }> = {
  critique:  { label: "Critique",  color: "#E11D48", bg: "rgba(225,29,72,0.08)"  },
  important: { label: "Important", color: "#F59E0B", bg: "rgba(245,158,11,0.1)"  },
  moyen:     { label: "Moyen",     color: "#6B7280", bg: "rgba(107,114,128,0.1)" },
};

/* ── Helpers ──────────────────────────────────────────────────────────── */

const STATUS_CYCLE: Status[] = ["todo", "doing", "done"];

function nextStatus(s: Status): Status {
  return STATUS_CYCLE[(STATUS_CYCLE.indexOf(s) + 1) % STATUS_CYCLE.length];
}

function scoreColor(n: number) {
  return n >= 70 ? "#10B981" : n >= 50 ? "#F59E0B" : "#E11D48";
}

/* ── Column filter dropdown ───────────────────────────────────────────── */

function ColDropdown({ label, active, children }: {
  label: string;
  active: boolean;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const portalRef  = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || portalRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const toggle = () => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left });
    setOpen((o) => !o);
  };

  return (
    <div ref={triggerRef} className="inline-flex">
      <button onClick={toggle}
        className={`inline-flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-all ${active ? "border-[#3E50F5] bg-[rgba(62,80,245,0.08)] text-[#3E50F5]" : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--text-muted)]"}`}>
        {label}
        <ChevronDownIcon className={`h-3 w-3 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && typeof document !== "undefined" && createPortal(
        <div ref={portalRef} className="fixed z-[999] min-w-[160px] rounded-2xl p-2 shadow-[var(--shadow-floating)]"
          style={{ top: pos.top, left: pos.left, backgroundColor: "var(--dropdown-bg)", backdropFilter: "saturate(180%) blur(24px)", WebkitBackdropFilter: "saturate(180%) blur(24px)" }}>
          {children(() => setOpen(false))}
        </div>,
        document.body
      )}
    </div>
  );
}

function OptBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick}
      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[14px] font-medium transition-colors hover:bg-[var(--bg-secondary)] ${active ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>
      {children}
      {active && <CheckIcon className="h-3.5 w-3.5 flex-shrink-0 text-[#3E50F5]" />}
    </button>
  );
}

/* ── Micro-components ─────────────────────────────────────────────────── */

function StatusDot({ status, onClick }: { status: Status; onClick: () => void }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] transition-all ${
        status === "done"  ? "border-[#10B981] bg-[#10B981]" :
        status === "doing" ? "border-[#F59E0B] bg-[rgba(245,158,11,0.1)]" :
        "border-[var(--text-muted)]"
      }`}>
      {status === "done"  && <CheckIcon className="h-2.5 w-2.5 text-white" />}
      {status === "doing" && <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />}
    </button>
  );
}


function SectionHead({ num, title, em, meta }: { num: string; title: string; em: string; meta: string }) {
  return (
    <div className="mb-6 flex items-baseline justify-between">
      <h2 className="text-[22px] font-semibold tracking-tight text-[var(--text-primary)]">
        <span className="mr-2 text-[13px] font-medium text-[var(--text-muted)]">{num}</span>
        {title} <em className="not-italic text-[var(--text-primary)]">{em}</em>
      </h2>
      <span className="text-[13px] text-[var(--text-muted)]">{meta}</span>
    </div>
  );
}

/* ── Semantic universe helpers ────────────────────────────────────────── */

function UrlTip({ url }: { url: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[10px] font-semibold uppercase opacity-50">URL complète</p>
      <p className="break-all font-mono text-[11px] opacity-90">{url}</p>
      <p className="text-[11px] opacity-40">Cliquez pour ouvrir l'analyse</p>
    </div>
  );
}

function SourceTip({ source }: { source: "PAA" | "Related" }) {
  if (source === "PAA") return (
    <div className="flex flex-col gap-1.5">
      <p className="font-semibold">Question "People Also Ask"</p>
      <p className="opacity-75">Ce keyword provient des questions fréquentes affichées par Google pour ce sujet.</p>
      <p className="opacity-50">Source API : Google SERP</p>
      <p className="mt-0.5">💡 Excellent pour FAQ, H2/H3, featured snippets</p>
    </div>
  );
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-semibold">Keyword associé</p>
      <p className="opacity-75">Ce keyword est sémantiquement lié à votre sujet principal.</p>
      <p className="opacity-50">Source API : Google</p>
      <p className="mt-0.5">💡 Enrichit votre champ sémantique</p>
    </div>
  );
}

function CannibalTip({ row }: { row: SemanticKw }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-semibold text-[#F87171]">Cannibalisation détectée</p>
      <p className="opacity-75">Ce keyword est ciblé par plusieurs pages. Cela dilue votre positionnement et crée une compétition interne.</p>
      <div className="mt-0.5 flex flex-col gap-0.5">
        <p className="text-[10px] font-semibold uppercase opacity-50">Pages en conflit</p>
        {row.urls.map((u, i) => (
          <p key={i} className="font-mono text-[11px] opacity-80">• {u.url}</p>
        ))}
        {row.extraUrls > 0 && <p className="text-[11px] opacity-50">• +{row.extraUrls} autres pages</p>}
      </div>
      <p className="opacity-60">Choisissez une page principale et redirigez les autres, ou différenciez l'intention de chaque page.</p>
    </div>
  );
}

function CouvertTip({ row }: { row: SemanticKw }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-semibold text-[#10B981]">Keyword couvert ✓</p>
      <p className="opacity-75">Une page de votre site cible déjà ce keyword. La correspondance est bonne{row.score !== null ? ` (score : ${row.score}%)` : ""}.</p>
      {row.urls.length > 0 && (
        <div className="mt-0.5 flex flex-col gap-0.5">
          <p className="text-[10px] font-semibold uppercase opacity-50">Page associée</p>
          {row.urls.map((u, i) => (
            <p key={i} className="font-mono text-[11px] opacity-80">• {u.url}</p>
          ))}
        </div>
      )}
      <p className="opacity-50">Aucune action nécessaire.</p>
    </div>
  );
}

function OppTip({ row }: { row: SemanticKw }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-semibold">Opportunité de contenu 🎯</p>
      <p className="opacity-75">Aucune page de votre site ne cible ce keyword. C'est une opportunité pour créer du nouveau contenu.</p>
      <div className="mt-0.5 flex flex-col gap-0.5">
        <p className="text-[11px] opacity-60">Volume de recherche : <span className="font-semibold text-white opacity-100">{row.volume.toLocaleString("fr-FR")}/mois</span></p>
      </div>
      <p className="opacity-60">Créez une nouvelle page ciblant ce keyword.</p>
    </div>
  );
}

function SemUrlList({ urls, extra }: { urls: { url: string; pos: number }[]; extra: number }) {
  if (urls.length === 0) return <span className="text-[13px] text-[var(--text-muted)]">—</span>;
  return (
    <div className="flex flex-col gap-1">
      {urls.map((u, i) => (
        <div key={i} className="flex min-w-0 items-center gap-1.5">
          <Tooltip portal rich side="bottom" label={<UrlTip url={u.url} />}>
            <span className="truncate font-mono text-[12px] text-[var(--text-muted)]">{u.url}</span>
          </Tooltip>
          <span className="flex-shrink-0 rounded px-1 py-0.5 text-[10px] font-semibold"
            style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-muted)" }}>#{u.pos}</span>
        </div>
      ))}
      {extra > 0 && <span className="text-[12px] font-medium text-[#3E50F5]">+{extra} autres</span>}
    </div>
  );
}

function SemStatusCell({ row }: { row: SemanticKw }) {
  if (row.status === "cannibalisation") return (
    <Tooltip portal rich side="bottom" label={<CannibalTip row={row} />}>
      <span className="inline-flex w-fit cursor-help items-center whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-semibold"
        style={{ color: "#E11D48", backgroundColor: "rgba(225,29,72,0.08)" }}>
        Cannibalisation ({row.cannibCount})
      </span>
    </Tooltip>
  );
  if (row.status === "couvert") return (
    <Tooltip portal rich side="bottom" label={<CouvertTip row={row} />}>
      <span className="inline-flex w-fit cursor-help items-center rounded-full px-3 py-1.5 text-[12px] font-semibold"
        style={{ color: "#10B981", backgroundColor: "rgba(16,185,129,0.09)" }}>Couvert</span>
    </Tooltip>
  );
  return (
    <Tooltip portal rich side="bottom" label={<OppTip row={row} />}>
      <span className="inline-flex w-fit cursor-help items-center rounded-full px-3 py-1.5 text-[12px] font-semibold"
        style={{ color: "#3E50F5", backgroundColor: "rgba(62,80,245,0.08)" }}>Opportunité</span>
    </Tooltip>
  );
}

function SemScore({ score }: { score: number | null }) {
  if (score === null) return <span className="text-[13px] text-[var(--text-muted)]">—</span>;
  const color = score >= 80 ? "#10B981" : score >= 70 ? "#F59E0B" : "#E11D48";
  return <span className="text-[13px] font-semibold tabular-nums" style={{ color }}>{score}%</span>;
}

/* ── Issue accordion ──────────────────────────────────────────────────── */

function IssueCard({ issue, status, onStatusChange }: {
  issue: Issue; status: Status; onStatusChange: () => void;
}) {
  const [open, setOpen] = useState(false);
  const c = SEVERITY_CONFIG[issue.severity];

  return (
    <div className={`border-b border-[var(--border-subtle)] last:border-0 ${status === "done" ? "opacity-50" : ""}`}
      style={{ borderLeftColor: c.color, borderLeftWidth: 3, borderLeftStyle: "solid" }}>
      <button onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-6 py-4 text-left cursor-pointer">
        <span className="rounded-md px-3 py-1.5 text-[12px] font-semibold flex-shrink-0"
          style={{ color: c.color, backgroundColor: c.bg }}>{c.label}</span>
        <StatusDot status={status} onClick={onStatusChange} />
        <span className={`flex-1 text-[14px] font-medium min-w-0 ${status === "done" ? "line-through text-[var(--text-muted)]" : "text-[var(--text-primary)]"}`}>
          {issue.label}
        </span>
        <div className="flex flex-shrink-0 items-center gap-3">
          <span className="text-[13px] text-[var(--text-muted)]">{issue.pages} pages</span>
          {issue.visits && (
            <span className="text-[13px] font-medium" style={{ color: c.color }}>{issue.visits} visites</span>
          )}
          <StatusPill status={status} />
          <ChevronDownIcon className="h-4 w-4 text-[var(--text-muted)] transition-transform"
            style={{ transform: open ? "rotate(180deg)" : "none" }} />
        </div>
      </button>

      {open && (
        <div className="border-t border-[var(--border-subtle)] px-6 py-5">
          <p className="mb-3 text-[14px] leading-relaxed text-[var(--text-secondary)]">{issue.description}</p>
          <div className="mb-4 rounded-r-xl border-l-2 border-[#3E50F5] bg-[rgba(62,80,245,0.05)] px-4 py-3 text-[14px] leading-snug text-[var(--text-secondary)]">
            <strong className="text-[#3E50F5]">Action :</strong> {issue.fix}
          </div>
          {issue.urls && issue.urls.length > 0 && (
            <>
              <p className="mb-2 text-[12px] font-semibold text-[var(--text-muted)]">URLs les plus impactées</p>
              <div className="grid grid-cols-[1fr_80px_96px] gap-3 border-t border-[var(--border-subtle)] py-2 text-[11px] font-semibold text-[var(--text-muted)]">
                <span>URL</span>
                <span className="text-right">Clics/mois</span>
                <span className="text-right">Impressions</span>
              </div>
              {(issue.urls ?? []).map((u, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_80px_96px] items-center gap-3 border-t border-[var(--border-subtle)] py-2.5 text-[13px]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate font-mono text-[var(--text-muted)]">{u.url}</span>
                    {u.lot && (
                      <span className="flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold"
                        style={{ backgroundColor: "rgba(62,80,245,0.1)", color: "#3E50F5" }}>{u.lot}</span>
                    )}
                  </div>
                  <span className="text-right font-medium text-[var(--text-primary)]">{u.clicks != null ? u.clicks : "—"}</span>
                  <span className="text-right text-[var(--text-muted)]">{u.impr}</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────────────────── */

export function AuditEditorialTab({ domain }: { domain: string }) {
  const [activeLot, setActiveLot]       = useState<string>("all");
  const [activeDim, setActiveDim]       = useState<Dimension | null>(null);
  const [issueStatuses, setIssueStatuses] = useState<Record<string, Status>>({});

  const [semStatus,  setSemStatus]  = useState<"all"|SemStatus>("all");
  const [semSource,  setSemSource]  = useState<"all"|"PAA"|"Related">("all");
  const [semMinVol,  setSemMinVol]  = useState(0);
  const filteredKws = SEMANTIC_KWS.filter((k) =>
    (semStatus === "all" || k.status === semStatus) &&
    (semSource === "all" || k.source === semSource) &&
    k.volume >= semMinVol
  );

  const lot = LOTS[activeLot];

  const visibleIssues = ISSUES.filter((iss) => {
    const inLot = lot.issues.includes(iss.id);
    const inDim = !activeDim || iss.dimension === activeDim;
    return inLot && inDim;
  });

  const countBySeverity = (sev: Severity) => visibleIssues.filter((i) => i.severity === sev).length;
  const getStatus = (id: string): Status => issueStatuses[id] ?? "todo";
  const toggleStatus = (id: string) =>
    setIssueStatuses((prev) => ({ ...prev, [id]: nextStatus(getStatus(id)) }));

  const scoreColor62 = scoreColor(lot.score);

  return (
    <div className="flex flex-col gap-8">

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <div id="edi-synthese" className="overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-8">
        <div className="grid grid-cols-[2fr_1fr] items-center gap-8">
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-[rgba(16,185,129,0.1)] px-3 py-1.5 text-[12px] font-semibold text-[#10B981]">GSC connecté</span>
              <span className="rounded-full bg-[rgba(62,80,245,0.08)] px-3 py-1.5 text-[12px] font-semibold text-[#3E50F5]">
                {lot.count} pages éditoriales · {lot.pct}% du site
              </span>
              <span className="text-[13px] text-[var(--text-muted)]">27 avril 2026</span>
            </div>
            <h1 className="text-[32px] font-semibold leading-tight tracking-tight text-[var(--text-primary)]">
              <span style={{ color: "#E11D48" }}>{lot.headlineEm}</span>
              {" "}{lot.headlineTail.split("\n")[0]}
              <br />{lot.headlineTail.split("\n")[1]}
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--text-secondary)]">{lot.sub}</p>
            <div className="mt-5 flex flex-wrap gap-6 text-[13px] text-[var(--text-muted)]">
              <span><strong className="text-[15px] text-[var(--text-primary)]">{lot.count}</strong> pages analysées / 133 crawlées</span>
              <span><strong className="text-[15px] text-[var(--text-primary)]">{visibleIssues.length}</strong> issues détectées</span>
              <span>Snapshot GSC <strong className="text-[var(--text-primary)]">27/04</strong></span>
            </div>
            <div className="mt-6">
              <Button size="sm" variant="secondary">
                <ArrowPathIcon className="h-4 w-4" />
                Relancer l'audit
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <svg width={160} height={160} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={80} cy={80} r={68} fill="none" stroke="var(--border-subtle)" strokeWidth={7} />
                <circle cx={80} cy={80} r={68} fill="none" stroke={scoreColor62} strokeWidth={7}
                  strokeDasharray={2 * Math.PI * 68}
                  strokeDashoffset={2 * Math.PI * 68 * (1 - lot.score / 100)}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[44px] font-semibold leading-none text-[var(--text-primary)]">{lot.score}</span>
                <span className="text-[14px] text-[var(--text-muted)]">/100</span>
              </div>
            </div>
            <p className="text-[13px] font-medium text-[var(--text-muted)]">Score éditorial</p>
            <p className="text-[12px] text-[var(--text-muted)]">
              Grade <strong style={{ color: scoreColor62 }}>{lot.grade}</strong> · pondéré par trafic
            </p>
          </div>
        </div>
      </div>

      {/* Verdict cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { color: "#E11D48", label: "Bloqueur",    text: lot.verdictBlocker },
          { color: "#3E50F5", label: "Opportunité", text: lot.verdictOpp },
          { color: "#B888FF", label: "Couverture",  text: lot.verdictCov },
        ].map((v) => (
          <div key={v.label} className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]"
            style={{ background: `linear-gradient(to bottom, ${v.color}12 0%, var(--bg-card) 60%)` }}>
            <div className="px-5 pt-5 pb-6">
              <div className="mb-3 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: v.color }} />
                <p className="text-[13px] font-semibold" style={{ color: v.color }}>{v.label}</p>
              </div>
              <p className="text-[14px] leading-snug text-[var(--text-secondary)]">{v.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── FILTRES PAR LOT ─────────────────────────────────────────── */}
      <div id="edi-lots" className="overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[13px] font-semibold text-[var(--text-primary)]">Filtrer par lot</p>
          <p className="text-[12px] text-[var(--text-muted)]">
            Lots définis dans <span className="text-[var(--text-secondary)]">Recommandation de page</span> · synchronisés il y a 2 jours
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {LOT_KEYS.map((key) => {
            const l = LOTS[key];
            const active = activeLot === key;
            return (
              <button key={key} onClick={() => { setActiveLot(key); setActiveDim(null); }}
                className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all"
                style={active
                  ? { backgroundColor: "var(--text-primary)", borderColor: "var(--text-primary)", color: "var(--bg-card)" }
                  : { backgroundColor: "transparent", borderColor: "var(--border-subtle)", color: "var(--text-muted)" }
                }>
                {l.label}
                <span className="rounded-full px-3 py-1.5 text-[12px]"
                  style={{ backgroundColor: active ? "rgba(255,255,255,0.15)" : "var(--bg-secondary)", color: active ? "var(--bg-card)" : "var(--text-muted)" }}>
                  {l.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 01. DIAGNOSTIC PAR IMPACT BUSINESS ─────────────────────── */}
      <div id="edi-diagnostic">
        <SectionHead
          num="01." title="Diagnostic" em="par impact business"
          meta={`${visibleIssues.length} issues · ${countBySeverity("critique")} critiques · ${countBySeverity("important")} importantes · ${countBySeverity("moyen")} moyennes`}
        />

        {/* Callout */}
        <div className="mb-5 flex items-center gap-4 rounded-2xl border border-[rgba(225,29,72,0.25)] bg-[rgba(225,29,72,0.05)] px-6 py-5">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#E11D48] text-[14px] font-bold text-white">!</div>
          <p className="text-[14px] text-[var(--text-secondary)]">
            <strong className="text-[#E11D48]">~{lot.visitsAtRisk} visites/mois à risque</strong>{" "}
            sur le périmètre {lot.label}{activeDim ? ` · filtre dimension actif` : ""}.
            {countBySeverity("critique") > 0 && ` Les ${countBySeverity("critique")} issues critiques concernent les pages les plus stratégiques.`}
          </p>
        </div>

        {/* Active dimension filter banner */}
        {activeDim && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-[rgba(62,80,245,0.3)] bg-[rgba(62,80,245,0.05)] px-5 py-3">
            <p className="text-[14px] text-[var(--text-secondary)]">
              Filtre actif sur la dimension <strong className="text-[#3E50F5]">{DIMENSION_CONFIG.find((d) => d.key === activeDim)?.label}</strong> · {visibleIssues.length} issue(s) affichée(s)
            </p>
            <button onClick={() => setActiveDim(null)}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] cursor-pointer">
              <XMarkIcon className="h-3.5 w-3.5" />
              Effacer
            </button>
          </div>
        )}

        <div className="bg-[var(--bg-card)]">
          {/* Critiques */}
          {countBySeverity("critique") > 0 && (
            <>
              <div className="px-6 py-2.5 text-[11px] font-semibold text-[var(--text-muted)]">
                Impact critique · {countBySeverity("critique")} issue{countBySeverity("critique") > 1 ? "s" : ""}
              </div>
              {visibleIssues.filter((i) => i.severity === "critique").map((iss) => (
                <IssueCard key={iss.id} issue={iss} status={getStatus(iss.id)} onStatusChange={() => toggleStatus(iss.id)} />
              ))}
            </>
          )}

          {/* Importants */}
          {countBySeverity("important") > 0 && (
            <>
              <div className="border-t border-[var(--border-subtle)] px-6 py-2.5 text-[11px] font-semibold text-[var(--text-muted)]">
                Impact important · {countBySeverity("important")} issue{countBySeverity("important") > 1 ? "s" : ""}
              </div>
              {visibleIssues.filter((i) => i.severity === "important").map((iss) => (
                <IssueCard key={iss.id} issue={iss} status={getStatus(iss.id)} onStatusChange={() => toggleStatus(iss.id)} />
              ))}
            </>
          )}

          {/* Moyens */}
          {countBySeverity("moyen") > 0 && (
            <>
              <div className="border-t border-[var(--border-subtle)] px-6 py-2.5 text-[11px] font-semibold text-[var(--text-muted)]">
                Impact moyen · {countBySeverity("moyen")} issue{countBySeverity("moyen") > 1 ? "s" : ""}
              </div>
              {visibleIssues.filter((i) => i.severity === "moyen").map((iss) => (
                <IssueCard key={iss.id} issue={iss} status={getStatus(iss.id)} onStatusChange={() => toggleStatus(iss.id)} />
              ))}
            </>
          )}

          {visibleIssues.length === 0 && (
            <div className="px-7 py-10 text-center text-[14px] text-[var(--text-muted)]">
              Aucune issue pour ce périmètre.
            </div>
          )}
        </div>

        {/* Detector note */}
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-card-hover)] px-5 py-4">
          <span className="text-[#F59E0B] text-[16px]">⚠</span>
          <p className="text-[13px] text-[var(--text-secondary)]">
            <strong className="text-[#F59E0B]">3 détecteurs n'ont pas pu tourner</strong> — certaines données sont manquantes pour{" "}
            <span className="font-mono text-[12px]">detector_freshness</span>,{" "}
            <span className="font-mono text-[12px]">knowledge_graph_match</span> et{" "}
            <span className="font-mono text-[12px]">brand_mentions</span>. Reconnecter les sources pour activer ces analyses.
          </p>
        </div>
      </div>

      {/* ── 02. DIAGNOSTIC PAR DIMENSION ────────────────────────────── */}
      <div id="edi-dimensions">
        <SectionHead num="02." title="Diagnostic" em="par dimension" meta={`Score moyen sur ${lot.count} pages éditoriales`} />

        <div className="grid grid-cols-6 gap-3">
          {DIMENSION_CONFIG.map((dim) => {
            const score = lot.dims[dim.key];
            const color = scoreColor(score);
            const isActive = activeDim === dim.key;
            return (
              <button key={dim.key} onClick={() => setActiveDim(isActive ? null : dim.key)}
                className="relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-200 cursor-pointer"
                style={{
                  borderColor: isActive ? "#3E50F5" : "var(--border-subtle)",
                  background: isActive
                    ? "linear-gradient(to bottom, rgba(62,80,245,0.08) 0%, var(--bg-card) 100%)"
                    : "var(--bg-card)",
                }}>
                <p className="mb-2 text-[11px] font-semibold text-[var(--text-muted)]">{dim.label}</p>
                <p className="text-[26px] font-semibold leading-none tracking-tight text-[var(--text-primary)]">
                  {score}<span className="text-[13px] font-normal text-[var(--text-muted)]">/100</span>
                </p>
                <p className="mt-2 text-[11px] text-[var(--text-muted)]">{dim.meta}</p>
                {/* Bottom bar */}
                <div className="absolute bottom-0 left-0 h-[3px] rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 03. DONNÉES BRUTES ──────────────────────────────────────── */}
      <div id="edi-donnees">
        <SectionHead num="03." title="Données" em="brutes" meta="Pour aller plus loin" />

        <div className="flex flex-col divide-y divide-[var(--border-subtle)]">
          {[
            {
              id: "perimetre", title: "Couverture du périmètre éditorial", sub: `${lot.count} / 133 pages`,
              body: `${lot.count} pages importées dans Recommandation de page sont analysées sur les 133 du site. Les autres pages restent suivies en santé technique mais ne reçoivent pas d'analyse éditoriale (E-E-A-T, SOSEO, intent). Pour étendre le périmètre, importer plus de pages dans Recommandation de page.`,
            },
            {
              id: "detectors", title: "Détecteurs et statut", sub: "11 actifs / 14 disponibles",
              body: "11 détecteurs ont tourné sur ce périmètre. 3 inactifs : detector_freshness (date manquante), knowledge_graph_match (pas de schema Organization), brand_mentions (Ahrefs non connecté).",
            },
            {
              id: "lots-detail", title: "Lots éditoriaux", sub: "5 lots définis",
              body: "Catégorie Jean (3) · Top trafic (5) · YMYL (2) · Formation & services (4) · Case studies (3). Les lots sont définis dans l'onglet Recommandation de page et synchronisés à chaque audit.",
            },
            {
              id: "snapshot", title: "Snapshot GSC", sub: "27 avril 2026",
              body: `Données GSC utilisées pour pondérer les visites à risque : 246 clics/mois, 214.1k impressions sur le périmètre du site complet. Sur les ${lot.count} pages éditoriales analysées : 1 588 clics/mois cumulés, 343k impressions cumulées.`,
            },
          ].map((acc) => (
            <SimpleAccordion key={acc.id} title={acc.title} sub={acc.sub} body={acc.body} />
          ))}
        </div>

        <p className="mt-3 text-[12px] text-[var(--text-muted)]">
          Dernière analyse éditoriale : 27 avril 2026 · prochaine analyse : 30 avril 2026
        </p>
      </div>

      {/* ── 05. CANNIBALISATION ─────────────────────────────────────── */}
      <CannibalSection />

      {/* ── 04. UNIVERS SÉMANTIQUE ──────────────────────────────────── */}
      <div id="edi-univers" className="flex flex-col gap-5">

        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[22px] font-semibold tracking-tight text-[var(--text-primary)]">
              <span className="mr-2 text-[13px] font-medium text-[var(--text-muted)]">06.</span>
              Univers <em className="not-italic">Sémantique</em>
            </h2>
            <p className="mt-1 text-[14px] text-[var(--text-secondary)]">
              Identifiez les opportunités de contenu et résolvez les cannibalisations pour améliorer votre SEO.
            </p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <Button size="sm" variant="secondary">
              <ArrowPathIcon className="h-4 w-4" />
              Rebuild
            </Button>
            <Button size="sm" variant="secondary">Matcher</Button>
          </div>
        </div>

        {/* Stats pills */}
        <div className="flex flex-wrap items-center gap-3">
          {([
            { label: "Total",        value: 303, color: "var(--text-primary)" },
            { label: "Couverts",     value: 65,  color: "#10B981" },
            { label: "Cannibalisés", value: 15,  color: "#E11D48" },
            { label: "Opportunités", value: 223, color: "#3E50F5" },
            { label: "En attente",   value: 0,   color: "var(--text-muted)" },
          ]).map((s) => (
            <div key={s.label}
              className="flex items-baseline gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-2">
              <span className="text-[18px] font-semibold" style={{ color: s.color }}>{s.value}</span>
              <span className="text-[12px] text-[var(--text-muted)]">{s.label}</span>
            </div>
          ))}
          {(semStatus !== "all" || semSource !== "all" || semMinVol > 0) && (
            <button onClick={() => { setSemStatus("all"); setSemSource("all"); setSemMinVol(0); }}
              className="ml-1 flex cursor-pointer items-center gap-1 text-[12px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
              <XMarkIcon className="h-3 w-3" />
              Réinitialiser
            </button>
          )}
          <span className="ml-auto text-[12px] text-[var(--text-muted)]">{filteredKws.length} / 303</span>
        </div>

        {/* Table */}
        <div className="bg-[var(--bg-card)]">
          {filteredKws.length === 0 ? (
            <div className="px-7 py-10 text-center text-[14px] text-[var(--text-muted)]">
              Aucun mot-clé pour ces filtres.
            </div>
          ) : (
            <table className="w-full table-fixed border-collapse">
              <colgroup>
                <col style={{ width: "21%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "22%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "10%" }} />
              </colgroup>
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[11px] font-semibold text-[var(--text-muted)]">
                  <th className="px-6 py-3 text-left font-semibold">Keyword</th>
                  <th className="px-4 py-3 text-left font-semibold">URL(s) matchée(s)</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    <ColDropdown label={semSource === "all" ? "Source" : semSource} active={semSource !== "all"}>
                      {(close) => <>
                        <OptBtn active={semSource === "all"}     onClick={() => { setSemSource("all");     close(); }}>Toutes</OptBtn>
                        <OptBtn active={semSource === "PAA"}     onClick={() => { setSemSource("PAA");     close(); }}>PAA</OptBtn>
                        <OptBtn active={semSource === "Related"} onClick={() => { setSemSource("Related"); close(); }}>Related</OptBtn>
                      </>}
                    </ColDropdown>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    <ColDropdown
                      label={semStatus === "all" ? "Statut" : ({ cannibalisation: "Cannibalisation", opportunite: "Opportunité", couvert: "Couvert" } as const)[semStatus]}
                      active={semStatus !== "all"}>
                      {(close) => <>
                        <OptBtn active={semStatus === "all"}             onClick={() => { setSemStatus("all");             close(); }}>Tous</OptBtn>
                        <OptBtn active={semStatus === "couvert"}         onClick={() => { setSemStatus("couvert");         close(); }}>Couvert</OptBtn>
                        <OptBtn active={semStatus === "cannibalisation"} onClick={() => { setSemStatus("cannibalisation"); close(); }}>Cannibalisation</OptBtn>
                        <OptBtn active={semStatus === "opportunite"}     onClick={() => { setSemStatus("opportunite");     close(); }}>Opportunité</OptBtn>
                      </>}
                    </ColDropdown>
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    <div className="flex justify-end">
                      <ColDropdown label={semMinVol > 0 ? `≥ ${semMinVol.toLocaleString("fr-FR")}` : "Volume"} active={semMinVol > 0}>
                        {(close) => (
                          <div className="flex flex-col gap-4 p-3" style={{ width: 220 }}>
                            {/* Value display */}
                            <div className="flex items-baseline justify-between">
                              <span className="text-[12px] font-medium text-[var(--text-muted)]">Volume min</span>
                              <span className="text-[20px] font-semibold tabular-nums text-[var(--text-primary)]">
                                {semMinVol === 0 ? "Tous" : semMinVol.toLocaleString("fr-FR")}
                              </span>
                            </div>
                            {/* Track + thumb */}
                            <div className="relative h-6 flex items-center">
                              <div className="absolute inset-x-0 h-1.5 rounded-full bg-[var(--bg-card-hover)]">
                                <div className="h-full rounded-full bg-[#3E50F5]"
                                  style={{ width: `${(semMinVol / 2000) * 100}%` }} />
                              </div>
                              <input type="range" min={0} max={2000} step={50} value={semMinVol}
                                onChange={(e) => setSemMinVol(Number(e.target.value))}
                                className="relative w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#3E50F5] [&::-webkit-slider-thumb]:shadow-[0_0_0_3px_rgba(62,80,245,0.2)] [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#3E50F5]" />
                            </div>
                            {/* Presets */}
                            <div className="flex gap-1.5">
                              {[0, 100, 500, 1000, 2000].map((v) => (
                                <button key={v} onClick={() => { setSemMinVol(v); if (v > 0) close(); }}
                                  className={`flex-1 rounded-lg py-1.5 text-[11px] font-semibold transition-colors ${semMinVol === v ? "bg-[#3E50F5] text-white" : "bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}>
                                  {v === 0 ? "Tous" : v >= 1000 ? `${v / 1000}k` : v}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </ColDropdown>
                    </div>
                  </th>
                  <th className="pl-4 pr-6 py-3 text-right font-semibold">Score</th>
                </tr>
              </thead>
              <tbody>
                {filteredKws.map((kw, idx) => (
                  <tr key={idx} className="border-b border-[var(--border-subtle)] last:border-0 transition-colors hover:bg-[var(--bg-card-hover)]">
                    <td className="overflow-hidden px-6 py-4 align-top">
                      <span className="block truncate text-[13px] font-medium text-[var(--text-primary)]" title={kw.keyword}>
                        {kw.keyword}
                      </span>
                    </td>
                    <td className="overflow-hidden px-4 py-4 align-top">
                      <SemUrlList urls={kw.urls} extra={kw.extraUrls} />
                    </td>
                    <td className="px-4 py-4 align-top">
                      <Tooltip portal rich side="bottom" label={<SourceTip source={kw.source} />}>
                        <span className="inline-flex w-fit cursor-help rounded-full bg-[var(--bg-secondary)] px-3 py-1.5 text-[12px] font-semibold text-[var(--text-muted)]">
                          {kw.source}
                        </span>
                      </Tooltip>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <SemStatusCell row={kw} />
                    </td>
                    <td className="px-4 py-4 text-right align-top">
                      <span className="text-[13px] tabular-nums text-[var(--text-secondary)]">
                        {kw.volume.toLocaleString("fr-FR")}
                      </span>
                    </td>
                    <td className="pl-4 pr-6 py-4 text-right align-top">
                      <SemScore score={kw.score} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}

/* ── Cannibalisation section ──────────────────────────────────────────── */

function CannibalSevBadge({ sev }: { sev: CannibalSev }) {
  const c = CANNIBAL_SEV_CONFIG[sev];
  return (
    <span className="inline-flex rounded-full px-3 py-1.5 text-[12px] font-semibold"
      style={{ color: c.color, backgroundColor: c.bg }}>{c.label}</span>
  );
}

function CannibalActionSelect({ value }: { value: string }) {
  const opts = ["Garder", "Rediriger", "Fusionner", "Ignorer"];
  return (
    <div className="relative inline-flex">
      <select
        defaultValue={value}
        onClick={(e) => e.stopPropagation()}
        className="cursor-pointer appearance-none rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] py-1 pl-2.5 pr-6 text-[12px] font-medium text-[var(--text-secondary)] focus:outline-none"
      >
        {opts.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[var(--text-muted)]" />
    </div>
  );
}

function CannibalKwRow({ kw }: { kw: CannibalKw }) {
  const [open, setOpen] = useState(false);
  const totalClicks = kw.urls.reduce((s, u) => s + u.clicks, 0);

  return (
    <>
      <tr
        onClick={() => setOpen(v => !v)}
        className={`cursor-pointer border-b border-[var(--border-subtle)] last:border-0 transition-colors hover:bg-[var(--bg-card-hover)] ${open ? "bg-[var(--bg-card-hover)]" : ""}`}
      >
        <td className="px-6 py-3.5 align-middle">
          <div className="flex items-center gap-2">
            <ChevronDownIcon className={`h-3.5 w-3.5 flex-shrink-0 text-[var(--text-muted)] transition-transform ${open ? "rotate-180" : ""}`} />
            <span className="text-[13px] font-medium text-[var(--text-primary)]">{kw.keyword}</span>
          </div>
        </td>
        <td className="px-4 py-3.5 align-middle"><CannibalSevBadge sev={kw.severity} /></td>
        <td className="px-4 py-3.5 text-center align-middle">
          <span className="text-[13px] tabular-nums text-[var(--text-secondary)]">{kw.urls.length}</span>
        </td>
        <td className="px-4 py-3.5 text-right align-middle">
          <span className="text-[13px] tabular-nums font-medium text-[var(--text-primary)]">{totalClicks}</span>
        </td>
        <td className="px-4 py-3.5 text-right align-middle">
          <span className="text-[13px] tabular-nums text-[#E11D48]">
            {kw.lostClicks !== null ? kw.lostClicks : "—"}
          </span>
        </td>
        <td className="px-4 py-3.5 text-right align-middle">
          <span className="text-[13px] tabular-nums text-[var(--text-muted)]">
            {kw.volume !== null ? kw.volume.toLocaleString("fr-FR") : "—"}
          </span>
        </td>
        <td className="px-4 py-3.5 align-middle" onClick={e => e.stopPropagation()}>
          <CannibalActionSelect value={kw.action} />
        </td>
        <td className="pr-6 py-3.5 align-middle">
          <span className={`inline-flex rounded-full px-3 py-1.5 text-[12px] font-semibold ${
            kw.status === "resolved" ? "bg-[rgba(16,185,129,0.1)] text-[#10B981]" :
            kw.status === "ignored"  ? "bg-[var(--bg-secondary)] text-[var(--text-muted)]" :
            "bg-[rgba(245,158,11,0.1)] text-[#F59E0B]"}`}>
            {kw.status === "resolved" ? "Résolu" : kw.status === "ignored" ? "Ignoré" : "Ouvert"}
          </span>
        </td>
      </tr>

      {open && (
        <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          <td colSpan={8} className="px-6 py-3">
            <p className="mb-2 text-[11px] font-semibold text-[var(--text-muted)]">
              URLs en conflit · Positions = moyenne GSC 28j
            </p>
            <table className="w-full border-collapse">
              <colgroup>
                <col style={{ width: "30%" }} />
                <col style={{ width: "24%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "15%" }} />
              </colgroup>
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[10px] font-semibold text-[var(--text-muted)]">
                  <th className="pb-2 text-left font-semibold">URL</th>
                  <th className="px-3 pb-2 text-left font-semibold">Click share</th>
                  <th className="px-3 pb-2 text-right font-semibold">Pos. moy.</th>
                  <th className="px-3 pb-2 text-right font-semibold">CTR</th>
                  <th className="px-3 pb-2 text-right font-semibold">Clics</th>
                  <th className="pb-2 text-right font-semibold">Impressions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {kw.urls.map((u, i) => (
                  <tr key={i}>
                    <td className="py-2.5 pr-3">
                      <span className="block truncate font-mono text-[11px] text-[var(--text-secondary)]">{u.url}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-[var(--bg-card-hover)]">
                          <div className="h-full rounded-full bg-[#3E50F5]" style={{ width: `${u.clickShare}%` }} />
                        </div>
                        <span className="w-8 shrink-0 text-right text-[12px] font-semibold tabular-nums text-[var(--text-primary)]">{u.clickShare}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-[12px] tabular-nums text-[var(--text-secondary)]">~{u.avgPos.toFixed(1)}</span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-[12px] tabular-nums text-[var(--text-secondary)]">{u.ctr}</span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-[12px] tabular-nums text-[var(--text-secondary)]">{u.clicks.toLocaleString("fr-FR")}</span>
                    </td>
                    <td className="py-2.5 text-right">
                      <span className="text-[12px] tabular-nums text-[var(--text-muted)]">{u.impressions.toLocaleString("fr-FR")}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </>
  );
}

function CannibalSection() {
  const [view, setView] = useState<"keywords" | "pages">("keywords");
  const [hoveredSeg, setHoveredSeg] = useState<{ label: string; count: number; color: string; x: number; y: number } | null>(null);
  const svgDonutRef = useRef<SVGSVGElement>(null);

  const medium = CANNIBAL_KWS.filter(k => k.severity === "MEDIUM").length;
  const low    = CANNIBAL_KWS.filter(k => k.severity === "LOW").length;
  const total  = CANNIBAL_KWS.length;

  /* donut — arc-path avec gaps (même pattern que ProfileDonutChart) */
  const DR = 44, DSW = 9, DCX = 56, DCY = 56, gapDeg = 8;
  const toRad = (deg: number) => (deg - 90) * Math.PI / 180;
  const dpt   = (deg: number) => ({ x: DCX + DR * Math.cos(toRad(deg)), y: DCY + DR * Math.sin(toRad(deg)) });

  const donutSegs = [
    { label: "Medium", count: medium, color: "#F59E0B" },
    { label: "Low",    count: low,    color: "#10B981" },
  ].filter(s => s.count > 0);

  let dAngle = 0;
  const donutArcs = donutSegs.map(s => {
    const span   = (s.count / total) * 360;
    const midDeg = dAngle + span / 2;
    const start  = dpt(dAngle + gapDeg / 2);
    const end    = dpt(dAngle + span - gapDeg / 2);
    const large  = span - gapDeg > 180 ? 1 : 0;
    const path   = `M ${start.x} ${start.y} A ${DR} ${DR} 0 ${large} 1 ${end.x} ${end.y}`;
    dAngle += span;
    return { ...s, path, midDeg };
  });

  function handleSegEnter(e: React.MouseEvent<SVGPathElement>, d: typeof donutArcs[0]) {
    const svgEl = svgDonutRef.current;
    if (!svgEl) return;
    const rect  = svgEl.getBoundingClientRect();
    const mid   = dpt(d.midDeg);
    const sx    = rect.width  / 112;
    const sy    = rect.height / 112;
    setHoveredSeg({ label: d.label, count: d.count, color: d.color, x: mid.x * sx, y: mid.y * sy - DSW * sy });
  }

  /* evolution mini chart */
  const W = 400, H = 60;
  const maxV = Math.max(...CANNIBAL_HISTORY.map(d => d.value));
  const minV = Math.min(...CANNIBAL_HISTORY.map(d => d.value)) - 1;
  const evPx = (i: number) => (i / (CANNIBAL_HISTORY.length - 1)) * W;
  const evPy = (v: number) => H - ((v - minV) / (maxV - minV)) * H;
  const evLine = CANNIBAL_HISTORY.map((d, i) => `${evPx(i)},${evPy(d.value)}`).join(" ");
  const evArea = `0,${H} ` + CANNIBAL_HISTORY.map((d, i) => `${evPx(i)},${evPy(d.value)}`).join(" ") + ` ${W},${H}`;

  return (
    <div id="edi-cannibalisation" className="flex flex-col gap-5">

      {/* Header */}
      <div>
        <h2 className="text-[22px] font-semibold tracking-tight text-[var(--text-primary)]">
          <span className="mr-2 text-[13px] font-medium text-[var(--text-muted)]">05.</span>
          Cannibalisation <em className="not-italic text-[var(--text-primary)]">SEO</em>
        </h2>
        <p className="mt-1 text-[14px] text-[var(--text-secondary)]">
          Pages en conflit de positionnement — dilution du trafic et des signaux de pertinence.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Keywords cannibalisés", value: `${total}`,  sub: "/ 53 suivis",  color: "#E11D48" },
          { label: "Pages impactées",       value: `${CANNIBAL_PAGES.length}`, sub: "URLs en conflit", color: "#F59E0B" },
          { label: "Trafic à risque",       value: "295",       sub: "clics / mois", color: "#F59E0B" },
          { label: "% cannibalisation",     value: "7.5%",      sub: "du trafic SEO", color: "var(--text-primary)" },
        ].map(m => (
          <div key={m.label} className="flex flex-col gap-1.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-5 py-4">
            <span className="text-[12px] font-medium text-[var(--text-muted)]">{m.label}</span>
            <span className="text-[28px] font-semibold leading-none tracking-tight" style={{ color: m.color }}>{m.value}</span>
            <span className="text-[11px] text-[var(--text-muted)]">{m.sub}</span>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4">

        {/* Donut — répartition sévérité */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
          <p className="mb-4 text-[13px] font-semibold text-[var(--text-secondary)]">Répartition par sévérité</p>
          <div className="flex items-center gap-8">
            <div className="relative flex-shrink-0">
              <svg ref={svgDonutRef} width={112} height={112} viewBox="0 0 112 112" onMouseLeave={() => setHoveredSeg(null)}>
                {donutArcs.map((d, i) => (
                  <path
                    key={i} d={d.path} fill="none" stroke={d.color} strokeWidth={DSW} strokeLinecap="round"
                    opacity={hoveredSeg && hoveredSeg.label !== d.label ? 0.35 : 1}
                    style={{ cursor: "pointer", transition: "opacity 0.15s" }}
                    onMouseEnter={(e) => handleSegEnter(e, d)}
                  />
                ))}
              </svg>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[22px] font-semibold leading-none text-[var(--text-primary)]">{total}</span>
                <span className="mt-0.5 text-[10px] text-[var(--text-muted)]">KW</span>
              </div>
              {hoveredSeg && (
                <ChartTooltip x={hoveredSeg.x} y={hoveredSeg.y}>
                  <p className="text-[12px] font-semibold text-white">{hoveredSeg.label}</p>
                  <p className="text-[11px] text-white/60">
                    <span className="font-semibold text-white">{hoveredSeg.count}</span> kw — {Math.round(hoveredSeg.count / total * 100)}%
                  </p>
                </ChartTooltip>
              )}
            </div>
            <div className="flex flex-col gap-2.5">
              {donutSegs.map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-[13px] text-[var(--text-secondary)]">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Evolution chart */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
          <div className="mb-3 flex items-start justify-between">
            <p className="text-[13px] font-semibold text-[var(--text-secondary)]">Évolution des cannibalisations</p>
            <span className="text-[12px] text-[var(--text-muted)]">6 mois</span>
          </div>
          <div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 64 }}>
              <defs>
                <linearGradient id="cannibal-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E11D48" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#E11D48" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon points={evArea} fill="url(#cannibal-grad)" />
              <polyline points={evLine} fill="none" stroke="#E11D48" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />
              {CANNIBAL_HISTORY.map((d, i) => (
                <circle key={i} cx={evPx(i)} cy={evPy(d.value)} r="3" fill="#E11D48" />
              ))}
            </svg>
            <div className="mt-1 flex justify-between">
              {CANNIBAL_HISTORY.map((d, i) => (
                <span key={i} className="text-[10px] text-[var(--text-muted)]">{d.label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table — Keywords / Pages switch */}
      <div>
        {/* Switch */}
        <div className="mb-4 flex items-center justify-between">
          <FilterTabs
            tabs={[
              { key: "keywords", label: "Mots-clés", count: CANNIBAL_KWS.length },
              { key: "pages",    label: "Pages",      count: CANNIBAL_PAGES.length },
            ]}
            value={view}
            onChange={setView}
          />
        </div>

        {/* Keywords table */}
        {view === "keywords" && (
          <div className="bg-[var(--bg-card)]">
            <table className="w-full table-fixed border-collapse">
              <colgroup>
                <col style={{ width: "22%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
              </colgroup>
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[11px] font-semibold text-[var(--text-muted)]">
                  <th className="px-6 py-3 text-left font-semibold">Mot-clé</th>
                  <th className="px-4 py-3 text-left font-semibold">Sévérité</th>
                  <th className="px-4 py-3 text-center font-semibold">URLs</th>
                  <th className="px-4 py-3 text-right font-semibold">Clics</th>
                  <th className="px-4 py-3 text-right font-semibold">Perte est.</th>
                  <th className="px-4 py-3 text-right font-semibold">Volume</th>
                  <th className="px-4 py-3 text-left font-semibold">Action</th>
                  <th className="pr-6 py-3 text-left font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody>
                {CANNIBAL_KWS.map((kw, i) => <CannibalKwRow key={i} kw={kw} />)}
              </tbody>
            </table>
          </div>
        )}

        {/* Pages table */}
        {view === "pages" && (
          <div className="bg-[var(--bg-card)]">
            <table className="w-full table-fixed border-collapse">
              <colgroup>
                <col style={{ width: "46%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "18%" }} />
              </colgroup>
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[11px] font-semibold text-[var(--text-muted)]">
                  <th className="px-6 py-3 text-left font-semibold">Page URL</th>
                  <th className="px-4 py-3 text-center font-semibold"># KW en conflit</th>
                  <th className="px-4 py-3 text-right font-semibold">Clics à risque</th>
                  <th className="pr-6 py-3 text-left font-semibold">Sévérité max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {CANNIBAL_PAGES.map((p, i) => (
                  <tr key={i} className="transition-colors hover:bg-[var(--bg-card-hover)]">
                    <td className="overflow-hidden px-6 py-3.5 align-middle">
                      <span className="block truncate font-mono text-[12px] text-[var(--text-secondary)]">{p.url}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center align-middle">
                      <span className="text-[13px] font-semibold text-[var(--text-primary)]">{p.kwConflicts}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right align-middle">
                      <span className="text-[13px] tabular-nums text-[#E11D48] font-medium">{p.clicksAtRisk}</span>
                    </td>
                    <td className="pr-6 py-3.5 align-middle">
                      <CannibalSevBadge sev={p.maxSeverity} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SimpleAccordion({ title, sub, body }: { title: string; sub: string; body: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-4 text-left cursor-pointer">
        <div>
          <p className="text-[15px] font-semibold text-[var(--text-primary)]">{title}</p>
          <p className="mt-0.5 text-[13px] text-[var(--text-muted)]">{sub}</p>
        </div>
        <ChevronDownIcon className="h-4 w-4 flex-shrink-0 text-[var(--text-muted)] transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      {open && (
        <div className="pb-4 text-[14px] leading-relaxed text-[var(--text-secondary)]">
          {body}
        </div>
      )}
    </div>
  );
}
