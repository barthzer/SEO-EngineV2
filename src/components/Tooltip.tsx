"use client";

import { ReactNode, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ChartTooltipProps {
  x: number;
  y: number;
  children: ReactNode;
}

export function ChartTooltip({ x, y, children }: ChartTooltipProps) {
  return (
    <div
      className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-[rgba(20,20,20,0.82)] px-3 py-2 shadow-[var(--shadow-floating)] backdrop-blur-md transition-[left,top] duration-150 ease-out"
      style={{ left: x, top: y - 8 }}
    >
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

const sideClasses = {
  right:  "left-full top-1/2 ml-3 -translate-y-1/2",
  left:   "right-full top-1/2 mr-3 -translate-y-1/2",
  top:    "bottom-full left-1/2 mb-2 -translate-x-1/2",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
};

const TOOLTIP_CLASS = "pointer-events-none whitespace-nowrap rounded-lg bg-[rgba(20,20,20,0.82)] px-3 py-2 text-[12px] font-medium text-white shadow-[var(--shadow-floating)] backdrop-blur-md dark:bg-[rgba(40,40,42,0.80)] dark:border dark:border-[var(--border-subtle)] dark:text-[var(--text-primary)]";
const RICH_TOOLTIP_CLASS = "pointer-events-none max-w-[280px] rounded-xl bg-[rgba(18,18,20,0.95)] p-3.5 text-[12px] leading-relaxed text-white shadow-[var(--shadow-floating)] backdrop-blur-md";

export function Tooltip({ label, children, side = "right", disabled = false, className = "", portal = false, rich = false }: TooltipProps) {
  if (disabled) return <>{children}</>;

  if (portal) return <PortalTooltip label={label} side={side} className={className} rich={rich}>{children}</PortalTooltip>;

  const cls = rich ? RICH_TOOLTIP_CLASS : TOOLTIP_CLASS;
  return (
    <span className={`group relative inline-flex ${className}`}>
      {children}
      <span className={`absolute z-50 opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${cls} ${sideClasses[side]}`}>
        {label}
      </span>
    </span>
  );
}

function PortalTooltip({ label, children, side = "right", className = "", rich = false }: Omit<TooltipProps, "disabled" | "portal">) {
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const show = () => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    if (side === "right") setPos({ x: r.right + 10, y: r.top + r.height / 2 });
    else if (side === "left") setPos({ x: r.left - 10, y: r.top + r.height / 2 });
    else if (side === "top") setPos({ x: r.left + r.width / 2, y: r.top - 10 });
    else setPos({ x: r.left + r.width / 2, y: r.bottom + 10 });
  };

  const translateClass =
    side === "right" ? "-translate-y-1/2" :
    side === "left"  ? "-translate-y-1/2 -translate-x-full" :
    side === "top"   ? "-translate-x-1/2 -translate-y-full" :
    "-translate-x-1/2";

  return (
    <span ref={ref} onMouseEnter={show} onMouseLeave={() => setPos(null)} className={`inline-flex ${className}`}>
      {children}
      {pos && typeof document !== "undefined" && createPortal(
        <span
          className={`fixed z-[9999] ${translateClass} ${rich ? RICH_TOOLTIP_CLASS : TOOLTIP_CLASS}`}
          style={{ left: pos.x, top: pos.y }}
        >
          {label}
        </span>,
        document.body
      )}
    </span>
  );
}
