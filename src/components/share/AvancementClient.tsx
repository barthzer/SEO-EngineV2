"use client";

/**
 * AvancementClient — vue "Avancement" du portail client.
 *
 * Pattern Linear : sections groupées par statut (Livré / En cours / Planifié),
 * lignes denses, filtres + search. Scalable de 10 à 100+ actions.
 *
 * 100% composants DS : Panel, TaskGroup, TaskRow, FilterTabs, SearchInput.
 */

import { useMemo, useState } from "react";
import {
  CheckCircleIcon,
  ClockIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { TaskGroup } from "@/components/TaskGroup";
import { TaskRow } from "@/components/TaskRow";
import { SearchInput } from "@/components/SearchInput";
import { FilterTabs } from "@/components/FilterTabs";
import { CommentThread } from "@/components/CommentThread";
import { useTaskDone, setTaskDone, clearTaskDone } from "@/lib/clientTasks";
import { deriveInitials } from "@/lib/agency-branding";
import type { SharedAction, SharedProject } from "@/data/sharedProjects";
import { formatDate } from "@/components/share/formatters";

/** Bas de ligne déplié : validation (si mission assignée au client) + commentaires. */
function ActionRowFooter({ action, domain, clientName }: { action: SharedAction; domain: string; clientName: string }) {
  const done = useTaskDone(domain, action.id);
  const author = { name: clientName, initials: deriveInitials(clientName) };
  return (
    <div className="flex flex-col gap-4">
      {action.assignedToClient && (
        <div className="flex items-center gap-2">
          {done ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-success-bg)] px-2.5 py-1 type-caption font-medium text-[var(--color-success)]">
                <CheckCircleIcon className="h-4 w-4" /> Fait
              </span>
              <button
                type="button"
                onClick={() => clearTaskDone(domain, action.id)}
                className="type-caption text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
              >
                Annuler
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setTaskDone(domain, action.id, clientName)}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 type-caption font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--color-success)" }}
            >
              <CheckCircleIcon className="h-4 w-4" /> Marquer comme fait
            </button>
          )}
        </div>
      )}
      <CommentThread
        target={{ type: "action", id: action.id, label: action.title }}
        domain={domain}
        author={author}
      />
    </div>
  );
}

type Filter = "all" | "livré" | "en cours" | "en attente";

const STATUS_COLORS: Record<SharedAction["status"], string> = {
  "livré":      "var(--color-success)",
  "en cours":   "var(--color-warning)",
  "en attente": "var(--text-muted)",
};

