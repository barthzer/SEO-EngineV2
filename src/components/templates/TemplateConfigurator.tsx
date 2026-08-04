"use client";

/**
 * Écran B — le Configurateur (inspiration Profound « Content Configuration »).
 *
 * Colonne gauche (max 440px, pleine hauteur du viewport) : carte de configuration
 * en 2 étapes (stepper) — seul le contenu interne scrolle, pas la carte.
 *   1. Configuration : champs en accordéon (Sujet → Prompts → Plateformes → …),
 *      alimentés par les données GEO (topics/prompts + scores, plateformes IA).
 *   2. Sélection du titre : liste de titres générés (radio) + régénération.
 * Colonne droite : aperçu (illustration + texte), centré, non scrollable, sans encart.
 */

import { useMemo, useRef, useState, type ElementType, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeftIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  SparklesIcon,
  PlusIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { IconBadge } from "@/components/IconBadge";
import { fieldCls } from "@/components/analyse/modals/shared";
import { useToast } from "@/context/ToastContext";
import { templateIcon, DocStackIllustration } from "@/components/templates/ui";
import { TemplateSelector } from "@/components/templates/TemplateSelector";
import { type WorkflowTemplate } from "@/data/templates";
import { SUGGESTED_LISTS, DEFAULT_SETUP } from "@/components/geo/data";
import { LLM_PLATFORMS, type LlmPlatform, type Prompt, type TopicList } from "@/components/geo/types";
import { visColor } from "@/components/geo/ui";

const PAGE_SIZE = 5;
const BRAND_VOICES = ["Ton e-commerce", "Neutre & expert", "Vendeur & concret", "Éditorial magazine"];
const AUDIENCES = ["Grand public", "B2B — décideurs", "Experts / techniciens", "Débutants"];

const avgVis = (prompts: Prompt[]) =>
  prompts.length ? prompts.reduce((s, p) => s + (p.visibility ?? 0), 0) / prompts.length : 0;

type TitleSuggestion = { title: string; type: string; recommended?: boolean };

function buildTitles(topicName: string, seed: number): TitleSuggestion[] {
  const y = new Date().getFullYear();
  const t = topicName;
  const pool: TitleSuggestion[] = [
    { title: `Top 10 des meilleures solutions ${t} en ${y}`, type: "Listicle" },
    { title: `${t} : comparatif des offres leaders du marché`, type: "Comparatif" },
    { title: `${t} en ${y} : ce qui change vraiment`, type: "Année spécifique" },
    { title: `Quelle approche ${t} booste réellement votre visibilité ?`, type: "Orienté bénéfice" },
    { title: `Comment réussir votre stratégie ${t}, étape par étape`, type: "Guide pratique" },
    { title: `${t} : les erreurs à éviter absolument`, type: "Listicle" },
    { title: `Le guide complet du ${t} pour les décideurs`, type: "Guide pratique" },
    { title: `${t} vs alternatives : que choisir en ${y} ?`, type: "Comparatif" },
  ];
  const start = (seed * 3) % pool.length;
  return Array.from({ length: 5 }, (_, i) => pool[(start + i) % pool.length]).map((p, i) => ({
    ...p,
    recommended: i === 0,
  }));
}

/* ── Mode « analyse » : actions sémantiques + contenu actuel de la page ───── */

/** Actions à mener issues de l'analyse (Synthèse + Contenu). Mock paramétré par le mot-clé. */
function buildSemanticActions(keyword: string): { id: string; label: string }[] {
  return [
    { id: "sa1", label: `Réécrire l'introduction avec « ${keyword} » dès la première phrase` },
    { id: "sa2", label: "Ajouter les sections H2 manquantes vs pages les plus citées" },
    { id: "sa3", label: "Combler les gaps d'entités sémantiques détectés" },
    { id: "sa4", label: "Densifier la couverture du champ lexical cible" },
    { id: "sa5", label: "Ajouter une FAQ answer-first sur les requêtes associées" },
    { id: "sa6", label: "Optimiser la balise title et la meta description" },
  ];
}

type PageBlock = { tag: "h1" | "h2"; text: string } | { tag: "p"; text: string };

/** Contenu actuel (mock) de la page en cours d'optimisation. */
function buildPageContent(keyword: string): PageBlock[] {
  const t = keyword.charAt(0).toUpperCase() + keyword.slice(1);
  return [
    { tag: "h1", text: t },
    { tag: "p", text: `Cette page traite de ${keyword}. Le contenu actuel est affiché ici tel qu'il est publié en ligne : il servira de base à l'optimisation à partir des recommandations de l'analyse.` },
    { tag: "h2", text: "Introduction" },
    { tag: "p", text: `Le sujet « ${keyword} » est abordé de manière générale. L'analyse relève une intention de recherche partiellement couverte et des sections manquantes par rapport aux pages les mieux citées sur la requête.` },
    { tag: "h2", text: "Points clés" },
    { tag: "p", text: "Les paragraphes existants couvrent les bases mais manquent de profondeur sur les entités attendues. La densité sémantique est en dessous de la médiane des concurrents." },
    { tag: "p", text: "Plusieurs passages gagneraient à être réécrits en format answer-first pour améliorer la visibilité dans les réponses IA (AI Overviews)." },
    { tag: "h2", text: "Conclusion" },
    { tag: "p", text: "La conclusion actuelle ne propose pas d'appel à l'action clair et ne renvoie pas vers les pages piliers du site. Le maillage interne est à renforcer." },
  ];
}

/** Aperçu scrollable du contenu actuel de la page (colonne droite, mode analyse). */
function PageContentPreview({ keyword, url }: { keyword: string; url?: string }) {
  const blocks = buildPageContent(keyword);
  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
      <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-6 py-3.5">
        <div className="min-w-0">
          <p className="type-label font-semibold text-[var(--text-primary)]">Contenu actuel de la page</p>
          {url && <p className="mt-0.5 truncate type-caption" title={url}>{url}</p>}
        </div>
        <span className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-[var(--bg-subtle)] px-2.5 py-1 type-micro text-[var(--text-secondary)]">
          Existant
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-8 py-7">
        <div className="mx-auto flex max-w-[640px] flex-col gap-4">
          {blocks.map((b, i) =>
            b.tag === "h1" ? (
              <h1 key={i} className="type-h1 font-bold leading-tight">{b.text}</h1>
            ) : b.tag === "h2" ? (
              <h2 key={i} className="mt-2 type-h3">{b.text}</h2>
            ) : (
              <p key={i} className="type-body text-[var(--text-secondary)]">{b.text}</p>
            )
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Favicon plateforme (logos réels via Google s2) ─────────────────────── */
function Favicon({ domain, size = 16 }: { domain: string; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
      alt=""
      width={size}
      height={size}
      className="flex-shrink-0 rounded-sm"
      style={{ width: size, height: size }}
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }}
    />
  );
}

/* ── Champ accordéon ────────────────────────────────────────────────────── */
function ConfigField({
  label,
  hint,
  disabled,
  open,
  onToggle,
  value,
  children,
}: {
  label: string;
  hint?: string;
  disabled?: boolean;
  open: boolean;
  onToggle: () => void;
  value: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className={disabled ? "pointer-events-none opacity-50" : ""}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 text-left transition-colors hover:border-[var(--border-medium)]"
      >
        <div className="flex items-baseline justify-between gap-2">
          <span className="type-label font-semibold text-[var(--text-primary)]">{label}</span>
          {hint && <span className="type-micro">{hint}</span>}
        </div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1 truncate type-body">{value}</div>
          <ChevronDownIcon className={`h-4 w-4 flex-shrink-0 text-[var(--text-muted)] transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>
      {open && !disabled && children}
    </div>
  );
}

/* ── Pied de panneau (reset + pagination) ───────────────────────────────── */
function PanelFooter({
  page,
  totalPages,
  onPage,
  onReset,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
  onReset?: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-t border-[var(--border-subtle)] px-4 py-2.5 type-caption text-[var(--text-muted)]">
      {onReset ? (
        <button onClick={onReset} className="font-medium transition-colors hover:text-[var(--text-primary)]">
          Réinitialiser la sélection
        </button>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-2">
        <span>Page {page} / {totalPages}</span>
        <button onClick={() => onPage(page - 1)} disabled={page <= 1} className="flex h-6 w-6 items-center justify-center rounded-md border border-[var(--border-subtle)] transition-colors hover:bg-[var(--bg-subtle)] disabled:opacity-30">
          <ChevronLeftIcon className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => onPage(page + 1)} disabled={page >= totalPages} className="flex h-6 w-6 items-center justify-center rounded-md border border-[var(--border-subtle)] transition-colors hover:bg-[var(--bg-subtle)] disabled:opacity-30">
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ── Radio (sélection de titre) ─────────────────────────────────────────── */
function Radio({ selected }: { selected: boolean }) {
  return (
    <span className={`mt-0.5 flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${selected ? "border-[var(--text-primary)]" : "border-[var(--border-medium)]"}`}>
      {selected && <span className="h-2 w-2 rounded-full bg-[var(--text-primary)]" />}
    </span>
  );
}

/** Sujet synthétique construit depuis un mot-clé (génération d'une opportunité).
 *  Permet de pré-remplir le champ « Sujet » du mode création avec un mot-clé
 *  arbitraire (hors listes suggérées) et des prompts dérivés. */
function buildSubjectTopic(keyword: string): TopicList {
  const k = keyword.trim();
  const cap = k.charAt(0).toUpperCase() + k.slice(1);
  const mk = (text: string, volume: number, i: number): Prompt => ({
    id: `opp-p${i}`, text, volume, language: "fr", region: "FR", active: true, visibility: 0,
  });
  return {
    id: "opp-subject",
    name: cap,
    source: "suggested",
    selected: true,
    prompts: [
      mk(`Quelle est la meilleure solution pour « ${k} » ?`, 880, 1),
      mk(`${cap} : comment bien choisir ?`, 720, 2),
      mk(`${cap} — comparatif et avis`, 590, 3),
      mk(`Combien coûte ${k} ?`, 480, 4),
    ],
  };
}

/* ── Configurateur ──────────────────────────────────────────────────────── */
export function TemplateConfigurator({
  template: initialTemplate,
  analyse,
  initialSubject,
}: {
  /** Template pré-sélectionné. Optionnel : from scratch / opportunité démarrent sans template. */
  template?: WorkflowTemplate;
  analyse?: { keyword: string; url?: string };
  /** Mot-clé pré-rempli en « Sujet » (mode création, depuis une opportunité). */
  initialSubject?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  // Template choisi : peut être fourni au départ, ou ajouté via « Ajouter un template ».
  const [template, setTemplate] = useState<WorkflowTemplate | null>(initialTemplate ?? null);
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);
  const briefTemplateId = template?.id ?? "sys-geo-uplift";

  // Mode « optimisation d'une page existante » (depuis l'analyse d'une URL).
  const analyseMode = !!analyse;
  const semanticActions = useMemo(
    () => (analyse ? buildSemanticActions(analyse.keyword) : []),
    [analyse]
  );

  // Sujet pré-rempli depuis une opportunité (mode création uniquement).
  const subjectTopic = useMemo<TopicList | null>(
    () => (initialSubject && !analyse ? buildSubjectTopic(initialSubject) : null),
    [initialSubject, analyse]
  );
  // Génération depuis une opportunité : sujet imposé + pas de prompts (query fan-out).
  const opportunityMode = !!subjectTopic;

  const [step, setStep] = useState(1);
  const [openField, setOpenField] = useState<string | null>(subjectTopic ? "prompts" : "sujet");
  const toggle = (f: string) => setOpenField((cur) => (cur === f ? null : f));

  const [topicId, setTopicId] = useState<string | null>(subjectTopic?.id ?? null);
  const [selectedPrompts, setSelectedPrompts] = useState<Set<string>>(
    () => new Set(subjectTopic ? subjectTopic.prompts.map((p) => p.id) : [])
  );
  // Actions sémantiques cochées (mode analyse) — toutes pré-cochées.
  const [selectedActions, setSelectedActions] = useState<Set<string>>(
    () => new Set(analyse ? buildSemanticActions(analyse.keyword).map((a) => a.id) : [])
  );
  const toggleAction = (id: string) =>
    setSelectedActions((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const [platforms, setPlatforms] = useState<LlmPlatform[]>(DEFAULT_SETUP.platforms);
  const [brandVoice, setBrandVoice] = useState<string>(initialTemplate?.params.brandVoice ?? "");
  const [audience, setAudience] = useState<string>("");
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [instructions, setInstructions] = useState("");

  const [titles, setTitles] = useState<TitleSuggestion[]>([]);
  const [titleSeed, setTitleSeed] = useState(0);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [generatingTitles, setGeneratingTitles] = useState(false);
  const genTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [topicPage, setTopicPage] = useState(1);
  const [promptPage, setPromptPage] = useState(1);

  const topic = useMemo(
    () => (subjectTopic && topicId === subjectTopic.id ? subjectTopic : SUGGESTED_LISTS.find((l) => l.id === topicId) ?? null),
    [topicId, subjectTopic]
  );
  const topicPrompts = topic?.prompts ?? [];
  const brandVoices = useMemo(
    () => (brandVoice && !BRAND_VOICES.includes(brandVoice) ? [brandVoice, ...BRAND_VOICES] : BRAND_VOICES),
    [brandVoice]
  );

  const selectTopic = (id: string) => {
    const t = SUGGESTED_LISTS.find((l) => l.id === id);
    setTopicId(id);
    setSelectedPrompts(new Set(t ? t.prompts.map((p) => p.id) : []));
    setPromptPage(1);
    setOpenField("prompts");
  };
  const togglePrompt = (id: string) =>
    setSelectedPrompts((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const togglePlatform = (k: LlmPlatform) =>
    setPlatforms((prev) => (prev.includes(k) ? prev.filter((p) => p !== k) : [...prev, k]));

  // En mode analyse, le sujet est fixé (mot-clé de la page) et les actions remplacent les prompts.
  const subjectName = analyseMode ? analyse!.keyword : topic?.name ?? null;
  const canGenerate = analyseMode
    ? selectedActions.size > 0
    : opportunityMode
    ? !!topic
    : !!topic && selectedPrompts.size > 0;

  // Génération de titres : phase « shimmer » (dégradé horizontal) puis apparition.
  const runTitleGen = (seed: number, name: string) => {
    if (genTimer.current) clearTimeout(genTimer.current);
    setSelectedTitle(null);
    setTitles([]);
    setGeneratingTitles(true);
    genTimer.current = setTimeout(() => {
      setTitles(buildTitles(name, seed));
      setGeneratingTitles(false);
    }, 900);
  };
  const goToTitles = () => {
    if (!subjectName) return;
    setTitleSeed(0);
    setStep(2);
    runTitleGen(0, subjectName);
  };
  const regenerateTitles = () => {
    if (!subjectName) return;
    const next = titleSeed + 1;
    setTitleSeed(next);
    runTitleGen(next, subjectName);
  };
  const back = () => (step === 2 ? setStep(1) : router.back());

  const topicTotalPages = Math.max(1, Math.ceil(SUGGESTED_LISTS.length / PAGE_SIZE));
  const pageTopics = SUGGESTED_LISTS.slice((topicPage - 1) * PAGE_SIZE, topicPage * PAGE_SIZE);
  const promptTotalPages = Math.max(1, Math.ceil(topicPrompts.length / PAGE_SIZE));
  const pagePrompts = topicPrompts.slice((promptPage - 1) * PAGE_SIZE, promptPage * PAGE_SIZE);

  return (
    <div className="page-enter flex h-full flex-col overflow-hidden">
      {/* Retour */}
      <div className="flex-shrink-0 px-6 pt-5 pb-3">
        <button onClick={back} className="flex items-center gap-1.5 type-body-strong text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
          <ChevronLeftIcon className="h-4 w-4" />
          Retour
        </button>
      </div>

      {/* Corps — pleine hauteur */}
      <div className="flex min-h-0 flex-1 gap-8 px-6 pb-6">
        {/* Colonne configuration — carte fixe, contenu interne scrollable */}
        <div className="flex w-full max-w-[440px] flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
          {/* Header + stepper (sans croix) */}
          <div className="flex-shrink-0 px-6 pt-5 pb-4">
            {/* Stepper masqué en mode analyse : une seule étape (pas de génération de titre,
                le titre de la page existante est conservé). */}
            {!analyseMode && (
              <div className="mb-6 flex items-center gap-2">
                {[1, 2].map((s) => (
                  <div key={s} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${s <= step ? "bg-[var(--text-primary)]" : "bg-[var(--border-subtle)]"}`} />
                ))}
              </div>
            )}
            {step === 1 ? (
              <>
                <h1 className="type-h3">Configuration du contenu</h1>
                <p className="mt-1 type-body-sm">
                  {analyseMode
                    ? "Optimisez le contenu de cette page à partir des recommandations de l'analyse."
                    : "Rédigez un contenu long optimisé pour l'IA à partir de l'analyse des pages les plus citées."}
                </p>
                {template ? (
                  <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-[var(--bg-subtle)] px-3 py-2">
                    <IconBadge icon={templateIcon(template.icon)} size="sm" />
                    <span className="type-label text-[var(--text-primary)]">{template.name}</span>
                    {!analyseMode && (
                      <button type="button" onClick={() => setTemplateSelectorOpen(true)} className="ml-auto type-caption font-medium text-[var(--text-muted)] underline underline-offset-2 transition-colors hover:text-[var(--text-primary)]">
                        Changer
                      </button>
                    )}
                  </div>
                ) : (
                  <button type="button" onClick={() => setTemplateSelectorOpen(true)} className="mt-3 flex w-full items-center gap-2 rounded-xl border border-dashed border-[var(--border-medium)] px-3 py-2.5 type-label font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]">
                    <PlusIcon className="h-4 w-4" />
                    Ajouter un template
                  </button>
                )}
              </>
            ) : (
              <>
                <h1 className="type-h3">
                  Sélectionner un titre <span className="type-body-sm text-[var(--text-muted)]">(modifiable ensuite)</span>
                </h1>
                <p className="mt-1 type-body-sm">
                  Inspirés des sources les plus citées dans les réponses IA sur votre sujet.
                </p>
              </>
            )}
          </div>

          {/* Contenu de l'étape — SEUL élément scrollable */}
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-5">
            {step === 1 ? (
              <div className="flex flex-col gap-3">
                {/* Sujet — en mode analyse : pré-rempli (mot-clé de la page), coché, non éditable */}
                {analyseMode ? (
                  <ConfigField
                    label="Sujet"
                    hint="issu de l'analyse"
                    open={false}
                    onToggle={() => {}}
                    value={
                      <span className="inline-flex items-center gap-2 text-[var(--text-primary)]">
                        <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-success)] text-white">
                          <CheckIcon className="h-3 w-3" strokeWidth={3} />
                        </span>
                        {analyse!.keyword}
                      </span>
                    }
                  />
                ) : (
                <ConfigField
                  label="Sujet"
                  open={openField === "sujet"}
                  onToggle={() => toggle("sujet")}
                  value={topic ? <span className="text-[var(--text-primary)]">{topic.name}</span> : <span className="text-[var(--text-muted)]">Rechercher un sujet</span>}
                >
                  <div className="mt-2 overflow-hidden rounded-xl border border-[var(--border-subtle)]">
                    <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-card-static)] px-4 py-2 type-caption">
                      <span>Sujet</span>
                      <span>Score de visibilité</span>
                    </div>
                    {pageTopics.map((t) => {
                      const vis = avgVis(t.prompts);
                      const active = t.id === topicId;
                      return (
                        <button key={t.id} onClick={() => selectTopic(t.id)} className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left type-body transition-colors hover:bg-[var(--bg-subtle)] ${active ? "bg-[var(--bg-subtle)]" : ""}`}>
                          <span className={`truncate ${active ? "font-semibold" : ""} text-[var(--text-primary)]`}>{t.name}</span>
                          <span className="flex-shrink-0 tabular-nums" style={{ color: visColor(vis) }}>{vis.toFixed(1)}%</span>
                        </button>
                      );
                    })}
                    <PanelFooter page={topicPage} totalPages={topicTotalPages} onPage={setTopicPage} onReset={topicId ? () => { setTopicId(null); setSelectedPrompts(new Set()); } : undefined} />
                  </div>
                </ConfigField>
                )}

                {/* Actions à mener (mode analyse) OU Prompts (mode création) */}
                {analyseMode ? (
                  <ConfigField
                    label={`Actions à mener (${selectedActions.size})`}
                    hint="recommandations de l'analyse"
                    open={openField === "actions"}
                    onToggle={() => toggle("actions")}
                    value={selectedActions.size > 0 ? <span className="text-[var(--text-primary)]">{selectedActions.size} actions sélectionnées</span> : <span className="text-[var(--text-muted)]">Sélectionner des actions</span>}
                  >
                    <div className="mt-2 overflow-hidden rounded-xl border border-[var(--border-subtle)]">
                      <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-card-static)] px-4 py-2 type-caption">
                        Actions sémantiques (Synthèse &amp; Contenu)
                      </div>
                      {semanticActions.map((a) => (
                        <div key={a.id} role="button" tabIndex={0} onClick={() => toggleAction(a.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleAction(a.id); } }} className="flex w-full cursor-pointer items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[var(--bg-subtle)]">
                          <span className="mt-0.5 flex-shrink-0"><Checkbox checked={selectedActions.has(a.id)} onChange={() => toggleAction(a.id)} /></span>
                          <span className="min-w-0 flex-1 type-body-sm text-[var(--text-primary)]">{a.label}</span>
                        </div>
                      ))}
                    </div>
                  </ConfigField>
                ) : opportunityMode ? null : (
                <ConfigField
                  label={topic ? `Prompts (${selectedPrompts.size})` : "Prompts"}
                  disabled={!topic}
                  open={openField === "prompts"}
                  onToggle={() => toggle("prompts")}
                  value={selectedPrompts.size > 0 ? <span className="text-[var(--text-primary)]">{selectedPrompts.size} prompts sélectionnés</span> : <span className="text-[var(--text-muted)]">Sélectionner des prompts</span>}
                >
                  <div className="mt-2 overflow-hidden rounded-xl border border-[var(--border-subtle)]">
                    <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-card-static)] px-4 py-2 type-caption">
                      <span>Prompt</span>
                      <span>Score de visibilité</span>
                    </div>
                    {pagePrompts.map((p) => {
                      const vis = p.visibility ?? 0;
                      return (
                        <div key={p.id} role="button" tabIndex={0} onClick={() => togglePrompt(p.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); togglePrompt(p.id); } }} className="flex w-full cursor-pointer items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[var(--bg-subtle)]">
                          <span className="mt-0.5 flex-shrink-0"><Checkbox checked={selectedPrompts.has(p.id)} onChange={() => togglePrompt(p.id)} /></span>
                          <span className="min-w-0 flex-1 type-body-sm text-[var(--text-primary)]">{p.text}</span>
                          <span className="flex-shrink-0 type-label tabular-nums" style={{ color: visColor(vis) }}>{vis.toFixed(1)}%</span>
                        </div>
                      );
                    })}
                    <PanelFooter page={promptPage} totalPages={promptTotalPages} onPage={setPromptPage} onReset={() => setSelectedPrompts(new Set())} />
                  </div>
                </ConfigField>
                )}

                {/* Plateformes */}
                <ConfigField
                  label={`Plateformes (${platforms.length})`}
                  open={openField === "platforms"}
                  onToggle={() => toggle("platforms")}
                  value={platforms.length ? (
                    <span className="flex items-center gap-1.5">
                      {platforms.map((k) => {
                        const m = LLM_PLATFORMS.find((p) => p.key === k);
                        return m ? <Favicon key={k} domain={m.domain} /> : null;
                      })}
                    </span>
                  ) : <span className="text-[var(--text-muted)]">Sélectionner des plateformes</span>}
                >
                  <div className="mt-2 flex flex-col gap-0.5 rounded-xl border border-[var(--border-subtle)] p-2">
                    {LLM_PLATFORMS.map((p) => (
                      <div key={p.key} role="button" tabIndex={0} onClick={() => togglePlatform(p.key)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); togglePlatform(p.key); } }} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-[var(--bg-subtle)]">
                        <Checkbox checked={platforms.includes(p.key)} onChange={() => togglePlatform(p.key)} />
                        <Favicon domain={p.domain} />
                        <span className="type-body">{p.label}</span>
                      </div>
                    ))}
                  </div>
                </ConfigField>

                {/* Pages top-citées */}
                <ConfigField
                  label="Pages top-citées"
                  hint="optionnel · max. 20"
                  open={openField === "citations"}
                  onToggle={() => toggle("citations")}
                  value={<span className="text-[var(--text-muted)]">Rechercher des pages citées</span>}
                >
                  <div className="mt-2 rounded-xl border border-dashed border-[var(--border-medium)] px-4 py-6 text-center">
                    <p className="type-body-sm">
                      {topic ? "Les pages les plus citées sur ce sujet seront proposées après analyse." : "Sélectionnez d'abord un sujet pour voir les pages citées."}
                    </p>
                  </div>
                </ConfigField>

                {/* Brand voice */}
                <ConfigField
                  label="Brand voice"
                  hint="optionnel"
                  open={openField === "brand"}
                  onToggle={() => toggle("brand")}
                  value={brandVoice ? <span className="text-[var(--text-primary)]">{brandVoice}</span> : <span className="text-[var(--text-muted)]">Sélectionner une brand voice</span>}
                >
                  <div className="mt-2 flex flex-col gap-0.5 rounded-xl border border-[var(--border-subtle)] p-2">
                    {brandVoices.map((v) => (
                      <button key={v} onClick={() => { setBrandVoice(v); setOpenField(null); }} className={`rounded-lg px-2.5 py-2 text-left type-body transition-colors hover:bg-[var(--bg-subtle)] ${v === brandVoice ? "bg-[var(--bg-subtle)] font-medium" : ""}`}>{v}</button>
                    ))}
                  </div>
                </ConfigField>

                {/* Segment d'audience */}
                <ConfigField
                  label="Segment d'audience"
                  hint="optionnel"
                  open={openField === "audience"}
                  onToggle={() => toggle("audience")}
                  value={audience ? <span className="text-[var(--text-primary)]">{audience}</span> : <span className="text-[var(--text-muted)]">Sélectionner un segment</span>}
                >
                  <div className="mt-2 flex flex-col gap-0.5 rounded-xl border border-[var(--border-subtle)] p-2">
                    {AUDIENCES.map((a) => (
                      <button key={a} onClick={() => { setAudience(a); setOpenField(null); }} className={`rounded-lg px-2.5 py-2 text-left type-body transition-colors hover:bg-[var(--bg-subtle)] ${a === audience ? "bg-[var(--bg-subtle)] font-medium" : ""}`}>{a}</button>
                    ))}
                  </div>
                </ConfigField>

                {/* Instructions */}
                {instructionsOpen ? (
                  <div>
                    <p className="mb-1.5 type-label font-semibold text-[var(--text-primary)]">Instructions additionnelles</p>
                    <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={3} placeholder="Consignes de rédaction, angle, ton, contraintes…" className={fieldCls} />
                  </div>
                ) : (
                  <button onClick={() => setInstructionsOpen(true)} className="self-start type-label underline underline-offset-2 transition-colors hover:text-[var(--text-primary)]">
                    Ajouter des instructions
                  </button>
                )}
              </div>
            ) : (
              /* Étape 2 — titres */
              generatingTitles ? (
                /* Placeholders « en cours de génération » — dégradé horizontal (shimmer) */
                <div className="flex flex-col gap-2.5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl border border-[var(--border-subtle)] p-4">
                      <span className="skeleton mt-0.5 h-4 w-4 flex-shrink-0 rounded-full" />
                      <div className="min-w-0 flex-1">
                        <span className="skeleton block h-3.5 rounded-full" style={{ width: `${88 - i * 9}%` }} />
                        <span className="skeleton mt-2 block h-2.5 w-[38%] rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
              <div className="page-enter flex flex-col gap-2.5">
                {titles.map((t) => {
                  const sel = selectedTitle === t.title;
                  return (
                    <button key={t.title} onClick={() => setSelectedTitle(t.title)} className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ${sel ? "border-[var(--border-strong)] bg-[var(--bg-subtle)]" : "border-[var(--border-subtle)] hover:border-[var(--border-medium)]"}`}>
                      <Radio selected={sel} />
                      <div className="min-w-0 flex-1">
                        <p className="type-body-strong">{t.title}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="type-caption">{t.type}</span>
                          {t.recommended && (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 type-micro" style={{ color: "var(--color-success)", backgroundColor: "var(--color-success-bg)" }}>
                              Recommandé
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
                <div className="flex justify-end pt-1">
                  <button onClick={regenerateTitles} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 type-label transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]">
                    <ArrowPathIcon className="h-4 w-4" />
                    Suggérer de nouveaux titres
                  </button>
                </div>
              </div>
              )
            )}
          </div>

          {/* CTA */}
          <div className="flex-shrink-0 border-t border-[var(--border-subtle)] p-4">
            {step === 1 ? (
              analyseMode ? (
                /* Mode analyse : pas d'étape titre → directement le brief (titre = page existante). */
                <Button
                  variant="primary"
                  disabled={!canGenerate}
                  className="w-full justify-center"
                  onClick={() => router.push(`/templates/brief/${encodeURIComponent(briefTemplateId)}?titre=${encodeURIComponent(analyse!.keyword)}&from=analyse`)}
                >
                  Générer le brief de contenu
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="primary" disabled={!canGenerate} className="w-full justify-center" onClick={goToTitles}>
                  Générer les titres
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              )
            ) : (
              <Button variant="primary" disabled={!selectedTitle} className="w-full justify-center" onClick={() => router.push(`/templates/brief/${encodeURIComponent(briefTemplateId)}?titre=${encodeURIComponent(selectedTitle ?? "")}`)}>
                Générer le brief de contenu
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Colonne aperçu :
             - mode analyse : contenu actuel de la page (scrollable), à optimiser ;
             - mode création : illustration + invite (page sans existant). */}
        {analyseMode ? (
          <PageContentPreview keyword={analyse!.keyword} url={analyse!.url} />
        ) : (
          <div className="flex min-w-0 flex-1 items-center justify-center overflow-hidden">
            <div className="max-w-sm px-6 text-center">
              <div className="flex justify-center">
                <DocStackIllustration icon={PlusIcon as ElementType} className="w-[220px]" />
              </div>
              <h2 className="mt-6 type-h3">Commencez par configurer votre contenu</h2>
              <p className="mt-1.5 type-body-sm">
                Renseignez les détails dans le panneau de gauche pour optimiser votre contenu pour l'IA.
              </p>
            </div>
          </div>
        )}
      </div>

      {templateSelectorOpen && (
        <TemplateSelector
          context="from_scratch"
          subtitle="Choisissez un process éprouvé pour cadrer la génération du contenu."
          onSelect={(t) => { setTemplate(t); setTemplateSelectorOpen(false); }}
          onClose={() => setTemplateSelectorOpen(false)}
        />
      )}
    </div>
  );
}
