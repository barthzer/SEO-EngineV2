"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { AuditTechniqueTab } from "@/components/AuditTechniqueTab";
import { AuditEditorialTab } from "@/components/AuditEditorialTab";
import { AuditNetlinkingTab } from "@/components/AuditNetlinkingTab";

type AuditTab = "technique" | "editorial" | "netlinking";

export default function AuditPage({ params, searchParams }: {
  params: Promise<{ domain: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { domain } = use(params);
  const { tab: initialTab } = use(searchParams);
  const decodedDomain = decodeURIComponent(domain);

  const [activeTab, setActiveTab] = useState<AuditTab>(
    initialTab === "editorial" ? "editorial" : initialTab === "netlinking" ? "netlinking" : "technique"
  );

  return (
    <div className="w-full px-[var(--page-px)] py-8">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={`/analyse/${domain}`}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          {decodedDomain}
        </Link>

        <div className="flex h-9 items-center gap-0.5 rounded-full bg-[var(--bg-secondary)] p-1">
          {(["technique", "editorial", "netlinking"] as const).map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`h-7 rounded-full px-3 text-[13px] font-medium transition-all duration-200 ${activeTab === t ? "bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}>
              {t === "technique" ? "Technique" : t === "editorial" ? "Éditorial" : "Netlinking"}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "technique" && <AuditTechniqueTab domain={decodedDomain} />}
      {activeTab === "editorial" && <AuditEditorialTab domain={decodedDomain} />}
      {activeTab === "netlinking" && <AuditNetlinkingTab domain={decodedDomain} />}
    </div>
  );
}
