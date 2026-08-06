"use client";

/**
 * Paramètres du COMPTE (utilisateur) — ce qui suit la personne, quel que soit le workspace.
 * Profil, notifications personnelles, sécurité, raccourcis.
 */

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { useToast } from "@/context/ToastContext";
import { AvatarUpload } from "@/components/parametres/AvatarUpload";
import { CheckCircleIcon, UserIcon, BellIcon, ShieldCheckIcon, CommandLineIcon } from "@heroicons/react/24/outline";
import {
  SettingsScaffold, Section, Field, Input, LangueSelect, ToggleRow,
  DangerRow, ShortcutRow, buildShortcutGroups, type SettingsTab,
} from "@/components/parametres/settingsUi";

type Tab = "profil" | "notifications" | "securite" | "raccourcis";
const TABS: SettingsTab<Tab>[] = [
  { key: "profil",        label: "Profil",        icon: UserIcon },
  { key: "notifications", label: "Notifications", icon: BellIcon },
  { key: "securite",      label: "Sécurité",      icon: ShieldCheckIcon },
  { key: "raccourcis",    label: "Raccourcis",    icon: CommandLineIcon },
];

const SESSIONS = [
  { device: "MacBook Pro · Chrome", location: "Paris, France", current: true, last: "Actif maintenant" },
  { device: "iPhone 15 · Safari", location: "Paris, France", current: false, last: "Il y a 2 h" },
];

export default function CompteSettingsPage() {
  const [tab, setTab] = useState<Tab>("profil");
  const { show: showToast } = useToast();

  const [mod, setMod] = useState("Ctrl");
  useEffect(() => {
    const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);
    if (isMac) setMod("⌘");
  }, []);
  const shortcutGroups = buildShortcutGroups(mod);

  const [name, setName] = useState("Barthélemy");
  const [email, setEmail] = useState("clients.lagenceweb@gmail.com");
  const [langue, setLangue] = useState("fr");
  // Photo de profil (data URL en mémoire — prototype sans stockage backend).
  const [photo, setPhoto] = useState<string | null>(null);

  const [notifReport, setNotifReport] = useState(true);
  const [notifPosition, setNotifPosition] = useState(true);
  const [notifMentions, setNotifMentions] = useState(true);
  const [notifDigest, setNotifDigest] = useState(false);
  const [twoFa, setTwoFa] = useState(false);

  const save = () => showToast("Modifications enregistrées", <CheckCircleIcon className="h-5 w-5" />);

  return (
    <SettingsScaffold title="Paramètres du compte" tabs={TABS} tab={tab} onTab={setTab}>
      {tab === "profil" && (
        <div className="flex flex-col gap-8">
          <Section title="Profil" description="Vos informations personnelles, utilisées pour les signatures et l'attribution des actions.">
            <div className="flex flex-col gap-4">
              <Field label="Photo de profil">
                <AvatarUpload
                  name={name}
                  photoSeed="barthelemy-l-seo"
                  value={photo}
                  onChange={setPhoto}
                  onError={(m) => showToast(m)}
                />
              </Field>
              <Field label="Prénom / Nom"><Input value={name} onChange={setName} placeholder="Votre nom" /></Field>
              <Field label="Email"><Input value={email} onChange={setEmail} type="email" placeholder="email@exemple.com" /></Field>
              <Field label="Langue de l'interface"><LangueSelect value={langue} onChange={setLangue} /></Field>
            </div>
          </Section>
          <div className="flex items-center justify-end"><Button size="md" onClick={save}>Enregistrer</Button></div>
        </div>
      )}

      {tab === "notifications" && (
        <div className="flex flex-col gap-8">
          <Section title="Notifications" description="Ce que GlobalSearch vous envoie personnellement (email et in-app).">
            <div className="flex flex-col gap-4">
              <ToggleRow label="Rapports par email" sub="Résumé hebdomadaire de vos projets" checked={notifReport} onChange={setNotifReport} />
              <ToggleRow label="Alertes de chute de position" sub="Quand une page perd des positions clés" checked={notifPosition} onChange={setNotifPosition} />
              <ToggleRow label="Mentions & assignations" sub="Quand on vous assigne une action ou vous mentionne en commentaire" checked={notifMentions} onChange={setNotifMentions} />
              <ToggleRow label="Digest quotidien" sub="Un récapitulatif chaque matin plutôt qu'en temps réel" checked={notifDigest} onChange={setNotifDigest} />
            </div>
          </Section>
        </div>
      )}

      {tab === "securite" && (
        <div className="flex flex-col gap-8">
          <Section title="Mot de passe" description="Mettez à jour votre mot de passe régulièrement.">
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-[var(--text-secondary)]">Dernière modification il y a 3 mois</p>
              <Button size="sm" variant="secondary">Changer le mot de passe</Button>
            </div>
          </Section>
          <Section title="Double authentification (2FA)" description="Une couche de sécurité supplémentaire à la connexion.">
            <ToggleRow label="Activer la 2FA" sub="Via application d'authentification (TOTP)" checked={twoFa} onChange={setTwoFa} />
          </Section>
          <Section title="Sessions actives" description="Les appareils actuellement connectés à votre compte.">
            <div className="flex flex-col">
              {SESSIONS.map((s) => (
                <div key={s.device} className="flex items-center justify-between gap-6 border-b border-[var(--border-subtle)] py-3.5 last:border-0">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[var(--text-primary)]">
                      {s.device}
                      {s.current && <span className="ml-2 rounded-full bg-[var(--color-success-bg)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-success)]">Cet appareil</span>}
                    </p>
                    <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">{s.location} · {s.last}</p>
                  </div>
                  {!s.current && <Button size="sm" variant="secondary">Déconnecter</Button>}
                </div>
              ))}
            </div>
          </Section>
          <Section title="Danger" description="Actions irréversibles sur votre compte personnel.">
            <DangerRow title="Fermer le compte" description="Supprime définitivement votre compte et vous retire de tous les workspaces" action="Fermer" />
          </Section>
        </div>
      )}

      {tab === "raccourcis" && (
        <div className="flex flex-col gap-8">
          {shortcutGroups.map((g) => (
            <Section key={g.group} title={g.group} description={g.group === "Général" ? "Accélérez votre navigation dans toute l'application." : undefined}>
              <div className="flex flex-col">
                {g.items.map((s) => <ShortcutRow key={s.label} shortcut={s} />)}
              </div>
            </Section>
          ))}
        </div>
      )}
    </SettingsScaffold>
  );
}
