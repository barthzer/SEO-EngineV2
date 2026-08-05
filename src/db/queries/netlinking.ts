/**
 * Queries Popularité / Netlinking — STUB de référence (handoff back).
 * Voir HANDOFF.md §1 et §6. Fallback mock sans DATABASE_URL.
 *
 * Beaucoup de jeux de données distincts (benchmark, backlinks, autorité média,
 * opportunités de liens) — à câbler un par un. Contrats dans src/data/netlinking.ts.
 */

import "server-only";
import {
  BENCHMARK, BACKLINKS, MEDIA_BENCHMARK, NET_OPPORTUNITIES,
  type BenchmarkRow, type Backlink, type MediaBenchRow, type OppoRow,
} from "@/data/netlinking";

export async function getBenchmark(domain: string): Promise<BenchmarkRow[]> {
  void domain;
  if (!process.env.DATABASE_URL) return BENCHMARK;
  try {
    // TODO(back) : requête Drizzle (concurrents + métriques TF/CF/RefDom/Backlinks).
    return BENCHMARK;
  } catch { return BENCHMARK; }
}

export async function getBacklinks(domain: string): Promise<Backlink[]> {
  void domain;
  if (!process.env.DATABASE_URL) return BACKLINKS;
  try {
    // TODO(back) : requête Drizzle / API backlinks (Majestic/Ahrefs).
    return BACKLINKS;
  } catch { return BACKLINKS; }
}

export async function getMediaBenchmark(domain: string): Promise<MediaBenchRow[]> {
  void domain;
  if (!process.env.DATABASE_URL) return MEDIA_BENCHMARK;
  try {
    return MEDIA_BENCHMARK;
  } catch { return MEDIA_BENCHMARK; }
}

export async function getNetOpportunities(domain: string): Promise<OppoRow[]> {
  void domain;
  if (!process.env.DATABASE_URL) return NET_OPPORTUNITIES;
  try {
    return NET_OPPORTUNITIES;
  } catch { return NET_OPPORTUNITIES; }
}
