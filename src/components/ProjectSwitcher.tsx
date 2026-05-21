"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ChevronDownIcon, MagnifyingGlassIcon, Squares2X2Icon, CheckIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Tooltip } from "@/components/Tooltip";
import { Kbd } from "@/components/Kbd";
import { PROJECTS, type Project } from "@/data/projects";

/* ── Favicon helper — favicon Google, fallback initial avec dégradé ─── */

const GRADIENTS = [
  "linear-gradient(to bottom, #3D4FFF, #6877FF)",
  "linear-gradient(to bottom, #2563eb, #93c5fd)",
  "linear-gradient(to bottom, #4f46e5, #a5b4fc)",
  "linear-gradient(to bottom, #0284c7, #7dd3fc)",
];

function domainGradient(domain: string) {
  let hash = 0;
  for (let i = 0; i < domain.length; i++) hash = (hash * 31 + domain.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

export function ProjectFavicon({ domain, logo, size = 20 }: { domain: string; logo: boolean; size?: number }) {
  const [custom, setCustom] = useState<string | null>(null);
  const [faviconError, setFaviconError] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(`project-logo:${domain}`) : null;
    if (saved) setCustom(saved);
    const onStorage = (e: StorageEvent) => {
      if (e.key === `project-logo:${domain}`) setCustom(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [domain]);

  const showFavicon = !custom && logo && !faviconError;
  return (
    <div
      className="flex flex-shrink-0 overflow-hidden rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)]"
      style={{ width: size, height: size }}
    >
      {custom ? (
        <img src={custom} alt={domain} className="h-full w-full object-contain" />
      ) : showFavicon ? (
        <img
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
          alt={domain}
          onError={() => setFaviconError(true)}
          className="h-full w-full object-contain"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center font-semibold text-white"
          style={{ background: domainGradient(domain), fontSize: Math.round(size * 0.5) }}
        >
          {domain.replace(/^www\./, "")[0].toUpperCase()}
        </div>
      )}
    </div>
  );
}

/* ── ProjectSwitcher — trigger + dropdown ──────────────────────────── */

interface Props {
  currentDomain?: string;
  /** Mode sidebar — adapte le trigger pour vivre dans la sidebar.
   *  `true` = pill full-width avec nom, `false` = bouton icône seule.
   *  `undefined` = pill flottante (mode header / topbar). */
  sidebarExpanded?: boolean;
}

const RECENT_KEY = "project-switcher:recent";
const MAX_RECENT = 5;

function getRecent(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"); } catch { return []; }
}

function pushRecent(domain: string) {
  if (typeof window === "undefined") return;
  const next = [domain, ...getRecent().filter((d) => d !== domain)].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

export function ProjectSwitcher({ currentDomain, sidebarExpanded }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [recent, setRecent] = useState<string[]>([]);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ⌘P shortcut — opens the switcher from anywhere
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        triggerRef.current?.click();
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setRecent(getRecent());
    setTimeout(() => inputRef.current?.focus(), 30);
    function onDown(e: MouseEvent) {
      if (popRef.current?.contains(e.target as Node) || triggerRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function toggle() {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 8, left: r.left });
    setSearch("");
    setOpen((v) => !v);
  }

  function navigate(p: Project) {
    pushRecent(p.domain);
    setOpen(false);
    router.push(`/analyse/${encodeURIComponent(p.domain)}`);
  }

  const currentProject = PROJECTS.find((p) => p.domain === currentDomain);
  const q = search.trim().toLowerCase();
  const filtered = q ? PROJECTS.filter((p) => p.domain.toLowerCase().includes(q)) : PROJECTS;
  const recentProjects = q
    ? []
    : recent
        .map((d) => PROJECTS.find((p) => p.domain === d))
        .filter((p): p is Project => !!p && p.domain !== currentDomain)
        .slice(0, 4);

  // L'utilisateur est toujours connecté à un projet — fallback au premier si pas trouvé.
  const project = currentProject ?? PROJECTS[0];
  const isSidebar = sidebarExpanded !== undefined;

  return (
    <>
      {isSidebar ? (
        sidebarExpanded ? (
          /* Sidebar expanded — full pill row, transparent, NavRow-style */
          <button
            ref={triggerRef}
            onClick={toggle}
            className={`group flex h-9 w-full items-center gap-2 rounded-xl pr-2 text-[14px] font-medium tracking-body text-[var(--text-primary)] transition-colors duration-150 ${open ? "bg-[var(--bg-secondary)]" : "hover:bg-[var(--bg-secondary)]"}`}
          >
            <span className="flex h-9 w-6 flex-shrink-0 items-center justify-end">
              <ProjectFavicon domain={project.domain} logo={project.logo} size={18} />
            </span>
            <span className="min-w-0 flex-1 truncate text-left">
              {project.domain}
            </span>
            <ChevronDownIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--text-muted)]" />
          </button>
        ) : (
          /* Sidebar collapsed — icon-only square, avec tooltip portail */
          <Tooltip label={project.domain} side="right" portal>
            <button
              ref={triggerRef}
              onClick={toggle}
              aria-label={project.domain}
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${open ? "bg-[var(--bg-secondary)]" : "hover:bg-[var(--bg-secondary)]"}`}
            >
              <ProjectFavicon domain={project.domain} logo={project.logo} size={18} />
            </button>
          </Tooltip>
        )
      ) : (
        /* Header mode — floating pill (Topbar) */
        <button
          ref={triggerRef}
          onClick={toggle}
          className="group inline-flex h-9 items-center gap-2 rounded-full bg-[var(--bg-secondary)] px-3 transition-colors hover:bg-[var(--bg-overlay)]"
        >
          <ProjectFavicon domain={project.domain} logo={project.logo} size={18} />
          <span className="text-[14px] font-semibold tracking-body text-[var(--text-primary)]">
            {project.domain}
          </span>
          <ChevronDownIcon className="h-3.5 w-3.5 text-[var(--text-muted)] transition-transform group-hover:text-[var(--text-primary)]" />
        </button>
      )}

      {open && typeof window !== "undefined" && createPortal(
        <div
          ref={popRef}
          className="animate-dropdown-down fixed z-[1100] flex flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-[var(--shadow-floating)]"
          style={{ top: pos.top, left: pos.left, width: 360, maxHeight: "min(70vh, 520px)", transformOrigin: "top center" }}
        >
          {/* Search */}
          <div className="flex h-12 flex-shrink-0 items-center gap-2 border-b border-[var(--border-subtle)] px-3">
            <MagnifyingGlassIcon className="h-4 w-4 text-[var(--text-muted)]" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un projet…"
              className="flex-1 bg-transparent text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
            />
            <Kbd>⌘P</Kbd>
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto p-1.5">
            {/* Recents */}
            {recentProjects.length > 0 && (
              <>
                <p className="px-3 pt-1.5 pb-1 text-[11px] font-medium tracking-caption text-[var(--text-muted)]">Récents</p>
                {recentProjects.map((p) => (
                  <ProjectRow key={`recent-${p.domain}`} project={p} onClick={() => navigate(p)} />
                ))}
                <div className="my-1.5 border-t border-[var(--border-subtle)]" />
              </>
            )}

            {/* All projects */}
            <p className="px-3 pt-1.5 pb-1 text-[11px] font-medium tracking-caption text-[var(--text-muted)]">
              {q ? `${filtered.length} résultat${filtered.length > 1 ? "s" : ""}` : "Tous les projets"}
            </p>
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-[12px] text-[var(--text-muted)]">Aucun projet trouvé.</div>
            ) : (
              filtered.map((p) => (
                <ProjectRow
                  key={p.domain}
                  project={p}
                  active={p.domain === currentDomain}
                  onClick={() => navigate(p)}
                />
              ))
            )}
          </div>

          {/* Footer — Voir tous les projets + CTA Nouveau projet (mêmes tailles que les DropdownItem) */}
          <div className="flex flex-shrink-0 flex-col border-t border-[var(--border-subtle)] p-1.5">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[14px] font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-secondary)]"
            >
              <Squares2X2Icon className="h-4 w-4 flex-shrink-0 text-[var(--text-secondary)]" />
              Voir tous les projets
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push("/?new=1");
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[14px] font-medium text-[var(--accent-primary)] transition-colors hover:bg-[var(--accent-primary-soft)]"
            >
              <PlusIcon className="h-4 w-4 flex-shrink-0" />
              Nouveau projet
            </button>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

function ProjectRow({ project, active, onClick }: { project: Project; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-colors hover:bg-[var(--bg-secondary)] ${active ? "bg-[var(--bg-secondary)]" : ""}`}
    >
      <ProjectFavicon domain={project.domain} logo={project.logo} size={20} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium text-[var(--text-primary)]">{project.domain}</p>
      </div>
      {project.status === "archive" && (
        <span className="rounded bg-[var(--bg-subtle)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
          Archivé
        </span>
      )}
      {active && <CheckIcon className="h-4 w-4 flex-shrink-0 text-[var(--accent-primary)]" strokeWidth={2.5} />}
    </button>
  );
}
