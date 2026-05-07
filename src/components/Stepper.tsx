"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";

interface StepperProps {
  steps: number;
  current: number;
  onClose: () => void;
}

export function Stepper({ steps, current, onClose }: StepperProps) {
  return (
    <div className="mb-7 flex items-center gap-4">
      <div className="flex flex-1 items-center gap-2">
        {Array.from({ length: steps }, (_, i) => i + 1).map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              s <= current ? "bg-[var(--text-primary)]" : "bg-[var(--border-subtle)]"
            }`}
          />
        ))}
      </div>
      <button
        onClick={onClose}
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)]"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
