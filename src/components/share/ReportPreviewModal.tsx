"use client";

/**
 * ReportPreviewModal — modale d'aperçu d'un rapport mensuel.
 *
 * Mockup d'une couverture PDF white-label : bandeau agence en haut,
 * gros titre du rapport + mois, KPIs synthèse, points clés, signature
 * consultant. Toujours en read-only — la vraie génération PDF arrive
 * avec C1.
 */

import { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  XMarkIcon,
  DocumentArrowDownIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { useAgencyBranding } from "@/hooks/useAgencyBranding";
import type { SharedReport } from "@/data/sharedProjects";

interface Props {
  report: SharedReport;
  clientName: string;
  consultantName: string;
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
}

export function ReportPreviewModal({
  report,
  clientName,
  consultantName,
  isOpen,
  onClose,
  onDownload,
}: Props) {
  const branding = useAgencyBranding();
  const agencyName = branding.name ?? "L'agence";
  const accent = branding.accentColor ?? "#3D4FFF";

  /* Lock scroll + Esc */
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  const publishedAt = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(report.publishedAt));
  const fileSize =
    report.fileSizeKb >= 1024
      ? `${(report.fileSizeKb / 1024).toFixed(1)} Mo`
      : `${report.fileSizeKb} Ko`;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Aperçu du rapport ${report.month}`}
    >
      {/* Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Container modale */}
      <div
        className="relative z-10 flex max-h-full w-full max-w-[900px] flex-col overflow-hidden rounded-2xl bg-[var(--bg-primary)] shadow-2xl"
        style={{ transitionTimingFunction: "var(--ease-expo)" }}
      >
        {/* Header */}
        <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-card-static)] px-5">
          <div className="flex items-center gap-2.5">
            <span className="rounded-full bg-[var(--bg-pill-active)] px-2 py-0.5 type-micro font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Aperçu
            </span>
            <span className="type-label text-[var(--text-primary)]">
              Rapport {report.month}
            </span>
            <span className="type-caption tabular-nums text-[var(--text-muted)]">
              · {report.pages} pages · {fileSize}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDownload}
              className="flex h-8 items-center gap-1.5 rounded-full bg-[var(--bg-card-static)] px-3 type-caption font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-pill-active-hover)]"
            >
              <DocumentArrowDownIcon className="h-3.5 w-3.5" />
              Télécharger
            </button>
            <button
              onClick={onClose}
              aria-label="Fermer l'aperçu"
              className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-card-static)] hover:text-[var(--text-primary)]"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body — fake PDF page */}
        <div className="flex-1 overflow-y-auto bg-[var(--bg-secondary)] p-8">
          <article className="mx-auto flex max-w-[680px] flex-col gap-8 rounded-2xl bg-white p-10 shadow-[0_8px_32px_-12px_rgba(15,23,42,0.18)]">
            {/* Bandeau agence */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-5">
              <div className="flex items-center gap-2.5">
                {branding.logoDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={branding.logoDataUrl}
                    alt={agencyName}
                    className="h-7 w-7 rounded-lg object-contain"
                  />
                ) : (
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg type-micro font-semibold text-white"
                    style={{ backgroundColor: accent }}
                  >
                    {branding.initials ?? "AG"}
                  </div>
                )}
                <span className="type-label font-semibold text-slate-900">
                  {agencyName}
                </span>
              </div>
              <span className="type-micro tabular-nums text-slate-500">
                Publié le {publishedAt}
              </span>
            </div>

            {/* Couverture */}
            <header className="flex flex-col gap-2">
              <p
                className="type-caption font-semibold uppercase tracking-[0.14em]"
                style={{ color: accent }}
              >
                Rapport mensuel
              </p>
              <h1 className="text-[40px] font-semibold leading-[1.05] tracking-tight text-slate-900">
                {report.month}
              </h1>
              <p className="mt-1 type-body text-slate-600">
                Préparé pour <span className="font-semibold text-slate-900">{clientName}</span>
              </p>
            </header>

            {/* Synthèse */}
            <section className="flex flex-col gap-3">
              <h2 className="type-body font-semibold uppercase tracking-wider text-slate-500">
                Synthèse du mois
              </h2>
              <p className="type-body text-slate-800">
                {report.summary}
              </p>
            </section>

            {/* Highlights */}
            {report.highlights.length > 0 && (
              <section className="flex flex-col gap-3">
                <h2 className="flex items-center gap-2 type-body font-semibold uppercase tracking-wider text-slate-500">
                  <ChartBarIcon className="h-4 w-4" />
                  Points clés
                </h2>
                <ul className="flex flex-col gap-2">
                  {report.highlights.map((h, i) => (
                    <li
                      key={i}
                      className="flex items-baseline gap-3 rounded-xl bg-slate-50 px-4 py-3 type-body text-slate-800"
                    >
                      <span
                        className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: accent }}
                        aria-hidden
                      />
                      {h}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Pages skeleton — donne l'illusion d'un PDF multi-pages */}
            <section className="flex flex-col gap-3">
              <h2 className="type-body font-semibold uppercase tracking-wider text-slate-500">
                Détail dans le rapport complet
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  "Évolution du trafic SEO",
                  "Top pages performantes",
                  "Mots-clés en progression",
                  "Backlinks acquis ce mois",
                ].map((label) => (
                  <div
                    key={label}
                    className="rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <p className="type-caption font-medium text-slate-500">Section</p>
                    <p className="mt-1 type-body font-semibold leading-tight text-slate-900">
                      {label}
                    </p>
                    <div className="mt-3 flex flex-col gap-1.5">
                      <span className="block h-1.5 rounded-full bg-slate-100" />
                      <span className="block h-1.5 w-4/5 rounded-full bg-slate-100" />
                      <span className="block h-1.5 w-3/5 rounded-full bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Signature consultant */}
            <footer className="flex items-center justify-between border-t border-slate-200 pt-5">
              <div>
                <p className="type-micro uppercase tracking-wider text-slate-400">
                  Préparé par
                </p>
                <p className="mt-1 type-label font-semibold text-slate-900">
                  {consultantName}
                </p>
              </div>
              <span className="type-micro tabular-nums text-slate-400">
                Page 1 / {report.pages}
              </span>
            </footer>
          </article>
        </div>
      </div>
    </div>,
    document.body,
  );
}
