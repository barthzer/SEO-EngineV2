"use client";

/**
 * AddPromptModal — modale de création de prompt(s) dans la gestion des prompts.
 * Deux onglets : « Ajouter un prompt » (un prompt + compteur 200) et
 * « Import en masse » (une ligne = un prompt). Champs : sujet, zone géographique,
 * tags. Inspiré de l'écran Peec AI.
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PlusIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/Button";
import { Flag } from "@/components/Flag";
import { DropdownMenu, DropdownItem, DropdownHeader } from "@/components/DropdownMenu";
import { TagPill } from "@/components/geo/ui";
import { REGIONS, type GeoSetup, type TopicList } from "@/components/geo/types";

export type CreatePromptArgs = { texts: string[]; topicId: string | null; region: string; tagNames: string[] };

/* Déclencheur rectangulaire type « champ select » (comme la Location de Peec). */
function SelectTrigger({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-2.5 text-[14px] text-[var(--text-primary)] transition-colors hover:border-[var(--border-medium)]"
    >
      <span className="flex min-w-0 items-center gap-2 truncate">{children}</span>
      <ChevronUpDownIcon className="h-4 w-4 flex-shrink-0 text-[var(--text-muted)]" />
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-[var(--text-secondary)]">{label}</span>
      {children}
    </label>
  );
}

export function AddPromptModal({ setup, lists, tags, onCreate, onClose }: {
  setup: GeoSetup;
  lists: TopicList[];
  tags: { name: string; color: string }[];
  onCreate: (args: CreatePromptArgs) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"single" | "bulk">("single");
  const [text, setText] = useState("");
  const [bulk, setBulk] = useState("");
  const [topicId, setTopicId] = useState<string | null>(null);
  const [region, setRegion] = useState(setup.regions[0] ?? "FR");
  const [selTags, setSelTags] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const regionLabel = REGIONS.find((r) => r.code === region)?.label ?? region;
  const topicLabel = topicId ? (lists.find((l) => l.id === topicId)?.name ?? "Aucun sujet") : "Aucun sujet";
  const canAdd = (tab === "single" ? text.trim() : bulk.trim()).length > 0;
  const toggleTag = (name: string) =>
    setSelTags((s) => { const n = new Set(s); n.has(name) ? n.delete(name) : n.add(name); return n; });

  function submit() {
    const texts = tab === "single"
      ? [text.trim()].filter(Boolean)
      : bulk.split("\n").map((s) => s.trim()).filter(Boolean);
    if (!texts.length) return;
    onCreate({ texts, topicId, region, tagNames: [...selTags] });
    onClose();
  }

  if (typeof document === "undefined") return null;

  const tab_ = (key: "single" | "bulk", label: string) => (
    <button
      type="button"
      onClick={() => setTab(key)}
      className={`flex-1 rounded-lg px-4 py-2 text-[14px] font-medium transition-colors ${
        tab === key ? "bg-[var(--bg-card)] text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      }`}
    >
      {label}
    </button>
  );

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Onglets */}
        <div className="flex gap-1 rounded-xl bg-[var(--bg-subtle)] p-1 m-4 mb-0">
          {tab_("single", "Ajouter un prompt")}
          {tab_("bulk", "Import en masse")}
        </div>

        <div className="flex flex-col gap-5 px-6 py-5">
          <div>
            <p className="text-[16px] font-semibold text-[var(--text-primary)]">
              {tab === "single" ? "Ajouter un prompt" : "Import en masse"}
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-secondary)]">
              Créez un prompt concurrentiel sans mentionner votre propre marque. Chaque ligne devient un prompt distinct.
            </p>
          </div>

          {/* Prompt / bulk */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[13px] font-medium text-[var(--text-secondary)]">
                {tab === "single" ? "Prompt" : "Prompts (un par ligne)"}
              </span>
              {tab === "single" && <span className="text-[12px] tabular-nums text-[var(--text-muted)]">{text.length}/200</span>}
            </div>
            {tab === "single" ? (
              <textarea
                value={text}
                maxLength={200}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                placeholder="Quelle est la meilleure agence SEO ?"
                className="w-full resize-y rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-2.5 text-[14px] leading-relaxed text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] focus:border-[var(--border-medium)]"
              />
            ) : (
              <textarea
                value={bulk}
                onChange={(e) => setBulk(e.target.value)}
                rows={6}
                placeholder={"Quelle est la meilleure agence SEO ?\nQuel outil pour suivre sa visibilité IA ?\nComment être cité par ChatGPT ?"}
                className="w-full resize-y rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-2.5 text-[14px] leading-relaxed text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] focus:border-[var(--border-medium)]"
              />
            )}
          </div>

          {/* Sujet */}
          <Field label="Sujet">
            <DropdownMenu width={496} trigger={<SelectTrigger>{topicLabel}</SelectTrigger>}>
              <DropdownItem selected={topicId === null} onClick={() => setTopicId(null)}>Aucun sujet</DropdownItem>
              {lists.map((l) => (
                <DropdownItem key={l.id} selected={topicId === l.id} onClick={() => setTopicId(l.id)}>{l.name}</DropdownItem>
              ))}
            </DropdownMenu>
          </Field>

          {/* Zone géographique */}
          <Field label="Zone géographique">
            <DropdownMenu width={496} trigger={<SelectTrigger><Flag code={region} size={18} />{regionLabel}</SelectTrigger>}>
              {REGIONS.map((r) => (
                <DropdownItem key={r.code} selected={region === r.code} onClick={() => setRegion(r.code)}>
                  <span className="inline-flex items-center gap-2"><Flag code={r.code} size={16} />{r.label}</span>
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Field>

          {/* Tags — multi-select */}
          <Field label="Tags">
            <DropdownMenu width={496} trigger={
              <SelectTrigger>
                {selTags.size > 0
                  ? <span className="truncate">{[...selTags].join(", ")}</span>
                  : <span className="text-[var(--text-muted)]">Sélectionner des tags</span>}
              </SelectTrigger>
            }>
              <DropdownHeader>Tags pour les nouveaux prompts</DropdownHeader>
              {tags.map((t) => (
                <DropdownItem key={t.name} checkbox keepOpen selected={selTags.has(t.name)} onClick={() => toggleTag(t.name)}>
                  <TagPill name={t.name} color={t.color} />
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Field>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-[var(--border-subtle)] px-6 py-4">
          <Button variant="secondary" size="md" onClick={onClose}>Annuler</Button>
          <Button size="md" onClick={submit} disabled={!canAdd}>
            <PlusIcon className="h-4 w-4" />
            Ajouter{tab === "bulk" && canAdd ? ` (${bulk.split("\n").map((s) => s.trim()).filter(Boolean).length})` : ""}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
