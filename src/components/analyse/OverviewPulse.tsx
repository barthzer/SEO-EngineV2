"use client";

/**
 * OverviewPulse — blocs « Alertes » + « Opportunités » du projet, repris de la vue
 * Projets mais scopés au domaine courant. Affiché sur la Vue d'ensemble, au-dessus
 * des actions à mener.
 */

import type { ElementType } from "react";
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  NoSymbolIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import { IconBadge } from "@/components/IconBadge";
import { VariationPill } from "@/components/VariationPill";

type Alert = { id: string; title: string; detail: string; icon: ElementType; direction: "up" | "down"; label: string };
type QuickWin = { id: string; keyword: string; volume: number; pos: number; gain: number };

const ALERTS: Alert[] = [
  { id: "a1", title: "Chute de position « location paris »", detail: "6 → 11 · kw money · 14 800 vol/mois", icon: ArrowTrendingDownIcon, direction: "down", label: "5 pos." },
  { id: "a2", title: "12 pages désindexées", detail: "Catégories récentes sorties de l'index ce matin", icon: NoSymbolIcon, direction: "down", label: "12 pages" },
  { id: "a3", title: "Concurrent gagne 34 RD", detail: "seloger.com · fort momentum backlinks", icon: LinkIcon, direction: "down", label: "34 RD" },
  { id: "a4", title: "Baisse de trafic /voiture", detail: "−22 % sur 7 jours · 4 100 clics perdus", icon: ArrowTrendingDownIcon, direction: "down", label: "22 %" },
  { id: "a5", title: "LCP dégradé sur mobile", detail: "3,8 s · au-delà du seuil Core Web Vitals", icon: NoSymbolIcon, direction: "down", label: "3,8 s" },
  { id: "a6", title: "Recul « immobilier neuf »", detail: "4 → 9 · SERP volatile depuis la mise à jour", icon: ArrowTrendingDownIcon, direction: "down", label: "5 pos." },
  { id: "a7", title: "Backlinks toxiques détectés", detail: "18 nouveaux liens spam · disavow recommandé", icon: LinkIcon, direction: "down", label: "18 liens" },
];

const QUICK_WINS: QuickWin[] = [
  { id: "q1", keyword: "location paris 75", volume: 14_800, pos: 6, gain: 1_847 },
  { id: "q2", keyword: "appartement à louer", volume: 9_300, pos: 8, gain: 1_120 },
  { id: "q3", keyword: "studio meublé paris", volume: 6_400, pos: 5, gain: 892 },
  { id: "q4", keyword: "voiture occasion pas cher", volume: 22_100, pos: 7, gain: 2_340 },
  { id: "q5", keyword: "location vacances bord de mer", volume: 12_400, pos: 9, gain: 1_510 },
  { id: "q6", keyword: "emploi paris cdi", volume: 8_800, pos: 6, gain: 1_070 },
  { id: "q7", keyword: "meuble d'occasion", volume: 5_200, pos: 5, gain: 760 },
];

function Block({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="flex flex-col rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3">
      {/* En-tête fixe */}
      <div className="mb-1.5 flex flex-shrink-0 items-center justify-between px-1.5">
        <h3 className="type-title">{title}</h3>
        <span className="type-micro tabular-nums">{count}</span>
      </div>
      {/* Liste scrollable (au-delà de ~3 items) — le titre reste fixe */}
      <div className="flex max-h-[248px] flex-col overflow-y-auto">{children}</div>
    </section>
  );
}

export function OverviewPulse() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Block title="Alertes" count={ALERTS.length}>
        {ALERTS.map((a) => (
          <div key={a.id} className="group flex items-start gap-2.5 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-[var(--bg-card-hover)]">
            <IconBadge icon={a.icon} size="sm" color="var(--text-secondary)" bg="var(--bg-subtle)" />
            <div className="min-w-0 flex-1">
              <p className="type-label leading-snug text-[var(--text-primary)]">{a.title}</p>
              <p className="mt-0.5 type-micro leading-relaxed text-[var(--text-secondary)]">{a.detail}</p>
            </div>
            <VariationPill direction={a.direction} className="flex-shrink-0">{a.label}</VariationPill>
          </div>
        ))}
      </Block>

      <Block title="Opportunités" count={QUICK_WINS.length}>
        {QUICK_WINS.map((q) => (
          <div key={q.id} className="group flex items-start gap-2.5 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-[var(--bg-card-hover)]">
            <IconBadge icon={ArrowTrendingUpIcon} size="sm" color="var(--text-secondary)" bg="var(--bg-subtle)" />
            <div className="min-w-0 flex-1">
              <p className="truncate type-label leading-snug text-[var(--text-primary)]">« {q.keyword} »</p>
              <p className="mt-0.5 type-micro leading-relaxed text-[var(--text-secondary)]">
                Pos. <span className="font-semibold tabular-nums text-[var(--text-primary)]">{q.pos}</span>
                {" · "}
                <span className="font-semibold tabular-nums text-[var(--text-primary)]">{q.volume.toLocaleString("fr-FR")}</span> /mois
              </p>
            </div>
            <VariationPill direction="up" tooltip={`+${q.gain.toLocaleString("fr-FR")} clics potentiels si passage en top 3`} className="flex-shrink-0">
              +{q.gain.toLocaleString("fr-FR")}
            </VariationPill>
          </div>
        ))}
      </Block>
    </div>
  );
}
