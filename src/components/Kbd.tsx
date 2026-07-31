import type { ReactNode } from "react";

/**
 * Kbd — affiche un raccourci clavier (ex. `⌘P`, `Esc`, `Enter`).
 *
 * Spec design system (figée) :
 *  - font-size : 12px
 *  - padding   : 4px 8px
 *  - rounded + border subtle + bg-subtle
 *  - font-mono · text-muted
 *
 * @example
 *   <Kbd>⌘P</Kbd>
 *   <Kbd>Esc</Kbd>
 */
export function Kbd({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={`inline-flex items-center rounded border border-[var(--border-subtle)] bg-[var(--bg-subtle)] py-1 px-2 font-mono type-caption leading-none text-[var(--text-muted)] ${className}`}
    >
      {children}
    </kbd>
  );
}
