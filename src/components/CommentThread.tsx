"use client";

/**
 * CommentThread — fil de commentaires contextuel, rattaché à une cible
 * (ActionCard, analyse…). Embarquable n'importe où sous /analyse/[domain],
 * ou avec un `domain` explicite (portail client).
 *
 * Réponses « façon YouTube » : un seul niveau d'indentation. Répondre à une
 * réponse reste dans le même fil (pas d'empilement). Les réponses sont
 * masquées derrière un toggle « X réponses ».
 *
 * Deux rendus :
 *   - `compact` (défaut) : fil dense (ActionCard, portail client).
 *   - `cards` : aligné visuellement sur la page Notes (composeur en tête,
 *     cartes bordées, suppression avec confirmation).
 */

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpIcon, TrashIcon, ChevronDownIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import {
  addComment,
  removeComment,
  updateComment,
  useProjectComments,
  domainFromPathname,
  CURRENT_AUTHOR,
  type CommentTarget,
  type ProjectComment,
} from "@/lib/comments";
import { Button } from "@/components/Button";
import { ModalShell } from "@/components/analyse/modals/shared";
import { useToast } from "@/context/ToastContext";

function timeLabel(iso: string): string {
  const d = new Date(iso);
  const sameDay = new Date().toDateString() === d.toDateString();
  return sameDay
    ? new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(d)
    : new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(d);
}

/** Petit composeur (textarea + flèche) — fil compact et réponses. */
function Composer({
  value,
  onChange,
  onSubmit,
  placeholder,
  autoFocus,
  initials,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder: string;
  autoFocus?: boolean;
  initials: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[var(--bg-secondary)] text-[11px] font-semibold text-[var(--text-secondary)]">
        {initials}
      </span>
      <div className="relative flex-1">
        <textarea
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit(); } }}
          rows={1}
          placeholder={placeholder}
          className="block w-full resize-none rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-static)] py-2 pl-3 pr-10 type-body-sm leading-relaxed text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] transition-colors focus:border-[var(--border-medium)]"
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={!value.trim()}
          aria-label="Envoyer"
          className="absolute bottom-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-40"
          style={{ backgroundColor: "var(--accent-primary)" }}
        >
          <ArrowUpIcon className="h-3.5 w-3.5" strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}

/** Composeur « carte » — même rendu que la page Notes (bordée + bouton Publier). */
function CardComposer({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card-static)] p-3">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); onSubmit(); } }}
        rows={3}
        placeholder="Ajouter une note — décision, échange client, point de suivi…"
        className="block w-full resize-none bg-transparent px-1.5 py-1 type-body leading-relaxed text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)]"
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="type-caption text-[var(--text-muted)]">⌘ + Entrée pour publier</span>
        <Button size="sm" onClick={onSubmit} disabled={!value.trim()}>Publier</Button>
      </div>
    </div>
  );
}

