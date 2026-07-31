"use client";

/**
 * AuditHistoryList — listing complet de l'historique des audits (page dédiée).
 * Reprend le style de « Historique des analyses » (cards datées + ring + badges),
 * adapté aux données d'audit (score, grade, delta, actions réalisées).
 * Clic sur une carte → ouvre le détail de cet audit.
 */

import { ScoreRings } from "@/components/ScoreRings";
import { VariationPill } from "@/components/VariationPill";
import { Button } from "@/components/Button";
import { ChevronRightIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

export type AuditEntry = {
  date: string;
  score: number;
  grade: string;
  delta: string;
  deltaDir: "up" | "down" | "neutral";
  actionsDone: number;
  actionsTotal: number;
  /** Sous-scores de santé (aperçu par ligne) : Technique / Éditorial / Popularité / Visibilité IA. */
  tech: number;
  edito: number;
  pop: number;
  geo: number;
};

export function AuditHistoryList({
  audits,
  onOpen,
  onRelaunch,
}: {
  audits: AuditEntry[];
  onOpen: (date: string) => void;
  onRelaunch?: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <h1 className="type-h1 leading-none">Historique des audits</h1>
          <span className="rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 text-[12px] font-medium tabular-nums text-[var(--text-secondary)]">{audits.length}</span>
        </div>
        {onRelaunch && (
          <Button size="sm" variant="secondary" onClick={onRelaunch}>
            <ArrowPathIcon className="h-4 w-4" />
            Relancer un audit
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {audits.map((a, i) => (
          <button
            key={a.date}
            type="button"
            onClick={() => onOpen(a.date)}
            className="group flex w-full items-center gap-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-5 py-4 text-left transition-colors hover:bg-[var(--bg-card-hover)]"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="type-body-strong">Audit du {a.date}</span>
                {i === 0 && (
                  <span className="rounded-full border border-[var(--border-subtle)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-primary)]">Récent</span>
                )}
              </div>
              <p className="type-caption mt-1">
                Score global {a.score}/100 · grade {a.grade} · {a.actionsDone}/{a.actionsTotal} actions réalisées
              </p>
            </div>
            {/* Aperçu des 4 scores de santé (Technique / Éditorial / Popularité / Visibilité IA) */}
            <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
              <ScoreRings technique={a.tech} contenu={a.edito} netlinking={a.pop} geo={a.geo} size={30} />
            </div>
            <VariationPill direction={a.deltaDir} className="flex-shrink-0">{a.delta}</VariationPill>
            <ChevronRightIcon className="h-4 w-4 flex-shrink-0 text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        ))}
      </div>
    </div>
  );
}
