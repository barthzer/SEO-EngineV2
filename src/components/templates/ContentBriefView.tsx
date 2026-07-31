"use client";

/**
 * Écran D — Génération du brief / draft de contenu (inspiré de Profound « Content »,
 * adapté au DS). Trois phases :
 *   - brief       : le brief structuré est prêt (workflow 9/9), CTA « Créer le draft final »
 *   - generating  : rédaction en cours (skeleton + progression du workflow qui tourne)
 *   - final        : draft final rédigé (workflow 3/3), CTA « Demander des modifications »
 *
 * Panneau droit : progression temps réel du workflow (étapes + check / spinner).
 * V1 : maquette (données mock + timers). Persistance = tâche future.
 */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon, ArrowPathIcon,
  ClipboardIcon, ArrowDownTrayIcon, CheckIcon, ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/Button";
import { InfoNote } from "@/components/InfoNote";
import { IconBadge } from "@/components/IconBadge";
import { templateIcon } from "@/components/templates/ui";
import { type WorkflowTemplate } from "@/data/templates";

type Phase = "brief" | "generating" | "final";

const BRIEF_STEPS = [
  "Démarrage du workflow", "Collecte des citations", "Recherche Perplexity", "Résultats de recherche",
  "Analyse de la recherche", "Extraction du plan", "Construction du brief", "Ajout des métadonnées", "Workflow terminé",
];
const DRAFT_STEPS = ["Démarrage du workflow", "Rédaction du contenu", "Workflow terminé"];

/* ── Blocs de document (mock) — chaque bloc porte son label de structure (gouttière) ── */
type Block = (
  | { tag: "h1"; text: string }
  | { tag: "h2"; text: string }
  | { tag: "p"; text: string; bold?: boolean; italic?: boolean }
  | { tag: "ul"; items: string[] }
  | { tag: "ul-lead"; items: { lead: string; rest: string }[] }
) & {
  /** Mode optimisation : true si ce bloc a été ajouté / réécrit (surligné en vert). */
  added?: boolean;
};

function briefBlocks(title: string): Block[] {
  return [
    { tag: "h1", text: title },
    { tag: "h2", text: "Comment nous avons sélectionné et classé" },
    { tag: "p", text: "Énoncé de valeur :", bold: true },
    { tag: "p", text: "Expliquer les critères utilisés pour évaluer et classer les agences, en soulignant l'importance des taux de conversion et du responsive design pour le succès business." },
    { tag: "p", text: "Contenu principal :", bold: true },
    { tag: "ul", items: [
      "Discuter de l'importance de la preuve de conversion et des budgets de performance comme critères de classement.",
      "Examiner le rôle de l'expertise sur les dashboards responsive dans l'expérience utilisateur.",
      "Analyser l'importance de l'accessibilité et de la maturité du design system.",
    ] },
    { tag: "p", text: "Preuves :", bold: true },
    { tag: "ul", items: [
      "« Les sites responsive obtiennent 11 % de conversions en plus » [1].",
      "« Les sites optimisés mobile peuvent voir jusqu'à 40 % de conversions en plus » [3].",
      "« Accessibilité et design systems améliorent l'engagement et la conversion » [3].",
    ] },
    { tag: "p", text: "Couverture de mots-clés : preuve de conversion, budgets de performance, responsive design, accessibilité, design systems, agences web.", italic: true },
    { tag: "h2", text: "#1 Concierge de sélection d'experts" },
    { tag: "p", text: "Énoncé de valeur :", bold: true },
    { tag: "p", text: "Présenter le top pick pour le développement d'apps responsive, en soulignant en quoi ce choix soutient une conversion élevée." },
  ];
}

