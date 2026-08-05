/**
 * Queries Opportunités — STUB de référence pour le handoff back.
 *
 * Modèle : `src/db/queries/projects.ts`. Règle d'or (HANDOFF.md §1) :
 * tant qu'il n'y a pas de `DATABASE_URL`, on renvoie le mock → l'appli tourne
 * SANS backend. Le dev remplit la vraie requête Drizzle dans le bloc marqué.
 *
 * Le contrat de type est `OppRow` (src/data/opportunities.ts). Ne pas le changer
 * sans se coordonner (issue `needs-data`).
 */

import "server-only";
import { INITIAL_ROWS, type OppRow } from "@/data/opportunities";

/** Renvoie les opportunités d'un projet (mock tant que la DB n'est pas câblée). */
export async function getOpportunities(domain: string): Promise<OppRow[]> {
  void domain; // ← servira à filtrer par projet dans la vraie requête (à retirer une fois câblé)
  // Sans base (dev front sans DATABASE_URL) : on tourne en mock.
  if (!process.env.DATABASE_URL) return INITIAL_ROWS;

  try {
    // ── TODO(back) : vraie requête Drizzle ───────────────────────────────
    // 1. Ajouter la table `opportunities` dans src/db/schema.ts (shape = OppRow).
    // 2. Filtrer par projet (_domain), mapper vers OppRow.
    // 3. return rows;
    //
    // const rows = await db.select({...}).from(opportunities).where(...);
    // if (rows.length === 0) return INITIAL_ROWS;
    // return rows.map(toOppRow);
    // ─────────────────────────────────────────────────────────────────────
    return INITIAL_ROWS; // ← remplacer par la vraie requête
  } catch {
    return INITIAL_ROWS; // fallback mock en cas d'erreur DB
  }
}
