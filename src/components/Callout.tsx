"use client";

import type { ReactNode } from "react";

type CalloutVariant = "info" | "warning" | "error" | "success";

const VARIANTS: Record<CalloutVariant, { bg: string; border: string; iconColor: string }> = {
  info:    { bg: "rgba(62,80,245,0.05)",   border: "rgba(62,80,245,0.15)",   iconColor: "#3E50F5" },
  warning: { bg: "rgba(245,158,11,0.05)",  border: "rgba(245,158,11,0.15)",  iconColor: "#F59E0B" },
  error:   { bg: "rgba(225,29,72,0.05)",   border: "rgba(225,29,72,0.12)",   iconColor: "#E11D48" },
  success: { bg: "rgba(16,185,129,0.05)",  border: "rgba(16,185,129,0.12)",  iconColor: "#10B981" },
};

function Icon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="mt-0.5 flex-shrink-0" fill="none">
      <circle cx="8" cy="8" r="7" stroke={color} strokeWidth="1.5" />
      <rect x="7.25" y="4.5" width="1.5" height="4.5" rx=".75" fill={color} />
      <circle cx="8" cy="11" r=".75" fill={color} />
    </svg>
  );
}

interface CalloutProps {
  variant?: CalloutVariant;
  children: ReactNode;
  className?: string;
}

export function Callout({ variant = "info", children, className = "" }: CalloutProps) {
  const v = VARIANTS[variant];
  return (
    <div
      className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 ${className}`}
      style={{ backgroundColor: v.bg, borderColor: v.border }}
    >
      <Icon color={v.iconColor} />
      <div className="text-[13px] leading-relaxed" style={{ color: v.iconColor }}>
        {children}
      </div>
    </div>
  );
}
