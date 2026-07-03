"use client";

/**
 * SidebarContext — état replié/déplié de la sidebar, partagé.
 *
 * L'état vit ici (et non plus en local dans <Sidebar>) pour que le bouton de
 * rétractation puisse être rendu ailleurs (ex. dans le Topbar, à gauche du
 * sélecteur de projet) tout en pilotant la même sidebar.
 */

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type SidebarContextValue = {
  isExpanded: boolean;
  setIsExpanded: (v: boolean | ((prev: boolean) => boolean)) => void;
  toggle: () => void;
};

const SidebarCtx = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const toggle = useCallback(() => setIsExpanded((v) => !v), []);
  return (
    <SidebarCtx.Provider value={{ isExpanded, setIsExpanded, toggle }}>
      {children}
    </SidebarCtx.Provider>
  );
}

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarCtx);
  if (!ctx) throw new Error("useSidebar() doit être appelé à l'intérieur d'un <SidebarProvider>.");
  return ctx;
}
