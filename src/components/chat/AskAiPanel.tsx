"use client";

/**
 * AskAiPanel — drawer latéral droit qui héberge le thread assistant-ui.
 *
 * Ouvert depuis le CTA « Demander » (qui garde sa pill « bientôt » côté produit).
 * Sert à valider visuellement l'UI du chatbot et ses états (accueil, envoi,
 * streaming, annulation) avec nos tokens et nos fonts, sans backend.
 */

import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useModalTransition } from "@/hooks/useModalTransition";
import { AssistantThread } from "@/components/chat/AssistantThread";
import { ChatAiIcon } from "@/components/chat/ChatWidget";

export function AskAiPanel({ onClose }: { onClose: () => void }) {
  const { phase, requestClose } = useModalTransition(onClose);
  if (typeof document === "undefined") return null;
  const cls = phase === "open" ? "is-open" : phase === "closing" ? "is-closing" : "";

  return createPortal(
    <div
      role="presentation"
      className={`t-modal-overlay ${cls} fixed inset-0 z-[1000] flex justify-end bg-black/40 backdrop-blur-sm`}
      onClick={(e) => e.target === e.currentTarget && requestClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Demander à l'IA"
        className={`t-modal ${cls} flex h-full w-full max-w-[440px] flex-col bg-[var(--modal-bg)] shadow-[var(--shadow-floating)]`}
      >
        {/* En-tête */}
        <div className="flex flex-shrink-0 items-center gap-2.5 border-b border-[var(--border-subtle)] px-5 py-3.5">
          <ChatAiIcon className="h-5 w-5 text-[var(--accent-primary)]" />
          <p className="flex-1 type-body-strong">Demander à l&apos;IA</p>
          <span className="rounded-full bg-[var(--bg-subtle)] px-1.5 py-0.5 type-micro text-[var(--text-muted)]">
            bientôt
          </span>
          <button
            onClick={requestClose}
            aria-label="Fermer"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Thread assistant-ui */}
        <div className="min-h-0 flex-1">
          <AssistantThread />
        </div>
      </div>
    </div>,
    document.body,
  );
}
