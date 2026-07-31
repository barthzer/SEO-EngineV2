"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Tooltip } from "@/components/Tooltip";
import { ScoreRing } from "./ProjectHeaderBits";

export type HealthAction = { label: string; visits?: string };

export function SeverityBadge({ level, count }: { level: "critique" | "important"; count: number }) {
  const cfg = level === "critique"
    ? { color: "var(--color-danger)", bg: "var(--color-danger-bg)", label: count === 1 ? "critique" : "critiques" }
    : { color: "var(--color-warning)", bg: "rgba(245,158,11,0.09)", label: count === 1 ? "important" : "importants" };
  return (
    <span className="type-caption inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold" style={{ color: cfg.color, backgroundColor: cfg.bg }}>
      {count} {cfg.label}
    </span>
  );
}

export function HealthCard({
  title, score, critiques, importants, visitesRisk, note, ctaHref, quote,
}: {
  title: string; score?: number; critiques: number; importants?: number;
  visitesRisk: string; actions?: HealthAction[]; note?: string;
  cta?: string; ctaHref?: string;
  color?: string; colorBg?: string; quote?: string;
}) {
  const inner = (
    <div className="group/health flex flex-1 flex-col min-w-0">
      {/* Header condensé — titre + badges + score. Le diagnostic IA passe en
          tooltip (icône Sparkles) pour gagner de la hauteur au-dessus du fold. */}
      <div className="flex items-start gap-4 p-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="type-h3">{title}</p>
            {quote && (
              <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <Tooltip
                  side="top"
                  rich
                  portal
                  label={<span className="type-caption block max-w-[260px] leading-relaxed text-white/90">{quote}</span>}
                >
                  <button
                    type="button"
                    className="flex h-5 w-5 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--accent-primary)]"
                    aria-label="Diagnostic IA"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                  </button>
                </Tooltip>
              </span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <SeverityBadge level="critique" count={critiques} />
            {importants !== undefined && <SeverityBadge level="important" count={importants} />}
            <span className="type-micro">~{visitesRisk} vis./mois à risque</span>
          </div>
          {note && (
            <p className="type-micro mt-2">{note}</p>
          )}
        </div>
        {score !== undefined && <ScoreRing score={score} md />}
      </div>
    </div>
  );

  return ctaHref ? <Link href={ctaHref} className="block">{inner}</Link> : inner;
}
