"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { SeoEngineLogo } from "@/components/SeoEngineLogo";
import { SeoEngineWordmark } from "@/components/SeoEngineWordmark";
import { WorkspaceSwitcher } from "@/components/WorkspaceSwitcher";
import { Tooltip } from "@/components/Tooltip";
import { DropdownMenu, DropdownItem, DropdownSeparator } from "@/components/DropdownMenu";
import { useProjects } from "@/context/ProjectsContext";
import { useSidebar } from "@/context/SidebarContext";
import {
  Cog6ToothIcon as Cog6ToothOutline,
  UserGroupIcon as UserGroupOutline,
  ChevronRightIcon, ChevronLeftIcon,
  MagnifyingGlassIcon, RectangleGroupIcon, ArrowsRightLeftIcon,
  ChartBarIcon, ArrowTrendingUpIcon, CurrencyEuroIcon, PresentationChartLineIcon,
  ClockIcon, PencilSquareIcon,
  Squares2X2Icon, EyeIcon, ChatBubbleLeftRightIcon, FaceSmileIcon, LinkIcon, SignalIcon, LightBulbIcon, NewspaperIcon,
  ScaleIcon, TagIcon,
} from "@heroicons/react/24/outline";
import {
  Cog6ToothIcon as Cog6ToothSolid,
  UserGroupIcon as UserGroupSolid,
  Squares2X2Icon as Squares2X2Solid,
  LinkIcon as LinkSolid,
  DocumentTextIcon as DocumentTextSolid,
  ShareIcon as ShareSolid,
  ChartBarIcon as ChartBarSolid,
  SparklesIcon as SparklesSolid,
  TrophyIcon as TrophySolid,
  ClipboardDocumentCheckIcon as ClipboardSolid,
  ClockIcon as ClockSolid,
  BoltIcon as BoltSolid,
  LightBulbIcon as LightBulbSolid,
  PencilSquareIcon as PencilSquareSolid,
  DocumentPlusIcon as DocumentPlusSolid,
} from "@heroicons/react/24/solid";
import { HomeGlyph } from "@/components/icons/HomeGlyph";
import {
  UserCircle,
  LogOut,
  Bell as BellLucide,
  Sun as SunLucide,
  Moon as MoonLucide,
  Brain as BrainLucide,
  Quote as QuoteLucide,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { IconSwap } from "@/components/IconSwap";

const NOTIFS = [
  { id: 1, text: "Analyse de leboncoin.fr terminée", time: "il y a 2 min", unread: true },
  { id: 2, text: "3 nouvelles analyses disponibles dans Tag SEO", time: "il y a 1 h", unread: true },
  { id: 3, text: "Score GEO mis à jour : +7 pts", time: "hier", unread: false },
];
import { NAV_SECTIONS, NAV_GROUPS, TAB_TITLES, NET_VIEWS, type Tab, type NavSection } from "@/components/analyse/constants";
import { GEO_VIEWS } from "@/components/geo/nav";

/* ── Nav projet : sections regroupées (cf. NAV_SECTIONS) ─────────────────
   Les sections multi-onglets ouvrent leur 1er onglet ; la barre de
   sous-onglets de la page analyse gère le switch interne. */

const SECTION_ICONS: Record<string, React.ElementType> = {
  overview:     Squares2X2Solid,
  urls:         LinkSolid,
  contenu:      DocumentTextSolid,
  netlinking:   ShareSolid,
  performance:  ChartBarSolid,
  geo:          SparklesSolid,
  benchmark:    TrophySolid,
  audit:        ClipboardSolid,
  emc:          LightBulbSolid,
  opportunites: BoltSolid,
  creation:     DocumentPlusSolid,
  suivi:        ClockSolid,
  notes:        PencilSquareSolid,
};

/* Pictos des sous-onglets (drill-in) — clés = tabs analyse + vues geo (pas de collision). */
const SUB_ICONS: Record<string, React.ElementType> = {
  // Contenu
  recommandations: MagnifyingGlassIcon,
  univers:         RectangleGroupIcon,
  cannibal:        ArrowsRightLeftIcon,
  // Performance
  seo:             ChartBarIcon,
  tracking:        ArrowTrendingUpIcon,
  sea:             CurrencyEuroIcon,
  forecast:        PresentationChartLineIcon,
  // Suivi
  historique:      ClockIcon,
  notes:           PencilSquareIcon,
  // Netlinking
  autorite:        NewspaperIcon,
  benchmark:       ScaleIcon,
  profil:          TagIcon,
  opportunites:    LightBulbIcon,
  backlinks:       LinkIcon,
  // Visibilité IA
  overview:        Squares2X2Icon,
  visibility:      EyeIcon,
  concurrents:     UserGroupOutline,
  prompts:         ChatBubbleLeftRightIcon,
  platforms:       BrainLucide,
  sentiment:       FaceSmileIcon,
  citations:       QuoteLucide,
  volume:          SignalIcon,
  opportunities:   LightBulbIcon,
  settings:        Cog6ToothOutline,
};

/* ── NavRow primitive ──────────────────────────────────────────────── */

function NavRow({
  icon: Icon,
  iconActive: IconActive,
  label,
  href,
  isActive,
  isExpanded,
  disabled,
  badge,
  trailing,
  onClick,
}: {
  icon: React.ElementType;
  /** Variante solid affichée quand `isActive`. Si fournie → cross-fade via IconSwap (transitions-dev #9) */
  iconActive?: React.ElementType;
  label: string;
  href: string;
  isActive: boolean;
  isExpanded: boolean;
  disabled?: boolean;
  badge?: ReactNode;
  /** Contenu à droite (ex. chevron pour les sections à sous-onglets). */
  trailing?: ReactNode;
  /** Si fourni (et non disabled), la rangée est un bouton (drill-in) au lieu d'un lien. */
  onClick?: () => void;
}) {
  // Couleur de texte : actif = accent bleu, inactif = secondary (primary au survol), disabled = muted
  const colorClass = disabled
    ? "text-[var(--text-muted)] cursor-not-allowed"
    : isActive
      ? "text-[var(--accent-primary)]"
      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]";

  // Bg : actif = soft accent (bleuté), inactif = transparent + hover bg-primary
  // (la sidebar est sur fond bg-secondary, donc bg-primary "ressort" comme une petite carte au hover)
  const bgClass = disabled
    ? ""
    : isActive
      ? "bg-[var(--accent-primary-soft)]"
      : "hover:bg-[var(--bg-card-hover)]";

  const content = (
    <>
      <Tooltip label={label} side="right" portal disabled={isExpanded}>
        <span
          className={`flex h-9 flex-shrink-0 items-center ${isExpanded ? "w-6 justify-end" : "w-9 justify-center"}`}
        >
          {IconActive ? (
            <IconSwap
              state={isActive ? "b" : "a"}
              a={<Icon className="h-4 w-4" />}
              b={<IconActive className="h-4 w-4" />}
            />
          ) : (
            <Icon className="h-4 w-4" />
          )}
        </span>
      </Tooltip>
      <span
        className="overflow-hidden whitespace-nowrap transition-all duration-300"
        style={{
          maxWidth: isExpanded ? "160px" : "0px",
          opacity: isExpanded ? 1 : 0,
          transitionTimingFunction: "var(--ease-expo)",
        }}
      >
        {label}
      </span>
      {isExpanded && trailing && <span className="ml-auto flex items-center pr-1 text-[var(--text-muted)]">{trailing}</span>}
      {isExpanded && badge && <span className="ml-auto pr-2">{badge}</span>}
    </>
  );

  // gap-2 (8px) entre icône (alignée à droite de son slot) et label.
  // Le slot icône fait 24px en expanded (vs 36px en collapsed) pour rapprocher visuellement icône et titre.
  const className = `flex h-9 items-center gap-2 rounded-xl text-[14px] font-medium tracking-body transition-colors duration-150 ${
    isExpanded ? "w-full pr-2" : "w-9"
  } ${colorClass} ${bgClass}`;

  if (disabled) {
    return <div className={className} aria-disabled="true">{content}</div>;
  }
  if (onClick) {
    return <button type="button" onClick={onClick} className={className}>{content}</button>;
  }
  return <Link href={href} className={className}>{content}</Link>;
}

