"use client";

/**
 * NewProjectModal — ajout d'un projet au workspace (3 étapes).
 *
 *  1. Domaine : vérifié AU CLIC sur le CTA (jamais en direct). Pendant la
 *     vérification, le panneau de droite montre GSE en train de contrôler le lien.
 *     Si le domaine redirige ailleurs (ex. .fr → .com), l'écran le signale et
 *     propose le domaine final, lui-même vérifié, avant de continuer.
 *  2. Fréquence d'analyse.
 *  3. Search Console (facultative, « Passer cette étape »).
 *
 * Grande modale : formulaire à gauche, panneau au dégradé de l'onboarding à droite
 * (arrondi, en retrait) avec une illustration isométrique par étape.
 * Données : contrats + mocks dans `src/data/new-project.ts`.
 */

import { useEffect, useState, type ReactNode } from "react";
import { X, Loader2, Check, Globe, ArrowRight, CornerDownRight } from "lucide-react";
import { useModalTransition } from "@/hooks/useModalTransition";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { Stepper } from "@/components/Stepper";
import { GoogleLogo } from "@/components/GoogleLogo";
import { IsoDomain, IsoChecking, IsoRedirect, IsoFrequency, IsoSearchConsole } from "@/components/new-project/IsoIllustrations";
import {
  checkDomain, listGscProperties, propertyMatches, normalizeDomain,
  type DomainCheck, type GscProperty,
} from "@/data/new-project";

export type NewProjectPayload = {
  domain: string;
  frequency: string;
  /** Propriété Search Console choisie, ou null si l'étape a été passée. */
  gscProperty: string | null;
};

const FREQ_OPTIONS = [
  { value: "quotidienne",   label: "Quotidienne",   desc: "Pour les sites qui publient ou changent tous les jours" },
  { value: "hebdomadaire",  label: "Hebdomadaire",  desc: "Un suivi rapproché des positions et des correctifs" },
  { value: "mensuelle",     label: "Mensuelle",     desc: "Le bon rythme pour la plupart des sites", recommended: true },
  { value: "trimestrielle", label: "Trimestrielle", desc: "Un suivi de fond, pour les sites stables" },
  { value: "manuelle",      label: "Manuelle",      desc: "Vous relancez l'analyse quand vous le souhaitez" },
];

const STEP_COUNT = 3;

type CheckState = { state: "idle" } | { state: "checking" } | { state: "done"; result: DomainCheck };
type GscState = { state: "idle" } | { state: "connecting" } | { state: "connected"; properties: GscProperty[] };

/* ── Briques UI ──────────────────────────────────────────────────────── */

/** Ligne d'option à choix unique (fréquence, domaine, propriété). */
function OptionRow({ selected, disabled, onSelect, title, meta, desc }: {
  selected: boolean; disabled?: boolean; onSelect: () => void; title: ReactNode; meta?: ReactNode; desc?: ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        selected
          ? "border-[var(--accent-primary)] bg-[var(--accent-primary-soft)]"
          : "border-[var(--border-subtle)] hover:border-[var(--border-medium)]"
      }`}
    >
      <span className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 ${selected ? "border-[var(--accent-primary)]" : "border-[var(--border-medium)]"}`}>
        {selected && <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)]" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="type-body-strong text-[var(--text-primary)]">{title}</span>
          {meta}
        </span>
        {desc && <span className="mt-0.5 block type-caption">{desc}</span>}
      </span>
    </button>
  );
}

const RECO_PILL = <Pill color="var(--color-success)" bg="var(--color-success-bg)">Recommandé</Pill>;

