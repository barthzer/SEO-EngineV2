"use client";

/**
 * ConnectModal — Google OAuth-style connect dialog for GSC / GA4.
 * Also exports the `Tool` type, `TOOL_CONFIG` map, and `ConnBadge` button
 * that toggles the connection (used in the Topbar's right slot).
 * Extracted verbatim from src/app/(app)/analyse/[domain]/page.tsx.
 */

import { XMarkIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";
import { Download, Trash2, X as LX } from "lucide-react";
import { Button } from "@/components/Button";
import { Tooltip } from "@/components/Tooltip";
import { DropdownMenu, DropdownItem, DropdownSeparator } from "@/components/DropdownMenu";

export type Tool = "gsc" | "ga4";

const TOOL_CONFIG: Record<Tool, { name: string; description: string; color: string; logo: React.ReactNode }> = {
  gsc: {
    name: "Google Search Console",
    description: "Accédez aux données de trafic organique, mots-clés, impressions et positions de votre site.",
    color: "#4285F4",
    logo: (
      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#4285F4"/>
        <path d="M12 6l-6 10h12L12 6z" fill="#fff" opacity=".9"/>
      </svg>
    ),
  },
  ga4: {
    name: "Google Analytics 4",
    description: "Suivez le comportement des utilisateurs, les conversions et les performances de votre site.",
    color: "#E37400",
    logo: (
      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none">
        <rect width="24" height="24" rx="4" fill="#E37400"/>
        <path d="M7 17V10h2.5v7H7zM14.5 17V7H17v10h-2.5zM10.75 17v-4.5h2.5V17h-2.5z" fill="#fff"/>
      </svg>
    ),
  },
};

export function ConnectModal({ tool, onClose, onConnect }: { tool: Tool; onClose: () => void; onConnect: () => void }) {
  const config = TOOL_CONFIG[tool];

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-3xl bg-[var(--modal-bg)] p-8 shadow-[var(--shadow-floating)]">
        <div className="flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
            {config.logo}
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <h2 className="mt-5 font-semibold tracking-tight text-[var(--text-primary)]">
          Connecter {config.name}
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-muted)]">{config.description}</p>

        <div className="mt-6 flex flex-col gap-2">
          <Button
            size="lg"
            className="w-full"
            onClick={() => { onConnect(); onClose(); }}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff" opacity=".8"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#fff" opacity=".6"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff" opacity=".4"/></svg>
            Se connecter avec Google
          </Button>
          <Button size="lg" variant="secondary" className="w-full" onClick={onClose}>
            Annuler
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ConnBadge({ tool, connected, onClick, onImport }: { tool: Tool; connected: boolean; onClick: () => void; onImport?: () => void }) {
  const label = tool === "gsc" ? "GSC" : "GA4";
  const tooltipLabel = tool === "gsc" ? "Se connecter à Google Search Console" : "Se connecter à Google Analytics 4";

  if (connected && tool === "gsc") {
    return (
      <DropdownMenu
        width={256}
        trigger={
          <Tooltip label="Importer et plus" side="bottom">
            <Button size="md" variant="secondary" className="text-[14px]">
              <CheckCircleSolid className="h-3.5 w-3.5 text-[var(--color-success)]" />
              {label}
              <EllipsisHorizontalIcon className="h-5 w-5 text-[var(--text-muted)]" />
            </Button>
          </Tooltip>
        }
      >
        <DropdownItem icon={Download} onClick={onImport}>Importer des pages GSC</DropdownItem>
        <DropdownItem icon={Trash2}>Supprimer des pages GSC</DropdownItem>
        <DropdownSeparator />
        <DropdownItem danger icon={LX} onClick={onClick}>Déconnecter GSC</DropdownItem>
      </DropdownMenu>
    );
  }

  if (connected) {
    return (
      <Button size="md" variant="secondary" className="text-[14px]" onClick={onClick}>
        <CheckCircleSolid className="h-3.5 w-3.5 text-[var(--color-success)]" />
        {label}
      </Button>
    );
  }

  return (
    <Tooltip label={tooltipLabel} side="bottom">
      <Button size="md" variant="dark" className="text-[14px]" onClick={onClick}>
        {label} — Connecter
      </Button>
    </Tooltip>
  );
}
