"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { Tooltip } from "@/components/Tooltip";

export type BlocDef = {
  iconPaths: (fill: string) => ReactNode;
  gradFrom: string;
  gradTo: string;
  iconBottomColor: string;
  title: string;
  /** Petite description sous le titre — détaille la valeur du bloc. */
  description: string;
  color: string;
  colorBg: string;
  /** Bullet points affichés dans le tooltip d'info au coin. */
  features: string[];
  /** URL de destination quand le bloc est un Link. Ignorée si `onClick` est fourni. */
  cta?: string;
  /** Si fourni, le bloc devient un <button> qui appelle ce handler (au lieu d'un Link). */
  onClick?: () => void;
};

/**
 * BlocCard — carte d'action stratégique (Vue d'ensemble du projet).
 * Header avec icône gradient + bouton info, titre 14px, sous-titre 12px muted,
 * flèche `ArrowUpRight` en bas à droite (accent au hover).
 */
export function BlocCard({ bloc, index }: { bloc: BlocDef; index: number }) {
  const iconGradId = `bloc-icon-${index}`;
  const inner = (
    <>
      {/* Header — icône gradient + bouton info */}
      <div className="flex items-start justify-between">
        <div
          className="flex-shrink-0 overflow-hidden rounded-xl p-px"
          style={{ background: `linear-gradient(to bottom, ${bloc.gradFrom}99, ${bloc.gradTo}80)` }}
        >
          <div
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[11px]"
            style={{ background: `linear-gradient(to bottom, ${bloc.gradFrom}, ${bloc.gradTo})` }}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <defs>
                <linearGradient id={iconGradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="white" stopOpacity="1" />
                  <stop offset="100%" stopColor="white" stopOpacity="0.60" />
                </linearGradient>
              </defs>
              {bloc.iconPaths(`url(#${iconGradId})`)}
            </svg>
          </div>
        </div>
        <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
          <Tooltip
            side="top"
            rich
            portal
            label={
              <ul className="space-y-1.5">
                {bloc.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[12px] text-white/85">
                    <span className="h-1 w-1 flex-shrink-0 rounded-full bg-white/50" />
                    {f}
                  </li>
                ))}
              </ul>
            }
          >
            <button
              type="button"
              className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M7.5 6.5v4M7.5 4.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </button>
          </Tooltip>
        </span>
      </div>

      {/* Title + description */}
      <p className="mt-4 text-[14px] font-semibold leading-tight text-[var(--text-primary)]">{bloc.title}</p>
      <p className="mt-1.5 text-[12px] leading-snug tracking-caption text-[var(--text-muted)]">{bloc.description}</p>

      {/* Arrow up-right — secondary par défaut, accent brand au hover */}
      <div className="mt-auto flex justify-end pt-5">
        <ArrowUpRight className="h-4 w-4 text-[var(--text-secondary)] transition-colors duration-150 group-hover/bloc:text-[var(--accent-primary)]" />
      </div>
    </>
  );

  const wrapperClass = "group/bloc relative flex flex-col rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 transition-colors duration-200 hover:bg-[var(--bg-subtle)]";

  if (bloc.onClick) {
    return (
      <button type="button" onClick={bloc.onClick} className={`${wrapperClass} text-left`}>
        {inner}
      </button>
    );
  }
  return (
    <Link href={bloc.cta ?? "#"} className={wrapperClass}>
      {inner}
    </Link>
  );
}
