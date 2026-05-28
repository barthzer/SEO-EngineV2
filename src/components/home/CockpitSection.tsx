"use client";

/**
 * HomeCockpit — la home (v3).
 *
 * Layout :
 *  ┌──────────────────────────────────────┬───────────────────────┐
 *  │  Liste "Vos projets" en ROWS         │  Qui brûle (sticky)   │
 *  │  (style activity feed, pas cards)    │                       │
 *  │                                      │  Quick-wins (sticky)  │
 *  └──────────────────────────────────────┴───────────────────────┘
 *
 *  - Pas de KPIs, pas de date, pas de résumé en haut.
 *  - Pas d'icône sur les titres de section.
 *  - Bg primary du DS (cool warm-tinted).
 *  - Inspiration UX : activity list Gamma (séparateurs fins, pas de borders per-row).
 */

import Link from "next/link";
import { useState, type ElementType } from "react";
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  NoSymbolIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import { GlobeIcon } from "lucide-react";
import { ScoreGauges } from "@/components/ScoreGauges";
import { IconBadge } from "@/components/IconBadge";
import { VariationPill } from "@/components/VariationPill";

/* ─────────────────────────────────────────────────────────────────────
   TYPES — ré-export du shape Analysis pour les consumers
   ───────────────────────────────────────────────────────────────────── */

export type AnalysisRow = {
  id: number;
  domain: string;
  updatedAt: string;
  gscConnected: boolean;
  scoreTechnique: number;
  scoreContenu: number;
  scoreNetlinking: number;
  trafic: string;
  traficDir: "up" | "down" | "neutral";
  tagsActifs: number;
  briefs: number;
  status: "actif" | "archive";
};

/* ─────────────────────────────────────────────────────────────────────
   MOCK SIDEBAR — Qui brûle + Quick-wins
   ───────────────────────────────────────────────────────────────────── */

type Owner = { id: string; name: string; photoSeed: string; initials: string };

const OWNERS: Record<string, Owner> = {
  BL: { id: "bl", name: "Barthélemy L.", photoSeed: "barthelemy-l-seo", initials: "BL" },
  SM: { id: "sm", name: "Sophie M.",     photoSeed: "5",     initials: "SM" },
  TL: { id: "tl", name: "Thomas L.",     photoSeed: "thomas-l-seo",     initials: "TL" },
  MP: { id: "mp", name: "Marie P.",      photoSeed: "marie-p-seo",      initials: "MP" },
};

type AlertItem = {
  id: string;
  domain: string;
  severity: "critical" | "warning";
  title: string;
  detail: string;
  owner: Owner;
  /** Icône symbolique du type d'alerte (à la place du dot couleur). */
  icon: ElementType;
  /** Variation affichée dans la pill à droite. Direction + label court ; le `detail` part en tooltip. */
  variation: { direction: "up" | "down"; label: string };
};

const ALERTS: AlertItem[] = [
  { id: "a1", domain: "doctolib.fr", severity: "critical", title: "Chute trafic /rendez-vous", detail: "−18,4 % sur 7 jours · 3 142 clics perdus", owner: OWNERS.BL, icon: ArrowTrendingDownIcon, variation: { direction: "down", label: "18,4 %" } },
  { id: "a2", domain: "kiabi.com",   severity: "critical", title: "12 pages désindexées",      detail: "Catégories femme désindexées ce matin",   owner: OWNERS.SM, icon: NoSymbolIcon,          variation: { direction: "down", label: "12 pages" } },
  { id: "a3", domain: "sephora.fr",  severity: "warning",  title: "Concurrent gagne 47 RD",    detail: "marionnaud.fr · fort momentum backlinks",  owner: OWNERS.SM, icon: LinkIcon,               variation: { direction: "down", label: "47 RD" } },
  { id: "a4", domain: "veepee.fr",   severity: "warning",  title: "Position « ventes privées »", detail: "8 → 14 · kw money · 24 800 vol/mois",     owner: OWNERS.BL, icon: ArrowTrendingDownIcon, variation: { direction: "down", label: "6 pos." } },
];

type QuickWin = {
  id: string;
  domain: string;
  keyword: string;
  volume: number;
  currentPos: number;
  estimatedGainClicks: number;
};

