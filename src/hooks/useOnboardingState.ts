"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_ONBOARDING, TOTAL_STEPS, type OnboardingData } from "@/types/onboarding";

const STORAGE_KEY = "gse:onboarding:v1";
const STORAGE_STEP_KEY = "gse:onboarding:step:v1";
const RESUME_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/** Convertit un nom en slug (lowercase, accents retirés, espaces→tirets) */
export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

/**
 * État de l'onboarding persisté en localStorage.
 * — `data` : données accumulées sur les 6 steps
 * — `step` : index du step actif (0-5)
 * — `update(partial)` : merge partial dans data, persiste
 * — `setStep(n)` : navigue (clampe 0..TOTAL_STEPS-1)
 * — `next()/back()` : nav helpers
 * — `reset()` : flush localStorage, recommence
 * — `hasResume` : true si reprise valide (< 7j) détectée au mount
 */
export function useOnboardingState() {
  const [data, setData] = useState<OnboardingData>(DEFAULT_ONBOARDING);
  const [step, setStepRaw] = useState(0);
  const [hasResume, setHasResume] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydratation : on lit le localStorage côté client uniquement
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const rawStep = window.localStorage.getItem(STORAGE_STEP_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as OnboardingData;
        const age = Date.now() - (parsed.startedAt ?? 0);
        if (age < RESUME_EXPIRY_MS) {
          setData(parsed);
          if (rawStep) {
            const s = parseInt(rawStep, 10);
            if (Number.isFinite(s) && s > 0) {
              setHasResume(true);
              setStepRaw(s);
            }
          }
        } else {
          // Expired → flush
          window.localStorage.removeItem(STORAGE_KEY);
          window.localStorage.removeItem(STORAGE_STEP_KEY);
        }
      }
    } catch {
      // localStorage indispo ou JSON corrompu → on continue avec defaults
    }
    setHydrated(true);
  }, []);

  // Persistance auto à chaque change (sauf avant hydratation)
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, startedAt: data.startedAt || Date.now() }));
      window.localStorage.setItem(STORAGE_STEP_KEY, String(step));
    } catch {
      // localStorage plein ou indispo → silent
    }
  }, [data, step, hydrated]);

  const update = useCallback((partial: Partial<OnboardingData>) => {
    setData((prev) => ({
      ...prev,
      ...partial,
      startedAt: prev.startedAt || Date.now(),
    }));
  }, []);

  const setStep = useCallback((n: number) => {
    setStepRaw(Math.max(0, Math.min(TOTAL_STEPS - 1, n)));
  }, []);

  const next = useCallback(() => setStepRaw((s) => Math.min(TOTAL_STEPS - 1, s + 1)), []);
  const back = useCallback(() => setStepRaw((s) => Math.max(0, s - 1)), []);

  const reset = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(STORAGE_STEP_KEY);
    }
    setData({ ...DEFAULT_ONBOARDING, startedAt: Date.now() });
    setStepRaw(0);
    setHasResume(false);
  }, []);

  return { data, step, update, setStep, next, back, reset, hasResume, hydrated };
}
