"use client";

/**
 * ProjectsContext — fournit la liste des projets aux Client Components.
 * Alimenté en amont par un Server Component qui a déjà fetch via Drizzle.
 *
 * Usage :
 *   ServerComponent → <ProjectsProvider value={projects}>{children}</ProjectsProvider>
 *   ClientComponent  → const projects = useProjects();
 */

import { createContext, useContext } from "react";
import type { Project } from "@/data/projects";

const ProjectsContext = createContext<Project[] | null>(null);

export function ProjectsProvider({
  value,
  children,
}: {
  value: Project[];
  children: React.ReactNode;
}) {
  return (
    <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
  );
}

export function useProjects(): Project[] {
  const ctx = useContext(ProjectsContext);
  if (ctx === null) {
    throw new Error(
      "useProjects() doit être appelé à l'intérieur d'un <ProjectsProvider>. Vérifie que le composant parent est rendu via le layout (app).",
    );
  }
  return ctx;
}
