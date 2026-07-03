"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PlusIcon, XMarkIcon, CheckIcon, ChevronUpDownIcon, EllipsisHorizontalIcon, PencilSquareIcon, TrashIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/Button";
import { Flag } from "@/components/Flag";
import { DropdownMenu, DropdownItem } from "@/components/DropdownMenu";
import { useToast } from "@/context/ToastContext";
import { LLM_PLATFORMS, REGIONS, LANGUAGES, type GeoSetup, type Competitor, type TopicList } from "@/components/geo/types";
import { PLATFORM_DOMAIN } from "@/components/geo/analytics";
import { CARD, TagPill } from "@/components/geo/ui";
import { Favicon } from "@/components/geo/views/OverviewView";

let _sid = 9000;
const sid = (p: string) => `${p}-${_sid++}`;

/* Palette + tags de prompts par défaut (alignés sur ceux de la vue Prompts). */
const TAG_PALETTE = ["var(--color-danger)", "var(--color-warning)", "var(--accent-primary)", "var(--color-success)", "#8B5CF6", "#EC4899"];
const DEFAULT_TAGS = [
  { id: "tag-prio", name: "Prioritaire",   color: "var(--color-danger)" },
  { id: "tag-surv", name: "À surveiller",  color: "var(--color-warning)" },
  { id: "tag-conc", name: "Concurrentiel", color: "var(--accent-primary)" },
  { id: "tag-marq", name: "Marque",        color: "var(--color-success)" },
];

/** Vue Paramètres — édite la configuration du module Visibilité IA (identique à
 *  l'onboarding : modèles IA, régions & langue, concurrents, sujets), avec Enregistrer. */
