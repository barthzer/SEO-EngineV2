/**
 * Queries Audit Éditorial / Sémantique — STUB de référence (handoff back).
 * Voir HANDOFF.md §1 et §6. Fallback mock sans DATABASE_URL.
 * Contrats : `Issue`, `TagData` (src/data/audit-editorial.ts).
 */

import "server-only";
import { ISSUES, LOTS, type Issue, type TagData } from "@/data/audit-editorial";

export async function getEditorialIssues(domain: string): Promise<Issue[]> {
  void domain;
  if (!process.env.DATABASE_URL) return ISSUES;
  try {
    // TODO(back) : requête Drizzle (issues éditoriales détectées par l'audit) → map vers Issue.
    return ISSUES;
  } catch { return ISSUES; }
}

export async function getEditorialLots(domain: string): Promise<Record<string, TagData>> {
  void domain;
  if (!process.env.DATABASE_URL) return LOTS;
  try {
    // TODO(back) : verdicts + dimensions par lot/tag de pages.
    return LOTS;
  } catch { return LOTS; }
}
