"use client";

/**
 * AddTopicModal — ajout d'un sujet en 2 étapes (comme l'onboarding Visibilité IA) :
 *   1. Nom du sujet.
 *   2. Prompts proposés automatiquement — éditables, ajoutables, supprimables.
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PlusIcon, XMarkIcon, ArrowLeftIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/Button";

/** Propositions de prompts (mock) dérivées du nom du sujet. */
function proposePrompts(topic: string): string[] {
  const t = topic.trim();
  return [
    `Quelles sont les meilleures options en ${t} ?`,
    `Comment bien choisir en matière de ${t} ?`,
    `${t} : comparatif et avis 2026`,
    `Quels sont les acteurs de référence en ${t} ?`,
  ];
}

export function AddTopicModal({ onCreate, onClose }: {
  onCreate: (name: string, prompts: string[]) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [prompts, setPrompts] = useState<string[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  function next() {
    if (!name.trim()) return;
    setPrompts(proposePrompts(name.trim()));
    setStep(2);
  }
  function submit() {
    const clean = prompts.map((p) => p.trim()).filter(Boolean);
    onCreate(name.trim(), clean);
    onClose();
  }
  const setPromptAt = (i: number, v: string) => setPrompts((ps) => ps.map((p, j) => (j === i ? v : p)));
  const removePromptAt = (i: number) => setPrompts((ps) => ps.filter((_, j) => j !== i));
  const addPrompt = () => setPrompts((ps) => [...ps, ""]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="flex max-h-[85vh] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* En-tête + indicateur d'étape */}
        <div className="flex items-center justify-between gap-3 px-6 pt-5">
          <div>
            <p className="text-[16px] font-semibold text-[var(--text-primary)]">Ajouter un sujet</p>
            <p className="mt-0.5 text-[13px] text-[var(--text-secondary)]">Étape {step} sur 2 · {step === 1 ? "Nom du sujet" : "Prompts proposés"}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`h-1.5 w-6 rounded-full transition-colors ${step >= 1 ? "bg-[var(--accent-primary)]" : "bg-[var(--border-medium)]"}`} />
            <span className={`h-1.5 w-6 rounded-full transition-colors ${step >= 2 ? "bg-[var(--accent-primary)]" : "bg-[var(--border-medium)]"}`} />
          </div>
        </div>

        {step === 1 ? (
          <div className="flex flex-col gap-5 px-6 py-5">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-[var(--text-secondary)]">Nom du sujet</span>
              <input
                value={name}
                autoFocus
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") next(); }}
                placeholder="Ex. Agence SEO"
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-2.5 text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] focus:border-[var(--border-medium)]"
              />
            </label>
            <p className="text-[12px] leading-relaxed text-[var(--text-muted)]">
              À l'étape suivante, on vous proposera automatiquement des prompts pour ce sujet — vous pourrez les modifier ou en ajouter.
            </p>
          </div>
        ) : (
          <div className="flex min-h-0 flex-col gap-3 px-6 py-5">
            <div className="flex items-center gap-1.5 text-[13px] text-[var(--text-secondary)]">
              <SparklesIcon className="h-4 w-4 text-[var(--accent-primary)]" />
              Prompts proposés pour <span className="font-medium text-[var(--text-primary)]">{name.trim()}</span>
            </div>
            <div className="flex min-h-0 flex-col gap-2 overflow-y-auto">
              {prompts.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={p}
                    onChange={(e) => setPromptAt(i, e.target.value)}
                    placeholder="Texte du prompt…"
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-2.5 text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] focus:border-[var(--border-medium)]"
                  />
                  <button type="button" onClick={() => removePromptAt(i)} aria-label="Retirer"
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--color-danger)]">
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addPrompt}
                className="flex items-center gap-1.5 rounded-xl border border-dashed border-[var(--border-subtle)] px-3.5 py-2.5 text-[13px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
                <PlusIcon className="h-4 w-4 flex-shrink-0" />
                Ajouter un prompt
              </button>
            </div>
          </div>
        )}

        {/* Pied */}
        <div className="flex items-center justify-between gap-2 border-t border-[var(--border-subtle)] px-6 py-4">
          {step === 2 ? (
            <button type="button" onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">
              <ArrowLeftIcon className="h-4 w-4" />Retour
            </button>
          ) : <span />}
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="md" onClick={onClose}>Annuler</Button>
            {step === 1
              ? <Button size="md" onClick={next} disabled={!name.trim()}>Suivant</Button>
              : <Button size="md" onClick={submit}>Créer le sujet</Button>}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
