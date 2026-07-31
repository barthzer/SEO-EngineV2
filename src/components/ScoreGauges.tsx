"use client";

/**
 * ScoreGauges — 3 jauges verticales (Technique / Contenu / Popularité).
 *
 * Tooltip unique au survol du groupe (rich) qui résume les 3 scores.
 * Sous chaque jauge : mini encart T/C/N.
 *
 * Couleur par jauge :
 *  - ≥70  → success
 *  - ≥50  → warning
 *  - <50  → danger
 */

import type { ElementType } from "react";
import { DocumentTextIcon, LinkIcon, SparklesIcon } from "@heroicons/react/24/solid";
import { Tooltip } from "@/components/Tooltip";
import { GaugeGlyph } from "@/components/icons/GaugeGlyph";

type Props = {
  technique: number | null;
  contenu: number | null;
  netlinking: number | null;
  /** Visibilité IA (GEO) — optionnel : ajoute une 4e jauge si fourni. */
  geo?: number | null;
  /** Hauteur des barres (px). */
  height?: number;
  /** Si true, n'affiche pas les mini encarts T/C/N (utile en très compact). */
  compact?: boolean;
};

function gaugeColor(v: number | null): string {
  if (v == null) return "var(--border-subtle)";
  if (v >= 70) return "var(--color-success)";
  if (v >= 50) return "var(--color-warning)";
  return "var(--color-danger)";
}

function Gauge({
  label,
  value,
  height,
  compact,
}: {
  label: string;
  value: number | null;
  height: number;
  compact: boolean;
}) {
  const filled = value ?? 0;
  const color = gaugeColor(value);

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Jauge verticale */}
      <div
        className="relative w-[4px] overflow-hidden rounded-full bg-[var(--border-subtle)]"
        style={{ height }}
      >
        <div
          className="absolute inset-x-0 bottom-0 rounded-full transition-[height] duration-500"
          style={{
            height: `${filled}%`,
            backgroundColor: color,
            transitionTimingFunction: "var(--ease-expo, cubic-bezier(0.16, 1, 0.3, 1))",
          }}
        />
      </div>
      {/* Mini encart T/C/N */}
      {!compact && (
        <span className="flex h-4 w-4 items-center justify-center rounded-[5px] border border-[var(--border-subtle)] bg-[var(--bg-card-hover)] type-micro uppercase leading-none text-[var(--text-secondary)]">
          {label}
        </span>
      )}
    </div>
  );
}

function GaugeTooltipContent({
  technique,
  contenu,
  netlinking,
  geo,
}: {
  technique: number | null;
  contenu: number | null;
  netlinking: number | null;
  geo?: number | null;
}) {
  const lines: { label: string; value: number | null; icon: ElementType }[] = [
    { label: "Technique",  value: technique,  icon: GaugeGlyph },
    { label: "Contenu",    value: contenu,    icon: DocumentTextIcon },
    { label: "Popularité", value: netlinking, icon: LinkIcon },
    ...(geo !== undefined ? [{ label: "Visibilité IA", value: geo ?? null, icon: SparklesIcon }] : []),
  ];
  return (
    <div className="flex flex-col gap-1.5">
      {lines.map((l) => {
        const Icon = l.icon;
        return (
          <div key={l.label} className="flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2">
              <Icon className="h-3.5 w-3.5 text-white/60" />
              <span className="type-caption text-white/80">{l.label}</span>
            </span>
            <span className="tabular-nums type-caption" style={{ color: gaugeColor(l.value) }}>
              {l.value == null ? "—" : `${l.value} / 100`}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function ScoreGauges({
  technique,
  contenu,
  netlinking,
  geo,
  height = 28,
  compact = false,
}: Props) {
  return (
    <Tooltip
      label={
        <GaugeTooltipContent
          technique={technique}
          contenu={contenu}
          netlinking={netlinking}
          geo={geo}
        />
      }
      side="top"
      portal
      rich
    >
      <div className="flex flex-shrink-0 items-end gap-2">
        <Gauge label="T"  value={technique}  height={height} compact={compact} />
        <Gauge label="C"  value={contenu}    height={height} compact={compact} />
        <Gauge label="N"  value={netlinking} height={height} compact={compact} />
        {geo !== undefined && <Gauge label="IA" value={geo ?? null} height={height} compact={compact} />}
      </div>
    </Tooltip>
  );
}
