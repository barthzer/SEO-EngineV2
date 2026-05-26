"use client";

/**
 * Page Équipe — refonte A2.
 *
 * Avant : accordéon façon trombinoscope (qui gère quels projets).
 * Maintenant : tableau dense orienté pilotage (charge, actions ouvertes,
 * briefs en cours, heures cette semaine) + modale détail au clic sur une
 * ligne consultant.
 *
 * Répond à : "Marie est à 130%, Thomas est à 40%" — un patron doit voir
 * sa flotte en 5 secondes.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  XMarkIcon,
  ChevronRightIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";
import { SearchInput } from "@/components/SearchInput";

/* ─────────────────────────────────────────────────────────────────────
   MOCK DATA — version enrichie pilotage
   ───────────────────────────────────────────────────────────────────── */

type ProjectMini = {
  domain: string;
  scoreTechnique: number;
  scoreContenu: number;
  scoreNetlinking: number;
  trafic: string;
  traficDir: "up" | "down" | "neutral";
  actionsOpen: number;
  briefsInProgress: number;
  stage: "actif" | "en pause" | "terminé";
};

type Meeting = {
  client: string;
  date: string; // ISO
  label: string;
};

type Alert = {
  level: "critical" | "warning";
  text: string;
};

type Consultant = {
  id: number;
  name: string;
  avatar: string;
  role: string;
  email: string;
  phone: string;
  hoursThisWeek: number;
  hoursBudget: number;
  projects: ProjectMini[];
  upcomingMeetings: Meeting[];
  alerts: Alert[];
};

const TEAM: Consultant[] = [
  {
    id: 1,
    name: "Barthélemy L.",
    avatar: "BL",
    role: "Lead SEO",
    email: "barthelemy@awi.com",
    phone: "+33 6 12 34 56 78",
    hoursThisWeek: 28,
    hoursBudget: 35,
    projects: [
      { domain: "leboncoin.fr",   scoreTechnique: 84, scoreContenu: 78, scoreNetlinking: 90, trafic: "+12 %", traficDir: "up",   actionsOpen: 7, briefsInProgress: 3, stage: "actif" },
      { domain: "doctolib.fr",    scoreTechnique: 61, scoreContenu: 58, scoreNetlinking: 65, trafic: "−3 %",  traficDir: "down", actionsOpen: 4, briefsInProgress: 1, stage: "actif" },
      { domain: "backmarket.com", scoreTechnique: 73, scoreContenu: 70, scoreNetlinking: 79, trafic: "+5 %",  traficDir: "up",   actionsOpen: 5, briefsInProgress: 2, stage: "actif" },
    ],
    upcomingMeetings: [
      { client: "Leboncoin", date: "2026-05-26", label: "Point hebdo · 14h" },
      { client: "Doctolib", date: "2026-05-28", label: "Steering trimestriel · 10h" },
    ],
    alerts: [
      { level: "critical", text: "Doctolib · −3% trafic semaine, à creuser" },
      { level: "warning", text: "3 actions Backmarket en retard de deadline" },
    ],
  },
  {
    id: 2,
    name: "Sophie M.",
    avatar: "SM",
    role: "Consultante SEO senior",
    email: "sophie@awi.com",
    phone: "+33 6 23 45 67 89",
    hoursThisWeek: 42,
    hoursBudget: 35,
    projects: [
      { domain: "sephora.fr", scoreTechnique: 91, scoreContenu: 88, scoreNetlinking: 94, trafic: "+18 %", traficDir: "up",      actionsOpen: 9, briefsInProgress: 4, stage: "actif" },
      { domain: "fnac.com",   scoreTechnique: 78, scoreContenu: 75, scoreNetlinking: 82, trafic: "+7 %",  traficDir: "up",      actionsOpen: 6, briefsInProgress: 2, stage: "actif" },
      { domain: "kiabi.com",  scoreTechnique: 38, scoreContenu: 42, scoreNetlinking: 35, trafic: "−8 %",  traficDir: "down",    actionsOpen: 11, briefsInProgress: 0, stage: "en pause" },
    ],
    upcomingMeetings: [
      { client: "Sephora", date: "2026-05-26", label: "Présentation rapport mensuel · 9h30" },
      { client: "Fnac", date: "2026-05-27", label: "Sprint review · 16h" },
    ],
    alerts: [
      { level: "critical", text: "Sophie en surcharge : 42h/35h cette semaine" },
      { level: "warning", text: "Kiabi en pause depuis 3 semaines, statut à clarifier" },
    ],
  },
  {
    id: 3,
    name: "Thomas L.",
    avatar: "TL",
    role: "Consultant SEO/SEA",
    email: "thomas@awi.com",
    phone: "+33 6 34 56 78 90",
    hoursThisWeek: 12,
    hoursBudget: 35,
    projects: [
      { domain: "mano-mano.fr",  scoreTechnique: 69, scoreContenu: 65, scoreNetlinking: 73, trafic: "+9 %",  traficDir: "up", actionsOpen: 3, briefsInProgress: 1, stage: "actif" },
      { domain: "cdiscount.com", scoreTechnique: 82, scoreContenu: 78, scoreNetlinking: 86, trafic: "+14 %", traficDir: "up", actionsOpen: 5, briefsInProgress: 2, stage: "actif" },
    ],
    upcomingMeetings: [
      { client: "Cdiscount", date: "2026-05-29", label: "Onboarding nouveau dev SEO · 11h" },
    ],
    alerts: [
      { level: "warning", text: "Sous-charge : 12h/35h, capacité dispo pour nouveau client" },
    ],
  },
  {
    id: 4,
    name: "Marie P.",
    avatar: "MP",
    role: "Content Strategist",
    email: "marie@awi.com",
    phone: "+33 6 45 67 89 01",
    hoursThisWeek: 33,
    hoursBudget: 35,
    projects: [
      { domain: "lemonde.fr",  scoreTechnique: 88, scoreContenu: 92, scoreNetlinking: 84, trafic: "+6 %", traficDir: "up", actionsOpen: 4, briefsInProgress: 5, stage: "actif" },
      { domain: "lefigaro.fr", scoreTechnique: 74, scoreContenu: 86, scoreNetlinking: 70, trafic: "+3 %", traficDir: "up", actionsOpen: 2, briefsInProgress: 0, stage: "terminé" },
    ],
    upcomingMeetings: [
      { client: "Le Monde", date: "2026-05-28", label: "Validation briefs Q3 · 15h" },
    ],
    alerts: [],
  },
];

