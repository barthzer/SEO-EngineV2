"use client";

/**
 * CommentThread — fil de commentaires contextuel, rattaché à une cible
 * (ActionCard, analyse…). Embarquable n'importe où sous /analyse/[domain],
 * ou avec un `domain` explicite (portail client).
 *
 * Réponses « façon YouTube » : un seul niveau d'indentation. Répondre à une
 * réponse reste dans le même fil (pas d'empilement). Les réponses sont
 * masquées derrière un toggle « X réponses ».
 */

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpIcon, TrashIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import {
  addComment,
  removeComment,
  useProjectComments,
  domainFromPathname,
  CURRENT_AUTHOR,
  type CommentTarget,
  type ProjectComment,
} from "@/lib/comments";

function timeLabel(iso: string): string {
  const d = new Date(iso);
  const sameDay = new Date().toDateString() === d.toDateString();
  return sameDay
    ? new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(d)
    : new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(d);
}

/** Petit composeur (textarea + flèche) réutilisé pour commentaire et réponse. */
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
          className="block w-full resize-none rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-static)] py-2 pl-3 pr-10 text-[13px] leading-relaxed text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] transition-colors focus:border-[var(--border-medium)]"
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

export function CommentThread({
  target,
  domain: domainOverride,
  author,
}: {
  target: CommentTarget;
  /** Force le domaine (ex. portail client où le path n'est pas /analyse/[domain]). */
  domain?: string;
  /** Identité de l'auteur (par défaut : le consultant courant). */
  author?: { name: string; initials: string };
}) {
  const pathname = usePathname();
  const domain = domainOverride ?? domainFromPathname(pathname);
  const me = author ?? CURRENT_AUTHOR;
  const all = useProjectComments(domain);

  const [draft, setDraft] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

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

  function renderComment(c: ProjectComment) {
    return (
      <div key={c.id} className="group flex gap-2.5">
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent-primary-soft)] text-[11px] font-semibold text-[var(--accent-primary)]">
          {c.initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] font-semibold text-[var(--text-primary)]">{c.author}</span>
            <span className="text-[11px] text-[var(--text-muted)]">{timeLabel(c.createdAt)}</span>
          </div>
          <p className="mt-0.5 whitespace-pre-line text-[13px] leading-relaxed text-[var(--text-secondary)]">
            {c.text}
          </p>
          <button
            type="button"
            onClick={() => startReply(c)}
            className="mt-1 text-[12px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--accent-primary)]"
          >
            Répondre
          </button>
        </div>
        <button
          type="button"
          onClick={() => removeComment(domain, c.id)}
          aria-label="Supprimer le commentaire"
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-[var(--text-muted)] opacity-0 transition-all hover:bg-[var(--bg-secondary)] hover:text-[var(--color-danger)] group-hover:opacity-100"
        >
          <TrashIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
        Commentaires{thread.length > 0 ? ` · ${thread.length}` : ""}
      </p>

      {roots.length > 0 && (
        <div className="flex flex-col gap-4">
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
                    className="ml-9 inline-flex w-fit items-center gap-1 text-[12px] font-semibold text-[var(--accent-primary)] transition-colors hover:opacity-80"
                  >
                    <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    {isOpen ? "Masquer les réponses" : `${replies.length} réponse${replies.length > 1 ? "s" : ""}`}
                  </button>
                )}

                {/* Réponses + composeur — indentation appliquée UNE seule fois ici */}
                {showArea && (
                  <div className="ml-9 flex flex-col gap-2.5 border-l border-[var(--border-subtle)] pl-3">
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
      )}

      {/* Composeur principal (nouveau commentaire) */}
      <Composer value={draft} onChange={setDraft} onSubmit={post} placeholder="Ajouter un commentaire…" initials={me.initials} />
    </div>
  );
}
