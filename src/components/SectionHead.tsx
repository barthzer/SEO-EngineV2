"use client";

interface SectionHeadProps {
  num: string;
  title: string;
  em?: string;
  meta?: string;
  children?: React.ReactNode;
}

export function SectionHead({ num, title, em, meta, children }: SectionHeadProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-baseline gap-2.5">
        <span className="font-mono text-[11px] text-[var(--text-muted)]">{num}</span>
        <h2 className="text-[19px] font-semibold text-[var(--text-primary)]">
          {title}
          {em && <em className="ml-2 not-italic text-[var(--text-muted)]">{em}</em>}
        </h2>
        {meta && <span className="text-[13px] text-[var(--text-muted)]">{meta}</span>}
      </div>
      {children}
    </div>
  );
}