function finalBlocks(title: string): Block[] {
  return [
    { tag: "h1", text: title },
    // Intro réécrite → ajoutée
    { tag: "p", text: "En 2025, choisir le bon partenaire de développement web est crucial pour créer des applications responsive qui excellent en performance et en conversion, les mobiles représentant plus de 63 % du trafic web mondial.", added: true },
    { tag: "h2", text: "Comment nous avons sélectionné et classé" },
    { tag: "p", text: "Notre méthodologie d'évaluation se concentre sur les agences qui démontrent un impact business mesurable via le responsive design et l'optimisation de la conversion. Le classement considère plusieurs facteurs critiques directement liés au succès des projets et à la création de valeur long terme." },
    { tag: "p", text: "Critères d'évaluation clés :" },
    // Liste d'entités enrichie → ajoutée
    { tag: "ul-lead", added: true, items: [
      { lead: "Preuve de conversion", rest: " : les sites responsive obtiennent 11 % de conversions en plus. Nous avons examiné les portfolios pour des améliorations documentées, surtout les sites mobile-first pouvant atteindre +40 %." },
      { lead: "Budgets de performance", rest: " : 1 seconde de délai de chargement peut causer 7 % de baisse de conversion. Les agences classées excellent en optimisation et monitoring du temps de chargement." },
      { lead: "Expertise dashboards responsive", rest: " : nous avons évalué la capacité à créer des interfaces complexes et ergonomiques sur tous les appareils, avec une architecture de l'information solide et un design mobile-first." },
      { lead: "Accessibilité et maturité du design system", rest: " : nous avons cherché des preuves de conformité WCAG et des design systems complets qui renforcent l'engagement et la conversion." },
    ] },
    // Nouvelle section (FAQ / answer-first) → ajoutée
    { tag: "h2", text: "Questions fréquentes", added: true },
    { tag: "p", text: "Comment choisir une agence de développement web responsive ? Privilégiez les preuves de conversion documentées, des budgets de performance stricts et une maturité du design system.", added: true },
  ];
}

/** Regroupe les blocs consécutifs par statut ajouté/inchangé (pour l'encart vert du mode optimisation). */
function groupBlocks(blocks: Block[]): { added: boolean; blocks: Block[] }[] {
  const groups: { added: boolean; blocks: Block[] }[] = [];
  for (const b of blocks) {
    const last = groups[groups.length - 1];
    if (last && last.added === !!b.added) last.blocks.push(b);
    else groups.push({ added: !!b.added, blocks: [b] });
  }
  return groups;
}

