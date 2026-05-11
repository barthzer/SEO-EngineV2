"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
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

/* ── Tabs ─────────────────────────────────────────────────────────────── */

type Tab = "compte" | "api";
const TABS: { key: Tab; label: string }[] = [
  { key: "compte", label: "Mon Compte" },
  { key: "api",    label: "Connexions API" },
];

/* ── Section wrapper ─────────────────────────────────────────────────── */

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">{title}</p>
        {description && <p className="mt-1 text-[12px] leading-relaxed text-[var(--text-muted)]">{description}</p>}
      </div>
      <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6">
        {children}
      </div>
    </div>
  );
}

/* ── Field ───────────────────────────────────────────────────────────── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-medium text-[var(--text-secondary)]">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-9 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] transition-colors focus:border-[var(--border-medium)]"
    />
  );
}

/* ── Toggle ──────────────────────────────────────────────────────────── */

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200"
      style={{ backgroundColor: checked ? "#10B981" : "var(--bg-secondary)" }}
    >
      <span
        className="absolute left-[3px] top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: checked ? "translateX(20px)" : "translateX(0px)" }}
      />
    </button>
  );
}

/* ── Connection status ───────────────────────────────────────────────── */

type ConnStatus = "connected" | "disconnected" | "error";

function ConnBadge({ status }: { status: ConnStatus }) {
  const config = {
    connected:    { label: "Connecté",     color: "#10B981", bg: "rgba(16,185,129,0.09)", Icon: CheckCircleSolid },
    disconnected: { label: "Non connecté", color: "var(--text-muted)", bg: "var(--bg-secondary)", Icon: ExclamationCircleIcon },
    error:        { label: "Erreur",        color: "#E11D48", bg: "rgba(225,29,72,0.09)", Icon: ExclamationCircleIcon },
  }[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[12px] font-medium" style={{ color: config.color, backgroundColor: config.bg }}>
      <config.Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

function ConnCard({ logo, name, description, status, onConnect, onDisconnect, account }: {
  logo: React.ReactNode; name: string; description: string;
  status: ConnStatus; onConnect: () => void; onDisconnect: () => void; account?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-5 py-4">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--bg-subtle)]">
          {logo}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[14px] font-semibold text-[var(--text-primary)]">{name}</p>
            <ConnBadge status={status} />
          </div>
          <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">
            {status === "connected" && account ? account : description}
          </p>
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

/* ── API key row ─────────────────────────────────────────────────────── */

const API_KEYS: { label: string; desc: string; placeholder: string }[] = [
  { label: "Métriques de backlinks et autorité",     desc: "Ahrefs, Moz ou équivalent",             placeholder: "api_key_..." },
  { label: "Données SERP Google",                    desc: "ValueSERP, DataForSEO ou équivalent",   placeholder: "api_key_..." },
  { label: "Détection de mots-clés",                 desc: "Semrush, Sistrix ou équivalent",        placeholder: "api_key_..." },
  { label: "Scores sémantiques SOSEO / DSEO",        desc: "Clé d'accès à l'API Meteoria",          placeholder: "api_key_..." },
  { label: "Génération IA — Golden Corpus & Synthèse", desc: "OpenAI, Anthropic ou équivalent",    placeholder: "sk-..."      },
];

function ApiKeyRow({ label, desc, placeholder }: { label: string; desc: string; placeholder: string }) {
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
            className="h-9 w-52 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 pr-9 font-mono text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-input)] transition-colors focus:border-[var(--border-medium)]"
          />
          <button
            onClick={() => setShow((s) => !s)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
          >
            {show ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        </div>
        {isSaved ? (
          <Button size="sm" variant="secondary" onClick={handleSave}>
            <CheckCircleIcon className="h-4 w-4" />
            Enregistré
          </Button>
        ) : (
          <Button size="sm" variant="dark" onClick={handleSave} disabled={!value}>Enregistrer</Button>
        )}
      </div>
    </div>
  );
}

/* ── Logos ───────────────────────────────────────────────────────────── */

function GscLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#4285F4"/>
      <path d="M12 6l-6 10h12L12 6z" fill="#fff" opacity=".9"/>
    </svg>
  );
}
function Ga4Logo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <rect width="24" height="24" rx="4" fill="#E37400"/>
      <path d="M7 17V10h2.5v7H7zM14.5 17V7H17v10h-2.5zM10.75 17v-4.5h2.5V17h-2.5z" fill="#fff"/>
    </svg>
  );
}

/* ── Custom select ───────────────────────────────────────────────────── */

const LANGUES = [
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "en", label: "English",  flag: "🇬🇧" },
  { value: "es", label: "Español",  flag: "🇪🇸" },
  { value: "de", label: "Deutsch",  flag: "🇩🇪" },
];

function LangueSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const current = LANGUES.find((l) => l.value === value);
  return (
    <DropdownMenu
      matchTrigger
      trigger={(open) => (
        <button className="flex h-9 w-full items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 text-[14px] font-medium text-[var(--text-primary)] outline-none transition-colors hover:border-[var(--border-medium)]">
          <span className="flex items-center gap-2">
            <span className="text-[16px] leading-none">{current?.flag}</span>
            {current?.label}
          </span>
          <ChevronDownIcon
            className="h-3.5 w-3.5 text-[var(--text-muted)] transition-transform duration-200"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </button>
      )}
    >
      {LANGUES.map((l) => (
        <DropdownItem key={l.value} onClick={() => onChange(l.value)}>
          <span className="text-[18px] leading-none">{l.flag}</span>
          <span className={value === l.value ? "font-semibold text-[var(--text-primary)]" : ""}>{l.label}</span>
        </DropdownItem>
      ))}
    </DropdownMenu>
  );
}

