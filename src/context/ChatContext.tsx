"use client";

/**
 * ChatContext — état de l'assistant conversationnel (MVP mock).
 *
 * Gère l'ouverture du widget, plusieurs discussions (historique + nom éditable),
 * et l'envoi. Le calcul de réponse est délégué au moteur déterministe `respond()`
 * (src/lib/chat/engine.ts) — aucun appel réseau.
 *
 * Ouvrable de partout via l'événement `assistant:open` (ex. palette ⌘K).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useProjects } from "@/context/ProjectsContext";
import { respond, type ChatAction } from "@/lib/chat/engine";
import type { RichBlock } from "@/lib/chat/richBlocks";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  action?: ChatAction;
  suggestions?: string[];
  card?: RichBlock;
};

export type Conversation = {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: number;
};

export const ASSISTANT_OPEN_EVENT = "assistant:open";
export const DEFAULT_CONVERSATION_NAME = "Nouvelle discussion";

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: "Bonjour 👋 Je suis votre assistant GlobalSearch. Demandez-moi d'ouvrir une page ou posez une question sur vos projets.",
  suggestions: ["Ouvre les paramètres", "Liste mes projets", "Que peux-tu faire ?"],
};

let idCounter = 0;
const nextId = () => `id-${Date.now()}-${idCounter++}`;

function makeConversation(): Conversation {
  return {
    id: nextId(),
    name: DEFAULT_CONVERSATION_NAME,
    messages: [{ ...WELCOME, id: nextId() }],
    createdAt: Date.now(),
  };
}

type ChatContextValue = {
  isOpen: boolean;
  conversations: Conversation[];
  activeId: string;
  activeName: string;
  messages: ChatMessage[];
  isThinking: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  send: (text: string) => void;
  navigate: (href: string) => void;
  newConversation: () => void;
  selectConversation: (id: string) => void;
  renameConversation: (id: string, name: string) => void;
};

const ChatCtx = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const projects = useProjects();

  const [isOpen, setIsOpen] = useState(false);
  // Conversation initiale créée une seule fois (initialiseurs lazy).
  const [conversations, setConversations] = useState<Conversation[]>(() => [makeConversation()]);
  const [activeId, setActiveId] = useState<string>(() => conversations[0].id);
  const [isThinking, setIsThinking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  const navigate = useCallback((href: string) => { router.push(href); }, [router]);

  // Écrit progressivement (mot à mot) le texte d'un message assistant déjà
  // présent (vide) dans une conversation. L'action / les suggestions ne sont
  // révélées qu'une fois le texte entièrement écrit.
  const streamMessage = useCallback(
    (convId: string, msgId: string, reply: { text: string; action?: ChatAction; suggestions?: string[]; card?: RichBlock }) => {
      if (streamRef.current) clearInterval(streamRef.current);
      const tokens = reply.text.split(/(\s+)/); // conserve les espaces
      let i = 0;
      streamRef.current = setInterval(() => {
        i += 1;
        const done = i >= tokens.length;
        const partial = tokens.slice(0, i).join("");
        setConversations((prev) =>
          prev.map((c) =>
            c.id !== convId
              ? c
              : {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id !== msgId
                      ? m
                      : {
                          ...m,
                          text: partial,
                          action: done ? reply.action : undefined,
                          suggestions: done ? reply.suggestions : undefined,
                          card: done ? reply.card : undefined,
                        },
                  ),
                },
          ),
        );
        if (done && streamRef.current) {
          clearInterval(streamRef.current);
          streamRef.current = null;
        }
      }, 24);
    },
    [],
  );

  const send = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text || isThinking) return;
      const convId = activeId;

      const userMsg: ChatMessage = { id: nextId(), role: "user", text };
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c;
          // Auto-nommage : 1er message utilisateur → nom de la discussion.
          const isFirstUserMsg = !c.messages.some((m) => m.role === "user");
          const name =
            c.name === DEFAULT_CONVERSATION_NAME && isFirstUserMsg
              ? text.length > 42 ? `${text.slice(0, 42)}…` : text
              : c.name;
          return { ...c, name, messages: [...c.messages, userMsg] };
        }),
      );
      setIsThinking(true);

      timerRef.current = setTimeout(() => {
        const reply = respond(text, { projects, pathname: pathname ?? "/" });
        const botId = nextId();
        // On insère un message vide puis on l'écrit progressivement.
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? { ...c, messages: [...c.messages, { id: botId, role: "assistant", text: "" }] }
              : c,
          ),
        );
        setIsThinking(false);
        streamMessage(convId, botId, reply);
      }, 420);
    },
    [isThinking, activeId, projects, pathname, streamMessage],
  );

  const newConversation = useCallback(() => {
    const convId = nextId();
    const welcomeId = nextId();
    setConversations((prev) => [
      { id: convId, name: DEFAULT_CONVERSATION_NAME, messages: [{ id: welcomeId, role: "assistant", text: "" }], createdAt: Date.now() },
      ...prev,
    ]);
    setActiveId(convId);
    // Message d'accueil écrit progressivement.
    streamMessage(convId, welcomeId, { text: WELCOME.text, suggestions: WELCOME.suggestions });
  }, [streamMessage]);

  const selectConversation = useCallback((id: string) => setActiveId(id), []);

  const renameConversation = useCallback((id: string, name: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: name.trim() || DEFAULT_CONVERSATION_NAME } : c)),
    );
  }, []);

  // Cleanup du timer + du streaming.
  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (streamRef.current) clearInterval(streamRef.current);
  }, []);

  // Ouverture déclenchée par un événement global (palette de commandes, etc.).
  useEffect(() => {
    function onOpen() { setIsOpen(true); }
    window.addEventListener(ASSISTANT_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(ASSISTANT_OPEN_EVENT, onOpen);
  }, []);

  return (
    <ChatCtx.Provider
      value={{
        isOpen,
        conversations,
        activeId,
        activeName: active.name,
        messages: active.messages,
        isThinking,
        open,
        close,
        toggle,
        send,
        navigate,
        newConversation,
        selectConversation,
        renameConversation,
      }}
    >
      {children}
    </ChatCtx.Provider>
  );
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatCtx);
  if (!ctx) {
    throw new Error("useChat() doit être appelé à l'intérieur d'un <ChatProvider>.");
  }
  return ctx;
}
