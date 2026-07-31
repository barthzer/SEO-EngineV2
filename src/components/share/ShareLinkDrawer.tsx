"use client";

/**
 * ShareLinkDrawer — contenu du Drawer DS pour partager un projet avec son client.
 *
 * Permet au consultant de :
 *  - Activer/désactiver le partage
 *  - Copier le lien public
 *  - Régénérer le token (révoquer l'ancien)
 *  - Prévisualiser ce que verra le client
 *
 * Persistance Drizzle viendra en B1b. Pour l'instant, le toggle est en
 * state local + le token est mocké pour les domaines de démo.
 */

import { useState } from "react";
import Link from "next/link";
import {
  LinkIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

/** Map mock : domaine connu → token de démo pour la prévisualisation. */
const DEMO_TOKENS: Record<string, string> = {
  "sephora.fr":  "demo-sephora",
  "doctolib.fr": "demo-doctolib",
};

function generateDemoToken(domain: string): string {
  const stable = DEMO_TOKENS[domain];
  if (stable) return stable;
  // Fallback : token déterministe basé sur le domaine (pour cohérence en démo)
  return `demo-${domain.replace(/\./g, "-")}-${Math.abs(domain.split("").reduce((h, c) => h * 31 + c.charCodeAt(0), 0)).toString(36).slice(0, 6)}`;
}

export function ShareLinkDrawer({ domain }: { domain: string }) {
  const [enabled, setEnabled] = useState(false);
  const [token, setToken] = useState(() => generateDemoToken(domain));
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${origin}/share/${token}`;

  function handleCopy() {
    if (typeof navigator === "undefined") return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function handleRegenerate() {
    setToken(generateDemoToken(domain) + "-" + Math.random().toString(36).slice(2, 6));
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <p className="type-caption font-medium uppercase tracking-wider text-[var(--text-muted)]">
          Partage client
        </p>
        <h2 className="mt-1 type-h2">
          Partagez l'avancement avec {domain}
        </h2>
        <p className="mt-2 type-body-sm">
          Un lien public en lecture seule. Votre client verra l'avancement,
          les actions livrées et les prochaines étapes — sans accès aux données
          internes (commentaires, temps passé, briefs en cours).
        </p>
      </div>

      {/* Toggle activation */}
      <div className="flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] px-4 py-3">
        <div>
          <p className="type-label font-semibold text-[var(--text-primary)]">Activer le partage</p>
          <p className="mt-0.5 type-caption text-[var(--text-muted)]">
            {enabled ? "Le lien est actif et accessible." : "Le lien est désactivé. Activez pour partager."}
          </p>
        </div>
        <button
          onClick={() => setEnabled((v) => !v)}
          role="switch"
          aria-checked={enabled}
          className="relative h-6 w-11 flex-shrink-0 rounded-full transition-colors"
          style={{ backgroundColor: enabled ? "var(--accent-primary)" : "var(--bg-card-hover)" }}
        >
          <span
            className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform"
            style={{ transform: enabled ? "translateX(22px)" : "translateX(2px)" }}
          />
        </button>
      </div>

      {/* Lien + copy */}
      <div className={`flex flex-col gap-2 transition-opacity ${enabled ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
        <p className="type-micro uppercase tracking-wider text-[var(--text-muted)]">
          Lien partageable
        </p>
        <div className="flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-static)] px-3 py-2.5">
          <LinkIcon className="h-4 w-4 flex-shrink-0 text-[var(--text-muted)]" />
          <input
            type="text"
            readOnly
            value={shareUrl}
            onFocus={(e) => e.target.select()}
            className="flex-1 truncate bg-transparent type-body-sm text-[var(--text-primary)] outline-none"
          />
          <button
            onClick={handleCopy}
            disabled={!enabled}
            className="flex flex-shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 type-caption font-medium transition-colors hover:bg-[var(--bg-card-hover)]"
            style={{ color: copied ? "var(--color-success)" : "var(--text-secondary)" }}
          >
            {copied ? (
              <>
                <CheckIcon className="h-3.5 w-3.5" />
                Copié
              </>
            ) : (
              <>
                <ClipboardDocumentIcon className="h-3.5 w-3.5" />
                Copier
              </>
            )}
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <button
            onClick={handleRegenerate}
            disabled={!enabled}
            className="inline-flex items-center gap-1.5 type-caption font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
          >
            <ArrowPathIcon className="h-3.5 w-3.5" />
            Régénérer le lien
          </button>

          <Link
            href={`/share/${token}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 type-caption font-medium text-[var(--accent-primary)] transition-opacity hover:opacity-80 ${
              enabled ? "" : "pointer-events-none opacity-40"
            }`}
          >
            Prévisualiser
            <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
          </Link>
        </div>

        <p className="mt-1 type-micro leading-relaxed text-[var(--text-muted)]">
          Régénérer le lien invalide l'ancien — utile si le précédent a été partagé par erreur.
        </p>
      </div>

      {/* Ce que verra le client */}
      <div className="rounded-2xl border border-[var(--border-subtle)] p-4">
        <p className="type-micro font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Ce que verra votre client
        </p>
        <ul className="mt-2 flex flex-col gap-1.5 type-body-sm">
          <li className="inline-flex items-baseline gap-2">
            <span className="text-[var(--color-success)]">✓</span>
            Header avec votre branding agence
          </li>
          <li className="inline-flex items-baseline gap-2">
            <span className="text-[var(--color-success)]">✓</span>
            Maturité SEO (3 scores) + delta trafic
          </li>
          <li className="inline-flex items-baseline gap-2">
            <span className="text-[var(--color-success)]">✓</span>
            Actions livrées avec narratif business
          </li>
          <li className="inline-flex items-baseline gap-2">
            <span className="text-[var(--color-success)]">✓</span>
            Actions en cours + prochaines étapes
          </li>
        </ul>
        <p className="mt-3 type-caption font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Ce qui reste privé
        </p>
        <ul className="mt-2 flex flex-col gap-1.5 type-body-sm">
          <li className="inline-flex items-baseline gap-2">
            <span className="text-[var(--text-muted)]">×</span>
            Commentaires internes & notes
          </li>
          <li className="inline-flex items-baseline gap-2">
            <span className="text-[var(--text-muted)]">×</span>
            Temps passé par action
          </li>
          <li className="inline-flex items-baseline gap-2">
            <span className="text-[var(--text-muted)]">×</span>
            Briefs encore en rédaction
          </li>
        </ul>
      </div>
    </div>
  );
}
