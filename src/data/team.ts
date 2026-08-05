/**
 * Équipe (consultants) — contrat de type + mock.
 *
 * Sorti de `src/app/(app)/equipe/page.tsx` pour le handoff back (voir HANDOFF.md).
 * Le type `Consultant` est le contrat ; la vraie requête ira dans
 * `src/db/queries/team.ts` avec le fallback mock.
 * Aussi consommé par le Suivi (owners des actions livrées).
 */

export type ProjectMini = {
  domain: string;
  scoreTechnique: number;
  scoreContenu: number;
  scoreNetlinking: number;
  trafic: string;
  traficDir: "up" | "down" | "neutral";
  actionsOpen: number;
  briefsInProgress: number;
  stage: "actif" | "en pause" | "terminé";
};

export type Meeting = { client: string; date: string; label: string };
export type Alert = { level: "critical" | "warning"; text: string };

export type Consultant = {
  id: number;
  name: string;
  /** Seed pour pravatar.cc — choisir des seeds stables qui rendent bien. */
  photoSeed: string;
  role: string;
  email: string;
  phone: string;
  hoursThisWeek: number;
  hoursBudget: number;
  projects: ProjectMini[];
  upcomingMeetings: Meeting[];
  alerts: Alert[];
};

export const TEAM: Consultant[] = [
  {
    id: 1,
    name: "Barthélemy L.",
    photoSeed: "barthelemy-l-seo",
    role: "Lead SEO",
    email: "barthelemy@awi.com",
    phone: "+33 6 12 34 56 78",
    hoursThisWeek: 28,
    hoursBudget: 35,
    projects: [
      { domain: "leboncoin.fr",   scoreTechnique: 84, scoreContenu: 78, scoreNetlinking: 90, trafic: "+12 %", traficDir: "up",   actionsOpen: 7, briefsInProgress: 3, stage: "actif" },
      { domain: "doctolib.fr",    scoreTechnique: 61, scoreContenu: 58, scoreNetlinking: 65, trafic: "−3 %",  traficDir: "down", actionsOpen: 4, briefsInProgress: 1, stage: "actif" },
      { domain: "backmarket.com", scoreTechnique: 73, scoreContenu: 70, scoreNetlinking: 79, trafic: "+5 %",  traficDir: "up",   actionsOpen: 5, briefsInProgress: 2, stage: "actif" },
    ],
    upcomingMeetings: [
      { client: "Leboncoin", date: "2026-05-26", label: "Point hebdo · 14h" },
      { client: "Doctolib", date: "2026-05-28", label: "Steering trimestriel · 10h" },
    ],
    alerts: [
      { level: "critical", text: "Doctolib · −3% trafic semaine, à creuser" },
      { level: "warning", text: "3 actions Backmarket en retard de deadline" },
    ],
  },
  {
    id: 2,
    name: "Sophie M.",
    photoSeed: "5",
    role: "Consultante SEO senior",
    email: "sophie@awi.com",
    phone: "+33 6 23 45 67 89",
    hoursThisWeek: 42,
    hoursBudget: 35,
    projects: [
      { domain: "sephora.fr", scoreTechnique: 91, scoreContenu: 88, scoreNetlinking: 94, trafic: "+18 %", traficDir: "up",      actionsOpen: 9, briefsInProgress: 4, stage: "actif" },
      { domain: "fnac.com",   scoreTechnique: 78, scoreContenu: 75, scoreNetlinking: 82, trafic: "+7 %",  traficDir: "up",      actionsOpen: 6, briefsInProgress: 2, stage: "actif" },
      { domain: "kiabi.com",  scoreTechnique: 38, scoreContenu: 42, scoreNetlinking: 35, trafic: "−8 %",  traficDir: "down",    actionsOpen: 11, briefsInProgress: 0, stage: "en pause" },
    ],
    upcomingMeetings: [
      { client: "Sephora", date: "2026-05-26", label: "Présentation rapport mensuel · 9h30" },
      { client: "Fnac", date: "2026-05-27", label: "Sprint review · 16h" },
    ],
    alerts: [
      { level: "critical", text: "Sophie en surcharge : 42h/35h cette semaine" },
      { level: "warning", text: "Kiabi en pause depuis 3 semaines, statut à clarifier" },
    ],
  },
  {
    id: 3,
    name: "Thomas L.",
    photoSeed: "thomas-l-seo",
    role: "Consultant SEO/SEA",
    email: "thomas@awi.com",
    phone: "+33 6 34 56 78 90",
    hoursThisWeek: 12,
    hoursBudget: 35,
    projects: [
      { domain: "mano-mano.fr",  scoreTechnique: 69, scoreContenu: 65, scoreNetlinking: 73, trafic: "+9 %",  traficDir: "up", actionsOpen: 3, briefsInProgress: 1, stage: "actif" },
      { domain: "cdiscount.com", scoreTechnique: 82, scoreContenu: 78, scoreNetlinking: 86, trafic: "+14 %", traficDir: "up", actionsOpen: 5, briefsInProgress: 2, stage: "actif" },
    ],
    upcomingMeetings: [
      { client: "Cdiscount", date: "2026-05-29", label: "Onboarding nouveau dev SEO · 11h" },
    ],
    alerts: [
      { level: "warning", text: "Sous-charge : 12h/35h, capacité dispo pour nouveau client" },
    ],
  },
  {
    id: 4,
    name: "Marie P.",
    photoSeed: "marie-p-seo",
    role: "Content Strategist",
    email: "marie@awi.com",
    phone: "+33 6 45 67 89 01",
    hoursThisWeek: 33,
    hoursBudget: 35,
    projects: [
      { domain: "lemonde.fr",  scoreTechnique: 88, scoreContenu: 92, scoreNetlinking: 84, trafic: "+6 %", traficDir: "up", actionsOpen: 4, briefsInProgress: 5, stage: "actif" },
      { domain: "lefigaro.fr", scoreTechnique: 74, scoreContenu: 86, scoreNetlinking: 70, trafic: "+3 %", traficDir: "up", actionsOpen: 2, briefsInProgress: 0, stage: "terminé" },
    ],
    upcomingMeetings: [
      { client: "Le Monde", date: "2026-05-28", label: "Validation briefs Q3 · 15h" },
    ],
    alerts: [],
  },
];
