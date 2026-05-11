"use client";

import { useState, useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/Button";
import { FilterTabs } from "@/components/FilterTabs";
import { EmptyState } from "@/components/EmptyState";
import { Tooltip, ChartTooltip } from "@/components/Tooltip";
import { AreaChart } from "@/components/AreaChart";
import { DropdownMenu, DropdownItem, DropdownSeparator, DropdownHeader } from "@/components/DropdownMenu";
import {
  ChevronRightIcon,
  ChevronDownIcon,
  ArrowUpIcon,
  ArrowLeftIcon,
  ArrowsRightLeftIcon,
  MinusIcon,
  DocumentTextIcon,
  XMarkIcon,
  FolderOpenIcon,
  AdjustmentsHorizontalIcon,
  TrashIcon,
  CheckIcon,
  TrophyIcon,
  CursorArrowRaysIcon,
  EyeIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { SearchInput } from "@/components/SearchInput";
import { SkeletonBriefs } from "@/components/Skeleton";
import { IconBadge } from "@/components/IconBadge";
import { StatusPill, StatusPillDropdown, STATUS_CONFIG, type Status as BriefStatus } from "@/components/StatusPill";
import { SegmentedControl } from "@/components/SegmentedControl";
import { Callout } from "@/components/Callout";
import { KpiCard } from "@/components/KpiCard";
import { SoftPanel } from "@/components/SoftPanel";
import { ScoreRing } from "@/components/ScoreRing";
import {
  ArrowPathIcon,
  PuzzlePieceIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import {
  Hash,
  Target,
  FileText,
  Sparkles,
  Activity,
  CircleDot,
  Gauge,
  ShieldCheck,
  Award,
  Eye,
  MousePointerClick,
  RefreshCw,
  Play,
  Plus,
} from "lucide-react";
import { LineDotChart } from "@/components/LineDotChart";
import { Sparkline } from "@/components/Sparkline";

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
  clics?: number;
  impressions?: number;
  positionGsc?: number;
  analysedAt?: string;
  analysisCount?: number;
  clicsDelta?: number;
  positionDelta?: number;
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
  onNavigate?: (lot: string) => void;
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
          <button onClick={() => onNavigate(lot)} className="flex items-center gap-1 text-[12px] font-medium text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100 hover:text-[var(--text-primary)]">
            Voir <ChevronRightIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export function LotList({ onNavigate }: { onNavigate?: (lot: string) => void }) {
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

export const TYPE_CONFIG: Record<BriefType, { label: string; color: string; colorBg: string; text: string; Icon: React.ElementType }> = {
  optimiser: { label: "Optimiser", color: "#E11D48", colorBg: "rgba(225,29,72,0.09)",  text: "#BE1239", Icon: ArrowPathIcon },
  combler:   { label: "Gap GSC",   color: "#F59E0B", colorBg: "rgba(245,158,11,0.09)", text: "#B45309", Icon: PuzzlePieceIcon },
  creer:     { label: "De zéro",   color: "#10B981", colorBg: "rgba(16,185,129,0.09)", text: "#059669", Icon: SparklesIcon },
};

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; text: string }> = {
  haute:   { label: "Haute",   color: "#E11D48", bg: "rgba(225,29,72,0.08)",  text: "#BE1239" },
  moyenne: { label: "Moyenne", color: "#F59E0B", bg: "rgba(245,158,11,0.08)", text: "#B45309" },
  basse:   { label: "Basse",   color: "#6366F1", bg: "rgba(99,102,241,0.08)", text: "#4338CA" },
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

/* ── Mock analysis data ──────────────────────────────────────────────── */

const BRIEF_EXTRA: Record<number, { clics?: number; impressions?: number; positionGsc?: number; analysedAt?: string; analysisCount?: number; clicsDelta?: number; positionDelta?: number }> = {
  1:  { clics: 320, impressions: 4200, positionGsc: 7.4,  analysedAt: "2026-04-20", analysisCount: 2, clicsDelta: +28,  positionDelta: -1.2 },
  2:  { clics: 142, impressions: 2800, positionGsc: 13.2, analysedAt: "2026-04-15", analysisCount: 1, clicsDelta: -15,  positionDelta: +0.8 },
  10: { clics: 89,  impressions: 1900, positionGsc: 18.7, analysedAt: "2026-04-10", analysisCount: 1, clicsDelta: +6,   positionDelta: -2.1 },
  11: { clics: 64,  impressions: 1400, positionGsc: 22.5,                                             clicsDelta: -8,   positionDelta: +1.5 },
  12: { clics: 51,  impressions: 1100, positionGsc: 26.8,                                             clicsDelta: +3,   positionDelta: -0.5 },
  4:  { clics: 45,  impressions: 1200, positionGsc: 30.1 },
  5:  { clics: 38,  impressions: 980,  positionGsc: 36.4 },
  3:  { clics: 112, impressions: 2400, positionGsc: 21.5, analysedAt: "2026-04-18", analysisCount: 1, clicsDelta: +19,  positionDelta: -1.8 },
};

/* ── Historical analysis model ───────────────────────────────────────── */

type HistoricalAnalysis = {
  date: string;
  semanticScore: number;
  wordCount: number;
  position?: number;
  positionGsc?: number;
  clics?: number;
  impressions?: number;
  actionsTotal?: number;
  actionsDone?: number;
};

const PAGE_HISTORY: Record<number, HistoricalAnalysis[]> = {
  // [0] = most recent → [n] = oldest
  1: [
    { date: "2026-04-20", semanticScore: 42, wordCount: 1800, position: 8,  positionGsc: 7.4,  clics: 320, impressions: 4200, actionsTotal: 5, actionsDone: 2 },
    { date: "2026-03-14", semanticScore: 35, wordCount: 1620, position: 11, positionGsc: 10.2, clics: 292, impressions: 3800, actionsTotal: 5, actionsDone: 4 },
    { date: "2026-02-10", semanticScore: 28, wordCount: 1500, position: 14, positionGsc: 13.8, clics: 241, impressions: 3300, actionsTotal: 4, actionsDone: 4 },
    { date: "2026-01-06", semanticScore: 21, wordCount: 1380, position: 17, positionGsc: 17.1, clics: 188, impressions: 2900, actionsTotal: 4, actionsDone: 4 },
    { date: "2025-12-01", semanticScore: 16, wordCount: 1200, position: 22, positionGsc: 21.4, clics: 134, impressions: 2400, actionsTotal: 3, actionsDone: 3 },
    { date: "2025-10-20", semanticScore: 12, wordCount: 1100, position: 28, positionGsc: 27.0, clics:  98, impressions: 1980, actionsTotal: 3, actionsDone: 3 },
  ],
  2: [
    { date: "2026-04-15", semanticScore: 38, wordCount: 1400, position: 14, positionGsc: 13.2, clics: 142, impressions: 2800, actionsTotal: 5, actionsDone: 1 },
    { date: "2026-03-02", semanticScore: 31, wordCount: 1280, position: 18, positionGsc: 17.6, clics: 118, impressions: 2400, actionsTotal: 5, actionsDone: 3 },
    { date: "2026-01-18", semanticScore: 24, wordCount: 1150, position: 23, positionGsc: 22.1, clics:  89, impressions: 1900, actionsTotal: 4, actionsDone: 4 },
    { date: "2025-11-30", semanticScore: 18, wordCount: 1050, position: 31, positionGsc: 30.4, clics:  54, impressions: 1450, actionsTotal: 4, actionsDone: 4 },
  ],
  3: [
    { date: "2026-04-18", semanticScore: 55, wordCount: 2200, position: 22, positionGsc: 21.5, clics: 112, impressions: 2400, actionsTotal: 6, actionsDone: 3 },
    { date: "2026-03-05", semanticScore: 47, wordCount: 2050, position: 25, positionGsc: 24.2, clics:  94, impressions: 2100, actionsTotal: 6, actionsDone: 5 },
    { date: "2026-01-22", semanticScore: 39, wordCount: 1880, position: 29, positionGsc: 28.7, clics:  71, impressions: 1750, actionsTotal: 5, actionsDone: 5 },
    { date: "2025-12-10", semanticScore: 30, wordCount: 1700, position: 34, positionGsc: 33.5, clics:  48, impressions: 1380, actionsTotal: 4, actionsDone: 4 },
    { date: "2025-10-28", semanticScore: 22, wordCount: 1540, position: 40, positionGsc: 39.8, clics:  29, impressions: 1050, actionsTotal: 3, actionsDone: 3 },
  ],
  10: [
    { date: "2026-04-10", semanticScore: 31, wordCount: 1200, position: 19, positionGsc: 18.7, clics: 89,  impressions: 1900, actionsTotal: 5, actionsDone: 2 },
    { date: "2026-02-28", semanticScore: 24, wordCount: 1100, position: 24, positionGsc: 22.8, clics: 71,  impressions: 1620, actionsTotal: 5, actionsDone: 4 },
    { date: "2026-01-14", semanticScore: 18, wordCount: 1020, position: 30, positionGsc: 28.4, clics: 52,  impressions: 1320, actionsTotal: 4, actionsDone: 4 },
    { date: "2025-11-25", semanticScore: 12, wordCount:  940, position: 38, positionGsc: 36.1, clics: 34,  impressions: 1040, actionsTotal: 3, actionsDone: 3 },
  ],
  11: [
    { date: "2026-04-10", semanticScore: 29, wordCount: 1600, position: 23, positionGsc: 22.5, clics: 64,  impressions: 1400, actionsTotal: 5, actionsDone: 0 },
    { date: "2026-02-20", semanticScore: 22, wordCount: 1480, position: 28, positionGsc: 27.3, clics: 49,  impressions: 1180, actionsTotal: 4, actionsDone: 2 },
    { date: "2025-12-15", semanticScore: 15, wordCount: 1350, position: 35, positionGsc: 34.0, clics: 31,  impressions:  920, actionsTotal: 4, actionsDone: 4 },
  ],
};

function formatAnalysisDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }).replace(".", "");
}

/* ── PositionSparkline ───────────────────────────────────────────────── */

function PositionSparkline({ history }: { history: HistoricalAnalysis[] }) {
  const pairs = [...history].reverse().map((h) => ({
    val: h.positionGsc ?? h.position ?? null,
    date: h.date,
  })).filter((p) => p.val !== null) as { val: number; date: string }[];

  if (pairs.length < 2) return null;

  return (
    <LineDotChart
      data={pairs}
      fillHeight
      invertY
      formatValue={(v) => v.toFixed(1)}
    />
  );
}

/* ── TrafficSparkline ────────────────────────────────────────────────── */

function TrafficSparkline({ history }: { history: HistoricalAnalysis[] }) {
  const pairs = [...history].reverse().map((h) => ({
    val: h.clics ?? null,
    date: h.date,
  })).filter((p) => p.val !== null) as { val: number; date: string }[];

  if (pairs.length < 2) return null;

  return (
    <LineDotChart
      data={pairs}
      fillHeight
      formatValue={(v) => Math.round(v).toLocaleString()}
    />
  );
}

/* ── ClicsSparkline — mini sparkline interactive : track la souris,
   affiche le dot du point le plus proche + tooltip avec date + valeur ── */

function ClicsSparkline({ history, color }: { history: { date: string; clics: number }[]; color: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const W = 120, H = 22;

  if (history.length < 2) return null;

  const max = Math.max(...history.map((d) => d.clics));
  const min = Math.min(...history.map((d) => d.clics));
  const range = max - min || 1;
  const pts = history.map((d, i) => ({
    x: (i / (history.length - 1)) * W,
    y: H - ((d.clics - min) / range) * H,
    val: d.clics,
    date: d.date,
  }));

  function handleMove(e: React.MouseEvent) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const xViewBox = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0;
    let bestDist = Infinity;
    pts.forEach((p, i) => {
      const d = Math.abs(p.x - xViewBox);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setHoverIdx(best);
  }

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }).replace(".", "");

  const hov = hoverIdx !== null ? pts[hoverIdx] : null;
  let tipX = 0, tipY = 0;
  if (hov && containerRef.current) {
    const rect = containerRef.current.getBoundingClientRect();
    tipX = (hov.x / W) * rect.width;
    tipY = (hov.y / H) * rect.height;
  }

  return (
    <div
      ref={containerRef}
      className="relative cursor-crosshair"
      onMouseMove={handleMove}
      onMouseLeave={() => setHoverIdx(null)}
    >
      <Sparkline data={history.map((d) => d.clics)} color={color} area width={W} height={H} strokeWidth={1.5} />
      {hov && (
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          className="pointer-events-none absolute inset-0 overflow-visible"
        >
          <circle cx={hov.x} cy={hov.y} r={3} fill={color} stroke="#FFFFFF" strokeWidth={1.5} />
        </svg>
      )}
      {hov && (
        <ChartTooltip x={tipX} y={tipY - 4}>
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-white/60">{fmtDate(hov.date)}</span>
            <span className="text-[13px] font-semibold text-white">{hov.val.toLocaleString("fr-FR")} clics</span>
          </div>
        </ChartTooltip>
      )}
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
            className="inline-flex items-center rounded-full px-2 py-1 text-[12px] font-medium transition-opacity hover:opacity-70 cursor-pointer"
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
  const { color, colorBg, text: typeText } = TYPE_CONFIG[brief.type];
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
  const [chartRange, setChartRange] = useState<"3m" | "6m" | "1an">("6m");
  const allPosData = pos
    ? [pos + 18, pos + 14, pos + 11, pos + 9, pos + 7, pos + 5, pos + 4, pos + 3, pos + 2, pos + 1, pos + 1, pos]
    : [62, 55, 48, 42, 37, 31, 27, 22, 18, 15, 12, 10];
  const allMonths = ["Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc", "Jan", "Fév", "Mar", "Avr", "Mai"];
  const sliceStart = chartRange === "3m" ? 9 : chartRange === "6m" ? 6 : 0;
  const posData = allPosData.slice(sliceStart);
  const months = allMonths.slice(sliceStart);
  const allActionDots = [{ idx: 2 }, { idx: 5 }, { idx: 9 }];
  const actionDots = allActionDots.map(d => ({ idx: d.idx - sliceStart })).filter(d => d.idx >= 0 && d.idx < posData.length);

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
      <div className="rounded-2xl border border-[var(--border-subtle)] p-7">
        <h2 className="text-[22px] font-semibold leading-snug tracking-tight text-[var(--text-primary)]">
          {pos ? `Position #${pos} sur ` : "Mot-clé : "}"{brief.keyword}"
        </h2>
        <p className="mt-1.5 text-[12px] text-[var(--text-muted)]">
          {brief.volume.toLocaleString()} recherches/mois · {brief.semanticScore < 50 ? "contenu à enrichir" : "contenu à optimiser"} · maillage interne à construire
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {actionTags.map((t) => (
            <span key={t.label} className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[12px] font-medium" style={{ color: t.color, backgroundColor: `${t.color}18` }}>
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

      {/* KPI grid */}
      {(() => {
        const bas = Math.max(20, Math.min(80, 65 - (pos || 50) * 0.5));
        const coveragePct = Math.min(99, Math.round(brief.semanticScore * 0.9));
        const wordsMediane = Math.round(brief.wordCount * 0.71);
        const kpis = [
          {
            icon: Hash,
            label: "Position",
            value: pos ? `#${pos}` : "N/A",
            sub: null,
            na: !pos,
            tt: (
              <div className="space-y-1.5">
                <p className="font-semibold">Position SERP indisponible</p>
                <p className="opacity-80">Erreur SERP. GSC moy. 28j : ~8</p>
                <p className="opacity-70">💡 Relancez l'analyse pour tenter de récupérer la position</p>
              </div>
            ),
          },
          {
            icon: Target,
            label: "Marché",
            value: brief.volume.toLocaleString(),
            sub: null,
            na: false,
            tt: (
              <div className="space-y-1.5">
                <p className="font-semibold">Volume de marché</p>
                <p className="opacity-80">Volume de recherche mensuel — pas de gain estimable à cette position</p>
              </div>
            ),
          },
          {
            icon: FileText,
            label: "Mots",
            value: brief.wordCount.toLocaleString(),
            sub: `/${wordsMediane.toLocaleString()}`,
            na: false,
            tt: (
              <div className="space-y-1.5">
                <p className="font-semibold">Mots (vous / médiane)</p>
                <p className="opacity-80">Nombre de mots de votre page comparé à la médiane des concurrents</p>
                <p className="opacity-70">💡 Visez au moins la médiane pour être compétitif</p>
              </div>
            ),
          },
          {
            icon: Sparkles,
            label: "SOSEO",
            value: brief.semanticScore > 0 ? String(Math.round(brief.semanticScore * 2.4)) : "—",
            sub: null,
            na: brief.semanticScore === 0,
            tt: (
              <div className="space-y-1.5">
                <p className="font-semibold">Optimisation sémantique (SOSEO)</p>
                <p className="opacity-80">Score d'optimisation SEO sémantique YourTextGuru. Correct, améliorable</p>
                <p className="opacity-70">💡 Comparez à la moyenne des concurrents</p>
              </div>
            ),
          },
          {
            icon: Activity,
            label: "DSEO",
            value: brief.semanticScore > 0 ? String(yourDseo) : "—",
            sub: null,
            na: brief.semanticScore === 0,
            tt: (
              <div className="space-y-1.5">
                <p className="font-semibold">Densité sémantique (DSEO)</p>
                <p className="opacity-80">Mesure la densité sémantique des termes clés dans votre contenu. OK</p>
                <p className="opacity-70">💡 Équilibre entre couverture et naturel</p>
              </div>
            ),
          },
          {
            icon: CircleDot,
            label: "Couverture",
            value: brief.semanticScore > 0 ? `${coveragePct}%` : "—",
            sub: null,
            na: brief.semanticScore === 0,
            tt: (
              <div className="space-y-1.5">
                <p className="font-semibold">Couverture sémantique</p>
                <p className="opacity-80">Pourcentage de termes sémantiques couverts par votre contenu</p>
                <p className="opacity-70">💡 &gt; 70% = Bonne couverture</p>
              </div>
            ),
          },
          {
            icon: Gauge,
            label: "KD",
            value: String(kd),
            sub: null,
            na: false,
            tt: (
              <div className="space-y-1.5">
                <p className="font-semibold">Keyword Difficulty</p>
                <p className="opacity-80">Difficulté à se positionner sur ce mot-clé (0-100)</p>
                <p className="opacity-70">💡 &lt; 30 = Facile · 30-60 = Modéré · &gt; 60 = Difficile</p>
              </div>
            ),
          },
          {
            icon: ShieldCheck,
            label: "BAS",
            value: String(Math.round(bas)),
            sub: null,
            na: false,
            tt: (
              <div className="space-y-1.5">
                <p className="font-semibold">Autorité du domaine (BAS)</p>
                <p className="opacity-80">Score d'autorité global du domaine selon Babbar (0-100)</p>
                <p className="opacity-70">💡 &gt; 30 = Autorité établie</p>
              </div>
            ),
          },
          {
            icon: Award,
            label: "Opp. Score",
            value: String(oppScore),
            sub: "/100",
            na: false,
            tt: (
              <div className="space-y-1.5">
                <p className="font-semibold">Score d'Opportunité</p>
                <p className="opacity-80">Score global de la page (0-100) basé sur l'analyse complète</p>
                <p className="opacity-70">💡 &gt; 70 = Bon · &gt; 85 = Excellent</p>
              </div>
            ),
          },
        ];
        return (
          <SoftPanel>
            <div className="grid grid-cols-3 gap-2">
              {kpis.map((kpi) => (
                <Tooltip key={kpi.label} label={kpi.tt} side="top" rich portal className="w-full">
                  <KpiCard
                    icon={kpi.icon}
                    label={kpi.label}
                    value={kpi.value}
                    sub={kpi.sub ?? undefined}
                    valueColor={kpi.na ? "var(--text-muted)" : undefined}
                    className="w-full cursor-default"
                  />
                </Tooltip>
              ))}
            </div>
          </SoftPanel>
        );
      })()}

      {/* Synthèse IA */}
      <div className="rounded-2xl border border-[var(--border-subtle)] p-6">
        <div className="mb-3 flex items-center gap-2">
          <SparklesIcon className="h-4 w-4 text-[var(--text-primary)]" />
          <span className="text-[13px] font-semibold text-[var(--text-primary)]">Synthèse IA</span>
          <span className="inline-flex items-center rounded-full border border-[var(--border-subtle)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-primary)]">GPT-4</span>
        </div>
        <p className="text-[14px] leading-relaxed text-[var(--text-primary)]">
          {pos
            ? `Votre page est en position #${pos} pour "${brief.keyword}". Le secteur d'activité détecté est celui de la formation, plus spécifiquement la formation en SEO. La page cible une intention principalement informationnelle, alignée sur le type dominant de la SERP. Cependant, la page manque de profondeur dans sa structure, notamment au niveau des sous-sections H3, comparée aux concurrents. Les concurrents incluent des détails sur les formateurs, les certifications et les méthodes pédagogiques qui ne sont pas suffisamment couverts sur la page analysée. Cette lacune dans la couverture sémantique et de structure limite le positionnement actuel de la page. Pour combler cet écart, il est crucial d'ajouter des sous-sections H3 pertinentes et d'améliorer la lisibilité générale.`
            : `La page cible le mot-clé "${brief.keyword}" mais aucune position SERP n'est disponible. Cela suggère que la page n'est pas encore indexée ou positionnée sur ce terme. Priorité : vérifier l'indexation, enrichir le contenu sémantiquement et construire le maillage interne depuis les pages piliers.`}
        </p>
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
            <p className="text-[14px] leading-relaxed text-[var(--text-secondary)]">
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
          <p className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Roadmap d'exécution</p>
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
        <p className="mb-5 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Analyse CTR</p>
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
        <Callout variant="error" className="mb-3">
          <span className="font-semibold">CTR sous-performant : </span>votre balise title n'est pas suffisamment incitative. Testez un format question ou intégrez un chiffre clé pour améliorer le taux de clic depuis la SERP.
        </Callout>
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

      {/* Aperçu SERP */}
      <div className="rounded-2xl border border-[var(--border-subtle)] p-6">
        <p className="mb-4 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Aperçu SERP</p>
        {(() => {
          const title = `${brief.title} — Guide complet ${new Date().getFullYear()}`;
          const desc = `Découvrez notre guide complet sur ${brief.keyword}. Conseils pratiques, exemples et outils pour optimiser votre stratégie SEO.`;
          const titleLen = title.length;
          const descLen = desc.length;
          return (
            <div className="space-y-1.5">
              <p className="font-mono text-[12px] text-[var(--text-muted)]">votre-site.fr › {brief.url.replace(/^\//, "")}</p>
              <p className="text-[18px] font-medium leading-snug" style={{ color: "#1a0dab" }}>{titleLen > 60 ? title.slice(0, 60) + "…" : title}</p>
              <p className="text-[14px] leading-relaxed text-[var(--text-secondary)]">{descLen > 155 ? desc.slice(0, 155) + "…" : desc}</p>
              <div className="flex gap-3 pt-2 border-t border-[var(--border-subtle)]">
                <span className={`text-[11px] font-medium ${titleLen > 60 ? "text-[#E11D48]" : "text-[#10B981]"}`}>Title {titleLen}/60</span>
                <span className={`text-[11px] font-medium ${descLen > 155 ? "text-[#E11D48]" : "text-[#10B981]"}`}>Desc {descLen}/155</span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Évolution position */}
      <div className="rounded-2xl border border-[var(--border-subtle)] p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Évolution position</p>
          <FilterTabs
            tabs={[{ key: "3m", label: "3m" }, { key: "6m", label: "6m" }, { key: "1an", label: "1 an" }]}
            value={chartRange}
            onChange={setChartRange}
          />
        </div>
        <AreaChart
          data={posData.map((v, i) => ({ label: months[i], value: v }))}
          inverted
          height={120}
          gradientId="brief-pos-grad"
          actionDots={actionDots}
          formatTooltip={(p) => (
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] text-white/60">{p.label}</span>
              <span className="text-[13px] font-semibold text-white">#{p.value}</span>
            </div>
          )}
        />
        <div className="mt-3 flex items-center gap-4 text-[11px] text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5"><span className="inline-block h-1.5 w-4 rounded-full bg-[#3E50F5]" />Position</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-[#F59E0B]" />Action réalisée</span>
        </div>
      </div>

      {/* Structure H2 */}
      <div>
        <p className="mb-5 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Structure proposée</p>
        <ol className="space-y-2">
          {brief.h2s.map((h, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[14px] text-[var(--text-secondary)]">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-semibold" style={{ backgroundColor: colorBg, color: typeText }}>
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
        <div className="nba-surface overflow-hidden rounded-2xl shadow-[var(--shadow-floating)]">

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
            <p className="text-[14px] leading-relaxed text-[var(--text-secondary)]">
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
            <Button variant="dark" size="sm" className="w-full justify-center">
              Lancer cette action →
            </Button>
          </div>

          {/* Alternatives */}
          <div className="px-5 pb-5">
            <p className="mb-3 text-[11px] font-semibold text-[var(--text-muted)]">Alternatives possibles</p>
            <div className="space-y-3">
              {NBA_ALTS.map((alt) => (
                <div key={alt.n} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)] text-[9px] font-semibold text-[var(--text-muted)]">{alt.n}</span>
                  <span className="flex-1 text-[12px] leading-snug text-[var(--text-secondary)]">{alt.text}</span>
                  <span className="flex-shrink-0 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-primary)]">{alt.time}</span>
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

  const seoScore = 78;

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
        <p className="mb-5 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Brief éditorial</p>
        <div className="rounded-2xl border border-[var(--border-subtle)] p-6 space-y-5">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[12px] font-medium bg-[rgba(62,80,245,0.08)] text-[#3E50F5]">B2B / Services</span>
            <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[12px] font-medium bg-[rgba(99,102,241,0.08)] text-[#6366F1]">Informationnelle</span>
            <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[12px] font-medium bg-[var(--bg-subtle)] text-[var(--text-primary)]">Funnel TOFU</span>
          </div>

          <div>
            <p className="mb-2 text-[14px] font-semibold text-[var(--text-secondary)]">Topiques clés à couvrir</p>
            <div className="flex flex-wrap gap-2">
              {["Stratégie éditoriale", "Lead nurturing", "Content marketing", "KPIs contenu", "Personas B2B"].map((t) => (
                <span key={t} className="inline-flex items-center rounded-full border border-[var(--border-subtle)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-secondary)]">{t}</span>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-[14px] font-semibold text-[var(--text-secondary)]">Sections H2 à ajouter</p>
            <div className="space-y-2">
              {h2ToAdd.map((h, i) => (
                <div key={i} className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border-subtle)] px-4 py-3">
                  <span className="text-[13px] text-[var(--text-primary)]">{h.text}</span>
                  <span className={`flex-shrink-0 inline-flex items-center rounded-full px-2 py-1 text-[12px] font-medium ${h.priority === "Critical" ? "bg-[rgba(225,29,72,0.08)] text-[#E11D48]" : "bg-[rgba(245,158,11,0.08)] text-[#F59E0B]"}`}>
                    {h.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[14px] font-semibold text-[var(--text-secondary)]">Checklist qualité</p>
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
        <p className="mb-5 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Score SEO de la page</p>
        <div className="flex items-center gap-8 rounded-2xl border border-[var(--border-subtle)] p-6">
          <div className="flex-shrink-0">
            <ScoreRing score={seoScore} size={96} strokeWidth={8} />
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
        <p className="mb-5 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Densité mot-clé cible</p>
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
              <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[12px] font-medium bg-[rgba(225,29,72,0.08)] text-[#E11D48]">−32%</span>
            </div>
          </div>
          <Callout variant="error">La densité est insuffisante par rapport aux concurrents. Augmenter les occurrences du mot-clé principal dans le corps du texte.</Callout>
        </div>
      </div>

      {/* Maillage interne */}
      <div>
        <p className="mb-5 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Maillage interne</p>
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
              <Callout key={i} variant="success">{insight}</Callout>
            ))}
          </div>
        </div>
      </div>

      {/* Top 5 sujets manquants */}
      <div>
        <p className="mb-5 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Top 5 sujets manquants</p>
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
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-[12px] font-medium bg-[rgba(225,29,72,0.08)] text-[#E11D48]">{t.ecart}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Skills IA */}
      <div>
        <p className="mb-5 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Signaux IA &amp; GEO</p>
        <div className="rounded-2xl border border-[var(--border-subtle)] p-6 space-y-4">
          {iaSkills.map((s) => (
            <div key={s.label}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[14px] text-[var(--text-secondary)]">{s.label}</span>
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
        <p className="mb-5 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Optimiser le contenu avec Claude</p>
        <div className="rounded-2xl border border-[var(--border-subtle)] p-6 space-y-5">
          <SegmentedControl
            options={[
              { key: "conservateur", label: "Conservateur" },
              { key: "equilibre",    label: "Équilibré" },
              { key: "agressif",     label: "Agressif" },
            ]}
            value={aiMode}
            onChange={setAiMode}
          />
          <div className="space-y-2">
            {aiActions.map((action, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-[var(--border-subtle)] px-4 py-3">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-[6px] border border-[var(--border-medium)] text-[11px] font-semibold text-[var(--text-secondary)]">{i + 1}</span>
                <span className="text-[14px] text-[var(--text-secondary)]">{action}</span>
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
        <div className="nba-surface overflow-hidden rounded-2xl shadow-[var(--shadow-floating)]">
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
            <p className="text-[14px] leading-relaxed text-[var(--text-secondary)]">
              Le sujet <span className="font-semibold text-[var(--text-primary)]">ROI contenu B2B</span> représente le plus grand écart sémantique (+18 pts). Le couvrir en priorité avec des données chiffrées et des benchmarks sectoriels.
            </p>
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-3">
              <p className="text-[12px] leading-relaxed text-[var(--text-secondary)]">
                <span className="font-semibold text-[var(--text-primary)]">Score SEO 78/100 — </span>
                Sémantique et structure à 71% sont les deux leviers principaux. L'optimisation IA en mode Équilibré est recommandée.
              </p>
            </div>
            <Button variant="dark" size="sm" className="w-full justify-center">
              Optimiser avec Claude →
            </Button>
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
                  <span className="flex-shrink-0 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-primary)]">{alt.time}</span>
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
          <ScoreRing score={30} size={88} strokeWidth={8} />
        </div>
        <div>
          <p className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Score autorité</p>
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
        <p className="mb-5 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Benchmark SERP</p>
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
        <p className="mb-5 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Profil d'ancres</p>
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
        <p className="mb-5 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Cibles d'outreach</p>
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
                  <td className="px-4 py-3 text-right text-[14px] tabular-nums text-[var(--text-secondary)]">{t.dr}</td>
                  <td className="px-4 py-3">
                    <span className="text-[#F59E0B] text-[12px]">{"★".repeat(t.fit)}{"☆".repeat(5 - t.fit)}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-[var(--text-muted)]">{t.contact}</td>
                  <td className="px-4 py-3">
                    <Button variant="secondary" size="sm">Contacter</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coach IA */}
      <div>
        <p className="mb-5 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Coach IA — Diagnostic autorité</p>
        <div className="rounded-2xl border border-[var(--border-subtle)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-4 w-4 text-[#3E50F5]" />
              <span className="text-[13px] font-semibold text-[var(--text-primary)]">Analyse IA</span>
            </div>
            <span className="inline-flex items-center rounded-full px-2 py-1 text-[12px] font-medium bg-[rgba(16,185,129,0.08)] text-[#10B981]">85% confiance</span>
          </div>
          <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
            La page cible un mot-clé compétitif (content marketing B2B) sans profil de liens — classement quasi impossible sans construction d'autorité. Les concurrents en position 1–4 affichent tous un DR &gt; 79 et des centaines de backlinks vers cette URL spécifique.
          </p>
          <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
            Stratégie d'ancres recommandée : éviter l'exact match agressif (risque Penguin). Prioriser partial match et branded pour les 6 premiers mois, puis diversifier vers URL nues et génériques.
          </p>
        </div>
      </div>

      {/* Actions recommandées */}
      <div>
        <p className="mb-5 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Actions recommandées</p>
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
        <div className="nba-surface overflow-hidden rounded-2xl shadow-[var(--shadow-floating)]">
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
            <p className="text-[14px] leading-relaxed text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-primary)]">0 backlinks</span> sur cette page — impossible de se classer sans autorité externe. Un article invité sur un site DR 60+ est le levier le plus direct.
            </p>
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-3">
              <p className="text-[12px] leading-relaxed text-[var(--text-secondary)]">
                <span className="font-semibold text-[var(--text-primary)]">Objectif : 2 liens/mois — </span>
                À ce rythme, un profil d'autorité compétitif est atteignable en 6 mois d'après les données SERP.
              </p>
            </div>
            <Button variant="dark" size="sm" className="w-full justify-center">
              Démarrer l'outreach →
            </Button>
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
                  <span className="flex-shrink-0 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-primary)]">{alt.time}</span>
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
          <p className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Statut d'indexation</p>
          <span className="text-[12px] text-[var(--text-muted)]">GSC · dernière vérif. 5 mai 2026</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {indexPills.map((s) => (
            <span key={s.label} className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[12px] font-medium ${s.ok ? "bg-[rgba(16,185,129,0.08)] text-[#10B981]" : "bg-[rgba(225,29,72,0.08)] text-[#E11D48]"}`}>
              <span>{s.ok ? "✓" : "✕"}</span>
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Audit technique */}
      <div>
        <p className="mb-5 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Audit technique</p>
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
        <p className="mb-5 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Core Web Vitals</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {cwv.map((m) => (
            <div key={m.label} className="rounded-2xl border border-[var(--border-subtle)] p-6">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-medium text-[var(--text-muted)]">{m.label}</p>
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-[12px] font-medium ${m.ok ? "bg-[rgba(16,185,129,0.08)] text-[#10B981]" : "bg-[rgba(245,158,11,0.08)] text-[#F59E0B]"}`}>
                  {m.ok ? "Bon" : "À améliorer"}
                </span>
              </div>
              <p className="mt-1.5 text-[22px] font-semibold tabular-nums text-[var(--text-primary)]">{m.value}</p>
              <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">Seuil : {m.threshold}</p>
            </div>
          ))}
        </div>
        <Callout variant="warning" className="mt-3">LCP et FCP dépassent les seuils Google — impact négatif sur le classement. Optimisation des performances à prioriser en P1.</Callout>
      </div>

      {/* Structure des titres */}
      <div>
        <p className="mb-5 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Structure des titres</p>
        <div className="space-y-1.5 rounded-2xl border border-[var(--border-subtle)] p-6">
          <div className="flex items-start gap-3">
            <span className="w-8 flex-shrink-0 text-[10px] font-bold text-[#3E50F5]">H1</span>
            <span className="text-[13px] text-[var(--text-primary)]">{brief.title}</span>
          </div>
          {brief.h2s.map((h, i) => (
            <div key={i} className="flex items-start gap-3 pl-4">
              <span className="w-8 flex-shrink-0 text-[10px] font-bold text-[var(--text-muted)]">H2</span>
              <span className="text-[14px] text-[var(--text-secondary)]">{h}</span>
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
        <p className="mb-5 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Images</p>
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
        <Callout variant="error" className="mt-3">79% des images ne sont pas en WebP — conversion recommandée pour réduire le poids de page et améliorer le LCP.</Callout>
      </div>

      {/* Données structurées */}
      <div>
        <p className="mb-5 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Données structurées</p>
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
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-[12px] font-medium ${item.ok ? "bg-[rgba(16,185,129,0.08)] text-[#10B981]" : item.note === "Critique" ? "bg-[rgba(225,29,72,0.08)] text-[#E11D48]" : "bg-[rgba(99,102,241,0.08)] text-[#6366F1]"}`}>
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
        <p className="mb-5 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Actions techniques</p>
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
        <div className="nba-surface overflow-hidden rounded-2xl shadow-[var(--shadow-floating)]">
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
            <p className="text-[14px] leading-relaxed text-[var(--text-secondary)]">
              LCP à <span className="font-semibold text-[var(--text-primary)]">3.90s</span> et FCP à <span className="font-semibold text-[var(--text-primary)]">3.75s</span> dépassent tous les deux les seuils Google. Ces deux métriques ont un impact direct sur le classement.
            </p>
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-3">
              <p className="text-[12px] leading-relaxed text-[var(--text-secondary)]">
                <span className="font-semibold text-[var(--text-primary)]">79% d'images non-WebP — </span>
                La conversion au format WebP + preload above-the-fold est le levier principal pour réduire le LCP.
              </p>
            </div>
            <Button variant="dark" size="sm" className="w-full justify-center">
              Lancer l'audit perfs →
            </Button>
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
                  <span className="flex-shrink-0 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-primary)]">{alt.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BriefDrawerContent({
  brief,
  briefs,
  onNavigate,
  onClose,
  onBack,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
}: {
  brief: Brief;
  briefs: Brief[];
  onNavigate: (b: Brief) => void;
  onClose: () => void;
  onBack?: () => void;
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

  return (
    <>
      {/* Header */}
      <div className="flex-shrink-0 border-b border-[var(--border-subtle)] px-10 pt-7 pb-0">
        {/* Top row — Retour (left) + nav/close (right) */}
        <div className="mb-5 flex items-center justify-between">
          {onBack ? (
            <Tooltip label="Retour à la page" side="right" portal>
              <button
                onClick={onBack}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
            </Tooltip>
          ) : <div />}
          <div className="flex items-center gap-1">
            <button
              onClick={() => hasPrev && onNavigate(briefs[idx - 1])}
              disabled={!hasPrev}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon className="h-5 w-5 rotate-180" />
            </button>
            <button
              onClick={() => hasNext && onNavigate(briefs[idx + 1])}
              disabled={!hasNext}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
            <div className="mx-1 h-4 w-px bg-[var(--border-subtle)]" />
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="mb-4 min-w-0">
          <p className="mb-1.5 font-mono text-[11px] text-[var(--text-muted)]">{brief.url}</p>
          <h1 className="text-[22px] font-semibold leading-snug tracking-tight text-[var(--text-primary)]">
            {brief.analysedAt ? `Analyse du ${formatAnalysisDate(brief.analysedAt)}` : brief.title}
          </h1>
          {brief.analysedAt && (
            <p className="mt-1 text-[13px] text-[var(--text-secondary)] truncate">{brief.title}</p>
          )}
        </div>

        {/* Priority + Status pills only */}
        <div className="mb-5 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {/* Priority — editable */}
          <DropdownMenu width={180} trigger={
            <button className="inline-flex items-center rounded-md px-2 py-1 text-[12px] font-medium transition-opacity hover:opacity-70"
              style={{ color: PRIORITY_CONFIG[priority].text, backgroundColor: PRIORITY_CONFIG[priority].bg }}>
              {PRIORITY_CONFIG[priority].label}
            </button>
          }>
            <DropdownHeader>Choisir la priorité</DropdownHeader>
            {(Object.entries(PRIORITY_CONFIG) as [Priority, typeof PRIORITY_CONFIG[Priority]][]).map(([key, c]) => (
              <DropdownItem key={key} onClick={() => onPriorityChange(key)} selected={priority === key}>
                <span
                  className="inline-flex items-center rounded-md px-2 py-1 text-[12px] font-medium"
                  style={{ color: c.text, backgroundColor: c.bg }}
                >
                  {c.label}
                </span>
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
    </>
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
        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[12px] font-medium transition-colors ${
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
              <div className="px-3 pt-1 pb-1 text-[11px] font-medium tracking-caption text-[var(--text-muted)]">
                Trier par {label.toLowerCase()}
              </div>
              {items!.map((item) => (
                <button
                  key={item.value}
                  onClick={() => { onChange!(item.value); close(); }}
                  className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-[13px] transition-colors hover:bg-[var(--bg-subtle)]"
                >
                  <span className={value === item.value ? "font-medium text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}>
                    {item.label}
                  </span>
                  {value === item.value && <CheckIcon className="h-4 w-4 flex-shrink-0 text-[var(--text-primary)]" strokeWidth={2.5} />}
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

/* ── AnalyseLaunchModal ───────────────────────────────────────────────── */

function AnalyseLaunchModal({
  briefs,
  keywords,
  onKeywordChange,
  onConfirm,
  onClose,
}: {
  briefs: Brief[];
  keywords: Record<number, string>;
  onKeywordChange: (id: number, kw: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return createPortal(
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative flex w-[560px] max-h-[80vh] flex-col rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 px-8 pt-8 pb-4 border-b border-[var(--border-subtle)]">
          <h2 className="text-[18px] font-semibold text-[var(--text-primary)]">Lancer l'analyse</h2>
          <p className="mt-1 text-[13px] text-[var(--text-muted)]">
            Vérifiez ou ajustez le mot-clé cible avant de lancer l'analyse sur {briefs.length} URL{briefs.length > 1 ? "s" : ""}.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto px-8 py-4 space-y-3">
          {briefs.map((b) => (
            <div key={b.id} className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-[var(--text-primary)]">{b.title}</p>
                <p className="truncate font-mono text-[11px] text-[var(--text-muted)]">{b.url}</p>
              </div>
              <input
                type="text"
                value={keywords[b.id] ?? b.keyword}
                onChange={(e) => onKeywordChange(b.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-[180px] flex-shrink-0 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none focus:border-[#3E50F5]"
                placeholder="Mot-clé cible"
              />
            </div>
          ))}
        </div>
        <div className="flex-shrink-0 flex items-center justify-end gap-3 px-8 py-6 border-t border-[var(--border-subtle)]">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
          >
            Annuler
          </button>
          <Button onClick={onConfirm}>Lancer l'analyse</Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── ActionRing ──────────────────────────────────────────────────────── */

function ActionRing({ done, total }: { done: number; total: number }) {
  const r = 13;
  const circ = 2 * Math.PI * r;
  const progress = total > 0 ? done / total : 0;
  const complete = progress >= 1;
  const offset = circ * (1 - progress);

  return (
    <div className="relative flex-shrink-0" style={{ width: 34, height: 34 }}>
      <svg width={34} height={34} viewBox="0 0 34 34">
        <defs>
          <linearGradient id={`ring-grad-${done}-${total}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={complete ? "#10B981" : "var(--bg-subtle)"} stopOpacity={complete ? 0.18 : 1} />
            <stop offset="100%" stopColor={complete ? "#10B981" : "var(--bg-subtle)"} stopOpacity={0} />
          </linearGradient>
        </defs>
        <circle cx={17} cy={17} r={r} fill={`url(#ring-grad-${done}-${total})`} stroke="none" />
        <circle cx={17} cy={17} r={r} fill="none" stroke="var(--border-subtle)" strokeWidth={2} />
        <circle
          cx={17} cy={17} r={r}
          fill="none"
          stroke={complete ? "#10B981" : "#3E50F5"}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 17 17)"
        />
      </svg>
      {complete && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="#10B981" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  );
}

/* ── SparklineEmpty ──────────────────────────────────────────────────── */

function SparklineEmpty() {
  return (
    <div className="flex h-[86px] flex-col items-center justify-center gap-2">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[var(--text-muted)] opacity-40">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 14.5s1-2 4-2 4 2 4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="9" cy="10" r="1" fill="currentColor" />
        <circle cx="15" cy="10" r="1" fill="currentColor" />
      </svg>
      <p className="text-[11px] text-[var(--text-muted)] opacity-50">Données insuffisantes</p>
    </div>
  );
}

/* ── PagePanel ───────────────────────────────────────────────────────── */

function PagePanelContent({
  brief,
  briefs,
  keyword,
  lotColor,
  lots,
  lotColors,
  status,
  priority,
  onOpenAnalysis,
  onNavigatePage,
  onClose,
  onLotChange,
  onCreateLot,
}: {
  brief: Brief;
  briefs: Brief[];
  keyword: string;
  lotColor: string;
  lots: string[];
  lotColors: Record<string, string>;
  status: BriefStatus;
  priority: Priority;
  onOpenAnalysis: (b: Brief, histIdx: number) => void;
  onNavigatePage: (b: Brief) => void;
  onClose: () => void;
  onLotChange: (lot: string | null) => void;
  onCreateLot: (name: string) => void;
}) {
  const idx = briefs.findIndex((b) => b.id === brief.id);
  const hasPrev = idx > 0;
  const hasNext = idx < briefs.length - 1;
  const { color, colorBg, label, text: typeText } = TYPE_CONFIG[brief.type];

  const history: HistoricalAnalysis[] = PAGE_HISTORY[brief.id] ??
    (brief.analysedAt ? [{ date: brief.analysedAt, semanticScore: brief.semanticScore, wordCount: brief.wordCount, position: brief.position, positionGsc: brief.positionGsc, clics: brief.clics, impressions: brief.impressions }] : []);

  const current  = history[0];
  const previous = history[1];

  const posDelta   = current?.positionGsc != null && previous?.positionGsc != null ? +(current.positionGsc - previous.positionGsc).toFixed(1) : null;
  const clicsDelta = current?.clics != null && previous?.clics != null ? current.clics - previous.clics : null;
  const impDelta   = current?.impressions != null && previous?.impressions != null ? current.impressions - previous.impressions : null;

  const [lotModalOpen, setLotModalOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowUp"   && hasPrev) onNavigatePage(briefs[idx - 1]);
      if (e.key === "ArrowDown" && hasNext) onNavigatePage(briefs[idx + 1]);
    }
    if (lotModalOpen) return;
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, onNavigatePage, briefs, idx, hasPrev, hasNext, lotModalOpen]);

  return (
    <>
      {/* Header */}
      <div className="flex-shrink-0 border-b border-[var(--border-subtle)] px-10 pt-7 pb-7">
        {/* Top row — back to list (left) + nav/close (right) */}
        <div className="mb-5 flex items-center justify-between gap-1">
          <Tooltip label="Retour à la liste" side="right" portal>
            <button onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]">
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
          </Tooltip>
          <div className="flex items-center gap-1">
            <button onClick={() => hasPrev && onNavigatePage(briefs[idx - 1])} disabled={!hasPrev}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronRightIcon className="h-5 w-5 rotate-180" />
            </button>
            <button onClick={() => hasNext && onNavigatePage(briefs[idx + 1])} disabled={!hasNext}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronRightIcon className="h-5 w-5" />
            </button>
            <div className="mx-1 h-4 w-px bg-[var(--border-subtle)]" />
            <button onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="mb-4 min-w-0">
          <p className="mb-1.5 font-mono text-[11px] text-[var(--text-muted)]">{brief.url}</p>
          <h1 className="text-[22px] font-semibold leading-snug tracking-tight text-[var(--text-primary)]">{brief.title}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full px-2 py-1 text-[12px] font-medium" style={{ color: typeText, backgroundColor: colorBg }}>{label}</span>
          <DropdownMenu
            width={280}
            trigger={
              <button className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-subtle)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-secondary)] transition-opacity hover:opacity-80">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: lotColor }} />
                {brief.lot ? shortLot(brief.lot) : "Sans lot"}
              </button>
            }
          >
            <DropdownHeader>Changer de lot</DropdownHeader>
            {lots.map((lot) => (
              <DropdownItem
                key={lot}
                selected={(brief.lot ?? "Sans lot") === lot}
                onClick={() => onLotChange(lot === "Sans lot" ? null : lot)}
              >
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-subtle)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-secondary)]">
                  <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: lotColors[lot] }} />
                  {lot}
                </span>
              </DropdownItem>
            ))}
            <DropdownSeparator />
            <DropdownItem icon={Plus} onClick={() => setLotModalOpen(true)}>
              Créer un nouveau lot
            </DropdownItem>
          </DropdownMenu>
          <span className="rounded-full border border-[var(--border-subtle)] px-3 py-1.5 text-[12px] text-[var(--text-primary)]">{keyword}</span>
        </div>
      </div>

      {/* Body — 2 columns */}
      <div className="flex flex-1 gap-6 overflow-hidden px-10 py-8">

        {/* Left — données GSC + évolution */}
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto">

          {/* KPI cards */}
          <div>
            <p className="mb-5 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Données GSC actuelles</p>
            <SoftPanel>
              <div className="grid grid-cols-5 gap-3">
                {([
                  { label: "Pos. GSC",     val: current?.positionGsc != null ? current.positionGsc.toFixed(1) : "—", delta: posDelta,   invert: true,  Icon: Hash    },
                  { label: "Trafic",       val: current?.clics != null ? current.clics.toLocaleString() : "—",        delta: clicsDelta,               Icon: MousePointerClick },
                  { label: "CTR",          val: current?.clics != null && current?.impressions ? `${(current.clics / current.impressions * 100).toFixed(1)}%` : "—", delta: null, Icon: Activity },
                  { label: "Impressions",  val: current?.impressions != null ? (current.impressions >= 1000 ? `${(current.impressions / 1000).toFixed(1)}k` : String(current.impressions)) : "—", delta: impDelta, Icon: Eye },
                  { label: "Volume",       val: brief.volume.toLocaleString(), delta: null,                            Icon: Target },
                ] as { label: string; val: string; delta: number | null; invert?: boolean; Icon: React.ElementType }[]).map(({ label: kl, val, delta, invert, Icon }) => (
                  <KpiCard
                    key={kl}
                    icon={Icon}
                    label={kl}
                    value={val}
                    delta={delta != null ? `${delta > 0 ? "+" : ""}${Number.isInteger(delta) ? delta : delta.toFixed(1).replace(".", ",")}` : undefined}
                    deltaPositiveIsGood={!invert}
                    sub={delta != null ? "vs préc." : undefined}
                    className="w-full"
                  />
                ))}
              </div>
            </SoftPanel>
          </div>

          {/* Sparklines — côte à côte, fill height pour égaliser avec la colonne droite */}
          <div className="grid flex-1 grid-cols-2 gap-4">
            <div className="flex flex-col rounded-2xl border border-[var(--border-subtle)] px-5 pt-5 pb-3">
              <p className="mb-4 flex-shrink-0 text-[16px] font-semibold tracking-subheading text-[var(--text-primary)]">Évolution position GSC</p>
              <div className="flex-1">
                {history.length >= 2 ? <PositionSparkline history={history} /> : <SparklineEmpty />}
              </div>
            </div>
            <div className="flex flex-col rounded-2xl border border-[var(--border-subtle)] px-5 pt-5 pb-3">
              <p className="mb-4 flex-shrink-0 text-[16px] font-semibold tracking-subheading text-[var(--text-primary)]">Évolution trafic</p>
              <div className="flex-1">
                {history.length >= 2 && history.some((h) => h.clics != null) ? <TrafficSparkline history={history} /> : <SparklineEmpty />}
              </div>
            </div>
          </div>
        </div>

        {/* Right — historique des analyses */}
        <div className="w-[340px] flex-shrink-0 flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <p className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Historique des analyses</p>
            <span className="rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-primary)]">{history.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-2">
            {history.length === 0 ? (
              <div className="rounded-2xl border border-[var(--border-subtle)] px-5 py-10 text-center">
                <p className="text-[13px] text-[var(--text-muted)]">Aucune analyse disponible</p>
                <p className="mt-1 text-[12px] text-[var(--text-muted)] opacity-60">Lancez une première analyse.</p>
              </div>
            ) : history.map((h, i) => (
              <button
                key={h.date}
                onClick={() => onOpenAnalysis(brief, i)}
                className="group flex w-full items-center gap-3 rounded-2xl border border-[var(--border-subtle)] px-4 py-3.5 text-left transition-colors hover:bg-[var(--bg-card-hover)]"
              >
                {h.actionsTotal != null && (
                  <ActionRing done={h.actionsDone ?? 0} total={h.actionsTotal} />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-medium text-[var(--text-primary)]">Analyse du {formatAnalysisDate(h.date)}</span>
                    {i === 0 && <span className="rounded-full border border-[var(--border-subtle)] px-2 py-0.5 text-[12px] font-medium text-[var(--text-primary)]">Récente</span>}
                  </div>
                  {h.actionsTotal != null && (
                    <div className="mt-1 text-[12px] text-[var(--text-muted)]">
                      <span>{h.actionsDone ?? 0}/{h.actionsTotal} actions réalisées</span>
                    </div>
                  )}
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium"
                      style={{ color: PRIORITY_CONFIG[priority].text, backgroundColor: PRIORITY_CONFIG[priority].bg }}>
                      {PRIORITY_CONFIG[priority].label}
                    </span>
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                      style={{ color: STATUS_CONFIG[status].text, backgroundColor: STATUS_CONFIG[status].bg }}>
                      {STATUS_CONFIG[status].label}
                    </span>
                  </div>
                </div>
                <ChevronRightIcon className="h-4 w-4 flex-shrink-0 text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            ))}
          </div>

          <Button className="w-full justify-center">
            <ArrowPathIcon className="h-4 w-4" />
            Lancer une nouvelle analyse
          </Button>
        </div>
      </div>

      {lotModalOpen && (
        <CreateLotModal
          existingLots={lots}
          onCancel={() => setLotModalOpen(false)}
          onCreate={(name) => { onCreateLot(name); setLotModalOpen(false); }}
        />
      )}
    </>
  );
}

/* ── CreateLotModal — petite modal pour créer un nouveau lot ─────────── */

function CreateLotModal({
  existingLots,
  onCancel,
  onCreate,
}: {
  existingLots: string[];
  onCancel: () => void;
  onCreate: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const trimmed = name.trim();
  const exists = existingLots.includes(trimmed);
  const canSubmit = trimmed.length > 0 && !exists;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onCancel]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="relative w-full max-w-[420px] rounded-3xl border border-[var(--border-subtle)] bg-[var(--modal-bg)] p-7 shadow-[var(--shadow-floating)]">
        <button
          onClick={onCancel}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <h3 className="mb-1.5 text-[18px] font-semibold tracking-subheading text-[var(--text-primary)]">
          Créer un nouveau lot
        </h3>
        <p className="mb-5 text-[13px] text-[var(--text-secondary)]">
          Donnez un nom à votre lot — une couleur lui sera attribuée automatiquement.
        </p>

        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && canSubmit) onCreate(trimmed); }}
          placeholder="Ex. Lot Mai 2026 — Refonte"
          className="w-full rounded-full border border-[var(--border-medium)] bg-[var(--input-bg)] px-4 py-2.5 text-[14px] text-[var(--text-primary)] placeholder-[var(--text-input)] focus:border-[var(--accent-primary)] focus:outline-none"
        />
        {exists && (
          <p className="mt-2 text-[12px] text-[#E11D48]">Ce lot existe déjà.</p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" size="md" onClick={onCancel}>Annuler</Button>
          <Button variant="primary" size="md" onClick={() => onCreate(trimmed)} disabled={!canSubmit}>
            Créer le lot
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ── SidePanel — unified portal with slide animation ────────────────── */

function SidePanel({
  brief,
  briefs,
  briefKeyword,
  lotColor,
  lots,
  lotColors,
  status,
  priority,
  analysis,
  onOpenAnalysis,
  onNavigatePage,
  onClose,
  onCloseAnalysis,
  onStatusChange,
  onPriorityChange,
  onLotChange,
  onCreateLot,
}: {
  brief: Brief;
  briefs: Brief[];
  briefKeyword: string;
  lotColor: string;
  lots: string[];
  lotColors: Record<string, string>;
  status: BriefStatus;
  priority: Priority;
  analysis: Brief | null;
  onOpenAnalysis: (b: Brief) => void;
  onNavigatePage: (b: Brief) => void;
  onClose: () => void;
  onCloseAnalysis: () => void;
  onStatusChange: (s: BriefStatus) => void;
  onPriorityChange: (p: Priority) => void;
  onLotChange: (lot: string | null) => void;
  onCreateLot: (name: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [shownAnalysis, setShownAnalysis] = useState<Brief | null>(analysis);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const analysisId = analysis?.id ?? null;
  useEffect(() => {
    if (analysisId === (shownAnalysis?.id ?? null)) return;
    setFading(true);
    const t = setTimeout(() => {
      setShownAnalysis(analysis);
      setFading(false);
    }, 150);
    return () => clearTimeout(t);
  }, [analysisId]);

  function handleClose() {
    setClosing(true);
    setTimeout(onClose, 320);
  }

  if (typeof window === "undefined") return null;

  return createPortal(
    <>
      {/* Backdrop transparent — click outside to close */}
      <div
        aria-hidden="true"
        onClick={handleClose}
        className={`fixed inset-0 z-[59] transition-opacity duration-[320ms] ease-out ${visible && !closing ? "opacity-100" : "opacity-0"}`}
      />
      <div
        className={`fixed inset-y-0 right-0 z-[60] flex w-[1200px] max-w-[95vw] flex-col border-l border-[var(--border-subtle)] bg-[var(--bg-primary)] shadow-2xl transition-all duration-[320ms] ease-out ${visible && !closing ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}`}
      >
      <div
        className="flex flex-1 flex-col min-h-0 transition-opacity duration-[150ms]"
        style={{ opacity: fading ? 0 : 1 }}
      >
        {shownAnalysis
          ? <BriefDrawerContent
              brief={shownAnalysis}
              briefs={[shownAnalysis]}
              onNavigate={() => {}}
              onClose={handleClose}
              onBack={onCloseAnalysis}
              status={status}
              onStatusChange={onStatusChange}
              priority={priority}
              onPriorityChange={onPriorityChange}
            />
          : <PagePanelContent
              brief={brief}
              briefs={briefs}
              keyword={briefKeyword}
              lotColor={lotColor}
              lots={lots}
              lotColors={lotColors}
              status={status}
              priority={priority}
              onOpenAnalysis={onOpenAnalysis}
              onNavigatePage={onNavigatePage}
              onClose={handleClose}
              onLotChange={onLotChange}
              onCreateLot={onCreateLot}
            />
        }
      </div>
    </div>
    </>,
    document.body
  );
}

/* ── BriefsView ──────────────────────────────────────────────────────── */

export function BriefsView() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // Refs for horizontal scroll sync between sticky column header and table body
  const headerInnerRef = useRef<HTMLDivElement>(null);
  const bodyScrollRef  = useRef<HTMLDivElement>(null);
  function handleBodyScroll() {
    if (headerInnerRef.current && bodyScrollRef.current) {
      headerInnerRef.current.style.transform = `translateX(-${bodyScrollRef.current.scrollLeft}px)`;
    }
  }

  const [briefs, setBriefs] = useState<Brief[]>(BRIEFS.map((b) => ({ ...b, ...BRIEF_EXTRA[b.id] })));
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [activeBrief, setActiveBrief] = useState<Brief | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<Brief | null>(null);
  const [briefKeywords, setBriefKeywords] = useState<Record<number, string>>({});
  const [analyseLaunchOpen, setAnalyseLaunchOpen] = useState(false);
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

  function changeBriefLot(id: number, lot: string | null) {
    setBriefs((prev) => prev.map((b) => (b.id === id ? { ...b, lot: lot ?? undefined } : b)));
    setActiveBrief((prev) => (prev?.id === id ? { ...prev, lot: lot ?? undefined } : prev));
  }

  const LOT_PALETTE = ["#3B82F6", "#10B981", "#A855F7", "#F97316", "#EC4899", "#14B8A6", "#EAB308", "#6366F1"];
  function createLotAndAssign(name: string, briefId: number) {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!lotColors[trimmed]) {
      const used = new Set(Object.values(lotColors));
      const color = LOT_PALETTE.find((c) => !used.has(c)) ?? LOT_PALETTE[Math.floor(Math.random() * LOT_PALETTE.length)];
      setLotColors((prev) => ({ ...prev, [trimmed]: color }));
    }
    changeBriefLot(briefId, trimmed);
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
    if (activeBrief && selected.has(activeBrief.id)) { setActiveBrief(null); setActiveAnalysis(null); }
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

  const selectedBriefs = filtered.filter((b) => selected.has(b.id));

  if (loading) return <SkeletonBriefs />;

  return (
    <div className="animate-fade-in">

      {/* ── Header — H2 + SearchBar directement à droite du titre ── */}
      <div className="mb-6 flex items-center gap-4 px-[var(--page-px)]">
        <div className="flex items-baseline gap-2">
          <h2 className="text-[24px] font-semibold tracking-heading text-[var(--text-primary)]">URLs</h2>
          <span className="rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 text-[12px] font-medium tabular-nums text-[var(--text-secondary)]">
            {filtered.length.toLocaleString("fr-FR")}
            {hasActiveFilters && filtered.length !== briefs.length && (
              <span className="text-[var(--text-muted)]"> / {briefs.length.toLocaleString("fr-FR")}</span>
            )}
          </span>
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un brief…" alwaysExpanded />
      </div>

      {/* ── Filter tabs + reset ── */}
      <div className="mb-4 flex items-center gap-3 px-[var(--page-px)]">
        <FilterTabs
          tabs={[
            { key: "all",                        label: "Tous" },
            { key: "Lot SEO — Optimisation Q2",  label: "SEO — Optimisation Q2",  color: lotColors["Lot SEO — Optimisation Q2"],  count: LOT_COUNTS["Lot SEO — Optimisation Q2"]  ?? 0 },
            { key: "Lot Création — Blog expert", label: "Création — Blog expert",  color: lotColors["Lot Création — Blog expert"], count: LOT_COUNTS["Lot Création — Blog expert"] ?? 0 },
            { key: "Lot GEO — Structured data",  label: "GEO — Structured data",  color: lotColors["Lot GEO — Structured data"],  count: LOT_COUNTS["Lot GEO — Structured data"]  ?? 0 },
            { key: "__none__",                   label: "Sans lot" },
          ]}
          value={colLot}
          onChange={setColLot}
        />
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 rounded-full px-2 py-1 text-[12px] font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
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
              <DropdownHeader>Choisir un lot</DropdownHeader>
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
              <DropdownHeader>Choisir la priorité</DropdownHeader>
              {(["haute", "moyenne", "basse"] as Priority[]).map((p) => {
                const c = PRIORITY_CONFIG[p];
                return (
                  <DropdownItem key={p} onClick={() => assignPriority(p)}>
                    <span
                      className="inline-flex items-center rounded-md px-2 py-1 text-[12px] font-medium"
                      style={{ color: c.text, backgroundColor: c.bg }}
                    >
                      {c.label}
                    </span>
                  </DropdownItem>
                );
              })}
            </DropdownMenu>

            {/* Lancer l'analyse */}
            <button
              onClick={() => setAnalyseLaunchOpen(true)}
              className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-[14px] font-medium transition-colors hover:bg-[var(--floating-bar-hover)]"
              style={{ color: "var(--floating-bar-text)" }}
            >
              <ArrowPathIcon className="h-4 w-4" />Lancer l'analyse
            </button>

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

      {/* ── Sticky column header — page-level, sticks below the tab bar (h-12 = 48px) ── */}
      <div className="sticky top-12 z-[15] overflow-hidden border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)]">
        <div ref={headerInnerRef} style={{ minWidth: 1910 }} className="flex h-10 items-center gap-3 pl-[var(--page-px)] pr-4">
            <Checkbox checked={allSelected} indeterminate={someSelected && !allSelected} onChange={toggleAll} />
            <span className="w-[200px] flex-shrink-0 min-w-0 text-[12px] font-medium text-[var(--text-muted)]">Page</span>
            <span className="w-[130px] flex-shrink-0 min-w-0 text-[12px] font-medium text-[var(--text-muted)]">Mot-clé</span>
            <div className="w-[110px] flex-shrink-0 min-w-0">
              <ColPill label="Origine" active={colType !== "all"} value={colType} onChange={(v) => setColType(v as BriefType | "all")} items={[
                { value: "all",       label: "Toutes les origines" },
                { value: "optimiser", label: "Optimiser" },
                { value: "combler",   label: "Gap GSC" },
                { value: "creer",     label: "De zéro" },
              ]} />
            </div>
            <div className="w-[90px] flex-shrink-0 min-w-0">
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
            <div className="w-[80px] flex-shrink-0 min-w-0">
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
            <span className="w-[200px] flex-shrink-0 min-w-0 text-[12px] font-medium text-[var(--text-muted)]">Trafic</span>
            <div className="w-[110px] flex-shrink-0 min-w-0">
              <ColPill label="Priorité" active={colPriority !== "all"} value={colPriority} onChange={(v) => setColPriority(v as Priority | "all")} items={[
                { value: "all",     label: "Toutes" },
                { value: "haute",   label: "Haute" },
                { value: "moyenne", label: "Moyenne" },
                { value: "basse",   label: "Basse" },
              ]} />
            </div>
            <div className="w-[100px] flex-shrink-0 min-w-0">
              <ColPill label="Statut" active={colStatut !== "all"} value={colStatut} onChange={(v) => setColStatut(v as BriefStatus | "all")} items={[
                { value: "all",   label: "Tous" },
                { value: "todo",  label: "À faire" },
                { value: "doing", label: "En cours" },
                { value: "done",  label: "Terminé" },
              ]} />
            </div>
            <div className="w-[200px] flex-shrink-0 min-w-0">
              <ColPill label="Lot" active={colLot !== "all"} value={colLot} onChange={setColLot} items={[
                { value: "all",                        label: "Tous les lots" },
                { value: "Lot SEO — Optimisation Q2",  label: "SEO — Optimisation Q2" },
                { value: "Lot Création — Blog expert", label: "Création — Blog expert" },
                { value: "Lot GEO — Structured data",  label: "GEO — Structured data" },
                { value: "__none__",                   label: "Sans lot" },
              ]} />
            </div>
            <span className="w-[130px] flex-shrink-0 min-w-0 text-[12px] font-medium text-[var(--text-muted)]">Analyse</span>
            <div className="w-12 flex-shrink-0 min-w-0" />
            <div className="w-16 flex-shrink-0 min-w-0">
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
            <div className="sticky right-0 w-16 flex-shrink-0 min-w-0 bg-[var(--bg-primary)]" />
        </div>
      </div>

      {/* ── Body — horizontal scroll only (synced with sticky header) ── */}
      <div ref={bodyScrollRef} onScroll={handleBodyScroll} className="overflow-x-auto">
        <div style={{ minWidth: 1910 }}>
          {/* Rows */}
          {filtered.length === 0 ? (
            <EmptyState
              icon={<DocumentTextIcon className="h-6 w-6" />}
              title="Aucun brief trouvé"
              description={search ? `Aucun résultat pour « ${search} »` : "Aucun brief dans cette catégorie."}
            />
          ) : (
            filtered.map((brief, i) => {
                const { color, colorBg, text: typeText } = TYPE_CONFIG[brief.type];
                const prio = PRIORITY_CONFIG[briefPriorities[brief.id] ?? brief.priority];
                const isSelected = selected.has(brief.id);
                const isActive = activeBrief?.id === brief.id;
                const analysedAt = brief.analysedAt;
                const analyseLabel = (() => {
                  if (!analysedAt) return null;
                  const days = Math.round((new Date("2026-05-06").getTime() - new Date(analysedAt).getTime()) / 86400000);
                  if (days === 0) return "Aujourd'hui";
                  if (days === 1) return "Il y a 1 jour";
                  if (days < 31) return `Il y a ${days}j`;
                  return `Il y a ${Math.round(days / 30)} mois`;
                })();

                return (
                  <button
                    key={brief.id}
                    onClick={() => setActiveBrief(isActive ? null : brief)}
                    className={`group relative w-full text-left transition-colors ${i < filtered.length - 1 ? "border-b border-[var(--border-subtle)]" : ""} ${isActive ? "bg-[var(--bg-card-hover)]" : "hover:bg-[var(--bg-card-hover)]"}`}
                  >
                  <div className="flex items-center gap-3 pl-[var(--page-px)] pr-4 py-3">
                    <Checkbox checked={isSelected} onChange={() => toggleOne(brief.id)} />

                    {/* Page */}
                    <div className="w-[200px] flex-shrink-0 min-w-0">
                      <p className="truncate text-[13px] font-semibold text-[var(--text-primary)]">{brief.title}</p>
                      <p className="mt-0.5 truncate font-mono text-[11px] text-[var(--text-muted)]">{brief.url}</p>
                    </div>

                    {/* Mot-clé */}
                    <div className="w-[130px] flex-shrink-0 min-w-0" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        size={1}
                        value={briefKeywords[brief.id] ?? brief.keyword}
                        onChange={(e) => setBriefKeywords((prev) => ({ ...prev, [brief.id]: e.target.value }))}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full truncate rounded-md border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-3 py-1.5 text-[12px] text-[var(--text-secondary)] outline-none transition-colors hover:bg-[var(--bg-card-hover)] focus:border-[#3E50F5] focus:bg-[var(--bg-secondary)]"
                        style={{ minWidth: 0 }}
                        placeholder="Mot-clé…"
                      />
                    </div>

                    {/* Type */}
                    <div className="w-[110px] flex-shrink-0 min-w-0">
                      <span className="inline-flex items-center rounded-full bg-[var(--bg-subtle)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-secondary)]">
                        {TYPE_CONFIG[brief.type].label}
                      </span>
                    </div>

                    {/* Position SERP */}
                    <div className="w-[90px] flex-shrink-0 min-w-0">
                      {brief.position ? (
                        <span className={`text-[13px] font-semibold tabular-nums ${brief.position <= 10 ? "text-emerald-500" : brief.position <= 20 ? "text-amber-500" : "text-[var(--text-muted)]"}`}>
                          #{brief.position}
                        </span>
                      ) : <span className="text-[13px] text-[var(--text-muted)]">—</span>}
                    </div>

                    {/* Volume */}
                    <div className="w-[80px] flex-shrink-0 min-w-0">
                      <span className="text-[13px] font-semibold tabular-nums text-[var(--text-primary)]">{brief.volume.toLocaleString()}</span>
                    </div>

                    {/* Trafic — clics (tooltip Détail GSC) + sparkline interactive (tooltip point survolé) */}
                    <div className="w-[200px] flex-shrink-0 min-w-0">
                      {brief.clics != null ? (() => {
                        const histClics = (PAGE_HISTORY[brief.id] ?? [])
                          .map((h) => ({ date: h.date, clics: h.clics }))
                          .filter((h): h is { date: string; clics: number } => h.clics != null)
                          .reverse(); // oldest → most recent
                        const isUp = (brief.clicsDelta ?? 0) >= 0;
                        const trendColor = isUp ? "#10B981" : "#E11D48";
                        return (
                          <span className="inline-flex w-full items-center justify-between gap-3">
                            {/* Tooltip 1 — Détail GSC sur le nombre de clics */}
                            <Tooltip
                              side="top"
                              rich
                              portal
                              label={
                                <div className="flex flex-col gap-1.5">
                                  <p className="font-semibold">Détail GSC</p>
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="opacity-70">Clics</span>
                                    <span className="font-semibold tabular-nums">{brief.clics!.toLocaleString("fr-FR")}{brief.clicsDelta != null && <span className={`ml-1.5 text-[11px] ${isUp ? "text-emerald-300" : "text-rose-300"}`}>{isUp ? "+" : ""}{brief.clicsDelta}</span>}</span>
                                  </div>
                                  {brief.impressions != null && (
                                    <div className="flex items-center justify-between gap-4">
                                      <span className="opacity-70">Impressions</span>
                                      <span className="font-semibold tabular-nums">{brief.impressions.toLocaleString("fr-FR")}</span>
                                    </div>
                                  )}
                                  {brief.positionGsc != null && (
                                    <div className="flex items-center justify-between gap-4">
                                      <span className="opacity-70">Position GSC</span>
                                      <span className="font-semibold tabular-nums">{brief.positionGsc.toFixed(1)}{brief.positionDelta != null && <span className={`ml-1.5 text-[11px] ${brief.positionDelta < 0 ? "text-emerald-300" : "text-rose-300"}`}>{brief.positionDelta > 0 ? "+" : ""}{brief.positionDelta.toFixed(1)}</span>}</span>
                                    </div>
                                  )}
                                  {brief.impressions != null && brief.clics != null && (
                                    <div className="flex items-center justify-between gap-4">
                                      <span className="opacity-70">CTR</span>
                                      <span className="font-semibold tabular-nums">{((brief.clics / brief.impressions) * 100).toFixed(1)}%</span>
                                    </div>
                                  )}
                                </div>
                              }
                            >
                              <span className="text-[13px] font-semibold tabular-nums text-[var(--text-primary)]">{brief.clics.toLocaleString()}</span>
                            </Tooltip>
                            {/* Tooltip 2 — point survolé du sparkline (date + valeur) */}
                            <ClicsSparkline history={histClics} color={trendColor} />
                          </span>
                        );
                      })() : <span className="text-[13px] text-[var(--text-muted)]">—</span>}
                    </div>

                    {/* Priorité */}
                    <div className="w-[110px] flex-shrink-0 min-w-0">
                      <div onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu
                          width={180}
                          trigger={
                            <button className="inline-flex items-center rounded-md px-2 py-1 text-[12px] font-medium transition-opacity hover:opacity-70" style={{ color: prio.text, backgroundColor: prio.bg }}>
                              {prio.label}
                            </button>
                          }
                        >
                          <DropdownHeader>Choisir la priorité</DropdownHeader>
                          {(Object.entries(PRIORITY_CONFIG) as [Priority, typeof PRIORITY_CONFIG[Priority]][]).map(([key, c]) => (
                            <DropdownItem
                              key={key}
                              onClick={() => setPriority(brief.id, key)}
                              selected={(briefPriorities[brief.id] ?? brief.priority) === key}
                            >
                              <span
                                className="inline-flex items-center rounded-md px-2 py-1 text-[12px] font-medium"
                                style={{ color: c.text, backgroundColor: c.bg }}
                              >
                                {c.label}
                              </span>
                            </DropdownItem>
                          ))}
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Statut */}
                    <div className="w-[100px] flex-shrink-0 min-w-0">
                      <StatusPillDropdown
                        status={briefStatuses[brief.id] ?? "todo"}
                        onChange={(next) => toggleStatus(brief.id, next)}
                      />
                    </div>

                    {/* Lot */}
                    <div className="w-[200px] flex-shrink-0 min-w-0">
                      {brief.lot ? (
                        <Tooltip label={`${LOT_COUNTS[brief.lot]} URL${LOT_COUNTS[brief.lot] > 1 ? "s" : ""}`} side="top" portal>
                          <button
                            onClick={(e) => { e.stopPropagation(); setColLot(brief.lot!); setActiveBrief(null); }}
                            className="inline-flex max-w-full items-center gap-1.5 truncate rounded-full bg-[var(--bg-subtle)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
                          >
                            <span className="h-2 w-2 flex-shrink-0 min-w-0 rounded-full" style={{ backgroundColor: lotColors[brief.lot] ?? "#64748B" }} />
                            <span className="truncate">{shortLot(brief.lot)}</span>
                          </button>
                        </Tooltip>
                      ) : (
                        <span className="text-[12px] text-[var(--text-muted)]">—</span>
                      )}
                    </div>

                    {/* Analyse */}
                    <div className="w-[130px] flex-shrink-0 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 flex-shrink-0 rounded-full"
                          style={{
                            backgroundColor: !analyseLabel
                              ? "var(--text-muted)"
                              : (brief.analysisCount && brief.analysisCount > 1 ? "#10B981" : "#F59E0B"),
                          }}
                        />
                        <span className="truncate text-[13px] font-semibold text-[var(--text-primary)]">
                          {analyseLabel ? `Analysée · ${analyseLabel}` : "Pas encore analysée"}
                        </span>
                      </div>
                    </div>

                    {/* Actions — lancer / relancer l'analyse */}
                    <div className="w-12 flex-shrink-0 min-w-0" onClick={(e) => e.stopPropagation()}>
                      <Tooltip
                        side="top"
                        rich
                        portal
                        label={
                          <div className="space-y-0.5">
                            <p className="font-semibold">{analyseLabel ? "Relancer une analyse" : "Lancer une analyse"}</p>
                            <p className="opacity-70">3min</p>
                            {brief.analysisCount && brief.analysisCount > 1 && (
                              <p className="opacity-70">{brief.analysisCount} analyses au total</p>
                            )}
                          </div>
                        }
                      >
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelected(new Set([brief.id])); setAnalyseLaunchOpen(true); }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-medium)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                        >
                          {analyseLabel ? <RefreshCw className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                        </button>
                      </Tooltip>
                    </div>

                    <div className="w-16 flex-shrink-0 min-w-0"><SemanticPill score={brief.semanticScore} /></div>

                    {/* Chevron overlay — sticky right edge with gradient fade */}
                    <div
                      className={`sticky right-0 flex-shrink-0 flex h-7 w-20 items-center justify-end pr-3 transition-opacity ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                      style={{ background: "linear-gradient(to right, transparent, var(--bg-card-hover) 50%)" }}
                    >
                      <ChevronRightIcon className="h-4 w-4 text-[var(--text-muted)]" />
                    </div>
                  </div>
                  </button>
                );
              })
            )}

          {/* Footer — row count */}
          <div className="flex items-center border-t border-[var(--border-subtle)] pl-[var(--page-px)] pr-4 py-3">
            <span className="text-[12px] text-[var(--text-muted)]">
              {filtered.length} URL{filtered.length > 1 ? "s" : ""}
              {filtered.length < briefs.length && <> · {briefs.length} au total</>}
            </span>
          </div>
        </div>
      </div>

      {/* SidePanel — unified panel for page info + analysis */}
      {activeBrief && (
        <SidePanel
          brief={activeBrief}
          briefs={filtered}
          briefKeyword={briefKeywords[activeBrief.id] ?? activeBrief.keyword}
          lotColor={lotColors[activeBrief.lot ?? "Sans lot"] ?? "#64748B"}
          lots={Object.keys(lotColors)}
          lotColors={lotColors}
          status={briefStatuses[activeBrief.id] ?? "todo"}
          priority={briefPriorities[activeBrief.id] ?? activeBrief.priority}
          analysis={activeAnalysis}
          onOpenAnalysis={(b) => setActiveAnalysis(b)}
          onNavigatePage={(b) => setActiveBrief(b)}
          onClose={() => { setActiveBrief(null); setActiveAnalysis(null); }}
          onCloseAnalysis={() => setActiveAnalysis(null)}
          onStatusChange={(next) => toggleStatus(activeBrief.id, next)}
          onPriorityChange={(next) => setPriority(activeBrief.id, next)}
          onLotChange={(lot) => changeBriefLot(activeBrief.id, lot)}
          onCreateLot={(name) => createLotAndAssign(name, activeBrief.id)}
        />
      )}

      {/* AnalyseLaunchModal */}
      {analyseLaunchOpen && typeof window !== "undefined" && (
        <AnalyseLaunchModal
          briefs={selectedBriefs}
          keywords={briefKeywords}
          onKeywordChange={(id, kw) => setBriefKeywords((prev) => ({ ...prev, [id]: kw }))}
          onConfirm={() => { setAnalyseLaunchOpen(false); setSelected(new Set()); }}
          onClose={() => setAnalyseLaunchOpen(false)}
        />
      )}
    </div>
  );
}
