"use client";

/**
 * KeywordStudyModal — modal that launches a Semrush-based keyword study
 * (upload client CSV + optional competitor CSV, choose dedupe strategy).
 * Includes the SemrushFileField sub-component and the DedupeStrategy mock data.
 * Extracted verbatim from src/app/(app)/analyse/[domain]/page.tsx.
 */

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  XMarkIcon,
  ExclamationCircleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import {
  FileSpreadsheet,
  Upload,
  X as LX,
  Sparkles as LSparkles,
} from "lucide-react";
import { Button } from "@/components/Button";
import { useModalTransition } from "@/hooks/useModalTransition";

function SemrushFileField({
  label,
  required = false,
  file,
  onFile,
}: {
  label: string;
  required?: boolean;
  file: File | null;
  onFile: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-medium text-[var(--text-secondary)]">
        {label} {required && <span className="text-[var(--color-danger)]">*</span>}
      </label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files[0];
          if (f) onFile(f);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed px-5 py-4 transition-colors ${
          dragOver
            ? "border-[var(--accent-primary)] bg-[var(--accent-primary-soft)]"
            : file
            ? "border-[var(--border-medium)] bg-[var(--bg-secondary)]"
            : "border-[var(--border-subtle)] hover:border-[var(--border-medium)] hover:bg-[var(--bg-secondary)]"
        }`}
      >
        {file ? (
          <>
            <FileSpreadsheet className="h-6 w-6 flex-shrink-0 text-[var(--color-success)]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-[var(--text-primary)]">{file.name}</p>
              <p className="text-[11px] tracking-caption text-[var(--text-muted)]">{(file.size / 1024).toFixed(1)} Ko · cliquez pour changer</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onFile(null); }}
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
              aria-label="Retirer"
            >
              <LX className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <Upload className="h-6 w-6 flex-shrink-0 text-[var(--text-muted)]" />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-[var(--text-primary)]">Aucun fichier choisi</p>
              <p className="text-[11px] tracking-caption text-[var(--text-muted)]">Glissez un export CSV / XLSX ou cliquez pour parcourir</p>
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls,text/csv"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  );
}

/** Stratégie de dédup pour les mots-clés déjà couverts par une URL existante.
 *  Une étude = listing → l'utilisateur décide ensuite quoi créer.
 *  - "skip"    : exclure les doublons du listing (recommandé)
 *  - "include" : les inclure quand même, l'user verra le conflit dans la liste */
type DedupeStrategy = "skip" | "include";

/** Mock : mots-clés du projet déjà couverts par une URL/analyse existante */
const EXISTING_KEYWORDS = [
  "seo local", "audit seo", "core web vitals 2024", "maillage interne seo",
  "brief seo template", "optimiser balise title", "schema markup",
];

/** Mock : aperçu des doublons détectés dans le CSV uploadé */
const DETECTED_DUPLICATES = [
  { keyword: "seo local",            existingUrl: "/blog/seo-local",                 lastAnalysis: "Il y a 8 jours" },
  { keyword: "audit seo",            existingUrl: "/services/audit-seo",             lastAnalysis: "Il y a 3 jours" },
  { keyword: "core web vitals 2024", existingUrl: "/blog/core-web-vitals",           lastAnalysis: "Il y a 12 jours" },
  { keyword: "maillage interne seo", existingUrl: "/blog/maillage-interne",          lastAnalysis: "Il y a 5 jours" },
  { keyword: "optimiser balise title", existingUrl: "/blog/balises-title-meta",      lastAnalysis: "Il y a 1 mois" },
];

export function KeywordStudyModal({ onClose, onLaunch }: { onClose: () => void; onLaunch: () => void }) {
  const [clientFile, setClientFile] = useState<File | null>(null);
  const [compFile,   setCompFile]   = useState<File | null>(null);
  const [dedupeStrategy, setDedupeStrategy] = useState<DedupeStrategy>("skip");
  const [showDupesList, setShowDupesList] = useState(false);

  const canLaunch = clientFile !== null;
  const showDedupe = clientFile !== null;
  const { phase, requestClose } = useModalTransition(onClose);

  function handleLaunch() {
    if (!canLaunch) return;
    onLaunch();
    requestClose();
  }

  const STRATEGY_OPTIONS: { key: DedupeStrategy; label: string; desc: string }[] = [
    { key: "skip",    label: "Exclure du listing (recommandé)", desc: "Les mots-clés déjà exploités sur vos URLs n'apparaîtront pas dans le résultat de l'étude." },
    { key: "include", label: "Inclure dans le listing",         desc: "Les doublons restent visibles, marqués comme déjà couverts. Utile pour détecter des conflits ou décider d'un refresh manuel." },
  ];

  if (typeof document === "undefined") return null;
  const overlayClass = phase === "open" ? "is-open" : phase === "closing" ? "is-closing" : "";
  const modalClass   = phase === "open" ? "is-open" : phase === "closing" ? "is-closing" : "";

  return createPortal(
    <div
      role="presentation"
      className={`t-modal-overlay ${overlayClass} fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm`}
      onClick={(e) => e.target === e.currentTarget && requestClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="t-modal ${modalClass} relative flex w-full max-w-[520px] max-h-[85vh] flex-col overflow-hidden rounded-2xl bg-[var(--modal-bg)] shadow-[var(--shadow-floating)]"
      >
        <button
          onClick={requestClose}
          className="absolute right-6 top-6 z-10 flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex-shrink-0 px-8 pt-8 pb-4">
          <h2 className="pr-10 font-semibold tracking-heading text-[var(--text-primary)]">Identifier les pages manquantes</h2>
          <p className="mt-1 text-[13px] tracking-body text-[var(--text-muted)]">
            Détectez les mots-clés que vos concurrents ont et que vous n'avez pas. Vous validerez chaque création d'URL et d'analyse ensuite.
          </p>
        </div>

        {/* Body scrollable */}
        <div className="flex-1 overflow-y-auto px-8 pb-2">
          <div className="flex flex-col gap-4">
            <SemrushFileField
              label="Export Semrush — positions organiques du client"
              required
              file={clientFile}
              onFile={setClientFile}
            />
            <SemrushFileField
              label="Export Semrush — concurrent (optionnel)"
              file={compFile}
              onFile={setCompFile}
            />
          </div>

          {showDedupe && (
            <div className="mt-6 rounded-2xl bg-[var(--bg-subtle)] p-4">
              <div className="flex items-start gap-3">
                <ExclamationCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-warning)]" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-[var(--text-primary)]">
                    <span className="tabular-nums">{DETECTED_DUPLICATES.length}</span> mots-clés déjà exploités détectés
                  </p>
                  <p className="mt-0.5 text-[12px] text-[var(--text-secondary)]">
                    Sur les {EXISTING_KEYWORDS.length}+ mots-clés actuellement couverts par vos URLs existantes. Comment les traiter dans le listing ?
                  </p>

                  <div className="mt-3 flex flex-col gap-2">
                    {STRATEGY_OPTIONS.map((opt) => {
                      const active = dedupeStrategy === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setDedupeStrategy(opt.key)}
                          className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                            active
                              ? "border-[var(--accent-primary)] bg-[var(--accent-primary-soft)]"
                              : "border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--border-medium)]"
                          }`}
                        >
                          <span
                            className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                              active ? "border-[var(--accent-primary)]" : "border-[var(--border-medium)]"
                            }`}
                          >
                            {active && <span className="h-2 w-2 rounded-full bg-[var(--accent-primary)]" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className={`block text-[13px] font-medium ${active ? "text-[var(--accent-primary)]" : "text-[var(--text-primary)]"}`}>
                              {opt.label}
                            </span>
                            <span className="mt-0.5 block text-[12px] tracking-caption text-[var(--text-muted)]">
                              {opt.desc}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowDupesList((v) => !v)}
                    className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-[var(--accent-primary)] transition-opacity hover:opacity-80"
                  >
                    {showDupesList ? "Masquer" : "Voir"} la liste des doublons détectés
                    <ChevronDownIcon className={`h-3 w-3 transition-transform ${showDupesList ? "rotate-180" : ""}`} />
                  </button>

                  {showDupesList && (
                    <div className="mt-2 overflow-hidden rounded-xl border border-[var(--border-subtle)]">
                      {DETECTED_DUPLICATES.map((d, i) => (
                        <div
                          key={d.keyword}
                          className={`grid grid-cols-[1fr_auto] items-center gap-3 px-3 py-2 ${i < DETECTED_DUPLICATES.length - 1 ? "border-b border-[var(--border-subtle)]" : ""}`}
                        >
                          <div className="min-w-0">
                            <p className="truncate text-[12.5px] font-medium text-[var(--text-primary)]">{d.keyword}</p>
                            <p className="truncate font-mono text-[10.5px] text-[var(--text-muted)]">{d.existingUrl}</p>
                          </div>
                          <span className="text-[10.5px] tracking-caption text-[var(--text-muted)]">{d.lastAnalysis}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer sticky avec separator */}
        <div className="flex-shrink-0 flex items-center justify-end gap-3 border-t border-[var(--border-subtle)] bg-[var(--modal-bg)] px-8 py-4">
          <button onClick={onClose} className="rounded-full px-4 py-2 text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">Annuler</button>
          <Button disabled={!canLaunch} onClick={handleLaunch}>
            <LSparkles className="h-4 w-4" />
            Lancer l'étude de mots-clés
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
