"use client";

import { Search, Sparkles, Bot, FilePlus, Target, Network } from "lucide-react";
import type { OnboardingData, OnboardingGoal } from "@/types/onboarding";
import { CheckBox } from "@/components/onboarding/CheckBox";

const GOALS: { key: OnboardingGoal; icon: React.ElementType; title: string; desc: string }[] = [
  { key: "audit",      icon: Search,    title: "Auditer un site",       desc: "Diagnostic technique et éditorial" },
  { key: "optimize",   icon: Sparkles,  title: "Optimiser les pages",   desc: "Scoring, briefs IA, recommandations" },
  { key: "geo",        icon: Bot,       title: "Visibilité IA",         desc: "Citations Perplexity, ChatGPT, Claude" },
  { key: "missing",    icon: FilePlus,  title: "Pages manquantes",      desc: "Étude de mots-clés vs concurrents" },
  { key: "tracking",   icon: Target,    title: "Tracker positions",     desc: "Suivi SERP automatisé" },
  { key: "netlinking", icon: Network,   title: "Popularité",            desc: "Profil backlinks et outreach" },
];

export function StepEntry({ data, update }: { data: OnboardingData; update: (p: Partial<OnboardingData>) => void }) {
  function toggleGoal(g: OnboardingGoal) {
    const next = data.goals.includes(g)
      ? data.goals.filter((x) => x !== g)
      : [...data.goals, g];
    update({ goals: next });
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="type-h1">
          Qu'est-ce qui vous amène ?
        </h1>
        <p className="type-body text-[var(--text-secondary)]">
          Sélectionnez tout ce qui s'applique. On adapte le dashboard en conséquence.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {GOALS.map(({ key, icon: Icon, title, desc }) => {
          const selected = data.goals.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleGoal(key)}
              aria-pressed={selected}
              className={`group/card relative flex flex-col gap-3 rounded-2xl border p-5 text-left transition-all ${
                selected
                  ? "border-[var(--accent-primary)] bg-[color-mix(in_oklab,var(--accent-primary)_8%,transparent)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--border-medium)]"
              }`}
            >
              {/* Icon mise en valeur dans un container coloré */}
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                  selected
                    ? "bg-[color-mix(in_oklab,var(--accent-primary)_15%,transparent)] text-[var(--accent-primary)]"
                    : "bg-[var(--bg-subtle)] text-[var(--text-primary)] group-hover/card:bg-[var(--bg-card-hover)]"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </span>

              <div>
                <p className="type-body-strong">{title}</p>
                <p className="mt-1 type-caption">{desc}</p>
              </div>

              {/* Checkmark top-right — composant partagé */}
              <CheckBox checked={selected} className="absolute right-4 top-4" size={20} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
