import { ProjectSettingsView } from "@/components/parametres/ProjectSettingsView";

/**
 * Paramètres d'un projet (route imbriquée sous /analyse/[domain]).
 * Atteinte depuis le menu 3-points d'une carte projet ou depuis le projet.
 */
export default async function ProjectSettingsPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  return <ProjectSettingsView domain={decodeURIComponent(domain)} />;
}
