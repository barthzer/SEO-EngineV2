/**
 * Queries Production éditoriale — STUB de référence (handoff back).
 * Voir HANDOFF.md §1 et §6. Fallback mock sans DATABASE_URL. Contrat = `Article`.
 */

import "server-only";
import { ARTICLES, type Article } from "@/data/production";

export async function getProductionArticles(): Promise<Article[]> {
  if (!process.env.DATABASE_URL) return ARTICLES;
  try {
    // TODO(back) : articles en production (kanban brief → rédaction → relecture → publié).
    return ARTICLES;
  } catch { return ARTICLES; }
}
