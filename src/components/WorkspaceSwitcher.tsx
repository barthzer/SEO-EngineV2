"use client";

/**
 * WorkspaceSwitcher — sélecteur de workspace en tête de sidebar (façon Vercel).
 *
 * Le workspace « courant » reflète l'identité agence réelle (agency-branding,
 * éditable dans Paramètres > Identité agence). Des workspaces de démo sont
 * ajoutés pour illustrer le switch — en attendant la table `workspaces` (Drizzle).
 *
 * S'adapte à l'état replié/déplié de la sidebar (avatar seul vs avatar + nom).
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronUpDownIcon, PlusIcon, Cog6ToothIcon, CheckIcon } from "@heroicons/react/24/outline";
import {
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
  DropdownHeader,
} from "@/components/DropdownMenu";
import { Tooltip } from "@/components/Tooltip";
import { useToast } from "@/context/ToastContext";
import { CreateWorkspaceModal } from "@/components/CreateWorkspaceModal";
import {
  DEFAULT_BRANDING,
  deriveInitials,
  readBranding,
  type AgencyBranding,
} from "@/lib/agency-branding";

type Workspace = {
  id: string;
  name: string;
  initials: string;
  accentColor: string;
  logoDataUrl?: string;
  plan: string;
};

// Workspaces de démo (mock) en plus de l'agence courante.
const DEMO_WORKSPACES: Workspace[] = [
  { id: "lumen",     name: "Studio Lumen",      initials: "SL", accentColor: "#7C3AED", plan: "Pro" },
  { id: "northwind", name: "Northwind Digital", initials: "ND", accentColor: "#059669", plan: "Hobby" },
];

function WorkspaceAvatar({
  ws,
  size = 28,
}: {
  ws: { initials: string; accentColor: string; logoDataUrl?: string; name: string };
  size?: number;
}) {
  if (ws.logoDataUrl) {
    return (
      <img
        src={ws.logoDataUrl}
        alt={ws.name}
        className="flex-shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="flex flex-shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: `linear-gradient(135deg, ${ws.accentColor}, color-mix(in oklab, ${ws.accentColor} 55%, #000))`,
      }}
      aria-hidden="true"
    >
      {ws.initials.slice(0, 2)}
    </span>
  );
}

export function WorkspaceSwitcher({ isExpanded }: { isExpanded: boolean }) {
  const router = useRouter();
  const { show: showToast } = useToast();
  const [branding, setBranding] = useState<AgencyBranding>(DEFAULT_BRANDING);
  const [activeId, setActiveId] = useState("agency");
  // Workspaces créés par l'utilisateur (mock en mémoire — en attendant Drizzle).
  const [created, setCreated] = useState<Workspace[]>([]);
  const [creating, setCreating] = useState(false);

  // Lecture du branding agence côté client (évite tout mismatch d'hydratation).
  useEffect(() => {
    const update = () => setBranding(readBranding());
    update();
    window.addEventListener("agency-branding:changed", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("agency-branding:changed", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const agencyWs: Workspace = {
    id: "agency",
    name: branding.name,
    initials: branding.initials,
    accentColor: branding.accentColor,
    logoDataUrl: branding.logoDataUrl,
    plan: "Agence",
  };
  const workspaces = [agencyWs, ...DEMO_WORKSPACES, ...created];
  const active = workspaces.find((w) => w.id === activeId) ?? agencyWs;

  function handleCreate({ name, accentColor }: { name: string; accentColor: string }) {
    const id = `ws-${Date.now()}`;
    setCreated((prev) => [...prev, { id, name, initials: deriveInitials(name), accentColor, plan: "Hobby" }]);
    setActiveId(id);
    setCreating(false);
    showToast(`Workspace « ${name} » créé`, <CheckIcon className="h-5 w-5" />);
  }

  return (
    <>
    <DropdownMenu
      align="left"
      width={260}
      trigger={(open) => (
        <Tooltip label={active.name} side="right" portal disabled={isExpanded}>
          <button
            aria-label="Changer de workspace"
            className={`flex h-10 items-center rounded-xl text-left transition-colors ${
              isExpanded ? "w-full gap-2.5 px-2" : "w-10 justify-center gap-0"
            } ${open ? "bg-[var(--bg-card-hover)]" : "hover:bg-[var(--bg-card-hover)]"}`}
          >
            <WorkspaceAvatar ws={active} size={28} />
            <span
              className="min-w-0 flex-1 truncate text-[13px] font-semibold text-[var(--text-primary)] transition-all duration-300"
              style={{
                maxWidth: isExpanded ? "9999px" : "0px",
                opacity: isExpanded ? 1 : 0,
                transitionTimingFunction: "var(--ease-expo)",
              }}
            >
              {active.name}
            </span>
            {isExpanded && (
              <ChevronUpDownIcon className="h-4 w-4 flex-shrink-0 text-[var(--text-muted)]" />
            )}
          </button>
        </Tooltip>
      )}
    >
      <DropdownHeader>Workspaces</DropdownHeader>
      {workspaces.map((ws) => (
        <DropdownItem key={ws.id} selected={ws.id === active.id} onClick={() => setActiveId(ws.id)}>
          <span className="flex items-center gap-2.5">
            <WorkspaceAvatar ws={ws} size={22} />
            <span className="flex flex-col">
              <span className="text-[13px] font-medium leading-tight">{ws.name}</span>
              <span className="text-[11px] leading-tight text-[var(--text-muted)]">{ws.plan}</span>
            </span>
          </span>
        </DropdownItem>
      ))}
      <DropdownSeparator />
      <DropdownItem icon={PlusIcon} onClick={() => setCreating(true)}>
        Créer un workspace
      </DropdownItem>
      <DropdownItem icon={Cog6ToothIcon} onClick={() => router.push("/parametres")}>
        Paramètres de l&apos;agence
      </DropdownItem>
    </DropdownMenu>

    {creating && (
      <CreateWorkspaceModal onClose={() => setCreating(false)} onCreate={handleCreate} />
    )}
    </>
  );
}
