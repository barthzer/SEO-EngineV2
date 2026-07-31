"use client";

import type { ReactNode } from "react";

/**
 * MeetingTile — tile élégante "Prochain rendez-vous" inspiration calendrier.
 *
 * Visual : page de calendrier avec gros jour + mois en uppercase + jour de
 * semaine, et à droite (ou en dessous) le sujet et l'heure du RDV.
 *
 * Pensé pour occuper élégamment un Panel 1fr d'un dashboard, contrairement
 * à du texte top-left aligné qui flotte mal.
 *
 * @example
 *   <Panel>
 *     <MeetingTile
 *       date="2026-05-26"
 *       topic="Présentation rapport mensuel"
 *       time="9h30"
 *       action={<Link href="...">Voir tous les RDV →</Link>}
 *     />
 *   </Panel>
 */

interface MeetingTileProps {
  /** Date ISO du RDV. */
  date: string;
  /** Sujet/intitulé du RDV. */
  topic: string;
  /** Heure optionnelle (ex. "9h30"). */
  time?: string;
  /** Layout : "horizontal" (calendrier à gauche + texte à droite) ou "vertical" (calendrier centré + texte en dessous). Défaut "vertical". */
  layout?: "horizontal" | "vertical";
  /** Slot action en bas (ex. lien "Voir tous les RDV"). */
  action?: ReactNode;
}

const MONTHS_SHORT = ["JAN", "FÉV", "MAR", "AVR", "MAI", "JUIN", "JUIL", "AOÛT", "SEP", "OCT", "NOV", "DÉC"];
const DAYS_LONG = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

function CalendarPage({ date, size = "md" }: { date: Date; size?: "md" | "lg" }) {
  const dims = size === "lg" ? "h-28 w-28" : "h-20 w-20";
  const monthH = size === "lg" ? "h-7 text-[11px]" : "h-6 text-[10px]";
  const dayText = size === "lg" ? "text-[44px]" : "text-[28px]";
  return (
    <div className={`flex ${dims} flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] shadow-[0_1px_2px_rgba(15,23,42,0.04)]`}>
      <div
        className={`flex ${monthH} items-center justify-center font-semibold uppercase tracking-[0.14em] text-white`}
        style={{ backgroundColor: "var(--accent-primary)" }}
      >
        {MONTHS_SHORT[date.getMonth()]}
      </div>
      <div className="flex flex-1 items-center justify-center">
        <span className={`${dayText} font-semibold leading-none tabular-nums tracking-heading text-[var(--text-primary)]`}>
          {date.getDate()}
        </span>
      </div>
    </div>
  );
}

export function MeetingTile({
  date,
  topic,
  time,
  layout = "vertical",
  action,
}: MeetingTileProps) {
  const d = new Date(date);
  const weekday = DAYS_LONG[d.getDay()];

  if (layout === "horizontal") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <CalendarPage date={d} />
          <div className="min-w-0 flex-1">
            <p className="type-micro uppercase tracking-wider">
              Prochain rendez-vous
            </p>
            <h3 className="mt-1 type-title leading-tight">
              {topic}
            </h3>
            <p className="mt-1 type-caption capitalize">
              {weekday}
              {time ? ` · ${time}` : ""}
            </p>
          </div>
        </div>
        {action && <div className="-mt-1">{action}</div>}
      </div>
    );
  }

  // Vertical (centré) — surface autonome avec petit bg + grid décorative.
  return (
    <div
      className="relative flex h-full flex-col items-center gap-5 overflow-hidden rounded-2xl bg-[var(--bg-card-static)] px-6 py-7 text-center"
    >
      {/* Grid pattern décoratif — fondu radial pour éviter l'effet "papier quadrillé" */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          backgroundPosition: "-1px -1px",
          opacity: 0.55,
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 78%)",
        }}
      />
      {/* Titre intégré + contenu */}
      <h3 className="relative type-title">
        Prochain rendez-vous
      </h3>
      <div className="relative flex flex-1 flex-col items-center justify-center gap-4">
        <CalendarPage date={d} size="lg" />
        <div>
          <p className="type-title capitalize">
            {weekday} {d.getDate()} {MONTHS_SHORT[d.getMonth()].toLowerCase()}
            {time ? ` · ${time}` : ""}
          </p>
          <p className="mt-1 type-caption leading-relaxed">
            {topic}
          </p>
        </div>
      </div>
      {action && <div className="relative">{action}</div>}
    </div>
  );
}
