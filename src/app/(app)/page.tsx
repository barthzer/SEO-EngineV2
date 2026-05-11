"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SkeletonAnalysisCard } from "@/components/Skeleton";
import Link from "next/link";
import { useDrawer } from "@/context/DrawerContext";
import { SeoEngineLogo } from "@/components/SeoEngineLogo";
import { Button } from "@/components/Button";
import { FilterTabs } from "@/components/FilterTabs";
import { EmptyState } from "@/components/EmptyState";
import { DropdownMenu, DropdownItem } from "@/components/DropdownMenu";
import { SearchInput } from "@/components/SearchInput";
import {
  ArrowUpIcon,
  MinusIcon,
  ArrowRightIcon,
  PlusIcon,
  GlobeAltIcon,
  FolderOpenIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { Stepper } from "@/components/Stepper";

/* ── Mock analyses ───────────────────────────────────────────────────── */

type Analysis = {
  id: number;
  domain: string;
  updatedAt: string; // ISO date string
  gscConnected: boolean;
  score: number;
  trafic: string;
  traficDir: "up" | "down" | "neutral";
  lotsActifs: number;
  briefs: number;
  status: "actif" | "archive";
};

const MOCK_ANALYSES: Analysis[] = [
  { id: 1,  domain: "leboncoin.fr",      updatedAt: "2026-04-28", gscConnected: true,  score: 84, trafic: "+12 %", traficDir: "up",   lotsActifs: 6,  briefs: 42,  status: "actif"   },
  { id: 2,  domain: "doctolib.fr",       updatedAt: "2026-04-15", gscConnected: true,  score: 61, trafic: "−3 %",  traficDir: "down", lotsActifs: 2,  briefs: 18,  status: "actif"   },
  { id: 3,  domain: "backmarket.com",    updatedAt: "2026-04-02", gscConnected: false, score: 73, trafic: "+5 %",  traficDir: "up",   lotsActifs: 4,  briefs: 31,  status: "actif"   },
  { id: 4,  domain: "sephora.fr",        updatedAt: "2026-04-28", gscConnected: true,  score: 91, trafic: "+18 %", traficDir: "up",   lotsActifs: 9,  briefs: 67,  status: "actif"   },
  { id: 5,  domain: "fnac.com",          updatedAt: "2026-04-24", gscConnected: false, score: 78, trafic: "+7 %",  traficDir: "up",   lotsActifs: 5,  briefs: 38,  status: "actif"   },
  { id: 6,  domain: "decathlon.fr",      updatedAt: "2026-04-22", gscConnected: true,  score: 87, trafic: "+9 %",  traficDir: "up",   lotsActifs: 7,  briefs: 55,  status: "actif"   },
  { id: 7,  domain: "lafourchette.com",  updatedAt: "2026-04-19", gscConnected: false, score: 66, trafic: "+2 %",  traficDir: "up",   lotsActifs: 3,  briefs: 22,  status: "actif"   },
  { id: 8,  domain: "boulanger.com",     updatedAt: "2026-04-17", gscConnected: false, score: 71, trafic: "−1 %",  traficDir: "down", lotsActifs: 4,  briefs: 29,  status: "actif"   },
  { id: 9,  domain: "veepee.fr",         updatedAt: "2026-04-14", gscConnected: true,  score: 58, trafic: "+4 %",  traficDir: "up",   lotsActifs: 2,  briefs: 15,  status: "actif"   },
  { id: 10, domain: "blablacar.fr",      updatedAt: "2026-04-10", gscConnected: false, score: 79, trafic: "+11 %", traficDir: "up",   lotsActifs: 5,  briefs: 41,  status: "actif"   },
  { id: 11, domain: "mano-mano.fr",      updatedAt: "2026-04-20", gscConnected: true,  score: 69, trafic: "+9 %",  traficDir: "up",   lotsActifs: 3,  briefs: 24,  status: "archive" },
  { id: 12, domain: "cdiscount.com",     updatedAt: "2026-04-18", gscConnected: false, score: 82, trafic: "+14 %", traficDir: "up",   lotsActifs: 7,  briefs: 54,  status: "archive" },
  { id: 13, domain: "lemonde.fr",        updatedAt: "2026-04-12", gscConnected: true,  score: 88, trafic: "+6 %",  traficDir: "up",   lotsActifs: 8,  briefs: 61,  status: "archive" },
  { id: 14, domain: "kiabi.com",         updatedAt: "2026-04-05", gscConnected: false, score: 38, trafic: "−8 %",  traficDir: "down", lotsActifs: 1,  briefs: 9,   status: "archive" },
  { id: 15, domain: "darty.com",         updatedAt: "2026-04-03", gscConnected: true,  score: 74, trafic: "+3 %",  traficDir: "up",   lotsActifs: 5,  briefs: 37,  status: "archive" },
  { id: 16, domain: "leroymerlin.fr",    updatedAt: "2026-04-01", gscConnected: true,  score: 92, trafic: "+21 %", traficDir: "up",   lotsActifs: 11, briefs: 89,  status: "archive" },
  { id: 17, domain: "seloger.com",       updatedAt: "2026-03-28", gscConnected: false, score: 55, trafic: "−5 %",  traficDir: "down", lotsActifs: 2,  briefs: 13,  status: "archive" },
  { id: 18, domain: "lequipe.fr",        updatedAt: "2026-03-25", gscConnected: true,  score: 83, trafic: "+16 %", traficDir: "up",   lotsActifs: 6,  briefs: 48,  status: "archive" },
];

/* ── Score circle ────────────────────────────────────────────────────── */

function ScoreCircle({ score }: { score: number }) {
  const color = score >= 70 ? "#10B981" : score >= 50 ? "#F97316" : "#E11D48";
  const r = 22;
  const stroke = 3;
  const size = (r + stroke) * 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border-subtle)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-[12px] font-semibold text-[var(--text-primary)]"
      >
        {score}
      </span>
    </div>
  );
}

