/**
 * Queries Audit Technique — STUB de référence (handoff back).
 * Voir HANDOFF.md §1 et §6. Fallback mock sans DATABASE_URL.
 * Source réelle probable : crawl (Screaming Frog) + GSC + PageSpeed.
 */

import "server-only";
import {
  URGENT_ISSUES, PILOT_DATA, CATEGORY_SCORES, CRAWLERS, PAGESPEED_DATA,
} from "@/data/audit-technique";

export async function getTechnicalUrgentIssues(domain: string) {
  void domain;
  if (!process.env.DATABASE_URL) return URGENT_ISSUES;
  try {
    // TODO(back) : urgences techniques détectées par le dernier crawl.
    return URGENT_ISSUES;
  } catch { return URGENT_ISSUES; }
}

export async function getTechnicalPilotData(domain: string) {
  void domain;
  if (!process.env.DATABASE_URL) return PILOT_DATA;
  try {
    // TODO(back) : registre de pilotage (issues + statut + impact).
    return PILOT_DATA;
  } catch { return PILOT_DATA; }
}

export async function getTechnicalCategoryScores(domain: string) {
  void domain;
  if (!process.env.DATABASE_URL) return CATEGORY_SCORES;
  try {
    // TODO(back) : scores par dimension (icône choisie côté UI à partir d'une clé).
    return CATEGORY_SCORES;
  } catch { return CATEGORY_SCORES; }
}

export async function getCrawlers(domain: string) {
  void domain;
  if (!process.env.DATABASE_URL) return CRAWLERS;
  try { return CRAWLERS; } catch { return CRAWLERS; }
}

export async function getPagespeed(domain: string) {
  void domain;
  if (!process.env.DATABASE_URL) return PAGESPEED_DATA;
  try { return PAGESPEED_DATA; } catch { return PAGESPEED_DATA; }
}
