"use client";

import { useState, useEffect, type ElementType } from "react";
import { createPortal } from "react-dom";
import { PlusIcon, XMarkIcon, CheckIcon, ChevronUpDownIcon, ChevronRightIcon, EllipsisHorizontalIcon, PencilSquareIcon, TrashIcon, ArrowPathIcon, GlobeAltIcon, UserGroupIcon, QueueListIcon, TagIcon } from "@heroicons/react/24/outline";
import { Brain } from "lucide-react";
import { Button } from "@/components/Button";
import { Flag } from "@/components/Flag";
import { DropdownMenu, DropdownItem } from "@/components/DropdownMenu";
import { useToast } from "@/context/ToastContext";
import { LLM_PLATFORMS, REGIONS, LANGUAGES, type GeoSetup, type Competitor, type TopicList } from "@/components/geo/types";
import { PLATFORM_DOMAIN } from "@/data/geo-analytics";
import { CARD } from "@/components/geo/ui";
import { ModalShell } from "@/components/analyse/modals/shared";
import { Favicon } from "@/components/geo/views/OverviewView";

let _sid = 9000;
const sid = (p: string) => `${p}-${_sid++}`;

/* Palette + tags de prompts par défaut (alignés sur ceux de la vue Prompts). */
type Tag = { id: string; name: string; color: string };
/** Palette de la modale de tag — même jeu de couleurs que les Lots (paramètres projet). */
const TAG_PALETTE = [
  "var(--color-danger)", "var(--color-warning)", "#EAB308", "#84CC16",
  "var(--color-success)", "#14B8A6", "#06B6D4", "#3B82F6",
  "var(--accent-primary)", "#A855F7", "#EC4899", "#64748B",
];
const DEFAULT_TAGS: Tag[] = [
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
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  const [tags, setTags] = useState<Tag[]>(DEFAULT_TAGS);
  const [tagModal, setTagModal] = useState<{ mode: "create" } | { mode: "edit"; tag: Tag } | null>(null);
  const [tagDeleteTarget, setTagDeleteTarget] = useState<Tag | null>(null);

  // Barre de navigation secondaire (mêmes sections qu'avant, une à la fois).
  type SectionKey = "models" | "geo" | "competitors" | "topics" | "tags" | "reset";
  const NAV: { key: SectionKey; label: string; icon: ElementType }[] = [
    { key: "models",      label: "Modèles IA",         icon: Brain },
    { key: "geo",         label: "Zone géographique",  icon: GlobeAltIcon },
    { key: "competitors", label: "Concurrents",        icon: UserGroupIcon },
    { key: "topics",      label: "Sujets",             icon: QueueListIcon },
    { key: "tags",        label: "Tags de prompts",    icon: TagIcon },
    ...(onReconfigure ? [{ key: "reset" as const, label: "Réinitialiser", icon: ArrowPathIcon }] : []),
  ];
  const [section, setSection] = useState<SectionKey>("models");

  const togglePlatform = (k: typeof platforms[number]) =>
    setPlatforms((ps) => (ps.includes(k) ? ps.filter((p) => p !== k) : [...ps, k]));

  function saveTag(name: string, color: string) {
    const v = name.trim();
    if (!v) { setTagModal(null); return; }
    if (tagModal?.mode === "edit") {
      const id = tagModal.tag.id;
      setTags((ts) => ts.map((t) => (t.id === id ? { ...t, name: v, color } : t)));
    } else {
      setTags((ts) => [...ts, { id: sid("tag"), name: v, color }]);
    }
    setTagModal(null);
  }
  function confirmDeleteTag() {
    if (!tagDeleteTarget) return;
    setTags((ts) => ts.filter((t) => t.id !== tagDeleteTarget.id));
    setTagDeleteTarget(null);
  }

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
  const removeTopic = (id: string) => {
    setLists((ls) => ls.filter((l) => l.id !== id));
    setExpandedTopics((s) => { const n = new Set(s); n.delete(id); return n; });
  };
  const toggleTopicExpand = (id: string) =>
    setExpandedTopics((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const renameTopic = (id: string, name: string) => {
    const v = name.trim();
    if (!v) return;
    setLists((ls) => ls.map((l) => (l.id === id ? { ...l, name: v } : l)));
  };
  const addPrompt = (id: string, text: string) => {
    const v = text.trim();
    if (!v) return;
    setLists((ls) => ls.map((l) => (l.id === id
      ? { ...l, prompts: [...l.prompts, { id: sid("prompt"), text: v, volume: 0, language, region: regions[0] ?? "FR", active: true }] }
      : l)));
  };
  const removePrompt = (id: string, promptId: string) =>
    setLists((ls) => ls.map((l) => (l.id === id ? { ...l, prompts: l.prompts.filter((p) => p.id !== promptId) } : l)));

  function save() {
    onSave({ ...setup, platforms, regions, language, competitors, lists });
    toast("Paramètres enregistrés", <CheckIcon className="h-5 w-5" />);
  }

  return (
    <>
    {/* Sort du padding px-5/py-5 du conteneur GEO pour aligner la nav sur la même
        règle 48px que les autres pages de paramètres (SettingsScaffold). */}
    <div className="-mx-5 -mt-5 flex">
      {/* Barre de navigation secondaire — même règle de padding que les pages de paramètres */}
      <nav className="box-content flex w-[280px] flex-shrink-0 flex-col overflow-y-auto pb-5 pl-12 pr-3 pt-12">
        <p className="px-3.5 pb-2 type-caption text-[var(--text-muted)]">Paramètres</p>
        <div className="flex flex-col gap-0.5">
          {NAV.map(({ key, label, icon: Icon }) => {
            const isActive = section === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSection(key)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left type-label transition-colors ${
                  isActive
                    ? "bg-[var(--bg-subtle)] text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Colonne contenu — section active */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-8 pb-8 pt-12">
        <div className="flex items-center justify-end">
          <Button size="md" onClick={save}>Enregistrer</Button>
        </div>

      {section === "models" && (
      <Section title="Modèles IA" desc="Les plateformes sur lesquelles on interroge vos prompts.">
        <div className={`flex flex-col divide-y divide-[var(--border-subtle)] overflow-hidden ${CARD}`}>
          {LLM_PLATFORMS.map((p) => (
            <div key={p.key} className="flex items-center gap-3 px-4 py-3">
              <Favicon domain={PLATFORM_DOMAIN(p.key)} size={18} />
              <span className="flex-1 truncate type-body-strong">{p.label}</span>
              <Switch on={platforms.includes(p.key)} onChange={() => togglePlatform(p.key)} ariaLabel={p.label} />
            </div>
          ))}
        </div>
      </Section>

      )}

      {section === "geo" && (
      <Section title="Zone géographique & langue" desc="La région depuis laquelle les prompts sont posés, et la langue.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 type-label">Zone géographique</p>
            <SettingSelect trigger={<><Flag code={regions[0] ?? "FR"} size={18} />{REGIONS.find((r) => r.code === (regions[0] ?? "FR"))?.label ?? "—"}</>}>
              {REGIONS.map((r) => (
                <DropdownItem key={r.code} selected={(regions[0] ?? "FR") === r.code} onClick={() => setRegions([r.code])}>
                  <span className="inline-flex items-center gap-2"><Flag code={r.code} size={16} />{r.label}</span>
                </DropdownItem>
              ))}
            </SettingSelect>
          </div>
          <div>
            <p className="mb-2 type-label">Langue</p>
            <SettingSelect trigger={LANGUAGES.find((l) => l.code === language)?.label ?? "—"}>
              {LANGUAGES.map((l) => (
                <DropdownItem key={l.code} selected={language === l.code} onClick={() => setLanguage(l.code)}>{l.label}</DropdownItem>
              ))}
            </SettingSelect>
          </div>
        </div>
      </Section>

      )}

      {section === "competitors" && (
      <Section title="Concurrents suivis" desc="Les marques comparées à la vôtre dans les réponses IA.">
        <div className={`flex flex-col divide-y divide-[var(--border-subtle)] overflow-hidden ${CARD}`}>
          {competitors.map((c) => (
            <div key={c.id} className="flex items-center gap-3 px-4 py-3">
              <Favicon domain={c.domain} size={18} />
              <span className="flex-1 truncate type-body-strong">{c.name}</span>
              <span className="truncate type-caption">{c.domain}</span>
              <button type="button" onClick={() => toggleTracked(c.id)}
                className={`rounded-lg px-2.5 py-1 type-micro transition-colors ${c.tracked ? "bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]" : "bg-[var(--bg-subtle)] text-[var(--text-muted)]"}`}>
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
            className="flex items-center gap-2 px-4 py-2.5 text-left type-body text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
            <PlusIcon className="h-[18px] w-[18px] flex-shrink-0" />
            Ajouter un concurrent
          </button>
        </div>
      </Section>

      )}

      {section === "topics" && (
      <Section title="Sujets" desc="Les thématiques regroupant vos prompts.">
        <div className={`flex flex-col divide-y divide-[var(--border-subtle)] overflow-hidden ${CARD}`}>
          {lists.map((l) => (
            <TopicRow
              key={l.id}
              list={l}
              expanded={expandedTopics.has(l.id)}
              onToggle={() => toggleTopicExpand(l.id)}
              onRename={(name) => renameTopic(l.id, name)}
              onRemove={() => removeTopic(l.id)}
              onAddPrompt={(text) => addPrompt(l.id, text)}
              onRemovePrompt={(pid) => removePrompt(l.id, pid)}
            />
          ))}
          <AddRow value={newTopic} onChange={setNewTopic} onAdd={addTopic} placeholder="Ajouter un sujet…" />
        </div>
      </Section>
      )}

      {section === "tags" && (
      <Section title="Tags de prompts" desc="Les étiquettes pour catégoriser et filtrer vos prompts.">
        <div className="flex flex-wrap items-center gap-2">
          {tags.map((t) => (
            <span key={t.id} className="inline-flex items-center gap-2 rounded-full bg-[var(--bg-subtle)] py-1 pl-2.5 pr-1.5 text-[12px] font-medium text-[var(--text-secondary)]">
              <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: t.color }} />
              {t.name}
              <DropdownMenu
                width={180}
                trigger={(open) => (
                  <button
                    type="button"
                    aria-label={`Options du tag ${t.name}`}
                    className={`flex h-5 w-5 items-center justify-center rounded-full transition-colors ${open ? "bg-[var(--bg-card-hover)] text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
                  >
                    <EllipsisHorizontalIcon className="h-4 w-4" />
                  </button>
                )}
              >
                <DropdownItem icon={PencilSquareIcon} onClick={() => setTagModal({ mode: "edit", tag: t })}>Modifier</DropdownItem>
                <DropdownItem icon={TrashIcon} danger onClick={() => setTagDeleteTarget(t)}>Supprimer</DropdownItem>
              </DropdownMenu>
            </span>
          ))}
          <button type="button" onClick={() => setTagModal({ mode: "create" })}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-[var(--border-medium)] px-3 py-1 text-[12px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
            <PlusIcon className="h-3.5 w-3.5" />Nouveau tag
          </button>
        </div>
      </Section>

      )}

      {section === "reset" && onReconfigure && (
        <Section title="Réinitialiser l'analyse" desc="Relancer la configuration de la Visibilité IA depuis le début.">
          <div className={`flex items-center gap-3 px-4 py-3.5 ${CARD}`}>
            <div className="min-w-0 flex-1">
              <p className="type-body-strong">Réinitialiser mon analyse</p>
              <p className="mt-0.5 type-caption">Revoir modèles, régions, concurrents et sujets, puis relancer une analyse.</p>
            </div>
            <Button variant="secondary" size="sm" onClick={onReconfigure}>
              <ArrowPathIcon className="h-4 w-4" />Réinitialiser mon analyse
            </Button>
          </div>
        </Section>
      )}

      </div>{/* fin contenu centré */}
      </div>{/* fin colonne contenu */}

      {compModalOpen && (
        <CompetitorModal initial={editingComp} onSave={saveCompetitor} onClose={() => setCompModalOpen(false)} />
      )}

      {tagModal && (
        <TagModal
          mode={tagModal.mode}
          initialName={tagModal.mode === "edit" ? tagModal.tag.name : ""}
          initialColor={tagModal.mode === "edit" ? tagModal.tag.color : TAG_PALETTE[8]}
          existingNames={tags.filter((t) => tagModal.mode !== "edit" || t.id !== tagModal.tag.id).map((t) => t.name)}
          onCancel={() => setTagModal(null)}
          onSubmit={saveTag}
        />
      )}

      {tagDeleteTarget && (
        <ModalShell onClose={() => setTagDeleteTarget(null)} maxWidth={400}>
          <h3 className="mb-1.5 type-h3">Supprimer ce tag ?</h3>
          <p className="mb-6 type-body-sm">
            Le tag <span className="font-medium text-[var(--text-primary)]">« {tagDeleteTarget.name} »</span> sera retiré. Les prompts qui le portent ne sont pas supprimés.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="md" onClick={() => setTagDeleteTarget(null)}>Annuler</Button>
            <Button variant="danger" size="md" onClick={confirmDeleteTag}>Supprimer</Button>
          </div>
        </ModalShell>
      )}
    </div>
    </>
  );
}

/** Modale d'ajout / édition d'un tag de prompt (nom + couleur) — même flux que les Lots. */
function TagModal({ mode, initialName, initialColor, existingNames, onCancel, onSubmit }: {
  mode: "create" | "edit";
  initialName: string;
  initialColor: string;
  existingNames: string[];
  onCancel: () => void;
  onSubmit: (name: string, color: string) => void;
}) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState<string>(initialColor);
  const trimmed = name.trim();
  const exists = existingNames.some((n) => n.toLowerCase() === trimmed.toLowerCase());
  const canSubmit = trimmed.length > 0 && !exists;

  return (
    <ModalShell onClose={onCancel} maxWidth={420}>
      <h3 className="mb-1.5 type-h3">{mode === "edit" ? "Modifier le tag" : "Nouveau tag"}</h3>
      <p className="mb-5 type-body-sm">Donnez un nom à votre tag et choisissez sa couleur.</p>

      <input
        autoFocus
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && canSubmit) onSubmit(trimmed, color); }}
        placeholder="Ex. Prioritaire"
        className="w-full rounded-full border border-[var(--border-medium)] bg-[var(--input-bg)] px-4 py-2.5 type-body text-[var(--text-primary)] placeholder-[var(--text-input)] focus:border-[var(--accent-primary)] focus:outline-none"
      />
      {exists && <p className="mt-2 text-[12px] text-[var(--color-danger)]">Ce tag existe déjà.</p>}

      <div className="mt-5">
        <p className="mb-2.5 type-label">Couleur</p>
        <div className="flex flex-wrap gap-2">
          {TAG_PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95"
              aria-label={`Choisir la couleur ${c}`}
            >
              <span className="block h-5 w-5 rounded-full" style={{ backgroundColor: c, boxShadow: c === color ? `0 0 0 2px var(--modal-bg), 0 0 0 3.5px ${c}` : undefined }} />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" size="md" onClick={onCancel}>Annuler</Button>
        <Button variant="primary" size="md" onClick={() => onSubmit(trimmed, color)} disabled={!canSubmit}>
          {mode === "edit" ? "Enregistrer" : "Créer le tag"}
        </Button>
      </div>
    </ModalShell>
  );
}

/** Ligne « sujet » développable + éditable : chevron pour déplier, renommage inline,
 *  ajout/retrait de prompts une fois déplié. */
function TopicRow({ list, expanded, onToggle, onRename, onRemove, onAddPrompt, onRemovePrompt }: {
  list: TopicList;
  expanded: boolean;
  onToggle: () => void;
  onRename: (name: string) => void;
  onRemove: () => void;
  onAddPrompt: (text: string) => void;
  onRemovePrompt: (promptId: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(list.name);
  const [newPrompt, setNewPrompt] = useState("");

  function commitRename() {
    const v = name.trim();
    if (v && v !== list.name) onRename(v);
    else setName(list.name);
    setEditing(false);
  }
  function startRename() {
    setName(list.name);
    setEditing(true);
    if (!expanded) onToggle();
  }
  function submitPrompt() {
    if (!newPrompt.trim()) return;
    onAddPrompt(newPrompt);
    setNewPrompt("");
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3">
        <button type="button" onClick={onToggle} aria-label={expanded ? "Réduire" : "Développer"} aria-expanded={expanded}
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]">
          <ChevronRightIcon className={`h-4 w-4 transition-transform ${expanded ? "rotate-90" : ""}`} />
        </button>
        {editing ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") { setName(list.name); setEditing(false); } }}
            className="flex-1 rounded-lg border border-[var(--border-medium)] bg-[var(--bg-card)] px-2 py-1 type-body-strong outline-none focus:border-[var(--accent-primary)]"
          />
        ) : (
          <button type="button" onClick={onToggle} className="flex-1 truncate text-left type-body-strong">{list.name}</button>
        )}
        <span className="type-caption">{list.prompts.length} prompts</span>
        <DropdownMenu width={180} trigger={
          <button type="button" aria-label="Actions"
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]">
            <EllipsisHorizontalIcon className="h-4 w-4" />
          </button>
        }>
          <DropdownItem icon={PencilSquareIcon} onClick={startRename}>Renommer</DropdownItem>
          <DropdownItem icon={TrashIcon} danger onClick={onRemove}>Supprimer</DropdownItem>
        </DropdownMenu>
      </div>

      {expanded && (
        <div className="flex flex-col gap-0.5 pb-3 pl-12 pr-4">
          {list.prompts.length === 0 && <p className="py-1 type-caption">Aucun prompt pour l'instant.</p>}
          {list.prompts.map((p) => (
            <div key={p.id} className="flex items-center gap-2 py-1">
              <span className="flex-1 truncate type-body">{p.text}</span>
              <button type="button" onClick={() => onRemovePrompt(p.id)} aria-label="Retirer le prompt"
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--color-danger)]">
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-1">
            <PlusIcon className="h-4 w-4 flex-shrink-0 text-[var(--text-muted)]" />
            <input value={newPrompt} onChange={(e) => setNewPrompt(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitPrompt()}
              placeholder="Ajouter un prompt…"
              className="flex-1 bg-transparent type-body outline-none placeholder:text-[var(--text-input)]" />
            {newPrompt.trim() && <button type="button" onClick={submitPrompt} className="type-label text-[var(--accent-primary)]">Ajouter</button>}
          </div>
        </div>
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
            <p className="type-h3">{initial ? "Modifier le concurrent" : "Ajouter un concurrent"}</p>
            <p className="mt-1 type-body-sm">La marque comparée à la vôtre dans les réponses IA.</p>
          </div>
          <label className="block">
            <span className="mb-1.5 block type-label">Nom de la marque</span>
            <input value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder="Ex. Semji"
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-2.5 type-body outline-none placeholder:text-[var(--text-input)] focus:border-[var(--border-medium)]" />
          </label>
          <label className="block">
            <span className="mb-1.5 block type-label">Lien du site</span>
            <input value={site} onChange={(e) => setSite(e.target.value)} placeholder="https://exemple.com"
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-2.5 type-body outline-none placeholder:text-[var(--text-input)] focus:border-[var(--border-medium)]" />
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
        <p className="type-title">{title}</p>
        <p className="mt-0.5 type-caption">{desc}</p>
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
          className="flex w-full items-center justify-between gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-2.5 type-body transition-colors hover:border-[var(--border-medium)]"
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
        className="flex-1 bg-transparent type-body outline-none placeholder:text-[var(--text-input)]" />
      {value.trim() && <button type="button" onClick={onAdd} className="type-label text-[var(--accent-primary)]">Ajouter</button>}
    </div>
  );
}
