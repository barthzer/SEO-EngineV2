"use client";

import { useState, useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useModalTransition } from "@/hooks/useModalTransition";
import { SuccessCheck } from "@/components/SuccessCheck";
import { Button } from "@/components/Button";
import { FilterTabs } from "@/components/FilterTabs";
import { EmptyState } from "@/components/EmptyState";
import { Tooltip, ChartTooltip } from "@/components/Tooltip";
import { AreaChart } from "@/components/AreaChart";
import { DropdownMenu, DropdownItem, DropdownSeparator, DropdownHeader } from "@/components/DropdownMenu";
import { ColPill } from "@/components/ColPill";
import { TableWide, type ColumnDef } from "@/components/TableWide";
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
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import { SearchInput } from "@/components/SearchInput";
import { IconBadge } from "@/components/IconBadge";
import { StatusPill, StatusPillDropdown, STATUS_CONFIG, type Status as BriefStatus } from "@/components/StatusPill";
import { SegmentedControl } from "@/components/SegmentedControl";
import { Callout } from "@/components/Callout";
import { KpiCard } from "@/components/KpiCard";
import { KpiGroup } from "@/components/KpiGroup";
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
  Trophy,
  Eye,
  MousePointerClick,
  RefreshCw,
  Play,
  Plus,
  Tag as TagIcon,
  Globe as GlobeIcon,
  Clock,
  Monitor,
  Smartphone,
} from "lucide-react";
import { LineDotChart } from "@/components/LineDotChart";
import { Sparkline } from "@/components/Sparkline";
import { DeltaBadge } from "@/components/DeltaBadge";
import { ActionCard, type ActionPriorityLevel } from "@/components/ActionCard";
import { PriorityBadge } from "@/components/PriorityBars";
import { ValidateSwitch } from "@/components/ValidateSwitch";
import { DeltaIndicator } from "@/components/DeltaIndicator";
import { useToast } from "@/context/ToastContext";
import { Stepper } from "@/components/Stepper";

/* ── Column header helpers (vue URLs) ─────────────────────────────────── */

function ColHeader({ width, children }: { width: number; children: ReactNode }) {
  return (
    <span
      className="flex-shrink-0 min-w-0 text-[12px] font-medium text-[var(--text-muted)]"
      style={{ width }}
    >
      {children}
    </span>
  );
}

function SortHeader<K extends string>({
  width,
  sortKey,
  sortDir,
  k,
  onClick,
  children,
}: {
  width: number;
  sortKey: K | null;
  sortDir: "asc" | "desc";
  k: K;
  onClick: () => void;
  children: ReactNode;
}) {
  const active = sortKey === k;
  return (
    <div className="flex-shrink-0 min-w-0" style={{ width }}>
      <button
        type="button"
        onClick={onClick}
        className={`group/sort inline-flex items-center gap-1 rounded-md text-[12px] font-medium transition-colors ${
          active ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        }`}
      >
        {children}
        <span className="flex flex-col leading-none">
          <ChevronDownIcon
            className={`h-3 w-3 -mb-0.5 rotate-180 transition-opacity ${
              active && sortDir === "asc" ? "opacity-100" : "opacity-30 group-hover/sort:opacity-60"
            }`}
          />
          <ChevronDownIcon
            className={`h-3 w-3 transition-opacity ${
              active && sortDir === "desc" ? "opacity-100" : "opacity-30 group-hover/sort:opacity-60"
            }`}
          />
        </span>
      </button>
    </div>
  );
}

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
  tag?: string;
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
  // Tag SEO — Optimisation Q2 (14 URLs)
  { id: 1,  title: "Guide SEO local complet",              url: "/blog/seo-local",              type: "optimiser", priority: "haute",   keyword: "seo local",                 volume: 4400, position: 8,  tag: "Lot SEO — Optimisation Q2",    semanticScore: 42, wordCount: 1800, h2s: ["Qu'est-ce que le SEO local ?", "Optimiser sa fiche Google Business", "Les signaux de proximité"], internalLinks: ["/blog/google-business", "/blog/citations-locales"] },
  { id: 2,  title: "Audit SEO technique",                  url: "/services/audit-seo",          type: "optimiser", priority: "haute",   keyword: "audit seo",                 volume: 3600, position: 14, tag: "Lot SEO — Optimisation Q2",    semanticScore: 38, wordCount: 1400, h2s: ["Pourquoi réaliser un audit SEO ?", "Les 5 axes d'un audit technique", "Core Web Vitals"], internalLinks: ["/services/seo", "/blog/core-web-vitals"] },
  { id: 10, title: "Balises title et meta description",    url: "/blog/balises-title-meta",     type: "optimiser", priority: "haute",   keyword: "optimiser balise title",    volume: 2800, position: 19, tag: "Lot SEO — Optimisation Q2",    semanticScore: 31, wordCount: 1200, h2s: ["Rôle de la balise title", "Longueur optimale", "Exemples concrets"], internalLinks: ["/blog/seo-on-page"] },
  { id: 11, title: "Maillage interne : guide complet",     url: "/blog/maillage-interne",       type: "optimiser", priority: "haute",   keyword: "maillage interne seo",      volume: 2200, position: 23, tag: "Lot SEO — Optimisation Q2",    semanticScore: 29, wordCount: 1600, h2s: ["Pourquoi le maillage interne ?", "Stratégies avancées", "Outils d'audit"], internalLinks: ["/blog/cocon-semantique"] },
  { id: 12, title: "Vitesse de chargement et Core Web Vitals", url: "/blog/core-web-vitals",   type: "optimiser", priority: "haute",   keyword: "core web vitals 2024",      volume: 1900, position: 27, tag: "Lot SEO — Optimisation Q2",    semanticScore: 44, wordCount: 1500, h2s: ["LCP, CLS, INP expliqués", "Optimiser son score", "Outils de mesure"], internalLinks: ["/blog/performance-web"] },
  { id: 13, title: "SEO on-page : checklist complète",     url: "/blog/seo-on-page",            type: "optimiser", priority: "moyenne", keyword: "seo on page checklist",     volume: 1700, position: 31, tag: "Lot SEO — Optimisation Q2",    semanticScore: 52, wordCount: 2000, h2s: ["Structure de page", "Optimisation sémantique", "Accessibilité"], internalLinks: ["/blog/balises-title-meta"] },
  { id: 14, title: "Données structurées pour e-commerce", url: "/blog/schema-ecommerce",       type: "optimiser", priority: "moyenne", keyword: "schema org ecommerce",      volume: 1400, position: 38, tag: "Lot SEO — Optimisation Q2",    semanticScore: 26, wordCount: 1300, h2s: ["Product schema", "Review schema", "BreadcrumbList"], internalLinks: ["/blog/schema-org"] },
  { id: 15, title: "Canonicalisation et duplicate content", url: "/blog/canonical-tag",        type: "optimiser", priority: "moyenne", keyword: "balise canonical seo",      volume: 1300, position: 42, tag: "Lot SEO — Optimisation Q2",    semanticScore: 18, wordCount: 1100, h2s: ["Qu'est-ce que le duplicate content ?", "La balise canonical", "Bonnes pratiques"], internalLinks: ["/blog/audit-seo"] },
  { id: 16, title: "Redirection 301 : quand et comment",  url: "/blog/redirection-301",        type: "optimiser", priority: "moyenne", keyword: "redirection 301 seo",       volume: 1100, position: 47, tag: "Lot SEO — Optimisation Q2",    semanticScore: 21, wordCount: 900,  h2s: ["Les types de redirections", "Impact SEO", "Migration de site"], internalLinks: ["/blog/audit-seo-technique"] },
  { id: 17, title: "Sitemap XML : optimisation",          url: "/blog/sitemap-xml",             type: "optimiser", priority: "basse",   keyword: "sitemap xml seo",           volume: 960,  position: 55, tag: "Lot SEO — Optimisation Q2",    semanticScore: 35, wordCount: 800,  h2s: ["Créer un sitemap", "Soumettre à Google Search Console", "Erreurs à éviter"], internalLinks: ["/blog/robots-txt"] },
  { id: 18, title: "Robots.txt : guide pratique",         url: "/blog/robots-txt",              type: "optimiser", priority: "basse",   keyword: "robots txt seo",            volume: 880,  position: 61, tag: "Lot SEO — Optimisation Q2",    semanticScore: 29, wordCount: 700,  h2s: ["Syntaxe du fichier robots.txt", "Directives Disallow et Allow", "Erreurs fréquentes"], internalLinks: ["/blog/sitemap-xml"] },
  { id: 19, title: "Pagination et SEO",                   url: "/blog/pagination-seo",          type: "optimiser", priority: "basse",   keyword: "pagination seo",            volume: 740,  position: 68, tag: "Lot SEO — Optimisation Q2",    semanticScore: 14, wordCount: 800,  h2s: ["Problèmes de pagination", "Solutions recommandées", "Infinite scroll"], internalLinks: ["/blog/canonical-tag"] },
  { id: 20, title: "Hreflang : SEO international",       url: "/blog/hreflang",                 type: "optimiser", priority: "basse",   keyword: "hreflang balise seo",       volume: 680,  position: 74, tag: "Lot SEO — Optimisation Q2",    semanticScore: 11, wordCount: 1000, h2s: ["Qu'est-ce que l'hreflang ?", "Implémentation", "Erreurs courantes"], internalLinks: ["/blog/seo-international"] },
  { id: 21, title: "Crawl budget : optimisation",        url: "/blog/crawl-budget",              type: "optimiser", priority: "basse",   keyword: "crawl budget googlebot",    volume: 590,  position: 81, tag: "Lot SEO — Optimisation Q2",    semanticScore: 8,  wordCount: 900,  h2s: ["Qu'est-ce que le crawl budget ?", "Facteurs d'influence", "Optimiser son crawl"], internalLinks: ["/blog/robots-txt", "/blog/sitemap-xml"] },

  // Tag Création — Blog expert (11 URLs)
  { id: 4,  title: "SEO vs SEA : quelle stratégie ?",    url: "/blog/seo-vs-sea",               type: "combler",   priority: "haute",   keyword: "seo vs sea",                volume: 2400, position: 31, tag: "Lot Création — Blog expert",   semanticScore: 0,  wordCount: 1600, h2s: ["Différences fondamentales", "Quand choisir le SEO ?", "Stratégie combinée"], internalLinks: ["/services/sea", "/services/seo"] },
  { id: 5,  title: "Optimisation du taux de clic (CTR)", url: "/blog/optimiser-ctr",            type: "combler",   priority: "haute",   keyword: "améliorer ctr google",      volume: 1900, position: 38, tag: "Lot Création — Blog expert",   semanticScore: 0,  wordCount: 1400, h2s: ["Comprendre le CTR en SEO", "Optimiser ses balises title", "Rich snippets"], internalLinks: ["/blog/meta-tags", "/blog/schema-org"] },
  { id: 22, title: "Cocon sémantique : la méthode",      url: "/blog/cocon-semantique",          type: "combler",   priority: "haute",   keyword: "cocon sémantique seo",      volume: 1800, position: 34, tag: "Lot Création — Blog expert",   semanticScore: 0,  wordCount: 1900, h2s: ["Définition du cocon sémantique", "Construire sa structure", "Exemples concrets"], internalLinks: ["/blog/maillage-interne"] },
  { id: 23, title: "Intention de recherche et SEO",      url: "/blog/intention-recherche",       type: "combler",   priority: "haute",   keyword: "search intent seo",         volume: 1600, position: 40, tag: "Lot Création — Blog expert",   semanticScore: 0,  wordCount: 1500, h2s: ["Les 4 types d'intention", "Aligner contenu et intention", "Outils"], internalLinks: ["/blog/redaction-seo"] },
  { id: 24, title: "Longue traîne : stratégie complète", url: "/blog/longue-traine",             type: "combler",   priority: "haute",   keyword: "longue traîne seo",         volume: 1400, position: 45, tag: "Lot Création — Blog expert",   semanticScore: 0,  wordCount: 1700, h2s: ["Qu'est-ce que la longue traîne ?", "Trouver ses mots-clés", "Créer le contenu"], internalLinks: ["/blog/recherche-mots-cles"] },
  { id: 25, title: "Content marketing B2B",              url: "/blog/content-marketing-b2b",     type: "combler",   priority: "moyenne", keyword: "content marketing b2b",     volume: 1200, position: 52, tag: "Lot Création — Blog expert",   semanticScore: 0,  wordCount: 2000, h2s: ["Spécificités du B2B", "Formats qui convertissent", "Mesurer le ROI"], internalLinks: ["/blog/strategie-contenu"] },
  { id: 26, title: "Analyse SEO : template et méthode",   url: "/blog/brief-seo",                  type: "combler",   priority: "moyenne", keyword: "brief seo template",        volume: 1100, position: 58, tag: "Lot Création — Blog expert",   semanticScore: 0,  wordCount: 1300, h2s: ["À quoi sert un brief SEO ?", "Les éléments clés", "Template téléchargeable"], internalLinks: ["/blog/redaction-seo"] },
  { id: 27, title: "Recherche de mots-clés avancée",    url: "/blog/recherche-mots-cles",         type: "combler",   priority: "moyenne", keyword: "keyword research avancé",   volume: 980,  position: 63, tag: "Lot Création — Blog expert",   semanticScore: 0,  wordCount: 1800, h2s: ["Outils de recherche", "Analyse de la concurrence", "Clustering"], internalLinks: ["/blog/longue-traine"] },
  { id: 28, title: "SERP : comprendre les résultats",   url: "/blog/serp-google",                 type: "combler",   priority: "basse",   keyword: "serp google features",      volume: 860,  position: 70, tag: "Lot Création — Blog expert",   semanticScore: 0,  wordCount: 1100, h2s: ["Anatomie d'une SERP", "Featured snippets", "Position zéro"], internalLinks: ["/blog/seo-local"] },
  { id: 29, title: "Taux de rebond et SEO",             url: "/blog/taux-rebond",                 type: "combler",   priority: "basse",   keyword: "taux de rebond seo",        volume: 720,  position: 77, tag: "Lot Création — Blog expert",   semanticScore: 0,  wordCount: 900,  h2s: ["Définition du taux de rebond", "Impact sur le SEO", "Comment le réduire"], internalLinks: ["/blog/ux-seo"] },
  { id: 30, title: "Google E-E-A-T : mise à jour 2024", url: "/blog/google-eeat-2024",            type: "combler",   priority: "basse",   keyword: "google eeat 2024",          volume: 640,  position: 84, tag: "Lot Création — Blog expert",   semanticScore: 0,  wordCount: 1200, h2s: ["Nouveautés E-E-A-T", "Signaux de confiance", "Stratégie d'auteur"], internalLinks: ["/blog/eeat-google"] },

  // Lot GEO — Structured data (10 URLs)
  { id: 7,  title: "E-E-A-T : Expérience, Expertise, Autorité", url: "/blog/eeat-google", type: "creer", priority: "haute",   keyword: "eeat google",               volume: 1300,             tag: "Lot GEO — Structured data",    semanticScore: 0,  wordCount: 2400, h2s: ["Qu'est-ce que l'E-E-A-T ?", "Comment améliorer ses signaux", "E-E-A-T et IA générative"], internalLinks: ["/blog/seo-ia", "/blog/contenu-expert"] },
  { id: 8,  title: "Schema.org et données structurées",         url: "/blog/schema-org",   type: "creer", priority: "haute",   keyword: "données structurées seo",   volume: 1100,             tag: "Lot GEO — Structured data",    semanticScore: 0,  wordCount: 1800, h2s: ["Introduction aux données structurées", "Les types de schema", "Implémenter JSON-LD"], internalLinks: ["/blog/rich-snippets"] },
  { id: 31, title: "SEO et IA générative : s'adapter",          url: "/blog/seo-ia",       type: "creer", priority: "haute",   keyword: "seo intelligence artificielle", volume: 2100,          tag: "Lot GEO — Structured data",    semanticScore: 0,  wordCount: 2200, h2s: ["Impact de l'IA sur le SEO", "SGE et Search Generative Experience", "Stratégies d'adaptation"], internalLinks: ["/blog/eeat-google"] },
  { id: 32, title: "Answer Engine Optimization (AEO)",          url: "/blog/aeo",          type: "creer", priority: "haute",   keyword: "answer engine optimization",volume: 1700,             tag: "Lot GEO — Structured data",    semanticScore: 0,  wordCount: 1900, h2s: ["Qu'est-ce que l'AEO ?", "Différence SEO / AEO", "Optimiser pour les IA"], internalLinks: ["/blog/seo-ia"] },
  { id: 33, title: "GEO : Generative Engine Optimization",      url: "/blog/geo-seo",      type: "creer", priority: "haute",   keyword: "generative engine optimization", volume: 1500,         tag: "Lot GEO — Structured data",    semanticScore: 0,  wordCount: 2000, h2s: ["Définition du GEO", "Facteurs de citation IA", "Mesurer sa visibilité IA"], internalLinks: ["/blog/aeo", "/blog/seo-ia"] },
  { id: 34, title: "Rich snippets : guide 2024",                url: "/blog/rich-snippets",type: "creer", priority: "moyenne", keyword: "rich snippets seo",         volume: 1200,             tag: "Lot GEO — Structured data",    semanticScore: 0,  wordCount: 1400, h2s: ["Types de rich snippets", "Implémenter les données structurées", "Tester avec l'outil Google"], internalLinks: ["/blog/schema-org"] },
  { id: 35, title: "FAQ schema et voice search",                url: "/blog/faq-schema",   type: "creer", priority: "moyenne", keyword: "faq schema seo",            volume: 950,              tag: "Lot GEO — Structured data",    semanticScore: 0,  wordCount: 1100, h2s: ["Qu'est-ce que le FAQ schema ?", "Implémentation", "Voice search et SEO"], internalLinks: ["/blog/rich-snippets"] },
  { id: 36, title: "Signaux E-E-A-T pour les PME",              url: "/blog/eeat-pme",     type: "creer", priority: "moyenne", keyword: "eeat pme site web",         volume: 780,              tag: "Lot GEO — Structured data",    semanticScore: 0,  wordCount: 1300, h2s: ["E-E-A-T adapté aux PME", "Construire son autorité", "Contenu expert à budget limité"], internalLinks: ["/blog/eeat-google"] },
  { id: 37, title: "Optimisation pour ChatGPT et Perplexity",  url: "/blog/seo-chatgpt",  type: "creer", priority: "basse",   keyword: "optimiser site pour chatgpt",volume: 660,             tag: "Lot GEO — Structured data",    semanticScore: 0,  wordCount: 1600, h2s: ["Comment ChatGPT cite les sources", "Stratégie de citation", "Cas pratiques"], internalLinks: ["/blog/geo-seo"] },
  { id: 38, title: "Structured data pour les articles",         url: "/blog/article-schema", type: "creer", priority: "basse", keyword: "article schema structured data", volume: 540,          tag: "Lot GEO — Structured data",    semanticScore: 0,  wordCount: 900,  h2s: ["Article schema expliqué", "Implémenter NewsArticle", "Erreurs fréquentes"], internalLinks: ["/blog/schema-org"] },

  // Sans tag
  { id: 3,  title: "Création de liens (link building)", url: "/blog/link-building",  type: "optimiser", priority: "moyenne", keyword: "link building",    volume: 2900, position: 22, semanticScore: 55, wordCount: 2200, h2s: ["Qu'est-ce que le link building ?", "Les meilleures stratégies", "Mesurer son profil de liens"], internalLinks: ["/blog/netlinking"] },
  { id: 6,  title: "Rédaction SEO : le guide",          url: "/blog/redaction-seo",  type: "combler",   priority: "moyenne", keyword: "rédaction seo",    volume: 1600, position: 44, semanticScore: 0,  wordCount: 2000, h2s: ["Les fondamentaux de la rédaction SEO", "Structure d'un article optimisé"], internalLinks: ["/blog/cocon-semantique"] },
  { id: 9,  title: "Stratégie de contenu pilier",       url: "/blog/contenu-pilier", type: "creer",     priority: "basse",   keyword: "content hub seo",  volume: 880,              semanticScore: 0,  wordCount: 2600, h2s: ["La méthode Hub & Spoke", "Créer une page pilier efficace"], internalLinks: ["/blog/cocon-semantique"] },

  // Pages "agence" — utilisées comme cibles dans Univers sémantique (cannibalisation / couvert)
  { id: 100, title: "Accueil — Agence marketing digital",            url: "/",                                                       type: "optimiser", priority: "haute",   keyword: "agence marketing digital",     volume: 9800, position: 9,  semanticScore: 64, wordCount: 1400, h2s: ["Notre vision", "Nos expertises", "Nos secteurs"], internalLinks: ["/agence-marketing-digital-sante/", "/agence-marketing-digital-b2b/"] },
  { id: 101, title: "Agence marketing digital — Santé",              url: "/agence-marketing-digital-sante/",                        type: "optimiser", priority: "haute",   keyword: "agence digital santé",         volume: 90,   position: 59, semanticScore: 71, wordCount: 1600, h2s: ["Spécificités du secteur santé", "Conformité HAS / ANSM", "Cas clients"], internalLinks: ["/", "/blog/seo-local"] },
  { id: 102, title: "Agence marketing digital — Tourisme & voyage", url: "/agence-marketing-digital-tourisme-voyage/",              type: "optimiser", priority: "haute",   keyword: "agence communication tourisme",volume: 70,   position: 33, semanticScore: 68, wordCount: 1500, h2s: ["Saisonnalité du tourisme", "SEO local touristique", "Réseaux sociaux"], internalLinks: ["/", "/blog/seo-local"] },
  { id: 103, title: "Agence marketing digital — Banque & assurance", url: "/agence-marketing-digital-banque-assurance/",            type: "optimiser", priority: "moyenne", keyword: "agence seo définition",        volume: 90,   position: 2,  semanticScore: 72, wordCount: 1400, h2s: ["Réglementation ACPR", "Conformité RGPD", "Cas clients"], internalLinks: ["/", "/agence-marketing-digital-b2b/"] },
  { id: 104, title: "Agence marketing digital — B2B",                url: "/agence-marketing-digital-b2b/",                          type: "optimiser", priority: "moyenne", keyword: "agence seo b2b",               volume: 1100, position: 8,  semanticScore: 70, wordCount: 1500, h2s: ["Cycles de vente longs", "Lead nurturing", "Account-based marketing"], internalLinks: ["/", "/blog/content-marketing-b2b"] },
  { id: 105, title: "Agence marketing digital — Mode prêt-à-porter", url: "/agence-marketing-digital-mode-pret-a-porter/",          type: "optimiser", priority: "moyenne", keyword: "agence marketing digital c'est quoi", volume: 20, position: 5, semanticScore: 65, wordCount: 1300, h2s: ["Tendances mode 2026", "Storytelling visuel", "E-shop SEO"], internalLinks: ["/"] },
  { id: 106, title: "Agence marketing digital — Luxe",              url: "/agence-marketing-digital-luxe/",                          type: "optimiser", priority: "moyenne", keyword: "agence digitale luxe",         volume: 140,  position: 14, semanticScore: 60, wordCount: 1400, h2s: ["Codes du luxe digital", "Premiumisation", "International"], internalLinks: ["/"] },
  { id: 107, title: "Formation SEO certifiante",                     url: "/formation/formation-seo/",                                type: "creer",     priority: "haute",   keyword: "formation seo",                volume: 1700, position: 46, semanticScore: 35, wordCount: 1800, h2s: ["Programme de la formation", "Certification reconnue", "Modalités CPF"], internalLinks: ["/blog/recherche-mots-cles"] },
  { id: 108, title: "Audit SEO technique avancé",                    url: "/services/audit-seo-technique/",                           type: "optimiser", priority: "moyenne", keyword: "audit seo technique",          volume: 1000, position: 27, semanticScore: 48, wordCount: 1700, h2s: ["Crawl & indexation", "Core Web Vitals", "Logs serveur"], internalLinks: ["/services/audit-seo"] },
  { id: 109, title: "Comparatif des agences SEO en 2026",            url: "/blog/agence-seo-comparatif/",                             type: "combler",   priority: "moyenne", keyword: "comparatif agence seo",        volume: 320,  position: 11, semanticScore: 0,  wordCount: 1900, h2s: ["Méthodologie du comparatif", "Top 10 des agences", "Comment choisir"], internalLinks: ["/blog/agence-seo"] },
  { id: 110, title: "Stratégie SEO pour le luxe",                    url: "/blog/luxe-strategie-seo/",                                type: "combler",   priority: "basse",   keyword: "seo luxe",                     volume: 90,   position: 41, semanticScore: 0,  wordCount: 1500, h2s: ["Spécificités du SEO luxe", "Branding et search", "International"], internalLinks: ["/agence-marketing-digital-luxe/"] },
  { id: 111, title: "Tendances SEO 2026",                            url: "/blog/seo-2026-tendances/",                                type: "creer",     priority: "basse",   keyword: "tendances seo 2026",           volume: 480,  position: 52, semanticScore: 0,  wordCount: 1600, h2s: ["IA générative et search", "Topical authority", "GEO et brand mentions"], internalLinks: ["/blog/seo-chatgpt"] },
];

