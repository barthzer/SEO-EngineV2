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

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/Button";
import {
  addComment,
  removeComment,
  useProjectComments,
  type ProjectComment,
} from "@/lib/comments";

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

/** Puce de source + href de navigation selon le type de cible. */
function sourceMeta(c: ProjectComment): { label: string; href?: (domain: string) => string } {
  switch (c.target.type) {
    case "action":
      return { label: `Action · ${c.target.label}`, href: (d) => `/analyse/${encodeURIComponent(d)}?tab=briefs` };
    case "analysis":
      return { label: `Analyse · ${c.target.label}`, href: (d) => `/analyse/${encodeURIComponent(d)}?tab=recommandations` };
    default:
      return { label: "Note de projet" };
  }
}

export function NotesView({ domain }: { domain: string }) {
  const router = useRouter();
  const comments = useProjectComments(domain);
  const [draft, setDraft] = useState("");

  function post() {
    const text = draft.trim();
    if (!text) return;
    addComment(domain, { type: "general", id: "general", label: "Note de projet" }, text);
    setDraft("");
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
    <div className="flex flex-col gap-7">
      {/* Composeur de note générale */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card-static)] p-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); post(); } }}
          rows={3}
          placeholder="Ajouter une note de projet — décision, échange client, point de suivi…"
          className="block w-full resize-none bg-transparent px-1.5 py-1 text-[14px] leading-relaxed text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)]"
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[12px] text-[var(--text-muted)]">⌘ + Entrée pour publier · les commentaires d&apos;actions et d&apos;analyses apparaissent aussi ici</span>
          <Button size="sm" onClick={post} disabled={!draft.trim()}>Publier</Button>
        </div>
      </div>

      {/* Flux agrégé */}
      {comments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border-subtle)] px-6 py-12 text-center">
          <p className="text-[14px] font-medium text-[var(--text-primary)]">Aucun commentaire pour l&apos;instant</p>
          <p className="mt-1 text-[13px] text-[var(--text-muted)]">
            Notez ici un point de suivi, ou commentez une action / une analyse — tout remonte dans ce flux.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map(([label, items]) => (
            <div key={label}>
              <p className="mb-2 text-[11px] font-medium uppercase tracking-caption text-[var(--text-muted)]">
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
                          <span className="text-[13px] font-semibold text-[var(--text-primary)]">{c.author}</span>
                          <span className="text-[12px] text-[var(--text-muted)]">{timeLabel(c.createdAt)}</span>
                        </div>
                        <p className="mt-1 whitespace-pre-line text-[13.5px] leading-relaxed text-[var(--text-secondary)]">
                          {c.text}
                        </p>
                        {/* Puce source */}
                        <button
                          type="button"
                          disabled={!src.href}
                          onClick={() => src.href && router.push(src.href(domain))}
                          className={`mt-2 inline-flex max-w-full items-center gap-1.5 truncate rounded-full border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-2.5 py-1 text-[11.5px] font-medium text-[var(--text-secondary)] transition-colors ${
                            src.href ? "hover:border-[var(--border-medium)] hover:text-[var(--text-primary)]" : "cursor-default"
                          }`}
                        >
                          <span className="truncate">{src.label}</span>
                          {src.href && <ArrowRightIcon className="h-3 w-3 flex-shrink-0" />}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeComment(domain, c.id)}
                        aria-label="Supprimer"
                        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] opacity-0 transition-all hover:bg-[var(--bg-secondary)] hover:text-[var(--color-danger)] group-hover:opacity-100"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
