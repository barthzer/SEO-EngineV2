"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface DrawerState {
  isOpen: boolean;
  title: string;
  content: ReactNode;
  open: (title: string, content: ReactNode) => void;
  close: () => void;
}

const DrawerContext = createContext<DrawerState>({
  isOpen: false,
  title: "",
  content: null,
  open: () => {},
  close: () => {},
});

export function useDrawer() {
  return useContext(DrawerContext);
}

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<ReactNode>(null);

  function open(newTitle: string, newContent: ReactNode) {
    setTitle(newTitle);
    setContent(newContent);
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  return (
    <DrawerContext.Provider value={{ isOpen, title, content, open, close }}>
      {children}
    </DrawerContext.Provider>
  );
}
