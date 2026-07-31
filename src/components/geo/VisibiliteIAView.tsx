"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { SparklesIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/Button";
import { RangeCalendar } from "@/components/RangeCalendar";
import { ColPill } from "@/components/ColPill";
import { DropdownHeader, DropdownItem } from "@/components/DropdownMenu";
import { ResetFiltersButton } from "@/components/ResetFiltersButton";
import { SetupWizard } from "@/components/geo/SetupWizard";
import { LaunchScreen } from "@/components/geo/LaunchScreen";
import { DEFAULT_SETUP } from "@/components/geo/data";
import { PLATFORM_LABEL, PLATFORM_DOMAIN } from "@/components/geo/analytics";
import { GEO_VIEWS, type GeoView } from "@/components/geo/nav";
import { DEFAULT_GEO_FILTERS, type GeoSetup, type GeoFilters, type LlmPlatform } from "@/components/geo/types";
import { listColor } from "@/components/geo/ui";
import { Favicon } from "@/components/geo/views/OverviewView";
import { OverviewView } from "@/components/geo/views/OverviewView";
import { VisibilityView } from "@/components/geo/views/VisibilityView";
import { ConcurrentsView } from "@/components/geo/views/ConcurrentsView";
import { PromptsView } from "@/components/geo/views/PromptsView";
import { SentimentView } from "@/components/geo/views/SentimentView";
import { CitationsView } from "@/components/geo/views/CitationsView";
import { GeoSettingsView } from "@/components/geo/views/GeoSettingsView";

const CARD = "rounded-2xl border border-[var(--border-subtle)]";

export function VisibiliteIAView({ domain }: { domain: string }) {
  // Socle mock : pré-configuré par défaut pour atterrir direct sur le dashboard
  // (le wizard reste accessible via « Reconfigurer »). Mettre `null` pour revoir
  // le flux premier lancement (état vide → config → génération).
  const [setup, setSetup] = useState<GeoSetup | null>(DEFAULT_SETUP);
  const [configuring, setConfiguring] = useState(false);
  const [launching, setLaunching] = useState(false);

  // Filtres globaux partagés par toutes les sous-vues.
  const [filters, setFilters] = useState<GeoFilters>(DEFAULT_GEO_FILTERS);
  const setFilter = (patch: Partial<GeoFilters>) => setFilters((f) => ({ ...f, ...patch }));

  // Vue active pilotée par l'URL (?view=) — permet à la sidebar de naviguer dedans.
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const viewParam = searchParams.get("view");
  const view: GeoView = GEO_VIEWS.some((v) => v.key === viewParam) ? (viewParam as GeoView) : "overview";
  const setView = (v: GeoView) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("view", v);
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  };

  // ── Wizard ──────────────────────────────────────────────────────────
  if (configuring) {
    return (
      <SetupWizard
        domain={domain}
        onFinish={(s) => { setSetup(s); setConfiguring(false); setView("overview"); setLaunching(true); }}
        onCancel={() => setConfiguring(false)}
      />
    );
  }

  // ── Écran de génération (transition wizard → dashboard) ─────────────
  if (launching && setup) {
    return <LaunchScreen setup={setup} domain={domain} onDone={() => setLaunching(false)} />;
  }

  // ── État vide (non configuré) — centré, sans encart ─────────────────
  if (!setup) {
    return (
      <div className="flex min-h-[58vh] flex-col items-center justify-center px-8 text-center">
        {/* Cluster de logos LLM — tuiles flottantes (chatgpt centré, gemini/copilot) */}
        <div className="mb-7 flex items-end justify-center gap-3">
          {[
            { src: "/llm/gemini.svg",    alt: "Gemini",  size: 64, delay: "0.2s", dur: "3.4s" },
            { src: "/llm/chatgpt.svg",   alt: "ChatGPT", size: 92, delay: "0s",   dur: "3s"   },
            { src: "/llm/microsoft.svg", alt: "Copilot", size: 64, delay: "0.5s", dur: "3.6s" },
          ].map((t) => (
            <img
              key={t.alt}
              src={t.src}
              alt={t.alt}
              width={t.size}
              height={t.size}
              className="flex-shrink-0"
              style={{
                width: t.size, height: t.size,
                filter: "drop-shadow(0 10px 24px rgba(15,23,42,0.10))",
                animation: `geo-float ${t.dur} ease-in-out ${t.delay} infinite`,
              }}
            />
          ))}
        </div>
        <h1 className="type-h2">
          Suivez votre présence dans les réponses IA
        </h1>
        <p className="mt-2 max-w-md type-body text-[var(--text-secondary)]">
          Mesurez si {domain} est cité par ChatGPT, Perplexity, Gemini ou Claude, comparez-vous à vos concurrents, et identifiez les opportunités de visibilité.
        </p>
        <div className="mt-6">
          <Button onClick={() => setConfiguring(true)}>
            Configurer la Visibilité IA
          </Button>
        </div>
      </div>
    );
  }

  // ── État configuré (dashboard) ──────────────────────────────────────
  const ActiveView =
    view === "overview"   ? <OverviewView   setup={setup} domain={domain} onNavigate={(v) => setView(v as GeoView)} /> :
    view === "visibility" ? <VisibilityView setup={setup} domain={domain} /> :
    view === "concurrents" ? <ConcurrentsView setup={setup} domain={domain} /> :
    view === "prompts"    ? <PromptsView    setup={setup} domain={domain} filters={filters} setFilter={setFilter} /> :
    view === "sentiment"  ? <SentimentView  setup={setup} domain={domain} /> :
    view === "citations"  ? <CitationsView  setup={setup} domain={domain} /> :
    view === "settings"   ? <GeoSettingsView setup={setup} onSave={setSetup} onReconfigure={() => setConfiguring(true)} /> :
    <ComingSoon label={GEO_VIEWS.find((v) => v.key === view)?.label ?? ""} />;

  return (
    <div className="flex flex-col gap-5">
      {/* Filtres globaux partagés — barre FIXED (portail), calée en haut du contenu, sur toutes
          les sous-vues SAUF la vue d'ensemble (qui n'utilise pas ces filtres). */}
      {view !== "overview" && view !== "settings" && (
        <GeoFilterDock>
          <GeoFilterBar setup={setup} filters={filters} setFilter={setFilter} />
        </GeoFilterDock>
      )}

      {/* En-tête : titre de la vue active (la nav des sous-vues est dans la sidebar ;
          la reconfiguration se fait depuis Paramètres → « Réinitialiser mon analyse »).
          Masqué pour la vue Paramètres, qui gère son propre layout façon page de réglages. */}
      {view !== "settings" && (
        <div className="flex items-center gap-3">
          <h1 className="type-h1 leading-none">
            {GEO_VIEWS.find((v) => v.key === view)?.label}
          </h1>
        </div>
      )}

      {/* Vue active */}
      <div key={view} className="page-enter">{ActiveView}</div>
    </div>
  );
}

