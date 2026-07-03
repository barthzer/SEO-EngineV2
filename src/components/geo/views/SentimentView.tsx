"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronRightIcon, ChevronLeftIcon, XMarkIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { GeoLineChart } from "@/components/geo/GeoLineChart";
import { SearchInput } from "@/components/SearchInput";
import { FilterTabs } from "@/components/FilterTabs";
import { Tooltip } from "@/components/Tooltip";
import { Flag } from "@/components/Flag";
import { RichResponse } from "@/components/geo/PromptModal";
import {
  positiveShare, positiveSentimentSeries, sentimentThemes, brandFromDomain,
  PLATFORM_LABEL, PLATFORM_DOMAIN, type SentimentTheme, type ThemeExample,
} from "@/components/geo/analytics";
import { REGIONS, type GeoSetup } from "@/components/geo/types";
import { CARD } from "@/components/geo/ui";
import { Section, SplitCard } from "@/components/geo/views/VisibilityView";
import { Favicon } from "@/components/geo/views/OverviewView";

const regionLabel = (code: string) => REGIONS.find((r) => r.code === code)?.label ?? code;
const SENT_CFG: Record<SentimentTheme["sentiment"], { label: string; color: string }> = {
  positive: { label: "Positif", color: "var(--color-success)" },
  negative: { label: "Négatif", color: "var(--color-danger)" },
  neutral:  { label: "Neutre",  color: "var(--text-muted)" },
};

export function SentimentView({ setup, domain }: { setup: GeoSetup; domain: string }) {
  const brand = brandFromDomain(domain);
  const { posPct, negPct } = positiveShare(setup);
  const posSeries = positiveSentimentSeries(setup, domain);
  const themes = sentimentThemes(setup, domain);
  const posThemes = themes.filter((t) => t.sentiment === "positive").slice(0, 3).map((t) => t.name);
  const negThemes = themes.filter((t) => t.sentiment === "negative").slice(0, 3).map((t) => t.name);

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Analyse de sentiment — courbe + résumé positif/négatif */}
      <Section title="Analyse de sentiment" subtitle={`Tonalité des réponses IA qui citent ${brand}`}>
        <SplitCard
          left={
            <div className="flex flex-col">
              <p className="text-[13px] text-[var(--text-muted)]">Sentiment positif</p>
              <p className="mb-5 mt-1 text-[28px] font-semibold leading-none tracking-tight text-[var(--text-primary)]">{posPct}%</p>
              <GeoLineChart series={posSeries} height={210} suffix="%" interactive />
            </div>
          }
          right={<SentimentSummary posPct={posPct} negPct={negPct} posThemes={posThemes} negThemes={negThemes} />}
        />
      </Section>

      {/* 2. Thèmes — table filtrable + exemples dépliables */}
      <Section title="Thèmes" subtitle={`Thèmes clés et patterns remontés par l'IA à propos de ${brand}`}>
        <ThemesTable themes={themes} brand={brand} />
      </Section>
    </div>
  );
}

/* ── Résumé positif / négatif + barre empilée (côté droit du SplitCard) ─── */

function SentimentSummary({ posPct, negPct, posThemes, negThemes }: {
  posPct: number; negPct: number; posThemes: string[]; negThemes: string[];
}) {
  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex-1">
        <p className="text-[13px] font-semibold text-[var(--color-success)]">{posPct}% Positif</p>
        <p className="mt-1.5 text-[17px] font-semibold leading-snug tracking-tight text-[var(--text-primary)]">{posThemes.join(", ")}</p>
      </div>
      <div className="flex-1 border-t border-[var(--border-subtle)] pt-5">
        <p className="text-[13px] font-semibold text-[var(--color-danger)]">{negPct}% Négatif</p>
        <p className="mt-1.5 text-[17px] font-semibold leading-snug tracking-tight text-[var(--text-primary)]">{negThemes.join(", ")}</p>
      </div>
      <div>
        <div className="flex h-8 gap-1 overflow-hidden">
          <div className="rounded-md" style={{ flex: Math.max(negPct, 6), backgroundColor: "var(--color-danger)" }} />
          <div className="rounded-md" style={{ flex: Math.max(posPct, 6), backgroundColor: "var(--color-success)" }} />
        </div>
        <div className="relative mt-1.5 h-4 text-[12px] font-medium tabular-nums text-[var(--text-muted)]">
          <span className="absolute left-0">{negPct}%</span>
          <span className="absolute" style={{ left: `${negPct}%` }}>{posPct}%</span>
        </div>
      </div>
    </div>
  );
}

