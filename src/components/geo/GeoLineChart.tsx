"use client";

import { useState } from "react";
import type { Series } from "@/data/geo-analytics";

/**
 * GeoLineChart — multi-lignes SVG (toi vs concurrents / par modèle IA), tokens DS.
 * La série « vous » est plus épaisse. Légende sous le graphe.
 *
 * `interactive` (opt-in) : checkbox par série dans la légende (toggle on/off)
 * + ligne de survol et tooltip avec la valeur de chaque série visible.
 */
export function GeoLineChart({
  series,
  height = 220,
  suffix = "%",
  interactive = false,
  invert = false,
  compare,
  onCompareChange,
  compareLabel = "Comparer les concurrents",
}: {
  series: Series[];
  height?: number;
  suffix?: string;
  interactive?: boolean;
  compareLabel?: string;
  /** Axe Y inversé (1 en haut) — pour la position moyenne (plus bas = mieux). */
  invert?: boolean;
  /** Active le toggle « Comparer les concurrents » dans la légende. Quand `false`,
   *  seule la série « vous » est tracée. */
  compare?: boolean;
  onCompareChange?: (v: boolean) => void;
}) {
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const compareEnabled = typeof compare === "boolean" && !!onCompareChange;
  const isInteractive = interactive || (compareEnabled && compare);
  // Mode comparaison désactivé → on ne garde que la série « vous ».
  const chartSeries = compareEnabled && !compare ? series.filter((s) => s.isYou) : series;

  const W = 720, H = height, padL = 44, padR = 14, padT = 12, padB = 26;
  const visible = chartSeries.filter((s) => !hidden.has(s.name));
  const allVals = (visible.length ? visible : chartSeries).flatMap((s) => s.points.map((p) => p.value));
  const labels = series[0]?.points.map((p) => p.label) ?? [];
  const n = labels.length;

  // Domaine de l'axe Y : standard (0 → max arrondi) ou inversé (min → max, 1 en haut).
  let domainMin: number, domainMax: number, ticks: number[];
  if (invert) {
    const rawMin = Math.min(...allVals);
    const rawMax = Math.max(...allVals);
    domainMin = Math.max(1, Math.floor(rawMin));
    domainMax = Math.max(domainMin + 1, Math.ceil(rawMax));
    ticks = [domainMin, (domainMin + domainMax) / 2, domainMax];
  } else {
    domainMin = 0;
    domainMax = Math.max(10, Math.ceil(Math.max(...allVals) / 10) * 10);
    ticks = [0, domainMax / 2, domainMax];
  }

  const x = (i: number) => padL + (i / Math.max(1, n - 1)) * (W - padL - padR);
  const y = (v: number) => invert
    ? padT + ((v - domainMin) / (domainMax - domainMin)) * (H - padT - padB)
    : padT + (1 - v / domainMax) * (H - padT - padB);
  const xPct = (i: number) => (x(i) / W) * 100;
  const fmtTick = (t: number) => invert ? `${Math.round(t * 10) / 10}` : `${Math.round(t)}${suffix}`;

  const toggle = (name: string) =>
    setHidden((h) => { const next = new Set(h); next.has(name) ? next.delete(name) : next.add(name); return next; });

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const rel = (e.clientX - rect.left) / rect.width;
    const vbX = rel * W;
    const idx = Math.round(((vbX - padL) / Math.max(1, W - padL - padR)) * (n - 1));
    setHoverIdx(Math.max(0, Math.min(n - 1, idx)));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative" style={{ height }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
          {/* Grille verticale — alignée sur les labels de l'axe X (plus de lignes horizontales) */}
          {labels.map((_, i) => (
            <line key={`grid-${i}`} x1={x(i)} y1={padT} x2={x(i)} y2={H - padB} stroke="var(--border-subtle)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
          ))}
          {/* Lignes (les points/dots sont rendus en HTML pour éviter la distorsion) */}
          {visible.map((s) => {
            const d = s.points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.value)}`).join(" ");
            return (
              <path key={s.name} d={d} fill="none" stroke={s.color} strokeWidth={s.isYou ? 2.5 : 1.5}
                strokeLinejoin="round" strokeLinecap="round" opacity={s.isYou ? 1 : 0.85}
                vectorEffect="non-scaling-stroke" style={{ shapeRendering: "geometricPrecision" }} />
            );
          })}
        </svg>

        {/* Labels d'axes en HTML — évitent la distorsion du <text> SVG sous preserveAspectRatio="none" */}
        {ticks.map((t) => (
          <span
            key={`y-${t}`}
            aria-hidden="true"
            className="pointer-events-none absolute text-[10px] tabular-nums text-[var(--text-muted)]"
            style={{ top: `${(y(t) / H) * 100}%`, left: 0, width: `${((padL - 8) / W) * 100}%`, textAlign: "right", transform: "translateY(-50%)" }}
          >
            {fmtTick(t)}
          </span>
        ))}
        {labels.map((l, i) => (
          <span
            key={`x-${l}-${i}`}
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 text-[10px] text-[var(--text-muted)]"
            style={{ left: `${(x(i) / W) * 100}%`, transform: "translateX(-50%)" }}
          >
            {l}
          </span>
        ))}

        {/* Ligne de survol (HTML — déplacement fluide entre les points) */}
        {isInteractive && hoverIdx != null && (
          <span aria-hidden="true"
            className="pointer-events-none absolute border-l border-dashed border-[var(--border-medium)]"
            style={{
              left: `${(x(hoverIdx) / W) * 100}%`, top: `${(padT / H) * 100}%`,
              height: `${((H - padT - padB) / H) * 100}%`, width: 0,
              transform: "translateX(-50%)", transition: "left 150ms ease-out",
            }} />
        )}
        {isInteractive && hoverIdx != null && visible.map((s) => (
          <span key={`hdot-${s.name}`} aria-hidden="true"
            className="pointer-events-none absolute rounded-full"
            style={{
              left: `${(x(hoverIdx) / W) * 100}%`, top: `${(y(s.points[hoverIdx].value) / H) * 100}%`,
              width: 7, height: 7, backgroundColor: s.color,
              boxShadow: "0 0 0 1.5px var(--bg-primary)", transform: "translate(-50%, -50%)",
              transition: "left 150ms ease-out, top 150ms ease-out",
            }} />
        ))}

        {/* Overlay de survol + tooltip */}
        {isInteractive && (
          <div className="absolute inset-0" onMouseMove={onMove} onMouseLeave={() => setHoverIdx(null)} />
        )}
        {isInteractive && hoverIdx != null && visible.length > 0 && (
          <div
            className="pointer-events-none absolute top-1 z-10 -translate-x-1/2 whitespace-nowrap rounded-xl bg-[rgba(20,20,20,0.92)] px-3 py-2 shadow-[var(--shadow-floating)] backdrop-blur-md dark:border dark:border-[var(--border-subtle)]"
            style={{ left: `clamp(72px, ${xPct(hoverIdx)}%, calc(100% - 72px))`, transition: "left 150ms ease-out" }}
          >
            <p className="mb-1.5 text-[11px] font-medium text-white/70">{labels[hoverIdx]}</p>
            <div className="flex flex-col gap-1">
              {visible.map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  {s.domain ? (
                    <img src={`https://www.google.com/s2/favicons?domain=${s.domain}&sz=64`} alt="" width={13} height={13}
                      className="rounded-sm" style={{ width: 13, height: 13 }} />
                  ) : (
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  )}
                  <span className="text-[12px] text-white/80">{s.name}</span>
                  <strong className="ml-auto pl-4 text-[12px] tabular-nums text-white">{s.points[hoverIdx].value}{suffix}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Légende (checkbox si interactive) + toggle « Comparer les concurrents » */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {chartSeries.map((s) => {
            const on = !hidden.has(s.name);
            if (!isInteractive || chartSeries.length <= 1) {
              return (
                <span key={s.name} className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)]">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className={s.isYou ? "font-medium text-[var(--text-primary)]" : ""}>{s.name}</span>
                  <strong className="tabular-nums text-[var(--text-primary)]">{s.points[s.points.length - 1]?.value}{suffix}</strong>
                </span>
              );
            }
            return (
              <button key={s.name} type="button" onClick={() => toggle(s.name)} className="flex items-center gap-1.5 text-[12px]">
                <span className="flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-[5px] border-2 transition-colors"
                  style={{ borderColor: s.color, backgroundColor: on ? s.color : "transparent" }}>
                  {on && (
                    <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" aria-hidden="true">
                      <path d="M2.5 6.2l2 2 4.6-4.8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className={on ? "font-medium text-[var(--text-primary)]" : "text-[var(--text-muted)]"}>{s.name}</span>
                <strong className={`tabular-nums ${on ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>{s.points[s.points.length - 1]?.value}{suffix}</strong>
              </button>
            );
          })}
        </div>
        {compareEnabled && (
          <button type="button" role="switch" aria-checked={compare}
            onClick={() => onCompareChange?.(!compare)}
            className="flex flex-shrink-0 items-center gap-2 text-[12px] font-medium text-[var(--text-secondary)]">
            <span className={`relative h-[18px] w-8 flex-shrink-0 rounded-full transition-colors ${compare ? "bg-[var(--accent-primary)]" : "bg-[var(--border-medium)]"}`}>
              <span className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-all ${compare ? "left-[15px]" : "left-0.5"}`} />
            </span>
            {compareLabel}
          </button>
        )}
      </div>
    </div>
  );
}