/* ── Relative time ───────────────────────────────────────────────────── */

const REFERENCE_NOW = new Date("2026-05-06").getTime();
function relativeTime(iso: string): string {
  const days = Math.floor((REFERENCE_NOW - new Date(iso).getTime()) / 86_400_000);
  if (days < 1) return "Aujourd'hui";
  if (days === 1) return "Il y a 1 jour";
  if (days < 30) return `Il y a ${days} jours`;
  const months = Math.floor(days / 30);
  return months === 1 ? "Il y a 1 mois" : `Il y a ${months} mois`;
}

/* ── Trafic chip ─────────────────────────────────────────────────────── */

function TraficChip({ value, dir }: { value: string; dir: Analysis["traficDir"] }) {
  const isUp = dir === "up";
  const isDown = dir === "down";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[12px] font-medium ${
        isUp
          ? "bg-emerald-50 text-emerald-600"
          : isDown
          ? "bg-red-50 text-red-500"
          : "bg-[var(--bg-secondary)] text-[var(--text-muted)]"
      }`}
    >
      {isUp ? <ArrowUpIcon className="h-3 w-3" /> : isDown ? <MinusIcon className="h-3 w-3" /> : null}
      {value}
    </span>
  );
}

/* ── Drawer contents ─────────────────────────────────────────────────── */

function MetricRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--border-subtle)] py-3 last:border-0">
      <span className="text-[13px] text-[var(--text-secondary)]">{label}</span>
      <div className="text-right">
        <span className="text-[14px] font-semibold text-[var(--text-primary)]">{value}</span>
        {sub && <span className="ml-2 text-[11px] text-[var(--text-muted)]">{sub}</span>}
      </div>
    </div>
  );
}

function ChartPlaceholder({ label }: { label: string }) {
  return (
    <div className="mt-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-hover)] p-4">
      <p className="mb-3 text-[11px] font-medium text-[var(--text-muted)]">{label}</p>
      <div className="flex h-28 items-end gap-1.5">
        {[40, 55, 45, 65, 72, 60, 80, 75, 84, 90, 78, 95].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm"
            style={{ height: `${h}%`, backgroundColor: "var(--accent-primary)", opacity: 0.15 + (h / 95) * 0.55 }}
          />
        ))}
      </div>
    </div>
  );
}

function SeoDrawerContent({ domain }: { domain: string }) {
  return (
    <div>
      <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
        Données Google Search Console · <strong className="text-[var(--text-primary)]">{domain}</strong>
      </p>
      <div className="mt-5">
        <MetricRow label="Trafic organique (30j)" value="14 280 clics" sub="+12 % vs mois préc." />
        <MetricRow label="Position moyenne" value="18,4" sub="-2,1 pts" />
        <MetricRow label="Mots-clés top 10" value="312" sub="+8 ce mois" />
        <MetricRow label="Pages indexées" value="1 048" />
        <MetricRow label="CTR moyen" value="3,2 %" sub="stable" />
        <MetricRow label="Impressions (30j)" value="447 000" />
      </div>
      <ChartPlaceholder label="Évolution du trafic — 12 semaines" />
    </div>
  );
}

/* ── Analysis card ───────────────────────────────────────────────────── */

function SiteLogo({ domain }: { domain: string }) {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-subtle)]">
        <GlobeAltIcon className="h-6 w-6 text-[var(--text-muted)]" />
      </div>
    );
  }
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
      alt={domain}
      width={48}
      height={48}
      onError={() => setError(true)}
      className="h-12 w-12 rounded-2xl object-contain border border-[var(--border-subtle)]"
    />
  );
}

function StatusPill({
  status,
  onChange,
}: {
  status: Analysis["status"];
  onChange: (s: Analysis["status"]) => void;
}) {
  const isActif = status === "actif";

  return (
    <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
      <DropdownMenu
        width={176}
        trigger={
          <button className="flex items-center gap-1.5 rounded-full bg-[var(--bg-secondary)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--border-subtle)]">
            <span className={`h-1.5 w-1.5 rounded-full ${isActif ? "bg-emerald-500" : "bg-[var(--text-muted)]"}`} />
            {isActif ? "Actif" : "Archivé"}
          </button>
        }
      >
        {(["actif", "archive"] as const).map((s) => (
          <DropdownItem key={s} onClick={() => onChange(s)}>
            <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${s === "actif" ? "bg-emerald-500" : "bg-[var(--text-muted)]"}`} />
            <span className={status === s ? "font-semibold text-[var(--text-primary)]" : ""}>{s === "actif" ? "Actif" : "Archivé"}</span>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </div>
  );
}

