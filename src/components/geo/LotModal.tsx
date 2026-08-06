"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Tooltip } from "@/components/Tooltip";
import { VisibilityAnalytics, PromptRankingTable } from "@/components/geo/views/VisibilityView";
import { lotSeed, topicRankings } from "@/data/geo-analytics";
import type { GeoSetup, TopicList } from "@/components/geo/types";

/**
 * Analyse d'un lot (liste de prompts) — même drawer que [[PromptModal]] (slide depuis la
 * droite, 960px, backdrop transparent, header retour/nav/fermer + chips), mais en PLEINE
 * largeur : pas de colonne « Historique des analyses ». Corps = sections analytics
 * [[VisibilityAnalytics]] (Score de visibilité / Share of voice / Position moyenne)
 * scopées au lot via `lotSeed`.
 */
export function LotModal({ lot, lots = [], setup, domain, onNavigate, onClose }: {
  lot: TopicList;
  /** Lots affichés — pour la navigation « < » / « > ». */
  lots?: TopicList[];
  setup: GeoSetup;
  domain: string;
  onNavigate?: (l: TopicList) => void;
  onClose: () => void;
}) {
  const idx = lots.findIndex((l) => l.id === lot.id);
  const hasPrev = idx > 0;
  const hasNext = idx >= 0 && idx < lots.length - 1;
  const goPrev = () => { if (hasPrev) onNavigate?.(lots[idx - 1]); };
  const goNext = () => { if (hasNext) onNavigate?.(lots[idx + 1]); };

  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  const promptCount = lot.prompts.length;
  const volume = lot.prompts.reduce((s, p) => s + (p.volume ?? 0), 0);
  // Classement de marques par prompt de ce lot (même grille #1..#10 que « Classement par sujet »).
  const lotIndex = setup.lists.findIndex((l) => l.id === lot.id);
  const lotPromptRankings = lotIndex >= 0 ? (topicRankings(setup, domain)[lotIndex]?.prompts ?? []) : [];

  useEffect(() => { const id = setTimeout(() => setVisible(true), 10); return () => clearTimeout(id); }, []);
  useEffect(() => { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }, []);

  function handleClose() { setClosing(true); setTimeout(onClose, 300); }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, lots]);

  const open = visible && !closing;
  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      {/* Capteur de clic transparent — pas d'assombrissement ni de flou (comme PromptModal) */}
      <div aria-hidden="true" onClick={handleClose}
        className="fixed inset-0 z-[59]" style={{ pointerEvents: open ? "auto" : "none" }} />

      <aside role="dialog" aria-modal="true" aria-label="Analyse de la liste"
        className={`fixed inset-y-0 right-0 z-[60] flex w-[960px] max-w-[95vw] flex-col border-l border-[var(--border-subtle)] bg-[var(--bg-primary)] shadow-2xl transition-all duration-[320ms] ${open ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}`}
        style={{ transitionTimingFunction: "var(--ease-expo)" }}>

        {/* En-tête — barre retour/nav + titre + infos principales */}
        <div className="flex-shrink-0 border-b border-[var(--border-subtle)] px-8 pt-6 pb-5">
          <div className="mb-4 flex items-center justify-between gap-1">
            <Tooltip label="Retour aux listes" side="right" portal>
              <button onClick={handleClose} aria-label="Retour aux listes"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]">
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
            </Tooltip>
            <div className="flex items-center gap-1">
              <button onClick={goPrev} disabled={!hasPrev} aria-label="Liste précédente"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-30">
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button onClick={goNext} disabled={!hasNext} aria-label="Liste suivante"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-30">
                <ChevronRightIcon className="h-5 w-5" />
              </button>
              <div className="mx-1 h-4 w-px bg-[var(--border-subtle)]" />
              <button onClick={handleClose} aria-label="Fermer"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          <h1 className="mb-4 type-h1 leading-snug">{lot.name}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] px-3 py-1.5 type-caption text-[var(--text-primary)]">
              <span className="font-medium tabular-nums">{promptCount}</span> prompt{promptCount > 1 ? "s" : ""}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] px-3 py-1.5 type-caption text-[var(--text-primary)]">
              <span className="font-medium tabular-nums">{volume.toLocaleString("fr-FR")}</span> de volume estimé
            </span>
          </div>
        </div>

        {/* Corps — pleine largeur, scrollable (pas de colonne historique) */}
        <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-8 py-6">
          <VisibilityAnalytics setup={setup} domain={domain} seedOffset={lotSeed(lot.id)} />

          {/* Classement par prompt — même grille #1..#10 que « Classement par sujet », mais par prompt */}
          <section className="flex flex-col gap-3">
            <div>
              <p className="type-title">Classement par prompt</p>
              <p className="mt-0.5 type-caption">Classement de visibilité par prompt de cette liste, comparé aux marques de votre marché</p>
            </div>
            <PromptRankingTable prompts={lotPromptRankings} setup={setup} domain={domain} />
          </section>
        </div>
      </aside>
    </>,
    document.body,
  );
}