/* Rendu d'un bloc avec label de structure dans la gouttière (façon éditeur Profound). */
function DocBlock({ block }: { block: Block }) {
  const gutter = (l: string) => <span className="w-8 flex-shrink-0 select-none pt-1.5 text-right type-micro text-[var(--text-input)]">{l}</span>;
  if (block.tag === "h1") {
    return <div className="flex gap-4">{gutter("h1")}<h1 className="type-h1 font-bold leading-tight">{block.text}</h1></div>;
  }
  if (block.tag === "h2") {
    return <div className="flex gap-4">{gutter("h2")}<h2 className="mt-2 type-h2">{block.text}</h2></div>;
  }
  if (block.tag === "p") {
    return (
      <div className="flex gap-4">{gutter("p")}
        <p className={`type-body ${block.bold ? "font-semibold text-[var(--text-primary)]" : block.italic ? "italic text-[var(--text-secondary)]" : "text-[var(--text-secondary)]"}`}>{block.text}</p>
      </div>
    );
  }
  if (block.tag === "ul") {
    return (
      <div className="flex gap-4">{gutter("ul")}
        <ul className="flex flex-col gap-2">
          {block.items.map((it, i) => (
            <li key={i} className="flex gap-2.5 type-body text-[var(--text-secondary)]">
              <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-[var(--text-muted)]" />{it}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <div className="flex gap-4">{gutter("ul")}
      <ul className="flex flex-col gap-2.5">
        {block.items.map((it, i) => (
          <li key={i} className="flex gap-2.5 type-body text-[var(--text-secondary)]">
            <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-[var(--text-muted)]" />
            <span><span className="font-semibold text-[var(--text-primary)]">{it.lead}</span>{it.rest}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ContentBriefView({
  template,
  title,
  optimize = false,
}: {
  template: WorkflowTemplate;
  title: string;
  /** Mode optimisation (contenu généré depuis les actions d'une analyse) :
   *  surligne en vert clair les blocs ajoutés/réécrits dans le draft final. */
  optimize?: boolean;
}) {
  const router = useRouter();
  const TemplateIcon = templateIcon(template.icon);

  const [phase, setPhase] = useState<Phase>("brief");
  const [genStep, setGenStep] = useState(0); // 0..3 pendant la génération
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function createFinalDraft() {
    setPhase("generating");
    setGenStep(0);
    timers.current = [
      setTimeout(() => setGenStep(1), 1600),
      setTimeout(() => setGenStep(2), 3200),
      setTimeout(() => setGenStep(3), 4200),
      setTimeout(() => setPhase("final"), 4400),
    ];
  }
  function requestChanges() {
    timers.current.forEach(clearTimeout);
    setPhase("brief");
  }

  // Étapes + progression du panneau droit selon la phase.
  const steps = phase === "brief" ? BRIEF_STEPS : DRAFT_STEPS;
  const doneCount = phase === "brief" ? BRIEF_STEPS.length : phase === "final" ? DRAFT_STEPS.length : genStep;
  const runningIdx = phase === "generating" && genStep < DRAFT_STEPS.length ? genStep : -1;
  const pct = Math.round((doneCount / steps.length) * 100);

  const blocks = phase === "final" ? finalBlocks(title) : briefBlocks(title);

  return (
    <div className="page-enter flex h-full flex-col overflow-hidden">
      {/* ── Barre supérieure ── */}
      <div className="flex flex-shrink-0 items-center gap-3 border-b border-[var(--border-subtle)] px-6 py-3">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 type-body-strong text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
          <ChevronLeftIcon className="h-4 w-4" />
          Retour
        </button>
        <span className="mx-1 h-4 w-px bg-[var(--border-subtle)]" />
        <p className="min-w-0 flex-1 truncate type-body-strong" title={title}>{title}</p>
        <span className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-[var(--color-success-bg)] px-2.5 py-1 type-caption text-[var(--color-success)]">
          <CheckIcon className="h-3.5 w-3.5" />
          Document enregistré
        </span>
        <span className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border border-[var(--border-subtle)] px-2.5 py-1 type-caption text-[var(--text-secondary)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-warning)]" />
          Brouillon
        </span>
        <Button variant="secondary" size="sm"><ClipboardIcon className="h-4 w-4" />Copier</Button>
        <Button variant="secondary" size="sm"><ArrowDownTrayIcon className="h-4 w-4" />Exporter<ChevronDownIcon className="h-3.5 w-3.5 text-[var(--text-muted)]" /></Button>
      </div>

      {/* ── Corps : document (gauche) + workflow (droite) ── */}
      <div className="flex min-h-0 flex-1">
        {/* Document */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[760px] px-8 py-8">
            {/* Encart de phase */}
            {phase === "brief" && (
              <div className="mb-9 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card-static)] p-6">
                <div className="flex items-center gap-2.5">
                  <IconBadge icon={TemplateIcon} size="sm" />
                  <h2 className="type-h3">Brief de contenu</h2>
                  <span className="type-caption text-[var(--text-muted)]">1 / 2 étapes</span>
                </div>
                <p className="mt-3 type-body">Vous avez choisi le modèle <span className="font-semibold">{template.name}</span></p>
                <p className="mt-0.5 type-body-sm">Le brief structuré ci-dessous a été construit à partir des pages les plus citées. Générez le draft final quand vous êtes prêt.</p>
                <Button variant="primary" size="sm" className="mt-4" onClick={createFinalDraft}>
                  Créer le draft final
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            )}
            {phase === "final" && (
              <div className="mb-9 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card-static)] p-6">
                <div className="flex items-center gap-2.5">
                  <CheckCircleIcon className="h-5 w-5 text-[var(--color-success)]" />
                  <h2 className="type-h3">Draft final</h2>
                </div>
                <p className="mt-3 type-body">Rédigé avec le modèle <span className="font-semibold">{template.name}</span></p>
                <p className="mt-0.5 type-body-sm">Relisez le contenu, ajustez-le dans l'éditeur, puis exportez ou demandez une nouvelle passe.</p>
                <Button variant="secondary" size="sm" className="mt-4" onClick={requestChanges}>
                  <ArrowPathIcon className="h-4 w-4" />
                  Demander des modifications
                </Button>
              </div>
            )}

            {/* Contenu du document */}
            {phase === "generating" ? (
              <div className="flex flex-col gap-8">
                <div>
                  <h1 className="type-h1 font-bold text-[var(--text-muted)]">Réinvention des données de votre site</h1>
                  <p className="mt-2 type-body-strong text-[var(--text-secondary)]">Ce process peut prendre entre 5 et 10 minutes.</p>
                </div>
                {[["85%", "70%", "60%"], ["78%", "72%", "66%", "55%"], ["74%", "62%"]].map((group, gi) => (
                  <div key={gi} className="flex flex-col gap-3">
                    {group.map((w, i) => <span key={i} className="skeleton h-3.5 rounded-full" style={{ width: w }} />)}
                  </div>
                ))}
              </div>
            ) : optimize && phase === "final" ? (
              /* Mode optimisation : les blocs ajoutés/réécrits sont regroupés dans un encart vert clair. */
              <div className="flex flex-col gap-5">
                {groupBlocks(blocks).map((g, gi) =>
                  g.added ? (
                    <div key={gi} className="flex flex-col gap-4 rounded-xl bg-[var(--color-success-bg)] py-4 pl-2 pr-4">
                      <span className="ml-12 w-fit type-micro text-[var(--color-success)]">
                        Nouveau
                      </span>
                      {g.blocks.map((b, i) => <DocBlock key={i} block={b} />)}
                    </div>
                  ) : (
                    <div key={gi} className="flex flex-col gap-5">
                      {g.blocks.map((b, i) => <DocBlock key={i} block={b} />)}
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {blocks.map((b, i) => <DocBlock key={i} block={b} />)}
              </div>
            )}
          </div>
        </div>

        {/* Panneau Workflow */}
        <aside className="flex w-[360px] flex-shrink-0 flex-col overflow-hidden border-l border-[var(--border-subtle)]">
          {/* Onglets — pleine largeur (chaque tab flex-1) */}
          <div className="flex flex-shrink-0 border-b border-[var(--border-subtle)]">
            {["Workflow", "Historique", "AEO"].map((t, i) => (
              <button key={t} className={`relative flex h-12 flex-1 items-center justify-center type-body-strong transition-colors ${i === 0 ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}>
                {t}
                {i === 0 && <span className="pointer-events-none absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-[var(--text-primary)]" />}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            {/* Progression */}
            <div className="mb-2 flex items-center justify-between">
              <span className="type-label font-semibold text-[var(--text-primary)]">Progression du workflow</span>
              <span className="type-caption tabular-nums text-[var(--text-muted)]">{doneCount}/{steps.length} terminé{doneCount > 1 ? "s" : ""}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
              <div className="h-full rounded-full bg-[var(--color-success)] transition-[width] duration-500" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-2 flex items-center justify-between type-caption">
              <span className="tabular-nums text-[var(--text-muted)]">{pct}%</span>
              {runningIdx >= 0 && (
                <span className="inline-flex items-center gap-1.5 font-medium text-[var(--text-secondary)]">
                  <ArrowPathIcon className="h-3.5 w-3.5 animate-spin text-[var(--accent-primary)]" />
                  En cours : {steps[runningIdx]}
                </span>
              )}
            </div>

            {/* Étapes — un encart par étape, statut à droite */}
            <div className="mt-5 flex flex-col gap-1.5">
              {steps.map((s, i) => {
                const done = i < doneCount;
                const running = i === runningIdx;
                return (
                  <div key={s} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-static)] px-3.5 py-2.5">
                    <span className={`type-body-sm ${done || running ? "font-medium text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>{s}</span>
                    {done ? (
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-success)] text-white"><CheckIcon className="h-3 w-3" strokeWidth={3} /></span>
                    ) : running ? (
                      <ArrowPathIcon className="h-4 w-4 flex-shrink-0 animate-spin text-[var(--accent-primary)]" />
                    ) : (
                      <span className="h-4 w-4 flex-shrink-0 rounded-full border-[1.5px] border-[var(--border-medium)]" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Note — encart DS InfoNote */}
            <div className="mt-4">
              <InfoNote>Suivez la progression du workflow en temps réel. Les étapes terminées passent au vert ; l&apos;étape en cours est indiquée par un spinner.</InfoNote>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
