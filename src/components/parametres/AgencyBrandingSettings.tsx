"use client";

/**
 * AgencyBrandingSettings — éditeur de l'identité agence (admin uniquement).
 *
 * Permet à un admin du workspace de configurer :
 *  - Nom du studio (apparaît dans le portail client)
 *  - Initiales (fallback si pas de logo)
 *  - Couleur d'accent (preset palette)
 *  - Logo (upload image → base64 → localStorage)
 *
 * Préview en temps réel : mini-render du ClientTopbar tel que les clients le verront.
 */

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpTrayIcon,
  CheckIcon,
  TrashIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useToast } from "@/context/ToastContext";
import {
  ACCENT_PRESETS,
  DEFAULT_BRANDING,
  deriveInitials,
  readBranding,
  resetBranding,
  saveBranding,
  type AgencyBranding,
} from "@/lib/agency-branding";

const MAX_LOGO_BYTES = 200_000; // ~200 ko pour rester sous la limite localStorage

export function AgencyBrandingSettings() {
  const { show: showToast } = useToast();

  const [name, setName] = useState(DEFAULT_BRANDING.name);
  const [initials, setInitials] = useState(DEFAULT_BRANDING.initials);
  const [initialsCustomized, setInitialsCustomized] = useState(false);
  const [accentColor, setAccentColor] = useState(DEFAULT_BRANDING.accentColor);
  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>(undefined);
  const [dirty, setDirty] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hydratation initiale depuis localStorage
  useEffect(() => {
    const b = readBranding();
    setName(b.name);
    setInitials(b.initials);
    setAccentColor(b.accentColor);
    setLogoDataUrl(b.logoDataUrl);
    setInitialsCustomized(b.initials !== deriveInitials(b.name));
  }, []);

  // Auto-dérive les initiales du nom tant que l'utilisateur ne les a pas customisées
  function handleNameChange(value: string) {
    setName(value);
    if (!initialsCustomized) {
      setInitials(deriveInitials(value));
    }
    setDirty(true);
  }

  function handleInitialsChange(value: string) {
    setInitials(value.toUpperCase().slice(0, 4));
    setInitialsCustomized(true);
    setDirty(true);
  }

  function handleLogoUpload(file: File) {
    if (file.size > MAX_LOGO_BYTES) {
      showToast(`Logo trop lourd (max ${Math.round(MAX_LOGO_BYTES / 1024)} ko)`);
      return;
    }
    if (!file.type.startsWith("image/")) {
      showToast("Format invalide (image attendue)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogoDataUrl(reader.result as string);
      setDirty(true);
    };
    reader.readAsDataURL(file);
  }

  function handleLogoRemove() {
    setLogoDataUrl(undefined);
    setDirty(true);
  }

  function handleSave() {
    const branding: AgencyBranding = { name: name.trim() || DEFAULT_BRANDING.name, initials, accentColor, logoDataUrl };
    saveBranding(branding);
    setDirty(false);
    showToast("Identité agence enregistrée");
  }

  function handleReset() {
    resetBranding();
    setName(DEFAULT_BRANDING.name);
    setInitials(DEFAULT_BRANDING.initials);
    setAccentColor(DEFAULT_BRANDING.accentColor);
    setLogoDataUrl(undefined);
    setInitialsCustomized(false);
    setDirty(false);
    showToast("Identité réinitialisée");
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Préview client */}
      <div className="rounded-2xl border border-[var(--border-subtle)] p-5">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Aperçu — ce que voient vos clients
        </p>
        <div className="flex items-center gap-2.5 rounded-xl bg-[var(--bg-card-static)] px-4 py-3">
          {logoDataUrl ? (
            <img
              src={logoDataUrl}
              alt={name}
              className="h-9 w-9 rounded-lg object-contain bg-white"
            />
          ) : (
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg font-semibold text-white"
              style={{ backgroundColor: accentColor, fontSize: 13 }}
            >
              {initials}
            </div>
          )}
          <span className="text-[14px] font-semibold tracking-tight text-[var(--text-primary)]">
            {name || "Nom du studio"}
          </span>
        </div>
      </div>

      {/* Formulaire */}
      <div className="grid grid-cols-2 gap-5">
        {/* Nom */}
        <div className="col-span-2 sm:col-span-1">
          <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-secondary)]">
            Nom du studio
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="ex. AWI Studio"
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--card-inner-bg)] px-3.5 py-2.5 text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] transition-colors focus:border-[var(--border-medium)]"
          />
        </div>

        {/* Initiales */}
        <div className="col-span-2 sm:col-span-1">
          <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-secondary)]">
            Initiales <span className="text-[var(--text-muted)]">(fallback sans logo)</span>
          </label>
          <input
            type="text"
            value={initials}
            onChange={(e) => handleInitialsChange(e.target.value)}
            placeholder="ex. AWI"
            maxLength={4}
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--card-inner-bg)] px-3.5 py-2.5 text-[14px] font-semibold uppercase tracking-wider text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] transition-colors focus:border-[var(--border-medium)]"
          />
        </div>

        {/* Couleur d'accent */}
        <div className="col-span-2">
          <label className="mb-2 block text-[12px] font-medium text-[var(--text-secondary)]">
            Couleur d'accent
          </label>
          <div className="flex flex-wrap gap-2">
            {ACCENT_PRESETS.map((preset) => {
              const selected = accentColor === preset.value;
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => {
                    setAccentColor(preset.value);
                    setDirty(true);
                  }}
                  className={`group flex h-9 items-center gap-2 rounded-full border px-3 transition-all ${
                    selected
                      ? "border-[var(--text-primary)]"
                      : "border-[var(--border-subtle)] hover:border-[var(--border-medium)]"
                  }`}
                  aria-pressed={selected}
                >
                  <span
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: preset.value }}
                  />
                  <span className="text-[12px] font-medium text-[var(--text-secondary)]">{preset.label}</span>
                  {selected && <CheckIcon className="h-3.5 w-3.5 text-[var(--text-primary)]" strokeWidth={2.5} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Logo upload */}
        <div className="col-span-2">
          <label className="mb-2 block text-[12px] font-medium text-[var(--text-secondary)]">
            Logo <span className="text-[var(--text-muted)]">(optionnel · PNG/SVG · max 200 ko)</span>
          </label>
          <div className="flex items-center gap-3">
            {logoDataUrl ? (
              <div className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--card-inner-bg)] px-3 py-2.5">
                <img src={logoDataUrl} alt="Logo agence" className="h-10 w-10 rounded-lg object-contain bg-white" />
                <button
                  type="button"
                  onClick={handleLogoRemove}
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--color-danger)]"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  Retirer
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-dashed border-[var(--border-medium)] px-4 text-[13px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]"
              >
                <ArrowUpTrayIcon className="h-4 w-4" />
                Choisir un fichier
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleLogoUpload(f);
                e.target.value = ""; // reset
              }}
            />
          </div>
          {logoDataUrl && (
            <p className="mt-2 text-[11px] text-[var(--text-muted)]">
              Si vous retirez le logo, les initiales seront utilisées comme fallback.
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-5">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
        >
          <ArrowPathIcon className="h-3.5 w-3.5" />
          Réinitialiser
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty}
          className="flex items-center gap-2 rounded-full bg-[var(--accent-primary)] px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}
