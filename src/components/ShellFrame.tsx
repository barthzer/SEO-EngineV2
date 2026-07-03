"use client";

import type { ReactNode } from "react";
import { useChat } from "@/context/ChatContext";
import { ChatWidget } from "@/components/chat/ChatWidget";

/**
 * Cadre de l'app — quand le chat est ouvert, l'app (sidebar + main) se rétracte
 * en carte arrondie avec 12px de gouttière sur un fond contrasté, et le chat
 * apparaît en panneau arrondi à droite (interaction façon ElevenLabs).
 */
export function ShellFrame({ children }: { children: ReactNode }) {
  const { isOpen } = useChat();
  return (
    <div
      className={`flex h-[100dvh] overflow-hidden transition-[padding,column-gap,background-color] duration-300 ${
        isOpen ? "gap-3 bg-[var(--bg-subtle)] p-3" : "bg-[var(--bg-primary)]"
      }`}
      style={{ transitionTimingFunction: "var(--ease-expo)" }}
    >
      {/* Carte app (sidebar + main) */}
      <div
        className={`flex min-w-0 flex-1 bg-[var(--bg-primary)] transition-[border-radius] duration-300 ${
          isOpen ? "overflow-hidden rounded-2xl border border-[var(--border-subtle)]" : ""
        }`}
        style={{ transitionTimingFunction: "var(--ease-expo)" }}
      >
        {children}
      </div>
      {/* Panneau chat à droite (dans la gouttière) */}
      <ChatWidget />
    </div>
  );
}
