/**
 * Queries Charts Sémantique — STUB de référence (handoff back).
 * Voir HANDOFF.md §1 et §6. Fallback mock sans DATABASE_URL.
 */

import "server-only";
import {
  ORGANIC_COMPETITORS, TOP_PAGES_ALL, POSITION_BARS, VISIBILITY_BY_PERIOD,
  type OrganicRow, type TopPage,
} from "@/data/charts-semantique";

export async function getOrganicCompetitors(domain: string): Promise<OrganicRow[]> {
  void domain;
  if (!process.env.DATABASE_URL) return ORGANIC_COMPETITORS;
  try { return ORGANIC_COMPETITORS; } catch { return ORGANIC_COMPETITORS; }
}

export async function getTopPages(domain: string): Promise<TopPage[]> {
  void domain;
  if (!process.env.DATABASE_URL) return TOP_PAGES_ALL;
  try {
    // TODO(back) : top pages GSC (clics, impressions, CTR, position).
    return TOP_PAGES_ALL;
  } catch { return TOP_PAGES_ALL; }
}

export async function getPositionDistribution(domain: string) {
  void domain;
  if (!process.env.DATABASE_URL) return POSITION_BARS;
  try { return POSITION_BARS; } catch { return POSITION_BARS; }
}

export async function getVisibilityHistory(domain: string) {
  void domain;
  if (!process.env.DATABASE_URL) return VISIBILITY_BY_PERIOD;
  try { return VISIBILITY_BY_PERIOD; } catch { return VISIBILITY_BY_PERIOD; }
}
