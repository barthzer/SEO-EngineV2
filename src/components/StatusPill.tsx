"use client";

import { DropdownMenu, DropdownItem, DropdownHeader } from "@/components/DropdownMenu";

export type Status = "todo" | "doing" | "done";

export const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; text: string }> = {
  todo:  { label: "À faire",  color: "var(--text-muted)", bg: "var(--bg-subtle)",           text: "var(--text-primary)"   },
  doing: { label: "En cours", color: "#F59E0B",            bg: "rgba(245,158,11,0.09)",      text: "#B45309"               },
  done:  { label: "Terminé",  color: "#10B981",            bg: "rgba(16,185,129,0.09)",      text: "#059669"               },
};

/** Status pill — pill ronde avec dot couleur à gauche */
export function StatusPill({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[12px] font-medium"
      style={{ color: cfg.text, backgroundColor: cfg.bg }}
    >
      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: cfg.color }} />
      {cfg.label}
    </span>
  );
}

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
      width={180}
      trigger={
        <button
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[12px] font-medium transition-opacity hover:opacity-80"
          style={{ color: cfg.text, backgroundColor: cfg.bg }}
        >
          <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: cfg.color }} />
          {cfg.label}
        </button>
      }
    >
      <DropdownHeader>Choisir le statut</DropdownHeader>
      {(["todo", "doing", "done"] as Status[]).map((s) => {
        const c = STATUS_CONFIG[s];
        return (
          <DropdownItem key={s} onClick={() => onChange(s)} selected={status === s}>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[12px] font-medium"
              style={{ color: c.text, backgroundColor: c.bg }}
            >
              <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
              {c.label}
            </span>
          </DropdownItem>
        );
      })}
    </DropdownMenu>
  );
}
