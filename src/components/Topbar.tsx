"use client";

import { useRouter } from "next/navigation";
import { BellIcon } from "@heroicons/react/24/outline";
import { DropdownMenu, DropdownItem, DropdownSeparator } from "@/components/DropdownMenu";
import { UserCircle, Settings, LogOut, Zap, Users } from "lucide-react";

const NOTIFS = [
  { id: 1, text: "Analyse de leboncoin.fr terminée", time: "il y a 2 min", unread: true },
  { id: 2, text: "3 nouveaux briefs disponibles dans Lot SEO", time: "il y a 1 h", unread: true },
  { id: 3, text: "Score GEO mis à jour : +7 pts", time: "hier", unread: false },
];

export function Topbar() {
  const router = useRouter();
  return (
    <header className="absolute right-0 top-0 z-50 flex h-14 items-center justify-end gap-2 px-5">
      {/* Notifications */}
      <DropdownMenu
        trigger={(open) => (
          <button
            className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${open ? "bg-[var(--bg-secondary)]" : "hover:bg-[var(--bg-secondary)]"}`}
            aria-label="Notifications"
          >
            <BellIcon className="h-5 w-5 text-[var(--text-primary)]" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)]" />
          </button>
        )}
        align="right"
        width={320}
      >
        <div className="px-3 pb-1 pt-2">
          <p className="text-[13px] font-semibold text-[var(--text-primary)]">Notifications</p>
        </div>
        <DropdownSeparator />
        {NOTIFS.map((n) => (
          <button
            key={n.id}
            className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[var(--bg-secondary)]"
          >
            <span className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${n.unread ? "bg-[var(--accent-primary)]" : "bg-transparent"}`} />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium leading-snug text-[var(--text-primary)]">{n.text}</p>
              <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{n.time}</p>
            </div>
          </button>
        ))}
        <DropdownSeparator />
        <DropdownItem>Voir toutes les notifications</DropdownItem>
      </DropdownMenu>

      {/* Avatar → dropdown compte */}
      <DropdownMenu
        trigger={(open) => (
          <button
            className={`h-8 w-8 rounded-full transition-opacity ${open ? "opacity-80" : "hover:opacity-80"}`}
            style={{ background: "linear-gradient(to bottom, #3E50F5, #7B8FF8)" }}
            aria-label="Mon compte"
          />
        )}
        align="right"
        width={240}
      >
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--accent-primary)] text-[13px] font-semibold text-white">
            B
          </div>
          <div className="min-w-0">
            <p className="text-[16px] font-semibold text-[var(--text-primary)]">Barthélemy</p>
            <p className="truncate text-[11px] text-[var(--text-muted)]">clients.lagenceweb@gmail.com</p>
          </div>
        </div>
        <DropdownSeparator />
        <DropdownItem icon={UserCircle} onClick={() => router.push("/parametres")}>Mon profil</DropdownItem>
        <DropdownItem icon={Settings}   onClick={() => router.push("/parametres")}>Paramètres du compte</DropdownItem>
        <DropdownItem icon={Zap}        onClick={() => router.push("/production")}>Production</DropdownItem>
        <DropdownItem icon={Users}      onClick={() => router.push("/equipe")}>Équipe</DropdownItem>
        <DropdownSeparator />
        <DropdownItem icon={LogOut} danger onClick={() => router.push("/")}>Se déconnecter</DropdownItem>
      </DropdownMenu>
    </header>
  );
}
