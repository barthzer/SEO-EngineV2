import { Fragment } from "react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

export function ForecastTimeline() {
  const steps = [
    { month: "M+1", action: "Optimisation technique",       gain: "+5 %",  color: "var(--color-danger)" },
    { month: "M+2", action: "Analyses Bloc 01 publiées",    gain: "+12 %", color: "var(--color-warning)" },
    { month: "M+3", action: "Maillage interne déployé",     gain: "+22 %", color: "var(--color-success)" },
    { month: "M+6", action: "Plan complet exécuté",         gain: "+38 %", color: "var(--accent-primary)" },
  ];
  return (
    <section className="rounded-2xl border border-[var(--border-subtle)] p-6">
      <div className="mb-5 flex items-baseline justify-between gap-3">
        <p className="type-title">Projection d&apos;exécution</p>
        <span className="type-caption">gain de trafic cumulé</span>
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
        {steps.map((s, i) => (
          <Fragment key={s.month}>
            <div className="flex flex-1 flex-col gap-3 rounded-xl border border-[var(--border-subtle)] p-4">
              <span
                className="inline-flex w-fit items-center rounded-md px-2 py-0.5 type-micro font-semibold tabular-nums"
                style={{ backgroundColor: `color-mix(in oklab, ${s.color} 14%, transparent)`, color: `color-mix(in oklab, ${s.color} 82%, var(--text-primary))` }}
              >{s.month}</span>
              <p className="type-body-sm leading-snug">{s.action}</p>
              <p className="type-h1 leading-none">{s.gain}</p>
            </div>
            {/* Séparateur : chevron centré entre les cards (masqué en mobile) */}
            {i < steps.length - 1 && (
              <div className="hidden flex-shrink-0 items-center justify-center text-[var(--text-muted)] lg:flex">
                <ChevronRightIcon className="h-5 w-5" />
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
