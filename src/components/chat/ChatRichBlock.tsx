"use client";

/**
 * ChatRichBlock — rendu des blocs riches de l'assistant (G3).
 *
 * Trois variantes : `scorecards` (grille de mini-KPI), `bars` (barres
 * horizontales) et `table`. Tout est tokenisé DS (pas de couleur en dur),
 * et tient dans la largeur du drawer assistant.
 */

import { DeltaBadge } from "@/components/DeltaBadge";
import type { RichBlock } from "@/lib/chat/richBlocks";

export function ChatRichBlock({ block }: { block: RichBlock }) {
  return (
    <div className="mt-2 w-full overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card-static)]">
      {(block.title || block.source) && (
        <div className="flex items-baseline justify-between gap-2 px-3.5 pt-3">
          {block.title && (
            <p className="type-label font-semibold text-[var(--text-primary)]">{block.title}</p>
          )}
          {block.source && (
            <span className="flex-shrink-0 type-micro uppercase tracking-wider">
              {block.source}
            </span>
          )}
        </div>
      )}

      {block.kind === "scorecards" && (
        <div className="grid grid-cols-2 gap-px bg-[var(--border-subtle)] p-3.5 pt-3 [&>*]:bg-[var(--bg-card-static)]">
          {block.items.map((it) => (
            <div key={it.label} className="flex flex-col gap-0.5 px-1 py-1.5">
              <span className="truncate type-micro">{it.label}</span>
              <div className="flex items-baseline gap-1.5">
                <span className="type-h3 tabular-nums leading-none">
                  {it.value}
                </span>
                {it.hint && <span className="type-micro">{it.hint}</span>}
              </div>
              {it.delta !== undefined && (
                <div className="mt-0.5">
                  <DeltaBadge value={it.delta} positiveIsGood={it.deltaPositiveIsGood ?? true} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {block.kind === "bars" && (
        <div className="flex flex-col gap-2 px-3.5 pb-3.5 pt-3">
          {block.items.map((it) => {
            const pct = Math.max(2, (it.value / (block.max ?? 100)) * 100);
            return (
              <div key={it.label} className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate type-caption">{it.label}</span>
                  <span className="flex-shrink-0 type-label font-semibold tabular-nums text-[var(--text-primary)]">
                    {it.display ?? it.value}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: "var(--accent-primary)" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {block.kind === "table" && (
        <div className="px-2 pb-2.5 pt-2">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {block.columns.map((col, i) => (
                  <th
                    key={col}
                    className={`px-1.5 py-1.5 type-caption ${
                      (block.align?.[i] ?? (i === 0 ? "left" : "right")) === "right" ? "text-right" : "text-left"
                    }`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className="border-t border-[var(--border-subtle)]">
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`px-1.5 py-1.5 ${
                        (block.align?.[ci] ?? (ci === 0 ? "left" : "right")) === "right"
                          ? "text-right tabular-nums"
                          : "text-left"
                      } ${ci === 0 ? "type-label text-[var(--text-primary)]" : "type-caption"}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