/* ── Table des thèmes (filtres + recherche + lignes dépliables) ──────────── */

type ThemeFilter = "all" | "positive" | "negative" | "trending";

function ThemesTable({ themes, brand }: { themes: SentimentTheme[]; brand: string }) {
  const [filter, setFilter] = useState<ThemeFilter>("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [modal, setModal] = useState<ThemeExample | null>(null);

  const filtered = themes.filter((t) =>
    (filter === "all" || (filter === "trending" ? t.trending : t.sentiment === filter)) &&
    (!search || t.name.toLowerCase().includes(search.toLowerCase())),
  );
  const maxOcc = Math.max(1, ...themes.map((t) => t.occurrences));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full max-w-[240px]">
          <SearchInput value={search} onChange={setSearch} placeholder="Filtrer les thèmes…" alwaysExpanded />
        </div>
        <FilterTabs<ThemeFilter>
          tabs={[{ key: "all", label: "Tous" }, { key: "positive", label: "Positif" }, { key: "negative", label: "Négatif" }, { key: "trending", label: "Tendance" }]}
          value={filter}
          onChange={setFilter}
        />
      </div>

      <div className={`overflow-hidden ${CARD}`}>
        {/* En-tête */}
        <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-card-static)] px-5 py-2.5 text-[12px] font-medium text-[var(--text-muted)]">
          <span className="flex-1">Thème</span>
          <span className="w-[110px]">Sentiment</span>
          <span className="w-[150px]">Occurrences</span>
        </div>
        {filtered.length === 0 ? (
          <div className="px-5 py-10 text-center text-[14px] text-[var(--text-muted)]">Aucun thème pour ce filtre.</div>
        ) : (
          filtered.map((t) => {
            const isOpen = open === t.name;
            const cfg = SENT_CFG[t.sentiment];
            return (
              <div key={t.name} className="border-b border-[var(--border-subtle)] last:border-b-0">
                <button type="button" onClick={() => setOpen(isOpen ? null : t.name)}
                  className={`flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors ${isOpen ? "bg-[var(--bg-card-static)]" : "hover:bg-[var(--bg-subtle)]"}`}>
                  <ChevronRightIcon className={`h-4 w-4 flex-shrink-0 text-[var(--text-muted)] transition-transform ${isOpen ? "rotate-90" : ""}`} />
                  <span className="flex-1 truncate text-[14px] font-medium text-[var(--text-primary)]">{t.name}</span>
                  {t.trending && <span className="flex-shrink-0 rounded-md bg-[var(--accent-primary-soft)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--accent-primary)]">Tendance</span>}
                  <span className="w-[110px] flex-shrink-0 text-[13px] font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
                  <span className="flex w-[150px] flex-shrink-0 items-center gap-2">
                    <span className="w-7 text-[13px] tabular-nums text-[var(--text-primary)]">{t.occurrences}</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                      <span className="block h-full rounded-full" style={{ width: `${(t.occurrences / maxOcc) * 100}%`, backgroundColor: "var(--text-primary)" }} />
                    </span>
                  </span>
                </button>
                {isOpen && <ThemeExamples theme={t} brand={brand} onOpenFull={setModal} />}
              </div>
            );
          })
        )}
      </div>

      {modal && <ResponseModal example={modal} brand={brand} onClose={() => setModal(null)} />}
    </div>
  );
}

/* ── Exemples de réponses d'un thème (pagination 1/N) ────────────────────── */

