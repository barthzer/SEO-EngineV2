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

export function DropdownMenu({ trigger, children, align = "left", width = 240, matchTrigger = false, upward = false }: Props) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top?: number; bottom?: number; left: number; width: number | "auto" }>({ left: 0, width });
  const triggerRef = useRef<HTMLDivElement>(null);

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

  return (
    <DropdownCtx.Provider value={{ close: () => setOpen(false) }}>
      <div ref={triggerRef} onClick={() => setOpen((o) => !o)}>
        {typeof trigger === "function" ? trigger(open) : trigger}
      </div>

      {open && typeof window !== "undefined" && createPortal(
        <>
          <div className="fixed inset-0 z-[1100]" onClick={() => setOpen(false)} />
          <div
            className="fixed z-[1101] rounded-2xl p-2 shadow-[var(--shadow-floating)]"
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
  onClick, danger = false, icon: Icon, selected = false, children,
}: {
  onClick?: () => void;
  danger?: boolean;
  icon?: React.ElementType;
  /** When true, renders a check icon on the right (use for sort / filter dropdowns) */
  selected?: boolean;
  children: ReactNode;
}) {
  const { close } = useContext(DropdownCtx);
  const iconColor = danger ? "currentColor" : "var(--text-secondary)";
  return (
    <button
      onClick={() => { onClick?.(); close(); }}
      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[14px] font-medium transition-colors hover:bg-[var(--bg-secondary)] ${danger ? "text-[#E11D48]" : "text-[var(--text-primary)]"}`}
    >
      {Icon && <Icon className="h-5 w-5 flex-shrink-0" style={{ color: iconColor }} />}
      <span className="flex-1 text-left">{children}</span>
      {selected && <CheckIcon className="h-4 w-4 flex-shrink-0 text-[var(--text-primary)]" strokeWidth={2.5} />}
    </button>
  );
}

export function DropdownSeparator() {
  return <div className="my-1.5 border-t border-[var(--border-subtle)]" />;
}

/**
 * Tertiary header for a DropdownMenu — small uppercase-tracking caption
 * to introduce a section / explain what the menu does (e.g. "Trier par").
 * Place as the first child of `<DropdownMenu>` (or above an items group).
 */
export function DropdownHeader({ children }: { children: ReactNode }) {
  return (
    <div className="px-3 pt-2 pb-1 text-[11px] font-medium tracking-caption text-[var(--text-muted)]">
      {children}
    </div>
  );
}
