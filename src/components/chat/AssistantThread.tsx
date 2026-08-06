"use client";

/**
 * AssistantThread — UI de chat basée sur assistant-ui, habillée avec notre DS.
 *
 * - Primitives : @assistant-ui/react (Thread / Message / Composer).
 * - Styles : @assistant-ui/styles (classes .aui-*) + pont vers nos tokens
 *   (src/styles/assistant-ui.css) → thème clair/sombre et fonts du DS.
 * - Runtime : `useLocalRuntime` branché sur notre moteur mock déterministe
 *   (src/lib/chat/engine.ts), avec streaming simulé pour visualiser les états
 *   (running / streaming / idle) sans backend.
 *
 * Aucun appel réseau : tout tourne en local, comme le reste de l'app en mock.
 */

import { useMemo } from "react";
import {
  AssistantRuntimeProvider,
  useLocalRuntime,
  ThreadPrimitive,
  MessagePrimitive,
  ComposerPrimitive,
  type ChatModelAdapter,
} from "@assistant-ui/react";
import { usePathname } from "next/navigation";
import { ArrowUpIcon } from "@heroicons/react/24/outline";
import { respond } from "@/lib/chat/engine";
import { PROJECTS } from "@/data/projects";

/** Découpe un texte en fragments pour simuler un streaming token par token. */
function chunks(text: string): string[] {
  return text.match(/\S+\s*/g) ?? [text];
}

/** Suggestions d'amorce (reprises du moteur mock). */
const STARTERS = [
  "Quels projets sont en baisse ?",
  "Montre-moi les quick wins",
  "Où en est le score de leboncoin.fr ?",
];

export function AssistantThread() {
  const pathname = usePathname();

  const adapter = useMemo<ChatModelAdapter>(
    () => ({
      async *run({ messages, abortSignal }) {
        const last = messages[messages.length - 1];
        const input =
          last?.content
            .filter((c): c is { type: "text"; text: string } => c.type === "text")
            .map((c) => c.text)
            .join(" ") ?? "";

        const reply = respond(input, { projects: PROJECTS, pathname });

        // Latence d'ouverture (état « running » visible).
        await new Promise((r) => setTimeout(r, 260));

        let acc = "";
        for (const part of chunks(reply.text)) {
          if (abortSignal.aborted) return;
          acc += part;
          await new Promise((r) => setTimeout(r, 18));
          yield { content: [{ type: "text" as const, text: acc }] };
        }
      },
    }),
    [pathname],
  );

  const runtime = useLocalRuntime(adapter);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ThreadPrimitive.Root className="aui-root aui-thread-root flex h-full flex-col">
        <ThreadPrimitive.Viewport className="aui-thread-viewport flex-1 overflow-y-auto px-4 py-4">
          {/* Écran d'accueil (thread vide) */}
          <ThreadPrimitive.Empty>
            <div className="aui-thread-welcome-center flex flex-col items-center gap-4 py-10 text-center">
              <p className="aui-thread-welcome-message type-h3">Comment puis-je aider ?</p>
              <div className="flex flex-wrap justify-center gap-2">
                {STARTERS.map((s) => (
                  <ThreadPrimitive.Suggestion
                    key={s}
                    prompt={s}
                    method="replace"
                    autoSend
                    className="aui-thread-followup-suggestion rounded-full border border-[var(--border-subtle)] px-3 py-1.5 type-caption text-[var(--text-secondary)] transition-colors hover:border-[var(--border-medium)] hover:text-[var(--text-primary)]"
                  >
                    {s}
                  </ThreadPrimitive.Suggestion>
                ))}
              </div>
            </div>
          </ThreadPrimitive.Empty>

          <ThreadPrimitive.Messages
            components={{ UserMessage, AssistantMessage }}
          />
        </ThreadPrimitive.Viewport>

        <Composer />
      </ThreadPrimitive.Root>
    </AssistantRuntimeProvider>
  );
}

/* ── Message utilisateur ──────────────────────────────────────────────── */
function UserMessage() {
  return (
    <MessagePrimitive.Root className="mb-3 flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[var(--accent-primary)] px-3.5 py-2 type-body-sm text-white">
        <MessagePrimitive.Parts />
      </div>
    </MessagePrimitive.Root>
  );
}

/* ── Message assistant (streaming visible) ────────────────────────────── */
function AssistantMessage() {
  return (
    <MessagePrimitive.Root className="aui-assistant-message-root mb-4 flex justify-start">
      <div className="aui-assistant-message-content max-w-[90%] rounded-2xl rounded-bl-md bg-[var(--bg-subtle)] px-3.5 py-2 type-body-sm text-[var(--text-primary)]">
        <MessagePrimitive.Parts />
      </div>
    </MessagePrimitive.Root>
  );
}

/* ── Composer (saisie + envoi / annulation) ───────────────────────────── */
function Composer() {
  return (
    <ComposerPrimitive.Root className="aui-composer-root flex items-end gap-2 border-t border-[var(--border-subtle)] p-3">
      <ComposerPrimitive.Input
        autoFocus
        rows={1}
        placeholder="Posez votre question…"
        className="aui-composer-input max-h-32 flex-1 resize-none rounded-xl border border-[var(--border-subtle)] bg-[var(--input-bg)] px-3 py-2 type-body-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] focus:border-[var(--border-medium)]"
      />
      <ThreadPrimitive.If running={false}>
        <ComposerPrimitive.Send
          aria-label="Envoyer"
          className="aui-composer-send flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[var(--cta-bg)] text-[var(--cta-text)] transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <ArrowUpIcon className="h-4 w-4" />
        </ComposerPrimitive.Send>
      </ThreadPrimitive.If>
      <ThreadPrimitive.If running>
        <ComposerPrimitive.Cancel
          aria-label="Arrêter"
          className="aui-composer-cancel flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <span className="block h-2.5 w-2.5 rounded-[2px] bg-current" />
        </ComposerPrimitive.Cancel>
      </ThreadPrimitive.If>
    </ComposerPrimitive.Root>
  );
}
