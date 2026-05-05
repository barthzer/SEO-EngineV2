"use client";

import { useState } from "react";
import Link from "next/link";
import { useDrawer } from "@/context/DrawerContext";
import { Button } from "@/components/Button";
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleSolid,
} from "@heroicons/react/24/solid";

/* ── Types ───────────────────────────────────────────────────────────── */

type Stage = "brief" | "redaction" | "relecture" | "publie";

type Article = {
  id: number;
  title: string;
  url: string;
  keyword: string;
  volume: number;
  wordCount: number;
  stage: Stage;
  assignee: string;
  dueDate: string;
  progress: number;
};

/* ── Mock data ───────────────────────────────────────────────────────── */

const ARTICLES: Article[] = [
  { id: 1, title: "E-E-A-T : Expérience, Expertise, Autorité", url: "/blog/eeat-google", keyword: "eeat google", volume: 1300, wordCount: 2400, stage: "redaction", assignee: "Sophie M.", dueDate: "2 mai", progress: 65 },
  { id: 2, title: "Schema.org et données structurées", url: "/blog/schema-org", keyword: "données structurées seo", volume: 1100, wordCount: 1800, stage: "relecture", assignee: "Thomas L.", dueDate: "30 avr.", progress: 90 },
  { id: 3, title: "Stratégie de contenu pilier", url: "/blog/contenu-pilier", keyword: "content hub seo", volume: 880, wordCount: 2600, stage: "brief", assignee: "Sophie M.", dueDate: "5 mai", progress: 15 },
  { id: 4, title: "SEO vs SEA : quelle stratégie ?", url: "/blog/seo-vs-sea", keyword: "seo vs sea", volume: 2400, wordCount: 1600, stage: "publie", assignee: "Thomas L.", dueDate: "22 avr.", progress: 100 },
  { id: 5, title: "Optimisation du taux de clic", url: "/blog/optimiser-ctr", keyword: "améliorer ctr google", volume: 1900, wordCount: 1400, stage: "redaction", assignee: "Marie P.", dueDate: "4 mai", progress: 40 },
  { id: 6, title: "Rédaction SEO : le guide", url: "/blog/redaction-seo", keyword: "rédaction seo", volume: 1600, wordCount: 2000, stage: "brief", assignee: "Marie P.", dueDate: "8 mai", progress: 0 },
  { id: 7, title: "Audit Core Web Vitals", url: "/blog/core-web-vitals", keyword: "core web vitals", volume: 2100, wordCount: 1600, stage: "publie", assignee: "Thomas L.", dueDate: "18 avr.", progress: 100 },
];

/* ── Stage config ────────────────────────────────────────────────────── */

const STAGES: { key: Stage; label: string; color: string; colorBg: string }[] = [
  { key: "brief",     label: "Brief",     color: "#6366F1", colorBg: "rgba(99,102,241,0.09)" },
  { key: "redaction", label: "Rédaction", color: "#F59E0B", colorBg: "rgba(245,158,11,0.09)" },
  { key: "relecture", label: "Relecture", color: "#0EA5E9", colorBg: "rgba(14,165,233,0.09)" },
  { key: "publie",    label: "Publié",    color: "#10B981", colorBg: "rgba(16,185,129,0.09)" },
];

const STAGE_MAP = Object.fromEntries(STAGES.map((s) => [s.key, s])) as Record<Stage, (typeof STAGES)[number]>;

/* ── Progress bar ────────────────────────────────────────────────────── */

function ProgressBar({ progress, color }: { progress: number; color: string }) {
  return (
    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--bg-card-hover)]">
      <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: color }} />
    </div>
  );
}

/* ── Kanban column ───────────────────────────────────────────────────── */

