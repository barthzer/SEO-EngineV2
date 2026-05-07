"use client";

import type { ElementType } from "react";

type IconBadgeSize = "sm" | "md" | "lg";

interface IconBadgeProps {
  icon: ElementType;
  color?: string;
  bg?: string;
  size?: IconBadgeSize;
  outline?: boolean;
  className?: string;
}

const sizes: Record<IconBadgeSize, { container: string; icon: string }> = {
  sm: { container: "h-7 w-7 rounded-lg",    icon: "h-3.5 w-3.5" },
  md: { container: "h-9 w-9 rounded-xl",    icon: "h-4 w-4"     },
  lg: { container: "h-11 w-11 rounded-2xl", icon: "h-5 w-5"     },
};

export function IconBadge({ icon: Icon, color, bg, size = "md", outline = false, className = "" }: IconBadgeProps) {
  const s = sizes[size];
  const style = outline
    ? { border: "1px solid var(--border-medium)", color: color ?? "var(--text-primary)" }
    : { backgroundColor: bg ?? "var(--bg-subtle)", color: color ?? "var(--text-secondary)" };
  return (
    <span
      className={`inline-flex flex-shrink-0 items-center justify-center ${s.container} ${className}`}
      style={style}
    >
      <Icon className={s.icon} />
    </span>
  );
}
