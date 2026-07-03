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
} from "@heroicons/react/24/outline";
import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { IconBadge } from "@/components/IconBadge";
import { fieldCls } from "@/components/analyse/modals/shared";
import { useToast } from "@/context/ToastContext";
import { templateIcon, DocStackIllustration } from "@/components/templates/ui";
import { type WorkflowTemplate } from "@/data/templates";
import { SUGGESTED_LISTS, DEFAULT_SETUP } from "@/components/geo/data";
import { LLM_PLATFORMS, type LlmPlatform, type Prompt } from "@/components/geo/types";
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
          <span className="text-[13px] font-semibold text-[var(--text-primary)]">{label}</span>
          {hint && <span className="text-[11px] text-[var(--text-muted)]">{hint}</span>}
        </div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1 truncate text-[14px]">{value}</div>
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
    <div className="flex items-center justify-between border-t border-[var(--border-subtle)] px-4 py-2.5 text-[12px] text-[var(--text-muted)]">
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

/* ── Configurateur ──────────────────────────────────────────────────────── */
export function TemplateConfigurator({ template }: { template: WorkflowTemplate }) {
  const router = useRouter();
  const toast = useToast();
  const TemplateIcon = templateIcon(template.icon);

  const [step, setStep] = useState(1);
  const [openField, setOpenField] = useState<string | null>("sujet");
  const toggle = (f: string) => setOpenField((cur) => (cur === f ? null : f));

  const [topicId, setTopicId] = useState<string | null>(null);
  const [selectedPrompts, setSelectedPrompts] = useState<Set<string>>(new Set());
  const [platforms, setPlatforms] = useState<LlmPlatform[]>(DEFAULT_SETUP.platforms);
  const [brandVoice, setBrandVoice] = useState<string>(template.params.brandVoice ?? "");
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

  const topic = useMemo(() => SUGGESTED_LISTS.find((l) => l.id === topicId) ?? null, [topicId]);
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

  const canGenerate = !!topic && selectedPrompts.size > 0;

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
    if (!topic) return;
    setTitleSeed(0);
    setStep(2);
    runTitleGen(0, topic.name);
  };
  const regenerateTitles = () => {
    if (!topic) return;
    const next = titleSeed + 1;
    setTitleSeed(next);
    runTitleGen(next, topic.name);
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
        <button onClick={back} className="flex items-center gap-1.5 text-[14px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
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
            <div className="mb-6 flex items-center gap-2">
              {[1, 2].map((s) => (
                <div key={s} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${s <= step ? "bg-[var(--text-primary)]" : "bg-[var(--border-subtle)]"}`} />
              ))}
            </div>
            {step === 1 ? (
              <>
                <h1 className="text-[18px] font-semibold tracking-heading text-[var(--text-primary)]">Configuration du contenu</h1>
                <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                  Rédigez un contenu long optimisé pour l'IA à partir de l'analyse des pages les plus citées.
                </p>
                <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-[var(--bg-subtle)] px-3 py-2">
                  <IconBadge icon={TemplateIcon} size="sm" />
                  <span className="text-[13px] font-medium text-[var(--text-primary)]">{template.name}</span>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-[18px] font-semibold tracking-heading text-[var(--text-primary)]">
                  Sélectionner un titre <span className="text-[13px] font-normal text-[var(--text-muted)]">(modifiable ensuite)</span>
                </h1>
                <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                  Inspirés des sources les plus citées dans les réponses IA sur votre sujet.
                </p>
              </>
            )}
          </div>

          {/* Contenu de l'étape — SEUL élément scrollable */}
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-5">
            {step === 1 ? (
              <div className="flex flex-col gap-3">
                {/* Sujet */}
                <ConfigField
                  label="Sujet"
                  open={openField === "sujet"}
                  onToggle={() => toggle("sujet")}
                  value={topic ? <span className="text-[var(--text-primary)]">{topic.name}</span> : <span className="text-[var(--text-muted)]">Rechercher un sujet</span>}
                >
                  <div className="mt-2 overflow-hidden rounded-xl border border-[var(--border-subtle)]">
                    <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-card-static)] px-4 py-2 text-[12px] font-medium text-[var(--text-muted)]">
                      <span>Sujet</span>
                      <span>Score de visibilité</span>
                    </div>
                    {pageTopics.map((t) => {
                      const vis = avgVis(t.prompts);
                      const active = t.id === topicId;
                      return (
                        <button key={t.id} onClick={() => selectTopic(t.id)} className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-[14px] transition-colors hover:bg-[var(--bg-subtle)] ${active ? "bg-[var(--bg-subtle)]" : ""}`}>
                          <span className={`truncate ${active ? "font-semibold" : ""} text-[var(--text-primary)]`}>{t.name}</span>
                          <span className="flex-shrink-0 tabular-nums" style={{ color: visColor(vis) }}>{vis.toFixed(1)}%</span>
                        </button>
                      );
                    })}
                    <PanelFooter page={topicPage} totalPages={topicTotalPages} onPage={setTopicPage} onReset={topicId ? () => { setTopicId(null); setSelectedPrompts(new Set()); } : undefined} />
                  </div>
                </ConfigField>

                {/* Prompts */}
                <ConfigField
                  label={topic ? `Prompts (${selectedPrompts.size})` : "Prompts"}
                  disabled={!topic}
                  open={openField === "prompts"}
                  onToggle={() => toggle("prompts")}
                  value={selectedPrompts.size > 0 ? <span className="text-[var(--text-primary)]">{selectedPrompts.size} prompts sélectionnés</span> : <span className="text-[var(--text-muted)]">Sélectionner des prompts</span>}
                >
                  <div className="mt-2 overflow-hidden rounded-xl border border-[var(--border-subtle)]">
                    <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-card-static)] px-4 py-2 text-[12px] font-medium text-[var(--text-muted)]">
                      <span>Prompt</span>
                      <span>Score de visibilité</span>
                    </div>
                    {pagePrompts.map((p) => {
                      const vis = p.visibility ?? 0;
                      return (
                        <div key={p.id} role="button" tabIndex={0} onClick={() => togglePrompt(p.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); togglePrompt(p.id); } }} className="flex w-full cursor-pointer items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[var(--bg-subtle)]">
                          <span className="mt-0.5 flex-shrink-0"><Checkbox checked={selectedPrompts.has(p.id)} onChange={() => togglePrompt(p.id)} /></span>
                          <span className="min-w-0 flex-1 text-[13px] leading-snug text-[var(--text-primary)]">{p.text}</span>
                          <span className="flex-shrink-0 text-[13px] tabular-nums" style={{ color: visColor(vis) }}>{vis.toFixed(1)}%</span>
                        </div>
                      );
                    })}
                    <PanelFooter page={promptPage} totalPages={promptTotalPages} onPage={setPromptPage} onReset={() => setSelectedPrompts(new Set())} />
                  </div>
                </ConfigField>

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
                        <span className="text-[14px] text-[var(--text-primary)]">{p.label}</span>
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
                    <p className="text-[13px] text-[var(--text-muted)]">
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
                      <button key={v} onClick={() => { setBrandVoice(v); setOpenField(null); }} className={`rounded-lg px-2.5 py-2 text-left text-[14px] transition-colors hover:bg-[var(--bg-subtle)] ${v === brandVoice ? "bg-[var(--bg-subtle)] font-medium" : ""}`}>{v}</button>
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
                      <button key={a} onClick={() => { setAudience(a); setOpenField(null); }} className={`rounded-lg px-2.5 py-2 text-left text-[14px] transition-colors hover:bg-[var(--bg-subtle)] ${a === audience ? "bg-[var(--bg-subtle)] font-medium" : ""}`}>{a}</button>
                    ))}
                  </div>
                </ConfigField>

                {/* Instructions */}
                {instructionsOpen ? (
                  <div>
                    <p className="mb-1.5 text-[13px] font-semibold text-[var(--text-primary)]">Instructions additionnelles</p>
                    <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={3} placeholder="Consignes de rédaction, angle, ton, contraintes…" className={fieldCls} />
                  </div>
                ) : (
                  <button onClick={() => setInstructionsOpen(true)} className="self-start text-[13px] font-medium text-[var(--text-secondary)] underline underline-offset-2 transition-colors hover:text-[var(--text-primary)]">
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
                        <p className="text-[14px] font-medium leading-snug text-[var(--text-primary)]">{t.title}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="text-[12px] text-[var(--text-muted)]">{t.type}</span>
                          {t.recommended && (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ color: "var(--color-success)", backgroundColor: "var(--color-success-bg)" }}>
                              Recommandé
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
                <div className="flex justify-end pt-1">
                  <button onClick={regenerateTitles} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 text-[13px] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]">
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
              <Button variant="primary" disabled={!canGenerate} className="w-full justify-center" onClick={goToTitles}>
                Générer les titres
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="primary" disabled={!selectedTitle} className="w-full justify-center" onClick={() => router.push(`/templates/brief/${encodeURIComponent(template.id)}?titre=${encodeURIComponent(selectedTitle ?? "")}`)}>
                Générer le brief de contenu
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Colonne aperçu — centrée, non scrollable, sans encart ni fond */}
        <div className="flex min-w-0 flex-1 items-center justify-center overflow-hidden">
          <div className="max-w-sm px-6 text-center">
            <div className="flex justify-center">
              <DocStackIllustration icon={PlusIcon as ElementType} className="w-[220px]" />
            </div>
            <h2 className="mt-6 text-[16px] font-semibold text-[var(--text-primary)]">Commencez par configurer votre contenu</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--text-muted)]">
              Renseignez les détails dans le panneau de gauche pour optimiser votre contenu pour l'IA.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
