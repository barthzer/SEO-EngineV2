"use client";

/**
 * RangeCalendar — sélecteur de dates (DS).
 *
 * Grille mensuelle épurée, navigation mois précédent/suivant. Deux modes :
 *   - `range` (défaut) : sélection d'une plage début→fin avec surbrillance continue.
 *   - `single` : sélection d'une seule date.
 * Aucune dépendance externe : dates en ISO `yyyy-mm-dd` (comparaison lexicale sûre).
 */

import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const WEEKDAYS = ["lu", "ma", "me", "je", "ve", "sa", "di"];
const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

/** Index lundi=0 … dimanche=6 du 1er jour du mois. */
function firstWeekdayMonday(y: number, m: number): number {
  return (new Date(y, m, 1).getDay() + 6) % 7;
}

type RangeProps = {
  mode?: "range";
  from?: string;
  to?: string;
  onChange: (from?: string, to?: string) => void;
};
type SingleProps = {
  mode: "single";
  /** Date sélectionnée (ISO). */
  value?: string;
  onChange: (date: string) => void;
};

export function RangeCalendar(props: RangeProps | SingleProps) {
  const single = props.mode === "single";
  const from = single ? props.value : props.from;
  const to = single ? undefined : props.to;

  // Mois affiché : dérivé de la date sélectionnée sinon aujourd'hui.
  const seed = from ? new Date(from) : new Date();
  const [view, setView] = useState({ y: seed.getFullYear(), m: seed.getMonth() });
  const todayIso = (() => {
    const t = new Date();
    return iso(t.getFullYear(), t.getMonth(), t.getDate());
  })();

  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const lead = firstWeekdayMonday(view.y, view.m);
  const cells: (string | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => iso(view.y, view.m, i + 1)),
  ];

  function pick(day: string) {
    if (props.mode === "single") {
      props.onChange(day);
      return;
    }
    if (!from || (from && to)) {
      props.onChange(day, undefined); // (re)commence une plage
    } else if (day < from) {
      props.onChange(day, from);
    } else {
      props.onChange(from, day);
    }
  }

  const step = (delta: number) =>
    setView((v) => {
      const m = v.m + delta;
      return { y: v.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 };
    });

  const inRange = (d: string) => !single && from && to && d > from && d < to;
  const isEndpoint = (d: string) => d === from || d === to;

  return (
    <div className="w-[300px] select-none">
      {/* En-tête : mois + navigation */}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Mois précédent"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <span className="type-title capitalize">
          {MONTHS[view.m]} {view.y}
        </span>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Mois suivant"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>

      {/* En-têtes de jours */}
      <div className="mb-1 grid grid-cols-7 gap-y-1">
        {WEEKDAYS.map((w) => (
          <span key={w} className="text-center type-micro capitalize">{w}</span>
        ))}
      </div>

      {/* Grille */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((d, i) => {
          if (!d) return <span key={`e${i}`} />;
          const day = Number(d.slice(-2));
          const endpoint = isEndpoint(d);
          const between = inRange(d);
          return (
            <div key={d} className="flex justify-center">
              <button
                type="button"
                onClick={() => pick(d)}
                className={`relative flex h-9 w-9 items-center justify-center rounded-lg type-body-sm tabular-nums transition-colors ${
                  endpoint
                    ? "bg-[var(--accent-primary)] font-semibold text-white"
                    : between
                      ? "bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]"
                      : "text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                } ${!endpoint && d === todayIso ? "ring-1 ring-inset ring-[var(--border-medium)]" : ""}`}
              >
                {day}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
