"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon, ArrowPathIcon, XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Tooltip } from "@/components/Tooltip";
import { Button } from "@/components/Button";
import { KpiCard } from "@/components/KpiCard";
import { SoftPanel } from "@/components/SoftPanel";
import { Layers, CircleCheck, TriangleAlert, Sparkles, Clock } from "lucide-react";

/* ── Types ────────────────────────────────────────────────────────────── */

type SemStatus = "cannibalisation" | "opportunite" | "couvert";
type SemanticKw = {
  keyword: string;
  urls: { url: string; pos: number }[];
  extraUrls: number;
  source: "PAA" | "Related";
  api: string;
  status: SemStatus;
  cannibCount?: number;
  volume: number;
  score: number | null;
};

/* ── Data ─────────────────────────────────────────────────────────────── */

const S = (keyword: string, urls: {url:string;pos:number}[], extra: number, src: "PAA"|"Related", status: SemStatus, cannibCount: number|undefined, vol: number, score: number|null): SemanticKw =>
  ({ keyword, urls, extraUrls: extra, source: src, api: "haloscan", status, cannibCount, volume: vol, score });

const SEMANTIC_KWS: SemanticKw[] = [
  S("agence seo définition",               [{url:"/agence-marketing-digital-banque-assurance/",pos:2},{url:"/agence-marketing-digital-b2b/",pos:8}], 2, "PAA",     "cannibalisation", 4, 90,    80),
  S("agence digitale luxe",                [{url:"/",pos:50},{url:"/agence-marketing-digital-sante/",pos:59}],                                     0, "Related", "cannibalisation", 2, 140,   82),
  S("agence seo",                          [{url:"/agence-marketing-digital-banque-assurance/",pos:2},{url:"/agence-marketing-digital-b2b/",pos:8}], 4, "Related", "cannibalisation", 6, 2100,  80),
  S("google analytics",                    [], 0, "Related", "opportunite", undefined, 61400, null),
  S("agence seo paris",                    [], 0, "Related", "opportunite", undefined, 2400,  null),
  S("formation seo",                       [{url:"/formation/formation-seo/",pos:46}],                                                              0, "Related", "couvert",         undefined, 1700, 80),
  S("adveris",                             [], 0, "Related", "opportunite", undefined, 1200,  null),
  S("agence digital paris",                [{url:"/",pos:50}],                                                                                      0, "Related", "couvert",         undefined, 800,  80),
  S("formation seo cpf",                   [], 0, "Related", "opportunite", undefined, 390,   null),
  S("agence de communication tourisme",    [{url:"/agence-marketing-digital-tourisme-voyage/",pos:33}],                                             0, "Related", "couvert",         undefined, 210,  70),
  S("formation référencement naturel seo", [], 0, "Related", "opportunite", undefined, 210,   null),
  S("formation seo en ligne gratuite",     [], 0, "Related", "opportunite", undefined, 170,   null),
  S("vmed",                                [], 0, "Related", "opportunite", undefined, 140,   null),
  S("interface tourisme",                  [], 0, "Related", "opportunite", undefined, 140,   null),
  S("agence digitale paris",               [], 0, "Related", "opportunite", undefined, 100,   null),
  S("agence digital santé",                [{url:"/agence-marketing-digital-sante/",pos:59}],                                                       0, "Related", "couvert",         undefined, 90,   100),
  S("agence digitale créative",            [{url:"/",pos:50}],                                                                                      0, "Related", "couvert",         undefined, 90,   78),
  S("agence de communication médicale",    [], 0, "Related", "opportunite", undefined, 70,    null),
  S("agence communication touristique",    [{url:"/agence-marketing-digital-tourisme-voyage/",pos:33}],                                             0, "Related", "couvert",         undefined, 70,   70),
  S("agence communication tourisme",       [{url:"/agence-marketing-digital-tourisme-voyage/",pos:33}],                                             0, "Related", "couvert",         undefined, 70,   75),
  S("formation seo pôle emploi",           [], 0, "Related", "opportunite", undefined, 70,    null),
  S("agence communication santé paris",    [], 0, "Related", "opportunite", undefined, 50,    null),
  S("think tank santé",                    [], 0, "Related", "opportunite", undefined, 50,    null),
  S("formation certifiante seo",           [], 0, "Related", "opportunite", undefined, 50,    null),
  S("digital santé",                       [{url:"/agence-marketing-digital-sante/",pos:59}],                                                       0, "Related", "couvert",         undefined, 40,   92),
  S("club digital santé",                  [{url:"/agence-marketing-digital-sante/",pos:59}],                                                       0, "Related", "couvert",         undefined, 40,   78),
  S("télésanté définition",                [], 0, "PAA",     "opportunite", undefined, 30,    null),
  S("comm santé",                          [], 0, "Related", "opportunite", undefined, 30,    null),
  S("agence digitale site internet",       [{url:"/",pos:50}],                                                                                      0, "Related", "couvert",         undefined, 30,   76),
  S("agence digitale bordeaux",            [], 0, "Related", "opportunite", undefined, 30,    null),
  S("agence marketing tourisme",           [{url:"/agence-marketing-digital-tourisme-voyage/",pos:33}],                                             0, "Related", "couvert",         undefined, 30,   78),
  S("formation seo prix",                  [], 0, "PAA",     "opportunite", undefined, 30,    null),
  S("digitalisation de la santé",          [{url:"/agence-marketing-digital-sante/",pos:59}],                                                       0, "Related", "couvert",         undefined, 20,   77),
  S("transformation digitale santé",       [{url:"/agence-marketing-digital-sante/",pos:59}],                                                       0, "Related", "couvert",         undefined, 20,   77),
  S("kamui digital sante",                 [{url:"/agence-marketing-digital-sante/",pos:59}],                                                       0, "Related", "couvert",         undefined, 20,   71),
  S("agence marketing digital prix",       [], 0, "PAA",     "opportunite", undefined, 20,    null),
  S("agence marketing digital c'est quoi", [{url:"/agence-marketing-digital-mode-pret-a-porter/",pos:5}],                                           0, "PAA",     "couvert",         undefined, 20,   77),
  S("agence communication digitale",       [{url:"/",pos:50}],                                                                                      0, "Related", "couvert",         undefined, 20,   83),
  S("agence digital",                      [{url:"/",pos:50}],                                                                                      0, "Related", "couvert",         undefined, 20,   100),
  S("agence influenceur voyage",            [], 0, "Related", "opportunite", undefined, 20,    null),
  S("agence digitale tourisme",            [{url:"/agence-marketing-digital-tourisme-voyage/",pos:33}],                                             0, "Related", "couvert",         undefined, 20,   83),
  S("formation référencement naturel",     [], 0, "Related", "opportunite", undefined, 20,    null),
  S("formation seo openclassroom",         [], 0, "Related", "opportunite", undefined, 20,    null),
  S("mhealth definition",                  [], 0, "PAA",     "opportunite", undefined, 10,    null),
  S("tic santé définition",               [], 0, "PAA",     "opportunite", undefined, 10,    null),
  S("santé digitale définition",           [{url:"/agence-marketing-digital-sante/",pos:59}],                                                       0, "PAA",     "couvert",         undefined, 10,   77),
  S("agence communication santé lyon",     [], 0, "Related", "opportunite", undefined, 10,    null),
  S("conférence e-santé",                  [], 0, "Related", "opportunite", undefined, 10,    null),
  S("buzz e-santé",                        [], 0, "Related", "opportunite", undefined, 10,    null),
  S("digital et santé",                    [{url:"/agence-marketing-digital-sante/",pos:59}],                                                       0, "Related", "couvert",         undefined, 10,   82),
];

