"use client";

import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { Button, LinkButton } from "@/components/Button";
import { Tooltip, ChartTooltip } from "@/components/Tooltip";
import { FlipCard } from "@/components/FlipCard";
import { Callout } from "@/components/Callout";
import { AIInsight } from "@/components/AIInsight";
import { KpiCard } from "@/components/KpiCard";
import { ScoreRing } from "@/components/ScoreRing";
import { SegmentedControl } from "@/components/SegmentedControl";
import { FilterTabs } from "@/components/FilterTabs";
import { Pill } from "@/components/Pill";
import { StatusPill, StatusPillDropdown, type Status } from "@/components/StatusPill";
import { SearchInput } from "@/components/SearchInput";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton, SkeletonText, SkeletonCircle } from "@/components/Skeleton";
import { DropdownMenu, DropdownItem, DropdownSeparator } from "@/components/DropdownMenu";
import { NumberInput } from "@/components/NumberInput";
import { AnimateIn } from "@/components/AnimateIn";
import { DeltaBadge } from "@/components/DeltaBadge";
import { IconBadge } from "@/components/IconBadge";
import { SectionHead } from "@/components/SectionHead";
import { ProgressBar } from "@/components/ProgressBar";
import { AreaChart } from "@/components/AreaChart";
import { LineDotChart } from "@/components/LineDotChart";
import { ProfileDonutChart } from "@/components/ProfileDonutChart";
import { DonutChart } from "@/components/DonutChart";
import { Sparkline } from "@/components/Sparkline";
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  SparklesIcon,
  EllipsisHorizontalIcon,
  TrashIcon,
  PencilIcon,
  TrophyIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import {
  Trophy,
  Link as LLink,
  Globe,
  ChartBar,
  TrendingUp,
  FileText,
  TriangleAlert,
  MousePointerClick,
  Pencil,
  Copy,
  Trash2,
} from "lucide-react";

/* ── Token data ──────────────────────────────────────────────────────── */

const colorGroups = [
  {
    title: "Surfaces",
    description: "Fonds de page, cards et conteneurs",
    tokens: [
      { var: "--bg-primary", tw: "bg-bg-primary" },
      { var: "--bg-secondary", tw: "bg-bg-secondary" },
      { var: "--bg-card", tw: "bg-bg-card" },
      { var: "--bg-card-hover", tw: "bg-bg-card-hover" },
      { var: "--bg-sidebar", tw: "bg-bg-sidebar" },
      { var: "--bg-overlay", tw: "bg-bg-overlay" },
      { var: "--bg-subtle", tw: "bg-bg-subtle" },
      { var: "--card-inner-bg", tw: "bg-card-inner-bg" },
      { var: "--modal-bg", tw: "bg-modal-bg" },
      { var: "--input-bg", tw: "bg-input-bg" },
    ],
  },
  {
    title: "Bordures",
    description: "Lignes et séparateurs",
    tokens: [
      { var: "--border-subtle", tw: "border-border-subtle" },
      { var: "--border-badge", tw: "border-border-badge" },
      { var: "--border-medium", tw: "border-border-medium" },
    ],
  },
  {
    title: "Texte",
    description: "Hiérarchie typographique",
    tokens: [
      { var: "--text-primary", tw: "text-text-primary" },
      { var: "--text-heading", tw: "text-text-heading" },
      { var: "--text-secondary", tw: "text-text-secondary" },
      { var: "--text-muted", tw: "text-text-muted" },
      { var: "--text-input", tw: "text-text-input" },
    ],
  },
  {
    title: "Accent",
    description: "Bleu de marque #3E50F5 et variantes",
    tokens: [
      { var: "--accent-primary", tw: "bg-accent-primary" },
      { var: "--accent-primary-soft", tw: "bg-accent-primary-soft" },
      { var: "--accent-primary-mid", tw: "bg-accent-primary-mid" },
    ],
  },
  {
    title: "Statuts",
    description: "Sémantique fonctionnelle",
    tokens: [
      { var: "--color-success", tw: "bg-success" },
      { var: "--color-warning", tw: "bg-warning" },
      { var: "--color-danger", tw: "bg-danger" },
    ],
  },
];

const fontSizes = [
  { size: "11px", note: "Micro labels, badges" },
  { size: "12px", note: "Captions, sous-labels" },
  { size: "13px", note: "Body small" },
  { size: "14px", note: "Body, boutons" },
  { size: "15px", note: "Paragraphes par défaut" },
  { size: "16px", note: "H3 cards" },
  { size: "19px", note: "Titres section" },
  { size: "24px", note: "Titres page" },
  { size: "32px", note: "Gros nombres / KPI" },
];

const fontWeights = [
  { label: "Regular", weight: 400 },
  { label: "Medium", weight: 500 },
  { label: "Semibold", weight: 600 },
  { label: "Bold", weight: 700 },
];

const spacings = [
  { label: "1", value: "4px" },
  { label: "2", value: "8px" },
  { label: "3", value: "12px" },
  { label: "4", value: "16px" },
  { label: "5", value: "20px" },
  { label: "6", value: "24px" },
  { label: "8", value: "32px" },
  { label: "10", value: "40px" },
  { label: "12", value: "48px" },
  { label: "16", value: "64px" },
];

const radii = [
  { label: "sm", value: "6px" },
  { label: "md", value: "8px" },
  { label: "xl", value: "12px" },
  { label: "2xl", value: "16px" },
  { label: "3xl", value: "24px" },
  { label: "full", value: "9999px" },
];

const shadows = [
  { token: "--shadow-card", note: "Cards — ombre portée subtile" },
  { token: "--shadow-floating", note: "Drawers, dropdowns, modales" },
  { token: "--shadow-cta", note: "Bouton primary — teinté accent" },
];

const easings = [
  { token: "--ease-out", value: "cubic-bezier(0.23, 1, 0.32, 1)", note: "Sortie douce — défaut" },
  { token: "--ease-in-out", value: "cubic-bezier(0.77, 0, 0.175, 1)", note: "Symétrique" },
  { token: "--ease-expo", value: "cubic-bezier(0.16, 1, 0.3, 1)", note: "Expo — sidebar / drawer" },
];

