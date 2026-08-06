/**
 * Vue d'ensemble projet — alertes + quick-wins (encart « pulse »).
 *
 * Sorti de `src/components/analyse/OverviewPulse.tsx` pour le handoff back (HANDOFF.md).
 * Contrats = `Alert`, `QuickWin`. NB : `Alert.icon` est un choix UI — côté back,
 * exposer plutôt un `type` et laisser l'UI mapper l'icône.
 */

import type { ElementType } from "react";
import { ArrowTrendingDownIcon, NoSymbolIcon, LinkIcon } from "@heroicons/react/24/outline";

export type Alert = { id: string; title: string; detail: string; icon: ElementType; direction: "up" | "down"; label: string };
export type QuickWin = { id: string; keyword: string; volume: number; pos: number; gain: number };

export const ALERTS: Alert[] = [
  { id: "a1", title: "Chute de position « location paris »", detail: "6 → 11 · kw money · 14 800 vol/mois", icon: ArrowTrendingDownIcon, direction: "down", label: "5 pos." },
  { id: "a2", title: "12 pages désindexées", detail: "Catégories récentes sorties de l'index ce matin", icon: NoSymbolIcon, direction: "down", label: "12 pages" },
  { id: "a3", title: "Concurrent gagne 34 RD", detail: "seloger.com · fort momentum backlinks", icon: LinkIcon, direction: "down", label: "34 RD" },
  { id: "a4", title: "Baisse de trafic /voiture", detail: "−22 % sur 7 jours · 4 100 clics perdus", icon: ArrowTrendingDownIcon, direction: "down", label: "22 %" },
  { id: "a5", title: "LCP dégradé sur mobile", detail: "3,8 s · au-delà du seuil Core Web Vitals", icon: NoSymbolIcon, direction: "down", label: "3,8 s" },
  { id: "a6", title: "Recul « immobilier neuf »", detail: "4 → 9 · SERP volatile depuis la mise à jour", icon: ArrowTrendingDownIcon, direction: "down", label: "5 pos." },
  { id: "a7", title: "Backlinks toxiques détectés", detail: "18 nouveaux liens spam · disavow recommandé", icon: LinkIcon, direction: "down", label: "18 liens" },
];

export const QUICK_WINS: QuickWin[] = [
  { id: "q1", keyword: "location paris 75", volume: 14_800, pos: 6, gain: 1_847 },
  { id: "q2", keyword: "appartement à louer", volume: 9_300, pos: 8, gain: 1_120 },
  { id: "q3", keyword: "studio meublé paris", volume: 6_400, pos: 5, gain: 892 },
  { id: "q4", keyword: "voiture occasion pas cher", volume: 22_100, pos: 7, gain: 2_340 },
  { id: "q5", keyword: "location vacances bord de mer", volume: 12_400, pos: 9, gain: 1_510 },
  { id: "q6", keyword: "emploi paris cdi", volume: 8_800, pos: 6, gain: 1_070 },
  { id: "q7", keyword: "meuble d'occasion", volume: 5_200, pos: 5, gain: 760 },
];
