"use client";

/**
 * Shared primitives used by every modal in the analyse/[domain] view.
 *
 * - `ModalShell`  — portal-based overlay + dialog with open/closing transitions.
 * - `FormField`   — labelled wrapper for inputs (optional `required` + `hint`).
 * - `fieldCls`    — common input className string.
 *
 * Extracted verbatim from src/app/(app)/analyse/[domain]/page.tsx — no behaviour change.
 */

import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useModalTransition } from "@/hooks/useModalTransition";

export function ModalShell({
  onClose,
  children,
  maxWidth = 480,
}: {
  onClose: () => void;
  children: React.ReactNode;
  /** Largeur max en px. Défaut 480 ; modales formulaires court → ~400. */
  maxWidth?: number;
}) {
  const { phase, requestClose } = useModalTransition(onClose);
  if (typeof document === "undefined") return null;
  const overlayClass = phase === "open" ? "is-open" : phase === "closing" ? "is-closing" : "";
  const modalClass = phase === "open" ? "is-open" : phase === "closing" ? "is-closing" : "";
  return createPortal(
    <div
      role="presentation"
      className={`t-modal-overlay ${overlayClass} fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm`}
      onClick={(e) => e.target === e.currentTarget && requestClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`t-modal ${modalClass} relative w-full rounded-3xl bg-[var(--modal-bg)] p-8 shadow-[var(--shadow-floating)]`}
        style={{ maxWidth: `${maxWidth}px` }}
      >
        <button onClick={requestClose} className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]">
          <XMarkIcon className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}

export function FormField({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-secondary)]">
        {label}
        {required && <span className="ml-0.5 text-[var(--color-danger)]">*</span>}
        {hint && <span className="ml-1.5 font-normal text-[var(--text-muted)]">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

export const fieldCls = "w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--card-inner-bg)] px-3.5 py-2.5 text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] focus:border-[var(--border-medium)] transition-colors";
