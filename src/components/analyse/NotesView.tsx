"use client";

/**
 * NotesView — onglet "Notes" du projet (tab=notes).
 *
 * Flux agrégé : rassemble TOUS les commentaires du projet (notes générales +
 * commentaires contextuels postés sur les ActionCards et les analyses). Chaque
 * entrée porte une puce vers sa source. Composeur en haut pour une note générale.
 *
 * Source de vérité partagée avec les fils contextuels : @/lib/comments.
 */

import { useMemo, useState, type ComponentType, type SVGProps } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRightIcon,
  TrashIcon,
  PencilSquareIcon,
  DocumentTextIcon,
  BoltIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/Button";
import {
  addComment,
  removeComment,
  updateComment,
  useProjectComments,
  type ProjectComment,
} from "@/lib/comments";
import { ModalShell } from "@/components/analyse/modals/shared";
import { Tooltip } from "@/components/Tooltip";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { useToast } from "@/context/ToastContext";

function dayKey(iso: string): string {
  const d = new Date(iso);
  const start = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((start(new Date()) - start(d)) / 86400000);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Hier";
  return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(d);
}

function timeLabel(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

type IconCmp = ComponentType<SVGProps<SVGSVGElement>>;

/** Puce de source + icône + href de navigation selon le type de cible. */
function sourceMeta(c: ProjectComment): { label: string; icon: IconCmp; href?: (domain: string) => string } {
  switch (c.target.type) {
    case "action":
      return { label: `Action · ${c.target.label}`, icon: BoltIcon, href: (d) => `/analyse/${encodeURIComponent(d)}?tab=briefs` };
    case "analysis":
      return { label: `Analyse · ${c.target.label}`, icon: ChartBarIcon, href: (d) => `/analyse/${encodeURIComponent(d)}?tab=briefs&analysis=${encodeURIComponent(c.target.id)}` };
    default:
      return { label: "Note de projet", icon: DocumentTextIcon };
  }
}

export function NotesView({ domain }: { domain: string }) {
  const router = useRouter();
  const comments = useProjectComments(domain);
  const [draft, setDraft] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ProjectComment | null>(null);
  const { show: showToast } = useToast();

  function post() {
    const text = draft.trim();
    if (!text) return;
    addComment(domain, { type: "general", id: "general", label: "Note de projet" }, text);
    setDraft("");
  }

  function startEdit(c: ProjectComment) {
    setEditId(c.id);
    setEditDraft(c.text);
  }

  function closeEdit() {
    setEditId(null);
    setEditDraft("");
  }

  function saveEdit() {
    if (!editId || !editDraft.trim()) return;
    updateComment(domain, editId, editDraft);
    closeEdit();
    showToast("Note mise à jour", <CheckCircleIcon className="h-5 w-5" />);
  }

  const groups = useMemo(() => {
    const sorted = [...comments].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const map = new Map<string, ProjectComment[]>();
    for (const c of sorted) {
      const k = dayKey(c.createdAt);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(c);
    }
    return [...map.entries()];
  }, [comments]);

  return (
    // Largeur de lecture confortable : colonne centrée plutôt que pleine largeur.
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-7">
      {/* Composeur de note générale */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card-static)] p-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); post(); } }}
          rows={3}
          placeholder="Ajouter une note de projet — décision, échange client, point de suivi…"
          className="block w-full resize-none bg-transparent px-1.5 py-1 type-body leading-relaxed text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)]"
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="type-caption text-[var(--text-muted)]">⌘ + Entrée pour publier · les commentaires d&apos;actions et d&apos;analyses apparaissent aussi ici</span>
          <Button size="sm" onClick={post} disabled={!draft.trim()}>Publier</Button>
        </div>
      </div>

      {/* Flux agrégé */}
      {comments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border-subtle)] px-6 py-12 text-center">
          <p className="type-body-strong">Aucun commentaire pour l&apos;instant</p>
          <p className="mt-1 type-body-sm">
            Notez ici un point de suivi, ou commentez une action / une analyse — tout remonte dans ce flux.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map(([label, items]) => (
            <div key={label}>
              <p className="mb-2 type-micro uppercase">
                {label}
              </p>
              <div className="flex flex-col gap-2">
                {items.map((c) => {
                  const src = sourceMeta(c);
                  return (
                    <div
                      key={c.id}
                      className="group flex gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4"
                    >
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent-primary-soft)] text-[12px] font-semibold text-[var(--accent-primary)]">
                        {c.initials}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="type-label font-semibold text-[var(--text-primary)]">{c.author}</span>
                          <span className="type-micro">{timeLabel(c.createdAt)}</span>
                        </div>
                        <p className="mt-1 whitespace-pre-line type-body-sm leading-relaxed">
                          {c.text}
                        </p>
                        {/* Puce source — aligne le style sur les pills de la vue Actions */}
                        <button
                          type="button"
                          disabled={!src.href}
                          onClick={() => src.href && router.push(src.href(domain))}
                          className={`mt-2 inline-flex max-w-full items-center gap-1.5 truncate rounded-full bg-[var(--bg-subtle)] px-2 py-1 type-caption font-medium text-[var(--text-primary)] transition-colors ${
                            src.href ? "hover:bg-[var(--bg-card-hover)]" : "cursor-default"
                          }`}
                        >
                          <src.icon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--text-muted)]" />
                          <span className="truncate">{src.label}</span>
                          {src.href && <ArrowRightIcon className="h-3 w-3 flex-shrink-0 text-[var(--text-muted)]" />}
                        </button>
                      </div>
                      {(
                        <div className="flex flex-shrink-0 items-start gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                          <Tooltip label="Modifier" side="top" portal>
                            <button
                              type="button"
                              onClick={() => startEdit(c)}
                              aria-label="Modifier"
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                            >
                              <PencilSquareIcon className="h-4 w-4" />
                            </button>
                          </Tooltip>
                          <Tooltip label="Supprimer" side="top" portal>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(c)}
                              aria-label="Supprimer"
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--color-danger)]"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </Tooltip>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation avant suppression d'une note */}
      {deleteTarget && (
        <ModalShell onClose={() => setDeleteTarget(null)} maxWidth={400}>
          <h3 className="mb-1.5 type-h3">Supprimer cette note ?</h3>
          <p className="mb-6 type-body-sm leading-relaxed">Cette note sera définitivement retirée du journal. Cette action est irréversible.</p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="md" onClick={() => setDeleteTarget(null)}>Annuler</Button>
            <Button variant="danger" size="md" onClick={() => { removeComment(domain, deleteTarget.id); setDeleteTarget(null); }}>Supprimer</Button>
          </div>
        </ModalShell>
      )}

      {/* Modale d'édition d'une note — note centrée + confirmation centrée */}
      {editId && (
        <ModalShell onClose={closeEdit} maxWidth={460}>
          <h3 className="mb-4 type-h3">Modifier la note</h3>
          <textarea
            value={editDraft}
            autoFocus
            onChange={(e) => setEditDraft(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); saveEdit(); }
              if (e.key === "Escape") { e.preventDefault(); closeEdit(); }
            }}
            rows={5}
            className="block w-full resize-none rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-static)] px-4 py-3 type-body leading-relaxed text-[var(--text-primary)] outline-none focus:border-[var(--border-medium)]"
          />
          <div className="mt-5 flex items-center justify-end gap-2">
            <Button variant="secondary" size="md" onClick={closeEdit}>Annuler</Button>
            <Button size="md" onClick={saveEdit} disabled={!editDraft.trim()}>Enregistrer</Button>
          </div>
        </ModalShell>
      )}
    </div>
  );
}
