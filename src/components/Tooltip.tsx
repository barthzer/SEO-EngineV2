"use client";

import { ReactNode, useRef, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

interface ChartTooltipProps {
  x: number;
  y: number;
  children: ReactNode;
  /** Rend le tooltip dans un portail (position fixed) — utile quand le chart est dans un
   *  conteneur clippé (overflow-x-auto, etc.). x/y deviennent des coordonnées viewport. */
  portal?: boolean;
}

export function ChartTooltip({ x, y, children, portal = false }: ChartTooltipProps) {
  const className = "pointer-events-none -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-[rgba(20,20,20,0.82)] px-3 py-2 shadow-[var(--shadow-floating)] backdrop-blur-md transition-[left,top] duration-150 ease-out";
  if (portal && typeof window !== "undefined") {
    return createPortal(
      <div className={`${className} fixed z-[1000]`} style={{ left: x, top: y - 8 }}>
        {children}
      </div>,
      document.body,
    );
  }
  return (
    <div className={`${className} absolute z-50`} style={{ left: x, top: y - 8 }}>
      {children}
    </div>
  );
}

interface TooltipProps {
  label: ReactNode;
  children: ReactNode;
  side?: "right" | "top" | "bottom" | "left";
  disabled?: boolean;
  className?: string;
  portal?: boolean;
  rich?: boolean;
}

/* Origin de la transformation par côté — la tooltip pousse depuis le trigger. */
const sideOriginClasses: Record<NonNullable<TooltipProps["side"]>, string> = {
  right:  "origin-left",
  left:   "origin-right",
  top:    "origin-bottom",
  bottom: "origin-top",
};

/* Position de base + petit offset directionnel d'entrée. Le scale + opacity
   font le reste, l'easing donne le feel expo. */
const sideClasses: Record<NonNullable<TooltipProps["side"]>, string> = {
  right:  "left-full top-1/2 ml-3 -translate-y-1/2 -translate-x-0.5 group-hover:translate-x-0",
  left:   "right-full top-1/2 mr-3 -translate-y-1/2 translate-x-0.5  group-hover:translate-x-0",
  top:    "bottom-full left-1/2 mb-2 -translate-x-1/2 translate-y-0.5  group-hover:translate-y-0",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2 -translate-y-0.5 group-hover:translate-y-0",
};

const TOOLTIP_CLASS = "pointer-events-none whitespace-nowrap rounded-lg bg-[rgba(20,20,20,0.82)] px-3 py-2 type-caption text-white shadow-[var(--shadow-floating)] backdrop-blur-md dark:bg-[rgba(40,40,42,0.80)] dark:border dark:border-[var(--border-subtle)] dark:text-[var(--text-primary)]";
const RICH_TOOLTIP_CLASS = "pointer-events-none max-w-[280px] rounded-xl bg-[rgba(18,18,20,0.95)] p-3.5 type-caption leading-relaxed text-white shadow-[var(--shadow-floating)] backdrop-blur-md";

const TRANSITION_CLASS = "transition-[opacity,transform] duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]";

export function Tooltip({ label, children, side = "right", disabled = false, className = "", portal = false, rich = false }: TooltipProps) {
  if (disabled) return <>{children}</>;

  if (portal) return <PortalTooltip label={label} side={side} className={className} rich={rich}>{children}</PortalTooltip>;

  const cls = rich ? RICH_TOOLTIP_CLASS : TOOLTIP_CLASS;
  return (
    <span className={`group relative inline-flex ${className}`}>
      {children}
      <span
        className={`absolute z-50 opacity-0 scale-90 ${TRANSITION_CLASS} group-hover:opacity-100 group-hover:scale-100 ${sideOriginClasses[side]} ${sideClasses[side]} ${cls}`}
      >
        {label}
      </span>
    </span>
  );
}

type TipSide = NonNullable<TooltipProps["side"]>;

function PortalTooltip({ label, children, side = "right", className = "", rich = false }: Omit<TooltipProps, "disabled" | "portal">) {
  const ref = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number; origin: string } | null>(null);

  // Positionnement viewport-aware : on rend d'abord la bulle invisible pour la
  // mesurer, on choisit le côté (flip si le côté préféré déborde), puis on borne
  // left/top pour qu'elle reste TOUJOURS dans le viewport. Corrige d'un coup les
  // débordements récurrents (bulle large centrée sur un trigger près d'un bord).
  useLayoutEffect(() => {
    if (!open || !ref.current || !tipRef.current) { setPos(null); return; }
    const GAP = 10, MARGIN = 8;
    const r = ref.current.getBoundingClientRect();
    const t = tipRef.current.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;

    const opposite: Record<TipSide, TipSide> = { right: "left", left: "right", top: "bottom", bottom: "top" };
    const fits: Record<TipSide, boolean> = {
      right:  r.right + GAP + t.width   <= vw - MARGIN,
      left:   r.left  - GAP - t.width   >= MARGIN,
      top:    r.top   - GAP - t.height  >= MARGIN,
      bottom: r.bottom + GAP + t.height <= vh - MARGIN,
    };
    const s: TipSide = (!fits[side] && fits[opposite[side]]) ? opposite[side] : side;

    let left: number, top: number;
    if (s === "right")      { left = r.right + GAP;                     top = r.top + r.height / 2 - t.height / 2; }
    else if (s === "left")  { left = r.left - GAP - t.width;            top = r.top + r.height / 2 - t.height / 2; }
    else if (s === "top")   { left = r.left + r.width / 2 - t.width / 2; top = r.top - GAP - t.height; }
    else                    { left = r.left + r.width / 2 - t.width / 2; top = r.bottom + GAP; }

    // Bornage dans le viewport (avec marge).
    left = Math.min(Math.max(left, MARGIN), Math.max(MARGIN, vw - t.width - MARGIN));
    top  = Math.min(Math.max(top,  MARGIN), Math.max(MARGIN, vh - t.height - MARGIN));

    const origin = s === "right" ? "left center" : s === "left" ? "right center" : s === "top" ? "center bottom" : "center top";
    setPos({ left, top, origin });
  }, [open, side, label]);

  return (
    <span ref={ref} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} className={`inline-flex ${className}`}>
      {children}
      {open && typeof document !== "undefined" && createPortal(
        <span
          ref={tipRef}
          className={`pointer-events-none fixed z-[9999] ${rich ? RICH_TOOLTIP_CLASS : TOOLTIP_CLASS}`}
          style={{
            left: pos?.left ?? 0,
            top: pos?.top ?? 0,
            transformOrigin: pos?.origin,
            visibility: pos ? "visible" : "hidden",
            animation: pos ? "tooltip-appear 140ms var(--ease-expo, cubic-bezier(0.16,1,0.3,1)) both" : undefined,
          }}
        >
          {label}
        </span>,
        document.body
      )}
    </span>
  );
}
