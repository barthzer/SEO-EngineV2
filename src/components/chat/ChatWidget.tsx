"use client";

/**
 * ChatWidget — assistant conversationnel en drawer latéral droit.
 *
 * Lanceur = bulle flottante (sparkle dégradé). Le panneau gère plusieurs
 * discussions (historique + nom éditable). Moteur de réponse déterministe
 * (MVP, src/lib/chat/engine.ts). Monté une seule fois dans AppShell.
 */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  XMarkIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  PlusIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { Tooltip } from "@/components/Tooltip";
import { useChat, type ChatMessage, type Conversation } from "@/context/ChatContext";

/** Icône chat IA (bulle + sparkle) — couleur via currentColor, taille via className. */
function ChatAiIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M13.4937 2.79004L13.0291 1.58215C12.9714 1.4322 12.8273 1.33325 12.6667 1.33325C12.506 1.33325 12.3619 1.4322 12.3043 1.58215L11.8397 2.79004C11.772 2.9661 11.6329 3.10523 11.4568 3.17295L10.2489 3.63753C10.0989 3.6952 10 3.83926 10 3.99992C10 4.16058 10.0989 4.30464 10.2489 4.36231L11.4568 4.82689C11.6329 4.89461 11.772 5.03374 11.8397 5.2098L12.3043 6.41769C12.3619 6.56764 12.506 6.66659 12.6667 6.66659C12.8273 6.66659 12.9714 6.56764 13.0291 6.41769L13.4937 5.2098C13.5613 5.03374 13.7005 4.89461 13.8765 4.82689L15.0845 4.36231C15.2344 4.30464 15.3333 4.16058 15.3333 3.99992C15.3333 3.83926 15.2344 3.6952 15.0845 3.63753L13.8765 3.17295C13.7005 3.10523 13.5613 2.9661 13.4937 2.79004Z" fill="currentColor" />
      <path d="M8.00131 2.66675L4.00128 2.66675C2.89671 2.66675 2.00128 3.56219 2.00128 4.66675V10.0239C2.00128 11.1285 2.89671 12.0239 4.00128 12.0239H5.7677C5.92432 12.0239 6.07593 12.0791 6.19597 12.1797L7.99845 13.6906L9.82512 12.1772C9.94472 12.0781 10.0951 12.0239 10.2504 12.0239H12.0013C13.1058 12.0239 14.0013 11.1285 14.0013 10.0239V8.67868" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function lastPreview(c: Conversation): string {
  const last = [...c.messages].reverse().find((m) => m.role === "user") ?? c.messages[c.messages.length - 1];
  return last ? last.text.replace(/\n/g, " ") : "";
}

