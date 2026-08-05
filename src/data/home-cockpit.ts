/**
 * Home cockpit — sidebar « Qui brûle » (alertes) + « Quick-wins » (cross-projet).
 *
 * Sorti de `src/components/home/CockpitSection.tsx` pour le handoff back
 * (voir HANDOFF.md). Contrats = `AlertItem`, `QuickWin`.
 * Note : `AlertItem.icon` porte un composant d'icône (dérivé du type d'alerte) —
 * côté back, exposer plutôt un `type` et laisser l'UI choisir l'icône.
 */

import type { ElementType } from "react";
import { ArrowTrendingDownIcon, NoSymbolIcon, LinkIcon } from "@heroicons/react/24/outline";

export type Owner = { id: string; name: string; photoSeed: string; initials: string };

export const OWNERS: Record<string, Owner> = {
  BL: { id: "bl", name: "Barthélemy L.", photoSeed: "barthelemy-l-seo", initials: "BL" },
  SM: { id: "sm", name: "Sophie M.",     photoSeed: "5",     initials: "SM" },
  TL: { id: "tl", name: "Thomas L.",     photoSeed: "thomas-l-seo",     initials: "TL" },
  MP: { id: "mp", name: "Marie P.",      photoSeed: "marie-p-seo",      initials: "MP" },
};

export type AlertItem = {
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

export const ALERTS: AlertItem[] = [
  { id: "a1", domain: "doctolib.fr", severity: "critical", title: "Chute trafic /rendez-vous", detail: "−18,4 % sur 7 jours · 3 142 clics perdus", owner: OWNERS.BL, icon: ArrowTrendingDownIcon, variation: { direction: "down", label: "18,4 %" } },
  { id: "a2", domain: "kiabi.com",   severity: "critical", title: "12 pages désindexées",      detail: "Catégories femme désindexées ce matin",   owner: OWNERS.SM, icon: NoSymbolIcon,          variation: { direction: "down", label: "12 pages" } },
  { id: "a3", domain: "sephora.fr",  severity: "warning",  title: "Concurrent gagne 47 RD",    detail: "marionnaud.fr · fort momentum backlinks",  owner: OWNERS.SM, icon: LinkIcon,               variation: { direction: "down", label: "47 RD" } },
  { id: "a4", domain: "veepee.fr",   severity: "warning",  title: "Position « ventes privées »", detail: "8 → 14 · kw money · 24 800 vol/mois",     owner: OWNERS.BL, icon: ArrowTrendingDownIcon, variation: { direction: "down", label: "6 pos." } },
];

export type QuickWin = {
  id: string;
  domain: string;
  keyword: string;
  volume: number;
  currentPos: number;
  estimatedGainClicks: number;
};

export const QUICK_WINS: QuickWin[] = [
  { id: "q1", domain: "leboncoin.fr", keyword: "location paris 75",        volume: 14_800, currentPos: 6,  estimatedGainClicks: 1_847 },
  { id: "q2", domain: "decathlon.fr", keyword: "chaussures running homme", volume: 9_300,  currentPos: 8,  estimatedGainClicks: 1_120 },
  { id: "q3", domain: "blablacar.fr", keyword: "covoiturage lyon marseille", volume: 6_400, currentPos: 5, estimatedGainClicks: 892 },
  { id: "q4", domain: "mano-mano.fr", keyword: "lave vaisselle encastrable", volume: 12_100, currentPos: 11, estimatedGainClicks: 643 },
];
