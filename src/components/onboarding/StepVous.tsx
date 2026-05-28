"use client";

import type { OnboardingData, OnboardingRole, OnboardingSeniority } from "@/types/onboarding";

const ROLES: { key: OnboardingRole; label: string }[] = [
  { key: "consultant_freelance", label: "Consultant indépendant" },
  { key: "agence",               label: "Agence SEO" },
  { key: "in_house",             label: "In-house / Marketing" },
  { key: "founder",              label: "Fondateur" },
  { key: "other",                label: "Autre" },
];

const SENIORITIES: { key: OnboardingSeniority; label: string; years: string }[] = [
  { key: "junior",       label: "Junior",   years: "≤ 2 ans" },
  { key: "intermediate", label: "Confirmé", years: "3 – 5 ans" },
  { key: "senior",       label: "Senior",   years: "6 – 10 ans" },
  { key: "expert",       label: "Expert",   years: "10+ ans" },
];

export function StepVous({ data, update }: { data: OnboardingData; update: (p: Partial<OnboardingData>) => void }) {
  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="font-semibold tracking-tight text-[var(--text-primary)]">
          Quel est votre rôle ?
        </h1>
        <p className="text-[14px] leading-relaxed text-[var(--text-secondary)]">
          On personnalise l'interface et les recommandations en fonction.
        </p>
      </header>

      <Field label="Rôle">
        <div className="flex flex-wrap gap-1.5">
          {ROLES.map(({ key, label }) => (
            <Chip
              key={key}
              selected={data.role === key}
              onClick={() => update({ role: key })}
            >
              {label}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="Expérience en SEO">
        <div className="inline-flex w-fit items-center gap-1 rounded-full bg-[var(--bg-subtle)] p-1">
          {SENIORITIES.map(({ key, label, years }) => {
            const selected = data.seniority === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => update({ seniority: key })}
                className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors ${
                  selected
                    ? "bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {label}
                <span className="ml-1.5 text-[10.5px] opacity-60">{years}</span>
              </button>
            );
          })}
        </div>
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-[13px] font-medium text-[var(--text-primary)]">{label}</label>
      {children}
    </div>
  );
}

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
        selected
          ? "border border-[var(--accent-primary)] bg-[color-mix(in_oklab,var(--accent-primary)_8%,transparent)] text-[var(--accent-primary)]"
          : "border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--border-medium)] hover:text-[var(--text-primary)]"
      }`}
    >
      {children}
    </button>
  );
}