function KanbanColumn({
  stage,
  articles,
  onOpen,
}: {
  stage: (typeof STAGES)[number];
  articles: Article[];
  onOpen: (a: Article) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Column header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.color }} />
          <span className="text-[13px] font-semibold text-[var(--text-primary)]">{stage.label}</span>
        </div>
        <span className="rounded-full px-3 py-1.5 text-[12px] font-medium" style={{ color: stage.color, backgroundColor: stage.colorBg }}>
          {articles.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2.5">
        {articles.map((a) => (
          <button
            key={a.id}
            onClick={() => onOpen(a)}
            className="group flex flex-col gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--modal-bg)] p-4 text-left transition-colors hover:border-[var(--border-medium)]"
          >
            <p className="text-[13px] font-medium leading-snug text-[var(--text-primary)]">{a.title}</p>

            <div className="flex items-center justify-between">
              <ProgressBar progress={a.progress} color={stage.color} />
              <span className="text-[11px] font-medium tabular-nums" style={{ color: stage.color }}>{a.progress}%</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[var(--text-muted)]">{a.assignee}</span>
              <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
                <ClockIcon className="h-3 w-3" />
                {a.dueDate}
              </div>
            </div>
          </button>
        ))}

        {articles.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[var(--border-medium)] px-4 py-6 text-center text-[12px] text-[var(--text-muted)]">
            Aucun article
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Article drawer ──────────────────────────────────────────────────── */

function ArticleDrawer({ article: a }: { article: Article }) {
  const stage = STAGE_MAP[a.stage];

  return (
    <div className="space-y-6">
      {/* Stage + progress */}
      <div>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium" style={{ color: stage.color, backgroundColor: stage.colorBg }}>
            {stage.label}
          </span>
          <span className="text-[13px] font-semibold tabular-nums" style={{ color: stage.color }}>{a.progress}%</span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--bg-card-hover)]">
          <div className="h-full rounded-full transition-all" style={{ width: `${a.progress}%`, backgroundColor: stage.color }} />
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-[var(--border-subtle)] p-4">
          <p className="text-[11px] text-[var(--text-muted)]">Assigné à</p>
          <p className="mt-1 text-[14px] font-semibold text-[var(--text-primary)]">{a.assignee}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border-subtle)] p-4">
          <p className="text-[11px] text-[var(--text-muted)]">Échéance</p>
          <p className="mt-1 text-[14px] font-semibold text-[var(--text-primary)]">{a.dueDate}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border-subtle)] p-4">
          <p className="text-[11px] text-[var(--text-muted)]">Mots cibles</p>
          <p className="mt-1 text-[14px] font-semibold text-[var(--text-primary)]">{a.wordCount.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border-subtle)] p-4">
          <p className="text-[11px] text-[var(--text-muted)]">Volume KW</p>
          <p className="mt-1 text-[14px] font-semibold text-[var(--text-primary)]">{a.volume.toLocaleString()}</p>
        </div>
      </div>

      {/* Keyword */}
      <div>
        <p className="mb-1 text-[11px] text-[var(--text-muted)]">Mot-clé principal</p>
        <p className="font-mono text-[14px] text-[var(--text-primary)]">{a.keyword}</p>
      </div>

      {/* URL */}
      <div>
        <p className="mb-1 text-[11px] text-[var(--text-muted)]">URL cible</p>
        <p className="font-mono text-[13px] text-[var(--text-secondary)]">{a.url}</p>
      </div>

      {/* Checklist */}
      <div>
        <p className="mb-3 text-[11px] text-[var(--text-muted)]">Checklist</p>
        <div className="space-y-2">
          {[
            { label: "Brief validé", done: a.progress >= 15 },
            { label: "Rédaction complète", done: a.progress >= 65 },
            { label: "Relecture & corrections", done: a.progress >= 90 },
            { label: "Publication", done: a.progress === 100 },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2.5 text-[13px]">
              {item.done
                ? <CheckCircleSolid className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                : <div className="h-4 w-4 flex-shrink-0 rounded-full border-2 border-[var(--border-medium)]" />
              }
              <span className={item.done ? "text-[var(--text-secondary)] line-through" : "text-[var(--text-primary)]"}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Button size="lg" className="w-full">
        <PlayIcon className="h-5 w-5" />
        Générer le contenu IA
      </Button>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────── */

type View = "kanban" | "liste";

export default function ProductionPage() {
  const [view, setView] = useState<View>("kanban");
  const { open } = useDrawer();

  const byStage = (stage: Stage) => ARTICLES.filter((a) => a.stage === stage);

  const stats = {
    total: ARTICLES.length,
    publie: byStage("publie").length,
    enCours: byStage("redaction").length + byStage("relecture").length,
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto py-8">
      <div className="w-full px-[var(--page-px)]">

        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="mb-4 inline-flex items-center gap-1.5 text-[12px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Projets
          </Link>
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[11px] font-medium text-accent-primary">
                Niveau 4 — Production
              </span>
              <h1 className="mt-1.5 text-[28px] font-semibold tracking-tight text-[var(--text-primary)]">
                Pipeline de production
              </h1>
              <p className="mt-1 text-[13px] text-[var(--text-muted)]">
                {stats.total} articles · {stats.enCours} en cours · {stats.publie} publiés
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="flex items-center gap-1 rounded-2xl bg-[var(--bg-secondary)] p-1">
                {(["kanban", "liste"] as View[]).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className="rounded-xl px-3 py-1.5 text-[13px] font-medium capitalize transition-all"
                    style={
                      view === v
                        ? { backgroundColor: "var(--modal-bg)", color: "var(--text-primary)", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }
                        : { color: "var(--text-muted)" }
                    }
                  >
                    {v}
                  </button>
                ))}
              </div>
              <Button size="sm">
                <ChevronRightIcon className="h-3.5 w-3.5" />
                Ajouter un article
              </Button>
            </div>
          </div>
        </div>

        {/* Kanban */}
        {view === "kanban" && (
          <div className="grid grid-cols-4 gap-5">
            {STAGES.map((stage) => (
              <KanbanColumn
                key={stage.key}
                stage={stage}
                articles={byStage(stage.key)}
                onOpen={(a) => open(`Article — ${a.title}`, <ArticleDrawer article={a} />)}
              />
            ))}
          </div>
        )}

        {/* Liste */}
        {view === "liste" && (
          <div className="rounded-3xl border border-[var(--border-subtle)]">
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-6 border-b border-[var(--border-subtle)] px-5 py-3">
              {["Article", "Étape", "Assigné", "Échéance", ""].map((h) => (
                <span key={h} className="text-[11px] font-medium text-[var(--text-muted)]">{h}</span>
              ))}
            </div>
            {ARTICLES.map((a, i) => {
              const stage = STAGE_MAP[a.stage];
              return (
                <div
                  key={a.id}
                  className={`group grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-6 px-5 py-4 transition-colors hover:bg-[var(--bg-secondary)] ${i < ARTICLES.length - 1 ? "border-b border-[var(--border-subtle)]" : ""}`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-medium text-[var(--text-primary)]">{a.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <ProgressBar progress={a.progress} color={stage.color} />
                      <span className="text-[11px] tabular-nums" style={{ color: stage.color }}>{a.progress}%</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full px-3 py-1.5 text-[12px] font-medium" style={{ color: stage.color, backgroundColor: stage.colorBg }}>
                    {stage.label}
                  </span>
                  <span className="text-[13px] text-[var(--text-secondary)]">{a.assignee}</span>
                  <span className="flex items-center gap-1 text-[12px] text-[var(--text-muted)]">
                    <ClockIcon className="h-3.5 w-3.5" />
                    {a.dueDate}
                  </span>
                  <button
                    onClick={() => open(`Article — ${a.title}`, <ArticleDrawer article={a} />)}
                    className="flex items-center gap-1 text-[12px] font-medium text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100 hover:text-[var(--text-primary)]"
                  >
                    Détail <ChevronRightIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
