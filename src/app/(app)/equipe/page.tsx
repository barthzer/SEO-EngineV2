"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

/* ── Mock data ───────────────────────────────────────────────────────── */

type Project = {
  domain: string;
  score: number;
  trafic: string;
  traficDir: "up" | "down" | "neutral";
  opportunities: number;
  stage: "actif" | "en pause" | "terminé";
};

type Consultant = {
  id: number;
  name: string;
  avatar: string;
  role: string;
  projects: Project[];
};

const TEAM: Consultant[] = [
  {
    id: 1,
    name: "Barthélemy L.",
    avatar: "BL",
    role: "Lead SEO",
    projects: [
      { domain: "leboncoin.fr",   score: 84, trafic: "+12 %", traficDir: "up",   opportunities: 87, stage: "actif" },
      { domain: "doctolib.fr",    score: 61, trafic: "−3 %",  traficDir: "down", opportunities: 43, stage: "actif" },
      { domain: "backmarket.com", score: 73, trafic: "+5 %",  traficDir: "up",   opportunities: 61, stage: "actif" },
    ],
  },
  {
    id: 2,
    name: "Sophie M.",
    avatar: "SM",
    role: "Consultante SEO",
    projects: [
      { domain: "sephora.fr",    score: 91, trafic: "+18 %", traficDir: "up",     opportunities: 112, stage: "actif" },
      { domain: "fnac.com",      score: 78, trafic: "+7 %",  traficDir: "up",     opportunities: 74,  stage: "actif" },
      { domain: "kiabi.com",     score: 55, trafic: "−1 %",  traficDir: "neutral",opportunities: 38,  stage: "en pause" },
    ],
  },
  {
    id: 3,
    name: "Thomas L.",
    avatar: "TL",
    role: "Consultant SEO/SEA",
    projects: [
      { domain: "mano-mano.fr",   score: 69, trafic: "+9 %",  traficDir: "up",   opportunities: 58, stage: "actif" },
      { domain: "cdiscount.com",  score: 82, trafic: "+14 %", traficDir: "up",   opportunities: 99, stage: "actif" },
    ],
  },
  {
    id: 4,
    name: "Marie P.",
    avatar: "MP",
    role: "Content Strategist",
    projects: [
      { domain: "lemonde.fr",    score: 88, trafic: "+6 %",  traficDir: "up",   opportunities: 67, stage: "actif" },
      { domain: "lefigaro.fr",   score: 74, trafic: "+3 %",  traficDir: "up",   opportunities: 49, stage: "terminé" },
    ],
  },
];

/* ── Helpers ─────────────────────────────────────────────────────────── */

function avg(arr: number[]) {
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

const allProjects = TEAM.flatMap((c) => c.projects);
const globalStats = {
  projects: allProjects.length,
  consultants: TEAM.length,
  avgScore: avg(allProjects.map((p) => p.score)),
  totalOpportunities: allProjects.reduce((a, p) => a + p.opportunities, 0),
  actifs: allProjects.filter((p) => p.stage === "actif").length,
};

/* ── Stage badge ─────────────────────────────────────────────────────── */

const STAGE_CONFIG = {
  actif:     { color: "#10B981", bg: "rgba(16,185,129,0.09)" },
  "en pause":{ color: "#F59E0B", bg: "rgba(245,158,11,0.09)" },
  terminé:   { color: "var(--text-muted)", bg: "var(--bg-secondary)" },
};

function StageBadge({ stage }: { stage: Project["stage"] }) {
  const { color, bg } = STAGE_CONFIG[stage];
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize" style={{ color, backgroundColor: bg }}>
      {stage}
    </span>
  );
}

/* ── Score ring (mini) ───────────────────────────────────────────────── */

function ScoreRing({ score, size = 44 }: { score: number; size?: number }) {
  const color = score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : "#E11D48";
  const r = size / 2 - 3;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border-subtle)" strokeWidth={2.5} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={2.5} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-[var(--text-primary)]">
        {score}
      </span>
    </div>
  );
}

/* ── Favicon ─────────────────────────────────────────────────────────── */

function Favicon({ domain }: { domain: string }) {
  const [error, setError] = useState(false);
  if (error) return <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card-hover)]"><GlobeAltIcon className="h-3.5 w-3.5 text-[var(--text-muted)]" /></div>;
  return <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} alt={domain} width={28} height={28} onError={() => setError(true)} className="h-7 w-7 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] object-contain p-1" />;
}

/* ── Avatar ──────────────────────────────────────────────────────────── */