/* ─────────────────────────────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────────────────────────────── */

const AVATAR_COLORS = ["var(--accent-primary)", "var(--color-success)", "var(--color-warning)", "var(--color-danger)"];

function workloadPct(c: Consultant): number {
  return Math.round((c.hoursThisWeek / c.hoursBudget) * 100);
}

function totalActions(c: Consultant): number {
  return c.projects.reduce((sum, p) => sum + (p.stage === "actif" ? p.actionsOpen : 0), 0);
}

function totalBriefs(c: Consultant): number {
  return c.projects.reduce((sum, p) => sum + (p.stage === "actif" ? p.briefsInProgress : 0), 0);
}

function activeProjectsCount(c: Consultant): number {
  return c.projects.filter((p) => p.stage === "actif").length;
}

function avgScore(p: ProjectMini): number {
  return Math.round((p.scoreTechnique + p.scoreContenu + p.scoreNetlinking) / 3);
}

function workloadColor(pct: number): string {
  if (pct > 110) return "var(--color-danger)";   // surcharge
  if (pct > 90)  return "var(--color-warning)";  // limite
  if (pct < 50)  return "var(--text-muted)";     // sous-charge
  return "var(--color-success)";                  // sain
}

function formatMeetingDate(iso: string): string {
  const d = new Date(iso);
  const days = ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"];
  const months = ["jan", "fév", "mar", "avr", "mai", "juin", "juil", "août", "sep", "oct", "nov", "déc"];
  return `${days[d.getDay()]}. ${d.getDate()} ${months[d.getMonth()]}`;
}

/* ─────────────────────────────────────────────────────────────────────
   SUB-COMPONENTS
   ───────────────────────────────────────────────────────────────────── */

