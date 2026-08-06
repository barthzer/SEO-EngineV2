"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ArrowLeftIcon, SparklesIcon, ChevronRightIcon, ArrowUpTrayIcon, PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { Checkbox } from "@/components/Checkbox";
import { SearchInput } from "@/components/SearchInput";
import { FilterTabs } from "@/components/FilterTabs";
import { TableWide } from "@/components/TableWide";
import { Flag } from "@/components/Flag";
import { useToast } from "@/context/ToastContext";
import { AI_PROMPT_BANK, randomVolume } from "@/data/geo";
import { PLATFORM_LABEL, PLATFORM_DOMAIN } from "@/data/geo-analytics";
import { LANGUAGES, type GeoSetup, type TopicList, type Prompt, type LlmPlatform } from "@/components/geo/types";
import { CARD_SM } from "@/components/geo/ui";
import { Favicon } from "@/components/geo/views/OverviewView";
import { AddPromptModal, type CreatePromptArgs } from "@/components/geo/AddPromptModal";
import { AddTopicModal } from "@/components/geo/AddTopicModal";

let _pid = 7000;
const pid = () => `pd-${_pid++}`;

const MAX_PROMPTS = 200;

/* Tags de prompts (alignés sur ceux de la vue Prompts / Paramètres). */
const PROMPT_TAGS = [
  { name: "Prioritaire",   color: "var(--color-danger)" },
  { name: "À surveiller",  color: "var(--color-warning)" },
  { name: "Concurrentiel", color: "var(--accent-primary)" },
  { name: "Marque",        color: "var(--color-success)" },
];
const langLabel = (code: string) => LANGUAGES.find((l) => l.code === code)?.label ?? code.toUpperCase();

type Row = { p: Prompt; topicId: string; topicName: string };

/**
 * Gestion des prompts (« Prompt Designer », adapté au DS). Édite en place les listes/prompts
 * du module : filtres par sujet + actif/inactif, recherche, édition inline, génération, import,
 * suppression multiple, ajout de prompt/sujet.
 */
