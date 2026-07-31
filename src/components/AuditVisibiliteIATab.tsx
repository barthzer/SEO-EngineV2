"use client";

/**
 * AuditVisibiliteIATab — 4e sous-rubrique de l'audit : santé « Visibilité IA » (GEO).
 * Snapshot de la présence de la marque dans les réponses des moteurs IA
 * (ChatGPT, Perplexity, AI Overviews, Gemini, Claude) + readiness technique GEO.
 * Même ossature que les onglets Technique / Sémantique / Popularité.
 */

import { useState } from "react";
import {
  CpuChipIcon, ChartBarIcon, ChatBubbleLeftRightIcon, DocumentTextIcon,
  Cog6ToothIcon, BoltIcon, TableCellsIcon, ChevronDownIcon,
  LinkIcon, MagnifyingGlassIcon, ShieldCheckIcon,
  FaceSmileIcon, CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { AuditActionsTable } from "@/components/analyse/AuditActionsTable";
import type { ElementType } from "react";
import { Tooltip } from "@/components/Tooltip";
import { Pill } from "@/components/Pill";
import { ScoreRing } from "@/components/ScoreRing";
import { DiagnosticComplet } from "@/components/DiagnosticComplet";
import { KpiCard } from "@/components/KpiCard";
import { KpiGroup } from "@/components/KpiGroup";
import { AuditSection } from "@/components/AuditSection";
import { Callout } from "@/components/Callout";
import { TableWide } from "@/components/TableWide";
import { DeltaBadge } from "@/components/DeltaBadge";

/* ── Data ─────────────────────────────────────────────────────────────── */

type EngineStatus = "cited" | "mentioned" | "absent";
type Engine = { name: string; domain: string; status: EngineStatus; citations: number; sov: number; trend: number };

const ENGINES: Engine[] = [
  { name: "ChatGPT",             domain: "openai.com",         status: "cited",     citations: 58, sov: 16, trend: 6  },
  { name: "Perplexity",          domain: "perplexity.ai",      status: "cited",     citations: 41, sov: 14, trend: 4  },
  { name: "Google AI Overviews", domain: "google.com",         status: "mentioned", citations: 18, sov: 8,  trend: -2 },
  { name: "Gemini",              domain: "gemini.google.com",  status: "mentioned", citations: 11, sov: 6,  trend: 1  },
  { name: "Claude",              domain: "anthropic.com",      status: "absent",    citations: 0,  sov: 0,  trend: 0  },
];

type SovRow = { domain: string; sov: number; citations: number; mentions: number; trend: number; isYou?: boolean };

const SOV: SovRow[] = [
  { domain: "semji.com",                  sov: 24, citations: 210, mentions: 340, trend: 8  },
  { domain: "eskimoz.fr",                 sov: 19, citations: 168, mentions: 279, trend: 5  },
  { domain: "abondance.com",              sov: 16, citations: 141, mentions: 231, trend: -1 },
  { domain: "leptidigital.fr",            sov: 14, citations: 122, mentions: 204, trend: 3  },
  { domain: "marketingdigital-france.fr", sov: 12, citations: 128, mentions: 196, trend: 3, isYou: true },
  { domain: "digimood.com",               sov: 9,  citations: 84,  mentions: 141, trend: 0  },
  { domain: "youlovewords.com",           sov: 6,  citations: 52,  mentions: 96,  trend: 2  },
];

type PromptStatus = "appears" | "absent";
type Sentiment = "positif" | "neutre" | "négatif" | "—";
type PromptRow = { prompt: string; theme: string; engine: string; status: PromptStatus; sentiment: Sentiment; position: string };

const PROMPTS: PromptRow[] = [
  { prompt: "meilleure agence SEO en France",                     theme: "Comparatif",     engine: "ChatGPT",      status: "appears", sentiment: "positif", position: "2 / 8"  },
  { prompt: "qu'est-ce que le GEO (Generative Engine Optimization)", theme: "Informationnel", engine: "AI Overviews", status: "appears", sentiment: "positif", position: "1 / 6"  },
  { prompt: "agence marketing digital B2B",                       theme: "Comparatif",     engine: "Perplexity",   status: "appears", sentiment: "neutre",  position: "5 / 10" },
  { prompt: "formation SEO en ligne certifiante",                 theme: "Transactionnel", engine: "Perplexity",   status: "appears", sentiment: "neutre",  position: "4 / 9"  },
  { prompt: "audit SEO gratuit outil en ligne",                   theme: "Transactionnel", engine: "Gemini",       status: "appears", sentiment: "négatif", position: "7 / 10" },
  { prompt: "comment améliorer son référencement naturel",        theme: "Informationnel", engine: "ChatGPT",      status: "absent",  sentiment: "—",       position: "—"      },
  { prompt: "agence SEO e-commerce",                              theme: "Comparatif",     engine: "ChatGPT",      status: "absent",  sentiment: "—",       position: "—"      },
  { prompt: "consultant SEO freelance vs agence",                 theme: "Comparatif",     engine: "Perplexity",   status: "absent",  sentiment: "—",       position: "—"      },
];

type CitedPage = { url: string; citations: number; engines: string; topic: string };

const CITED_PAGES: CitedPage[] = [
  { url: "/agence-seo/",                    citations: 34, engines: "ChatGPT · Perplexity",     topic: "Agence SEO" },
  { url: "/formation/formation-seo/",       citations: 28, engines: "Perplexity",               topic: "Formation" },
  { url: "/blog/qu-est-ce-que-le-geo/",     citations: 21, engines: "ChatGPT · AI Overviews",   topic: "GEO" },
  { url: "/agence-marketing-digital-b2b/",  citations: 14, engines: "ChatGPT",                  topic: "B2B" },
  { url: "/",                               citations: 9,  engines: "Gemini",                    topic: "Marque" },
];

const GAPS = [
  { prompt: "agence SEO e-commerce",                cité: "semji.com" },
  { prompt: "consultant SEO freelance vs agence",   cité: "eskimoz.fr" },
  { prompt: "comment améliorer son référencement",  cité: "abondance.com" },
];

type ReadyStatus = "ok" | "partial" | "missing";
type ReadyItem = { item: string; status: ReadyStatus; detail: string };

const READINESS: ReadyItem[] = [
  { item: "Fichier /llms.txt",                     status: "missing", detail: "Aucun fichier /llms.txt détecté — les LLM manquent de contexte sur la marque." },
  { item: "Schema Organization",                   status: "missing", detail: "Non détecté site-wide — entité de marque non déclarée." },
  { item: "Schema FAQ / QAPage",                   status: "partial", detail: "3 pages sur 40 balisées — éligibilité limitée aux réponses structurées." },
  { item: "Réponses answer-first",                 status: "partial", detail: "Structure question → réponse synthétique présente sur 12 pages." },
  { item: "Couverture d'entité (Knowledge Graph)", status: "missing", detail: "Entité marque non consolidée (sameAs, Wikidata absents)." },
  { item: "Crawlers IA autorisés",                 status: "ok",      detail: "GPTBot, ClaudeBot et PerplexityBot autorisés dans robots.txt." },
  { item: "Fraîcheur & dates visibles",            status: "ok",      detail: "Dates de publication et de mise à jour présentes sur les contenus." },
  { item: "Signaux auteur / E-E-A-T",              status: "partial", detail: "Byline auteur présente sur 60% des contenus éditoriaux." },
];

type ActionRow = { id: number; title: string; sub: string; priority: "high" | "medium" | "low"; category: string; effort: string };

const PRIORITY_ACTIONS: ActionRow[] = [
  { id: 1, title: "Créer un fichier /llms.txt",                        sub: "Contexte marque + pages clés pour les LLM",     priority: "high",   category: "GEO Readiness",   effort: "30 min" },
  { id: 2, title: "Baliser 40 pages en Schema FAQ / QAPage",           sub: "Éligibilité aux réponses IA structurées",       priority: "high",   category: "Structured Data", effort: "3-4h"   },
  { id: 3, title: "Publier une page comparatif answer-first",          sub: "Cible « meilleure agence SEO »",                priority: "high",   category: "Contenu",         effort: "1 j"    },
  { id: 4, title: "Consolider l'entité de marque (Knowledge Graph)",   sub: "Schema Organization + sameAs + Wikidata",       priority: "medium", category: "Entité",          effort: "2-3h"   },
  { id: 5, title: "Restructurer 12 pages en answer-first",             sub: "Réponse synthétique en tête de page",           priority: "medium", category: "Contenu",         effort: "4h"     },
  { id: 6, title: "Couvrir 6 prompts absents à fort volume",           sub: "e-commerce, freelance vs agence, référencement", priority: "medium", category: "Contenu",         effort: "2 j"    },
  { id: 7, title: "Ajouter les bylines auteur manquantes",             sub: "40% des contenus sans auteur visible",          priority: "low",    category: "E-E-A-T",         effort: "2h"     },
];

const DIAGNOSTIC: { label: string; score: number; icon: ElementType; headline: string; detail: string }[] = [
  { label: "Citations",           score: 45, icon: LinkIcon,
    headline: "128 citations sur 30 jours, mais 2× moins que la médiane du panel — visibilité source émergente",
    detail: "Votre domaine est cité 128 fois sur 30 jours, principalement par ChatGPT (58) et Perplexity (41). La médiane du panel de 8 concurrents est à 260 citations. Claude ne vous cite jamais et AI Overviews très peu. Le volume de citations est directement corrélé au maillage d'entité et à la structure answer-first." },
  { label: "Mentions",            score: 52, icon: ChatBubbleLeftRightIcon,
    headline: "196 mentions de marque, dont 65% sans lien source — notoriété présente mais peu capitalisée",
    detail: "La marque est mentionnée 196 fois, mais 65% des mentions n'incluent pas de citation source cliquable. C'est un signal de notoriété correct, mais qui ne génère pas de trafic ni d'autorité mesurable. Renforcer le Schema Organization et les pages d'autorité convertit ces mentions en citations." },
  { label: "Sentiment",           score: 68, icon: FaceSmileIcon,
    headline: "Sentiment majoritairement positif ou neutre — 1 seule requête à tonalité négative détectée",
    detail: "Sur les prompts où la marque apparaît, le sentiment est positif (2), neutre (2) et négatif (1). La requête « audit SEO gratuit » renvoie une tonalité négative liée à une confusion outil payant / gratuit. C'est le meilleur sous-score de l'axe : la perception n'est pas un frein, la visibilité l'est." },
  { label: "Couverture prompts",  score: 35, icon: MagnifyingGlassIcon,
    headline: "Absent de 65% des prompts stratégiques suivis — le plus gros levier de progression",
    detail: "Vous apparaissez sur 14 des 40 prompts suivis (35%). Les absences concernent des requêtes commerciales à fort potentiel : « agence SEO e-commerce », « consultant vs agence », « comment améliorer son référencement ». Sur ces prompts, ce sont semji.com, eskimoz.fr et abondance.com qui captent les citations." },
  { label: "Readiness technique", score: 60, icon: CpuChipIcon,
    headline: "Crawlers IA autorisés et contenus datés, mais llms.txt et Schema Organization manquants",
    detail: "Les fondations sont là (crawlers IA autorisés, dates visibles), mais les signaux qui déclenchent les citations manquent : pas de /llms.txt, pas de Schema Organization, peu de balisage FAQ/QAPage. Ce sont des correctifs rapides à fort impact sur l'éligibilité aux réponses génératives." },
  { label: "Entité / E-E-A-T",    score: 48, icon: ShieldCheckIcon,
    headline: "Entité de marque non consolidée — pas de sameAs ni de présence Knowledge Graph structurée",
    detail: "Les moteurs IA privilégient les entités clairement identifiées. Votre marque n'a pas de Schema Organization avec sameAs (LinkedIn, Wikidata, réseaux), et l'auteur n'est visible que sur 60% des contenus. Consolider l'entité renforce la confiance des modèles et la fréquence de citation." },
];

/* ── Helpers ──────────────────────────────────────────────────────────── */

function scoreColor(n: number) {
  return n >= 70 ? "var(--color-success)" : n >= 50 ? "var(--color-warning)" : "var(--color-danger)";
}

const ENGINE_STATUS: Record<EngineStatus, { label: string; color: string }> = {
  cited:     { label: "Cité",      color: "var(--color-success)" },
  mentioned: { label: "Mentionné", color: "var(--color-warning)" },
  absent:    { label: "Absent",    color: "var(--text-muted)" },
};

/** Sentiment = texte coloré (jamais de pill — convention DS Visibilité IA). */
function sentimentColor(s: Sentiment) {
  return s === "positif" ? "var(--color-success)" : s === "négatif" ? "var(--color-danger)" : "var(--text-muted)";
}

const READY_CFG: Record<ReadyStatus, { label: string; color: string; bg: string }> = {
  ok:      { label: "Prêt",    color: "var(--color-success)", bg: "var(--color-success-bg)" },
  partial: { label: "Partiel", color: "var(--color-warning)", bg: "var(--color-warning-bg)" },
  missing: { label: "À faire", color: "var(--color-danger)",  bg: "var(--color-danger-bg)" },
};

const CARD = "rounded-2xl border border-[var(--border-subtle)]";
const CARD_SM = "rounded-2xl border border-[var(--border-subtle)]";

function InfoIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
      <circle cx={7} cy={7} r={6} stroke="currentColor" strokeWidth={1.2} />
      <rect x={6.3} y={5.8} width={1.4} height={4.6} rx={0.7} fill="currentColor" />
      <circle cx={7} cy={3.6} r={0.8} fill="currentColor" />
    </svg>
  );
}

