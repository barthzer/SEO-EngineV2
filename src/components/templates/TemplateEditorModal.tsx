"use client";

/**
 * TemplateEditorModal — création / modification d'un template.
 *
 * Un template est, pour le consultant, un fichier Markdown de prompt : nom +
 * description courte + classification légère (visibilité / type de page / tags)
 * + un gros corps Markdown (le prompt, avec variables {…} insérables).
 * Les champs structurés (structure Hn, checklist GEO, steps) ne sont pas
 * édités ici : un nouveau template part sur des valeurs par défaut, un template
 * existant conserve les siennes — seul le prompt et les métadonnées changent.
 */

import { useLayoutEffect, useRef, useState } from "react";
import { ChevronDownIcon, ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/Button";
import { DropdownMenu, DropdownItem } from "@/components/DropdownMenu";
import { ModalShell, FormField, fieldCls } from "@/components/analyse/modals/shared";
import {
  type WorkflowTemplate,
  type TemplateTag,
  type TemplateVisibility,
  type TemplatePageType,
  PAGE_TYPE_LABEL,
  VISIBILITY_META,
  TAG_META,
  TEMPLATE_VARS,
} from "@/data/templates";

const ALL_TAGS = Object.keys(TAG_META) as TemplateTag[];
const EDITABLE_VIS: TemplateVisibility[] = ["perso", "equipe", "agence"];
const PAGE_TYPES = Object.keys(PAGE_TYPE_LABEL) as TemplatePageType[];

/** Corps Markdown par défaut (nouveau template, ou template existant sans prompt). */
function defaultMarkdown(t?: WorkflowTemplate): string {
  if (t?.content) return t.content;
  const name = t?.name?.trim() || "Nouveau template";
  const desc = t?.description?.trim() || "Décris ici l'objectif de ce template.";
  const stepLines = t?.steps?.length
    ? t.steps.map((s) => `- ${s.prompt ?? s.label}`).join("\n")
    : "- Décris l'intention de recherche à couvrir sur {keyword_principal}.\n- Liste les thématiques et entités à traiter.\n- Précise le format answer-first et les sources à citer.";
  return `# ${name}

${desc}

## Contexte
Rédige un contenu de type « ${t ? PAGE_TYPE_LABEL[t.pageType] : "à définir"} » optimisé SEO + GEO pour le mot-clé **{keyword_principal}**.

## Instructions
${stepLines}

## Contraintes
- Ton : {brand_voice}
- Couvre les entités cibles : {entites_cibles}
- Année de référence : {annee}
`;
}

/** Select DS (déclencheur input + DropdownMenu). */
function DsSelect({ value, label, options, onChange, width }: { value: string; label: string; options: { value: string; label: string }[]; onChange: (v: string) => void; width?: number }) {
  return (
    <DropdownMenu
      matchTrigger
      width={width}
      trigger={
        <button type="button" className={`${fieldCls} flex cursor-pointer items-center justify-between gap-2 text-left`}>
          <span className="truncate">{label}</span>
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

/* ── Éditeur de prompt à jetons (variables = pills atomiques dans le texte) ──
   contenteditable : le texte se saisit normalement, les variables {…} sont des
   pills `contenteditable=false` (donc supprimées d'un seul retour arrière). On
   sérialise le DOM vers la chaîne Markdown `{var}` pour l'enregistrement. */

const VAR_KEYS = new Set(TEMPLATE_VARS.map((v) => v.key));
const PILL_CLS =
  "mx-[1px] inline-flex items-center rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card-static)] px-1.5 py-[1px] align-middle font-mono text-[11px] text-[var(--text-secondary)]";

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Chaîne Markdown → HTML (texte échappé + pills pour les variables connues). */
function markdownToHtml(value: string): string {
  const parts = value.split(/(\{[a-zA-Z0-9_]+\})/g);
  return parts
    .map((p) => {
      const m = p.match(/^\{([a-zA-Z0-9_]+)\}$/);
      if (m && VAR_KEYS.has(m[1])) {
        return `<span data-var="${m[1]}" contenteditable="false" class="${PILL_CLS}">{${m[1]}}</span>`;
      }
      return escapeHtml(p).replace(/\n/g, "<br>");
    })
    .join("");
}

/** DOM de l'éditeur → chaîne Markdown (`{var}` pour les pills, \n pour les <br>). */
function serialize(root: Node): string {
  let out = "";
  root.childNodes.forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE) out += n.nodeValue ?? "";
    else if (n.nodeType === Node.ELEMENT_NODE) {
      const el = n as HTMLElement;
      if (el.dataset.var) out += `{${el.dataset.var}}`;
      else if (el.tagName === "BR") out += "\n";
      else out += serialize(el) + (/^(DIV|P)$/.test(el.tagName) ? "\n" : "");
    }
  });
  return out;
}

function makePill(key: string): HTMLSpanElement {
  const span = document.createElement("span");
  span.dataset.var = key;
  span.contentEditable = "false";
  span.className = PILL_CLS;
  span.textContent = `{${key}}`;
  return span;
}

function PromptEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  // Contenu initial posé une seule fois (éditeur non-contrôlé → curseur stable).
  useLayoutEffect(() => {
    if (ref.current) ref.current.innerHTML = markdownToHtml(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sync = () => { if (ref.current) onChange(serialize(ref.current)); };

  const insertVariable = (key: string) => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    let range: Range;
    if (sel && sel.rangeCount > 0 && el.contains(sel.anchorNode)) range = sel.getRangeAt(0);
    else { range = document.createRange(); range.selectNodeContents(el); range.collapse(false); }
    range.deleteContents();
    const pill = makePill(key);
    const space = document.createTextNode(" ");
    range.insertNode(space);
    range.insertNode(pill);
    // Curseur après l'espace qui suit la pill.
    const after = document.createRange();
    after.setStartAfter(space);
    after.collapse(true);
    sel?.removeAllRanges();
    sel?.addRange(after);
    sync();
  };

  return (
    <div>
      {/* Barre de variables insérables */}
      <div className="mb-2 flex flex-wrap gap-1.5">
        {TEMPLATE_VARS.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => insertVariable(v.key)}
            title={`${v.label} — ${v.source}`}
            className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card-static)] px-2 py-1 font-mono type-micro text-[var(--text-secondary)] transition-colors hover:border-[var(--border-medium)] hover:text-[var(--text-primary)]"
          >
            {`{${v.key}}`}
          </button>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={sync}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); document.execCommand("insertLineBreak"); sync(); }
        }}
        className={`${fieldCls} max-h-[46vh] min-h-[240px] resize-none overflow-y-auto whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed`}
      />
    </div>
  );
}

