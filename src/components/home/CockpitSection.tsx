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
import { useRouter } from "next/navigation";
import { useState, type ElementType } from "react";
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  NoSymbolIcon,
  LinkIcon,
  EllipsisHorizontalIcon,
  ArrowRightCircleIcon,
  ArrowTopRightOnSquareIcon,
  Cog6ToothIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { OWNERS, ALERTS, QUICK_WINS, type Owner, type AlertItem, type QuickWin } from "@/data/home-cockpit";
import { GlobeIcon } from "lucide-react";
import { ScoreRings } from "@/components/ScoreRings";
import { IconBadge } from "@/components/IconBadge";
import { VariationPill } from "@/components/VariationPill";
import { Pill } from "@/components/Pill";
import { DropdownMenu, DropdownItem } from "@/components/DropdownMenu";

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

/** Badge « GSC connecté » — pastille verte + label, sur le composant DS Pill. */
function GscBadge({ connected }: { connected: boolean }) {
  // Rendu dans les deux états → hauteur de carte identique connecté / non connecté.
  return (
    <Pill
      color={connected ? "var(--text-secondary)" : "var(--text-muted)"}
      className="flex-shrink-0 border border-[var(--border-subtle)] px-2 py-0.5 text-[11px]"
    >
      <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-[var(--color-success)]" : "bg-[var(--text-muted)]"}`} />
      GSC
    </Pill>
  );
}

// StatusPillStatic retiré : la colonne actif/archive faisait doublon avec
// le FilterTabs en haut de la vue (on n'affiche que les projets du filtre actif).

/* ─────────────────────────────────────────────────────────────────────
   PROJECT CARD — chaque projet est sa propre card séparée
   ───────────────────────────────────────────────────────────────────── */

/** Score Visibilité IA (GEO) dérivé — mock : pondère contenu + netlinking, le
 *  GEO corrélant surtout avec la qualité éditoriale et l'autorité citée. */
function geoScoreOf(a: AnalysisRow): number {
  return Math.round((a.scoreContenu * 2 + a.scoreNetlinking) / 3);
}