const durations = [
  { token: "--motion-instant", value: "100ms", note: "Réactions instantanées" },
  { token: "--motion-fast", value: "200ms", note: "Hovers, micro-interactions" },
  { token: "--motion-base", value: "300ms", note: "Transitions standard" },
  { token: "--motion-slow", value: "600ms", note: "Entrées, fade-up" },
  { token: "--motion-slowest", value: "1200ms", note: "Animations à fort impact" },
];

/* ── Layout helpers ──────────────────────────────────────────────────── */

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="border-t border-[var(--border-subtle)] py-12">
      <h2 className="mb-6 text-[22px] font-semibold text-[var(--text-primary)]">{title}</h2>
      {children}
    </section>
  );
}

function Block({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
      <div className="mb-4 flex items-baseline gap-2">
        <p className="text-[12px] font-semibold text-[var(--text-secondary)]">{title}</p>
        {note && <span className="font-mono text-[10px] text-[var(--text-muted)]">{note}</span>}
      </div>
      {children}
    </div>
  );
}

function Swatch({ varName, tw }: { varName: string; tw: string }) {
  const isText = tw.startsWith("text-");
  const isBorder = tw.startsWith("border-");
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3">
      {isText ? (
        <div className="flex h-16 items-center justify-center rounded-lg bg-[var(--card-inner-bg)]">
          <span className={`text-[32px] font-semibold ${tw}`}>Aa</span>
        </div>
      ) : isBorder ? (
        <div className={`h-16 rounded-lg border-2 bg-[var(--card-inner-bg)] ${tw}`} />
      ) : (
        <div className="h-16 rounded-lg" style={{ background: `var(${varName})`, border: "1px solid var(--border-subtle)" }} />
      )}
      <div className="mt-2 font-mono text-[11px] text-[var(--text-secondary)]">{varName}</div>
    </div>
  );
}

/* ── Views ───────────────────────────────────────────────────────────── */

