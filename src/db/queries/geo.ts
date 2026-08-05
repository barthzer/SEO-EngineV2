/**
 * Queries GEO / Visibilité IA — STUB de référence (handoff back).
 * Voir HANDOFF.md §1 et §6. Fallback mock sans DATABASE_URL.
 * Contrats : `TopicList`, `Competitor`, `GeoSetup` (src/components/geo/types).
 */

import "server-only";
import { SUGGESTED_LISTS, SUGGESTED_COMPETITORS, DEFAULT_SETUP } from "@/data/geo";
import type { TopicList, Competitor, GeoSetup } from "@/components/geo/types";

export async function getSuggestedTopics(domain: string): Promise<TopicList[]> {
  void domain;
  if (!process.env.DATABASE_URL) return SUGGESTED_LISTS;
  try {
    // TODO(back) : requête Drizzle (topics/prompts suivis + métriques de visibilité IA).
    return SUGGESTED_LISTS;
  } catch { return SUGGESTED_LISTS; }
}

export async function getSuggestedCompetitors(domain: string): Promise<Competitor[]> {
  void domain;
  if (!process.env.DATABASE_URL) return SUGGESTED_COMPETITORS;
  try {
    return SUGGESTED_COMPETITORS;
  } catch { return SUGGESTED_COMPETITORS; }
}

export async function getGeoSetup(domain: string): Promise<GeoSetup> {
  void domain;
  if (!process.env.DATABASE_URL) return DEFAULT_SETUP;
  try {
    // TODO(back) : setup GEO du projet (topics + plateformes + concurrents suivis).
    return DEFAULT_SETUP;
  } catch { return DEFAULT_SETUP; }
}
