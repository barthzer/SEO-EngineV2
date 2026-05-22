"use client";

import type { ReactNode } from "react";

/**
 * IconSwap — cross-fade entre 2 icônes dans le même slot (transitions-dev #9).
 *
 * Usage :
 *   <IconSwap state={isActive ? "b" : "a"}
 *     a={<HomeOutline className="h-5 w-5" />}
 *     b={<HomeSolid className="h-5 w-5" />}
 *   />
 *
 * Les 2 icônes restent montées dans la même grille — cross-fade + blur + scale-up de
 * 0.25 → 1 sur la sortante. Pure CSS, pas de JS.
 */
export function IconSwap({
  state,
  a,
  b,
  className = "",
  size,
}: {
  state: "a" | "b";
  a: ReactNode;
  b: ReactNode;
  className?: string;
  /** Taille du slot (forçage des dimensions, utile pour empêcher le layout shift) */
  size?: number;
}) {
  return (
    <span
      className={`t-icon-swap ${className}`}
      data-state={state}
      style={size ? { width: size, height: size } : undefined}
    >
      <span className="t-icon" data-icon="a" aria-hidden={state !== "a"}>{a}</span>
      <span className="t-icon" data-icon="b" aria-hidden={state !== "b"}>{b}</span>
    </span>
  );
}