function Avatar({ initials, index, size = 36 }: { initials: string; index: number; size?: number }) {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <div
      className="flex flex-shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}

function WorkloadBar({ pct }: { pct: number }) {
  const color = workloadColor(pct);
  const capped = Math.min(pct, 150); // visuel : on cap à 150% pour la barre
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-1.5 w-24 overflow-hidden rounded-full bg-[var(--border-subtle)]">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all"
          style={{
            width: `${(capped / 150) * 100}%`,
            backgroundColor: color,
            transition: "width 500ms var(--ease-expo, cubic-bezier(0.16, 1, 0.3, 1))",
          }}
        />
        {/* Marker 100% */}
        <div
          className="absolute inset-y-0 w-px bg-[var(--text-muted)] opacity-60"
          style={{ left: `${(100 / 150) * 100}%` }}
          aria-hidden
        />
      </div>
      <span className="text-[12px] font-semibold tabular-nums" style={{ color }}>
        {pct}%
      </span>
    </div>
  );
}

function StageBadge({ stage }: { stage: ProjectMini["stage"] }) {
  const cfg = {
    actif:      { color: "var(--color-success)", bg: "var(--color-success-bg)", label: "Actif" },
    "en pause": { color: "var(--color-warning)", bg: "rgba(245,158,11,0.09)",   label: "En pause" },
    terminé:    { color: "var(--text-muted)",    bg: "var(--bg-secondary)",     label: "Terminé" },
  }[stage];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ color: cfg.color, backgroundColor: cfg.bg }}
    >
      {cfg.label}
    </span>
  );
}

