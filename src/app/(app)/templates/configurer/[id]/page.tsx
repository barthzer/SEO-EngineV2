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
  searchParams: Promise<{ from?: string; keyword?: string; url?: string }>;
}) {
  const { id } = await params;
  const { from, keyword, url } = await searchParams;
  const template = getTemplate(decodeURIComponent(id));
  if (!template) notFound();
  const analyse = from === "analyse" && keyword ? { keyword, url: url ?? "" } : undefined;
  return <TemplateConfigurator template={template} analyse={analyse} />;
}