export function CommentThread({
  target,
  domain: domainOverride,
  author,
  variant = "compact",
}: {
  target: CommentTarget;
  /** Force le domaine (ex. portail client où le path n'est pas /analyse/[domain]). */
  domain?: string;
  /** Identité de l'auteur (par défaut : le consultant courant). */
  author?: { name: string; initials: string };
  /** Rendu visuel : `compact` (fil dense) ou `cards` (aligné sur la page Notes). */
  variant?: "compact" | "cards";
}) {
  const pathname = usePathname();
  const domain = domainOverride ?? domainFromPathname(pathname);
  const me = author ?? CURRENT_AUTHOR;
  const all = useProjectComments(domain);
  const cards = variant === "cards";

  const [draft, setDraft] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<ProjectComment | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const { show: showToast } = useToast();

  const thread = useMemo(
    () =>
      all
        .filter((c) => c.target.type === target.type && c.target.id === target.id)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [all, target.type, target.id],
  );

  const roots = useMemo(() => thread.filter((c) => !c.parentId), [thread]);
  const repliesOf = (rootId: string) => thread.filter((c) => c.parentId === rootId);

  // Racine du fil pour un commentaire donné (un seul niveau : réponse → racine).
  const rootIdOf = (c: ProjectComment) => c.parentId ?? c.id;
  const replyingComment = thread.find((c) => c.id === replyingTo) ?? null;
  const replyingRootId = replyingComment ? rootIdOf(replyingComment) : null;

  function toggleExpand(rootId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(rootId)) next.delete(rootId); else next.add(rootId);
      return next;
    });
  }

  function startReply(c: ProjectComment) {
    setReplyingTo(c.id);
    // Préfixe @auteur quand on répond à une réponse (pour garder le contexte).
    setReplyDraft(c.parentId ? `@${c.author} ` : "");
    setExpanded((prev) => new Set(prev).add(rootIdOf(c)));
  }

  function post() {
    const text = draft.trim();
    if (!text || !domain) return;
    addComment(domain, target, text, undefined, me);
    setDraft("");
  }

  function postReply() {
    const text = replyDraft.trim();
    if (!text || !domain || !replyingComment) return;
    addComment(domain, target, text, rootIdOf(replyingComment), me);
    setReplyDraft("");
    setReplyingTo(null);
  }

  // Suppression : confirmation en variante cards, directe en compact.
  function requestDelete(c: ProjectComment) {
    if (cards) setDeleteTarget(c);
    else removeComment(domain, c.id);
  }

  // Édition (variante cards) — même flux que la page Notes.
  function startEdit(c: ProjectComment) { setEditId(c.id); setEditDraft(c.text); }
  function closeEdit() { setEditId(null); setEditDraft(""); }
  function saveEdit() {
    if (!editId || !editDraft.trim()) return;
    updateComment(domain, editId, editDraft);
    closeEdit();
    showToast("Note mise à jour", <CheckCircleIcon className="h-5 w-5" />);
  }

  function renderComment(c: ProjectComment) {
    if (cards) {
      return (
        <div key={c.id} className="group flex gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent-primary-soft)] text-[12px] font-semibold text-[var(--accent-primary)]">
            {c.initials}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="type-label font-semibold text-[var(--text-primary)]">{c.author}</span>
              <span className="type-micro">{timeLabel(c.createdAt)}</span>
            </div>
            <p className="mt-1 whitespace-pre-line type-body-sm leading-relaxed">{c.text}</p>
            <button
              type="button"
              onClick={() => startReply(c)}
              className="mt-2 type-caption font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--accent-primary)]"
            >
              Répondre
            </button>
          </div>
          <div className="flex flex-shrink-0 items-start gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => startEdit(c)}
              aria-label="Modifier la note"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
            >
              <PencilSquareIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => requestDelete(c)}
              aria-label="Supprimer la note"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--color-danger)]"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      );
    }
    return (
      <div key={c.id} className="group flex gap-2.5">
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent-primary-soft)] text-[11px] font-semibold text-[var(--accent-primary)]">
          {c.initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="type-label font-semibold text-[var(--text-primary)]">{c.author}</span>
            <span className="type-micro">{timeLabel(c.createdAt)}</span>
          </div>
          <p className="mt-0.5 whitespace-pre-line type-body-sm leading-relaxed">
            {c.text}
          </p>
          <button
            type="button"
            onClick={() => startReply(c)}
            className="mt-1 type-caption font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--accent-primary)]"
          >
            Répondre
          </button>
        </div>
        <button
          type="button"
          onClick={() => requestDelete(c)}
          aria-label="Supprimer le commentaire"
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-[var(--text-muted)] opacity-0 transition-all hover:bg-[var(--bg-secondary)] hover:text-[var(--color-danger)] group-hover:opacity-100"
        >
          <TrashIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  const composer = cards ? (
    <CardComposer value={draft} onChange={setDraft} onSubmit={post} />
  ) : (
    <Composer value={draft} onChange={setDraft} onSubmit={post} placeholder="Ajouter un commentaire…" initials={me.initials} />
  );

  const list = roots.length > 0 && (
    <div className={`flex flex-col ${cards ? "gap-3" : "gap-4"}`}>
      {roots.map((root) => {
        const replies = repliesOf(root.id);
        const isOpen = expanded.has(root.id);
        const showArea = (replies.length > 0 && isOpen) || replyingRootId === root.id;
        return (
          <div key={root.id} className="flex flex-col gap-2">
            {renderComment(root)}

            {/* Toggle « X réponses » — façon YouTube */}
            {replies.length > 0 && (
              <button
                type="button"
                onClick={() => toggleExpand(root.id)}
                className={`inline-flex w-fit items-center gap-1 type-caption font-semibold text-[var(--accent-primary)] transition-colors hover:opacity-80 ${cards ? "ml-12" : "ml-9"}`}
              >
                <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                {isOpen ? "Masquer les réponses" : `${replies.length} réponse${replies.length > 1 ? "s" : ""}`}
              </button>
            )}

            {/* Réponses + composeur — indentation appliquée UNE seule fois ici */}
            {showArea && (
              <div className={`flex flex-col gap-2.5 border-l border-[var(--border-subtle)] pl-3 ${cards ? "ml-12" : "ml-9"}`}>
                {(isOpen ? replies : []).map((r) => renderComment(r))}
                {replyingRootId === root.id && (
                  <Composer
                    value={replyDraft}
                    onChange={setReplyDraft}
                    onSubmit={postReply}
                    placeholder="Répondre…"
                    autoFocus
                    initials={me.initials}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={`flex flex-col ${cards ? "gap-5" : "gap-3"}`}>
      {cards ? (
        // Aligné sur la page Notes : composeur en tête, puis le fil.
        <>
          {composer}
          {list}
        </>
      ) : (
        <>
          <p className="type-micro font-semibold uppercase tracking-[0.08em]">
            Commentaires{thread.length > 0 ? ` · ${thread.length}` : ""}
          </p>
          {list}
          {composer}
        </>
      )}

      {/* Édition d'une note (variante cards) — titre + texte à gauche, CTA à droite */}
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

      {/* Confirmation avant suppression (variante cards) */}
      {deleteTarget && (
        <ModalShell onClose={() => setDeleteTarget(null)} maxWidth={400}>
          <h3 className="mb-1.5 type-h3">Supprimer cette note ?</h3>
          <p className="mb-6 type-body-sm leading-relaxed">Cette note sera définitivement retirée. Cette action est irréversible.</p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="md" onClick={() => setDeleteTarget(null)}>Annuler</Button>
            <Button variant="danger" size="md" onClick={() => { removeComment(domain, deleteTarget.id); setDeleteTarget(null); }}>Supprimer</Button>
          </div>
        </ModalShell>
      )}
    </div>
  );
}
