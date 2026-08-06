"use client";

/**
 * AvatarUpload — photo de profil éditable (paramètres du compte).
 *
 * - Aperçu rond : photo choisie, sinon avatar par défaut (pravatar), sinon initiales.
 * - Actions : « Importer une photo » (file picker) + « Retirer ».
 * - Le fichier est lu en base64 (FileReader) et gardé en mémoire — prototype sans
 *   backend, cohérent avec le reste de l'app en mock. Le jour où le stockage
 *   existe, seul `onChange` change de destination.
 */

import { useRef, useState } from "react";
import { PhotoIcon, TrashIcon } from "@heroicons/react/24/outline";
import { pravatarUrl } from "@/lib/avatar";

/** Taille max acceptée (garde-fou UX, l'image part en base64 en mémoire). */
const MAX_MB = 2;
const ACCEPTED = "image/png,image/jpeg,image/webp";

export function AvatarUpload({
  name,
  photoSeed,
  value,
  onChange,
  onError,
}: {
  /** Sert au fallback initiales. */
  name: string;
  /** Avatar par défaut si aucune photo importée. */
  photoSeed?: string;
  /** Photo importée (data URL) ou null. */
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  /** Remonte un message d'erreur (toast côté page). */
  onError?: (message: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [imgError, setImgError] = useState(false);

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const src = value ?? (photoSeed && !imgError ? pravatarUrl(photoSeed, 160) : null);

  function pick(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      onError?.("Format non supporté — utilisez une image PNG, JPG ou WebP.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      onError?.(`Image trop lourde (max ${MAX_MB} Mo).`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImgError(false);
      onChange(typeof reader.result === "string" ? reader.result : null);
    };
    reader.onerror = () => onError?.("Impossible de lire ce fichier.");
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex items-center gap-5">
      {/* Aperçu */}
      <div className="relative flex-shrink-0">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt="Photo de profil"
            width={72}
            height={72}
            onError={() => setImgError(true)}
            className="h-[72px] w-[72px] rounded-full object-cover"
          />
        ) : (
          <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[var(--bg-subtle)] type-h3 text-[var(--text-secondary)]">
            {initials || "?"}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] px-3 py-1.5 type-label text-[var(--text-primary)] transition-colors hover:border-[var(--border-medium)] hover:bg-[var(--bg-subtle)]"
          >
            <PhotoIcon className="h-4 w-4" />
            {value ? "Changer la photo" : "Importer une photo"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 type-label text-[var(--text-muted)] transition-colors hover:text-[var(--color-danger)]"
            >
              <TrashIcon className="h-4 w-4" />
              Retirer
            </button>
          )}
        </div>
        <p className="mt-2 type-caption">PNG, JPG ou WebP · {MAX_MB} Mo max · carré recommandé.</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = ""; // permet de re-sélectionner le même fichier
        }}
        className="hidden"
      />
    </div>
  );
}
