/**
 * Queries URLs / Briefs — STUB de référence (handoff back).
 * Voir HANDOFF.md §1 et §6. Fallback mock sans DATABASE_URL. Contrat = `Brief`.
 */

import "server-only";
import { BRIEFS, type Brief } from "@/data/briefs";

export async function getBriefs(domain: string): Promise<Brief[]> {
  void domain;
  if (!process.env.DATABASE_URL) return BRIEFS;
  try {
    // TODO(back) : URLs du projet + métriques GSC (clics, impressions, position) + lots.
    return BRIEFS;
  } catch { return BRIEFS; }
}
