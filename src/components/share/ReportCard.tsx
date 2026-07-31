"use client";

/**
 * ReportCard — fiche rapport mensuel.
 *
 * Layout : icône PDF + titre + meta + résumé, et 2 boutons icon-only
 * (aperçu / télécharger) à droite, avec tooltips. L'aperçu ouvre une
 * modale white-label simulant la couverture du PDF.
 */

import { useState } from "react";
import { Button } from "@/components/Button";
import { ReportPreviewModal } from "@/components/share/ReportPreviewModal";
import type { SharedReport } from "@/data/sharedProjects";

interface ReportCardProps {
  report: SharedReport;
  clientName: string;
  consultantName: string;
}

export function ReportCard({ report, clientName, consultantName }: ReportCardProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  function handleDownload() {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2400);
      if (report.pdfUrl) {
        window.open(report.pdfUrl, "_blank");
      }
    }, 800);
  }

  const fileSize =
    report.fileSizeKb >= 1024
      ? `${(report.fileSizeKb / 1024).toFixed(1)} Mo`
      : `${report.fileSizeKb} Ko`;
  const publishedAt = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
  }).format(new Date(report.publishedAt));

  const buttonState = downloaded ? "done" : downloading ? "loading" : "idle";

  return (
    <>
      <article
        role="button"
        tabIndex={0}
        onClick={() => setPreviewOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setPreviewOpen(true);
          }
        }}
        aria-label={`Aperçu du rapport ${report.month}`}
        className="group flex cursor-pointer flex-col rounded-2xl p-5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
        style={{ backgroundColor: "#F7F7F7" }}
      >
        {/* Header — titre + meta à gauche, CTA Télécharger à droite */}
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0 flex-1">
            <h3 className="type-h3">
              Rapport {report.month}
            </h3>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 type-caption text-[var(--text-muted)]">
              <span className="tabular-nums">{report.pages} pages</span>
              <span aria-hidden className="text-[var(--border-medium)]">·</span>
              <span className="tabular-nums">{fileSize}</span>
              <span aria-hidden className="text-[var(--border-medium)]">·</span>
              <span>publié le {publishedAt}</span>
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            disabled={downloading}
            onClick={(e) => {
              // Stop propagation pour ne pas déclencher l'ouverture de la modale
              // d'aperçu via le clic sur la card parente.
              e.stopPropagation();
              handleDownload();
            }}
          >
            {buttonState === "done"
              ? "Téléchargé"
              : buttonState === "loading"
                ? "Téléchargement…"
                : "Télécharger"}
          </Button>
        </div>

        {/* Séparateur full-width */}
        <hr className="-mx-5 my-4 border-0 border-t border-[var(--border-subtle)]" />

        {/* Résumé pleine largeur */}
        <p className="max-w-[640px] type-body-sm">
          {report.summary}
        </p>
      </article>

      <ReportPreviewModal
        report={report}
        clientName={clientName}
        consultantName={consultantName}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onDownload={() => {
          setPreviewOpen(false);
          handleDownload();
        }}
      />
    </>
  );
}
