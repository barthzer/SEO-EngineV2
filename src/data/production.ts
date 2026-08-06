/**
 * Production éditoriale (kanban articles) — contrat de type + mock.
 * Sorti de `src/app/(app)/production/page.tsx` (handoff back, cf. HANDOFF.md).
 */

export type Stage = "brief" | "redaction" | "relecture" | "publie";

export type Article = {
  id: number;
  title: string;
  url: string;
  keyword: string;
  volume: number;
  wordCount: number;
  stage: Stage;
  assignee: string;
  dueDate: string;
  progress: number;
};

/* ── Mock data ───────────────────────────────────────────────────────── */

export const ARTICLES: Article[] = [
  { id: 1, title: "E-E-A-T : Expérience, Expertise, Autorité", url: "/blog/eeat-google", keyword: "eeat google", volume: 1300, wordCount: 2400, stage: "redaction", assignee: "Sophie M.", dueDate: "2 mai", progress: 65 },
  { id: 2, title: "Schema.org et données structurées", url: "/blog/schema-org", keyword: "données structurées seo", volume: 1100, wordCount: 1800, stage: "relecture", assignee: "Thomas L.", dueDate: "30 avr.", progress: 90 },
  { id: 3, title: "Stratégie de contenu pilier", url: "/blog/contenu-pilier", keyword: "content hub seo", volume: 880, wordCount: 2600, stage: "brief", assignee: "Sophie M.", dueDate: "5 mai", progress: 15 },
  { id: 4, title: "SEO vs SEA : quelle stratégie ?", url: "/blog/seo-vs-sea", keyword: "seo vs sea", volume: 2400, wordCount: 1600, stage: "publie", assignee: "Thomas L.", dueDate: "22 avr.", progress: 100 },
  { id: 5, title: "Optimisation du taux de clic", url: "/blog/optimiser-ctr", keyword: "améliorer ctr google", volume: 1900, wordCount: 1400, stage: "redaction", assignee: "Marie P.", dueDate: "4 mai", progress: 40 },
  { id: 6, title: "Rédaction SEO : le guide", url: "/blog/redaction-seo", keyword: "rédaction seo", volume: 1600, wordCount: 2000, stage: "brief", assignee: "Marie P.", dueDate: "8 mai", progress: 0 },
  { id: 7, title: "Audit Core Web Vitals", url: "/blog/core-web-vitals", keyword: "core web vitals", volume: 2100, wordCount: 1600, stage: "publie", assignee: "Thomas L.", dueDate: "18 avr.", progress: 100 },
];
