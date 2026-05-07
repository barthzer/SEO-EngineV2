"use client";

interface DeltaBadgeProps {
  value: number | string;
  positiveIsGood?: boolean;
  className?: string;
}

export function DeltaBadge({ value, positiveIsGood = true, className = "" }: DeltaBadgeProps) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  const isPositive = num > 0;
  const isNeutral = num === 0;

  let color: string;
  let bg: string;

  if (isNeutral) {
    color = "var(--text-muted)";
    bg = "var(--bg-subtle)";
  } else if (positiveIsGood ? isPositive : !isPositive) {
    color = "#10B981";
    bg = "rgba(16,185,129,0.1)";
  } else {
    color = "#E11D48";
    bg = "rgba(225,29,72,0.1)";
  }

  const display = typeof value === "string" ? value : `${isPositive ? "+" : ""}${value}`;

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-[12px] font-semibold tabular-nums ${className}`}
      style={{ color, backgroundColor: bg }}
    >
      {display}
    </span>
  );
}
