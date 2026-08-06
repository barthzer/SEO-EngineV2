/**
 * Queries Audit Popularité — STUB de référence (handoff back).
 * Voir HANDOFF.md §1 et §6. Fallback mock sans DATABASE_URL.
 * Contrats : `Competitor`, `BacklinkRow`, `VisRow` (src/data/audit-netlinking.ts).
 */

import "server-only";
import {
  COMPETITORS, BACKLINKS, VISIBILITY,
  type Competitor, type BacklinkRow, type VisRow,
} from "@/data/audit-netlinking";

export async function getAuditCompetitors(domain: string): Promise<Competitor[]> {
  void domain;
  if (!process.env.DATABASE_URL) return COMPETITORS;
  try {
    // TODO(back) : requête Drizzle / API (Majestic, Ahrefs) → map vers Competitor.
    return COMPETITORS;
  } catch { return COMPETITORS; }
}

export async function getAuditBacklinks(domain: string): Promise<BacklinkRow[]> {
  void domain;
  if (!process.env.DATABASE_URL) return BACKLINKS;
  try {
    return BACKLINKS;
  } catch { return BACKLINKS; }
}

export async function getAuditVisibility(domain: string): Promise<VisRow[]> {
  void domain;
  if (!process.env.DATABASE_URL) return VISIBILITY;
  try {
    return VISIBILITY;
  } catch { return VISIBILITY; }
}
