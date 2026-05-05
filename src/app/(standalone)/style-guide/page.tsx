"use client";

import ThemeToggle from "@/components/ThemeToggle";
import { Button, LinkButton } from "@/components/Button";
import { Tooltip } from "@/components/Tooltip";
import { FlipCard } from "@/components/FlipCard";

/* ── Token data ──────────────────────────────────────────────────────── */

const colorGroups = [
  {
    title: "Surfaces",
    description: "Fonds de page, cards et conteneurs",
    tokens: [
      { var: "--bg-primary",    tw: "bg-bg-primary" },
      { var: "--bg-secondary",  tw: "bg-bg-secondary" },
      { var: "--bg-card",       tw: "bg-bg-card" },
      { var: "--bg-card-hover", tw: "bg-bg-card-hover" },
      { var: "--bg-sidebar",    tw: "bg-bg-sidebar" },
      { var: "--bg-overlay",    tw: "bg-bg-overlay" },
      { var: "--card-inner-bg", tw: "bg-card-inner-bg" },
      { var: "--modal-bg",      tw: "bg-modal-bg" },
      { var: "--input-bg",      tw: "bg-input-bg" },
    ],
  },
  {
    title: "Bordures",
    description: "Lignes et séparateurs",
    tokens: [
      { var: "--border-subtle", tw: "border-border-subtle" },
      { var: "--border-badge",  tw: "border-border-badge" },
      { var: "--border-medium", tw: "border-border-medium" },
    ],
  },
  {
    title: "Texte",
    description: "Hiérarchie typographique",
    tokens: [
      { var: "--text-primary",   tw: "text-text-primary" },
      { var: "--text-heading",   tw: "text-text-heading" },
      { var: "--text-secondary", tw: "text-text-secondary" },
      { var: "--text-muted",     tw: "text-text-muted" },
      { var: "--text-input",     tw: "text-text-input" },
    ],
  },
  {
    title: "Accent",
    description: "Rose de marque #C5064D et variantes soft",
    tokens: [
      { var: "--accent-primary",      tw: "bg-accent-primary" },
      { var: "--accent-primary-soft", tw: "bg-accent-primary-soft" },
      { var: "--accent-primary-mid",  tw: "bg-accent-primary-mid" },
    ],
  },
  {
    title: "Statuts",
    description: "Sémantique fonctionnelle",
    tokens: [
      { var: "--color-success", tw: "bg-success" },
      { var: "--color-warning", tw: "bg-warning" },
      { var: "--color-danger",  tw: "bg-danger" },
    ],
  },
];

const fontSizes = [
  { token: "--text-xs",      size: "11px", note: "Micro labels, badges" },
  { token: "--text-sm",      size: "12px", note: "Captions, sous-labels" },
  { token: "--text-md",      size: "13px", note: "Body small" },
  { token: "--text-base",    size: "14px", note: "Body, boutons" },
  { token: "--text-body",    size: "15px", note: "Paragraphes par défaut" },
  { token: "--text-body-lg", size: "16px", note: "H3 cards" },
  { token: "--text-lg",      size: "20px", note: "Titres section" },
  { token: "--text-xl",      size: "24px", note: "Titres page" },
  { token: "--text-2xl",     size: "32px", note: "Gros nombres / KPI" },
  { token: "--text-display", size: "60px", note: "H1 cover" },
];

const fontWeights = [
  { label: "Light",    weight: 300 },
  { label: "Regular",  weight: 400 },
  { label: "Medium",   weight: 500 },
  { label: "Semibold", weight: 600 },
  { label: "Bold",     weight: 700 },
];

const fontFamilies = [
  { name: "Outfit (sans)",     varName: "--font-outfit" },
  { name: "Instrument Serif",  varName: "--font-instrument-serif" },
  { name: "Manrope",           varName: "--font-manrope" },
  { name: "Space Grotesk",     varName: "--font-space-grotesk" },
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
  { label: "sm",   value: "6px" },
  { label: "md",   value: "8px" },
  { label: "xl",   value: "12px" },
  { label: "2xl",  value: "16px" },
  { label: "3xl",  value: "24px" },
  { label: "full", value: "9999px" },
];

const shadows = [
  { token: "--shadow-card",     note: "Cards — ombre portée subtile" },
  { token: "--shadow-floating", note: "Drawers, dropdowns, modales" },
  { token: "--shadow-cta",      note: "Bouton primary — teinté rose" },
];

const easings = [
  { token: "--ease-out",    value: "cubic-bezier(0.23, 1, 0.32, 1)",   note: "Sortie douce — défaut" },
  { token: "--ease-in-out", value: "cubic-bezier(0.77, 0, 0.175, 1)",  note: "Symétrique" },
  { token: "--ease-expo",   value: "cubic-bezier(0.16, 1, 0.3, 1)",    note: "Expo — entrées sidebar / drawer" },
];

