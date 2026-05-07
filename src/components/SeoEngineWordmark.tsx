import { CSSProperties } from "react";

export function SeoEngineWordmark({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <span
      className={`inline-block whitespace-nowrap font-semibold ${className ?? ""}`}
      style={{ letterSpacing: "-0.06em", ...style }}
      aria-label="GlobalSearch"
    >
      GlobalSearch
    </span>
  );
}
