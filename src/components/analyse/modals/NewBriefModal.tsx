"use client";

/**
 * NewBriefModal — modal for creating a new SEO analysis brief for a keyword.
 * Extracted verbatim from src/app/(app)/analyse/[domain]/page.tsx.
 */

import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";
import { Button } from "@/components/Button";
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
          <div className="relative">
            <select value={lang} onChange={(e) => setLang(e.target.value)} className={`${fieldCls} appearance-none cursor-pointer pr-9`}>
              <option value="fr">Français</option>
              <option value="en">Anglais</option>
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          </div>
        </FormField>
        <FormField label="Type de page souhaité">
          <div className="relative">
            <select value={pageType} onChange={(e) => setPageType(e.target.value)} className={`${fieldCls} appearance-none cursor-pointer pr-9`}>
              {PAGE_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          </div>
        </FormField>
        <div className="flex gap-2.5 rounded-2xl bg-[var(--bg-secondary)] p-3.5">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 flex-shrink-0" aria-hidden>
            <circle cx="8" cy="8" r="7" stroke="var(--text-muted)" strokeWidth="1.5" />
            <rect x="7.25" y="6.5" width="1.5" height="5" rx="0.75" fill="var(--text-muted)" />
            <rect x="7.25" y="4" width="1.5" height="1.5" rx="0.75" fill="var(--text-muted)" />
          </svg>
          <p className="text-[12px] leading-relaxed text-[var(--text-muted)]">
            L'analyse couvrira la SERP et générera : intention de recherche, structure recommandée, thématiques à couvrir, Top 3 concurrents.
          </p>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-3">
        <button onClick={onClose} className="rounded-full px-4 py-2 text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">Annuler</button>
        <Button disabled={!keyword.trim()} onClick={onClose}>
          <SparklesIcon className="h-4 w-4" />
          Générer l'analyse
        </Button>
      </div>
    </ModalShell>
  );
}
