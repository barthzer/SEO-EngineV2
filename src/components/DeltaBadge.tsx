"use client";

import { VariationPill } from "@/components/VariationPill";

interface DeltaBadgeProps {
  value: number | string;
  positiveIsGood?: boolean;
  /** Conservé pour compat — sans effet (VariationPill affiche toujours le triangle). */
  showIcon?: boolean;
  className?: string;
}

/**
 * DeltaBadge — variation chiffrée (KPI, etc.).
 *
 * Délègue désormais à `VariationPill` (triangle + texte, SANS fond) pour
 * normaliser tous les indicateurs de variance de l'app. On garde ici la
 * logique `isGood` : la DIRECTION du triangle (et donc la couleur) suit le
 * caractère bénéfique de la variation, pas seulement le signe.
 * Ex. Position : delta −2 (passe #12 → #10) = amélioration → triangle ↑ vert.
 */
export function DeltaBadge({ value, positiveIsGood = true, className = "" }: DeltaBadgeProps) {
  const cleaned = typeof value === "string" ? value.replace(/[−–]/g, "-").replace(/,/g, ".") : String(value);
  const num = parseFloat(cleaned);
  const isPositive = num > 0;
  const isNeutral = num === 0 || Number.isNaN(num);
  const isGood = positiveIsGood ? isPositive : !isPositive;

  const direction = isNeutral ? "neutral" : isGood ? "up" : "down";
  const display = typeof value === "string" ? value : `${isPositive ? "+" : ""}${value}`;

  return (
    <VariationPill direction={direction} className={className}>
      {display}
    </VariationPill>
  );
}
