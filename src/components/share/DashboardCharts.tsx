"use client";

/**
 * Wrappers Client de HorizontalBarChart pour le dashboard /share/[token].
 *
 * Existent parce que la prop `tooltip` (fonction) ne peut pas être passée
 * directement depuis un Server Component à un Client Component.
 */

import { HorizontalBarChart } from "@/components/HorizontalBarChart";
import type { SharedProject } from "@/data/sharedProjects";

/** Top pages — bar = monthly visits, tooltip avec delta vs mois précédent. */
export function TopPagesChart({
  pages,
}: {
  pages: SharedProject["topPages"];
}) {
  return (
    <HorizontalBarChart
      data={pages.map((p) => ({ label: p.title, value: p.monthlyVisits }))}
      labelWidth={140}
      formatValue={(v) => `${(v / 1000).toFixed(1).replace(".", ",")}k`}
      tooltip={(item, i) => {
        const p = pages[i];
        const isUp = p.monthlyDelta >= 0;
        return (
          <div className="flex flex-col gap-1">
            <span className="text-[12px] font-semibold text-white">{p.title}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-[14px] font-semibold tabular-nums text-white">
                {item.value.toLocaleString("fr-FR")}
              </span>
              <span className="text-[11px] text-white/60">visites/mois</span>
            </div>
            <span
              className="text-[11px] font-medium tabular-nums"
              style={{ color: isUp ? "var(--color-success)" : "var(--color-danger)" }}
            >
              {isUp ? "+" : ""}
              {p.monthlyDelta.toLocaleString("fr-FR")} vs mois précédent
            </span>
          </div>
        );
      }}
    />
  );
}

/** Rising keywords — bar = monthly volume, tooltip avec position avant/après. */
export function RisingKeywordsChart({
  keywords,
}: {
  keywords: SharedProject["risingKeywords"];
}) {
  return (
    <HorizontalBarChart
      data={keywords.map((k) => ({ label: `« ${k.keyword} »`, value: k.monthlyVolume }))}
      labelWidth={140}
      formatValue={(v) => `${(v / 1000).toFixed(1).replace(".", ",")}k`}
      tooltip={(item, i) => {
        const kw = keywords[i];
        const delta = kw.positionBefore - kw.positionAfter;
        return (
          <div className="flex flex-col gap-1">
            <span className="text-[12px] font-semibold text-white">« {kw.keyword} »</span>
            <div className="flex items-baseline gap-2">
              <span className="text-[14px] font-semibold tabular-nums text-white">
                {item.value.toLocaleString("fr-FR")}
              </span>
              <span className="text-[11px] text-white/60">recherches/mois</span>
            </div>
            <span className="text-[11px] font-medium tabular-nums text-[var(--color-success)]">
              Position #{kw.positionBefore} → #{kw.positionAfter} (+{delta} places)
            </span>
          </div>
        );
      }}
    />
  );
}
