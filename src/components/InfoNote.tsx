"use client";

import type { ReactNode } from "react";

/**
 * InfoNote — encart d'infos discret.
 *
 * Fond soft (`--bg-card-static`) + texte en `--text-primary` pour que le message
 * ressorte bien. Sans icône. Variante épurée du pattern vu dans les modales.
 */
export function InfoNote({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl bg-[var(--bg-card-static)] p-3.5 text-[13px] leading-relaxed text-[var(--text-primary)] ${className}`}
    >
      {children}
    </div>
  );
}