export function GeoSettingsView({ setup, onSave, onReconfigure }: { setup: GeoSetup; onSave: (s: GeoSetup) => void; onReconfigure?: () => void }) {
  const { show: toast } = useToast();
  const [platforms, setPlatforms] = useState(setup.platforms);
  const [regions, setRegions] = useState(setup.regions);
  const [language, setLanguage] = useState(setup.language);
  const [competitors, setCompetitors] = useState<Competitor[]>(setup.competitors);
  const [lists, setLists] = useState<TopicList[]>(setup.lists);
  const [compModalOpen, setCompModalOpen] = useState(false);
  const [editingComp, setEditingComp] = useState<Competitor | null>(null);
  const [newTopic, setNewTopic] = useState("");

  const [tags, setTags] = useState(DEFAULT_TAGS);
  const [newTag, setNewTag] = useState("");

  const togglePlatform = (k: typeof platforms[number]) =>
    setPlatforms((ps) => (ps.includes(k) ? ps.filter((p) => p !== k) : [...ps, k]));

  function addTag() {
    const name = newTag.trim();
    if (!name || tags.some((t) => t.name.toLowerCase() === name.toLowerCase())) { setNewTag(""); return; }
    setTags((ts) => [...ts, { id: sid("tag"), name, color: TAG_PALETTE[ts.length % TAG_PALETTE.length] }]);
    setNewTag("");
  }
  const removeTag = (id: string) => setTags((ts) => ts.filter((t) => t.id !== id));

  const openAddComp = () => { setEditingComp(null); setCompModalOpen(true); };
  const openEditComp = (c: Competitor) => { setEditingComp(c); setCompModalOpen(true); };
  function saveCompetitor({ name, domain }: { name: string; domain: string }) {
    if (editingComp) {
      setCompetitors((cs) => cs.map((c) => (c.id === editingComp.id ? { ...c, name, domain } : c)));
    } else {
      setCompetitors((cs) => [...cs, { id: sid("comp"), name, domain, tracked: true }]);
    }
  }
  const removeCompetitor = (id: string) => setCompetitors((cs) => cs.filter((c) => c.id !== id));
  const toggleTracked = (id: string) => setCompetitors((cs) => cs.map((c) => (c.id === id ? { ...c, tracked: !c.tracked } : c)));

  function addTopic() {
    const name = newTopic.trim();
    if (!name) return;
    setLists((ls) => [...ls, { id: sid("topic"), name, source: "manual", selected: true, prompts: [] }]);
    setNewTopic("");
  }
  const removeTopic = (id: string) => setLists((ls) => ls.filter((l) => l.id !== id));

  function save() {
    onSave({ ...setup, platforms, regions, language, competitors, lists });
    toast("Paramètres enregistrés", <CheckIcon className="h-5 w-5" />);
  }

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] text-[var(--text-muted)]">Configuration de la Visibilité IA — ce qu'on suit sur les plateformes IA.</p>
        <Button size="sm" onClick={save}>Enregistrer</Button>
      </div>

      {/* Modèles IA — switch par modèle */}
      <Section title="Modèles IA" desc="Les plateformes sur lesquelles on interroge vos prompts.">
        <div className={`flex flex-col divide-y divide-[var(--border-subtle)] overflow-hidden ${CARD}`}>
          {LLM_PLATFORMS.map((p) => (
            <div key={p.key} className="flex items-center gap-3 px-4 py-3">
              <Favicon domain={PLATFORM_DOMAIN(p.key)} size={18} />
              <span className="flex-1 truncate text-[14px] font-medium text-[var(--text-primary)]">{p.label}</span>
              <Switch on={platforms.includes(p.key)} onChange={() => togglePlatform(p.key)} ariaLabel={p.label} />
            </div>
          ))}
        </div>
      </Section>

      {/* Zone géographique & langue — dropdowns */}
      <Section title="Zone géographique & langue" desc="La région depuis laquelle les prompts sont posés, et la langue.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-[12px] font-medium text-[var(--text-muted)]">Zone géographique</p>
            <SettingSelect trigger={<><Flag code={regions[0] ?? "FR"} size={18} />{REGIONS.find((r) => r.code === (regions[0] ?? "FR"))?.label ?? "—"}</>}>
              {REGIONS.map((r) => (
                <DropdownItem key={r.code} selected={(regions[0] ?? "FR") === r.code} onClick={() => setRegions([r.code])}>
                  <span className="inline-flex items-center gap-2"><Flag code={r.code} size={16} />{r.label}</span>
                </DropdownItem>
              ))}
            </SettingSelect>
          </div>
          <div>
            <p className="mb-2 text-[12px] font-medium text-[var(--text-muted)]">Langue</p>
            <SettingSelect trigger={LANGUAGES.find((l) => l.code === language)?.label ?? "—"}>
              {LANGUAGES.map((l) => (
                <DropdownItem key={l.code} selected={language === l.code} onClick={() => setLanguage(l.code)}>{l.label}</DropdownItem>
              ))}
            </SettingSelect>
          </div>
        </div>
      </Section>

      {/* Concurrents */}
      <Section title="Concurrents suivis" desc="Les marques comparées à la vôtre dans les réponses IA.">
        <div className={`flex flex-col divide-y divide-[var(--border-subtle)] overflow-hidden ${CARD}`}>
          {competitors.map((c) => (
            <div key={c.id} className="flex items-center gap-3 px-4 py-3">
              <Favicon domain={c.domain} size={18} />
              <span className="flex-1 truncate text-[14px] font-medium text-[var(--text-primary)]">{c.name}</span>
              <span className="truncate text-[12px] text-[var(--text-muted)]">{c.domain}</span>
              <button type="button" onClick={() => toggleTracked(c.id)}
                className={`rounded-lg px-2.5 py-1 text-[12px] font-medium transition-colors ${c.tracked ? "bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]" : "bg-[var(--bg-subtle)] text-[var(--text-muted)]"}`}>
                {c.tracked ? "Suivi" : "En pause"}
              </button>
              <DropdownMenu width={180} trigger={
                <button type="button" aria-label="Actions"
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]">
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                </button>
              }>
                <DropdownItem icon={PencilSquareIcon} onClick={() => openEditComp(c)}>Modifier</DropdownItem>
                <DropdownItem icon={TrashIcon} danger onClick={() => removeCompetitor(c.id)}>Supprimer</DropdownItem>
              </DropdownMenu>
            </div>
          ))}
          <button type="button" onClick={openAddComp}
            className="flex items-center gap-2 px-4 py-2.5 text-left text-[14px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
            <PlusIcon className="h-[18px] w-[18px] flex-shrink-0" />
            Ajouter un concurrent
          </button>
        </div>
      </Section>

      {/* Sujets */}
      <Section title="Sujets" desc="Les thématiques regroupant vos prompts.">
        <div className={`flex flex-col divide-y divide-[var(--border-subtle)] overflow-hidden ${CARD}`}>
          {lists.map((l) => (
            <div key={l.id} className="flex items-center gap-3 px-4 py-3">
              <span className="flex-1 truncate text-[14px] font-medium text-[var(--text-primary)]">{l.name}</span>
              <span className="text-[12px] text-[var(--text-muted)]">{l.prompts.length} prompts</span>
              <button type="button" onClick={() => removeTopic(l.id)} aria-label="Retirer"
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--color-danger)]">
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
          <AddRow value={newTopic} onChange={setNewTopic} onAdd={addTopic} placeholder="Ajouter un sujet…" />
        </div>
      </Section>

      {/* Tags de prompts */}
      <Section title="Tags de prompts" desc="Les étiquettes pour catégoriser et filtrer vos prompts.">
        <div className={`flex flex-col divide-y divide-[var(--border-subtle)] overflow-hidden ${CARD}`}>
          {tags.map((t) => (
            <div key={t.id} className="flex items-center gap-3 px-4 py-3">
              <TagPill name={t.name} color={t.color} />
              <span className="flex-1" />
              <button type="button" onClick={() => removeTag(t.id)} aria-label="Retirer"
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--color-danger)]">
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
          <AddRow value={newTag} onChange={setNewTag} onAdd={addTag} placeholder="Ajouter un tag…" />
        </div>
      </Section>

      {/* Réinitialiser l'analyse — relance le wizard de configuration */}
      {onReconfigure && (
        <Section title="Réinitialiser l'analyse" desc="Relancer la configuration de la Visibilité IA depuis le début.">
          <div className={`flex items-center gap-3 px-4 py-3.5 ${CARD}`}>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium text-[var(--text-primary)]">Réinitialiser mon analyse</p>
              <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">Revoir modèles, régions, concurrents et sujets, puis relancer une analyse.</p>
            </div>
            <Button variant="secondary" size="sm" onClick={onReconfigure}>
              <ArrowPathIcon className="h-4 w-4" />Réinitialiser mon analyse
            </Button>
          </div>
        </Section>
      )}

      <div className="flex justify-end">
        <Button onClick={save}>Enregistrer les paramètres</Button>
      </div>

      {compModalOpen && (
        <CompetitorModal initial={editingComp} onSave={saveCompetitor} onClose={() => setCompModalOpen(false)} />
      )}
    </div>
  );
}

