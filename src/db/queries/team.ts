/**
 * Queries Équipe — STUB de référence (handoff back). Voir HANDOFF.md §1 et §6.
 * Fallback mock tant qu'il n'y a pas de DATABASE_URL. Contrat = `Consultant`.
 */

import "server-only";
import { TEAM, type Consultant } from "@/data/team";

export async function getTeam(): Promise<Consultant[]> {
  if (!process.env.DATABASE_URL) return TEAM;
  try {
    // TODO(back) : requête Drizzle (table consultants + relations projets/meetings/alerts) → map vers Consultant.
    return TEAM; // ← remplacer par la vraie requête
  } catch {
    return TEAM; // fallback mock
  }
}
