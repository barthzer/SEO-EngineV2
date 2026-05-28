/**
 * Agency branding — identité visuelle de l'agence (nom, initiales, couleur, logo)
 * paramétrable par un admin via /parametres > Identité agence.
 *
 * Persistance : localStorage pour la démo, en attendant la table `workspaces`
 * (colonne `logo_url`, `accent_color`, `name`) côté Drizzle.
 *
 * Lecture : utilitaire pur côté server-side (avec defaults) + hook React
 * `useAgencyBranding()` pour les composants client qui réagissent aux changements.
 */

const STORAGE_KEY = "agency-branding:v1";

export type AgencyBranding = {
  name: string;
  initials: string;
  accentColor: string;
  /** Base64 data URL si logo uploadé, sinon undefined → fallback initiales. */
  logoDataUrl?: string;
};

export const DEFAULT_BRANDING: AgencyBranding = {
  name: "AWI Studio",
  initials: "AWI",
  accentColor: "#3D4FFF",
};

/** Palette de couleurs d'accent proposées dans le picker. */
export const ACCENT_PRESETS: { label: string; value: string }[] = [
  { label: "Indigo",  value: "#3D4FFF" },
  { label: "Violet",  value: "#7C3AED" },
  { label: "Bleu",    value: "#2563EB" },
  { label: "Vert",    value: "#10B981" },
  { label: "Émeraude",value: "#059669" },
  { label: "Ambre",   value: "#F59E0B" },
  { label: "Rose",    value: "#F43F5E" },
  { label: "Charbon", value: "#1F2937" },
];

/** Dérive 2-3 initiales depuis un nom de studio (côté serveur ou client). */
export function deriveInitials(name: string): string {
  const cleaned = name.trim();
  if (!cleaned) return "—";
  const parts = cleaned.split(/[\s\-_·.&]+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 3).toUpperCase();
  }
  return parts
    .slice(0, 3)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

/** Lecture côté browser uniquement — appeler dans un useEffect ou client component. */
export function readBranding(): AgencyBranding {
  if (typeof window === "undefined") return DEFAULT_BRANDING;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_BRANDING;
    const parsed = JSON.parse(raw) as Partial<AgencyBranding>;
    return {
      name:         parsed.name        ?? DEFAULT_BRANDING.name,
      initials:     parsed.initials    ?? DEFAULT_BRANDING.initials,
      accentColor:  parsed.accentColor ?? DEFAULT_BRANDING.accentColor,
      logoDataUrl:  parsed.logoDataUrl,
    };
  } catch {
    return DEFAULT_BRANDING;
  }
}

export function saveBranding(branding: AgencyBranding) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(branding));
  // Notifie les autres composants (ClientSidebar, ClientTopbar) qui écoutent.
  window.dispatchEvent(new Event("agency-branding:changed"));
}

export function resetBranding() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("agency-branding:changed"));
}
