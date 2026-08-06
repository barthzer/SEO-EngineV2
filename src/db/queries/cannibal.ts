/**
 * Queries Cannibalisation — STUB de référence (handoff back).
 * Voir HANDOFF.md §1 et §6. Fallback mock sans DATABASE_URL.
 */

import "server-only";
import { CANNIBAL_KWS, CANNIBAL_PAGES, type CannibalKw, type CannibalPage } from "@/data/cannibal";

export async function getCannibalKeywords(domain: string): Promise<CannibalKw[]> {
  void domain;
  if (!process.env.DATABASE_URL) return CANNIBAL_KWS;
  try {
    // TODO(back) : détection de cannibalisation (GSC : plusieurs URLs sur une même requête).
    return CANNIBAL_KWS;
  } catch { return CANNIBAL_KWS; }
}

export async function getCannibalPages(domain: string): Promise<CannibalPage[]> {
  void domain;
  if (!process.env.DATABASE_URL) return CANNIBAL_PAGES;
  try { return CANNIBAL_PAGES; } catch { return CANNIBAL_PAGES; }
}
