"use client";

import { useCallback, useEffect, useState } from "react";

/** Lecture d'une durée CSS depuis les tokens — fallback en ms */
function readMs(name: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Gère le cycle de vie open/close d'une modale avec transition CSS (`.t-modal`).
 * Phases :
 *   - "entering"   : DOM monté, classe vide (pré-open scale via .t-modal de base)
 *   - "open"       : classe `is-open` appliquée → scale(1), opacity(1)
 *   - "closing"    : classe `is-closing` appliquée → scale-close + fade
 *   - puis appel à `onCloseRequested` (le parent peut alors démonter)
 *
 * Usage :
 *   const { phase, requestClose } = useModalTransition(onClose);
 *   const modalClass = `t-modal ${phase === "open" ? "is-open" : phase === "closing" ? "is-closing" : ""}`;
 *   // onClick overlay / button X / Escape → requestClose()
 */
export function useModalTransition(onCloseRequested: () => void, closeDurVar = "--modal-close-dur", closeDurFallback = 150) {
  const [phase, setPhase] = useState<"entering" | "open" | "closing">("entering");

  // Mount → next frame → "open" pour que la transition pré-open → open joue
  useEffect(() => {
    const id = requestAnimationFrame(() => setPhase("open"));
    return () => cancelAnimationFrame(id);
  }, []);

  const requestClose = useCallback(() => {
    setPhase("closing");
    const ms = readMs(closeDurVar, closeDurFallback);
    setTimeout(() => onCloseRequested(), ms);
  }, [onCloseRequested, closeDurVar, closeDurFallback]);

  // Bind Escape → requestClose
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") requestClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [requestClose]);

  return { phase, requestClose };
}
