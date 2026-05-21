/* Mock projects — partagé par Sidebar, ProjectSwitcher et la home. */

export type ProjectStatus = "actif" | "archive";

export type Project = {
  domain: string;
  /** Score global (0–100) — utilisé pour le dot couleur dans les listes */
  score: number;
  /** Indique si Google a un favicon pour ce domaine */
  logo: boolean;
  status: ProjectStatus;
};

export const PROJECTS: Project[] = [
  { domain: "leboncoin.fr",      score: 84, logo: true,  status: "actif" },
  { domain: "doctolib.fr",       score: 61, logo: true,  status: "actif" },
  { domain: "backmarket.com",    score: 73, logo: true,  status: "actif" },
  { domain: "sephora.fr",        score: 91, logo: true,  status: "actif" },
  { domain: "fnac.com",          score: 78, logo: true,  status: "actif" },
  { domain: "decathlon.fr",      score: 87, logo: true,  status: "actif" },
  { domain: "lafourchette.com",  score: 66, logo: false, status: "actif" },
  { domain: "boulanger.com",     score: 71, logo: false, status: "actif" },
  { domain: "veepee.fr",         score: 58, logo: true,  status: "actif" },
  { domain: "blablacar.fr",      score: 79, logo: false, status: "actif" },
  { domain: "mano-mano.fr",      score: 69, logo: true,  status: "archive" },
  { domain: "cdiscount.com",     score: 82, logo: false, status: "archive" },
  { domain: "lemonde.fr",        score: 88, logo: true,  status: "archive" },
  { domain: "kiabi.com",         score: 38, logo: false, status: "archive" },
  { domain: "darty.com",         score: 74, logo: true,  status: "archive" },
  { domain: "leroymerlin.fr",    score: 92, logo: true,  status: "archive" },
  { domain: "seloger.com",       score: 55, logo: false, status: "archive" },
  { domain: "lequipe.fr",        score: 83, logo: true,  status: "archive" },
];

export function scoreColor(score: number) {
  return score >= 70 ? "var(--color-success)" : score >= 50 ? "var(--color-warning)" : "var(--color-danger)";
}
