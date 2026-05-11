"use client";

import type { ElementType, ReactNode } from "react";
import { DeltaBadge } from "@/components/DeltaBadge";

interface KpiCardProps {
  label: string;
  value: ReactNode;
  /** Delta indicator shown as a DeltaBadge to the right of the value (e.g. "+8,4%") */
  delta?: string | number;
  /** When true (default), positive delta renders green */
  deltaPositiveIsGood?: boolean;
  /** Subtext shown below in muted tone (context, threshold, comparison reference, etc.) */
  sub?: ReactNode;
  valueColor?: string;
  icon?: ElementType;
  className?: string;
}

export function KpiCard({
  label,
  value,
  delta,
  deltaPositiveIsGood = true,
  sub,
  valueColor,
  icon: Icon,
  className = "",
}: KpiCardProps) {
  return (
    <div className={`flex flex-col rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-5 ${className}`}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5 flex-shrink-0 text-[var(--text-secondary)]" />}
        <p className="text-[14px] font-medium tracking-body text-[var(--text-primary)]">{label}</p>
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <p className="text-[20px] font-semibold tabular-nums tracking-heading leading-none"
          style={{ color: valueColor ?? "var(--text-primary)" }}>
          {value}
        </p>
        {delta !== undefined && (
          <DeltaBadge value={delta} positiveIsGood={deltaPositiveIsGood} />
        )}
      </div>
      {sub && (
        <p className="mt-2 text-[12px] tracking-caption text-[var(--text-muted)]">{sub}</p>
      )}
    </div>
  );
}
