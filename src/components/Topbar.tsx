"use client";

import { usePathname } from "next/navigation";
import { ProjectSwitcher } from "@/components/ProjectSwitcher";
import { SidebarToggle } from "@/components/SidebarToggle";
import { AccountCluster } from "@/components/AccountCluster";
import { usePageMeta } from "@/context/PageMetaContext";

export function Topbar() {
  const pathname = usePathname();
  const { meta } = usePageMeta();
  const isProjectPage = pathname.startsWith("/analyse/");
  const projectDomain = decodeURIComponent(pathname.split("/analyse/")[1]?.split("/")[0] ?? "");

  return (
    <header className="sticky top-0 z-50 flex h-14 flex-shrink-0 items-center justify-between gap-2 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] px-2.5">
      <div className="flex min-w-0 items-center gap-1.5">
        <SidebarToggle />
        {isProjectPage && <ProjectSwitcher currentDomain={projectDomain} />}
      </div>
      <div className="flex items-center gap-2">
        {meta.rightSlot}
        <AccountCluster />
      </div>
    </header>
  );
}
