"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AIInsight } from "@/components/AIInsight";
import { ScoreRing } from "./ProjectHeaderBits";

export type HealthAction = { label: string; visits?: string };

export function SeverityBadge({ level, count }: { level: "critique" | "important"; count: number }) {
  const cfg = level === "critique"
    ? { color: "var(--color-danger)", bg: "var(--color-danger-bg)", label: count === 1 ? "critique" : "critiques" }
    : { color: "var(--color-warning)", bg: "rgba(245,158,11,0.09)", label: count === 1 ? "important" : "importants" };
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[12px] font-semibold" style={{ color: cfg.color, backgroundColor: cfg.bg }}>
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
      {/* Header */}
      <div className="flex items-start gap-4 p-7 min-h-[128px]">
        <div className="flex-1 min-w-0">
          <p className="text-[18px] font-semibold tracking-tight text-[var(--text-primary)]">{title}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <SeverityBadge level="critique" count={critiques} />
            {importants !== undefined && <SeverityBadge level="important" count={importants} />}
            <span className="text-[11px] text-[var(--text-muted)]">~{visitesRisk} vis./mois à risque</span>
          </div>
        </div>
        {score !== undefined && <ScoreRing score={score} md />}
      </div>

      {quote && (
        <div className="mx-7 mb-4">
          <AIInsight>{quote}</AIInsight>
        </div>
      )}

      {/* Footer — note (optionnelle) à gauche, flèche bottom-right */}
      <div className="mt-auto flex items-center justify-between gap-4 px-7 pb-5 pt-2">
        {note ? (
          <span className="text-[11px] text-[var(--text-muted)]">{note}</span>
        ) : <span />}
        {ctaHref && (
          <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-[var(--text-secondary)] transition-colors duration-150 group-hover/health:text-[var(--accent-primary)]" />
        )}
      </div>
    </div>
  );

  return ctaHref ? <Link href={ctaHref} className="block">{inner}</Link> : inner;
}
