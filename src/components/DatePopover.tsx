"use client";

/**
 * DatePopover — sélecteur d'une date unique (DS), via `RangeCalendar` en mode single.
 *
 * Rend le trigger fourni (render-prop) + un popover calendrier ancré dessous.
 * Remplace les <input type="date"> natifs pour un rendu cohérent avec le reste
 * de l'app (mêmes calendriers que le filtre de période).
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { RangeCalendar } from "@/components/RangeCalendar";
import { Button } from "@/components/Button";

export function DatePopover({
  value,
  onChange,
  align = "left",
  confirm = false,
  children,
}: {
  value?: string;
  onChange: (date: string | undefined) => void;
  align?: "left" | "right";
  /** Si vrai : la date choisie n'est appliquée qu'au clic sur « Enregistrer ». */
  confirm?: boolean;
  children: (args: { open: boolean; toggle: () => void }) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string | undefined>(value);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const anchorRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  // À l'ouverture, le brouillon reprend la valeur courante.
  useEffect(() => { if (open) setDraft(value); }, [open, value]);

  // Positionnement en portail (évite les clips par overflow des modales/tables).
  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    const width = 348;
    const left = align === "right" ? r.right - width : r.left;
    setPos({ top: r.bottom + 8, left: Math.max(8, left) });
  }, [open, align]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (anchorRef.current?.contains(t) || popRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={anchorRef} className="inline-block">
      {children({ open, toggle: () => setOpen((o) => !o) })}
      {open && typeof document !== "undefined" && createPortal(
        <div
          ref={popRef}
          className="fixed z-[1100] rounded-2xl border border-[var(--border-subtle)] p-3 shadow-[var(--shadow-floating)]"
          style={{ top: pos.top, left: pos.left, backgroundColor: "var(--dropdown-bg)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {confirm ? (
            <>
              <RangeCalendar mode="single" value={draft} onChange={(d) => setDraft(d)} />
              <div className="mt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setDraft(undefined)}
                  disabled={!draft}
                  className="type-caption text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] disabled:opacity-40"
                >
                  Effacer
                </button>
                <Button size="sm" onClick={() => { onChange(draft); setOpen(false); }} disabled={draft === value}>
                  Enregistrer
                </Button>
              </div>
            </>
          ) : (
            <>
              <RangeCalendar mode="single" value={value} onChange={(d) => { onChange(d); setOpen(false); }} />
              {value && (
                <button
                  type="button"
                  onClick={() => { onChange(undefined); setOpen(false); }}
                  className="mt-1 w-full rounded-lg py-1.5 text-center type-caption text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                >
                  Effacer la date
                </button>
              )}
            </>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
}
