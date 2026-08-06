"use client";

/**
 * OverviewPulse — blocs « Alertes » + « Opportunités » du projet, repris de la vue
 * Projets mais scopés au domaine courant. Affiché sur la Vue d'ensemble, au-dessus
 * des actions à mener.
 */

import { ArrowTrendingUpIcon } from "@heroicons/react/24/outline";
import { ALERTS, QUICK_WINS } from "@/data/overview-pulse";
import { IconBadge } from "@/components/IconBadge";
import { VariationPill } from "@/components/VariationPill";


function Block({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="flex flex-col rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3">
      {/* En-tête fixe */}
      <div className="mb-1.5 flex flex-shrink-0 items-center justify-between px-1.5">
        <h3 className="type-title">{title}</h3>
        <span className="type-micro tabular-nums">{count}</span>
      </div>
      {/* Liste scrollable (au-delà de ~3 items) — le titre reste fixe */}
      <div className="flex max-h-[248px] flex-col overflow-y-auto">{children}</div>
    </section>
  );
}

export function OverviewPulse() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Block title="Alertes" count={ALERTS.length}>
        {ALERTS.map((a) => (
          <div key={a.id} className="group flex items-start gap-2.5 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-[var(--bg-card-hover)]">
            <IconBadge icon={a.icon} size="sm" color="var(--text-secondary)" bg="var(--bg-subtle)" />
            <div className="min-w-0 flex-1">
              <p className="type-label leading-snug text-[var(--text-primary)]">{a.title}</p>
              <p className="mt-0.5 type-micro leading-relaxed text-[var(--text-secondary)]">{a.detail}</p>
            </div>
            <VariationPill direction={a.direction} className="flex-shrink-0">{a.label}</VariationPill>
          </div>
        ))}
      </Block>

      <Block title="Opportunités" count={QUICK_WINS.length}>
        {QUICK_WINS.map((q) => (
          <div key={q.id} className="group flex items-start gap-2.5 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-[var(--bg-card-hover)]">
            <IconBadge icon={ArrowTrendingUpIcon} size="sm" color="var(--text-secondary)" bg="var(--bg-subtle)" />
            <div className="min-w-0 flex-1">
              <p className="truncate type-label leading-snug text-[var(--text-primary)]">« {q.keyword} »</p>
              <p className="mt-0.5 type-micro leading-relaxed text-[var(--text-secondary)]">
                Pos. <span className="font-semibold tabular-nums text-[var(--text-primary)]">{q.pos}</span>
                {" · "}
                <span className="font-semibold tabular-nums text-[var(--text-primary)]">{q.volume.toLocaleString("fr-FR")}</span> /mois
              </p>
            </div>
            <VariationPill direction="up" tooltip={`+${q.gain.toLocaleString("fr-FR")} clics potentiels si passage en top 3`} className="flex-shrink-0">
              +{q.gain.toLocaleString("fr-FR")}
            </VariationPill>
          </div>
        ))}
      </Block>
    </div>
  );
}
