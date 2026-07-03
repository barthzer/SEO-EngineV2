"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { ArrowDownTrayIcon, TagIcon, QueueListIcon, ArchiveBoxIcon, XMarkIcon, ChevronRightIcon, TrashIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { SearchInput } from "@/components/SearchInput";
import { FilterTabs } from "@/components/FilterTabs";
import { TableWide } from "@/components/TableWide";
import { DropdownMenu, DropdownItem, DropdownHeader } from "@/components/DropdownMenu";
import { enrichPrompts, PLATFORM_DOMAIN, PLATFORM_LABEL, type EnrichedPrompt } from "@/components/geo/analytics";
import type { GeoSetup, TopicList, Prompt, LlmPlatform, GeoFilters } from "@/components/geo/types";
import { CARD_SM, SentimentPill, visColor, VolumeBars, volumeLevel, RegionFlag, TagPill } from "@/components/geo/ui";
import { PromptModal } from "@/components/geo/PromptModal";
import { LotModal } from "@/components/geo/LotModal";
import { PromptDesigner } from "@/components/geo/PromptDesigner";

/** Tags mock proposés en action groupée + colonne Tag. */
const MOCK_TAGS = [
  { name: "Prioritaire",    color: "var(--color-danger)" },
  { name: "À surveiller",   color: "var(--color-warning)" },
  { name: "Concurrentiel",  color: "var(--accent-primary)" },
  { name: "Marque",         color: "var(--color-success)" },
];
const tagColorOf = (name: string) => MOCK_TAGS.find((t) => t.name === name)?.color ?? "var(--text-muted)";

const hashId = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
/** Tag par défaut déterministe (≈30% sans tag). */
const defaultTagName = (id: string) => { const h = hashId(id); return h % 10 < 3 ? "" : MOCK_TAGS[h % MOCK_TAGS.length].name; };

