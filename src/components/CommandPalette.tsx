"use client";

/**
 * CommandPalette — palette de commandes globale (⌘K / Ctrl+K).
 *
 * Recherche transverse : projets, navigation globale, onglets du projet
 * courant, actions rapides. Navigation clavier (↑ ↓ Enter, Esc pour fermer).
 *
 * Montée une seule fois dans AppShell → disponible partout dans l'app.
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  MagnifyingGlassIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  PlusIcon,
  ArrowRightIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { HomeGlyph } from "@/components/icons/HomeGlyph";
import { useProjects } from "@/context/ProjectsContext";
import { ProjectFavicon } from "@/components/ProjectSwitcher";
import { TABS } from "@/components/analyse/constants";
import { Kbd } from "@/components/Kbd";

type Section = "Navigation" | "Projet courant" | "Projets" | "Actions";

interface Command {
  id: string;
  section: Section;
  label: string;
  /** Sous-texte optionnel (ex. domaine, contexte). */
  hint?: string;
  icon: ReactNode;
  /** Mots-clés additionnels pour le matching. */
  keywords?: string;
  run: () => void;
}

const SECTION_ORDER: Section[] = ["Projet courant", "Navigation", "Projets", "Actions"];

export function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const projects = useProjects();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  /* ── Raccourci ⌘K / Ctrl+K (toggle) + Esc + événement custom (trigger UI) ── */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    function onOpenEvent() { setOpen(true); }
    window.addEventListener("keydown", onKey);
    window.addEventListener("command-palette:open", onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("command-palette:open", onOpenEvent);
    };
  }, [open]);

  /* ── Reset + focus à l'ouverture ── */
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  /* ── Lock scroll quand ouvert ── */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  /* ── Construction des commandes ── */
  const commands = useMemo<Command[]>(() => {
    const list: Command[] = [];
    const iconCls = "h-4 w-4 text-[var(--text-secondary)]";

    // Projet courant — onglets (si on est sur /analyse/[domain])
    const isProjectPage = pathname?.startsWith("/analyse/");
    const currentDomain = isProjectPage
      ? decodeURIComponent(pathname!.split("/analyse/")[1]?.split("/")[0] ?? "")
      : null;
    if (currentDomain) {
      for (const t of TABS) {
        list.push({
          id: `tab-${t.key}`,
          section: "Projet courant",
          label: t.label,
          hint: currentDomain,
          icon: <ArrowRightIcon className={iconCls} />,
          keywords: `${t.label} ${currentDomain} onglet tab`,
          run: () => go(`/analyse/${encodeURIComponent(currentDomain)}?tab=${t.key}`),
        });
      }
    }

    // Navigation globale
    list.push(
      { id: "nav-home", section: "Navigation", label: "Accueil — Projets", icon: <HomeGlyph className={iconCls} />, keywords: "accueil home projets dashboard", run: () => go("/") },
      { id: "nav-team", section: "Navigation", label: "Équipe", icon: <UserGroupIcon className={iconCls} />, keywords: "equipe team consultants", run: () => go("/equipe") },
      { id: "nav-settings", section: "Navigation", label: "Paramètres", icon: <Cog6ToothIcon className={iconCls} />, keywords: "parametres settings reglages agence", run: () => go("/parametres") },
    );

    // Projets
    for (const p of projects) {
      list.push({
        id: `project-${p.domain}`,
        section: "Projets",
        label: p.domain,
        hint: p.status === "archive" ? "Archivé" : undefined,
        icon: <ProjectFavicon domain={p.domain} logo={p.logo} size={18} />,
        keywords: `${p.domain} projet`,
        run: () => go(`/analyse/${encodeURIComponent(p.domain)}`),
      });
    }

    // Actions
    list.push({
      id: "action-new-project",
      section: "Actions",
      label: "Nouveau projet",
      icon: <PlusIcon className={iconCls} />,
      keywords: "nouveau projet new ajouter creer analyse",
      run: () => go("/?new=1"),
    });
    list.push({
      id: "action-assistant",
      section: "Actions",
      label: "Ouvrir l'assistant",
      icon: <SparklesIcon className={iconCls} />,
      keywords: "assistant chat chatbot aide ia question",
      run: () => {
        setOpen(false);
        window.dispatchEvent(new CustomEvent("assistant:open"));
      },
    });

    return list;
  }, [pathname, projects]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Filtrage ── */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) =>
      `${c.label} ${c.hint ?? ""} ${c.keywords ?? ""}`.toLowerCase().includes(q),
    );
  }, [query, commands]);

  /* ── Groupement par section (ordre figé) ── */
  const grouped = useMemo(() => {
    const map = new Map<Section, Command[]>();
    for (const c of filtered) {
      if (!map.has(c.section)) map.set(c.section, []);
      map.get(c.section)!.push(c);
    }
    return SECTION_ORDER.filter((s) => map.has(s)).map((s) => ({ section: s, items: map.get(s)! }));
  }, [filtered]);

  /* Liste à plat (ordre d'affichage) pour la navigation clavier. */
  const flat = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  useEffect(() => { setActiveIndex(0); }, [query]);

  function onInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      flat[activeIndex]?.run();
    }
  }

  // Scroll l'item actif dans la vue
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-cmd-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  if (!open || typeof document === "undefined") return null;

  let flatIdx = -1;

  return createPortal(
    <div className="fixed inset-0 z-[1200] flex items-start justify-center p-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Palette de commandes">
      {/* Click-catcher transparent (clic extérieur → ferme), sans voile ni blur */}
      <div className="absolute inset-0" onClick={() => setOpen(false)} aria-hidden="true" />

      {/* Panel — translucide + backdrop-blur (frosted) + ombre XL */}
      <div
        className="animate-dropdown-down relative z-10 flex w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--dropdown-bg)]/80 shadow-[var(--shadow-floating)] backdrop-blur-md"
        style={{ maxHeight: "min(60vh, 480px)" }}
      >
        {/* Search */}
        <div className="flex flex-shrink-0 items-center gap-2.5 border-b border-[var(--border-subtle)] px-4 py-3.5">
          <MagnifyingGlassIcon className="h-4 w-4 flex-shrink-0 text-[var(--text-muted)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Rechercher un projet, une page, une action…"
            className="flex-1 bg-transparent text-[15px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
          />
          <Kbd>Esc</Kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-1.5">
          {flat.length === 0 ? (
            <div className="px-3 py-10 text-center type-body-sm">
              Aucun résultat pour « {query} ».
            </div>
          ) : (
            grouped.map((g) => (
              <div key={g.section} className="mb-1 last:mb-0">
                <p className="px-3 pt-2 pb-1 type-micro">
                  {g.section}
                </p>
                {g.items.map((c) => {
                  flatIdx += 1;
                  const idx = flatIdx;
                  const active = idx === activeIndex;
                  return (
                    <button
                      key={c.id}
                      data-cmd-index={idx}
                      onClick={c.run}
                      onMouseMove={() => setActiveIndex(idx)}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-colors ${
                        active ? "bg-[var(--bg-secondary)]" : ""
                      }`}
                    >
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center">{c.icon}</span>
                      <span className="flex-1 truncate type-body-strong">
                        {c.label}
                      </span>
                      {c.hint && (
                        <span className="flex-shrink-0 type-caption">{c.hint}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="flex flex-shrink-0 items-center gap-3 border-t border-[var(--border-subtle)] px-4 py-2 type-micro">
          <span className="flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> naviguer</span>
          <span className="flex items-center gap-1"><Kbd>↵</Kbd> ouvrir</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
