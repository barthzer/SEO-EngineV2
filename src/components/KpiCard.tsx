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
  /** Quand true, retire border/bg/rounded — pour usage à l'intérieur d'un KpiGroup */
  bare?: boolean;
  className?: string;
  /** @deprecated le variant trend a été retiré du composant — les props sont
   *  conservées pour compat callsite mais ignorées. */
  trend?: number[];
  trendColor?: string;
  trendLabels?: string[];
  trendFormatValue?: (v: number) => string;
}

export function KpiCard({
  label,
  value,
  delta,
  deltaPositiveIsGood = true,
  sub,
  valueColor,
  icon: Icon,
  bare = false,
  className = "",
}: KpiCardProps) {
  const wrapperBase = bare
    ? "flex flex-col gap-1.5 px-5 py-8"
    : "flex flex-col gap-1.5 rounded-2xl bg-[var(--bg-card-static)] px-5 py-8";
  return (
    <div className={`${wrapperBase} ${className}`}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5 flex-shrink-0 text-[var(--text-secondary)]" />}
        {/* Titre 16px, gris doux via light-dark() formula */}
        <p
          className="text-[16px] font-medium tracking-body"
          style={{
            color:
              "light-dark(color(srgb 0.05 0.05 0.05 / 0.5), var(--text-muted))",
          }}
        >
          {label}
        </p>
      </div>
      <div className="flex items-baseline gap-2">
        {/* Chiffre clé 24px */}
        <p
          className="text-[24px] font-semibold tabular-nums tracking-heading leading-none"
          style={{ color: valueColor ?? "var(--text-primary)" }}
        >
          {value}
        </p>
        {delta !== undefined && (
          <DeltaBadge value={delta} positiveIsGood={deltaPositiveIsGood} />
        )}
      </div>
      {sub && (
        <p className="text-[12px] tracking-caption text-[var(--text-muted)]">{sub}</p>
      )}
    </div>
  );
}
