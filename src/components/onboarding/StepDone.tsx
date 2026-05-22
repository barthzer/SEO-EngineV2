"use client";

import type { OnboardingData } from "@/types/onboarding";
import { SuccessCheck } from "@/components/SuccessCheck";
import { CheckBox } from "@/components/onboarding/CheckBox";

export function StepDone({ data, update }: { data: OnboardingData; update: (p: Partial<OnboardingData>) => void }) {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-success)]">
        <SuccessCheck size={32} color="white" replayKey={data.firstProjectDomain} />
      </div>

      <header className="flex flex-col gap-3">
        <h1 className="font-semibold tracking-tight text-[var(--text-primary)]">
          Votre workspace est prêt
        </h1>
        <p className="text-[14px] leading-relaxed text-[var(--text-secondary)]">
          Analyse de <strong className="text-[var(--text-primary)]">{data.firstProjectDomain || "votre site"}</strong> en cours. On vous emmène sur le dashboard.
        </p>
      </header>

      <label className="flex w-full max-w-md cursor-pointer items-start gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-5 py-4 text-left transition-colors hover:border-[var(--border-medium)]">
        <input
          type="checkbox"
          checked={data.newsletterOptIn}
          onChange={(e) => update({ newsletterOptIn: e.target.checked })}
          className="sr-only"
        />
        <CheckBox checked={data.newsletterOptIn} size={18} className="mt-0.5" />
        <span className="text-[13px] leading-snug text-[var(--text-primary)]">
          Recevoir 1 email par mois sur les nouveautés produit.
          <span className="ml-1 text-[var(--text-muted)]">Désinscription en 1 clic.</span>
        </span>
      </label>
    </div>
  );
}
