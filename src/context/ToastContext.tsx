"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { createPortal } from "react-dom";

interface ToastOptions {
  message: string;
  icon?: ReactNode;
}

interface ToastState {
  show: (message: string, icon?: ReactNode) => void;
}

const ToastContext = createContext<ToastState>({ show: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<ToastOptions>({ message: "" });
  const [visible, setVisible] = useState(false);
  const timerRef = { current: null as ReturnType<typeof setTimeout> | null };

  const show = useCallback((message: string, icon?: ReactNode) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpts({ message, icon });
    setVisible(true);
    timerRef.current = setTimeout(() => setVisible(false), 2500);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {typeof window !== "undefined" && createPortal(
        <div
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 bottom-8 z-[500] flex justify-center"
        >
          <div
            className="flex items-center gap-3 rounded-2xl px-5 py-3.5 text-[16px] font-medium shadow-[0_8px_40px_rgba(0,0,0,0.22)] transition-all duration-300"
            style={{
              backgroundColor: "var(--floating-bar-bg)",
              color: "var(--floating-bar-text)",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(8px)",
            }}
          >
            {opts.icon && <span className="flex-shrink-0">{opts.icon}</span>}
            {opts.message}
          </div>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}