function GscPill({ connected }: { connected: boolean }) {
  return (
    <span
      className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium"
      style={{
        borderColor: connected ? "#10B981" : "#E11D48",
        color: connected ? "#10B981" : "#E11D48",
      }}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-500" : "bg-red-500"}`} />
      GSC
    </span>
  );
}

function AnalysisCard({
  analysis: a,
  onStatusChange,
}: {
  analysis: Analysis;
  onStatusChange: (s: Analysis["status"]) => void;
}) {
  return (
    <Link
      href={`/analyse/${a.domain}`}
      className="group flex flex-col rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 transition-colors hover:border-[var(--border-medium)] hover:bg-[var(--bg-card-hover)]"
    >
      {/* Logo + domain + score */}
      <div className="flex items-center gap-3">
        <SiteLogo domain={a.domain} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">{a.domain}</p>
        </div>
        <ScoreCircle score={a.score} />
      </div>

      {/* Metrics */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="flex flex-col gap-1.5 px-1 py-1">
          <p className="text-[10px] text-[var(--text-muted)]">Trafic/mois</p>
          <p className="text-[18px] font-semibold leading-none" style={{ color: a.traficDir === "up" ? "#10B981" : a.traficDir === "down" ? "#E11D48" : "var(--text-muted)" }}>
            {a.trafic}
          </p>
          <p className="text-[10px] text-[var(--text-muted)]">vs N−1</p>
        </div>
        <div className="flex flex-col gap-1.5 px-1 py-1">
          <p className="text-[10px] text-[var(--text-muted)]">Lots actifs</p>
          <p className="text-[18px] font-semibold leading-none text-[var(--text-primary)]">{a.lotsActifs}</p>
        </div>
        <div className="flex flex-col gap-1.5 px-1 py-1">
          <p className="text-[10px] text-[var(--text-muted)]">URLs</p>
          <p className="text-[18px] font-semibold leading-none text-[var(--text-primary)]">{a.briefs}</p>
        </div>
      </div>

      {/* Date + Status + Actions */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-[11px] text-[var(--text-muted)]">{relativeTime(a.updatedAt)}</p>
          <StatusPill status={a.status} onChange={onStatusChange} />
          <GscPill connected={a.gscConnected} />
        </div>
        <ArrowRightIcon className="h-4 w-4 text-[var(--text-muted)]" />
      </div>
    </Link>
  );
}

/* ── Project creation modal (2 steps) ───────────────────────────────── */

const FREQ_OPTIONS = [
  { value: "quotidienne",    label: "Quotidienne" },
  { value: "hebdomadaire",   label: "Hebdomadaire" },
  { value: "mensuelle",      label: "Mensuelle" },
  { value: "trimestrielle",  label: "Trimestrielle" },
  { value: "manuelle",       label: "Manuelle" },
];

function AnalyseModal({
  onClose,
  onAnalyse,
}: {
  onClose: () => void;
  onAnalyse: (domain: string) => void;
}) {
  const [step, setStep]       = useState<1 | 2>(1);
  const [domain, setDomain]   = useState("");
  const [freq, setFreq]       = useState("mensuelle");
  const dialogRef             = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, input, select, a[href], [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last  = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previouslyFocused?.focus();
    };
  }, [onClose]);

  function handleCreate() {
    if (domain.trim()) { onAnalyse(domain.trim()); onClose(); }
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-full max-w-lg rounded-3xl border border-[var(--border-subtle)] bg-[var(--modal-bg)] p-8 shadow-[var(--shadow-floating)]"
      >
        <Stepper steps={2} current={step} onClose={onClose} />

        {/* Logo + title */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 flex h-11 w-11 items-center justify-center bg-accent-primary" style={{ borderRadius: "30%" }}>
            <SeoEngineLogo className="h-6 w-6 text-white" />
          </div>
          <h2 id="modal-title" className="text-[26px] font-semibold tracking-tight text-[var(--text-primary)]">
            {step === 1 ? "Nouveau projet" : "Fréquence d'analyse"}
          </h2>
          <p className="mt-1.5 text-[13px] text-[var(--text-muted)]">
            {step === 1 ? "Entrez l'URL du domaine à analyser" : "À quelle cadence relancer l'analyse ?"}
          </p>

        </div>

        {/* Step 1 — URL */}
        {step === 1 && (
          <div className="flex items-center rounded-full border border-[var(--border-subtle)] bg-[var(--card-inner-bg)] py-1.5 pl-5 pr-1.5 transition-colors focus-within:border-[var(--border-medium)] focus-within:bg-[var(--bg-card)]">
            <MagnifyingGlassIcon className="mr-3 h-5 w-5 flex-shrink-0 text-[var(--text-muted)]" />
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && domain.trim() && setStep(2)}
              placeholder="exemple.com"
              autoFocus
              className="flex-1 bg-transparent text-[15px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)]"
            />
            <Button
              onClick={() => setStep(2)}
              disabled={!domain.trim()}
              size="lg"
              className="ml-2 flex-shrink-0"
            >
              Continuer
            </Button>
          </div>
        )}

        {/* Step 2 — Frequency */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <DropdownMenu
              matchTrigger
              trigger={
                <button className="flex w-full items-center justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--card-inner-bg)] px-5 py-3.5 text-[15px] text-[var(--text-primary)] outline-none transition-colors hover:border-[var(--border-medium)] hover:bg-[var(--bg-card)]">
                  <span>{FREQ_OPTIONS.find((o) => o.value === freq)?.label ?? "Fréquence"}</span>
                  <ChevronDownIcon className="h-4 w-4 text-[var(--text-muted)]" />
                </button>
              }
            >
              {FREQ_OPTIONS.map((o) => (
                <DropdownItem key={o.value} onClick={() => setFreq(o.value)}>
                  <span className={freq === o.value ? "font-semibold text-[var(--text-primary)]" : ""}>{o.label}</span>
                </DropdownItem>
              ))}
            </DropdownMenu>
            <Button onClick={handleCreate} size="lg" className="w-full justify-center">
              Créer le projet
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const router = useRouter();
  const [analyses, setAnalyses] = useState<Analysis[]>(MOCK_ANALYSES);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<"actif" | "archive">("actif");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { open } = useDrawer();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const filtered = analyses.filter((a) => {
    if (a.status !== filter) return false;
    if (search && !a.domain.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function handleAnalyse(domain: string) {
    const exists = analyses.find((a) => a.domain === domain);
    if (!exists) {
      setAnalyses((prev) => [
        {
          id: Date.now(),
          domain,
          updatedAt: "2026-04-29",
          gscConnected: false,
          score: Math.floor(Math.random() * 40 + 55),
          trafic: "+0 %",
          traficDir: "neutral",
          lotsActifs: 0,
          briefs: 0,
          status: "actif" as const,
        },
        ...prev,
      ]);
    }
    router.push(`/analyse/${encodeURIComponent(domain)}`);
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto py-8">
      <div className="w-full px-[var(--page-px)]">

        {/* Header */}
        <div className="mb-5">
          <h1 className="mb-5 text-[28px] font-semibold tracking-tight text-[var(--text-primary)]">
            Vos projets
          </h1>
          <div className="flex items-center gap-4">
            <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un domaine…" alwaysExpanded />
            <FilterTabs
              tabs={[
                { key: "actif",   label: "Actifs",   count: analyses.filter((a) => a.status === "actif").length },
                { key: "archive", label: "Archivés",  count: analyses.filter((a) => a.status === "archive").length },
              ]}
              value={filter}
              onChange={setFilter}
            />
            <div className="ml-auto">
              <Button size="md" onClick={() => setModalOpen(true)}>
                <PlusIcon className="h-5 w-5" />
                Nouveau projet
              </Button>
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonAnalysisCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<FolderOpenIcon className="h-6 w-6" />}
            title={search ? "Aucun résultat pour cette recherche" : "Aucune analyse pour l'instant"}
            description={search ? `Aucun domaine ne correspond à « ${search} »` : "Lancez votre première analyse pour commencer."}
            action={<Button size="md" onClick={() => setModalOpen(true)}>Nouveau projet</Button>}
          />
        ) : (
          <div className="grid grid-cols-3 gap-4 animate-fade-in">
            {filtered.map((a) => (
              <AnalysisCard
                key={a.id}
                analysis={a}
                onStatusChange={(s) =>
                  setAnalyses((prev) =>
                    prev.map((x) => (x.id === a.id ? { ...x, status: s } : x))
                  )
                }
              />
            ))}
          </div>
        )}

      </div>

      {/* Modals */}
      {modalOpen && (
        <AnalyseModal
          onClose={() => setModalOpen(false)}
          onAnalyse={handleAnalyse}
        />
      )}

    </div>
  );
}
