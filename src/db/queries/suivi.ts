/**
 * Queries Suivi (historique des actions livrées) — câblage Drizzle réel (PR back/wire-suivi).
 *
 * Source = `action_cards` (workflow agence) filtrées `status = "done"`, jointes `projects`
 * (filtre `domain`) + `consultants` (owner), triées par `completed_at` desc.
 * Fallback mock obligatoire (HANDOFF §1 — règle d'or : le mock ne dépend jamais du back).
 * Contrat = `HistoryAction` (src/data/suivi.ts), inchangé.
 *
 * ⚠️ 2 frictions de contrat (issues `needs-data` ouvertes, contrat NON modifié ici) :
 *  - `ownerKey` = enum figé front (bart|sophie|thomas|marie) ≠ `owner_consultant_id` (uuid réel)
 *    → mapping best-effort par prénom, défaut "bart".
 *  - `ActionType` (article|page|audit|technique|netlinking|tracking) ⊋ `action_category`
 *    (technique|contenu|netlinking|geo|autre) → mapping lossy ci-dessous (geo/contenu/autre
 *    sans équivalent exact).
 */

import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { actionCards, consultants, projects } from "@/db/schema";
import { ACTIONS, OWNERS, type ActionType, type HistoryAction } from "@/data/suivi";

// action_category → ActionType (contrat front). Lossy : contenu→article, geo/autre approximés.
const CATEGORY_TO_TYPE: Record<string, ActionType> = {
  technique: "technique",
  netlinking: "netlinking",
  contenu: "article",
  geo: "tracking",
  autre: "page",
};

// firstName consultant → ownerKey (enum figé du contrat). Défaut = première clé connue.
function ownerKeyFrom(firstName: string | null): keyof typeof OWNERS {
  const k = (firstName ?? "").trim().toLowerCase();
  if (k.startsWith("barth")) return "bart";
  if (k.startsWith("sophie")) return "sophie";
  if (k.startsWith("thomas")) return "thomas";
  if (k.startsWith("marie")) return "marie";
  return "bart";
}

export async function getHistory(domain: string): Promise<HistoryAction[]> {
  if (!process.env.DATABASE_URL) return ACTIONS;

  try {
    const rows = await db
      .select({
        id: actionCards.id,
        title: actionCards.title,
        description: actionCards.description,
        category: actionCards.category,
        completedAt: actionCards.completedAt,
        clientNarrative: actionCards.clientNarrative,
        evidenceUrl: actionCards.evidenceUrl,
        ownerFirstName: consultants.firstName,
      })
      .from(actionCards)
      .innerJoin(projects, eq(actionCards.projectId, projects.id))
      .leftJoin(consultants, eq(actionCards.ownerConsultantId, consultants.id))
      .where(and(eq(projects.domain, domain), eq(actionCards.status, "done")))
      .orderBy(desc(actionCards.completedAt));

    if (rows.length === 0) return ACTIONS;

    return rows.map((r) => ({
      id: r.id,
      date: (r.completedAt ?? new Date()).toISOString().slice(0, 10),
      title: r.title,
      description: r.description ?? "",
      ownerKey: ownerKeyFrom(r.ownerFirstName),
      type: CATEGORY_TO_TYPE[r.category ?? "autre"] ?? "page",
      impact: r.clientNarrative ?? undefined,
      targetUrl: r.evidenceUrl ?? "#",
    }));
  } catch {
    return ACTIONS;
  }
}
