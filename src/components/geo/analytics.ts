/**
 * Analytics mock du module Visibilité IA.
 *
 * Tout est dérivé déterministiquement d'un `GeoSetup` (seed = index), pour
 * éviter Math.random au render (mismatch d'hydratation) et rester cohérent
 * d'un rendu à l'autre.
 */

import type { GeoSetup, Prompt, LlmPlatform, PromptSentiment } from "@/components/geo/types";
import { LLM_PLATFORMS } from "@/components/geo/types";

/* ── Seed déterministe ────────────────────────────────────────────────── */

function seeded(n: number): number {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x); // [0,1)
}
const pick = <T,>(arr: T[], n: number): T => arr[Math.floor(seeded(n) * arr.length)];

/** Marque « vous » déduite du domaine (sans TLD). */
export function brandFromDomain(domain: string): string {
  const head = domain.replace(/^https?:\/\//, "").replace(/^www\./, "").split(".")[0];
  return head.charAt(0).toUpperCase() + head.slice(1);
}

/** Décalage de seed déterministe à partir d'un id de lot/sujet — permet de scoper
 *  les analytics (leaderboard, séries, SoV) à un lot précis avec des valeurs stables
 *  mais distinctes d'un lot à l'autre. 0 = global (non scopé). */
export function lotSeed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (h % 9973) * 0.000777 + 0.41; // ~[0.41, 8.16)
}

/* ── Couleurs de séries ───────────────────────────────────────────────── */

export const SERIES_COLORS = [
  "var(--accent-primary)",
  "var(--color-success)",
  "var(--color-warning)",
  "color-mix(in oklab, var(--accent-primary) 55%, white)",
  "var(--color-danger)",
  "var(--text-muted)",
];

/* ── Prompts enrichis ─────────────────────────────────────────────────── */

export type EnrichedPrompt = Prompt & {
  listId: string;
  listName: string;
  visibility: number;       // %
  position: number | null;  // rang moyen
  sentiment: PromptSentiment;
  mentions: number;
  platform: LlmPlatform;    // plateforme dominante de la mention
};

const SENTIMENTS: PromptSentiment[] = ["positive", "neutral", "positive", "neutral", "negative"];

export function enrichPrompts(setup: GeoSetup): EnrichedPrompt[] {
  const out: EnrichedPrompt[] = [];
  let i = 1;
  for (const list of setup.lists) {
    for (const p of list.prompts) {
      const s = seeded(i * 3.1);
      const visible = s > 0.28; // ~72% des prompts te mentionnent
      out.push({
        ...p,
        listId: list.id,
        listName: list.name,
        visibility: visible ? Math.round(20 + seeded(i * 5.7) * 70) : 0,
        position: visible ? Math.round(1 + seeded(i * 7.3) * 5) : null,
        sentiment: visible ? pick(SENTIMENTS, i * 2.2) : "neutral",
        mentions: visible ? Math.round(1 + seeded(i * 9.1) * 8) : 0,
        platform: setup.platforms[Math.floor(seeded(i * 4.4) * setup.platforms.length)] ?? "chatgpt",
      });
      i++;
    }
  }
  return out;
}

/* ── Classement concurrents (toi + concurrents) ───────────────────────── */

export type LeaderRow = {
  name: string;
  domain: string;
  isYou: boolean;
  visibility: number;
  sentiment: number;   // 0-100
  position: number;
};

export function leaderboard(setup: GeoSetup, domain: string, seedOffset = 0): LeaderRow[] {
  const you: LeaderRow = seedOffset === 0
    ? { name: brandFromDomain(domain), domain, isYou: true, visibility: 41, sentiment: 68, position: 2.4 }
    : {
        name: brandFromDomain(domain), domain, isYou: true,
        visibility: Math.max(4, Math.min(92, Math.round(41 + (seeded(seedOffset * 1.7) - 0.5) * 62))),
        sentiment: Math.round(52 + seeded(seedOffset * 2.3) * 34),
        position: Math.round((1 + seeded(seedOffset * 3.1) * 6) * 10) / 10,
      };
  const comps = setup.competitors.map((c, idx) => ({
    name: c.name, domain: c.domain, isYou: false,
    visibility: Math.round(15 + seeded((idx + 1) * 6.6 + seedOffset) * 55),
    sentiment: Math.round(55 + seeded((idx + 1) * 8.8 + seedOffset) * 25),
    position: Math.round((1 + seeded((idx + 1) * 3.3 + seedOffset) * 4) * 10) / 10,
  }));
  return [you, ...comps].sort((a, b) => b.visibility - a.visibility);
}

