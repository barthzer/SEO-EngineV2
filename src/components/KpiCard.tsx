"use client";

import type { ElementType, ReactNode } from "react";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from "@heroicons/react/24/outline";

interface KpiCardProps {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  valueColor?: string;
  trend?: "up" | "down" | "neutral";
  icon?: ElementType;
  className?: string;
}

export function KpiCard({ label, value, sub, valueColor, trend, icon: Icon, className = "" }: KpiCardProps) {
  const TrendIcon = trend === "up" ? ArrowUpIcon : trend === "down" ? ArrowDownIcon : trend === "neutral" ? MinusIcon : null;
  const trendColor = trend === "up" ? "#10B981" : trend === "down" ? "#E11D48" : "var(--text-muted)";

  return (
    <div className={`flex flex-col rounded-2xl border border-[var(--border-subtle)] p-5 ${className}`}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5 flex-shrink-0 text-[var(--text-secondary)]" />}
        <p className="text-[14px] font-medium tracking-body text-[var(--text-primary)]">{label}</p>
      </div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <p className="text-[26px] font-semibold tabular-nums tracking-heading leading-none"
          style={{ color: valueColor ?? "var(--text-primary)" }}>
          {value}
        </p>
      </div>
      {(sub || TrendIcon) && (
        <div className="mt-2 flex items-center gap-1" style={{ color: trend ? trendColor : "var(--text-muted)" }}>
          {TrendIcon && <TrendIcon className="h-3 w-3 flex-shrink-0" />}
          {sub && <span className="text-[12px]">{sub}</span>}
        </div>
      )}
    </div>
  );
}
