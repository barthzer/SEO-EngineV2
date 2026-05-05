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
import { StatusPill, StatusPillDropdown, STATUS_CONFIG, type Status as BriefStatus } from "@/components/StatusPill";
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
    <div className="flex h-9 items-center gap-0.5 rounded-full bg-[var(--bg-subtle)] p-1">
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
      className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-[12px] font-semibold tabular-nums"
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
            className="inline-flex items-center rounded-full px-3 py-1.5 text-[12px] font-medium transition-opacity hover:opacity-70 cursor-pointer"
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

  const NBA_ALTS = [
    { n: 2, text: "Investiguer une possible cannibalisation", time: "5 min" },
    { n: 3, text: "Surveiller — position en progression, ne pas modifier le contenu", time: "5 min" },
    { n: 4, text: "Développer le profil de backlinks", time: "Long terme" },
  ];

  return (
    <div className="flex items-start gap-6">
      {/* ── Colonne principale ── */}
      <div className="flex-1 min-w-0 space-y-8">
      {/* Hero card */}
      <div className="rounded-2xl border border-[var(--border-medium)] p-7" style={{ background: "linear-gradient(135deg, var(--bg-subtle) 0%, var(--bg-card) 60%)" }}>
        <p className="font-mono text-[11px] text-[var(--text-muted)]">{brief.url}</p>
        <h2 className="mt-2 text-[22px] font-semibold leading-snug tracking-tight text-[var(--text-primary)]">
          {pos ? `Position #${pos} sur ` : "Mot-clé : "}"{brief.keyword}"
        </h2>
        <p className="mt-1.5 text-[12px] text-[var(--text-muted)]">
          {brief.volume.toLocaleString()} recherches/mois · {brief.semanticScore < 50 ? "contenu à enrichir" : "contenu à optimiser"} · maillage interne à construire
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {actionTags.map((t) => (
            <span key={t.label} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium" style={{ color: t.color, backgroundColor: `${t.color}18` }}>
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
        <div className="rounded-2xl border border-[var(--border-subtle)] p-6 space-y-5">
          {/* Deux colonnes */}
          <div className="grid grid-cols-2 gap-4">
            {/* Votre page */}
            <div>
              <p className="mb-2 text-[12px] font-semibold text-[#3E50F5]">Votre page · #{pos}</p>
              <p className="text-[14px] font-bold text-[var(--text-primary)]">votre-site.fr <span className="text-[12px] font-normal text-[var(--text-muted)]">(vous)</span></p>
              <p className="mt-0.5 font-mono text-[11px] text-[var(--text-muted)] truncate">{brief.url}</p>
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {[
                  { label: "Mots", value: brief.wordCount.toLocaleString(), sub: `+${wordDeltaPct}% vs méd.`, subColor: "#10B981" },
                  { label: "SOSEO", value: brief.semanticScore > 0 ? String(brief.semanticScore) : "—", sub: `cible ${Math.round(brief.semanticScore * 0.9)}`, subColor: "var(--text-muted)" },
                  { label: "DSEO", value: String(yourDseo), sub: "/100 max", subColor: "var(--text-muted)" },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl bg-[var(--bg-subtle)] px-2.5 py-2.5">
                    <p className="text-[11px] font-semibold text-[var(--text-muted)]">{m.label}</p>
                    <p className="mt-0.5 text-[17px] font-semibold tabular-nums text-[var(--text-primary)]">{m.value}</p>
                    <p className="text-[11px]" style={{ color: m.subColor }}>{m.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Concurrent #1 */}
            <div>
              <p className="mb-2 text-[12px] font-semibold text-[#10B981]">Concurrent #1 SERP</p>
              <p className="text-[14px] font-bold text-[var(--text-primary)]">concurrent.fr <span className="text-[12px] font-normal text-[var(--text-muted)]">(ranking #1)</span></p>
              <p className="mt-0.5 font-mono text-[11px] text-[var(--text-muted)] truncate">/{brief.keyword.replace(/\s+/g, "-")}</p>
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {[
                  { label: "Mots", value: compWords.toLocaleString(), sub: `−${wordDeltaPct}% vs vous`, subColor: "#10B981" },
                  { label: "SOSEO", value: String(compSoseo), sub: `−${soseoDeltaPct}% vs vous`, subColor: "#10B981" },
                  { label: "DSEO", value: String(compDseo), sub: "propre", subColor: "var(--text-muted)" },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl bg-[var(--bg-subtle)] px-2.5 py-2.5">
                    <p className="text-[11px] font-semibold text-[var(--text-muted)]">{m.label}</p>
                    <p className="mt-0.5 text-[17px] font-semibold tabular-nums text-[var(--text-primary)]">{m.value}</p>
                    <p className="text-[11px]" style={{ color: m.subColor }}>{m.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lecture stratégique */}
          <div className="rounded-xl border border-[rgba(62,80,245,0.2)] bg-[rgba(62,80,245,0.04)] px-4 py-3">
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
          <p className="text-[19px] font-semibold text-[var(--text-primary)]">Roadmap d'exécution</p>
          <p className="text-[12px] text-[var(--text-muted)]">
            {ACTIONS.length} actions · 3h 45 min estimées · Rédaction {redacTime} · {doneCount}/{ACTIONS.length} faites
          </p>
        </div>
        <div className="space-y-3">
          {ACTIONS.map((item, i) => {
            const st = actionStatuses[i];
            const isDone = st === "done";
            return (
              <div key={i} className="group rounded-2xl border border-[var(--border-subtle)] transition-colors hover:border-[var(--border-medium)]">
                {/* colored left bar */}
                  <div className="flex items-start gap-4 px-5 py-4">
                  {/* Index squircle + priority */}
                  <div className="flex flex-col items-center gap-1.5 flex-shrink-0 pt-0.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-[var(--border-medium)] text-[12px] font-semibold text-[var(--text-primary)]">
                      {i + 1}
                    </span>
                    <span className="text-[9px] font-bold tracking-wide" style={{ color: item.color }}>{item.p}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-[15px] font-medium leading-snug ${isDone ? "text-[var(--text-muted)] line-through" : "text-[var(--text-primary)]"}`}>
                      {item.text}
                    </p>
                    <div className="mt-1.5 flex items-center gap-3">
                      <span className="text-[12px] text-[var(--text-muted)]">⏱ {item.time}</span>
                      {item.redac && <span className="text-[12px] text-[var(--text-muted)]">· Rédaction</span>}
                    </div>
                  </div>

                  {/* Status pill */}
                  <div className="flex-shrink-0 pt-0.5">
                    <StatusPillDropdown
                      status={st}
                      onChange={(s) => setActionStatuses((prev) => { const next = [...prev]; next[i] = s; return next; })}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Analyse CTR */}
      <div>
        <p className="mb-5 text-[19px] font-semibold text-[var(--text-primary)]">Analyse CTR</p>
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
        <div className="rounded-2xl border border-[var(--border-subtle)] p-6">
          <p className="mb-3 text-[13px] font-semibold text-[var(--text-primary)]">Aperçu SERP</p>
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-3 space-y-1">
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
        <div className="rounded-2xl border border-[var(--border-subtle)] p-6">
          <p className="mb-3 text-[13px] font-semibold text-[var(--text-primary)]">Évolution position</p>
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
        <p className="mb-5 text-[19px] font-semibold text-[var(--text-primary)]">Structure proposée</p>
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
      </div>{/* fin colonne principale */}

      {/* ── NBA card sticky ── */}
      <div className="w-[340px] flex-shrink-0 sticky top-0">
        <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)]">

          {/* Header */}
          <div className="px-5 pt-5 pb-4">
            <p className="text-[17px] font-semibold leading-snug tracking-tight text-[var(--text-primary)]">
              {pos && pos <= 15
                ? "Créer des liens internes depuis les pages thématiques"
                : "Enrichir le contenu et optimiser la balise title"}
            </p>

            {/* 3 pills métriques */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {[
                { icon: "⏱", label: "30 min – 1h" },
                { icon: "🔗", label: `${brief.internalLinks.length * 82} liens int.` },
                { icon: "📈", label: "+0 vs méd." },
              ].map((m) => (
                <span key={m.label} className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1.5 text-[12px] text-[var(--text-secondary)]">
                  {m.icon} {m.label}
                </span>
              ))}
            </div>
          </div>

          {/* Corps */}
          <div className="px-5 pb-4 space-y-3">
            <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
              {pos ? `Position #${pos} sur ` : "Mot-clé : "}
              <span className="font-semibold text-[var(--text-primary)]">"{brief.keyword}"</span>
              {" "}({brief.volume.toLocaleString()} rech/mois).{" "}
              {pos && pos <= 15
                ? "Créer des liens internes depuis les pages thématiques pour viser le Top 3."
                : "Optimiser la balise title pour améliorer le CTR."}
            </p>

            {/* Callout signal */}
            {pos && brief.semanticScore > 30 && (
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-3">
                <p className="text-[12px] leading-relaxed text-[var(--text-secondary)]">
                  <span className="font-semibold text-[var(--text-primary)]">↗ Signaux contradictoires — </span>
                  SOSEO supérieur de {Math.round(brief.semanticScore * 0.6)} pts aux concurrents mais position #{pos}. Levier = autorité + intent.
                </p>
              </div>
            )}

            {/* CTA */}
            <button className="w-full rounded-xl bg-[var(--text-primary)] px-4 py-2.5 text-[13px] font-semibold text-[var(--bg-primary)] transition-opacity hover:opacity-75">
              Lancer cette action →
            </button>
          </div>

          {/* Alternatives */}
          <div className="px-5 pb-5">
            <p className="mb-3 text-[11px] font-semibold text-[var(--text-muted)]">Alternatives possibles</p>
            <div className="space-y-3">
              {NBA_ALTS.map((alt) => (
                <div key={alt.n} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)] text-[9px] font-semibold text-[var(--text-muted)]">{alt.n}</span>
                  <span className="flex-1 text-[12px] leading-snug text-[var(--text-secondary)]">{alt.text}</span>
                  <span className="flex-shrink-0 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-muted)]">{alt.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function ContenuTab({ brief }: { brief: Brief }) {
  const [aiMode, setAiMode] = useState<"conservateur" | "equilibre" | "agressif">("equilibre");

  const circumference = 2 * Math.PI * 36;
  const seoScore = 78;
  const seoDash = (seoScore / 100) * circumference;

  const missingTopics = [
    { word: "ROI contenu B2B",         desc: "Méthodes de calcul et benchmarks sectoriels",     ecart: "+18 pts" },
    { word: "Content scoring",          desc: "Grilles d'évaluation et outils automatisés",       ecart: "+14 pts" },
    { word: "Distribution multicanal",  desc: "LinkedIn, newsletter, syndicats de contenu",       ecart: "+12 pts" },
    { word: "Personas décideurs",       desc: "Cartographie des comités d'achat B2B",             ecart: "+11 pts" },
    { word: "Case studies format",      desc: "Structures narratives qui convertissent en B2B",   ecart: "+9 pts" },
  ];

  const aiActions = [
    "Enrichir la section introduction avec des données B2B récentes (2024)",
    "Ajouter un tableau comparatif des outils de content marketing",
    "Développer la sous-section 'Mesurer le ROI' avec 3 méthodes concrètes",
    "Intégrer 4 exemples de case studies avec résultats chiffrés",
    "Réécrire la conclusion avec un CTA orienté conversion",
  ];

  const iaSkills = [
    { label: "GEO Citability",    score: 62, color: "#F59E0B" },
    { label: "E-E-A-T signals",   score: 48, color: "#E11D48" },
    { label: "Architecture",      score: 71, color: "#10B981" },
    { label: "Patterns UX",       score: 55, color: "#F59E0B" },
    { label: "Template SEO-UX",   score: 80, color: "#10B981" },
  ];

  const h2ToAdd = [
    { text: "ROI et mesure de performance du content marketing", priority: "Critical" },
    { text: "Distribution et amplification du contenu",          priority: "High"     },
    { text: "Outils et stack technologique B2B",                 priority: "High"     },
  ];

  return (
    <div className="flex items-start gap-6">
      {/* ── Colonne principale ── */}
      <div className="flex-1 min-w-0 space-y-8">
      {/* Brief éditorial */}
      <div>
        <p className="mb-5 text-[19px] font-semibold text-[var(--text-primary)]">Brief éditorial</p>
        <div className="rounded-2xl border border-[var(--border-subtle)] p-6 space-y-5">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium bg-[rgba(62,80,245,0.08)] text-[#3E50F5]">B2B / Services</span>
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium bg-[rgba(99,102,241,0.08)] text-[#6366F1]">Informationnelle</span>
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium bg-[var(--bg-subtle)] text-[var(--text-secondary)]">Funnel TOFU</span>
          </div>

          <div>
            <p className="mb-2 text-[13px] font-semibold text-[var(--text-secondary)]">Topiques clés à couvrir</p>
            <div className="flex flex-wrap gap-2">
              {["Stratégie éditoriale", "Lead nurturing", "Content marketing", "KPIs contenu", "Personas B2B"].map((t) => (
                <span key={t} className="inline-flex items-center rounded-full border border-[var(--border-subtle)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-secondary)]">{t}</span>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-[13px] font-semibold text-[var(--text-secondary)]">Sections H2 à ajouter</p>
            <div className="space-y-2">
              {h2ToAdd.map((h, i) => (
                <div key={i} className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border-subtle)] px-4 py-3">
                  <span className="text-[13px] text-[var(--text-primary)]">{h.text}</span>
                  <span className={`flex-shrink-0 inline-flex items-center rounded-full px-3 py-1.5 text-[12px] font-medium ${h.priority === "Critical" ? "bg-[rgba(225,29,72,0.08)] text-[#E11D48]" : "bg-[rgba(245,158,11,0.08)] text-[#F59E0B]"}`}>
                    {h.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[13px] font-semibold text-[var(--text-secondary)]">Checklist qualité</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
              {[
                { label: "Mot-clé dans H1",                ok: true  },
                { label: "Méta description optimisée",     ok: true  },
                { label: "Mot-clé dans les 100 premiers mots", ok: true  },
                { label: "Alt text images",                ok: false },
                { label: "Liens internes vers piliers",    ok: true  },
                { label: "Structure Hn cohérente",         ok: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[10px] ${item.ok ? "bg-[rgba(16,185,129,0.1)] text-[#10B981]" : "bg-[var(--bg-subtle)] text-[var(--text-muted)]"}`}>
                    {item.ok ? "✓" : "○"}
                  </span>
                  <span className={`text-[12px] ${item.ok ? "text-[var(--text-secondary)]" : "text-[var(--text-muted)]"}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Brief SEO Score */}
      <div>
        <p className="mb-5 text-[19px] font-semibold text-[var(--text-primary)]">Score SEO de la page</p>
        <div className="flex items-center gap-8 rounded-2xl border border-[var(--border-subtle)] p-6">
          <div className="flex-shrink-0">
            <svg width={96} height={96} viewBox="0 0 88 88">
              <circle cx={44} cy={44} r={36} fill="none" stroke="var(--border-subtle)" strokeWidth={8} />
              <circle cx={44} cy={44} r={36} fill="none" stroke="#10B981" strokeWidth={8}
                strokeDasharray={`${seoDash} ${circumference}`} strokeLinecap="round" transform="rotate(-90 44 44)" />
              <text x={44} y={46} textAnchor="middle" fontSize={19} fontWeight={700} fill="#10B981">{seoScore}</text>
              <text x={44} y={59} textAnchor="middle" fontSize={10} fill="var(--text-muted)">/100</text>
            </svg>
          </div>
          <div className="flex-1 space-y-3">
            {[
              { label: "Sémantique",  val: 71, color: "#F59E0B" },
              { label: "Structure",   val: 71, color: "#F59E0B" },
              { label: "Densité",     val: 92, color: "#10B981" },
            ].map((m) => (
              <div key={m.label}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[12px] text-[var(--text-secondary)]">{m.label}</span>
                  <span className="text-[12px] font-semibold tabular-nums" style={{ color: m.color }}>{m.val}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--bg-subtle)]">
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${m.val}%`, backgroundColor: m.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Densité mot-clé */}
      <div>
        <p className="mb-5 text-[19px] font-semibold text-[var(--text-primary)]">Densité mot-clé cible</p>
        <div className="rounded-2xl border border-[var(--border-subtle)] p-6">
          <div className="flex items-end gap-6 mb-4">
            <div>
              <p className="text-[12px] text-[var(--text-muted)] mb-1">Votre page</p>
              <p className="text-[28px] font-semibold tabular-nums text-[#E11D48]">26.9</p>
              <p className="text-[11px] text-[var(--text-muted)]">occurrences / 1 000 mots</p>
            </div>
            <div className="pb-1 text-[var(--text-muted)]">vs</div>
            <div>
              <p className="text-[12px] text-[var(--text-muted)] mb-1">Concurrents (moy.)</p>
              <p className="text-[28px] font-semibold tabular-nums text-[var(--text-primary)]">39.7</p>
              <p className="text-[11px] text-[var(--text-muted)]">occurrences / 1 000 mots</p>
            </div>
            <div className="ml-auto">
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium bg-[rgba(225,29,72,0.08)] text-[#E11D48]">−32%</span>
            </div>
          </div>
          <div className="rounded-xl bg-[rgba(225,29,72,0.05)] border border-[rgba(225,29,72,0.12)] px-4 py-3 flex items-start gap-3">
            <svg width="16" height="16" viewBox="0 0 16 16" className="flex-shrink-0 mt-0.5" fill="none">
              <circle cx="8" cy="8" r="7" stroke="#E11D48" strokeWidth="1.5"/>
              <rect x="7.25" y="4.5" width="1.5" height="4.5" rx=".75" fill="#E11D48"/>
              <circle cx="8" cy="11" r=".75" fill="#E11D48"/>
            </svg>
            <p className="text-[12px] text-[#E11D48]">La densité est insuffisante par rapport aux concurrents. Augmenter les occurrences du mot-clé principal dans le corps du texte.</p>
          </div>
        </div>
      </div>

      {/* Maillage interne */}
      <div>
        <p className="mb-5 text-[19px] font-semibold text-[var(--text-primary)]">Maillage interne</p>
        <div className="rounded-2xl border border-[var(--border-subtle)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[22px] font-semibold text-[#10B981]">Excellent</p>
              <p className="text-[12px] text-[var(--text-muted)]">Score 100/100</p>
            </div>
            <div className="flex gap-6 text-right">
              <div>
                <p className="text-[20px] font-semibold tabular-nums text-[var(--text-primary)]">116</p>
                <p className="text-[11px] text-[var(--text-muted)]">liens entrants <span className="text-[#10B981]">(moy. 75)</span></p>
              </div>
              <div>
                <p className="text-[20px] font-semibold tabular-nums text-[var(--text-primary)]">62</p>
                <p className="text-[11px] text-[var(--text-muted)]">liens sortants <span className="text-[#10B981]">(moy. 48)</span></p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {[
              "La page reçoit 55% plus de liens internes que la médiane des concurrents.",
              "Les ancres de liens sont variées et sémantiquement pertinentes.",
            ].map((insight, i) => (
              <div key={i} className="flex items-start gap-2.5 rounded-xl bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.12)] px-4 py-3">
                <span className="flex-shrink-0 text-[#10B981] text-[13px]">✓</span>
                <p className="text-[12px] text-[var(--text-secondary)]">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top 5 sujets manquants */}
      <div>
        <p className="mb-5 text-[19px] font-semibold text-[var(--text-primary)]">Top 5 sujets manquants</p>
        <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="px-4 py-2.5 text-[12px] font-medium text-[var(--text-muted)]">Sujet</th>
                <th className="px-4 py-2.5 text-[12px] font-medium text-[var(--text-muted)]">Description</th>
                <th className="px-4 py-2.5 text-right text-[12px] font-medium text-[var(--text-muted)]">Écart</th>
              </tr>
            </thead>
            <tbody>
              {missingTopics.map((t, i) => (
                <tr key={i} className="border-b border-[var(--border-subtle)] last:border-0">
                  <td className="px-4 py-3 text-[13px] font-medium text-[var(--text-primary)] whitespace-nowrap">{t.word}</td>
                  <td className="px-4 py-3 text-[12px] text-[var(--text-muted)]">{t.desc}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center rounded-full px-3 py-1.5 text-[12px] font-medium bg-[rgba(225,29,72,0.08)] text-[#E11D48]">{t.ecart}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Skills IA */}
      <div>
        <p className="mb-5 text-[19px] font-semibold text-[var(--text-primary)]">Signaux IA &amp; GEO</p>
        <div className="rounded-2xl border border-[var(--border-subtle)] p-6 space-y-4">
          {iaSkills.map((s) => (
            <div key={s.label}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[13px] text-[var(--text-secondary)]">{s.label}</span>
                <span className="text-[13px] font-semibold tabular-nums" style={{ color: s.color }}>{s.score}/100</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--bg-subtle)]">
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${s.score}%`, backgroundColor: s.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optimiser avec Claude */}
      <div>
        <p className="mb-5 text-[19px] font-semibold text-[var(--text-primary)]">Optimiser le contenu avec Claude</p>
        <div className="rounded-2xl border border-[var(--border-subtle)] p-6 space-y-5">
          <div className="flex gap-1.5 rounded-xl bg-[var(--bg-subtle)] p-1">
            {(["conservateur", "equilibre", "agressif"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setAiMode(m)}
                className={`flex-1 rounded-lg px-3 py-2 text-[12px] font-medium transition-colors ${aiMode === m ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"}`}
              >
                {m === "conservateur" ? "Conservateur" : m === "equilibre" ? "Équilibré" : "Agressif"}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {aiActions.map((action, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-[var(--border-subtle)] px-4 py-3">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-[6px] border border-[var(--border-medium)] text-[11px] font-semibold text-[var(--text-secondary)]">{i + 1}</span>
                <span className="text-[13px] text-[var(--text-secondary)]">{action}</span>
              </div>
            ))}
          </div>
          <Button size="sm" className="w-full justify-center gap-2">
            <SparklesIcon className="h-4 w-4" />
            Lancer l'optimisation IA
          </Button>
        </div>
      </div>
      </div>{/* fin colonne principale */}

      {/* ── NBA card sticky ── */}
      <div className="w-[340px] flex-shrink-0 sticky top-0">
        <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
          <div className="px-5 pt-5 pb-4">
            <p className="text-[17px] font-semibold leading-snug tracking-tight text-[var(--text-primary)]">
              Enrichir le contenu sur les 5 sujets manquants
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {[{ icon: "⏱", label: "2h – 3h" }, { icon: "📝", label: "5 sujets" }, { icon: "📈", label: "+18 pts écart" }].map((m) => (
                <span key={m.label} className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1.5 text-[12px] text-[var(--text-secondary)]">
                  {m.icon} {m.label}
                </span>
              ))}
            </div>
          </div>
          <div className="px-5 pb-4 space-y-3">
            <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
              Le sujet <span className="font-semibold text-[var(--text-primary)]">ROI contenu B2B</span> représente le plus grand écart sémantique (+18 pts). Le couvrir en priorité avec des données chiffrées et des benchmarks sectoriels.
            </p>
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-3">
              <p className="text-[12px] leading-relaxed text-[var(--text-secondary)]">
                <span className="font-semibold text-[var(--text-primary)]">Score SEO 78/100 — </span>
                Sémantique et structure à 71% sont les deux leviers principaux. L'optimisation IA en mode Équilibré est recommandée.
              </p>
            </div>
            <button className="w-full rounded-xl bg-[var(--text-primary)] px-4 py-2.5 text-[13px] font-semibold text-[var(--bg-primary)] transition-opacity hover:opacity-75">
              Optimiser avec Claude →
            </button>
          </div>
          <div className="px-5 pb-5">
            <p className="mb-3 text-[11px] font-semibold text-[var(--text-muted)]">Alternatives possibles</p>
            <div className="space-y-3">
              {[
                { n: 2, text: "Travailler la densité mot-clé (26.9 → 39.7 cible)", time: "1h" },
                { n: 3, text: "Améliorer les signaux E-E-A-T (score 48/100)", time: "2h" },
                { n: 4, text: "Ajouter les 3 sections H2 manquantes identifiées", time: "3h" },
              ].map((alt) => (
                <div key={alt.n} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)] text-[9px] font-semibold text-[var(--text-muted)]">{alt.n}</span>
                  <span className="flex-1 text-[12px] leading-snug text-[var(--text-secondary)]">{alt.text}</span>
                  <span className="flex-shrink-0 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-muted)]">{alt.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AutoriteTab({ brief }: { brief: Brief }) {
  const [actionStatuses, setActionStatuses] = useState<BriefStatus[]>(["todo", "todo", "todo"]);

  const serpBenchmark = [
    { pos: "1",  url: "semrush.com/blog/content-marketing-b2b",      mots: "5 800", bas: "DR 92", bl: "847", pv: "12.4K", pt: "8 920", soseo: "94%", dseo: "76%" },
    { pos: "2",  url: "hubspot.com/marketing/b2b-content",            mots: "4 900", bas: "DR 88", bl: "612", pv: "9.8K",  pt: "7 140", soseo: "91%", dseo: "72%" },
    { pos: "3",  url: "contentmarketinginstitute.com/b2b-strategy",   mots: "6 200", bas: "DR 84", bl: "394", pv: "7.2K",  pt: "5 800", soseo: "88%", dseo: "68%" },
    { pos: "4",  url: "marketingprofs.com/b2b-content-guide",         mots: "4 100", bas: "DR 79", bl: "281", pv: "5.4K",  pt: "4 100", soseo: "84%", dseo: "63%" },
    { pos: "→",  url: "votre-site.fr/blog/content-marketing-b2b",     mots: "2 000", bas: "DR 34", bl: "0",   pv: "—",     pt: "—",     soseo: "—",   dseo: "—",   isYou: true },
    { pos: "Med", url: "Médiane (pos. 1–10)",                         mots: "4 500", bas: "DR 78", bl: "320", pv: "6.8K",  pt: "5 200", soseo: "86%", dseo: "65%", isMed: true },
    { pos: "Δ",  url: "Écart vous / médiane",                         mots: "−55%",  bas: "−56%",  bl: "−100%", pv: "n/a", pt: "n/a",  soseo: "n/a", dseo: "n/a", isEcart: true },
  ];

  const outreachTargets = [
    { domain: "journalduweb.fr",    dr: 64, fit: 5, contact: "editorial@journalduweb.fr" },
    { domain: "abondance.com",      dr: 58, fit: 5, contact: "contact@abondance.com"      },
    { domain: "webmarketing-com.com", dr: 52, fit: 4, contact: "redaction@wm-c.fr"        },
    { domain: "siecledigital.fr",   dr: 48, fit: 4, contact: "contact@siecledigital.fr"  },
    { domain: "ecommercemag.fr",    dr: 43, fit: 3, contact: "presse@ecommercemag.fr"    },
  ];

  const autoriteActions = [
    { p: "P1", text: "Publier un article invité sur journalduweb.fr (DR 64)", time: "2 sem.", impact: "Haut",  color: "#E11D48" },
    { p: "P2", text: "Créer une infographie linkable sur les KPIs content B2B",    time: "1 sem.", impact: "Moyen", color: "#F59E0B" },
    { p: "P3", text: "Contacter 10 auteurs qui citent des ressources similaires",   time: "3 sem.", impact: "Moyen", color: "#6366F1" },
  ];

  const ancreSegments = [
    { label: "Exact match",   pct: 20, color: "#E11D48" },
    { label: "Partial match", pct: 30, color: "#F59E0B" },
    { label: "Branded",       pct: 20, color: "#3E50F5" },
    { label: "Générique",     pct: 10, color: "#6366F1" },
    { label: "URL nue",       pct: 20, color: "#10B981" },
  ];

  return (
    <div className="flex items-start gap-6">
      {/* ── Colonne principale ── */}
      <div className="flex-1 min-w-0 space-y-8">
      {/* Score hero */}
      <div className="flex items-center gap-6 rounded-2xl border border-[var(--border-subtle)] p-6">
        <div className="flex-shrink-0">
          <svg width={88} height={88} viewBox="0 0 88 88">
            <circle cx={44} cy={44} r={36} fill="none" stroke="var(--border-subtle)" strokeWidth={8} />
            <circle cx={44} cy={44} r={36} fill="none" stroke="#E11D48" strokeWidth={8}
              strokeDasharray={`${(30 / 100) * 2 * Math.PI * 36} ${2 * Math.PI * 36}`}
              strokeLinecap="round" transform="rotate(-90 44 44)" />
            <text x={44} y={46} textAnchor="middle" fontSize={19} fontWeight={700} fill="#E11D48">30</text>
            <text x={44} y={59} textAnchor="middle" fontSize={10} fill="var(--text-muted)">/100</text>
          </svg>
        </div>
        <div>
          <p className="text-[19px] font-semibold text-[var(--text-primary)]">Score autorité</p>
          <p className="mt-1 text-[13px] text-[var(--text-muted)] max-w-sm">Profil de liens très faible face aux concurrents. Aucun backlink détecté — priorité absolue à la construction d'autorité.</p>
          <div className="mt-3 flex gap-4">
            <div>
              <p className="text-[11px] text-[var(--text-muted)]">Backlinks</p>
              <p className="text-[17px] font-semibold text-[#E11D48]">0</p>
            </div>
            <div>
              <p className="text-[11px] text-[var(--text-muted)]">Domaines réf.</p>
              <p className="text-[17px] font-semibold text-[var(--text-primary)]">0</p>
            </div>
            <div>
              <p className="text-[11px] text-[var(--text-muted)]">Trust Flow</p>
              <p className="text-[17px] font-semibold text-[var(--text-primary)]">n/a</p>
            </div>
            <div>
              <p className="text-[11px] text-[var(--text-muted)]">Obj. liens/mois</p>
              <p className="text-[17px] font-semibold text-[#3E50F5]">2</p>
            </div>
          </div>
        </div>
      </div>

      {/* Benchmark SERP unifié */}
      <div>
        <p className="mb-5 text-[19px] font-semibold text-[var(--text-primary)]">Benchmark SERP</p>
        <div className="overflow-x-auto rounded-2xl border border-[var(--border-subtle)]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                {["Pos.", "URL", "Mots", "BAS", "BL", "PV", "PT", "SOSEO", "DSEO"].map((h) => (
                  <th key={h} className={`px-3 py-2.5 text-[11px] font-medium text-[var(--text-muted)] ${h === "URL" ? "" : "text-right"} whitespace-nowrap`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {serpBenchmark.map((row, i) => (
                <tr key={i} className={`border-b border-[var(--border-subtle)] last:border-0 ${row.isYou ? "bg-[rgba(62,80,245,0.04)]" : row.isMed ? "bg-[var(--bg-subtle)]" : row.isEcart ? "opacity-70" : ""}`}>
                  <td className="px-3 py-2.5 text-[12px] font-semibold text-[var(--text-muted)] text-right">{row.pos}</td>
                  <td className={`px-3 py-2.5 text-[12px] font-mono max-w-[200px] truncate ${row.isYou ? "font-semibold text-[#3E50F5]" : row.isMed ? "font-semibold text-[var(--text-secondary)]" : "text-[var(--text-secondary)]"}`}>{row.url}</td>
                  {[row.mots, row.bas, row.bl, row.pv, row.pt, row.soseo, row.dseo].map((v, j) => (
                    <td key={j} className={`px-3 py-2.5 text-right text-[12px] tabular-nums ${row.isEcart && v !== "n/a" ? "font-semibold text-[#E11D48]" : "text-[var(--text-secondary)]"}`}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profil d'ancres */}
      <div>
        <p className="mb-5 text-[19px] font-semibold text-[var(--text-primary)]">Profil d'ancres</p>
        <div className="rounded-2xl border border-[var(--border-subtle)] p-6 space-y-4">
          <div className="rounded-xl bg-[var(--bg-subtle)] px-4 py-5 text-center">
            <p className="text-[13px] text-[var(--text-muted)]">Aucun backlink détecté — profil d'ancres non disponible</p>
            <p className="mt-1 text-[12px] text-[var(--text-muted)]">Cibles de répartition recommandées :</p>
          </div>
          <div className="space-y-2.5">
            {ancreSegments.map((s) => (
              <div key={s.label}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[12px] text-[var(--text-secondary)]">{s.label}</span>
                  <span className="text-[12px] font-semibold tabular-nums" style={{ color: s.color }}>{s.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                  <div className="h-1.5 rounded-full" style={{ width: `${s.pct}%`, backgroundColor: s.color, opacity: 0.5 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cibles d'outreach */}
      <div>
        <p className="mb-5 text-[19px] font-semibold text-[var(--text-primary)]">Cibles d'outreach</p>
        <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="px-4 py-2.5 text-[12px] font-medium text-[var(--text-muted)]">Domaine</th>
                <th className="px-4 py-2.5 text-right text-[12px] font-medium text-[var(--text-muted)]">DR</th>
                <th className="px-4 py-2.5 text-[12px] font-medium text-[var(--text-muted)]">Fit</th>
                <th className="px-4 py-2.5 text-[12px] font-medium text-[var(--text-muted)]">Contact</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {outreachTargets.map((t, i) => (
                <tr key={i} className="border-b border-[var(--border-subtle)] last:border-0">
                  <td className="px-4 py-3 text-[13px] font-medium text-[var(--text-primary)]">{t.domain}</td>
                  <td className="px-4 py-3 text-right text-[13px] tabular-nums text-[var(--text-secondary)]">{t.dr}</td>
                  <td className="px-4 py-3">
                    <span className="text-[#F59E0B] text-[12px]">{"★".repeat(t.fit)}{"☆".repeat(5 - t.fit)}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-[var(--text-muted)]">{t.contact}</td>
                  <td className="px-4 py-3">
                    <button className="rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)] hover:border-[var(--border-medium)] hover:text-[var(--text-primary)] transition-colors">
                      Contacter
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coach IA */}
      <div>
        <p className="mb-5 text-[19px] font-semibold text-[var(--text-primary)]">Coach IA — Diagnostic autorité</p>
        <div className="rounded-2xl border border-[var(--border-subtle)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-4 w-4 text-[#3E50F5]" />
              <span className="text-[13px] font-semibold text-[var(--text-primary)]">Analyse IA</span>
            </div>
            <span className="inline-flex items-center rounded-full px-3 py-1.5 text-[12px] font-medium bg-[rgba(16,185,129,0.08)] text-[#10B981]">85% confiance</span>
          </div>
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
            La page cible un mot-clé compétitif (content marketing B2B) sans profil de liens — classement quasi impossible sans construction d'autorité. Les concurrents en position 1–4 affichent tous un DR &gt; 79 et des centaines de backlinks vers cette URL spécifique.
          </p>
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
            Stratégie d'ancres recommandée : éviter l'exact match agressif (risque Penguin). Prioriser partial match et branded pour les 6 premiers mois, puis diversifier vers URL nues et génériques.
          </p>
        </div>
      </div>

      {/* Actions recommandées */}
      <div>
        <p className="mb-5 text-[19px] font-semibold text-[var(--text-primary)]">Actions recommandées</p>
        <div className="space-y-3">
          {autoriteActions.map((item, i) => {
            const isDone = actionStatuses[i] === "done";
            return (
              <div key={i} className="group rounded-2xl border border-[var(--border-subtle)] transition-colors hover:border-[var(--border-medium)]">
                <div className="flex items-start gap-4 px-5 py-4">
                  <div className="flex flex-col items-center gap-1.5 flex-shrink-0 pt-0.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-[var(--border-medium)] text-[12px] font-semibold text-[var(--text-primary)]">{i + 1}</span>
                    <span className="text-[9px] font-bold tracking-wide" style={{ color: item.color }}>{item.p}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[14px] font-medium leading-snug ${isDone ? "text-[var(--text-muted)] line-through" : "text-[var(--text-primary)]"}`}>{item.text}</p>
                    <div className="mt-1.5 flex items-center gap-3">
                      <span className="text-[12px] text-[var(--text-muted)]">⏱ {item.time}</span>
                      <span className="text-[12px] text-[var(--text-muted)]">· Impact {item.impact}</span>
                    </div>
                  </div>
                  <StatusPillDropdown
                    status={actionStatuses[i]}
                    onChange={(s) => setActionStatuses((prev) => { const n = [...prev]; n[i] = s; return n; })}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </div>{/* fin colonne principale */}

      {/* ── NBA card sticky ── */}
      <div className="w-[340px] flex-shrink-0 sticky top-0">
        <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
          <div className="px-5 pt-5 pb-4">
            <p className="text-[17px] font-semibold leading-snug tracking-tight text-[var(--text-primary)]">
              Publier un article invité sur journalduweb.fr
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {[{ icon: "⏱", label: "2 sem." }, { icon: "🔗", label: "DR 64" }, { icon: "📈", label: "Impact haut" }].map((m) => (
                <span key={m.label} className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1.5 text-[12px] text-[var(--text-secondary)]">
                  {m.icon} {m.label}
                </span>
              ))}
            </div>
          </div>
          <div className="px-5 pb-4 space-y-3">
            <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-primary)]">0 backlinks</span> sur cette page — impossible de se classer sans autorité externe. Un article invité sur un site DR 60+ est le levier le plus direct.
            </p>
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-3">
              <p className="text-[12px] leading-relaxed text-[var(--text-secondary)]">
                <span className="font-semibold text-[var(--text-primary)]">Objectif : 2 liens/mois — </span>
                À ce rythme, un profil d'autorité compétitif est atteignable en 6 mois d'après les données SERP.
              </p>
            </div>
            <button className="w-full rounded-xl bg-[var(--text-primary)] px-4 py-2.5 text-[13px] font-semibold text-[var(--bg-primary)] transition-opacity hover:opacity-75">
              Démarrer l'outreach →
            </button>
          </div>
          <div className="px-5 pb-5">
            <p className="mb-3 text-[11px] font-semibold text-[var(--text-muted)]">Alternatives possibles</p>
            <div className="space-y-3">
              {[
                { n: 2, text: "Créer une infographie linkable sur les KPIs B2B", time: "1 sem." },
                { n: 3, text: "Contacter les auteurs citant des ressources similaires", time: "3 sem." },
                { n: 4, text: "Construire le profil d'ancres recommandé (5 segments)", time: "Long terme" },
              ].map((alt) => (
                <div key={alt.n} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)] text-[9px] font-semibold text-[var(--text-muted)]">{alt.n}</span>
                  <span className="flex-1 text-[12px] leading-snug text-[var(--text-secondary)]">{alt.text}</span>
                  <span className="flex-shrink-0 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-muted)]">{alt.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TechniqueTab({ brief }: { brief: Brief }) {
  const [actionStatuses, setActionStatuses] = useState<BriefStatus[]>(["todo", "todo", "todo", "todo", "todo"]);

  const cwv = [
    { label: "LCP",  value: "3.90s",  threshold: "< 2.5s",  ok: false },
    { label: "FCP",  value: "3.75s",  threshold: "< 1.8s",  ok: false },
    { label: "CLS",  value: "0.08",   threshold: "< 0.1",   ok: true  },
    { label: "TTFB", value: "53ms",   threshold: "< 800ms", ok: true  },
  ];

  const auditItems = [
    { label: "Code statut",      value: "200 OK",        ok: true  },
    { label: "Balise title",     value: "Optimisée",     ok: true  },
    { label: "Temps de charg.",  value: "3.9s",          ok: false },
    { label: "Balise H1",        value: "Présente",      ok: true  },
    { label: "Meta description", value: "Présente",      ok: true  },
    { label: "Nombre de mots",   value: "2 000 mots",    ok: false },
    { label: "Balise canonical", value: "Présente",      ok: true  },
    { label: "Liens internes",   value: "62 liens",      ok: true  },
    { label: "Profondeur crawl", value: "3 clics",       ok: true  },
    { label: "Impressions GSC",  value: "0 (non indexé)", ok: false },
  ];

  const structuredData = [
    { schema: "Answer / FAQPage", status: "Détecté",           ok: true,  note: "Bien structuré" },
    { schema: "Organization",     status: "Manquant",          ok: false, note: "Critique" },
    { schema: "Service",          status: "Recommandé",        ok: false, note: "Opportunité" },
    { schema: "Article",          status: "Recommandé",        ok: false, note: "Opportunité" },
  ];

  const techActions = [
    { p: "P1", text: "Améliorer le LCP : optimiser les images above-the-fold (WebP + preload)", time: "1 sem.", impact: "Haut",   color: "#E11D48" },
    { p: "P1", text: "Réduire le FCP : différer le JS non critique, activer le cache navigateur",time: "1 sem.", impact: "Haut",   color: "#E11D48" },
    { p: "P2", text: "Ajouter les schémas Organization et Service (JSON-LD)",                     time: "2h",     impact: "Moyen", color: "#F59E0B" },
    { p: "P2", text: "Augmenter le nombre de mots à 3 500+ (benchmark médiane concurrents)",      time: "3h",     impact: "Moyen", color: "#F59E0B" },
    { p: "P3", text: "Soumettre l'URL dans Google Search Console pour déclencher l'indexation",   time: "15 min.", impact: "Faible", color: "#6366F1" },
  ];

  const indexPills = [
    { label: "Sitemap",    ok: true  },
    { label: "Indexée",    ok: false },
    { label: "Robots.txt", ok: true  },
    { label: "Crawl OK",   ok: true  },
  ];

  return (
    <div className="flex items-start gap-6">
      {/* ── Colonne principale ── */}
      <div className="flex-1 min-w-0 space-y-8">
      {/* Statut indexation */}
      <div>
        <div className="mb-5 flex items-center justify-between">
          <p className="text-[19px] font-semibold text-[var(--text-primary)]">Statut d'indexation</p>
          <span className="text-[12px] text-[var(--text-muted)]">GSC · dernière vérif. 5 mai 2026</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {indexPills.map((s) => (
            <span key={s.label} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium ${s.ok ? "bg-[rgba(16,185,129,0.08)] text-[#10B981]" : "bg-[rgba(225,29,72,0.08)] text-[#E11D48]"}`}>
              <span>{s.ok ? "✓" : "✕"}</span>
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Audit technique */}
      <div>
        <p className="mb-5 text-[19px] font-semibold text-[var(--text-primary)]">Audit technique</p>
        <div className="grid grid-cols-2 gap-2">
          {auditItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] px-4 py-3">
              <span className="text-[12px] text-[var(--text-muted)]">{item.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-medium text-[var(--text-secondary)]">{item.value}</span>
                <span className={`text-[11px] ${item.ok ? "text-[#10B981]" : "text-[#E11D48]"}`}>{item.ok ? "✓" : "✕"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Core Web Vitals */}
      <div>
        <p className="mb-5 text-[19px] font-semibold text-[var(--text-primary)]">Core Web Vitals</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {cwv.map((m) => (
            <div key={m.label} className="rounded-2xl border border-[var(--border-subtle)] p-6">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-medium text-[var(--text-muted)]">{m.label}</p>
                <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-[12px] font-medium ${m.ok ? "bg-[rgba(16,185,129,0.08)] text-[#10B981]" : "bg-[rgba(245,158,11,0.08)] text-[#F59E0B]"}`}>
                  {m.ok ? "Bon" : "À améliorer"}
                </span>
              </div>
              <p className="mt-1.5 text-[22px] font-semibold tabular-nums text-[var(--text-primary)]">{m.value}</p>
              <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">Seuil : {m.threshold}</p>
            </div>
          ))}
        </div>
        <div className="flex items-start gap-3 rounded-xl bg-[rgba(245,158,11,0.05)] border border-[rgba(245,158,11,0.15)] px-4 py-3">
          <svg width="16" height="16" viewBox="0 0 16 16" className="flex-shrink-0 mt-0.5" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#F59E0B" strokeWidth="1.5"/>
            <rect x="7.25" y="4.5" width="1.5" height="4.5" rx=".75" fill="#F59E0B"/>
            <circle cx="8" cy="11" r=".75" fill="#F59E0B"/>
          </svg>
          <p className="text-[12px] text-[#F59E0B]">LCP et FCP dépassent les seuils Google — impact négatif sur le classement. Optimisation des performances à prioriser en P1.</p>
        </div>
      </div>

      {/* Structure des titres */}
      <div>
        <p className="mb-5 text-[19px] font-semibold text-[var(--text-primary)]">Structure des titres</p>
        <div className="space-y-1.5 rounded-2xl border border-[var(--border-subtle)] p-6">
          <div className="flex items-start gap-3">
            <span className="w-8 flex-shrink-0 text-[10px] font-bold text-[#3E50F5]">H1</span>
            <span className="text-[13px] text-[var(--text-primary)]">{brief.title}</span>
          </div>
          {brief.h2s.map((h, i) => (
            <div key={i} className="flex items-start gap-3 pl-4">
              <span className="w-8 flex-shrink-0 text-[10px] font-bold text-[var(--text-muted)]">H2</span>
              <span className="text-[13px] text-[var(--text-secondary)]">{h}</span>
            </div>
          ))}
          {brief.h2s[0] && (
            <div className="pl-8 space-y-1">
              <div className="flex items-start gap-3">
                <span className="w-8 flex-shrink-0 text-[10px] font-bold text-[var(--text-muted)] opacity-50">H3</span>
                <span className="text-[12px] text-[var(--text-muted)]">Sous-section détail</span>
              </div>
            </div>
          )}
          {["ROI et performance du content marketing", "Distribution et amplification", "Outils et stack technologique"].map((missing, i) => (
            <div key={i} className="flex items-start gap-3 pl-4">
              <span className="w-8 flex-shrink-0 text-[10px] font-bold text-[#E11D48]">H2</span>
              <span className="text-[12px] italic text-[#E11D48]">{missing} — à ajouter</span>
            </div>
          ))}
        </div>
      </div>

      {/* Images */}
      <div>
        <p className="mb-5 text-[19px] font-semibold text-[var(--text-primary)]">Images</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          {[
            { label: "Total images",    value: "14",    ok: true  },
            { label: "Format WebP",     value: "21%",   ok: false },
            { label: "Alt manquants",   value: "5",     ok: false },
            { label: "Poids total",     value: "1.4 MB", ok: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] px-4 py-3">
              <span className="text-[12px] text-[var(--text-muted)]">{item.label}</span>
              <div className="flex items-center gap-2">
                <span className={`text-[13px] font-semibold tabular-nums ${item.ok ? "text-[#10B981]" : "text-[#E11D48]"}`}>{item.value}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-start gap-3 rounded-xl bg-[rgba(225,29,72,0.05)] border border-[rgba(225,29,72,0.12)] px-4 py-3">
          <svg width="16" height="16" viewBox="0 0 16 16" className="flex-shrink-0 mt-0.5" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#E11D48" strokeWidth="1.5"/>
            <rect x="7.25" y="4.5" width="1.5" height="4.5" rx=".75" fill="#E11D48"/>
            <circle cx="8" cy="11" r=".75" fill="#E11D48"/>
          </svg>
          <p className="text-[12px] text-[#E11D48]">79% des images ne sont pas en WebP — conversion recommandée pour réduire le poids de page et améliorer le LCP.</p>
        </div>
      </div>

      {/* Données structurées */}
      <div>
        <p className="mb-5 text-[19px] font-semibold text-[var(--text-primary)]">Données structurées</p>
        <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="px-4 py-2.5 text-[12px] font-medium text-[var(--text-muted)]">Schema</th>
                <th className="px-4 py-2.5 text-[12px] font-medium text-[var(--text-muted)]">Statut</th>
                <th className="px-4 py-2.5 text-[12px] font-medium text-[var(--text-muted)]">Note</th>
              </tr>
            </thead>
            <tbody>
              {structuredData.map((item) => (
                <tr key={item.schema} className="border-b border-[var(--border-subtle)] last:border-0">
                  <td className="px-4 py-3 font-mono text-[12px] text-[var(--text-primary)]">{item.schema}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-[12px] font-medium ${item.ok ? "bg-[rgba(16,185,129,0.08)] text-[#10B981]" : item.note === "Critique" ? "bg-[rgba(225,29,72,0.08)] text-[#E11D48]" : "bg-[rgba(99,102,241,0.08)] text-[#6366F1]"}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[var(--text-muted)]">{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions techniques */}
      <div>
        <p className="mb-5 text-[19px] font-semibold text-[var(--text-primary)]">Actions techniques</p>
        <div className="space-y-3">
          {techActions.map((item, i) => {
            const isDone = actionStatuses[i] === "done";
            return (
              <div key={i} className="group rounded-2xl border border-[var(--border-subtle)] transition-colors hover:border-[var(--border-medium)]">
                <div className="flex items-start gap-4 px-5 py-4">
                  <div className="flex flex-col items-center gap-1.5 flex-shrink-0 pt-0.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-[var(--border-medium)] text-[12px] font-semibold text-[var(--text-primary)]">{i + 1}</span>
                    <span className="text-[9px] font-bold tracking-wide" style={{ color: item.color }}>{item.p}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[14px] font-medium leading-snug ${isDone ? "text-[var(--text-muted)] line-through" : "text-[var(--text-primary)]"}`}>{item.text}</p>
                    <div className="mt-1.5 flex items-center gap-3">
                      <span className="text-[12px] text-[var(--text-muted)]">⏱ {item.time}</span>
                      <span className="text-[12px] text-[var(--text-muted)]">· Impact {item.impact}</span>
                    </div>
                  </div>
                  <StatusPillDropdown
                    status={actionStatuses[i]}
                    onChange={(s) => setActionStatuses((prev) => { const n = [...prev]; n[i] = s; return n; })}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </div>{/* fin colonne principale */}

      {/* ── NBA card sticky ── */}
      <div className="w-[340px] flex-shrink-0 sticky top-0">
        <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
          <div className="px-5 pt-5 pb-4">
            <p className="text-[17px] font-semibold leading-snug tracking-tight text-[var(--text-primary)]">
              Optimiser LCP et FCP pour passer les Core Web Vitals
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {[{ icon: "⏱", label: "1 sem." }, { icon: "⚡", label: "LCP 3.9s" }, { icon: "📈", label: "Impact haut" }].map((m) => (
                <span key={m.label} className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1.5 text-[12px] text-[var(--text-secondary)]">
                  {m.icon} {m.label}
                </span>
              ))}
            </div>
          </div>
          <div className="px-5 pb-4 space-y-3">
            <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
              LCP à <span className="font-semibold text-[var(--text-primary)]">3.90s</span> et FCP à <span className="font-semibold text-[var(--text-primary)]">3.75s</span> dépassent tous les deux les seuils Google. Ces deux métriques ont un impact direct sur le classement.
            </p>
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-3">
              <p className="text-[12px] leading-relaxed text-[var(--text-secondary)]">
                <span className="font-semibold text-[var(--text-primary)]">79% d'images non-WebP — </span>
                La conversion au format WebP + preload above-the-fold est le levier principal pour réduire le LCP.
              </p>
            </div>
            <button className="w-full rounded-xl bg-[var(--text-primary)] px-4 py-2.5 text-[13px] font-semibold text-[var(--bg-primary)] transition-opacity hover:opacity-75">
              Lancer l'audit perfs →
            </button>
          </div>
          <div className="px-5 pb-5">
            <p className="mb-3 text-[11px] font-semibold text-[var(--text-muted)]">Alternatives possibles</p>
            <div className="space-y-3">
              {[
                { n: 2, text: "Ajouter les schémas Organization et Service (JSON-LD)", time: "2h" },
                { n: 3, text: "Soumettre l'URL dans Google Search Console", time: "15 min." },
                { n: 4, text: "Augmenter le nombre de mots à 3 500+", time: "3h" },
              ].map((alt) => (
                <div key={alt.n} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)] text-[9px] font-semibold text-[var(--text-muted)]">{alt.n}</span>
                  <span className="flex-1 text-[12px] leading-snug text-[var(--text-secondary)]">{alt.text}</span>
                  <span className="flex-shrink-0 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-muted)]">{alt.time}</span>
                </div>
              ))}
            </div>
          </div>
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
      className="fixed inset-y-0 right-0 z-50 flex w-[1080px] max-w-[95vw] flex-col border-l border-[var(--border-subtle)] bg-[var(--bg-primary)] shadow-2xl"
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
              className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed"
              title="Brief précédent (↑)"
            >
              <ChevronRightIcon className="h-4 w-4 rotate-180" />
            </button>
            <span className="text-[11px] tabular-nums text-[var(--text-muted)]">{idx + 1}/{briefs.length}</span>
            <button
              onClick={() => hasNext && onNavigate(briefs[idx + 1])}
              disabled={!hasNext}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed"
              title="Brief suivant (↓)"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
            <div className="mx-1 h-4 w-px bg-[var(--border-subtle)]" />
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Status + Priority — visible on all tabs */}
        <div className="mb-5 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {/* Type badge — read-only */}
          <span className="inline-flex items-center rounded-full px-3 py-1.5 text-[12px] font-medium"
            style={{ color: TYPE_CONFIG[brief.type].color, backgroundColor: TYPE_CONFIG[brief.type].colorBg }}>
            {TYPE_CONFIG[brief.type].label}
          </span>
          {/* Priority — editable */}
          <DropdownMenu width={148} trigger={
            <button className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-opacity hover:opacity-70"
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
          <StatusPillDropdown status={status} onChange={onStatusChange} />
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
      <div className="flex-1 overflow-y-auto px-12 py-10">
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
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
          active
            ? "bg-[var(--bg-subtle)] text-[var(--text-primary)]"
            : "text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
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
                  className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-[13px] transition-colors hover:bg-[var(--bg-subtle)]"
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
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
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
                              className={`flex-1 rounded-lg py-1.5 text-[11px] font-semibold transition-colors ${colPosMax === v ? "bg-[#3E50F5] text-white" : "bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}>
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
                              className={`flex-1 rounded-lg py-1.5 text-[11px] font-semibold transition-colors ${colVolMin === v ? "bg-[#3E50F5] text-white" : "bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}>
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
                              className={`flex-1 rounded-lg py-1.5 text-[11px] font-semibold transition-colors ${colScoreMin === v ? "bg-[#3E50F5] text-white" : "bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}>
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
                          <span className="inline-flex items-center rounded-full px-3 py-1.5 text-[12px] font-medium" style={{ color, backgroundColor: colorBg }}>
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
                                <button className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-opacity hover:opacity-70" style={{ color: prio.color, backgroundColor: prio.bg }}>
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
                          <StatusPillDropdown
                            status={briefStatuses[brief.id] ?? "todo"}
                            onChange={(next) => toggleStatus(brief.id, next)}
                          />
                        </div>
                        <div className="flex-[1.5] min-w-0">
                          {brief.lot ? (
                            <Tooltip label={`${LOT_COUNTS[brief.lot]} URL${LOT_COUNTS[brief.lot] > 1 ? "s" : ""}`} side="top" portal>
                              <button
                                onClick={(e) => { e.stopPropagation(); setViewMode("lots"); setActiveBrief(null); }}
                                className="group/lot inline-flex max-w-full items-center gap-1.5 truncate rounded-full bg-[var(--bg-subtle)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
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
                                <span className="inline-flex flex-shrink-0 items-center rounded-full px-3 py-1.5 text-[12px] font-medium" style={{ color, backgroundColor: colorBg }}>
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
