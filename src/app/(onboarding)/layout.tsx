import { ToastProvider } from "@/context/ToastContext";

/** Layout onboarding — full-screen, sans sidebar/topbar */
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="min-h-[100dvh] bg-[var(--bg-primary)]">{children}</div>
    </ToastProvider>
  );
}
