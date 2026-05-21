"use client";

import type { ElementType, ReactNode } from "react";
import { DeltaBadge } from "@/components/DeltaBadge";
import { Sparkline } from "@/components/Sparkline";

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
  /** Mini trend visualisation à droite — affichée seulement si ≥ 3 points */
  trend?: number[];
  /** Couleur du trend (défaut : accent brand) */
  trendColor?: string;
  /** Labels (dates) par point — affichés dans le tooltip de hover */
  trendLabels?: string[];
  /** Formatter pour la valeur affichée dans le tooltip (défaut : fr-FR) */
  trendFormatValue?: (v: number) => string;
  /** Quand true, retire border/bg/rounded — pour usage à l'intérieur d'un KpiGroup */
  bare?: boolean;
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
  trend,
  trendColor = "var(--accent-primary)",
  trendLabels,
  trendFormatValue,
  bare = false,
  className = "",
}: KpiCardProps) {
  const showTrend = trend && trend.length >= 3;
  const wrapperBase = bare
    ? "flex items-stretch gap-3 p-5"
    : "flex items-stretch gap-3 rounded-2xl bg-[var(--bg-card)] p-5";
  return (
    <div className={`${wrapperBase} ${className}`}>
      <div className="flex flex-1 min-w-0 flex-col">
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
      {showTrend && (
        <div className="flex flex-shrink-0 items-center">
          <Sparkline
            data={trend}
            color={trendColor}
            area
            interactive
            labels={trendLabels}
            formatValue={trendFormatValue}
            width={80}
            height={32}
            strokeWidth={1.5}
          />
        </div>
      )}
    </div>
  );
}