export function PromptDesigner({ setup, lists, setLists, onClose }: {
  setup: GeoSetup; lists: TopicList[]; setLists: React.Dispatch<React.SetStateAction<TopicList[]>>; onClose: () => void;
}) {
  const { show: toast } = useToast();
  const [topic, setTopic] = useState<string>("all");            // "all" | topicId
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string | number>>(() => new Set());
  const [addTopicOpen, setAddTopicOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }, []);

  const total = lists.reduce((n, l) => n + l.prompts.length, 0);

  const rows: Row[] = lists.flatMap((l) => l.prompts.map((p) => ({ p, topicId: l.id, topicName: l.name })));
  const filtered = rows.filter((r) =>
    (topic === "all" || r.topicId === topic) &&
    (status === "all" || (status === "active" ? r.p.active : !r.p.active)) &&
    (!search || r.p.text.toLowerCase().includes(search.toLowerCase())),
  );

  const pageKeys = filtered.map((r) => r.p.id);
  const allSel = pageKeys.length > 0 && pageKeys.every((k) => selected.has(k));
  const someSel = pageKeys.some((k) => selected.has(k));
  const toggleRow = (k: string) =>
    setSelected((s) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const toggleAllRows = () =>
    setSelected((s) => { const n = new Set(s); pageKeys.forEach((k) => allSel ? n.delete(k) : n.add(k)); return n; });
  const clearSel = () => setSelected(new Set());

  function updateText(id: string, text: string) {
    setLists((ls) => ls.map((l) => ({ ...l, prompts: l.prompts.map((p) => (p.id === id ? { ...p, text } : p)) })));
  }
  function toggleActive(id: string) {
    setLists((ls) => ls.map((l) => ({ ...l, prompts: l.prompts.map((p) => (p.id === id ? { ...p, active: !p.active } : p)) })));
  }
  function createFromModal({ texts, topicId, region }: CreatePromptArgs) {
    const targetId = topicId ?? (topic !== "all" ? topic : lists[0]?.id);
    if (!targetId) return;
    const created: Prompt[] = texts.map((t) => ({ id: pid(), text: t, volume: randomVolume(), language: setup.language, region, active: true }));
    setLists((ls) => ls.map((l) => (l.id === targetId ? { ...l, prompts: [...created, ...l.prompts] } : l)));
    toast(`${created.length} prompt${created.length > 1 ? "s" : ""} ajouté${created.length > 1 ? "s" : ""}`, <PlusIcon className="h-5 w-5" />);
  }
  function generate() {
    const targetId = topic !== "all" ? topic : lists[0]?.id;
    if (!targetId) return;
    const np: Prompt[] = AI_PROMPT_BANK.slice(0, 4).map((t) => ({ id: pid(), text: t, volume: randomVolume(), language: setup.language, region: setup.regions[0] ?? "FR", active: true }));
    setLists((ls) => ls.map((l) => (l.id === targetId ? { ...l, prompts: [...np, ...l.prompts] } : l)));
    toast(`${np.length} prompts générés`, <SparklesIcon className="h-5 w-5" />);
  }
  function deleteSelected() {
    setLists((ls) => ls.map((l) => ({ ...l, prompts: l.prompts.filter((p) => !selected.has(p.id)) })));
    clearSel();
  }
  function createTopic(name: string, promptTexts: string[]) {
    const prompts: Prompt[] = promptTexts.map((t) => ({
      id: pid(), text: t, volume: randomVolume(), language: setup.language, region: setup.regions[0] ?? "FR", active: true,
    }));
    setLists((ls) => [...ls, { id: `pdt-${_pid++}`, name, source: "manual", selected: true, prompts }]);
  }

  return createPortal(
    <div className="fixed inset-0 z-[70] flex bg-black/30 p-4 backdrop-blur-sm md:p-6" onClick={onClose}>
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
    <div className="mx-auto flex min-h-0 w-full max-w-[1400px] flex-1 flex-col gap-5 px-8 py-6">
      {/* Barre supérieure */}
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={onClose}
          className="inline-flex items-center gap-1.5 type-label text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
          <ArrowLeftIcon className="h-4 w-4" />Retour
        </button>
        <div className="flex items-center gap-3">
          <span className="type-caption text-[var(--text-muted)]">Modifications temporaires jusqu'à l'enregistrement</span>
          <Button size="sm" onClick={() => { toast("Prompts enregistrés", null); onClose(); }}>Enregistrer</Button>
        </div>
      </div>

      <div>
        <h1 className="type-h1 leading-none">Gestion des prompts</h1>
        <p className="mt-1.5 type-body text-[var(--text-secondary)]">On interroge ces prompts sur les plateformes IA pour générer les insights de la Visibilité IA.</p>
      </div>

      {/* Toolbar : statut + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterTabs<"all" | "active" | "inactive">
          tabs={[{ key: "all", label: "Tous" }, { key: "active", label: "Actifs" }, { key: "inactive", label: "Inactifs" }]}
          value={status} onChange={(v) => { setStatus(v); clearSel(); }}
        />
        <div className="flex items-center gap-2">
          <Button size="md" variant="secondary" onClick={generate}>Générer<ChevronRightIcon className="h-4 w-4" /></Button>
          <Button size="md" variant="secondary" onClick={() => toast("Import de prompts (CSV) — bientôt", <ArrowUpTrayIcon className="h-5 w-5" />)}>
            <ArrowUpTrayIcon className="h-4 w-4" />Importer
          </Button>
        </div>
      </div>

      {/* Corps : sujets (gauche) + table (droite) — seul le tableau scrolle */}
      <div className="grid min-h-0 flex-1 grid-cols-[220px_1fr] gap-5">
        <aside className="flex min-h-0 flex-col gap-1 overflow-y-auto">
          <p className="px-2 pb-1 type-micro font-semibold">Sujets ({lists.length})</p>
          <TopicRow label="Tous les sujets" count={total} active={topic === "all"} onClick={() => setTopic("all")} />
          {lists.map((l) => (
            <TopicRow key={l.id} label={l.name} count={l.prompts.length} active={topic === l.id} onClick={() => setTopic(l.id)} />
          ))}
          <button type="button" onClick={() => setAddTopicOpen(true)}
            className="mt-1 flex items-center gap-1.5 rounded-xl border border-dashed border-[var(--border-subtle)] px-3 py-2 type-label text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
            <PlusIcon className="h-4 w-4 flex-shrink-0" />
            Ajouter un sujet
          </button>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-col gap-3">
          <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
            <div className="w-full max-w-[280px]">
              <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un prompt…" alwaysExpanded />
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="type-caption tabular-nums text-[var(--text-muted)]">{total} / {MAX_PROMPTS} prompts</span>
              <Button size="sm" onClick={() => setAddModalOpen(true)} disabled={total >= MAX_PROMPTS}><PlusIcon className="h-4 w-4" />Ajouter un prompt</Button>
            </div>
          </div>

          {/* Zone table bornée : scroll vertical + horizontal (la colonne Plateformes
              débordait et était coupée). */}
          <div className={`flex min-h-0 flex-1 flex-col overflow-hidden ${CARD_SM}`}>
            <div className="min-h-0 flex-1 overflow-auto">
            <TableWide<Row>
              hidePagination
              rowKey={(r) => r.p.id}
              data={filtered}
              emptyState={<div className="px-7 py-10 text-center type-body text-[var(--text-muted)]">Aucun prompt{status === "active" ? " actif" : status === "inactive" ? " inactif" : ""}.</div>}
              columns={[
                { key: "select", width: 28,
                  header: <Checkbox checked={allSel} indeterminate={someSel && !allSel} onChange={toggleAllRows} />,
                  render: (r) => <Checkbox checked={selected.has(r.p.id)} onChange={() => toggleRow(r.p.id)} /> },
                { key: "text", header: "Prompt", width: 300, flex: true,
                  render: (r) => (
                    <input value={r.p.text} onChange={(e) => updateText(r.p.id, e.target.value)} onClick={(e) => e.stopPropagation()}
                      placeholder="Saisir un prompt…"
                      className="w-full truncate rounded-md bg-transparent px-1.5 py-1 type-body-strong outline-none transition-colors hover:bg-[var(--bg-subtle)] focus:bg-[var(--bg-subtle)]" /> ) },
                { key: "topic", header: "Sujet", width: 170,
                  render: (r) => <span className="truncate type-label">{r.topicName}</span> },
                { key: "active", header: "Statut", width: 120,
                  render: (r) => (
                    <button type="button" onClick={(e) => { e.stopPropagation(); toggleActive(r.p.id); }}
                      className="inline-flex items-center gap-2 type-label" aria-label={r.p.active ? "Désactiver" : "Activer"}>
                      <span className={`relative h-[18px] w-8 flex-shrink-0 rounded-full transition-colors ${r.p.active ? "bg-[var(--color-success)]" : "bg-[var(--border-medium)]"}`}>
                        <span className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-all ${r.p.active ? "left-[15px]" : "left-0.5"}`} />
                      </span>
                      <span className={r.p.active ? "text-[var(--color-success)]" : "text-[var(--text-muted)]"}>{r.p.active ? "Actif" : "Inactif"}</span>
                    </button>
                  ) },
                { key: "lang", header: "Langue", width: 120,
                  render: (r) => <span className="type-label">{langLabel(r.p.language)}</span> },
                { key: "region", header: "Régions", width: 90,
                  render: (r) => <span className="inline-flex items-center gap-1.5"><Flag code={r.p.region} size={16} /><span className="type-label">{r.p.region}</span></span> },
                { key: "tags", header: "Tags", width: 120,
                  render: () => <button type="button" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 rounded-full px-2 py-1 type-caption font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"><PlusIcon className="h-3.5 w-3.5" />Tag</button> },
                { key: "platforms", header: "Plateformes", width: 150,
                  render: () => <PlatformTiles platforms={setup.platforms} /> },
              ]}
            />
            </div>
          </div>
        </div>
      </div>

      {/* Barre d'actions groupées — suppression */}
      {selected.size > 0 && typeof document !== "undefined" && createPortal(
        <div className="fixed bottom-6 left-1/2 z-[200] flex -translate-x-1/2 items-center gap-1 rounded-2xl px-2 py-2 shadow-[var(--shadow-floating)]" style={{ backgroundColor: "var(--floating-bar-bg)" }}>
          <span className="px-3 type-body-strong" style={{ color: "var(--floating-bar-text)", opacity: 0.5 }}>{selected.size} sélectionné{selected.size > 1 ? "s" : ""}</span>
          <div className="h-4 w-px" style={{ backgroundColor: "var(--floating-bar-sep)" }} />
          <button onClick={deleteSelected} className="flex items-center gap-2 rounded-xl px-3 py-1.5 type-body-strong transition-colors hover:bg-[var(--floating-bar-hover)]" style={{ color: "var(--floating-bar-text)" }}>
            <TrashIcon className="h-4 w-4" />Supprimer
          </button>
          <div className="h-4 w-px" style={{ backgroundColor: "var(--floating-bar-sep)" }} />
          <button onClick={clearSel} aria-label="Désélectionner" className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-[var(--floating-bar-hover)]" style={{ color: "var(--floating-bar-text)" }}>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>,
        document.body,
      )}

      {addModalOpen && (
        <AddPromptModal setup={setup} lists={lists} tags={PROMPT_TAGS} onCreate={createFromModal} onClose={() => setAddModalOpen(false)} />
      )}

      {addTopicOpen && (
        <AddTopicModal onCreate={createTopic} onClose={() => setAddTopicOpen(false)} />
      )}
    </div>
    </div>
    </div>,
    document.body,
  );
}

function TopicRow({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors ${active ? "bg-[var(--accent-primary-soft)]" : "hover:bg-[var(--bg-subtle)]"}`}>
      <span className={`flex-1 truncate type-label ${active ? "text-[var(--accent-primary)]" : "text-[var(--text-primary)]"}`}>{label}</span>
      <Pill color="var(--text-muted)" bg="var(--bg-subtle)">{count}</Pill>
    </button>
  );
}

function PlatformTiles({ platforms }: { platforms: LlmPlatform[] }) {
  return (
    <span className="flex items-center gap-1">
      {platforms.map((pk) => (
        <span key={pk} title={PLATFORM_LABEL(pk)} className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-[var(--bg-subtle)]">
          <Favicon domain={PLATFORM_DOMAIN(pk)} size={14} />
        </span>
      ))}
    </span>
  );
}
