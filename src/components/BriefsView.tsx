"use client";

import { useState, useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/Button";
import { FilterTabs } from "@/components/FilterTabs";
import { EmptyState } from "@/components/EmptyState";
import { Tooltip } from "@/components/Tooltip";
import { DropdownMenu, DropdownItem, DropdownSeparator } from "@/components/DropdownMenu";
import {
  ChevronRightIcon,
  ChevronDownIcon,
  ArrowUpIcon,
  MinusIcon,
  DocumentTextIcon,
  XMarkIcon,
  FolderOpenIcon,
  AdjustmentsHorizontalIcon,
  TrashIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { SearchInput } from "@/components/SearchInput";
import { SkeletonBriefs } from "@/components/Skeleton";
import {
  ArrowPathIcon,
  PuzzlePieceIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";

/* ── Types ───────────────────────────────────────────────────────────── */

export type BriefType = "optimiser" | "combler" | "creer";
export type Priority = "haute" | "moyenne" | "basse";

export type Brief = {
  id: number;
  title: string;
  url: string;
  type: BriefType;
  priority: Priority;
  keyword: string;
  volume: number;
  position?: number;
  lot?: string;
  semanticScore: number;
  wordCount: number;
  h2s: string[];
  internalLinks: string[];
};

/* ── Mock data ───────────────────────────────────────────────────────── */

export const BRIEFS: Brief[] = [
  // Lot SEO — Optimisation Q2 (14 URLs)
  { id: 1,  title: "Guide SEO local complet",              url: "/blog/seo-local",              type: "optimiser", priority: "haute",   keyword: "seo local",                 volume: 4400, position: 8,  lot: "Lot SEO — Optimisation Q2",    semanticScore: 42, wordCount: 1800, h2s: ["Qu'est-ce que le SEO local ?", "Optimiser sa fiche Google Business", "Les signaux de proximité"], internalLinks: ["/blog/google-business", "/blog/citations-locales"] },
  { id: 2,  title: "Audit SEO technique",                  url: "/services/audit-seo",          type: "optimiser", priority: "haute",   keyword: "audit seo",                 volume: 3600, position: 14, lot: "Lot SEO — Optimisation Q2",    semanticScore: 38, wordCount: 1400, h2s: ["Pourquoi réaliser un audit SEO ?", "Les 5 axes d'un audit technique", "Core Web Vitals"], internalLinks: ["/services/seo", "/blog/core-web-vitals"] },
  { id: 10, title: "Balises title et meta description",    url: "/blog/balises-title-meta",     type: "optimiser", priority: "haute",   keyword: "optimiser balise title",    volume: 2800, position: 19, lot: "Lot SEO — Optimisation Q2",    semanticScore: 31, wordCount: 1200, h2s: ["Rôle de la balise title", "Longueur optimale", "Exemples concrets"], internalLinks: ["/blog/seo-on-page"] },
  { id: 11, title: "Maillage interne : guide complet",     url: "/blog/maillage-interne",       type: "optimiser", priority: "haute",   keyword: "maillage interne seo",      volume: 2200, position: 23, lot: "Lot SEO — Optimisation Q2",    semanticScore: 29, wordCount: 1600, h2s: ["Pourquoi le maillage interne ?", "Stratégies avancées", "Outils d'audit"], internalLinks: ["/blog/cocon-semantique"] },
  { id: 12, title: "Vitesse de chargement et Core Web Vitals", url: "/blog/core-web-vitals",   type: "optimiser", priority: "haute",   keyword: "core web vitals 2024",      volume: 1900, position: 27, lot: "Lot SEO — Optimisation Q2",    semanticScore: 44, wordCount: 1500, h2s: ["LCP, CLS, INP expliqués", "Optimiser son score", "Outils de mesure"], internalLinks: ["/blog/performance-web"] },
  { id: 13, title: "SEO on-page : checklist complète",     url: "/blog/seo-on-page",            type: "optimiser", priority: "moyenne", keyword: "seo on page checklist",     volume: 1700, position: 31, lot: "Lot SEO — Optimisation Q2",    semanticScore: 52, wordCount: 2000, h2s: ["Structure de page", "Optimisation sémantique", "Accessibilité"], internalLinks: ["/blog/balises-title-meta"] },
  { id: 14, title: "Données structurées pour e-commerce", url: "/blog/schema-ecommerce",       type: "optimiser", priority: "moyenne", keyword: "schema org ecommerce",      volume: 1400, position: 38, lot: "Lot SEO — Optimisation Q2",    semanticScore: 26, wordCount: 1300, h2s: ["Product schema", "Review schema", "BreadcrumbList"], internalLinks: ["/blog/schema-org"] },
  { id: 15, title: "Canonicalisation et duplicate content", url: "/blog/canonical-tag",        type: "optimiser", priority: "moyenne", keyword: "balise canonical seo",      volume: 1300, position: 42, lot: "Lot SEO — Optimisation Q2",    semanticScore: 18, wordCount: 1100, h2s: ["Qu'est-ce que le duplicate content ?", "La balise canonical", "Bonnes pratiques"], internalLinks: ["/blog/audit-seo"] },
  { id: 16, title: "Redirection 301 : quand et comment",  url: "/blog/redirection-301",        type: "optimiser", priority: "moyenne", keyword: "redirection 301 seo",       volume: 1100, position: 47, lot: "Lot SEO — Optimisation Q2",    semanticScore: 21, wordCount: 900,  h2s: ["Les types de redirections", "Impact SEO", "Migration de site"], internalLinks: ["/blog/audit-seo-technique"] },
  { id: 17, title: "Sitemap XML : optimisation",          url: "/blog/sitemap-xml",             type: "optimiser", priority: "basse",   keyword: "sitemap xml seo",           volume: 960,  position: 55, lot: "Lot SEO — Optimisation Q2",    semanticScore: 35, wordCount: 800,  h2s: ["Créer un sitemap", "Soumettre à Google Search Console", "Erreurs à éviter"], internalLinks: ["/blog/robots-txt"] },
  { id: 18, title: "Robots.txt : guide pratique",         url: "/blog/robots-txt",              type: "optimiser", priority: "basse",   keyword: "robots txt seo",            volume: 880,  position: 61, lot: "Lot SEO — Optimisation Q2",    semanticScore: 29, wordCount: 700,  h2s: ["Syntaxe du fichier robots.txt", "Directives Disallow et Allow", "Erreurs fréquentes"], internalLinks: ["/blog/sitemap-xml"] },
  { id: 19, title: "Pagination et SEO",                   url: "/blog/pagination-seo",          type: "optimiser", priority: "basse",   keyword: "pagination seo",            volume: 740,  position: 68, lot: "Lot SEO — Optimisation Q2",    semanticScore: 14, wordCount: 800,  h2s: ["Problèmes de pagination", "Solutions recommandées", "Infinite scroll"], internalLinks: ["/blog/canonical-tag"] },
  { id: 20, title: "Hreflang : SEO international",       url: "/blog/hreflang",                 type: "optimiser", priority: "basse",   keyword: "hreflang balise seo",       volume: 680,  position: 74, lot: "Lot SEO — Optimisation Q2",    semanticScore: 11, wordCount: 1000, h2s: ["Qu'est-ce que l'hreflang ?", "Implémentation", "Erreurs courantes"], internalLinks: ["/blog/seo-international"] },
  { id: 21, title: "Crawl budget : optimisation",        url: "/blog/crawl-budget",              type: "optimiser", priority: "basse",   keyword: "crawl budget googlebot",    volume: 590,  position: 81, lot: "Lot SEO — Optimisation Q2",    semanticScore: 8,  wordCount: 900,  h2s: ["Qu'est-ce que le crawl budget ?", "Facteurs d'influence", "Optimiser son crawl"], internalLinks: ["/blog/robots-txt", "/blog/sitemap-xml"] },

  // Lot Création — Blog expert (11 URLs)
  { id: 4,  title: "SEO vs SEA : quelle stratégie ?",    url: "/blog/seo-vs-sea",               type: "combler",   priority: "haute",   keyword: "seo vs sea",                volume: 2400, position: 31, lot: "Lot Création — Blog expert",   semanticScore: 0,  wordCount: 1600, h2s: ["Différences fondamentales", "Quand choisir le SEO ?", "Stratégie combinée"], internalLinks: ["/services/sea", "/services/seo"] },
  { id: 5,  title: "Optimisation du taux de clic (CTR)", url: "/blog/optimiser-ctr",            type: "combler",   priority: "haute",   keyword: "améliorer ctr google",      volume: 1900, position: 38, lot: "Lot Création — Blog expert",   semanticScore: 0,  wordCount: 1400, h2s: ["Comprendre le CTR en SEO", "Optimiser ses balises title", "Rich snippets"], internalLinks: ["/blog/meta-tags", "/blog/schema-org"] },
  { id: 22, title: "Cocon sémantique : la méthode",      url: "/blog/cocon-semantique",          type: "combler",   priority: "haute",   keyword: "cocon sémantique seo",      volume: 1800, position: 34, lot: "Lot Création — Blog expert",   semanticScore: 0,  wordCount: 1900, h2s: ["Définition du cocon sémantique", "Construire sa structure", "Exemples concrets"], internalLinks: ["/blog/maillage-interne"] },
  { id: 23, title: "Intention de recherche et SEO",      url: "/blog/intention-recherche",       type: "combler",   priority: "haute",   keyword: "search intent seo",         volume: 1600, position: 40, lot: "Lot Création — Blog expert",   semanticScore: 0,  wordCount: 1500, h2s: ["Les 4 types d'intention", "Aligner contenu et intention", "Outils"], internalLinks: ["/blog/redaction-seo"] },
  { id: 24, title: "Longue traîne : stratégie complète", url: "/blog/longue-traine",             type: "combler",   priority: "haute",   keyword: "longue traîne seo",         volume: 1400, position: 45, lot: "Lot Création — Blog expert",   semanticScore: 0,  wordCount: 1700, h2s: ["Qu'est-ce que la longue traîne ?", "Trouver ses mots-clés", "Créer le contenu"], internalLinks: ["/blog/recherche-mots-cles"] },
  { id: 25, title: "Content marketing B2B",              url: "/blog/content-marketing-b2b",     type: "combler",   priority: "moyenne", keyword: "content marketing b2b",     volume: 1200, position: 52, lot: "Lot Création — Blog expert",   semanticScore: 0,  wordCount: 2000, h2s: ["Spécificités du B2B", "Formats qui convertissent", "Mesurer le ROI"], internalLinks: ["/blog/strategie-contenu"] },
  { id: 26, title: "Brief SEO : template et méthode",   url: "/blog/brief-seo",                  type: "combler",   priority: "moyenne", keyword: "brief seo template",        volume: 1100, position: 58, lot: "Lot Création — Blog expert",   semanticScore: 0,  wordCount: 1300, h2s: ["À quoi sert un brief SEO ?", "Les éléments clés", "Template téléchargeable"], internalLinks: ["/blog/redaction-seo"] },
  { id: 27, title: "Recherche de mots-clés avancée",    url: "/blog/recherche-mots-cles",         type: "combler",   priority: "moyenne", keyword: "keyword research avancé",   volume: 980,  position: 63, lot: "Lot Création — Blog expert",   semanticScore: 0,  wordCount: 1800, h2s: ["Outils de recherche", "Analyse de la concurrence", "Clustering"], internalLinks: ["/blog/longue-traine"] },
  { id: 28, title: "SERP : comprendre les résultats",   url: "/blog/serp-google",                 type: "combler",   priority: "basse",   keyword: "serp google features",      volume: 860,  position: 70, lot: "Lot Création — Blog expert",   semanticScore: 0,  wordCount: 1100, h2s: ["Anatomie d'une SERP", "Featured snippets", "Position zéro"], internalLinks: ["/blog/seo-local"] },
  { id: 29, title: "Taux de rebond et SEO",             url: "/blog/taux-rebond",                 type: "combler",   priority: "basse",   keyword: "taux de rebond seo",        volume: 720,  position: 77, lot: "Lot Création — Blog expert",   semanticScore: 0,  wordCount: 900,  h2s: ["Définition du taux de rebond", "Impact sur le SEO", "Comment le réduire"], internalLinks: ["/blog/ux-seo"] },
  { id: 30, title: "Google E-E-A-T : mise à jour 2024", url: "/blog/google-eeat-2024",            type: "combler",   priority: "basse",   keyword: "google eeat 2024",          volume: 640,  position: 84, lot: "Lot Création — Blog expert",   semanticScore: 0,  wordCount: 1200, h2s: ["Nouveautés E-E-A-T", "Signaux de confiance", "Stratégie d'auteur"], internalLinks: ["/blog/eeat-google"] },

  // Lot GEO — Structured data (10 URLs)
  { id: 7,  title: "E-E-A-T : Expérience, Expertise, Autorité", url: "/blog/eeat-google", type: "creer", priority: "haute",   keyword: "eeat google",               volume: 1300,             lot: "Lot GEO — Structured data",    semanticScore: 0,  wordCount: 2400, h2s: ["Qu'est-ce que l'E-E-A-T ?", "Comment améliorer ses signaux", "E-E-A-T et IA générative"], internalLinks: ["/blog/seo-ia", "/blog/contenu-expert"] },
  { id: 8,  title: "Schema.org et données structurées",         url: "/blog/schema-org",   type: "creer", priority: "haute",   keyword: "données structurées seo",   volume: 1100,             lot: "Lot GEO — Structured data",    semanticScore: 0,  wordCount: 1800, h2s: ["Introduction aux données structurées", "Les types de schema", "Implémenter JSON-LD"], internalLinks: ["/blog/rich-snippets"] },
  { id: 31, title: "SEO et IA générative : s'adapter",          url: "/blog/seo-ia",       type: "creer", priority: "haute",   keyword: "seo intelligence artificielle", volume: 2100,          lot: "Lot GEO — Structured data",    semanticScore: 0,  wordCount: 2200, h2s: ["Impact de l'IA sur le SEO", "SGE et Search Generative Experience", "Stratégies d'adaptation"], internalLinks: ["/blog/eeat-google"] },
  { id: 32, title: "Answer Engine Optimization (AEO)",          url: "/blog/aeo",          type: "creer", priority: "haute",   keyword: "answer engine optimization",volume: 1700,             lot: "Lot GEO — Structured data",    semanticScore: 0,  wordCount: 1900, h2s: ["Qu'est-ce que l'AEO ?", "Différence SEO / AEO", "Optimiser pour les IA"], internalLinks: ["/blog/seo-ia"] },
  { id: 33, title: "GEO : Generative Engine Optimization",      url: "/blog/geo-seo",      type: "creer", priority: "haute",   keyword: "generative engine optimization", volume: 1500,         lot: "Lot GEO — Structured data",    semanticScore: 0,  wordCount: 2000, h2s: ["Définition du GEO", "Facteurs de citation IA", "Mesurer sa visibilité IA"], internalLinks: ["/blog/aeo", "/blog/seo-ia"] },
  { id: 34, title: "Rich snippets : guide 2024",                url: "/blog/rich-snippets",type: "creer", priority: "moyenne", keyword: "rich snippets seo",         volume: 1200,             lot: "Lot GEO — Structured data",    semanticScore: 0,  wordCount: 1400, h2s: ["Types de rich snippets", "Implémenter les données structurées", "Tester avec l'outil Google"], internalLinks: ["/blog/schema-org"] },
  { id: 35, title: "FAQ schema et voice search",                url: "/blog/faq-schema",   type: "creer", priority: "moyenne", keyword: "faq schema seo",            volume: 950,              lot: "Lot GEO — Structured data",    semanticScore: 0,  wordCount: 1100, h2s: ["Qu'est-ce que le FAQ schema ?", "Implémentation", "Voice search et SEO"], internalLinks: ["/blog/rich-snippets"] },
  { id: 36, title: "Signaux E-E-A-T pour les PME",              url: "/blog/eeat-pme",     type: "creer", priority: "moyenne", keyword: "eeat pme site web",         volume: 780,              lot: "Lot GEO — Structured data",    semanticScore: 0,  wordCount: 1300, h2s: ["E-E-A-T adapté aux PME", "Construire son autorité", "Contenu expert à budget limité"], internalLinks: ["/blog/eeat-google"] },
  { id: 37, title: "Optimisation pour ChatGPT et Perplexity",  url: "/blog/seo-chatgpt",  type: "creer", priority: "basse",   keyword: "optimiser site pour chatgpt",volume: 660,             lot: "Lot GEO — Structured data",    semanticScore: 0,  wordCount: 1600, h2s: ["Comment ChatGPT cite les sources", "Stratégie de citation", "Cas pratiques"], internalLinks: ["/blog/geo-seo"] },
  { id: 38, title: "Structured data pour les articles",         url: "/blog/article-schema", type: "creer", priority: "basse", keyword: "article schema structured data", volume: 540,          lot: "Lot GEO — Structured data",    semanticScore: 0,  wordCount: 900,  h2s: ["Article schema expliqué", "Implémenter NewsArticle", "Erreurs fréquentes"], internalLinks: ["/blog/schema-org"] },

  // Sans lot
  { id: 3,  title: "Création de liens (link building)", url: "/blog/link-building",  type: "optimiser", priority: "moyenne", keyword: "link building",    volume: 2900, position: 22, semanticScore: 55, wordCount: 2200, h2s: ["Qu'est-ce que le link building ?", "Les meilleures stratégies", "Mesurer son profil de liens"], internalLinks: ["/blog/netlinking"] },
  { id: 6,  title: "Rédaction SEO : le guide",          url: "/blog/redaction-seo",  type: "combler",   priority: "moyenne", keyword: "rédaction seo",    volume: 1600, position: 44, semanticScore: 0,  wordCount: 2000, h2s: ["Les fondamentaux de la rédaction SEO", "Structure d'un article optimisé"], internalLinks: ["/blog/cocon-semantique"] },
  { id: 9,  title: "Stratégie de contenu pilier",       url: "/blog/contenu-pilier", type: "creer",     priority: "basse",   keyword: "content hub seo",  volume: 880,              semanticScore: 0,  wordCount: 2600, h2s: ["La méthode Hub & Spoke", "Créer une page pilier efficace"], internalLinks: ["/blog/cocon-semantique"] },
];

export const LOT_COUNTS = BRIEFS.reduce<Record<string, number>>((acc, b) => {
  if (b.lot) acc[b.lot] = (acc[b.lot] || 0) + 1;
  return acc;
}, {});

export const LOT_COLORS_DEFAULT: Record<string, string> = {
  "Lot SEO — Optimisation Q2":  "#3B82F6",
  "Lot Création — Blog expert": "#10B981",
  "Lot GEO — Structured data":  "#A855F7",
  "Sans lot":                   "#64748B",
};

// Nombre de briefs "terminés" par lot (mock : 6, 4, 2)
const LOT_DONE: Record<string, number> = {
  "Lot SEO — Optimisation Q2":  6,
  "Lot Création — Blog expert": 4,
  "Lot GEO — Structured data":  2,
};

export function LotRow({
  lot,
  color,
  total,
  done,
  isLast = false,
  onNavigate,
}: {
  lot: string;
  color: string;
  total: number;
  done: number;
  isLast?: boolean;
  onNavigate?: () => void;
}) {
  const pct = Math.round((done / total) * 100);
  return (
    <div className={`group flex items-center justify-between gap-6 px-5 py-4 transition-colors hover:bg-[var(--bg-card-hover)] ${!isLast ? "border-b border-[var(--border-subtle)]" : ""}`}>
      <div className="flex items-center gap-3 min-w-0">
        <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: color }} />
        <p className="truncate text-[13px] font-medium text-[var(--text-primary)]">{lot}</p>
      </div>
      <div className="flex flex-shrink-0 items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--bg-card-hover)]">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
          </div>
          <span className="text-[11px] tabular-nums text-[var(--text-muted)]">{done}/{total}</span>
        </div>
        {onNavigate && (
          <button onClick={onNavigate} className="flex items-center gap-1 text-[12px] font-medium text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100 hover:text-[var(--text-primary)]">
            Voir <ChevronRightIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export function LotList({ onNavigate }: { onNavigate?: () => void }) {
  const lots = Object.keys(LOT_COLORS_DEFAULT).filter((l) => l !== "Sans lot");
  return (
    <div className="bg-[var(--bg-card)]">
      {lots.map((lot, i) => (
        <LotRow
          key={lot}
          lot={lot}
          color={LOT_COLORS_DEFAULT[lot]}
          total={LOT_COUNTS[lot] ?? 0}
          done={LOT_DONE[lot] ?? 0}
          isLast={i === lots.length - 1}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}

/* ── Config ──────────────────────────────────────────────────────────── */

export const TYPE_CONFIG: Record<BriefType, { label: string; color: string; colorBg: string; Icon: React.ElementType }> = {
  optimiser: { label: "Optimiser", color: "#E11D48", colorBg: "rgba(225,29,72,0.09)", Icon: ArrowPathIcon },
  combler:   { label: "Combler",   color: "#F59E0B", colorBg: "rgba(245,158,11,0.09)", Icon: PuzzlePieceIcon },
  creer:     { label: "Créer",     color: "#10B981", colorBg: "rgba(16,185,129,0.09)", Icon: SparklesIcon },
};

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  haute:   { label: "Haute",   color: "#E11D48", bg: "rgba(225,29,72,0.08)" },
  moyenne: { label: "Moyenne", color: "#F59E0B", bg: "rgba(245,158,11,0.08)" },
  basse:   { label: "Basse",   color: "#6366F1", bg: "rgba(99,102,241,0.08)" },
};

type Filter = "tous" | BriefType;
type BriefStatus = "todo" | "doing" | "done";

const STATUS_CONFIG: Record<BriefStatus, { label: string; color: string; bg: string }> = {
  todo:  { label: "À faire",  color: "var(--text-muted)",   bg: "var(--bg-secondary)" },
  doing: { label: "En cours", color: "#F59E0B",              bg: "rgba(245,158,11,0.09)" },
  done:  { label: "Terminé",  color: "#10B981",              bg: "rgba(16,185,129,0.09)" },
};

function shortLot(lot: string): string {
  return lot.replace(/^Lot\s+/i, "");
}

/* ── LotColorDot ─────────────────────────────────────────────────────── */

const LOT_COLOR_PALETTE = [
  "#E11D48", "#F97316", "#F59E0B", "#EAB308",
  "#84CC16", "#10B981", "#14B8A6", "#06B6D4",
  "#3B82F6", "#6366F1", "#A855F7", "#EC4899",
  "#64748B", "#78716C",
];

function LotColorDot({ color, onChange }: { color: string; onChange: (c: string) => void }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 8, left: r.left - 60 });
    }
    setOpen((v) => !v);
  }

  return (
    <div className="flex-shrink-0">
      <button
        ref={btnRef}
        onClick={handleClick}
        className="flex h-5 w-5 items-center justify-center rounded-full transition-transform hover:scale-110"
        aria-label="Changer la couleur du lot"
      >
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      </button>

      {open && typeof window !== "undefined" && createPortal(
        <div
          ref={popoverRef}
          className="fixed z-[999]"
          style={{ top: pos.top, left: pos.left }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3 shadow-[var(--shadow-floating)]">
            <div className="absolute -top-[7px] h-3.5 w-3.5 rotate-45 border-l border-t border-[var(--border-subtle)] bg-[var(--bg-card)]" style={{ left: 63 }} />
            <div className="flex flex-wrap gap-2" style={{ width: `${7 * 36 + 6 * 8}px` }}>
              {LOT_COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => { onChange(c); setOpen(false); }}
                  className="flex-shrink-0 flex items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95"
                  style={{ width: 36, height: 36 }}
                >
                  <span
                    className="rounded-full"
                    style={{
                      width: 22,
                      height: 22,
                      backgroundColor: c,
                      display: "block",
                      boxShadow: c === color ? `0 0 0 2px var(--bg-card), 0 0 0 3.5px ${c}` : undefined,
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

/* ── ViewSwitch ──────────────────────────────────────────────────────── */

function ViewSwitch({ value, onChange }: { value: "pages" | "lots"; onChange: (v: "pages" | "lots") => void }) {
  return (
    <div className="flex h-9 items-center gap-0.5 rounded-full bg-[var(--bg-secondary)] p-1">
      {(["pages", "lots"] as const).map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`h-7 rounded-full px-3 text-[13px] font-medium transition-all duration-200 ${
            value === v
              ? "bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          {v === "pages" ? "Pages" : "Lots"}
        </button>
      ))}
    </div>
  );
}

/* ── Semantic score pill ─────────────────────────────────────────────── */

function SemanticPill({ score }: { score: number }) {
  if (!score) return <span className="text-[13px] text-[var(--text-muted)]">—</span>;
  const color = score >= 70 ? "#10B981" : score >= 40 ? "#F59E0B" : "#E11D48";
  return (
    <span
      className="inline-flex items-center justify-center rounded-lg px-2 py-0.5 text-[11px] font-semibold tabular-nums"
      style={{ color, backgroundColor: `${color}18` }}
    >
      {score}
    </span>
  );
}

/* ── Status badge ────────────────────────────────────────────────────── */

function StatusBadge({ status, onChange }: { status: BriefStatus; onChange: (s: BriefStatus) => void }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <div onClick={(e) => { e.stopPropagation(); }}>
      <DropdownMenu
        width={148}
        trigger={
          <button
            className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium transition-opacity hover:opacity-70 cursor-pointer"
            style={{ color: cfg.color, backgroundColor: cfg.bg }}
          >
            {cfg.label}
          </button>
        }
      >
        {(Object.entries(STATUS_CONFIG) as [BriefStatus, typeof STATUS_CONFIG[BriefStatus]][]).map(([key, c]) => (
          <DropdownItem key={key} onClick={() => onChange(key)}>
            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: c.color === "var(--text-muted)" ? "var(--text-muted)" : c.color }} />
            <span className={status === key ? "font-semibold text-[var(--text-primary)]" : ""}>{c.label}</span>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </div>
  );
}

/* ── Checkbox ────────────────────────────────────────────────────────── */

function Checkbox({ checked, indeterminate = false, onChange }: { checked: boolean; indeterminate?: boolean; onChange: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-[4px] border transition-all ${
        checked || indeterminate
          ? "border-[var(--text-primary)] bg-[var(--text-primary)]"
          : "border-[var(--border-medium)] hover:border-[var(--text-primary)]"
      }`}
    >
      {indeterminate && !checked ? (
        <span className="block h-0.5 w-2 rounded-full bg-[var(--bg-primary)]" />
      ) : checked ? (
        <svg className="h-2.5 w-2.5 text-[var(--bg-primary)]" viewBox="0 0 10 10" fill="none">
          <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </button>
  );
}

/* ── Brief drawer (slide-in from right) ──────────────────────────────── */

type DrawerTab = "synthese" | "contenu" | "autorite" | "technique";

const DRAWER_TABS: { key: DrawerTab; label: string }[] = [
  { key: "synthese",  label: "Synthèse" },
  { key: "contenu",   label: "Contenu" },
  { key: "autorite",  label: "Autorité" },
  { key: "technique", label: "Technique" },
];

function SyntheseTab({ brief }: { brief: Brief }) {
  const { color, colorBg } = TYPE_CONFIG[brief.type];
  const pos = brief.position;
  const kd = pos ? Math.min(85, Math.max(10, pos * 2)) : 45;
  const oppScore = Math.round(
    Math.max(10, (brief.volume / 5000) * 35 + (pos ? (1 - pos / 100) * 45 : 20) + (brief.semanticScore / 100) * 20)
  );

  const actionTags = [
    { label: pos && pos <= 20 ? "Quick win" : "Long terme", color: "#10B981" },
    { label: "30–60 min", color: "#3E50F5" },
    { label: kd < 30 ? "Effort faible" : kd < 60 ? "Effort modéré" : "Effort élevé", color: "#F59E0B" },
  ];

  const compWords = Math.round(brief.wordCount * 0.18);
  const compSoseo = Math.round(Math.max(1, brief.semanticScore * 0.19));
  const compDseo = 1;
  const yourDseo = Math.round(brief.semanticScore / 5);
  const wordDeltaPct = Math.round(((brief.wordCount - compWords) / Math.max(compWords, 1)) * 100);
  const soseoDeltaPct = Math.round(((brief.semanticScore - compSoseo) / Math.max(compSoseo, 1)) * 100);

  /* ── Roadmap actions ── */
  const ACTIONS = [
    { p: "P0", text: "Réécrire l'introduction avec le mot-clé principal",           color: "#E11D48", bg: "rgba(225,29,72,0.08)",   time: "30 min", redac: true  },
    { p: "P0", text: `Ajouter ${Math.max(1, Math.round(brief.h2s.length * 0.5))} sections H2 manquantes`, color: "#E11D48", bg: "rgba(225,29,72,0.08)", time: "45 min", redac: true  },
    { p: "P1", text: `Enrichir le contenu à ${brief.wordCount + 400} mots minimum`,  color: "#F59E0B", bg: "rgba(245,158,11,0.08)", time: "2h",     redac: true  },
    { p: "P1", text: "Optimiser la balise title et meta description",                color: "#F59E0B", bg: "rgba(245,158,11,0.08)", time: "15 min", redac: false },
    { p: "P2", text: "Ajouter 3 liens internes depuis les pages piliers",            color: "#6366F1", bg: "rgba(99,102,241,0.08)", time: "20 min", redac: false },
  ];
  const [actionStatuses, setActionStatuses] = useState<BriefStatus[]>(ACTIONS.map(() => "todo"));
  const doneCount = actionStatuses.filter((s) => s === "done").length;
  const redacTime = "3h 15 min";

  /* ── CTR data ── */
  const ctrReel = pos ? Math.max(0.5, 28 - pos * 2.2).toFixed(1) : "3.5";
  const ctrAttendu = pos ? Math.max(2, 35 - pos * 2.5).toFixed(1) : "7.2";
  const ctrGap = (parseFloat(ctrAttendu) - parseFloat(ctrReel)).toFixed(1);
  const ctrGapNeg = parseFloat(ctrGap) > 0;

  /* ── Position evolution data ── */
  const posData = pos
    ? [pos + 18, pos + 14, pos + 11, pos + 9, pos + 7, pos + 5, pos + 4, pos + 3, pos + 2, pos + 1, pos + 1, pos]
    : [62, 55, 48, 42, 37, 31, 27, 22, 18, 15, 12, 10];
  const months = ["Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc", "Jan", "Fév", "Mar", "Avr", "Mai"];
  const chartW = 320; const chartH = 96; const pad = { t: 8, r: 8, b: 20, l: 28 };
  const minPos = Math.min(...posData); const maxPos = Math.max(...posData);
  const rangePos = maxPos - minPos || 1;
  const toX = (i: number) => pad.l + (i / (posData.length - 1)) * (chartW - pad.l - pad.r);
  const toY = (v: number) => pad.t + ((v - minPos) / rangePos) * (chartH - pad.t - pad.b);
  const pts = posData.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const areaPath = `M ${toX(0)},${toY(posData[0])} ` + posData.slice(1).map((v, i) => `L ${toX(i + 1)},${toY(v)}`).join(" ") + ` L ${toX(posData.length - 1)},${chartH - pad.b} L ${toX(0)},${chartH - pad.b} Z`;
  const actionDots = [2, 5, 9];

  return (
    <div className="space-y-5">
      {/* Hero card */}
      <div className="rounded-2xl border border-[var(--border-subtle)] p-5" style={{ background: "linear-gradient(to right, rgba(62,80,245,0.07), transparent)" }}>
        <p className="font-mono text-[11px] text-[var(--text-muted)]">{brief.url}</p>
        <h2 className="mt-2 text-[22px] font-semibold leading-snug tracking-tight text-[var(--text-primary)]">
          {pos ? `Position #${pos} sur ` : "Mot-clé : "}"{brief.keyword}"
        </h2>
        <p className="mt-1.5 text-[12px] text-[var(--text-muted)]">
          {brief.volume.toLocaleString()} recherches/mois · {brief.semanticScore < 50 ? "contenu à enrichir" : "contenu à optimiser"} · maillage interne à construire
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {actionTags.map((t) => (
            <span key={t.label} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ color: t.color, backgroundColor: `${t.color}18` }}>
              <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: t.color }} />
              {t.label}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-4 border-t border-[var(--border-subtle)] pt-4 text-[12px]">
          <div><span className="text-[var(--text-muted)]">ROI </span><span className="font-semibold text-[var(--text-primary)]">{oppScore}/100</span></div>
          <div className="h-3 w-px bg-[var(--border-subtle)]" />
          <div><span className="text-[var(--text-muted)]">Fréquence </span><span className="font-semibold text-[var(--text-primary)]">≥{pos ? Math.max(1.5, (10 - pos * 0.25)).toFixed(1) : "3.0"} pos/sem</span></div>
          <div className="h-3 w-px bg-[var(--border-subtle)]" />
          <div><span className="text-[var(--text-muted)]">MAJ </span><span className="font-semibold text-[var(--text-primary)]">28 avr.</span></div>
        </div>
      </div>

      {/* VS concurrent */}
      {pos && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {/* Votre page */}
            <div className="rounded-2xl border border-[var(--border-subtle)] p-4">
              <p className="mb-2.5 text-[12px] font-semibold text-[#3E50F5]">Votre page · #{pos}</p>
              <p className="text-[15px] font-bold text-[var(--text-primary)]">votre-site.fr <span className="text-[12px] font-normal text-[var(--text-muted)]">(vous)</span></p>
              <p className="mt-0.5 font-mono text-[11px] text-[var(--text-muted)] truncate">{brief.url}</p>
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {[
                  { label: "Mots", value: brief.wordCount.toLocaleString(), sub: `+${wordDeltaPct}% vs méd.`, subColor: "#10B981" },
                  { label: "SOSEO", value: brief.semanticScore > 0 ? String(brief.semanticScore) : "—", sub: `cible ${Math.round(brief.semanticScore * 0.9)}`, subColor: "var(--text-muted)" },
                  { label: "DSEO", value: String(yourDseo), sub: "/100 max", subColor: "var(--text-muted)" },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl bg-[var(--bg-secondary)] px-2.5 py-2.5">
                    <p className="text-[11px] font-semibold text-[var(--text-muted)]">{m.label}</p>
                    <p className="mt-0.5 text-[17px] font-semibold tabular-nums text-[var(--text-primary)]">{m.value}</p>
                    <p className="text-[11px]" style={{ color: m.subColor }}>{m.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Concurrent #1 */}
            <div className="rounded-2xl border border-[var(--border-subtle)] p-4">
              <p className="mb-2.5 text-[12px] font-semibold text-[#10B981]">Concurrent #1 SERP</p>
              <p className="text-[15px] font-bold text-[var(--text-primary)]">concurrent.fr <span className="text-[12px] font-normal text-[var(--text-muted)]">(ranking #1)</span></p>
              <p className="mt-0.5 font-mono text-[11px] text-[var(--text-muted)] truncate">/{brief.keyword.replace(/\s+/g, "-")}</p>
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {[
                  { label: "Mots", value: compWords.toLocaleString(), sub: `−${wordDeltaPct}% vs vous`, subColor: "#10B981" },
                  { label: "SOSEO", value: String(compSoseo), sub: `−${soseoDeltaPct}% vs vous`, subColor: "#10B981" },
                  { label: "DSEO", value: String(compDseo), sub: "propre", subColor: "var(--text-muted)" },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl bg-[var(--bg-secondary)] px-2.5 py-2.5">
                    <p className="text-[11px] font-semibold text-[var(--text-muted)]">{m.label}</p>
                    <p className="mt-0.5 text-[17px] font-semibold tabular-nums text-[var(--text-primary)]">{m.value}</p>
                    <p className="text-[11px]" style={{ color: m.subColor }}>{m.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lecture stratégique */}
          <div className="rounded-2xl border border-[rgba(62,80,245,0.25)] bg-[rgba(62,80,245,0.04)] p-4">
            <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
              <span className="font-semibold text-[#3E50F5]">Lecture stratégique : </span>
              votre page est {Math.round(brief.wordCount / Math.max(compWords, 1))}× plus longue
              {brief.semanticScore > 0 && compSoseo > 0 ? ` et ${Math.round(brief.semanticScore / Math.max(compSoseo, 1))}× plus optimisée` : ""} que le #1.
              Réduire la densité de contenu et travailler le netlinking est plus rentable qu'ajouter du contenu.
            </p>
          </div>
        </div>
      )}

      {/* Roadmap */}
      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <p className="text-[15px] font-semibold text-[var(--text-secondary)]">Roadmap d'exécution</p>
          <p className="text-[12px] text-[var(--text-muted)]">
            {ACTIONS.length} actions · 3h 45 min estimées · Rédaction {redacTime} · {doneCount}/{ACTIONS.length} faites
          </p>
        </div>
        <div className="space-y-2">
          {ACTIONS.map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 rounded-xl bg-[var(--bg-secondary)] px-3 py-2.5">
              <span className="flex-shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold" style={{ color: item.color, backgroundColor: item.bg }}>{item.p}</span>
              <span className="flex-1 text-[14px] text-[var(--text-secondary)]">{item.text}</span>
              <span className="flex-shrink-0 text-[11px] text-[var(--text-muted)]">{item.time}</span>
              <DropdownMenu
                trigger={
                  <button className="flex-shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition-opacity hover:opacity-80" style={{ color: STATUS_CONFIG[actionStatuses[i]].color, backgroundColor: STATUS_CONFIG[actionStatuses[i]].bg }}>
                    {STATUS_CONFIG[actionStatuses[i]].label}
                  </button>
                }
              >
                {(["todo", "doing", "done"] as BriefStatus[]).map((s) => (
                  <DropdownItem key={s} onClick={() => setActionStatuses((prev) => { const next = [...prev]; next[i] = s; return next; })}>
                    <span style={{ color: STATUS_CONFIG[s].color }}>{STATUS_CONFIG[s].label}</span>
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </div>
          ))}
        </div>
      </div>

      {/* Analyse CTR */}
      <div>
        <p className="mb-3 text-[15px] font-semibold text-[var(--text-secondary)]">Analyse CTR</p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: "CTR réel", value: `${ctrReel}%`, sub: pos ? `position #${pos}` : "actuel", color: "var(--text-primary)" },
            { label: "CTR attendu", value: `${ctrAttendu}%`, sub: "médiane SERP", color: "#10B981" },
            { label: "Gap CTR", value: `${ctrGapNeg ? "+" : "−"}${Math.abs(parseFloat(ctrGap)).toFixed(1)}%`, sub: ctrGapNeg ? "sous-performant" : "sur-performant", color: ctrGapNeg ? "#E11D48" : "#10B981" },
          ].map((kpi) => (
            <div key={kpi.label} className="flex flex-col rounded-2xl border border-[var(--border-subtle)] p-3">
              <p className="text-[11px] font-semibold text-[var(--text-muted)]">{kpi.label}</p>
              <p className="mt-1 text-[22px] font-semibold tabular-nums leading-none" style={{ color: kpi.color }}>{kpi.value}</p>
              <p className="mt-1.5 text-[11px] text-[var(--text-muted)]">{kpi.sub}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-[rgba(225,29,72,0.25)] bg-[rgba(225,29,72,0.04)] p-4 mb-3">
          <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
            <span className="font-semibold text-[#E11D48]">CTR sous-performant : </span>
            votre balise title n'est pas suffisamment incitative. Testez un format question ou intégrez un chiffre clé pour améliorer le taux de clic depuis la SERP.
          </p>
        </div>
        {/* Gradient slider bar */}
        <div className="rounded-2xl border border-[var(--border-subtle)] px-4 py-3">
          <div className="mb-1.5 flex justify-between text-[11px] text-[var(--text-muted)]">
            <span>−50%</span><span>0%</span><span>+50%</span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full" style={{ background: "linear-gradient(to right, #E11D48, #F59E0B 50%, #10B981)" }}>
            <div className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white shadow" style={{ left: `${50 - parseFloat(ctrGap)}%`, backgroundColor: ctrGapNeg ? "#E11D48" : "#10B981" }} />
          </div>
          <p className="mt-1.5 text-center text-[11px] text-[var(--text-muted)]">Position actuelle du CTR par rapport à la médiane SERP</p>
        </div>
      </div>

      {/* Aperçu SERP + Évolution position */}
      <div className="grid grid-cols-2 gap-3">
        {/* Aperçu SERP */}
        <div className="rounded-2xl border border-[var(--border-subtle)] p-4">
          <p className="mb-3 text-[13px] font-semibold text-[var(--text-secondary)]">Aperçu SERP</p>
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-3 space-y-1">
            <p className="text-[11px] text-[var(--text-muted)] font-mono truncate">votre-site.fr › {brief.url.replace(/^\//, "")}</p>
            {(() => {
              const title = `${brief.title} — Guide complet ${new Date().getFullYear()}`;
              const desc = `Découvrez notre guide complet sur ${brief.keyword}. Conseils pratiques, exemples et outils pour optimiser votre stratégie SEO.`;
              const titleLen = title.length;
              const descLen = desc.length;
              return (
                <>
                  <p className="text-[14px] font-medium leading-snug" style={{ color: "#1a0dab" }}>{title.length > 60 ? title.slice(0, 60) + "…" : title}</p>
                  <p className="text-[12px] leading-relaxed text-[var(--text-muted)]">{desc.length > 155 ? desc.slice(0, 155) + "…" : desc}</p>
                  <div className="mt-2 flex gap-3 pt-1 border-t border-[var(--border-subtle)]">
                    <span className={`text-[10px] font-medium ${titleLen > 60 ? "text-[#E11D48]" : "text-[#10B981]"}`}>Title {titleLen}/60</span>
                    <span className={`text-[10px] font-medium ${descLen > 155 ? "text-[#E11D48]" : "text-[#10B981]"}`}>Desc {descLen}/155</span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Évolution position */}
        <div className="rounded-2xl border border-[var(--border-subtle)] p-4">
          <p className="mb-3 text-[13px] font-semibold text-[var(--text-secondary)]">Évolution position</p>
          <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3E50F5" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3E50F5" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {/* grid lines */}
            {[0.25, 0.5, 0.75].map((f) => (
              <line key={f} x1={pad.l} x2={chartW - pad.r} y1={pad.t + f * (chartH - pad.t - pad.b)} y2={pad.t + f * (chartH - pad.t - pad.b)} stroke="var(--border-subtle)" strokeWidth={1} />
            ))}
            {/* area */}
            <path d={areaPath} fill="url(#posGrad)" />
            {/* line */}
            <polyline points={pts} fill="none" stroke="#3E50F5" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
            {/* action dots */}
            {actionDots.map((idx) => (
              <circle key={idx} cx={toX(idx)} cy={toY(posData[idx])} r={4} fill="#F59E0B" stroke="var(--bg-card)" strokeWidth={1.5} />
            ))}
            {/* x-axis labels */}
            {[0, 2, 4, 6, 8, 10, 11].map((idx) => (
              <text key={idx} x={toX(idx)} y={chartH - 4} textAnchor="middle" fontSize={8} fill="var(--text-muted)">{months[idx]}</text>
            ))}
            {/* y-axis labels */}
            {[minPos, Math.round((minPos + maxPos) / 2), maxPos].map((v) => (
              <text key={v} x={pad.l - 3} y={toY(v) + 3} textAnchor="end" fontSize={8} fill="var(--text-muted)">#{v}</text>
            ))}
          </svg>
          <div className="mt-2 flex items-center gap-4 text-[11px] text-[var(--text-muted)]">
            <span className="flex items-center gap-1"><span className="inline-block h-1.5 w-4 rounded-full bg-[#3E50F5]" />Position</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-[#F59E0B]" />Action réalisée</span>
          </div>
        </div>
      </div>

      {/* Structure H2 */}
      <div>
        <p className="mb-3 text-[15px] font-semibold text-[var(--text-secondary)]">Structure proposée</p>
        <ol className="space-y-2">
          {brief.h2s.map((h, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[14px] text-[var(--text-secondary)]">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-semibold" style={{ backgroundColor: colorBg, color }}>
                {i + 1}
              </span>
              {h}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function ContenuTab({ brief }: { brief: Brief }) {
  const { color, colorBg } = TYPE_CONFIG[brief.type];
  const score = brief.semanticScore;
  const scoreColor = score >= 70 ? "#10B981" : score >= 40 ? "#F59E0B" : "#E11D48";
  const circumference = 2 * Math.PI * 36;
  const dash = score > 0 ? (score / 100) * circumference : 0;

  const missingTopics = [
    "Études de cas et exemples concrets",
    "Comparatif des outils disponibles",
    "FAQ répondant aux questions longue traîne",
    "Données statistiques récentes (2024)",
    "Guide pas-à-pas pour débutants",
  ];

  const checklist = [
    { label: "Mot-clé principal dans le H1", ok: true },
    { label: "Mot-clé dans les 100 premiers mots", ok: brief.semanticScore > 30 },
    { label: "Alt text sur toutes les images", ok: false },
    { label: "Méta description optimisée", ok: brief.semanticScore > 40 },
    { label: "Liens internes vers pages piliers", ok: brief.internalLinks.length > 1 },
    { label: "Structure Hn cohérente", ok: brief.h2s.length >= 3 },
  ];

  return (
    <div className="space-y-6">
      {/* Score circle */}
      <div className="flex items-center gap-5 rounded-2xl border border-[var(--border-subtle)] p-5">
        <div className="flex-shrink-0">
          <svg width={88} height={88} viewBox="0 0 88 88">
            <circle cx={44} cy={44} r={36} fill="none" stroke="var(--bg-card-hover)" strokeWidth={8} />
            <circle
              cx={44} cy={44} r={36} fill="none"
              stroke={score > 0 ? scoreColor : "var(--border-medium)"}
              strokeWidth={8}
              strokeDasharray={`${dash} ${circumference}`}
              strokeLinecap="round"
              transform="rotate(-90 44 44)"
            />
            <text x={44} y={50} textAnchor="middle" fontSize={20} fontWeight={700} fill={score > 0 ? scoreColor : "var(--text-muted)"}>
              {score > 0 ? score : "—"}
            </text>
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-[var(--text-secondary)]">Score sémantique</p>
          <p className="mt-1 text-[13px] text-[var(--text-muted)]">
            {score === 0 ? "Page non encore analysée" : score < 40 ? "Couverture insuffisante — refonte recommandée" : score < 70 ? "Couverture partielle — enrichissement nécessaire" : "Bonne couverture sémantique"}
          </p>
          <div className="mt-3 flex gap-2">
            <div className="rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 text-center">
              <p className="text-[12px] text-[var(--text-muted)]">Mots</p>
              <p className="text-[14px] font-semibold text-[var(--text-primary)]">{brief.wordCount.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 text-center">
              <p className="text-[12px] text-[var(--text-muted)]">Sections H2</p>
              <p className="text-[14px] font-semibold text-[var(--text-primary)]">{brief.h2s.length}</p>
            </div>
            <div className="rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 text-center">
              <p className="text-[12px] text-[var(--text-muted)]">Liens int.</p>
              <p className="text-[14px] font-semibold text-[var(--text-primary)]">{brief.internalLinks.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sujets manquants */}
      <div>
        <p className="mb-3 text-[15px] font-semibold text-[var(--text-secondary)]">Sujets manquants à couvrir</p>
        <div className="space-y-2">
          {missingTopics.map((topic, i) => (
            <div key={i} className="flex items-center gap-2.5 rounded-xl bg-[var(--bg-secondary)] px-3 py-2.5">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(225,29,72,0.1)] text-[11px] font-bold text-[#E11D48]">✕</span>
              <span className="text-[14px] text-[var(--text-secondary)]">{topic}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Plan de contenu */}
      <div>
        <p className="mb-3 text-[15px] font-semibold text-[var(--text-secondary)]">Plan de contenu recommandé</p>
        <ol className="space-y-2">
          {brief.h2s.map((h, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-semibold" style={{ backgroundColor: colorBg, color }}>
                {i + 1}
              </span>
              <span className="text-[14px] text-[var(--text-secondary)]">{h}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Checklist qualité */}
      <div>
        <p className="mb-3 text-[15px] font-semibold text-[var(--text-secondary)]">Checklist qualité</p>
        <div className="space-y-2">
          {checklist.map((item, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <span className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[11px] ${item.ok ? "bg-[rgba(16,185,129,0.1)] text-[#10B981]" : "bg-[var(--bg-secondary)] text-[var(--text-muted)]"}`}>
                {item.ok ? "✓" : "○"}
              </span>
              <span className={`text-[13px] ${item.ok ? "text-[var(--text-secondary)]" : "text-[var(--text-muted)]"}`}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Maillage interne */}
      <div>
        <p className="mb-3 text-[15px] font-semibold text-[var(--text-secondary)]">Maillage interne suggéré</p>
        <div className="space-y-1.5">
          {brief.internalLinks.map((link) => (
            <div key={link} className="flex items-center gap-2 rounded-xl bg-[var(--bg-card-hover)] px-3 py-2 font-mono text-[12px] text-[var(--text-secondary)]">
              <MinusIcon className="h-3 w-3 flex-shrink-0 text-[var(--text-muted)]" />
              {link}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AutoriteTab({ brief }: { brief: Brief }) {
  const tf = brief.position ? Math.max(8, Math.round(30 - brief.position * 0.3)) : 12;
  const dr = 34;
  const refDomains = 145;

  const competitors = [
    { domain: "votre-site.fr", tf, dr, refDomains, isYou: true },
    { domain: "concurrent1.com", tf: 41, dr: 58, refDomains: 520 },
    { domain: "concurrent2.fr",  tf: 38, dr: 52, refDomains: 410 },
    { domain: "concurrent3.com", tf: 35, dr: 47, refDomains: 320 },
    { domain: "concurrent4.fr",  tf: 29, dr: 43, refDomains: 210 },
  ];

  const actions = [
    "Obtenir 5 liens depuis des sites éditoriaux (DR > 40)",
    "Publier un article invité sur un site thématique",
    "Contacter les auteurs des pages qui vous citent sans lien",
    "Créer une ressource linkable (infographie, étude de cas)",
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border-subtle)] p-4">
          <p className="mb-1 text-[12px] font-medium text-[var(--text-muted)]">Trust Flow</p>
          <p className="text-[30px] font-semibold tabular-nums text-amber-500">{tf}</p>
          <p className="mt-1 text-[11px] text-[var(--text-muted)]">Moy. : 36</p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border-subtle)] p-4">
          <p className="mb-1 text-[12px] font-medium text-[var(--text-muted)]">Domain Rating</p>
          <p className="text-[30px] font-semibold tabular-nums text-[var(--text-primary)]">{dr}</p>
          <p className="mt-1 text-[11px] text-[var(--text-muted)]">Moy. : 50</p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border-subtle)] p-4">
          <p className="mb-1 text-[12px] font-medium text-[var(--text-muted)]">Domaines réf.</p>
          <p className="text-[30px] font-semibold tabular-nums text-[var(--text-primary)]">{refDomains}</p>
          <p className="mt-1 text-[11px] text-[var(--text-muted)]">Moy. : 365</p>
        </div>
      </div>

      {/* Benchmark SERP */}
      <div>
        <p className="mb-3 text-[15px] font-semibold text-[var(--text-secondary)]">Benchmark SERP</p>
        <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="px-4 py-2.5 text-[12px] font-medium text-[var(--text-muted)]">Domaine</th>
                <th className="px-4 py-2.5 text-right text-[12px] font-medium text-[var(--text-muted)]">TF</th>
                <th className="px-4 py-2.5 text-right text-[12px] font-medium text-[var(--text-muted)]">DR</th>
                <th className="px-4 py-2.5 text-right text-[12px] font-medium text-[var(--text-muted)]">Domaines réf.</th>
              </tr>
            </thead>
            <tbody>
              {competitors.map((c, i) => (
                <tr key={i} className={`border-b border-[var(--border-subtle)] last:border-0 ${c.isYou ? "bg-[rgba(62,80,245,0.04)]" : ""}`}>
                  <td className="px-4 py-2.5">
                    <span className={`text-[13px] ${c.isYou ? "font-semibold text-[#3E50F5]" : "text-[var(--text-secondary)]"}`}>
                      {c.domain}{c.isYou ? " (vous)" : ""}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-[13px] tabular-nums text-[var(--text-primary)]">{c.tf}</td>
                  <td className="px-4 py-2.5 text-right text-[13px] tabular-nums text-[var(--text-primary)]">{c.dr}</td>
                  <td className="px-4 py-2.5 text-right text-[13px] tabular-nums text-[var(--text-primary)]">{c.refDomains}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions recommandées */}
      <div>
        <p className="mb-3 text-[15px] font-semibold text-[var(--text-secondary)]">Actions recommandées</p>
        <div className="space-y-2">
          {actions.map((action, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-xl bg-[var(--bg-secondary)] px-3 py-2.5">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(62,80,245,0.1)] text-[10px] font-bold text-[#3E50F5]">{i + 1}</span>
              <span className="text-[14px] text-[var(--text-secondary)]">{action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TechniqueTab({ brief }: { brief: Brief }) {
  const cwv = [
    { label: "LCP", value: "2.1s",  threshold: "< 2.5s",  ok: true },
    { label: "CLS", value: "0.08",  threshold: "< 0.1",   ok: true },
    { label: "INP", value: "180ms", threshold: "< 200ms", ok: true },
    { label: "FCP", value: "1.4s",  threshold: "< 1.8s",  ok: true },
  ];

  const structuredData = [
    { schema: "Article",        status: "absent",  ok: false },
    { schema: "BreadcrumbList", status: "présent", ok: true },
    { schema: "FAQ",            status: "absent",  ok: false },
  ];

  const technicalActions = [
    { p: "P0", text: "Ajouter le balisage Schema Article et FAQ",   color: "#E11D48", bg: "rgba(225,29,72,0.08)" },
    { p: "P1", text: "Compresser les images (format WebP)",         color: "#F59E0B", bg: "rgba(245,158,11,0.08)" },
    { p: "P1", text: "Minifier le JavaScript et CSS critiques",     color: "#F59E0B", bg: "rgba(245,158,11,0.08)" },
    { p: "P2", text: "Implémenter le lazy loading sur les images",  color: "#6366F1", bg: "rgba(99,102,241,0.08)" },
  ];

  return (
    <div className="space-y-6">
      {/* Statut indexation */}
      <div>
        <p className="mb-3 text-[15px] font-semibold text-[var(--text-secondary)]">Statut d'indexation</p>
        <div className="flex gap-2">
          {[
            { label: "Indexée", ok: true },
            { label: "Mobile-friendly", ok: true },
            { label: "HTTPS", ok: true },
          ].map((s) => (
            <span key={s.label} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium ${s.ok ? "bg-[rgba(16,185,129,0.1)] text-[#10B981]" : "bg-[rgba(225,29,72,0.1)] text-[#E11D48]"}`}>
              <span>{s.ok ? "✓" : "✕"}</span>
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Core Web Vitals */}
      <div>
        <p className="mb-3 text-[15px] font-semibold text-[var(--text-secondary)]">Core Web Vitals</p>
        <div className="grid grid-cols-2 gap-3">
          {cwv.map((m) => (
            <div key={m.label} className="rounded-2xl border border-[var(--border-subtle)] p-4">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-medium text-[var(--text-muted)]">{m.label}</p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${m.ok ? "bg-[rgba(16,185,129,0.1)] text-[#10B981]" : "bg-[rgba(225,29,72,0.1)] text-[#E11D48]"}`}>
                  {m.ok ? "Bon" : "À corriger"}
                </span>
              </div>
              <p className="mt-1.5 text-[22px] font-semibold tabular-nums text-[var(--text-primary)]">{m.value}</p>
              <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">Seuil : {m.threshold}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Structure des titres */}
      <div>
        <p className="mb-3 text-[15px] font-semibold text-[var(--text-secondary)]">Structure des titres</p>
        <div className="space-y-2 rounded-2xl border border-[var(--border-subtle)] p-4">
          <div className="flex items-start gap-3">
            <span className="w-7 flex-shrink-0 text-[10px] font-bold text-[#3E50F5]">H1</span>
            <span className="text-[13px] text-[var(--text-primary)]">{brief.title}</span>
          </div>
          {brief.h2s.map((h, i) => (
            <div key={i} className="flex items-start gap-3 pl-4">
              <span className="w-7 flex-shrink-0 text-[10px] font-bold text-[var(--text-muted)]">H2</span>
              <span className="text-[14px] text-[var(--text-secondary)]">{h}</span>
            </div>
          ))}
          <div className="flex items-start gap-3 pl-4 opacity-60">
            <span className="w-7 flex-shrink-0 text-[10px] font-bold text-[#E11D48]">H2</span>
            <span className="text-[13px] italic text-[#E11D48]">Section manquante à ajouter</span>
          </div>
        </div>
      </div>

      {/* Données structurées */}
      <div>
        <p className="mb-3 text-[15px] font-semibold text-[var(--text-secondary)]">Données structurées</p>
        <div className="space-y-2">
          {structuredData.map((item) => (
            <div key={item.schema} className="flex items-center justify-between rounded-xl bg-[var(--bg-secondary)] px-3 py-2.5">
              <span className="font-mono text-[12px] text-[var(--text-secondary)]">{item.schema}</span>
              <span className={`text-[11px] font-medium ${item.ok ? "text-[#10B981]" : "text-[#E11D48]"}`}>{item.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions techniques */}
      <div>
        <p className="mb-3 text-[15px] font-semibold text-[var(--text-secondary)]">Actions techniques</p>
        <div className="space-y-2">
          {technicalActions.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-xl bg-[var(--bg-secondary)] px-3 py-2.5">
              <span className="flex-shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold" style={{ color: item.color, backgroundColor: item.bg }}>{item.p}</span>
              <span className="text-[14px] text-[var(--text-secondary)]">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BriefDrawer({
  brief,
  briefs,
  onNavigate,
  onClose,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
}: {
  brief: Brief;
  briefs: Brief[];
  onNavigate: (b: Brief) => void;
  onClose: () => void;
  status: BriefStatus;
  onStatusChange: (s: BriefStatus) => void;
  priority: Priority;
  onPriorityChange: (p: Priority) => void;
}) {
  const [tab, setTab] = useState<DrawerTab>("synthese");
  const idx = briefs.findIndex((b) => b.id === brief.id);
  const hasPrev = idx > 0;
  const hasNext = idx < briefs.length - 1;

  const tabNavRef = useRef<HTMLDivElement>(null);
  const [tabIndicator, setTabIndicator] = useState({ left: 0, width: 0 });
  useLayoutEffect(() => {
    const btn = tabNavRef.current?.querySelector<HTMLElement>(`[data-drawtab="${tab}"]`);
    if (btn) setTabIndicator({ left: btn.offsetLeft, width: btn.offsetWidth });
  }, [tab]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowUp"   && hasPrev) onNavigate(briefs[idx - 1]);
      if (e.key === "ArrowDown" && hasNext) onNavigate(briefs[idx + 1]);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, onNavigate, briefs, idx, hasPrev, hasNext]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-y-0 right-0 z-50 flex w-[900px] max-w-[90vw] flex-col border-l border-[var(--border-subtle)] bg-[var(--bg-primary)] shadow-2xl"
      style={{ animation: "slide-from-right 280ms cubic-bezier(0.16,1,0.3,1) both" }}
    >
      {/* Header */}
      <div className="flex-shrink-0 px-10 pt-10 pb-0">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="mb-1.5 font-mono text-[11px] text-[var(--text-muted)]">{brief.url}</p>
            <h1 className="text-[24px] font-semibold leading-snug tracking-tight text-[var(--text-primary)]">{brief.title}</h1>
          </div>
          <div className="flex flex-shrink-0 items-center gap-1">
            <button
              onClick={() => hasPrev && onNavigate(briefs[idx - 1])}
              disabled={!hasPrev}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed"
              title="Brief précédent (↑)"
            >
              <ChevronRightIcon className="h-4 w-4 rotate-180" />
            </button>
            <span className="text-[11px] tabular-nums text-[var(--text-muted)]">{idx + 1}/{briefs.length}</span>
            <button
              onClick={() => hasNext && onNavigate(briefs[idx + 1])}
              disabled={!hasNext}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed"
              title="Brief suivant (↓)"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
            <div className="mx-1 h-4 w-px bg-[var(--border-subtle)]" />
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Status + Priority — visible on all tabs */}
        <div className="mb-5 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {/* Type badge — read-only */}
          <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium"
            style={{ color: TYPE_CONFIG[brief.type].color, backgroundColor: TYPE_CONFIG[brief.type].colorBg }}>
            {TYPE_CONFIG[brief.type].label}
          </span>
          {/* Priority — editable */}
          <DropdownMenu width={148} trigger={
            <button className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-opacity hover:opacity-70"
              style={{ color: PRIORITY_CONFIG[priority].color, backgroundColor: PRIORITY_CONFIG[priority].bg }}>
              <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: PRIORITY_CONFIG[priority].color }} />
              {PRIORITY_CONFIG[priority].label}
            </button>
          }>
            {(Object.entries(PRIORITY_CONFIG) as [Priority, typeof PRIORITY_CONFIG[Priority]][]).map(([key, c]) => (
              <DropdownItem key={key} onClick={() => onPriorityChange(key)}>
                <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
                <span className={priority === key ? "font-semibold text-[var(--text-primary)]" : ""}>{c.label}</span>
              </DropdownItem>
            ))}
          </DropdownMenu>
          {/* Status — editable */}
          <DropdownMenu width={148} trigger={
            <button className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium transition-opacity hover:opacity-70"
              style={{ color: STATUS_CONFIG[status].color, backgroundColor: STATUS_CONFIG[status].bg }}>
              {STATUS_CONFIG[status].label}
            </button>
          }>
            {(Object.entries(STATUS_CONFIG) as [BriefStatus, typeof STATUS_CONFIG[BriefStatus]][]).map(([key, c]) => (
              <DropdownItem key={key} onClick={() => onStatusChange(key)}>
                <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: c.color === "var(--text-muted)" ? "var(--text-muted)" : c.color }} />
                <span className={status === key ? "font-semibold text-[var(--text-primary)]" : ""}>{c.label}</span>
              </DropdownItem>
            ))}
          </DropdownMenu>
        </div>

        {/* Tab switcher */}
        <div ref={tabNavRef} className="relative flex items-center gap-0.5">
          <span
            className="pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-accent-primary"
            style={{
              left: tabIndicator.left,
              width: tabIndicator.width,
              transition: "left 0.2s ease-out, width 0.2s ease-out",
              willChange: "left, width",
            }}
          />
          {DRAWER_TABS.map(({ key, label }) => (
            <button
              key={key}
              data-drawtab={key}
              onClick={() => setTab(key)}
              className={`px-4 pb-3 text-[14px] font-semibold tracking-tight transition-colors ${
                tab === key
                  ? "text-[var(--text-primary)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-10 py-9">
        {tab === "synthese"  && <SyntheseTab  brief={brief} />}
        {tab === "contenu"   && <ContenuTab   brief={brief} />}
        {tab === "autorite"  && <AutoriteTab  brief={brief} />}
        {tab === "technique" && <TechniqueTab brief={brief} />}
      </div>

      {/* Footer */}
    </div>,
    document.body
  );
}

/* ── ColPill — breadcrumb-style filterable column header ─────────────── */

function ColPill({
  label,
  active,
  items,
  value,
  onChange,
  children,
}: {
  label: string;
  active: boolean;
  items?: { value: string; label: string }[];
  value?: string;
  onChange?: (v: string) => void;
  children?: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX });
    setOpen((v) => !v);
  }

  const close = () => setOpen(false);

  return (
    <>
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
          active
            ? "bg-[var(--bg-secondary)] text-[var(--text-primary)]"
            : "text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
        }`}
      >
        {label}
        <ChevronDownIcon className="h-3 w-3 flex-shrink-0" />
      </button>

      {open && typeof window !== "undefined" && createPortal(
        <div
          ref={dropRef}
          className="fixed z-[999] overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-lg"
          style={{ top: pos.top, left: pos.left, minWidth: children ? 220 : 170 }}
        >
          {children ? children(close) : (
            <div className="p-1">
              {items!.map((item) => (
                <button
                  key={item.value}
                  onClick={() => { onChange!(item.value); close(); }}
                  className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-[13px] transition-colors hover:bg-[var(--bg-secondary)]"
                >
                  <span className={value === item.value ? "font-medium text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}>
                    {item.label}
                  </span>
                  {value === item.value && <CheckIcon className="h-3.5 w-3.5 flex-shrink-0 text-[#3E50F5]" />}
                </button>
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}

/* ── BriefsView ──────────────────────────────────────────────────────── */

export function BriefsView() {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"pages" | "lots">("pages");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);
  const [briefs, setBriefs] = useState<Brief[]>(BRIEFS);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [activeBrief, setActiveBrief] = useState<Brief | null>(null);
  const [expandedLots, setExpandedLots] = useState<Set<string>>(
    new Set(["Lot SEO — Optimisation Q2", "Lot Création — Blog expert", "Lot GEO — Structured data"])
  );
  const [briefStatuses, setBriefStatuses] = useState<Record<number, BriefStatus>>({});
  function toggleStatus(id: number, next: BriefStatus) {
    setBriefStatuses((prev) => ({ ...prev, [id]: next }));
  }
  const [briefPriorities, setBriefPriorities] = useState<Record<number, Priority>>({});
  function setPriority(id: number, next: Priority) {
    setBriefPriorities((prev) => ({ ...prev, [id]: next }));
  }

  const [lotColors, setLotColors] = useState<Record<string, string>>({
    "Lot SEO — Optimisation Q2":  "#3B82F6",
    "Lot Création — Blog expert": "#10B981",
    "Lot GEO — Structured data":  "#A855F7",
    "Sans lot":                   "#64748B",
  });
  function setLotColor(lot: string, color: string) {
    setLotColors((prev) => ({ ...prev, [lot]: color }));
  }

  const [colType,     setColType]     = useState<BriefType | "all">("all");
  const [colPosMax,   setColPosMax]   = useState(0);   // 0 = tous
  const [colVolMin,   setColVolMin]   = useState(0);   // 0 = tous
  const [colPriority, setColPriority] = useState<Priority | "all">("all");
  const [colStatut,   setColStatut]   = useState<BriefStatus | "all">("all");
  const [colLot,      setColLot]      = useState("all");
  const [colScoreMin, setColScoreMin] = useState(-1);  // -1 = tous

  const hasActiveFilters =
    colType !== "all" || colPosMax > 0 || colVolMin > 0 ||
    colPriority !== "all" || colStatut !== "all" || colLot !== "all" || colScoreMin >= 0;

  function resetFilters() {
    setColType("all");
    setColPosMax(0);
    setColVolMin(0);
    setColPriority("all");
    setColStatut("all");
    setColLot("all");
    setColScoreMin(-1);
  }

  function assignLot(lot: string | null) {
    setBriefs((prev) => prev.map((b) => selected.has(b.id) ? { ...b, lot: lot ?? undefined } : b));
    setSelected(new Set());
  }

  function assignPriority(priority: Priority) {
    setBriefs((prev) => prev.map((b) => selected.has(b.id) ? { ...b, priority } : b));
    setSelected(new Set());
  }

  function deleteSelected() {
    if (activeBrief && selected.has(activeBrief.id)) setActiveBrief(null);
    setBriefs((prev) => prev.filter((b) => !selected.has(b.id)));
    setSelected(new Set());
  }

  const filtered = briefs.filter((b) => {
    if (colType !== "all" && b.type !== colType) return false;
    if (search && !b.title.toLowerCase().includes(search.toLowerCase()) && !b.keyword.toLowerCase().includes(search.toLowerCase())) return false;
    if (colPosMax > 0 && (b.position ?? 999) > colPosMax) return false;
    if (colVolMin > 0 && b.volume < colVolMin) return false;
    if (colPriority !== "all" && b.priority !== colPriority) return false;
    const statut = briefStatuses[b.id] ?? "todo";
    if (colStatut !== "all" && statut !== colStatut) return false;
    if (colLot === "__none__" && b.lot)              return false;
    if (colLot !== "all" && colLot !== "__none__" && b.lot !== colLot) return false;
    if (colScoreMin >= 0 && b.semanticScore < colScoreMin) return false;
    return true;
  });

  const allSelected = filtered.length > 0 && filtered.every((b) => selected.has(b.id));
  const someSelected = filtered.some((b) => selected.has(b.id));
  const selectedCount = filtered.filter((b) => selected.has(b.id)).length;

  function toggleAll() {
    if (allSelected) {
      setSelected((prev) => { const next = new Set(prev); filtered.forEach((b) => next.delete(b.id)); return next; });
    } else {
      setSelected((prev) => { const next = new Set(prev); filtered.forEach((b) => next.add(b.id)); return next; });
    }
  }

  function toggleOne(id: number) {
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }

  function toggleLot(lot: string) {
    setExpandedLots((prev) => {
      const next = new Set(prev.has(lot) ? [] : [lot]);
      return next;
    });
  }

  // Lots grouping
  const briefsByLot = filtered.reduce<Record<string, Brief[]>>((acc, b) => {
    const key = b.lot ?? "Sans lot";
    if (!acc[key]) acc[key] = [];
    acc[key].push(b);
    return acc;
  }, {});
  const lotKeys = Object.keys(briefsByLot).sort((a, b) =>
    a === "Sans lot" ? 1 : b === "Sans lot" ? -1 : a.localeCompare(b)
  );

  if (loading) return <SkeletonBriefs />;

  return (
    <div className="flex flex-1 flex-col min-h-0 animate-fade-in">

      {/* Toolbar */}
      <div className="mb-5 flex flex-shrink-0 items-center gap-4">
        <ViewSwitch value={viewMode} onChange={(v) => { setViewMode(v); setActiveBrief(null); }} />
        <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un brief…" />
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
          >
            <XMarkIcon className="h-3.5 w-3.5" />
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* Bulk action bar */}
      {someSelected && typeof window !== "undefined" && createPortal(
        <div className="pointer-events-none fixed inset-x-0 bottom-8 z-[500] flex justify-center animate-slide-up">
          <div
            className="pointer-events-auto relative flex items-center gap-1 rounded-2xl px-2 py-2 shadow-[0_8px_40px_rgba(0,0,0,0.28)]"
            style={{ backgroundColor: "var(--floating-bar-bg)" }}
          >
            <span className="px-3 text-[14px] font-medium" style={{ color: "var(--floating-bar-text)", opacity: 0.5 }}>{selectedCount} sélectionné{selectedCount > 1 ? "s" : ""}</span>
            <div className="h-4 w-px" style={{ backgroundColor: "var(--floating-bar-sep)" }} />

            {/* Assigner un lot */}
            <DropdownMenu
              upward
              width="auto"
              trigger={
                <button className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-[14px] font-medium transition-colors hover:bg-[var(--floating-bar-hover)]" style={{ color: "var(--floating-bar-text)" }}>
                  <FolderOpenIcon className="h-4 w-4" />Assigner un lot
                </button>
              }
            >
              {Object.keys(lotColors).map((lot) => (
                <DropdownItem key={lot} onClick={() => assignLot(lot === "Sans lot" ? null : lot)}>
                  <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: lotColors[lot] }} />
                  {lot}
                </DropdownItem>
              ))}
            </DropdownMenu>

            {/* Changer la priorité */}
            <DropdownMenu
              upward
              width={180}
              trigger={
                <button className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-[14px] font-medium transition-colors hover:bg-[var(--floating-bar-hover)]" style={{ color: "var(--floating-bar-text)" }}>
                  <AdjustmentsHorizontalIcon className="h-4 w-4" />Changer la priorité
                </button>
              }
            >
              {(["haute", "moyenne", "basse"] as Priority[]).map((p) => (
                <DropdownItem key={p} onClick={() => assignPriority(p)}>
                  <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: PRIORITY_CONFIG[p].color }} />
                  {PRIORITY_CONFIG[p].label}
                </DropdownItem>
              ))}
            </DropdownMenu>

            <div className="h-4 w-px" style={{ backgroundColor: "var(--floating-bar-sep)" }} />

            {/* Supprimer */}
            <button
              onClick={deleteSelected}
              className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-[14px] font-medium text-[#E11D48] transition-colors hover:bg-[rgba(225,29,72,0.12)]"
            >
              <TrashIcon className="h-4 w-4" />Supprimer
            </button>

            <div className="h-4 w-px" style={{ backgroundColor: "var(--floating-bar-sep)" }} />

            {/* Fermer */}
            <button
              onClick={() => setSelected(new Set())}
              className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-[var(--floating-bar-hover)]"
              style={{ color: "var(--floating-bar-text)" }}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* ── Pages view ── */}
      {viewMode === "pages" && (
        <div className="flex min-h-0 flex-1">

          {/* Table */}
          <div className="flex-1">
            {/* Header row */}
            <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-3">
              <Checkbox checked={allSelected} indeterminate={someSelected && !allSelected} onChange={toggleAll} />
              <span className="w-[22%] flex-shrink-0 min-w-0 text-[12px] font-medium text-[var(--text-muted)]">Page</span>
              <div className="flex flex-1 items-center gap-3">
                <div className="flex-1 min-w-0">
                  <ColPill label="Type" active={colType !== "all"} value={colType} onChange={(v) => setColType(v as BriefType | "all")} items={[
                    { value: "all",       label: "Tous les types" },
                    { value: "optimiser", label: "Optimiser" },
                    { value: "combler",   label: "Combler" },
                    { value: "creer",     label: "Créer" },
                  ]} />
                </div>
                <div className="flex-1 min-w-0">
                  <ColPill label={colPosMax > 0 ? `≤ #${colPosMax}` : "Position"} active={colPosMax > 0}>
                    {(close) => (
                      <div className="flex flex-col gap-4 p-3">
                        <div className="flex items-baseline justify-between">
                          <span className="text-[12px] font-medium text-[var(--text-muted)]">Position max</span>
                          <span className="text-[20px] font-semibold tabular-nums text-[var(--text-primary)]">
                            {colPosMax === 0 ? "Tous" : `#${colPosMax}`}
                          </span>
                        </div>
                        <div className="relative flex h-6 items-center">
                          <div className="absolute inset-x-0 h-1.5 rounded-full bg-[var(--bg-card-hover)]">
                            <div className="h-full rounded-full bg-[#3E50F5]" style={{ width: `${(colPosMax / 100) * 100}%` }} />
                          </div>
                          <input type="range" min={0} max={100} step={1} value={colPosMax}
                            onChange={(e) => setColPosMax(Number(e.target.value))}
                            className="relative w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#3E50F5] [&::-webkit-slider-thumb]:shadow-[0_0_0_3px_rgba(62,80,245,0.2)] [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#3E50F5]" />
                        </div>
                        <div className="flex gap-1.5">
                          {[0, 3, 10, 20, 50].map((v) => (
                            <button key={v} onClick={() => { setColPosMax(v); if (v > 0) close(); }}
                              className={`flex-1 rounded-lg py-1.5 text-[11px] font-semibold transition-colors ${colPosMax === v ? "bg-[#3E50F5] text-white" : "bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}>
                              {v === 0 ? "Tous" : `#${v}`}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </ColPill>
                </div>
                <div className="flex-1 min-w-0">
                  <ColPill label={colVolMin > 0 ? `≥ ${colVolMin >= 1000 ? `${colVolMin / 1000}k` : colVolMin}` : "Volume"} active={colVolMin > 0}>
                    {(close) => (
                      <div className="flex flex-col gap-4 p-3">
                        <div className="flex items-baseline justify-between">
                          <span className="text-[12px] font-medium text-[var(--text-muted)]">Volume min</span>
                          <span className="text-[20px] font-semibold tabular-nums text-[var(--text-primary)]">
                            {colVolMin === 0 ? "Tous" : colVolMin.toLocaleString("fr-FR")}
                          </span>
                        </div>
                        <div className="relative flex h-6 items-center">
                          <div className="absolute inset-x-0 h-1.5 rounded-full bg-[var(--bg-card-hover)]">
                            <div className="h-full rounded-full bg-[#3E50F5]" style={{ width: `${(colVolMin / 5000) * 100}%` }} />
                          </div>
                          <input type="range" min={0} max={5000} step={100} value={colVolMin}
                            onChange={(e) => setColVolMin(Number(e.target.value))}
                            className="relative w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#3E50F5] [&::-webkit-slider-thumb]:shadow-[0_0_0_3px_rgba(62,80,245,0.2)] [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#3E50F5]" />
                        </div>
                        <div className="flex gap-1.5">
                          {[0, 500, 1000, 2000, 5000].map((v) => (
                            <button key={v} onClick={() => { setColVolMin(v); if (v > 0) close(); }}
                              className={`flex-1 rounded-lg py-1.5 text-[11px] font-semibold transition-colors ${colVolMin === v ? "bg-[#3E50F5] text-white" : "bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}>
                              {v === 0 ? "Tous" : v >= 1000 ? `${v / 1000}k` : v}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </ColPill>
                </div>
                <div className="flex-1 min-w-0">
                  <ColPill label="Priorité" active={colPriority !== "all"} value={colPriority} onChange={(v) => setColPriority(v as Priority | "all")} items={[
                    { value: "all",     label: "Toutes" },
                    { value: "haute",   label: "Haute" },
                    { value: "moyenne", label: "Moyenne" },
                    { value: "basse",   label: "Basse" },
                  ]} />
                </div>
                <div className="flex-1 min-w-0">
                  <ColPill label="Statut" active={colStatut !== "all"} value={colStatut} onChange={(v) => setColStatut(v as BriefStatus | "all")} items={[
                    { value: "all",   label: "Tous" },
                    { value: "todo",  label: "À faire" },
                    { value: "doing", label: "En cours" },
                    { value: "done",  label: "Terminé" },
                  ]} />
                </div>
                <div className="flex-[1.5] min-w-0">
                  <ColPill label="Lot" active={colLot !== "all"} value={colLot} onChange={setColLot} items={[
                    { value: "all",                        label: "Tous les lots" },
                    { value: "Lot SEO — Optimisation Q2",  label: "SEO — Optimisation Q2" },
                    { value: "Lot Création — Blog expert", label: "Création — Blog expert" },
                    { value: "Lot GEO — Structured data",  label: "GEO — Structured data" },
                    { value: "__none__",                   label: "Sans lot" },
                  ]} />
                </div>
                <div className="w-16 flex-shrink-0">
                  <ColPill label={colScoreMin >= 0 ? `≥ ${colScoreMin}` : "Score"} active={colScoreMin >= 0}>
                    {(close) => (
                      <div className="flex flex-col gap-4 p-3">
                        <div className="flex items-baseline justify-between">
                          <span className="text-[12px] font-medium text-[var(--text-muted)]">Score min</span>
                          <span className="text-[20px] font-semibold tabular-nums text-[var(--text-primary)]">
                            {colScoreMin < 0 ? "Tous" : colScoreMin}
                          </span>
                        </div>
                        <div className="relative flex h-6 items-center">
                          <div className="absolute inset-x-0 h-1.5 rounded-full bg-[var(--bg-card-hover)]">
                            <div className="h-full rounded-full bg-[#3E50F5]" style={{ width: colScoreMin < 0 ? "0%" : `${colScoreMin}%` }} />
                          </div>
                          <input type="range" min={0} max={100} step={5} value={colScoreMin < 0 ? 0 : colScoreMin}
                            onChange={(e) => setColScoreMin(Number(e.target.value))}
                            className="relative w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#3E50F5] [&::-webkit-slider-thumb]:shadow-[0_0_0_3px_rgba(62,80,245,0.2)] [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#3E50F5]" />
                        </div>
                        <div className="flex gap-1.5">
                          {[-1, 20, 40, 60, 80].map((v) => (
                            <button key={v} onClick={() => { setColScoreMin(v); if (v >= 0) close(); }}
                              className={`flex-1 rounded-lg py-1.5 text-[11px] font-semibold transition-colors ${colScoreMin === v ? "bg-[#3E50F5] text-white" : "bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}>
                              {v < 0 ? "Tous" : v}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </ColPill>
                </div>
                <div className="w-5 flex-shrink-0" />
              </div>
            </div>

            {/* Rows */}
            <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 320px)" }}>
              {filtered.length === 0 ? (
                <EmptyState
                  icon={<DocumentTextIcon className="h-6 w-6" />}
                  title="Aucun brief trouvé"
                  description={search ? `Aucun résultat pour « ${search} »` : "Aucun brief dans cette catégorie."}
                />
              ) : (
                filtered.map((brief, i) => {
                  const { color, colorBg } = TYPE_CONFIG[brief.type];
                  const prio = PRIORITY_CONFIG[briefPriorities[brief.id] ?? brief.priority];
                  const isSelected = selected.has(brief.id);
                  const isActive = activeBrief?.id === brief.id;

                  return (
                    <button
                      key={brief.id}
                      onClick={() => setActiveBrief(isActive ? null : brief)}
                      className={`group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${i < filtered.length - 1 ? "border-b border-[var(--border-subtle)]" : ""} ${isActive ? "bg-[var(--bg-card-hover)]" : "hover:bg-[var(--bg-card-hover)]"}`}
                    >
                      <Checkbox checked={isSelected} onChange={() => toggleOne(brief.id)} />

                      <div className="w-[22%] flex-shrink-0 min-w-0">
                        <p className="truncate text-[14px] font-semibold text-[var(--text-primary)]">{brief.title}</p>
                        <p className="mt-0.5 truncate font-mono text-[11px] text-[var(--text-muted)]">{brief.url}</p>
                      </div>

                      <div className="flex flex-1 items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ color, backgroundColor: colorBg }}>
                            {TYPE_CONFIG[brief.type].label}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          {brief.position ? (
                            <span className={`text-[13px] font-semibold tabular-nums ${brief.position <= 10 ? "text-emerald-500" : brief.position <= 20 ? "text-amber-500" : "text-[var(--text-muted)]"}`}>
                              #{brief.position}
                            </span>
                          ) : <span className="text-[13px] text-[var(--text-muted)]">—</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[13px] font-semibold tabular-nums text-[var(--text-primary)]">{brief.volume.toLocaleString()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu
                              width={148}
                              trigger={
                                <button className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-opacity hover:opacity-70" style={{ color: prio.color, backgroundColor: prio.bg }}>
                                  <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: prio.color }} />
                                  {prio.label}
                                </button>
                              }
                            >
                              {(Object.entries(PRIORITY_CONFIG) as [Priority, typeof PRIORITY_CONFIG[Priority]][]).map(([key, c]) => (
                                <DropdownItem key={key} onClick={() => setPriority(brief.id, key)}>
                                  <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
                                  <span className={(briefPriorities[brief.id] ?? brief.priority) === key ? "font-semibold text-[var(--text-primary)]" : ""}>{c.label}</span>
                                </DropdownItem>
                              ))}
                            </DropdownMenu>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <StatusBadge
                            status={briefStatuses[brief.id] ?? "todo"}
                            onChange={(next) => toggleStatus(brief.id, next)}
                          />
                        </div>
                        <div className="flex-[1.5] min-w-0">
                          {brief.lot ? (
                            <Tooltip label={`${LOT_COUNTS[brief.lot]} URL${LOT_COUNTS[brief.lot] > 1 ? "s" : ""}`} side="top" portal>
                              <button
                                onClick={(e) => { e.stopPropagation(); setViewMode("lots"); setActiveBrief(null); }}
                                className="group/lot inline-flex max-w-full items-center gap-1.5 truncate rounded-full bg-[var(--bg-secondary)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
                              >
                                <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: lotColors[brief.lot] ?? "#64748B" }} />
                                <span className="truncate">{shortLot(brief.lot)}</span>
                              </button>
                            </Tooltip>
                          ) : (
                            <span className="text-[12px] text-[var(--text-muted)]">—</span>
                          )}
                        </div>
                        <div className="w-16 flex-shrink-0"><SemanticPill score={brief.semanticScore} /></div>
                        <ChevronRightIcon className={`h-5 w-5 flex-shrink-0 text-[var(--text-muted)] transition-all ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Lots view ── */}
      {viewMode === "lots" && (
        <div className="flex min-h-0 flex-1">

          {/* Lots accordion */}
          <div className="flex-1 overflow-y-auto">
            {lotKeys.length === 0 ? (
              <EmptyState
                icon={<DocumentTextIcon className="h-6 w-6" />}
                title="Aucun brief trouvé"
                description={search ? `Aucun résultat pour « ${search} »` : "Aucun brief dans cette catégorie."}
              />
            ) : (
              <div>
                {lotKeys.map((lot, lotIdx) => {
                  const lotBriefs = briefsByLot[lot];
                  const isExpanded = expandedLots.has(lot);
                  return (
                    <div key={lot} className={`overflow-hidden ${lotIdx < lotKeys.length - 1 ? "border-b border-[var(--border-subtle)]" : ""}`}>
                      <button
                        onClick={() => toggleLot(lot)}
                        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-[var(--bg-card-hover)]"
                      >
                        <LotColorDot
                          color={lotColors[lot] ?? "#64748B"}
                          onChange={(c) => setLotColor(lot, c)}
                        />
                        <span className="flex-1 text-[14px] font-semibold text-[var(--text-primary)]">{lot}</span>
                        <span className="text-[12px] text-[var(--text-muted)]">
                          {lotBriefs.length} brief{lotBriefs.length > 1 ? "s" : ""}
                        </span>
                        <ChevronRightIcon className={`h-5 w-5 flex-shrink-0 text-[var(--text-muted)] transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
                      </button>

                      {isExpanded && (
                        <div className="border-t border-[var(--border-subtle)]">
                          {lotBriefs.map((brief, i) => {
                            const { color, colorBg } = TYPE_CONFIG[brief.type];
                            const isActive = activeBrief?.id === brief.id;
                            const isSelected = selected.has(brief.id);
                            return (
                              <button
                                key={brief.id}
                                onClick={() => setActiveBrief(isActive ? null : brief)}
                                className={`group flex w-full items-center gap-3 px-5 py-3 text-left transition-colors ${i < lotBriefs.length - 1 ? "border-b border-[var(--border-subtle)]" : ""} ${isActive ? "bg-[var(--bg-card-hover)]" : "hover:bg-[var(--bg-card-hover)]"}`}
                              >
                                <Checkbox checked={isSelected} onChange={() => toggleOne(brief.id)} />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-[13px] font-semibold text-[var(--text-primary)]">{brief.title}</p>
                                  <p className="mt-0.5 truncate font-mono text-[11px] text-[var(--text-muted)]">{brief.url}</p>
                                </div>
                                <span className="inline-flex flex-shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ color, backgroundColor: colorBg }}>
                                  {TYPE_CONFIG[brief.type].label}
                                </span>
                                <span className="flex-shrink-0 text-[12px] tabular-nums text-[var(--text-muted)]">
                                  {brief.volume.toLocaleString()}
                                </span>
                                <ChevronRightIcon className={`h-5 w-5 flex-shrink-0 text-[var(--text-muted)] transition-all ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Drawer */}
      {activeBrief && (
        <BriefDrawer
          brief={activeBrief}
          briefs={filtered}
          onNavigate={setActiveBrief}
          onClose={() => setActiveBrief(null)}
          status={briefStatuses[activeBrief.id] ?? "todo"}
          onStatusChange={(next) => toggleStatus(activeBrief.id, next)}
          priority={briefPriorities[activeBrief.id] ?? activeBrief.priority}
          onPriorityChange={(next) => setPriority(activeBrief.id, next)}
        />
      )}
    </div>
  );
}