/* ── User mock (à remplacer par la vraie session) ──────────────────── */
const USER = {
  name: "Barthélemy",
  email: "clients.lagenceweb@gmail.com",
  initial: "B",
};

/* ── Sidebar root ──────────────────────────────────────────────────── */

export function Sidebar() {
  const { isExpanded } = useSidebar();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { theme, toggle: toggleTheme } = useTheme();
  const unreadCount = NOTIFS.filter((n) => n.unread).length;
  const projects = useProjects();

  const isProjectPage = pathname.startsWith("/analyse/");
  // L'utilisateur est toujours connecté à un projet : si pas dans l'URL, fallback au dernier consulté ou au premier de la liste.
  const projectFromUrl = isProjectPage
    ? decodeURIComponent(pathname.split("/analyse/")[1]?.split("/")[0] ?? "")
    : undefined;
  const projectDomain = projectFromUrl ?? projects[0]?.domain ?? "";
  const activeTab = searchParams.get("tab") ?? "general";
  const isHome = pathname === "/";

  // ── Drill-in nav (façon Vercel) : sections à sous-onglets ──────────────
  const base = `/analyse/${encodeURIComponent(projectDomain)}`;
  const subView = searchParams.get("view") ?? "overview";
  const hasSub = (s: NavSection) => s.id === "geo" || s.id === "netlinking" || s.tabs.length > 1;
  const subItemsOf = (s: NavSection) =>
    s.id === "geo"
      ? GEO_VIEWS.map((v) => ({ key: v.key as string, label: v.label, icon: SUB_ICONS[v.key], href: `${base}?tab=geo&view=${v.key}`, isActive: activeTab === "geo" && subView === v.key, soon: v.soon }))
      : s.id === "netlinking"
        ? NET_VIEWS.map((v) => ({ key: v.key as string, label: v.label, icon: SUB_ICONS[v.key], href: `${base}?tab=netlinking&view=${v.key}`, isActive: activeTab === "netlinking" && subView === v.key, soon: false }))
        : s.tabs.map((t) => ({ key: t as string, label: TAB_TITLES[t], icon: SUB_ICONS[t], href: `${base}?tab=${t}`, isActive: activeTab === t, soon: false }));
  const activeSection = NAV_SECTIONS.find((s) => (s.tabs as string[]).includes(activeTab));
  const [openSection, setOpenSection] = useState<string | null>(
    isProjectPage && activeSection && hasSub(activeSection) ? activeSection.id : null,
  );
  // Sens de l'animation : "in" = on entre dans une vue (slide depuis la droite),
  // "out" = retour au menu principal (slide depuis la gauche).
  const [navDir, setNavDir] = useState<"in" | "out">("in");
  // Le drill-in reste actif même menu réduit : la sidebar collapsed affiche
  // les pictos des sous-onglets (et non le menu général).
  const drillSection = isProjectPage && !isHome && openSection
    ? NAV_SECTIONS.find((s) => s.id === openSection) ?? null
    : null;

  // Rendu d'une section de nav projet (drill-in si sous-onglets, sinon lien direct).
  const renderSection = (section: NavSection) => {
    const href = `${base}?tab=${section.tabs[0]}`;
    const isActive = isProjectPage && (section.tabs as string[]).includes(activeTab);
    if (hasSub(section)) {
      return (
        <NavRow
          key={section.id}
          icon={SECTION_ICONS[section.id]}
          label={section.label}
          href={href}
          isActive={isActive}
          isExpanded={isExpanded}
          disabled={isHome}
          trailing={<ChevronRightIcon className="h-4 w-4" />}
          onClick={isHome ? undefined : () => { setNavDir("in"); setOpenSection(section.id); router.push(subItemsOf(section)[0].href); }}
        />
      );
    }
    return (
      <NavRow
        key={section.id}
        icon={SECTION_ICONS[section.id]}
        label={section.label}
        href={href}
        isActive={isActive}
        isExpanded={isExpanded}
        disabled={isHome}
      />
    );
  };

  return (
    <aside
      className="relative flex h-full flex-col overflow-hidden bg-[var(--bg-sidebar)] transition-all duration-300 flex-shrink-0"
      style={{
        width: isExpanded ? "240px" : "64px",
        transitionTimingFunction: "var(--ease-expo)",
      }}
    >
      {/* Logo */}
      <div className="flex h-14 flex-shrink-0 items-center px-4">
        <Link href="/" className="flex items-center" aria-label="Accueil">
          <SeoEngineLogo className="h-8 w-8 flex-shrink-0 text-[var(--text-primary)]" />
          <SeoEngineWordmark
            className="ml-3 flex-shrink-0 overflow-hidden text-[20px] text-[var(--text-primary)] transition-all duration-300"
            style={{
              maxWidth: isExpanded ? "170px" : "0px",
              opacity: isExpanded ? 1 : 0,
              transitionTimingFunction: "var(--ease-expo)",
            }}
          />
        </Link>
      </div>

      {/* Workspace switcher (façon Vercel) */}
      <div className={`h-14 flex-shrink-0 ${isExpanded ? "px-2 py-2" : "flex items-center justify-center"}`}>
        <WorkspaceSwitcher isExpanded={isExpanded} />
      </div>

      {/* ── Main nav ── */}
      <nav
        className={`flex flex-1 flex-col gap-1 overflow-y-auto py-1 ${isExpanded ? "px-2" : "items-center"}`}
        style={{ scrollbarWidth: "none" }}
      >
        <div
          key={openSection ?? "__main__"}
          className={`flex flex-col gap-1 ${isExpanded ? "" : "items-center"} ${navDir === "in" ? "sidebar-drill-in" : "sidebar-drill-out"}`}
        >
        {drillSection ? (
          /* ── Drill-in : retour (texte centré, style tab) + sous-onglets ── */
          <>
            <button
              type="button"
              onClick={() => { setNavDir("out"); setOpenSection(null); }}
              className={`relative flex h-9 items-center justify-center rounded-xl text-[14px] font-medium tracking-body text-[var(--text-secondary)] transition-colors duration-150 hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] ${isExpanded ? "w-full px-2" : "w-9"}`}
            >
              <Tooltip label={`Retour · ${drillSection.label}`} side="right" portal disabled={isExpanded}>
                <span className={`flex h-9 items-center justify-center ${isExpanded ? "absolute left-2.5 w-4" : "w-9"}`}>
                  <ChevronLeftIcon className="h-4 w-4 text-[var(--text-muted)]" />
                </span>
              </Tooltip>
              {isExpanded && <span className="truncate px-6">{drillSection.label}</span>}
            </button>
            {subItemsOf(drillSection).map((sub) => (
              <NavRow
                key={sub.key}
                icon={sub.icon}
                label={sub.label}
                href={sub.href}
                isActive={sub.isActive}
                isExpanded={isExpanded}
                disabled={sub.soon}
                badge={sub.soon ? <span className="rounded-full bg-[var(--bg-subtle)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">bientôt</span> : undefined}
              />
            ))}
          </>
        ) : (
          <>
            {/* Projets (= Accueil) — toujours présent. Le switch entre projets est dans le Topbar. */}
            <NavRow icon={HomeGlyph} label="Projets" href="/" isActive={isHome} isExpanded={isExpanded} />

            {/* Section Projet courant — collapse animé sur la page d'accueil */}
            <div
              aria-hidden={isHome}
              className="grid w-full transition-[grid-template-rows,opacity] duration-300 ease-out"
              style={{ gridTemplateRows: isHome ? "0fr" : "1fr", opacity: isHome ? 0 : 1 }}
            >
              <div className="w-full overflow-hidden">
                {/* Deux groupes de nav projet : Analyse (données) puis Actions (pilotage).
                    Chaque groupe a son libellé (menu étendu) ou un séparateur (menu réduit). */}
                {NAV_GROUPS.map((grp) => (
                  <div key={grp.id}>
                    {isExpanded ? (
                      <p className="mt-4 px-3 pb-1 text-[11px] font-medium tracking-caption text-[var(--text-muted)]">{grp.label}</p>
                    ) : (
                      <div className="my-2 h-px w-full bg-[var(--border-subtle)]" />
                    )}
                    <div className={`flex flex-col gap-1 ${isExpanded ? "" : "items-center"}`}>
                      {NAV_SECTIONS.filter((s) => s.group === grp.id).map(renderSection)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Raccourcis globaux — Équipe + Paramètres sous le bloc projet */}
            {isExpanded && (
              <p className="mt-4 px-3 pb-1 text-[11px] font-medium tracking-caption text-[var(--text-muted)]">Compte</p>
            )}
            {!isExpanded && <div className="my-2 h-px w-full bg-[var(--border-subtle)]" />}

            <NavRow icon={UserGroupOutline} iconActive={UserGroupSolid} label="Équipe" href="/equipe" isActive={pathname === "/equipe"} isExpanded={isExpanded} />
            <NavRow icon={Cog6ToothOutline} iconActive={Cog6ToothSolid} label="Paramètres" href="/parametres" isActive={pathname === "/parametres"} isExpanded={isExpanded} />
          </>
        )}
        </div>
      </nav>

      {/* ── Bottom : Notifications + Mode + Compte (dropdown) + Réduire ── */}
      <div className="border-t border-[var(--border-subtle)]">
        <div className={`flex flex-col gap-1 py-3 ${isExpanded ? "px-2" : "items-center"}`}>

          {/* Notifications — bouton avec liste en dropdown */}
          <DropdownMenu
            upward
            align="left"
            width={320}
            trigger={(open) => (
              <Tooltip label="Notifications" side="right" portal disabled={isExpanded}>
                <button
                  aria-label="Notifications"
                  className={`relative flex h-9 items-center gap-2 rounded-xl text-[14px] font-medium tracking-body text-[var(--text-primary)] transition-colors duration-150 ${
                    isExpanded ? "w-full pr-2" : "w-9"
                  } ${open ? "bg-[var(--bg-primary)]" : "hover:bg-[var(--bg-card-hover)]"}`}
                >
                  <span className={`relative flex h-9 flex-shrink-0 items-center ${isExpanded ? "w-6 justify-end" : "w-9 justify-center"}`}>
                    <BellLucide className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute right-0 top-2 h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)]" />
                    )}
                  </span>
                  <span
                    className="overflow-hidden whitespace-nowrap transition-all duration-300"
                    style={{
                      maxWidth: isExpanded ? "160px" : "0px",
                      opacity: isExpanded ? 1 : 0,
                      transitionTimingFunction: "var(--ease-expo)",
                    }}
                  >
                    Notifications
                  </span>
                  {isExpanded && unreadCount > 0 && (
                    <span className="ml-auto rounded-full bg-[var(--accent-primary-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--accent-primary)]">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </Tooltip>
            )}
          >
            <div className="px-3 pb-1 pt-2">
              <p className="text-[13px] font-semibold text-[var(--text-primary)]">Notifications</p>
            </div>
            <DropdownSeparator />
            {NOTIFS.map((n) => (
              <button
                key={n.id}
                className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[var(--bg-secondary)]"
              >
                <span className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${n.unread ? "bg-[var(--accent-primary)]" : "bg-transparent"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium leading-snug text-[var(--text-primary)]">{n.text}</p>
                  <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{n.time}</p>
                </div>
              </button>
            ))}
            <DropdownSeparator />
            <DropdownItem>Voir toutes les notifications</DropdownItem>
          </DropdownMenu>

          {/* Mode clair / sombre — toggle direct */}
          <Tooltip label={theme === "dark" ? "Mode clair" : "Mode sombre"} side="right" portal disabled={isExpanded}>
            <button
              onClick={toggleTheme}
              aria-label="Changer de thème"
              className={`flex h-9 items-center gap-2 rounded-xl text-[14px] font-medium tracking-body text-[var(--text-primary)] transition-colors duration-150 hover:bg-[var(--bg-card-hover)] ${
                isExpanded ? "w-full pr-2" : "w-9"
              }`}
            >
              <span className={`flex h-9 flex-shrink-0 items-center ${isExpanded ? "w-6 justify-end" : "w-9 justify-center"}`}>
                {theme === "dark"
                  ? <SunLucide className="h-4 w-4" />
                  : <MoonLucide className="h-4 w-4" />}
              </span>
              <span
                className="overflow-hidden whitespace-nowrap transition-all duration-300"
                style={{
                  maxWidth: isExpanded ? "160px" : "0px",
                  opacity: isExpanded ? 1 : 0,
                  transitionTimingFunction: "var(--ease-expo)",
                }}
              >
                {theme === "dark" ? "Mode clair" : "Mode sombre"}
              </span>
            </button>
          </Tooltip>

          {/* Compte — bouton avec nom utilisateur, ouvre dropdown Profil/Déconnexion */}
          <DropdownMenu
            upward
            align="left"
            width={240}
            trigger={(open) => (
              <Tooltip label={USER.name} side="right" portal disabled={isExpanded}>
                <button
                  aria-label="Mon compte"
                  className={`flex h-9 items-center gap-2 rounded-xl text-[14px] font-medium tracking-body text-[var(--text-primary)] transition-colors duration-150 ${
                    isExpanded ? "w-full px-2" : "w-9"
                  } ${open ? "bg-[var(--bg-primary)]" : "hover:bg-[var(--bg-card-hover)]"}`}
                >
                  <span className={`flex h-9 flex-shrink-0 items-center justify-center ${isExpanded ? "w-7" : "w-9"}`}>
                    <span
                      className="block h-7 w-7 rounded-full"
                      style={{ background: "linear-gradient(to bottom, #3D4FFF, #6877FF)" }}
                    />
                  </span>
                  <span
                    className="overflow-hidden whitespace-nowrap transition-all duration-300"
                    style={{
                      maxWidth: isExpanded ? "160px" : "0px",
                      opacity: isExpanded ? 1 : 0,
                      transitionTimingFunction: "var(--ease-expo)",
                    }}
                  >
                    {USER.name}
                  </span>
                </button>
              </Tooltip>
            )}
          >
            <div className="flex items-center gap-3 px-3 py-2.5">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--accent-primary)] text-[13px] font-semibold text-white">
                {USER.initial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold text-[var(--text-primary)]">{USER.name}</p>
                <p className="truncate text-[11px] text-[var(--text-muted)]">{USER.email}</p>
              </div>
            </div>
            <DropdownSeparator />
            <DropdownItem icon={UserCircle} onClick={() => router.push("/parametres")}>Mon profil</DropdownItem>
            <DropdownItem icon={UserGroupOutline} onClick={() => router.push("/equipe")}>Équipe</DropdownItem>
            <DropdownItem icon={Cog6ToothOutline} onClick={() => router.push("/parametres")}>Paramètres</DropdownItem>
            <DropdownSeparator />
            <DropdownItem icon={LogOut} danger onClick={() => router.push("/")}>Se déconnecter</DropdownItem>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  );
}