/** Modale d'ajout / édition d'un concurrent (nom de la marque + lien du site). */
function CompetitorModal({ initial, onSave, onClose }: {
  initial: Competitor | null;
  onSave: (c: { name: string; domain: string }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [site, setSite] = useState(initial ? `https://${initial.domain}` : "");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const canSave = name.trim().length > 0;
  function normalizeDomain(input: string, fallback: string): string {
    const d = input.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
    return d || `${fallback.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
  }
  function submit() {
    if (!canSave) return;
    onSave({ name: name.trim(), domain: normalizeDomain(site, name.trim()) });
    onClose();
  }

  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="flex w-full max-w-[440px] flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col gap-5 px-6 py-5">
          <div>
            <p className="text-[16px] font-semibold text-[var(--text-primary)]">{initial ? "Modifier le concurrent" : "Ajouter un concurrent"}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-secondary)]">La marque comparée à la vôtre dans les réponses IA.</p>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[var(--text-secondary)]">Nom de la marque</span>
            <input value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder="Ex. Semji"
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-2.5 text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] focus:border-[var(--border-medium)]" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[var(--text-secondary)]">Lien du site</span>
            <input value={site} onChange={(e) => setSite(e.target.value)} placeholder="https://exemple.com"
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-2.5 text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] focus:border-[var(--border-medium)]" />
          </label>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-[var(--border-subtle)] px-6 py-4">
          <Button variant="secondary" size="md" onClick={onClose}>Annuler</Button>
          <Button size="md" onClick={submit} disabled={!canSave}>{initial ? "Enregistrer" : "Ajouter"}</Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <p className="text-[15px] font-semibold text-[var(--text-primary)]">{title}</p>
        <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">{desc}</p>
      </div>
      {children}
    </section>
  );
}

/** Switch plein (accent ON / gris OFF) — sans icône, pour activer un modèle. */
function Switch({ on, onChange, ariaLabel }: { on: boolean; onChange: (v: boolean) => void; ariaLabel?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      onClick={() => onChange(!on)}
      className="relative inline-block h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200"
      style={{ backgroundColor: on ? "var(--accent-primary)" : "var(--border-medium)" }}
    >
      <span
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-[left] duration-200"
        style={{ left: on ? "22px" : "2px" }}
      />
    </button>
  );
}

/** Champ select rectangulaire (dropdown DS) — pour zone géographique / langue. */
function SettingSelect({ trigger, children }: { trigger: React.ReactNode; children: React.ReactNode }) {
  return (
    <DropdownMenu
      width={280}
      trigger={
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-2.5 text-[14px] text-[var(--text-primary)] transition-colors hover:border-[var(--border-medium)]"
        >
          <span className="flex min-w-0 items-center gap-2 truncate">{trigger}</span>
          <ChevronUpDownIcon className="h-4 w-4 flex-shrink-0 text-[var(--text-muted)]" />
        </button>
      }
    >
      {children}
    </DropdownMenu>
  );
}

function AddRow({ value, onChange, onAdd, placeholder }: { value: string; onChange: (v: string) => void; onAdd: () => void; placeholder: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5">
      <PlusIcon className="h-[18px] w-[18px] flex-shrink-0 text-[var(--text-muted)]" />
      <input value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onAdd()}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)]" />
      {value.trim() && <button type="button" onClick={onAdd} className="text-[13px] font-medium text-[var(--accent-primary)]">Ajouter</button>}
    </div>
  );
}
