"use client";

/**
 * Contexte métier — onglet des paramètres projet (migré depuis l'ancienne
 * ParametresModal). Deux documents injectés dans les prompts LLM pour
 * contextualiser les recommandations : l'analyse métier client et le skill
 * rédactionnel. Chargement d'un template ou import .md, éditeur inline.
 */

import { useState } from "react";
import { ArrowUpTrayIcon, DocumentTextIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";
import { Button } from "@/components/Button";
import { Section, Input } from "@/components/parametres/settingsUi";

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


/**
 * Offres prioritaires — offres que le client veut développer en priorité.
 * Utilisées par le calcul de priorité des Opportunités : les opportunités qui s'y
 * rattachent remontent en tête de liste (mention « Offre prioritaire »).
 */
function OffresPrioritairesSettings() {
  const [offers, setOffers] = useState<string[]>(["Accompagnement SEO", "Audit SEO", "Accompagnement GEO"]);
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (v && !offers.some((o) => o.toLowerCase() === v.toLowerCase())) setOffers((prev) => [...prev, v]);
    setDraft("");
  };

  return (
    <Section
      title="Offres prioritaires"
      description="Les offres que le client veut développer en priorité. Les opportunités qui s'y rattachent remontent en tête de liste."
    >
      <div className="flex flex-col gap-3">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => { e.preventDefault(); add(); }}
        >
          <div className="w-72"><Input value={draft} onChange={setDraft} placeholder="ex. Audit SEO, Formation, Refonte de site" /></div>
          <Button size="sm" variant="secondary" type="submit" disabled={!draft.trim()}>Ajouter</Button>
        </form>
        {offers.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {offers.map((o) => (
              <span key={o} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] px-3 py-1 type-caption font-medium text-[var(--text-primary)]">
                {o}
                <button
                  type="button"
                  aria-label={`Retirer ${o}`}
                  onClick={() => setOffers((prev) => prev.filter((x) => x !== o))}
                  className="text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="type-body-sm">Aucune offre déclarée : toutes les opportunités sont classées sur le seul potentiel SEO.</p>
        )}
      </div>
    </Section>
  );
}

type DocKey = "brief" | "skill";

export function ContexteMetierSettings() {
  const [briefConfigured, setBriefConfigured] = useState(false);
  const [skillConfigured, setSkillConfigured] = useState(false);
  const [templateOpen, setTemplateOpen] = useState<DocKey | null>(null);
  const [templateText, setTemplateText] = useState("");

  const openTemplate = (key: DocKey) => {
    setTemplateText(key === "brief" ? TEMPLATE_BRIEF : TEMPLATE_SKILL);
    setTemplateOpen(key);
  };
  const saveTemplate = (key: DocKey) => {
    if (key === "brief") setBriefConfigured(true);
    else setSkillConfigured(true);
    setTemplateOpen(null);
  };

  const cards = [
    { key: "brief" as const, title: "Analyse métier client", configured: briefConfigured, fileName: "brief-metier.md",       empty: "Aucune analyse métier configurée", desc: "Cette analyse adapte les recommandations SEO à votre activité.", onRemove: () => setBriefConfigured(false) },
    { key: "skill" as const, title: "Skill rédactionnel",    configured: skillConfigured, fileName: "skill-redactionnel.md", empty: "Aucun skill rédactionnel configuré", desc: "Définit le style, le ton et les règles de rédaction.",           onRemove: () => setSkillConfigured(false) },
  ];

  return (
    <>
    <OffresPrioritairesSettings />
    <Section title="Contexte métier" description="Ces documents adaptent les recommandations SEO à votre activité et vos standards rédactionnels — ils sont injectés dans les prompts IA.">
      <div className="flex flex-col gap-3">
        {cards.map((card) => (
          <div key={card.title} className="rounded-2xl border border-[var(--border-subtle)] p-5">
            <div className="flex items-start gap-5">
              <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl ${card.configured ? "bg-[rgba(16,185,129,0.1)]" : "bg-[var(--bg-subtle)]"}`}>
                {card.configured
                  ? <CheckCircleSolid className="h-7 w-7 text-[var(--color-success)]" />
                  : <DocumentTextIcon className="h-7 w-7 text-[var(--text-muted)]" strokeWidth={1.5} />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="type-body-strong font-semibold">{card.title}</p>
                  {card.configured && (
                    <button onClick={card.onRemove} className="flex-shrink-0 text-[var(--text-muted)] transition-colors hover:text-[var(--color-danger)]">
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {card.configured ? (
                  <>
                    <p className="mt-1 type-label text-[var(--color-success)]">Configuré</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[var(--bg-subtle)] px-2.5 py-1.5">
                      <DocumentTextIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--text-muted)]" />
                      <span className="font-mono type-caption">{card.fileName}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mt-1 type-body-sm">{card.empty}</p>
                    <p className="mt-1 type-caption opacity-70">{card.desc}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <button onClick={() => openTemplate(card.key)} className="type-caption font-medium text-[var(--accent-primary)] transition-opacity hover:opacity-70">
                        Charger le template
                      </button>
                      <span className="text-[var(--text-muted)]">·</span>
                      <button onClick={() => openTemplate(card.key)} className="flex items-center gap-1 type-caption font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
                        <ArrowUpTrayIcon className="h-3.5 w-3.5" />
                        Importer .md
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {templateOpen === card.key && (
              <div className="mt-4 flex flex-col gap-3">
                <textarea
                  value={templateText}
                  onChange={(e) => setTemplateText(e.target.value)}
                  rows={16}
                  spellCheck={false}
                  className="w-full resize-none rounded-xl border border-[var(--border-medium)] bg-[var(--bg-subtle)] px-3.5 py-3 font-mono type-caption leading-relaxed text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-medium)] placeholder:text-[var(--text-muted)]"
                />
                <div className="flex items-center gap-2">
                  <button onClick={() => saveTemplate(card.key)} className="rounded-xl bg-[var(--text-primary)] px-4 py-2 type-label font-semibold text-[var(--bg-primary)] transition-opacity hover:opacity-80">
                    Enregistrer
                  </button>
                  <button onClick={() => setTemplateOpen(null)} className="rounded-xl px-4 py-2 type-label text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]">
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
    </>
  );
}
