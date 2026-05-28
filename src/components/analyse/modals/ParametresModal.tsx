"use client";

/**
 * ParametresModal — project-level settings drawer:
 * brief/skill templates, Cuik configuration, integrations, tags, status, danger zone.
 * Private helpers: PROJ_INTEGRATIONS, PROJ_TAGS, ProjIntegRow.
 * Extracted verbatim from src/app/(app)/analyse/[domain]/page.tsx.
 */

import { useState } from "react";
import { XMarkIcon, ArrowUpTrayIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid, SparklesIcon } from "@heroicons/react/24/solid";
import { Button } from "@/components/Button";
import { SegmentedControl } from "@/components/SegmentedControl";

const PROJ_INTEGRATIONS = [
  { id: "anthropic", name: "Anthropic",     desc: "Génération IA · modèles Claude",             initials: "AN", color: "#E36D25", bg: "rgba(227,109,37,0.12)" },
  { id: "babbar",    name: "Babbar",         desc: "Autorité de domaine · BabbarAuthority",      initials: "BB", color: "#7C3AED", bg: "rgba(124,58,237,0.12)" },
  { id: "crazysrp",  name: "CrazySERP",      desc: "Analyse SERP · suivi de positions",           initials: "CS", color: "#2563EB", bg: "rgba(37,99,235,0.12)"  },
  { id: "cuik",      name: "Cuik",           desc: "Plateforme de création de contenu IA",        initials: "CK", color: "var(--color-success)", bg: "var(--color-success-soft)" },
  { id: "haloscan",  name: "Haloscan",       desc: "Scraping SERP · données Google",             initials: "HS", color: "var(--color-warning)", bg: "rgba(245,158,11,0.12)" },
  { id: "openai",    name: "OpenAI",         desc: "Génération IA · modèles GPT",                initials: "OA", color: "#10A37F", bg: "rgba(16,163,127,0.12)" },
  { id: "seobs",     name: "SEObserver",     desc: "Visibilité SEO · snapshots",                 initials: "SO", color: "var(--accent-primary)", bg: "rgba(62,80,245,0.12)"  },
  { id: "serpm",     name: "Serpmantics",    desc: "Analyse sémantique des SERPs",               initials: "SM", color: "#EC4899", bg: "rgba(236,72,153,0.12)" },
  { id: "ytg",       name: "YourText.Guru",  desc: "Score sémantique · optimisation éditoriale", initials: "YG", color: "#14B8A6", bg: "rgba(20,184,166,0.12)" },
];

const PROJ_TAGS = [
  { key: "produit",   label: "Produit"        },
  { key: "categorie", label: "Catégorie"      },
  { key: "blog",      label: "Blog / Article" },
  { key: "landing",   label: "Landing page"   },
  { key: "marque",    label: "Page marque"    },
];

function ProjIntegRow({ name, logo, desc, account, connected, onToggle }: {
  name: string; logo: React.ReactNode; desc: string; account?: string;
  connected: boolean; onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--bg-subtle)]">
          {logo}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-semibold text-[var(--text-primary)]">{name}</p>
            <span className="inline-flex items-center rounded-full px-2 py-1 text-[12px] font-medium"
              style={{ color: connected ? "var(--color-success)" : "var(--text-muted)", backgroundColor: connected ? "var(--color-success-bg)" : "var(--bg-secondary)" }}>
              {connected ? "Connecté" : "Non connecté"}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{connected && account ? account : desc}</p>
        </div>
      </div>
      <Button size="sm" variant={connected ? "secondary" : "dark"} onClick={onToggle}>
        {connected ? "Déconnecter" : "Connecter"}
      </Button>
    </div>
  );
}

