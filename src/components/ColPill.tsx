"use client";

import type { ReactNode } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { DropdownMenu, DropdownItem, DropdownHeader, useDropdownClose } from "@/components/DropdownMenu";

interface ColPillProps {
  label: string;
  active: boolean;
  /** Nom statique du filtre (utilisé dans le header du dropdown : "Filtrer par {name}").
   *  Fallback sur `label` — mais idéalement le label peut être dynamique (afficher la valeur sélectionnée)
   *  alors que `name` doit rester fixe (ex. "Tag", "Origine"). */
  name?: string;
  /** Simple list mode — provide items + value + onChange */
  items?: { value: string; label: string }[];
  value?: string;
  onChange?: (v: string) => void;
  /** Custom render mode — provide a children function that receives a close() */
  children?: (close: () => void) => ReactNode;
  /** Largeur du panneau dropdown (défaut : 240 en mode custom, 200 en mode liste). */
  width?: number;
}

/**
 * Pill de filtre utilisée en toolbar (à côté d'une SearchInput, etc.).
 * Hauteur h-9 (36px) pour matcher SearchInput et Button md.
 * - État neutre : texte muted, hover bg-subtle.
 * - État actif : bg-subtle + text-primary (filtre appliqué).
 * Délègue à `DropdownMenu` pour le panneau (bg blurry + shadow-floating, design unifié).
 */
export function ColPill({ label, active, name, items, value, onChange, children, width }: ColPillProps) {
  const titleName = (name ?? label).toLowerCase();
  const trigger = (
    <button
      type="button"
      className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 type-label text-[var(--text-primary)] transition-colors ${
        active
          ? "border-[var(--border-medium)] bg-[var(--bg-subtle)]"
          : "border-[var(--border-subtle)] hover:border-[var(--border-medium)] hover:bg-[var(--bg-subtle)]"
      }`}
    >
      {label}
      <ChevronDownIcon className="h-3.5 w-3.5 flex-shrink-0" />
    </button>
  );

  // Mode children custom (slider, range…) : on injecte close via le contexte DropdownMenu.
  if (children) {
    return (
      <DropdownMenu trigger={trigger} width={width ?? 240}>
        <ColPillCustomBody>{children}</ColPillCustomBody>
      </DropdownMenu>
    );
  }

  // Mode liste — DropdownHeader DS (title 13px + séparateur full-width intégré) + DropdownItem
  return (
    <DropdownMenu trigger={trigger} width={200}>
      <DropdownHeader>Filtrer par {titleName}</DropdownHeader>
      {items!.map((item) => (
        <DropdownItem
          key={item.value}
          selected={value === item.value}
          onClick={() => onChange!(item.value)}
        >
          {item.label}
        </DropdownItem>
      ))}
    </DropdownMenu>
  );
}

function ColPillCustomBody({ children }: { children: (close: () => void) => ReactNode }) {
  const close = useDropdownClose();
  return <>{children(close)}</>;
}
