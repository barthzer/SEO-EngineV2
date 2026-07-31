"use client";

/**
 * Paramètres d'un PROJET (un domaine analysé) — spécifique à ce site.
 * Général, connexions data du site (GSC/GA4), analyse & suivi, zone danger.
 */

import { useState } from "react";
import { Button } from "@/components/Button";
import { DropdownMenu, DropdownItem } from "@/components/DropdownMenu";
import { useToast } from "@/context/ToastContext";
import { ChevronDownIcon, PlusIcon, XMarkIcon, CheckCircleIcon, EllipsisHorizontalIcon, PencilSquareIcon, TrashIcon, AdjustmentsHorizontalIcon, LinkIcon, ArrowPathIcon, ExclamationTriangleIcon, BriefcaseIcon } from "@heroicons/react/24/outline";
import {
  SettingsScaffold, Section, Field, Input, ToggleRow, DangerRow,
  ConnCard, GscLogo, Ga4Logo, type ConnStatus, type SettingsTab,
} from "@/components/parametres/settingsUi";
import { ContexteMetierSettings } from "@/components/parametres/ContexteMetierSettings";
import { ModalShell } from "@/components/analyse/modals/shared";

type Tab = "general" | "contexte" | "connexions" | "analyse" | "danger";
const TABS: SettingsTab<Tab>[] = [
  { key: "general",    label: "Général",         icon: AdjustmentsHorizontalIcon },
  { key: "contexte",   label: "Contexte métier", icon: BriefcaseIcon },
  { key: "connexions", label: "Connexions",      icon: LinkIcon },
  { key: "analyse",    label: "Analyse & suivi", icon: ArrowPathIcon },
  { key: "danger",     label: "Zone danger",     icon: ExclamationTriangleIcon },
];

const FREQ_OPTIONS = ["Quotidienne", "Hebdomadaire", "Mensuelle", "Trimestrielle", "Manuelle"];
const MARKETS = ["France", "Belgique", "Suisse", "Canada", "International"];

