"use client";

import { SparklesIcon } from "@heroicons/react/24/solid";
import type { ReactNode } from "react";

export function AIInsight({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-2xl border border-[var(--border-subtle)] px-3.5 py-3">
      <SparklesIcon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[var(--text-primary)]" />
      <p className="text-[13px] leading-relaxed text-[var(--text-primary)]">{children}</p>
    </div>
  );
}