const QUICK_WINS: QuickWin[] = [
  { id: "q1", domain: "leboncoin.fr", keyword: "location paris 75",        volume: 14_800, currentPos: 6,  estimatedGainClicks: 1_847 },
  { id: "q2", domain: "decathlon.fr", keyword: "chaussures running homme", volume: 9_300,  currentPos: 8,  estimatedGainClicks: 1_120 },
  { id: "q3", domain: "blablacar.fr", keyword: "covoiturage lyon marseille", volume: 6_400, currentPos: 5, estimatedGainClicks: 892 },
  { id: "q4", domain: "mano-mano.fr", keyword: "lave vaisselle encastrable", volume: 12_100, currentPos: 11, estimatedGainClicks: 643 },
];

/* ─────────────────────────────────────────────────────────────────────
   PRIMITIVES
   ───────────────────────────────────────────────────────────────────── */

const REFERENCE_NOW = new Date("2026-05-06").getTime();
function relativeTime(iso: string): string {
  const days = Math.floor((REFERENCE_NOW - new Date(iso).getTime()) / 86_400_000);
  if (days < 1) return "Aujourd'hui";
  if (days === 1) return "Il y a 1 j";
  if (days < 30) return `Il y a ${days} j`;
  const months = Math.floor(days / 30);
  return months === 1 ? "Il y a 1 mois" : `Il y a ${months} mois`;
}

function Favicon({ domain, size = 40 }: { domain: string; size?: number }) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <div
        className="flex flex-shrink-0 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
        style={{ width: size, height: size }}
      >
        <GlobeIcon className="h-4 w-4 text-[var(--text-muted)]" />
      </div>
    );
  }
  return (
    <div
      // bg-subtle (gris légèrement plus foncé que la page) → contraste suffisant
      // quand le favicon est blanc ou très clair, sans border.
      className="flex flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[var(--bg-subtle)]"
      style={{ width: size, height: size }}
    >
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
        alt=""
        width={size * 0.55}
        height={size * 0.55}
        onError={() => setErrored(true)}
        className="object-contain"
      />
    </div>
  );
}

function TraficChip({ value, dir }: { value: string; dir: AnalysisRow["traficDir"] }) {
  return (
    <VariationPill direction={dir === "neutral" ? "neutral" : dir}>
      {value}
    </VariationPill>
  );
}

// StatusPillStatic retiré : la colonne actif/archive faisait doublon avec
// le FilterTabs en haut de la vue (on n'affiche que les projets du filtre actif).

/* ─────────────────────────────────────────────────────────────────────
   PROJECT CARD — chaque projet est sa propre card séparée
   ───────────────────────────────────────────────────────────────────── */

function ProjectCard({ a }: { a: AnalysisRow }) {
  return (
    <Link
      href={`/analyse/${encodeURIComponent(a.domain)}`}
      className="group flex items-center gap-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 transition-colors duration-150 hover:border-[var(--border-medium)] hover:bg-[var(--bg-card-hover)]"
    >
      <Favicon domain={a.domain} size={44} />

      {/* Domain + meta */}
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="min-w-0 truncate text-[15px] font-semibold leading-none tracking-tight text-[var(--text-primary)]">
            {a.domain}
          </p>
          <TraficChip value={a.trafic} dir={a.traficDir} />
        </div>
        <p className="mt-1.5 truncate text-[12px] text-[var(--text-muted)]">
          Mis à jour {relativeTime(a.updatedAt).toLowerCase()}
          {a.gscConnected && <span className="ml-2 text-[var(--color-success)]">· GSC</span>}
        </p>
      </div>

      <ScoreGauges
        technique={a.scoreTechnique}
        contenu={a.scoreContenu}
        netlinking={a.scoreNetlinking}
        height={24}
      />

      <div className="flex items-center gap-5 text-right">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
            Lots
          </p>
          <p className="mt-0.5 text-[15px] font-semibold tabular-nums text-[var(--text-primary)]">
            {a.tagsActifs}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
            URLs
          </p>
          <p className="mt-0.5 text-[15px] font-semibold tabular-nums text-[var(--text-primary)]">
            {a.briefs}
          </p>
        </div>
      </div>

    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   SIDEBAR ROWS
   ───────────────────────────────────────────────────────────────────── */

function AlertRow({ alert: a }: { alert: AlertItem }) {
  return (
    <Link
      href={`/analyse/${encodeURIComponent(a.domain)}`}
      className="group flex items-start gap-2.5 rounded-xl px-2.5 py-2.5 transition-[background-color] duration-150 hover:bg-[var(--bg-card-hover)]"
    >
      <IconBadge icon={a.icon} size="sm" outline />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-medium text-[var(--text-muted)]">{a.domain}</p>
        <p className="mt-0.5 text-[13px] font-semibold leading-snug text-[var(--text-primary)]">
          {a.title}
        </p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--text-secondary)]">{a.detail}</p>
      </div>
      <VariationPill direction={a.variation.direction} tooltip={a.detail} className="flex-shrink-0">
        {a.variation.label}
      </VariationPill>
    </Link>
  );
}