/* ── Helpers ──────────────────────────────────────────────────────────── */

function ColDropdown({ label, active, children }: {
  label: string;
  active: boolean;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const portalRef  = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || portalRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const toggle = () => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left });
    setOpen((o) => !o);
  };

  return (
    <div ref={triggerRef} className="inline-flex">
      <button onClick={toggle}
        className={`inline-flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-all ${active ? "border-[#3E50F5] bg-[rgba(62,80,245,0.08)] text-[#3E50F5]" : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--text-muted)]"}`}>
        {label}
        <ChevronDownIcon className={`h-3 w-3 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && typeof document !== "undefined" && createPortal(
        <div ref={portalRef} className="fixed z-[999] min-w-[160px] rounded-2xl p-2 shadow-[var(--shadow-floating)]"
          style={{ top: pos.top, left: pos.left, backgroundColor: "var(--dropdown-bg)", backdropFilter: "saturate(180%) blur(24px)", WebkitBackdropFilter: "saturate(180%) blur(24px)" }}>
          {children(() => setOpen(false))}
        </div>,
        document.body
      )}
    </div>
  );
}

function OptBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick}
      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[14px] font-medium transition-colors hover:bg-[var(--bg-secondary)] ${active ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>
      {children}
      {active && <CheckIcon className="h-3.5 w-3.5 flex-shrink-0 text-[#3E50F5]" />}
    </button>
  );
}

function UrlTip({ url }: { url: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[10px] font-semibold uppercase opacity-50">URL complète</p>
      <p className="break-all font-mono text-[11px] opacity-90">{url}</p>
      <p className="text-[11px] opacity-40">Cliquez pour ouvrir l'analyse</p>
    </div>
  );
}

function SourceTip({ source }: { source: "PAA" | "Related" }) {
  if (source === "PAA") return (
    <div className="flex flex-col gap-1.5">
      <p className="font-semibold">Question "People Also Ask"</p>
      <p className="opacity-75">Ce keyword provient des questions fréquentes affichées par Google pour ce sujet.</p>
      <p className="opacity-50">Source API : Google SERP</p>
      <p className="mt-0.5">💡 Excellent pour FAQ, H2/H3, featured snippets</p>
    </div>
  );
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-semibold">Keyword associé</p>
      <p className="opacity-75">Ce keyword est sémantiquement lié à votre sujet principal.</p>
      <p className="opacity-50">Source API : Google</p>
      <p className="mt-0.5">💡 Enrichit votre champ sémantique</p>
    </div>
  );
}

function CannibalTip({ row }: { row: SemanticKw }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-semibold text-[#F87171]">Cannibalisation détectée</p>
      <p className="opacity-75">Ce keyword est ciblé par plusieurs pages. Cela dilue votre positionnement et crée une compétition interne.</p>
      <div className="mt-0.5 flex flex-col gap-0.5">
        <p className="text-[10px] font-semibold uppercase opacity-50">Pages en conflit</p>
        {row.urls.map((u, i) => (
          <p key={i} className="font-mono text-[11px] opacity-80">• {u.url}</p>
        ))}
        {row.extraUrls > 0 && <p className="text-[11px] opacity-50">• +{row.extraUrls} autres pages</p>}
      </div>
      <p className="opacity-60">Choisissez une page principale et redirigez les autres, ou différenciez l'intention de chaque page.</p>
    </div>
  );
}

function CouvertTip({ row }: { row: SemanticKw }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-semibold text-[#10B981]">Keyword couvert ✓</p>
      <p className="opacity-75">Une page de votre site cible déjà ce keyword. La correspondance est bonne{row.score !== null ? ` (score : ${row.score}%)` : ""}.</p>
      {row.urls.length > 0 && (
        <div className="mt-0.5 flex flex-col gap-0.5">
          <p className="text-[10px] font-semibold uppercase opacity-50">Page associée</p>
          {row.urls.map((u, i) => (
            <p key={i} className="font-mono text-[11px] opacity-80">• {u.url}</p>
          ))}
        </div>
      )}
      <p className="opacity-50">Aucune action nécessaire.</p>
    </div>
  );
}

function OppTip({ row }: { row: SemanticKw }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-semibold">Opportunité de contenu 🎯</p>
      <p className="opacity-75">Aucune page de votre site ne cible ce keyword. C'est une opportunité pour créer du nouveau contenu.</p>
      <div className="mt-0.5 flex flex-col gap-0.5">
        <p className="text-[11px] opacity-60">Volume de recherche : <span className="font-semibold text-white opacity-100">{row.volume.toLocaleString("fr-FR")}/mois</span></p>
      </div>
      <p className="opacity-60">Créez une nouvelle page ciblant ce keyword.</p>
    </div>
  );
}

function SemUrlList({ urls, extra }: { urls: { url: string; pos: number }[]; extra: number }) {
  if (urls.length === 0) return <span className="text-[13px] text-[var(--text-muted)]">—</span>;
  return (
    <div className="flex flex-col gap-1">
      {urls.map((u, i) => (
        <div key={i} className="flex min-w-0 items-center gap-1.5">
          <Tooltip portal rich side="bottom" label={<UrlTip url={u.url} />}>
            <span className="truncate font-mono text-[12px] text-[var(--text-muted)]">{u.url}</span>
          </Tooltip>
          <span className="flex-shrink-0 rounded px-1 py-0.5 text-[10px] font-semibold"
            style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-muted)" }}>#{u.pos}</span>
        </div>
      ))}
      {extra > 0 && <span className="text-[12px] font-medium text-[#3E50F5]">+{extra} autres</span>}
    </div>
  );
}

function SemStatusCell({ row }: { row: SemanticKw }) {
  if (row.status === "cannibalisation") return (
    <Tooltip portal rich side="bottom" label={<CannibalTip row={row} />}>
      <span className="inline-flex w-fit cursor-help items-center whitespace-nowrap rounded-full px-2 py-1 text-[12px] font-semibold"
        style={{ color: "#E11D48", backgroundColor: "rgba(225,29,72,0.08)" }}>
        Cannibalisation ({row.cannibCount})
      </span>
    </Tooltip>
  );
  if (row.status === "couvert") return (
    <Tooltip portal rich side="bottom" label={<CouvertTip row={row} />}>
      <span className="inline-flex w-fit cursor-help items-center rounded-full px-2 py-1 text-[12px] font-semibold"
        style={{ color: "#10B981", backgroundColor: "rgba(16,185,129,0.09)" }}>Couvert</span>
    </Tooltip>
  );
  return (
    <Tooltip portal rich side="bottom" label={<OppTip row={row} />}>
      <span className="inline-flex w-fit cursor-help items-center rounded-full px-2 py-1 text-[12px] font-semibold"
        style={{ color: "#3E50F5", backgroundColor: "rgba(62,80,245,0.08)" }}>Opportunité</span>
    </Tooltip>
  );
}

function SemScore({ score }: { score: number | null }) {
  if (score === null) return <span className="text-[13px] text-[var(--text-muted)]">—</span>;
  const color = score >= 80 ? "#10B981" : score >= 70 ? "#F59E0B" : "#E11D48";
  return <span className="text-[13px] font-semibold tabular-nums" style={{ color }}>{score}%</span>;
}

/* ── Main view ────────────────────────────────────────────────────────── */

export function UniversSemantiqueView() {
  const [semStatus, setSemStatus] = useState<SemStatus | "all">("all");
  const [semSource, setSemSource] = useState<"PAA" | "Related" | "all">("all");
  const [semMinVol,  setSemMinVol]  = useState(0);

  const filteredKws = SEMANTIC_KWS.filter(k =>
    (semStatus === "all" || k.status === semStatus) &&
    (semSource === "all" || k.source === semSource) &&
    k.volume >= semMinVol
  );

  return (
    <div className="flex flex-col gap-5">

      {/* Actions only — title + subtitle rendered by parent tab */}
      <div className="flex items-center justify-end gap-2">
        <Button size="sm" variant="secondary">
          <ArrowPathIcon className="h-4 w-4" />
          Rebuild
        </Button>
        <Button size="sm" variant="secondary">Matcher</Button>
      </div>

      {/* KPI cards */}
      <SoftPanel>
        <div className="grid grid-cols-5 gap-3">
          <KpiCard icon={Layers}        label="Total"        value="303" />
          <KpiCard icon={CircleCheck}   label="Couverts"     value="65"  valueColor="#10B981" />
          <KpiCard icon={TriangleAlert} label="Cannibalisés" value="15"  valueColor="#E11D48" />
          <KpiCard icon={Sparkles}      label="Opportunités" value="223" valueColor="#3E50F5" />
          <KpiCard icon={Clock}         label="En attente"   value="0"   valueColor="var(--text-muted)" />
        </div>
      </SoftPanel>

      {/* Filter controls */}
      <div className="flex items-center gap-3">
        {(semStatus !== "all" || semSource !== "all" || semMinVol > 0) && (
          <button onClick={() => { setSemStatus("all"); setSemSource("all"); setSemMinVol(0); }}
            className="flex cursor-pointer items-center gap-1 text-[12px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
            <XMarkIcon className="h-3 w-3" />
            Réinitialiser les filtres
          </button>
        )}
        <span className="ml-auto text-[12px] text-[var(--text-muted)]">{filteredKws.length} / 303</span>
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-card)]">
        {filteredKws.length === 0 ? (
          <div className="px-7 py-10 text-center text-[14px] text-[var(--text-muted)]">
            Aucun mot-clé pour ces filtres.
          </div>
        ) : (
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              <col style={{ width: "21%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "22%" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "10%" }} />
            </colgroup>
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-[11px] font-semibold text-[var(--text-muted)]">
                <th className="px-6 py-3 text-left font-semibold">Keyword</th>
                <th className="px-4 py-3 text-left font-semibold">URL(s) matchée(s)</th>
                <th className="px-4 py-3 text-left font-semibold">
                  <ColDropdown label={semSource === "all" ? "Source" : semSource} active={semSource !== "all"}>
                    {(close) => <>
                      <OptBtn active={semSource === "all"}     onClick={() => { setSemSource("all");     close(); }}>Toutes</OptBtn>
                      <OptBtn active={semSource === "PAA"}     onClick={() => { setSemSource("PAA");     close(); }}>PAA</OptBtn>
                      <OptBtn active={semSource === "Related"} onClick={() => { setSemSource("Related"); close(); }}>Related</OptBtn>
                    </>}
                  </ColDropdown>
                </th>
                <th className="px-4 py-3 text-left font-semibold">
                  <ColDropdown
                    label={semStatus === "all" ? "Statut" : ({ cannibalisation: "Cannibalisation", opportunite: "Opportunité", couvert: "Couvert" } as const)[semStatus]}
                    active={semStatus !== "all"}>
                    {(close) => <>
                      <OptBtn active={semStatus === "all"}             onClick={() => { setSemStatus("all");             close(); }}>Tous</OptBtn>
                      <OptBtn active={semStatus === "couvert"}         onClick={() => { setSemStatus("couvert");         close(); }}>Couvert</OptBtn>
                      <OptBtn active={semStatus === "cannibalisation"} onClick={() => { setSemStatus("cannibalisation"); close(); }}>Cannibalisation</OptBtn>
                      <OptBtn active={semStatus === "opportunite"}     onClick={() => { setSemStatus("opportunite");     close(); }}>Opportunité</OptBtn>
                    </>}
                  </ColDropdown>
                </th>
                <th className="px-4 py-3 text-right font-semibold">
                  <div className="flex justify-end">
                    <ColDropdown label={semMinVol > 0 ? `≥ ${semMinVol.toLocaleString("fr-FR")}` : "Volume"} active={semMinVol > 0}>
                      {(close) => (
                        <div className="flex flex-col gap-4 p-3" style={{ width: 220 }}>
                          <div className="flex items-baseline justify-between">
                            <span className="text-[12px] font-medium text-[var(--text-muted)]">Volume min</span>
                            <span className="text-[20px] font-semibold tabular-nums text-[var(--text-primary)]">
                              {semMinVol === 0 ? "Tous" : semMinVol.toLocaleString("fr-FR")}
                            </span>
                          </div>
                          <div className="relative h-6 flex items-center">
                            <div className="absolute inset-x-0 h-1.5 rounded-full bg-[var(--bg-card-hover)]">
                              <div className="h-full rounded-full bg-[#3E50F5]"
                                style={{ width: `${(semMinVol / 2000) * 100}%` }} />
                            </div>
                            <input type="range" min={0} max={2000} step={50} value={semMinVol}
                              onChange={(e) => setSemMinVol(Number(e.target.value))}
                              className="relative w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#3E50F5] [&::-webkit-slider-thumb]:shadow-[0_0_0_3px_rgba(62,80,245,0.2)] [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#3E50F5]" />
                          </div>
                          <div className="flex gap-1.5">
                            {[0, 100, 500, 1000, 2000].map((v) => (
                              <button key={v} onClick={() => { setSemMinVol(v); if (v > 0) close(); }}
                                className={`flex-1 rounded-lg py-1.5 text-[11px] font-semibold transition-colors ${semMinVol === v ? "bg-[#3E50F5] text-white" : "bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}>
                                {v === 0 ? "Tous" : v >= 1000 ? `${v / 1000}k` : v}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </ColDropdown>
                  </div>
                </th>
                <th className="pl-4 pr-6 py-3 text-right font-semibold">Score</th>
              </tr>
            </thead>
            <tbody>
              {filteredKws.map((kw, idx) => (
                <tr key={idx} className="border-b border-[var(--border-subtle)] last:border-0 transition-colors hover:bg-[var(--bg-card-hover)]">
                  <td className="overflow-hidden px-6 py-4 align-top">
                    <span className="block truncate text-[13px] font-medium text-[var(--text-primary)]" title={kw.keyword}>
                      {kw.keyword}
                    </span>
                  </td>
                  <td className="overflow-hidden px-4 py-4 align-top">
                    <SemUrlList urls={kw.urls} extra={kw.extraUrls} />
                  </td>
                  <td className="px-4 py-4 align-top">
                    <Tooltip portal rich side="bottom" label={<SourceTip source={kw.source} />}>
                      <span className="inline-flex w-fit cursor-help rounded-full bg-[var(--bg-secondary)] px-3 py-1.5 text-[12px] font-semibold text-[var(--text-muted)]">
                        {kw.source}
                      </span>
                    </Tooltip>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <SemStatusCell row={kw} />
                  </td>
                  <td className="px-4 py-4 text-right align-top">
                    <span className="text-[13px] tabular-nums text-[var(--text-secondary)]">
                      {kw.volume.toLocaleString("fr-FR")}
                    </span>
                  </td>
                  <td className="pl-4 pr-6 py-4 text-right align-top">
                    <SemScore score={kw.score} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
