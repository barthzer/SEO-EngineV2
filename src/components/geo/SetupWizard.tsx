"use client";

import { useState } from "react";
import {
  PlusIcon, XMarkIcon, SparklesIcon, ChevronRightIcon, CheckIcon, InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/Button";
import { Stepper } from "@/components/Stepper";
import { Flag } from "@/components/Flag";
import { CheckBox } from "@/components/onboarding/CheckBox";
import {
  LLM_PLATFORMS, REGIONS, LANGUAGES,
  type LlmPlatform, type TopicList, type Prompt, type Competitor, type GeoSetup,
} from "@/components/geo/types";
import { SUGGESTED_LISTS, SUGGESTED_COMPETITORS, AI_PROMPT_BANK, randomVolume, topicVolume } from "@/data/geo";

/* ── Helpers ──────────────────────────────────────────────────────────── */

let _uid = 1000;
const uid = (p: string) => `${p}-${_uid++}`;
const cloneLists = (): TopicList[] => SUGGESTED_LISTS.map((l) => ({ ...l, prompts: l.prompts.map((p) => ({ ...p })) }));
const cloneCompetitors = (): Competitor[] => SUGGESTED_COMPETITORS.map((c) => ({ ...c }));

const ROW = "flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors";
const rowCls = (on: boolean) => `${ROW} ${on ? "border-[var(--accent-primary)] bg-[color-mix(in_oklab,var(--accent-primary)_8%,transparent)]" : "border-[var(--border-subtle)] hover:border-[var(--border-medium)]"}`;

// Cellules zone/langue — grille pleine largeur pour une largeur d'étape constante.
const CELL = "flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-[13px] font-medium transition-colors";
const cellCls = (on: boolean) => `${CELL} ${on ? "border-[var(--accent-primary)] bg-[color-mix(in_oklab,var(--accent-primary)_8%,transparent)] text-[var(--accent-primary)]" : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-medium)] hover:text-[var(--text-primary)]"}`;

const TOTAL_STEPS = 5;

/* ── Wizard ───────────────────────────────────────────────────────────── */

export function SetupWizard({ domain, onFinish, onCancel }: { domain: string; onFinish: (s: GeoSetup) => void; onCancel: () => void }) {
  const [step, setStep] = useState(1);
  const [platforms, setPlatforms] = useState<LlmPlatform[]>(["chatgpt", "perplexity", "gemini", "claude"]);
  const [regions, setRegions] = useState<string[]>(["FR"]);
  const [language, setLanguage] = useState("fr");
  const [lists, setLists] = useState<TopicList[]>(cloneLists);
  const [competitors, setCompetitors] = useState<Competitor[]>(cloneCompetitors);
  const [openTopic, setOpenTopic] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set());
  const [newTopicName, setNewTopicName] = useState("");
  const [newCompName, setNewCompName] = useState("");
  const [newCompDomain, setNewCompDomain] = useState("");

  const selectedTopics = lists.filter((l) => l.selected);

  const togglePlatform = (k: LlmPlatform) => setPlatforms((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));
  const toggleRegion = (c: string) => setRegions((r) => (r.includes(c) ? r.filter((x) => x !== c) : [...r, c]));
  const toggleTopic = (id: string) => setLists((ls) => ls.map((l) => (l.id === id ? { ...l, selected: !l.selected } : l)));

  function addTopic() {
    const name = newTopicName.trim();
    if (!name) return;
    setLists((ls) => [...ls, { id: uid("topic"), name, source: "manual", selected: true, prompts: [] }]);
    setNewTopicName("");
  }
  function addTopicAtStep4() {
    const id = uid("topic");
    setLists((ls) => [...ls, { id, name: "Nouveau sujet", source: "manual", selected: true, prompts: [] }]);
    setOpenTopic(id);
  }
  function updatePrompt(listId: string, promptId: string, text: string) {
    setLists((ls) => ls.map((l) => l.id === listId ? { ...l, prompts: l.prompts.map((p) => (p.id === promptId ? { ...p, text } : p)) } : l));
  }
  function removePrompt(listId: string, promptId: string) {
    setLists((ls) => ls.map((l) => l.id === listId ? { ...l, prompts: l.prompts.filter((p) => p.id !== promptId) } : l));
  }
  function addPrompt(listId: string, text: string) {
    if (!text.trim()) return;
    const np: Prompt = { id: uid("p"), text: text.trim(), volume: randomVolume(), language, region: regions[0] ?? "FR", active: true };
    setLists((ls) => ls.map((l) => (l.id === listId ? { ...l, prompts: [...l.prompts, np] } : l)));
  }
  function regenerate(listId: string) {
    // Mock : pioche 3 prompts en rotation dans la banque, marqués « à valider ».
    const list = lists.find((l) => l.id === listId);
    const start = (list?.prompts.length ?? 0) % AI_PROMPT_BANK.length;
    const picks = [0, 1, 2].map((i) => {
      const text = AI_PROMPT_BANK[(start + i) % AI_PROMPT_BANK.length];
      return { id: uid("p"), text, volume: randomVolume(), language, region: regions[0] ?? "FR", active: true } as Prompt;
    });
    setLists((ls) => ls.map((l) => (l.id === listId ? { ...l, prompts: [...l.prompts, ...picks] } : l)));
    setPendingIds((s) => { const n = new Set(s); picks.forEach((p) => n.add(p.id)); return n; });
    setOpenTopic(listId);
  }
  function validatePrompt(id: string) {
    setPendingIds((s) => { const n = new Set(s); n.delete(id); return n; });
  }
  function validateAll(listId: string) {
    setPendingIds((s) => {
      const n = new Set(s);
      lists.find((l) => l.id === listId)?.prompts.forEach((p) => n.delete(p.id));
      return n;
    });
  }
  function dismissPrompt(listId: string, id: string) {
    removePrompt(listId, id);
    setPendingIds((s) => { const n = new Set(s); n.delete(id); return n; });
  }
  const toggleCompetitor = (id: string) => setCompetitors((cs) => cs.map((c) => (c.id === id ? { ...c, tracked: !c.tracked } : c)));
  function addCompetitor() {
    if (!newCompName.trim()) return;
    setCompetitors((cs) => [...cs, { id: uid("c"), name: newCompName.trim(), domain: newCompDomain.trim(), tracked: true }]);
    setNewCompName(""); setNewCompDomain("");
  }

  const canNext = step === 1 ? platforms.length > 0 : step === 2 ? regions.length > 0 : step === 3 ? selectedTopics.length > 0 : true;

  function finish() {
    onFinish({ configured: true, platforms, regions, language, lists: selectedTopics, competitors: competitors.filter((c) => c.tracked) });
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 py-6">
      <Stepper steps={TOTAL_STEPS} current={step} onClose={onCancel} />

      {/* ── Étape 1 — Modèles IA (liste verticale) ── */}
      {step === 1 && (
        <Section title="Quels modèles IA suivre ?" sub={`On posera vos prompts sur chacun pour mesurer la présence de ${domain}.`}>
          <div className="flex flex-col gap-2">
            {LLM_PLATFORMS.map((p) => {
              const on = platforms.includes(p.key);
              return (
                <button key={p.key} type="button" onClick={() => togglePlatform(p.key)} className={rowCls(on)}>
                  <Favicon domain={p.domain} />
                  <span className="flex-1 text-[14px] font-medium text-[var(--text-primary)]">{p.label}</span>
                  <CheckBox checked={on} />
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {/* ── Étape 2 — Zone & langue ── */}
      {step === 2 && (
        <Section title="Zone géographique & langue" sub="Les prompts seront posés depuis ces régions, dans cette langue.">
          <div className="flex flex-col gap-2.5">
            <label className="text-[13px] font-medium text-[var(--text-primary)]">Régions</label>
            <div className="grid grid-cols-3 gap-2">
              {REGIONS.map((r) => {
                const on = regions.includes(r.code);
                return (
                  <button key={r.code} type="button" onClick={() => toggleRegion(r.code)} className={cellCls(on)}>
                    <Flag code={r.code} size={16} />{r.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <label className="text-[13px] font-medium text-[var(--text-primary)]">Langue</label>
            <div className="grid grid-cols-4 gap-2">
              {LANGUAGES.map((l) => (
                <button key={l.code} type="button" onClick={() => setLanguage(l.code)} className={cellCls(language === l.code)}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* ── Étape 3 — Sujets ── */}
      {step === 3 && (
        <Section title="Sujets à suivre" sub="On a déduit ces sujets de votre activité. Cochez ceux à suivre, ajoutez les vôtres.">
          <div className="flex flex-col gap-2">
            {lists.map((l) => (
              <button key={l.id} type="button" onClick={() => toggleTopic(l.id)} className={rowCls(l.selected)}>
                <span className="flex-1 text-[14px] font-medium text-[var(--text-primary)]">{l.name}</span>
                <CheckBox checked={l.selected} />
              </button>
            ))}
            {/* Input d'ajout — même gabarit que les rangées */}
            <div className={`${ROW} border-dashed border-[var(--border-subtle)]`}>
              <PlusIcon className="h-[18px] w-[18px] flex-shrink-0 text-[var(--text-muted)]" />
              <input value={newTopicName} onChange={(e) => setNewTopicName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTopic()}
                placeholder="Ajouter un sujet…"
                className="flex-1 bg-transparent text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)]" />
              {newTopicName.trim() && (
                <button type="button" onClick={addTopic} className="text-[13px] font-medium text-[var(--accent-primary)]">Ajouter</button>
              )}
            </div>
          </div>
        </Section>
      )}

      {/* ── Étape 4 — Prompts par sujet (table dépliable façon Profound) ── */}
      {step === 4 && (
        <Section title="Vérifiez les prompts par sujet" sub="Dépliez un sujet pour éditer ses prompts, en ajouter ou les régénérer. Le volume est estimé.">
          <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-primary)]">
            {/* En-tête de colonnes */}
            <div className="flex items-center border-b border-[var(--border-subtle)] px-4 py-2.5 text-[12px] font-medium text-[var(--text-muted)]">
              <span className="flex-1">Sujet</span>
              <span className="flex items-center gap-1">Volume<InformationCircleIcon className="h-3.5 w-3.5" /></span>
            </div>
            {selectedTopics.map((l) => {
              const open = openTopic === l.id;
              const pendingCount = l.prompts.filter((p) => pendingIds.has(p.id)).length;
              let pendingSeen = 0;
              return (
                <div key={l.id} className="border-b border-[var(--border-subtle)] last:border-0">
                  {/* Ligne sujet — fond clair quand actif */}
                  <button type="button" onClick={() => setOpenTopic(open ? null : l.id)}
                    className={`flex w-full items-center gap-2.5 px-4 py-3.5 text-left transition-colors ${open ? "bg-[var(--bg-card-static)]" : "hover:bg-[var(--bg-card-static)]"}`}>
                    <ChevronRightIcon className="h-4 w-4 flex-shrink-0 text-[var(--text-muted)] transition-transform duration-200" style={{ transform: open ? "rotate(90deg)" : "none" }} />
                    <span className="truncate text-[14px] font-medium text-[var(--text-primary)]">{l.name}</span>
                    <span className="text-[13px] text-[var(--text-muted)]">{l.prompts.length} prompts</span>
                    <span className="flex-1" />
                    <span className="text-[13px] font-medium tabular-nums text-[var(--text-secondary)]">{topicVolume(l.prompts)}</span>
                  </button>
                  {/* Zone dépliée — tableau dans le tableau */}
                  {open && (
                    <div className="bg-[var(--bg-card-static)] px-4 pb-4 pt-1.5">
                      <div className="divide-y divide-[var(--border-subtle)] overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)]">
                        {l.prompts.map((p) => {
                          const pending = pendingIds.has(p.id);
                          const delay = pending ? pendingSeen++ * 70 : 0;
                          return (
                            <div key={p.id}
                              className={`group flex items-center gap-2 px-4 py-3 transition-colors ${pending ? "ai-reveal bg-[color-mix(in_oklab,var(--accent-primary)_7%,transparent)]" : "hover:bg-[var(--bg-subtle)]"}`}
                              style={pending ? { animationDelay: `${delay}ms` } : undefined}>
                              <input value={p.text} onChange={(e) => updatePrompt(l.id, p.id, e.target.value)}
                                className="flex-1 bg-transparent text-[14px] text-[var(--text-primary)] outline-none" />
                              {pending ? (
                                <div className="flex flex-shrink-0 items-center gap-1.5">
                                  <button type="button" onClick={() => validatePrompt(p.id)} aria-label="Valider ce prompt"
                                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-primary)] text-white transition-opacity hover:opacity-90">
                                    <CheckIcon className="h-4 w-4" strokeWidth={2.4} />
                                  </button>
                                  <button type="button" onClick={() => dismissPrompt(l.id, p.id)} aria-label="Écarter ce prompt"
                                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] transition-colors hover:text-[var(--color-danger)]">
                                    <XMarkIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <button type="button" onClick={() => removePrompt(l.id, p.id)} aria-label="Retirer"
                                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] opacity-0 transition-all hover:bg-[var(--bg-secondary)] hover:text-[var(--color-danger)] group-hover:opacity-100">
                                  <XMarkIcon className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                        <AddPromptRow onAdd={(t) => addPrompt(l.id, t)} />
                      </div>
                      {/* Actions IA */}
                      <div className="mt-2.5 flex items-center gap-3">
                        <button type="button" onClick={() => regenerate(l.id)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--border-medium)] hover:bg-[var(--bg-card-static)]">
                          Suggérer des prompts<ChevronRightIcon className="h-3.5 w-3.5" />
                        </button>
                        {pendingCount > 0 && (
                          <button type="button" onClick={() => validateAll(l.id)}
                            className="text-[12px] font-medium text-[var(--accent-primary)] transition-opacity hover:opacity-80">
                            Tout valider ({pendingCount})
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {/* Ajouter un sujet */}
            <button type="button" onClick={addTopicAtStep4}
              className="flex w-full items-center gap-2 px-4 py-3.5 text-left text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-card-static)] hover:text-[var(--text-primary)]">
              <PlusIcon className="h-4 w-4" />Ajouter un sujet
            </button>
          </div>
        </Section>
      )}

      {/* ── Étape 5 — Concurrents ── */}
      {step === 5 && (
        <Section title="Concurrents à suivre" sub="On comparera votre visibilité IA à la leur.">
          <div className="flex flex-col gap-2">
            {competitors.map((c) => (
              <button key={c.id} type="button" onClick={() => toggleCompetitor(c.id)} className={rowCls(c.tracked)}>
                {c.domain && <Favicon domain={c.domain} size={16} />}
                <span className="flex-1 text-[14px] font-medium text-[var(--text-primary)]">{c.name}</span>
                {c.domain && <span className="font-mono text-[12px] text-[var(--text-muted)]">{c.domain}</span>}
                {c.tracked && <CheckIcon className="h-4 w-4 flex-shrink-0 text-[var(--accent-primary)]" strokeWidth={2.4} />}
              </button>
            ))}
            <div className={`${ROW} border-dashed border-[var(--border-subtle)]`}>
              <PlusIcon className="h-[18px] w-[18px] flex-shrink-0 text-[var(--text-muted)]" />
              <input value={newCompName} onChange={(e) => setNewCompName(e.target.value)} placeholder="Nom du concurrent"
                className="w-40 bg-transparent text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)]" />
              <input value={newCompDomain} onChange={(e) => setNewCompDomain(e.target.value)} placeholder="domaine.com"
                onKeyDown={(e) => e.key === "Enter" && addCompetitor()}
                className="flex-1 bg-transparent font-mono text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)]" />
              {newCompName.trim() && (
                <button type="button" onClick={addCompetitor} className="text-[13px] font-medium text-[var(--accent-primary)]">Ajouter</button>
              )}
            </div>
          </div>
        </Section>
      )}

      {/* ── Footer — Retour à gauche, Continuer à droite ── */}
      <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-5">
        {step > 1 ? (
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>Retour</Button>
        ) : <span />}
        {step < TOTAL_STEPS ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>Continuer</Button>
        ) : (
          <Button onClick={finish}>Lancer le suivi<ChevronRightIcon className="h-4 w-4" /></Button>
        )}
      </div>
    </div>
  );
}

/* ── Sous-composants ──────────────────────────────────────────────────── */

function Section({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="font-semibold tracking-tight text-[var(--text-primary)]">{title}</h1>
        <p className="text-[14px] leading-relaxed text-[var(--text-secondary)]">{sub}</p>
      </header>
      {children}
    </div>
  );
}

function Favicon({ domain, size = 18 }: { domain: string; size?: number }) {
  return (
    <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`} alt="" width={size} height={size}
      className="flex-shrink-0 rounded-sm" style={{ width: size, height: size }}
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
  );
}

function AddPromptRow({ onAdd }: { onAdd: (t: string) => void }) {
  const [v, setV] = useState("");
  const commit = () => { if (v.trim()) { onAdd(v); setV(""); } };
  return (
    <div className="flex items-center gap-2 px-4 py-2.5">
      <input value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === "Enter" && commit()}
        placeholder="Ajouter un prompt…"
        className="flex-1 bg-transparent text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)]" />
      {v.trim() && (
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={commit} aria-label="Ajouter"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--text-primary)] text-[var(--bg-primary)] transition-opacity hover:opacity-90">
            <CheckIcon className="h-4 w-4" strokeWidth={2.4} />
          </button>
          <button type="button" onClick={() => setV("")} aria-label="Annuler"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
