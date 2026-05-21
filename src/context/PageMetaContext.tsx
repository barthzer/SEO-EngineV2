"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * PageMeta — métadonnées contextuelles poussées par une vue vers le Topbar :
 * - count / total : compteur d'items à côté du titre
 * - rightSlot     : JSX libre rendu à droite du Topbar (badges, actions, etc.)
 */
type PageMeta = {
  count: number | null;
  total: number | null;
  rightSlot: ReactNode;
};

interface Ctx {
  meta: PageMeta;
  setMeta: (m: Partial<PageMeta>) => void;
}

const PageMetaContext = createContext<Ctx>({
  meta: { count: null, total: null, rightSlot: null },
  setMeta: () => {},
});

export function PageMetaProvider({ children }: { children: React.ReactNode }) {
  const [meta, setMetaState] = useState<PageMeta>({ count: null, total: null, rightSlot: null });
  const setMeta = useCallback((m: Partial<PageMeta>) => {
    setMetaState((prev) => ({ ...prev, ...m }));
  }, []);
  const value = useMemo(() => ({ meta, setMeta }), [meta, setMeta]);
  return <PageMetaContext.Provider value={value}>{children}</PageMetaContext.Provider>;
}

export function usePageMeta() {
  return useContext(PageMetaContext);
}
