"use client";

/**
 * Contenu de prévisualisation d'un template (rendu dans le Drawer DS latéral).
 * Affiche, sans jamais exposer la plomberie technique : métadonnées, squelette
 * éditorial Hn, paramètres de génération, checklist GEO et workflow d'actions.
 */

import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/Button";
import { IconBadge } from "@/components/IconBadge";
import {
  type WorkflowTemplate,
  PAGE_TYPE_LABEL,
  CONTEXT_LABEL,
  LLM_LABEL,
} from "@/data/templates";
import { templateIcon, TemplateTagPill, VisibilityBadge } from "@/components/templates/ui";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2.5 type-label font-semibold text-[var(--text-primary)]">{title}</p>
      {children}
    </div>
  );
}

function MetaField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="type-micro">{label}</p>
      <p className="mt-0.5 type-label text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

const LEVEL_INDENT: Record<string, string> = { h1: "", h2: "pl-4", h3: "pl-8" };

export function TemplatePreviewContent({
  template,
  onUse,
}: {
  template: WorkflowTemplate;
  onUse: (t: WorkflowTemplate) => void;
}) {
  const Icon = templateIcon(template.icon);
  const geo = template.geo;
  const hasGeo =
    geo.entities.length > 0 || geo.sources.length > 0 || geo.questions.length > 0 || geo.semanticDensity > 0;

  return (
    <div className="flex flex-col gap-7">
      {/* En-tête */}
      <div>
        <div className="flex items-start gap-3">
          <IconBadge icon={Icon} size="lg" />
          <div className="min-w-0 flex-1">
            <h2 className="type-h2">
              {template.name}
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <VisibilityBadge visibility={template.visibility} />
              {template.tags.map((t) => (
                <TemplateTagPill key={t} tag={t} />
              ))}
            </div>
          </div>
        </div>
        <p className="mt-3 type-body-sm">{template.description}</p>
        <Button variant="primary" className="mt-4 w-full justify-center" onClick={() => onUse(template)}>
          Utiliser ce template
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Métadonnées */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-2xl bg-[var(--bg-card-static)] p-4">
        <MetaField label="Type de page" value={PAGE_TYPE_LABEL[template.pageType]} />
        <MetaField label="Auteur" value={template.author} />
        <MetaField
          label="Contexte d'usage"
          value={template.contexts.map((c) => CONTEXT_LABEL[c]).join(" · ")}
        />
        <MetaField label="Modèle IA" value={LLM_LABEL[template.params.llm]} />
        <MetaField label="Utilisations" value={`${template.usageCount}`} />
        <MetaField label="Version" value={`v${template.version}`} />
      </div>

      {/* Structure éditoriale */}
      <Section title="Structure éditoriale">
        <div className="flex flex-col gap-1">
          {template.structure.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-2.5 rounded-xl px-3 py-2 ${LEVEL_INDENT[n.level]}`}
            >
              <span className="mt-0.5 flex-shrink-0 rounded-md border border-[var(--border-subtle)] px-1.5 py-0.5 type-micro font-semibold uppercase">
                {n.level}
              </span>
              <div className="min-w-0">
                <p className="type-label text-[var(--text-primary)]">{n.title}</p>
                <p className="type-caption">{n.hint}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Paramètres de génération */}
      <Section title="Paramètres de génération">
        <div className="flex flex-col gap-2 rounded-2xl border border-[var(--border-subtle)] p-4">
          <div className="flex items-center justify-between">
            <span className="type-caption">Ton</span>
            <span className="type-label text-[var(--text-primary)]">{template.params.tone}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="type-caption">Longueur cible</span>
            <span className="type-label text-[var(--text-primary)]">{template.params.length}</span>
          </div>
          {template.params.brandVoice && (
            <div className="flex items-center justify-between">
              <span className="type-caption">Brand voice</span>
              <span className="type-label text-[var(--text-primary)]">{template.params.brandVoice}</span>
            </div>
          )}
        </div>
      </Section>

      {/* Checklist GEO */}
      {hasGeo && (
        <Section title="Checklist GEO">
          <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border-subtle)] p-4">
            {geo.semanticDensity > 0 && (
              <div className="flex items-center justify-between">
                <span className="type-caption">Densité sémantique cible</span>
                <span className="type-label font-semibold text-[var(--text-primary)]">
                  {geo.semanticDensity}%
                </span>
              </div>
            )}
            {geo.entities.length > 0 && (
              <div>
                <p className="mb-1.5 type-caption">Entités à couvrir</p>
                <div className="flex flex-wrap gap-1.5">
                  {geo.entities.map((e) => (
                    <span
                      key={e}
                      className="rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 type-micro text-[var(--text-secondary)]"
                    >
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {geo.questions.length > 0 && (
              <div>
                <p className="mb-1 type-caption">Questions answer-first</p>
                <ul className="flex flex-col gap-1">
                  {geo.questions.map((q) => (
                    <li key={q} className="type-body-sm text-[var(--text-primary)]">
                      · {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {geo.sources.length > 0 && (
              <div>
                <p className="mb-1 type-caption">Sources à citer</p>
                <p className="type-body-sm text-[var(--text-primary)]">{geo.sources.join(", ")}</p>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Workflow */}
      <Section title={`Workflow · ${template.steps.length} étapes`}>
        <div className="flex flex-col gap-2">
          {template.steps.map((s, i) => (
            <div
              key={s.id}
              className="flex items-start gap-3 rounded-xl border border-[var(--border-subtle)] p-3"
            >
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--bg-subtle)] type-caption font-semibold text-[var(--text-secondary)]">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="type-label text-[var(--text-primary)]">{s.label}</p>
                {s.hint && <p className="mt-0.5 type-caption">{s.hint}</p>}
                {s.prompt && (
                  <p className="mt-1.5 rounded-lg bg-[var(--bg-subtle)] px-2.5 py-1.5 font-mono type-micro text-[var(--text-secondary)]">
                    {s.prompt}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
