"use client";

import { useEffect, useState } from "react";
import { Globe, CheckCircle2 } from "lucide-react";
import type { OnboardingData, OnboardingFrequency } from "@/types/onboarding";

const FREQUENCIES: { key: OnboardingFrequency; label: string }[] = [
  { key: "quotidienne",   label: "Quotidienne" },
  { key: "hebdomadaire",  label: "Hebdomadaire" },
  { key: "mensuelle",     label: "Mensuelle" },
  { key: "manuelle",      label: "Manuelle" },
];

export function StepProjet({ data, update }: { data: OnboardingData; update: (p: Partial<OnboardingData>) => void }) {
  const [faviconError, setFaviconError] = useState(false);

  useEffect(() => {
    setFaviconError(false);
  }, [data.firstProjectDomain]);

  const cleanDomain = data.firstProjectDomain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const isValid = /^[a-z0-9-]+(\.[a-z]{2,})+$/i.test(cleanDomain);

  function mockConnect(provider: "gsc" | "ga4") {
    setTimeout(() => {
      if (provider === "gsc") update({ gscConnected: true });
      else update({ ga4Connected: true });
    }, 800);
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="type-h1">
          Lançons votre première analyse
        </h1>
        <p className="type-body text-[var(--text-secondary)]">
          Indiquez le domaine à analyser. Vous pourrez en ajouter d'autres ensuite.
        </p>
      </header>

      <div className="flex flex-col gap-2">
        <label className="type-label text-[var(--text-primary)]">Domaine</label>
        <div
          className={`flex items-center gap-3 rounded-xl border bg-[var(--bg-card)] px-3.5 py-2.5 transition-colors ${
            isValid
              ? "border-[var(--color-success)]"
              : "border-[var(--border-subtle)] focus-within:border-[var(--text-primary)]"
          }`}
        >
          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-[var(--text-muted)]">
            {isValid && !faviconError ? (
              <img
                src={`https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=32`}
                alt=""
                width={16}
                height={16}
                className="h-4 w-4"
                onError={() => setFaviconError(true)}
              />
            ) : (
              <Globe className="h-4 w-4" />
            )}
          </span>
          <input
            type="text"
            autoFocus
            value={data.firstProjectDomain}
            onChange={(e) => update({ firstProjectDomain: e.target.value })}
            placeholder="exemple.com"
            className="flex-1 bg-transparent type-body outline-none placeholder:text-[var(--text-muted)]"
          />
          {isValid && <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[var(--color-success)]" />}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <label className="type-label text-[var(--text-primary)]">Fréquence d'analyse</label>
        <div className="inline-flex w-fit items-center gap-1 rounded-full bg-[var(--bg-subtle)] p-1">
          {FREQUENCIES.map(({ key, label }) => {
            const selected = data.analysisFrequency === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => update({ analysisFrequency: key })}
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

      <div className="flex flex-col gap-2.5">
        <label className="type-label text-[var(--text-primary)]">
          Connecter vos données <span className="ml-1.5 font-normal text-[var(--text-muted)]">(optionnel)</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Connector
            label="Search Console"
            sub={data.gscConnected ? "Connecté" : "Connecter"}
            connected={data.gscConnected}
            onClick={() => mockConnect("gsc")}
            dotColor="#4285F4"
          />
          <Connector
            label="Analytics 4"
            sub={data.ga4Connected ? "Connecté" : "Connecter"}
            connected={data.ga4Connected}
            onClick={() => mockConnect("ga4")}
            dotColor="#E37400"
          />
        </div>
      </div>
    </div>
  );
}

function Connector({ label, sub, connected, onClick, dotColor }: { label: string; sub: string; connected: boolean; onClick: () => void; dotColor: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={connected}
      className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors ${
        connected
          ? "border-[var(--color-success)] bg-[var(--color-success-bg)]"
          : "border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--border-medium)]"
      }`}
    >
      <span
        className="h-2 w-2 flex-shrink-0 rounded-full"
        style={{ backgroundColor: connected ? "var(--color-success)" : dotColor }}
      />
      <span className="min-w-0 flex-1">
        <span className="block type-label text-[var(--text-primary)]">{label}</span>
        <span className={`block type-micro ${connected ? "text-[var(--color-success)]" : "text-[var(--text-muted)]"}`}>
          {sub}
        </span>
      </span>
    </button>
  );
}
