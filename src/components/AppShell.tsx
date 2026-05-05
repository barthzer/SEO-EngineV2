import { DrawerProvider } from "@/context/DrawerContext";
import { ToastProvider } from "@/context/ToastContext";
import { Drawer } from "@/components/Drawer";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <DrawerProvider>
        <div className="flex h-[100dvh] overflow-hidden">
          <Sidebar />
          <main className="relative flex flex-1 flex-col overflow-y-auto">
            <Topbar />
            {children}
          </main>
        </div>
        <Drawer />
      </DrawerProvider>
    </ToastProvider>
  );
}
