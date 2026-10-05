"use client";

/**
 * RiskConfirmModal — confirmation quand une recommandation coûteuse ou irréversible
 * est marquée comme décidée (ou passée « En cours »). Rappelle ce qui ne pourra pas
 * être défait et la preuve sur laquelle l'outil s'appuie. Annuler / Confirmer.
 *
 * `useRiskGate()` : branche la confirmation sur n'importe quel changement de statut.
 *   const { gate, modal } = useRiskGate();
 *   gate({ risk, title }, needsConfirm, () => apply());   // + {modal} dans le rendu
 */

import { useState, type ReactNode } from "react";
import { Button } from "@/components/Button";
import { InfoNote } from "@/components/InfoNote";
import { RiskBadge } from "@/components/RiskBadge";
import { ModalShell } from "@/components/analyse/modals/shared";
import { RISK_CFG, isRisky, type RiskInfo } from "@/data/risk";

export type RiskConfirmContent = {
  risk: RiskInfo;
  /** Intitulé de la recommandation. */
  title: string;
  /** Pages ou éléments concernés (optionnel). */
  items?: { label: string; meta?: string }[];
};

export function RiskConfirmModal({ risk, title, items, onCancel, onConfirm }: RiskConfirmContent & {
  onCancel: () => void; onConfirm: () => void;
}) {
  if (!isRisky(risk)) return null;
  const irreversible = risk.level === "irreversible";
  return (
    <ModalShell onClose={onCancel} maxWidth={480}>
      <div className="mb-3"><RiskBadge level={risk.level} tooltip={false} /></div>
      <h3 className="mb-1.5 type-h3">Confirmer cette décision ?</h3>
      <p className="mb-5 type-body-sm text-[var(--text-primary)]">{title}</p>

      <p className="mb-1.5 type-caption">{irreversible ? "Ce qui ne pourra pas être défait" : "Ce qui se défera mal"}</p>
      <p className="mb-5 type-body-sm leading-relaxed">{risk.undo ?? RISK_CFG[risk.level].desc}</p>

      {items && items.length > 0 && (
        <>
          <p className="mb-1.5 type-caption">{items.length > 1 ? "Éléments concernés" : "Élément concerné"}</p>
          <div className="mb-5 flex flex-col divide-y divide-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)]">
            {items.map((it) => (
              <div key={it.label} className="flex items-center justify-between gap-4 px-4 py-3">
                <span className="min-w-0 truncate font-mono text-[12px] text-[var(--text-primary)]" title={it.label}>{it.label}</span>
                {it.meta && <span className="flex-shrink-0 type-caption tabular-nums text-[var(--text-secondary)]">{it.meta}</span>}
              </div>
            ))}
          </div>
        </>
      )}

      {risk.evidence && (
        <>
          <p className="mb-1.5 type-caption">Sur quoi s&apos;appuie la recommandation</p>
          <InfoNote className="mb-6">{risk.evidence}</InfoNote>
        </>
      )}

      <div className={`flex justify-end gap-2 ${risk.evidence ? "" : "mt-1"}`}>
        <Button variant="secondary" size="md" onClick={onCancel}>Annuler</Button>
        <Button variant={irreversible ? "danger" : "primary"} size="md" onClick={onConfirm}>Confirmer</Button>
      </div>
    </ModalShell>
  );
}

/** Garde de confirmation réutilisable : `gate(content, needsConfirm, apply)` exécute
 *  `apply` directement, ou après confirmation si la recommandation est risquée. */
export function useRiskGate(): {
  gate: (content: Omit<RiskConfirmContent, "risk"> & { risk?: RiskInfo | null }, needsConfirm: boolean, apply: () => void) => void;
  modal: ReactNode;
} {
  const [req, setReq] = useState<{ content: RiskConfirmContent; apply: () => void } | null>(null);
  const gate = (content: Omit<RiskConfirmContent, "risk"> & { risk?: RiskInfo | null }, needsConfirm: boolean, apply: () => void) => {
    if (needsConfirm && isRisky(content.risk)) setReq({ content: { ...content, risk: content.risk }, apply });
    else apply();
  };
  const modal = req ? (
    <RiskConfirmModal
      {...req.content}
      onCancel={() => setReq(null)}
      onConfirm={() => { req.apply(); setReq(null); }}
    />
  ) : null;
  return { gate, modal };
}