function ViewFondations() {
  return (
    <>
      <Section id="colors" title="Couleurs">
        <div className="flex flex-col gap-10">
          {colorGroups.map((group) => (
            <div key={group.title}>
              <h3 className="mb-1 text-[15px] font-semibold text-[var(--text-primary)]">{group.title}</h3>
              <p className="mb-4 text-[13px] text-[var(--text-secondary)]">{group.description}</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {group.tokens.map((t) => (
                  <Swatch key={t.var} varName={t.var} tw={t.tw} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="typography" title="Typographie">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 text-[15px] font-semibold text-[var(--text-primary)]">Échelle</h3>
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
              {fontSizes.map((s) => (
                <div key={s.size} className="flex items-baseline gap-4 border-b border-[var(--border-subtle)] py-2 last:border-0">
                  <span className="w-12 shrink-0 font-mono text-[10px] tabular-nums text-[var(--text-muted)]">{s.size}</span>
                  <span className="flex-1 text-[var(--text-primary)]" style={{ fontSize: s.size }}>Aa</span>
                  <span className="text-[11px] text-[var(--text-secondary)]">{s.note}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-[15px] font-semibold text-[var(--text-primary)]">Graisses</h3>
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
              {fontWeights.map((w) => (
                <div key={w.label} className="flex items-baseline justify-between border-b border-[var(--border-subtle)] py-2 last:border-0">
                  <span className="text-[16px] text-[var(--text-primary)]" style={{ fontWeight: w.weight }}>{w.label}</span>
                  <span className="font-mono text-[11px] text-[var(--text-muted)]">{w.weight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="mb-3 text-[15px] font-semibold text-[var(--text-primary)]">Kerning (letter-spacing)</h3>
          <p className="mb-4 text-[13px] tracking-body text-[var(--text-secondary)]">
            Règle : <strong>plus le texte est grand, plus le kerning est resserré (négatif)</strong>.
            Les titres et chiffres clés respirent en se compactant ; les petits textes restent lisibles avec un kerning quasi neutre.
            Auto-appliqué via <code className="font-mono text-[12px]">h1/h2/h3</code>, ou via classes utilitaires.
          </p>
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
            {[
              { cls: "tracking-display",    label: ".tracking-display",    value: "-0.05em",  size: "28px+", usage: "h1, hero, KPI value 26px+" },
              { cls: "tracking-heading",    label: ".tracking-heading",    value: "-0.04em",  size: "20–26px", usage: "h2, valeurs KpiCard" },
              { cls: "tracking-subheading", label: ".tracking-subheading", value: "-0.03em",  size: "15–18px", usage: "h3, titres de cards, titres in-chart" },
              { cls: "tracking-body",       label: ".tracking-body",       value: "-0.02em",  size: "13–14px", usage: "body, labels KpiCard" },
              { cls: "tracking-caption",    label: ".tracking-caption",    value: "-0.01em",  size: "11–12px", usage: "captions, axis labels" },
              { cls: "tracking-micro",      label: ".tracking-micro",      value: "-0.005em", size: "≤10px",   usage: "micro-labels" },
            ].map((row) => (
              <div key={row.cls} className="grid grid-cols-[180px_70px_70px_1fr_auto] items-baseline gap-4 border-b border-[var(--border-subtle)] py-2.5 last:border-0">
                <span className="font-mono text-[12px] text-[var(--text-primary)]">{row.label}</span>
                <span className="font-mono text-[11px] text-[var(--text-muted)]">{row.value}</span>
                <span className="font-mono text-[11px] text-[var(--text-muted)]">{row.size}</span>
                <span className="text-[12px] text-[var(--text-secondary)]">{row.usage}</span>
                <span className={`text-[18px] font-semibold text-[var(--text-primary)] ${row.cls}`}>Briefs SEO</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section id="spacing" title="Espacements">
        <p className="mb-4 text-[13px] text-[var(--text-secondary)]">Échelle Tailwind par incréments de 4px.</p>
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
          {spacings.map((s) => (
            <div key={s.label} className="flex items-center gap-4 border-b border-[var(--border-subtle)] py-2 last:border-0">
              <span className="w-12 font-mono text-[12px] tabular-nums text-[var(--text-muted)]">{s.label}</span>
              <div className="h-3 rounded-sm bg-[#3E50F5]" style={{ width: s.value }} />
              <span className="font-mono text-[11px] text-[var(--text-muted)]">{s.value}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section id="radius" title="Coins arrondis">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {radii.map((r) => (
            <div key={r.label} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3">
              <div className="h-16 w-full bg-[var(--card-inner-bg)]" style={{ borderRadius: r.value }} />
              <div className="mt-2 font-mono text-[12px] text-[var(--text-secondary)]">{r.label}</div>
              <div className="font-mono text-[10px] text-[var(--text-muted)]">{r.value}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="shadows" title="Ombres">
        <div className="grid gap-3 md:grid-cols-3">
          {shadows.map((sh) => (
            <div key={sh.token} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
              <div className="h-20 w-full rounded-lg bg-[var(--card-inner-bg)]" style={{ boxShadow: `var(${sh.token})` }} />
              <div className="mt-3 font-mono text-[12px] text-[var(--text-secondary)]">{sh.token}</div>
              <div className="mt-1 text-[11px] text-[var(--text-muted)]">{sh.note}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="motion" title="Mouvement">
        <h3 className="mb-3 text-[15px] font-semibold text-[var(--text-primary)]">Easings</h3>
        <div className="mb-8 grid gap-3 md:grid-cols-3">
          {easings.map((e) => (
            <div key={e.token} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
              <div className="font-mono text-[13px] text-[var(--text-primary)]">{e.token}</div>
              <div className="mt-1 text-[11px] text-[var(--text-secondary)]">{e.note}</div>
              <div className="mt-3 font-mono text-[9px] text-[var(--text-muted)]">{e.value}</div>
            </div>
          ))}
        </div>
        <h3 className="mb-3 text-[15px] font-semibold text-[var(--text-primary)]">Durées</h3>
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
          {durations.map((d) => (
            <div key={d.token} className="flex items-center gap-4 border-b border-[var(--border-subtle)] py-2 last:border-0">
              <div className="w-44 shrink-0">
                <div className="font-mono text-[12px] text-[var(--text-primary)]">{d.token}</div>
                <div className="font-mono text-[10px] tabular-nums text-[var(--text-muted)]">{d.value}</div>
              </div>
              <span className="text-[12px] text-[var(--text-secondary)]">{d.note}</span>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

function ViewAtomes() {
  const [searchVal, setSearchVal] = useState("");
  const [numVal, setNumVal] = useState("42");
  const [filterTab, setFilterTab] = useState("all");
  const [statusA, setStatusA] = useState<Status>("todo");
  const [statusB, setStatusB] = useState<Status>("doing");
  const [animOpen, setAnimOpen] = useState(true);

  return (
    <>
      <Section id="button" title="Button">
        <div className="flex flex-col gap-4">
          <Block title="Variantes" note="Button.tsx">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
          </Block>
          <Block title="Tailles — sm 14px / 36h · md 16px / 44h / 16px-x · lg 18px / 48h" note="Button.tsx · sizes">
            <div className="flex flex-wrap items-end gap-3">
              <Button size="sm">Small · 14px</Button>
              <Button size="md">Medium · 16px</Button>
              <Button size="lg">Large · 18px</Button>
            </div>
          </Block>
          <Block title="Disabled">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" disabled>Primary</Button>
              <Button variant="secondary" disabled>Secondary</Button>
              <Button variant="ghost" disabled>Ghost</Button>
              <Button variant="danger" disabled>Danger</Button>
            </div>
          </Block>
          <Block title="LinkButton">
            <div className="flex flex-wrap items-center gap-3">
              <LinkButton href="#" variant="primary">Primary link</LinkButton>
              <LinkButton href="#" variant="secondary">Secondary link</LinkButton>
              <LinkButton href="#" variant="ghost">Ghost link</LinkButton>
            </div>
          </Block>
        </div>
      </Section>

      <Section id="pill" title="Pill & StatusPill">
        <div className="flex flex-col gap-4">
          <Block title="Pill — couleurs libres" note="Pill.tsx · texte = variante sombre de l'accent, fond = tint 8–9%">
            <div className="flex flex-wrap items-center gap-2">
              <Pill color="#2232C5" bg="rgba(62,80,245,0.08)">Contenu</Pill>
              <Pill color="#059669" bg="rgba(16,185,129,0.08)">Terminé</Pill>
              <Pill color="#B45309" bg="rgba(245,158,11,0.08)">En cours</Pill>
              <Pill color="#BE1239" bg="rgba(225,29,72,0.08)">Critique</Pill>
              <Pill color="var(--text-primary)" bg="var(--bg-subtle)">Neutre</Pill>
            </div>
          </Block>

          <Block title="StatusPill — statuts fixes" note="StatusPill.tsx">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status="todo" />
              <StatusPill status="doing" />
              <StatusPill status="done" />
            </div>
          </Block>

          <Block title="StatusPillDropdown — éditable au clic">
            <div className="flex flex-wrap items-center gap-3">
              <StatusPillDropdown status={statusA} onChange={setStatusA} />
              <StatusPillDropdown status={statusB} onChange={setStatusB} />
            </div>
          </Block>

          <Block title="Badges inline — sémantiques" note="texte sombre sur fond teinté, même règle que Pill">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#10B981]/20 bg-[#10B981]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#059669]">Succès</span>
              <span className="rounded-full border border-[#F59E0B]/20 bg-[#F59E0B]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#B45309]">Attention</span>
              <span className="rounded-full border border-[#E11D48]/20 bg-[#E11D48]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#BE1239]">Critique</span>
              <span className="rounded-full border border-[#3E50F5]/20 bg-[#3E50F5]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#2232C5]">Marque</span>
            </div>
          </Block>
        </div>
      </Section>

      <Section id="tooltip" title="Tooltip">
        <div className="flex flex-col gap-4">
          <Block title="4 directions" note="Tooltip.tsx">
            <div className="flex flex-wrap items-center gap-8">
              {(["right", "top", "bottom", "left"] as const).map((side) => (
                <Tooltip key={side} label={`Tooltip ${side}`} side={side}>
                  <Button variant="secondary" size="sm">{side}</Button>
                </Tooltip>
              ))}
            </div>
          </Block>
          <Block title="Tooltip rich — avec titre et contenu">
            <div className="flex flex-wrap items-center gap-4">
              <Tooltip
                label={
                  <div>
                    <p className="font-semibold text-white">Position SERP</p>
                    <p className="mt-1 text-[11px] text-white/70">Classement moyen sur les 30 derniers jours, toutes requêtes confondues.</p>
                  </div>
                }
                rich
                side="top"
              >
                <Button variant="secondary" size="sm">Hover pour tooltip rich</Button>
              </Tooltip>
            </div>
          </Block>
          <Block title="ChartTooltip — pour les graphiques SVG" note="ChartTooltip de Tooltip.tsx">
            <div className="relative h-16">
              <ChartTooltip x={120} y={52}>
                <p className="text-[11px] text-white/60">15 jan 2025</p>
                <p className="text-[13px] font-semibold text-white">Position 4</p>
              </ChartTooltip>
              <ChartTooltip x={280} y={52}>
                <p className="text-[11px] text-white/60">28 fév 2025</p>
                <p className="text-[13px] font-semibold text-white">Position 7</p>
              </ChartTooltip>
            </div>
          </Block>
        </div>
      </Section>

      <Section id="filters" title="FilterTabs & SegmentedControl">
        <div className="flex flex-col gap-4">
          <Block title="FilterTabs — navigation par onglets plats" note="FilterTabs.tsx">
            <FilterTabs
              tabs={[
                { key: "all", label: "Tous", count: 24 },
                { key: "contenu", label: "Contenu", count: 8 },
                { key: "technique", label: "Technique", count: 12 },
                { key: "autorite", label: "Autorité", count: 4 },
              ]}
              value={filterTab}
              onChange={setFilterTab}
            />
          </Block>
          <Block title="FilterTabs — avec dot coloré (ex : lots)" note="FilterTabs.tsx · color active le dot">
            <FilterTabs
              tabs={[
                { key: "all", label: "Tous" },
                { key: "a", label: "Lot SEO", color: "#3E50F5", count: 8 },
                { key: "b", label: "Lot Blog", color: "#10B981", count: 5 },
                { key: "c", label: "Sans lot" },
              ]}
              value={filterTab}
              onChange={setFilterTab}
            />
          </Block>
          <Block title="SegmentedControl — switch exclusif" note="SegmentedControl.tsx">
            <SegmentedControl
              options={[
                { key: "3m", label: "3 mois" },
                { key: "6m", label: "6 mois" },
                { key: "1an", label: "1 an" },
              ]}
              value="6m"
              onChange={() => {}}
              className="w-48"
            />
          </Block>
        </div>
      </Section>

      <Section id="inputs" title="Inputs">
        <div className="flex flex-col gap-4">
          <Block title="SearchInput — expandable (icône qui s'ouvre au clic)" note="SearchInput.tsx">
            <SearchInput value={searchVal} onChange={setSearchVal} />
          </Block>
          <Block title="SearchInput — alwaysExpanded (toujours pleine largeur)" note="SearchInput.tsx · alwaysExpanded">
            <div className="max-w-md">
              <SearchInput value={searchVal} onChange={setSearchVal} alwaysExpanded placeholder="Rechercher un brief…" />
            </div>
          </Block>
          <Block title="NumberInput — avec contrôles ±" note="NumberInput.tsx">
            <NumberInput value={numVal} onChange={setNumVal} min={0} max={100} className="w-32" />
          </Block>
          <Block title="Input texte — states">
            <div className="flex flex-col gap-3 max-w-sm">
              <input
                type="text"
                placeholder="État par défaut..."
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--card-inner-bg)] px-4 py-2.5 text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] transition-colors focus:border-[var(--border-medium)] focus:bg-[var(--bg-card)]"
              />
              <input
                type="text"
                placeholder="Désactivé..."
                disabled
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--card-inner-bg)] px-4 py-2.5 text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] opacity-40 cursor-not-allowed"
              />
            </div>
          </Block>
        </div>
      </Section>

      <Section id="dropdown" title="DropdownMenu">
        <Block title="Dropdown avec items et séparateur" note="DropdownMenu.tsx">
          <div className="flex gap-4">
            <DropdownMenu
              trigger={
                <Button variant="secondary" size="sm">
                  <span className="flex items-center gap-1.5">Options <ChevronDownIcon className="h-3.5 w-3.5" /></span>
                </Button>
              }
            >
              <DropdownItem icon={Pencil} onClick={() => {}}>Modifier</DropdownItem>
              <DropdownItem icon={Copy}   onClick={() => {}}>Dupliquer</DropdownItem>
              <DropdownSeparator />
              <DropdownItem icon={Trash2} onClick={() => {}} danger>Supprimer</DropdownItem>
            </DropdownMenu>

            <DropdownMenu
              trigger={
                <button className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                </button>
              }
              align="right"
            >
              <DropdownItem onClick={() => {}}>Action A</DropdownItem>
              <DropdownItem onClick={() => {}}>Action B</DropdownItem>
              <DropdownSeparator />
              <DropdownItem onClick={() => {}} danger>Supprimer</DropdownItem>
            </DropdownMenu>
          </div>
        </Block>
      </Section>

      <Section id="skeleton" title="Skeleton">
        <div className="flex flex-col gap-4">
          <Block title="Primitives — Skeleton / SkeletonText / SkeletonCircle" note="Skeleton.tsx">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-10 w-full" />
              <div className="flex flex-col gap-2">
                <SkeletonText width="w-3/4" />
                <SkeletonText width="w-1/2" />
                <SkeletonText width="w-2/3" />
              </div>
              <div className="flex items-center gap-3">
                <SkeletonCircle size="h-12 w-12" />
                <div className="flex flex-col gap-2 flex-1">
                  <SkeletonText width="w-1/2" />
                  <SkeletonText width="w-1/3" />
                </div>
              </div>
            </div>
          </Block>
        </div>
      </Section>

      <Section id="emptystate" title="EmptyState">
        <Block title="État vide avec icône, titre, description et action" note="EmptyState.tsx">
          <EmptyState
            icon={<MagnifyingGlassIcon className="h-6 w-6" />}
            title="Aucun résultat"
            description="Essayez de modifier votre recherche ou vos filtres pour trouver ce que vous cherchez."
            action={<Button variant="secondary" size="sm">Réinitialiser les filtres</Button>}
          />
        </Block>
      </Section>

      <Section id="animatein" title="AnimateIn">
        <Block title="Expand / collapse smooth sans hauteur fixe" note="AnimateIn.tsx">
          <div className="flex flex-col gap-3">
            <Button variant="secondary" size="sm" onClick={() => setAnimOpen((o) => !o)}>
              {animOpen ? "Fermer" : "Ouvrir"}
            </Button>
            <AnimateIn show={animOpen}>
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 text-[14px] text-[var(--text-secondary)]">
                Ce contenu s'affiche en glissant sans hauteur fixe, grâce à la transition <span className="font-mono text-[var(--text-primary)]">grid-template-rows</span>.
              </div>
            </AnimateIn>
          </div>
        </Block>
      </Section>

      <Section id="card" title="Card">
        <Block title="Pattern card standard">
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)] transition-all hover:border-[var(--border-medium)] hover:shadow-[var(--shadow-floating)]">
            <div className="text-[16px] font-semibold text-[var(--text-primary)]">Titre de la card</div>
            <p className="mt-2 text-[14px] text-[var(--text-secondary)]">
              Pattern : <span className="font-mono text-[var(--text-muted)]">rounded-2xl border border-[--border-subtle] bg-[--bg-card] p-5</span>
            </p>
          </div>
        </Block>
      </Section>

      <Section id="flipcard" title="FlipCard">
        <Block title="Retournement au survol" note="FlipCard.tsx">
          <div className="grid grid-cols-2 gap-4 h-48">
            <FlipCard
              front={
                <div className="flex h-full flex-col justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
                  <span className="text-[11px] text-[var(--text-muted)]">Face avant</span>
                  <p className="text-[16px] font-semibold text-[var(--text-primary)]">Survolez-moi</p>
                </div>
              }
              back={
                <div className="flex h-full flex-col justify-between rounded-xl bg-[#3E50F5] p-4">
                  <span className="text-[11px] text-white/60">Face arrière</span>
                  <p className="text-[16px] font-semibold text-white">Contenu révélé</p>
                </div>
              }
            />
            <FlipCard
              front={
                <div className="flex h-full flex-col justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
                  <span className="text-[11px] text-[var(--text-muted)]">Exemple 2</span>
                  <p className="text-[16px] font-semibold text-[var(--text-primary)]">Autre carte</p>
                </div>
              }
              back={
                <div className="flex h-full flex-col justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-overlay)] p-4">
                  <span className="text-[11px] text-[var(--text-muted)]">Dos sombre</span>
                  <p className="text-[16px] font-semibold text-[var(--text-primary)]">Retournée</p>
                </div>
              }
            />
          </div>
        </Block>
      </Section>

      <Section id="iconbadge" title="IconBadge">
        <div className="flex flex-col gap-4">
          <Block title="3 tailles — sm · md · lg" note="IconBadge.tsx · encart carré arrondi avec icône centrée">
            <div className="flex items-end gap-6">
              <div className="flex flex-col items-center gap-2">
                <IconBadge icon={SparklesIcon} size="sm" color="#2232C5" bg="rgba(62,80,245,0.08)" />
                <span className="font-mono text-[10px] text-[var(--text-muted)]">sm · 28px</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <IconBadge icon={SparklesIcon} size="md" color="#2232C5" bg="rgba(62,80,245,0.08)" />
                <span className="font-mono text-[10px] text-[var(--text-muted)]">md · 36px</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <IconBadge icon={SparklesIcon} size="lg" color="#2232C5" bg="rgba(62,80,245,0.08)" />
                <span className="font-mono text-[10px] text-[var(--text-muted)]">lg · 44px</span>
              </div>
            </div>
          </Block>

          <Block title="Couleurs — accent, sémantiques, neutre" note="color = icône · bg = fond teinté 8%">
            <div className="flex flex-wrap items-center gap-3">
              <IconBadge icon={SparklesIcon}         color="#2232C5" bg="rgba(62,80,245,0.08)"   />
              <IconBadge icon={ChartBarIcon}         color="#059669" bg="rgba(16,185,129,0.08)"  />
              <IconBadge icon={TrophyIcon}           color="#B45309" bg="rgba(245,158,11,0.08)"  />
              <IconBadge icon={EyeIcon}              color="#BE1239" bg="rgba(225,29,72,0.08)"   />
              <IconBadge icon={CursorArrowRaysIcon}  color="#7C3AED" bg="rgba(124,58,237,0.08)"  />
              <IconBadge icon={DocumentTextIcon}     />
            </div>
          </Block>

          <Block title="Outline — neutre" note="outline=true · border-medium · no tint · text-primary · ex: KPI cards, Core Web Vitals">
            <div className="flex flex-wrap items-center gap-3">
              <IconBadge icon={TrophyIcon}           outline size="sm" />
              <IconBadge icon={ChartBarIcon}         outline size="sm" />
              <IconBadge icon={CursorArrowRaysIcon}  outline size="sm" />
              <IconBadge icon={EyeIcon}              outline size="sm" />
              <IconBadge icon={MagnifyingGlassIcon}  outline size="sm" />
              <IconBadge icon={SparklesIcon}         outline />
              <IconBadge icon={DocumentTextIcon}     outline size="lg" />
            </div>
          </Block>

          <Block title="Usage type — encart KPI avec icône" note="IconBadge size=sm + label + valeur (pattern KPI card)">
            <div className="flex flex-wrap gap-4">
              {[
                { icon: TrophyIcon,          color: "#2232C5", bg: "rgba(62,80,245,0.08)",  label: "Position GSC", value: "14.3" },
                { icon: ChartBarIcon,        color: "#059669", bg: "rgba(16,185,129,0.08)", label: "Trafic",       value: "4.2K" },
                { icon: CursorArrowRaysIcon, color: "#B45309", bg: "rgba(245,158,11,0.08)", label: "CTR",          value: "3.2%" },
                { icon: EyeIcon,             color: "#7C3AED", bg: "rgba(124,58,237,0.08)", label: "Impressions",  value: "138K" },
              ].map(({ icon, color, bg, label, value }) => (
                <div key={label} className="flex flex-col gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 min-w-[120px]">
                  <IconBadge icon={icon} size="sm" color={color} bg={bg} />
                  <span className="text-[11px] font-medium text-[var(--text-muted)]">{label}</span>
                  <span className="text-[20px] font-semibold tabular-nums text-[var(--text-primary)]">{value}</span>
                </div>
              ))}
            </div>
          </Block>
        </div>
      </Section>
    </>
  );
}

function ViewMolecules() {
  return (
    <>
      <Section id="callout" title="Callout">
        <div className="flex flex-col gap-3">
          <Block title="4 variantes" note="Callout.tsx">
            <div className="flex flex-col gap-3">
              <Callout variant="info">Ceci est une information importante à lire avant de continuer.</Callout>
              <Callout variant="warning">Attention, cette action peut affecter vos positions SERP.</Callout>
              <Callout variant="error">Erreur critique : le fichier robots.txt bloque Googlebot.</Callout>
              <Callout variant="success">Excellente nouvelle : toutes les pages prioritaires sont indexées.</Callout>
            </div>
          </Block>
        </div>
      </Section>

      <Section id="aiinsight" title="AIInsight">
        <Block title="Encart synthèse IA — border, no bg, icon + text primary" note="AIInsight.tsx">
          <div className="flex flex-col gap-3 max-w-lg">
            <AIInsight>
              Votre score de 72/100 est solide, mais le maillage interne reste le levier prioritaire : 3 pages orphelines captent 40% du trafic sans recevoir de liens internes.
            </AIInsight>
            <AIInsight>
              Le Trust Flow (17) est inférieur de 45% à la médiane concurrente. Une campagne d'acquisition ciblée sur 5 domaines thématiques pourrait combler 60% du gap en 3 mois.
            </AIInsight>
          </div>
        </Block>
      </Section>

      <Section id="kpicard" title="KpiCard">
        <Block title="Cards de métriques — icône lucide 20×20 + label 14px primary + valeur colorée + sous-titre" note="KpiCard.tsx · lucide-react">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <KpiCard icon={Trophy}            label="Score global"       value="72"   sub="/ 100"    valueColor="#3E50F5" />
            <KpiCard icon={LLink}             label="Trust Flow"         value="17"   sub="Majestic" valueColor="#F59E0B" />
            <KpiCard icon={Globe}             label="Domaines référents" value="284"                 valueColor="#10B981" />
            <KpiCard icon={ChartBar}          label="Position moyenne"   value="14.3" sub="SERP" />
            <KpiCard icon={TrendingUp}        label="Trafic estimé"      value="4.2K" sub="/ mois"   valueColor="#3E50F5" />
            <KpiCard icon={FileText}          label="Pages indexées"     value="312"                 valueColor="#10B981" />
            <KpiCard icon={TriangleAlert}     label="Erreurs critiques"  value="7"                   valueColor="#E11D48" />
            <KpiCard icon={MousePointerClick} label="Backlinks"          value="1.8K" />
          </div>
        </Block>
        <Block title="Sans icône — fallback compatible" note="KpiCard.tsx">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <KpiCard label="Score global"       value="72"   sub="/ 100"   valueColor="#3E50F5" />
            <KpiCard label="Trust Flow"         value="17"   sub="Majestic" valueColor="#F59E0B" />
            <KpiCard label="Domaines référents" value="284"                valueColor="#10B981" />
            <KpiCard label="Position moyenne"   value="14.3" sub="SERP" />
          </div>
        </Block>
      </Section>

      <Section id="scorering" title="ScoreRing">
        <Block title="Anneau SVG de score — dynamique couleur selon seuils" note="ScoreRing.tsx">
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <ScoreRing score={82} size={96} />
              <span className="text-[12px] text-[var(--text-muted)]">Bon (≥70)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ScoreRing score={55} size={96} />
              <span className="text-[12px] text-[var(--text-muted)]">Moyen (40–69)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ScoreRing score={28} size={96} />
              <span className="text-[12px] text-[var(--text-muted)]">Critique (&lt;40)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ScoreRing score={0} size={96} />
              <span className="text-[12px] text-[var(--text-muted)]">Non calculé</span>
            </div>
            <div className="flex items-end gap-4">
              <ScoreRing score={72} size={56} strokeWidth={5} />
              <ScoreRing score={72} size={80} strokeWidth={7} />
              <ScoreRing score={72} size={120} strokeWidth={10} />
            </div>
          </div>
        </Block>
      </Section>

      <Section id="segmented" title="SegmentedControl">
        <div className="flex flex-col gap-4">
          <Block title="Switch exclusif pill — rounded-full, 13px, active card + ombre" note="SegmentedControl.tsx">
            <div className="flex flex-col gap-4">
              <SegmentedControl
                options={[
                  { key: "conservateur", label: "Conservateur" },
                  { key: "equilibre", label: "Équilibré" },
                  { key: "agressif", label: "Agressif" },
                ]}
                value="equilibre"
                onChange={() => {}}
                className="max-w-xs"
              />
              <SegmentedControl
                options={[
                  { key: "3m", label: "3 mois" },
                  { key: "6m", label: "6 mois" },
                  { key: "1an", label: "1 an" },
                ]}
                value="6m"
                onChange={() => {}}
                className="w-44"
              />
            </div>
          </Block>
        </div>
      </Section>

      <Section id="kpicard-trend" title="KpiCard — avec tendance">
        <Block title="Icône + label + valeur + sous-titre avec flèche tendance" note="KpiCard.tsx · lucide-react">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <KpiCard icon={TrendingUp}        label="Trafic organique"  value="42 800" sub="+8,4 % vs mois dernier" trend="up" />
            <KpiCard icon={ChartBar}          label="Position moyenne"  value="18,4"   sub="−2,1 pts ce mois"       trend="up" />
            <KpiCard icon={MousePointerClick} label="CTR moyen"         value="3,2 %"  sub="stable"                 trend="neutral" />
            <KpiCard icon={TriangleAlert}     label="Erreurs critiques" value="7"      sub="3 nouvelles ce mois"    trend="down" />
          </div>
        </Block>
      </Section>

      <Section id="deltabadge" title="DeltaBadge">
        <Block title="Badge delta positif / négatif / neutre — automatique" note="DeltaBadge.tsx">
          <div className="flex flex-wrap items-center gap-3">
            <DeltaBadge value={12} />
            <DeltaBadge value={-8} />
            <DeltaBadge value={0} />
            <DeltaBadge value="+3.2K" />
            <DeltaBadge value="-450" />
            <DeltaBadge value={5} positiveIsGood={false} />
            <DeltaBadge value={-3} positiveIsGood={false} />
          </div>
          <p className="mt-3 text-[12px] text-[var(--text-muted)]"><span className="font-mono">positiveIsGood=false</span> — pour les métriques où la hausse est mauvaise (erreurs, temps de chargement…)</p>
        </Block>
      </Section>

      <Section id="progressbar" title="ProgressBar">
        <Block title="Barre de progression — couleur libre, hauteur configurable" note="ProgressBar.tsx">
          <div className="flex flex-col gap-4 max-w-sm">
            <ProgressBar value={72} color="#3E50F5" showLabel />
            <ProgressBar value={45} color="#F59E0B" showLabel />
            <ProgressBar value={88} color="#10B981" showLabel />
            <ProgressBar value={23} color="#E11D48" showLabel />
            <ProgressBar value={60} height={10} color="#6366F1" showLabel />
          </div>
        </Block>
      </Section>

      <Section id="sectionhead" title="SectionHead">
        <Block title="En-tête de section — num · titre · em · meta · slot action" note="SectionHead.tsx">
          <div className="flex flex-col gap-5">
            <SectionHead num="01" title="Benchmark concurrents" meta="10 domaines" />
            <SectionHead num="02" title="Profil des liens" em="follow / nofollow">
              <Button variant="secondary" size="sm">Exporter</Button>
            </SectionHead>
            <SectionHead num="03" title="Évolution Trust Flow" />
          </div>
        </Block>
      </Section>

      <Section id="linedotchart" title="LineDotChart">
        <Block title="Ligne avec points (contour blanc) + dégradé sous le tracé + axe Y" note="LineDotChart.tsx">
          <div className="flex flex-col gap-6 w-full max-w-[420px]">
            <div>
              <p className="mb-2 text-[12px] font-medium text-[var(--text-muted)]">Standard — clics sur 3 mois (plus haut = mieux)</p>
              <LineDotChart
                data={[
                  { val: 31,  date: "2025-12-15" },
                  { val: 49,  date: "2026-02-20" },
                  { val: 64,  date: "2026-04-10" },
                ]}
                formatValue={(v) => Math.round(v).toLocaleString()}
                formatDate={(d) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }).replace(".", "")}
              />
            </div>
            <div>
              <p className="mb-2 text-[12px] font-medium text-[var(--text-muted)]">Inverted — position SERP (plus bas = mieux, donc en haut)</p>
              <LineDotChart
                data={[
                  { val: 35, date: "2025-12-15" },
                  { val: 28, date: "2026-02-20" },
                  { val: 23, date: "2026-04-10" },
                ]}
                invertY
                formatValue={(v) => `#${v.toFixed(1)}`}
                formatDate={(d) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }).replace(".", "")}
              />
            </div>
            <div>
              <p className="mb-2 text-[12px] font-medium text-[var(--text-muted)]">Couleur custom — rouge / erreurs</p>
              <LineDotChart
                data={[
                  { val: 12, date: "2026-01-01" },
                  { val: 18, date: "2026-02-01" },
                  { val: 9,  date: "2026-03-01" },
                  { val: 14, date: "2026-04-01" },
                ]}
                color="#E11D48"
                formatValue={(v) => v.toString()}
                formatDate={(d) => new Date(d).toLocaleDateString("fr-FR", { month: "short" }).replace(".", "")}
              />
            </div>
          </div>
        </Block>
      </Section>

      <Section id="areachart" title="AreaChart">
        <Block title="Courbe area responsive — hover ChartTooltip — inverted pour positions" note="AreaChart.tsx">
          <div className="flex flex-col gap-6 w-full">
            <div>
              <p className="mb-2 text-[12px] font-medium text-[var(--text-muted)]">Standard — trafic / visibilité</p>
              <AreaChart
                data={[
                  { label: "Jan", value: 1200 },
                  { label: "Fév", value: 1450 },
                  { label: "Mar", value: 1380 },
                  { label: "Avr", value: 1600 },
                  { label: "Mai", value: 1750 },
                  { label: "Jun", value: 1900 },
                ]}
                gradientId="sg-area-1"
                height={120}
              />
            </div>
            <div>
              <p className="mb-2 text-[12px] font-medium text-[var(--text-muted)]">Inverted — positions (lower = better = higher on chart) + action dots</p>
              <AreaChart
                data={[
                  { label: "Jan", value: 28 },
                  { label: "Fév", value: 22 },
                  { label: "Mar", value: 18 },
                  { label: "Avr", value: 14 },
                  { label: "Mai", value: 10 },
                  { label: "Jun", value: 7 },
                ]}
                inverted
                gradientId="sg-area-2"
                height={120}
                actionDots={[{ idx: 2 }, { idx: 4 }]}
                formatTooltip={(p) => (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] text-white/60">{p.label}</span>
                    <span className="text-[13px] font-semibold text-white">#{p.value}</span>
                  </div>
                )}
              />
            </div>
            <div>
              <p className="mb-2 text-[12px] font-medium text-[var(--text-muted)]">Rouge — cannibalisations / erreurs</p>
              <AreaChart
                data={[
                  { label: "Jan", value: 12 },
                  { label: "Fév", value: 14 },
                  { label: "Mar", value: 11 },
                  { label: "Avr", value: 9 },
                  { label: "Mai", value: 7 },
                  { label: "Jun", value: 6 },
                ]}
                color="#E11D48"
                gradientId="sg-area-3"
                height={80}
              />
            </div>
          </div>
        </Block>
      </Section>

      <Section id="profiledonut" title="ProfileDonutChart">
        <Block title="Donut profil — arcs gappés + centre + légende latérale + hover tooltip" note="ProfileDonutChart.tsx">
          <div className="flex flex-wrap gap-10">
            <ProfileDonutChart
              data={[
                { label: "Données partielles", value: 4, color: "#F59E0B" },
                { label: "Quick Win",          value: 2, color: "#10B981" },
                { label: "Déficit contenu",    value: 2, color: "#EF4444" },
                { label: "Volume faible",      value: 2, color: "#3B82F6" },
                { label: "Mature",             value: 1, color: "#8B5CF6" },
              ]}
              centerLabel="URLs"
            />
          </div>
        </Block>
      </Section>

      <Section id="donutchart" title="DonutChart">
        <Block title="Donut SVG arc-path — hover tooltip — center ReactNode" note="DonutChart.tsx">
          <div className="flex flex-wrap gap-8">
            <div className="flex flex-col items-center gap-3">
              <DonutChart
                slices={[
                  { label: "Follow",   value: 71, color: "#3E50F5" },
                  { label: "Nofollow", value: 29, color: "#94A3B8" },
                ]}
                size={112}
                center={<div className="text-center"><p className="text-[20px] font-semibold text-[var(--text-primary)]">71%</p><p className="text-[10px] text-[var(--text-muted)]">follow</p></div>}
              />
              <p className="text-[12px] text-[var(--text-muted)]">Follow / Nofollow</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <DonutChart
                slices={[
                  { label: "Bloqueur",     value: 5,  color: "#E11D48" },
                  { label: "Opportunité",  value: 12, color: "#3E50F5" },
                  { label: "OK",           value: 83, color: "#10B981" },
                ]}
                size={112}
                center={<span className="text-[18px] font-semibold text-[var(--text-primary)]">100</span>}
                formatTooltip={(s, pct) => (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[12px] font-semibold text-white">{s.label}</span>
                    <span className="text-[11px] text-white/60">{s.value} pages — {pct}%</span>
                  </div>
                )}
              />
              <p className="text-[12px] text-[var(--text-muted)]">3 segments + tooltip custom</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <DonutChart
                slices={[
                  { label: "Marque",    value: 59, color: "#E11D48" },
                  { label: "Autre",     value: 27, color: "#F59E0B" },
                  { label: "Générique", value: 14, color: "#10B981" },
                ]}
                size={84}
                strokeWidth={7}
                gap={4}
              />
              <p className="text-[12px] text-[var(--text-muted)]">Petit (84px) — gap réduit</p>
            </div>
          </div>
        </Block>
      </Section>

      <Section id="sparkline" title="Sparkline">
        <Block title="Mini graphe inline — normal et inverted (positions)" note="Sparkline.tsx">
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex flex-col gap-1.5 items-center">
              <Sparkline data={[10, 14, 12, 18, 22, 20, 25]} />
              <p className="text-[11px] text-[var(--text-muted)]">Trafic — normal</p>
            </div>
            <div className="flex flex-col gap-1.5 items-center">
              <Sparkline data={[14, 11, 9, 7, 6, 5, 4]} inverted />
              <p className="text-[11px] text-[var(--text-muted)]">Position — inverted</p>
            </div>
            <div className="flex flex-col gap-1.5 items-center">
              <Sparkline data={[10, 14, 12, 18, 22, 20, 25]} color="#10B981" width={80} height={30} />
              <p className="text-[11px] text-[var(--text-muted)]">Vert — 80×30</p>
            </div>
            <div className="flex flex-col gap-1.5 items-center">
              <Sparkline data={[22, 18, 15, 12, 10, 9, 8]} color="#E11D48" inverted width={56} height={22} />
              <p className="text-[11px] text-[var(--text-muted)]">Rouge — position améliorée</p>
            </div>
            <div className="flex flex-col gap-1.5 items-center">
              <Sparkline data={[5]} />
              <p className="text-[11px] text-[var(--text-muted)]">&lt; 2 pts — tiret</p>
            </div>
          </div>
        </Block>
      </Section>
    </>
  );
}

/* ── Tab config ──────────────────────────────────────────────────────── */

type ViewKey = "fondations" | "atomes" | "molecules";

const VIEWS: { key: ViewKey; label: string }[] = [
  { key: "fondations", label: "Fondations" },
  { key: "atomes",     label: "Atomes" },
  { key: "molecules",  label: "Molécules" },
];

/* ── Page ────────────────────────────────────────────────────────────── */

export default function StyleGuidePage() {
  const [view, setView] = useState<ViewKey>("fondations");

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <header className="sticky top-0 z-10 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/90 px-8 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-[19px] font-semibold text-[var(--text-primary)]">Design System</h1>
            <p className="text-[12px] text-[var(--text-secondary)]">
              Tokens · Atomes · Molécules ·{" "}
              <span className="font-mono text-[var(--text-muted)]">tokens-brand.css</span>
            </p>
          </div>
          <ThemeToggle />
        </div>

        <nav className="mx-auto mt-4 flex max-w-6xl items-center gap-1">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-all ${
                view === v.key
                  ? "bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {v.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-8">
        {view === "fondations" && <ViewFondations />}
        {view === "atomes"     && <ViewAtomes />}
        {view === "molecules"  && <ViewMolecules />}

        <div className="py-12 text-center text-[12px] text-[var(--text-muted)]">
          Source :{" "}
          <span className="font-mono">tokens-brand.css</span> ·{" "}
          <span className="font-mono">src/components/</span>
        </div>
      </main>
    </div>
  );
}
