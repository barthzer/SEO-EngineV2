"use client";

import { CheckIcon } from "@heroicons/react/24/outline";
import { DropdownMenu, DropdownItem } from "@/components/DropdownMenu";

export type Status = "todo" | "doing" | "done";

export const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string }> = {
  todo:  { label: "À faire",  color: "var(--text-muted)", bg: "var(--bg-subtle)"           },
  doing: { label: "En cours", color: "#F59E0B",            bg: "rgba(245,158,11,0.09)"      },
  done:  { label: "Terminé",  color: "#10B981",            bg: "rgba(16,185,129,0.09)"      },
};

export function StatusPill({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium"
      style={{ color: cfg.color, backgroundColor: cfg.bg }}
    >
      {status === "done" && <CheckIcon className="h-3 w-3" />}
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
      trigger={
        <button
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-opacity hover:opacity-80"
          style={{ color: cfg.color, backgroundColor: cfg.bg }}
        >
          {status === "done" && <CheckIcon className="h-3 w-3" />}
          {cfg.label}
        </button>
      }
    >
      {(["todo", "doing", "done"] as Status[]).map((s) => (
        <DropdownItem key={s} onClick={() => onChange(s)}>
          <span style={{ color: STATUS_CONFIG[s].color }}>{STATUS_CONFIG[s].label}</span>
        </DropdownItem>
      ))}
    </DropdownMenu>
  );
}
