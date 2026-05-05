/* ── Primitive ───────────────────────────────────────────────────────── */

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

export function SkeletonText({ className = "", width = "w-full" }: { className?: string; width?: string }) {
  return <Skeleton className={`h-3.5 ${width} ${className}`} />;
}

export function SkeletonCircle({ size = "h-12 w-12" }: { size?: string }) {
  return <Skeleton className={`rounded-full flex-shrink-0 ${size}`} />;
}

/* ── Analysis card skeleton (dashboard grid) ─────────────────────────── */

export function SkeletonAnalysisCard() {
  return (
    <div className="flex flex-col rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
      {/* Logo + domain + score circle */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 flex-shrink-0 rounded-2xl" />
        <div className="min-w-0 flex-1">
          <SkeletonText width="w-3/5" />
        </div>
        <SkeletonCircle size="h-[50px] w-[50px]" />
      </div>

      {/* 3-col metrics */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-1.5 px-1 py-1">
            <Skeleton className="h-2.5 w-14 rounded-full" />
            <Skeleton className="h-5 w-10 rounded-md" />
          </div>
        ))}
      </div>

      {/* Date + status + arrow */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-20 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
    </div>
  );
}

/* ── Analyse page header skeleton ────────────────────────────────────── */

export function SkeletonAnalyseHeader() {
  return (
    <div className="mb-5">
      {/* Breadcrumb: "Projets › domain" */}
      <div className="mb-5 inline-flex items-center gap-1">
        <Skeleton className="h-3.5 w-12 rounded-full" />
        <Skeleton className="h-2.5 w-2.5 rounded-full" />
        <Skeleton className="h-3.5 w-24 rounded-full" />
      </div>

      <div className="flex items-center justify-between">
        {/* Left: favicon + title + meta + badges */}
        <div>
          <div className="flex items-center gap-5">
            <Skeleton className="h-16 w-16 flex-shrink-0 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-64 rounded-xl" />
              <Skeleton className="h-3 w-40 rounded-full" />
            </div>
          </div>
          <div className="mt-5 flex items-center gap-2">
            <Skeleton className="h-9 w-32 rounded-full" />
            <Skeleton className="h-9 w-28 rounded-full" />
          </div>
        </div>

        {/* Right: 3-dot menu */}
        <SkeletonCircle size="h-9 w-9" />
      </div>
    </div>
  );
}

/* ── Tabs skeleton ───────────────────────────────────────────────────── */

export function SkeletonTabs({ count = 7 }: { count?: number }) {
  const widths = ["w-14", "w-8", "w-28", "w-20", "w-16", "w-20", "w-10"];
  return (
    <div className="flex h-16 items-center gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex h-full items-center px-4">
          <Skeleton className={`h-4 ${widths[i % widths.length]} rounded-full`} />
        </div>
      ))}
    </div>
  );
}

/* ── Analyse general tab skeleton ────────────────────────────────────── */

