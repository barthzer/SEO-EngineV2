/**
 * Queries Actions (opportunités) — STUB de référence (handoff back).
 * Voir HANDOFF.md §1 et §6. Fallback mock sans DATABASE_URL. Contrat = `Opportunity`.
 */

import "server-only";
import { OPPORTUNITIES, type Opportunity } from "@/data/actions";

export async function getActions(domain: string): Promise<Opportunity[]> {
  void domain; // ← filtre projet dans la vraie requête (à retirer une fois câblé)
  if (!process.env.DATABASE_URL) return OPPORTUNITIES;
  try {
    // TODO(back) : requête Drizzle (table actions/opportunites) → map vers Opportunity.
    return OPPORTUNITIES; // ← remplacer par la vraie requête
  } catch {
    return OPPORTUNITIES; // fallback mock
  }
}
