"use client";

/**
 * CreationView — onglet "Créer du contenu" (tab=creation), groupe Actions.
 *
 * Deux entrées de création seulement, en plein écran, contenu centré : soit
 * "from scratch" (mot-clé + type de page → analyse SERP, structure et maillage),
 * soit à partir d'un template (process éprouvé). Grande illustration + titre +
 * description centrés, features au survol du « i ». Les blocs Optimiser / Pages
 * manquantes / GEO vivent ailleurs (Vue d'ensemble, onglets dédiés).
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tooltip } from "@/components/Tooltip";
import { TemplateSelector } from "@/components/templates/TemplateSelector";

/** Bouton info (features) — épinglé au coin, ne déclenche pas le clic de la carte. */
function InfoTooltip({ features }: { features: string[] }) {
  return (
    <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
      <Tooltip
        side="top"
        rich
        portal
        label={
          <ul className="space-y-1.5">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-[12px] text-white/85">
                <span className="h-1 w-1 flex-shrink-0 rounded-full bg-white/50" />
                {f}
              </li>
            ))}
          </ul>
        }
      >
        <button
          type="button"
          className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M7.5 6.5v4M7.5 4.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      </Tooltip>
    </span>
  );
}

/** Grande carte de choix — plein écran, contenu centré, illustration agrandie. */
function ChoiceCard({
  illustration,
  title,
  description,
  features,
  onClick,
}: {
  illustration: string;
  title: string;
  description: string;
  features: string[];
  onClick: () => void;
}) {
  const illuDark = illustration.replace(/\.svg$/, "-dark.svg");
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="group/bloc relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-8 text-center transition-colors duration-200 hover:bg-[var(--bg-subtle)]"
    >
      <div className="absolute right-4 top-4 z-10">
        <InfoTooltip features={features} />
      </div>
      {/* Illustration agrandie — variante claire / sombre (swap via [data-theme]) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={illustration} alt="" className="bloc-illu-light pointer-events-none h-[300px] w-full max-w-[440px] object-contain" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={illuDark} alt="" className="bloc-illu-dark pointer-events-none h-[300px] w-full max-w-[440px] object-contain" />
      <h3 className="mt-6 text-[20px] font-semibold tracking-heading text-[var(--text-primary)]">{title}</h3>
      <p className="mt-2 max-w-md text-[14px] leading-relaxed text-[var(--text-secondary)]">{description}</p>
    </div>
  );
}

export function CreationView({ onNewBrief }: { domain: string; onNewBrief: () => void }) {
  const router = useRouter();
  const [selectorOpen, setSelectorOpen] = useState(false);

  return (
    <>
      <div className="grid min-h-[calc(100vh-170px)] grid-cols-1 gap-4 sm:auto-rows-fr sm:grid-cols-2">
        <ChoiceCard
          illustration="/blocs/from-scratch.svg"
          title="Créer from scratch"
          description="Mot-clé + type de page : analyse SERP automatique, structure et maillage cible générés."
          features={["Recherche de mots-clés", "Analyse IA complète", "Structure d'URL", "Maillage cible", "Calendrier éditorial"]}
          onClick={onNewBrief}
        />
        <ChoiceCard
          illustration="/blocs/optimiser.svg"
          title="Créer à partir d'un template"
          description="Démarrez sur un process éprouvé (audit, rewrite, cluster, GEO…) plutôt que sur une page blanche."
          features={["Templates système AWi", "Structure Hn pré-remplie", "Checklist GEO", "Workflow d'actions", "Variables auto-remplies"]}
          onClick={() => setSelectorOpen(true)}
        />
      </div>

      {selectorOpen && (
        <TemplateSelector
          context="from_scratch"
          subtitle="Pour créer une nouvelle page à partir d'un process éprouvé."
          onSelect={(t) => {
            setSelectorOpen(false);
            router.push(`/templates/configurer/${t.id}`);
          }}
          onClose={() => setSelectorOpen(false)}
        />
      )}
    </>
  );
}
