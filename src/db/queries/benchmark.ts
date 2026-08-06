/**
 * Queries Benchmark sémantique — STUB de référence (handoff back).
 * Voir HANDOFF.md §1 et §6. Fallback mock sans DATABASE_URL.
 */

import "server-only";
import { VISIBILITY, type VisibilityRow } from "@/data/benchmark";

export async function getVisibilityBenchmark(domain: string): Promise<VisibilityRow[]> {
  void domain;
  if (!process.env.DATABASE_URL) return VISIBILITY;
  try {
    // TODO(back) : visibilité vs concurrents (Haloscan / SEObserver).
    return VISIBILITY;
  } catch { return VISIBILITY; }
}