/* ── Série temporelle de visibilité (toi vs top concurrents) ──────────── */

export type Series = { name: string; color: string; isYou: boolean; domain?: string; points: { label: string; value: number }[] };

const MONTHS = ["Déc", "Janv", "Févr", "Mars", "Avr", "Mai"];

export function visibilitySeries(setup: GeoSetup, domain: string, seedOffset = 0): Series[] {
  const board = leaderboard(setup, domain, seedOffset).slice(0, 4);
  return board.map((row, idx) => {
    const base = row.visibility;
    return {
      name: row.isYou ? `${row.name} (vous)` : row.name,
      color: row.isYou ? "var(--accent-primary)" : SERIES_COLORS[(idx % (SERIES_COLORS.length - 1)) + 1],
      isYou: row.isYou,
      points: MONTHS.map((m, j) => ({
        label: m,
        value: Math.max(2, Math.round(base + (seeded((idx + 1) * 10 + j + seedOffset) - 0.5) * 14 - (MONTHS.length - 1 - j) * 1.2)),
      })),
    };
  });
}

/* ── Série temporelle de position moyenne (toi vs top concurrents) ──────
   Valeur = rang moyen de mention (1 = meilleur). Axe inversé côté graphe. */

export function averagePositionSeries(setup: GeoSetup, domain: string, seedOffset = 0): Series[] {
  const board = [...leaderboard(setup, domain, seedOffset)].sort((a, b) => a.position - b.position).slice(0, 4);
  return board.map((row, idx) => ({
    name: row.isYou ? `${row.name} (vous)` : row.name,
    color: row.isYou ? "var(--accent-primary)" : SERIES_COLORS[(idx % (SERIES_COLORS.length - 1)) + 1],
    isYou: row.isYou,
    domain: row.domain,
    points: MONTHS.map((m, j) => ({
      label: m,
      value: Math.max(1, Math.round((row.position + (seeded((idx + 1) * 13 + j + seedOffset) - 0.5) * 1.6) * 10) / 10),
    })),
  }));
}

/* ── Share of voice ───────────────────────────────────────────────────── */

export function shareOfVoice(setup: GeoSetup, domain: string, seedOffset = 0): { name: string; domain: string; pct: number; color: string; isYou: boolean }[] {
  const board = leaderboard(setup, domain, seedOffset);
  const total = board.reduce((s, r) => s + r.visibility, 0) || 1;
  return board.slice(0, 5).map((r, idx) => ({
    name: r.isYou ? `${r.name} (vous)` : r.name,
    domain: r.domain,
    pct: Math.round((r.visibility / total) * 1000) / 10,
    color: r.isYou ? "var(--accent-primary)" : SERIES_COLORS[(idx % (SERIES_COLORS.length - 1)) + 1],
    isYou: r.isYou,
  }));
}

/* ── Top domaines cités ───────────────────────────────────────────────── */

export type CitedDomain = { domain: string; used: number; avgCitations: number; type: string };

export const TOP_DOMAINS: CitedDomain[] = [
  { domain: "wikipedia.org",  used: 64, avgCitations: 1.8, type: "Reference" },
  { domain: "reddit.com",     used: 47, avgCitations: 0.9, type: "UGC" },
  { domain: "linkedin.com",   used: 38, avgCitations: 0.6, type: "UGC" },
  { domain: "semji.com",      used: 31, avgCitations: 1.2, type: "Competitor" },
  { domain: "abondance.com",  used: 27, avgCitations: 1.1, type: "Competitor" },
  { domain: "journaldunet.com", used: 22, avgCitations: 0.8, type: "Editorial" },
  { domain: "aw-i.com",       used: 14, avgCitations: 1.4, type: "You" },
];

export const DOMAIN_TYPE_COLOR: Record<string, string> = {
  Reference:   "var(--accent-primary)",
  UGC:         "color-mix(in oklab, var(--accent-primary) 55%, white)",
  Competitor:  "var(--color-danger)",
  Editorial:   "var(--color-warning)",
  Institutional: "var(--text-muted)",
  You:         "var(--color-success)",
  Other:       "var(--text-muted)",
};