function QuickWinRow({ qw }: { qw: QuickWin }) {
  return (
    <Link
      href={`/analyse/${encodeURIComponent(qw.domain)}`}
      className="group flex items-start gap-2.5 rounded-xl px-2.5 py-2.5 transition-[background-color] duration-150 hover:bg-[var(--bg-card-hover)]"
    >
      <IconBadge icon={ArrowTrendingUpIcon} size="sm" outline />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-medium text-[var(--text-muted)]">{qw.domain}</p>
        <p className="mt-0.5 truncate text-[13px] font-semibold leading-snug text-[var(--text-primary)]">
          « {qw.keyword} »
        </p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--text-secondary)]">
          Pos.{" "}
          <span className="font-semibold tabular-nums text-[var(--text-primary)]">{qw.currentPos}</span>
          {" · "}
          <span className="font-semibold tabular-nums text-[var(--text-primary)]">
            {qw.volume.toLocaleString("fr-FR")}
          </span>
          {" /mois"}
        </p>
      </div>
      <VariationPill
        direction="up"
        tooltip={`+${qw.estimatedGainClicks.toLocaleString("fr-FR")} clics potentiels si passage en top 3`}
        className="flex-shrink-0"
      >
        +{qw.estimatedGainClicks.toLocaleString("fr-FR")}
      </VariationPill>
    </Link>
  );
}

function SidebarBlock({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3">
      <div className="mb-1.5 flex items-center justify-between px-1.5">
        <h3 className="text-[13px] font-semibold tracking-tight text-[var(--text-primary)]">{title}</h3>
        <span className="text-[11px] font-medium tabular-nums text-[var(--text-muted)]">{count}</span>
      </div>
      <div className="flex flex-col">{children}</div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   COCKPIT — Page section
   ───────────────────────────────────────────────────────────────────── */

export function CockpitSection({ analyses }: { analyses: AnalysisRow[] }) {
  return (
    // Scroll page-level : la grille n'est plus contrainte en hauteur. Le scroll
    // se passe au niveau du conteneur AppShell. Le `<aside>` droite est `sticky`
    // → reste visible à l'écran pendant que la liste gauche défile.
    <div
      className="grid items-start gap-12 pb-[var(--page-py)]"
      style={{ gridTemplateColumns: "minmax(0, 1fr) 320px" }}
    >
      {/* ─── LEFT : liste — pas d'overflow interne, scroll page-level ─── */}
      <section>
        {analyses.length === 0 ? (
          <div className="rounded-3xl border border-[var(--border-subtle)] px-6 py-16 text-center text-[14px] text-[var(--text-muted)]">
            Aucun projet à afficher.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {analyses.map((a) => (
              <ProjectCard key={a.id} a={a} />
            ))}
          </div>
        )}
      </section>

      {/* ─── RIGHT : sidebar STICKY top — reste à l'écran pendant que la liste défile.
            max-h calé sur 100vh - une marge pour le padding haut de l'app shell ;
            overflow-y-auto en sécurité si le contenu dépasse. ─── */}
      <aside
        className="sticky top-6 flex max-h-[calc(100vh-3rem)] flex-col gap-4 overflow-y-auto"
      >
        <SidebarBlock title="Alertes" count={ALERTS.length}>
          {ALERTS.map((a) => (
            <AlertRow key={a.id} alert={a} />
          ))}
        </SidebarBlock>

        <SidebarBlock title="Opportunités" count={QUICK_WINS.length}>
          {QUICK_WINS.map((q) => (
            <QuickWinRow key={q.id} qw={q} />
          ))}
        </SidebarBlock>
      </aside>
    </div>
  );
}
