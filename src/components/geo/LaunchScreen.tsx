"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon } from "@heroicons/react/24/solid";
import type { GeoSetup } from "@/components/geo/types";

/**
 * Écran de génération joué après « Lancer le suivi », avant l'arrivée sur la
 * Vue d'ensemble. Mock : déroule une checklist d'étapes puis appelle onDone.
 */

const LOGOS = [
  { src: "/llm/gemini.svg",    alt: "Gemini",  size: 52, delay: "0.2s", dur: "3.4s" },
  { src: "/llm/chatgpt.svg",   alt: "ChatGPT", size: 74, delay: "0s",   dur: "3s"   },
  { src: "/llm/microsoft.svg", alt: "Copilot", size: 52, delay: "0.5s", dur: "3.6s" },
];

export function LaunchScreen({ setup, domain, onDone }: { setup: GeoSetup; domain: string; onDone: () => void }) {
  const promptCount = setup.lists.reduce((n, l) => n + l.prompts.length, 0);
  const steps = [
    `Préparation de ${promptCount} prompts sur ${setup.lists.length} sujets`,
    `Interrogation de ${setup.platforms.length} modèles IA`,
    "Analyse des citations et des mentions",
    "Calcul de votre score de visibilité",
  ];

  const [active, setActive] = useState(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setActive(i);
      if (i >= steps.length) {
        clearInterval(id);
        setTimeout(() => onDoneRef.current(), 800);
      }
    }, 900);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-[58vh] flex-col items-center justify-center px-8 text-center">
      {/* Cluster de logos LLM flottants */}
      <div className="mb-8 flex items-end justify-center gap-3">
        {LOGOS.map((t) => (
          <img
            key={t.alt}
            src={t.src}
            alt={t.alt}
            width={t.size}
            height={t.size}
            className="flex-shrink-0"
            style={{
              width: t.size, height: t.size,
              filter: "drop-shadow(0 10px 24px rgba(15,23,42,0.10))",
              animation: `geo-float ${t.dur} ease-in-out ${t.delay} infinite`,
            }}
          />
        ))}
      </div>

      <h1 className="text-[22px] font-semibold tracking-tight text-[var(--text-primary)]">
        Analyse de votre visibilité IA…
      </h1>
      <p className="mt-2 max-w-md text-[14px] leading-relaxed text-[var(--text-secondary)]">
        On interroge les modèles pour {domain}. Quelques secondes, on prépare votre tableau de bord.
      </p>

      {/* Checklist de génération */}
      <div className="mt-8 flex w-full max-w-sm flex-col gap-3 text-left">
        {steps.map((label, i) => {
          const done = i < active;
          const current = i === active;
          return (
            <div key={label} className={`flex items-center gap-3 transition-opacity duration-300 ${i > active ? "opacity-40" : "opacity-100"}`}>
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center">
                {done ? (
                  <CheckIcon className="h-5 w-5 text-[var(--accent-primary)]" />
                ) : current ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--border-medium)] border-t-[var(--accent-primary)]" />
                ) : (
                  <span className="h-5 w-5 rounded-full border-2 border-[var(--border-subtle)]" />
                )}
              </span>
              <span className={`text-[14px] ${done || current ? "font-medium text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>{label}</span>
            </div>
          );
        })}
      </div>

      {/* Barre de progression */}
      <div className="mt-8 h-1 w-full max-w-sm overflow-hidden rounded-full bg-[var(--bg-subtle)]">
        <div className="h-full rounded-full bg-[var(--accent-primary)] transition-[width] duration-700 ease-out"
          style={{ width: `${Math.min(active / steps.length, 1) * 100}%` }} />
      </div>
    </div>
  );
}
