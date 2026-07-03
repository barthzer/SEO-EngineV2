"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CheckCircleIcon, XCircleIcon, MagnifyingGlassIcon, XMarkIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ArrowLeftIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/Button";
import { Tooltip } from "@/components/Tooltip";
import { Flag } from "@/components/Flag";
import { Favicon } from "@/components/geo/views/OverviewView";
import {
  promptResults, promptFanout, brandFromDomain, PLATFORM_LABEL, PLATFORM_DOMAIN,
  type EnrichedPrompt,
} from "@/components/geo/analytics";
import { REGIONS, type GeoSetup } from "@/components/geo/types";

/** Versions d'analyse effectuées (mock) — affichées dans la colonne de droite. */
const ANALYSES = [
  { when: "Aujourd'hui",       time: "09h12" },
  { when: "Hier",              time: "18h47" },
  { when: "Il y a 4 jours",    time: "11h05" },
  { when: "Il y a 1 semaine",  time: "14h30" },
  { when: "Il y a 2 semaines", time: "08h51" },
];

const CITE_TITLES = [
  "Guide complet et comparatif",
  "Analyse et recommandations d'experts",
  "Top ressources et avis détaillés",
  "Comparatif des meilleures solutions",
  "Retours d'expérience et bonnes pratiques",
];
const CITE_DESCS = [
  "Un panorama des principales options du marché, avec leurs forces et leurs limites.",
  "Comparaison des acteurs de référence et des critères de choix pour votre projet.",
  "Avis détaillés et retours concrets pour orienter votre décision.",
  "Sélection des solutions les plus citées, classées par cas d'usage.",
  "Bonnes pratiques et pièges fréquents expliqués simplement.",
];
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Détail d'un prompt — drawer qui slide depuis la droite (forme du détail d'URL).
 * Gauche : choix du LLM + contenu de l'IA (visibilité, concurrents, query fan-out,
 * réponse riche dépliable, citations en cards). Droite : historique des analyses.
 */
