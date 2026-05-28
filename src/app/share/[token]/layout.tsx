import { notFound } from "next/navigation";
import { getSharedProject } from "@/data/sharedProjects";
import { ClientSidebar } from "@/components/share/ClientSidebar";
import { ClientTopbar } from "@/components/share/ClientTopbar";
import { ClientViewTransition } from "@/components/share/ClientViewTransition";

/**
 * Layout du portail client — sidebar + topbar dédiés.
 *
 * Le token sert d'identifiant client. Si le projet n'existe pas (token
 * invalide, partage désactivé), on bascule sur la 404 commune.
 */
export default async function ShareClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const project = getSharedProject(token);

  if (!project) {
    notFound();
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[var(--bg-primary)]">
      <ClientSidebar token={token} agency={project.agency} />
      <main className="flex flex-1 flex-col overflow-hidden">
        <ClientTopbar
          token={token}
          clientName={project.clientName}
          domain={project.domain}
          consultant={project.consultant}
        />
        <div className="flex-1 overflow-y-auto">
          <ClientViewTransition>{children}</ClientViewTransition>
        </div>
      </main>
    </div>
  );
}
