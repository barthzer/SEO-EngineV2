/**
 * Queries Home cockpit (alertes + quick-wins cross-projet) — STUB (handoff back).
 * Voir HANDOFF.md §1 et §6. Fallback mock sans DATABASE_URL.
 * Note : `AlertItem.icon` (composant) est un choix UI — côté back, exposer un `type`.
 */

import "server-only";
import { ALERTS, QUICK_WINS, type AlertItem, type QuickWin } from "@/data/home-cockpit";

export async function getCockpitAlerts(): Promise<AlertItem[]> {
  if (!process.env.DATABASE_URL) return ALERTS;
  try {
    // TODO(back) : requête Drizzle (alertes) → map vers AlertItem (icône dérivée du type côté UI).
    return ALERTS;
  } catch {
    return ALERTS;
  }
}

export async function getQuickWins(): Promise<QuickWin[]> {
  if (!process.env.DATABASE_URL) return QUICK_WINS;
  try {
    // TODO(back) : requête Drizzle (quick-wins) → map vers QuickWin.
    return QUICK_WINS;
  } catch {
    return QUICK_WINS;
  }
}
