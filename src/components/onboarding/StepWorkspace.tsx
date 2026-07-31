"use client";

import { useEffect } from "react";
import type { OnboardingData, OnboardingTeamSize } from "@/types/onboarding";
import { slugify } from "@/hooks/useOnboardingState";

const INDUSTRIES = [
  "SaaS / Tech",
  "E-commerce",
  "Services B2B",
  "Médias",
  "Santé",
  "Éducation",
  "Immobilier",
  "Finance",
  "Voyage",
];

const TEAM_SIZES: { key: OnboardingTeamSize; label: string }[] = [
  { key: "solo",    label: "Solo" },
  { key: "2-10",    label: "2 – 10" },
  { key: "11-50",   label: "11 – 50" },
  { key: "51-200",  label: "51 – 200" },
  { key: "200+",    label: "200+" },
];

export function StepWorkspace({ data, update }: { data: OnboardingData; update: (p: Partial<OnboardingData>) => void }) {
  useEffect(() => {
    const auto = slugify(data.workspaceName);
    if (auto !== data.workspaceSlug) update({ workspaceSlug: auto });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.workspaceName]);

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="type-h1">
          Créons votre workspace
        </h1>
        <p className="type-body text-[var(--text-secondary)]">
          Vous pourrez inviter votre équipe plus tard depuis les paramètres.
        </p>
      </header>

      <div className="flex flex-col gap-2">
        <label className="type-label text-[var(--text-primary)]">Nom du workspace</label>
        <input
          type="text"
          autoFocus
          value={data.workspaceName}
          onChange={(e) => update({ workspaceName: e.target.value })}
          placeholder="Mon agence"
          className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-2.5 type-body outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--text-primary)]"
        />
        {data.workspaceSlug && (
          <p className="font-mono type-micro">
            gse.app/<span className="text-[var(--text-secondary)]">{data.workspaceSlug}</span>
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        <label className="type-label text-[var(--text-primary)]">Secteur</label>
        <div className="flex flex-wrap gap-1.5">
          {INDUSTRIES.map((ind) => {
            const selected = data.industry === ind;
            return (
              <button
                key={ind}
                type="button"
                onClick={() => update({ industry: ind })}
                className={`rounded-full px-3.5 py-1.5 type-label transition-colors ${
                  selected
                    ? "border border-[var(--accent-primary)] bg-[color-mix(in_oklab,var(--accent-primary)_8%,transparent)] text-[var(--accent-primary)]"
                    : "border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--border-medium)] hover:text-[var(--text-primary)]"
                }`}
              >
                {ind}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <label className="type-label text-[var(--text-primary)]">Taille d'équipe</label>
        <div className="inline-flex w-fit items-center gap-1 rounded-full bg-[var(--bg-subtle)] p-1">
          {TEAM_SIZES.map(({ key, label }) => {
            const selected = data.teamSize === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => update({ teamSize: key })}
                className={`rounded-full px-4 py-1.5 type-label transition-colors ${
                  selected
                    ? "bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
