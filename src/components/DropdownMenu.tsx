"use client";

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { createPortal } from "react-dom";
import { CheckIcon } from "@heroicons/react/24/outline";

const DropdownCtx = createContext<{ close: () => void }>({ close: () => {} });

interface Props {
  trigger: ReactNode | ((open: boolean) => ReactNode);
  children: ReactNode;
  align?: "left" | "right";
  width?: number | "auto";
  matchTrigger?: boolean;
  upward?: boolean;
}

/** Lecture des durées CSS pour synchroniser les setTimeout avec --dropdown-close-dur */
function readMs(name: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}

export function DropdownMenu({ trigger, children, align = "left", width = 240, matchTrigger = false, upward = false }: Props) {
  // 3 states : closed (mounted=false) / open / closing
  // closing : on garde le DOM monté pendant la close transition, puis on retire
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top?: number; bottom?: number; left: number; width: number | "auto" }>({ left: 0, width });
  const triggerRef = useRef<HTMLDivElement>(null);

  function openDropdown() {
    setMounted(true);
    // tick suivant pour que la transition .is-open joue depuis l'état pré-open
    requestAnimationFrame(() => setOpen(true));
  }
  function closeDropdown() {
    if (!mounted) return;
    setOpen(false); // déclenche .is-closing
    const closeMs = readMs("--dropdown-close-dur", 150);
    setTimeout(() => setMounted(false), closeMs);
  }
  function toggle() {
    if (mounted && open) closeDropdown();
    else openDropdown();
  }

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const resolvedWidth = matchTrigger ? r.width : width;
    setCoords({
      top: upward ? undefined : r.bottom + 8,
      bottom: upward ? window.innerHeight - r.top + 8 : undefined,
      left: align === "right" ? r.right - (resolvedWidth === "auto" ? 0 : resolvedWidth) : r.left,
      width: resolvedWidth,
    });
  }, [open, align, width, matchTrigger, upward]);

  /** Origin-aware : map align + upward → data-origin du skill */
  const origin = (() => {
    const v = upward ? "bottom" : "top";
    const h = align === "right" ? "right" : "left";
    return `${v}-${h}` as const;
  })();

  return (
    <DropdownCtx.Provider value={{ close: closeDropdown }}>
      <div ref={triggerRef} onClick={toggle}>
        {typeof trigger === "function" ? trigger(mounted && open) : trigger}
      </div>

      {mounted && typeof window !== "undefined" && createPortal(
        <>
          <div className="fixed inset-0 z-[1100]" onClick={closeDropdown} />
          <div
            data-origin={origin}
            className={`t-dropdown ${open ? "is-open" : "is-closing"} fixed z-[1101] flex flex-col gap-0.5 rounded-2xl p-2 shadow-[var(--shadow-floating)]`}
            style={{
              top: coords.top,
              bottom: coords.bottom,
              left: coords.left,
              width: coords.width === "auto" ? undefined : coords.width,
              whiteSpace: coords.width === "auto" ? "nowrap" : undefined,
              backgroundColor: "var(--dropdown-bg)",
              backdropFilter: "saturate(180%) blur(24px)",
              WebkitBackdropFilter: "saturate(180%) blur(24px)",
            }}
          >
            {children}
          </div>
        </>,
        document.body
      )}
    </DropdownCtx.Provider>
  );
}

export function DropdownItem({
  onClick, danger = false, icon: Icon, selected = false, keepOpen = false, checkbox = false, children,
}: {
  onClick?: () => void;
  danger?: boolean;
  icon?: React.ElementType;
  /** When true, marks the item as selected (single-select : check à droite ;
   *  mode `checkbox` : case cochée à gauche). */
  selected?: boolean;
  /** Si true : ne ferme PAS le dropdown au clic. Indispensable pour les
   *  filtres multi-select où on veut cocher plusieurs items à la suite. */
  keepOpen?: boolean;
  /** Mode multi-select : affiche une case à cocher DS à gauche (au lieu du
   *  check à droite du single-select). À utiliser conjointement à `keepOpen`. */
  checkbox?: boolean;
  children: ReactNode;
}) {
  const { close } = useContext(DropdownCtx);
  const iconColor = danger ? "currentColor" : "var(--text-secondary)";
  // Style neutre : hover bg uniquement, pas de border ni de fond coloré sur la
  // ligne. L'état sélectionné se lit via la case à cocher (multi-select) ou le
  // check à droite (single-select).
  return (
    <button
      onClick={() => { onClick?.(); if (!keepOpen) close(); }}
      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[14px] font-medium transition-colors hover:bg-[var(--dropdown-hover)] ${danger ? "text-[var(--color-danger)]" : "text-[var(--text-primary)]"}`}
    >
      {checkbox && (
        <span
          aria-hidden
          className={`flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[6px] border transition-colors ${
            selected
              ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]"
              : "border-[var(--border-medium)] bg-transparent"
          }`}
        >
          {selected && <CheckIcon className="h-3 w-3 text-white" strokeWidth={3} />}
        </span>
      )}
      {Icon && <Icon className="h-5 w-5 flex-shrink-0" style={{ color: iconColor }} />}
      <span className="flex-1 text-left">{children}</span>
      {!checkbox && selected && <CheckIcon className="h-4 w-4 flex-shrink-0 text-[var(--accent-primary)]" strokeWidth={2.5} />}
    </button>
  );
}

export function DropdownSeparator() {
  return <div className="my-1.5 border-t border-[var(--border-subtle)]" />;
}

/** Hook utilisable depuis n'importe quel enfant d'un DropdownMenu pour fermer le panneau. */
export function useDropdownClose() {
  return useContext(DropdownCtx).close;
}

/**
 * Header for a DropdownMenu — titre 13px muted avec séparateur full-width intégré.
 * Place comme premier enfant de `<DropdownMenu>` (ou au-dessus d'un groupe d'items).
 * Le `-mx-2 -mt-2 mb-2` annule le `p-2` du DropdownMenu pour obtenir un border-bottom edge-to-edge.
 */
export function DropdownHeader({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-2 -mt-2 mb-2 border-b border-[var(--border-subtle)] px-3 py-2 text-[13px] font-medium text-[var(--text-muted)]">
      {children}
    </div>
  );
}