export const TAG_COUNTS = BRIEFS.reduce<Record<string, number>>((acc, b) => {
  if (b.tag) acc[b.tag] = (acc[b.tag] || 0) + 1;
  return acc;
}, {});

export const TAG_COLORS_DEFAULT: Record<string, string> = {
  "Lot SEO — Optimisation Q2":  "#3B82F6",
  "Lot Création — Blog expert": "var(--color-success)",
  "Lot GEO — Structured data":  "#A855F7",
  "Sans lot":                   "#64748B",
};

// Nombre de briefs "terminés" par tag (mock : 6, 4, 2)
const TAG_DONE: Record<string, number> = {
  "Lot SEO — Optimisation Q2":  6,
  "Lot Création — Blog expert": 4,
  "Lot GEO — Structured data":  2,
};

export function TagRow({
  tag,
  color,
  total,
  done,
  isLast = false,
  onNavigate,
}: {
  tag: string;
  color: string;
  total: number;
  done: number;
  isLast?: boolean;
  onNavigate?: (tag: string) => void;
}) {
  const pct = Math.round((done / total) * 100);
  return (
    <div className={`group flex items-center justify-between gap-6 px-5 py-4 transition-colors hover:bg-[var(--bg-card-hover)] ${!isLast ? "border-b border-[var(--border-subtle)]" : ""}`}>
      <div className="flex items-center gap-3 min-w-0">
        <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: color }} />
        <p className="truncate text-[13px] font-medium text-[var(--text-primary)]">{tag}</p>
      </div>
      <div className="flex flex-shrink-0 items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--bg-card-hover)]">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
          </div>
          <span className="text-[11px] tabular-nums text-[var(--text-muted)]">{done}/{total}</span>
        </div>
        {onNavigate && (
          <button onClick={() => onNavigate(tag)} className="flex items-center gap-1 text-[12px] font-medium text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100 hover:text-[var(--text-primary)]">
            Voir <ChevronRightIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

type TagRowData = { tag: string; color: string; total: number; done: number };

export function TagList({ onNavigate }: { onNavigate?: (tag: string) => void }) {
  const allTags: TagRowData[] = Object.keys(TAG_COLORS_DEFAULT)
    .filter((l) => l !== "Sans lot")
    .map((tag) => ({
      tag,
      color: TAG_COLORS_DEFAULT[tag],
      total: TAG_COUNTS[tag] ?? 0,
      done: TAG_DONE[tag] ?? 0,
    }));

  if (allTags.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--border-subtle)] px-4 py-10 text-center text-[13px] text-[var(--text-muted)]">
        Aucun lot récent.
      </div>
    );
  }

  const tags = allTags.slice(0, 3);

  return (
    <div className="grid grid-cols-4 gap-3">
      {tags.map((r) => {
        const pct = Math.round((r.done / Math.max(r.total, 1)) * 100);
        // Nom court : retire le préfixe "Tag " pour l'affichage
        const shortName = r.tag.replace(/^Tag\s+/, "");
        return (
          <button
            key={r.tag}
            type="button"
            onClick={() => onNavigate?.(r.tag)}
            className="group flex flex-col gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 text-left transition-colors hover:bg-[var(--bg-card-hover)]"
          >
            {/* Header — icône tag colorée + menu 3-dots */}
            <div className="flex items-start justify-between">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: `color-mix(in oklab, ${r.color} 12%, transparent)`, color: r.color }}
              >
                <TagIcon className="h-4 w-4" />
              </span>
              <span className="text-[var(--text-muted)] opacity-60 transition-opacity group-hover:opacity-100">
                <EllipsisVerticalIcon className="h-4 w-4" />
              </span>
            </div>

            {/* Nom du tag */}
            <p className="truncate text-[15px] font-semibold text-[var(--text-primary)]" title={shortName}>
              {shortName}
            </p>

            {/* Compteur URLs */}
            <div className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)]">
              <GlobeIcon className="h-3.5 w-3.5" />
              <span className="tabular-nums">{r.total} URL{r.total > 1 ? "s" : ""}</span>
            </div>

            {/* Barre de progression — accent primaire uniforme */}
            <div className="flex flex-col gap-1.5">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                <div
                  className="h-full rounded-full bg-[var(--accent-primary)] transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span className="tabular-nums">{r.done} / {r.total}</span>
                <span className="tabular-nums font-medium text-[var(--accent-primary)]">{pct}%</span>
              </div>
            </div>
          </button>
        );
      })}

      {/* 4e card — Voir tous les tags */}
      <button
        type="button"
        onClick={() => onNavigate?.("")}
        className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 text-center transition-colors hover:border-[var(--border-medium)] hover:bg-[var(--bg-subtle)]"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-subtle)] text-[var(--text-secondary)] transition-colors group-hover:bg-[var(--bg-card)] group-hover:text-[var(--text-primary)]">
          <ChevronRightIcon className="h-4 w-4" />
        </span>
        <p className="text-[14px] font-semibold text-[var(--text-primary)]">Voir tous les tags</p>
        <p className="text-[12px] text-[var(--text-muted)] tabular-nums">{allTags.length} au total</p>
      </button>
    </div>
  );
}

/* ── Config ──────────────────────────────────────────────────────────── */