const durations = [
  { token: "--motion-instant", value: "100ms",  note: "Réactions instantanées" },
  { token: "--motion-fast",    value: "200ms",  note: "Hovers, micro-interactions" },
  { token: "--motion-base",    value: "300ms",  note: "Transitions standard" },
  { token: "--motion-slow",    value: "600ms",  note: "Entrées, fade-up" },
  { token: "--motion-slowest", value: "1200ms", note: "Animations à fort impact" },
];

const sections = [
  { id: "colors",     label: "Couleurs" },
  { id: "typography", label: "Typographie" },
  { id: "spacing",    label: "Espacements" },
  { id: "radius",     label: "Coins" },
  { id: "shadows",    label: "Ombres" },
  { id: "motion",     label: "Mouvement" },
  { id: "components", label: "Composants" },
];

/* ── Layout helpers ──────────────────────────────────────────────────── */

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="border-t border-[var(--border-subtle)] py-12">
      <h2 className="mb-6 text-[24px] font-medium tracking-tight text-[var(--text-primary)]">{title}</h2>
      {children}
    </section>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
      <p className="mb-4 text-[11px] font-medium text-[var(--text-muted)]">{title}</p>
      {children}
    </div>
  );
}

function Swatch({ varName, tw }: { varName: string; tw: string }) {
  const isText   = tw.startsWith("text-");
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
      <div className="font-mono text-[10px] text-[var(--text-muted)]">{tw}</div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────── */

export default function StyleGuidePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/90 px-8 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-[20px] font-medium tracking-tight text-[var(--text-primary)]">Design System</h1>
            <p className="text-[12px] text-[var(--text-secondary)]">
              Tokens, typographie, composants ·{" "}
              <span className="font-mono text-[var(--text-muted)]">tokens-brand.css</span>
            </p>
          </div>
          <ThemeToggle />
        </div>
        <nav className="mx-auto mt-4 flex max-w-6xl flex-wrap gap-1">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-full border border-[var(--border-subtle)] bg-[var(--card-inner-bg)] px-3 py-1 text-[12px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-medium)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
            >
              {s.label}
            </a>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-8">

        {/* ── Colors ── */}
        <Section id="colors" title="Couleurs">
          <div className="flex flex-col gap-10">
            {colorGroups.map((group) => (
              <div key={group.title}>
                <h3 className="mb-1 text-[16px] font-medium text-[var(--text-heading)]">{group.title}</h3>
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

        {/* ── Typography ── */}
        <Section id="typography" title="Typographie">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h3 className="mb-3 text-[16px] font-medium text-[var(--text-heading)]">Familles</h3>
              <div className="flex flex-col gap-3">
                {fontFamilies.map((f) => (
                  <div
                    key={f.varName}
                    className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4"
                    style={{ fontFamily: `var(${f.varName})` }}
                  >
                    <div className="text-[24px] text-[var(--text-primary)]">{f.name}</div>
                    <div className="mt-1 font-mono text-[11px] text-[var(--text-muted)]">{f.varName}</div>
                    <div className="mt-2 text-[14px] text-[var(--text-secondary)]">
                      The quick brown fox jumps over the lazy dog · 0123456789
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-[16px] font-medium text-[var(--text-heading)]">Échelle</h3>
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
                {fontSizes.map((s) => (
                  <div key={s.token} className="flex items-baseline gap-4 border-b border-[var(--border-subtle)] py-2 last:border-0">
                    <div className="w-32 shrink-0">
                      <div className="font-mono text-[11px] text-[var(--text-secondary)]">{s.token}</div>
                      <div className="font-mono text-[10px] tabular-nums text-[var(--text-muted)]">{s.size}</div>
                    </div>
                    <span className="flex-1 text-[var(--text-primary)]" style={{ fontSize: s.size }}>Aa</span>
                    <span className="text-[11px] text-[var(--text-secondary)]">{s.note}</span>
                  </div>
                ))}
              </div>

              <h3 className="mb-3 mt-8 text-[16px] font-medium text-[var(--text-heading)]">Graisses</h3>
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
                {fontWeights.map((w) => (
                  <div key={w.label} className="flex items-baseline justify-between border-b border-[var(--border-subtle)] py-2 last:border-0">
                    <span className="text-[15px] text-[var(--text-primary)]" style={{ fontWeight: w.weight }}>{w.label}</span>
                    <span className="font-mono text-[11px] text-[var(--text-muted)]">{w.weight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── Spacing ── */}
        <Section id="spacing" title="Espacements">
          <p className="mb-4 text-[13px] text-[var(--text-secondary)]">
            Échelle Tailwind par incréments de 4px. À utiliser pour padding, margin, gap.
          </p>
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
            {spacings.map((s) => (
              <div key={s.label} className="flex items-center gap-4 border-b border-[var(--border-subtle)] py-2 last:border-0">
                <span className="w-12 font-mono text-[12px] tabular-nums text-[var(--text-muted)]">{s.label}</span>
                <div className="h-3 rounded-sm bg-accent-primary" style={{ width: s.value }} />
                <span className="font-mono text-[11px] text-[var(--text-muted)]">{s.value}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Radius ── */}
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

        {/* ── Shadows ── */}
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

        {/* ── Motion ── */}
        <Section id="motion" title="Mouvement">
          <h3 className="mb-3 text-[16px] font-medium text-[var(--text-heading)]">Easings</h3>
          <div className="mb-8 grid gap-3 md:grid-cols-3">
            {easings.map((e) => (
              <div key={e.token} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
                <div className="font-mono text-[13px] text-[var(--text-primary)]">{e.token}</div>
                <div className="mt-1 text-[11px] text-[var(--text-secondary)]">{e.note}</div>
                <div className="mt-3 font-mono text-[9px] text-[var(--text-muted)]">{e.value}</div>
              </div>
            ))}
          </div>
          <h3 className="mb-3 text-[16px] font-medium text-[var(--text-heading)]">Durées</h3>
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

        {/* ── Components ── */}
        <Section id="components" title="Composants">
          <div className="flex flex-col gap-6">

            {/* Button */}
            <Block title="Button — variantes">
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>
            </Block>

            <Block title="Button — tailles">
              <div className="flex flex-wrap items-end gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </Block>

            <Block title="Button — états disabled">
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary"  disabled>Primary</Button>
                <Button variant="secondary" disabled>Secondary</Button>
                <Button variant="ghost"    disabled>Ghost</Button>
                <Button variant="danger"   disabled>Danger</Button>
              </div>
            </Block>

            <Block title="LinkButton">
              <div className="flex flex-wrap items-center gap-3">
                <LinkButton href="#" variant="primary">Primary link</LinkButton>
                <LinkButton href="#" variant="secondary">Secondary link</LinkButton>
                <LinkButton href="#" variant="ghost">Ghost link</LinkButton>
              </div>
            </Block>

            {/* Badges */}
            <Block title="Badges — statuts">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[var(--color-success)]/20 bg-[var(--color-success)]/10 px-2.5 py-0.5 text-[11px] font-medium text-[var(--color-success)]">Succès</span>
                <span className="rounded-full border border-[var(--color-warning)]/20 bg-[var(--color-warning)]/10 px-2.5 py-0.5 text-[11px] font-medium text-[var(--color-warning)]">Attention</span>
                <span className="rounded-full border border-[var(--color-danger)]/20  bg-[var(--color-danger)]/10  px-2.5 py-0.5 text-[11px] font-medium text-[var(--color-danger)]">Critique</span>
                <span className="rounded-full border border-[var(--border-medium)] bg-[var(--accent-primary-soft)] px-2.5 py-0.5 text-[11px] font-medium text-accent-primary">Marque</span>
              </div>
            </Block>

            {/* Card */}
            <Block title="Card">
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)] transition-all hover:border-[var(--border-medium)] hover:shadow-[var(--shadow-floating)]">
                <div className="text-[16px] font-medium text-[var(--text-heading)]">Titre de la card</div>
                <p className="mt-2 text-[14px] text-[var(--text-secondary)]">
                  Pattern : <span className="font-mono text-[var(--text-muted)]">rounded-2xl border border-[--border-subtle] bg-[--bg-card] p-5</span>
                </p>
              </div>
            </Block>

            {/* FlipCard */}
            <Block title="FlipCard — survol pour retourner">
              <div className="grid grid-cols-2 gap-4 h-48">
                <FlipCard
                  front={
                    <div className="flex h-full flex-col justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
                      <span className="text-[11px] text-[var(--text-muted)]">Face avant</span>
                      <p className="text-[16px] font-semibold text-[var(--text-primary)]">Survolez-moi</p>
                    </div>
                  }
                  back={
                    <div className="flex h-full flex-col justify-between rounded-xl bg-accent-primary p-4">
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

            {/* Tooltip */}
            <Block title="Tooltip — 4 directions">
              <div className="flex flex-wrap items-center gap-8">
                {(["right", "top", "bottom", "left"] as const).map((side) => (
                  <Tooltip key={side} label={`Tooltip ${side}`} side={side}>
                    <Button variant="secondary" size="sm">{side}</Button>
                  </Tooltip>
                ))}
              </div>
            </Block>

            {/* Input */}
            <Block title="Input">
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="État par défaut..."
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--card-inner-bg)] px-4 py-2.5 text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] transition-colors focus:border-[var(--border-medium)] focus:bg-[var(--bg-card)]"
                />
                <input
                  type="text"
                  placeholder="État désactivé..."
                  disabled
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--card-inner-bg)] px-4 py-2.5 text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] opacity-40 cursor-not-allowed"
                />
              </div>
            </Block>

          </div>
        </Section>

        <div className="py-12 text-center text-[12px] text-[var(--text-muted)]">
          Source : <span className="font-mono">tokens-brand.css</span> · <span className="font-mono">tokens-core.css</span>
        </div>
      </main>
    </div>
  );
}
