"use client";

import { useRef, useState } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  expandedWidth?: number;
  /** When true, the input is always full-width — no expand-on-click behavior. */
  alwaysExpanded?: boolean;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Rechercher…",
  expandedWidth = 220,
  alwaysExpanded = false,
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isActive = alwaysExpanded || open || value !== "";

  function handleOpen() {
    if (alwaysExpanded) return;
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 10);
  }

  function handleBlur() {
    if (alwaysExpanded) return;
    if (value === "") setOpen(false);
  }

  function handleClear() {
    onChange("");
    if (!alwaysExpanded) setOpen(false);
  }

  const widthStyle: React.CSSProperties = alwaysExpanded
    ? { width: "100%", maxWidth: 360 }
    : {
        width: isActive ? `${expandedWidth + 56}px` : "40px",
        transitionTimingFunction: "var(--ease-expo)",
      };

  return (
    <div
      onClick={!isActive ? handleOpen : undefined}
      className={`flex h-10 ${alwaysExpanded ? "" : "flex-shrink-0"} items-center overflow-hidden rounded-full border border-[var(--border-subtle)] bg-[var(--card-inner-bg)] transition-all duration-300 ${className}`}
      style={{
        ...widthStyle,
        cursor: isActive ? "default" : "pointer",
      }}
    >
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center">
        <MagnifyingGlassIcon className="h-4 w-4 text-[var(--text-muted)]" />
      </span>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        tabIndex={isActive ? 0 : -1}
        className="flex-1 bg-transparent text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
        style={{ minWidth: 0 }}
      />

      {value !== "" && (
        <button
          onMouseDown={(e) => { e.preventDefault(); handleClear(); }}
          className="mr-2 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--text-muted)] text-[var(--bg-primary)] transition-opacity hover:opacity-80"
        >
          <XMarkIcon className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
