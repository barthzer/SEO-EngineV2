"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { SeoEngineLogo } from "@/components/SeoEngineLogo";
import { SeoEngineWordmark } from "@/components/SeoEngineWordmark";
import { Tooltip } from "@/components/Tooltip";
import { DropdownMenu, DropdownItem, DropdownSeparator } from "@/components/DropdownMenu";
import { PROJECTS } from "@/data/projects";
import {
  HomeIcon as HomeOutline,
  Cog6ToothIcon as Cog6ToothOutline,
  UserGroupIcon as UserGroupOutline,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeSolid,
  Cog6ToothIcon as Cog6ToothSolid,
  UserGroupIcon as UserGroupSolid,
} from "@heroicons/react/24/solid";
import {
  UserCircle,
  LogOut,
  Bell as BellLucide,
  Sun as SunLucide,
  Moon as MoonLucide,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const NOTIFS = [
  { id: 1, text: "Analyse de leboncoin.fr terminée", time: "il y a 2 min", unread: true },
  { id: 2, text: "3 nouveaux briefs disponibles dans Tag SEO", time: "il y a 1 h", unread: true },
  { id: 3, text: "Score GEO mis à jour : +7 pts", time: "hier", unread: false },
];
import {
  LayoutDashboard,
  Link as LinkIcon,
  ChartLine,
  Target,
  Tags,
  Lightbulb,
  ClipboardList,
  Copy as CopyIcon,
  Network,
} from "lucide-react";

/* ── Project nav items — toujours visibles, contextualisés par le projet courant ─── */

type ProjectNavItem = { icon: React.ElementType; label: string; tab: string };

const projectNav: ProjectNavItem[] = [
  { icon: LayoutDashboard,  label: "Vue d'ensemble",     tab: "general" },
  { icon: LinkIcon,         label: "URLs",               tab: "briefs" },
  { icon: ClipboardList,    label: "Audit",              tab: "audit" },
  { icon: ChartLine,        label: "Analytics SEO",      tab: "seo" },
  { icon: Target,           label: "Tracking",           tab: "tracking" },
  { icon: CopyIcon,         label: "Cannibalisation",    tab: "cannibal" },
  { icon: Network,          label: "Netlinking",         tab: "netlinking" },
  { icon: Tags,             label: "Univers sémantique", tab: "univers" },
  { icon: Lightbulb,        label: "Recommandations",    tab: "recommandations" },
];

/* ── NavRow primitive ──────────────────────────────────────────────── */

function NavRow({
  icon: Icon,
  label,
  href,
  isActive,
  isExpanded,
  disabled,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive: boolean;
  isExpanded: boolean;
  disabled?: boolean;
  badge?: ReactNode;
}) {
  // Couleur de texte : actif = accent bleu, inactif = primary, disabled = muted
  const colorClass = disabled
    ? "text-[var(--text-muted)] cursor-not-allowed"
    : isActive
      ? "text-[var(--accent-primary)]"
      : "text-[var(--text-primary)]";

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
          <Icon className="h-[14px] w-[14px]" />
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
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { theme, toggle: toggleTheme } = useTheme();
  const unreadCount = NOTIFS.filter((n) => n.unread).length;

  const isProjectPage = pathname.startsWith("/analyse/");
  // L'utilisateur est toujours connecté à un projet : si pas dans l'URL, fallback au dernier consulté ou au premier de la liste.
  const projectFromUrl = isProjectPage
    ? decodeURIComponent(pathname.split("/analyse/")[1]?.split("/")[0] ?? "")
    : undefined;
  const projectDomain = projectFromUrl ?? PROJECTS[0].domain;
  const activeTab = searchParams.get("tab") ?? "general";
  const isHome = pathname === "/";

  return (
    <aside
      className="relative flex h-full flex-col overflow-hidden transition-all duration-300 flex-shrink-0"
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

      {/* ── Main nav ── */}
      <nav
        className={`flex flex-1 flex-col gap-1 overflow-y-auto py-1 ${isExpanded ? "px-2" : "items-center"}`}
        style={{ scrollbarWidth: "none" }}
      >
        {/* Projets (= Accueil) — toujours présent. Le switch entre projets est dans le Topbar. */}
        <NavRow
          icon={isHome ? HomeSolid : HomeOutline}
          label="Projets"
          href="/"
          isActive={isHome}
          isExpanded={isExpanded}
        />

        {/* Section Projet courant — collapse animé sur la page d'accueil */}
        <div
          aria-hidden={isHome}
          className="grid transition-[grid-template-rows,opacity] duration-300 ease-out"
          style={{
            gridTemplateRows: isHome ? "0fr" : "1fr",
            opacity: isHome ? 0 : 1,
          }}
        >
          <div className="overflow-hidden">
            {isExpanded ? (
              <p className="mt-4 px-3 pb-1 text-[11px] font-medium tracking-caption text-[var(--text-muted)]">
                Projet
              </p>
            ) : (
              <div className="my-2 h-px w-6 bg-[var(--border-subtle)]" />
            )}
            <div className="flex flex-col gap-1">
              {projectNav.map((item) => {
                const href = `/analyse/${encodeURIComponent(projectDomain)}?tab=${item.tab}`;
                const isActive = isProjectPage && activeTab === item.tab;
                return (
                  <NavRow
                    key={item.tab}
                    icon={item.icon}
                    label={item.label}
                    href={href}
                    isActive={isActive}
                    isExpanded={isExpanded}
                    disabled={isHome}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Raccourcis globaux — Équipe + Paramètres sous le bloc projet */}
        {isExpanded && (
          <p className="mt-4 px-3 pb-1 text-[11px] font-medium tracking-caption text-[var(--text-muted)]">
            Compte
          </p>
        )}
        {!isExpanded && <div className="my-2 h-px w-6 bg-[var(--border-subtle)]" />}

        <NavRow
          icon={pathname === "/equipe" ? UserGroupSolid : UserGroupOutline}
          label="Équipe"
          href="/equipe"
          isActive={pathname === "/equipe"}
          isExpanded={isExpanded}
        />
        <NavRow
          icon={pathname === "/parametres" ? Cog6ToothSolid : Cog6ToothOutline}
          label="Paramètres"
          href="/parametres"
          isActive={pathname === "/parametres"}
          isExpanded={isExpanded}
        />
      </nav>

      {/* ── Bottom : Notifications + Mode + Compte (dropdown) + Réduire ── */}
      <div className="mx-3 border-t border-[var(--border-subtle)]">
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
                    <BellLucide className="h-[14px] w-[14px]" />
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
                  ? <SunLucide className="h-[14px] w-[14px]" />
                  : <MoonLucide className="h-[14px] w-[14px]" />}
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

          {/* Divider Notifs/Mode ↔ Compte */}
          <div className={`my-1 border-t border-[var(--border-subtle)] ${isExpanded ? "mx-1" : "w-9"}`} />

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

          {/* Divider Compte ↔ Réduire */}
          <div className={`my-1 border-t border-[var(--border-subtle)] ${isExpanded ? "mx-1" : "w-9"}`} />

          {/* Expand / collapse toggle */}
          <Tooltip label={isExpanded ? "Réduire" : "Développer"} side="right" portal disabled={isExpanded}>
            <button
              onClick={() => setIsExpanded((v) => !v)}
              aria-label={isExpanded ? "Réduire" : "Développer"}
              className={`flex h-9 items-center gap-2 rounded-xl text-[14px] font-medium tracking-body text-[var(--text-primary)] transition-colors duration-150 hover:bg-[var(--bg-card-hover)] ${
                isExpanded ? "w-full pr-2" : "w-9"
              }`}
            >
              <span className={`flex h-9 flex-shrink-0 items-center ${isExpanded ? "w-6 justify-end" : "w-9 justify-center"}`}>
                {isExpanded ? <ChevronLeftIcon className="h-[14px] w-[14px]" /> : <ChevronRightIcon className="h-[14px] w-[14px]" />}
              </span>
              <span
                className="overflow-hidden whitespace-nowrap transition-all duration-300"
                style={{
                  maxWidth: isExpanded ? "160px" : "0px",
                  opacity: isExpanded ? 1 : 0,
                  transitionTimingFunction: "var(--ease-expo)",
                }}
              >
                Réduire
              </span>
            </button>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
}