function Favicon({ domain }: { domain: string }) {
  const [error, setError] = useState(false);
  if (error)
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card-hover)]">
        <GlobeAltIcon className="h-3 w-3 text-[var(--text-muted)]" />
      </div>
    );
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
      alt={domain}
      width={24}
      height={24}
      onError={() => setError(true)}
      className="h-6 w-6 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-primary)] object-contain p-0.5"
    />
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
      <p className="text-[11px] font-medium text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-[28px] font-semibold leading-none tracking-tight text-[var(--text-primary)] tabular-nums">{value}</p>
      {sub && <p className="mt-1.5 text-[12px] text-[var(--text-muted)]">{sub}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   MODALE DÉTAIL CONSULTANT
   ───────────────────────────────────────────────────────────────────── */

function ConsultantModal({
  consultant,
  consultantIndex,
  onClose,
}: {
  consultant: Consultant;
  consultantIndex: number;
  onClose: () => void;
}) {
  // ESC pour fermer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const wl = workloadPct(consultant);
  const wlColor = workloadColor(wl);
  const activeCount = activeProjectsCount(consultant);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] px-7 py-5">
          <div className="flex items-center gap-4">
            <Avatar initials={consultant.avatar} index={consultantIndex} size={52} />
            <div>
              <p className="text-[20px] font-semibold tracking-tight text-[var(--text-primary)]">
                {consultant.name}
              </p>
              <p className="text-[13px] text-[var(--text-muted)]">{consultant.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
            aria-label="Fermer"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Contact bar */}
        <div className="flex items-center gap-6 border-b border-[var(--border-subtle)] px-7 py-3 text-[12px] text-[var(--text-secondary)]">
          <a href={`mailto:${consultant.email}`} className="flex items-center gap-1.5 hover:text-[var(--text-primary)]">
            <EnvelopeIcon className="h-4 w-4" /> {consultant.email}
          </a>
          <a href={`tel:${consultant.phone}`} className="flex items-center gap-1.5 hover:text-[var(--text-primary)]">
            <PhoneIcon className="h-4 w-4" /> {consultant.phone}
          </a>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-3 px-7 py-5">
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Projets</p>
            <p className="mt-1.5 text-[22px] font-semibold leading-none text-[var(--text-primary)] tabular-nums">{activeCount}</p>
            <p className="mt-1 text-[11px] text-[var(--text-muted)]">actifs / {consultant.projects.length} total</p>
          </div>
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Actions ouvertes</p>
            <p className="mt-1.5 text-[22px] font-semibold leading-none text-[var(--text-primary)] tabular-nums">{totalActions(consultant)}</p>
            <p className="mt-1 text-[11px] text-[var(--text-muted)]">à traiter</p>
          </div>
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Briefs en cours</p>
            <p className="mt-1.5 text-[22px] font-semibold leading-none text-[var(--text-primary)] tabular-nums">{totalBriefs(consultant)}</p>
            <p className="mt-1 text-[11px] text-[var(--text-muted)]">en rédaction</p>
          </div>
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Charge semaine</p>
            <p className="mt-1.5 text-[22px] font-semibold leading-none tabular-nums" style={{ color: wlColor }}>
              {consultant.hoursThisWeek}h
            </p>
            <p className="mt-1 text-[11px] text-[var(--text-muted)]">/ {consultant.hoursBudget}h budget · {wl}%</p>
          </div>
        </div>

        {/* Alerts */}
        {consultant.alerts.length > 0 && (
          <div className="px-7 pb-5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Points d'attention
            </p>
            <div className="flex flex-col gap-2">
              {consultant.alerts.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-[13px]"
                  style={{
                    borderColor:
                      a.level === "critical"
                        ? "color-mix(in oklab, var(--color-danger) 30%, transparent)"
                        : "color-mix(in oklab, var(--color-warning) 30%, transparent)",
                    backgroundColor:
                      a.level === "critical"
                        ? "color-mix(in oklab, var(--color-danger) 7%, transparent)"
                        : "color-mix(in oklab, var(--color-warning) 7%, transparent)",
                  }}
                >
                  <ExclamationTriangleIcon
                    className="h-4 w-4 flex-shrink-0"
                    style={{
                      color: a.level === "critical" ? "var(--color-danger)" : "var(--color-warning)",
                    }}
                  />
                  <span className="text-[var(--text-primary)]">{a.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        <div className="px-7 pb-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Projets ({consultant.projects.length})
          </p>
          <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)]">
            {consultant.projects.map((p, i) => (
              <Link
                key={p.domain}
                href={`/analyse/${p.domain}`}
                className={`flex items-center gap-4 px-4 py-3 transition-colors hover:bg-[var(--bg-card-hover)] ${
                  i < consultant.projects.length - 1 ? "border-b border-[var(--border-subtle)]" : ""
                }`}
              >
                <Favicon domain={p.domain} />
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-[var(--text-primary)]">{p.domain}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {p.actionsOpen} actions · {p.briefsInProgress} briefs
                  </p>
                </div>
                <StageBadge stage={p.stage} />
                <div
                  className="flex items-center gap-1 text-[12px] tabular-nums"
                  style={{
                    color:
                      p.traficDir === "up"
                        ? "var(--color-success)"
                        : p.traficDir === "down"
                        ? "var(--color-danger)"
                        : "var(--text-muted)",
                  }}
                >
                  {p.traficDir === "up" ? (
                    <ArrowUpIcon className="h-3 w-3" />
                  ) : p.traficDir === "down" ? (
                    <ArrowDownIcon className="h-3 w-3" />
                  ) : null}
                  {p.trafic}
                </div>
                <span className="w-10 text-right text-[13px] font-semibold text-[var(--text-primary)] tabular-nums">
                  {avgScore(p)}
                </span>
                <ChevronRightIcon className="h-4 w-4 text-[var(--text-muted)]" />
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming meetings */}
        {consultant.upcomingMeetings.length > 0 && (
          <div className="px-7 pb-7">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Prochains RDV
            </p>
            <div className="flex flex-col gap-1.5">
              {consultant.upcomingMeetings.map((m, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-primary-bg,var(--bg-secondary))]">
                      <CalendarDaysIcon className="h-4 w-4 text-[var(--accent-primary)]" />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-[var(--text-primary)]">{m.client}</p>
                      <p className="text-[11px] text-[var(--text-muted)]">{m.label}</p>
                    </div>
                  </div>
                  <span className="text-[12px] font-medium tabular-nums text-[var(--text-secondary)]">
                    {formatMeetingDate(m.date)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────────────────────────────── */

export default function EquipePage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<{ consultant: Consultant; index: number } | null>(null);

  const q = search.trim().toLowerCase();
  const filtered = q
    ? TEAM.filter((c) => c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q))
    : TEAM;

  // Stats globales agence
  const allProjects = TEAM.flatMap((c) => c.projects);
  const stats = {
    consultants: TEAM.length,
    activeProjects: allProjects.filter((p) => p.stage === "actif").length,
    totalActions: TEAM.reduce((s, c) => s + totalActions(c), 0),
    avgWorkload: Math.round(TEAM.reduce((s, c) => s + workloadPct(c), 0) / TEAM.length),
    overloaded: TEAM.filter((c) => workloadPct(c) > 110).length,
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto py-[var(--page-py)]">
      <div className="mx-auto w-full max-w-[var(--page-max-w)] px-[var(--page-px)]">

        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-1 font-semibold leading-none tracking-heading text-[var(--text-primary)]">
            Équipe
          </h1>
          <p className="text-[14px] tracking-body text-[var(--text-secondary)]">
            {stats.consultants} consultants · {stats.activeProjects} projets actifs · clic sur une ligne pour le détail
          </p>
        </div>

        {/* Global stats */}
        <div className="mb-8 grid grid-cols-4 gap-4">
          <StatCard label="Projets actifs" value={stats.activeProjects} sub={`portés par ${stats.consultants} consultants`} />
          <StatCard label="Actions à traiter" value={stats.totalActions} sub="cumulé sur l'équipe" />
          <StatCard
            label="Charge moyenne"
            value={`${stats.avgWorkload}%`}
            sub={stats.overloaded > 0 ? `${stats.overloaded} consultant${stats.overloaded > 1 ? "s" : ""} en surcharge` : "équipe équilibrée"}
          />
          <StatCard
            label="Capacité dispo"
            value={`${TEAM.filter((c) => workloadPct(c) < 70).length}`}
            sub="consultant(s) sous-chargé(s)"
          />
        </div>

        {/* Search */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Rechercher un consultant…"
            alwaysExpanded
          />
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
          {/* Table header */}
          <div className="grid grid-cols-[1.6fr_0.9fr_0.6fr_0.7fr_0.7fr_1.2fr_auto] items-center gap-4 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-6 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Consultant</p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Rôle</p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Projets</p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Actions</p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Briefs</p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Charge semaine</p>
            <span className="w-5" aria-hidden />
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-[14px] text-[var(--text-muted)]">
              Aucun consultant ne correspond à « {search} ».
            </div>
          ) : (
            filtered.map((c, ci) => {
              const wl = workloadPct(c);
              const originalIndex = TEAM.indexOf(c);
              return (
                <button
                  key={c.id}
                  onClick={() => setSelected({ consultant: c, index: originalIndex })}
                  className={`grid w-full grid-cols-[1.6fr_0.9fr_0.6fr_0.7fr_0.7fr_1.2fr_auto] items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-[var(--bg-card-hover)] ${
                    ci < filtered.length - 1 ? "border-b border-[var(--border-subtle)]" : ""
                  }`}
                >
                  {/* Consultant */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar initials={c.avatar} index={originalIndex} />
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold text-[var(--text-primary)]">{c.name}</p>
                      <p className="truncate text-[11px] text-[var(--text-muted)]">{c.email}</p>
                    </div>
                  </div>

                  {/* Rôle */}
                  <p className="truncate text-[13px] text-[var(--text-secondary)]">{c.role}</p>

                  {/* Projets actifs */}
                  <p className="text-[13px] font-semibold text-[var(--text-primary)] tabular-nums">
                    {activeProjectsCount(c)}
                  </p>

                  {/* Actions ouvertes */}
                  <div className="flex items-center gap-1.5">
                    <p className="text-[13px] font-semibold text-[var(--text-primary)] tabular-nums">
                      {totalActions(c)}
                    </p>
                    {c.alerts.some((a) => a.level === "critical") && (
                      <ExclamationTriangleIcon
                        className="h-3.5 w-3.5"
                        style={{ color: "var(--color-danger)" }}
                        aria-label="Alertes critiques"
                      />
                    )}
                  </div>

                  {/* Briefs */}
                  <p className="text-[13px] font-semibold text-[var(--text-primary)] tabular-nums">
                    {totalBriefs(c)}
                  </p>

                  {/* Charge */}
                  <WorkloadBar pct={wl} />

                  {/* Chevron */}
                  <ChevronRightIcon className="h-4 w-4 text-[var(--text-muted)]" />
                </button>
              );
            })
          )}
        </div>

      </div>

      {/* Modale détail */}
      {selected && (
        <ConsultantModal
          consultant={selected.consultant}
          consultantIndex={selected.index}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
