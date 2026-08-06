"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { PlusIcon, XMarkIcon, ChevronDownIcon, TagIcon, ChevronLeftIcon, ChevronRightIcon, ArrowPathIcon, ArrowDownTrayIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { useToast } from "@/context/ToastContext";
import { VariationPill } from "@/components/VariationPill";
import { Upload, FileSpreadsheet, Plus, Trophy, Medal, Target, Activity } from "lucide-react";
import { Button } from "@/components/Button";
import { DropdownMenu, DropdownItem } from "@/components/DropdownMenu";
import { SearchInput } from "@/components/SearchInput";
import { FilterTabs } from "@/components/FilterTabs";
import { EmptyState } from "@/components/EmptyState";
import { SourcePill } from "@/components/SourcePill";
import { Sparkline } from "@/components/Sparkline";
import { AreaChart } from "@/components/AreaChart";
import { KpiCard } from "@/components/KpiCard";
import { KpiGroup } from "@/components/KpiGroup";
import { TableWide, type ColumnDef } from "@/components/TableWide";

/* ── Types ── */

import {
  INITIAL_KWS, VIS_DATA,
  type HistoryPoint, type TrackedKw,
} from "@/data/positions";

type RankFilter = "all" | "top3" | "top10" | "top30" | "out30";
type TimeRange  = "30j" | "90j" | "6m" | "1an";


const FREQ_OPTIONS = [
  { value: "2j",  label: "Tous les 2 jours" },
  { value: "4j",  label: "Tous les 4 jours" },
  { value: "7j",  label: "Tous les 7 jours" },
  { value: "15j", label: "Tous les 15 jours" },
];

const TIME_RANGE_TABS: { key: TimeRange; label: string }[] = [
  { key: "30j", label: "30j" },
  { key: "90j", label: "90j" },
  { key: "6m",  label: "6 mois" },
  { key: "1an", label: "1 an" },
];

function filterHistory(history: HistoryPoint[], range: TimeRange): HistoryPoint[] {
  const counts: Record<TimeRange, number> = { "30j": 4, "90j": 13, "6m": 26, "1an": 52 };
  const n = counts[range];
  return history.slice(-n);
}

/* ── Cell helpers ── */

function PosCell({ pos }: { pos: number | null }) {
  const color =
    pos === null ? "var(--text-muted)" :
    pos <= 3     ? "var(--color-success)" :
    pos <= 10    ? "var(--color-warning)" :
    pos <= 30    ? "#6B7280" : "var(--text-muted)";
  return (
    <span className="type-label tabular-nums" style={{ color }}>
      {pos === null ? "N/R" : `#${pos}`}
    </span>
  );
}

function DeltaCell({ delta }: { delta: number | null }) {
  if (delta === null) return <span className="type-label text-[var(--text-muted)]">—</span>;
  if (delta === 0)    return <span className="type-label text-[var(--text-muted)]">=</span>;
  // delta < 0 = gain de position (meilleur) → up/vert.
  const gain = delta < 0;
  return (
    <VariationPill direction={gain ? "up" : "down"}>
      {Math.abs(delta)}
    </VariationPill>
  );
}

/* Sparkline → DS · PositionChart → AreaChart DS (inverted=true) */

function PositionChart({ history }: { history: HistoryPoint[] }) {
  if (history.length < 2) {
    return (
      <EmptyState
        icon={
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5l4.5-4.5 3 3 4-5L19 10M3 20h18M3 4h18" />
          </svg>
        }
        title="Pas encore de données"
        description="L'historique de position apparaîtra ici après le premier check de suivi."
      />
    );
  }

  const data = history.map((d) => ({ label: d.date, value: d.pos }));
  return (
    <AreaChart
      data={data}
      inverted
      height={160}
      gradientId="pos-history-grad"
      formatTooltip={(p) => (
        <div className="flex flex-col gap-0.5">
          <span className="type-micro text-white/60">{p.label}</span>
          <span className="type-label text-white">#{p.value}</span>
        </div>
      )}
    />
  );
}

/* ── Keyword detail modal ── */

