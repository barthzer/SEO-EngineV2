"use client";

import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

interface NumberInputProps {
  value: string | number;
  onChange: (val: string) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function NumberInput({
  value,
  onChange,
  placeholder,
  min,
  max,
  step = 1,
  className = "",
}: NumberInputProps) {
  const num = Number(value);

  function increment() {
    const next = (isNaN(num) ? 0 : num) + step;
    if (max !== undefined && next > max) return;
    onChange(String(next));
  }

  function decrement() {
    const next = (isNaN(num) ? 0 : num) - step;
    if (min !== undefined && next < min) return;
    onChange(String(next));
  }

  return (
    <div
      className={`flex items-stretch overflow-hidden rounded-xl border border-[var(--border-medium)] bg-[var(--input-bg)] focus-within:border-[var(--text-primary)] transition-colors ${className}`}
    >
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent px-3 py-2 text-[14px] text-[var(--text-primary)] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <div className="flex flex-col border-l border-[var(--border-subtle)]">
        <button
          type="button"
          tabIndex={-1}
          onClick={increment}
          className="flex flex-1 w-7 items-center justify-center text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
        >
          <ChevronUpIcon className="h-2.5 w-2.5" />
        </button>
        <div className="h-px bg-[var(--border-subtle)]" />
        <button
          type="button"
          tabIndex={-1}
          onClick={decrement}
          className="flex flex-1 w-7 items-center justify-center text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
        >
          <ChevronDownIcon className="h-2.5 w-2.5" />
        </button>
      </div>
    </div>
  );
}
