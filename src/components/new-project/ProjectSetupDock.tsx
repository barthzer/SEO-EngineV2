"use client";

/**
 * ProjectSetupDock — confirmation du projet pendant que l'étude tourne.
 *
 * Panneau flottant ancré en bas à droite (porté en portail), NON bloquant :
 * l'utilisateur explore son projet pendant l'étude. En-tête = progression de l'étude
 * (anneau, phase, temps restant) + « Réduire ». Réduit, il devient une pastille qui le
 * rouvre en un clic. Une fois l'étude finie, le dock disparaît de lui-même (dès que
 * l'utilisateur n'est plus en train de répondre).
 *
 * Accueil = 3 vérifications pré-remplies à partir du site. Chacune s'ouvre en vue
 * détail avec un bouton retour (pas d'accordéon) :
 *  1. Profil SEO : nom exact de la marque, langue, type de marché ;
 *  2. Activité et offres ;
 *  3. Les 5 concurrents principaux proposés, à valider.
 * Quand les 3 sont confirmées : message de réassurance, puis le panneau se réduit
 * tout seul en pastille (en pause tant que la souris est dessus).
 * Données : `src/data/project-setup.ts`.
 */

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, ChevronDown, ChevronRight, Earth, Store, Users, MapPin, Flag as FlagIcon, Globe, Info, X } from "lucide-react";
import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { DropdownMenu, DropdownItem } from "@/components/DropdownMenu";
import { Input } from "@/components/parametres/settingsUi";
import { Flag } from "@/components/Flag";
import { Tooltip } from "@/components/Tooltip";
import { fieldCls } from "@/components/analyse/modals/shared";
import {
  getSetupSuggestions, STUDY_PHASES, STUDY_DURATION_MS, COUNTRIES, COUNTRY_CODE, LANGUAGES, CITIES,
  type MarketType, type SetupStepKey,
} from "@/data/project-setup";

const STEPS: { key: SetupStepKey; title: string; icon: typeof Earth }[] = [
  { key: "profile", title: "Profil SEO", icon: Earth },
  { key: "activity", title: "Activité et offres", icon: Store },
  { key: "competitors", title: "Concurrents", icon: Users },
];

const MARKETS: { key: MarketType; label: string; desc: string; icon: typeof MapPin }[] = [
  { key: "city", label: "Local", desc: "Une ou plusieurs villes", icon: MapPin },
  { key: "national", label: "National", desc: "Tout le pays", icon: FlagIcon },
  { key: "international", label: "International", desc: "Plusieurs pays", icon: Globe },
];

/** Délai avant que le panneau se réduise après le message de réassurance
 *  (en pause tant que la souris est sur le panneau). */
const THANKS_MS = 5000;
/** Morph panneau ⇄ pastille. */
const MORPH_MS = 460;
const MORPH_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const PANEL_W = "min(400px, calc(100vw - 40px))";
/** Largeur intérieure (bordure de 1 px de chaque côté exclue, box-sizing: border-box). */
const PANEL_INNER_W = "calc(min(400px, calc(100vw - 40px)) - 2px)";
const PILL_H = 52;

/* ── Briques ─────────────────────────────────────────────────────────── */

/** Progression de l'étude : anneau bleu ; terminée, pastille verte pleine avec coche blanche. */
function ProgressRing({ pct, size = 32 }: { pct: number; size?: number }) {
  if (pct >= 100) {
    return (
      <span className="flex flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-success)]" style={{ width: size, height: size }}>
        <Check className="text-white" style={{ width: size * 0.5, height: size * 0.5 }} strokeWidth={2.6} />
      </span>
    );
  }
  const r = (size - 4) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative flex flex-shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border-subtle)" strokeWidth={3} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--accent-primary)" strokeWidth={3} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)}
          style={{ transition: "stroke-dashoffset 600ms ease" }}
        />
      </svg>
    </span>
  );
}