export function PromptsView({ setup, domain, filters, setFilter }: {
  setup: GeoSetup; domain: string; filters: GeoFilters; setFilter: (patch: Partial<GeoFilters>) => void;
}) {
  // Copie locale des listes (génération + actif/inactif).
  const [lists, setLists] = useState<TopicList[]>(() =>
    setup.lists.map((l) => ({ ...l, prompts: l.prompts.map((p) => ({ ...p })) })));
  const [mode] = useState<"prompts" | "lists">("prompts");
  const [status, setStatus] = useState<"actif" | "recommande" | "inactif">("actif");
  const [designerOpen, setDesignerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [modalPrompt, setModalPrompt] = useState<EnrichedPrompt | null>(null);
  const [selected, setSelected] = useState<Set<string | number>>(() => new Set());
  const [promptTags, setPromptTags] = useState<Record<string, string>>({});
  const tagOf = (id: string) => promptTags[id] ?? defaultTagName(id);
  const toggleRow = (k: string | number) =>
    setSelected((s) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const toggleAll = (keys: (string | number)[], allSelected: boolean) =>
    setSelected((s) => { const n = new Set(s); keys.forEach((k) => allSelected ? n.delete(k) : n.add(k)); return n; });
  const clearSelection = () => setSelected(new Set());

  // ── Vue « Listes » (lots) : sélection + ouverture du détail analytics ──
  const [detailLotId, setDetailLotId] = useState<string | null>(null);
  const [selectedLots, setSelectedLots] = useState<Set<string>>(() => new Set());
  const toggleLot = (id: string) =>
    setSelectedLots((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const clearLotSelection = () => setSelectedLots(new Set());
  function deleteSelectedLots() {
    setLists((ls) => ls.filter((l) => !selectedLots.has(l.id)));
    clearLotSelection();
  }

  // Actions groupées (sélection de prompts).
  function archiveSelected() {
    setLists((ls) => ls.map((l) => ({ ...l, prompts: l.prompts.map((p) => (selected.has(p.id) ? { ...p, active: false } : p)) })));
    clearSelection();
  }
  function addTagToSelected(tagName: string) {
    setPromptTags((prev) => { const next = { ...prev }; selected.forEach((id) => { next[String(id)] = tagName; }); return next; });
    clearSelection();
  }
  function moveSelectedToList(listId: string) {
    setLists((ls) => {
      const moved: Prompt[] = [];
      const without = ls.map((l) => ({ ...l, prompts: l.prompts.filter((p) => { if (selected.has(p.id)) { moved.push(p); return false; } return true; }) }));
      return without.map((l) => (l.id === listId ? { ...l, prompts: [...l.prompts, ...moved] } : l));
    });
    clearSelection();
  }

  const localSetup: GeoSetup = { ...setup, lists };
  const enriched = enrichPrompts(localSetup);

  // Statut d'un prompt : recommandé (proposition IA, ≈1/6), sinon actif / inactif.
  const statusOf = (id: string, active: boolean): "actif" | "recommande" | "inactif" =>
    hashId(id) % 6 === 0 ? "recommande" : active ? "actif" : "inactif";

  // Filtrage : statut (onglet) + filtres globaux (Modèles / Listes) + recherche locale.
  const filtered = enriched.filter((p) =>
    statusOf(p.id, p.active) === status &&
    (filters.lists.length === 0 || filters.lists.includes(p.listId)) &&
    (filters.platforms.length === 0 || filters.platforms.includes(p.platform)) &&
    (!search || p.text.toLowerCase().includes(search.toLowerCase())),
  );

  // Agrégats par lot (vue « Listes »), filtrés par la recherche locale (sur le nom).
  const filteredLots = lists.filter((l) => !search || l.name.toLowerCase().includes(search.toLowerCase()));
  const lotStats = filteredLots.map((l) => {
    const ps = enriched.filter((p) => p.listId === l.id);
    const positions = ps.map((p) => p.position).filter((x): x is number => x != null);
    return {
      lot: l,
      count: ps.length,
      volume: ps.reduce((s, p) => s + p.volume, 0),
      avgVis: ps.length ? Math.round(ps.reduce((s, p) => s + p.visibility, 0) / ps.length) : 0,
      avgPos: positions.length ? Math.round((positions.reduce((s, x) => s + x, 0) / positions.length) * 10) / 10 : null,
    };
  });
  const lotKeys = filteredLots.map((l) => l.id);
  const allLotsSelected = lotKeys.length > 0 && lotKeys.every((k) => selectedLots.has(k));
  const someLotsSelected = lotKeys.some((k) => selectedLots.has(k));
  const toggleAllLots = () =>
    setSelectedLots((s) => { const n = new Set(s); lotKeys.forEach((k) => allLotsSelected ? n.delete(k) : n.add(k)); return n; });

  function exportCsv() {
    const platforms = setup.platforms.map((p) => PLATFORM_LABEL(p)).join(" / ");
    const header = ["Prompt", "Plateformes", "Visibilité", "Sentiment", "Position", "Mentions", "Région", "Langue"];
    const rows = filtered.map((p) => [p.text, platforms, `${p.visibility}%`, p.sentiment ?? "", p.position ?? "", p.mentions, p.region, p.language.toUpperCase()]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = `prompts-${domain}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const table = (
    <div className={`overflow-hidden ${CARD_SM}`}>
      <TableWide<EnrichedPrompt>
        hidePagination
        selectable
        stickyLeft
        minWidth={1440}
        selected={selected}
        onToggleRow={toggleRow}
        onToggleAll={toggleAll}
        rowKey={(p) => p.id}
        data={filtered}
        onRowClick={(p) => setModalPrompt(p)}
        emptyState={<div className="px-7 py-10 text-center text-[14px] text-[var(--text-muted)]">Aucun prompt pour ce filtre.</div>}
        columns={[
          { key: "text", header: "Prompt", width: 300,
            render: (p) => <span className={`block truncate text-[14px] font-semibold ${p.active ? "text-[var(--text-primary)]" : ""}`}>{p.text}</span> },
          { key: "vis", header: "Visibilité", width: 96, sortable: true, sortValue: (p) => p.visibility,
            render: (p) => <span className="text-[13px] font-semibold tabular-nums" style={{ color: visColor(p.visibility) }}>{p.visibility}%</span> },
          { key: "sent", header: "Sentiment", width: 110,
            render: (p) => <SentimentPill value={p.sentiment} /> },
          { key: "pos", header: "Position", width: 88,
            render: (p) => <span className="text-[13px] tabular-nums text-[var(--text-secondary)]">{p.position ?? "—"}</span> },
          { key: "men", header: "Mentions", width: 92,
            render: (p) => <span className="text-[13px] tabular-nums text-[var(--text-secondary)]">{p.mentions}</span> },
          { key: "vol", header: "Volume", width: 92, sortable: true, sortValue: (p) => p.volume,
            render: (p) => <VolumeBars level={volumeLevel(p.volume)} /> },
          { key: "tag", header: "Tag", width: 130,
            render: (p) => { const t = tagOf(p.id); return t ? <TagPill name={t} color={tagColorOf(t)} /> : <span className="text-[13px] text-[var(--text-muted)]">—</span>; } },
          { key: "list", header: "Liste", width: 140,
            render: (p) => <span className="inline-flex items-center rounded-full bg-[var(--bg-subtle)] px-2.5 py-1 text-[12px] font-medium text-[var(--text-secondary)]">{p.listName}</span> },
          { key: "loc", header: "Localisation", width: 100,
            render: (p) => <RegionFlag code={p.region} /> },
          { key: "plat", header: "Plateformes", width: 150,
            render: () => <PlatformTiles platforms={setup.platforms} /> },
        ]}
      />
    </div>
  );

  // Vue « Listes » : un lot par ligne (façon onboarding), check à gauche, clic → détail analytics.
  const lotTable = (
    <div className={`overflow-hidden ${CARD_SM}`}>
      <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-card-static)] px-4 py-2.5 text-[12px] font-medium text-[var(--text-muted)]">
        <Checkbox checked={allLotsSelected} indeterminate={someLotsSelected && !allLotsSelected} onChange={toggleAllLots} />
        <span className="flex-1">Liste</span>
        <span className="w-[84px] text-right">Prompts</span>
        <span className="w-[96px] text-right">Volume</span>
        <span className="w-[96px] text-right">Visibilité</span>
        <span className="w-[96px] text-right">Position</span>
        <span className="w-4 flex-shrink-0" />
      </div>
      {lotStats.length === 0 ? (
        <div className="px-7 py-10 text-center text-[14px] text-[var(--text-muted)]">Aucune liste.</div>
      ) : (
        lotStats.map(({ lot, count, volume, avgVis, avgPos }, i) => (
          <div key={lot.id} role="button" tabIndex={0}
            onClick={() => setDetailLotId(lot.id)}
            onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); setDetailLotId(lot.id); } }}
            className={`group flex cursor-pointer items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--bg-card-hover-flat)] ${i < lotStats.length - 1 ? "border-b border-[var(--border-subtle)]" : ""}`}>
            <div onClick={(e) => e.stopPropagation()}>
              <Checkbox checked={selectedLots.has(lot.id)} onChange={() => toggleLot(lot.id)} />
            </div>
            <span className="flex-1 truncate text-[14px] font-semibold text-[var(--text-primary)]">{lot.name}</span>
            <span className="w-[84px] text-right text-[13px] tabular-nums text-[var(--text-secondary)]">{count}</span>
            <span className="w-[96px] text-right text-[13px] tabular-nums text-[var(--text-secondary)]">{volume.toLocaleString("fr-FR")}</span>
            <span className="w-[96px] text-right text-[13px] font-semibold tabular-nums" style={{ color: visColor(avgVis) }}>{avgVis}%</span>
            <span className="w-[96px] text-right text-[13px] tabular-nums text-[var(--text-secondary)]">{avgPos ?? "—"}</span>
            <ChevronRightIcon className="h-4 w-4 flex-shrink-0 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5" />
          </div>
        ))
      )}
    </div>
  );

  // Gestion des prompts — interface plein écran (Prompt Designer).
  if (designerOpen) {
    return <PromptDesigner setup={setup} lists={lists} setLists={setLists} onClose={() => setDesignerOpen(false)} />;
  }

  // Détail d'un lot — ouvert dans une modale (drawer) par-dessus la table des listes.
  const detailLot = detailLotId ? lists.find((l) => l.id === detailLotId) : null;

  return (
    <div className="flex flex-col gap-3">
      {/* Tab Prompts / Listes + actions */}
      <div className="flex items-center justify-between gap-3">
        <FilterTabs<"actif" | "recommande" | "inactif">
          tabs={[{ key: "actif", label: "Actif" }, { key: "recommande", label: "Recommandé" }, { key: "inactif", label: "Inactif" }]}
          value={status}
          onChange={setStatus}
        />
        <div className="flex items-center gap-2">
          <Button size="md" variant="secondary" onClick={exportCsv}><ArrowDownTrayIcon className="h-4 w-4" />Exporter</Button>
          <Button size="md" onClick={() => setDesignerOpen(true)}><Cog6ToothIcon className="h-4 w-4" />Gérer les prompts</Button>
        </div>
      </div>

      {/* Recherche + compteur (les filtres Période/Modèle/Liste/Concurrent sont dans la barre globale) */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-full max-w-[260px]">
          <SearchInput value={search} onChange={setSearch} placeholder={mode === "lists" ? "Rechercher une liste…" : "Rechercher un prompt…"} alwaysExpanded />
        </div>
        <span className="ml-auto flex-shrink-0 text-[12px] text-[var(--text-muted)]">
          {mode === "lists" ? `${filteredLots.length} liste${filteredLots.length > 1 ? "s" : ""}` : `${filtered.length} prompts`}
        </span>
      </div>

      {/* Corps : table plate (Prompts) ou table par lot cliquable (Listes) */}
      {mode === "lists" ? lotTable : table}

      {modalPrompt && <PromptModal prompt={modalPrompt} prompts={filtered} setup={localSetup} domain={domain} onNavigate={setModalPrompt} onClose={() => setModalPrompt(null)} />}

      {detailLot && <LotModal lot={detailLot} lots={filteredLots} setup={localSetup} domain={domain} onNavigate={(l) => setDetailLotId(l.id)} onClose={() => setDetailLotId(null)} />}

      {/* Barre d'actions groupées — visible quand des prompts sont sélectionnés */}
      {mode === "prompts" && selected.size > 0 && typeof document !== "undefined" && createPortal(
        <div className="fixed bottom-6 left-1/2 z-[200] flex -translate-x-1/2 items-center gap-1 rounded-2xl px-2 py-2 shadow-[var(--shadow-floating)]"
          style={{ backgroundColor: "var(--floating-bar-bg)" }}>
          <span className="px-3 text-[14px] font-medium" style={{ color: "var(--floating-bar-text)", opacity: 0.5 }}>
            {selected.size} sélectionné{selected.size > 1 ? "s" : ""}
          </span>
          <div className="h-4 w-px" style={{ backgroundColor: "var(--floating-bar-sep)" }} />

          {/* Ajouter un tag */}
          <DropdownMenu upward width="auto"
            trigger={
              <button className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-[14px] font-medium transition-colors hover:bg-[var(--floating-bar-hover)]" style={{ color: "var(--floating-bar-text)" }}>
                <TagIcon className="h-4 w-4" />Ajouter un tag
              </button>
            }>
            <DropdownHeader>Choisir un tag</DropdownHeader>
            {MOCK_TAGS.map((t) => (
              <DropdownItem key={t.name} onClick={() => addTagToSelected(t.name)}>
                <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: t.color }} />{t.name}
              </DropdownItem>
            ))}
          </DropdownMenu>

          {/* Ajouter à une liste */}
          <DropdownMenu upward width="auto"
            trigger={
              <button className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-[14px] font-medium transition-colors hover:bg-[var(--floating-bar-hover)]" style={{ color: "var(--floating-bar-text)" }}>
                <QueueListIcon className="h-4 w-4" />Ajouter à une liste
              </button>
            }>
            <DropdownHeader>Choisir une liste</DropdownHeader>
            {lists.map((l) => (
              <DropdownItem key={l.id} onClick={() => moveSelectedToList(l.id)}>{l.name}</DropdownItem>
            ))}
          </DropdownMenu>

          <div className="h-4 w-px" style={{ backgroundColor: "var(--floating-bar-sep)" }} />

          {/* Archiver */}
          <button onClick={archiveSelected}
            className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-[14px] font-medium transition-colors hover:bg-[var(--floating-bar-hover)]" style={{ color: "var(--floating-bar-text)" }}>
            <ArchiveBoxIcon className="h-4 w-4" />Archiver
          </button>

          <div className="h-4 w-px" style={{ backgroundColor: "var(--floating-bar-sep)" }} />

          {/* Fermer */}
          <button onClick={clearSelection} aria-label="Désélectionner tout"
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-[var(--floating-bar-hover)]" style={{ color: "var(--floating-bar-text)" }}>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>,
        document.body,
      )}

      {/* Barre d'actions groupées — listes sélectionnées */}
      {mode === "lists" && selectedLots.size > 0 && typeof document !== "undefined" && createPortal(
        <div className="fixed bottom-6 left-1/2 z-[200] flex -translate-x-1/2 items-center gap-1 rounded-2xl px-2 py-2 shadow-[var(--shadow-floating)]"
          style={{ backgroundColor: "var(--floating-bar-bg)" }}>
          <span className="px-3 text-[14px] font-medium" style={{ color: "var(--floating-bar-text)", opacity: 0.5 }}>
            {selectedLots.size} liste{selectedLots.size > 1 ? "s" : ""} sélectionnée{selectedLots.size > 1 ? "s" : ""}
          </span>
          <div className="h-4 w-px" style={{ backgroundColor: "var(--floating-bar-sep)" }} />
          <button onClick={deleteSelectedLots}
            className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-[14px] font-medium transition-colors hover:bg-[var(--floating-bar-hover)]" style={{ color: "var(--floating-bar-text)" }}>
            <TrashIcon className="h-4 w-4" />Supprimer
          </button>
          <div className="h-4 w-px" style={{ backgroundColor: "var(--floating-bar-sep)" }} />
          <button onClick={clearLotSelection} aria-label="Désélectionner tout"
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-[var(--floating-bar-hover)]" style={{ color: "var(--floating-bar-text)" }}>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>,
        document.body,
      )}
    </div>
  );
}

/* ── Tuiles de plateformes (icônes sur encart gris, façon Profound) ────── */

function PlatformTiles({ platforms }: { platforms: LlmPlatform[] }) {
  return (
    <span className="flex items-center gap-1">
      {platforms.map((pk) => (
        <span key={pk} title={PLATFORM_LABEL(pk)}
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-[var(--bg-subtle)]">
          <img src={`https://www.google.com/s2/favicons?domain=${PLATFORM_DOMAIN(pk)}&sz=64`} alt="" width={14} height={14}
            className="h-3.5 w-3.5 rounded-sm" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
        </span>
      ))}
    </span>
  );
}

