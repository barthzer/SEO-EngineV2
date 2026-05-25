export function ForecastTimeline() {
  const steps = [
    { month: "M+1", action: "Optimisation technique", gain: "+5 %", color: "var(--color-danger)", done: false },
    { month: "M+2", action: "Analyses Bloc 01 publiées", gain: "+12 %", color: "var(--color-warning)", done: false },
    { month: "M+3", action: "Maillage interne déployé", gain: "+22 %", color: "var(--color-success)", done: false },
    { month: "M+6", action: "Plan complet exécuté", gain: "+38 %", color: "var(--accent-primary)", done: false },
  ];
  return (
    <div className="rounded-2xl bg-[var(--bg-card)] p-5">
      <p className="mb-5 text-[12px] font-medium text-[var(--text-muted)]">Projection d'exécution</p>
      <div className="space-y-4">
        {steps.map((s) => (
          <div key={s.month} className="flex items-center gap-4">
            <span className="w-8 flex-shrink-0 text-[11px] font-medium text-[var(--text-muted)]">{s.month}</span>
            <div className="h-px flex-1 border-t border-dashed border-[var(--border-medium)]" />
            <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
              <span className="truncate text-[13px] text-[var(--text-secondary)]">{s.action}</span>
              <span className="flex-shrink-0 rounded-full px-2 py-1 text-[12px] font-semibold" style={{ color: s.color, backgroundColor: `color-mix(in oklab, ${s.color} 8%, transparent)` }}>
                {s.gain}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
