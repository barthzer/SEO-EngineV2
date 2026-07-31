"use client";

/**
 * AccountCluster — cluster compte de la navbar (à droite).
 * Notifications (icône + dropdown), bascule thème clair/sombre, et avatar
 * profil (dropdown Profil / Équipe / Paramètres / Déconnexion).
 * Déplacé depuis le bas de la sidebar vers la navbar globale.
 */

import { useRouter } from "next/navigation";
import { Bell, Sun, Moon } from "lucide-react";
import { UserCircleIcon, UserGroupIcon, Cog6ToothIcon, ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { DropdownMenu, DropdownItem, DropdownSeparator } from "@/components/DropdownMenu";
import { Tooltip } from "@/components/Tooltip";
import { useTheme } from "@/components/ThemeProvider";

const NOTIFS = [
  { id: 1, text: "Analyse de leboncoin.fr terminée", time: "il y a 2 min", unread: true },
  { id: 2, text: "3 nouvelles analyses disponibles dans Tag SEO", time: "il y a 1 h", unread: true },
  { id: 3, text: "Score GEO mis à jour : +7 pts", time: "hier", unread: false },
];

const USER = { name: "Barthélemy", email: "clients.lagenceweb@gmail.com", initial: "B" };

export function AccountCluster() {
  const router = useRouter();
  const { theme, toggle: toggleTheme } = useTheme();
  const unreadCount = NOTIFS.filter((n) => n.unread).length;

  const iconBtn = "flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]";

  return (
    <div className="flex items-center gap-1">
      {/* Notifications — icône seule + dropdown */}
      <DropdownMenu
        align="right"
        width={320}
        trigger={(open) => (
          <button aria-label="Notifications" className={`relative ${iconBtn} ${open ? "bg-[var(--bg-secondary)] text-[var(--text-primary)]" : ""}`}>
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)]" />}
          </button>
        )}
      >
        <div className="px-3 pb-1 pt-2">
          <p className="type-label text-[var(--text-primary)]">Notifications</p>
        </div>
        <DropdownSeparator />
        {NOTIFS.map((n) => (
          <button key={n.id} className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[var(--bg-secondary)]">
            <span className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${n.unread ? "bg-[var(--accent-primary)]" : "bg-transparent"}`} />
            <div className="min-w-0 flex-1">
              <p className="type-label leading-snug text-[var(--text-primary)]">{n.text}</p>
              <p className="mt-0.5 type-micro">{n.time}</p>
            </div>
          </button>
        ))}
        <DropdownSeparator />
        <DropdownItem>Voir toutes les notifications</DropdownItem>
      </DropdownMenu>

      {/* Thème clair / sombre */}
      <Tooltip label={theme === "dark" ? "Mode clair" : "Mode sombre"} side="bottom" portal>
        <button onClick={toggleTheme} aria-label="Changer de thème" className={iconBtn}>
          {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </button>
      </Tooltip>

      {/* Profil — avatar + dropdown */}
      <DropdownMenu
        align="right"
        width={240}
        trigger={(open) => (
          <button aria-label="Mon compte" className={`ml-0.5 flex h-9 w-9 items-center justify-center rounded-full transition-transform ${open ? "ring-2 ring-[var(--accent-primary-mid)]" : "hover:scale-105"}`}>
            <span className="block h-8 w-8 rounded-full" style={{ background: "linear-gradient(to bottom, #3D4FFF, #6877FF)" }} />
          </button>
        )}
      >
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--accent-primary)] text-[13px] font-semibold text-white">
            {USER.initial}
          </div>
          <div className="min-w-0">
            <p className="truncate type-body-strong">{USER.name}</p>
            <p className="truncate type-micro">{USER.email}</p>
          </div>
        </div>
        <DropdownSeparator />
        <DropdownItem icon={UserCircleIcon} onClick={() => router.push("/parametres/compte")}>Mon profil</DropdownItem>
        <DropdownItem icon={UserGroupIcon} onClick={() => router.push("/equipe")}>Équipe</DropdownItem>
        <DropdownItem icon={Cog6ToothIcon} onClick={() => router.push("/parametres/compte")}>Paramètres du compte</DropdownItem>
        <DropdownSeparator />
        <DropdownItem icon={ArrowRightStartOnRectangleIcon} danger onClick={() => router.push("/")}>Se déconnecter</DropdownItem>
      </DropdownMenu>
    </div>
  );
}
