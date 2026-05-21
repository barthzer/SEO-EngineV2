import { Suspense } from "react";
import { DrawerProvider } from "@/context/DrawerContext";
import { ToastProvider } from "@/context/ToastContext";
import { PageMetaProvider } from "@/context/PageMetaContext";
import { Drawer } from "@/components/Drawer";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

/**
 * Fallback statique de la sidebar pendant l'hydratation côté SSR/static export.
 * Largeur identique à l'état collapsed pour éviter tout shift de layout.
 */
function SidebarFallback() {
  return <aside className="h-full w-16 flex-shrink-0 bg-[var(--bg-primary)]" aria-hidden="true" />;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <DrawerProvider>
        <PageMetaProvider>
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
        </PageMetaProvider>
      </DrawerProvider>
    </ToastProvider>
  );
}