export const TYPE_CONFIG: Record<BriefType, { label: string; color: string; colorBg: string; text: string; Icon: React.ElementType }> = {
  optimiser: { label: "Optimiser", color: "var(--color-danger)", colorBg: "var(--color-danger-bg)",  text: "var(--color-danger)", Icon: ArrowPathIcon },
  combler:   { label: "Gap GSC",   color: "var(--color-warning)", colorBg: "rgba(245,158,11,0.09)", text: "#B45309", Icon: PuzzlePieceIcon },
  creer:     { label: "De zéro",   color: "var(--color-success)", colorBg: "var(--color-success-bg)", text: "var(--color-success)", Icon: SparklesIcon },
};

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; text: string }> = {
  haute:   { label: "Haute",   color: "var(--color-danger)", bg: "var(--color-danger-bg)",  text: "var(--color-danger)" },
  moyenne: { label: "Moyenne", color: "var(--color-warning)", bg: "rgba(245,158,11,0.08)", text: "#B45309" },
  basse:   { label: "Basse",   color: "var(--accent-primary)", bg: "rgba(99,102,241,0.08)", text: "#4338CA" },
};

type Filter = "tous" | BriefType;

function shortTag(tag: string): string {
  return tag.replace(/^Tag\s+/i, "");
}

/* ── TagColorDot ─────────────────────────────────────────────────────── */

const TAG_COLOR_PALETTE = [
  "var(--color-danger)", "var(--color-warning)", "var(--color-warning)", "#EAB308",
  "#84CC16", "var(--color-success)", "#14B8A6", "#06B6D4",
  "#3B82F6", "var(--accent-primary)", "#A855F7", "#EC4899",
  "#64748B", "#78716C",
];