function Favicon({ domain }: { domain: string }) {
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
      alt=""
      width={16}
      height={16}
      className="h-4 w-4 flex-shrink-0 rounded-sm"
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
    />
  );
}

/* ── Main ─────────────────────────────────────────────────────────────── */

export function AuditVisibiliteIATab({ onSeeActions }: { domain: string; onSeeActions?: () => void }) {
  const appears = PROMPTS.filter((p) => p.status === "appears").length;

  return (
    <div className="flex flex-col gap-5">

      {/* Chiffres clés — composant DS KpiGroup/KpiCard (cohérence inter-pages) */}
      <KpiGroup columns={4}>
        {[
          { label: "Score visibilité IA", val: "41",   bench: "médiane panel 55",     icon: CpuChipIcon },
          { label: "Citations (30 j)",    val: "128",  bench: "+18 vs période préc.",  icon: LinkIcon },
          { label: "Part de voix IA",     val: "12%",  bench: "conc. moy. 16%",        icon: ChartBarIcon },
          { label: "Prompts suivis",      val: "14/40", bench: "où vous apparaissez",  icon: ChatBubbleLeftRightIcon },
        ].map((kpi) => (
          <KpiCard bare key={kpi.label} label={kpi.label} value={kpi.val} sub={kpi.bench} icon={kpi.icon} />
        ))}
      </KpiGroup>

      {/* ── HERO (résumé + note) ────────────────────────────────────── */}
      <div className={`${CARD} p-8`}>
        <div className="grid grid-cols-[2fr_1fr] items-center gap-8">
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2">
              <Pill color="var(--accent-primary)" bg="var(--accent-primary-soft)">Visibilité IA · snapshot Brand Radar</Pill>
              <span className="type-micro">il y a 3 jours</span>
            </div>
            <p className="type-title leading-relaxed">
              Présence IA émergente, mais distancée par 3 concurrents sur les requêtes commerciales.
            </p>
            <p className="type-body mt-0 max-w-xl leading-relaxed text-[var(--text-secondary)]">
              Cité par ChatGPT et Perplexity avec un sentiment positif, mais absent de 65% des prompts
              stratégiques et de Google AI Overviews. Les correctifs techniques GEO (llms.txt, Schema, entité)
              sont le levier le plus rapide pour rattraper semji.com et eskimoz.fr.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <ScoreRing score={41} size={160} strokeWidth={7} color={scoreColor(41)} />
            <p className="type-label">Score visibilité IA</p>
            <p className="type-caption flex items-center gap-1">
              Grade <strong style={{ color: scoreColor(41) }}>C</strong> · médiane panel 55
              <Tooltip
                portal
                rich
                side="left"
                label="Médiane des scores de visibilité IA relevés sur un panel de 8 marques concurrentes du même secteur (agences marketing / SEO)."
              >
                <span className="cursor-help text-[var(--text-muted)] opacity-40 transition-opacity hover:opacity-100">
                  <InfoIcon />
                </span>
              </Tooltip>
            </p>
          </div>
        </div>
      </div>

      {/* Verdict cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { color: "var(--color-danger)",   label: "Bloquant",    text: "Absent de 65% des prompts stratégiques suivis. Sur « agence SEO e-commerce » ou « consultant vs agence », ce sont vos concurrents qui sont cités à votre place." },
          { color: "var(--accent-primary)", label: "Opportunité", text: "Créer un llms.txt et baliser 40 pages en FAQ/QAPage : correctifs rapides qui débloquent l'éligibilité aux réponses génératives structurées." },
          { color: "var(--color-success)",  label: "Couverture",  text: "Déjà cité par ChatGPT et Perplexity avec un sentiment positif ou neutre. La perception n'est pas un frein, la couverture l'est." },
        ].map((v) => (
          <div key={v.label} className={`${CARD_SM} px-5 pt-5 pb-6`}>
            <div className="mb-3 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: v.color }} />
              <p className="type-label font-semibold" style={{ color: v.color }}>{v.label}</p>
            </div>
            <p className="type-body leading-snug text-[var(--text-secondary)]">{v.text}</p>
          </div>
        ))}
      </div>

      {/* ── DIAGNOSTIC COMPLET (remonté directement sous les 3 cartes) ── */}
      <AuditSection id="geo-diagnostic" icon={ChartBarIcon} title="Diagnostic" em="complet" meta="État de santé par dimension">
        {/* Subscores cliquables + zone de détail — composant partagé (parité visuelle inter-onglets) */}
        <DiagnosticComplet items={DIAGNOSTIC} cols={3} />
      </AuditSection>

      {/* ── 01. PRÉSENCE PAR MOTEUR IA ──────────────────────────────── */}
      <AuditSection id="geo-moteurs" icon={CpuChipIcon} title="Présence" em="par moteur IA" meta="5 moteurs suivis · snapshot Brand Radar">
        <Callout variant="warning" className="mb-4">
          <strong>Absent de Claude</strong>{" "}
          et faiblement présent sur Google AI Overviews. La visibilité repose sur ChatGPT et Perplexity, qui concentrent 77% de vos citations.
        </Callout>
        <div className={`overflow-hidden ${CARD_SM}`}>
          <TableWide<Engine>
            hidePagination
            rowKey={(e) => e.name}
            data={ENGINES}
            columns={[
              { key: "name", header: "Moteur", width: 220, flex: true,
                render: (e) => (
                  <div className="flex items-center gap-2 min-w-0">
                    <Favicon domain={e.domain} />
                    <span className="type-label truncate text-[var(--text-primary)]">{e.name}</span>
                  </div>
                ) },
              { key: "status", header: "Statut", width: 110,
                render: (e) => <span className="type-label font-medium" style={{ color: ENGINE_STATUS[e.status].color }}>{ENGINE_STATUS[e.status].label}</span> },
              { key: "citations", header: "Citations", width: 90, align: "right", sortable: true, sortValue: (e) => e.citations,
                render: (e) => <span className="type-label font-semibold tabular-nums text-[var(--text-primary)]">{e.citations}</span> },
              { key: "sov", header: "Part de voix", width: 100, align: "right", sortable: true, sortValue: (e) => e.sov,
                render: (e) => <span className="type-label tabular-nums">{e.sov}%</span> },
              { key: "trend", header: "Tendance", width: 90, align: "right",
                render: (e) => e.status === "absent" ? <span className="type-label text-[var(--text-muted)]">—</span> : <DeltaBadge value={e.trend} /> },
            ]}
          />
        </div>
      </AuditSection>

      {/* ── 02. OPTIMISATIONS PRIORITAIRES ──────────────────────────── */}
      <AuditSection id="geo-actions" icon={BoltIcon} title="Optimisations" em="prioritaires" meta={`${PRIORITY_ACTIONS.length} actions · leviers GEO`}>
        <AuditActionsTable actions={PRIORITY_ACTIONS} onSeeActions={onSeeActions} />
      </AuditSection>

      {/* ── 03. PART DE VOIX & CONCURRENTS ──────────────────────────── */}
      <AuditSection id="geo-sov" icon={ChartBarIcon} title="Part de voix" em="& concurrents" meta="Panel de 7 domaines · 30 jours">
        <div className="flex flex-col gap-5">
          {/* Barres horizontales — part de voix */}
          <div className={`${CARD} px-6 py-5`}>
            <p className="type-label mb-4 font-semibold">Part de voix IA (%)</p>
            <div className="flex flex-col gap-3">
              {SOV.map((row) => (
                <div key={row.domain} className="flex items-center gap-3">
                  <span className={`type-label w-52 flex-shrink-0 truncate font-mono ${row.isYou ? "font-semibold text-[var(--accent-primary)]" : ""}`}>
                    {row.domain}{row.isYou ? " (vous)" : ""}
                  </span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                    <div className="h-full rounded-full" style={{ width: `${row.sov / 24 * 100}%`, backgroundColor: row.isYou ? "var(--accent-primary)" : "var(--text-muted)" }} />
                  </div>
                  <span className={`type-label w-10 flex-shrink-0 text-right font-semibold tabular-nums ${row.isYou ? "text-[var(--accent-primary)]" : "text-[var(--text-primary)]"}`}>{row.sov}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Table détaillée */}
          <div className={`overflow-hidden ${CARD_SM}`}>
            <TableWide<SovRow>
              hidePagination
              rowKey={(r) => r.domain}
              data={SOV}
              isRowActive={(r) => !!r.isYou}
              columns={[
                { key: "domain", header: "Domaine", width: 220, flex: true,
                  render: (r) => (
                    <div className="flex items-center gap-2 min-w-0">
                      <Favicon domain={r.domain} />
                      <span className={`type-label truncate font-mono ${r.isYou ? "font-semibold text-[var(--accent-primary)]" : ""}`}>{r.domain}{r.isYou ? " (vous)" : ""}</span>
                    </div>
                  ) },
                { key: "sov", header: "Part de voix", width: 100, align: "right", sortable: true, sortValue: (r) => r.sov,
                  render: (r) => <span className={`type-label font-semibold tabular-nums ${r.isYou ? "text-[var(--accent-primary)]" : "text-[var(--text-primary)]"}`}>{r.sov}%</span> },
                { key: "citations", header: "Citations", width: 90, align: "right", sortable: true, sortValue: (r) => r.citations,
                  render: (r) => <span className="type-label tabular-nums">{r.citations}</span> },
                { key: "mentions", header: "Mentions", width: 90, align: "right", sortable: true, sortValue: (r) => r.mentions,
                  render: (r) => <span className="type-label tabular-nums">{r.mentions}</span> },
                { key: "trend", header: "Tendance", width: 90, align: "right",
                  render: (r) => <DeltaBadge value={r.trend} /> },
              ]}
            />
          </div>
        </div>
      </AuditSection>

      {/* ── 04. PROMPTS SUIVIS ──────────────────────────────────────── */}
      <AuditSection id="geo-prompts" icon={ChatBubbleLeftRightIcon} title="Prompts" em="suivis" meta={`${appears} présents · ${PROMPTS.length - appears} absents sur l'échantillon`}>
        <div className={`overflow-hidden ${CARD_SM}`}>
          <TableWide<PromptRow>
            hidePagination
            rowKey={(p) => p.prompt}
            data={PROMPTS}
            columns={[
              { key: "prompt", header: "Requête", width: 260, flex: true,
                render: (p) => <span className="type-label truncate text-[var(--text-primary)]">{p.prompt}</span> },
              { key: "theme", header: "Thème", width: 120,
                render: (p) => <span className="type-label">{p.theme}</span> },
              { key: "engine", header: "Moteur", width: 110,
                render: (p) => <span className="type-label">{p.engine}</span> },
              { key: "status", header: "Statut", width: 90,
                render: (p) => <span className="type-label font-medium" style={{ color: p.status === "appears" ? "var(--color-success)" : "var(--text-muted)" }}>{p.status === "appears" ? "Présent" : "Absent"}</span> },
              { key: "sentiment", header: "Sentiment", width: 90,
                render: (p) => <span className="type-label font-medium" style={{ color: sentimentColor(p.sentiment) }}>{p.sentiment === "—" ? "—" : p.sentiment.charAt(0).toUpperCase() + p.sentiment.slice(1)}</span> },
              { key: "position", header: "Position", width: 80, align: "right",
                render: (p) => <span className="type-label tabular-nums">{p.position}</span> },
            ]}
          />
        </div>
      </AuditSection>

      {/* ── 05. PAGES & CONTENUS CITÉS ──────────────────────────────── */}
      <AuditSection id="geo-pages" icon={DocumentTextIcon} title="Pages" em="& contenus cités" meta={`${CITED_PAGES.length} URLs citées · ${GAPS.length} gaps identifiés`}>
        <div className="flex flex-col gap-4">
          <div className={`overflow-hidden ${CARD_SM}`}>
            <TableWide<CitedPage>
              hidePagination
              rowKey={(p) => p.url}
              data={CITED_PAGES}
              columns={[
                { key: "url", header: "URL", width: 240, flex: true,
                  render: (p) => <span className="type-label truncate font-mono text-[var(--text-primary)]">{p.url}</span> },
                { key: "topic", header: "Thème", width: 120,
                  render: (p) => <span className="type-label">{p.topic}</span> },
                { key: "engines", header: "Cité par", width: 200, flex: true,
                  render: (p) => <span className="type-caption truncate">{p.engines}</span> },
                { key: "citations", header: "Citations", width: 90, align: "right", sortable: true, sortValue: (p) => p.citations,
                  render: (p) => <span className="type-label font-semibold tabular-nums text-[var(--text-primary)]">{p.citations}</span> },
              ]}
            />
          </div>

          {/* Gaps — sujets où un concurrent est cité, pas vous */}
          <div className={`${CARD} px-6 py-5`}>
            <p className="type-title mb-3">Gaps de citation</p>
            <div className="flex flex-col gap-2.5">
              {GAPS.map((g) => (
                <div key={g.prompt} className="flex items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-2.5 last:border-0 last:pb-0">
                  <span className="type-label">{g.prompt}</span>
                  <span className="type-caption flex items-center gap-1.5">
                    cité : <Favicon domain={g.cité} /><span className="font-mono">{g.cité}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AuditSection>

      {/* ── 06. GEO READINESS TECHNIQUE ─────────────────────────────── */}
      <AuditSection id="geo-readiness" icon={Cog6ToothIcon} title="GEO readiness" em="technique" meta="8 signaux · éligibilité aux réponses IA">
        <div className={`overflow-hidden ${CARD}`}>
          {READINESS.map((r) => {
            const cfg = READY_CFG[r.status];
            return (
              <div key={r.item} className="flex items-center justify-between gap-4 border-b border-[var(--border-subtle)] px-6 py-4 last:border-0">
                <div className="min-w-0">
                  <p className="type-body-strong">{r.item}</p>
                  <p className="type-caption mt-0.5">{r.detail}</p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <Pill color={cfg.color} bg={cfg.bg}>{cfg.label}</Pill>
                  {r.status === "ok" && <CheckCircleIcon className="h-4 w-4 text-[var(--color-success)]" />}
                </div>
              </div>
            );
          })}
        </div>
      </AuditSection>

      {/* ── 08. DONNÉES BRUTES ──────────────────────────────────────── */}
      <AuditSection id="geo-donnees" icon={TableCellsIcon} title="Données" em="brutes" meta="Pour aller plus loin">
        <div className={`overflow-hidden ${CARD_SM}`}>
          {[
            { id: "panel", title: "Panel de prompts suivis", sub: "40 prompts · 5 moteurs",
              body: "40 prompts stratégiques sont suivis en continu sur ChatGPT, Perplexity, Google AI Overviews, Gemini et Claude. L'échantillon affiché ci-dessus est un extrait représentatif des thèmes Comparatif, Informationnel et Transactionnel." },
            { id: "moteurs", title: "Moteurs & fréquence", sub: "Snapshot hebdomadaire",
              body: "Chaque prompt est rejoué chaque semaine sur les 5 moteurs. Les citations, mentions et sentiments sont extraits des réponses générées. Claude est inclus mais ne cite aucune source de votre domaine sur la période." },
            { id: "source", title: "Source & méthodologie", sub: "Brand Radar · 5 mai 2026",
              body: "Données agrégées via Brand Radar. La part de voix correspond au ratio de citations de votre domaine sur l'ensemble des citations du panel concurrentiel. Le sentiment est évalué sur la tonalité de la mention dans la réponse." },
          ].map((acc) => (
            <SimpleAccordion key={acc.id} title={acc.title} sub={acc.sub} body={acc.body} />
          ))}
        </div>
        <p className="type-micro mt-3">
          Snapshot du 5 mai 2026 · prochaine synchronisation Brand Radar le 12 mai 2026
        </p>
      </AuditSection>

    </div>
  );
}

function SimpleAccordion({ title, sub, body }: { title: string; sub: string; body: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[var(--border-subtle)] last:border-0">
      <button onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-4 text-left cursor-pointer">
        <div>
          <p className="type-title">{title}</p>
          <p className="type-caption mt-0.5">{sub}</p>
        </div>
        <ChevronDownIcon className="h-4 w-4 flex-shrink-0 text-[var(--text-muted)] transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      {open && (
        <div className="type-body px-6 pb-4 leading-relaxed text-[var(--text-secondary)]">
          {body}
        </div>
      )}
    </div>
  );
}
