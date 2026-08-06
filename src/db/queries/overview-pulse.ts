/**
 * Queries Vue d'ensemble projet (alertes + quick-wins) — STUB (handoff back).
 * Voir HANDOFF.md §1 et §6. Fallback mock sans DATABASE_URL.
 * NB : `Alert.icon` est un choix UI — côté back, exposer plutôt un `type`.
 */

import "server-only";
import { ALERTS, QUICK_WINS, type Alert, type QuickWin } from "@/data/overview-pulse";

export async function getProjectAlerts(domain: string): Promise<Alert[]> {
  void domain;
  if (!process.env.DATABASE_URL) return ALERTS;
  try { return ALERTS; } catch { return ALERTS; }
}

export async function getProjectQuickWins(domain: string): Promise<QuickWin[]> {
  void domain;
  if (!process.env.DATABASE_URL) return QUICK_WINS;
  try { return QUICK_WINS; } catch { return QUICK_WINS; }
}