/** Panneau droit : fond de l'onboarding + illustration de l'étape (sans texte). */
function VisualPanel({ visual, onClose }: { visual: { key: string; node: ReactNode }; onClose: () => void }) {
  return (
    <aside
      className="relative hidden w-[46%] flex-shrink-0 flex-col overflow-hidden rounded-[22px] md:flex"
      style={{ backgroundColor: "#3D4FFF", backgroundImage: "url('/onboarding-bg.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-md transition-colors hover:bg-white/25"
      >
        <X className="h-4 w-4" />
      </button>
      <div key={visual.key} className="t-tab-enter relative flex min-h-0 flex-1 items-center justify-center p-2">
        {visual.node}
      </div>
    </aside>
  );
}

/* ── Modale ──────────────────────────────────────────────────────────── */

export function NewProjectModal({ onClose, onCreate }: { onClose: () => void; onCreate: (p: NewProjectPayload) => void }) {
  const { phase, requestClose } = useModalTransition(onClose);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [scrolled, setScrolled] = useState(false); // contenu défilé → fondu sous le titre

  // Étape 1 — domaine
  const [raw, setRaw] = useState("");
  const [check, setCheck] = useState<CheckState>({ state: "idle" });
  const [choice, setChoice] = useState<"final" | "input">("final");
  // Étape 2 — fréquence
  const [freq, setFreq] = useState("mensuelle");
  // Étape 3 — Search Console
  const [gsc, setGsc] = useState<GscState>({ state: "idle" });
  const [property, setProperty] = useState<string | null>(null);

  const result = check.state === "done" ? check.result : null;
  const verified = result?.ok ? result : null;
  const redirected = !!verified?.redirected;
  const projectDomain = verified ? (redirected && choice === "input" ? verified.input : verified.finalDomain) : "";
  const checking = check.state === "checking";

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") requestClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [requestClose]);

  /* Vérification au clic : sans redirection on enchaîne, sinon on reste pour choisir. */
  async function verifyAndContinue() {
    if (!raw.trim() || checking) return;
    if (verified && normalizeDomain(raw) === verified.input) { setStep(2); return; }
    setCheck({ state: "checking" });
    const res = await checkDomain(raw);
    setCheck({ state: "done", result: res });
    setChoice("final");
    setGsc({ state: "idle" });
    setProperty(null);
    if (res.ok && !res.redirected) setStep(2);
  }

  async function connectGoogle() {
    setGsc({ state: "connecting" });
    const properties = await listGscProperties(projectDomain);
    setGsc({ state: "connected", properties });
    const match = properties.find((p) => p.permission !== "restricted" && propertyMatches(p, projectDomain));
    setProperty(match?.siteUrl ?? null);
  }

  function create(withGsc: boolean) {
    onCreate({ domain: projectDomain, frequency: freq, gscProperty: withGsc ? property : null });
    requestClose();
  }

  /* ── Panneau droit selon l'étape ── */
  const visual = (() => {
    if (step === 2) return { key: "freq", node: <IsoFrequency /> };
    if (step === 3) return { key: "gsc", node: <IsoSearchConsole /> };
    if (checking) return { key: "checking", node: <IsoChecking /> };
    if (redirected && verified) return { key: "redirect", node: <IsoRedirect from={verified.input} to={verified.finalDomain} /> };
    return { key: "domain", node: <IsoDomain /> };
  })();

  const overlayClass = phase === "open" ? "is-open" : phase === "closing" ? "is-closing" : "";
  const modalClass = phase === "open" ? "is-open" : phase === "closing" ? "is-closing" : "";

  /* ── Contenu gauche ── */
  const head = {
    1: { title: "Ajouter un projet", sub: "Indiquez le site à analyser. On vérifie qu'il répond avant de lancer l'analyse." },
    2: { title: "Fréquence d'analyse", sub: `À quel rythme relancer l'analyse de ${projectDomain} ?` },
    3: { title: "Connecter la Search Console", sub: "Vos vraies données Google rendent l'analyse bien plus précise." },
  }[step];

  const inputError = result && !result.ok
    ? result.reason === "invalid" ? "Ce domaine n'est pas valide. Exemple attendu : exemple.com" : "Ce domaine ne répond pas. Vérifiez l'orthographe ou réessayez."
    : null;

  return (
    <div
      role="presentation"
      className={`t-modal-overlay ${overlayClass} fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm`}
      onClick={(e) => e.target === e.currentTarget && requestClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-project-title"
        className={`t-modal ${modalClass} flex h-[640px] max-h-full w-full max-w-[1040px] gap-2.5 rounded-[28px] bg-[var(--modal-bg)] p-2.5 shadow-[var(--shadow-floating)]`}
      >
        {/* ─── Formulaire ─── */}
        <section className="flex min-w-0 flex-1 flex-col px-8 pb-6 pt-7">
          <div className="flex items-center gap-3">
            <div className="flex-1"><Stepper steps={STEP_COUNT} current={step} /></div>
            <button type="button" onClick={requestClose} aria-label="Fermer" className="-mt-7 flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] md:hidden">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="-mt-3 mb-5 type-caption">Étape {step} sur {STEP_COUNT}</p>

          <div
            key={step}
            onScroll={(e) => { const sc = e.currentTarget.scrollTop > 2; setScrolled((v) => (v === sc ? v : sc)); }}
            className="t-tab-enter flex min-h-0 flex-1 flex-col overflow-y-auto"
          >
            {/* Titre + sous-titre figés en haut ; fondu blanc dessous quand le contenu défile. */}
            <div className="sticky top-0 z-10 bg-[var(--modal-bg)] pb-1">
              <h2 id="new-project-title" className="type-h2">
                {head.title}
                {step === 3 && <span className="ml-2 align-middle type-body-sm text-[var(--text-muted)]">Facultatif</span>}
              </h2>
              <p className="mt-1.5 type-body-sm">{head.sub}</p>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-full h-6 transition-opacity duration-150"
                style={{ background: "linear-gradient(to bottom, var(--modal-bg), transparent)", opacity: scrolled ? 1 : 0 }}
              />
            </div>

            {/* Étape 1 — domaine */}
            {step === 1 && (
              <div className="mt-8 flex flex-col">
                <label htmlFor="np-domain" className="mb-1.5 type-caption">Adresse du site</label>
                <div className={`flex h-12 items-center gap-3 rounded-xl border bg-[var(--card-inner-bg)] px-4 transition-colors focus-within:border-[var(--border-medium)] ${inputError ? "border-[var(--color-danger)]" : "border-[var(--border-subtle)]"}`}>
                  <Globe className="h-4 w-4 flex-shrink-0 text-[var(--text-muted)]" />
                  <input
                    id="np-domain"
                    type="text"
                    value={raw}
                    autoFocus
                    disabled={checking}
                    onChange={(e) => { setRaw(e.target.value); if (check.state === "done") setCheck({ state: "idle" }); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (!redirected) verifyAndContinue(); } }}
                    placeholder="exemple.com"
                    className="min-w-0 flex-1 bg-transparent text-[15px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] disabled:opacity-60"
                  />
                  {verified && !redirected && <Check className="h-4 w-4 flex-shrink-0 text-[var(--color-success)]" />}
                </div>
                {inputError ? (
                  <p className="mt-2 type-caption text-[var(--color-danger)]">{inputError}</p>
                ) : checking ? (
                  <p className="mt-2 flex items-center gap-1.5 type-caption"><Loader2 className="h-3.5 w-3.5 animate-spin" />Vérification du lien en cours…</p>
                ) : verified && !redirected ? (
                  <p className="mt-2 type-caption text-[var(--color-success)]">Domaine vérifié : il répond et le HTTPS est actif.</p>
                ) : (
                  <p className="mt-2 type-caption">Sans https:// ni www. La vérification se lance au clic sur Continuer.</p>
                )}

                {/* Redirection détectée : signaler + proposer le domaine final vérifié */}
                {redirected && verified && (
                  <div className="mt-6 rounded-2xl border border-[var(--border-subtle)] p-4">
                    <p className="type-body-strong text-[var(--text-primary)]">Ce site redirige vers {verified.finalDomain}</p>
                    <p className="mt-1 type-body-sm leading-relaxed">
                      {verified.input} renvoie automatiquement vers {verified.finalDomain}. Google indexe le domaine final : c&apos;est lui qu&apos;il faut analyser.
                    </p>
                    <div className="mt-3 flex flex-col gap-1">
                      {verified.hops.map((h) => (
                        <p key={h.from} className="flex flex-wrap items-center gap-1.5 font-mono text-[12px] text-[var(--text-secondary)]">
                          <CornerDownRight className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                          {h.from}
                          <span className="rounded-full bg-[var(--bg-subtle)] px-1.5 py-0.5 font-sans text-[11px] font-semibold text-[var(--text-primary)]">{h.status}</span>
                          <ArrowRight className="h-3 w-3 text-[var(--text-muted)]" />
                          {h.to}
                        </p>
                      ))}
                    </div>
                    <div role="radiogroup" aria-label="Domaine à analyser" className="mt-4 flex flex-col gap-2">
                      <OptionRow
                        selected={choice === "final"}
                        onSelect={() => setChoice("final")}
                        title={verified.finalDomain}
                        meta={RECO_PILL}
                        desc={<span className="inline-flex items-center gap-1 text-[var(--color-success)]"><Check className="h-3.5 w-3.5" />Domaine final vérifié : répond ({verified.status}), HTTPS actif</span>}
                      />
                      <OptionRow
                        selected={choice === "input"}
                        onSelect={() => setChoice("input")}
                        title={verified.input}
                        desc="Domaine saisi : les données Google seront incomplètes"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Étape 2 — fréquence */}
            {step === 2 && (
              <div role="radiogroup" aria-label="Fréquence d'analyse" className="mt-8 flex flex-col gap-2">
                {FREQ_OPTIONS.map((o) => (
                  <OptionRow key={o.value} selected={freq === o.value} onSelect={() => setFreq(o.value)} title={o.label} meta={o.recommended ? RECO_PILL : undefined} desc={o.desc} />
                ))}
              </div>
            )}

            {/* Étape 3 — Search Console (facultative) */}
            {step === 3 && (
              <div className="mt-7 flex flex-col">
                <ul className="flex flex-col gap-2.5">
                  {[
                    "Clics, impressions et positions réels de vos pages",
                    "Opportunités calculées sur les requêtes qui vous amènent du trafic",
                    "Pages fantômes et cannibalisation détectées automatiquement",
                  ].map((b) => (
                    <li key={b} className="flex items-start gap-2.5 type-body-sm text-[var(--text-primary)]">
                      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent-primary-soft)]">
                        <Check className="h-3 w-3 text-[var(--accent-primary)]" />
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>

                {/* Le CTA devient l'état « connecté » : même emplacement, style pill verte. */}
                {gsc.state !== "connected" ? (
                  <Button variant="secondary" size="lg" className="mt-7 w-full" onClick={connectGoogle} disabled={gsc.state === "connecting"}>
                    {gsc.state === "connecting" ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleLogo className="h-[18px] w-[18px]" />}
                    {gsc.state === "connecting" ? "Connexion à Google…" : "Se connecter avec Google"}
                  </Button>
                ) : (
                  <div
                    role="status"
                    className="mt-7 flex h-11 w-full items-center justify-center gap-2 rounded-full px-5 text-[16px] font-medium"
                    style={{ color: "var(--color-success)", backgroundColor: "var(--color-success-bg)" }}
                  >
                    <GoogleLogo className="h-[18px] w-[18px]" />
                    Compte Google connecté
                    <Check className="h-4 w-4" />
                  </div>
                )}
                {gsc.state === "connected" && (
                  <div className="mt-5">
                    <p className="mb-2 type-caption">Choisissez la propriété du projet</p>
                    <div role="radiogroup" aria-label="Propriété Search Console" className="flex flex-col gap-2">
                      {gsc.properties.map((p) => {
                        const restricted = p.permission === "restricted";
                        const matches = propertyMatches(p, projectDomain);
                        return (
                          <OptionRow
                            key={p.siteUrl}
                            selected={property === p.siteUrl}
                            disabled={restricted}
                            onSelect={() => setProperty(p.siteUrl)}
                            title={<span className="font-mono text-[13px]">{p.siteUrl}</span>}
                            meta={matches && !restricted ? <Pill color="var(--accent-primary)" bg="var(--accent-primary-soft)">Correspond au projet</Pill> : undefined}
                            desc={restricted ? "Accès restreint : demandez un accès complet au propriétaire" : p.kind === "domain" ? "Propriété de domaine · tous les sous-domaines" : "Propriété avec préfixe d'URL"}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
                <p className="mt-3 type-caption">Vous pourrez aussi la connecter plus tard depuis les paramètres du projet.</p>
              </div>
            )}
          </div>

          {/* ─── Pied : Retour · (Passer) · CTA ─── */}
          <div className="mt-6 flex flex-shrink-0 items-center justify-between gap-3">
            {step > 1 ? (
              <Button variant="ghost" onClick={() => setStep((s) => (s === 3 ? 2 : 1))}>Retour</Button>
            ) : <span />}
            <div className="flex items-center gap-3">
              {step === 3 && (
                <button
                  type="button"
                  onClick={() => create(false)}
                  className="rounded-full bg-[var(--bg-card-hover)] px-4 py-2 type-label transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                >
                  Passer cette étape
                </button>
              )}
              {step === 1 && (
                <Button onClick={() => (redirected ? setStep(2) : verifyAndContinue())} disabled={!raw.trim() || checking}>
                  {checking && <Loader2 className="h-4 w-4 animate-spin" />}
                  {checking ? "Vérification…" : redirected ? `Continuer avec ${projectDomain}` : "Continuer"}
                </Button>
              )}
              {step === 2 && <Button onClick={() => setStep(3)}>Continuer</Button>}
              {step === 3 && <Button onClick={() => create(true)} disabled={!property}>Créer le projet</Button>}
            </div>
          </div>
        </section>

        {/* ─── Panneau visuel ─── */}
        <VisualPanel visual={visual} onClose={requestClose} />
      </div>
    </div>
  );
}
