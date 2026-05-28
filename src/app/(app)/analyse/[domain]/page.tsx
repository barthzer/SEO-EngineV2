"use client";

import { useState, useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { useModalTransition } from "@/hooks/useModalTransition";
import { createPortal } from "react-dom";
import Link from "next/link";
import { use } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { usePageMeta } from "@/context/PageMetaContext";
import { Button } from "@/components/Button";
import { useToast } from "@/context/ToastContext";
import { Tooltip, ChartTooltip } from "@/components/Tooltip";
import { AnimateIn } from "@/components/AnimateIn";
import { NumberInput } from "@/components/NumberInput";
import { BriefsView, TagList } from "@/components/BriefsView";
import { AuditTechniqueTab } from "@/components/AuditTechniqueTab";
import { AuditEditorialTab } from "@/components/AuditEditorialTab";
import { AuditNetlinkingTab } from "@/components/AuditNetlinkingTab";
import { Stepper } from "@/components/Stepper";
import { BlocCard, type BlocDef } from "@/components/BlocCard";
import { CannibalView } from "@/components/CannibalView";
import { DeltaIndicator } from "@/components/DeltaIndicator";
import { NetlinkingView } from "@/components/NetlinkingView";
import { HistoriqueView } from "@/components/analyse/HistoriqueView";
import { NotesView } from "@/components/analyse/NotesView";
import { UniversSemantiqueView } from "@/components/UniversSemantiqueView";
import { RankTracker } from "@/components/RankTracker";
import { AuditToc, type TocItem } from "@/components/AuditToc";
import { DropdownMenu, DropdownItem, DropdownSeparator } from "@/components/DropdownMenu";
import { useDrawer } from "@/context/DrawerContext";
import { ShareLinkDrawer } from "@/components/share/ShareLinkDrawer";
import {
  ChevronRightIcon,
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  XMarkIcon,
  EllipsisHorizontalIcon,
  EllipsisVerticalIcon,
  Cog6ToothIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  LinkIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  FolderOpenIcon,
  BoltIcon,
  ChevronDownIcon,
  PhotoIcon,
  CursorArrowRaysIcon,
  ArrowsPointingOutIcon,
  PlusIcon,
  ArrowUpTrayIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import {
  TrendingUp,
  ChartBar as LChartBar,
  Trophy,
  Eye,
  Euro,
  Banknote,
  TriangleAlert,
  FilePlus,
  FileText,
  CircleCheck,
  FolderOpen as LFolderOpen,
  Link as LLink,
  Search as LSearch,
  MousePointerClick,
  Download,
  Upload,
  Trash2,
  X as LX,
  Sparkles as LSparkles,
  Settings,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  Layers as LLayers,
  Target as LTarget,
  Boxes,
  ArrowUpRight,
  Tag as LTag,
  Play as LPlay,
} from "lucide-react";
import { CheckCircleIcon as CheckCircleSolid, SparklesIcon } from "@heroicons/react/24/solid";
import { AIInsight } from "@/components/AIInsight";
import { KpiCard } from "@/components/KpiCard";
import { KpiGroup } from "@/components/KpiGroup";
import { VerticalBarChart } from "@/components/VerticalBarChart";
import { TableWide, type ColumnDef } from "@/components/TableWide";
import { SegmentedControl } from "@/components/SegmentedControl";
import { SearchInput } from "@/components/SearchInput";
import { EmptyState } from "@/components/EmptyState";
import { AreaChart } from "@/components/AreaChart";
import { FilterTabs } from "@/components/FilterTabs";
import { ImportCSVModal } from "@/components/analyse/modals/ImportCSVModal";
import { AddUrlModal } from "@/components/analyse/modals/AddUrlModal";
import { NewBriefModal } from "@/components/analyse/modals/NewBriefModal";
import { ImportModal } from "@/components/analyse/modals/ImportModal";
import { ConnectModal, ConnBadge, type Tool } from "@/components/analyse/modals/ConnectModal";
import { ParametresModal } from "@/components/analyse/modals/ParametresModal";
import { KeywordStudyModal } from "@/components/analyse/modals/KeywordStudyModal";


/* ── Helpers extracted to @/components/analyse — voir wave 1 & 2 du refactor ── */
import { Tab, TABS, TAB_TITLES, TAB_SUBTITLES } from "@/components/analyse/constants";
import { HealthCard } from "@/components/analyse/HealthCard";
import { PositionBarChart } from "@/components/analyse/charts/PositionBarChart";
import { OrganicCompetitorsTable } from "@/components/analyse/charts/OrganicCompetitorsTable";
import { VisibilityLineChart } from "@/components/analyse/charts/VisibilityLineChart";
import { ChartBar, InsightList } from "@/components/analyse/charts/ChartPrimitives";
import { TopPages } from "@/components/analyse/charts/TopPages";
import { ForecastTimeline } from "@/components/analyse/charts/ForecastTimeline";
import { RecommandationsView } from "@/components/analyse/RecommandationsView";

/* ── Page ────────────────────────────────────────────────────────────── */

export default function AnalysePage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = use(params);
  const decodedDomain = decodeURIComponent(domain);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { show: showToast } = useToast();
  // Tab state is driven by `?tab=` in the URL so the sidebar can navigate to it directly.
  const rawTab = (searchParams.get("tab") ?? "general") as Tab;
  const tab: Tab = (["general","briefs","seo","tracking","sea","forecast","netlinking","audit","cannibal","univers","recommandations","historique","notes"] as Tab[]).includes(rawTab) ? rawTab : "general";
  const setTab = (next: Tab) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (next === "general") sp.delete("tab"); else sp.set("tab", next);
    router.replace(`${pathname}${sp.toString() ? `?${sp.toString()}` : ""}`, { scroll: false });
  };
  const [auditTab, setAuditTab] = useState<"technique" | "editorial" | "netlinking">("technique");
  const [seoTab, setSeoTab] = useState<"analytics" | "top-pages">("analytics");
  const [parametresOpen, setParametresOpen] = useState(false);
  const [urlModal, setUrlModal] = useState<"import-csv" | "add-url" | "new-brief" | null>(null);
  const [gscConnected, setGscConnected] = useState(true);
  const [ga4Connected, setGa4Connected] = useState(true);
  const [connectModal, setConnectModal] = useState<Tool | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [returnToParametres, setReturnToParametres] = useState(false);
  // URL ouverte depuis une autre vue (ex. UniversSemantique) — ouvre la SidePanel
  // par-dessus l'onglet courant (BriefsView reste monté en permanence pour ça).
  const [pendingBriefUrl, setPendingBriefUrl] = useState<string | null>(null);
  function openPageByUrl(url: string) {
    setPendingBriefUrl(url);
  }


  /* ── Push project actions (GSC, GA4, ...) into the Topbar's right slot ── */
  const { setMeta } = usePageMeta();
  const { open: drawerOpen } = useDrawer();
  useEffect(() => {
    setMeta({
      rightSlot: (
        <>
          <ConnBadge
            tool="gsc"
            connected={gscConnected}
            onClick={() => gscConnected ? setGscConnected(false) : setConnectModal("gsc")}
            onImport={() => setImportModalOpen(true)}
          />
          <ConnBadge
            tool="ga4"
            connected={ga4Connected}
            onClick={() => ga4Connected ? setGa4Connected(false) : setConnectModal("ga4")}
          />
          <DropdownMenu
            trigger={
              <button className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]">
                <EllipsisVerticalIcon className="h-5 w-5" />
              </button>
            }
            align="right"
            width={220}
          >
            <DropdownItem icon={Upload}     onClick={() => setUrlModal("import-csv")}>Importer des URLs</DropdownItem>
            <DropdownItem icon={LLink}      onClick={() => setUrlModal("add-url")}>Ajouter une URL</DropdownItem>
            <DropdownItem icon={LSparkles}  onClick={() => setUrlModal("new-brief")}>Nouvelle analyse</DropdownItem>
            <DropdownSeparator />
            <DropdownItem
              icon={LinkIcon}
              onClick={() =>
                drawerOpen(
                  "Partager avec le client",
                  <ShareLinkDrawer domain={decodedDomain} />,
                )
              }
            >
              Partager avec le client
            </DropdownItem>
            <DropdownItem icon={Settings}   onClick={() => setParametresOpen(true)}>Paramètres du projet</DropdownItem>
            <DropdownSeparator />
            <DropdownItem icon={Trash2} danger>Supprimer le projet</DropdownItem>
          </DropdownMenu>
        </>
      ),
    });
    return () => setMeta({ rightSlot: null });
  }, [gscConnected, ga4Connected, setMeta]);

  const DOMAIN_HEALTH: Record<string, { tech: number }> = {
    "leboncoin.fr":   { tech: 84 },
    "doctolib.fr":    { tech: 61 },
    "backmarket.com": { tech: 73 },
    "sephora.fr":     { tech: 91 },
    "fnac.com":       { tech: 78 },
    "mano-mano.fr":   { tech: 69 },
    "cdiscount.com":  { tech: 82 },
    "lemonde.fr":     { tech: 88 },
    "kiabi.com":      { tech: 38 },
  };
  const healthScores = DOMAIN_HEALTH[decodedDomain] ?? { tech: 84 };

  return (
    <>
    <div className="flex flex-1 flex-col">
      {/* Header projet retiré — le nom du projet et la subtitle sont intégrés au bloc
          titre de l'onglet "Vue d'ensemble" plus bas. */}

      {/* La nav entre onglets de la vue analyse se fait via la Sidebar (?tab=).
          Pour Audit, la barre Technique/Éditorial/Netlinking est rendue inline dans le main,
          juste sous le titre (cf. bloc `tab === "audit"` plus bas). */}

      {/* ── Tab content ── */}
      <div className={`mx-auto w-full py-[var(--page-py)] ${tab !== "briefs" && tab !== "historique" ? "max-w-[var(--page-max-w)] px-[var(--page-px)]" : ""}`}>
        {/* key={tab} : force le remount du contenu actif → l'animation `t-tab-enter` rejoue
            à chaque changement d'onglet (fade + slide + blur, ~200ms). */}
        <div key={tab} className="t-tab-enter">

        {/* Titre de la vue + sous-titre éventuel. Skipped pour briefs / tracking / univers /
            recommandations qui rendent leur propre header (title + CTAs sur la même ligne).
            Vue d'ensemble : on accole le nom du projet (lien externe) à droite du titre,
            et la subtitle reprend l'info de fraîcheur GSC/GA4. */}
        {!["briefs", "tracking", "univers", "recommandations"].includes(tab) && (
          <div className={`mb-6 ${tab === "historique" ? "px-[var(--page-px)]" : ""}`}>
            <div className="flex items-baseline gap-2">
              <h1 className="font-semibold leading-none tracking-heading text-[var(--text-primary)]">
                {TAB_TITLES[tab]}
              </h1>
              {tab === "general" && (
                <Tooltip label="Ouvrir dans un nouvel onglet" side="top" portal>
                  <a
                    href={`https://${decodedDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/proj inline-flex items-center gap-2 transition-colors"
                  >
                    <h1 className="font-semibold leading-none tracking-heading text-[var(--text-primary)] transition-opacity group-hover/proj:opacity-70">
                      {decodedDomain}
                    </h1>
                    <ArrowTopRightOnSquareIcon className="h-5 w-5 text-[var(--text-muted)] opacity-0 transition-opacity group-hover/proj:opacity-100" />
                  </a>
                </Tooltip>
              )}
            </div>
            {tab === "general" && (gscConnected || ga4Connected) ? (
              <p className="mt-1 text-[14px] tracking-body text-[var(--text-secondary)]">
                Mis à jour aujourd'hui · 133 pages crawlées · 12 pages non indexées
              </p>
            ) : TAB_SUBTITLES[tab] && (
              <p className="mt-1 text-[14px] tracking-body text-[var(--text-secondary)]">
                {TAB_SUBTITLES[tab]}
              </p>
            )}
          </div>
        )}

        {/* Général tab */}
        {tab === "general" && (
          <div className="flex flex-col gap-8">

            {/* Stats globales */}
            <KpiGroup columns={3}>
              <KpiCard bare icon={TrendingUp} label="Trafic organique / mois" value="42 800" delta="+8,4 %" sub="vs N−1" />
              <KpiCard bare icon={LFolderOpen} label="Lots créés"              value="18"     sub="6 actifs · 12 terminés" />
              <KpiCard bare icon={FileText}    label="Analyses générées"          value="147"    sub="63 livrés (43 %)" />
            </KpiGroup>

            {/* 3 blocs stratégiques (GEO retiré — conservé dans le DS pour usage futur) */}
            <div>
              <p className="mb-4 text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">Blocs stratégiques</p>
              <div className="grid grid-cols-3 gap-3">
                {([
                  {
                    gradFrom: "#00CCFF", gradTo: "#3265FF", iconBottomColor: "#3265FF",
                    color: "#3265FF", colorBg: "rgba(50,101,255,0.08)",
                    title: "Optimiser les pages existantes",
                    description: "Scoring auto, priorisation, analyse d'optimisation",
                    features: ["Analyse EMC par page","Score sémantique","Maillage interne","Balises meta & titres","Core Web Vitals"],
                    cta: `/analyse/${encodeURIComponent(decodedDomain)}?tab=briefs`,
                    iconPaths: (fill: string) => (<>
                      <path fillRule="evenodd" fill={fill} d="M12 6.75a5.25 5.25 0 0 1 6.775-5.025.75.75 0 0 1 .313 1.248l-3.32 3.319c.063.475.276.934.641 1.299.365.365.824.578 1.3.64l3.318-3.319a.75.75 0 0 1 1.248.313 5.25 5.25 0 0 1-5.472 6.756c-1.018-.086-1.87.1-2.309.634L7.344 21.3A3.298 3.298 0 1 1 2.7 16.657l8.684-7.151c.533-.44.72-1.291.634-2.309A5.342 5.342 0 0 1 12 6.75ZM4.117 19.125a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Z" clipRule="evenodd" />
                      <path fill={fill} d="m10.076 8.64-2.201-2.2V4.874a.75.75 0 0 0-.364-.643l-3.75-2.25a.75.75 0 0 0-.916.113l-.75.75a.75.75 0 0 0-.113.916l2.25 3.75a.75.75 0 0 0 .643.364h1.564l2.062 2.062 1.575-1.297Z" />
                      <path fillRule="evenodd" fill={fill} d="m12.556 17.329 4.183 4.182a3.375 3.375 0 0 0 4.773-4.773l-3.306-3.305a6.803 6.803 0 0 1-1.53.043c-.394-.034-.682-.006-.867.042a.589.589 0 0 0-.167.063l-3.086 3.748Zm3.414-1.36a.75.75 0 0 1 1.06 0l1.875 1.876a.75.75 0 1 1-1.06 1.06L15.97 17.03a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </>),
                  },
                  {
                    gradFrom: "#FFB930", gradTo: "#FB5F26", iconBottomColor: "#FFB930",
                    color: "#FB5F26", colorBg: "rgba(251,95,38,0.08)",
                    title: "Identifier les pages manquantes",
                    description: "Moteur EMC : détecte thématiques non couvertes",
                    features: ["Analyse concurrentielle","Gaps de mots-clés","Pages intermédiaires","Cocon sémantique","Intentions de recherche"],
                    cta: `/analyse/${encodeURIComponent(decodedDomain)}?tab=recommandations`,
                    iconPaths: (fill: string) => (<>
                      <path fill={fill} d="M12 .75a8.25 8.25 0 0 0-4.135 15.39c.686.398 1.115 1.008 1.134 1.623a.75.75 0 0 0 .577.706c.352.083.71.148 1.074.195.323.041.6-.218.6-.544v-4.661a6.714 6.714 0 0 1-.937-.171.75.75 0 1 1 .374-1.453 5.261 5.261 0 0 0 2.626 0 .75.75 0 1 1 .374 1.452 6.712 6.712 0 0 1-.937.172v4.66c0 .327.277.586.6.545.364-.047.722-.112 1.074-.195a.75.75 0 0 0 .577-.706c.02-.615.448-1.225 1.134-1.623A8.25 8.25 0 0 0 12 .75Z" />
                      <path fillRule="evenodd" fill={fill} d="M9.013 19.9a.75.75 0 0 1 .877-.597 11.319 11.319 0 0 0 4.22 0 .75.75 0 1 1 .28 1.473 12.819 12.819 0 0 1-4.78 0 .75.75 0 0 1-.597-.876ZM9.754 22.344a.75.75 0 0 1 .824-.668 13.682 13.682 0 0 0 2.844 0 .75.75 0 1 1 .156 1.492 15.156 15.156 0 0 1-3.156 0 .75.75 0 0 1-.668-.824Z" clipRule="evenodd" />
                    </>),
                  },
                  {
                    gradFrom: "#6270F7", gradTo: "var(--accent-primary)", iconBottomColor: "var(--accent-primary)",
                    color: "var(--accent-primary)", colorBg: "rgba(62,80,245,0.08)",
                    title: "Créer page from scratch",
                    description: "Mot-clé + type de page, filtre SERP automatique",
                    features: ["Recherche de mots-clés","Analyse IA complète","Structure d'URL","Maillage cible","Calendrier éditorial"],
                    onClick: () => setUrlModal("new-brief"),
                    iconPaths: (fill: string) => (<>
                      <path fillRule="evenodd" fill={fill} d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 0 1 .75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 0 1 9.75 22.5a.75.75 0 0 1-.75-.75v-4.131A15.838 15.838 0 0 1 6.382 15H2.25a.75.75 0 0 1-.75-.75 6.75 6.75 0 0 1 7.815-6.666ZM15 6.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" clipRule="evenodd" />
                      <path fill={fill} d="M5.26 17.242a.75.75 0 1 0-.897-1.203 5.243 5.243 0 0 0-2.05 5.022.75.75 0 0 0 .625.627 5.243 5.243 0 0 0 5.022-2.051.75.75 0 1 0-1.202-.897 3.744 3.744 0 0 1-3.008 1.51c0-1.23.592-2.323 1.51-3.008Z" />
                    </>),
                  },
                ] satisfies BlocDef[]).map((bloc, index) => (
                  <BlocCard key={bloc.title} bloc={bloc} index={index} />
                ))}
              </div>
            </div>

            {/* Bilans santé — 3 cards cliquables avec hover bg (comme les Blocs stratégiques) */}
            <div className="grid grid-cols-3 gap-3">
              <div className="overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] transition-colors hover:bg-[var(--bg-subtle)]">
                <HealthCard
                  title="Santé technique"
                  score={healthScores.tech}
                  critiques={3}
                  visitesRisk="99"
                  quote="3 problèmes techniques critiques impactent 99 visites/mois. Priorité : corriger les balises titres et réduire les temps de réponse pour récupérer ce trafic."
                  ctaHref={`/analyse/${domain}/audit`}
                />
              </div>
              <div className="overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] transition-colors hover:bg-[var(--bg-subtle)]">
                <HealthCard
                  title="Santé éditoriale"
                  score={61}
                  critiques={2}
                  importants={6}
                  visitesRisk="4,1k"
                  quote="Vos 9 pages manquent de signaux E-E-A-T, exposant 1 361 visites/mois. Priorité : renforcer la crédibilité et l'expertise avant le prochain Core Update pour sécuriser ce trafic."
                  note="3 détecteurs avec données partielles"
                  ctaHref={`/analyse/${domain}/audit?tab=editorial`}
                />
              </div>
              <div className="overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] transition-colors hover:bg-[var(--bg-subtle)]">
                <HealthCard
                  title="Santé Netlinking"
                  score={48}
                  critiques={1}
                  importants={4}
                  visitesRisk="2,3k"
                  quote="Profil de backlinks sous-dimensionné face aux concurrents (TF 15 vs moyenne 32). Priorité : campagne d'outreach ciblée pour combler le gap d'autorité avant la prochaine vague de Core Update."
                  note="Risque spam : −46% vs concurrents"
                  ctaHref={`/analyse/${domain}?tab=netlinking`}
                />
              </div>
            </div>

            {/* Core Web Vitals — bloc indépendant */}
            <div className="overflow-hidden rounded-3xl border border-[var(--border-subtle)]">
              <div className="p-7">
                <p className="text-[18px] font-semibold tracking-subheading text-[var(--text-primary)]">Core Web Vitals</p>
                <p className="mt-0.5 text-[12px] tracking-caption text-[var(--text-muted)]">Simulation Lighthouse · 10 URLs · 26 avr.</p>
              </div>
              <div className="flex px-7 pb-7 gap-4">
                {[
                  { key: "LCP", label: "Largest Contentful Paint", icon: PhotoIcon,            value: "4.52 s", status: "Mauvais", threshold: "≤ 2.5s",  color: "var(--color-danger)", bg: "var(--color-danger-bg)" },
                  { key: "INP", label: "Interaction to Next Paint", icon: CursorArrowRaysIcon,  value: "4 ms",   status: "Bon",     threshold: "≤ 200ms", color: "var(--color-success)", bg: "var(--color-success-bg)" },
                  { key: "CLS", label: "Cumulative Layout Shift",   icon: ArrowsPointingOutIcon, value: "0.05",  status: "Bon",     threshold: "≤ 0.1",   color: "var(--color-success)", bg: "var(--color-success-bg)" },
                ].map((m) => (
                  <div key={m.key} className="flex flex-1 items-center gap-4 px-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[var(--border-medium)]">
                      <m.icon className="h-5 w-5 text-[var(--text-primary)]" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-semibold text-[var(--text-muted)]">{m.key}</span>
                      <p className="text-[24px] font-semibold leading-none tracking-tight text-[var(--text-primary)]">{m.value}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-[12px] font-semibold" style={{ color: m.color, backgroundColor: m.bg }}>{m.status}</span>
                        <span className="text-[11px] text-[var(--text-muted)]">{m.threshold}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Distribution des positions + Visibilité — 2 colonnes */}
            <div className="grid grid-cols-2 gap-4">

              {/* Distribution des positions — bar chart */}
              <div className="flex flex-col rounded-3xl border border-[var(--border-subtle)] p-7">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[18px] font-semibold tracking-subheading text-[var(--text-primary)]">Distribution des positions</p>
                    <p className="mt-0.5 text-[12px] tracking-caption text-[var(--text-muted)]">Visibilité Haloscan</p>
                  </div>
                  <Tooltip
                    side="top"
                    label={<>
                      <span className="block text-[12px] text-white"><span className="font-semibold">5</span> mots-clés dans le top 100 / <span className="font-semibold">2 081</span> détectés (Haloscan)</span>
                      <span className="mt-1 block text-[11px] text-white/70">2 076 mots-clés au-delà de la position 100</span>
                    </>}
                  >
                    <button className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]">
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                        <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
                        <path d="M7.5 6.5v4M7.5 4.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </Tooltip>
                </div>
                <div className="flex-1">
                  <PositionBarChart />
                </div>
              </div>

              {/* Visibilité et trafic organique */}
              <div className="overflow-hidden rounded-3xl border border-[var(--border-subtle)] p-7">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[18px] font-semibold tracking-subheading text-[var(--text-primary)]">Visibilité et trafic organique</p>
                    <p className="mt-0.5 text-[12px] tracking-caption text-[var(--text-muted)]">Visibilité Haloscan</p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => setTab("seo")}>
                    Voir Analytics SEO
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <VisibilityLineChart />
              </div>

            </div>

            {/* Concurrents organiques */}
            <OrganicCompetitorsTable />

            {/* Tags actifs */}
            <div>
              <p className="mb-4 text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">Lots récents</p>
              <TagList onNavigate={() => setTab("briefs")} />
            </div>

            {/* Activités récentes */}
            <div>
              <div className="mb-4 flex items-baseline justify-between">
                <p className="text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">Activités récentes</p>
                <button className="text-[12px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">Voir tout</button>
              </div>
              <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
                {[
                  { label: "Analyse publiée",      desc: "Guide SEO local complet · optimisé",          time: "Il y a 2h",  color: "var(--color-success)", Icon: FileText },
                  { label: "Score mis à jour",  desc: "Score sémantique /blog/link-building : 55 → 67", time: "Il y a 5h",  color: "var(--color-warning)", Icon: TrendingUp },
                  { label: "Lot créé",          desc: "Lot GEO — Structured data · 6 URLs",          time: "Hier",       color: "#A855F7", Icon: LTag },
                  { label: "Analyse lancée",    desc: "Nouveau crawl GSC · 1 048 pages indexées",    time: "28 avr.",    color: "var(--accent-primary)", Icon: LPlay },
                  { label: "Analyse livrée",       desc: "Schema.org et données structurées",           time: "27 avr.",    color: "var(--color-success)", Icon: CircleCheck },
                ].map((a, i, arr) => (
                  <button
                    key={i}
                    type="button"
                    className={`group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--bg-card-hover)] ${i < arr.length - 1 ? "border-b border-[var(--border-subtle)]" : ""}`}
                  >
                    <span
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: `color-mix(in oklab, ${a.color} 12%, transparent)`, color: a.color }}
                    >
                      <a.Icon className="h-4 w-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-[13px] font-semibold text-[var(--text-primary)]">{a.label}</p>
                      <p className="truncate text-[12px] text-[var(--text-secondary)]">{a.desc}</p>
                    </div>
                    <span className="flex-shrink-0 text-[11px] tracking-caption text-[var(--text-muted)]">{a.time}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Briefs tab — toujours monté pour que la SidePanel reste accessible
            depuis n'importe quel onglet (ex. clic d'URL depuis Univers sémantique).
            Visuellement masqué quand tab !== "briefs". */}
        <div className={tab === "briefs" ? "" : "hidden"} aria-hidden={tab !== "briefs"}>
          <BriefsView
            initialBriefUrl={pendingBriefUrl}
            onPendingHandled={() => setPendingBriefUrl(null)}
          />
        </div>

        {/* SEO tab */}
        {tab === "seo" && (
          <div className="flex flex-col gap-6">
            {/* Sub-tab bar — inline sous le titre, même pattern qu'Audit */}
            <div className="relative flex h-14 items-center gap-1 border-b border-[var(--border-subtle)]">
              {(["analytics", "top-pages"] as const).map((t) => {
                const isActive = seoTab === t;
                const label = t === "analytics" ? "Analytics" : "Top pages SEO";
                return (
                  <button
                    key={t}
                    onClick={() => setSeoTab(t)}
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

            {seoTab === "analytics" && (
              <div className="flex flex-col gap-4">
                {(() => {
                  const trendLabels = ["8 fév", "15 fév", "22 fév", "1 mar", "8 mar", "15 mar", "22 mar", "1 avr", "15 avr", "1 mai"];
                  return (
                    <div className="grid grid-cols-3 gap-3">
                      <KpiCard icon={TrendingUp}        label="Trafic organique (30j)" value="14 280"  delta="+12 %"        sub="vs mois préc." trendLabels={trendLabels} trendFormatValue={(v) => `${Math.round(v).toLocaleString("fr-FR")} clics`} trend={[10800, 11200, 11400, 11900, 12400, 12800, 13100, 13600, 14000, 14280]} />
                      <KpiCard icon={LChartBar}         label="Position moyenne"       value="18,4"    delta="−2,1 pts" deltaPositiveIsGood={false} sub="ce mois" trendLabels={trendLabels} trendFormatValue={(v) => `Pos. ${v.toFixed(1).replace(".", ",")}`} trend={[16.3, 16.7, 17.1, 17.4, 17.8, 18.0, 18.2, 18.3, 18.4, 18.4]} />
                      <KpiCard icon={MousePointerClick} label="CTR moyen"              value="3,2 %"                       sub="stable"        trendLabels={trendLabels} trendFormatValue={(v) => `${v.toFixed(1).replace(".", ",")} %`} trend={[3.1, 3.0, 3.2, 3.1, 3.2, 3.3, 3.2, 3.1, 3.2, 3.2]} />
                      <KpiCard icon={Trophy}            label="Mots-clés top 10"       value="312"     delta="+8"          sub="ce mois"       trendLabels={trendLabels} trendFormatValue={(v) => `${Math.round(v)} mots-clés`} trend={[280, 286, 289, 293, 298, 302, 305, 308, 310, 312]} />
                      <KpiCard icon={FileText}          label="Pages indexées"         value="1 048"                                            trendLabels={trendLabels} trendFormatValue={(v) => `${Math.round(v).toLocaleString("fr-FR")} pages`} trend={[1010, 1015, 1022, 1028, 1033, 1038, 1042, 1045, 1047, 1048]} />
                      <KpiCard icon={Eye}               label="Impressions (30j)"      value="447 000" delta="+8 %"        sub="vs mois préc." trendLabels={trendLabels} trendFormatValue={(v) => `${Math.round(v).toLocaleString("fr-FR")} impr.`} trend={[380000, 395000, 405000, 412000, 420000, 428000, 434000, 440000, 444000, 447000]} />
                    </div>
                  );
                })()}
                <div className="grid grid-cols-2 gap-4">

                  {/* Distribution des positions */}
                  <div className="flex flex-col rounded-3xl border border-[var(--border-subtle)] p-7">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-[18px] font-semibold tracking-subheading text-[var(--text-primary)]">Distribution des positions</p>
                        <p className="mt-0.5 text-[12px] tracking-caption text-[var(--text-muted)]">Visibilité Haloscan</p>
                      </div>
                      <Tooltip
                        side="top"
                        label={<>
                          <span className="block text-[12px] text-white"><span className="font-semibold">5</span> mots-clés dans le top 100 / <span className="font-semibold">2 081</span> détectés (Haloscan)</span>
                          <span className="mt-1 block text-[11px] text-white/70">2 076 mots-clés au-delà de la position 100</span>
                        </>}
                      >
                        <button className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]">
                          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                            <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
                            <path d="M7.5 6.5v4M7.5 4.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </Tooltip>
                    </div>
                    <div className="flex-1">
                      <PositionBarChart />
                    </div>
                  </div>

                  {/* Visibilité et trafic organique */}
                  <div className="overflow-hidden rounded-3xl border border-[var(--border-subtle)] p-7">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-[18px] font-semibold tracking-subheading text-[var(--text-primary)]">Visibilité et trafic organique</p>
                        <p className="mt-0.5 text-[12px] tracking-caption text-[var(--text-muted)]">Visibilité Haloscan</p>
                      </div>
                    </div>
                    <VisibilityLineChart />
                  </div>

                </div>
                <InsightList items={[
                  "8 mots-clés ont progressé en top 3 ce mois",
                  "La page /blog/seo-local est la plus performante avec 6,1% de CTR",
                  "3 pages en position 11–15 sont à optimiser en priorité",
                  "Le taux d'indexation est excellent (98,4%)",
                ]} />
              </div>
            )}

            {seoTab === "top-pages" && <TopPages />}
          </div>
        )}

        {/* Tracking tab */}
        {tab === "tracking" && (
          <RankTracker title={TAB_TITLES.tracking} subtitle={TAB_SUBTITLES.tracking} />
        )}

        {/* SEA tab */}
        {tab === "sea" && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              <KpiCard icon={Euro}              label="CPC moyen"         value="0,42 €"  sub="stable vs mois préc." />
              <KpiCard icon={MousePointerClick} label="CTR campagnes"     value="5,8 %"   delta="+0,4 pts" />
              <KpiCard icon={CircleCheck}       label="Conversions (30j)" value="384"     delta="+6 %" />
              <KpiCard icon={Banknote}          label="Coût total (30j)"  value="1 890 €" sub="budget consommé à 94%" />
              <KpiCard icon={Euro}              label="CPA moyen"         value="4,92 €"  delta="−0,3 €" deltaPositiveIsGood={false} sub="vs mois préc." />
              <KpiCard icon={Eye}               label="Impressions (30j)" value="210 000" delta="+3 %" sub="vs mois préc." />
            </div>
            <ChartBar label="Évolution du CPC — 12 semaines" color="var(--accent-primary)" />
            <InsightList color="var(--accent-primary)" items={[
              "Le budget est pleinement utilisé — aucune fuite détectée",
              "2 groupes d'annonces affichent un CTR < 2% à revoir",
              "Les mots-clés de marque génèrent 38% des conversions",
              "Le score de qualité moyen est de 7,4/10 — potentiel d'amélioration",
            ]} />
          </div>
        )}

        {/* Forecast tab */}
        {tab === "forecast" && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              <KpiCard icon={TrendingUp} label="Trafic estimé M+3"      value="+22 %" valueColor="var(--color-success)" sub="Blocs 01 + 02 exécutés" />
              <KpiCard icon={TrendingUp} label="Trafic estimé M+6"      value="+38 %" valueColor="var(--color-success)" sub="Plan complet exécuté" />
              <KpiCard icon={LChartBar}   label="ROI SEO estimé 6 mois"  value="×3,2"  valueColor="var(--color-success)" sub="basé sur 87 opportunités" />
              <KpiCard icon={LSearch}    label="Mots-clés opportunités" value="87 KW" sub="volume ≥ 100/mois" />
              <KpiCard icon={FilePlus}   label="Pages à créer"          value="24"    sub="Bloc 03 — création" />
              <KpiCard icon={FileText}   label="Pages à optimiser"      value="36"    sub="Bloc 01 — existant" />
            </div>
            <ForecastTimeline />
            <ChartBar label="Courbe de trafic projetée — 6 mois" color="var(--color-success)" />
            <InsightList color="var(--color-success)" items={[
              "Cadence minimale recommandée : 4 contenus/mois",
              "Optimisation technique à compléter en M+1 pour activer les gains rapides",
              "Le maillage interne représente 30% du gain estimé",
              "Les pages GEO (Bloc 04) pourraient capter 15% de trafic IA supplémentaire",
            ]} />

            <div className="flex justify-start">
              <Button size="md" onClick={() => setTab("briefs")}>
                Démarrer le plan
                <ChevronRightIcon className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Netlinking tab */}
        {tab === "netlinking" && <NetlinkingView />}

        {/* B2 — Historique tab : timeline d'actions livrées + impact agrégé par mois. */}
        {tab === "historique" && <HistoriqueView />}

        {tab === "notes" && <NotesView domain={decodedDomain} />}

        {tab === "cannibal" && <CannibalView />}

        {tab === "univers" && <UniversSemantiqueView title={TAB_TITLES.univers} subtitle={TAB_SUBTITLES.univers} onOpenPageByUrl={openPageByUrl} />}

        {tab === "recommandations" && (
          <RecommandationsView
            title={TAB_TITLES.recommandations}
            subtitle={TAB_SUBTITLES.recommandations}
            onOpenPageByUrl={openPageByUrl}
          />
        )}

        {tab === "audit" && (() => {
          const TECH_TOC: TocItem[] = [
            { id: "tec-synthese",      label: "Synthèse" },
            { id: "tec-urgences",      label: "01 · Urgences" },
            { id: "tec-optimisations", label: "02 · Optimisations" },
            { id: "tec-diagnostic",    label: "03 · Diagnostic" },
            { id: "tec-donnees",       label: "04 · Données brutes" },
          ];
          const EDI_TOC: TocItem[] = [
            { id: "edi-synthese",        label: "Synthèse" },
            { id: "edi-tags",            label: "Lots" },
            { id: "edi-diagnostic",      label: "01 · Diagnostic" },
            { id: "edi-dimensions",      label: "02 · Dimensions" },
            { id: "edi-donnees",         label: "03 · Données brutes" },
          ];
          const NET_TOC: TocItem[] = [
            { id: "net-benchmark",  label: "01 · Benchmark concurrents" },
            { id: "net-liens",      label: "02 · Profil des liens" },
            { id: "net-evolution",  label: "03 · Évolution TF" },
            { id: "net-topical",    label: "04 · Topical Trust Flow" },
            { id: "net-ancres",     label: "05 · Ancres" },
            { id: "net-visibilite", label: "06 · Visibilité SEO" },
          ];
          const currentToc = auditTab === "technique" ? TECH_TOC : auditTab === "editorial" ? EDI_TOC : NET_TOC;
          return (
            <div className="flex gap-10 items-start">
              <div className="min-w-0 flex-1 flex flex-col gap-6">
                {/* Switch Technique / Éditorial / Netlinking — inline, juste sous le titre */}
                <div className="relative flex h-14 items-center gap-1 border-b border-[var(--border-subtle)]">
                  {(["technique", "editorial", "netlinking"] as const).map((t) => {
                    const isActive = auditTab === t;
                    const label = t === "technique" ? "Technique" : t === "editorial" ? "Éditorial" : "Netlinking";
                    return (
                      <button
                        key={t}
                        onClick={() => setAuditTab(t)}
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
                {auditTab === "technique"  && <AuditTechniqueTab domain={decodedDomain} />}
                {auditTab === "editorial"  && <AuditEditorialTab domain={decodedDomain} />}
                {auditTab === "netlinking" && <AuditNetlinkingTab domain={decodedDomain} />}
              </div>
              <aside className="w-40 flex-shrink-0 self-stretch">
                <AuditToc items={currentToc} />
              </aside>
            </div>
          );
        })()}

        </div>{/* end content animate-fade-in */}
      </div>{/* end content max-w-5xl */}
    </div>{/* end overflow-y-auto */}

    {connectModal && (
      <ConnectModal
        tool={connectModal}
        onClose={() => {
          setConnectModal(null);
          if (returnToParametres) { setReturnToParametres(false); setParametresOpen(true); }
        }}
        onConnect={() => {
          if (connectModal === "gsc") {
            setGscConnected(true);
            showToast("Google Search Console connectée", <LinkIcon className="h-5 w-5" />);
          }
          if (connectModal === "ga4") {
            setGa4Connected(true);
            showToast("Google Analytics 4 connecté", <LinkIcon className="h-5 w-5" />);
          }
        }}
      />
    )}

    {importModalOpen && <ImportModal onClose={() => setImportModalOpen(false)} />}
    {urlModal === "import-csv" && <ImportCSVModal onClose={() => setUrlModal(null)} />}
    {urlModal === "add-url"    && <AddUrlModal    onClose={() => setUrlModal(null)} />}
    {urlModal === "new-brief"  && <NewBriefModal  onClose={() => setUrlModal(null)} />}

    {parametresOpen && (
      <ParametresModal
        domain={decodedDomain}
        gscConnected={gscConnected}
        ga4Connected={ga4Connected}
        onToggleGsc={() => {
          if (gscConnected) { setGscConnected(false); }
          else { setParametresOpen(false); setReturnToParametres(true); setConnectModal("gsc"); }
        }}
        onToggleGa4={() => {
          if (ga4Connected) { setGa4Connected(false); }
          else { setParametresOpen(false); setReturnToParametres(true); setConnectModal("ga4"); }
        }}
        onClose={() => setParametresOpen(false)}
      />
    )}
  </>
  );
}
