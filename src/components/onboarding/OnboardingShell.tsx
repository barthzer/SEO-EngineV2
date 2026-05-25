"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";
import { SeoEngineLogo } from "@/components/SeoEngineLogo";
import { SeoEngineWordmark } from "@/components/SeoEngineWordmark";
import { TOTAL_STEPS } from "@/types/onboarding";
import { Button } from "@/components/Button";

interface OnboardingShellProps {
  step: number;
  children: ReactNode;
  preview: ReactNode;
  onNext: (() => void) | null;
  onBack?: (() => void) | null;
  nextLabel?: string;
  skipLabel?: string;
  onSkipStep?: (() => void) | null;
  onSkipAll?: (() => void) | null;
}

/**
 * Shell 50/50. Logo full + stepper-dots dans le header gauche.
 * Bouton retour = icon btn au-dessus du titre (au début du contenu).
 * CTA ferré à gauche dans le footer.
 */
export function OnboardingShell({
  step,
  children,
  preview,
  onNext,
  onBack,
  nextLabel = "Continuer",
  skipLabel = "Plus tard",
  onSkipStep,
  onSkipAll,
}: OnboardingShellProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Enter" && onNext) {
        const t = e.target as HTMLElement;
        if (t?.tagName === "INPUT" || t?.tagName === "BUTTON" || t?.tagName === "TEXTAREA") return;
        e.preventDefault();
        onNext();
      } else if (e.key === "Escape" && onBack) {
        e.preventDefault();
        onBack();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onNext, onBack]);

  return (
    <div className="relative flex min-h-[100dvh]">
      {/* X close button — top-right global */}
      {onSkipAll && (
        <button
          type="button"
          onClick={onSkipAll}
          aria-label="Quitter l'onboarding"
          className="absolute right-6 top-6 z-20 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-md transition-colors hover:bg-white/25"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* ─── COLONNE GAUCHE 50% ─── */}
      <section className="flex w-1/2 flex-col overflow-hidden">

        {/* Header — logo full + stepper-dots */}
        <header className="flex flex-shrink-0 items-center gap-5 px-20 pt-10">
          <Link href="/" aria-label="Accueil" className="flex flex-shrink-0 items-center">
            <SeoEngineLogo className="h-8 w-8 flex-shrink-0 text-[var(--text-primary)]" />
            <SeoEngineWordmark className="ml-3 text-[20px] text-[var(--text-primary)]" />
          </Link>
          <StepperDots step={step} total={TOTAL_STEPS} />
        </header>

        {/* Contenu du step — scrollable, CTA inclus à la fin du contenu */}
        <div key={step} className="t-tab-enter flex flex-1 flex-col overflow-y-auto px-20 pb-12 pt-14">
          {onBack && (
            <button
              onClick={onBack}
              aria-label="Étape précédente"
              className="mb-8 flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-medium)] hover:text-[var(--text-primary)]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          {children}

          {/* CTAs — ferrés à gauche, dans le flow du contenu */}
          <div className="mt-10 flex items-center gap-3">
            <Button onClick={onNext ?? undefined} disabled={!onNext}>
              {nextLabel}
            </Button>
            {onSkipStep && (
              <button
                onClick={onSkipStep}
                className="rounded-full bg-[var(--bg-card-hover)] px-4 py-2 text-[13px] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
              >
                {skipLabel}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ─── COLONNE DROITE 50% — gradient + dashboard preview ─── */}
      <aside
        className="relative w-1/2 flex-shrink-0 overflow-hidden"
        style={{
          background:
            "linear-gradient(to bottom, #0C0C0C 0%, #0C0C0C 25%, var(--accent-primary) 75%, color-mix(in oklab, var(--accent-primary) 55%, white) 100%)",
        }}
      >
        {/* Texture pointillés — seuls les points blancs ressortent
            (mix-blend-mode: screen → le noir devient transparent). */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "url('/onboarding-dots.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            mixBlendMode: "screen",
            opacity: 0.5,
          }}
        />
        <div className="relative h-full">{preview}</div>
      </aside>
    </div>
  );
}

/** Stepper compact — 4-6 dots dont l'actif est une barre wide */
function StepperDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className="rounded-full transition-all duration-300 ease-out"
          style={{
            width: i === step ? 28 : 7,
            height: 7,
            backgroundColor:
              i === step
                ? "var(--accent-primary)"
                : i < step
                  ? "var(--text-primary)"
                  : "var(--border-medium)",
            opacity: i === step ? 1 : i < step ? 0.5 : 0.4,
          }}
          aria-current={i === step ? "step" : undefined}
        />
      ))}
    </div>
  );
}