export function AvancementClient({ project }: { project: SharedProject }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }
  function markSelectedDone() {
    selected.forEach((id) => setTaskDone(project.domain, id, project.clientName));
    setSelected(new Set());
  }

  const q = search.trim().toLowerCase();
  const matches = (a: SharedAction) =>
    q === "" ||
    a.title.toLowerCase().includes(q) ||
    a.clientNarrative.toLowerCase().includes(q);

  const groups = useMemo(() => {
    return {
      delivered:  project.actionsDelivered.filter(matches),
      inProgress: project.actionsInProgress.filter(matches),
      nextSteps:  project.nextSteps.filter(matches),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, q]);

  const showDelivered  = filter === "all" || filter === "livré";
  const showInProgress = filter === "all" || filter === "en cours";
  const showNextSteps  = filter === "all" || filter === "en attente";

  const totalFiltered =
    (showDelivered  ? groups.delivered.length  : 0) +
    (showInProgress ? groups.inProgress.length : 0) +
    (showNextSteps  ? groups.nextSteps.length  : 0);

  return (
    <div className="w-full px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="type-h1">
          Avancement
        </h1>
        <p className="mt-1 type-body-sm">
          Toutes les actions en cours d&apos;exécution sur votre prestation
        </p>
      </div>

      {/* Toolbar : search + filters */}
      <div className="mb-4 flex items-center gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Rechercher dans les actions…"
          alwaysExpanded
        />
        <FilterTabs<Filter>
          tabs={[
            { key: "all",        label: "Tout",     count: project.actionsDelivered.length + project.actionsInProgress.length + project.nextSteps.length },
            { key: "livré",      label: "Livré",    count: project.actionsDelivered.length },
            { key: "en cours",   label: "En cours", count: project.actionsInProgress.length },
            { key: "en attente", label: "Planifié", count: project.nextSteps.length },
          ]}
          value={filter}
          onChange={setFilter}
        />
      </div>

      {/* Barre d'action groupée — missions assignées au client */}
      {selected.size > 0 && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-[var(--border-medium)] bg-[var(--bg-subtle)] px-4 py-2.5">
          <span className="type-label text-[var(--text-primary)]">
            {selected.size} mission{selected.size > 1 ? "s" : ""} sélectionnée{selected.size > 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={markSelectedDone}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 type-caption font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--color-success)" }}
            >
              <CheckCircleIcon className="h-4 w-4" /> Marquer comme fait
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="type-caption font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {totalFiltered === 0 && (
        <div className="rounded-2xl border border-[var(--border-subtle)] px-6 py-16 text-center type-body text-[var(--text-muted)]">
          {q
            ? `Aucune action ne contient « ${search} ».`
            : "Aucune action dans ce statut pour le moment."}
        </div>
      )}

      {/* Groups */}
      <div className="flex flex-col gap-3">
        {showDelivered && groups.delivered.length > 0 && (
          <TaskGroup
            label="Livré"
            count={groups.delivered.length}
            color="var(--color-success)"
            icon={CheckCircleIcon}
          >
            {groups.delivered.map((a, i, arr) => (
              <TaskRow
                key={a.id}
                title={a.title}
                statusColor={STATUS_COLORS[a.status]}
                owner={a.owner}
                date={`Livré le ${formatDate(a.date)}`}
                description={a.clientNarrative}
                evidenceUrl={a.evidenceUrl}
                footer={<ActionRowFooter action={a} domain={project.domain} clientName={project.clientName} />}
                selectable={!!a.assignedToClient}
                selected={selected.has(a.id)}
                onSelectChange={() => toggleSelect(a.id)}
                isLast={i === arr.length - 1}
              />
            ))}
          </TaskGroup>
        )}

        {showInProgress && groups.inProgress.length > 0 && (
          <TaskGroup
            label="En cours"
            count={groups.inProgress.length}
            color="var(--color-warning)"
            icon={ClockIcon}
          >
            {groups.inProgress.map((a, i, arr) => (
              <TaskRow
                key={a.id}
                title={a.title}
                statusColor={STATUS_COLORS[a.status]}
                owner={a.owner}
                date={`Prévu ${formatDate(a.date)}`}
                description={a.clientNarrative}
                evidenceUrl={a.evidenceUrl}
                footer={<ActionRowFooter action={a} domain={project.domain} clientName={project.clientName} />}
                selectable={!!a.assignedToClient}
                selected={selected.has(a.id)}
                onSelectChange={() => toggleSelect(a.id)}
                isLast={i === arr.length - 1}
              />
            ))}
          </TaskGroup>
        )}

        {showNextSteps && groups.nextSteps.length > 0 && (
          <TaskGroup
            label="Planifié"
            count={groups.nextSteps.length}
            color="var(--text-muted)"
            icon={ArrowRightIcon}
            defaultExpanded={false}
          >
            {groups.nextSteps.map((a, i, arr) => (
              <TaskRow
                key={a.id}
                title={a.title}
                statusColor={STATUS_COLORS[a.status]}
                owner={a.owner}
                date={`Prévu ${formatDate(a.date)}`}
                description={a.clientNarrative}
                evidenceUrl={a.evidenceUrl}
                footer={<ActionRowFooter action={a} domain={project.domain} clientName={project.clientName} />}
                selectable={!!a.assignedToClient}
                selected={selected.has(a.id)}
                onSelectChange={() => toggleSelect(a.id)}
                isLast={i === arr.length - 1}
              />
            ))}
          </TaskGroup>
        )}
      </div>
    </div>
  );
}
