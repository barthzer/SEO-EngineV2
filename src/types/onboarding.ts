/** Types de l'onboarding — partagés entre hook + composants */

export type OnboardingGoal = "audit" | "optimize" | "geo" | "missing" | "tracking" | "netlinking";
export type OnboardingRole = "consultant_freelance" | "agence" | "in_house" | "founder" | "other";
export type OnboardingSeniority = "junior" | "intermediate" | "senior" | "expert";
export type OnboardingTeamSize = "solo" | "2-10" | "11-50" | "51-200" | "200+";
export type OnboardingFrequency = "quotidienne" | "hebdomadaire" | "mensuelle" | "manuelle";
export type OnboardingLLM = "chatgpt" | "perplexity" | "claude" | "gemini" | "mistral";

export interface OnboardingData {
  // Step 0 — entry
  goals: OnboardingGoal[];

  // Step 1 — user
  firstName: string;
  role: OnboardingRole | null;
  seniority: OnboardingSeniority | null;

  // Step 2 — workspace
  workspaceName: string;
  workspaceSlug: string;
  industry: string;
  teamSize: OnboardingTeamSize | null;

  // Step 3 — market
  primaryCountry: string;
  primaryLanguage: string;
  targetLLMs: OnboardingLLM[];

  // Step 4 — first project
  firstProjectDomain: string;
  analysisFrequency: OnboardingFrequency;
  gscConnected: boolean;
  ga4Connected: boolean;

  // Step 5 — done
  newsletterOptIn: boolean;

  // Meta
  startedAt: number;
  completedAt?: number;
  resumedFromStep?: number;
}

export const TOTAL_STEPS = 6; // 0 entry, 1 vous, 2 workspace, 3 marché, 4 projet, 5 done

export const DEFAULT_ONBOARDING: OnboardingData = {
  goals: [],
  firstName: "",
  role: null,
  seniority: null,
  workspaceName: "",
  workspaceSlug: "",
  industry: "",
  teamSize: null,
  primaryCountry: "FR",
  primaryLanguage: "fr",
  targetLLMs: [],
  firstProjectDomain: "",
  analysisFrequency: "hebdomadaire",
  gscConnected: false,
  ga4Connected: false,
  newsletterOptIn: false,
  startedAt: 0,
};