export function ChatWidget() {
  const {
    isOpen, toggle, close,
    conversations, activeId, activeName,
    messages, isThinking,
    send, navigate,
    newConversation, selectConversation, renameConversation,
  } = useChat();

  const [draft, setDraft] = useState("");
  const [mounted, setMounted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [nameDraft, setNameDraft] = useState(activeName);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Montage côté client uniquement (portail SSR-safe).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  // Sync du nom éditable quand la discussion active change / est renommée.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setNameDraft(activeName); }, [activeId, activeName]);

  // Auto-scroll en bas à chaque nouveau message.
  useEffect(() => {
    if (!isOpen || showHistory) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking, isOpen, showHistory]);

  // Focus l'input à l'ouverture.
  useEffect(() => {
    if (isOpen && !showHistory) setTimeout(() => inputRef.current?.focus(), 60);
  }, [isOpen, showHistory]);

  // Fermeture par Échap quand le drawer est ouvert.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  function submit() {
    const text = draft.trim();
    if (!text) return;
    send(text);
    setDraft("");
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  if (!mounted) return null;
  const canSend = draft.trim().length > 0;

  return createPortal(
    <>
      {/* Bulle flottante — lanceur (fond neutre, icône chat IA) */}
      {!isOpen && (
        <button
          type="button"
          onClick={toggle}
          aria-label="Ouvrir l'assistant"
          className="fixed bottom-6 right-6 z-[1100] flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card-static)] shadow-[var(--shadow-floating)] transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          <ChatAiIcon className="h-5 w-5 text-[var(--accent-primary)]" />
        </button>
      )}

      {/* Click-catcher transparent (clic extérieur → ferme), sans voile ni blur */}
      <div
        aria-hidden="true"
        onClick={close}
        className="fixed inset-0 z-[1095]"
        style={{ pointerEvents: isOpen ? "auto" : "none" }}
      />

      {/* Drawer assistant */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Assistant SEO Engine"
        className="fixed bottom-4 right-4 top-4 z-[1100] flex w-[460px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--modal-bg)] shadow-2xl transition-[opacity,transform] duration-200"
        style={{
          transformOrigin: "bottom right",
          transform: isOpen ? "scale(1)" : "scale(0.96)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transitionTimingFunction: "var(--ease-expo)",
        }}
      >
        {/* Header */}
        <header className="relative flex h-14 flex-shrink-0 items-center gap-2 px-4">
          <GradientDivider position="bottom" />
          <ChatAiIcon className="h-5 w-5 flex-shrink-0 text-[var(--accent-primary)]" />
          {showHistory ? (
            <span className="min-w-0 flex-1 truncate px-1.5 py-1 text-[14px] font-semibold text-[var(--text-primary)]">
              Historique du chat
            </span>
          ) : (
            /* Nom de la discussion — input révélé au survol */
            <input
              value={nameDraft}
              onChange={(e) => { setNameDraft(e.target.value); renameConversation(activeId, e.target.value); }}
              onBlur={() => setNameDraft(activeName)}
              aria-label="Nom de la discussion"
              className="min-w-0 flex-1 truncate rounded-md border border-transparent bg-transparent px-1.5 py-1 text-[14px] font-semibold text-[var(--text-primary)] outline-none transition-colors hover:border-[var(--border-subtle)] hover:bg-[var(--bg-subtle)] focus:border-[var(--border-medium)] focus:bg-[var(--card-inner-bg)]"
            />
          )}
          <Tooltip label="Nouvelle discussion" side="bottom" portal>
            <button
              type="button"
              onClick={() => { newConversation(); setShowHistory(false); }}
              aria-label="Nouvelle discussion"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
            >
              <PlusIcon className="h-[18px] w-[18px]" />
            </button>
          </Tooltip>
          <Tooltip label="Historique des discussions" side="bottom" portal>
            <button
              type="button"
              onClick={() => setShowHistory((v) => !v)}
              aria-label="Historique des discussions"
              aria-pressed={showHistory}
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
                showHistory
                  ? "bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <ClockIcon className="h-[18px] w-[18px]" />
            </button>
          </Tooltip>
          <button
            type="button"
            onClick={close}
            aria-label="Fermer"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </header>

        <div
          key={showHistory ? "view-history" : "view-chat"}
          className="animate-fade-in flex flex-1 flex-col overflow-hidden"
        >
        {showHistory ? (
          /* Historique des discussions */
          <div className="flex-1 overflow-y-auto p-3">
            {conversations.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => { selectConversation(c.id); setShowHistory(false); }}
                className="flex w-full flex-col gap-0.5 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[var(--bg-subtle)]"
              >
                <span className="w-full truncate text-[13.5px] font-medium text-[var(--text-primary)]">
                  {c.name}
                </span>
                <span className="w-full truncate text-[12px] text-[var(--text-muted)]">
                  {lastPreview(c)}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <>
            {/* Fil de messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} onAction={navigate} onSuggestion={send} />
              ))}
              {isThinking && <ThinkingBubble />}
            </div>

            {/* Saisie — flèche d'envoi DANS l'input, visible seulement si texte */}
            <div className="relative flex-shrink-0 px-4 pb-4 pt-2">
              <GradientDivider position="top" />
              <div className="relative">
                <textarea
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={onKeyDown}
                  rows={2}
                  placeholder="Écrivez votre message…"
                  className="block w-full resize-none rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-static)] px-3.5 py-2.5 pr-11 text-[14px] leading-relaxed text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] transition-colors focus:border-[var(--border-medium)]"
                />
                <button
                  type="button"
                  onClick={submit}
                  disabled={!canSend || isThinking}
                  aria-label="Envoyer"
                  className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-40"
                  style={{ backgroundColor: "var(--accent-primary)" }}
                >
                  <ArrowUpIcon className="h-3.5 w-3.5" strokeWidth={2.4} />
                </button>
              </div>
            </div>
          </>
        )}
        </div>
      </aside>
    </>,
    document.body,
  );
}

/* ── Bulle de message ────────────────────────────────────────────────── */

function MessageBubble({
  message,
  onAction,
  onSuggestion,
}: {
  message: ChatMessage;
  onAction: (href: string) => void;
  onSuggestion: (text: string) => void;
}) {
  const isUser = message.role === "user";
  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
      {isUser ? (
        <div className="max-w-[85%] whitespace-pre-line rounded-2xl bg-[var(--bg-subtle)] px-3.5 py-2.5 text-[13.5px] leading-relaxed text-[var(--text-primary)]">
          {message.text}
        </div>
      ) : (
        <div className="max-w-full whitespace-pre-line text-[13.5px] leading-relaxed text-[var(--text-primary)]">
          {message.text}
        </div>
      )}

      {/* Action de navigation */}
      {message.action && (
        <button
          type="button"
          onClick={() => onAction(message.action!.href)}
          className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-medium)] hover:text-[var(--text-primary)]"
        >
          {message.action.label}
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Suggestions de relance (style chips DS) */}
      {message.suggestions && message.suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {message.suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSuggestion(s)}
              className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-medium)] hover:text-[var(--text-primary)]"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Indicateur de réflexion — texte à balayage dégradé (façon ChatGPT) ── */

function ThinkingBubble() {
  return (
    <p className="ai-thinking-text py-1 text-[13.5px] font-medium leading-relaxed">
      Réflexion en cours…
    </p>
  );
}

/* ── Masque de scroll (fondu vers la couleur du fond, pas une ombre) ───── */

function GradientDivider({ position }: { position: "top" | "bottom" }) {
  // "bottom" → masque sous le header ; "top" → masque au-dessus de la saisie.
  // Le fondu part de la couleur du fond (--modal-bg) vers transparent : le
  // contenu scrollé disparaît en douceur au lieu d'être coupé net.
  const below = position === "bottom";
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 z-10 h-6 ${below ? "top-full" : "bottom-full"}`}
      style={{
        background: `linear-gradient(to ${below ? "bottom" : "top"}, var(--modal-bg), transparent)`,
      }}
    />
  );
}
