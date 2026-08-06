"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { BriefsView } from "@/components/BriefsView";
import { BRIEFS } from "@/data/briefs";

const counts = {
  optimiser: BRIEFS.filter((b) => b.type === "optimiser").length,
  combler: BRIEFS.filter((b) => b.type === "combler").length,
  creer: BRIEFS.filter((b) => b.type === "creer").length,
};

export default function BriefsPage() {
  return (
    <div className="flex flex-1 min-h-0 flex-col py-5">
      {/* Header */}
      <div className="mb-8 w-full flex-shrink-0 px-5">
        <Link href="/" className="mb-4 inline-flex items-center gap-1.5 text-[12px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          Projets
        </Link>
        <span className="text-[11px] font-medium text-accent-primary">
          Niveau 3 — Analyses
        </span>
        <h1 className="mt-1.5 font-semibold tracking-tight text-[var(--text-primary)]">
          Analyses SEO
        </h1>
        <p className="mt-1 text-[13px] text-[var(--text-muted)]">
          {counts.optimiser} à optimiser · {counts.combler} gaps · {counts.creer} à créer
        </p>
      </div>

      {/* BriefsView — pleine largeur pour laisser respirer la table URLs (minWidth: 1910) */}
      <div className="flex flex-1 min-h-0 flex-col">
        <BriefsView />
      </div>
    </div>
  );
}
