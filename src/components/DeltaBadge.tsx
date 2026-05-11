"use client";

import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";

interface DeltaBadgeProps {
  value: number | string;
  positiveIsGood?: boolean;
  /** Show the up/down arrow icon when value is non-zero (default: true) */
  showIcon?: boolean;
  className?: string;
}

export function DeltaBadge({ value, positiveIsGood = true, showIcon = true, className = "" }: DeltaBadgeProps) {
  // Normalize unicode minus / en-dash and French decimal comma for parsing
  const cleaned = typeof value === "string" ? value.replace(/[−–]/g, "-").replace(/,/g, ".") : String(value);
  const num = parseFloat(cleaned);
  const isPositive = num > 0;
  const isNeutral = num === 0 || Number.isNaN(num);

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
  const Icon = isNeutral ? null : isPositive ? ArrowUpIcon : ArrowDownIcon;

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-[12px] font-semibold tabular-nums ${className}`}
      style={{ color, backgroundColor: bg }}
    >
      {showIcon && Icon && <Icon className="h-3 w-3 flex-shrink-0" strokeWidth={2.5} />}
      {display}
    </span>
  );
}
