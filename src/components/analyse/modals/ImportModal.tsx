"use client";

/**
 * ImportModal — 3-step wizard to import GSC pages by keyword/typology/tree/quickwins.
 * Includes private helpers used exclusively by this modal:
 *   IMPORT_TYPES / ImportType, QUICK_WINS_OPTIONS, TYPOLOGY_OPTIONS,
 *   SEGMENT_INFO, SEGMENT_PRIORITY_INFO, INFO_ICON_SVG, InfoIcon, SegmentPill,
 *   MOCK_PAGES, TreeNode, SITE_TREE, TreeNodeItem.
 * Extracted verbatim from src/app/(app)/analyse/[domain]/page.tsx.
 */

import { useState, type ReactNode } from "react";
import {
  ChevronRightIcon,
  XMarkIcon,
  CheckIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  FolderOpenIcon,
  BoltIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/Button";
import { Tooltip } from "@/components/Tooltip";
import { AnimateIn } from "@/components/AnimateIn";
import { NumberInput } from "@/components/NumberInput";
import { Stepper } from "@/components/Stepper";

type ImportType = "keyword" | "typology" | "tree" | "quickwins";

const IMPORT_TYPES: { key: ImportType; icon: React.ElementType; label: string; desc: string }[] = [
  { key: "keyword",   icon: MagnifyingGlassIcon, label: "Par mot-clé",       desc: "Entrez un ou plusieurs mots-clés" },
  { key: "typology",  icon: Squares2X2Icon,      label: "Par typologie",      desc: "Articles, produits, blog…" },
  { key: "tree",      icon: FolderOpenIcon,      label: "Par arborescence",   desc: "Naviguez dans la structure du site" },
  { key: "quickwins", icon: BoltIcon,            label: "Quick Wins",         desc: "Sélectionnez une catégorie" },
];

const QUICK_WINS_OPTIONS = ["Top 10 articles", "Pages les moins visibles", "Meilleur CTR", "Fort potentiel", "Positions 11–20"];
const TYPOLOGY_OPTIONS   = ["Articles de blog", "Pages produits", "Pages catégories", "Landing pages", "Pages guides", "Pages FAQ"];
const SEGMENT_INFO: { label: string; info: ReactNode }[] = [
  {
    label: "Vache à lait",
    info: (
      <div className="space-y-2">
        <p className="font-semibold text-white">Vache à lait (Cash Cows)</p>
        <p className="text-white/70">Pages qui rapportent gros, à protéger.</p>
        <div className="space-y-0.5 text-white/80">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-white/40">Critères cumulatifs</p>
          <p>· Position ≤ 3 (Top 3 Google)</p>
          <p>· Clics ≥ 50 sur la période</p>
          <p>· &gt; 180 jours sans modif → flag "à rafraîchir"</p>
        </div>
        <p className="text-white/50 italic">Protéger · rafraîchir si vieillissant</p>
      </div>
    ),
  },
  {
    label: "Étoiles montantes",
    info: (
      <div className="space-y-2">
        <p className="font-semibold text-white">Étoiles montantes (Rising Stars)</p>
        <p className="text-white/70">Quick Wins — pages proches du Top 3.</p>
        <div className="space-y-0.5 text-white/80">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-white/40">Critères cumulatifs</p>
          <p>· Position 4–10 (page 1 hors Top 3)</p>
          <p>· Impressions ≥ 100</p>
          <p>· ≥ 2 positions gagnées vs N-1 → vraie Rising Star</p>
        </div>
        <p className="text-white/50 italic">Optimiser en priorité (fort ROI, faible effort)</p>
      </div>
    ),
  },
  {
    label: "En chute",
    info: (
      <div className="space-y-2">
        <p className="font-semibold text-white">En chute (Drops)</p>
        <p className="text-white/70">Pages qui perdent du trafic — urgent.</p>
        <div className="space-y-0.5 text-white/80">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-white/40">Critères (au moins un)</p>
          <p>· Clics ↓ ≥ 20 % vs N-1</p>
          <p>· Chute réelle : clics ↓ + position ↓ 3 places</p>
          <p>· Zero-click : clics ↓ mais position stable</p>
        </div>
        <p className="text-white/50 italic">Diagnostic technique/contenu urgent</p>
      </div>
    ),
  },
  {
    label: "Pages zombies",
    info: (
      <div className="space-y-2">
        <p className="font-semibold text-white">Pages zombies</p>
        <p className="text-white/70">Pages mortes — visibles mais sans clic.</p>
        <div className="space-y-0.5 text-white/80">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-white/40">Critères cumulatifs</p>
          <p>· Clics ≤ 10</p>
          <p>· CTR ≤ 1 %</p>
          <p>· Impressions ≥ 50 (sinon = invisible)</p>
        </div>
        <p className="text-white/50 italic">Pruning · désindexation · redirection · refonte</p>
      </div>
    ),
  },
  {
    label: "Nouveau contenu",
    info: (
      <div className="space-y-2">
        <p className="font-semibold text-white">Nouveau contenu</p>
        <p className="text-white/70">Pages récentes (&lt; 30 jours) — patience.</p>
        <p className="text-white/50 italic">Surveiller sans sur-optimiser</p>
      </div>
    ),
  },
];

const SEGMENT_PRIORITY_INFO = (
  <div className="space-y-2">
    <p className="font-semibold text-white">Ordre de priorité d'attribution</p>
    <p className="text-white/60">Si une page coche plusieurs segments :</p>
    <div className="space-y-0.5 text-white/80">
      <p>1. Cannibals <span className="text-white/40">(bloque tout)</span></p>
      <p>2. En chute <span className="text-white/40">(urgent)</span></p>
      <p>3. Étoiles montantes <span className="text-white/40">(opportunité)</span></p>
      <p>4. Pages zombies <span className="text-white/40">(nettoyage)</span></p>
      <p>5. Vache à lait <span className="text-white/40">(protection)</span></p>
      <p>6. Nouveau contenu <span className="text-white/40">(&lt; 30 jours)</span></p>
      <p>7. Stable <span className="text-white/40">(par défaut)</span></p>
    </div>
  </div>
);

const INFO_ICON_SVG = (
  <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
    <path d="M8 7v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <circle cx="8" cy="5.2" r="0.8" fill="currentColor" />
  </svg>
);

function InfoIcon({ content }: { content: ReactNode }) {
  return (
    <Tooltip label={content} rich portal side="top">
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        className="flex items-center justify-center text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
      >
        {INFO_ICON_SVG}
      </button>
    </Tooltip>
  );
}

function SegmentPill({ label, info, active, onToggle }: { label: string; info: ReactNode; active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all ${
        active
          ? "border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg-primary)]"
          : "border-[var(--border-medium)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]"
      }`}
    >
      {label}
      <Tooltip label={info} rich portal side="top">
        <span
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="flex items-center justify-center opacity-40 transition-opacity hover:opacity-80"
        >
          {INFO_ICON_SVG}
        </span>
      </Tooltip>
    </button>
  );
}

const MOCK_PAGES = [
  { url: "/blog/seo-local",         clicks: 3240, impressions: 48200, position: 4.2 },
  { url: "/services/audit-seo",     clicks: 2180, impressions: 31400, position: 7.8 },
  { url: "/blog/link-building",     clicks: 1640, impressions: 28100, position: 11.2 },
  { url: "/",                       clicks: 1320, impressions: 15200, position: 3.1 },
  { url: "/blog/core-web-vitals",   clicks: 980,  impressions: 19400, position: 9.4 },
  { url: "/blog/audit-technique",   clicks: 840,  impressions: 14700, position: 12.6 },
  { url: "/blog/maillage-interne",  clicks: 720,  impressions: 11200, position: 8.3 },
  { url: "/blog/schema-org",        clicks: 610,  impressions: 9800,  position: 14.1 },
  { url: "/services/contenu-seo",   clicks: 540,  impressions: 8400,  position: 16.7 },
  { url: "/blog/eeat-google",       clicks: 480,  impressions: 7600,  position: 18.2 },
];

type TreeNode = { id: string; label: string; children?: TreeNode[] };
const SITE_TREE: TreeNode[] = [
  { id: "blog",     label: "/blog",     children: [
    { id: "blog/seo",       label: "/seo" },
    { id: "blog/contenu",   label: "/contenu" },
    { id: "blog/technique", label: "/technique" },
  ]},
  { id: "services", label: "/services", children: [
    { id: "services/audit",          label: "/audit-seo" },
    { id: "services/accompagnement", label: "/accompagnement" },
  ]},
  { id: "produits", label: "/produits", children: [] },
  { id: "guides",   label: "/guides",   children: [] },
  { id: "a-propos", label: "/a-propos", children: [] },
];

function TreeNodeItem({ node, depth = 0, selected, expanded, onSelect, onToggle }: {
  node: TreeNode; depth?: number; selected: string; expanded: string[];
  onSelect: (id: string) => void; onToggle: (id: string) => void;
}) {
  const isSelected = selected === node.id;
  const isExpanded = expanded.includes(node.id);
  const hasChildren = !!node.children?.length;
  return (
    <div>
      <button
        style={{ paddingLeft: depth * 14 + 8 }}
        onClick={() => { onSelect(node.id); if (hasChildren) onToggle(node.id); }}
        className={`flex w-full items-center gap-2 rounded-lg py-1.5 pr-3 text-left transition-colors ${isSelected ? "bg-[var(--text-primary)] text-[var(--bg-primary)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"}`}
      >
        <ChevronRightIcon className={`h-3 w-3 flex-shrink-0 transition-transform ${hasChildren ? (isExpanded ? "rotate-90" : "") : "opacity-0"}`} />
        <FolderOpenIcon className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="font-mono text-[12px]">{node.label}</span>
      </button>
      {hasChildren && isExpanded && node.children!.map((c) => (
        <TreeNodeItem key={c.id} node={c} depth={depth + 1} selected={selected} expanded={expanded} onSelect={onSelect} onToggle={onToggle} />
      ))}
    </div>
  );
}

export function ImportModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [importType, setImportType] = useState<ImportType | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [typology, setTypology] = useState("");
  const [quickWin, setQuickWin] = useState("");
  const [treeSelected, setTreeSelected] = useState("");
  const [treeExpanded, setTreeExpanded] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({ minClics: "", minImpressions: "", posMax: "", maxUrls: "100" });
  const [mustContainTags, setMustContainTags] = useState<string[]>([]);
  const [mustContainInput, setMustContainInput] = useState("");
  const [mustExcludeTags, setMustExcludeTags] = useState<string[]>([]);
  const [mustExcludeInput, setMustExcludeInput] = useState("");
  const [segments, setSegments] = useState<string[]>([]);

  const addTag = (val: string, tags: string[], set: (t: string[]) => void, setInput: (v: string) => void) => {
    const trimmed = val.trim();
    if (trimmed && !tags.includes(trimmed)) set([...tags, trimmed]);
    setInput("");
  };

  const goStep3 = () => {
    setStep(3);
    setLoading(true);
    setTimeout(() => {
      setSelectedPages(new Set(MOCK_PAGES.map((p) => p.url)));
      setLoading(false);
    }, 1600);
  };

  const togglePage = (url: string) =>
    setSelectedPages((prev) => { const s = new Set(prev); s.has(url) ? s.delete(url) : s.add(url); return s; });

  const allSelected = selectedPages.size === MOCK_PAGES.length;
  const toggleAll = () => setSelectedPages(allSelected ? new Set() : new Set(MOCK_PAGES.map((p) => p.url)));

  const toggleTree = (id: string) =>
    setTreeExpanded((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  return (
    <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" className="w-full max-w-2xl rounded-2xl bg-[var(--modal-bg)] p-8 shadow-[var(--shadow-floating)]">

        <Stepper steps={3} current={step} onClose={onClose} />

        {/* ── Step 1 — Méthode ── */}
        {step === 1 && (
          <div>
            <h2 className="mb-6 text-center font-semibold tracking-tight text-[var(--text-primary)]">Comment voulez-vous importer vos pages ?</h2>
            <div className="grid grid-cols-2 gap-3">
              {IMPORT_TYPES.map((t) => {
                const active = importType === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setImportType((prev) => prev === t.key ? null : t.key)}
                    className={`flex flex-col items-center gap-3 rounded-2xl border p-6 text-center transition-all ${
                      active
                        ? "border-2 border-[var(--text-primary)] bg-[var(--bg-secondary)]"
                        : "border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--border-medium)] hover:bg-[var(--bg-secondary)]"
                    }`}
                  >
                    <t.icon className={`h-9 w-9 transition-colors ${active ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`} />
                    <div>
                      <p className="text-[13px] font-semibold text-[var(--text-primary)]">{t.label}</p>
                      <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{t.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Sub-panels — smooth expand with AnimateIn */}
            <AnimateIn show={importType === "keyword"}>
              <div className="mt-4">
                <div className="flex gap-2">
                  <input type="text" value={keywordInput} placeholder="Ajouter un mot-clé…"
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTag(keywordInput, keywords, setKeywords, setKeywordInput)}
                    className="flex-1 rounded-xl border border-[var(--border-medium)] bg-[var(--input-bg)] px-3 py-2 text-[14px] text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]" />
                  <button onClick={() => addTag(keywordInput, keywords, setKeywords, setKeywordInput)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-medium)] bg-[var(--input-bg)] text-[var(--text-muted)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]">
                    +
                  </button>
                </div>
                {keywords.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {keywords.map((kw) => (
                      <span key={kw} className="animate-slide-down flex items-center gap-1 rounded-full bg-[var(--text-primary)] px-3 py-1.5 text-[12px] font-medium text-[var(--bg-primary)]">
                        {kw}
                        <button onClick={() => setKeywords((p) => p.filter((x) => x !== kw))} className="opacity-60 hover:opacity-100"><XMarkIcon className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </AnimateIn>

            <AnimateIn show={importType === "typology"}>
              <div className="relative mt-4">
                <select value={typology} onChange={(e) => setTypology(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-[var(--border-medium)] bg-[var(--input-bg)] p-2 pr-9 text-[14px] font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]">
                  <option value="">Sélectionner une typologie…</option>
                  {TYPOLOGY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
              </div>
            </AnimateIn>

            <AnimateIn show={importType === "tree"}>
              <div className="mt-4 max-h-52 overflow-y-auto rounded-2xl border border-[var(--border-subtle)] p-2">
                {SITE_TREE.map((node) => (
                  <TreeNodeItem key={node.id} node={node} selected={treeSelected} expanded={treeExpanded} onSelect={setTreeSelected} onToggle={toggleTree} />
                ))}
              </div>
            </AnimateIn>

            <AnimateIn show={importType === "quickwins"}>
              <div className="relative mt-4">
                <select value={quickWin} onChange={(e) => setQuickWin(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-[var(--border-medium)] bg-[var(--input-bg)] p-2 pr-9 text-[14px] font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]">
                  <option value="">Sélectionner une catégorie…</option>
                  {QUICK_WINS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
              </div>
            </AnimateIn>

            <div className="mt-6 flex items-center justify-between">
              <div />
              <div className="flex items-center gap-3">
                <button onClick={() => setStep(2)} className="text-[13px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
                  Passer cette étape
                </button>
                <Button size="md" onClick={() => setStep(2)} disabled={!importType}>
                  Suivant <ChevronRightIcon className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2 — Filtres ── */}
        {step === 2 && (
          <div>
            <h2 className="mb-6 text-center font-semibold tracking-tight text-[var(--text-primary)]">Filtrez votre import</h2>
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: "minClics",       label: "Min. clics" },
                  { key: "minImpressions", label: "Min. impressions" },
                  { key: "posMax",         label: "Position max" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="mb-1.5 block text-[11px] font-medium text-[var(--text-muted)]">{f.label}</label>
                    <NumberInput
                      placeholder="—"
                      value={filters[f.key as keyof typeof filters]}
                      onChange={(val) => setFilters((p) => ({ ...p, [f.key]: val }))}
                      min={0}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>

              {/* Tag inputs */}
              {[
                { label: "La page doit contenir", tags: mustContainTags, setTags: setMustContainTags, input: mustContainInput, setInput: setMustContainInput, placeholder: "ex : /blog" },
                { label: "La page exclut",         tags: mustExcludeTags, setTags: setMustExcludeTags, input: mustExcludeInput, setInput: setMustExcludeInput, placeholder: "ex : /admin" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="mb-1.5 block text-[11px] font-medium text-[var(--text-muted)]">{f.label}</label>
                  <div className="flex gap-2">
                    <input type="text" value={f.input} placeholder={f.placeholder}
                      onChange={(e) => f.setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addTag(f.input, f.tags, f.setTags, f.setInput)}
                      className="flex-1 rounded-xl border border-[var(--border-medium)] bg-[var(--input-bg)] px-3 py-2 text-[14px] text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)]" />
                    <button onClick={() => addTag(f.input, f.tags, f.setTags, f.setInput)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-medium)] bg-[var(--input-bg)] text-[var(--text-muted)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]">
                      +
                    </button>
                  </div>
                  <AnimateIn show={f.tags.length > 0}>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {f.tags.map((tag) => (
                        <span key={tag} className="animate-slide-down flex items-center gap-1 rounded-full bg-[var(--text-primary)] px-3 py-1.5 text-[12px] font-medium text-[var(--bg-primary)]">
                          {tag}
                          <button onClick={() => f.setTags((p) => p.filter((x) => x !== tag))} className="opacity-60 hover:opacity-100"><XMarkIcon className="h-3 w-3" /></button>
                        </span>
                      ))}
                    </div>
                  </AnimateIn>
                </div>
              ))}

              <div>
                <div className="mb-2 flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-[var(--text-muted)]">Filtrer par segments GSC</span>
                  <InfoIcon content={SEGMENT_PRIORITY_INFO} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {SEGMENT_INFO.map(({ label, info }) => (
                    <SegmentPill
                      key={label}
                      label={label}
                      info={info}
                      active={segments.includes(label)}
                      onToggle={() => setSegments((p) => p.includes(label) ? p.filter((x) => x !== label) : [...p, label])}
                    />
                  ))}
                </div>
              </div>

              <div className="max-w-[160px]">
                <label className="mb-1.5 block text-[11px] font-medium text-[var(--text-muted)]">Nombre max d'URL</label>
                <NumberInput
                  value={filters.maxUrls}
                  onChange={(val) => setFilters((p) => ({ ...p, maxUrls: val }))}
                  min={1}
                  className="w-full"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button onClick={() => setStep(1)} className="flex items-center gap-1 text-[13px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
                <ChevronRightIcon className="h-3.5 w-3.5 rotate-180" /> Retour
              </button>
              <div className="flex items-center gap-3">
                <button onClick={goStep3} className="text-[13px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
                  Passer cette étape
                </button>
                <Button size="md" onClick={goStep3}>
                  Appliquer les filtres <ChevronRightIcon className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3 — Résultats ── */}
        {step === 3 && (
          <div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="h-14 w-14 animate-spin rounded-full border-[3px] border-[var(--border-subtle)] border-t-[var(--text-primary)]" />
                <p className="mt-6 text-[26px] font-semibold tracking-tight text-[var(--text-primary)]">Analyse en cours…</p>
              </div>
            ) : (
              <>
                <div className="mb-5 animate-slide-down text-center">
                  <h2 className="font-semibold tracking-tight text-[var(--text-primary)]">{MOCK_PAGES.length} pages correspondent aux filtres !</h2>
                  <p className="mt-1 text-[12px] text-[var(--text-muted)]">Données du 29/04/2026</p>
                </div>
                <div className="animate-slide-up overflow-hidden rounded-2xl border border-[var(--border-subtle)]" style={{ animationDelay: "60ms" }}>
                  {/* Sticky header */}
                  <div className="grid grid-cols-[24px_1fr_72px_80px_52px] items-center gap-3 border-b border-[var(--border-subtle)] bg-[var(--modal-bg)] px-4 py-2.5">
                    <button
                      onClick={toggleAll}
                      className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${allSelected ? "border-[var(--text-primary)] bg-[var(--text-primary)]" : "border-[var(--border-medium)]"}`}
                    >
                      {allSelected && <CheckIcon className="h-2.5 w-2.5 text-[var(--bg-primary)]" />}
                    </button>
                    {["Page", "Clics", "Impr.", "Pos."].map((h, i) => (
                      <span key={h} className={`text-[10px] font-medium text-[var(--text-muted)] ${i > 0 ? "text-right" : ""}`}>{h}</span>
                    ))}
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    {MOCK_PAGES.map((p, i) => {
                      const checked = selectedPages.has(p.url);
                      return (
                        <div
                          key={p.url}
                          onClick={() => togglePage(p.url)}
                          className={`grid cursor-pointer grid-cols-[24px_1fr_72px_80px_52px] items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--bg-secondary)] ${i < MOCK_PAGES.length - 1 ? "border-b border-[var(--border-subtle)]" : ""} ${!checked ? "opacity-40" : ""}`}
                        >
                          <div className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${checked ? "border-[var(--text-primary)] bg-[var(--text-primary)]" : "border-[var(--border-medium)]"}`}>
                            {checked && <CheckIcon className="h-2.5 w-2.5 text-[var(--bg-primary)]" />}
                          </div>
                          <div className="flex items-center gap-2 min-w-0">
                            <LinkIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--text-muted)]" />
                            <span className="truncate font-mono text-[12px] text-[var(--text-secondary)]">{p.url}</span>
                          </div>
                          <span className="text-right text-[13px] font-medium tabular-nums text-[var(--text-primary)]">{p.clicks.toLocaleString()}</span>
                          <span className="text-right text-[13px] tabular-nums text-[var(--text-muted)]">{p.impressions.toLocaleString()}</span>
                          <span className="text-right text-[13px] font-medium tabular-nums text-[var(--text-primary)]">#{p.position}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <button onClick={() => setStep(2)} className="flex items-center gap-1 text-[13px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
                    <ChevronRightIcon className="h-3.5 w-3.5 rotate-180" /> Retour
                  </button>
                  <div className="flex items-center gap-3">
                    <Button size="md" variant="secondary" onClick={onClose}>
                      Fusionner avec un autre tag
                    </Button>
                    <Button size="md" onClick={onClose} disabled={selectedPages.size === 0}>
                      Valider l'import ({selectedPages.size} pages) <ChevronRightIcon className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