/** CTA 3-points d'un projet. Rendu dans une carte-Link → stoppe la navigation. */
function ProjectMenu({
  domain,
  isFavorite,
  onToggleFavorite,
}: {
  domain: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  const router = useRouter();
  return (
    <div className="flex-shrink-0" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
      <DropdownMenu
        align="right"
        width={220}
        trigger={
          <button
            type="button"
            aria-label="Options du projet"
            className="action-nested flex h-8 w-8 items-center justify-center rounded-lg"
          >
            <EllipsisHorizontalIcon className="h-5 w-5" />
          </button>
        }
      >
        <DropdownItem icon={ArrowRightCircleIcon} onClick={() => router.push(`/analyse/${encodeURIComponent(domain)}`)}>
          Accéder au compte
        </DropdownItem>
        <DropdownItem icon={ArrowTopRightOnSquareIcon} onClick={() => window.open(`https://${domain}`, "_blank", "noopener,noreferrer")}>
          Visiter le site
        </DropdownItem>
        <DropdownItem icon={Cog6ToothIcon} onClick={() => router.push(`/analyse/${encodeURIComponent(domain)}/parametres`)}>
          Paramètres du projet
        </DropdownItem>
        <DropdownItem icon={StarIcon} onClick={onToggleFavorite}>
          {isFavorite ? "Retirer des favoris" : "Ajouter en favori"}
        </DropdownItem>
      </DropdownMenu>
    </div>
  );
}

function ProjectCard({
  a,
  isFavorite,
  onToggleFavorite,
}: {
  a: AnalysisRow;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  return (
    <Link
      href={`/analyse/${encodeURIComponent(a.domain)}`}
      className="group flex items-center gap-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 transition-colors duration-150 hover:border-[var(--border-medium)] hover:bg-[var(--bg-card-hover)]"
    >
      <Favicon domain={a.domain} size={44} />

      {/* Domain + meta */}
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          {isFavorite && <StarIconSolid className="h-3.5 w-3.5 flex-shrink-0 text-[var(--color-warning)]" />}
          <p className="min-w-0 truncate type-title leading-none">
            {a.domain}
          </p>
          <TraficChip value={a.trafic} dir={a.traficDir} />
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <p className="truncate type-caption">
            Mis à jour {relativeTime(a.updatedAt).toLowerCase()}
          </p>
          <GscBadge connected={a.gscConnected} />
        </div>
      </div>

      <ScoreRings
        technique={a.scoreTechnique}
        contenu={a.scoreContenu}
        netlinking={a.scoreNetlinking}
        geo={geoScoreOf(a)}
        size={32}
      />

      <ProjectMenu domain={a.domain} isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} />
    </Link>
  );
}

/** Variante « grille » (façon Vercel) — mêmes données que la row, en carte verticale. */
function ProjectGridCard({
  a,
  isFavorite,
  onToggleFavorite,
}: {
  a: AnalysisRow;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  return (
    <Link
      href={`/analyse/${encodeURIComponent(a.domain)}`}
      className="group flex flex-col gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 transition-colors duration-150 hover:border-[var(--border-medium)] hover:bg-[var(--bg-card-hover)]"
    >
      {/* Domain + trafic + màj — CTA 3-points ferré à droite du titre */}
      <div className="flex items-start gap-3">
        <Favicon domain={a.domain} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            {isFavorite && <StarIconSolid className="h-3.5 w-3.5 flex-shrink-0 text-[var(--color-warning)]" />}
            <p className="min-w-0 truncate type-title leading-none">
              {a.domain}
            </p>
            <TraficChip value={a.trafic} dir={a.traficDir} />
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <p className="truncate type-micro">
              Mis à jour {relativeTime(a.updatedAt).toLowerCase()}
            </p>
            <GscBadge connected={a.gscConnected} />
          </div>
        </div>
        <ProjectMenu domain={a.domain} isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} />
      </div>

      {/* Scores — ferrés à gauche, sans fond */}
      <ScoreRings
        technique={a.scoreTechnique}
        contenu={a.scoreContenu}
        netlinking={a.scoreNetlinking}
        geo={geoScoreOf(a)}
        size={34}
      />
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
      <IconBadge icon={a.icon} size="sm" color="var(--text-secondary)" bg="var(--bg-subtle)" />
      <div className="min-w-0 flex-1">
        <p className="truncate type-caption">{a.domain}</p>
        <p className="mt-0.5 type-label font-semibold leading-snug text-[var(--text-primary)]">
          {a.title}
        </p>
        <p className="mt-0.5 type-micro leading-relaxed text-[var(--text-secondary)]">{a.detail}</p>
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
      <IconBadge icon={ArrowTrendingUpIcon} size="sm" color="var(--text-secondary)" bg="var(--bg-subtle)" />
      <div className="min-w-0 flex-1">
        <p className="truncate type-caption">{qw.domain}</p>
        <p className="mt-0.5 truncate type-label font-semibold leading-snug text-[var(--text-primary)]">
          « {qw.keyword} »
        </p>
        <p className="mt-0.5 type-micro leading-relaxed text-[var(--text-secondary)]">
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
        <h3 className="type-label font-semibold text-[var(--text-primary)]">{title}</h3>
        <span className="type-micro tabular-nums">{count}</span>
      </div>
      <div className="flex flex-col">{children}</div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   COCKPIT — Page section
   ───────────────────────────────────────────────────────────────────── */

export function CockpitSection({
  analyses,
  viewMode = "list",
}: {
  analyses: AnalysisRow[];
  viewMode?: "list" | "grid";
}) {
  // Favoris (local — prototype) : les projets favoris remontent en tête de liste.
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const toggleFavorite = (id: number) =>
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  // Tri stable : favoris d'abord, ordre d'origine préservé au sein de chaque groupe.
  const ordered = [...analyses].sort(
    (a, b) => Number(favorites.has(b.id)) - Number(favorites.has(a.id))
  );

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
          <div className="rounded-2xl border border-[var(--border-subtle)] px-6 py-16 text-center type-body text-[var(--text-muted)]">
            Aucun projet à afficher.
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ordered.map((a) => (
              <ProjectGridCard key={a.id} a={a} isFavorite={favorites.has(a.id)} onToggleFavorite={() => toggleFavorite(a.id)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {ordered.map((a) => (
              <ProjectCard key={a.id} a={a} isFavorite={favorites.has(a.id)} onToggleFavorite={() => toggleFavorite(a.id)} />
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
