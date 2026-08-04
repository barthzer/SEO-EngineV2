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
import { useLayoutEffect, useRef, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useModalTransition } from "@/hooks/useModalTransition";

/**
 * AnimateHeight — anime en douceur la hauteur de son contenu quand celui-ci
 * change (ex. passage d'étape dans une modale multi-étapes). Mesure la hauteur
 * naturelle du contenu (ResizeObserver) et la pose en hauteur explicite + transition.
 * `overflow` reste visible → les dropdowns/tooltips internes ne sont pas rognés.
 */
function AnimateHeight({ children }: { children: React.ReactNode }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);

  // Mesure à CHAQUE rendu (donc à chaque changement d'étape/contenu) : fiable et
  // synchrone, contrairement au ResizeObserver seul qui rate parfois les swaps React.
  useLayoutEffect(() => {
    const el = innerRef.current;
    if (el) setHeight(el.offsetHeight);
  });

  // + ResizeObserver pour les changements asynchrones (textarea redimensionné, images…).
  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div style={{ height, transition: "height 300ms cubic-bezier(0.16, 1, 0.3, 1)" }}>
      <div ref={innerRef}>{children}</div>
    </div>
  );
}

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
        className={`t-modal ${modalClass} relative w-full rounded-2xl bg-[var(--modal-bg)] p-8 shadow-[var(--shadow-floating)]`}
        style={{ maxWidth: `${maxWidth}px` }}
      >
        <button onClick={requestClose} className="absolute right-6 top-6 z-10 flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]">
          <XMarkIcon className="h-5 w-5" />
        </button>
        <AnimateHeight>{children}</AnimateHeight>
      </div>
    </div>,
    document.body
  );
}

export function FormField({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block type-caption font-medium">
        {label}
        {required && <span className="ml-0.5 text-[var(--color-danger)]">*</span>}
        {hint && <span className="ml-1.5 font-normal text-[var(--text-muted)]">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

export const fieldCls = "w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--card-inner-bg)] px-3.5 py-2.5 type-body text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] focus:border-[var(--border-medium)] transition-colors";
