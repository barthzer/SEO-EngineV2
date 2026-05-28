import { Suspense } from "react";
import { DrawerProvider } from "@/context/DrawerContext";
import { ToastProvider } from "@/context/ToastContext";
import { PageMetaProvider } from "@/context/PageMetaContext";
import { ProjectsProvider } from "@/context/ProjectsContext";
import { ChatProvider } from "@/context/ChatContext";
import { Drawer } from "@/components/Drawer";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { CommandPalette } from "@/components/CommandPalette";
import { ChatWidget } from "@/components/chat/ChatWidget";
import type { Project } from "@/data/projects";

/**
 * Fallback statique de la sidebar pendant l'hydratation côté SSR/static export.
 * Largeur identique à l'état collapsed pour éviter tout shift de layout.
 */
function SidebarFallback() {
  return <aside className="h-full w-16 flex-shrink-0 bg-[var(--bg-sidebar)]" aria-hidden="true" />;
}

export function AppShell({
  children,
  projects,
}: {
  children: React.ReactNode;
  projects: Project[];
}) {
  return (
    <ToastProvider>
      <DrawerProvider>
        <PageMetaProvider>
          <ProjectsProvider value={projects}>
          <ChatProvider>
          <div className="flex h-[100dvh] overflow-hidden bg-[var(--bg-primary)]">
            {/* Sidebar lit useSearchParams (?tab=) — wrap dans Suspense pour permettre le static prerender. */}
            <Suspense fallback={<SidebarFallback />}>
              <Sidebar />
            </Suspense>
            <main className="relative flex flex-1 flex-col overflow-hidden border-l border-[var(--border-subtle)] bg-[var(--bg-primary)]">
              <Topbar />
              <div className="flex-1 overflow-y-auto">{children}</div>
            </main>
          </div>
          <Drawer />
          {/* Palette de commandes globale (⌘K) — lit useSearchParams → Suspense. */}
          <Suspense fallback={null}>
            <CommandPalette />
          </Suspense>
          {/* Assistant conversationnel flottant (bulle bas-droite). */}
          <ChatWidget />
          </ChatProvider>
          </ProjectsProvider>
        </PageMetaProvider>
      </DrawerProvider>
    </ToastProvider>
  );
}
