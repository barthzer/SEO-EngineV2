import { notFound } from "next/navigation";
import { getTemplate } from "@/data/templates";
import { ContentBriefView } from "@/components/templates/ContentBriefView";

/**
 * Écran D — Brief / draft de contenu généré (route dédiée, plein écran).
 * Atteint depuis « Générer le brief de contenu » (configurateur — Écran B).
 */
export default async function BriefPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ titre?: string; from?: string }>;
}) {
  const { id } = await params;
  const { titre, from } = await searchParams;
  const template = getTemplate(decodeURIComponent(id));
  if (!template) notFound();
  return (
    <ContentBriefView
      template={template}
      title={titre?.trim() || "Nouveau contenu"}
      optimize={from === "analyse"}
    />
  );
}