export function ProjectSettingsView({ domain }: { domain: string }) {
  const [tab, setTab] = useState<Tab>("general");
  const { show: showToast } = useToast();

  const [name, setName] = useState(domain);
  const [active, setActive] = useState(true);
  const [freq, setFreq] = useState("Mensuelle");
  const [market, setMarket] = useState("France");
  const [gsc, setGsc] = useState<ConnStatus>("connected");
  const [ga4, setGa4] = useState<ConnStatus>("connected");
  const [competitors, setCompetitors] = useState<string[]>(["concurrent-a.fr", "concurrent-b.com"]);
  const [newComp, setNewComp] = useState("");
  const [lots, setLots] = useState(["Lot SEO — Optimisation Q2", "Lot Création — Blog expert"]);
  const [lotColors, setLotColors] = useState<Record<string, string>>({
    "Lot SEO — Optimisation Q2": "var(--accent-primary)",
    "Lot Création — Blog expert": "#14B8A6",
  });
  const [lotModal, setLotModal] = useState<{ mode: "create" } | { mode: "edit"; lot: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const save = () => showToast("Paramètres du projet enregistrés", <CheckCircleIcon className="h-5 w-5" />);
  const addComp = () => {
    const v = newComp.trim();
    if (v && !competitors.includes(v)) setCompetitors((c) => [...c, v]);
    setNewComp("");
  };
  const saveLot = (name: string, color: string) => {
    const v = name.trim();
    if (!v) { setLotModal(null); return; }
    if (lotModal?.mode === "edit") {
      const old = lotModal.lot;
      setLots((l) => l.map((x) => (x === old ? v : x)));
      setLotColors((m) => { const n = { ...m }; delete n[old]; n[v] = color; return n; });
    } else if (!lots.includes(v)) {
      setLots((l) => [...l, v]);
      setLotColors((m) => ({ ...m, [v]: color }));
    }
    setLotModal(null);
  };
  const confirmDeleteLot = () => {
    if (!deleteTarget) return;
    setLots((prev) => prev.filter((x) => x !== deleteTarget));
    setLotColors((m) => { const n = { ...m }; delete n[deleteTarget]; return n; });
    setDeleteTarget(null);
  };

  return (
    <>
      <SettingsScaffold title={`Paramètres · ${domain}`} tabs={TABS} tab={tab} onTab={setTab}>
        {tab === "general" && (
          <div className="flex flex-col gap-8">
            <Section title="Général" description="Informations d'identification du projet.">
              <div className="flex flex-col gap-4">
                <Field label="Nom du projet"><Input value={name} onChange={setName} placeholder="Nom du projet" /></Field>
                <Field label="Domaine">
                  <div className="flex h-9 items-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] px-3 text-[14px] text-[var(--text-muted)]">{domain}</div>
                </Field>
                <ToggleRow label="Projet actif" sub="Un projet archivé n'est plus analysé automatiquement" checked={active} onChange={setActive} />
              </div>
            </Section>

            <Section title="Lots" description="Regroupements d'URLs propres à ce projet.">
              <div className="flex flex-wrap items-center gap-2">
                {lots.map((l) => (
                  <span key={l} className="inline-flex items-center gap-2 rounded-full bg-[var(--bg-subtle)] py-1 pl-2.5 pr-1.5 text-[12px] font-medium text-[var(--text-secondary)]">
                    <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: lotColors[l] ?? "var(--text-muted)" }} />
                    {l}
                    <DropdownMenu
                      trigger={(open) => (
                        <button
                          aria-label={`Options du lot ${l}`}
                          className={`flex h-5 w-5 items-center justify-center rounded-full transition-colors ${open ? "bg-[var(--bg-card-hover)] text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
                        >
                          <EllipsisHorizontalIcon className="h-4 w-4" />
                        </button>
                      )}
                    >
                      <DropdownItem onClick={() => setLotModal({ mode: "edit", lot: l })}>
                        <span className="flex items-center gap-2"><PencilSquareIcon className="h-4 w-4 text-[var(--text-muted)]" />Modifier</span>
                      </DropdownItem>
                      <DropdownItem onClick={() => setDeleteTarget(l)}>
                        <span className="flex items-center gap-2 text-[var(--color-danger)]"><TrashIcon className="h-4 w-4" />Supprimer</span>
                      </DropdownItem>
                    </DropdownMenu>
                  </span>
                ))}
                <button onClick={() => setLotModal({ mode: "create" })} className="inline-flex items-center gap-1 rounded-full border border-dashed border-[var(--border-medium)] px-3 py-1 text-[12px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]">
                  <PlusIcon className="h-3.5 w-3.5" />Nouveau lot
                </button>
              </div>
            </Section>

            <div className="flex items-center justify-end"><Button size="md" onClick={save}>Enregistrer</Button></div>
          </div>
        )}

        {tab === "contexte" && (
          <div className="flex flex-col gap-8">
            <ContexteMetierSettings />
          </div>
        )}

        {tab === "connexions" && (
          <div className="flex flex-col gap-8">
            <Section title="Connexions de données du site" description="Sources propres à ce domaine (≠ clés API globales du workspace).">
              <div className="flex flex-col gap-3">
                <ConnCard logo={<GscLogo />} name="Google Search Console" description="Propriété à connecter pour ce domaine" status={gsc} account={domain} onConnect={() => setGsc("connected")} onDisconnect={() => setGsc("disconnected")} />
                <ConnCard logo={<Ga4Logo />} name="Google Analytics 4" description="Flux de données de ce site" status={ga4} account={`GA4 · ${domain}`} onConnect={() => setGa4("connected")} onDisconnect={() => setGa4("disconnected")} />
              </div>
            </Section>
          </div>
        )}

        {tab === "analyse" && (
          <div className="flex flex-col gap-8">
            <Section title="Fréquence d'analyse" description="À quelle cadence ce projet est ré-analysé.">
              <SelectRow value={freq} options={FREQ_OPTIONS} onChange={setFreq} />
            </Section>
            <Section title="Marché & localisation" description="Zone géographique de référence pour les positions et volumes.">
              <SelectRow value={market} options={MARKETS} onChange={setMarket} />
            </Section>
            <Section title="Concurrents suivis" description="Domaines comparés à ce projet dans les analyses.">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {competitors.map((c) => (
                    <span key={c} className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-subtle)] px-3 py-1 text-[12px] font-medium text-[var(--text-secondary)]">
                      {c}
                      <button onClick={() => setCompetitors((prev) => prev.filter((x) => x !== c))} className="text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"><XMarkIcon className="h-3.5 w-3.5" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-64"><Input value={newComp} onChange={setNewComp} placeholder="ajouter-un-concurrent.fr" /></div>
                  <Button size="sm" variant="secondary" onClick={addComp} disabled={!newComp.trim()}>Ajouter</Button>
                </div>
              </div>
            </Section>
          </div>
        )}

        {tab === "danger" && (
          <div className="flex flex-col gap-8">
            <Section title="Zone danger" description="Actions irréversibles sur ce projet.">
              <div className="flex flex-col gap-3">
                <DangerRow title="Archiver le projet" description="Le projet n'est plus analysé mais ses données sont conservées" action="Archiver" />
                <DangerRow title="Supprimer le projet" description="Efface le projet et toutes ses analyses définitivement" action="Supprimer" />
              </div>
            </Section>
          </div>
        )}
      </SettingsScaffold>

      {lotModal && (
        <LotModal
          mode={lotModal.mode}
          initialName={lotModal.mode === "edit" ? lotModal.lot : ""}
          initialColor={lotModal.mode === "edit" ? (lotColors[lotModal.lot] ?? LOT_PALETTE[8]) : LOT_PALETTE[8]}
          existingLots={lotModal.mode === "edit" ? lots.filter((l) => l !== lotModal.lot) : lots}
          onCancel={() => setLotModal(null)}
          onSubmit={saveLot}
        />
      )}

      {deleteTarget && (
        <ModalShell onClose={() => setDeleteTarget(null)} maxWidth={400}>
          <h3 className="mb-1.5 font-semibold tracking-subheading text-[var(--text-primary)]">Supprimer ce lot ?</h3>
          <p className="mb-6 text-[13px] text-[var(--text-secondary)]">
            Le lot <span className="font-medium text-[var(--text-primary)]">« {deleteTarget} »</span> sera retiré du projet. Les URLs qu&apos;il regroupe ne sont pas supprimées.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="md" onClick={() => setDeleteTarget(null)}>Annuler</Button>
            <Button variant="danger" size="md" onClick={confirmDeleteLot}>Supprimer</Button>
          </div>
        </ModalShell>
      )}
    </>
  );
}

/* ── NewLotModal — création d'un lot (nom + couleur), même flux que la page URLs ── */
const LOT_PALETTE = [
  "var(--color-danger)", "var(--color-warning)", "#EAB308", "#84CC16",
  "var(--color-success)", "#14B8A6", "#06B6D4", "#3B82F6",
  "var(--accent-primary)", "#A855F7", "#EC4899", "#64748B",
];

function LotModal({
  mode,
  initialName,
  initialColor,
  existingLots,
  onCancel,
  onSubmit,
}: {
  mode: "create" | "edit";
  initialName: string;
  initialColor: string;
  existingLots: string[];
  onCancel: () => void;
  onSubmit: (name: string, color: string) => void;
}) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState<string>(initialColor);
  const trimmed = name.trim();
  const exists = existingLots.includes(trimmed);
  const canSubmit = trimmed.length > 0 && !exists;

  return (
    <ModalShell onClose={onCancel} maxWidth={420}>
      <h3 className="mb-1.5 font-semibold tracking-subheading text-[var(--text-primary)]">
        {mode === "edit" ? "Modifier le lot" : "Créer un nouveau lot"}
      </h3>
      <p className="mb-5 text-[13px] text-[var(--text-secondary)]">Donnez un nom à votre lot et choisissez sa couleur.</p>

      <input
        autoFocus
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && canSubmit) onSubmit(trimmed, color); }}
        placeholder="Ex. Lot Mai 2026 — Refonte"
        className="w-full rounded-full border border-[var(--border-medium)] bg-[var(--input-bg)] px-4 py-2.5 text-[14px] text-[var(--text-primary)] placeholder-[var(--text-input)] focus:border-[var(--accent-primary)] focus:outline-none"
      />
      {exists && <p className="mt-2 text-[12px] text-[var(--color-danger)]">Ce lot existe déjà.</p>}

      <div className="mt-5">
        <p className="mb-2.5 text-[12px] font-medium text-[var(--text-secondary)]">Couleur</p>
        <div className="flex flex-wrap gap-2">
          {LOT_PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95"
              aria-label={`Choisir la couleur ${c}`}
            >
              <span className="block h-5 w-5 rounded-full" style={{ backgroundColor: c, boxShadow: c === color ? `0 0 0 2px var(--modal-bg), 0 0 0 3.5px ${c}` : undefined }} />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" size="md" onClick={onCancel}>Annuler</Button>
        <Button variant="primary" size="md" onClick={() => onSubmit(trimmed, color)} disabled={!canSubmit}>
          {mode === "edit" ? "Enregistrer" : "Créer le lot"}
        </Button>
      </div>
    </ModalShell>
  );
}

/* Petit select DS réutilisé localement (fréquence, marché). */
function SelectRow({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <DropdownMenu
      matchTrigger
      trigger={(open) => (
        <button className="flex h-9 w-64 items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 text-[14px] font-medium text-[var(--text-primary)] outline-none transition-colors hover:border-[var(--border-medium)]">
          {value}
          <ChevronDownIcon className="h-3.5 w-3.5 text-[var(--text-muted)] transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
        </button>
      )}
    >
      {options.map((o) => (
        <DropdownItem key={o} onClick={() => onChange(o)}>
          <span className={value === o ? "font-semibold text-[var(--text-primary)]" : ""}>{o}</span>
        </DropdownItem>
      ))}
    </DropdownMenu>
  );
}
