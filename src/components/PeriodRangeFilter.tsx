"use client";

/**
 * PeriodRangeFilter — filtre de période à deux panneaux (DS).
 *
 * Panneau 1 : liste de presets + entrée « Personnalisée › ».
 * Au clic sur « Personnalisée », glissement vers la droite : le popover
 * s'agrandit et devient le calendrier de plage (`RangeCalendar`), avec un
 * retour (‹). Après validation, le parent affiche la plage choisie.
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronDownIcon, ChevronRightIcon, ChevronLeftIcon, CheckIcon } from "@heroicons/react/24/outline";
import { RangeCalendar } from "@/components/RangeCalendar";
import { Button } from "@/components/Button";

export type PeriodPreset = { value: string; label: string };

const LIST_W = 240;
const CAL_W = 344;

export function PeriodRangeFilter({
  presets,
  value,
  label,
  active = false,
  onSelectPreset,
  customFrom,
  customTo,
  onApplyCustom,
}: {
  presets: PeriodPreset[];
  /** Valeur du preset courant, ou "custom". */
  value: string;
  /** Libellé affiché sur la pill (plage lisible si personnalisée). */
  label: string;
  active?: boolean;
  onSelectPreset: (value: string) => void;
  customFrom?: string;
  customTo?: string;
  onApplyCustom: (from: string, to: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<"list" | "calendar">("list");
  const [draftFrom, setDraftFrom] = useState<string | undefined>(customFrom || undefined);
  const [draftTo, setDraftTo] = useState<string | undefined>(customTo || undefined);

  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const calRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState<{ w: number; h: number }>({ w: LIST_W, h: 220 });
  // Transition désactivée tant que la 1ʳᵉ mesure n'est pas faite → pas de
  // « saut » de hauteur à l'ouverture (on ajuste avant, on anime ensuite).
  const [ready, setReady] = useState(false);

  // Fermeture au clic extérieur.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // À l'ouverture : retour au panneau liste + reprise de la plage courante.
  useEffect(() => {
    if (open) {
      setPanel("list");
      setDraftFrom(customFrom || undefined);
      setDraftTo(customTo || undefined);
    }
  }, [open, customFrom, customTo]);

  // Mesure du panneau actif → anime largeur + hauteur du popover.
  // ResizeObserver : ré-adapte la hauteur quand le calendrier change de mois
  // (5 ↔ 6 lignes) ou tout autre changement de contenu.
  useLayoutEffect(() => {
    if (!open) { setReady(false); return; }
    const el = panel === "list" ? listRef.current : calRef.current;
    if (!el) return;
    const measure = () => setDims({ w: el.offsetWidth, h: el.offsetHeight });
    measure(); // ajuste la taille avant peinture (aucune animation d'ouverture)
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const raf = requestAnimationFrame(() => setReady(true)); // anime les changements suivants
    return () => { ro.disconnect(); cancelAnimationFrame(raf); };
  }, [panel, open]);

  function apply() {
    if (draftFrom && draftTo) {
      onApplyCustom(draftFrom, draftTo);
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 type-label transition-colors ${
          active
            ? "border-[var(--accent-primary-mid)] bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]"
            : "border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--border-medium)]"
        }`}
      >
        {label}
        <ChevronDownIcon className="h-3.5 w-3.5 opacity-70 transition-transform" style={{ transform: open ? "rotate(180deg)" : "" }} />
      </button>

      {open && (
        <div
          className={`absolute left-0 z-50 mt-2 overflow-hidden rounded-2xl border border-[var(--border-subtle)] shadow-[var(--shadow-floating)] ${ready ? "transition-[width,height] duration-300 ease-out" : ""}`}
          style={{ width: dims.w, height: dims.h, backgroundColor: "var(--dropdown-bg)" }}
        >
          <div
            className="flex items-start"
            style={{ transform: panel === "calendar" ? `translateX(-${LIST_W}px)` : "translateX(0)", transition: "transform 300ms ease-out" }}
          >
            {/* Panneau 1 — presets */}
            <div ref={listRef} className="flex-shrink-0 p-1.5" style={{ width: LIST_W }}>
              {presets.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => { onSelectPreset(p.value); setOpen(false); }}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left type-label transition-colors hover:bg-[var(--bg-secondary)]"
                >
                  <span className={value === p.value ? "font-semibold text-[var(--text-primary)]" : "text-[var(--text-primary)]"}>{p.label}</span>
                  {value === p.value && <CheckIcon className="h-4 w-4 flex-shrink-0 text-[var(--accent-primary)]" strokeWidth={2.5} />}
                </button>
              ))}
              {/* Personnalisée → ouvre le calendrier */}
              <button
                type="button"
                onClick={() => setPanel("calendar")}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 type-label transition-colors hover:bg-[var(--bg-secondary)]"
              >
                <span className={value === "custom" ? "font-semibold text-[var(--text-primary)]" : "text-[var(--text-primary)]"}>Personnalisée</span>
                <ChevronRightIcon className="h-4 w-4 flex-shrink-0 text-[var(--text-muted)]" />
              </button>
            </div>

            {/* Panneau 2 — calendrier de plage */}
            <div ref={calRef} className="flex-shrink-0 p-3" style={{ width: CAL_W }}>
              <div className="mb-2 px-1">
                <span className="type-label text-[var(--text-primary)]">Période personnalisée</span>
              </div>
              <RangeCalendar from={draftFrom} to={draftTo} onChange={(f, t) => { setDraftFrom(f); setDraftTo(t); }} />
              <div className="mt-2 flex items-center justify-between gap-2">
                {/* Retour au panneau presets */}
                <button
                  type="button"
                  onClick={() => setPanel("list")}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 type-caption transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  Retour
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setDraftFrom(undefined); setDraftTo(undefined); }}
                    disabled={!draftFrom && !draftTo}
                    className="rounded-full bg-[var(--color-danger-bg)] px-3 py-1.5 type-caption text-[var(--color-danger)] transition-opacity hover:opacity-80 disabled:opacity-40"
                  >
                    Effacer
                  </button>
                  <Button size="sm" onClick={apply} disabled={!draftFrom || !draftTo}>Appliquer</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
