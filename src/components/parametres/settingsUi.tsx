"use client";

/**
 * Primitives partagées par les 3 pages de paramètres (Compte / Workspace / Projet).
 * Extraites de l'ancienne page /parametres pour éviter la duplication.
 */

import { useState, type ReactNode, type ElementType } from "react";
import { Button } from "@/components/Button";
import { Flag } from "@/components/Flag";
import { Kbd } from "@/components/Kbd";
import { useToast } from "@/context/ToastContext";
import { DropdownMenu, DropdownItem } from "@/components/DropdownMenu";
import {
  ExclamationCircleIcon,
  ArrowTopRightOnSquareIcon,
  EyeIcon,
  EyeSlashIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";

/* ── Scaffold : barre de navigation secondaire (colonne) + contenu ──
   Remplace l'ancien menu à onglets horizontal par une 2ᵉ barre de nav
   verticale (façon Fabric / réglages) : items icône + label, item actif
   surligné, en option un lien retour et des groupes. */

export type SettingsTab<T extends string> = { key: T; label: string; icon?: ElementType; group?: string };

export function SettingsScaffold<T extends string>({
  title,
  tabs,
  tab,
  onTab,
  children,
}: {
  title: string;
  tabs: SettingsTab<T>[];
  tab: T;
  onTab: (t: T) => void;
  children: ReactNode;
}) {
  const activeLabel = tabs.find((t) => t.key === tab)?.label ?? title;

  // Regroupe les items par `group` (ordre de première apparition). Sans group → un seul bloc.
  const groups: { name: string | null; items: SettingsTab<T>[] }[] = [];
  for (const t of tabs) {
    const name = t.group ?? null;
    const last = groups[groups.length - 1];
    if (last && last.name === name) last.items.push(t);
    else groups.push({ name, items: [t] });
  }

  const renderItem = (t: SettingsTab<T>) => {
    const isActive = tab === t.key;
    const Icon = t.icon;
    return (
      <button
        key={t.key}
        onClick={() => onTab(t.key)}
        className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left type-label transition-colors ${
          isActive
            ? "bg-[var(--bg-subtle)] text-[var(--text-primary)]"
            : "text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
        }`}
      >
        {Icon && <Icon className="h-[18px] w-[18px] flex-shrink-0" />}
        <span className="truncate">{t.label}</span>
      </button>
    );
  };

  return (
    <div className="page-enter flex h-full">
      {/* Barre de navigation secondaire */}
      <nav className="box-content flex w-[280px] flex-shrink-0 flex-col overflow-y-auto pb-5 pl-12 pr-3 pt-12">
        <p className="px-3.5 pb-2 type-caption text-[var(--text-muted)]">{title}</p>
        <div className="flex flex-col gap-4">
          {groups.map((g, i) => (
            <div key={g.name ?? i} className="flex flex-col gap-0.5">
              {g.name && <p className="px-3 pb-1 type-micro text-[var(--text-muted)]">{g.name}</p>}
              {g.items.map(renderItem)}
            </div>
          ))}
        </div>
      </nav>

      {/* Contenu */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-8 pb-8 pt-12">
          <h1 className="mb-6 type-h1 leading-none">{activeLabel}</h1>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── Section ─────────────────────────────────────────────────────────── */

export function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">{title}</p>
        {description && <p className="mt-1 text-[12px] leading-relaxed text-[var(--text-muted)]">{description}</p>}
      </div>
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6">{children}</div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-medium text-[var(--text-secondary)]">{label}</label>
      {children}
    </div>
  );
}

export function Input({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-9 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-static)] px-3 text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] transition-colors focus:border-[var(--border-medium)]"
    />
  );
}

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200"
      style={{ backgroundColor: checked ? "var(--color-success)" : "var(--bg-secondary)" }}
    >
      <span
        className="absolute left-[3px] top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: checked ? "translateX(20px)" : "translateX(0px)" }}
      />
    </button>
  );
}

/** Ligne « label + sous-titre + toggle » (préférences, notifications). */
export function ToggleRow({ label, sub, checked, onChange }: { label: string; sub?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-[var(--text-primary)]">{label}</p>
        {sub && <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">{sub}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

/** Ligne d'action « danger » (bordure + bouton rouge). */
export function DangerRow({ title, description, action, onAction }: { title: string; description: string; action: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] px-4 py-3">
      <div>
        <p className="text-[13px] font-medium text-[var(--text-primary)]">{title}</p>
        <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">{description}</p>
      </div>
      <Button variant="danger" size="sm" onClick={onAction}>{action}</Button>
    </div>
  );
}

/* ── Connexions (GSC / GA4) ──────────────────────────────────────────── */

export type ConnStatus = "connected" | "disconnected" | "error";

export function ConnBadge({ status }: { status: ConnStatus }) {
  const config = {
    connected:    { label: "Connecté",     color: "var(--color-success)", bg: "var(--color-success-bg)", Icon: CheckCircleSolid },
    disconnected: { label: "Non connecté", color: "var(--text-muted)", bg: "var(--bg-secondary)", Icon: ExclamationCircleIcon },
    error:        { label: "Erreur",        color: "var(--color-danger)", bg: "var(--color-danger-bg)", Icon: ExclamationCircleIcon },
  }[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[12px] font-medium" style={{ color: config.color, backgroundColor: config.bg }}>
      <config.Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

export function ConnCard({ logo, name, description, status, onConnect, onDisconnect, account }: {
  logo: ReactNode; name: string; description: string;
  status: ConnStatus; onConnect: () => void; onDisconnect: () => void; account?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-5 py-4">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--bg-subtle)]">{logo}</div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[14px] font-semibold text-[var(--text-primary)]">{name}</p>
            <ConnBadge status={status} />
          </div>
          <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">{status === "connected" && account ? account : description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {status === "connected" ? (
          <>
            <Button size="sm" variant="secondary" onClick={onDisconnect}>Déconnecter</Button>
            <button className="flex items-center gap-1 text-[12px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
              <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" /> Ouvrir
            </button>
          </>
        ) : (
          <Button size="sm" variant="dark" onClick={onConnect}>Connecter</Button>
        )}
      </div>
    </div>
  );
}

export function GscLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#4285F4" />
      <path d="M12 6l-6 10h12L12 6z" fill="#fff" opacity=".9" />
    </svg>
  );
}
export function Ga4Logo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <rect width="24" height="24" rx="4" fill="#E37400" />
      <path d="M7 17V10h2.5v7H7zM14.5 17V7H17v10h-2.5zM10.75 17v-4.5h2.5V17h-2.5z" fill="#fff" />
    </svg>
  );
}

/* ── Clés API (workspace — partagées par tous les projets) ───────────── */

export const GLOBAL_API_KEYS: { label: string; desc: string; placeholder: string }[] = [
  { label: "Métriques de backlinks et autorité",       desc: "Ahrefs, Moz ou équivalent",           placeholder: "api_key_..." },
  { label: "Données SERP Google",                      desc: "ValueSERP, DataForSEO ou équivalent", placeholder: "api_key_..." },
  { label: "Détection de mots-clés",                   desc: "Semrush, Sistrix ou équivalent",      placeholder: "api_key_..." },
  { label: "Scores sémantiques SOSEO / DSEO",          desc: "Clé d'accès à l'API Meteoria",        placeholder: "api_key_..." },
  { label: "Génération IA — Golden Corpus & Synthèse", desc: "OpenAI, Anthropic ou équivalent",     placeholder: "sk-..." },
];

export function ApiKeyRow({ label, desc, placeholder }: { label: string; desc: string; placeholder: string }) {
  const [value, setValue] = useState("");
  const [savedValue, setSavedValue] = useState("");
  const [show, setShow] = useState(false);
  const { show: showToast } = useToast();
  const isSaved = value !== "" && value === savedValue;

  function handleSave() {
    setSavedValue(value);
    showToast("Clé API enregistrée", <KeyIcon className="h-5 w-5" />);
  }

  return (
    <div className="flex items-center justify-between gap-6 border-b border-[var(--border-subtle)] py-4 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-[var(--text-primary)]">{label}</p>
        <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">{desc}</p>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2">
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="h-9 w-52 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-static)] px-3 pr-9 font-mono text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] transition-colors focus:border-[var(--border-medium)]"
          />
          <button onClick={() => setShow((s) => !s)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
            {show ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        </div>
        {isSaved ? (
          <Button size="sm" variant="secondary" onClick={handleSave}><CheckCircleIcon className="h-4 w-4" />Enregistré</Button>
        ) : (
          <Button size="sm" variant="dark" onClick={handleSave} disabled={!value}>Enregistrer</Button>
        )}
      </div>
    </div>
  );
}

/* ── Sélecteur de langue ─────────────────────────────────────────────── */

const LANGUES = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "de", label: "Deutsch" },
];

export function LangueSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const current = LANGUES.find((l) => l.value === value);
  return (
    <DropdownMenu
      matchTrigger
      trigger={(open) => (
        <button className="flex h-9 w-full items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 text-[14px] font-medium text-[var(--text-primary)] outline-none transition-colors hover:border-[var(--border-medium)]">
          <span className="flex items-center gap-2">
            {current && <Flag code={current.value} size={16} />}
            {current?.label}
          </span>
          <ChevronDownIcon className="h-3.5 w-3.5 text-[var(--text-muted)] transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
        </button>
      )}
    >
      {LANGUES.map((l) => (
        <DropdownItem key={l.value} onClick={() => onChange(l.value)}>
          <Flag code={l.value} size={18} />
          <span className={value === l.value ? "font-semibold text-[var(--text-primary)]" : ""}>{l.label}</span>
        </DropdownItem>
      ))}
    </DropdownMenu>
  );
}

/* ── Raccourcis clavier ──────────────────────────────────────────────── */

export type Shortcut = { keys: string[]; label: string; sub?: string };

export function buildShortcutGroups(mod: string): { group: string; items: Shortcut[] }[] {
  return [
    {
      group: "Général",
      items: [
        { keys: [mod, "K"], label: "Ouvrir la recherche", sub: "Palette de commandes — projets, navigation, actions" },
        { keys: ["Esc"], label: "Fermer", sub: "Referme la palette ou le panneau ouvert" },
      ],
    },
    {
      group: "Dans la palette de commandes",
      items: [
        { keys: ["↑", "↓"], label: "Naviguer", sub: "Se déplacer entre les résultats" },
        { keys: ["↵"], label: "Ouvrir", sub: "Lance le résultat sélectionné" },
      ],
    },
  ];
}

export function ShortcutRow({ shortcut }: { shortcut: Shortcut }) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-[var(--border-subtle)] py-3.5 last:border-0">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-[var(--text-primary)]">{shortcut.label}</p>
        {shortcut.sub && <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">{shortcut.sub}</p>}
      </div>
      <div className="flex flex-shrink-0 items-center gap-1">
        {shortcut.keys.map((k) => <Kbd key={k}>{k}</Kbd>)}
      </div>
    </div>
  );
}
