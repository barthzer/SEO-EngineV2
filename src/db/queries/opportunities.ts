/**
 * Queries Opportunités — STUB de référence pour le handoff back.
 *
 * Modèle : `src/db/queries/projects.ts`. Règle d'or (HANDOFF.md §1) :
 * tant qu'il n'y a pas de `DATABASE_URL`, on renvoie le mock → l'appli tourne
 * SANS backend. Le dev remplit la vraie requête Drizzle dans le bloc marqué.
 *
 * Le contrat de type est `OppGroup` (src/data/opportunities.ts) : une ligne =
 * un BESOIN (groupe de mots-clés de même sujet), détail mot-clé dans `keywords`.
 * Ne pas le changer sans se coordonner (issue `needs-data`).
 */

import "server-only";
import { OPP_GROUPS, type OppGroup } from "@/data/opportunities";

/** Renvoie les besoins (groupes de mots-clés) d'un projet. */
export async function getOpportunities(domain: string): Promise<OppGroup[]> {
  void domain; // ← servira à filtrer par projet dans la vraie requête (à retirer une fois câblé)
  // Sans base (dev front sans DATABASE_URL) : on tourne en mock.
  if (!process.env.DATABASE_URL) return OPP_GROUPS;

  try {
    // ── TODO(back) : vraie requête Drizzle ───────────────────────────────
    // 1. Groupes issus de l'étude (même sujet) + mots-clés rattachés.
    // 2. `gain` calculé sur le groupe (pas la somme naïve des lignes).
    // 3. `priority` = f(gain, difficulté, distance à la page 1, offres prioritaires) ;
    //    null si difficulté non mesurée (le front les relègue en bas).
    // 4. Filtrer par projet (domain), mapper vers OppGroup.
    return OPP_GROUPS; // ← remplacer par la vraie requête
  } catch {
    return OPP_GROUPS; // fallback mock en cas d'erreur DB
  }
}
