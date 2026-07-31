"use client";

import { VerticalBarChart } from "@/components/VerticalBarChart";

const POSITION_BARS = [
  { label: "Top 3",    value: 2  },
  { label: "4 – 10",   value: 3  },
  { label: "11 – 50",  value: 8  },
  { label: "51 – 100", value: 14 },
];

const POSITION_TOOLTIP_DETAILS: Record<string, { description: string; ctrEstime: string; recommandation: string }> = {
  "Top 3":    { description: "Première page, zone d'or",       ctrEstime: "~22–30 %", recommandation: "Maintenir et défendre les positions" },
  "4 – 10":   { description: "Première page, hors podium",     ctrEstime: "~4–9 %",   recommandation: "Pousser vers le top 3 (ROI ×3)" },
  "11 – 50":  { description: "Pages 2 à 5 — visibilité faible", ctrEstime: "~1–2 %",   recommandation: "Optimiser pour atteindre le top 10" },
  "51 – 100": { description: "Au-delà de la page 5",            ctrEstime: "<0,5 %",  recommandation: "Renforcer contenu + autorité" },
};

export function PositionBarChart() {
  return (
    <VerticalBarChart
      data={POSITION_BARS}
      color="var(--accent-primary)"
      formatValue={(v) => v.toString()}
      tooltip={(item, _i, total) => {
        const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : "0";
        const d = POSITION_TOOLTIP_DETAILS[item.label];
        return (
          <div className="flex max-w-[260px] flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3">
              <span className="type-label font-semibold text-white">{item.label}</span>
              <span className="type-micro text-white/60">{pct} % du total</span>
            </div>
            <div className="type-caption font-medium text-white">{item.value.toLocaleString("fr-FR")} mots-clés</div>
            {d && (
              <div className="mt-1 space-y-1 border-t border-white/10 pt-2 type-micro leading-snug text-white/70">
                <div>{d.description}</div>
                <div><span className="text-white/55">CTR estimé : </span>{d.ctrEstime}</div>
                <div><span className="text-white/55">→ </span>{d.recommandation}</div>
              </div>
            )}
          </div>
        );
      }}
    />
  );
}
