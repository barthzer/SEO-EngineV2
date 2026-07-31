"use client";

/**
 * ScoreRings — 4 diagrammes circulaires (Technique / Contenu / Popularité / IA).
 *
 * Chaque anneau porte au centre le pictogramme de l'axe (coloré selon le score)
 * et son label court en dessous. Tooltip riche unique au survol du groupe.
 * Utilisé sur les cartes de projet (vue Projets). Couleur : ≥70 vert, ≥50 ambre, <50 rouge.
 */

import type { ElementType } from "react";
import { DocumentTextIcon, LinkIcon, SparklesIcon } from "@heroicons/react/24/solid";
import { Tooltip } from "@/components/Tooltip";
import { GaugeGlyph } from "@/components/icons/GaugeGlyph";

type Props = {
  technique: number | null;
  contenu: number | null;
  netlinking: number | null;
  /** Visibilité IA (GEO) — optionnel : ajoute un 4e anneau si fourni. */
  geo?: number | null;
  /** Diamètre d'un anneau (px). */
  size?: number;
};

function ringColor(v: number | null): string {
  if (v == null) return "var(--border-subtle)";
  if (v >= 70) return "var(--color-success)";
  if (v >= 50) return "var(--color-warning)";
  return "var(--color-danger)";
}

function Ring({
  value,
  icon: Icon,
  label,
  size,
}: {
  value: number | null;
  icon: ElementType;
  label: string;
  size: number;
}) {
  const strokeWidth = Math.max(2, Math.round(size * 0.09));
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const circ = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value ?? 0));
  const c = ringColor(value);
  const iconSize = Math.round(size * 0.42);

  // Deux segments (rempli + piste) séparés par un petit écart, bouts arrondis.
  const GAP_DEG = 20;
  const gapLen = (GAP_DEG / 360) * circ;
  const fillFrac = v / 100;
  const fillArc = fillFrac > 0 ? Math.max(0, fillFrac * circ - gapLen) : 0;
  const trackArc = fillFrac < 1 ? Math.max(0, (1 - fillFrac) * circ - gapLen) : 0;
  const fillStart = -90 + GAP_DEG / 2;
  const trackStart = -90 + fillFrac * 360 + GAP_DEG / 2;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {trackArc > 0 && (
            <circle
              cx={cx}
              cy={cx}
              r={r}
              fill="none"
              stroke="var(--border-subtle)"
              strokeWidth={strokeWidth}
              strokeDasharray={`${trackArc} ${circ}`}
              strokeLinecap="round"
              transform={`rotate(${trackStart} ${cx} ${cx})`}
            />
          )}
          {fillArc > 0 && (
            <circle
              cx={cx}
              cy={cx}
              r={r}
              fill="none"
              stroke={c}
              strokeWidth={strokeWidth}
              strokeDasharray={`${fillArc} ${circ}`}
              strokeLinecap="round"
              transform={`rotate(${fillStart} ${cx} ${cx})`}
              style={{ transition: "stroke-dasharray 0.6s ease-out" }}
            />
          )}
        </svg>
        <span className="absolute inset-0 flex items-center justify-center">
          {/* Pictogramme en couleur neutre (pas la couleur du score) — seul l'anneau porte la couleur. */}
          <Icon style={{ width: iconSize, height: iconSize, color: "var(--text-secondary)" }} />
        </span>
      </div>
      <span className="type-micro uppercase leading-none">{label}</span>
    </div>
  );
}

export function ScoreRings({ technique, contenu, netlinking, geo, size = 32 }: Props) {
  const lines: { label: string; full: string; value: number | null; icon: ElementType }[] = [
    { label: "T",  full: "Technique",     value: technique,  icon: GaugeGlyph },
    { label: "C",  full: "Contenu",       value: contenu,    icon: DocumentTextIcon },
    { label: "P",  full: "Popularité",    value: netlinking, icon: LinkIcon },
    ...(geo !== undefined ? [{ label: "IA", full: "Visibilité IA", value: geo ?? null, icon: SparklesIcon }] : []),
  ];

  return (
    <Tooltip
      label={
        <div className="flex flex-col gap-1.5">
          {lines.map((l) => {
            const Icon = l.icon;
            return (
              <div key={l.full} className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-2">
                  {/* couleur inline #fff : en light mode, une global force svg.text-white en violet (cf. mémoire GSI). */}
                  <Icon className="h-3.5 w-3.5" style={{ color: "#fff" }} />
                  <span className="type-caption text-white">{l.full}</span>
                </span>
                <span className="tabular-nums type-caption" style={{ color: ringColor(l.value) }}>
                  {l.value == null ? "—" : `${l.value} / 100`}
                </span>
              </div>
            );
          })}
        </div>
      }
      side="top"
      portal
      rich
    >
      <div className="flex flex-shrink-0 items-start gap-3">
        {lines.map((l) => (
          <Ring key={l.label} value={l.value} icon={l.icon} label={l.label} size={size} />
        ))}
      </div>
    </Tooltip>
  );
}
