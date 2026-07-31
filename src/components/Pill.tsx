"use client";

import type { ReactNode } from "react";

export interface PillProps {
  children: ReactNode;
  color?: string;
  bg?: string;
  className?: string;
}

export function Pill({ children, color, bg, className = "" }: PillProps) {
  return (
    <span
      className={`inline-flex max-w-[240px] items-center gap-1.5 truncate rounded-full px-2 py-1 type-micro ${className}`}
      style={{ color, backgroundColor: bg }}
    >
      {children}
    </span>
  );
}