/* ── Opportunités de prompt (faible visibilité, fort volume) ──────────── */

export function promptOpportunities(enriched: EnrichedPrompt[]): EnrichedPrompt[] {
  return [...enriched]
    .filter((p) => p.visibility < 40)
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5);
}

/* ── Détail d'un prompt (modale) ──────────────────────────────────────── */

export type PromptResult = {
  platform: LlmPlatform;
  mentioned: boolean;
  position: number | null;
  competitors: string[];
  citations: string[];
  response: string;
};

export function promptResults(prompt: EnrichedPrompt, setup: GeoSetup, domain: string): PromptResult[] {
  const brand = brandFromDomain(domain);
  const compNames = setup.competitors.map((c) => c.name);
  return setup.platforms.map((plat, idx) => {
    const s = seeded((prompt.text.length + idx) * 1.7);
    const mentioned = s > 0.4;
    return {
      platform: plat,
      mentioned,
      position: mentioned ? Math.round(1 + seeded((idx + 2) * 2.1) * 4) : null,
      competitors: compNames.slice(0, 2 + Math.floor(seeded((idx + 3) * 1.3) * 2)),
      citations: ["wikipedia.org", "reddit.com", mentioned ? domain : "semji.com"].slice(0, 2 + (mentioned ? 1 : 0)),
      response: mentioned
        ? `Pour répondre à « ${prompt.text} », plusieurs acteurs ressortent. ${brand} est cité parmi les références reconnues, aux côtés de ${compNames.slice(0, 2).join(" et ")}. ${brand} se distingue notamment par son expertise et ses retours clients.`
        : `Pour « ${prompt.text} », les sources mettent surtout en avant ${compNames.slice(0, 3).join(", ")}. ${brand} n'apparaît pas dans cette réponse — opportunité de visibilité à travailler.`,
    };
  });
}

