"use client";

/**
 * Paramètres du WORKSPACE (agence) — ce qui est partagé par toute l'équipe.
 * Identité white-label, membres & rôles, facturation, clés API globales.
 */

import { useState } from "react";
import { Button } from "@/components/Button";
import { PlusIcon, CheckIcon, BuildingOffice2Icon, UsersIcon, CreditCardIcon, KeyIcon } from "@heroicons/react/24/outline";
import { AgencyBrandingSettings } from "@/components/parametres/AgencyBrandingSettings";
import { SettingsScaffold, Section, ApiKeyRow, GLOBAL_API_KEYS, DangerRow, type SettingsTab } from "@/components/parametres/settingsUi";

type Tab = "identite" | "membres" | "facturation" | "api";
const TABS: SettingsTab<Tab>[] = [
  { key: "identite",    label: "Identité agence", icon: BuildingOffice2Icon },
  { key: "membres",     label: "Membres & rôles", icon: UsersIcon },
  { key: "facturation", label: "Facturation",     icon: CreditCardIcon },
  { key: "api",         label: "Connexions API",  icon: KeyIcon },
];

const MEMBERS = [
  { name: "Barthélemy L.", email: "barthelemy@lagenceweb.fr", role: "Admin",   seed: "barthelemy-l-seo" },
  { name: "Sophie M.",     email: "sophie@lagenceweb.fr",     role: "Éditeur", seed: "5" },
  { name: "Thomas L.",     email: "thomas@lagenceweb.fr",     role: "Éditeur", seed: "thomas-l-seo" },
  { name: "Marie P.",      email: "marie@lagenceweb.fr",      role: "Lecteur", seed: "marie-p-seo" },
];

function Avatar({ seed, name }: { seed: string; name: string }) {
  const src = `https://i.pravatar.cc/44?${/^\d+$/.test(seed) ? "img" : "u"}=${seed}`;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={name} width={32} height={32} className="h-8 w-8 flex-shrink-0 rounded-full object-cover" />;
}

const PLAN_FEATURES = ["Projets illimités", "5 sièges inclus", "Rapports white-label", "Portail client", "Support prioritaire"];

export default function WorkspaceSettingsPage() {
  const [tab, setTab] = useState<Tab>("identite");

  return (
    <SettingsScaffold title="Paramètres du workspace" tabs={TABS} tab={tab} onTab={setTab}>
      {tab === "identite" && (
        <div className="flex flex-col gap-8">
          <Section
            title="Identité visuelle de l'agence"
            description="Ces informations apparaissent dans le portail partagé avec vos clients (nom du studio, logo, couleur d'accent). Seul un admin peut modifier."
          >
            <AgencyBrandingSettings />
          </Section>
        </div>
      )}

      {tab === "membres" && (
        <div className="flex flex-col gap-8">
          <Section title="Membres" description="Les personnes ayant accès à ce workspace et à ses projets.">
            <div className="flex flex-col">
              <div className="mb-2 flex items-center justify-end">
                <Button size="sm"><PlusIcon className="h-4 w-4" />Inviter un membre</Button>
              </div>
              {MEMBERS.map((m) => (
                <div key={m.email} className="flex items-center justify-between gap-6 border-b border-[var(--border-subtle)] py-3.5 last:border-0">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar seed={m.seed} name={m.name} />
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-[var(--text-primary)]">{m.name}</p>
                      <p className="truncate text-[12px] text-[var(--text-muted)]">{m.email}</p>
                    </div>
                  </div>
                  <span className="flex-shrink-0 rounded-full bg-[var(--bg-subtle)] px-2.5 py-1 text-[12px] font-medium text-[var(--text-secondary)]">{m.role}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}

      {tab === "facturation" && (
        <div className="flex flex-col gap-8">
          <Section title="Abonnement" description="Votre plan et vos quotas d'utilisation.">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[18px] font-semibold text-[var(--text-primary)]">Agence</p>
                  <span className="rounded-full bg-[var(--color-success-bg)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-success)]">Actif</span>
                </div>
                <p className="mt-1 text-[13px] text-[var(--text-muted)]">149 € / mois · renouvellement le 3 août 2026</p>
                <ul className="mt-4 flex flex-col gap-1.5">
                  {PLAN_FEATURES.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
                      <CheckIcon className="h-4 w-4 text-[var(--color-success)]" strokeWidth={2.5} />{f}
                    </li>
                  ))}
                </ul>
              </div>
              <Button size="sm" variant="secondary">Gérer l'abonnement</Button>
            </div>
          </Section>
          <Section title="Moyen de paiement" description="Carte utilisée pour la facturation du workspace.">
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-[var(--text-secondary)]">Visa se terminant par •••• 4242 · expire 09/27</p>
              <Button size="sm" variant="secondary">Modifier</Button>
            </div>
          </Section>
        </div>
      )}

      {tab === "api" && (
        <div className="flex flex-col gap-8">
          <Section title="Clés API" description="Clés partagées par tous les projets du workspace (métriques, SERP, mots-clés, IA). À distinguer des connexions GSC/GA4 propres à chaque projet.">
            <div className="flex flex-col">
              {GLOBAL_API_KEYS.map((k) => <ApiKeyRow key={k.label} {...k} />)}
            </div>
          </Section>
          <Section title="Danger" description="Actions irréversibles sur le workspace.">
            <DangerRow title="Supprimer le workspace" description="Supprime le workspace, ses projets et retire tous les membres" action="Supprimer" />
          </Section>
        </div>
      )}
    </SettingsScaffold>
  );
}
