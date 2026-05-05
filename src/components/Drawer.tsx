"use client";

import { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useDrawer } from "@/context/DrawerContext";

export function Drawer() {
  const { isOpen, title, content, close } = useDrawer();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  return (
    <>
      <div
        aria-hidden="true"
        onClick={close}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "auto" : "none" }}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed right-0 top-0 bottom-0 z-50 flex w-[480px] max-w-[95vw] flex-col border-l border-[var(--border-subtle)] bg-[var(--modal-bg)] shadow-2xl transition-transform duration-300"
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transitionTimingFunction: "var(--ease-expo)",
        }}
      >
        <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-[var(--border-subtle)] px-6">
          <span className="text-[14px] font-medium text-[var(--text-primary)]">{title}</span>
          <button
            onClick={close}
            aria-label="Fermer"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {content}
        </div>
      </aside>
    </>
  );
}
