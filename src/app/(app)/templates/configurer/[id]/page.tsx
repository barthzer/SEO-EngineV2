import { notFound } from "next/navigation";
import { getTemplate } from "@/data/templates";
import { TemplateConfigurator } from "@/components/templates/TemplateConfigurator";

/**
 * Écran B — Configurateur d'un template (route dédiée, plein écran avec « Retour »).
 * Atteinte depuis :
 *   - « Utiliser ce template » (sélecteur — Écran C)
 *   - « Appliquer les recommandations » dans l'analyse d'une URL → mode `from=analyse`
 *     (optimisation de la page existante : sujet pré-rempli + actions sémantiques).
 */
export default async function ConfigurerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; keyword?: string; url?: string; subject?: string }>;
}) {
  const { id } = await params;
  const { from, keyword, url, subject } = await searchParams;
  // Sentinelle « sans-template » : configuration démarrée sans template (from scratch /
  // opportunité) — l'utilisateur pourra en ajouter un via « Ajouter un template ».
  const noTemplate = id === "sans-template";
  const template = noTemplate ? undefined : getTemplate(decodeURIComponent(id));
  if (!noTemplate && !template) notFound();
  const analyse = from === "analyse" && keyword ? { keyword, url: url ?? "" } : undefined;
  const initialSubject = subject ? decodeURIComponent(subject) : undefined;
  return <TemplateConfigurator template={template} analyse={analyse} initialSubject={initialSubject} />;
}
