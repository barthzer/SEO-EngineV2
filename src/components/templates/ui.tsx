"use client";

/**
 * Briques présentationnelles partagées de la feature Templates de Workflow :
 * mapping des icônes (clé → composant), pills de tags, badge de visibilité.
 * Réutilise le recipe DS des pills teintées (color-mix 14 %).
 */

import type { ElementType } from "react";
import {
  ClipboardDocumentCheckIcon,
  ShoppingCartIcon,
  RectangleGroupIcon,
  ArrowPathIcon,
  SparklesIcon,
  ScaleIcon,
  CubeIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import {
  type TemplateTag,
  type TemplateVisibility,
  TAG_META,
  VISIBILITY_META,
} from "@/data/templates";

/** Résout la clé d'icône d'un template vers un composant Heroicon. */
const TEMPLATE_ICONS: Record<string, ElementType> = {
  audit: ClipboardDocumentCheckIcon,
  cart: ShoppingCartIcon,
  cluster: RectangleGroupIcon,
  refresh: ArrowPathIcon,
  sparkles: SparklesIcon,
  scale: ScaleIcon,
  package: CubeIcon,
};

export function templateIcon(key: string): ElementType {
  return TEMPLATE_ICONS[key] ?? DocumentTextIcon;
}

/**
 * Illustration « pile de documents » — reprend la composition de
 * `/blocs/optimiser.svg` (3 pages empilées), mais neutre : tuile grise (au lieu
 * du dégradé bleu) + icône passée en prop (au lieu du logo outil). Couleurs en
 * variables CSS → s'adapte automatiquement au thème clair/sombre.
 */
export function DocStackIllustration({ icon: Icon, className = "w-[200px]" }: { icon: ElementType; className?: string }) {
  return (
    <svg viewBox="0 0 239 214" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Page arrière droite (fond + ombre) */}
      <g style={{ filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.05))" }}>
        <rect width="77.4703" height="95.9958" rx="8" transform="matrix(-0.997877 -0.0651252 -0.0651252 0.997877 188.239 54.6108)" fill="var(--bg-primary)" />
        <rect x="-0.531501" y="0.466376" width="76.4703" height="94.9958" rx="7.5" transform="matrix(-0.997877 -0.0651252 -0.0651252 0.997877 187.207 54.5772)" stroke="var(--border-subtle)" />
      </g>
      {/* Page arrière gauche (fond + ombre) */}
      <g style={{ filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.05))" }}>
        <rect x="50.511" y="54.6108" width="77.4703" height="95.9958" rx="8" transform="rotate(-3.73404 50.511 54.6108)" fill="var(--bg-primary)" />
        <rect x="51.0425" y="55.0772" width="76.4703" height="94.9958" rx="7.5" transform="rotate(-3.73404 51.0425 55.0772)" stroke="var(--border-subtle)" />
      </g>
      {/* Page avant (fond + ombre plus marquée) */}
      <g style={{ filter: "drop-shadow(0 14px 28px rgba(0,0,0,0.10))" }}>
        <rect x="71.7598" y="42" width="92" height="114" rx="8" fill="var(--bg-primary)" />
        <rect x="72.2598" y="42.5" width="91" height="113" rx="7.5" stroke="var(--border-subtle)" />
        {/* Tuile grise + icône */}
        <rect x="79.7598" y="50" width="29.843" height="29.843" rx="6" fill="var(--bg-subtle)" />
        <Icon x="83.68" y="53.92" width="22" height="22" style={{ color: "var(--text-muted)" }} />
        {/* Lignes de texte */}
        <rect x="79.7598" y="115.721" width="34.606" height="4.31973" rx="2.15987" fill="var(--bg-secondary)" />
        <rect x="79.7598" y="125.041" width="54.3088" height="4.31973" rx="2.15987" fill="var(--bg-secondary)" />
        <rect x="79.7598" y="134.361" width="34.606" height="4.31973" rx="2.15987" fill="var(--bg-secondary)" />
        <rect x="79.7598" y="143.68" width="54.3088" height="4.31973" rx="2.15987" fill="var(--bg-secondary)" />
      </g>
    </svg>
  );
}

/** Pill de tag — recipe DS (color-mix 14 %, pas de dot). */
export function TemplateTagPill({ tag }: { tag: TemplateTag }) {
  const color = TAG_META[tag].color;
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 type-micro"
      style={{ color, backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)` }}
    >
      {tag}
    </span>
  );
}

/** Badge de visibilité : Système AWi / Agence / Équipe / Perso. */
export function VisibilityBadge({ visibility }: { visibility: TemplateVisibility }) {
  const { label, color } = VISIBILITY_META[visibility];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 type-micro"
      style={{ color, backgroundColor: `color-mix(in oklab, ${color} 12%, transparent)` }}
    >
      {label}
    </span>
  );
}
