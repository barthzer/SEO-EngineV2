"use client";

/**
 * RiskBadge — niveau de risque d'une recommandation (voir `src/data/risk.ts`).
 * Échelle jaune → orange → rouge : rien pour « réversible » (cas courant),
 * orange pour « coûteuse », rouge plus marqué pour « irréversible ». Tooltip : pourquoi ça se défait mal.
 */

import { CircleAlert, TriangleAlert } from "lucide-react";
import { Tooltip } from "@/components/Tooltip";
import { RISK_CFG, RISK_COLORS, type RiskLevel } from "@/data/risk";

export function RiskBadge({ level, undo, tooltip = true }: { level: RiskLevel; undo?: string; tooltip?: boolean }) {
  if (level === "reversible") return null;
  const cfg = RISK_CFG[level];
  const c = RISK_COLORS[level];
  // Coûteuse = orange, irréversible = rouge (plus marqué : graisse + icône d'alerte).
  const badge = (
    <span
      className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 type-micro ${level === "irreversible" ? "font-semibold" : "font-medium"}`}
      style={{ color: c.color, backgroundColor: c.bg }}
    >
      {level === "irreversible" ? <TriangleAlert className="h-3 w-3" /> : <CircleAlert className="h-3 w-3" />}
      {cfg.label}
    </span>
  );
  if (!tooltip) return badge;
  return (
    <Tooltip portal rich side="top" label={
      <div className="flex flex-col gap-1">
        <p className="font-semibold">{level === "irreversible" ? "Action irréversible" : "Action coûteuse à défaire"}</p>
        <p className="opacity-75">{undo ?? cfg.desc}</p>
      </div>
    }>
      <span className="inline-flex cursor-default">{badge}</span>
    </Tooltip>
  );
}