export function PromptModal({
  prompt, prompts = [], setup, domain, onNavigate, onClose,
}: {
  prompt: EnrichedPrompt;
  /** Liste des prompts affichés — pour la navigation « < » / « > ». */
  prompts?: EnrichedPrompt[];
  setup: GeoSetup;
  domain: string;
  onNavigate?: (p: EnrichedPrompt) => void;
  onClose: () => void;
}) {
  const idx = prompts.findIndex((p) => p.id === prompt.id);
  const hasPrev = idx > 0;
  const hasNext = idx >= 0 && idx < prompts.length - 1;
  const goPrev = () => { if (hasPrev) onNavigate?.(prompts[idx - 1]); };
  const goNext = () => { if (hasNext) onNavigate?.(prompts[idx + 1]); };

  const results = promptResults(prompt, setup, domain);
  const [active, setActive] = useState(0);
  const [analysisIdx, setAnalysisIdx] = useState(0);
  const [respOpen, setRespOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const r = results[active];
  const brand = brandFromDomain(domain);
  const fanout = promptFanout(prompt.text, r.platform);
  const region = REGIONS.find((x) => x.code === prompt.region);
  const compDomain = (name: string) => setup.competitors.find((c) => c.name === name)?.domain;

  useEffect(() => { const id = setTimeout(() => setVisible(true), 10); return () => clearTimeout(id); }, []);
  useEffect(() => { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }, []);

  function handleClose() {
    setClosing(true);
    setTimeout(onClose, 300);
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, prompts]);

  const open = visible && !closing;
  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      {/* Capteur de clic transparent — pas d'assombrissement ni de flou */}
      <div aria-hidden="true" onClick={handleClose}
        className="fixed inset-0 z-[59]" style={{ pointerEvents: open ? "auto" : "none" }} />

      <aside role="dialog" aria-modal="true" aria-label="Détail du prompt"
        className={`fixed inset-y-0 right-0 z-[60] flex w-[1140px] max-w-[95vw] flex-col border-l border-[var(--border-subtle)] bg-[var(--bg-primary)] shadow-2xl transition-all duration-[320ms] ${open ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}`}
        style={{ transitionTimingFunction: "var(--ease-expo)" }}>

        {/* En-tête — barre retour/nav + titre + infos principales */}
        <div className="flex-shrink-0 border-b border-[var(--border-subtle)] px-8 pt-6 pb-5">
          {/* Rangée utilitaire : retour à la liste · précédent/suivant · fermer */}
          <div className="mb-4 flex items-center justify-between gap-1">
            <Tooltip label="Retour à la liste" side="right" portal>
              <button onClick={handleClose} aria-label="Retour à la liste"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]">
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
            </Tooltip>
            <div className="flex items-center gap-1">
              <button onClick={goPrev} disabled={!hasPrev} aria-label="Prompt précédent"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-30">
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button onClick={goNext} disabled={!hasNext} aria-label="Prompt suivant"
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
          <h1 className="mb-4 font-semibold leading-snug tracking-tight text-[var(--text-primary)]">{prompt.text}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] px-3 py-1.5 text-[12px] text-[var(--text-primary)]">
              <Flag code={prompt.region} size={15} />
              {region?.label ?? prompt.region}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] px-3 py-1.5 text-[12px] text-[var(--text-primary)]">
              <span className="font-medium tabular-nums">{prompt.volume.toLocaleString("fr-FR")}</span> requêtes/mois
            </span>
            {prompt.listName && (
              <span className="inline-flex items-center rounded-full bg-[var(--bg-subtle)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-primary)]">{prompt.listName}</span>
            )}
          </div>
        </div>

        {/* Corps — gauche (choix LLM + contenu) · droite (dates d'analyses) */}
        <div className="flex flex-1 gap-6 overflow-hidden px-8 py-6">

          {/* Gauche : contenu de l'IA sélectionnée */}
          <div className="flex flex-1 flex-col gap-5 overflow-y-auto pr-1">
            {/* Choix du LLM — 4 gros boutons pleine largeur */}
            <div className="grid grid-cols-4 gap-2">
              {results.map((res, i) => {
                const isActive = i === active;
                return (
                  <button key={res.platform} type="button" onClick={() => setActive(i)}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-[13px] font-medium transition-colors ${isActive ? "border-[var(--accent-primary)] bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]" : "border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"}`}>
                    <Favicon domain={PLATFORM_DOMAIN(res.platform)} size={16} />
                    <span className="truncate">{PLATFORM_LABEL(res.platform)}</span>
                    <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${res.mentioned ? "bg-[var(--color-success)]" : "bg-[var(--text-muted)]"}`} />
                  </button>
                );
              })}
            </div>

            {/* Visibilité — titre au-dessus, contenu en dessous */}
            <div>
              <p className="mb-2 text-[13px] font-semibold text-[var(--text-secondary)]">Visibilité</p>
              {r.mentioned ? (
                <span className="inline-flex flex-wrap items-center gap-2 text-[14px] text-[var(--text-primary)]">
                  <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-[var(--color-success)]" />
                  <span><strong>{brand}</strong> est mentionné</span>
                  {r.position != null && (
                    <span className="inline-flex items-center rounded-md bg-[var(--color-success-bg)] px-2 py-0.5 text-[12px] font-medium text-[var(--color-success)]">position {r.position}</span>
                  )}
                </span>
              ) : (
                <span className="inline-flex flex-wrap items-center gap-2 text-[14px] text-[var(--text-primary)]">
                  <XCircleIcon className="h-5 w-5 flex-shrink-0 text-[var(--text-muted)]" />
                  <span><strong>{brand}</strong> n&apos;est pas mentionné — opportunité</span>
                </span>
              )}
            </div>

            {/* Réponse — sans encart, bouton développer en dessous */}
            <div>
              <p className="mb-2 text-[13px] font-semibold text-[var(--text-secondary)]">Réponse de {PLATFORM_LABEL(r.platform)}</p>
              {respOpen ? (
                <RichResponse prompt={prompt.text} brand={brand} platform={r.platform} competitors={r.competitors} mentioned={r.mentioned} />
              ) : (
                <p className="line-clamp-3 text-[14px] leading-relaxed text-[var(--text-primary)]">{r.response}</p>
              )}
              <button type="button" onClick={() => setRespOpen((o) => !o)}
                className="mt-3 flex items-center gap-1 text-[13px] font-medium text-[var(--accent-primary)] transition-opacity hover:opacity-80">
                {respOpen ? "Réduire la réponse" : "Développer la réponse"}
                <ChevronDownIcon className={`h-4 w-4 transition-transform ${respOpen ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* Concurrents + Query fan-out (sous la réponse) — titre au-dessus, contenu en dessous */}
            <div className="flex flex-col gap-5">
              <div>
                <p className="mb-2 text-[13px] font-semibold text-[var(--text-secondary)]">Concurrents</p>
                <div className="flex flex-wrap gap-1.5">
                  {r.competitors.length ? r.competitors.map((c) => {
                    const d = compDomain(c);
                    return (
                      <span key={c} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] px-2.5 py-1 text-[12px] font-medium text-[var(--text-primary)]">
                        {d && <Favicon domain={d} size={14} />}{c}
                      </span>
                    );
                  }) : <span className="text-[13px] text-[var(--text-muted)]">Aucun</span>}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[13px] font-semibold text-[var(--text-secondary)]">Query fan-out</p>
                <div className="flex flex-wrap gap-1.5">
                  {fanout.map((q) => (
                    <span key={q} className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-subtle)] px-2.5 py-1 text-[12px] text-[var(--text-primary)]">
                      <MagnifyingGlassIcon className="h-3 w-3 flex-shrink-0 text-[var(--text-muted)]" />{q}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Citations — petites cards */}
            <div>
              <p className="mb-2.5 text-[13px] font-semibold text-[var(--text-secondary)]">Citations</p>
              <div className="grid grid-cols-2 gap-3">
                {r.citations.map((c) => {
                  const seed = hashStr(c + prompt.id);
                  return (
                    <CitationCard key={c} domain={c} isYou={c === domain}
                      title={`${brandFromDomain(c)} — ${CITE_TITLES[seed % CITE_TITLES.length]}`}
                      desc={CITE_DESCS[(seed >> 3) % CITE_DESCS.length]} />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Droite : historique des analyses — pleine hauteur + CTA en bas (comme la modale URL) */}
          <div className="flex w-[320px] flex-shrink-0 flex-col gap-4 rounded-2xl border border-[var(--border-subtle)] p-5">
            <div className="flex items-center gap-2">
              <p className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Historique des versions</p>
              <span className="rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-primary)]">{ANALYSES.length}</span>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
              {ANALYSES.map((a, i) => {
                const isActive = i === analysisIdx;
                return (
                  <button key={`${a.when}-${a.time}`} type="button" onClick={() => setAnalysisIdx(i)}
                    className={`group flex w-full items-center gap-2 rounded-2xl border px-4 py-3 text-left transition-colors ${isActive ? "border-[var(--accent-primary)] bg-[var(--accent-primary-soft)]" : "border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)]"}`}>
                    <p className={`truncate text-[13px] font-medium ${isActive ? "text-[var(--accent-primary)]" : "text-[var(--text-primary)]"}`}>
                      {a.when} <span className="text-[var(--text-muted)]">· {a.time}</span>
                    </p>
                  </button>
                );
              })}
            </div>
            <Button className="w-full justify-center">
              <ArrowPathIcon className="h-4 w-4" />
              Lancer une nouvelle analyse
            </Button>
          </div>
        </div>
      </aside>
    </>,
    document.body,
  );
}

/* ── Carte de citation (petite card façon Profound) ───────────────────── */

function CitationCard({ domain, title, desc, isYou }: { domain: string; title: string; desc: string; isYou: boolean }) {
  return (
    <div className={`flex flex-col gap-1.5 rounded-xl border p-3 transition-colors hover:bg-[var(--bg-subtle)] ${isYou ? "border-[var(--accent-primary)]" : "border-[var(--border-subtle)]"}`}>
      <div className="flex items-center gap-1.5">
        <Favicon domain={domain} size={14} />
        <span className="truncate text-[11px] text-[var(--text-muted)]">{domain}</span>
      </div>
      <p className="line-clamp-2 text-[13px] font-medium leading-snug text-[var(--text-primary)]">{title}</p>
      <p className="line-clamp-2 text-[12px] leading-snug text-[var(--text-muted)]">{desc}</p>
    </div>
  );
}

/* ── Réponse riche (titres, tableau, listes — tout ce qu'un LLM peut rendre) ── */

export function RichResponse({ prompt, brand, platform, competitors, mentioned }: {
  prompt: string; brand: string; platform: EnrichedPrompt["platform"]; competitors: string[]; mentioned: boolean;
}) {
  const c1 = competitors[0] ?? "Semji";
  const c2 = competitors[1] ?? "Abondance";
  return (
    <div className="flex flex-col gap-3 text-[14px] leading-relaxed text-[var(--text-primary)]">
      <p>
        Pour « {prompt} », plusieurs acteurs ressortent selon vos priorités (notoriété, expertise, budget, accompagnement).
        Voici un panorama des principales options et de leurs compromis, tel que présenté par {PLATFORM_LABEL(platform)}.
      </p>

      <h3 className="mt-1 text-[15px] font-semibold text-[var(--text-primary)]">Ce qui compte pour bien choisir</h3>
      <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)]">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[var(--bg-subtle)] text-left">
              <th className="border-b border-[var(--border-subtle)] px-3 py-2 font-medium text-[var(--text-primary)]">Critère</th>
              <th className="border-b border-l border-[var(--border-subtle)] px-3 py-2 font-medium text-[var(--text-primary)]">Pourquoi c&apos;est important</th>
            </tr>
          </thead>
          <tbody className="text-[var(--text-primary)]">
            {[
              ["Expertise reconnue", "Des résultats prouvés sur des cas comparables au vôtre."],
              ["Couverture complète", "SEO technique, contenu et netlinking traités ensemble."],
              ["Transparence du reporting", "Des indicateurs clairs et un suivi régulier."],
              ["Accompagnement", "Un interlocuteur dédié pour vos arbitrages."],
            ].map(([k, v], i) => (
              <tr key={k} className={i > 0 ? "border-t border-[var(--border-subtle)]" : ""}>
                <td className="px-3 py-2 font-medium align-top">{k}</td>
                <td className="border-l border-[var(--border-subtle)] px-3 py-2 align-top text-[var(--text-secondary)]">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mt-1 text-[15px] font-semibold text-[var(--text-primary)]">Acteurs fréquemment cités</h3>
      <ul className="flex flex-col gap-1.5 pl-5" style={{ listStyleType: "disc" }}>
        <li><strong>{c1}</strong> — solide réputation et large couverture de prestations.</li>
        <li><strong>{c2}</strong> — apprécié pour son expertise et ses retours clients.</li>
        <li>
          <strong>{brand}</strong>{" "}
          {mentioned
            ? <>— cité parmi les références, notamment pour son positionnement et son expertise.</>
            : <>— encore absent des recommandations sur ce prompt : un levier de progression.</>}
        </li>
      </ul>

      <h3 className="mt-1 text-[15px] font-semibold text-[var(--text-primary)]">Recommandation</h3>
      <p>
        Si je devais choisir aujourd&apos;hui, je privilégierais un acteur équilibré entre expertise et accompagnement.{" "}
        <mark className="rounded bg-[var(--color-warning-bg)] px-1 text-[var(--text-primary)]">{brand}</mark>{" "}
        se distingue lorsqu&apos;on recherche un partenaire capable de couvrir l&apos;ensemble du sujet.
      </p>
    </div>
  );
}
