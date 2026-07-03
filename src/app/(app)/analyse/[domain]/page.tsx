"use client";

import { useState, useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { useModalTransition } from "@/hooks/useModalTransition";
import { createPortal } from "react-dom";
import Link from "next/link";
import { use } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { usePageMeta } from "@/context/PageMetaContext";
import { useChat } from "@/context/ChatContext";
import { ChatAiIcon } from "@/components/chat/ChatWidget";
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
import { BlocCard } from "@/components/BlocCard";
import { CannibalView } from "@/components/CannibalView";
import { DeltaIndicator } from "@/components/DeltaIndicator";
import { NetlinkingView } from "@/components/NetlinkingView";
import { HistoriqueView } from "@/components/analyse/HistoriqueView";
import { OpportunitesView } from "@/components/analyse/OpportunitesView";
import { CreationView } from "@/components/analyse/CreationView";
import { contentBlocs } from "@/components/analyse/contentBlocs";
import { NotesView } from "@/components/analyse/NotesView";
import { BenchmarkView } from "@/components/analyse/BenchmarkView";
import { VisibiliteIAView } from "@/components/geo/VisibiliteIAView";
import { UniversSemantiqueView } from "@/components/UniversSemantiqueView";
import { RankTracker } from "@/components/RankTracker";
import { DropdownMenu, DropdownItem, DropdownSeparator } from "@/components/DropdownMenu";
import { useDrawer } from "@/context/DrawerContext";
import { ShareLinkDrawer } from "@/components/share/ShareLinkDrawer";
import {
  ChevronRightIcon,
  ArrowRightIcon,
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
import { ModalShell } from "@/components/analyse/modals/shared";
import { KeywordStudyModal } from "@/components/analyse/modals/KeywordStudyModal";


/* ── Helpers extracted to @/components/analyse — voir wave 1 & 2 du refactor ── */
import { Tab, TABS, TAB_TITLES, TAB_SUBTITLES } from "@/components/analyse/constants";
import { IconBadge } from "@/components/IconBadge";
import { scoreColor } from "@/data/projects";
import { PositionBarChart } from "@/components/analyse/charts/PositionBarChart";
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
  const tab: Tab = (["general","briefs","seo","tracking","sea","forecast","netlinking","audit","cannibal","univers","recommandations","opportunites","creation","historique","notes","benchmark","geo"] as Tab[]).includes(rawTab) ? rawTab : "general";
  const setTab = (next: Tab) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (next === "general") sp.delete("tab"); else sp.set("tab", next);
    router.replace(`${pathname}${sp.toString() ? `?${sp.toString()}` : ""}`, { scroll: false });
  };
  // Sous-onglet d'audit — piloté par `?section=` (ex. depuis les cartes Santé du projet).
  const auditSection = searchParams.get("section");
  const [auditTab, setAuditTab] = useState<"technique" | "editorial" | "netlinking">(
    auditSection === "editorial" ? "editorial" : auditSection === "netlinking" ? "netlinking" : "technique",
  );
  useEffect(() => {
    if (tab === "audit" && (auditSection === "technique" || auditSection === "editorial" || auditSection === "netlinking")) {
      setAuditTab(auditSection);
    }
  }, [tab, auditSection]);
  const [parametresOpen, setParametresOpen] = useState(false);
  const [relaunchOpen, setRelaunchOpen] = useState(false);
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
  // Filtre de lot à pré-appliquer dans la vue URLs (ex. clic sur un "Lot récent").
  const [pendingTagFilter, setPendingTagFilter] = useState<string | null>(null);
  function openUrlsWithTag(tag: string) {
    setPendingTagFilter(tag);
    setTab("briefs");
  }


  /* ── Push project actions (GSC, GA4, ...) into the Topbar's right slot ── */
  const { setMeta } = usePageMeta();
  const { open: drawerOpen } = useDrawer();
  const { isOpen: chatOpen, toggle: toggleChat } = useChat();
  useEffect(() => {
    setMeta({
      rightSlot: (
        <>
          {tab === "briefs" && (
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
            </>
          )}
          {tab === "audit" && (
            <Button size="md" variant="secondary" onClick={() => setRelaunchOpen(true)}>
              <RefreshCw className="h-4 w-4" />
              Relancer l'audit
            </Button>
          )}
          <Button
            size="md"
            variant="secondary"
            onClick={toggleChat}
            aria-pressed={chatOpen}
          >
            <ChatAiIcon className="h-4 w-4" />
            Demander
          </Button>
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
  }, [tab, gscConnected, ga4Connected, chatOpen, toggleChat, setMeta]);

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
      {/* La nav des sections + sous-onglets (drill-in) est dans la Sidebar. */}

      {/* ── Tab content ── */}
      <div className={`w-full py-5 ${tab !== "briefs" && tab !== "historique" ? "px-5" : ""}`}>
        {/* key={tab} : force le remount du contenu actif → l'animation `t-tab-enter` rejoue
            à chaque changement d'onglet (fade + slide + blur, ~200ms). */}
        <div key={tab} className="t-tab-enter flex flex-col gap-5">

        {/* Titre de la vue + sous-titre éventuel. Skipped pour briefs / tracking / univers /
            recommandations qui rendent leur propre header (title + CTAs sur la même ligne).
            Vue d'ensemble : on accole le nom du projet (lien externe) à droite du titre,
            et la subtitle reprend l'info de fraîcheur GSC/GA4. */}
        {!["briefs", "tracking", "univers", "recommandations", "geo", "opportunites"].includes(tab) && (
          <div className={tab === "historique" ? "px-5" : ""}>
            <div className="flex items-baseline gap-2">
              <h1 className="font-semibold leading-none tracking-heading text-[var(--text-primary)]">
                {TAB_TITLES[tab]}
              </h1>
              {tab === "general" && (
                <h1 className="font-semibold leading-none tracking-heading text-[var(--text-primary)]">
                  {decodedDomain}
                </h1>
              )}
              {tab === "general" && (gscConnected || ga4Connected) && (
                <span className="self-center rounded-full bg-[var(--bg-subtle)] px-2.5 py-1 text-[12px] font-medium text-[var(--text-secondary)]">
                  Mis à jour aujourd&apos;hui
                </span>
              )}
            </div>
            {tab !== "general" && TAB_SUBTITLES[tab] && (
              <p className="mt-1 text-[14px] tracking-body text-[var(--text-secondary)]">
                {TAB_SUBTITLES[tab]}
              </p>
            )}
          </div>
        )}

        {/* Général tab */}
        {tab === "general" && (
          <div className="flex flex-col gap-5">

            {/* Stats globales */}
            <KpiGroup columns={4}>
              <KpiCard bare icon={TrendingUp} label="Trafic organique / mois" value="42 800" delta="+8,4 %" sub="vs N−1" />
              <KpiCard bare icon={LLayers}    label="Pages crawlées"          value="133 / 145" sub="12 pages non indexées" />
              <KpiCard bare icon={LFolderOpen} label="Lots créés"              value="18"     sub="6 actifs · 12 terminés" />
              <KpiCard bare icon={FileText}    label="Analyses générées"          value="147"    sub="63 livrés (43 %)" />
            </KpiGroup>

            {/* Hero — graph visibilité (2/3) + santé du projet en barres (1/3) */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">

              {/* Gauche 2/3 — Visibilité et trafic organique */}
              <div className="min-w-0 overflow-hidden rounded-2xl border border-[var(--border-subtle)] p-5">
                <VisibilityLineChart title="Visibilité et trafic organique" subtitle="Visibilité Haloscan" />
              </div>

              {/* Droite 1/3 — Santé du projet (cards cliquables) */}
              <div className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
                <div className="px-5 pb-4 pt-5">
                  <p className="text-[18px] font-semibold tracking-subheading text-[var(--text-primary)]">Santé du projet</p>
                  <p className="mt-1.5 text-[14px] leading-snug tracking-caption text-[var(--text-secondary)]">
                    Score global <span className="font-semibold">59/100</span>
                  </p>
                </div>

                <div className="flex flex-1 flex-col gap-1 px-2.5 pb-2.5">
                  {([
                    { label: "Technique",    score: healthScores.tech, icon: Settings,  href: `/analyse/${domain}?tab=audit&section=technique` },
                    { label: "Éditorial",    score: 61,                icon: FileText,  href: `/analyse/${domain}?tab=audit&section=editorial` },
                    { label: "Netlinking",   score: 48,                icon: LinkIcon,  href: `/analyse/${domain}?tab=audit&section=netlinking` },
                    { label: "Visibilité IA", score: 41,               icon: LSparkles, href: `/analyse/${domain}?tab=geo` },
                  ] as const).map((s) => {
                    const c = scoreColor(s.score);
                    const status = s.score >= 80 ? "Excellent" : s.score >= 65 ? "Bon" : s.score >= 50 ? "Moyen" : "Faible";
                    return (
                      <button
                        key={s.label}
                        onClick={() => router.push(s.href)}
                        className="group flex flex-1 items-center gap-3 rounded-2xl border border-transparent px-2.5 py-2.5 text-left transition-all hover:border-[var(--border-subtle)] hover:bg-[var(--bg-card-static)]"
                      >
                        <IconBadge icon={s.icon} size="sm" color="var(--text-secondary)" bg="var(--bg-subtle)" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[14px] font-medium text-[var(--text-primary)]">{s.label}</span>
                            <div className="flex items-center gap-1.5">
                              <span
                                className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                                style={{ color: c, backgroundColor: `color-mix(in oklab, ${c} 12%, transparent)` }}
                              >
                                {status}
                              </span>
                              <span className="text-[15px] font-semibold tabular-nums leading-none" style={{ color: c }}>{s.score}</span>
                            </div>
                          </div>
                          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-card-static)]">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.score}%`, backgroundColor: c }} />
                          </div>
                        </div>
                        <ChevronRightIcon className="h-4 w-4 flex-shrink-0 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5" />
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* 4 blocs stratégiques */}
            <div>
              <p className="mb-4 text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">Blocs stratégiques</p>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {contentBlocs(decodedDomain, { onNewBrief: () => setUrlModal("new-brief") }).map((bloc, index) => (
                  <BlocCard key={bloc.title} bloc={bloc} index={index} />
                ))}
              </div>
            </div>

            {/* Action — lots en cours puis pouls du projet, empilés */}
            <div className="flex flex-col gap-5">

              {/* Lots récents */}
              <div>
                <div className="mb-4 flex items-baseline justify-between">
                  <p className="text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">Lots récents</p>
                  <button onClick={() => setTab("briefs")} className="text-[14px] font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">Voir tout</button>
                </div>
                <TagList onNavigate={(tag) => (tag ? openUrlsWithTag(tag) : setTab("briefs"))} columns={4} />
              </div>

              {/* Activités récentes */}
              <div>
                <div className="mb-4 flex items-baseline justify-between">
                  <p className="text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">Activités récentes</p>
                  <button className="text-[14px] font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">Voir tout</button>
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
                      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
                        <a.Icon className="h-4 w-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="truncate text-[14px] font-semibold text-[var(--text-primary)]">{a.label}</p>
                          <ChevronRightIcon className="h-3.5 w-3.5 flex-shrink-0 -translate-x-1 text-[var(--text-muted)] opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100" />
                        </div>
                        <p className="truncate text-[14px] text-[var(--text-secondary)]">{a.desc}</p>
                      </div>
                      <span className="flex-shrink-0 text-[12px] tracking-caption text-[var(--text-muted)]">{a.time}</span>
                    </button>
                  ))}
                </div>
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
            initialTagFilter={pendingTagFilter}
            onTagFilterHandled={() => setPendingTagFilter(null)}
          />
        </div>

        {/* SEO tab */}
        {tab === "seo" && (
          <div className="flex flex-col gap-6">
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
                  <div className="flex flex-col rounded-2xl border border-[var(--border-subtle)] p-7">
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
                  <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] p-7">
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

            <TopPages />
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

        {tab === "benchmark" && <BenchmarkView />}

        {tab === "geo" && <VisibiliteIAView domain={decodedDomain} />}

        {/* Opportunités — hub d'actions : backlog + en-cours, tous leviers, groupés par statut. */}
        {tab === "opportunites" && <OpportunitesView domain={decodedDomain} />}

        {/* Créer du contenu — blocs stratégiques de production (optimiser / identifier / from scratch / GEO). */}
        {tab === "creation" && <CreationView domain={decodedDomain} onNewBrief={() => setUrlModal("new-brief")} />}

        {/* B2 — Historique (onglet "Suivi") : timeline d'actions livrées + impact agrégé par mois. */}
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

        {tab === "audit" && (
          <div className="flex flex-col gap-5">
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
        )}

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

    {relaunchOpen && (
      <RelaunchAuditModal
        onClose={() => setRelaunchOpen(false)}
        onConfirm={(labels) => {
          setRelaunchOpen(false);
          showToast(
            labels.length === 3
              ? "Audit complet relancé"
              : `Audit relancé : ${labels.join(", ")}`,
            <RefreshCw className="h-5 w-5" />,
          );
        }}
      />
    )}
  </>
  );
}

/* ── Modale de relance d'audit ────────────────────────────────────────── */

const AUDIT_KINDS: { key: "technique" | "editorial" | "netlinking"; label: string; desc: string }[] = [
  { key: "technique",  label: "Audit technique",  desc: "Crawl, indexation, performance, schemas" },
  { key: "editorial",  label: "Audit éditorial",  desc: "E-E-A-T, SOSEO, intent, structure Hn" },
  { key: "netlinking", label: "Audit netlinking", desc: "Trust Flow, ancres, backlinks, benchmark" },
];

function RelaunchAuditModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (labels: string[]) => void;
}) {
  const [selected, setSelected] = useState<Record<string, boolean>>({
    technique: true,
    editorial: true,
    netlinking: true,
  });
  const toggle = (k: string) => setSelected((p) => ({ ...p, [k]: !p[k] }));
  const chosen = AUDIT_KINDS.filter((a) => selected[a.key]);

  return (
    <ModalShell onClose={onClose} maxWidth={460}>
      <h2 className="text-[20px] font-semibold tracking-tight text-[var(--text-primary)]">Relancer l'audit</h2>
      <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--text-secondary)]">
        Sélectionnez les audits à relancer. Les autres conservent leurs résultats actuels.
      </p>

      <div className="mt-5 flex flex-col gap-2">
        {AUDIT_KINDS.map((a) => {
          const on = selected[a.key];
          return (
            <button
              key={a.key}
              type="button"
              onClick={() => toggle(a.key)}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
                on
                  ? "border-[var(--accent-primary)] bg-[var(--accent-primary-soft)]"
                  : "border-[var(--border-subtle)] hover:bg-[var(--bg-subtle)]"
              }`}
            >
              <span
                aria-hidden
                className={`flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[5px] border transition-colors ${
                  on ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]" : "border-[var(--border-medium)]"
                }`}
              >
                {on && <CheckIcon className="h-3 w-3 text-white" strokeWidth={3} />}
              </span>
              <span className="min-w-0">
                <span className="block text-[14px] font-medium text-[var(--text-primary)]">{a.label}</span>
                <span className="block text-[12px] text-[var(--text-muted)]">{a.desc}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Annuler</Button>
        <Button onClick={() => onConfirm(chosen.map((a) => a.label))} disabled={chosen.length === 0}>
          <RefreshCw className="h-4 w-4" />
          Relancer {chosen.length > 0 ? `(${chosen.length})` : ""}
        </Button>
      </div>
    </ModalShell>
  );
}
