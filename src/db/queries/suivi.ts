/**
 * Queries Suivi (historique des actions livrées) — STUB de référence (handoff back).
 * Voir HANDOFF.md §1 et §6. Fallback mock sans DATABASE_URL. Contrat = `HistoryAction`.
 */

import "server-only";
import { ACTIONS, type HistoryAction } from "@/data/suivi";

export async function getHistory(domain: string): Promise<HistoryAction[]> {
  void domain; // ← filtre projet dans la vraie requête (à retirer une fois câblé)
  if (!process.env.DATABASE_URL) return ACTIONS;
  try {
    // TODO(back) : requête Drizzle (table actions livrées) → map vers HistoryAction.
    return ACTIONS; // ← remplacer par la vraie requête
  } catch {
    return ACTIONS; // fallback mock
  }
}