function TagColorDot({ color, onChange }: { color: string; onChange: (c: string) => void }) {
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
        aria-label="Changer la couleur du tag"
      >
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      </button>

      {open && typeof window !== "undefined" && createPortal(
        <div
          ref={popoverRef}
          className="animate-dropdown-down fixed z-[999]"
          style={{ top: pos.top, left: pos.left, transformOrigin: "top center" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3 shadow-[var(--shadow-floating)]">
            <div className="absolute -top-[7px] h-3.5 w-3.5 rotate-45 border-l border-t border-[var(--border-subtle)] bg-[var(--bg-card)]" style={{ left: 63 }} />
            <div className="flex flex-wrap gap-2" style={{ width: `${7 * 36 + 6 * 8}px` }}>
              {TAG_COLOR_PALETTE.map((c) => (
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

  // Pas encore assez de points pour tracer une courbe → trait gris discret
  if (history.length < 2) {
    return (
      <svg width={W} height={H} className="block">
        <line
          x1={0}
          x2={W}
          y1={H / 2}
          y2={H / 2}
          stroke="var(--border-subtle)"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </svg>
    );
  }

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
    // Coordonnées viewport (le tooltip est en portail position:fixed)
    tipX = rect.left + (hov.x / W) * rect.width;
    tipY = rect.top + (hov.y / H) * rect.height;
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
        <ChartTooltip x={tipX} y={tipY - 4} portal>
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

/** CTR attendu par position SERP (courbe simplifiée GSC industrie) */
function expectedCtrFromPosition(pos: number | undefined): number | null {
  if (pos == null) return null;
  if (pos <= 1) return 27;
  if (pos <= 2) return 15;
  if (pos <= 3) return 11;
  if (pos <= 5) return 6.5;
  if (pos <= 10) return 3;
  if (pos <= 20) return 1.2;
  return 0.5;
}

/** Effort estimé en heures pour livrer/optimiser la page (mock déterministe) */
function estimateEffortHours(brief: Brief): number {
  if (brief.type === "creer") return Math.max(6, Math.ceil(brief.wordCount / 250));
  if (brief.type === "combler") return Math.max(4, Math.ceil(brief.wordCount / 350));
  return Math.max(1, Math.ceil(brief.wordCount / 700));
}

/** Convertit une chaîne de temps "30 min" ou "2h" en minutes */
function parseTimeToMinutes(time?: string): number {
  if (!time) return 0;
  const t = time.toLowerCase().trim();
  // "2h" / "2 h" / "2h30"
  const hourMatch = t.match(/(\d+(?:\.\d+)?)\s*h\s*(\d+)?/);
  if (hourMatch) {
    const h = parseFloat(hourMatch[1]);
    const m = hourMatch[2] ? parseInt(hourMatch[2], 10) : 0;
    return h * 60 + m;
  }
  // "30 min" / "45min"
  const minMatch = t.match(/(\d+)\s*min/);
  if (minMatch) return parseInt(minMatch[1], 10);
  return 0;
}

/** Formate des minutes en label lisible : "1h30", "45 min", "3h" */
function formatMinutesLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h${m.toString().padStart(2, "0")}`;
}

function SemanticPill({ score }: { score: number }) {
  if (!score) return <span className="text-[13px] text-[var(--text-muted)]">—</span>;
  const color = score >= 70 ? "var(--color-success)" : score >= 40 ? "var(--color-warning)" : "var(--color-danger)";
  return (
    <span
      className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-[12px] font-semibold tabular-nums"
      style={{
        color,
        backgroundColor: `color-mix(in oklab, ${color} 10%, transparent)`,
      }}
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

type DrawerTab = "synthese" | "contenu" | "autorite" | "technique" | "actions";

const DRAWER_TABS: { key: DrawerTab; label: string }[] = [
  { key: "synthese",  label: "Synthèse" },
  { key: "contenu",   label: "Contenu" },
  { key: "autorite",  label: "Autorité" },
  { key: "technique", label: "Technique" },
  { key: "actions",   label: "Actions" },
];

/* ── Actions partagées — source unique pour les 4 tabs + le tab Actions ── */

type ActionSource = "synthese" | "contenu" | "autorite" | "technique";

const ACTION_SOURCE_LABEL: Record<ActionSource, string> = {
  synthese: "Synthèse",
  contenu: "Contenu",
  autorite: "Autorité",
  technique: "Technique",
};

import type { ActionOwner } from "@/components/ActionCard";

type Action = {
  id: string;
  source: ActionSource;
  priority: ActionPriorityLevel;
  title: string;
  time?: string;
  impact?: string;
  /** B1 — Owner + deadline + récurrence (mock pour l'instant, persistance en B1b). */
  owner?: ActionOwner;
  deadline?: string;
  recurrence?: "none" | "weekly" | "monthly" | "quarterly";
};

/** B1 — Owners de démo (cohérents avec /equipe pour les vraies photos pravatar.cc). */
const DEMO_OWNERS: Record<string, ActionOwner> = {
  BL: { id: "bl", name: "Barthélemy L.", initials: "BL", photoSeed: "barthelemy-l-seo" },
  SM: { id: "sm", name: "Sophie M.",     initials: "SM", photoSeed: "sophie-m-seo" },
  TL: { id: "tl", name: "Thomas L.",     initials: "TL", photoSeed: "thomas-l-seo" },
  MP: { id: "mp", name: "Marie P.",      initials: "MP", photoSeed: "marie-p-seo" },
};

/** Liste complète des candidats pour le picker d'assignation. */
const ALL_OWNERS: ActionOwner[] = Object.values(DEMO_OWNERS);

function getAnalysisActions(brief: Brief): Action[] {
  // Deadline générique (29 mai 2026, dans la semaine) pour les démos
  const D_SOON   = "2026-05-29";
  const D_TODAY  = "2026-05-26";
  const D_PASSED = "2026-05-22";
  const D_LATER  = "2026-06-10";

  return [
    // ── Synthèse ──
    { id: "syn-1", source: "synthese", priority: "high", title: "Réécrire l'introduction avec le mot-clé principal", time: "30 min", impact: "+CTR",        owner: DEMO_OWNERS.SM, deadline: D_TODAY },
    { id: "syn-2", source: "synthese", priority: "high", title: `Ajouter ${Math.max(1, Math.round(brief.h2s.length * 0.5))} sections H2 manquantes`, time: "45 min", impact: "+8 pts SEO", owner: DEMO_OWNERS.MP, deadline: D_SOON },
    { id: "syn-3", source: "synthese", priority: "mid",  title: `Enrichir le contenu à ${brief.wordCount + 400} mots minimum`, time: "2h",     impact: "+5 pts",       owner: DEMO_OWNERS.MP, deadline: D_LATER },
    { id: "syn-4", source: "synthese", priority: "mid",  title: "Optimiser la balise title et meta description", time: "15 min", impact: "+CTR",          owner: DEMO_OWNERS.BL, deadline: D_PASSED },
    { id: "syn-5", source: "synthese", priority: "low",  title: "Ajouter 3 liens internes depuis les pages piliers", time: "20 min", impact: "+autorité",  owner: DEMO_OWNERS.BL },
    // ── Contenu ──
    { id: "cnt-1", source: "contenu", priority: "high", title: "Ajouter sections H2 : ROI & mesure de performance", time: "2h",     impact: "+18 pts",     owner: DEMO_OWNERS.MP, deadline: D_SOON },
    { id: "cnt-2", source: "contenu", priority: "high", title: "Enrichir l'intro avec données B2B récentes (2024)", time: "30 min", impact: "+CTR",        owner: DEMO_OWNERS.MP, deadline: D_TODAY },
    { id: "cnt-3", source: "contenu", priority: "mid",  title: "Travailler la densité mot-clé (26,9 → 39,7 cible)", time: "1h",     impact: "+8 pts",      owner: DEMO_OWNERS.SM },
    { id: "cnt-4", source: "contenu", priority: "mid",  title: "Ajouter un tableau comparatif des outils content marketing", time: "1h", impact: "+SEO",   owner: DEMO_OWNERS.SM, deadline: D_LATER },
    { id: "cnt-5", source: "contenu", priority: "low",  title: "Réécrire la conclusion avec un CTA orienté conversion", time: "20 min", impact: "+conv.", owner: DEMO_OWNERS.MP },
    // ── Autorité ──
    { id: "aut-1", source: "autorite", priority: "high", title: "Publier un article invité sur journalduweb.fr (DR 64)", time: "2 sem.", impact: "Haut",   owner: DEMO_OWNERS.TL, deadline: D_LATER },
    { id: "aut-2", source: "autorite", priority: "mid",  title: "Créer une infographie linkable sur les KPIs content B2B", time: "1 sem.", impact: "Moyen", owner: DEMO_OWNERS.MP },
    { id: "aut-3", source: "autorite", priority: "low",  title: "Contacter 10 auteurs qui citent des ressources similaires", time: "3 sem.", impact: "Moyen", owner: DEMO_OWNERS.TL, recurrence: "weekly" },
    // ── Technique ──
    { id: "tec-1", source: "technique", priority: "high", title: "Améliorer le LCP : convertir images above-the-fold en WebP + preload", time: "1 sem.", impact: "Haut", owner: DEMO_OWNERS.BL, deadline: D_SOON },
    { id: "tec-2", source: "technique", priority: "high", title: "Réduire le FCP : différer le JS non critique, activer le cache navigateur", time: "1 sem.", impact: "Haut", owner: DEMO_OWNERS.BL, deadline: D_LATER },
    { id: "tec-3", source: "technique", priority: "mid",  title: "Ajouter les schémas Organization et Service (JSON-LD)", time: "2h", impact: "Moyen",                       owner: DEMO_OWNERS.BL },
    { id: "tec-4", source: "technique", priority: "mid",  title: "Augmenter le nombre de mots à 3 500+ (benchmark médiane concurrents)", time: "3h", impact: "Moyen",        owner: DEMO_OWNERS.MP },
    { id: "tec-5", source: "technique", priority: "low",  title: "Soumettre l'URL dans Google Search Console pour déclencher l'indexation", time: "15 min.", impact: "Faible", owner: DEMO_OWNERS.BL, recurrence: "monthly" },
  ];
}

type TabProps = {
  brief: Brief;
  actions: Action[];
  getStatus: (id: string) => BriefStatus;
  setStatus: (id: string, s: BriefStatus) => void;
  /** B1 — édition inline owner + deadline */
  setOwner: (id: string, owner: ActionOwner | undefined) => void;
  setDeadline: (id: string, deadline: string | undefined) => void;
};

function SyntheseTab({ brief, actions, getStatus, setStatus, setOwner, setDeadline }: TabProps) {
  const pos = brief.position;
  const doneCount = actions.filter((a) => getStatus(a.id) === "done").length;

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

  /* ── KPI top 3 ── */
  const marche = pos ? Math.round(brief.volume * Math.max(0.02, (35 - pos) / 100)) : null;
  const soseo = brief.semanticScore > 0 ? Math.round(brief.semanticScore * 2.4) : null;

  /* ── Hero — progression roadmap ── */
  const progressPct = actions.length === 0 ? 0 : Math.round((doneCount / actions.length) * 100);

  /* ── CTR ── */
  const ctrReel = pos ? Math.max(0.5, 28 - pos * 2.2).toFixed(1) : "3.5";
  const ctrAttendu = pos ? Math.max(2, 35 - pos * 2.5).toFixed(1) : "7.2";
  const ctrGap = (parseFloat(ctrAttendu) - parseFloat(ctrReel)).toFixed(1);
  const ctrGapNeg = parseFloat(ctrGap) > 0;
  const ctrGapAbs = Math.abs(parseFloat(ctrGap)).toFixed(1);

  /* ── SERP preview ── */
  const serpTitle = `${brief.title} — Guide complet ${new Date().getFullYear()}`;
  const serpDesc = `Découvrez notre guide complet sur ${brief.keyword}. Conseils pratiques, exemples et outils pour optimiser votre stratégie SEO.`;
  const serpTitleLen = serpTitle.length;
  const serpDescLen = serpDesc.length;

  return (
    <div className="flex flex-col gap-6">
      {/* Hero — 2 encarts : Progression + Synthèse IA */}
      <div className="grid grid-cols-[auto_1fr] gap-4">
        {/* Progression — ring */}
        <div className="flex items-center gap-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-8">
          <ScoreRing score={progressPct} size={120} strokeWidth={8} color="var(--accent-primary)" hideTotal />
          <div>
            <p className="text-[13px] font-semibold tracking-caption text-[var(--text-secondary)]">Progression</p>
            <p className="mt-1 text-[24px] font-semibold leading-none tabular-nums tracking-heading text-[var(--text-primary)]">{doneCount}/{actions.length}</p>
            <p className="mt-1.5 text-[12px] tracking-caption text-[var(--text-muted)]">actions complétées</p>
          </div>
        </div>

        {/* Synthèse IA */}
        <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-8">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-4 w-4 text-[var(--text-primary)]" />
            <span className="text-[13px] font-semibold tracking-caption text-[var(--text-secondary)]">Synthèse IA</span>
            <span className="inline-flex items-center rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-muted)]">GPT-4</span>
          </div>
          <p className="text-[15px] leading-relaxed text-[var(--text-secondary)]">
            {pos
              ? `Page en position #${pos} sur "${brief.keyword}" — l'intention informationnelle est bien alignée avec la SERP dominante, mais la profondeur H3 reste limitée face aux concurrents qui détaillent davantage formateurs, certifications et méthodes pédagogiques. ${brief.semanticScore > 30 ? "Couverture sémantique solide ; le levier principal reste l'autorité (backlinks)." : "Contenu à enrichir en priorité — ajouter des sous-sections H3 ciblées améliorera la lisibilité et la couverture."}`
              : `Page non positionnée sur "${brief.keyword}" — la page n'est probablement pas encore indexée ou n'a pas de signal suffisant sur ce terme. Priorité : vérifier l'indexation GSC, enrichir le contenu sémantiquement et construire le maillage interne depuis les pages piliers.`}
          </p>
        </div>
      </div>

      {/* 3 chiffres clés */}
      <KpiGroup columns={3}>
        <KpiCard bare icon={Hash}    label="Position GSC" value={pos ? `#${pos}` : "—"} valueColor={pos ? undefined : "var(--text-muted)"} sub={pos ? `${brief.volume.toLocaleString("fr-FR")} rech./mois` : "non positionnée"} />
        <KpiCard bare icon={Target}  label="Marché"       value={marche != null ? `${marche.toLocaleString("fr-FR")}` : "—"} sub="clics potentiels / mois" />
        <KpiCard bare icon={Sparkles} label="SOSEO"       value={soseo != null ? String(soseo) : "—"} valueColor={soseo != null ? undefined : "var(--text-muted)"} sub="score sémantique" />
      </KpiGroup>

      {/* Évolution position — pleine largeur sous le hero */}
      <div className="flex flex-col rounded-2xl border border-[var(--border-subtle)] p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[16px] font-semibold tracking-subheading text-[var(--text-primary)]">Évolution position</p>
          <FilterTabs
            tabs={[{ key: "3m", label: "3m" }, { key: "6m", label: "6m" }, { key: "1an", label: "1 an" }]}
            value={chartRange}
            onChange={setChartRange}
          />
        </div>
        <AreaChart
          data={posData.map((v, i) => ({ label: months[i], value: v }))}
          inverted
          height={180}
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
          <span className="flex items-center gap-1.5"><span className="inline-block h-1.5 w-4 rounded-full bg-[var(--accent-primary)]" />Position</span>
          <span className="flex items-center gap-1.5">
            <svg width="10" height="10" viewBox="0 0 10 10" className="flex-shrink-0">
              <line x1="5" y1="0" x2="5" y2="10" stroke="var(--accent-primary)" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
              <polygon points="1,0 9,0 5,3" fill="var(--accent-primary)" />
            </svg>
            Action réalisée
          </span>
        </div>
      </div>

      {/* Aperçu SERP + Analyse CTR — côte à côte */}
      <div className="grid grid-cols-2 gap-4">
        {/* Aperçu SERP */}
        <div className="flex flex-col rounded-2xl border border-[var(--border-subtle)] p-6">
          <p className="mb-4 text-[16px] font-semibold tracking-subheading text-[var(--text-primary)]">Aperçu SERP</p>
          <div className="flex-1 space-y-1.5">
            <p className="font-mono text-[12px] text-[var(--text-muted)]">votre-site.fr › {brief.url.replace(/^\//, "")}</p>
            <p className="text-[18px] font-medium leading-snug" style={{ color: "#1a0dab" }}>
              {serpTitleLen > 60 ? serpTitle.slice(0, 60) + "…" : serpTitle}
            </p>
            <p className="text-[14px] leading-relaxed text-[var(--text-secondary)]">
              {serpDescLen > 155 ? serpDesc.slice(0, 155) + "…" : serpDesc}
            </p>
          </div>
          <div className="mt-4 flex gap-3 border-t border-[var(--border-subtle)] pt-3">
            <span className={`text-[11px] font-medium ${serpTitleLen > 60 ? "text-[var(--color-danger)]" : "text-[var(--color-success)]"}`}>Title {serpTitleLen}/60</span>
            <span className={`text-[11px] font-medium ${serpDescLen > 155 ? "text-[var(--color-danger)]" : "text-[var(--color-success)]"}`}>Desc {serpDescLen}/155</span>
          </div>
        </div>

        {/* Analyse CTR */}
        <div className="flex flex-col rounded-2xl border border-[var(--border-subtle)] p-6">
          <p className="mb-4 text-[16px] font-semibold tracking-subheading text-[var(--text-primary)]">Analyse CTR</p>
          <KpiGroup columns={3}>
            <KpiCard bare icon={MousePointerClick} label="CTR réel" value={`${ctrReel}%`} sub={pos ? `position #${pos}` : "actuel"} />
            <KpiCard bare icon={Target} label="CTR attendu" value={`${ctrAttendu}%`} valueColor="var(--color-success)" sub="médiane SERP" />
            <KpiCard bare icon={Activity} label="Gap CTR" value={`${ctrGapNeg ? "−" : "+"}${ctrGapAbs}%`} valueColor={ctrGapNeg ? "var(--color-danger)" : "var(--color-success)"} sub={ctrGapNeg ? "sous-performant" : "sur-performant"} />
          </KpiGroup>
          {ctrGapNeg && (
            <Callout variant="error" className="mt-5">
              <span className="font-semibold">CTR sous-performant : </span>votre balise title n'est pas suffisamment incitative. Testez un format question ou intégrez un chiffre clé pour améliorer le taux de clic.
            </Callout>
          )}
          {/* Gradient slider — position du CTR vs médiane */}
          <div className="mt-auto pt-4">
            <div className="rounded-xl border border-[var(--border-subtle)] px-4 py-3">
              <div className="mb-1.5 flex justify-between text-[11px] text-[var(--text-muted)]">
                <span>−50%</span><span>0%</span><span>+50%</span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full" style={{ background: "linear-gradient(to right, var(--color-danger), var(--color-warning) 50%, var(--color-success))" }}>
                <div
                  className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white shadow"
                  style={{ left: `${Math.min(100, Math.max(0, 50 - parseFloat(ctrGap)))}%`, backgroundColor: ctrGapNeg ? "var(--color-danger)" : "var(--color-success)" }}
                />
              </div>
              <p className="mt-1.5 text-center text-[11px] text-[var(--text-muted)]">CTR vs médiane SERP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap — grille de cards d'action */}
      <section className="rounded-2xl border border-[var(--border-subtle)] p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <p className="text-[16px] font-semibold tracking-subheading text-[var(--text-primary)]">Roadmap</p>
          <p className="text-[12px] tabular-nums text-[var(--text-muted)]">
            {doneCount}/{actions.length} faites
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {actions.map((a) => (
            <ActionCard
              key={a.id}
              priority={a.priority}
              title={a.title}
              time={a.time}
              impact={a.impact}
              status={getStatus(a.id)}
              onStatusChange={(s) => setStatus(a.id, s)}
              owner={a.owner}
              ownerCandidates={ALL_OWNERS}
              onOwnerChange={(o) => setOwner(a.id, o)}
              deadline={a.deadline}
              onDeadlineChange={(d) => setDeadline(a.id, d)}
              recurrence={a.recurrence}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function ContenuTab({ brief, actions, getStatus, setStatus, setOwner, setDeadline }: TabProps) {
  const seoScore = 78;
  const doneCount = actions.filter((a) => getStatus(a.id) === "done").length;

  const missingTopics = [
    { word: "ROI contenu B2B",         desc: "Méthodes de calcul et benchmarks sectoriels",     ecartPts: 18 },
    { word: "Content scoring",          desc: "Grilles d'évaluation et outils automatisés",       ecartPts: 14 },
    { word: "Distribution multicanal",  desc: "LinkedIn, newsletter, syndicats de contenu",       ecartPts: 12 },
    { word: "Personas décideurs",       desc: "Cartographie des comités d'achat B2B",             ecartPts: 11 },
    { word: "Case studies format",      desc: "Structures narratives qui convertissent en B2B",   ecartPts: 9 },
  ];

  const h2ToAdd = [
    { text: "ROI et mesure de performance du content marketing", priority: "Critical" },
    { text: "Distribution et amplification du contenu",          priority: "High"     },
    { text: "Outils et stack technologique B2B",                 priority: "High"     },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* 3 chiffres clés */}
      <KpiGroup columns={3}>
        <KpiCard bare icon={Sparkles} label="Score SEO" value={`${seoScore}`} sub="/100 global" />
        <KpiCard bare icon={Activity} label="Densité KW" value="26,9" valueColor="var(--color-danger)" sub="cible : 39,7 (−32 %)" />
        <KpiCard bare icon={FileText} label="Mots" value={brief.wordCount.toLocaleString("fr-FR")} sub={`médiane concurrents : ${Math.round(brief.wordCount * 0.71).toLocaleString("fr-FR")}`} />
      </KpiGroup>

      {/* Brief éditorial — pills + checklist (structuré, conservé) */}
      <div>
        <p className="mb-4 text-[16px] font-semibold tracking-subheading text-[var(--text-primary)]">Analyse éditoriale</p>
        <div className="rounded-2xl border border-[var(--border-subtle)] p-6 space-y-5">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[12px] font-medium bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]">B2B / Services</span>
            <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[12px] font-medium bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]">Informationnelle</span>
            <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[12px] font-medium bg-[var(--bg-subtle)] text-[var(--text-primary)]">Funnel TOFU</span>
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
            <p className="mb-2 text-[13px] font-semibold text-[var(--text-secondary)]">Sections H2 à ajouter</p>
            <div className="space-y-2">
              {h2ToAdd.map((h, i) => (
                <div key={i} className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border-subtle)] px-4 py-3">
                  <span className="text-[13px] text-[var(--text-primary)]">{h.text}</span>
                  <span className={`flex-shrink-0 inline-flex items-center rounded-full px-2 py-1 text-[12px] font-medium ${h.priority === "Critical" ? "bg-[var(--color-danger-bg)] text-[var(--color-danger)]" : "bg-[var(--color-warning-bg)] text-[var(--color-warning)]"}`}>
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
                  <span className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[10px] ${item.ok ? "bg-[rgba(16,185,129,0.1)] text-[var(--color-success)]" : "bg-[var(--bg-subtle)] text-[var(--text-muted)]"}`}>
                    {item.ok ? "✓" : "○"}
                  </span>
                  <span className={`text-[12px] ${item.ok ? "text-[var(--text-secondary)]" : "text-[var(--text-muted)]"}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 sujets manquants — table triée par impact */}
      <div>
        <p className="mb-4 text-[16px] font-semibold tracking-subheading text-[var(--text-primary)]">Sujets manquants</p>
        <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)]">
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
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-[12px] font-medium bg-[var(--color-danger-bg)] text-[var(--color-danger)]">+{t.ecartPts} pts</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions d'amélioration — grille de cards */}
      <section className="rounded-2xl border border-[var(--border-subtle)] p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <p className="text-[16px] font-semibold tracking-subheading text-[var(--text-primary)]">Actions d'amélioration</p>
          <p className="text-[12px] tabular-nums text-[var(--text-muted)]">{doneCount}/{actions.length} faites</p>
        </div>
        <div className="flex flex-col gap-2">
          {actions.map((a) => (
            <ActionCard
              key={a.id}
              priority={a.priority}
              title={a.title}
              time={a.time}
              impact={a.impact}
              status={getStatus(a.id)}
              onStatusChange={(s) => setStatus(a.id, s)}
              owner={a.owner}
              ownerCandidates={ALL_OWNERS}
              onOwnerChange={(o) => setOwner(a.id, o)}
              deadline={a.deadline}
              onDeadlineChange={(d) => setDeadline(a.id, d)}
              recurrence={a.recurrence}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function AutoriteTab({ brief, actions, getStatus, setStatus, setOwner, setDeadline }: TabProps) {
  void brief;
  const doneCount = actions.filter((a) => getStatus(a.id) === "done").length;

  type SerpRow = { pos: number; domain: string; mots: number; dr: number; bl: number; soseo: number; dseo: number; isYou?: boolean };
  const serpYou: SerpRow = { pos: 11, domain: "votre-site.fr", mots: 2000, dr: 34, bl: 0,   soseo: 0,  dseo: 0,  isYou: true };
  const serpBenchmark: SerpRow[] = [
    { pos: 1,  domain: "semrush.com",                  mots: 5800, dr: 92, bl: 847, soseo: 94, dseo: 76 },
    { pos: 2,  domain: "hubspot.com",                  mots: 4900, dr: 88, bl: 612, soseo: 91, dseo: 72 },
    { pos: 3,  domain: "contentmarketinginstitute.com", mots: 6200, dr: 84, bl: 394, soseo: 88, dseo: 68 },
    { pos: 4,  domain: "marketingprofs.com",            mots: 4100, dr: 79, bl: 281, soseo: 84, dseo: 63 },
    serpYou,
  ];
  const serpColumns: ColumnDef<SerpRow>[] = [
    {
      key: "pos", header: "Pos.", width: 60, align: "right",
      sortable: true, sortValue: (r) => r.pos,
      render: (r) => <span className="text-[13px] font-semibold tabular-nums text-[var(--text-muted)]">#{r.pos}</span>,
    },
    {
      key: "domain", header: "Domaine", width: 220, flex: true,
      render: (r) => (
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={`https://www.google.com/s2/favicons?domain=${r.domain}&sz=32`}
            alt="" width={16} height={16}
            className="h-4 w-4 flex-shrink-0 rounded-sm"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
          <span className={`block truncate text-[13px] ${r.isYou ? "font-semibold text-[var(--accent-primary)]" : "font-medium text-[var(--text-primary)]"}`}>
            {r.domain}
          </span>
          {r.isYou && (
            <span className="flex-shrink-0 rounded-full bg-[var(--accent-primary)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-micro text-white">
              Vous
            </span>
          )}
        </div>
      ),
    },
    {
      key: "mots", header: "Mots", width: 90, align: "right",
      sortable: true, sortValue: (r) => r.mots,
      render: (r) => (
        <span className="inline-flex items-center justify-end text-[13px] font-semibold tabular-nums text-[var(--text-primary)]">
          {r.mots.toLocaleString("fr-FR")}
          {!r.isYou && <DeltaIndicator value={r.mots} ref={serpYou.mots} />}
        </span>
      ),
    },
    {
      key: "dr", header: "DR", width: 70, align: "right",
      sortable: true, sortValue: (r) => r.dr,
      render: (r) => (
        <span className="inline-flex items-center justify-end text-[13px] font-semibold tabular-nums text-[var(--text-primary)]">
          {r.dr}
          {!r.isYou && <DeltaIndicator value={r.dr} ref={serpYou.dr} />}
        </span>
      ),
    },
    {
      key: "bl", header: "Backlinks", width: 100, align: "right",
      sortable: true, sortValue: (r) => r.bl,
      render: (r) => (
        <span className="inline-flex items-center justify-end text-[13px] font-semibold tabular-nums text-[var(--text-primary)]">
          {r.bl.toLocaleString("fr-FR")}
          {!r.isYou && <DeltaIndicator value={r.bl} ref={serpYou.bl} />}
        </span>
      ),
    },
    {
      key: "soseo", header: "SOSEO", width: 80, align: "right",
      sortable: true, sortValue: (r) => r.soseo,
      render: (r) => (
        <span className="inline-flex items-center justify-end text-[13px] font-semibold tabular-nums text-[var(--text-primary)]">
          {r.soseo > 0 ? `${r.soseo}%` : "—"}
          {!r.isYou && <DeltaIndicator value={r.soseo} ref={serpYou.soseo} />}
        </span>
      ),
    },
    {
      key: "dseo", header: "DSEO", width: 80, align: "right",
      sortable: true, sortValue: (r) => r.dseo,
      render: (r) => (
        <span className="inline-flex items-center justify-end text-[13px] font-semibold tabular-nums text-[var(--text-primary)]">
          {r.dseo > 0 ? `${r.dseo}%` : "—"}
          {!r.isYou && <DeltaIndicator value={r.dseo} ref={serpYou.dseo} />}
        </span>
      ),
    },
  ];

  const outreachTargets = [
    { domain: "journalduweb.fr",    dr: 64, fit: 5, contact: "editorial@journalduweb.fr" },
    { domain: "abondance.com",      dr: 58, fit: 5, contact: "contact@abondance.com"      },
    { domain: "webmarketing-com.com", dr: 52, fit: 4, contact: "redaction@wm-c.fr"        },
    { domain: "siecledigital.fr",   dr: 48, fit: 4, contact: "contact@siecledigital.fr"  },
    { domain: "ecommercemag.fr",    dr: 43, fit: 3, contact: "presse@ecommercemag.fr"    },
  ];

  const ancreSegments = [
    { label: "Exact match",   pct: 20, color: "var(--color-danger)" },
    { label: "Partial match", pct: 30, color: "var(--color-warning)" },
    { label: "Branded",       pct: 20, color: "var(--accent-primary)" },
    { label: "Générique",     pct: 10, color: "var(--accent-primary)" },
    { label: "URL nue",       pct: 20, color: "var(--color-success)" },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* 3 chiffres clés */}
      <KpiGroup columns={3}>
        <KpiCard bare icon={ShieldCheck} label="Backlinks"        value="0" valueColor="var(--color-danger)" sub="médiane SERP : 320" />
        <KpiCard bare icon={Award}       label="DR (Domain Rating)" value="34" sub="médiane SERP : 78" />
        <KpiCard bare icon={Trophy}      label="Position TF"      value="11ᵉ" sub="vs concurrents top SERP" />
      </KpiGroup>

      {/* Benchmark SERP — même pattern que les autres tableaux concurrents */}
      <div className="flex flex-col gap-3">
        <p className="text-[16px] font-semibold tracking-subheading text-[var(--text-primary)]">Benchmark SERP</p>
        <TableWide<SerpRow>
          columns={serpColumns}
          data={serpBenchmark}
          rowKey={(r) => r.domain}
          isRowActive={(r) => !!r.isYou}
          minWidth={900}
          bordered
          edgePadding="24px"
          hidePagination
        />
      </div>

      {/* Backlinks de cette page — section dédiée, distincte du profil d'ancres */}
      <div>
        <p className="mb-5 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Backlinks de cette page</p>
        <div className="rounded-2xl border border-[var(--border-subtle)] p-6">
          {(() => {
            const ownBacklinks = 0;
            const competitorBls = serpBenchmark.filter((r) => !r.isYou);
            const avg = Math.round(competitorBls.reduce((s, r) => s + r.bl, 0) / Math.max(1, competitorBls.length));
            const maxBl = Math.max(...competitorBls.map((r) => r.bl), 1);
            return (
              <>
                {/* 2 chiffres clés en grille */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[var(--border-subtle)] p-4">
                    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">Total</p>
                    <p className="mt-1 text-[28px] font-semibold tabular-nums leading-none text-[var(--text-primary)]">
                      {ownBacklinks.toLocaleString("fr-FR")}
                    </p>
                    <p className="mt-1.5 text-[11px] tracking-caption text-[var(--text-muted)]">
                      backlinks pointant vers cette URL
                    </p>
                  </div>
                  <div className="rounded-xl border border-[var(--border-subtle)] p-4">
                    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">Moyenne concurrents</p>
                    <p className="mt-1 text-[28px] font-semibold tabular-nums leading-none text-[var(--text-primary)]">
                      {avg.toLocaleString("fr-FR")}
                    </p>
                    <p className="mt-1.5 text-[11px] tracking-caption text-[var(--text-muted)]">
                      quantité moyenne · {competitorBls.length} concurrents top SERP
                    </p>
                  </div>
                </div>

                {/* Comparaison visuelle vs concurrents */}
                <div className="mt-5 space-y-2">
                  <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">Comparaison</p>
                  {[{ domain: "votre-site.fr", bl: ownBacklinks, isYou: true }, ...competitorBls].map((row) => {
                    const pct = (row.bl / maxBl) * 100;
                    return (
                      <div key={row.domain} className="grid grid-cols-[140px_1fr_60px] items-center gap-3">
                        <span className={`truncate text-[12px] ${row.isYou ? "font-semibold text-[var(--accent-primary)]" : "text-[var(--text-secondary)]"}`}>{row.domain}</span>
                        <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: row.isYou ? "var(--accent-primary)" : "color-mix(in oklab, var(--text-secondary) 30%, transparent)",
                            }}
                          />
                        </div>
                        <span className="text-right text-[12px] font-semibold tabular-nums text-[var(--text-primary)]">
                          {row.bl.toLocaleString("fr-FR")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Profil d'ancres — section distincte, cibles de répartition recommandées */}
      <div>
        <p className="mb-1 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Profil d'ancres</p>
        <p className="mb-4 text-[12px] tracking-caption text-[var(--text-muted)]">
          Cibles de répartition recommandées pour vos futurs backlinks
        </p>
        <div className="rounded-2xl border border-[var(--border-subtle)] p-6 space-y-2.5">
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
                    <span className="text-[var(--color-warning)] text-[12px]">{"★".repeat(t.fit)}{"☆".repeat(5 - t.fit)}</span>
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

      {/* Actions recommandées — grille de cards */}
      <section className="rounded-2xl border border-[var(--border-subtle)] p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <p className="text-[16px] font-semibold tracking-subheading text-[var(--text-primary)]">Actions recommandées</p>
          <p className="text-[12px] tabular-nums text-[var(--text-muted)]">{doneCount}/{actions.length} faites</p>
        </div>
        <div className="flex flex-col gap-2">
          {actions.map((a) => (
            <ActionCard
              key={a.id}
              priority={a.priority}
              title={a.title}
              time={a.time}
              impact={a.impact ? `Impact ${a.impact}` : undefined}
              status={getStatus(a.id)}
              onStatusChange={(s) => setStatus(a.id, s)}
              owner={a.owner}
              ownerCandidates={ALL_OWNERS}
              onOwnerChange={(o) => setOwner(a.id, o)}
              deadline={a.deadline}
              onDeadlineChange={(d) => setDeadline(a.id, d)}
              recurrence={a.recurrence}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function TechniqueTab({ brief, actions, getStatus, setStatus, setOwner, setDeadline }: TabProps) {
  void brief;
  const doneCount = actions.filter((a) => getStatus(a.id) === "done").length;
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  // Score Lighthouse mockés par device (typique : desktop > mobile)
  const deviceScores = { desktop: 78, mobile: 52 };

  // Core Web Vitals par device — mobile généralement moins bon
  const cwvByDevice = {
    desktop: [
      { label: "LCP",  value: "3.90s",  threshold: "< 2.5s",  ok: false },
      { label: "FCP",  value: "3.75s",  threshold: "< 1.8s",  ok: false },
      { label: "CLS",  value: "0.08",   threshold: "< 0.1",   ok: true  },
      { label: "TTFB", value: "53ms",   threshold: "< 800ms", ok: true  },
    ],
    mobile: [
      { label: "LCP",  value: "5.20s",  threshold: "< 2.5s",  ok: false },
      { label: "FCP",  value: "4.80s",  threshold: "< 1.8s",  ok: false },
      { label: "CLS",  value: "0.14",   threshold: "< 0.1",   ok: false },
      { label: "TTFB", value: "180ms",  threshold: "< 800ms", ok: true  },
    ],
  };
  const cwv = cwvByDevice[device];

  const auditItems = [
    { label: "Code statut",      value: "200 OK",        ok: true  },
    { label: "Balise title",     value: "Optimisée",     ok: true  },
    { label: "Temps de charg.",  value: device === "mobile" ? "5.2s" : "3.9s",  ok: false },
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

  const errCount = auditItems.filter((a) => !a.ok).length;

  return (
    <div className="flex flex-col gap-8">

      {/* Switch device — segmented pill iOS-like (inspiré Vercel Speed Insights) */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">
          Audit Lighthouse
        </p>
        <div
          role="tablist"
          aria-label="Choisir l'appareil"
          className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-subtle)] p-1"
        >
          {(["desktop", "mobile"] as const).map((dev) => {
            const score = deviceScores[dev];
            const active = device === dev;
            const Icon = dev === "desktop" ? Monitor : Smartphone;
            const scoreColor = score >= 70 ? "var(--color-success)" : score >= 40 ? "var(--color-warning)" : "var(--color-danger)";
            return (
              <button
                key={dev}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setDevice(dev)}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
                  active
                    ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{dev === "desktop" ? "Desktop" : "Mobile"}</span>
                <span
                  className="font-semibold tabular-nums"
                  style={{ color: active ? scoreColor : "var(--text-muted)" }}
                >
                  {score}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3 chiffres clés — données dépendantes du device */}
      <KpiGroup columns={3}>
        <KpiCard bare icon={Gauge}         label="LCP"             value={cwv[0].value} valueColor="var(--color-danger)" sub="cible < 2,5s" />
        <KpiCard bare icon={Activity}      label="Score audit"     value={`${auditItems.length - errCount}/${auditItems.length}`} sub="checks OK" />
        <KpiCard bare icon={ShieldCheck}   label="Erreurs critiques" value={String(errCount)} valueColor="var(--color-danger)" sub="à corriger" />
      </KpiGroup>

      {/* Audit technique */}
      <div>
        <p className="mb-4 text-[16px] font-semibold tracking-subheading text-[var(--text-primary)]">Audit technique</p>
        <div className="grid grid-cols-2 gap-2">
          {auditItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] px-4 py-3">
              <span className="text-[12px] text-[var(--text-muted)]">{item.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-medium text-[var(--text-secondary)]">{item.value}</span>
                <span className={`text-[11px] ${item.ok ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>{item.ok ? "✓" : "✕"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Core Web Vitals */}
      <div>
        <p className="mb-4 text-[16px] font-semibold tracking-subheading text-[var(--text-primary)]">Core Web Vitals</p>
        <div className="grid grid-cols-2 gap-3">
          {cwv.map((m) => (
            <div key={m.label} className="rounded-2xl border border-[var(--border-subtle)] p-6">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-medium text-[var(--text-muted)]">{m.label}</p>
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-[12px] font-medium ${m.ok ? "bg-[var(--color-success-bg)] text-[var(--color-success)]" : "bg-[var(--color-warning-bg)] text-[var(--color-warning)]"}`}>
                  {m.ok ? "Bon" : "À améliorer"}
                </span>
              </div>
              <p className="mt-1.5 text-[22px] font-semibold tabular-nums text-[var(--text-primary)]">{m.value}</p>
              <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">Seuil : {m.threshold}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Détails on-page — collapsible (Images + Données structurées compactés) */}
      <div>
        <button
          type="button"
          onClick={() => setDetailsOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-2xl border border-[var(--border-subtle)] px-5 py-4 text-left transition-colors hover:bg-[var(--bg-subtle)]"
        >
          <span className="text-[16px] font-semibold tracking-subheading text-[var(--text-primary)]">Détails on-page</span>
          <span className="flex items-center gap-2 text-[12px] text-[var(--text-muted)]">
            Images · Données structurées
            <ChevronDownIcon className={`h-4 w-4 transition-transform ${detailsOpen ? "rotate-180" : ""}`} />
          </span>
        </button>
        {detailsOpen && (
          <div className="mt-3 space-y-4">
            <div>
              <p className="mb-2 text-[13px] font-semibold text-[var(--text-secondary)]">Images</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Total images",    value: "14",    ok: true  },
                  { label: "Format WebP",     value: "21%",   ok: false },
                  { label: "Alt manquants",   value: "5",     ok: false },
                  { label: "Poids total",     value: "1,4 MB", ok: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] px-4 py-3">
                    <span className="text-[12px] text-[var(--text-muted)]">{item.label}</span>
                    <span className={`text-[13px] font-semibold tabular-nums ${item.ok ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-[13px] font-semibold text-[var(--text-secondary)]">Données structurées</p>
              <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)]">
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
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-[12px] font-medium ${item.ok ? "bg-[var(--color-success-bg)] text-[var(--color-success)]" : item.note === "Critique" ? "bg-[var(--color-danger-bg)] text-[var(--color-danger)]" : "bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]"}`}>
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
          </div>
        )}
      </div>

      {/* Actions techniques — grille de cards */}
      <section className="rounded-2xl border border-[var(--border-subtle)] p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <p className="text-[16px] font-semibold tracking-subheading text-[var(--text-primary)]">Actions techniques</p>
          <p className="text-[12px] tabular-nums text-[var(--text-muted)]">{doneCount}/{actions.length} faites</p>
        </div>
        <div className="flex flex-col gap-2">
          {actions.map((a) => (
            <ActionCard
              key={a.id}
              priority={a.priority}
              title={a.title}
              time={a.time}
              impact={a.impact ? `Impact ${a.impact}` : undefined}
              status={getStatus(a.id)}
              onStatusChange={(s) => setStatus(a.id, s)}
              owner={a.owner}
              ownerCandidates={ALL_OWNERS}
              onOwnerChange={(o) => setOwner(a.id, o)}
              deadline={a.deadline}
              onDeadlineChange={(d) => setDeadline(a.id, d)}
              recurrence={a.recurrence}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

/* ── ActionsTab — vue aggrégée toutes actions, format tableau ── */

function ActionsTab({
  actions,
  getStatus,
  setStatus,
  setOwner,
  setDeadline,
}: {
  actions: Action[];
  getStatus: (id: string) => BriefStatus;
  setStatus: (id: string, s: BriefStatus) => void;
  setOwner: (id: string, owner: ActionOwner | undefined) => void;
  setDeadline: (id: string, deadline: string | undefined) => void;
}) {
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<ActionSource | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<ActionPriorityLevel | "all">("all");

  const filtered = actions.filter((a) =>
    (sourceFilter === "all" || a.source === sourceFilter) &&
    (priorityFilter === "all" || a.priority === priorityFilter) &&
    (search === "" || a.title.toLowerCase().includes(search.toLowerCase()))
  );

  const doneCount = filtered.filter((a) => getStatus(a.id) === "done").length;
  const sourceLabel = (s: ActionSource) => ACTION_SOURCE_LABEL[s];
  const hasActiveFilters = search !== "" || sourceFilter !== "all" || priorityFilter !== "all";

  return (
    <div className="flex flex-col gap-6">
      {/* Header — titre + count */}
      <div className="flex items-baseline gap-2">
        <p className="text-[16px] font-semibold tracking-subheading text-[var(--text-primary)]">
          Toutes les actions
        </p>
        <span className="rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 text-[12px] font-medium tabular-nums text-[var(--text-secondary)]">
          {filtered.length}{filtered.length !== actions.length && <span className="text-[var(--text-muted)]"> / {actions.length}</span>}
        </span>
        <span className="text-[12px] tabular-nums text-[var(--text-muted)]">· {doneCount} faites</span>
      </div>

      {/* Toolbar — search + filtres Source / Priorité + reset */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Rechercher une action…" alwaysExpanded />
        <ColPill
          name="Source"
          label={sourceFilter === "all" ? "Source" : sourceLabel(sourceFilter)}
          active={sourceFilter !== "all"}
          value={sourceFilter}
          onChange={(v) => setSourceFilter(v as ActionSource | "all")}
          items={[
            { value: "all",       label: "Toutes" },
            { value: "synthese",  label: "Synthèse" },
            { value: "contenu",   label: "Contenu" },
            { value: "autorite",  label: "Autorité" },
            { value: "technique", label: "Technique" },
          ]}
        />
        <ColPill
          name="Priorité"
          label={priorityFilter === "all" ? "Priorité" : priorityFilter === "high" ? "High" : priorityFilter === "mid" ? "Medium" : "Low"}
          active={priorityFilter !== "all"}
          value={priorityFilter}
          onChange={(v) => setPriorityFilter(v as ActionPriorityLevel | "all")}
          items={[
            { value: "all",  label: "Toutes" },
            { value: "high", label: "High" },
            { value: "mid",  label: "Medium" },
            { value: "low",  label: "Low" },
          ]}
        />
        {hasActiveFilters && (
          <Tooltip label="Réinitialiser les filtres" side="top" portal>
            <button
              onClick={() => { setSearch(""); setSourceFilter("all"); setPriorityFilter("all"); }}
              aria-label="Réinitialiser les filtres"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </Tooltip>
        )}
      </div>

      {/* Liste — ActionCard expandable (cohérent avec les autres onglets) */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border-subtle)] px-4 py-10 text-center text-[13px] text-[var(--text-muted)]">
          Aucune action ne correspond aux filtres.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((a) => (
            <ActionCard
              key={a.id}
              priority={a.priority}
              title={a.title}
              time={a.time}
              impact={a.impact}
              status={getStatus(a.id)}
              onStatusChange={(s) => setStatus(a.id, s)}
              owner={a.owner}
              ownerCandidates={ALL_OWNERS}
              onOwnerChange={(o) => setOwner(a.id, o)}
              deadline={a.deadline}
              onDeadlineChange={(d) => setDeadline(a.id, d)}
              recurrence={a.recurrence}
            />
          ))}
        </div>
      )}

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

  // Source unique des actions (les 4 tabs + le tab Actions partagent ce state)
  const rawActions = getAnalysisActions(brief);
  const [actionStatuses, setActionStatuses] = useState<Record<string, BriefStatus>>({});
  const getActionStatus = (id: string): BriefStatus => actionStatuses[id] ?? "todo";
  const setActionStatus = (id: string, s: BriefStatus) =>
    setActionStatuses((prev) => ({ ...prev, [id]: s }));

  // B1 — édition inline owner + deadline (overrides locaux, persistance en B1b)
  const [actionOwners, setActionOwners] = useState<Record<string, ActionOwner | undefined>>({});
  const [actionDeadlines, setActionDeadlines] = useState<Record<string, string | undefined>>({});
  const setActionOwner = (id: string, owner: ActionOwner | undefined) =>
    setActionOwners((prev) => ({ ...prev, [id]: owner }));
  const setActionDeadline = (id: string, deadline: string | undefined) =>
    setActionDeadlines((prev) => ({ ...prev, [id]: deadline }));

  // Merge des overrides dans les actions (overrides > données mock par défaut)
  const allActions: Action[] = rawActions.map((a) => ({
    ...a,
    owner: a.id in actionOwners ? actionOwners[a.id] : a.owner,
    deadline: a.id in actionDeadlines ? actionDeadlines[a.id] : a.deadline,
  }));

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
        {/* Top row — Retour + fil d'ariane (gauche) · nav/close (droite) */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {onBack ? (
              <Tooltip label="Retour à la page" side="right" portal>
                <button
                  onClick={onBack}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </button>
              </Tooltip>
            ) : null}
            {/* Fil d'ariane — Titre de la page > Analyse du X (quand analysedAt présent) */}
            <nav className="flex min-w-0 items-center gap-2 text-[14px]">
              <span className="truncate font-semibold text-[var(--text-primary)]" title={brief.title}>{brief.title}</span>
              {brief.analysedAt && (
                <>
                  <ChevronRightIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--text-muted)]" />
                  <span className="flex-shrink-0 text-[var(--text-secondary)]">Analyse du {formatAnalysisDate(brief.analysedAt)}</span>
                </>
              )}
            </nav>
          </div>
          <div className="flex flex-shrink-0 items-center gap-1">
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

        {/* Tab switcher — pattern unifié avec audit / seo (h-14, underline statique).
            Pas de border-b ici : le parent header en a déjà une. */}
        <div className="relative flex h-14 items-center gap-1">
          {DRAWER_TABS.map(({ key, label }) => {
            const isActive = tab === key;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`relative flex h-full cursor-pointer items-center px-3 text-[14px] font-semibold tracking-tight transition-colors ${isActive ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
              >
                {label}
                {isActive && (
                  <span className="pointer-events-none absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-accent-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-12 py-10">
        {tab === "synthese"  && <SyntheseTab  brief={brief} actions={allActions.filter(a => a.source === "synthese")}  getStatus={getActionStatus} setStatus={setActionStatus} setOwner={setActionOwner} setDeadline={setActionDeadline} />}
        {tab === "contenu"   && <ContenuTab   brief={brief} actions={allActions.filter(a => a.source === "contenu")}   getStatus={getActionStatus} setStatus={setActionStatus} setOwner={setActionOwner} setDeadline={setActionDeadline} />}
        {tab === "autorite"  && <AutoriteTab  brief={brief} actions={allActions.filter(a => a.source === "autorite")}  getStatus={getActionStatus} setStatus={setActionStatus} setOwner={setActionOwner} setDeadline={setActionDeadline} />}
        {tab === "technique" && <TechniqueTab brief={brief} actions={allActions.filter(a => a.source === "technique")} getStatus={getActionStatus} setStatus={setActionStatus} setOwner={setActionOwner} setDeadline={setActionDeadline} />}
        {tab === "actions"   && <ActionsTab   actions={allActions} getStatus={getActionStatus} setStatus={setActionStatus} setOwner={setActionOwner} setDeadline={setActionDeadline} />}
      </div>
    </>
  );
}

/* ── AnalyseLaunchModal ───────────────────────────────────────────────── */

function AnalyseModeOption({
  checked,
  onClick,
  title,
  description,
}: {
  checked: boolean;
  onClick: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${
        checked
          ? "border-[var(--accent-primary)] bg-[var(--accent-primary-soft)]"
          : "border-[var(--border-subtle)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)]"
      }`}
    >
      <div
        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition-colors ${
          checked
            ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-white"
            : "border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
        }`}
      >
        {checked && <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-medium text-[var(--text-primary)]">{title}</p>
        <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">{description}</p>
      </div>
    </button>
  );
}

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
  onConfirm: (includedIds: number[]) => void;
  onClose: () => void;
}) {
  // Wizard 2 étapes : (1) mode d'analyse → (2) sélection URLs + mots-clés.
  const [step, setStep] = useState<1 | 2>(1);
  const [mode, setMode] = useState<"skip" | "force">("skip");
  // Exclusions calculées à l'arrivée en étape 2 selon le mode choisi.
  const [excluded, setExcluded] = useState<Set<number>>(new Set());
  function goToStep2() {
    const next = mode === "skip"
      ? new Set(briefs.filter((b) => !!b.analysedAt).map((b) => b.id))
      : new Set<number>();
    setExcluded(next);
    setStep(2);
  }
  function toggle(id: number) {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  const includedCount = briefs.length - excluded.size;
  const includedIds = briefs.filter((b) => !excluded.has(b.id)).map((b) => b.id);
  const { phase, requestClose } = useModalTransition(onClose);

  const overlayClass = phase === "open" ? "is-open" : phase === "closing" ? "is-closing" : "";
  const modalClass   = phase === "open" ? "is-open" : phase === "closing" ? "is-closing" : "";

  return createPortal(
    <div
      className={`t-modal-overlay ${overlayClass} fixed inset-0 z-[600] flex items-center justify-center bg-black/40 backdrop-blur-sm`}
      onClick={requestClose}
    >
      <div
        className={`t-modal ${modalClass} relative flex w-[560px] max-h-[80vh] flex-col rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {step === 1 ? (
          <>
            <div className="flex-shrink-0 px-8 pt-6 pb-4 border-b border-[var(--border-subtle)]">
              <Stepper steps={2} current={1} onClose={requestClose} />
              <h2 className="font-semibold text-[var(--text-primary)]">Mode d'analyse</h2>
              <p className="mt-1 text-[13px] text-[var(--text-muted)]">
                Que faire des URLs déjà analysées dans la sélection ?
              </p>
            </div>
            <div className="flex-1 overflow-y-auto px-8 py-5 space-y-2">
              <AnalyseModeOption
                checked={mode === "skip"}
                onClick={() => setMode("skip")}
                title="Ignorer les URLs déjà analysées"
                description="Ne lance l'analyse que sur les URLs jamais analysées."
              />
              <AnalyseModeOption
                checked={mode === "force"}
                onClick={() => setMode("force")}
                title="Forcer la ré-analyse"
                description="Relance l'analyse sur toutes les URLs, y compris celles déjà analysées."
              />
            </div>
            <div className="flex-shrink-0 flex items-center justify-end gap-3 px-8 py-6 border-t border-[var(--border-subtle)]">
              <button
                onClick={requestClose}
                className="rounded-xl px-4 py-2 text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
              >
                Annuler
              </button>
              <Button onClick={goToStep2}>Continuer</Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex-shrink-0 px-8 pt-6 pb-4 border-b border-[var(--border-subtle)]">
              <Stepper steps={2} current={2} onClose={requestClose} />
              <h2 className="font-semibold text-[var(--text-primary)]">Lancer l'analyse</h2>
              <p className="mt-1 text-[13px] text-[var(--text-muted)]">
                Décochez les URLs à exclure et vérifiez le mot-clé cible avant de lancer l'analyse sur {includedCount} URL{includedCount > 1 ? "s" : ""}.
              </p>
            </div>
            <div className="flex-1 overflow-y-auto px-8 py-4 space-y-2">
              {briefs.map((b) => {
                const isIncluded = !excluded.has(b.id);
                return (
                  <div key={b.id} className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggle(b.id)}
                      aria-label={isIncluded ? "Exclure de l'analyse" : "Inclure dans l'analyse"}
                      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition-colors ${
                        isIncluded
                          ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-white"
                          : "border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--border-medium)]"
                      }`}
                    >
                      {isIncluded && <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} />}
                    </button>
                    <div className={`min-w-0 flex-1 transition-opacity ${isIncluded ? "" : "opacity-40"}`}>
                      <p className="truncate text-[13px] font-medium text-[var(--text-primary)]">{b.title}</p>
                      <p className="truncate font-mono text-[11px] text-[var(--text-muted)]">{b.url}</p>
                    </div>
                    <input
                      type="text"
                      value={keywords[b.id] ?? b.keyword}
                      onChange={(e) => onKeywordChange(b.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      disabled={!isIncluded}
                      className="w-[180px] flex-shrink-0 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none transition-opacity focus:border-[var(--accent-primary)] disabled:opacity-40"
                      placeholder="Mot-clé cible"
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex-shrink-0 flex items-center justify-between gap-3 px-8 py-6 border-t border-[var(--border-subtle)]">
              <button
                onClick={() => setStep(1)}
                className="rounded-xl px-4 py-2 text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
              >
                ← Retour
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={requestClose}
                  className="rounded-xl px-4 py-2 text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                >
                  Annuler
                </button>
                <Button onClick={() => onConfirm(includedIds)} disabled={includedCount === 0}>
                  Lancer l'analyse {includedCount > 0 && `(${includedCount})`}
                </Button>
              </div>
            </div>
          </>
        )}
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
            <stop offset="0%" stopColor={complete ? "var(--color-success)" : "var(--bg-subtle)"} stopOpacity={complete ? 0.18 : 1} />
            <stop offset="100%" stopColor={complete ? "var(--color-success)" : "var(--bg-subtle)"} stopOpacity={0} />
          </linearGradient>
        </defs>
        <circle cx={17} cy={17} r={r} fill={`url(#ring-grad-${done}-${total})`} stroke="none" />
        <circle cx={17} cy={17} r={r} fill="none" stroke="var(--border-subtle)" strokeWidth={2} />
        <circle
          cx={17} cy={17} r={r}
          fill="none"
          stroke={complete ? "var(--color-success)" : "var(--accent-primary)"}
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
            <path d="M2 6l3 3 5-5" stroke="var(--color-success)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  );
}

/* ── SparklineEmpty ──────────────────────────────────────────────────── */

function SparklineEmpty() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-4 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-hover)] text-[var(--text-muted)]">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5l4.5-4.5 3 3 4-5L19 10M3 20h18M3 4h18" />
        </svg>
      </div>
      <p className="text-[13px] font-semibold text-[var(--text-primary)]">Pas encore de données</p>
      <p className="mt-1 max-w-[24ch] text-[11px] text-[var(--text-muted)]">
        L'historique apparaîtra après la première analyse.
      </p>
    </div>
  );
}

/* ── PagePanel ───────────────────────────────────────────────────────── */

function PagePanelContent({
  brief,
  briefs,
  keyword,
  tagColor,
  tags,
  tagColors,
  status,
  priority,
  onOpenAnalysis,
  onNavigatePage,
  onClose,
  onTagChange,
  onCreateTag,
}: {
  brief: Brief;
  briefs: Brief[];
  keyword: string;
  tagColor: string;
  tags: string[];
  tagColors: Record<string, string>;
  status: BriefStatus;
  priority: Priority;
  onOpenAnalysis: (b: Brief, histIdx: number) => void;
  onNavigatePage: (b: Brief) => void;
  onClose: () => void;
  onTagChange: (tag: string | null) => void;
  onCreateTag: (name: string) => void;
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

  const [tagModalOpen, setTagModalOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowUp"   && hasPrev) onNavigatePage(briefs[idx - 1]);
      if (e.key === "ArrowDown" && hasNext) onNavigatePage(briefs[idx + 1]);
    }
    if (tagModalOpen) return;
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, onNavigatePage, briefs, idx, hasPrev, hasNext, tagModalOpen]);

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
          <h1 className="font-semibold leading-snug tracking-tight text-[var(--text-primary)]">{brief.title}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full px-2 py-1 text-[12px] font-medium" style={{ color: typeText, backgroundColor: colorBg }}>{label}</span>
          <DropdownMenu
            width={280}
            trigger={
              <button className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-subtle)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-secondary)] transition-opacity hover:opacity-80">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tagColor }} />
                {brief.tag ? shortTag(brief.tag) : "Sans lot"}
              </button>
            }
          >
            <DropdownHeader>Changer de lot</DropdownHeader>
            {tags.map((tag) => (
              <DropdownItem
                key={tag}
                selected={(brief.tag ?? "Sans lot") === tag}
                onClick={() => onTagChange(tag === "Sans lot" ? null : tag)}
              >
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-subtle)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-secondary)]">
                  <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: tagColors[tag] }} />
                  {tag}
                </span>
              </DropdownItem>
            ))}
            <DropdownSeparator />
            <DropdownItem icon={Plus} onClick={() => setTagModalOpen(true)}>
              Créer un nouveau tag
            </DropdownItem>
          </DropdownMenu>
          <span className="rounded-full border border-[var(--border-subtle)] px-3 py-1.5 text-[12px] text-[var(--text-primary)]">{keyword}</span>
          {(() => {
            const panelActions = getAnalysisActions(brief);
            const totalMin = panelActions.reduce((sum, a) => sum + parseTimeToMinutes(a.time), 0);
            if (totalMin === 0) return null;
            return (
              <Tooltip side="top" portal label={`Temps cumulé de toutes les actions de cette analyse (${panelActions.length} actions)`}>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] px-3 py-1.5 text-[12px] text-[var(--text-secondary)]">
                  <Clock className="h-3 w-3" />
                  <span className="font-medium tabular-nums text-[var(--text-primary)]">{formatMinutesLabel(totalMin)}</span>
                  <span>d'actions</span>
                </span>
              </Tooltip>
            );
          })()}
        </div>
      </div>

      {/* Body — 2 columns */}
      <div className="flex flex-1 gap-6 overflow-hidden px-10 py-8">

        {/* Left — données GSC + évolution */}
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto">

          {/* KPI cards — Pos. GSC et Trafic dans les graphiques dédiés ci-dessous */}
          <KpiGroup columns={3}>
            {([
              { label: "CTR",          val: current?.clics != null && current?.impressions ? `${(current.clics / current.impressions * 100).toFixed(1)}%` : "—", delta: null, Icon: Activity },
              { label: "Impressions",  val: current?.impressions != null ? (current.impressions >= 1000 ? `${(current.impressions / 1000).toFixed(1)}k` : String(current.impressions)) : "—", delta: impDelta, Icon: Eye },
              { label: "Volume",       val: brief.volume.toLocaleString(), delta: null,                            Icon: Target },
            ] as { label: string; val: string; delta: number | null; invert?: boolean; Icon: React.ElementType }[]).map(({ label: kl, val, delta, invert, Icon }) => (
              <KpiCard
                bare
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
          </KpiGroup>

          {/* Position GSC + Trafic — deux graphiques séparés côte à côte */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col rounded-2xl border border-[var(--border-subtle)] px-5 pt-5 pb-3">
              <p className="text-[16px] font-semibold tracking-subheading text-[var(--text-primary)]">Position GSC</p>
              <div className="mt-1 mb-4 flex items-center gap-2">
                {current?.positionGsc != null ? (
                  <>
                    <span className="text-[20px] font-semibold leading-none tabular-nums tracking-heading text-[var(--text-primary)]">{current.positionGsc.toFixed(1).replace(".", ",")}</span>
                    {posDelta != null && <DeltaBadge value={posDelta.toFixed(1).replace(".", ",")} positiveIsGood={false} />}
                    {posDelta != null && <span className="text-[12px] tracking-caption text-[var(--text-muted)]">vs préc.</span>}
                  </>
                ) : <span className="text-[14px] text-[var(--text-muted)]">—</span>}
              </div>
              <div className="h-[200px]">
                {history.length >= 2 ? <PositionSparkline history={history} /> : <SparklineEmpty />}
              </div>
            </div>
            <div className="flex flex-col rounded-2xl border border-[var(--border-subtle)] px-5 pt-5 pb-3">
              <p className="text-[16px] font-semibold tracking-subheading text-[var(--text-primary)]">Trafic</p>
              <div className="mt-1 mb-4 flex items-center gap-2">
                {current?.clics != null ? (
                  <>
                    <span className="text-[20px] font-semibold leading-none tabular-nums tracking-heading text-[var(--text-primary)]">{current.clics.toLocaleString("fr-FR")}</span>
                    {clicsDelta != null && <DeltaBadge value={`${clicsDelta > 0 ? "+" : ""}${clicsDelta}`} positiveIsGood />}
                    {clicsDelta != null && <span className="text-[12px] tracking-caption text-[var(--text-muted)]">vs préc.</span>}
                  </>
                ) : <span className="text-[14px] text-[var(--text-muted)]">—</span>}
              </div>
              <div className="h-[200px]">
                {(history.length >= 2 && history.some((h) => h.clics != null)) ? <TrafficSparkline history={history} /> : <SparklineEmpty />}
              </div>
            </div>
          </div>
        </div>

        {/* Right — historique des analyses */}
        <div className="w-[340px] flex-shrink-0 flex flex-col gap-5 rounded-2xl border border-[var(--border-subtle)] p-5">
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

      {tagModalOpen && (
        <CreateTagModal
          existingTags={tags}
          onCancel={() => setTagModalOpen(false)}
          onCreate={(name) => { onCreateTag(name); setTagModalOpen(false); }}
        />
      )}
    </>
  );
}

/* ── CreateTagModal — petite modal pour créer un nouveau tag ─────────── */

function CreateTagModal({
  existingTags,
  onCancel,
  onCreate,
}: {
  existingTags: string[];
  onCancel: () => void;
  onCreate: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const trimmed = name.trim();
  const exists = existingTags.includes(trimmed);
  const canSubmit = trimmed.length > 0 && !exists;
  const { phase, requestClose } = useModalTransition(onCancel);

  if (typeof document === "undefined") return null;
  const overlayClass = phase === "open" ? "is-open" : phase === "closing" ? "is-closing" : "";
  const modalClass   = phase === "open" ? "is-open" : phase === "closing" ? "is-closing" : "";

  return createPortal(
    <div
      className={`t-modal-overlay ${overlayClass} fixed inset-0 z-[1200] flex items-center justify-center bg-black/40 backdrop-blur-sm`}
      onClick={(e) => e.target === e.currentTarget && requestClose()}
    >
      <div className={`t-modal ${modalClass} relative w-full max-w-[420px] rounded-3xl bg-[var(--modal-bg)] p-7 shadow-[var(--shadow-floating)]`}>
        <button
          onClick={requestClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <h3 className="mb-1.5 font-semibold tracking-subheading text-[var(--text-primary)]">
          Créer un nouveau tag
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
          <p className="mt-2 text-[12px] text-[var(--color-danger)]">Ce lot existe déjà.</p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" size="md" onClick={onCancel}>Annuler</Button>
          <Button variant="primary" size="md" onClick={() => onCreate(trimmed)} disabled={!canSubmit}>
            Créer le tag
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
  tagColor,
  tags,
  tagColors,
  status,
  priority,
  analysis,
  onOpenAnalysis,
  onNavigatePage,
  onClose,
  onCloseAnalysis,
  onStatusChange,
  onPriorityChange,
  onTagChange,
  onCreateTag,
}: {
  brief: Brief;
  briefs: Brief[];
  briefKeyword: string;
  tagColor: string;
  tags: string[];
  tagColors: Record<string, string>;
  status: BriefStatus;
  priority: Priority;
  analysis: Brief | null;
  onOpenAnalysis: (b: Brief) => void;
  onNavigatePage: (b: Brief) => void;
  onClose: () => void;
  onCloseAnalysis: () => void;
  onStatusChange: (s: BriefStatus) => void;
  onPriorityChange: (p: Priority) => void;
  onTagChange: (tag: string | null) => void;
  onCreateTag: (name: string) => void;
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
        className={`fixed inset-y-0 right-0 z-[60] flex w-[960px] max-w-[95vw] flex-col border-l border-[var(--border-subtle)] bg-[var(--bg-primary)] shadow-2xl transition-all duration-[320ms] ease-out ${visible && !closing ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}`}
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
              tagColor={tagColor}
              tags={tags}
              tagColors={tagColors}
              status={status}
              priority={priority}
              onOpenAnalysis={onOpenAnalysis}
              onNavigatePage={onNavigatePage}
              onClose={handleClose}
              onTagChange={onTagChange}
              onCreateTag={onCreateTag}
            />
        }
      </div>
    </div>
    </>,
    document.body
  );
}

/* ── BriefsView ──────────────────────────────────────────────────────── */

export function BriefsView({
  initialBriefUrl,
  onPendingHandled,
}: {
  /** When provided, opens the matching brief's SidePanel on mount/change */
  initialBriefUrl?: string | null;
  /** Called after the panel opens, so the parent can clear its pending state */
  onPendingHandled?: () => void;
} = {}) {

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

  // Open the SidePanel for a brief whose URL matches the parent-provided pending URL.
  useEffect(() => {
    if (!initialBriefUrl) return;
    const target = briefs.find((b) => b.url === initialBriefUrl);
    if (target) {
      setActiveBrief(target);
      setActiveAnalysis(null);
    }
    onPendingHandled?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBriefUrl]);
  const [briefKeywords, setBriefKeywords] = useState<Record<number, string>>({});
  const [analyseLaunchOpen, setAnalyseLaunchOpen] = useState(false);
  // Briefs ciblés par l'AnalyseLaunchModal — soit la sélection courante,
  // soit toutes les URLs filtrées quand on lance depuis le CTA "Analyser" du header.
  const [analyseTargets, setAnalyseTargets] = useState<Brief[]>([]);
  const [briefStatuses, setBriefStatuses] = useState<Record<number, BriefStatus>>({});
  function toggleStatus(id: number, next: BriefStatus) {
    setBriefStatuses((prev) => ({ ...prev, [id]: next }));
  }
  const [briefPriorities, setBriefPriorities] = useState<Record<number, Priority>>({});
  function setPriority(id: number, next: Priority) {
    setBriefPriorities((prev) => ({ ...prev, [id]: next }));
  }

  const [tagColors, setTagColors] = useState<Record<string, string>>({
    "Lot SEO — Optimisation Q2":  "#3B82F6",
    "Lot Création — Blog expert": "var(--color-success)",
    "Lot GEO — Structured data":  "#A855F7",
    "Sans lot":                   "#64748B",
  });
  function setTagColor(tag: string, color: string) {
    setTagColors((prev) => ({ ...prev, [tag]: color }));
  }

  function changeBriefTag(id: number, tag: string | null) {
    setBriefs((prev) => prev.map((b) => (b.id === id ? { ...b, tag: tag ?? undefined } : b)));
    setActiveBrief((prev) => (prev?.id === id ? { ...prev, tag: tag ?? undefined } : prev));
  }

  const TAG_PALETTE = ["#3B82F6", "var(--color-success)", "#A855F7", "var(--color-warning)", "#EC4899", "#14B8A6", "#EAB308", "var(--accent-primary)"];
  function createTagAndAssign(name: string, briefId: number) {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!tagColors[trimmed]) {
      const used = new Set(Object.values(tagColors));
      const color = TAG_PALETTE.find((c) => !used.has(c)) ?? TAG_PALETTE[Math.floor(Math.random() * TAG_PALETTE.length)];
      setTagColors((prev) => ({ ...prev, [trimmed]: color }));
    }
    changeBriefTag(briefId, trimmed);
  }

  const [colType,     setColType]     = useState<BriefType | "all">("all");
  const [colPriority, setColPriority] = useState<Priority | "all">("all");
  const [colStatut,   setColStatut]   = useState<BriefStatus | "all">("all");
  const [colTag,      setColTag]      = useState("all");

  // Tri sur les colonnes chiffrables — clic sur header cycle asc → desc → off
  type SortKey = "position" | "volume" | "trafic" | "ctr" | "effort" | "score" | "analyse";
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  function toggleSort(key: SortKey) {
    if (sortKey !== key) { setSortKey(key); setSortDir("desc"); return; }
    if (sortDir === "desc") { setSortDir("asc"); return; }
    setSortKey(null);
  }

  const hasActiveFilters =
    colType !== "all" || colPriority !== "all" || colStatut !== "all" || colTag !== "all";

  function resetFilters() {
    setColType("all");
    setColPriority("all");
    setColStatut("all");
    setColTag("all");
  }

  function assignTag(tag: string | null) {
    setBriefs((prev) => prev.map((b) => selected.has(b.id) ? { ...b, tag: tag ?? undefined } : b));
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

  const filtered = (() => {
    const base = briefs.filter((b) => {
      if (colType !== "all" && b.type !== colType) return false;
      if (search && !b.title.toLowerCase().includes(search.toLowerCase()) && !b.keyword.toLowerCase().includes(search.toLowerCase())) return false;
      if (colPriority !== "all" && b.priority !== colPriority) return false;
      const statut = briefStatuses[b.id] ?? "todo";
      if (colStatut !== "all" && statut !== colStatut) return false;
      if (colTag === "__none__" && b.tag) return false;
      if (colTag !== "all" && colTag !== "__none__" && b.tag !== colTag) return false;
      return true;
    });
    if (!sortKey) return base;
    const mult = sortDir === "asc" ? 1 : -1;
    const getVal = (b: Brief): number => {
      switch (sortKey) {
        case "position": return b.position ?? 9999;
        case "volume":   return b.volume;
        case "trafic":   return b.clics ?? -1;
        case "ctr":      return (b.clics != null && b.impressions) ? (b.clics / b.impressions) * 100 : -1;
        case "effort":   return estimateEffortHours(b);
        case "score":    return b.semanticScore;
        case "analyse":  return b.analysedAt ? new Date(b.analysedAt).getTime() : -1;
      }
    };
    return [...base].sort((a, b) => (getVal(a) - getVal(b)) * mult);
  })();

  const allSelected = filtered.length > 0 && filtered.every((b) => selected.has(b.id));
  const someSelected = filtered.some((b) => selected.has(b.id));
  const selectedCount = filtered.filter((b) => selected.has(b.id)).length;

  /* ── Pagination ── */
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [filtered.length, pageSize]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageStart = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const pageEnd = Math.min(safePage * pageSize, filtered.length);
  const pageBriefs = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

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


  return (
    <div className="animate-fade-in">

      {/* ── Header — H2 + count badge à gauche, CTA Analyser à droite ── */}
      <div className="mb-4 flex items-center justify-between gap-4 px-[var(--page-px)]">
        <div className="flex items-baseline gap-2">
          <h1 className="font-semibold leading-none tracking-heading text-[var(--text-primary)]">URLs</h1>
          <span className="rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 text-[12px] font-medium tabular-nums text-[var(--text-secondary)]">
            {filtered.length.toLocaleString("fr-FR")}
            {hasActiveFilters && filtered.length !== briefs.length && (
              <span className="text-[var(--text-muted)]"> / {briefs.length.toLocaleString("fr-FR")}</span>
            )}
          </span>
        </div>
        <Button
          onClick={() => { setAnalyseTargets(filtered); setAnalyseLaunchOpen(true); }}
          disabled={filtered.length === 0}
        >
          Analyser
        </Button>
      </div>

      {/* ── Toolbar — search + filtres dropdown (Tag, Origine, Priorité, Statut) ── */}
      <div className="mb-4 flex flex-wrap items-center gap-3 px-[var(--page-px)]">
        <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un brief…" alwaysExpanded />
        <ColPill
          name="Lot"
          label={colTag === "all" ? "Tag" : colTag === "__none__" ? "Sans lot" : colTag.replace(/^Tag\s+/, "")}
          active={colTag !== "all"}
          value={colTag}
          onChange={setColTag}
          items={[
            { value: "all",                        label: "Tous les tags" },
            { value: "Lot SEO — Optimisation Q2",  label: "SEO — Optimisation Q2" },
            { value: "Lot Création — Blog expert", label: "Création — Blog expert" },
            { value: "Lot GEO — Structured data",  label: "GEO — Structured data" },
            { value: "__none__",                   label: "Sans lot" },
          ]}
        />
        <ColPill
          name="Origine"
          label={colType === "all" ? "Origine" : TYPE_CONFIG[colType].label}
          active={colType !== "all"}
          value={colType}
          onChange={(v) => setColType(v as BriefType | "all")}
          items={[
            { value: "all",       label: "Toutes les origines" },
            { value: "optimiser", label: "Optimiser" },
            { value: "combler",   label: "Gap GSC" },
            { value: "creer",     label: "De zéro" },
          ]}
        />
        <ColPill
          name="Priorité"
          label={colPriority === "all" ? "Priorité" : PRIORITY_CONFIG[colPriority].label}
          active={colPriority !== "all"}
          value={colPriority}
          onChange={(v) => setColPriority(v as Priority | "all")}
          items={[
            { value: "all",     label: "Toutes" },
            { value: "haute",   label: "Haute" },
            { value: "moyenne", label: "Moyenne" },
            { value: "basse",   label: "Basse" },
          ]}
        />
        <ColPill
          name="Statut"
          label={colStatut === "all" ? "Statut" : STATUS_CONFIG[colStatut].label}
          active={colStatut !== "all"}
          value={colStatut}
          onChange={(v) => setColStatut(v as BriefStatus | "all")}
          items={[
            { value: "all",   label: "Tous" },
            { value: "todo",  label: "À faire" },
            { value: "in_progress", label: "En cours" },
            { value: "done",  label: "Terminé" },
          ]}
        />
        {hasActiveFilters && (
          <Tooltip label="Réinitialiser les filtres" side="top" portal>
            <button
              onClick={resetFilters}
              aria-label="Réinitialiser les filtres"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </Tooltip>
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

            {/* Assigner un tag */}
            <DropdownMenu
              upward
              width="auto"
              trigger={
                <button className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-[14px] font-medium transition-colors hover:bg-[var(--floating-bar-hover)]" style={{ color: "var(--floating-bar-text)" }}>
                  <FolderOpenIcon className="h-4 w-4" />Assigner un tag
                </button>
              }
            >
              <DropdownHeader>Choisir un tag</DropdownHeader>
              {Object.keys(tagColors).map((tag) => (
                <DropdownItem key={tag} onClick={() => assignTag(tag === "Sans lot" ? null : tag)}>
                  <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: tagColors[tag] }} />
                  {tag}
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
              onClick={() => { setAnalyseTargets(selectedBriefs); setAnalyseLaunchOpen(true); }}
              className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-[14px] font-medium transition-colors hover:bg-[var(--floating-bar-hover)]"
              style={{ color: "var(--floating-bar-text)" }}
            >
              <ArrowPathIcon className="h-4 w-4" />Lancer l'analyse
            </button>

            <div className="h-4 w-px" style={{ backgroundColor: "var(--floating-bar-sep)" }} />

            {/* Supprimer */}
            <button
              onClick={deleteSelected}
              className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-[14px] font-medium text-[var(--color-danger)] transition-colors hover:bg-[rgba(225,29,72,0.12)]"
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

      {/* ── Sticky column header — labels statiques + tri sur colonnes chiffrables ── */}
      <div className="sticky top-0 z-[15] overflow-hidden border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]">
        <div ref={headerInnerRef} style={{ minWidth: 2150 }} className="flex h-10 items-center gap-3 pl-[var(--page-px)] pr-4">
            <Checkbox checked={allSelected} indeterminate={someSelected && !allSelected} onChange={toggleAll} />
            <ColHeader width={200}>Page</ColHeader>
            <ColHeader width={130}>Mot-clé</ColHeader>
            <ColHeader width={110}>Origine</ColHeader>
            <SortHeader width={110} sortKey={sortKey} sortDir={sortDir} k="position" onClick={() => toggleSort("position")}>Position</SortHeader>
            <SortHeader width={80}  sortKey={sortKey} sortDir={sortDir} k="volume"   onClick={() => toggleSort("volume")}>Volume</SortHeader>
            <SortHeader width={200} sortKey={sortKey} sortDir={sortDir} k="trafic"   onClick={() => toggleSort("trafic")}>Trafic</SortHeader>
            <SortHeader width={110} sortKey={sortKey} sortDir={sortDir} k="ctr"      onClick={() => toggleSort("ctr")}>CTR</SortHeader>
            <ColHeader width={110}>Priorité</ColHeader>
            <SortHeader width={80}  sortKey={sortKey} sortDir={sortDir} k="effort"   onClick={() => toggleSort("effort")}>Effort</SortHeader>
            <ColHeader width={200}>Lot</ColHeader>
            <SortHeader width={130} sortKey={sortKey} sortDir={sortDir} k="analyse"  onClick={() => toggleSort("analyse")}>Analyse</SortHeader>
            <ColHeader width={100}>Statut</ColHeader>
            <div className="w-12 flex-shrink-0 min-w-0" />
            <SortHeader width={64}  sortKey={sortKey} sortDir={sortDir} k="score"    onClick={() => toggleSort("score")}>Score</SortHeader>
            <div className="sticky right-0 w-16 flex-shrink-0 min-w-0 bg-[var(--bg-subtle)]" />
        </div>
      </div>

      {/* ── Body — horizontal scroll only (synced with sticky header).
          Empty state : rendu HORS du wrapper minWidth pour qu'il soit centré
          sur la largeur du viewport (pas sur les 1910px du body). ── */}
      <div ref={bodyScrollRef} onScroll={handleBodyScroll} className="overflow-x-auto">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<DocumentTextIcon className="h-6 w-6" />}
            title="Aucun brief trouvé"
            description={search ? `Aucun résultat pour « ${search} »` : "Aucun brief dans cette catégorie."}
          />
        ) : (
          <div style={{ minWidth: 2150 }}>
            {pageBriefs.map((brief, i) => {
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
                    className={`group relative w-full text-left transition-colors ${i < pageBriefs.length - 1 ? "border-b border-[var(--border-subtle)]" : ""} ${isActive ? "bg-[var(--bg-card-hover)]" : "hover:bg-[var(--bg-card-hover)]"}`}
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
                        className="w-full truncate rounded-md border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-3 py-1.5 text-[12px] text-[var(--text-secondary)] outline-none transition-colors hover:bg-[var(--bg-card-hover)] focus:border-[var(--accent-primary)] focus:bg-[var(--bg-secondary)]"
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

                    {/* Position SERP + delta pill (vs analyse précédente) */}
                    <div className="w-[110px] flex-shrink-0 min-w-0">
                      {brief.position ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[13px] font-semibold tabular-nums text-[var(--text-primary)]">
                            #{brief.position}
                          </span>
                          {brief.positionDelta != null && brief.positionDelta !== 0 && (() => {
                            // negatif = gain de position (meilleur), positif = perte
                            const isGain = brief.positionDelta < 0;
                            const abs = Math.abs(brief.positionDelta);
                            const color = isGain ? "var(--color-success)" : "var(--color-danger)";
                            return (
                              <span
                                className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
                                style={{
                                  color,
                                  backgroundColor: `color-mix(in oklab, ${color} 12%, transparent)`,
                                }}
                              >
                                {isGain ? "↑" : "↓"}{abs.toFixed(abs < 10 ? 1 : 0)}
                              </span>
                            );
                          })()}
                        </div>
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
                        const trendColor = "var(--accent-primary)";
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
                                    <span className="font-semibold tabular-nums">{brief.clics!.toLocaleString("fr-FR")}{brief.clicsDelta != null && <span className={`ml-1.5 text-[11px] ${isUp ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>{isUp ? "+" : ""}{brief.clicsDelta}</span>}</span>
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
                                      <span className="font-semibold tabular-nums">{brief.positionGsc.toFixed(1)}{brief.positionDelta != null && <span className={`ml-1.5 text-[11px] ${brief.positionDelta < 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>{brief.positionDelta > 0 ? "+" : ""}{brief.positionDelta.toFixed(1)}</span>}</span>
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

                    {/* CTR — réel + pill gap inline (même style que Position) */}
                    <div className="w-[110px] flex-shrink-0 min-w-0">
                      {(() => {
                        if (brief.clics == null || brief.impressions == null || !brief.impressions) {
                          return <span className="text-[13px] text-[var(--text-muted)]">—</span>;
                        }
                        const ctrReel = (brief.clics / brief.impressions) * 100;
                        const ctrAttendu = expectedCtrFromPosition(brief.position);
                        const gap = ctrAttendu != null ? ctrReel - ctrAttendu : null;
                        const sousPerf = gap != null && gap < 0;
                        const color = sousPerf ? "var(--color-danger)" : "var(--color-success)";
                        return (
                          <Tooltip
                            side="top"
                            rich
                            portal
                            label={
                              <div className="flex flex-col gap-1">
                                <p className="font-semibold">CTR</p>
                                <div className="flex items-center justify-between gap-4"><span className="opacity-70">Réel</span><span className="font-semibold tabular-nums">{ctrReel.toFixed(1)}%</span></div>
                                {ctrAttendu != null && (
                                  <div className="flex items-center justify-between gap-4"><span className="opacity-70">Attendu</span><span className="font-semibold tabular-nums">{ctrAttendu.toFixed(1)}%</span></div>
                                )}
                                {gap != null && (
                                  <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-1 mt-0.5"><span className="opacity-70">Gap</span><span className="font-semibold tabular-nums" style={{ color: sousPerf ? "#f87171" : "#34d399" }}>{gap > 0 ? "+" : ""}{gap.toFixed(1)}pts</span></div>
                                )}
                              </div>
                            }
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="text-[13px] font-semibold tabular-nums text-[var(--text-primary)]">{ctrReel.toFixed(1)}%</span>
                              {gap != null && gap !== 0 && (
                                <span
                                  className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
                                  style={{
                                    color,
                                    backgroundColor: `color-mix(in oklab, ${color} 12%, transparent)`,
                                  }}
                                >
                                  {sousPerf ? "↓" : "↑"}{Math.abs(gap).toFixed(1)}
                                </span>
                              )}
                            </div>
                          </Tooltip>
                        );
                      })()}
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

                    {/* Effort — durée estimée (texte simple) */}
                    <div className="w-[80px] flex-shrink-0 min-w-0">
                      {(() => {
                        const h = estimateEffortHours(brief);
                        return (
                          <Tooltip side="top" portal label={`${h}h estimées pour livrer cette analyse`}>
                            <span className="text-[13px] font-medium tabular-nums text-[var(--text-secondary)]">
                              {h}h
                            </span>
                          </Tooltip>
                        );
                      })()}
                    </div>

                    {/* Lot — chip large, label complet sans crop */}
                    <div className="w-[200px] flex-shrink-0 min-w-0">
                      <div onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu
                          width={240}
                          trigger={brief.tag ? (
                            <button
                              type="button"
                              className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-[var(--bg-subtle)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
                            >
                              <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: tagColors[brief.tag] ?? "#64748B" }} />
                              <span className="whitespace-nowrap">{shortTag(brief.tag)}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[12px] font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                            >
                              + Ajouter un lot
                            </button>
                          )}
                        >
                          <DropdownHeader>Changer de lot</DropdownHeader>
                          {Object.keys(tagColors).map((tag) => (
                            <DropdownItem
                              key={tag}
                              onClick={() => changeBriefTag(brief.id, tag === "Sans lot" ? null : tag)}
                              selected={brief.tag === tag}
                            >
                              <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: tagColors[tag] }} />
                              {tag}
                            </DropdownItem>
                          ))}
                          {brief.tag && (
                            <>
                              <DropdownSeparator />
                              <DropdownItem danger onClick={() => changeBriefTag(brief.id, null)}>
                                Retirer le tag
                              </DropdownItem>
                            </>
                          )}
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Analyse — version + date */}
                    <div className="w-[130px] flex-shrink-0 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 flex-shrink-0 rounded-full"
                          style={{
                            backgroundColor: !analyseLabel
                              ? "var(--text-muted)"
                              : (brief.analysisCount && brief.analysisCount > 1 ? "var(--color-success)" : "var(--color-warning)"),
                          }}
                        />
                        {analyseLabel ? (
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-semibold text-[var(--text-primary)]">
                              Analyse {brief.analysisCount ?? 1}
                            </p>
                            <p className="truncate text-[11px] tracking-caption text-[var(--text-muted)]">
                              {analyseLabel}
                            </p>
                          </div>
                        ) : (
                          <span className="truncate text-[13px] font-medium text-[var(--text-muted)]">
                            Pas encore analysée
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Statut — workflow actions (à faire / en cours / fait) — colocalisé avec l'analyse */}
                    <div className="w-[100px] flex-shrink-0 min-w-0">
                      <div onClick={(e) => e.stopPropagation()}>
                        <StatusPillDropdown
                          status={briefStatuses[brief.id] ?? "todo"}
                          onChange={(next) => toggleStatus(brief.id, next)}
                        />
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
              })}
          </div>
        )}
      </div>

      {/* ── Pagination — sticky bottom of viewport ── */}
      <div className="sticky bottom-0 z-30 flex items-center justify-between gap-4 border-t border-[var(--border-subtle)] bg-[var(--bg-primary)]/95 px-[var(--page-px)] py-3 backdrop-blur">
        <span className="text-[12px] tabular-nums text-[var(--text-muted)]">
          {pageStart.toLocaleString("fr-FR")} – {pageEnd.toLocaleString("fr-FR")} sur {filtered.length.toLocaleString("fr-FR")}
        </span>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[var(--text-muted)]">URLs par page</span>
            <DropdownMenu
              upward
              width={88}
              align="right"
              trigger={
                <button className="flex items-center gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-2.5 py-1 text-[12px] font-medium tabular-nums text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-card-hover)]">
                  {pageSize}
                  <ChevronDownIcon className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                </button>
              }
            >
              {[10, 25, 50, 100].map((n) => (
                <DropdownItem key={n} selected={pageSize === n} onClick={() => setPageSize(n)}>
                  {n}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Page précédente"
            >
              <ChevronRightIcon className="h-4 w-4 rotate-180" />
            </button>
            <button
              disabled={safePage >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Page suivante"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* SidePanel — unified panel for page info + analysis */}
      {activeBrief && (
        <SidePanel
          brief={activeBrief}
          briefs={filtered}
          briefKeyword={briefKeywords[activeBrief.id] ?? activeBrief.keyword}
          tagColor={tagColors[activeBrief.tag ?? "Sans lot"] ?? "#64748B"}
          tags={Object.keys(tagColors)}
          tagColors={tagColors}
          status={briefStatuses[activeBrief.id] ?? "todo"}
          priority={briefPriorities[activeBrief.id] ?? activeBrief.priority}
          analysis={activeAnalysis}
          onOpenAnalysis={(b) => setActiveAnalysis(b)}
          onNavigatePage={(b) => setActiveBrief(b)}
          onClose={() => { setActiveBrief(null); setActiveAnalysis(null); }}
          onCloseAnalysis={() => setActiveAnalysis(null)}
          onStatusChange={(next) => toggleStatus(activeBrief.id, next)}
          onPriorityChange={(next) => setPriority(activeBrief.id, next)}
          onTagChange={(tag) => changeBriefTag(activeBrief.id, tag)}
          onCreateTag={(name) => createTagAndAssign(name, activeBrief.id)}
        />
      )}

      {/* AnalyseLaunchModal */}
      {analyseLaunchOpen && typeof window !== "undefined" && (
        <AnalyseLaunchModal
          briefs={analyseTargets}
          keywords={briefKeywords}
          onKeywordChange={(id, kw) => setBriefKeywords((prev) => ({ ...prev, [id]: kw }))}
          onConfirm={() => { setAnalyseLaunchOpen(false); setSelected(new Set()); }}
          onClose={() => setAnalyseLaunchOpen(false)}
        />
      )}
    </div>
  );
}