export function TemplateEditorModal({
  template,
  onSave,
  onClose,
}: {
  /** Template à modifier ; absent = création. */
  template?: WorkflowTemplate | null;
  onSave: (t: WorkflowTemplate) => void;
  onClose: () => void;
}) {
  const isEdit = !!template;
  const [name, setName] = useState(template?.name ?? "");
  const [description, setDescription] = useState(template?.description ?? "");
  const [visibility, setVisibility] = useState<TemplateVisibility>(template?.visibility && EDITABLE_VIS.includes(template.visibility) ? template.visibility : "perso");
  const [pageType, setPageType] = useState<TemplatePageType>(template?.pageType ?? "generique");
  const [tags, setTags] = useState<TemplateTag[]>(template?.tags ?? []);
  const [content, setContent] = useState(defaultMarkdown(template ?? undefined));
  // Étape 1 = métadonnées, étape 2 = prompt Markdown.
  const [step, setStep] = useState<1 | 2>(1);

  const toggleTag = (t: TemplateTag) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const canNext = name.trim().length > 0;
  const canSave = name.trim().length > 0 && content.trim().length > 0;

  function save() {
    const base: WorkflowTemplate = template ?? {
      id: `perso-${Date.now()}`,
      name: "",
      description: "",
      icon: "sparkles",
      tags: [],
      author: "Vous",
      visibility: "perso",
      contexts: ["from_scratch", "from_url_analysis"],
      pageType: "generique",
      structure: [],
      params: { tone: "Neutre & expert", length: "Long", llm: "claude-sonnet" },
      geo: { entities: [], sources: [], questions: [], semanticDensity: 0 },
      steps: [],
      usageCount: 0,
      updatedAt: new Date().toISOString(),
      version: 1,
    };
    onSave({
      ...base,
      name: name.trim(),
      description: description.trim(),
      visibility,
      pageType,
      tags,
      content: content.trim(),
      updatedAt: new Date().toISOString(),
    });
    onClose();
  }

  return (
    <ModalShell onClose={onClose} maxWidth={720}>
      <h2 className="pr-10 type-h2">{isEdit ? "Modifier le template" : "Nouveau template"}</h2>
      <p className="mt-1 type-body-sm">
        {step === 1
          ? "Étape 1 · Informations — nom, classification et tags."
          : "Étape 2 · Prompt — le contenu Markdown, avec variables résolues à la génération."}
      </p>

      {/* Stepper */}
      <div className="mt-4 flex items-center gap-2">
        {[1, 2].map((s) => (
          <div key={s} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${s <= step ? "bg-[var(--text-primary)]" : "bg-[var(--border-subtle)]"}`} />
        ))}
      </div>

      <div className="mt-6 flex max-h-[calc(100vh-280px)] flex-col gap-4 overflow-y-auto pr-1">
        {step === 1 ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Nom" required>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="ex : Page pilier GEO" autoFocus className={fieldCls} />
              </FormField>
              <FormField label="Visibilité">
                <DsSelect
                  value={visibility}
                  label={VISIBILITY_META[visibility].label}
                  options={EDITABLE_VIS.map((v) => ({ value: v, label: VISIBILITY_META[v].label }))}
                  onChange={(v) => setVisibility(v as TemplateVisibility)}
                />
              </FormField>
            </div>

            <FormField label="Description">
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="À quoi sert ce template, en une phrase." className={fieldCls} />
            </FormField>

            <FormField label="Type de page">
              <DsSelect
                value={pageType}
                label={PAGE_TYPE_LABEL[pageType]}
                options={PAGE_TYPES.map((p) => ({ value: p, label: PAGE_TYPE_LABEL[p] }))}
                onChange={(v) => setPageType(v as TemplatePageType)}
              />
            </FormField>

            <FormField label="Tags">
              <div className="flex flex-wrap gap-1.5">
                {ALL_TAGS.map((t) => {
                  const on = tags.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTag(t)}
                      className={`rounded-full border px-2.5 py-1 type-caption transition-colors ${on ? "border-transparent bg-[var(--text-primary)] text-[var(--bg-primary)]" : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-medium)]"}`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </FormField>
          </>
        ) : (
          <FormField label="Prompt (Markdown)" required>
            <PromptEditor value={content} onChange={setContent} />
          </FormField>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        {step === 2 ? (
          <button onClick={() => setStep(1)} className="inline-flex items-center gap-1 rounded-full px-4 py-2 type-label text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
            <ChevronLeftIcon className="h-4 w-4" />
            Retour
          </button>
        ) : (
          <button onClick={onClose} className="rounded-full px-4 py-2 type-label text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">Annuler</button>
        )}
        {step === 1 ? (
          <Button disabled={!canNext} onClick={() => setStep(2)}>
            Continuer
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        ) : (
          <Button disabled={!canSave} onClick={save}>{isEdit ? "Enregistrer" : "Créer le template"}</Button>
        )}
      </div>
    </ModalShell>
  );
}
