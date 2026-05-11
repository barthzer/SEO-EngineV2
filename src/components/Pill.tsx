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
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[12px] font-medium ${className}`}
      style={{ color, backgroundColor: bg }}
    >
      {children}
    </span>
  );
}
