"use client";

import type { OnboardingData, OnboardingLLM } from "@/types/onboarding";

const COUNTRIES: { code: string; flag: string; label: string }[] = [
  { code: "FR", flag: "🇫🇷", label: "France" },
  { code: "BE", flag: "🇧🇪", label: "Belgique" },
  { code: "CH", flag: "🇨🇭", label: "Suisse" },
  { code: "CA", flag: "🇨🇦", label: "Canada" },
  { code: "GB", flag: "🇬🇧", label: "Royaume-Uni" },
  { code: "US", flag: "🇺🇸", label: "États-Unis" },
  { code: "ES", flag: "🇪🇸", label: "Espagne" },
  { code: "DE", flag: "🇩🇪", label: "Allemagne" },
  { code: "IT", flag: "🇮🇹", label: "Italie" },
];

const LANGUAGES: { code: string; label: string }[] = [
  { code: "fr", label: "Français" },
  { code: "en", label: "Anglais" },
  { code: "es", label: "Espagnol" },
  { code: "de", label: "Allemand" },
  { code: "it", label: "Italien" },
  { code: "pt", label: "Portugais" },
];

/** Monogrammes LLMs en lieu et place d'émojis génériques */
const LLMS: { key: OnboardingLLM; label: string; mono: string; color: string }[] = [
  { key: "chatgpt",    label: "ChatGPT",    mono: "G", color: "#10A37F" },
  { key: "perplexity", label: "Perplexity", mono: "P", color: "#20A4BE" },
  { key: "claude",     label: "Claude",     mono: "C", color: "#C36F35" },
  { key: "gemini",     label: "Gemini",     mono: "G", color: "#4285F4" },
  { key: "mistral",    label: "Mistral",    mono: "M", color: "#FA7C26" },
];

export function StepMarche({ data, update }: { data: OnboardingData; update: (p: Partial<OnboardingData>) => void }) {
  const showLLMs = data.goals.includes("geo");

  function toggleLLM(llm: OnboardingLLM) {
    const next = data.targetLLMs.includes(llm)
      ? data.targetLLMs.filter((x) => x !== llm)
      : [...data.targetLLMs, llm];
    update({ targetLLMs: next });
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="font-semibold tracking-tight text-[var(--text-primary)]">
          Sur quel marché travaillez-vous ?
        </h1>
        <p className="text-[14px] leading-relaxed text-[var(--text-secondary)]">
          Définit la SERP analysée, les concurrents trackés et la langue des briefs.
        </p>
      </header>

      <div className="flex flex-col gap-2.5">
        <label className="text-[13px] font-medium text-[var(--text-primary)]">Pays principal</label>
        <div className="flex flex-wrap gap-1.5">
          {COUNTRIES.map(({ code, flag, label }) => {
            const selected = data.primaryCountry === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => update({ primaryCountry: code })}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
                  selected
                    ? "border border-[var(--accent-primary)] bg-[color-mix(in_oklab,var(--accent-primary)_8%,transparent)] text-[var(--accent-primary)]"
                    : "border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--border-medium)] hover:text-[var(--text-primary)]"
                }`}
              >
                <span className="text-[14px] leading-none" aria-hidden="true">{flag}</span>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <label className="text-[13px] font-medium text-[var(--text-primary)]">Langue du contenu</label>
        <div className="flex flex-wrap gap-1.5">
          {LANGUAGES.map(({ code, label }) => {
            const selected = data.primaryLanguage === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => update({ primaryLanguage: code })}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                  selected
                    ? "border border-[var(--accent-primary)] bg-[color-mix(in_oklab,var(--accent-primary)_8%,transparent)] text-[var(--accent-primary)]"
                    : "border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--border-medium)] hover:text-[var(--text-primary)]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {showLLMs && (
        <div className="flex flex-col gap-2.5">
          <label className="text-[13px] font-medium text-[var(--text-primary)]">
            LLMs à tracker
            <span className="ml-1.5 font-normal text-[var(--text-muted)]">(optionnel)</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {LLMS.map(({ key, label, mono, color }) => {
              const selected = data.targetLLMs.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleLLM(key)}
                  className={`inline-flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5 text-[13px] font-medium transition-colors ${
                    selected
                      ? "border border-[var(--accent-primary)] bg-[color-mix(in_oklab,var(--accent-primary)_8%,transparent)] text-[var(--accent-primary)]"
                      : "border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--border-medium)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {mono}
                  </span>
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
