"use client";

/**
 * Validation des missions confiées au client (mock localStorage par domaine —
 * en attendant une table côté Drizzle).
 *
 * Le client ne « valide » pas le travail de l'agence : il marque seulement
 * comme « fait » les missions qui LUI ont été assignées (inaccessibles au
 * consultant). Statut persistant + événement live.
 */

import { useEffect, useState } from "react";

export type ClientTaskDone = {
  by: string;
  at: string; // ISO
};

const CHANGED_EVENT = "project-client-tasks:changed";
const storageKey = (domain: string) => `project-client-tasks:${domain}`;

function load(domain: string): Record<string, ClientTaskDone> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(storageKey(domain));
    return raw ? (JSON.parse(raw) as Record<string, ClientTaskDone>) : {};
  } catch {
    return {};
  }
}

function save(domain: string, map: Record<string, ClientTaskDone>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(domain), JSON.stringify(map));
  } catch {
    /* quota */
  }
  window.dispatchEvent(new CustomEvent(CHANGED_EVENT, { detail: { domain } }));
}

export function setTaskDone(domain: string, actionId: string, by: string): void {
  const map = load(domain);
  map[actionId] = { by, at: new Date().toISOString() };
  save(domain, map);
}

export function clearTaskDone(domain: string, actionId: string): void {
  const map = load(domain);
  delete map[actionId];
  save(domain, map);
}

/** Hook live : la mission est-elle marquée « fait » par le client ? */
export function useTaskDone(domain: string, actionId: string): ClientTaskDone | null {
  const [done, setDone] = useState<ClientTaskDone | null>(null);
  useEffect(() => {
    const sync = () => setDone(load(domain)[actionId] ?? null);
    sync();
    window.addEventListener(CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [domain, actionId]);
  return done;
}
