import type { ReactNode } from "react";

interface SoftPanelProps {
  children: ReactNode;
  className?: string;
}

/**
 * Encart léger : padding 8px, fond bg-subtle, coins rounded-3xl.
 * Conçu pour grouper visuellement un set d'éléments (KpiCard, etc.).
 */
export function SoftPanel({ children, className = "" }: SoftPanelProps) {
  return (
    <div className={`rounded-3xl bg-[var(--bg-subtle)] p-2 ${className}`}>
      {children}
    </div>
  );
}