export function SkeletonAnalyseGeneral() {
  return (
    <div className="flex flex-col gap-8">

      {/* 5 metric cards */}
      <div className="grid grid-cols-5 gap-x-2 gap-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2.5 p-2">
            <Skeleton className="h-3 w-4/5 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-xl" />
            <Skeleton className="h-2.5 w-3/5 rounded-full" />
          </div>
        ))}
      </div>

      {/* 4 strategy blocks */}
      <div>
        <Skeleton className="mb-4 h-5 w-40 rounded-md" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-4 rounded-3xl border border-[var(--border-subtle)] p-5">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <Skeleton className="h-3.5 w-4/5 rounded-full" />
              <Skeleton className="h-8 w-16 rounded-xl" />
              <Skeleton className="mt-auto h-2.5 w-1/2 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Health cards — grid-cols-2 */}
      <div className="grid grid-cols-2 gap-4">
        {[0, 1].map((card) => (
          <div key={card} className="overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
            {/* Header */}
            <div className="flex items-start gap-4 p-7">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-36 rounded-md" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-3 w-28 rounded-full" />
                </div>
              </div>
              <SkeletonCircle size="h-[72px] w-[72px]" />
            </div>
            {/* Quote */}
            <div className="mx-7 mb-4 rounded-2xl bg-[var(--bg-card-hover)] p-3.5 space-y-1.5">
              <Skeleton className="h-3 w-full rounded-full" />
              <Skeleton className="h-3 w-4/5 rounded-full" />
            </div>
            {/* Top actions */}
            <div className="px-7 pb-4">
              <Skeleton className="mb-3 h-3.5 w-20 rounded-full" />
              <div className="flex flex-col gap-2.5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 flex-shrink-0 rounded-xl" />
                    <Skeleton className={`h-3.5 rounded-full ${i === 2 ? "w-3/4" : "flex-1"}`} />
                  </div>
                ))}
              </div>
            </div>
            {/* Footer */}
            <div className="flex items-center justify-between px-7 pb-7 pt-1">
              <Skeleton className="h-3 w-28 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Core Web Vitals */}
      <div className="overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
        <div className="flex items-center gap-2.5 p-7 pb-5">
          <Skeleton className="h-9 w-9 flex-shrink-0 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-36 rounded-full" />
            <Skeleton className="h-3 w-48 rounded-full" />
          </div>
        </div>
        <div className="flex px-7 pb-7 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-1 items-center gap-4 px-4">
              <Skeleton className="h-10 w-10 flex-shrink-0 rounded-xl" />
              <div className="space-y-2 min-w-0">
                <Skeleton className="h-2.5 w-8 rounded-full" />
                <Skeleton className="h-7 w-20 rounded-xl" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-3 w-12 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Distribution + Profils — grid-cols-2 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-7">
          <Skeleton className="mb-1 h-5 w-52 rounded-md" />
          <Skeleton className="mb-5 h-3 w-32 rounded-full" />
          <div className="flex h-40 items-end gap-4">
            {[40, 80, 4, 4].map((h, i) => (
              <div key={i} className="flex-1 skeleton rounded-lg" style={{ height: `${Math.max(h, 4)}%` }} />
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-7">
          <Skeleton className="mb-4 h-5 w-40 rounded-md" />
          <div className="flex items-center gap-8">
            <SkeletonCircle size="h-[120px] w-[120px]" />
            <div className="space-y-2.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-2.5 w-2.5 flex-shrink-0 rounded-full" />
                  <Skeleton className="h-3 w-28 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Visibility line chart */}
      <div className="overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-7">
        <Skeleton className="mb-1 h-5 w-56 rounded-md" />
        <Skeleton className="mb-6 h-3 w-36 rounded-full" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>

      {/* Lots actifs */}
      <div>
        <Skeleton className="mb-4 h-5 w-28 rounded-md" />
        <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`flex items-center justify-between gap-6 px-5 py-4 ${i < 2 ? "border-b border-[var(--border-subtle)]" : ""}`}>
              <div className="flex flex-1 items-center gap-3 min-w-0">
                <Skeleton className="h-2 w-2 flex-shrink-0 rounded-full" />
                <Skeleton className="h-3.5 w-48 rounded-full" />
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Skeleton className="h-1.5 w-24 rounded-full" />
                <Skeleton className="h-3 w-8 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activités récentes */}
      <div>
        <Skeleton className="mb-4 h-5 w-36 rounded-md" />
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full" />
              <Skeleton className={`h-3 flex-1 rounded-full ${i % 2 === 0 ? "" : "w-3/4"}`} />
              <Skeleton className="flex-shrink-0 h-3 w-14 rounded-full" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

/* ── Briefs skeleton ──────────────────────────────────────────────────── */

export function SkeletonBriefs() {
  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Toolbar: SearchInput (left) + FilterTabs (right) */}
      <div className="mb-4 flex flex-shrink-0 items-center gap-3">
        <SkeletonCircle size="h-10 w-10" />
        <div className="ml-auto flex gap-1">
          {["w-16", "w-20", "w-16", "w-14", "w-18"].map((w, i) => (
            <Skeleton key={i} className={`h-8 ${w} rounded-full`} />
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-3">
          <Skeleton className="h-5 w-5 flex-shrink-0 rounded-[4px]" />
          <Skeleton className="h-2.5 w-20 rounded-full" />
          <div className="ml-auto flex gap-6">
            {["w-20", "w-14", "w-16", "w-18", "w-28", "w-20"].map((w, i) => (
              <Skeleton key={i} className={`h-2.5 ${w} rounded-full`} />
            ))}
          </div>
        </div>

        {/* Rows */}
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className={`flex items-center gap-3 px-4 py-3.5 ${i < 6 ? "border-b border-[var(--border-subtle)]" : ""}`}>
            <Skeleton className="h-5 w-5 flex-shrink-0 rounded-[4px]" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className={`h-3.5 ${i % 2 === 0 ? "w-2/3" : "w-1/2"} rounded-full`} />
              <Skeleton className="h-2.5 w-1/3 rounded-full" />
            </div>
            <Skeleton className="h-5 w-20 flex-shrink-0 rounded-full" />
            <Skeleton className="h-3 w-10 flex-shrink-0 rounded-full" />
            <Skeleton className="h-3 w-14 flex-shrink-0 rounded-full" />
            <Skeleton className="h-5 w-16 flex-shrink-0 rounded-full" />
            <Skeleton className="h-5 w-28 flex-shrink-0 rounded-full" />
            <div className="flex flex-shrink-0 items-center gap-2">
              <Skeleton className="h-1.5 w-16 rounded-full" />
              <Skeleton className="h-3 w-6 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