/** Hauteur animée : le panneau s'ajuste en douceur quand son contenu change. */
function AnimatedHeight({ children }: { children: ReactNode }) {
  const inner = useRef<HTMLDivElement>(null);
  const [h, setH] = useState<number | undefined>(undefined);
  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div className="min-h-0 overflow-hidden" style={{ height: h, transition: "height 320ms cubic-bezier(0.16, 1, 0.3, 1)" }}>
      <div ref={inner}>{children}</div>
    </div>
  );
}

/** Champ : libellé (+ aide en info-bulle, pour alléger la lecture) puis contrôle. */
function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-center gap-1.5 type-body-strong">
        {label}
        {hint && (
          <Tooltip portal side="top" label={hint}>
            <Info className="h-3.5 w-3.5 cursor-help text-[var(--text-muted)]" aria-label={hint} />
          </Tooltip>
        )}
      </p>
      {children}
    </div>
  );
}

/** Liste déroulante façon champ (langue, pays). */
function Select<T extends string>({ value, options, onChange }: { value: T; options: { key: T; label: string; icon?: ReactNode }[]; onChange: (v: T) => void }) {
  const current = options.find((o) => o.key === value);
  return (
    <DropdownMenu
      matchTrigger
      trigger={(isOpen) => (
        <button type="button" className="flex h-9 w-full items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-static)] px-3 type-body transition-colors hover:border-[var(--border-medium)]">
          <span className="flex items-center gap-2">{current?.icon}{current?.label}</span>
          <ChevronDown className={`h-4 w-4 text-[var(--text-muted)] transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      )}
    >
      {options.map((o) => (
        <DropdownItem key={o.key} selected={o.key === value} onClick={() => onChange(o.key)}>
          <span className="flex items-center gap-2">{o.icon}{o.label}</span>
        </DropdownItem>
      ))}
    </DropdownMenu>
  );
}

/** Ajout d'éléments : le champ AU-DESSUS, la liste des éléments ajoutés dessous dans un
 *  encart gris. Avec `suggestions`, autocomplétion (seules les valeurs de la liste passent). */
function TagInput({ values, onChange, placeholder, suggestions, emptyText, renderIcon, allowFree = false }: {
  values: string[]; onChange: (v: string[]) => void; placeholder: string; suggestions?: string[]; emptyText: string;
  /** Avec `suggestions` : accepte aussi une valeur hors liste (ex. une ville). */
  allowFree?: boolean;
  /** Icône devant chaque valeur (ex. drapeau du pays). */
  renderIcon?: (v: string) => ReactNode;
}) {
  const [draft, setDraft] = useState("");
  const q = draft.trim().toLowerCase();
  const norm = (v: string) => v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const matches = suggestions && q
    ? suggestions.filter((x) => norm(x).includes(norm(q)) && !values.includes(x)).slice(0, 6)
    : [];
  const add = (v: string) => {
    const val = v.trim();
    if (!val || values.some((x) => x.toLowerCase() === val.toLowerCase())) { setDraft(""); return; }
    onChange([...values, val]);
    setDraft("");
  };
  const submit = () => {
    if (suggestions && !allowFree) { if (matches[0]) add(matches[0]); }
    else add(matches[0] && norm(matches[0]) === norm(q) ? matches[0] : draft);
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); submit(); }}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            className="h-9 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-static)] px-3 text-[14px] text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-input)] focus:border-[var(--border-medium)]"
          />
          <Button size="sm" variant="secondary" type="submit" disabled={suggestions && !allowFree ? matches.length === 0 : !q}>Ajouter</Button>
        </form>
        {matches.length > 0 && (
          <div className="absolute inset-x-0 top-full z-10 mt-1 flex flex-col rounded-xl border border-[var(--border-subtle)] bg-[var(--dropdown-bg)] p-1 shadow-[var(--shadow-floating)]">
            {matches.map((m) => (
              <button key={m} type="button" onClick={() => add(m)} className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left type-body transition-colors hover:bg-[var(--dropdown-hover-bg,var(--bg-card-hover))]">{renderIcon?.(m)}{m}</button>
            ))}
          </div>
        )}
      </div>
      <div className="flex min-h-[44px] flex-wrap gap-2 rounded-xl bg-[var(--bg-card-static)] p-2">
        {values.length === 0 && <span className="self-center px-1 type-body-sm">{emptyText}</span>}
        {values.map((v) => (
          <span key={v} className={`inline-flex items-center gap-1.5 rounded-full bg-[var(--dropdown-bg)] py-1 pr-2 type-body text-[var(--text-primary)] shadow-[0_1px_2px_rgba(0,0,0,0.06)] ${renderIcon ? "pl-1.5" : "pl-3"}`}>
            {renderIcon?.(v)}
            {v}
            <button type="button" aria-label={`Retirer ${v}`} onClick={() => onChange(values.filter((x) => x !== v))} className="text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Choix unique ; l'option choisie déplie juste en dessous ce qu'il faut préciser. */
function ChoiceRow({ selected, onSelect, icon: Icon, label, desc, children }: {
  selected: boolean; onSelect: () => void; icon: typeof MapPin; label: string; desc: string; children?: ReactNode;
}) {
  return (
    <div className={`rounded-xl border transition-colors ${selected ? "border-[var(--accent-primary)]" : "border-[var(--border-subtle)] hover:border-[var(--border-medium)]"}`}>
      <button type="button" role="radio" aria-checked={selected} onClick={onSelect} className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left">
        <Icon className={`h-4 w-4 flex-shrink-0 ${selected ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)]"}`} />
        <span className="min-w-0 flex-1">
          <span className="block type-body-strong">{label}</span>
          <span className="block type-body-sm">{desc}</span>
        </span>
        {children
          ? <ChevronDown className={`h-4 w-4 flex-shrink-0 transition-transform duration-300 ${selected ? "rotate-180 text-[var(--accent-primary)]" : "text-[var(--text-muted)]"}`} />
          : selected && <Check className="h-4 w-4 flex-shrink-0 text-[var(--accent-primary)]" />}
      </button>
      {children && (
        <div className="grid transition-[grid-template-rows,opacity] duration-300 ease-out" style={{ gridTemplateRows: selected ? "1fr" : "0fr", opacity: selected ? 1 : 0 }}>
          <div className="overflow-hidden">
            <div className="px-3.5 pb-3">{children}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Panneau ─────────────────────────────────────────────────────────── */

export function ProjectSetupDock({ domain }: { domain: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false); // fondu d'apparition initial
  /* Morph : un seul conteneur dont la taille glisse du panneau à la pastille.
     `auto` = hauteur naturelle (panneau ouvert au repos) ; sinon hauteur explicite animable. */
  const [size, setSize] = useState<"panel" | "pill">("panel");
  const [auto, setAuto] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const [panelH, setPanelH] = useState(0);
  const [pillW, setPillW] = useState(280);
  const [view, setView] = useState<"home" | "thanks" | SetupStepKey>("home");
  const [confirmed, setConfirmed] = useState<Set<SetupStepKey>>(new Set());
  const timers = useRef<number[]>([]);
  const hovered = useRef(false);
  const collapseWhenLeft = useRef(false);

  // Progression simulée de l'étude.
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(startedAt);
  useEffect(() => {
    const raf = requestAnimationFrame(() => { setMounted(true); setShown(true); });
    const id = setInterval(() => setNow(Date.now()), 1000);
    const pending = timers.current;
    return () => { cancelAnimationFrame(raf); clearInterval(id); pending.forEach((t) => clearTimeout(t)); };
  }, []);
  // Mesures pour le morph (hauteur naturelle du panneau, largeur naturelle de la pastille).
  useLayoutEffect(() => {
    const panel = panelRef.current, pill = pillRef.current;
    if (!panel || !pill) return;
    const ro = new ResizeObserver(() => { setPanelH(panel.offsetHeight); setPillW(pill.offsetWidth); });
    ro.observe(panel);
    ro.observe(pill);
    return () => ro.disconnect();
  }, [mounted]);
  const pct = Math.min(100, Math.round(((now - startedAt) / STUDY_DURATION_MS) * 100));
  const studyDone = pct >= 100;
  const phase = STUDY_PHASES.find((p) => pct < p.until)?.label ?? "Étude terminée";
  const minutesLeft = Math.max(1, Math.ceil(((100 - pct) / 100) * (STUDY_DURATION_MS / 60_000)));

  // Données pré-remplies, corrigeables.
  const [s] = useState(() => getSetupSuggestions(domain));
  const [brand, setBrand] = useState(s.brand);
  const [languages, setLanguages] = useState<string[]>(s.languages);
  const [market, setMarket] = useState<MarketType>(s.market.type);
  const [cities, setCities] = useState<string[]>(s.market.cities ?? []);
  const [country, setCountry] = useState(s.market.country ?? "France");
  const [countries, setCountries] = useState<string[]>(s.market.countries ?? []);
  const [activity, setActivity] = useState(s.activity);
  const [offers, setOffers] = useState<string[]>(s.offers);
  const [competitors, setCompetitors] = useState(s.competitors.map((c) => ({ ...c, kept: true, added: false })));
  const [competitorDraft, setCompetitorDraft] = useState("");
  const flagOf = (name: string) => <Flag code={COUNTRY_CODE[name] ?? ""} size={16} />;
  const langFlagOf = (name: string) => <Flag code={LANGUAGES.find((l) => l.name === name)?.code ?? ""} size={16} />;
  const countryOptions = COUNTRIES.map((c) => ({ key: c, label: c, icon: flagOf(c) }));

  const keptCount = competitors.filter((c) => c.kept).length;
  const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? "s" : ""}`;
  const summary: Record<SetupStepKey, string> = {
    profile: `${brand || "Marque"} · ${languages.join(", ") || "Langue"} · ${market === "city" ? cities.join(", ") || "Local" : market === "national" ? country : `${countries.length} pays`}`,
    // « détectée(s) » tant que l'utilisateur n'a pas confirmé ; ensuite, c'est sa liste.
    activity: confirmed.has("activity") ? plural(offers.length, "offre") : `${plural(offers.length, "offre")} détectée${offers.length > 1 ? "s" : ""}`,
    competitors: `${keptCount} concurrent${keptCount > 1 ? "s" : ""} retenu${keptCount > 1 ? "s" : ""}`,
  };

  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };

  /** Réduire : la hauteur se fige, puis glisse (avec la largeur et l'arrondi) vers la pastille. */
  function collapse() {
    setAuto(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setSize("pill")));
    later(() => setView((v) => (v === "thanks" ? "home" : v)), MORPH_MS);
  }
  /** Rouvrir : la pastille regrandit jusqu'à la taille du panneau, puis repasse en hauteur naturelle. */
  function expand() {
    setSize("panel");
    later(() => setAuto(true), MORPH_MS);
  }

  /** Fin de vie : fondu de sortie, puis retrait du panneau (paramètre `setup`). */
  function vanish() {
    setShown(false);
    later(() => {
      const sp = new URLSearchParams(searchParams.toString());
      sp.delete("setup");
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    }, 260);
  }

  function confirm(key: SetupStepKey) {
    const next = new Set(confirmed).add(key);
    setConfirmed(next);
    const after = STEPS.find((st) => !next.has(st.key));
    if (after) { setView(after.key); return; } // enchaîne sur la vérification suivante
    // Les 3 sont confirmées : message de réassurance, puis réduction (en pause au survol).
    setView("thanks");
    later(() => { if (hovered.current) collapseWhenLeft.current = true; else collapse(); }, THANKS_MS);
  }

  /* Étude terminée → le dock disparaît, sauf si l'utilisateur est en train de répondre :
     il disparaît alors dès qu'il a fini (3 confirmations) ou qu'il réduit le panneau. */
  const shouldVanish = studyDone && (size === "pill" || (confirmed.size === STEPS.length && view !== "thanks"));
  useEffect(() => {
    if (!shouldVanish) return;
    const t = window.setTimeout(vanish, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldVanish]);

  function addCompetitor() {
    const v = competitorDraft.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
    if (v && !competitors.some((c) => c.domain === v)) setCompetitors((cs) => [...cs, { domain: v, sharedKeywords: 0, kept: true, added: true }]);
    setCompetitorDraft("");
  }

  if (!mounted) return null;

  /* ── Vue détail ── */
  const detail = (key: SetupStepKey, body: ReactNode, confirmLabel = "Confirmer") => (
    <div key={key} className="t-tab-enter flex flex-col">
      {/* Une seule ligne : retour + titre de l'étape + mini stepper (gris, vert une fois confirmée). */}
      <div className="flex items-center gap-2 px-5 pt-1">
        <button type="button" onClick={() => setView("home")} aria-label="Retour" className="-ml-1.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <p className="min-w-0 flex-1 truncate type-h3">{STEPS.find((st) => st.key === key)?.title}</p>
        <span className="flex flex-shrink-0 items-center gap-1" role="img" aria-label={`Étape ${STEPS.findIndex((st) => st.key === key) + 1} sur ${STEPS.length}`}>
          {STEPS.map((st) => (
            <span
              key={st.key}
              className="h-1.5 w-4 rounded-full transition-colors duration-300"
              style={{ backgroundColor: confirmed.has(st.key) ? "var(--color-success)" : st.key === key ? "var(--text-primary)" : "var(--border-medium)" }}
            />
          ))}
        </span>
      </div>
      <div className="flex max-h-[400px] flex-col gap-5 overflow-y-auto px-5 py-4">{body}</div>
      <div className="flex items-center justify-end px-5 pb-4 pt-1">
        <Button size="md" onClick={() => confirm(key)}>{confirmLabel}</Button>
      </div>
    </div>
  );

  let content: ReactNode;
  if (view === "profile") {
    content = detail("profile", (
      <>
        <Field label="Nom exact de la marque" hint="Tel qu'il s'écrit : il sert à repérer les recherches sur votre marque.">
          <Input value={brand} onChange={setBrand} placeholder="ex. AW-I" />
        </Field>
        <Field label="Langues du site">
          <TagInput values={languages} onChange={setLanguages} suggestions={LANGUAGES.map((l) => l.name)} renderIcon={langFlagOf} placeholder="Ajouter une langue, ex. Anglais" emptyText="Aucune langue ajoutée" />
        </Field>
        <Field label="Marché visé">
          <div role="radiogroup" aria-label="Marché visé" className="flex flex-col gap-2">
            <ChoiceRow selected={market === "city"} onSelect={() => setMarket("city")} {...MARKETS[0]}>
              <TagInput values={cities} onChange={setCities} suggestions={CITIES} allowFree placeholder="Ajouter une ville, ex. Lyon" emptyText="Aucune ville ajoutée" />
            </ChoiceRow>
            <ChoiceRow selected={market === "national"} onSelect={() => setMarket("national")} {...MARKETS[1]}>
              <Select value={country} options={countryOptions} onChange={setCountry} />
            </ChoiceRow>
            <ChoiceRow selected={market === "international"} onSelect={() => setMarket("international")} {...MARKETS[2]}>
              <TagInput values={countries} onChange={setCountries} suggestions={COUNTRIES} renderIcon={flagOf} placeholder="Ajouter un pays, ex. Belgique" emptyText="Aucun pays ajouté" />
            </ChoiceRow>
          </div>
        </Field>
      </>
    ));
  } else if (view === "activity") {
    content = detail("activity", (
      <>
        <Field label="Activité">
          <textarea value={activity} onChange={(e) => setActivity(e.target.value)} rows={3} className={`${fieldCls} resize-none`} />
        </Field>
        <Field label="Offres" hint="Elles servent à prioriser les opportunités. Vous les retrouvez dans Paramètres, Contexte métier.">
          <TagInput values={offers} onChange={setOffers} placeholder="Ajouter une offre, ex. Refonte de site" emptyText="Aucune offre pour l'instant" />
        </Field>
      </>
    ));
  } else if (view === "competitors") {
    content = detail("competitors", (
      <>
        <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); addCompetitor(); }}>
          <div className="flex-1"><Input value={competitorDraft} onChange={setCompetitorDraft} placeholder="Ajouter un concurrent, ex. exemple.fr" /></div>
          <Button size="sm" variant="secondary" type="submit" disabled={!competitorDraft.trim()}>Ajouter</Button>
        </form>
        <div className="flex flex-col divide-y divide-[var(--border-subtle)] rounded-xl bg-[var(--bg-card-static)]">
          {competitors.map((c) => (
            <label key={c.domain} className={`flex cursor-pointer items-center gap-3 px-3.5 py-2.5 transition-opacity ${c.kept ? "" : "opacity-50"}`}>
              <Checkbox checked={c.kept} onChange={() => setCompetitors((cs) => cs.map((x) => (x.domain === c.domain ? { ...x, kept: !x.kept } : x)))} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://www.google.com/s2/favicons?domain=${c.domain}&sz=64`} alt="" width={18} height={18} className="h-[18px] w-[18px] flex-shrink-0 rounded-sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate type-body-strong">{c.domain}</span>
                <span className="block type-body-sm">{c.added ? "Ajouté par vous" : `${c.sharedKeywords} mots-clés en commun`}</span>
              </span>
            </label>
          ))}
        </div>
      </>
    ), `Valider ${keptCount} concurrent${keptCount > 1 ? "s" : ""}`);
  } else if (view === "thanks") {
    // Morph final : message de réassurance avant que le panneau ne se réduise.
    content = (
      <div key="thanks" className="t-tab-enter flex flex-col items-center px-6 pb-7 pt-3 text-center">
        <p className="type-h3">C&apos;est noté, merci !</p>
        <p className="mt-1.5 type-body text-[var(--text-secondary)]">
          L&apos;étude tient compte de vos réponses. Vous pouvez continuer à explorer votre projet, on vous prévient dès que les résultats sont prêts.
        </p>
      </div>
    );
  } else {
    content = (
      <div key="home" className="t-tab-enter flex flex-col px-5 pb-5 pt-1">
        <p className="type-body text-[var(--text-secondary)]">
          Vérifiez 3 informations détectées sur votre site.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          {STEPS.map((st) => {
            const ok = confirmed.has(st.key);
            const Icon = st.icon;
            return (
              <button
                key={st.key}
                type="button"
                onClick={() => setView(st.key)}
                className="flex w-full items-center gap-3 rounded-xl border border-[var(--border-subtle)] px-3.5 py-3 text-left transition-colors hover:border-[var(--border-medium)] hover:bg-[var(--bg-card-hover)]"
              >
                <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${ok ? "bg-[var(--color-success-bg)]" : "bg-[var(--accent-primary-soft)]"}`}>
                  {ok ? <Check className="h-4 w-4 text-[var(--color-success)]" /> : <Icon className="h-4 w-4 text-[var(--text-primary)]" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block type-body-strong">{st.title}</span>
                  <span className="block truncate type-body-sm">{summary[st.key]}</span>
                </span>
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-[var(--text-muted)]" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── Conteneur unique : panneau ⇄ pastille ── */
  const isPanel = size === "panel";
  const box: CSSProperties = {
    width: isPanel ? PANEL_W : pillW + 2, // + bordure (box-sizing: border-box)
    // + 2 : la bordure. Sans ça, le panneau « saute » de 2 px en repassant en hauteur naturelle.
    height: isPanel ? (auto ? undefined : panelH + 2) : PILL_H,
    borderRadius: isPanel ? 16 : PILL_H / 2,
    transition: `width ${MORPH_MS}ms ${MORPH_EASE}, height ${MORPH_MS}ms ${MORPH_EASE}, border-radius ${MORPH_MS}ms ${MORPH_EASE}, opacity 200ms ease, transform 200ms ease`,
    opacity: shown ? 1 : 0,
    transform: shown ? "none" : "translateY(8px)",
  };
  const fade = (visible: boolean, delay: number): CSSProperties => ({
    opacity: visible ? 1 : 0,
    transition: `opacity ${visible ? 260 : 140}ms ease ${visible ? delay : 0}ms`,
    pointerEvents: visible ? "auto" : "none",
  });

  return createPortal(
    <section
      aria-label="Préparation du projet"
      onMouseEnter={() => { hovered.current = true; }}
      onMouseLeave={() => { hovered.current = false; if (collapseWhenLeft.current) { collapseWhenLeft.current = false; collapse(); } }}
      className="fixed bottom-5 right-5 z-[60] overflow-hidden border border-[var(--border-subtle)] bg-[var(--dropdown-bg)] shadow-[var(--shadow-floating)]"
      style={box}
    >
      {/* Panneau (en flux quand ouvert au repos, sinon ancré en bas à droite pendant le morph) */}
      <div
        ref={panelRef}
        className={`${isPanel && auto ? "relative" : "absolute bottom-0 right-0"} flex flex-col`}
        style={{ width: PANEL_INNER_W, ...fade(isPanel, 140) }}
        aria-hidden={!isPanel}
      >
        {/* En-tête : progression de l'étude + « Réduire ». Dans une étape, il se compacte
            (anneau + %) pour laisser toute l'attention au formulaire. */}
        {(() => {
          const compact = view === "profile" || view === "activity" || view === "competitors";
          return (
            <header className={`mb-3 flex items-center gap-3 border-b border-[var(--border-subtle)] px-5 transition-[padding] duration-300 ${compact ? "py-2" : "py-3.5"}`}>
              <ProgressRing pct={pct} size={compact ? 22 : 36} />
              <div className="min-w-0 flex-1">
                {compact ? (
                  <p className="type-body-sm">{studyDone ? "Étude terminée" : `Étude en cours · ${pct} %`}</p>
                ) : (
                  <>
                    <p className="type-body-strong">{studyDone ? "Étude terminée" : `Votre projet se prépare · ${pct} %`}</p>
                    <p className="type-body-sm">{studyDone ? `${domain} est prêt` : `${phase} · environ ${minutesLeft} min`}</p>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={collapse}
                aria-label="Réduire"
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </header>
          );
        })()}
        <AnimatedHeight>{content}</AnimatedHeight>
      </div>

      {/* Pastille (toujours montée pour être mesurée ; visible une fois réduite) */}
      <div ref={pillRef} className="absolute bottom-0 right-0 flex items-center whitespace-nowrap" style={{ height: PILL_H - 2, ...fade(!isPanel, 180) }} aria-hidden={isPanel}>
        <button
          type="button"
          onClick={expand}
          aria-label="Ouvrir la préparation du projet"
          className="group flex h-full items-center gap-3 py-2 pl-[9px] pr-2 text-left"
        >
          <ProgressRing pct={pct} />
          <span>
            <span className="block type-body-strong">{studyDone ? "Étude terminée" : `Étude en cours · ${pct} %`}</span>
            <span className="block type-body-sm">{confirmed.size}/3 informations confirmées</span>
          </span>
          {/* Même effet de survol que la flèche « Réduire » du panneau. */}
          <span className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors group-hover:bg-[var(--bg-secondary)] group-hover:text-[var(--text-primary)]">
            <ChevronDown className="h-4 w-4 rotate-180" />
          </span>
        </button>
      </div>
    </section>,
    document.body,
  );
}
