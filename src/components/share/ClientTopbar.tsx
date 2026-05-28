"use client";

/**
 * ClientTopbar — header léger du portail client.
 *
 * Affiche le nom client (gros) + le domaine, avec à droite l'avatar du
 * consultant référent. Pas de notif, pas de search, pas de menu —
 * volontairement minimaliste.
 */

import Link from "next/link";
import { useState } from "react";
import { GlobeAltIcon, ArrowUpRightIcon } from "@heroicons/react/24/outline";
import ThemeToggle from "@/components/ThemeToggle";
import { pravatarUrl } from "@/lib/avatar";

export function ClientTopbar({
  token,
  clientName,
  domain,
  consultant,
}: {
  token: string;
  clientName: string;
  domain: string;
  consultant: { name: string; role: string; photoSeed: string };
}) {
  const [imgErr, setImgErr] = useState(false);
  const [faviconErr, setFaviconErr] = useState(false);

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-[var(--border-subtle)] px-8">
      {/* Gauche : client + domaine */}
      <div className="flex items-center gap-3">
        {faviconErr ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card-static)]">
            <GlobeAltIcon className="h-4 w-4 text-[var(--text-muted)]" />
          </div>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)]">
            <img
              src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
              alt=""
              width={18}
              height={18}
              onError={() => setFaviconErr(true)}
              className="object-contain"
            />
          </div>
        )}
        <div>
          <p className="text-[16px] font-semibold leading-none tracking-tight text-[var(--text-primary)]">
            {clientName}
          </p>
          <p className="mt-1 text-[11px] text-[var(--text-muted)]">{domain}</p>
        </div>
      </div>

      {/* Droite : theme toggle + consultant référent */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="h-6 w-px bg-[var(--border-subtle)]" aria-hidden />
        <Link
          href={`/share/${token}/contact`}
          aria-label={`Voir la fiche de ${consultant.name}`}
          className="group -mx-1 flex items-center gap-3 rounded-xl px-1.5 py-1 transition-colors duration-150 hover:bg-[var(--bg-card-hover)]"
        >
          <div className="text-right">
            <p className="text-[12px] font-medium leading-tight text-[var(--text-primary)]">
              {consultant.name}
            </p>
            <p className="text-[11px] text-[var(--text-muted)]">votre consultant</p>
          </div>
          {/* Avatar — au hover bg accent + ArrowUpRight (affordance "ouvrir vue"), rounded-full conservé */}
          <div
            className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full transition-colors duration-200 ease-out group-hover:bg-[var(--accent-primary-soft)]"
          >
            {imgErr ? (
              <div className="flex h-full w-full items-center justify-center bg-[var(--bg-secondary)] text-[11px] font-semibold text-[var(--text-secondary)] transition-opacity duration-200 group-hover:opacity-0">
                {consultant.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
              </div>
            ) : (
              <img
                src={pravatarUrl(consultant.photoSeed, 72)}
                alt={consultant.name}
                width={36}
                height={36}
                onError={() => setImgErr(true)}
                className="h-full w-full object-cover transition-opacity duration-200 group-hover:opacity-0"
              />
            )}
            <span
              className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              aria-hidden="true"
            >
              <ArrowUpRightIcon className="h-4 w-4 text-[var(--accent-primary)]" strokeWidth={2.5} />
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