/* ── Page ────────────────────────────────────────────────────────────── */

export default function ParametresPage() {
  const [tab, setTab] = useState<Tab>("compte");
  const { show: showToast } = useToast();

  const [name, setName]     = useState("Barthélemy");
  const [email, setEmail]   = useState("clients.lagenceweb@gmail.com");
  const [agency, setAgency] = useState("L'Agence Web");
  const [langue, setLangue] = useState("fr");

  const [gscStatus, setGscStatus] = useState<ConnStatus>("connected");
  const [ga4Status, setGa4Status] = useState<ConnStatus>("connected");

  const [notifReport,    setNotifReport]    = useState(true);
  const [notifPosition,  setNotifPosition]  = useState(true);
  const [notifDashboard, setNotifDashboard] = useState(false);

  function handleSave() { showToast("Modifications enregistrées", <CheckCircleIcon className="h-5 w-5" />); }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">

      {/* Header */}
      <div className="w-full px-[var(--page-px)] pt-8 pb-0">
        <h1 className="mb-6 text-[28px] font-semibold tracking-tight text-[var(--text-primary)]">
          Paramètres
        </h1>
      </div>

      {/* Sticky Tabs */}
      <div className="sticky top-0 z-10 bg-[var(--bg-primary)]/75 backdrop-blur-md">
        <div className="w-full px-[var(--page-px)]">
          <div className="flex h-16 items-center gap-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="relative flex h-full items-center px-4 text-[16px] font-semibold tracking-tight transition-colors"
                style={{ color: tab === t.key ? "var(--text-primary)" : "var(--text-muted)" }}
              >
                {t.label}
                {tab === t.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-accent-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-[var(--page-px)] py-6">

        {/* ── Mon Compte ── */}
        {tab === "compte" && (
          <div className="flex flex-col gap-8">

            <Section title="Profil" description="Informations affichées dans vos rapports et exports.">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Prénom / Nom">
                    <Input value={name} onChange={setName} placeholder="Votre nom" />
                  </Field>
                  <Field label="Agence">
                    <Input value={agency} onChange={setAgency} placeholder="Votre agence" />
                  </Field>
                </div>
                <Field label="Email">
                  <Input value={email} onChange={setEmail} type="email" placeholder="email@exemple.com" />
                </Field>
                <Field label="Langue">
                  <LangueSelect value={langue} onChange={setLangue} />
                </Field>
              </div>
            </Section>

            <Section title="Intégrations" description="Connectez vos sources de données pour alimenter les analyses.">
              <div className="flex flex-col gap-3">
                <ConnCard
                  logo={<GscLogo />}
                  name="Google Search Console"
                  description="Données de trafic organique et mots-clés"
                  status={gscStatus}
                  account="clients.lagenceweb@gmail.com"
                  onConnect={() => setGscStatus("connected")}
                  onDisconnect={() => setGscStatus("disconnected")}
                />
                <ConnCard
                  logo={<Ga4Logo />}
                  name="Google Analytics 4"
                  description="Comportement utilisateurs et conversions"
                  status={ga4Status}
                  account="UA-XXXXXXX · monsite.fr"
                  onConnect={() => setGa4Status("connected")}
                  onDisconnect={() => setGa4Status("disconnected")}
                />
              </div>
            </Section>

            <Section title="Notifications" description="Choisissez quand GlobalSearch vous alerte.">
              <div className="flex flex-col gap-4">
                {[
                  { label: "Recevoir les rapports par email",             sub: "Résumé hebdomadaire de vos performances",                  checked: notifReport,    onChange: setNotifReport    },
                  { label: "Alertes de chute de position",                sub: "Notification quand une page perd des positions clés",      checked: notifPosition,  onChange: setNotifPosition  },
                  { label: "Actualisation automatique des dashboards",    sub: "Rafraîchissement des données en arrière-plan",             checked: notifDashboard, onChange: setNotifDashboard },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-medium text-[var(--text-primary)]">{item.label}</p>
                      <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">{item.sub}</p>
                    </div>
                    <Toggle checked={item.checked} onChange={item.onChange} />
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Danger" description="Actions irréversibles sur votre compte.">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] px-4 py-3">
                  <div>
                    <p className="text-[13px] font-medium text-[var(--text-primary)]">Supprimer toutes les analyses</p>
                    <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">Efface l'ensemble des données importées</p>
                  </div>
                  <Button variant="danger" size="sm">Supprimer</Button>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] px-4 py-3">
                  <div>
                    <p className="text-[13px] font-medium text-[var(--text-primary)]">Fermer le compte</p>
                    <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">Supprime définitivement votre compte et vos données</p>
                  </div>
                  <Button variant="danger" size="sm">Fermer</Button>
                </div>
              </div>
            </Section>

            <div className="flex items-center justify-end">
              <Button size="md" onClick={handleSave}>Enregistrer</Button>
            </div>

          </div>
        )}

        {/* ── Connexions API ── */}
        {tab === "api" && (
          <div className="flex flex-col gap-8">
            <Section
              title="Clés API"
              description="Configurez vos clés API pour activer les différentes fonctionnalités d'analyse."
            >
              <div className="flex flex-col">
                {API_KEYS.map((k) => (
                  <ApiKeyRow key={k.label} {...k} />
                ))}
              </div>
            </Section>
          </div>
        )}

      </div>
    </div>
  );
}