/* ── Dock fixed de la barre de filtres ──────────────────────────────────
 * On portale la barre vers <body> en `position: fixed`, calée sur le conteneur
 * de scroll de l'app (top sous la Topbar, left/width = zone de contenu, donc
 * elle suit la largeur de la sidebar). Un spacer en flux réserve la hauteur.
 * Raison : le wrapper d'onglet (.t-tab-enter) porte `will-change/transform/filter`
 * → il capturerait un `fixed` interne et le ferait défiler. Le portail l'évite. */
function GeoFilterDock({ children }: { children: ReactNode }) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const [barH, setBarH] = useState(57);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const scroller = anchor.closest<HTMLElement>(".overflow-y-auto") ?? document.documentElement;
    const measure = () => {
      const r = scroller.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width });
      if (barRef.current) setBarH(barRef.current.offsetHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(scroller);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, []);

  return (
    <>
      {/* Spacer en flux : réserve la hauteur de la barre fixed (et ancre la mesure). */}
      <div ref={anchorRef} aria-hidden className="-mt-5" style={{ height: barH }} />
      {rect && typeof document !== "undefined" && createPortal(
        <div
          ref={barRef}
          className="fixed z-30 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] px-5 py-3"
          style={{ top: rect.top, left: rect.left, width: rect.width }}
        >
          {children}
        </div>,
        document.body,
      )}
    </>
  );
}

/* ── Sous-vues du module (GEO_VIEWS / GeoView importés de geo/nav) ──────── */

function ComingSoon({ label }: { label: string }) {
  return (
    <div className={`${CARD} flex flex-col items-center px-8 py-16 text-center`}>
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]">
        <SparklesIcon className="h-6 w-6" />
      </span>
      <p className="type-h3">{label} — bientôt</p>
      <p className="mt-1.5 max-w-md type-body text-[var(--text-secondary)]">
        Cette vue arrive dans une prochaine étape. La Vue d'ensemble, la Visibilité et les Prompts sont déjà disponibles.
      </p>
    </div>
  );
}

/* ── Barre de filtres globale (Période · Modèles · Listes · Concurrent) ───
   État remonté dans VisibiliteIAView → partagé par toutes les sous-vues. */

const GEO_PERIODS = [
  { value: "7j",  label: "7 derniers jours" },
  { value: "30j", label: "30 derniers jours" },
  { value: "90j", label: "90 derniers jours" },
];

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });

function GeoFilterBar({ setup, filters, setFilter }: { setup: GeoSetup; filters: GeoFilters; setFilter: (patch: Partial<GeoFilters>) => void }) {
  const periodLabel = filters.period === "custom" && filters.dateStart
    ? `${fmtDate(filters.dateStart)} – ${fmtDate(filters.dateEnd ?? filters.dateStart)}`
    : GEO_PERIODS.find((p) => p.value === filters.period)?.label ?? "Période";

  const platformLabel = filters.platforms.length === 0 ? "Toutes les modèles IA"
    : filters.platforms.length === 1 ? PLATFORM_LABEL(filters.platforms[0] as LlmPlatform)
    : `${filters.platforms.length} modèles`;
  const listLabel = filters.lists.length === 0 ? "Tous les sujets"
    : filters.lists.length === 1 ? (setup.lists.find((l) => l.id === filters.lists[0])?.name ?? "Liste")
    : `${filters.lists.length} listes`;
  const compLabel = filters.competitors.length === 0 ? "Tous les concurrents"
    : filters.competitors.length === 1 ? (setup.competitors.find((c) => c.id === filters.competitors[0])?.name ?? "Concurrent")
    : `${filters.competitors.length} concurrents`;

  const toggle = (key: "platforms" | "lists" | "competitors", val: string) =>
    setFilter({ [key]: filters[key].includes(val) ? filters[key].filter((x) => x !== val) : [...filters[key], val] } as Partial<GeoFilters>);

  const dirty = filters.period !== "30j" || !!filters.dateStart || filters.platforms.length > 0 || filters.lists.length > 0 || filters.competitors.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ColPill name="Période" label={periodLabel} active={filters.period !== "30j" || !!filters.dateStart} width={300}>
        {(close) => <PeriodBody filters={filters} setFilter={setFilter} close={close} />}
      </ColPill>

      <ColPill name="Modèle" label={platformLabel} active={filters.platforms.length > 0}>
        {() => (
          <>
            <DropdownHeader>Filtrer par modèle</DropdownHeader>
            {setup.platforms.map((p) => (
              <DropdownItem key={p} checkbox keepOpen selected={filters.platforms.includes(p)} onClick={() => toggle("platforms", p)}>
                <span className="inline-flex items-center gap-2"><Favicon domain={PLATFORM_DOMAIN(p)} size={16} />{PLATFORM_LABEL(p)}</span>
              </DropdownItem>
            ))}
          </>
        )}
      </ColPill>

      <ColPill name="Liste" label={listLabel} active={filters.lists.length > 0}>
        {() => (
          <>
            <DropdownHeader>Filtrer par liste</DropdownHeader>
            {setup.lists.map((l) => (
              <DropdownItem key={l.id} checkbox keepOpen selected={filters.lists.includes(l.id)} onClick={() => toggle("lists", l.id)}>
                <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: listColor(l.id) }} />{l.name}</span>
              </DropdownItem>
            ))}
          </>
        )}
      </ColPill>

      <ColPill name="Concurrent" label={compLabel} active={filters.competitors.length > 0}>
        {() => (
          <>
            <DropdownHeader>Filtrer par concurrent</DropdownHeader>
            {setup.competitors.map((c) => (
              <DropdownItem key={c.id} checkbox keepOpen selected={filters.competitors.includes(c.id)} onClick={() => toggle("competitors", c.id)}>
                <span className="inline-flex items-center gap-2"><Favicon domain={c.domain} size={16} />{c.name}</span>
              </DropdownItem>
            ))}
          </>
        )}
      </ColPill>

      <ResetFiltersButton show={dirty} onReset={() => setFilter(DEFAULT_GEO_FILTERS)} />
    </div>
  );
}

/* ── Filtre de période : 3 presets + calendrier de plage personnalisée ──── */

function PeriodBody({ filters, setFilter, close }: { filters: GeoFilters; setFilter: (patch: Partial<GeoFilters>) => void; close: () => void }) {
  const [start, setStart] = useState<string | undefined>(filters.dateStart);
  const [end, setEnd] = useState<string | undefined>(filters.dateEnd);

  const preset = (p: string) => { setFilter({ period: p, dateStart: undefined, dateEnd: undefined }); close(); };
  const apply = () => { if (start) { setFilter({ period: "custom", dateStart: start, dateEnd: end ?? start }); close(); } };

  return (
    <div className="flex flex-col gap-1">
      {GEO_PERIODS.map((p) => {
        const on = filters.period === p.value && !filters.dateStart;
        return (
          <button key={p.value} type="button" onClick={() => preset(p.value)}
            className={`flex items-center justify-between rounded-xl px-3 py-2 type-body-strong transition-colors hover:bg-[var(--dropdown-hover)] ${on ? "text-[var(--accent-primary)]" : "text-[var(--text-primary)]"}`}>
            {p.label}{on && <CheckIcon className="h-4 w-4" strokeWidth={2.5} />}
          </button>
        );
      })}
      <div className="my-1.5 border-t border-[var(--border-subtle)]" />
      <p className="px-2 pb-1 type-caption">Dates personnalisées</p>
      <RangeCalendar from={start} to={end} onChange={(f, t) => { setStart(f); setEnd(t); }} />
      <div className="mt-1 flex items-center justify-between px-1">
        <span className="type-caption text-[var(--text-muted)]">{start ? `${fmtDate(start)}${end && end !== start ? ` – ${fmtDate(end)}` : ""}` : "Choisir une plage"}</span>
        <Button size="sm" onClick={apply} disabled={!start}>Appliquer</Button>
      </div>
    </div>
  );
}

