"use client";

/**
 * ClientSidebar — sidebar simplifiée du portail client.
 *
 * 5 items maximum pour ne pas perdre le client. Pas de collapse (le client
 * vient consulter, pas paramétrer), pas de notif counter — minimaliste.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  ListChecksIcon,
  FileTextIcon,
  DownloadIcon,
  UserIcon,
} from "lucide-react";
import { useAgencyBranding } from "@/hooks/useAgencyBranding";

const NAV_ITEMS = [
  { href: "",            label: "Tableau de bord", icon: LayoutDashboardIcon },
  { href: "avancement",  label: "Avancement",      icon: ListChecksIcon },
  { href: "livrables",   label: "Livrables",       icon: FileTextIcon },
  { href: "rapports",    label: "Rapports",        icon: DownloadIcon },
  { href: "contact",     label: "Mon consultant",  icon: UserIcon },
];

export function ClientSidebar({ token, agency: fallbackAgency }: { token: string; agency: { name: string; initials: string; accentColor: string } }) {
  const pathname = usePathname();
  const basePath = `/share/${token}`;
  // Override par les valeurs admin si configurées (localStorage)
  const liveAgency = useAgencyBranding();
  const agency = {
    name: liveAgency.name ?? fallbackAgency.name,
    initials: liveAgency.initials ?? fallbackAgency.initials,
    accentColor: liveAgency.accentColor ?? fallbackAgency.accentColor,
    logoDataUrl: liveAgency.logoDataUrl,
  };

  return (
    <aside className="flex h-full w-[240px] flex-shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-sidebar)] py-6">
      {/* Branding agence en haut */}
      <div className="mb-8 flex items-center gap-2.5 px-4">
        {agency.logoDataUrl ? (
          <img
            src={agency.logoDataUrl}
            alt={agency.name}
            className="h-8 w-8 rounded-lg object-contain bg-white"
          />
        ) : (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg font-semibold text-white"
            style={{ backgroundColor: agency.accentColor, fontSize: 12 }}
          >
            {agency.initials}
          </div>
        )}
        <span className="type-body-strong font-semibold">
          {agency.name}
        </span>
      </div>

      {/* Nav items — même structure visuelle que la sidebar consultant (Sidebar.tsx) :
          slot icône w-6 justify-end + gap-2 + label, h-9 rounded-xl, état actif
          accent-soft bg + accent text (via agency.accentColor pour le branding dynamique). */}
      <nav className="flex flex-col gap-1 px-2">
        {NAV_ITEMS.map((item) => {
          const targetPath = item.href === "" ? basePath : `${basePath}/${item.href}`;
          const isActive =
            item.href === ""
              ? pathname === basePath
              : pathname === targetPath || pathname?.startsWith(targetPath + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={targetPath}
              className={`flex h-9 w-full items-center gap-2 rounded-xl pr-2 type-body-strong transition-colors duration-150 ${
                isActive
                  ? "bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]"
                  : "text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
              }`}
            >
              <span className="flex h-9 w-6 flex-shrink-0 items-center justify-end">
                <Icon className="h-[14px] w-[14px]" strokeWidth={1.75} />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer subtle */}
      <div className="mt-auto px-4">
        <p className="type-micro uppercase tracking-[0.12em] text-[var(--text-muted)]">
          Portail client
        </p>
        <p className="mt-1.5 type-micro leading-relaxed text-[var(--text-muted)]">
          Vue partagée par {agency.name}. Lecture seule.
        </p>
      </div>
    </aside>
  );
}
