"use client";

import { LayoutDashboard, TrendingUp, ChevronRight, Search, Sparkles, Bot, FilePlus, Target, Network } from "lucide-react";
import type { OnboardingData, OnboardingGoal } from "@/types/onboarding";

const GOAL_META: Record<OnboardingGoal, { label: string; icon: React.ElementType; score: number; delta: number }> = {
  audit:      { label: "Audit technique",   icon: Search,   score: 84, delta: +6 },
  optimize:   { label: "Optimisation",      icon: Sparkles, score: 67, delta: +12 },
  geo:        { label: "Visibilité IA",     icon: Bot,      score: 48, delta: -3 },
  missing:    { label: "Pages manquantes",  icon: FilePlus, score: 23, delta: +18 },
  tracking:   { label: "Tracking SERP",     icon: Target,   score: 91, delta: +2 },
  netlinking: { label: "Popularité",        icon: Network,  score: 56, delta: +8 },
};

/**
 * Dashboard preview — pas une modale centrée, mais un vrai dashboard qui occupe
 * la colonne droite, avec cards qui débordent légèrement à droite (effet "cropped product").
 * Le gradient parent reste visible entre les cards.
 */
export function PreviewPane({ data, signedInName }: { data: OnboardingData; step: number; signedInName: string }) {
  const workspaceTitle = data.workspaceName || `Espace ${signedInName}`;
  const projectsCount = data.firstProjectDomain ? 1 : 0;
  const moduleCount = data.goals.length;
  const isProjectValid = data.firstProjectDomain && /^[a-z0-9-]+(\.[a-z]{2,})+$/i.test(data.firstProjectDomain);

  return (
    <div
      className="ml-20 mt-24 h-full rounded-tl-[36px] p-3 pb-0 pr-0 backdrop-blur-md"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.1) 100%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
      }}
    >
    <div className="flex h-full flex-col gap-4 overflow-hidden rounded-tl-[28px] bg-[var(--bg-primary)] p-8 pb-0">
      {/* ─── Header workspace minimal ─── */}
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--accent-primary)] text-[13px] font-semibold text-white">
          {(workspaceTitle.charAt(0) || "G").toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate type-body-strong">{workspaceTitle}</p>
          <p className="type-micro">
            {data.workspaceSlug ? `gse.app/${data.workspaceSlug}` : "Vue d'ensemble · Live"}
          </p>
        </div>
        <button
          type="button"
          aria-hidden="true"
          className="pointer-events-none flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1 type-micro text-[var(--text-secondary)]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
          Live
        </button>
      </div>

      {/* ─── Title gros — comme un H1 de dashboard ─── */}
      <h2 className="mt-8 type-h1">
        Vue d'ensemble
      </h2>

      {/* ─── KPI cards qui débordent à droite (effet dashboard cropped) ─── */}
      <div className="mt-2 flex gap-3 overflow-hidden">
        <KpiCard label="Projets surveillés" value={projectsCount.toString()} delta="+1" up />
        <KpiCard label="Modules activés" value={moduleCount.toString()} delta={moduleCount > 0 ? `+${moduleCount}` : "—"} up={moduleCount > 0} />
        <KpiCard label="Score moyen" value="72" delta="+8%" up />
      </div>

      {/* ─── Card principale : performance par module ─── */}
      <div className="mt-4 rounded-2xl bg-[var(--modal-bg)] p-6 border border-[var(--border-subtle)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="type-title">Performance par module</h3>
          <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
        </div>

        {data.goals.length > 0 ? (
          <div className="flex flex-col gap-4">
            {data.goals.map((g) => {
              const { label, icon: Icon, score, delta } = GOAL_META[g];
              const positive = delta >= 0;
              return (
                <div key={g} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--bg-subtle)] text-[var(--text-primary)]">
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="type-label text-[var(--text-primary)]">{label}</p>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${score}%`,
                          background:
                            "linear-gradient(to right, color-mix(in oklab, var(--accent-primary) 50%, white), var(--accent-primary))",
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="type-body-strong tabular-nums">{score}</span>
                    <span className={`type-micro tabular-nums ${positive ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>
                      {positive ? "+" : ""}{delta}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-[var(--border-subtle)] py-8 text-center">
            <LayoutDashboard className="h-5 w-5 text-[var(--text-muted)]" />
            <p className="type-caption">Sélectionnez vos objectifs pour voir vos modules</p>
          </div>
        )}
      </div>

      {/* ─── Card secondaire : projet (dès domain valide) ─── */}
      {isProjectValid && (
        <div className="mt-2 rounded-2xl bg-[var(--modal-bg)] p-5 border border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <img
              src={`https://www.google.com/s2/favicons?domain=${data.firstProjectDomain}&sz=64`}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 flex-shrink-0 rounded-lg border border-[var(--border-subtle)]"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate type-body-strong">{data.firstProjectDomain}</p>
              <p className="type-micro">Analyse {data.analysisFrequency}</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-success-bg)] px-2.5 py-1 type-micro tabular-nums text-[var(--color-success)]">
              <TrendingUp className="h-3 w-3" />
              +12%
            </span>
          </div>
        </div>
      )}

      <div className="flex-1" />
    </div>
    </div>
  );
}

function KpiCard({ label, value, delta, up }: { label: string; value: string; delta: string; up: boolean }) {
  return (
    <div className="flex-shrink-0 rounded-2xl p-4 border border-[var(--border-subtle)]" style={{ minWidth: 180 }}>
      <p className="type-micro uppercase tracking-[0.06em]">{label}</p>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="type-h1 tabular-nums leading-none">{value}</span>
        <span
          className="type-micro tabular-nums"
          style={{ color: delta === "—" ? "var(--text-muted)" : up ? "var(--color-success)" : "var(--color-danger)" }}
        >
          {delta}
        </span>
      </div>
    </div>
  );
}
