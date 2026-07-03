"use client";

/**
 * NewBriefModal — modal for creating a new SEO analysis brief for a keyword.
 * Extracted verbatim from src/app/(app)/analyse/[domain]/page.tsx.
 */

import { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/Button";
import { InfoNote } from "@/components/InfoNote";
import { DropdownMenu, DropdownItem } from "@/components/DropdownMenu";
import { ModalShell, FormField, fieldCls } from "./shared";

const PAGE_TYPES = [
  { value: "auto",     label: "Auto-détection (recommandé)" },
  { value: "category", label: "Page catégorie (e-commerce)" },
  { value: "product",  label: "Fiche produit" },
  { value: "blog",     label: "Article de blog" },
  { value: "service",  label: "Page service / prestation" },
  { value: "landing",  label: "Landing page" },
  { value: "guide",    label: "Guide / tutoriel" },
  { value: "faq",      label: "FAQ" },
  { value: "home",     label: "Page d'accueil" },
  { value: "other",    label: "Autre" },
];

const LANGS = [
  { value: "fr", label: "Français" },
  { value: "en", label: "Anglais" },
];

/** Select DS : déclencheur type input + panneau flottant DropdownMenu (single-select). */
function DsSelect({ value, options, onChange }: { value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  const current = options.find((o) => o.value === value);
  return (
    <DropdownMenu
      matchTrigger
      trigger={
        <button type="button" className={`${fieldCls} flex cursor-pointer items-center justify-between gap-2 text-left`}>
          <span className="truncate">{current?.label ?? "Sélectionner"}</span>
          <ChevronDownIcon className="h-4 w-4 flex-shrink-0 text-[var(--text-muted)]" />
        </button>
      }
    >
      {options.map((o) => (
        <DropdownItem key={o.value} selected={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </DropdownItem>
      ))}
    </DropdownMenu>
  );
}

export function NewBriefModal({ onClose, initialKeyword = "" }: { onClose: () => void; initialKeyword?: string }) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [lang, setLang] = useState("fr");
  const [pageType, setPageType] = useState("auto");

  return (
    <ModalShell onClose={onClose}>
      <h2 className="pr-10 font-semibold tracking-tight text-[var(--text-primary)]">Créer une analyse SEO</h2>
      <p className="mt-1 text-[13px] text-[var(--text-muted)]">Générez une analyse complète pour un nouveau contenu (mot-clé sans page existante)</p>
      <div className="mt-6 flex flex-col gap-4">
        <FormField label="Mot-clé cible" required>
          <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="ex : meilleur aspirateur sans fil" autoFocus className={fieldCls} />
        </FormField>
        <FormField label="Langue">
          <DsSelect value={lang} options={LANGS} onChange={setLang} />
        </FormField>
        <FormField label="Type de page souhaité">
          <DsSelect value={pageType} options={PAGE_TYPES} onChange={setPageType} />
        </FormField>
        <InfoNote>
          L'analyse couvrira la SERP et générera : intention de recherche, structure recommandée, thématiques à couvrir, Top 3 concurrents.
        </InfoNote>
      </div>
      <div className="mt-6 flex items-center justify-end gap-3">
        <button onClick={onClose} className="rounded-full px-4 py-2 text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">Annuler</button>
        <Button disabled={!keyword.trim()} onClick={onClose}>
          Générer l&apos;analyse
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </ModalShell>
  );
}
