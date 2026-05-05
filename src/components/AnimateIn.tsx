"use client";

import { ReactNode } from "react";

/**
 * AnimateIn — smooth height expand/collapse using CSS grid trick.
 * Wraps content so it slides open/closed without knowing the height in advance.
 *
 * Usage:
 *   <AnimateIn show={isOpen}>...</AnimateIn>
 *
 * For one-shot entry animations use the CSS classes directly:
 *   animate-fade-in  animate-slide-down  animate-slide-up
 */
export function AnimateIn({
  show = true,
  children,
  className = "",
}: {
  show?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        show ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      }`}
    >
      <div className={`overflow-hidden ${className}`}>{children}</div>
    </div>
  );
}