function ThemeExamples({ theme, brand, onOpenFull }: { theme: SentimentTheme; brand: string; onOpenFull: (e: ThemeExample) => void }) {
  const [i, setI] = useState(0);
  const ex = theme.examples[i];
  const total = theme.examples.length;
  if (!ex) return null;

  return (
    <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-card-static)] px-5 py-4">
      <div className={`overflow-hidden ${CARD} bg-[var(--bg-primary)] p-5`}>
        <p className="text-[15px] font-semibold leading-snug tracking-tight text-[var(--text-primary)]">{ex.promptText}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[12px] text-[var(--text-muted)]">
          <span className="inline-flex items-center gap-1.5"><Favicon domain={PLATFORM_DOMAIN(ex.platform)} size={14} />{PLATFORM_LABEL(ex.platform)}</span>
          <span>·</span><span>{ex.date}</span>
          <span>·</span><span className="inline-flex items-center gap-1.5"><Flag code={ex.region} size={13} />{regionLabel(ex.region)}</span>
        </div>

        {/* Aperçu de la réponse — tronqué avec fondu */}
        <div className="relative mt-4 max-h-[190px] overflow-hidden">
          <RichResponse prompt={ex.promptText} brand={brand} platform={ex.platform} competitors={ex.competitors} mentioned={ex.mentioned} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16" style={{ background: "linear-gradient(to bottom, transparent, var(--bg-primary))" }} />
        </div>
        <button type="button" onClick={() => onOpenFull(ex)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 text-[13px] font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-subtle)]">
          Voir la réponse complète
        </button>
      </div>

      {/* Pagination des exemples */}
      <div className="mt-3 flex items-center justify-center gap-3">
        <PagerBtn dir="prev" disabled={i === 0} onClick={() => setI((v) => Math.max(0, v - 1))} />
        <span className="text-[12px] tabular-nums text-[var(--text-muted)]">{i + 1} / {total}</span>
        <PagerBtn dir="next" disabled={i >= total - 1} onClick={() => setI((v) => Math.min(total - 1, v + 1))} />
      </div>
    </div>
  );
}

function PagerBtn({ dir, disabled, onClick }: { dir: "prev" | "next"; disabled: boolean; onClick: () => void }) {
  const Icon = dir === "prev" ? ChevronLeftIcon : ChevronRightIcon;
  return (
    <button type="button" disabled={disabled} onClick={onClick} aria-label={dir === "prev" ? "Précédent" : "Suivant"}
      className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] disabled:cursor-not-allowed disabled:opacity-40">
      <Icon className="h-4 w-4" />
    </button>
  );
}

/* ── « Détail de la réponse » — drawer qui slide depuis la droite (comme PromptModal) ── */

function ResponseModal({ example, brand, onClose }: { example: ThemeExample; brand: string; onClose: () => void }) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => { const id = setTimeout(() => setVisible(true), 10); return () => clearTimeout(id); }, []);
  useEffect(() => { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }, []);

  function handleClose() { setClosing(true); setTimeout(onClose, 300); }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const open = visible && !closing;
  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      <div aria-hidden="true" onClick={handleClose} className="fixed inset-0 z-[79]" style={{ pointerEvents: open ? "auto" : "none" }} />
      <aside role="dialog" aria-modal="true" aria-label="Détail de la réponse"
        className={`fixed inset-y-0 right-0 z-[80] flex w-[820px] max-w-[95vw] flex-col border-l border-[var(--border-subtle)] bg-[var(--bg-primary)] shadow-2xl transition-all duration-[320ms] ${open ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}`}
        style={{ transitionTimingFunction: "var(--ease-expo)" }}>

        {/* En-tête */}
        <div className="flex-shrink-0 border-b border-[var(--border-subtle)] px-8 pt-6 pb-5">
          <div className="mb-4 flex items-center justify-between gap-1">
            <Tooltip label="Retour" side="right" portal>
              <button onClick={handleClose} aria-label="Retour"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]">
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
            </Tooltip>
            <button onClick={handleClose} aria-label="Fermer"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <p className="text-[12px] font-medium uppercase tracking-caption text-[var(--text-muted)]">Exécution du prompt</p>
          <h1 className="mt-1.5 font-semibold leading-snug tracking-tight text-[var(--text-primary)]">{example.promptText}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1.5"><Favicon domain={PLATFORM_DOMAIN(example.platform)} size={15} />{PLATFORM_LABEL(example.platform)}</span>
            <span>·</span><span>{example.date}</span>
            <span>·</span><span className="inline-flex items-center gap-1.5"><Flag code={example.region} size={13} />{regionLabel(example.region)}</span>
          </div>
        </div>

        {/* Corps — réponse complète */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <p className="mb-3 text-[13px] font-semibold text-[var(--text-secondary)]">Réponse</p>
          <RichResponse prompt={example.promptText} brand={brand} platform={example.platform} competitors={example.competitors} mentioned={example.mentioned} />
        </div>
      </aside>
    </>,
    document.body,
  );
}
