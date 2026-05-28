"use client";

/**
 * Primitives partagées entre les vues du portail client.
 * (StatTile, TraficChip, StatusPill, ClientActionCard, SectionHeader, ...)
 */

import { useState } from "react";
import {
  CheckCircleIcon,
  ClockIcon,
  ArrowRightIcon,
  ChatBubbleOvalLeftIcon,
} from "@heroicons/react/24/outline";
import { LinkButton } from "@/components/Button";
import { VariationPill } from "@/components/VariationPill";
import { pravatarUrl } from "@/lib/avatar";
import { CommentThread } from "@/components/CommentThread";
import { useTaskDone, setTaskDone, clearTaskDone } from "@/lib/clientTasks";
import { useProjectComments } from "@/lib/comments";
import { deriveInitials } from "@/lib/agency-branding";
import type { SharedAction } from "@/data/sharedProjects";

/* ── StatTile ───────────────────────────────────────────────────────── */

export function StatTile({
  label,
  value,
  sub,
  valueExtra,
}: {
  label: string;
  value: string | number;
  sub?: string;
  valueExtra?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-[var(--bg-card-static)] px-5 py-6">
      <p
        className="text-[13px] font-medium tracking-body"
        style={{ color: "light-dark(color(srgb 0.05 0.05 0.05 / 0.5), var(--text-muted))" }}
      >
        {label}
      </p>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-[24px] font-semibold leading-none tabular-nums text-[var(--text-primary)]">
          {value}
        </p>
        {valueExtra}
      </div>
      {sub && (
        <p className="mt-1.5 text-[12px] text-[var(--text-muted)]">{sub}</p>
      )}
    </div>
  );
}

/* ── TraficChip ─────────────────────────────────────────────────────── */

export function TraficChip({
  value,
  dir,
  compact = false,
}: {
  value?: string;
  dir: "up" | "down" | "neutral";
  compact?: boolean;
}) {
  return (
    <VariationPill direction={dir} className={compact ? "!text-[11px]" : "!text-[13px]"}>
      {value}
    </VariationPill>
  );
}

/* ── StatusPill (client-facing : 3 valeurs vulgarisées) ─────────────── */

const STATUS_CFG: Record<SharedAction["status"], { color: string; bg: string; label: string; icon: React.ElementType }> = {
  livré:        { color: "var(--color-success)", bg: "var(--color-success-bg)",     label: "Livré",       icon: CheckCircleIcon },
  "en cours":   { color: "var(--color-warning)", bg: "rgba(245,158,11,0.10)",       label: "En cours",    icon: ClockIcon },
  "en attente": { color: "var(--text-muted)",    bg: "var(--bg-secondary)",         label: "Planifié",    icon: ArrowRightIcon },
};

export function StatusPill({ status }: { status: SharedAction["status"] }) {
  const cfg = STATUS_CFG[status];
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
      style={{ color: cfg.color, backgroundColor: cfg.bg }}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

/* ── OwnerAvatar (photo pravatar) ───────────────────────────────────── */

export function OwnerAvatar({
  photoSeed,
  name,
  size = 20,
}: {
  photoSeed: string;
  name: string;
  size?: number;
}) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <div
        className="flex flex-shrink-0 items-center justify-center rounded-full bg-[var(--bg-secondary)] text-[10px] font-semibold text-[var(--text-secondary)]"
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={pravatarUrl(photoSeed, size * 2)}
      alt={name}
      title={name}
      width={size}
      height={size}
      onError={() => setErrored(true)}
      className="flex-shrink-0 rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  );
}

/* ── ClientActionCard ───────────────────────────────────────────────── */

import { formatDate } from "@/components/share/formatters";

export function ClientActionCard({
  action,
  domain,
  clientName,
}: {
  action: SharedAction;
  domain: string;
  clientName: string;
}) {
  const done = useTaskDone(domain, action.id);
  const comments = useProjectComments(domain);
  const commentCount = comments.filter(
    (c) => c.target.type === "action" && c.target.id === action.id,
  ).length;
  const [showComments, setShowComments] = useState(false);
  const clientAuthor = { name: clientName, initials: deriveInitials(clientName) };

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-[var(--border-subtle)] p-5">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-[var(--text-primary)]">
          {action.title}
        </h3>
        <div className="flex flex-shrink-0 items-center gap-2">
          {action.assignedToClient && (
            <span className="inline-flex items-center rounded-full bg-[var(--accent-primary-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--accent-primary)]">
              Assignée à vous
            </span>
          )}
          <StatusPill status={action.status} />
        </div>
      </div>

      <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
        {action.clientNarrative}
      </p>

      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 text-[12px] text-[var(--text-muted)]">
          <OwnerAvatar photoSeed={action.owner.photoSeed} name={action.owner.name} size={20} />
          <span>{action.owner.name}</span>
          <span className="text-[var(--border-medium)]">·</span>
          <span className="tabular-nums">
            {action.status === "livré" ? "Livré le " : "Prévu "}
            {formatDate(action.date)}
          </span>
        </div>
        {action.evidenceUrl && (
          <LinkButton
            href={action.evidenceUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
            size="sm"
          >
            Voir la page
          </LinkButton>
        )}
      </div>

      {/* Validation (missions assignées au client) + commentaires */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-3">
        <div className="flex items-center gap-2">
          {action.assignedToClient && (
            done ? (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-success-bg)] px-2.5 py-1 text-[12px] font-medium text-[var(--color-success)]">
                  <CheckCircleIcon className="h-4 w-4" /> Fait
                </span>
                <button
                  type="button"
                  onClick={() => clearTaskDone(domain, action.id)}
                  className="text-[12px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                >
                  Annuler
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setTaskDone(domain, action.id, clientName)}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--color-success)" }}
              >
                <CheckCircleIcon className="h-4 w-4" /> Marquer comme fait
              </button>
            )
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
        >
          <ChatBubbleOvalLeftIcon className="h-4 w-4" />
          {commentCount > 0 ? `${commentCount} commentaire${commentCount > 1 ? "s" : ""}` : "Commenter"}
        </button>
      </div>

      {showComments && (
        <div className="border-t border-[var(--border-subtle)] pt-3">
          <CommentThread
            target={{ type: "action", id: action.id, label: action.title }}
            domain={domain}
            author={clientAuthor}
          />
        </div>
      )}
    </article>
  );
}

/* ── SectionHeader ──────────────────────────────────────────────────── */

export function SectionHeader({
  title,
  count,
  subtitle,
}: {
  title: string;
  count?: number;
  subtitle?: string;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <h2 className="text-[18px] font-semibold tracking-tight text-[var(--text-primary)]">{title}</h2>
      {count !== undefined && (
        <span className="rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 text-[11px] font-medium tabular-nums text-[var(--text-secondary)]">
          {count}
        </span>
      )}
      {subtitle && (
        <span className="ml-2 text-[12px] text-[var(--text-muted)]">{subtitle}</span>
      )}
    </div>
  );
}
