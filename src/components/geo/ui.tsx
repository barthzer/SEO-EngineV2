"use client";

import { Tooltip } from "@/components/Tooltip";
import { Flag } from "@/components/Flag";
import type { PromptSentiment } from "@/components/geo/types";

/** Couleur de marque par plateforme IA (graphes par plateforme — barres, courbes). */
export const PLATFORM_COLORS: Record<string, string> = {
  chatgpt: "#111827",
  perplexity: "#20808D",
  gemini: "#4285F4",
  claude: "#D97757",
  copilot: "#D6409F",
  "google-ai": "#F4B400",
};
export const PLATFORM_COLOR = (k: string): string => PLATFORM_COLORS[k] ?? "var(--accent-primary)";

export const CARD = "rounded-2xl border border-[var(--border-subtle)]";
export const CARD_SM = "rounded-2xl border border-[var(--border-subtle)]";

/** Palette de couleurs de listes (dot de la liste dans les filtres). */
export const LIST_COLORS = ["var(--accent-primary)", "var(--color-success)", "var(--color-warning)", "#8B5CF6", "var(--color-danger)", "#20808D", "#F4B400"];
export const listColor = (id: string): string => {
  let h = 0; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return LIST_COLORS[h % LIST_COLORS.length];
};

const SENTIMENT_CFG: Record<Exclude<PromptSentiment, null>, { label: string; color: string }> = {
  positive: { label: "Positif", color: "var(--color-success)" },
  neutral:  { label: "Neutre",  color: "var(--text-muted)" },
  negative: { label: "Négatif", color: "var(--color-danger)" },
};

/** Sentiment en texte coloré (pas de pill) — norme DS de la vue Sentiment. */
export function SentimentPill({ value }: { value: PromptSentiment }) {
  if (!value) return <span className="text-[13px] text-[var(--text-muted)]">—</span>;
  const c = SENTIMENT_CFG[value];
  return <span className="text-[13px] font-medium" style={{ color: c.color }}>{c.label}</span>;
}

/** Couleur d'un % de visibilité. */
export function visColor(v: number): string {
  return v >= 50 ? "var(--color-success)" : v >= 25 ? "var(--color-warning)" : v > 0 ? "var(--color-danger)" : "var(--text-muted)";
}

/* ── Volume : niveau 1→5 relatif au marché + indicateur en barres (style signal) ── */

/** Niveau de volume 1→5 (relatif au marché) à partir du volume mensuel brut. */
export function volumeLevel(v: number): 1 | 2 | 3 | 4 | 5 {
  if (v < 500) return 1;
  if (v < 1000) return 2;
  if (v < 2000) return 3;
  if (v < 3000) return 4;
  return 5;
}

const VOLUME_LABELS = [
  "",
  "Volume de recherche très faible pour votre marché",
  "Volume de recherche faible pour votre marché",
  "Volume de recherche modéré pour votre marché",
  "Volume de recherche élevé pour votre marché",
  "Volume de recherche très élevé pour votre marché",
];

/** Indicateur de volume en 5 barres croissantes (3×6 → 3×14, gap 2px, full rounded, vert). */
export function VolumeBars({ level }: { level: number }) {
  const heights = [6, 8, 10, 12, 14];
  return (
    <Tooltip label={`${level} — ${VOLUME_LABELS[level]}`} side="top" portal>
      <span className="inline-flex items-end gap-[2px]" aria-label={`Volume ${level} sur 5`}>
        {heights.map((h, i) => (
          <span key={i} className="w-[3px] rounded-full"
            style={{ height: h, backgroundColor: i < level ? "var(--color-success)" : "var(--border-medium)" }} />
        ))}
      </span>
    </Tooltip>
  );
}

/* ── Tag + Localisation (colonnes table prompts) ──────────────────────── */

/** Drapeau circulaire DS ([[Flag]]) + code région (ex. ● FR). */
export function RegionFlag({ code }: { code: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Flag code={code} size={18} />
      <span className="text-[13px] text-[var(--text-secondary)]">{code}</span>
    </span>
  );
}

/** Pastille de tag (point coloré + nom). */
export function TagPill({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-medium"
      style={{ color, backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)` }}
    >
      {name}
    </span>
  );
}
