/**
 * Audit Visibilité IA (GEO) — contrat de type + mock.
 *
 * Sorti de `src/components/AuditVisibiliteIATab.tsx` pour le handoff back (voir HANDOFF.md).
 * Vraie requête → `src/db/queries/audit-geo.ts` (fallback mock).
 * NB : `DIAGNOSTIC[].icon` est un choix UI — côté back, exposer plutôt une clé.
 */

import type { ElementType } from "react";
import {
  MagnifyingGlassIcon, ChatBubbleLeftRightIcon, CpuChipIcon,
  FaceSmileIcon, LinkIcon, ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export type EngineStatus = "cited" | "mentioned" | "absent";
export type Engine = { name: string; domain: string; status: EngineStatus; citations: number; sov: number; trend: number };

export const ENGINES: Engine[] = [
  { name: "ChatGPT",             domain: "openai.com",         status: "cited",     citations: 58, sov: 16, trend: 6  },
  { name: "Perplexity",          domain: "perplexity.ai",      status: "cited",     citations: 41, sov: 14, trend: 4  },
  { name: "Google AI Overviews", domain: "google.com",         status: "mentioned", citations: 18, sov: 8,  trend: -2 },
  { name: "Gemini",              domain: "gemini.google.com",  status: "mentioned", citations: 11, sov: 6,  trend: 1  },
  { name: "Claude",              domain: "anthropic.com",      status: "absent",    citations: 0,  sov: 0,  trend: 0  },
];

export type SovRow = { domain: string; sov: number; citations: number; mentions: number; trend: number; isYou?: boolean };

export const SOV: SovRow[] = [
  { domain: "semji.com",                  sov: 24, citations: 210, mentions: 340, trend: 8  },
  { domain: "eskimoz.fr",                 sov: 19, citations: 168, mentions: 279, trend: 5  },
  { domain: "abondance.com",              sov: 16, citations: 141, mentions: 231, trend: -1 },
  { domain: "leptidigital.fr",            sov: 14, citations: 122, mentions: 204, trend: 3  },
  { domain: "marketingdigital-france.fr", sov: 12, citations: 128, mentions: 196, trend: 3, isYou: true },
  { domain: "digimood.com",               sov: 9,  citations: 84,  mentions: 141, trend: 0  },
  { domain: "youlovewords.com",           sov: 6,  citations: 52,  mentions: 96,  trend: 2  },
];

export type PromptStatus = "appears" | "absent";
export type Sentiment = "positif" | "neutre" | "négatif" | "—";
export type PromptRow = { prompt: string; theme: string; engine: string; status: PromptStatus; sentiment: Sentiment; position: string };

export const PROMPTS: PromptRow[] = [
  { prompt: "meilleure agence SEO en France",                     theme: "Comparatif",     engine: "ChatGPT",      status: "appears", sentiment: "positif", position: "2 / 8"  },
  { prompt: "qu'est-ce que le GEO (Generative Engine Optimization)", theme: "Informationnel", engine: "AI Overviews", status: "appears", sentiment: "positif", position: "1 / 6"  },
  { prompt: "agence marketing digital B2B",                       theme: "Comparatif",     engine: "Perplexity",   status: "appears", sentiment: "neutre",  position: "5 / 10" },
  { prompt: "formation SEO en ligne certifiante",                 theme: "Transactionnel", engine: "Perplexity",   status: "appears", sentiment: "neutre",  position: "4 / 9"  },
  { prompt: "audit SEO gratuit outil en ligne",                   theme: "Transactionnel", engine: "Gemini",       status: "appears", sentiment: "négatif", position: "7 / 10" },
  { prompt: "comment améliorer son référencement naturel",        theme: "Informationnel", engine: "ChatGPT",      status: "absent",  sentiment: "—",       position: "—"      },
  { prompt: "agence SEO e-commerce",                              theme: "Comparatif",     engine: "ChatGPT",      status: "absent",  sentiment: "—",       position: "—"      },
  { prompt: "consultant SEO freelance vs agence",                 theme: "Comparatif",     engine: "Perplexity",   status: "absent",  sentiment: "—",       position: "—"      },
];

export type CitedPage = { url: string; citations: number; engines: string; topic: string };

export const CITED_PAGES: CitedPage[] = [
  { url: "/agence-seo/",                    citations: 34, engines: "ChatGPT · Perplexity",     topic: "Agence SEO" },
  { url: "/formation/formation-seo/",       citations: 28, engines: "Perplexity",               topic: "Formation" },
  { url: "/blog/qu-est-ce-que-le-geo/",     citations: 21, engines: "ChatGPT · AI Overviews",   topic: "GEO" },
  { url: "/agence-marketing-digital-b2b/",  citations: 14, engines: "ChatGPT",                  topic: "B2B" },
  { url: "/",                               citations: 9,  engines: "Gemini",                    topic: "Marque" },
];

export const GAPS = [
  { prompt: "agence SEO e-commerce",                cité: "semji.com" },
  { prompt: "consultant SEO freelance vs agence",   cité: "eskimoz.fr" },
  { prompt: "comment améliorer son référencement",  cité: "abondance.com" },
];

export type ReadyStatus = "ok" | "partial" | "missing";
export type ReadyItem = { item: string; status: ReadyStatus; detail: string };

export const READINESS: ReadyItem[] = [
  { item: "Fichier /llms.txt",                     status: "missing", detail: "Aucun fichier /llms.txt détecté — les LLM manquent de contexte sur la marque." },
  { item: "Schema Organization",                   status: "missing", detail: "Non détecté site-wide — entité de marque non déclarée." },
  { item: "Schema FAQ / QAPage",                   status: "partial", detail: "3 pages sur 40 balisées — éligibilité limitée aux réponses structurées." },
  { item: "Réponses answer-first",                 status: "partial", detail: "Structure question → réponse synthétique présente sur 12 pages." },
  { item: "Couverture d'entité (Knowledge Graph)", status: "missing", detail: "Entité marque non consolidée (sameAs, Wikidata absents)." },
  { item: "Crawlers IA autorisés",                 status: "ok",      detail: "GPTBot, ClaudeBot et PerplexityBot autorisés dans robots.txt." },
  { item: "Fraîcheur & dates visibles",            status: "ok",      detail: "Dates de publication et de mise à jour présentes sur les contenus." },
  { item: "Signaux auteur / E-E-A-T",              status: "partial", detail: "Byline auteur présente sur 60% des contenus éditoriaux." },
];

export type ActionRow = { id: number; title: string; sub: string; priority: "high" | "medium" | "low"; category: string; effort: string };

export const PRIORITY_ACTIONS: ActionRow[] = [
  { id: 1, title: "Créer un fichier /llms.txt",                        sub: "Contexte marque + pages clés pour les LLM",     priority: "high",   category: "GEO Readiness",   effort: "30 min" },
  { id: 2, title: "Baliser 40 pages en Schema FAQ / QAPage",           sub: "Éligibilité aux réponses IA structurées",       priority: "high",   category: "Structured Data", effort: "3-4h"   },
  { id: 3, title: "Publier une page comparatif answer-first",          sub: "Cible « meilleure agence SEO »",                priority: "high",   category: "Contenu",         effort: "1 j"    },
  { id: 4, title: "Consolider l'entité de marque (Knowledge Graph)",   sub: "Schema Organization + sameAs + Wikidata",       priority: "medium", category: "Entité",          effort: "2-3h"   },
  { id: 5, title: "Restructurer 12 pages en answer-first",             sub: "Réponse synthétique en tête de page",           priority: "medium", category: "Contenu",         effort: "4h"     },
  { id: 6, title: "Couvrir 6 prompts absents à fort volume",           sub: "e-commerce, freelance vs agence, référencement", priority: "medium", category: "Contenu",         effort: "2 j"    },
  { id: 7, title: "Ajouter les bylines auteur manquantes",             sub: "40% des contenus sans auteur visible",          priority: "low",    category: "E-E-A-T",         effort: "2h"     },
];

export const DIAGNOSTIC: { label: string; score: number; icon: ElementType; headline: string; detail: string }[] = [
  { label: "Citations",           score: 45, icon: LinkIcon,
    headline: "128 citations sur 30 jours, mais 2× moins que la médiane du panel — visibilité source émergente",
    detail: "Votre domaine est cité 128 fois sur 30 jours, principalement par ChatGPT (58) et Perplexity (41). La médiane du panel de 8 concurrents est à 260 citations. Claude ne vous cite jamais et AI Overviews très peu. Le volume de citations est directement corrélé au maillage d'entité et à la structure answer-first." },
  { label: "Mentions",            score: 52, icon: ChatBubbleLeftRightIcon,
    headline: "196 mentions de marque, dont 65% sans lien source — notoriété présente mais peu capitalisée",
    detail: "La marque est mentionnée 196 fois, mais 65% des mentions n'incluent pas de citation source cliquable. C'est un signal de notoriété correct, mais qui ne génère pas de trafic ni d'autorité mesurable. Renforcer le Schema Organization et les pages d'autorité convertit ces mentions en citations." },
  { label: "Sentiment",           score: 68, icon: FaceSmileIcon,
    headline: "Sentiment majoritairement positif ou neutre — 1 seule requête à tonalité négative détectée",
    detail: "Sur les prompts où la marque apparaît, le sentiment est positif (2), neutre (2) et négatif (1). La requête « audit SEO gratuit » renvoie une tonalité négative liée à une confusion outil payant / gratuit. C'est le meilleur sous-score de l'axe : la perception n'est pas un frein, la visibilité l'est." },
  { label: "Couverture prompts",  score: 35, icon: MagnifyingGlassIcon,
    headline: "Absent de 65% des prompts stratégiques suivis — le plus gros levier de progression",
    detail: "Vous apparaissez sur 14 des 40 prompts suivis (35%). Les absences concernent des requêtes commerciales à fort potentiel : « agence SEO e-commerce », « consultant vs agence », « comment améliorer son référencement ». Sur ces prompts, ce sont semji.com, eskimoz.fr et abondance.com qui captent les citations." },
  { label: "Readiness technique", score: 60, icon: CpuChipIcon,
    headline: "Crawlers IA autorisés et contenus datés, mais llms.txt et Schema Organization manquants",
    detail: "Les fondations sont là (crawlers IA autorisés, dates visibles), mais les signaux qui déclenchent les citations manquent : pas de /llms.txt, pas de Schema Organization, peu de balisage FAQ/QAPage. Ce sont des correctifs rapides à fort impact sur l'éligibilité aux réponses génératives." },
  { label: "Entité / E-E-A-T",    score: 48, icon: ShieldCheckIcon,
    headline: "Entité de marque non consolidée — pas de sameAs ni de présence Knowledge Graph structurée",
    detail: "Les moteurs IA privilégient les entités clairement identifiées. Votre marque n'a pas de Schema Organization avec sameAs (LinkedIn, Wikidata, réseaux), et l'auteur n'est visible que sur 60% des contenus. Consolider l'entité renforce la confiance des modèles et la fréquence de citation." },
];
