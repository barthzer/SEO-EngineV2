"use client";

/**
 * Store de commentaires de projet (mock localStorage — en attendant la table
 * `actionComments` / `project_comments` côté Drizzle).
 *
 * Un commentaire est rattaché à une cible : une ActionCard, une analyse
 * (mot-clé / URL), ou le projet en général. L'onglet Notes agrège tous les
 * commentaires ; les fils contextuels (CommentThread) filtrent par cible.
 *
 * Persistance par domaine. Un événement global notifie les vues à chaque
 * changement pour une mise à jour live.
 */

import { useEffect, useState } from "react";

export type CommentTargetType = "action" | "analysis" | "general";

export type CommentTarget = {
  type: CommentTargetType;
  /** Identifiant stable de la cible (id d'action, mot-clé, "general"…). */
  id: string;
  /** Libellé lisible affiché dans le flux agrégé. */
  label: string;
};

export type ProjectComment = {
  id: string;
  target: CommentTarget;
  text: string;
  author: string;
  initials: string;
  createdAt: string; // ISO
  /** Si défini, ce commentaire est une réponse à un autre (fil à un niveau). */
  parentId?: string;
};

export const CURRENT_AUTHOR = { name: "Barthélemy", initials: "B" };

const CHANGED_EVENT = "project-comments:changed";
const storageKey = (domain: string) => `project-comments:${domain}`;

/** Commentaires de démo (généraux uniquement → toujours cohérents). */
function seed(): ProjectComment[] {
  const now = Date.now();
  return [
    {
      id: "seed-g1",
      target: { type: "general", id: "general", label: "Note de projet" },
      text: "Kickoff fait avec le client. Priorité Q2 : reconquête des positions perdues sur les pages catégories.",
      author: "Sophie M.",
      initials: "SM",
      createdAt: new Date(now - 26 * 3600e3).toISOString(),
    },
  ];
}

export function loadComments(domain: string): ProjectComment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(domain));
    if (!raw) return seed();
    return JSON.parse(raw) as ProjectComment[];
  } catch {
    return seed();
  }
}

function save(domain: string, list: ProjectComment[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(domain), JSON.stringify(list));
  } catch {
    /* quota */
  }
  window.dispatchEvent(new CustomEvent(CHANGED_EVENT, { detail: { domain } }));
}

export function addComment(
  domain: string,
  target: CommentTarget,
  text: string,
  parentId?: string,
  author?: { name: string; initials: string },
): void {
  const who = author ?? CURRENT_AUTHOR;
  const comment: ProjectComment = {
    id: `c-${Date.now()}`,
    target,
    text: text.trim(),
    author: who.name,
    initials: who.initials,
    createdAt: new Date().toISOString(),
    parentId,
  };
  save(domain, [comment, ...loadComments(domain)]);
}

export function removeComment(domain: string, id: string): void {
  save(domain, loadComments(domain).filter((c) => c.id !== id));
}

/** Hook live : renvoie tous les commentaires d'un projet, réactif aux changements. */
export function useProjectComments(domain: string): ProjectComment[] {
  const [comments, setComments] = useState<ProjectComment[]>([]);
  useEffect(() => {
    const sync = () => setComments(loadComments(domain));
    sync();
    window.addEventListener(CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [domain]);
  return comments;
}

/** Domaine courant déduit du pathname /analyse/[domain]. */
export function domainFromPathname(pathname: string | null): string {
  if (!pathname) return "";
  const part = pathname.split("/analyse/")[1];
  if (!part) return "";
  return decodeURIComponent(part.split(/[/?]/)[0]);
}
