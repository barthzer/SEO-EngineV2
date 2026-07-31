export function ChartBar({ label, color = "var(--accent-primary)" }: { label: string; color?: string }) {
  const bars = [42, 55, 48, 67, 74, 62, 81, 77, 85, 91, 79, 96];
  return (
    <div className="rounded-2xl bg-[var(--bg-card)] p-5">
      <p className="mb-4 type-caption font-medium">{label}</p>
      <div className="flex h-32 items-end gap-1.5">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, backgroundColor: color, opacity: 0.15 + (h / 96) * 0.6 }} />
        ))}
      </div>
      <div className="mt-3 flex justify-between type-micro">
        <span>Avr.</span><span>Mai</span><span>Juin</span>
      </div>
    </div>
  );
}

import type { ComponentType, SVGProps } from "react";
import {
  LightBulbIcon,
  BoltIcon,
  LinkIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

type IconCmp = ComponentType<SVGProps<SVGSVGElement>>;
export type Insight = { text: string; icon?: IconCmp; color?: string };

/** Chaque insight reçoit une icône distincte, mais une teinte bleue commune. */
const INSIGHT_ICONS: IconCmp[] = [LightBulbIcon, ArrowTrendingUpIcon, LinkIcon, SparklesIcon, BoltIcon, Cog6ToothIcon, MagnifyingGlassIcon, ClockIcon];
const INSIGHT_TINT = "var(--accent-primary)";

/** Insights clés — grille de cards, chacune avec une icône spécifique. */
export function InsightList({ items, title = "Insights clés" }: { items: (string | Insight)[]; color?: string; title?: string }) {
  const insights: Insight[] = items.map((it) => (typeof it === "string" ? { text: it } : it));
  return (
    <div>
      <p className="mb-3 type-title">{title}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {insights.map((item, i) => {
          const Icon = item.icon ?? INSIGHT_ICONS[i % INSIGHT_ICONS.length];
          const color = item.color ?? INSIGHT_TINT;
          return (
            <div key={item.text} className="flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] p-4">
              <span
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)`, color }}
              >
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <p className="type-body-strong leading-snug">{item.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
