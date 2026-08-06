/**
 * Queries Positions (rank tracking) — STUB de référence (handoff back).
 * Voir HANDOFF.md §1 et §6. Fallback mock sans DATABASE_URL. Contrat = `TrackedKw`.
 */

import "server-only";
import { INITIAL_KWS, type TrackedKw } from "@/data/positions";

export async function getTrackedKeywords(domain: string): Promise<TrackedKw[]> {
  void domain;
  if (!process.env.DATABASE_URL) return INITIAL_KWS;
  try {
    // TODO(back) : mots-clés suivis + historique de position (rank tracker).
    return INITIAL_KWS;
  } catch { return INITIAL_KWS; }
}
