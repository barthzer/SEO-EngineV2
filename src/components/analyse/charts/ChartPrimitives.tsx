export function ChartBar({ label, color = "var(--accent-primary)" }: { label: string; color?: string }) {
  const bars = [42, 55, 48, 67, 74, 62, 81, 77, 85, 91, 79, 96];
  return (
    <div className="rounded-2xl bg-[var(--bg-card)] p-5">
      <p className="mb-4 text-[12px] font-medium text-[var(--text-muted)]">{label}</p>
      <div className="flex h-32 items-end gap-1.5">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, backgroundColor: color, opacity: 0.15 + (h / 96) * 0.6 }} />
        ))}
      </div>
      <div className="mt-3 flex justify-between text-[11px] text-[var(--text-muted)]">
        <span>Avr.</span><span>Mai</span><span>Juin</span>
      </div>
    </div>
  );
}

export function InsightList({ items, color = "var(--accent-primary)" }: { items: string[]; color?: string }) {
  return (
    <div className="rounded-2xl bg-[var(--bg-card)] p-5">
      <p className="mb-3 text-[12px] font-medium text-[var(--text-muted)]">Insights clés</p>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-[13px] text-[var(--text-secondary)]">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: color }} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
