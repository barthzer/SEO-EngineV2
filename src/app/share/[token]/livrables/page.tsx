import { notFound } from "next/navigation";
import { getSharedProject } from "@/data/sharedProjects";
import {
  ArrowTopRightOnSquareIcon,
  NewspaperIcon,
  AcademicCapIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/outline";
import type { ElementType } from "react";
import { OwnerAvatar } from "@/components/share/ClientPrimitives";
import { formatDate } from "@/components/share/formatters";
import { IconBadge } from "@/components/IconBadge";
import { Pill } from "@/components/Pill";
import { Panel } from "@/components/Panel";

/** Map type → icône distinctive + label affiché. Pas de couleur tag, monochrome élégant. */
const TYPE_CFG: Record<string, { label: string; icon: ElementType }> = {
  article: { label: "Article",  icon: NewspaperIcon },
  page:    { label: "Page",     icon: RectangleStackIcon },
  guide:   { label: "Guide",    icon: AcademicCapIcon },
};

export default async function ClientLivrablesPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const project = getSharedProject(token);
  if (!project) notFound();

  return (
    <div className="w-full px-8 py-6">
      <div className="mb-6">
        <h1 className="text-[24px] font-semibold leading-tight tracking-tight text-[var(--text-primary)]">
          Livrables
        </h1>
        <p className="mt-1 text-[13px] text-[var(--text-muted)]">
          Articles, pages et guides publiés sur votre site. Chaque livrable
          cible un mot-clé avec un volume de recherche identifié.
        </p>
      </div>

      <Panel padding="none">
        {project.deliverables.length === 0 ? (
          <div className="px-6 py-12 text-center text-[14px] text-[var(--text-muted)]">
            Aucune publication pour cette période.
          </div>
        ) : (
          project.deliverables.map((d, i, arr) => {
            const cfg = TYPE_CFG[d.type] ?? TYPE_CFG.article;
            return (
              <a
                key={d.id}
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group grid grid-cols-[auto_minmax(0,1fr)_auto_auto_auto] items-center gap-5 px-5 py-4 transition-colors hover:bg-[var(--bg-card-hover)] ${
                  i < arr.length - 1 ? "border-b border-[var(--border-subtle)]" : ""
                }`}
              >
                <IconBadge icon={cfg.icon} size="md" outline />

                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-[var(--text-primary)]">
                    {d.title}
                  </p>
                  <p className="mt-0.5 truncate text-[12px] text-[var(--text-muted)]">
                    « {d.targetKeyword} » · {d.wordCount.toLocaleString("fr-FR")} mots
                  </p>
                </div>

                <Pill bg="var(--bg-card-static)" color="var(--text-secondary)">
                  {cfg.label}
                </Pill>

                <div className="flex w-[120px] flex-col items-end">
                  <p className="text-[13px] font-semibold tabular-nums text-[var(--text-primary)]">
                    {d.monthlyVolume.toLocaleString("fr-FR")}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">recherches/mois</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end gap-1">
                    <OwnerAvatar photoSeed={d.owner.photoSeed} name={d.owner.name} size={20} />
                    <p className="text-[11px] tabular-nums text-[var(--text-muted)]">
                      {formatDate(d.publishedAt)}
                    </p>
                  </div>
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 text-[var(--text-muted)] transition-colors group-hover:text-[var(--text-primary)]" />
                </div>
              </a>
            );
          })
        )}
      </Panel>
    </div>
  );
}