/** Query fan-out : sous-requêtes que le moteur IA dérive du prompt (mock déterministe). */
export function promptFanout(text: string, platform: LlmPlatform): string[] {
  const root = text
    .replace(/\s*\?\s*$/, "")
    .replace(/^(Quelles?|Comment|Qu['’]est-ce que|Quels?|Combien|Qui|Où|Pourquoi)\s+/i, "")
    .replace(/^(est|sont|coûte|faut-il|faire)\s+/i, "")
    .replace(/^(la|le|les|un|une|des|de|du|d['’]|à)\s+/i, "")
    .trim();
  const base = root.length > 3 ? root : text.replace(/\?/g, "").trim();
  const suffixes = ["", " avis", " comparatif 2026", " prix", " classement", " recommandé"];
  const start = Math.floor(seeded(text.length + platform.length * 3) * suffixes.length);
  const count = 3 + Math.floor(seeded(text.length * 1.7 + 1) * 2); // 3 ou 4
  const seen = new Set<string>();
  const out: string[] = [];
  for (let i = 0; out.length < count && i < suffixes.length * 2; i++) {
    const q = `${base}${suffixes[(start + i) % suffixes.length]}`.trim();
    if (!seen.has(q)) { seen.add(q); out.push(q); }
  }
  return out;
}

export const PLATFORM_LABEL = (k: LlmPlatform) => LLM_PLATFORMS.find((p) => p.key === k)?.label ?? k;
export const PLATFORM_DOMAIN = (k: LlmPlatform) => LLM_PLATFORMS.find((p) => p.key === k)?.domain ?? "";

/* ── Phase 2 : Plateformes ────────────────────────────────────────────── */

export type MatrixRow = { name: string; domain: string; isYou: boolean; byPlatform: Record<string, number> };

export function platformMatrix(setup: GeoSetup, domain: string): MatrixRow[] {
  const board = leaderboard(setup, domain);
  return board.map((r, ri) => ({
    name: r.name, domain: r.domain, isYou: r.isYou,
    byPlatform: Object.fromEntries(setup.platforms.map((p, pi) =>
      [p, Math.max(0, Math.round(r.visibility + (seeded((ri + 1) * 13 + pi) - 0.5) * 26))])),
  }));
}

/* ── Phase 2 : Sentiment ──────────────────────────────────────────────── */

export function sentimentSeries(setup: GeoSetup, domain: string): Series[] {
  const board = leaderboard(setup, domain).slice(0, 4);
  return board.map((row, idx) => ({
    name: row.isYou ? `${row.name} (vous)` : row.name,
    color: row.isYou ? "var(--accent-primary)" : SERIES_COLORS[(idx % (SERIES_COLORS.length - 1)) + 1],
    isYou: row.isYou,
    points: MONTHS.map((m, j) => ({ label: m, value: Math.max(20, Math.min(100, Math.round(row.sentiment + (seeded((idx + 1) * 20 + j) - 0.5) * 12))) })),
  }));
}

export function sentimentBreakdown(enriched: EnrichedPrompt[]): { positive: number; neutral: number; negative: number } {
  const mentioned = enriched.filter((p) => p.visibility > 0);
  const c = { positive: 0, neutral: 0, negative: 0 };
  for (const p of mentioned) {
    if (p.sentiment === "positive") c.positive++;
    else if (p.sentiment === "negative") c.negative++;
    else c.neutral++;
  }
  const total = mentioned.length || 1;
  return {
    positive: Math.round((c.positive / total) * 100),
    neutral: Math.round((c.neutral / total) * 100),
    negative: Math.round((c.negative / total) * 100),
  };
}

export function sentimentByPlatform(setup: GeoSetup, domain: string): { platform: LlmPlatform; score: number }[] {
  const base = leaderboard(setup, domain).find((r) => r.isYou)!.sentiment;
  return setup.platforms.map((p, i) => ({ platform: p, score: Math.max(20, Math.min(100, Math.round(base + (seeded((i + 1) * 17) - 0.5) * 22))) }));
}

/** Série temporelle de sentiment par plateforme (une courbe par modèle IA). La couleur
 *  est un placeholder (SERIES_COLORS) — la vue la remplace par PLATFORM_COLOR. */
export function sentimentByPlatformSeries(setup: GeoSetup, domain: string): Series[] {
  return sentimentByPlatform(setup, domain).map((s, i) => ({
    name: PLATFORM_LABEL(s.platform),
    color: SERIES_COLORS[(i % (SERIES_COLORS.length - 1)) + 1],
    isYou: false,
    domain: PLATFORM_DOMAIN(s.platform),
    points: MONTHS.map((m, j) => ({ label: m, value: Math.max(20, Math.min(100, Math.round(s.score + (seeded((i + 1) * 23 + j) - 0.5) * 16))) })),
  }));
}

/** Part positive / négative (2 voies, somme = 100) déduite de la répartition. */
export function positiveShare(setup: GeoSetup): { posPct: number; negPct: number } {
  const b = sentimentBreakdown(enrichPrompts(setup));
  const tot = b.positive + b.negative || 1;
  const posPct = Math.round((b.positive / tot) * 100);
  return { posPct, negPct: 100 - posPct };
}

/** Série temporelle du sentiment positif (ligne unique « Période actuelle »). */
export function positiveSentimentSeries(setup: GeoSetup, domain: string): Series[] {
  const base = positiveShare(setup).posPct;
  return [{
    name: "Période actuelle",
    color: "var(--accent-primary)",
    isYou: true,
    points: MONTHS.map((m, j) => ({ label: m, value: Math.max(40, Math.min(96, Math.round(base + (seeded(j * 7.3 + 2) - 0.5) * 14))) })),
  }];
}

/* ── Thèmes de sentiment (patterns remontés par l'IA) ─────────────────── */

export type ThemeExample = { promptText: string; platform: LlmPlatform; region: string; date: string; mentioned: boolean; competitors: string[] };
export type SentimentTheme = { name: string; sentiment: "positive" | "negative" | "neutral"; occurrences: number; trending: boolean; examples: ThemeExample[] };

const THEME_DEFS: { name: string; sentiment: SentimentTheme["sentiment"]; trending?: boolean }[] = [
  { name: "Expertise SEO reconnue", sentiment: "positive" },
  { name: "Accompagnement sur mesure", sentiment: "positive" },
  { name: "Résultats mesurables", sentiment: "positive", trending: true },
  { name: "Approche data-driven", sentiment: "positive" },
  { name: "Couverture technique complète", sentiment: "positive" },
  { name: "Transparence du reporting", sentiment: "positive" },
  { name: "Bon rapport qualité-prix", sentiment: "positive" },
  { name: "Notoriété de la marque", sentiment: "positive", trending: true },
  { name: "Comparaison avec les freelances", sentiment: "neutral", trending: true },
  { name: "Positionnement généraliste", sentiment: "neutral" },
  { name: "Tarifs élevés", sentiment: "negative" },
  { name: "Délais de mise en œuvre", sentiment: "negative" },
  { name: "Manque de spécialisation sectorielle", sentiment: "negative", trending: true },
  { name: "Communication perfectible", sentiment: "negative" },
];

const THEME_DATES = ["7 oct. 2025", "3 oct. 2025", "28 sept. 2025", "21 sept. 2025", "14 sept. 2025", "6 sept. 2025", "29 août 2025", "20 août 2025"];

export function sentimentThemes(setup: GeoSetup, domain: string): SentimentTheme[] {
  const enriched = enrichPrompts(setup);
  const comps = setup.competitors.map((c) => c.name);
  const regions = setup.regions.length ? setup.regions : ["FR"];

  return THEME_DEFS.map((def, ti) => {
    const occurrences = Math.round(4 + seeded((ti + 1) * 3.7) * 24); // 4..28
    const examples: ThemeExample[] = Array.from({ length: occurrences }, (_, ei) => {
      const p = enriched[(ti * 5 + ei) % Math.max(1, enriched.length)];
      const s = seeded((ti + 1) * 5.3 + ei * 2.1);
      return {
        promptText: p?.text ?? "Que pensez-vous de cette agence ?",
        platform: p?.platform ?? setup.platforms[0] ?? "chatgpt",
        region: regions[(ti + ei) % regions.length],
        date: THEME_DATES[(ti + ei) % THEME_DATES.length],
        mentioned: def.sentiment === "negative" ? s > 0.6 : s > 0.25,
        competitors: comps.slice(0, 2 + Math.floor(seeded((ti + ei + 1) * 1.9) * 2)),
      };
    });
    return { name: def.name, sentiment: def.sentiment, occurrences, trending: def.trending ?? false, examples };
  }).sort((a, b) => b.occurrences - a.occurrences);
}

/* ── Phase 2 : Citations ──────────────────────────────────────────────── */

export type CitationLeader = { name: string; domain: string; isYou: boolean; share: number };

export function citationLeaderboard(setup: GeoSetup, domain: string): CitationLeader[] {
  const board = leaderboard(setup, domain);
  const raw = board.map((r, i) => ({ ...r, c: r.visibility * (0.6 + seeded((i + 1) * 4.2) * 0.8) }));
  const total = raw.reduce((s, r) => s + r.c, 0) || 1;
  return raw.map((r) => ({ name: r.name, domain: r.domain, isYou: r.isYou, share: Math.round((r.c / total) * 1000) / 10 }))
    .sort((a, b) => b.share - a.share);
}

/** Répartition des citations par origine (earned / owned / social…). */
export function citationTypeBreakdown(): { label: string; pct: number; color: string }[] {
  return [
    { label: "Earned",  pct: 46, color: "var(--accent-primary)" },
    { label: "Owned",   pct: 23, color: "var(--color-success)" },
    { label: "Social",  pct: 18, color: "color-mix(in oklab, var(--accent-primary) 55%, white)" },
    { label: "Editorial", pct: 9, color: "var(--color-warning)" },
    { label: "Autre",   pct: 4, color: "var(--text-muted)" },
  ];
}

/* ── Citations façon Profound : partage, origine, domaines, pages ──────── */

export type CitationCat = "earned" | "social" | "owned";
export const CITATION_CAT_CFG: Record<CitationCat, { label: string; color: string }> = {
  earned: { label: "Gagné",   color: "var(--accent-primary)" },
  social: { label: "Social",  color: "#8B5CF6" },
  owned:  { label: "Possédé", color: "var(--color-success)" },
};

/** Origine des citations — répartition Gagné / Social / Possédé (somme = 100). */
export function citationTypes(): { cat: CitationCat; pct: number }[] {
  return [{ cat: "earned", pct: 79 }, { cat: "social", pct: 14 }, { cat: "owned", pct: 7 }];
}

export type CitationDomain = { domain: string; cat: CitationCat; share: number; delta: number };

/** Domaines les plus cités par l'IA (sources), avec la marque suivie en « Possédé ». */
export function topCitationDomains(setup: GeoSetup, domain: string): CitationDomain[] {
  const src: { domain: string; cat: CitationCat }[] = [
    { domain: "designrush.com", cat: "earned" },
    { domain: "semrush.com", cat: "earned" },
    { domain, cat: "owned" },
    { domain: "journaldunet.com", cat: "earned" },
    { domain: "reddit.com", cat: "social" },
    { domain: "blogdumoderateur.com", cat: "earned" },
    { domain: "ahrefs.com", cat: "earned" },
    { domain: "linkedin.com", cat: "social" },
    { domain: "youtube.com", cat: "social" },
    { domain: "medium.com", cat: "social" },
    { domain: "wikipedia.org", cat: "earned" },
    { domain: "abondance.com", cat: "earned" },
  ];
  return src
    .map((d, i) => { const share = Math.max(0.4, Math.round((9.6 - i * 0.7 + (seeded((i + 1) * 3.1) - 0.5) * 1.2) * 10) / 10); return { ...d, share, delta: share }; })
    .sort((a, b) => b.share - a.share);
}

/** Série temporelle du partage de citations (top domaines cités). */
export function citationShareSeries(setup: GeoSetup, domain: string): Series[] {
  return topCitationDomains(setup, domain).slice(0, 5).map((d, idx) => ({
    name: d.domain,
    color: d.cat === "owned" ? "var(--accent-primary)" : SERIES_COLORS[(idx % (SERIES_COLORS.length - 1)) + 1],
    isYou: d.cat === "owned",
    domain: d.domain,
    points: MONTHS.map((m, j) => ({ label: m, value: Math.max(0.4, Math.round((d.share + (seeded((idx + 1) * 12 + j) - 0.5) * 3.4) * 10) / 10) })),
  }));
}

export type CitationPage = { url: string; cat: CitationCat; mentioned: boolean; share: number; delta: number };

/** Pages les plus citées dans les réponses IA. */
export function topCitationPages(setup: GeoSetup, domain: string): CitationPage[] {
  const src: { url: string; cat: CitationCat; mentioned: boolean }[] = [
    { url: `designrush.com/agency/seo/agences-seo`, cat: "earned", mentioned: false },
    { url: `${domain}/`, cat: "owned", mentioned: true },
    { url: `journaldunet.com/solutions/seo/1211275-meilleures-agences-seo`, cat: "earned", mentioned: false },
    { url: `reddit.com/r/seogrowth/comments/meilleure-agence-seo`, cat: "social", mentioned: false },
    { url: `blogdumoderateur.com/comparatif-agences-seo-france`, cat: "earned", mentioned: true },
    { url: `clutch.co/fr/agencies/seo`, cat: "earned", mentioned: false },
    { url: `ahrefs.com/blog/best-seo-agencies`, cat: "earned", mentioned: false },
    { url: `en.wikipedia.org/wiki/Search_engine_optimization`, cat: "earned", mentioned: false },
    { url: `linkedin.com/pulse/top-agences-seo-france-2026`, cat: "social", mentioned: true },
    { url: `semrush.com/blog/meilleures-agences-seo`, cat: "earned", mentioned: false },
    { url: `youtube.com/watch?v=comment-choisir-agence-seo`, cat: "social", mentioned: false },
    { url: `medium.com/@seo/comparatif-agences-2026`, cat: "social", mentioned: false },
    { url: `${domain}/blog/seo-local`, cat: "owned", mentioned: true },
    { url: `abondance.com/agences-seo-recommandees`, cat: "earned", mentioned: false },
    { url: `webrankinfo.com/dossiers/agences`, cat: "earned", mentioned: false },
    { url: `quora.com/best-seo-agency-france`, cat: "social", mentioned: false },
  ];
  return src.map((p, i) => { const share = Math.max(0.3, Math.round((4.2 - i * 0.28 + (seeded((i + 1) * 2.7) - 0.5) * 0.5) * 100) / 100); return { ...p, share, delta: share }; });
}

/* ── Vue d'ensemble : résumé IA, visibilité par modèle, opportunités ──── */

/** Visibilité moyenne par sujet (pour le résumé). */
export function topicVisibility(setup: GeoSetup): { name: string; visibility: number }[] {
  const enriched = enrichPrompts(setup);
  const byTopic = new Map<string, { sum: number; n: number }>();
  for (const p of enriched) {
    const e = byTopic.get(p.listName) ?? { sum: 0, n: 0 };
    e.sum += p.visibility; e.n += 1; byTopic.set(p.listName, e);
  }
  return [...byTopic.entries()]
    .map(([name, { sum, n }]) => ({ name, visibility: Math.round(sum / Math.max(1, n)) }))
    .sort((a, b) => b.visibility - a.visibility);
}

/* ── Classement par sujet (vous + concurrents, façon Profound) ─────────── */

/** Marques d'appoint pour étoffer le pool de classement par sujet (mock). */
const EXTRA_BRANDS = [
  { name: "Google", domain: "google.com" },
  { name: "Amazon", domain: "amazon.com" },
  { name: "Microsoft", domain: "microsoft.com" },
  { name: "GitHub", domain: "github.com" },
  { name: "Cloudflare", domain: "cloudflare.com" },
  { name: "IBM", domain: "ibm.com" },
  { name: "Figma", domain: "figma.com" },
  { name: "Adobe", domain: "adobe.com" },
  { name: "Vercel", domain: "vercel.com" },
  { name: "Netlify", domain: "netlify.com" },
];

export type RankBrand = { name: string; domain: string; isYou: boolean };
export type PromptRanking = { text: string; brands: RankBrand[]; yourRank: number | null };
export type TopicRanking = {
  topic: string;
  status: "leader" | "needs-work";
  yourRank: number | null;
  brands: RankBrand[];        // classement agrégé du sujet (#1..#N, max 10)
  prompts: PromptRanking[];   // classement détaillé par prompt du sujet
};

/** Classe le pool de marques de façon déterministe (seed) + boost « vous » optionnel. */
function rankPool(pool: RankBrand[], seed: number, youBoost: number, count: number): RankBrand[] {
  return pool
    .map((b, bi) => ({ b, score: seeded(seed + bi * 3.3) + (b.isYou ? youBoost : 0) }))
    .sort((a, z) => z.score - a.score)
    .slice(0, count)
    .map((x) => x.b);
}

/** Pour chaque sujet (liste), classe vous + concurrents + marques d'appoint,
 *  avec le détail par prompt de la liste. */
export function topicRankings(setup: GeoSetup, domain: string): TopicRanking[] {
  const you: RankBrand = { name: brandFromDomain(domain), domain, isYou: true };
  const comps = setup.competitors.map((c) => ({ name: c.name, domain: c.domain, isYou: false }));
  const pool: RankBrand[] = [you, ...comps, ...EXTRA_BRANDS.map((b) => ({ ...b, isYou: false }))];

  return setup.lists.map((list, li) => {
    // ~30% des sujets : vous êtes propulsé en tête (statut « leader »).
    const lead = seeded((li + 1) * 1.3) > 0.7;
    const youBoost = lead ? 1.2 : seeded((li + 1) * 2.1) * 0.2;
    const aggCount = 2 + Math.floor(seeded((li + 1) * 4.2) * 9); // 2..10 colonnes
    const brands = rankPool(pool, (li + 1) * 17.7, youBoost, aggCount);
    const yourIdx = brands.findIndex((b) => b.isYou);

    const prompts: PromptRanking[] = list.prompts.map((p, pi) => {
      const pseed = (li + 1) * 31.1 + (pi + 1) * 7.7;
      const pBoost = seeded(pseed) > 0.6 ? 1.1 : seeded(pseed * 1.3) * 0.25;
      const pCount = 4 + Math.floor(seeded(pseed * 2.1) * 5); // 4..8 marques
      const pBrands = rankPool(pool, pseed, pBoost, pCount);
      const pIdx = pBrands.findIndex((b) => b.isYou);
      return { text: p.text, brands: pBrands, yourRank: pIdx >= 0 ? pIdx + 1 : null };
    });

    return {
      topic: list.name,
      status: yourIdx >= 0 && yourIdx <= 1 ? "leader" : "needs-work",
      yourRank: yourIdx >= 0 ? yourIdx + 1 : null,
      brands,
      prompts,
    };
  });
}

/** Résumé IA « quoi de neuf » dérivé des données. */
export function geoSummary(setup: GeoSetup, domain: string): { headline: string; body: string } {
  const board = leaderboard(setup, domain);
  const you = board.find((r) => r.isYou)!;
  const rank = board.findIndex((r) => r.isYou) + 1;
  const enriched = enrichPrompts(setup);
  const sov = Math.round((you.visibility / (board.reduce((s, r) => s + r.visibility, 0) || 1)) * 1000) / 10;
  const topics = topicVisibility(setup);
  const best = topics[0];
  const worst = topics[topics.length - 1];
  const headline = `${you.name} se classe #${rank} sur ${board.length} marques en visibilité IA`;
  const body = `${you.name} apparaît dans ${you.visibility}% des réponses IA générées sur vos ${enriched.length} prompts suivis, pour un share of voice de ${sov}% face à ${board.length - 1} concurrents.${best && worst ? ` Vous dominez le sujet « ${best.name} » (${best.visibility}%), mais restez peu cité sur « ${worst.name} » (${worst.visibility}%), votre principal levier de progression.` : ""}`;
  return { headline, body };
}

/** Couleur de marque par modèle IA (pour colorer barres et courbes). */
export const PLATFORM_COLOR: Record<LlmPlatform, string> = {
  chatgpt:     "#10A37F",
  perplexity:  "#20808D",
  gemini:      "#4285F4",
  claude:      "#D97757",
  copilot:     "#1A86D8",
  "google-ai": "#EA4335",
};

/** Visibilité de la marque par modèle IA (pour le graph barres/courbe). */
export type PlatformVisibility = { platform: LlmPlatform; label: string; domain: string; value: number; color: string };

export function visibilityByPlatform(setup: GeoSetup, domain: string): PlatformVisibility[] {
  const you = leaderboard(setup, domain).find((r) => r.isYou)!;
  return setup.platforms.map((p, i) => ({
    platform: p,
    label: PLATFORM_LABEL(p),
    domain: PLATFORM_DOMAIN(p),
    value: Math.max(6, Math.min(100, Math.round(you.visibility + (seeded((i + 1) * 11.3) - 0.5) * 30))),
    color: PLATFORM_COLOR[p],
  }));
}

/** Série temporelle de visibilité, une ligne par modèle IA (couleur de marque). */
export function visibilityByPlatformSeries(setup: GeoSetup, domain: string): Series[] {
  return visibilityByPlatform(setup, domain).map((pv, idx) => ({
    name: pv.label,
    color: pv.color,
    isYou: false,
    domain: pv.domain,
    points: MONTHS.map((m, j) => ({
      label: m,
      value: Math.max(2, Math.round(pv.value + (seeded((idx + 1) * 15 + j) - 0.5) * 14 - (MONTHS.length - 1 - j) * 1.0)),
    })),
  }));
}

/** Opportunités en cards (fort volume, pas encore cité). */
export type GeoOpportunity = { id: string; category: string; topic: string; title: string; description: string; impact: string };

const OPP_CATS = ["Création de contenu", "Optimisation de page", "Relations presse"];

export function geoOpportunities(setup: GeoSetup, domain: string): GeoOpportunity[] {
  const you = leaderboard(setup, domain).find((r) => r.isYou)!;
  const opps = promptOpportunities(enrichPrompts(setup));
  return opps.slice(0, 3).map((p, i) => {
    const lift = Math.round(4 + seeded((i + 1) * 6.2) * 8);
    return {
      id: p.id,
      category: OPP_CATS[i % OPP_CATS.length],
      topic: p.text,
      title: `Couvrir « ${p.listName} » avec un contenu pensé pour les réponses IA`,
      description: `Cette requête à fort volume (${p.volume.toLocaleString("fr-FR")}/mois) ne cite pas encore ${you.name}. Un contenu dédié et structuré pour les moteurs de réponse peut capter cette visibilité.`,
      impact: `+${lift} pts`,
    };
  });
}

/** Domaines qui citent les concurrents mais pas vous (gap analysis). */
export type GapDomain = { domain: string; type: string; competitorsCiting: number; gapScore: number };

export function gapDomains(): GapDomain[] {
  return [
    { domain: "journaldunet.com",  type: "Editorial",  competitorsCiting: 4, gapScore: 58 },
    { domain: "bdm.fr",            type: "Editorial",  competitorsCiting: 3, gapScore: 47 },
    { domain: "frenchweb.fr",      type: "Editorial",  competitorsCiting: 3, gapScore: 41 },
    { domain: "g2.com",            type: "Reference",  competitorsCiting: 2, gapScore: 38 },
    { domain: "quora.com",         type: "UGC",        competitorsCiting: 2, gapScore: 29 },
    { domain: "trustpilot.com",    type: "Reference",  competitorsCiting: 2, gapScore: 24 },
  ];
}
