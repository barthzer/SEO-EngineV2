/**
 * Blocs riches de l'assistant (G3) — rendering structuré dans les réponses.
 *
 * Le moteur `respond()` peut joindre un `RichBlock` à une réponse texte : une
 * grille de scorecards, un graphe à barres horizontales ou une table. Le widget
 * (ChatRichBlock) sait les rendre avec les tokens du DS.
 *
 * Les données sont des mocks « façon Ahrefs » générés de façon **déterministe**
 * à partir du domaine (même domaine → mêmes chiffres), en attendant le câblage
 * sur les vraies API (MCP Ahrefs / Haloscan).
 */

import type { Project } from "@/data/projects";

export type ScoreItem = {
  label: string;
  value: string;
  /** Variation type "+12 %" / "−3" — rendue en DeltaBadge si présent. */
  delta?: string;
  deltaPositiveIsGood?: boolean;
  hint?: string;
};

export type BarItem = { label: string; value: number; display?: string };

export type RichBlock =
  | { kind: "scorecards"; title?: string; source?: string; items: ScoreItem[] }
  | { kind: "bars"; title?: string; source?: string; items: BarItem[]; max?: number; unit?: string }
  | { kind: "table"; title?: string; source?: string; columns: string[]; align?: ("left" | "right")[]; rows: (string | number)[][] };

/* ── PRNG déterministe (mulberry32 + hash FNV-1a) ─────────────────────── */

function seeded(s: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h |= 0;
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const fr = (n: number) => Math.round(n).toLocaleString("fr-FR");
const projName = (domain: string) => domain.split(".")[0];

type Metrics = {
  dr: number;
  backlinks: number;
  refDomains: number;
  refDomains30d: number;
  traffic: number;
  traffic30d: number;
  keywords: number;
  trafficValue: number;
};

/** Métriques déterministes d'un projet, corrélées à son score. */
export function projectMetrics(p: Project): Metrics {
  const rnd = seeded(p.domain);
  const s = p.score / 100;
  const dr = Math.round(35 + s * 55 + (rnd() - 0.5) * 8);
  const refDomains = Math.round((200 + s * 9000) * (0.6 + rnd() * 0.8));
  const backlinks = Math.round(refDomains * (12 + rnd() * 80));
  const traffic = Math.round((1500 + s * 180000) * (0.5 + rnd()));
  const keywords = Math.round((300 + s * 24000) * (0.5 + rnd()));
  return {
    dr: Math.min(99, dr),
    backlinks,
    refDomains,
    refDomains30d: Math.round((rnd() - 0.35) * refDomains * 0.06),
    traffic,
    traffic30d: Math.round((rnd() - 0.4) * 22),
    keywords,
    trafficValue: Math.round(traffic * (0.4 + rnd() * 1.6)),
  };
}

/* ── Générateurs de blocs ─────────────────────────────────────────────── */

export function backlinksBlock(p: Project): RichBlock {
  const m = projectMetrics(p);
  return {
    kind: "scorecards",
    title: `Profil de liens — ${p.domain}`,
    source: "Ahrefs · Site Explorer",
    items: [
      { label: "Domain Rating", value: `${m.dr}` , hint: "/ 100" },
      { label: "Backlinks", value: fr(m.backlinks) },
      { label: "Domaines référents", value: fr(m.refDomains) },
      {
        label: "Réf. (30 j)",
        value: `${m.refDomains30d >= 0 ? "+" : ""}${fr(m.refDomains30d)}`,
        delta: `${m.refDomains30d >= 0 ? "+" : ""}${((m.refDomains30d / m.refDomains) * 100).toFixed(1)} %`,
        deltaPositiveIsGood: true,
      },
    ],
  };
}

export function anchorsBlock(p: Project): RichBlock {
  const rnd = seeded(p.domain + "anchors");
  const name = projName(p.domain);
  const raw = [
    { label: name, w: 3 + rnd() },
    { label: "site officiel", w: 1 + rnd() },
    { label: p.domain, w: 1.5 + rnd() },
    { label: "connexion", w: 0.6 + rnd() * 0.8 },
    { label: "avis", w: 0.4 + rnd() * 0.6 },
    { label: "(sans texte)", w: 0.5 + rnd() * 0.7 },
  ];
  const total = raw.reduce((s, r) => s + r.w, 0);
  const items = raw
    .map((r) => ({ label: r.label, value: Math.round((r.w / total) * 100) }))
    .sort((a, b) => b.value - a.value)
    .map((r) => ({ ...r, display: `${r.value} %` }));
  return {
    kind: "bars",
    title: `Ancres les plus fréquentes — ${p.domain}`,
    source: "Ahrefs · Anchors",
    items,
    max: 100,
    unit: "%",
  };
}

export function trafficBlock(p: Project): RichBlock {
  const m = projectMetrics(p);
  return {
    kind: "scorecards",
    title: `Trafic organique — ${p.domain}`,
    source: "Ahrefs · Site Explorer",
    items: [
      {
        label: "Trafic / mois",
        value: fr(m.traffic),
        delta: `${m.traffic30d >= 0 ? "+" : ""}${m.traffic30d} %`,
        deltaPositiveIsGood: true,
        hint: "30 derniers jours",
      },
      { label: "Mots-clés organiques", value: fr(m.keywords) },
      { label: "Valeur du trafic", value: `${fr(m.trafficValue)} €`, hint: "équiv. SEA / mois" },
    ],
  };
}

export function keywordsBlock(p: Project): RichBlock {
  const rnd = seeded(p.domain + "kw");
  const name = projName(p.domain);
  const templates = [
    name,
    `${name} avis`,
    `${name} connexion`,
    `${name} tarifs`,
    `${name} alternative`,
    `${name} app`,
  ];
  const rows = templates
    .map((kw) => {
      const pos = Math.max(1, Math.round(rnd() * 14));
      const vol = Math.round((500 + rnd() * 60000) / 10) * 10;
      const traffic = Math.round(vol * (pos <= 3 ? 0.3 : pos <= 10 ? 0.08 : 0.01));
      return [kw, pos, fr(vol), fr(traffic)] as (string | number)[];
    })
    .sort((a, b) => (a[1] as number) - (b[1] as number));
  return {
    kind: "table",
    title: `Top mots-clés — ${p.domain}`,
    source: "Ahrefs · Organic Keywords",
    columns: ["Mot-clé", "Pos.", "Volume", "Trafic"],
    align: ["left", "right", "right", "right"],
    rows,
  };
}

export function compareBlock(a: Project, b: Project): RichBlock {
  const ma = projectMetrics(a);
  const mb = projectMetrics(b);
  return {
    kind: "table",
    title: `Comparatif — ${a.domain} vs ${b.domain}`,
    source: "Ahrefs · Site Explorer",
    columns: ["Métrique", a.domain, b.domain],
    align: ["left", "right", "right"],
    rows: [
      ["Domain Rating", ma.dr, mb.dr],
      ["Backlinks", fr(ma.backlinks), fr(mb.backlinks)],
      ["Domaines réf.", fr(ma.refDomains), fr(mb.refDomains)],
      ["Trafic / mois", fr(ma.traffic), fr(mb.traffic)],
      ["Mots-clés", fr(ma.keywords), fr(mb.keywords)],
    ],
  };
}
