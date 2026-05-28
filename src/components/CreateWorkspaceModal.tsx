"use client";

/**
 * CreateWorkspaceModal — parcours de création d'un workspace.
 *
 * Remplace l'ancien window.prompt : aperçu live de l'avatar, saisie du nom,
 * choix d'une couleur d'accent. S'appuie sur le shell de modale du DS.
 */

import { useState } from "react";
import { CheckIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/Button";
import { ModalShell, FormField, fieldCls } from "@/components/analyse/modals/shared";
import { ACCENT_PRESETS, deriveInitials } from "@/lib/agency-branding";

export function CreateWorkspaceModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (data: { name: string; accentColor: string }) => void;
}) {
  const [name, setName] = useState("");
  const [accentColor, setAccentColor] = useState(ACCENT_PRESETS[1].value); // Violet par défaut
  const trimmed = name.trim();
  const initials = trimmed ? deriveInitials(trimmed) : "?";

  function submit() {
    if (!trimmed) return;
    onCreate({ name: trimmed, accentColor });
  }

  return (
    <ModalShell onClose={onClose} maxWidth={440}>
      <div className="mb-6">
        <h2 className="text-[18px] font-semibold tracking-tight text-[var(--text-primary)]">
          Créer un workspace
        </h2>
        <p className="mt-1 text-[13px] text-[var(--text-muted)]">
          Un espace séparé pour organiser vos projets et vos collaborateurs.
        </p>
      </div>

      {/* Aperçu live */}
      <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-3">
        <span
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-[15px] font-semibold text-white"
          style={{
            background: `linear-gradient(135deg, ${accentColor}, color-mix(in oklab, ${accentColor} 55%, #000))`,
          }}
          aria-hidden="true"
        >
          {initials.slice(0, 2)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-[var(--text-primary)]">
            {trimmed || "Nom du workspace"}
          </p>
          <p className="text-[12px] text-[var(--text-muted)]">Plan Hobby</p>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <FormField label="Nom du workspace" required>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            placeholder="Ex. Studio Lumen"
            className={fieldCls}
          />
        </FormField>

        <FormField label="Couleur d'accent">
          <div className="flex flex-wrap gap-2">
            {ACCENT_PRESETS.map((preset) => {
              const selected = preset.value === accentColor;
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setAccentColor(preset.value)}
                  aria-label={preset.label}
                  aria-pressed={selected}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: preset.value,
                    outline: selected ? "2px solid var(--text-primary)" : "none",
                    outlineOffset: 2,
                  }}
                >
                  {selected && <CheckIcon className="h-4 w-4 text-white" strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </FormField>
      </div>

      <div className="mt-7 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Annuler
        </Button>
        <Button onClick={submit} disabled={!trimmed}>
          Créer le workspace
        </Button>
      </div>
    </ModalShell>
  );
}
