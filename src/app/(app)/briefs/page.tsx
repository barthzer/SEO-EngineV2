"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { BriefsView, BRIEFS } from "@/components/BriefsView";

const counts = {
  optimiser: BRIEFS.filter((b) => b.type === "optimiser").length,
  combler: BRIEFS.filter((b) => b.type === "combler").length,
  creer: BRIEFS.filter((b) => b.type === "creer").length,
};

export default function BriefsPage() {
  return (
    <div className="flex flex-1 min-h-0 flex-col py-8">
      <div className="flex w-full flex-1 min-h-0 flex-col">

        {/* Header */}
        <div className="mb-8 flex-shrink-0 px-[var(--page-px)]">
          <Link href="/" className="mb-4 inline-flex items-center gap-1.5 text-[12px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Projets
          </Link>
          <span className="text-[11px] font-medium text-accent-primary">
            Niveau 3 — Briefs
          </span>
          <h1 className="mt-1.5 text-[28px] font-semibold tracking-tight text-[var(--text-primary)]">
            Briefs SEO
          </h1>
          <p className="mt-1 text-[13px] text-[var(--text-muted)]">
            {counts.optimiser} à optimiser · {counts.combler} gaps · {counts.creer} à créer
          </p>
        </div>

        <BriefsView />
      </div>
    </div>
  );
}
