"use client";

import { ButtonHTMLAttributes, AnchorHTMLAttributes, forwardRef } from "react";

/* ── Variants & sizes ────────────────────────────────────────────────── */

const variants = {
  primary:
    "bg-accent-primary text-white hover:opacity-90 " +
    "disabled:bg-[var(--border-badge)] disabled:text-[var(--text-muted)] disabled:cursor-not-allowed",
  secondary:
    "border border-[var(--border-medium)] bg-transparent text-[var(--text-primary)] " +
    "hover:bg-[var(--bg-secondary)] " +
    "disabled:opacity-40 disabled:cursor-not-allowed",
  dark:
    "bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-80 " +
    "disabled:opacity-40 disabled:cursor-not-allowed",
  ghost:
    "bg-transparent text-[var(--text-secondary)] " +
    "hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] " +
    "disabled:opacity-40 disabled:cursor-not-allowed",
  danger:
    "bg-[var(--color-danger)] text-white hover:opacity-90 " +
    "disabled:opacity-40 disabled:cursor-not-allowed",
} as const;

const sizes = {
  sm: "h-9  px-3.5 text-[14px] rounded-full",
  md: "h-11 px-4   text-[16px] rounded-full",
  lg: "h-12 px-5   text-[18px] rounded-full",
} as const;

const base =
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 select-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2";

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

/* ── Button ──────────────────────────────────────────────────────────── */

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

/* ── LinkButton — même style, balise <a> ────────────────────────────── */

export interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant;
  size?: Size;
}

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ variant = "secondary", size = "md", className = "", children, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </a>
    );
  },
);
LinkButton.displayName = "LinkButton";
