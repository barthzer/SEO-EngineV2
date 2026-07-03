import { notFound } from "next/navigation";
import { getTemplate } from "@/data/templates";
import { TemplateConfigurator } from "@/components/templates/TemplateConfigurator";

/**
 * Écran B — Configurateur d'un template (route dédiée, plein écran avec « Retour »).
 * Atteinte depuis « Utiliser ce template » (sélecteur — Écran C).
 */
export default async function ConfigurerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const template = getTemplate(decodeURIComponent(id));
  if (!template) notFound();
  return <TemplateConfigurator template={template} />;
}
