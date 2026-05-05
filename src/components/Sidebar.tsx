"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { SeoEngineLogo } from "@/components/SeoEngineLogo";
import { SeoEngineWordmark } from "@/components/SeoEngineWordmark";
import { Tooltip } from "@/components/Tooltip";
import {
  Squares2X2Icon as Squares2X2Outline,
  Cog6ToothIcon as Cog6ToothOutline,
  SunIcon,
  MoonIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  PlusIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import {
  Squares2X2Icon as Squares2X2Solid,
  Cog6ToothIcon as Cog6ToothSolid,
} from "@heroicons/react/24/solid";

/* ── Nav config ──────────────────────────────────────────────────────── */

const mainNav = [
  { outline: Squares2X2Outline, solid: Squares2X2Solid, label: "Projets", href: "/" },
];

const PROJECTS = [
  { domain: "leboncoin.fr",       score: 84, logo: true  },
  { domain: "doctolib.fr",        score: 61, logo: true  },
  { domain: "backmarket.com",     score: 73, logo: true  },
  { domain: "sephora.fr",         score: 91, logo: true  },
  { domain: "fnac.com",           score: 78, logo: true  },
  { domain: "mano-mano.fr",       score: 69, logo: false },
  { domain: "cdiscount.com",      score: 82, logo: true  },
  { domain: "lemonde.fr",         score: 88, logo: true  },
  { domain: "kiabi.com",          score: 38, logo: false },
  { domain: "decathlon.fr",       score: 76, logo: true  },
  { domain: "lacoste.com",        score: 80, logo: false },
  { domain: "airbnb.fr",          score: 92, logo: true  },
  { domain: "blablacar.fr",       score: 65, logo: false },
  { domain: "veepee.fr",          score: 71, logo: true  },
];

function scoreColor(score: number) {
  return score >= 70 ? "#10B981" : score >= 50 ? "#F59E0B" : "#E11D48";
}

/* ── Project gradient placeholder ────────────────────────────────────── */

const GRADIENTS = [
  "linear-gradient(to bottom, #3E50F5, #7B8FF8)",
  "linear-gradient(to bottom, #2563eb, #93c5fd)",
  "linear-gradient(to bottom, #4f46e5, #a5b4fc)",
  "linear-gradient(to bottom, #0284c7, #7dd3fc)",
];

function domainGradient(domain: string) {
  let hash = 0;
  for (let i = 0; i < domain.length; i++) hash = (hash * 31 + domain.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

function ProjectPlaceholder({ domain, size = "sm" }: { domain: string; size?: "sm" | "lg" }) {
  const initial = domain.replace(/^www\./, "")[0].toUpperCase();
  const gradient = domainGradient(domain);
  return (
    <div
      className={`flex items-center justify-center font-semibold text-white ${size === "lg" ? "text-[22px]" : "text-[10px]"}`}
      style={{ background: gradient, width: "100%", height: "100%" }}
    >
      {initial}
    </div>
  );
}

/* ── ProjectFavicon ──────────────────────────────────────────────────── */

function ProjectFavicon({ domain, logo }: { domain: string; logo: boolean }) {
  const [custom, setCustom] = useState<string | null>(null);
  const [faviconError, setFaviconError] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`project-logo:${domain}`);
    if (saved) setCustom(saved);

    const onStorage = (e: StorageEvent) => {
      if (e.key === `project-logo:${domain}`) setCustom(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [domain]);

  const showFavicon = !custom && logo && !faviconError;

  return (
    <div className="flex h-6 w-6 overflow-hidden rounded-md border border-[var(--border-subtle)]">
      {custom
        ? <img src={custom} alt={domain} className="h-full w-full object-contain" />
        : showFavicon
          ? <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} alt={domain} onError={() => setFaviconError(true)} className="h-full w-full object-contain" />
          : <ProjectPlaceholder domain={domain} size="sm" />
      }
    </div>
  );
}

/* ── NavItem ─────────────────────────────────────────────────────────── */

function NavItem({
  outline: OutlineIcon,
  solid: SolidIcon,
  label,
  href,
  isActive,
  isExpanded,
}: {
  outline: React.ElementType;
  solid: React.ElementType;
  label: string;
  href: string;
  isActive: boolean;
  isExpanded: boolean;
}) {
  const Icon = isActive ? SolidIcon : OutlineIcon;

  return (
    <Link
      href={href}
      className={`flex h-9 items-center gap-2 rounded-xl text-[13px] font-medium transition-colors duration-150 ${
        isExpanded ? "w-full" : "w-9"
      } ${
        isActive
          ? "bg-accent-primary-soft text-accent-primary"
          : "text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
      }`}
    >
      <Tooltip label={label} side="right" disabled={isExpanded}>
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center">
          <Icon className="h-5 w-5" />
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
    </Link>
  );
}

/* ── Sidebar ─────────────────────────────────────────────────────────── */

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  const sectionClass = (extra = "") =>
    `flex flex-col gap-0.5 py-4 ${isExpanded ? "px-2" : "items-center"} ${extra}`;

  return (
    <aside
      className="relative flex h-full flex-col bg-[var(--bg-sidebar)] transition-all duration-300 flex-shrink-0"
      style={{
        width: isExpanded ? "220px" : "64px",
        transitionTimingFunction: "var(--ease-expo)",
      }}
    >
      {/* Logo */}
      <div className="flex h-14 flex-shrink-0 items-center px-4">
        <SeoEngineLogo className="h-7 w-7 flex-shrink-0 text-[var(--text-primary)]" />
        <SeoEngineWordmark
          className="ml-3 flex-shrink-0 overflow-hidden text-[var(--text-primary)] transition-all duration-300"
          style={{
            height: "16px",
            maxWidth: isExpanded ? "170px" : "0px",
            opacity: isExpanded ? 1 : 0,
            transitionTimingFunction: "var(--ease-expo)",
          }}
        />
      </div>

      {/* Nouveau projet CTA */}
      <div className={`flex w-full flex-col gap-0.5 py-3 ${isExpanded ? "px-2" : "items-center"}`}>
        <Tooltip label="Nouveau projet" side="right" disabled={isExpanded}>
          <button
            onClick={() => {}}
            className={`flex h-9 items-center gap-2 rounded-xl bg-accent-primary text-white transition-opacity hover:opacity-90 ${
              isExpanded ? "w-full" : "w-9"
            }`}
          >
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center">
              <PlusIcon className="h-5 w-5" />
            </span>
            <span
              className="overflow-hidden whitespace-nowrap text-[13px] font-medium transition-all duration-300"
              style={{
                maxWidth: isExpanded ? "160px" : "0px",
                opacity: isExpanded ? 1 : 0,
                transitionTimingFunction: "var(--ease-expo)",
              }}
            >
              Nouveau projet
            </span>
          </button>
        </Tooltip>
      </div>

      {/* Main nav */}
      <nav className={sectionClass()}>
        {mainNav.map((item) => (
          <NavItem
            key={item.href}
            outline={item.outline}
            solid={item.solid}
            label={item.label}
            href={item.href}
            isActive={pathname === item.href}
            isExpanded={isExpanded}
          />
        ))}
      </nav>

      {/* Separator */}
      <div className="mx-auto w-8 border-t border-[var(--border-subtle)]" />

      {/* Projects list — scrollable */}
      <div className={`flex flex-1 flex-col gap-0.5 overflow-y-auto py-3 ${isExpanded ? "px-2" : "items-center"}`}
        style={{ scrollbarWidth: "none" }}>
        {PROJECTS.map((p, i) => {
          const isActive = pathname === `/analyse/${encodeURIComponent(p.domain)}`;
          const color = scoreColor(p.score);
          return (
            <Tooltip key={i} label={p.domain} side="right" disabled={isExpanded} portal>
              <Link
                href={`/analyse/${encodeURIComponent(p.domain)}`}
                className={`group/item flex h-9 flex-shrink-0 items-center rounded-xl transition-colors ${
                  isExpanded ? "w-full gap-2.5" : "w-9 justify-center"
                } ${isActive ? "bg-[var(--bg-secondary)]" : "hover:bg-[var(--bg-secondary)]"}`}
              >
                <span className={`relative flex h-9 w-9 flex-shrink-0 items-center justify-center transition-all duration-200 ${!isActive ? "opacity-60 grayscale group-hover/item:opacity-100 group-hover/item:grayscale-0" : ""}`}>
                  <ProjectFavicon domain={p.domain} logo={p.logo} />
                  {/* Score dot */}
                  <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full border-2 border-[var(--bg-sidebar)]"
                    style={{ backgroundColor: color }} />
                </span>
                <span
                  className="overflow-hidden whitespace-nowrap text-[13px] font-medium text-[var(--text-primary)] transition-all duration-300"
                  style={{
                    maxWidth: isExpanded ? "160px" : "0px",
                    opacity: isExpanded ? 1 : 0,
                    transitionTimingFunction: "var(--ease-expo)",
                  }}
                >
                  {p.domain}
                </span>
              </Link>
            </Tooltip>
          );
        })}
      </div>

      {/* Bottom */}
      <div className={sectionClass("py-3")}>
        <NavItem
          outline={Cog6ToothOutline}
          solid={Cog6ToothSolid}
          label="Paramètres"
          href="/parametres"
          isActive={pathname === "/parametres"}
          isExpanded={isExpanded}
        />

        {/* Theme toggle */}
        <Tooltip label={theme === "dark" ? "Mode clair" : "Mode sombre"} side="right" disabled={isExpanded}>
          <button
            onClick={toggle}
            aria-label="Changer de thème"
            className={`flex h-9 items-center gap-2 rounded-xl text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-secondary)] ${
              isExpanded ? "w-full" : "w-9"
            }`}
          >
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center">
              {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </span>
            <span
              className="overflow-hidden whitespace-nowrap text-[13px] font-medium transition-all duration-300"
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

        {/* Expand toggle */}
        <Tooltip label={isExpanded ? "Réduire" : "Développer"} side="right" disabled={isExpanded}>
          <button
            onClick={() => setIsExpanded((v) => !v)}
            aria-label={isExpanded ? "Réduire" : "Développer"}
            className={`flex h-9 items-center gap-2 rounded-xl text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-secondary)] ${
              isExpanded ? "w-full" : "w-9"
            }`}
          >
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center">
              {isExpanded ? <ChevronLeftIcon className="h-5 w-5" /> : <ChevronRightIcon className="h-5 w-5" />}
            </span>
            <span
              className="overflow-hidden whitespace-nowrap text-[13px] font-medium transition-all duration-300"
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
    </aside>
  );
}