function KwDetailModal({ kws, index, onClose, onNavigate }: {
  kws: TrackedKw[];
  index: number;
  onClose: () => void;
  onNavigate: (i: number) => void;
}) {
  const kw = kws[index];
  const [timeRange, setTimeRange] = useState<TimeRange>("30j");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape")      onClose();
      if (e.key === "ArrowLeft")   onNavigate(Math.max(0, index - 1));
      if (e.key === "ArrowRight")  onNavigate(Math.min(kws.length - 1, index + 1));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, onNavigate, index, kws.length]);

  const visibleHistory = filterHistory(kw.history, timeRange);

  return createPortal(
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Left arrow — outside panel */}
      <button
        onClick={() => onNavigate(Math.max(0, index - 1))}
        disabled={index === 0}
        className="relative z-10 mr-3 flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 disabled:opacity-20 disabled:cursor-default"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>

      {/* Panel — flex col, fixed height, no scroll on outer */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-[760px] flex-col overflow-hidden rounded-2xl bg-[var(--bg-card)] shadow-[var(--shadow-floating)]">

        {/* Header — sticky */}
        <div className="flex flex-shrink-0 items-start justify-between gap-4 px-6 py-5">
          <div className="min-w-0">
            <h2 className="truncate type-h2">
              {kw.keyword}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <PosCell pos={kw.pos} />
              <DeltaCell delta={kw.delta} />
              {kw.tag && (
                <span className="rounded-full bg-[var(--bg-secondary)] px-2 py-0.5 type-micro text-[var(--text-secondary)]">
                  {kw.tag}
                </span>
              )}
              {kw.volume !== null && (
                <span className="type-caption text-[var(--text-muted)]">
                  {kw.volume.toLocaleString("fr-FR")} rech./mois
                </span>
              )}
              {kw.url && (
                <span className="truncate type-caption font-mono">{kw.url}</span>
              )}
            </div>
          </div>

          {/* Counter + close */}
          <div className="flex flex-shrink-0 items-center gap-2">
            <span className="type-caption text-[var(--text-muted)]">{index + 1}/{kws.length}</span>
            <button
              onClick={onClose}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-[var(--bg-secondary)]"
            >
              <XMarkIcon className="h-4 w-4 text-[var(--text-muted)]" />
            </button>
          </div>
        </div>

        {/* Chart section — sticky, not scrollable */}
        <div className="flex-shrink-0 px-6 pb-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="type-h3">Historique de position</p>
            <FilterTabs tabs={TIME_RANGE_TABS} value={timeRange} onChange={setTimeRange} />
          </div>
          <PositionChart history={visibleHistory} />
        </div>

        {/* SERP section — scrollable only */}
        <div className="flex-1 overflow-y-auto">
          {kw.serp.length > 0 ? (
            <>
              <div className="px-6 pb-3 pt-2">
                <p className="type-label">Résultats SERP actuels</p>
              </div>
              <table className="w-full table-fixed border-collapse">
                <colgroup>
                  <col style={{ width: "6%" }} />
                  <col style={{ width: "66%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "12%" }} />
                </colgroup>
                <thead>
                  <tr className="border-y border-[var(--border-subtle)] type-caption">
                    <th className="pl-6 pr-4 py-2 text-left">#</th>
                    <th className="px-4 py-2 text-left">URL</th>
                    <th className="px-4 py-2 text-center">Pos. desktop</th>
                    <th className="pl-4 pr-6 py-2 text-center">Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {kw.serp.map((s) => {
                    let hostname = s.url;
                    try { hostname = new URL(s.url).hostname; } catch {}
                    const isOurs = s.url.includes("votredomaine.fr");
                    return (
                      <tr
                        key={s.rank}
                        className={`transition-colors hover:bg-[var(--bg-secondary)] ${isOurs ? "bg-[var(--accent-primary-soft)]" : ""}`}
                      >
                        <td className="pl-6 pr-4 py-2.5 type-label font-semibold text-[var(--text-primary)]">{s.rank}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <img
                              src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=16`}
                              alt="" width={16} height={16}
                              className="h-4 w-4 flex-shrink-0 rounded-sm"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                            />
                            <a
                              href={s.url} target="_blank" rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className={`block truncate font-mono type-caption transition-colors hover:underline ${isOurs ? "font-semibold text-[var(--accent-primary)]" : "text-[var(--text-secondary)]"}`}
                            >
                              {s.url}
                            </a>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-center"><PosCell pos={s.posDesktop} /></td>
                        <td className="pl-4 pr-6 py-2.5 text-center"><DeltaCell delta={s.delta} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="h-4" />
            </>
          ) : (
            <div className="px-6 py-8 text-center">
              <p className="type-body-sm text-[var(--text-muted)]">Aucune donnée SERP disponible pour ce mot-clé.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right arrow — outside panel */}
      <button
        onClick={() => onNavigate(Math.min(kws.length - 1, index + 1))}
        disabled={index === kws.length - 1}
        className="relative z-10 ml-3 flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 disabled:opacity-20 disabled:cursor-default"
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>
    </div>,
    document.body
  );
}

/* ── Add modal ── */

function AddKwModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (kw: TrackedKw) => void;
}) {
  const [keyword, setKeyword] = useState("");
  const [tag,     setTag]     = useState("");
  const [freq,    setFreq]    = useState("7j");

  const count = keyword.trim() ? 1 : 0;

  function handleAdd() {
    if (!keyword.trim()) return;
    onAdd({
      keyword: keyword.trim(),
      pos: null, delta: null, url: null,
      volume: null, freq,
      tag: tag.trim() || null,
      spark: [], history: [], serp: [],
    });
    onClose();
  }

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--modal-bg)] shadow-[var(--shadow-floating)]">

        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-5">
          <h2 className="type-h2">Ajouter des mots-clés</h2>
          <button onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-[var(--bg-secondary)]">
            <XMarkIcon className="h-4 w-4 text-[var(--text-muted)]" />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          <div className="flex flex-col gap-1.5">
            <label className="type-label">Mot-clé</label>
            <input
              autoFocus
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
              placeholder="Ajouter un mot-clé"
              className="h-10 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3.5 text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="type-label">
              Tag <span className="text-[var(--text-muted)]">(optionnel)</span>
            </label>
            <div className="relative">
              <TagIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                value={tag}
                onChange={e => setTag(e.target.value)}
                placeholder="ex : produit"
                className="h-10 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] pl-9 pr-3.5 text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="type-label">Fréquence de vérification</label>
            <DropdownMenu
              matchTrigger
              trigger={
                <button className="flex h-10 w-full items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3.5 text-[14px] text-[var(--text-primary)] transition-colors hover:border-[var(--border-medium)]">
                  <span>{FREQ_OPTIONS.find(o => o.value === freq)?.label ?? "Fréquence"}</span>
                  <ChevronDownIcon className="h-4 w-4 text-[var(--text-muted)]" />
                </button>
              }
            >
              {FREQ_OPTIONS.map(o => (
                <DropdownItem key={o.value} onClick={() => setFreq(o.value)}>
                  <span className={freq === o.value ? "font-semibold text-[var(--text-primary)]" : ""}>{o.label}</span>
                </DropdownItem>
              ))}
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[var(--border-subtle)] px-6 py-4">
          <Button size="sm" variant="secondary" onClick={onClose}>Annuler</Button>
          <Button size="sm" onClick={handleAdd} disabled={count === 0}>
            Ajouter {count} mot{count > 1 ? "s" : ""}-clé{count > 1 ? "s" : ""}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── Import CSV modal ── */

function ImportCsvModal({ onClose, onImport }: {
  onClose: () => void;
  onImport: (kws: TrackedKw[]) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<{ keyword: string; tag: string | null }[]>([]);
  const [defaultTag, setDefaultTag] = useState("");
  const [defaultFreq, setDefaultFreq] = useState("7j");
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    setError(null);
    if (!/\.csv$/i.test(f.name)) {
      setError("Le fichier doit être au format .csv");
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = String(e.target?.result ?? "");
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      // Skip header row if first cell looks like "keyword" / "mot-clé"
      const startIdx = /keyword|mot[-\s]?cl(é|e)/i.test(lines[0] ?? "") ? 1 : 0;
      const rows = lines.slice(startIdx).map(line => {
        const [kw, tg] = line.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
        return { keyword: kw ?? "", tag: tg && tg.length > 0 ? tg : null };
      }).filter(r => r.keyword.length > 0);
      if (rows.length === 0) {
        setError("Aucun mot-clé valide détecté dans le fichier.");
        setParsed([]);
        return;
      }
      setParsed(rows);
    };
    reader.readAsText(f);
  }

  function handleImport() {
    if (parsed.length === 0) return;
    const kws: TrackedKw[] = parsed.map(p => ({
      keyword: p.keyword,
      pos: null, delta: null, url: null,
      volume: null, freq: defaultFreq,
      tag: p.tag ?? (defaultTag.trim() || null),
      spark: [], history: [], serp: [],
    }));
    onImport(kws);
    onClose();
  }

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--modal-bg)] shadow-[var(--shadow-floating)]">

        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-5">
          <h2 className="type-h2">Importer des mots-clés depuis un CSV</h2>
          <button onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-[var(--bg-secondary)]">
            <XMarkIcon className="h-4 w-4 text-[var(--text-muted)]" />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          {/* Dropzone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 transition-colors ${dragOver ? "border-[var(--accent-primary)] bg-[var(--accent-primary-soft)]" : "border-[var(--border-subtle)] hover:border-[var(--border-medium)] hover:bg-[var(--bg-secondary)]"}`}
          >
            {file ? (
              <>
                <FileSpreadsheet className="h-8 w-8 text-[var(--color-success)]" />
                <p className="type-body-strong">{file.name}</p>
                <p className="type-caption text-[var(--text-muted)]">
                  {parsed.length} mot{parsed.length > 1 ? "s" : ""}-clé{parsed.length > 1 ? "s" : ""} détecté{parsed.length > 1 ? "s" : ""} · cliquez pour changer
                </p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-[var(--text-muted)]" />
                <p className="type-body-strong">Glissez un fichier CSV ou cliquez pour parcourir</p>
                <p className="type-caption text-[var(--text-muted)]">Format attendu : une colonne <code className="type-micro font-mono">keyword</code>, optionnellement une colonne <code className="type-micro font-mono">tag</code></p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>

          {error && (
            <p className="type-caption text-[var(--color-danger)]">{error}</p>
          )}

          {/* Defaults — applied to rows without explicit tag */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="type-label">
                Tag par défaut <span className="text-[var(--text-muted)]">(optionnel)</span>
              </label>
              <input
                value={defaultTag}
                onChange={e => setDefaultTag(e.target.value)}
                placeholder="ex : produit"
                className="h-10 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3.5 text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="type-label">Fréquence</label>
              <DropdownMenu
                matchTrigger
                trigger={
                  <button className="flex h-10 w-full items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3.5 text-[14px] text-[var(--text-primary)] transition-colors hover:border-[var(--border-medium)]">
                    <span>{FREQ_OPTIONS.find(o => o.value === defaultFreq)?.label ?? "Fréquence"}</span>
                    <ChevronDownIcon className="h-4 w-4 text-[var(--text-muted)]" />
                  </button>
                }
              >
                {FREQ_OPTIONS.map(o => (
                  <DropdownItem key={o.value} onClick={() => setDefaultFreq(o.value)}>
                    <span className={defaultFreq === o.value ? "font-semibold text-[var(--text-primary)]" : ""}>{o.label}</span>
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </div>
          </div>

          {/* Preview */}
          {parsed.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <p className="type-label">Aperçu ({Math.min(5, parsed.length)} premier{parsed.length > 1 ? "s" : ""} sur {parsed.length})</p>
              <div className="rounded-xl border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)]">
                {parsed.slice(0, 5).map((p, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2">
                    <span className="truncate type-label text-[var(--text-primary)]">{p.keyword}</span>
                    {p.tag && (
                      <span className="ml-3 flex-shrink-0 rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 type-micro">{p.tag}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[var(--border-subtle)] px-6 py-4">
          <Button size="sm" variant="secondary" onClick={onClose}>Annuler</Button>
          <Button size="sm" onClick={handleImport} disabled={parsed.length === 0}>
            Importer {parsed.length > 0 ? `${parsed.length} mot${parsed.length > 1 ? "s" : ""}-clé${parsed.length > 1 ? "s" : ""}` : ""}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── Visibility chart ── */


function VisibilityChart() {
  const vals = VIS_DATA.map(d => d.value);
  const delta = vals[vals.length - 1] - vals[0];
  const deltaLabel = delta > 0 ? `+${delta}` : `${delta}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="type-h3">Visibilité organique</p>
            <SourcePill source="Haloscan" href="https://haloscan.com" />
          </div>
          <p className="mt-0.5 type-caption">90 derniers jours</p>
        </div>
        <div className="text-right">
          <p className="type-h1 leading-none">
            {vals[vals.length - 1]}
            <span className="ml-1 type-label text-[var(--color-success)]">{deltaLabel}</span>
          </p>
          <p className="mt-0.5 type-micro">score de visibilité</p>
        </div>
      </div>
      <AreaChart
        data={VIS_DATA}
        height={120}
        gradientId="vis-tracker-grad"
        formatTooltip={(p) => (
          <div className="flex items-center gap-1.5">
            <span className="type-label text-white">{p.value}</span>
            <span className="type-micro text-white/60">{p.label}</span>
          </div>
        )}
      />
    </div>
  );
}

/* ── Columns (TableWide) ── */

const TRACKED_COLUMNS: ColumnDef<TrackedKw>[] = [
  {
    key: "keyword",
    header: "Mot-clé",
    width: 240,
    flex: true,
    render: (kw) => (
      <span className="block truncate type-label text-[var(--text-primary)]">{kw.keyword}</span>
    ),
  },
  {
    key: "pos", header: "Pos.", width: 70,
    sortable: true, sortValue: (kw) => kw.pos ?? 9999,
    render: (kw) => <PosCell pos={kw.pos} />,
  },
  {
    key: "delta", header: "Delta", width: 70,
    sortable: true, sortValue: (kw) => kw.delta ?? 0,
    render: (kw) => <DeltaCell delta={kw.delta} />,
  },
  {
    key: "url",
    header: "URL positionnée",
    width: 260,
    render: (kw) => (
      kw.url
        ? <span className="block truncate type-label font-mono text-[var(--text-primary)]">{kw.url}</span>
        : <span className="type-label text-[var(--text-muted)]">—</span>
    ),
  },
  {
    key: "volume", header: "Volume", width: 90, align: "right",
    sortable: true, sortValue: (kw) => kw.volume ?? -1,
    render: (kw) => (
      <span className="type-label tabular-nums text-[var(--text-primary)]">
        {kw.volume !== null ? kw.volume.toLocaleString("fr-FR") : "—"}
      </span>
    ),
  },
  {
    key: "freq",
    header: "Fréq.",
    width: 70,
    render: (kw) => <span className="type-label text-[var(--text-primary)]">{kw.freq}</span>,
  },
  {
    key: "tag",
    header: "Tag",
    width: 100,
    render: (kw) => (
      kw.tag
        ? <span className="rounded-full bg-[var(--bg-secondary)] px-2 py-0.5 type-micro text-[var(--text-secondary)]">{kw.tag}</span>
        : <span className="type-label text-[var(--text-muted)]">—</span>
    ),
  },
  {
    key: "spark",
    header: "30j",
    width: 90,
    align: "right",
    render: (kw) => (
      <div className="flex justify-end">
        <Sparkline data={kw.spark} />
      </div>
    ),
  },
];

/* ── Main component ── */

export function RankTracker({ title, subtitle }: { title?: string; subtitle?: string } = {}) {
  const { show: showToast } = useToast();
  const [kws,      setKws]      = useState<TrackedKw[]>(INITIAL_KWS);
  const [filter,   setFilter]   = useState<RankFilter>("all");
  const [search,   setSearch]   = useState("");
  const [modal,    setModal]    = useState(false);
  const [csvModal, setCsvModal] = useState(false);
  const [selIdx,   setSelIdx]   = useState<number | null>(null);

  const top1  = kws.filter(k => k.pos === 1).length;
  const top3  = kws.filter(k => k.pos !== null && k.pos <= 3).length;
  const top10 = kws.filter(k => k.pos !== null && k.pos <= 10).length;
  const top30 = kws.filter(k => k.pos !== null && k.pos <= 30).length;
  const out30 = kws.filter(k => k.pos === null || k.pos > 30).length;
  const positionedPct = kws.length > 0
    ? Math.round((kws.filter(k => k.pos !== null).length / kws.length) * 100)
    : 0;

  const TABS: { key: RankFilter; label: string; count: number }[] = [
    { key: "all",   label: "Tous",     count: kws.length },
    { key: "top3",  label: "Top 3",    count: top3 },
    { key: "top10", label: "Top 10",   count: top10 },
    { key: "top30", label: "Top 30",   count: top30 },
    { key: "out30", label: "Hors 30+", count: out30 },
  ];

  const filtered = kws.filter(k => {
    if (search && !k.keyword.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "top3")  return k.pos !== null && k.pos <= 3;
    if (filter === "top10") return k.pos !== null && k.pos <= 10;
    if (filter === "top30") return k.pos !== null && k.pos <= 30;
    if (filter === "out30") return k.pos === null || k.pos > 30;
    return true;
  });

  // Export CSV des positions actuellement filtrées.
  function exportCsv() {
    const esc = (v: string | number | null) => {
      const s = v === null || v === undefined ? "" : String(v);
      return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = ["Mot-clé", "Position", "Évolution", "URL", "Volume", "Fréquence", "Lot"];
    const rows = filtered.map((k) =>
      [
        k.keyword,
        k.pos ?? "",
        k.delta === null ? "" : k.delta > 0 ? `+${k.delta}` : k.delta,
        k.url ?? "",
        k.volume ?? "",
        k.freq,
        k.tag ?? "",
      ].map(esc).join(";"),
    );
    const csv = ["﻿" + header.join(";"), ...rows].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `positions-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(
      `${filtered.length} position${filtered.length > 1 ? "s" : ""} exportée${filtered.length > 1 ? "s" : ""}`,
      <CheckCircleIcon className="h-5 w-5" />,
    );
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Header — title (passed by parent) on the left, CTAs on the right (space-between) */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          {title && (
            <h1 className="type-h1 leading-none">{title}</h1>
          )}
          {subtitle && (
            <p className="mt-1 type-body-sm">{subtitle}</p>
          )}
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <Button variant="secondary" onClick={exportCsv}>
            <ArrowDownTrayIcon className="h-4 w-4" />
            Export
          </Button>
          <Button variant="secondary">
            <ArrowPathIcon className="h-4 w-4" />
            Actualiser
          </Button>
          <DropdownMenu
            width={200}
            align="right"
            trigger={
              <Button>
                <PlusIcon className="h-4 w-4" />
                Importer
                <ChevronDownIcon className="h-3.5 w-3.5" />
              </Button>
            }
          >
            <DropdownItem icon={FileSpreadsheet} onClick={() => setCsvModal(true)}>Depuis un CSV</DropdownItem>
            <DropdownItem icon={Plus} onClick={() => setModal(true)}>Ajouter manuellement</DropdownItem>
          </DropdownMenu>
        </div>
      </div>

      {/* Metric cards */}
      <KpiGroup columns={4}>
        <KpiCard bare icon={Trophy}   label="Top 1"       value={top1} />
        <KpiCard bare icon={Medal}    label="Top 3"       value={top3} />
        <KpiCard bare icon={Target}   label="Top 10"      value={top10} />
        <KpiCard bare icon={Activity} label="Positionnés" value={`${positionedPct} %`} />
      </KpiGroup>

      {/* Visibility chart */}
      <VisibilityChart />

      {/* Filter tabs + search */}
      <div className="flex items-center justify-between gap-3">
        <FilterTabs
          tabs={TABS.map(t => ({ key: t.key, label: t.label, count: t.count }))}
          value={filter}
          onChange={setFilter}
        />
        <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un mot-clé…" alwaysExpanded />
      </div>

      {/* Table — DS TableWide bordered (même look que Recommandations) */}
      <TableWide<TrackedKw>
        columns={TRACKED_COLUMNS}
        data={filtered}
        rowKey={(kw) => kw.keyword}
        onRowClick={(_, i) => setSelIdx(i)}
        emptyState="Aucun mot-clé correspondant."
        minWidth={1100}
        pageSize={25}
        bordered
        edgePadding="24px"
      />

      {/* Add modal */}
      {modal && typeof document !== "undefined" && (
        <AddKwModal
          onClose={() => setModal(false)}
          onAdd={kw => setKws(prev => [...prev, kw])}
        />
      )}

      {/* Import CSV modal */}
      {csvModal && typeof document !== "undefined" && (
        <ImportCsvModal
          onClose={() => setCsvModal(false)}
          onImport={imported => setKws(prev => [...prev, ...imported])}
        />
      )}

      {/* Keyword detail modal */}
      {selIdx !== null && typeof document !== "undefined" && (
        <KwDetailModal
          kws={filtered}
          index={selIdx}
          onClose={() => setSelIdx(null)}
          onNavigate={setSelIdx}
        />
      )}

    </div>
  );
}
