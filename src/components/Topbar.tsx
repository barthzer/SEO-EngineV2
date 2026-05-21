"use client";

import { usePathname } from "next/navigation";
import { ProjectSwitcher } from "@/components/ProjectSwitcher";
import { usePageMeta } from "@/context/PageMetaContext";

export function Topbar() {
  const pathname = usePathname();
  const { meta } = usePageMeta();
  const isProjectPage = pathname.startsWith("/analyse/");

  // Pas de Topbar sur Projets / Équipe / Paramètres — le main remplit toute la hauteur.
  if (!isProjectPage) return null;

  const projectDomain = decodeURIComponent(pathname.split("/analyse/")[1]?.split("/")[0] ?? "");
  return (
    <header className="sticky top-0 z-50 flex h-14 flex-shrink-0 items-center justify-between gap-2 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] px-5">
      <ProjectSwitcher currentDomain={projectDomain} />
      {meta.rightSlot && <div className="flex items-center gap-2">{meta.rightSlot}</div>}
    </header>
  );
}