const AVATAR_COLORS = ["#E11D48", "#F59E0B", "#10B981", "#6366F1"];

function Avatar({ initials, index }: { initials: string; index: number }) {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white" style={{ backgroundColor: color }}>
      {initials}
    </div>
  );
}

/* ── Global stat card ────────────────────────────────────────────────── */

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
      <p className="text-[11px] font-medium text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-[28px] font-semibold leading-none tracking-tight text-[var(--text-primary)]">{value}</p>
      {sub && <p className="mt-1 text-[12px] text-[var(--text-muted)]">{sub}</p>}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────── */

export default function EquipePage() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto py-8">
      <div className="w-full px-[var(--page-px)]">

        {/* Header */}
        <div className="mb-8">
          <span className="text-[11px] font-medium text-accent-primary">
            Vue équipe
          </span>
          <h1 className="mt-1.5 text-[28px] font-semibold tracking-tight text-[var(--text-primary)]">
            Tableau de bord équipe
          </h1>
          <p className="mt-1 text-[13px] text-[var(--text-muted)]">
            {globalStats.consultants} consultants · {globalStats.projects} projets actifs
          </p>
        </div>

        {/* Global stats */}
        <div className="mb-8 grid grid-cols-4 gap-4">
          <StatCard label="Projets actifs" value={globalStats.actifs} sub={`sur ${globalStats.projects} total`} />
          <StatCard label="Score moyen" value={globalStats.avgScore} sub="sur 100 · tous projets" />
          <StatCard label="Opportunités" value={globalStats.totalOpportunities} sub="mots-clés identifiés" />
          <StatCard label="Consultants" value={globalStats.consultants} sub="dans l'équipe" />
        </div>

        {/* Consultants */}
        <div className="flex flex-col gap-4">
          {TEAM.map((consultant, ci) => {
            const isOpen = expanded === consultant.id;
            const consultantAvgScore = avg(consultant.projects.map((p) => p.score));
            const activeCount = consultant.projects.filter((p) => p.stage === "actif").length;

            return (
              <div key={consultant.id} className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
                {/* Consultant header */}
                <button
                  onClick={() => setExpanded(isOpen ? null : consultant.id)}
                  className="flex w-full items-center justify-between px-6 py-5"
                >
                  <div className="flex items-center gap-3">
                    <Avatar initials={consultant.avatar} index={ci} />
                    <div className="text-left">
                      <p className="text-[14px] font-semibold text-[var(--text-primary)]">{consultant.name}</p>
                      <p className="text-[12px] text-[var(--text-muted)]">{consultant.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[11px] text-[var(--text-muted)]">Projets</p>
                      <p className="text-[14px] font-semibold text-[var(--text-primary)]">{activeCount} actifs</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-[var(--text-muted)]">Score moy.</p>
                      <p className="text-[14px] font-semibold text-[var(--text-primary)]">{consultantAvgScore}/100</p>
                    </div>
                    <ChevronRightIcon
                      className="h-5 w-5 text-[var(--text-muted)] transition-transform duration-200"
                      style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                    />
                  </div>
                </button>

                {/* Projects list */}
                {isOpen && (
                  <div className="border-t border-[var(--border-subtle)]">
                    {consultant.projects.map((project, pi) => (
                      <div
                        key={project.domain}
                        className={`grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-5 px-6 py-4 transition-colors hover:bg-[var(--bg-secondary)] ${
                          pi < consultant.projects.length - 1 ? "border-b border-[var(--border-subtle)]" : ""
                        }`}
                      >
                        <Favicon domain={project.domain} />

                        <div>
                          <p className="text-[13px] font-medium text-[var(--text-primary)]">{project.domain}</p>
                          <span className="text-[11px] text-[var(--text-muted)]">{project.opportunities} opportunités</span>
                        </div>

                        <StageBadge stage={project.stage} />

                        <div className="flex items-center gap-1 text-[12px]" style={{
                          color: project.traficDir === "up" ? "#10B981" : project.traficDir === "down" ? "#E11D48" : "var(--text-muted)"
                        }}>
                          {project.traficDir === "up" ? <ArrowUpIcon className="h-3 w-3" /> : project.traficDir === "down" ? <ArrowDownIcon className="h-3 w-3" /> : null}
                          {project.trafic}
                        </div>

                        <ScoreRing score={project.score} />

                        <Link
                          href={`/analyse/${project.domain}`}
                          className="flex items-center gap-1 text-[12px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                        >
                          Voir
                          <ChevronRightIcon className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
