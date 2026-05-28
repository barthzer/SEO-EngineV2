import { notFound } from "next/navigation";
import { getSharedProject } from "@/data/sharedProjects";
import { ReportCard } from "@/components/share/ReportCard";
import { SectionHeader } from "@/components/share/ClientPrimitives";

export default async function ClientRapportsPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const project = getSharedProject(token);
  if (!project) notFound();

  return (
    <div className="mx-auto w-full max-w-[920px] px-8 py-10">
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-[var(--text-primary)]">
          Rapports mensuels
        </h1>
        <p className="mt-2 max-w-[640px] text-[14px] leading-relaxed text-[var(--text-secondary)]">
          Chaque mois, votre consultant produit un rapport synthèse de la
          prestation. Cliquez pour télécharger le PDF.
        </p>
      </div>

      <section>
        <div className="mb-4">
          <SectionHeader title="Tous les rapports" count={project.reports.length} />
        </div>

        {project.reports.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border-subtle)] px-6 py-12 text-center text-[14px] text-[var(--text-muted)]">
            Aucun rapport publié pour l'instant.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {project.reports.map((r) => (
              <ReportCard
                key={r.id}
                report={r}
                clientName={project.clientName}
                consultantName={project.consultant.name}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
