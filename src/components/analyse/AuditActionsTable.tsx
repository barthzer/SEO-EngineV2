"use client";

/**
 * AuditActionsTable — bloc « Actions prioritaires » d'un onglet d'audit, rendu
 * dans le style tableau du module Actions (TableWide + PriorityBadge partagés).
 * En-tête : titre + pastille compteur + lien « voir dans les actions » (filtré).
 */

import { TableWide } from "@/components/TableWide";
import { PriorityBadge, type ActionPriorityLevel } from "@/components/PriorityBars";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

export type AuditAction = {
  id: number;
  title: string;
  sub: string;
  category: string;
  priority: string; // "high" | "medium" | "low" (source parfois typée string)
  effort: string;
};

function toLevel(p: string): ActionPriorityLevel {
  return p === "high" ? "high" : p === "low" ? "low" : "mid";
}

/** Chip catégorie neutre — même langage visuel que le CategoryChip du module Actions. */
function CategoryChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[var(--bg-subtle)] px-2 py-1 text-[12px] font-medium text-[var(--text-primary)]">
      {label}
    </span>
  );
}

export function AuditActionsTable({ actions, onSeeActions }: { actions: AuditAction[]; onSeeActions?: () => void }) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <h3 className="type-title">Actions prioritaires</h3>
          <span className="rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 text-[12px] font-medium tabular-nums text-[var(--text-secondary)]">{actions.length}</span>
        </div>
        <button
          type="button"
          onClick={onSeeActions}
          className="type-label inline-flex items-center gap-1 transition-colors hover:text-[var(--text-primary)]"
        >
          voir dans les actions
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
        <TableWide<AuditAction>
          hidePagination
          rowKey={(a) => a.id}
          data={actions}
          columns={[
            { key: "title", header: "Nom", width: 320, flex: true,
              render: (a) => (
                <div className="min-w-0">
                  <p className="type-body-strong truncate">{a.title}</p>
                  <p className="type-caption truncate">{a.sub}</p>
                </div>
              ) },
            { key: "category", header: "Catégorie", width: 170, render: (a) => <CategoryChip label={a.category} /> },
            { key: "priority", header: "Priorité", width: 110, render: (a) => <PriorityBadge level={toLevel(a.priority)} /> },
            { key: "effort", header: "Effort", width: 90, align: "right", render: (a) => <span className="type-label tabular-nums text-[var(--text-primary)]">{a.effort}</span> },
          ]}
        />
      </div>
    </div>
  );
}
