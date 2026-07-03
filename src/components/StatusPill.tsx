"use client";

/**
 * StatusPill — pill d'état d'une ActionCard.
 *
 * B1 — passage de 2/3 statuts (todo/doing/done) à 5 (alignés sur l'enum
 * Drizzle `action_status` côté DB) :
 *
 *  - todo            À faire
 *  - in_progress     En cours
 *  - blocked_client  Bloqué côté client
 *  - done            Livré
 *  - abandoned       Abandonné
 *
 * Le cycle binaire todo↔done est mort. Une action SEO en agence passe par
 * un cycle riche avec preuve d'implémentation, ce qui demande un statut
 * "en attente client" distinct du simple "en cours".
 */

import { DropdownMenu, DropdownItem, DropdownHeader } from "@/components/DropdownMenu";

export type Status =
  | "todo"
  | "in_progress"
  | "blocked_client"
  | "done"
  | "abandoned";

export const STATUS_ORDER: Status[] = [
  "todo",
  "in_progress",
  "blocked_client",
  "done",
  "abandoned",
];

export const STATUS_CONFIG: Record<
  Status,
  { label: string; color: string; bg: string; text: string }
> = {
  todo: {
    label: "À faire",
    color: "var(--text-muted)",
    bg: "var(--bg-subtle)",
    text: "var(--text-primary)",
  },
  in_progress: {
    label: "En cours",
    color: "var(--color-warning)",
    bg: "rgba(245,158,11,0.09)",
    text: "#B45309",
  },
  blocked_client: {
    label: "Bloqué client",
    color: "#A855F7",
    bg: "rgba(168,85,247,0.10)",
    text: "#7E22CE",
  },
  done: {
    label: "Livré",
    color: "var(--color-success)",
    bg: "var(--color-success-bg)",
    text: "var(--color-success)",
  },
  abandoned: {
    label: "Abandonné",
    color: "var(--color-danger)",
    bg: "var(--color-danger-bg)",
    text: "var(--color-danger)",
  },
};

/** Status pill — pill ronde avec dot couleur à gauche. Read-only. */
export function StatusPill({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[12px] font-medium"
      style={{
        color: cfg.text,
        backgroundColor: cfg.bg,
        textDecoration: status === "abandoned" ? "line-through" : undefined,
      }}
    >
      <span
        className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
        style={{ backgroundColor: cfg.color }}
      />
      {cfg.label}
    </span>
  );
}

/** Status pill + dropdown — pour éditer le statut. */
export function StatusPillDropdown({
  status,
  onChange,
}: {
  status: Status;
  onChange: (next: Status) => void;
}) {
  const cfg = STATUS_CONFIG[status];
  return (
    <DropdownMenu
      width={200}
      trigger={
        <button
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[12px] font-medium transition-opacity hover:opacity-80"
          style={{
            color: cfg.text,
            backgroundColor: cfg.bg,
            textDecoration: status === "abandoned" ? "line-through" : undefined,
          }}
        >
          <span
            className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
            style={{ backgroundColor: cfg.color }}
          />
          {cfg.label}
        </button>
      }
    >
      <DropdownHeader>Choisir le statut</DropdownHeader>
      {STATUS_ORDER.map((s) => {
        const c = STATUS_CONFIG[s];
        return (
          <DropdownItem
            key={s}
            onClick={() => onChange(s)}
            selected={status === s}
          >
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[12px] font-medium"
              style={{
                color: c.text,
                backgroundColor: c.bg,
                textDecoration: s === "abandoned" ? "line-through" : undefined,
              }}
            >
              <span
                className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: c.color }}
              />
              {c.label}
            </span>
          </DropdownItem>
        );
      })}
    </DropdownMenu>
  );
}
