"use client";

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  height?: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  color = "#3E50F5",
  height = 6,
  className = "",
  showLabel = false,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className="flex-1 overflow-hidden rounded-full bg-[var(--bg-card-hover)]"
        style={{ height }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <span className="shrink-0 font-mono text-[12px] tabular-nums text-[var(--text-secondary)]">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}