export function ParametresModal({ domain, gscConnected, ga4Connected, onToggleGsc, onToggleGa4, onClose }: {
  domain: string; gscConnected: boolean; ga4Connected: boolean;
  onToggleGsc: () => void; onToggleGa4: () => void; onClose: () => void;
}) {
  const [briefConfigured, setBriefConfigured] = useState(false);
  const [skillConfigured, setSkillConfigured] = useState(false);
  const [projectStatus, setProjectStatus] = useState<"actif" | "archive">("actif");
  const [cuikDomain, setCuikDomain] = useState("www.example.com");
  const [tags, setTags] = useState<string[]>(["Produit", "Catégorie", "Blog / Article"]);
  const [tagInput, setTagInput] = useState("");
  const [integStatus, setIntegStatus] = useState<Record<string, boolean>>(
    Object.fromEntries(PROJ_INTEGRATIONS.map((i) => [i.id, i.id === "cuik"]))
  );
  const [templateOpen, setTemplateOpen] = useState<"brief" | "skill" | null>(null);
  const [templateText, setTemplateText] = useState("");

  const TEMPLATE_BRIEF = `# BRIEF MÉTIER CLIENT — [NOM DU CLIENT / SITE]
# À remplir par le consultant SEO. Cette analyse est injectée dans les prompts LLM
# pour contextualiser les recommandations au secteur et aux objectifs du client.

---

## IDENTITÉ

**Nom commercial :** [ex: Ma Boutique]
**Secteur :** [ex: E-commerce mode, B2B industriel, santé, formation...]
**Positionnement :** [ex: Spécialiste français du segment X]
**USP (avantage différenciant) :** [ex: Livraison 24h, prix le plus bas, expertise reconnue...]
**Zone géographique :** [ex: France, Europe, International]

---

## CIBLE

**Persona principal :** [ex: Femmes 30-50 ans, professionnels IT, parents...]
**Persona secondaire :** [ex: Prescripteurs, revendeurs, aidants...]
**Niveau de maturité :** [ex: Découverte, considération, décision d'achat]
**Canaux d'acquisition :** [ex: SEO organique, SEA, réseaux sociaux, emailing...]

---

## OBJECTIFS BUSINESS

**Objectif principal :** [ex: Générer des ventes, des leads, des inscriptions...]
**KPI prioritaire :** [ex: Chiffre d'affaires, leads qualifiés, trafic organique...]
**Saisonnalité :** [ex: Pic en décembre (Noël), stable toute l'année...]
**Budget SEO mensuel :** [ex: 1-3K€, 5-10K€, pas de budget dédié...]

---

## CONCURRENCE

**Concurrents directs :** [ex: Concurrent A, Concurrent B, Concurrent C]
**Avantage concurrentiel SEO :** [ex: Contenu expert, ancienneté du domaine...]
**Faiblesse concurrentielle SEO :** [ex: Peu de backlinks, contenu peu mis à jour...]

---

## CONTRAINTES

**Contraintes légales :** [ex: Pas de comparaison de prix, RGPD, mentions obligatoires...]
**Contraintes techniques :** [ex: CMS limité, temps de chargement lent...]
**Sujets sensibles :** [ex: Ne pas mentionner X, ne pas promettre Y...]
**Ton à éviter :** [ex: Trop agressif commercialement, trop technique...]`;

  const TEMPLATE_SKILL = `# SKILL RÉDACTIONNEL — [NOM DU PROJET]
# Définit le style, le ton et les règles de rédaction injectés dans les prompts LLM.

---

## STYLE & TON

**Ton général :** [ex: Expert et pédagogue, conversationnel, institutionnel...]
**Registre de langue :** [ex: Vouvoiement, tutoiement, neutre...]
**Personnalité éditoriale :** [ex: Rassurant, dynamique, premium, accessible...]

---

## STRUCTURE

**Longueur cible :** [ex: 800-1200 mots pour les articles, 300 mots pour les fiches...]
**Format préféré :** [ex: Listes à puces, titres courts, paragraphes courts...]
**Appel à l'action :** [ex: CTA en fin d'article, bannière intermédiaire...]

---

## RÈGLES ÉDITORIALES

**Mots à privilégier :** [ex: "solution", "accompagnement", "expertise"...]
**Mots à éviter :** [ex: "problème", "cheap", "basique"...]
**Formulations interdites :** [ex: Superlatifs non sourcés, promesses de résultats...]

---

## RÉFÉRENCES

**Exemples d'articles approuvés :** [ex: URL d'articles de référence]
**Ligne éditoriale de référence :** [ex: Nom du média ou blog de référence]`;

  const openTemplate = (key: "brief" | "skill") => {
    setTemplateText(key === "brief" ? TEMPLATE_BRIEF : TEMPLATE_SKILL);
    setTemplateOpen(key);
  };

  const saveTemplate = (key: "brief" | "skill") => {
    if (key === "brief") setBriefConfigured(true);
    else setSkillConfigured(true);
    setTemplateOpen(null);
  };

  const addTag = () => {
    const val = tagInput.trim();
    if (val && !tags.includes(val)) setTags((p) => [...p, val]);
    setTagInput("");
  };

  const toggleInteg = (id: string) =>
    setIntegStatus((s) => ({ ...s, [id]: !s[id] }));

  return (
    <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true"
        className="flex w-full max-w-2xl flex-col rounded-3xl bg-[var(--modal-bg)] shadow-[var(--shadow-floating)]"
        style={{ maxHeight: "90vh" }}>

        {/* Header */}
        <div className="flex flex-shrink-0 items-start justify-between px-8 pt-7 pb-5">
          <div>
            <p className="text-[20px] font-semibold tracking-tight text-[var(--text-primary)]">Paramètres du projet</p>
            <p className="mt-0.5 text-[13px] text-[var(--text-muted)]">{domain}</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="h-px flex-shrink-0 bg-[var(--border-subtle)]" />

        {/* Scrollable body */}
        <div className="flex flex-col gap-7 overflow-y-auto px-8 py-6">

          {/* ── Contexte métier ──────────────────────────────────────── */}
          <div>
            <p className="mb-1 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Contexte métier</p>
            <p className="mb-4 text-[13px] text-[var(--text-muted)]">Ces documents adaptent les recommandations SEO à votre activité et vos standards rédactionnels.</p>
            <div className="flex flex-col gap-3">
              {([
                { key: "brief" as const, title: "Analyse métier client", configured: briefConfigured, fileName: "brief-metier.md", empty: "Aucune analyse métier configurée", desc: "Cette analyse adapte les recommandations SEO à votre activité.", onRemove: () => setBriefConfigured(false) },
                { key: "skill" as const, title: "Skill rédactionnel",  configured: skillConfigured, fileName: "skill-redactionnel.md", empty: "Aucun skill rédactionnel configuré", desc: "Définit le style, le ton et les règles de rédaction.", onRemove: () => setSkillConfigured(false) },
              ]).map((card) => (
                <div key={card.title} className="rounded-2xl border border-[var(--border-subtle)] p-5">
                  <div className="flex items-start gap-5">
                    {/* Icon */}
                    <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl ${card.configured ? "bg-[rgba(16,185,129,0.1)]" : "bg-[var(--bg-secondary)]"}`}>
                      {card.configured ? (
                        <CheckCircleSolid className="h-7 w-7 text-[var(--color-success)]" />
                      ) : (
                        <DocumentTextIcon className="h-7 w-7 text-[var(--text-muted)]" strokeWidth={1.5} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[14px] font-semibold text-[var(--text-primary)]">{card.title}</p>
                        {card.configured && (
                          <button onClick={card.onRemove} className="flex-shrink-0 text-[var(--text-muted)] transition-colors hover:text-[var(--color-danger)]">
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {card.configured ? (
                        <>
                          <p className="mt-1 text-[13px] font-medium text-[var(--color-success)]">Configuré</p>
                          <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-[var(--bg-secondary)] px-2.5 py-1.5">
                            <DocumentTextIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--text-muted)]" />
                            <span className="font-mono text-[12px] text-[var(--text-secondary)]">{card.fileName}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="mt-1 text-[13px] text-[var(--text-muted)]">{card.empty}</p>
                          <p className="mt-1 text-[12px] text-[var(--text-muted)] opacity-70">{card.desc}</p>
                          <div className="mt-3 flex items-center gap-2">
                            <button onClick={() => openTemplate(card.key)} className="text-[12px] font-medium text-[var(--accent-primary)] transition-opacity hover:opacity-70">
                              Charger le template
                            </button>
                            <span className="text-[var(--text-muted)]">·</span>
                            <button onClick={() => openTemplate(card.key)} className="flex items-center gap-1 text-[12px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
                              <ArrowUpTrayIcon className="h-3.5 w-3.5" />
                              Importer .md
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Inline template editor */}
                  {templateOpen === card.key && (
                    <div className="mt-4 flex flex-col gap-3">
                      <textarea
                        value={templateText}
                        onChange={(e) => setTemplateText(e.target.value)}
                        rows={16}
                        className="w-full resize-none rounded-xl border border-[var(--border-medium)] bg-[var(--bg-secondary)] px-3.5 py-3 font-mono text-[12px] leading-relaxed text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-medium)] placeholder:text-[var(--text-muted)]"
                        spellCheck={false}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => saveTemplate(card.key)}
                          className="rounded-xl bg-[var(--text-primary)] px-4 py-2 text-[13px] font-semibold text-[var(--bg-primary)] transition-opacity hover:opacity-80"
                        >
                          Enregistrer
                        </button>
                        <button
                          onClick={() => setTemplateOpen(null)}
                          className="rounded-xl px-4 py-2 text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Configuration Cuik ───────────────────────────────────── */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <p className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Configuration Cuik</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(16,185,129,0.09)] px-3 py-1.5 text-[12px] font-medium text-[var(--color-success)]">
                <SparklesIcon className="h-3 w-3" />
                Connecté
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-[var(--text-secondary)]">Domaine Cuik</label>
              <input
                value={cuikDomain}
                onChange={(e) => setCuikDomain(e.target.value)}
                placeholder="www.example.com"
                className="h-9 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] transition-colors focus:border-[var(--border-medium)]"
              />
              <p className="text-[11px] text-[var(--text-muted)]">Si vide, le domaine du projet sera utilisé.</p>
            </div>
          </div>

          {/* ── Intégrations ─────────────────────────────────────────── */}
          <div>
            <p className="mb-1 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Intégrations</p>
            <p className="mb-4 text-[13px] text-[var(--text-muted)]">Connectez les outils tiers utilisés dans vos analyses.</p>
            <div className="flex flex-col gap-2">
              <ProjIntegRow
                name="Google Search Console" desc="Données de trafic organique et mots-clés"
                account="clients.lagenceweb@gmail.com" connected={gscConnected} onToggle={onToggleGsc}
                logo={<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#4285F4"/><path d="M12 6l-6 10h12L12 6z" fill="#fff" opacity=".9"/></svg>}
              />
              <ProjIntegRow
                name="Google Analytics 4" desc="Comportement utilisateurs et conversions"
                account="UA-XXXXXXX · monsite.fr" connected={ga4Connected} onToggle={onToggleGa4}
                logo={<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none"><rect width="24" height="24" rx="4" fill="#E37400"/><path d="M7 17V10h2.5v7H7zM14.5 17V7H17v10h-2.5zM10.75 17v-4.5h2.5V17h-2.5z" fill="#fff"/></svg>}
              />
              {PROJ_INTEGRATIONS.map((integ) => (
                <ProjIntegRow
                  key={integ.id}
                  name={integ.name} desc={integ.desc}
                  connected={integStatus[integ.id]} onToggle={() => toggleInteg(integ.id)}
                  logo={
                    <div className="flex h-full w-full items-center justify-center rounded-xl text-[12px] font-bold"
                      style={{ backgroundColor: integ.bg, color: integ.color }}>
                      {integ.initials}
                    </div>
                  }
                />
              ))}
            </div>
          </div>

          {/* ── Tags du projet ────────────────────────────────────────── */}
          <div>
            <p className="mb-1 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Lots du projet</p>
            <p className="mb-4 text-[13px] text-[var(--text-muted)]">Catégorisez vos pages pour filtrer les recommandations et organiser vos analyses.</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                placeholder="Ajoutez votre lot…"
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTag()}
                className="flex-1 rounded-xl border border-[var(--border-medium)] bg-[var(--input-bg)] px-3 py-2 text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] transition-colors focus:border-[var(--text-primary)]"
              />
              <button
                onClick={addTag}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-medium)] bg-[var(--input-bg)] text-[var(--text-muted)] transition-colors hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]"
              >
                +
              </button>
            </div>
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 rounded-full bg-[var(--text-primary)] px-3 py-1.5 text-[12px] font-medium text-[var(--bg-primary)]">
                    {tag}
                    <button onClick={() => setTags((p) => p.filter((t) => t !== tag))} className="opacity-60 transition-opacity hover:opacity-100">
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Statut du projet ──────────────────────────────────────── */}
          <div>
            <p className="mb-1 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Statut du projet</p>
            <p className="mb-4 text-[13px] text-[var(--text-muted)]">
              Un projet archivé conserve ses données mais n'apparaît plus dans les listes actives et ses analyses récurrentes sont mises en pause.
            </p>
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border-subtle)] px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <span
                  className="h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: projectStatus === "actif" ? "var(--color-success)" : "var(--text-muted)" }}
                />
                <div>
                  <p className="text-[13px] font-medium text-[var(--text-primary)]">
                    {projectStatus === "actif" ? "Projet actif" : "Projet archivé"}
                  </p>
                  <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">
                    {projectStatus === "actif"
                      ? "Analyses récurrentes activées, visible dans toutes les vues."
                      : "Lecture seule, masqué des dashboards par défaut."}
                  </p>
                </div>
              </div>
              <SegmentedControl
                options={[
                  { key: "actif",   label: "Actif" },
                  { key: "archive", label: "Archivé" },
                ]}
                value={projectStatus}
                onChange={setProjectStatus}
              />
            </div>
          </div>

          {/* ── Danger zone ───────────────────────────────────────────── */}
          <div>
            <p className="mb-3 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Zone de danger</p>
            <div className="flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] px-4 py-3.5">
              <div>
                <p className="text-[13px] font-medium text-[var(--text-primary)]">Supprimer ce projet</p>
                <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">Efface toutes les données et analyses associées à {domain}</p>
              </div>
              <Button variant="danger" size="sm">Supprimer</Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
