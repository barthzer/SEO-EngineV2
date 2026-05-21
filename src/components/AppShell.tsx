import { DrawerProvider } from "@/context/DrawerContext";
import { ToastProvider } from "@/context/ToastContext";
import { PageMetaProvider } from "@/context/PageMetaContext";
import { Drawer } from "@/components/Drawer";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <DrawerProvider>
        <PageMetaProvider>
          <div className="flex h-[100dvh] overflow-hidden bg-[var(--bg-primary)]">
            <Sidebar />
            <main className="relative flex flex-1 flex-col overflow-hidden bg-[var(--bg-primary)]">
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
