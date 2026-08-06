/**
 * Queries Audit Visibilité IA — STUB de référence (handoff back).
 * Voir HANDOFF.md §1 et §6. Fallback mock sans DATABASE_URL.
 * Contrats : `Engine`, `SovRow`, `PromptRow`, `CitedPage`, `ReadyItem`, `ActionRow`
 * (src/data/audit-geo.ts).
 */

import "server-only";
import {
  ENGINES, SOV, PROMPTS, CITED_PAGES, READINESS, PRIORITY_ACTIONS,
  type Engine, type SovRow, type PromptRow, type CitedPage, type ReadyItem, type ActionRow,
} from "@/data/audit-geo";

export async function getGeoEngines(domain: string): Promise<Engine[]> {
  void domain;
  if (!process.env.DATABASE_URL) return ENGINES;
  try {
    // TODO(back) : état de crawl/citation par moteur IA.
    return ENGINES;
  } catch { return ENGINES; }
}

export async function getGeoSov(domain: string): Promise<SovRow[]> {
  void domain;
  if (!process.env.DATABASE_URL) return SOV;
  try { return SOV; } catch { return SOV; }
}

export async function getGeoPrompts(domain: string): Promise<PromptRow[]> {
  void domain;
  if (!process.env.DATABASE_URL) return PROMPTS;
  try { return PROMPTS; } catch { return PROMPTS; }
}

export async function getGeoCitedPages(domain: string): Promise<CitedPage[]> {
  void domain;
  if (!process.env.DATABASE_URL) return CITED_PAGES;
  try { return CITED_PAGES; } catch { return CITED_PAGES; }
}

export async function getGeoReadiness(domain: string): Promise<ReadyItem[]> {
  void domain;
  if (!process.env.DATABASE_URL) return READINESS;
  try { return READINESS; } catch { return READINESS; }
}

export async function getGeoPriorityActions(domain: string): Promise<ActionRow[]> {
  void domain;
  if (!process.env.DATABASE_URL) return PRIORITY_ACTIONS;
  try { return PRIORITY_ACTIONS; } catch { return PRIORITY_ACTIONS; }
}
