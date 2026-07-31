"use client";

import { AreaChart } from "@/components/AreaChart";

/**
 * Wrapper client de AreaChart pour le portail share.
 * Existe parce qu'on ne peut pas passer la prop `formatTooltip` (fonction)
 * directement depuis un Server Component à un Client Component.
 */
export function TrafficChart({
  values,
  labels,
  height,
  fillHeight = false,
}: {
  values: number[];
  labels: string[];
  height?: number;
  /** Si true : remplit la hauteur du parent (le wrapper doit être h-full). */
  fillHeight?: boolean;
}) {
  return (
    <AreaChart
      data={values.map((v, i) => ({ label: labels[i], value: v }))}
      height={height}
      fillHeight={fillHeight}
      formatTooltip={(p) => (
        <div className="flex flex-col gap-0.5">
          <span className="type-micro text-white/60">{p.label}</span>
          <span className="type-label font-semibold text-white tabular-nums">
            {p.value.toLocaleString("fr-FR")} visites
          </span>
        </div>
      )}
    />
  );
}
