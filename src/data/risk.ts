/**
 * Niveau de risque d'une recommandation — contrat partagé (handoff back).
 *
 * Toutes les recommandations ne se défont pas de la même façon : l'outil classe
 * chacune selon trois niveaux. La carte Action créée depuis une recommandation
 * garde son niveau (champ `risk` recopié).
 *
 *  - reversible   : se défait sans perte (title, méta, lien interne, réattribuer
 *                   une requête à une autre page). Cas courant : AUCUN badge.
 *  - costly       : se défait, mais avec délai et perte de signal (redirection 301,
 *                   canonique, changement d'URL, robots.txt). Badge discret.
 *  - irreversible : ne se défait pas (fusion de contenus, suppression de page,
 *                   désindexation en masse). Badge marqué.
 *
 * Confirmation obligatoire quand une recommandation `costly` ou `irreversible`
 * est marquée comme décidée ou passée « En cours » : la fenêtre rappelle ce qui ne
 * pourra pas être défait (`undo`) et la preuve qui fonde la recommandation (`evidence`).
 */

export type RiskLevel = "reversible" | "costly" | "irreversible";

export type RiskInfo = {
  level: RiskLevel;
  /** Ce qui ne pourra pas être défait, rappelé dans la confirmation. */
  undo?: string;
  /** Preuve sur laquelle l'outil s'appuie (ex. « contenu identique sur les deux pages »). */
  evidence?: string;
};

/** Échelle classique jaune → orange → rouge. Le jaune (réversible) n'est pas affiché
 *  par défaut (cas courant), il reste défini pour une légende ou un filtre. */
export const RISK_COLORS: Record<RiskLevel, { color: string; bg: string }> = {
  reversible:   { color: "#A16207", bg: "rgba(234,179,8,0.14)" },
  costly:       { color: "#C2410C", bg: "rgba(234,88,12,0.10)" },
  irreversible: { color: "var(--color-danger)", bg: "var(--color-danger-bg)" },
};

export const RISK_CFG: Record<Exclude<RiskLevel, "reversible">, { label: string; desc: string }> = {
  costly: {
    label: "Coûteuse",
    desc: "Se défait, mais avec un délai et une perte de signal : Google doit recrawler et réattribuer l'autorité.",
  },
  irreversible: {
    label: "Irréversible",
    desc: "Ne se défait pas : le contenu ou l'historique de la page est perdu définitivement.",
  },
};

/** Vrai si le changement de statut vaut une NOUVELLE décision (entrée dans un statut « décidé »). */
export function isNewDecision<S extends string>(decided: ReadonlySet<S>, from: S, to: S): boolean {
  return decided.has(to) && !decided.has(from);
}

/** Vrai si la recommandation demande une confirmation (coûteuse ou irréversible). */
export function isRisky(risk?: RiskInfo | null): risk is RiskInfo & { level: Exclude<RiskLevel, "reversible"> } {
  return !!risk && risk.level !== "reversible";
}
