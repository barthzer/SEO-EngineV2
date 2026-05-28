/**
 * Queries projet — version "classique" pour rétro-compat avec l'UI actuelle
 * qui consomme l'ancien shape `Project` (domain, score, logo, status).
 *
 * Une version v2 typée avec les 3 scores + relations client viendra avec A1 (home cockpit).
 */

import "server-only";
import { db } from "@/db/client";
import { projects } from "@/db/schema";
import { desc } from "drizzle-orm";
import { PROJECTS, type Project as LegacyProject } from "@/data/projects";

/**
 * Renvoie tous les projets dans le shape historique attendu par Sidebar/Switcher.
 * - `score` = moyenne des 3 jauges (technique/contenu/netlinking)
 * - `logo` = true par défaut (le composant Favicon a son propre fallback)
 */
export async function getProjectsClassic(): Promise<LegacyProject[]> {
  // Sans base (build/preview Vercel sans DATABASE_URL) ou en cas d'erreur DB,
  // on retombe sur les projets mock pour que l'app build et tourne quand même.
  if (!process.env.DATABASE_URL) return PROJECTS;

  try {
    const rows = await db
      .select({
        domain: projects.domain,
        status: projects.status,
        tech: projects.scoreTechnique,
        contenu: projects.scoreContenu,
        netlink: projects.scoreNetlinking,
      })
      .from(projects)
      .orderBy(desc(projects.createdAt));

    if (rows.length === 0) return PROJECTS;

    return rows.map((r) => {
      const scores = [r.tech, r.contenu, r.netlink].filter(
        (s): s is number => typeof s === "number",
      );
      const avg = scores.length
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
      return {
        domain: r.domain,
        score: avg,
        logo: true,
        status: r.status,
      };
    });
  } catch {
    return PROJECTS;
  }
}
