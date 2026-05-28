/**
 * Moteur de réponse déterministe de l'assistant (MVP — sans LLM).
 *
 * `respond()` est une fonction pure : (texte utilisateur + contexte) → réponse.
 * Elle reconnaît des intentions par mots-clés (navigation, Q&A sur les projets,
 * aide) et renvoie éventuellement une action de navigation in-app.
 *
 * Aucune dépendance React — facile à tester et à remplacer par un vrai LLM (G3).
 */

import type { Project } from "@/data/projects";

export type ChatAction = { label: string; href: string };

export type BotReply = {
  text: string;
  /** Action de navigation proposée (bouton sous le message). */
  action?: ChatAction;
  /** Relances cliquables affichées sous le message. */
  suggestions?: string[];
};

export type ChatContext = {
  projects: Project[];
  /** Pathname courant (pour contextualiser certaines réponses). */
  pathname: string;
};

/* ── Utilitaires ─────────────────────────────────────────────────────── */

/** Minuscule + sans accents, pour un matching robuste. */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

function has(haystack: string, ...needles: string[]): boolean {
  return needles.some((n) => haystack.includes(n));
}

/* ── Routes navigables par mots-clés ─────────────────────────────────── */

const ROUTES: { label: string; href: string; keys: string[] }[] = [
  { label: "l'accueil",    href: "/",           keys: ["accueil", "home", "tableau de bord", "dashboard", "cockpit", "mes projets", "liste des projets"] },
  { label: "l'équipe",     href: "/equipe",     keys: ["equipe", "team", "consultant", "collaborateur"] },
  { label: "les briefs",   href: "/briefs",     keys: ["brief", "url a rediger", "redaction"] },
  { label: "la production", href: "/production", keys: ["production", "livraison", "pipeline"] },
  { label: "les paramètres", href: "/parametres", keys: ["parametre", "reglage", "settings", "raccourci", "cle api", "connexion api", "mon compte", "identite agence"] },
];

const NAV_INTENT = [
  "ouvre", "ouvrir", "ouvrez", "va", "vas", "aller", "rends", "montre", "montrer",
  "affiche", "afficher", "emmene", "navigue", "accede", "amene", "direction", "page",
];

const GREETINGS = ["bonjour", "salut", "hello", "coucou", "hey", "yo", "bonsoir", "bonne journee"];

const DEFAULT_SUGGESTIONS = [
  "Ouvre les paramètres",
  "Liste mes projets",
  "Que peux-tu faire ?",
];

/* ── Détection d'un projet mentionné ─────────────────────────────────── */

function findProject(text: string, projects: Project[]): Project | null {
  for (const p of projects) {
    const domain = normalize(p.domain);
    const name = domain.split(".")[0]; // "leboncoin.fr" → "leboncoin"
    if (name.length >= 3 && (text.includes(domain) || text.includes(name))) {
      return p;
    }
  }
  return null;
}

function analyseHref(domain: string): string {
  return `/analyse/${encodeURIComponent(domain)}`;
}

/* ── Réponse ─────────────────────────────────────────────────────────── */

export function respond(input: string, ctx: ChatContext): BotReply {
  const q = normalize(input);

  if (!q) {
    return {
      text: "Pose-moi une question ou demande-moi d'ouvrir une page 👇",
      suggestions: DEFAULT_SUGGESTIONS,
    };
  }

  // 1. Salutations
  if (has(q, ...GREETINGS) && q.length < 25) {
    return {
      text: "Bonjour 👋 Je suis l'assistant SEO Engine. Je peux vous aider à naviguer dans l'app et répondre à vos questions sur vos projets.",
      suggestions: DEFAULT_SUGGESTIONS,
    };
  }

  // 2. Aide / capacités
  if (has(q, "aide", "que peux-tu", "que peux tu", "que sais-tu", "que sais tu", "capacit", "comment ca marche", "comment tu marche", "a quoi tu sers", "help")) {
    return {
      text:
        "Voici ce que je sais faire pour l'instant :\n" +
        "• Naviguer — « ouvre les paramètres », « va sur l'équipe », « ouvre leboncoin.fr »\n" +
        "• Vos projets — « liste mes projets », « combien de projets actifs », « score de sephora.fr »\n" +
        "Bientôt : analyses Ahrefs et rédaction de briefs directement ici.",
      suggestions: DEFAULT_SUGGESTIONS,
    };
  }

  // 3. Questions sur le portefeuille de projets
  const actifs = ctx.projects.filter((p) => p.status === "actif");
  const archives = ctx.projects.filter((p) => p.status === "archive");

  if (has(q, "combien") && has(q, "projet")) {
    const scope = has(q, "archiv") ? archives.length : has(q, "actif") ? actifs.length : ctx.projects.length;
    const label = has(q, "archiv") ? "archivé(s)" : has(q, "actif") ? "actif(s)" : "au total";
    return {
      text: `Vous avez ${scope} projet${scope > 1 ? "s" : ""} ${label} (${actifs.length} actifs · ${archives.length} archivés).`,
      action: { label: "Voir tous les projets", href: "/" },
    };
  }

  if ((has(q, "liste") && has(q, "projet")) || has(q, "mes projets", "quels projets")) {
    const top = actifs.slice(0, 6).map((p) => `• ${p.domain} — ${p.score}/100`).join("\n");
    const extra = actifs.length > 6 ? `\n…et ${actifs.length - 6} autres.` : "";
    return {
      text: `Vos projets actifs :\n${top}${extra}`,
      action: { label: "Ouvrir la liste complète", href: "/" },
    };
  }

  // 4. Question/navigation ciblant un projet précis
  const project = findProject(q, ctx.projects);
  if (project) {
    if (has(q, "score", "note", "performance")) {
      return {
        text: `Le score global de ${project.domain} est de ${project.score}/100 (projet ${project.status}).`,
        action: { label: `Ouvrir ${project.domain}`, href: analyseHref(project.domain) },
      };
    }
    if (has(q, "statut", "archiv", "actif", "etat")) {
      return {
        text: `${project.domain} est actuellement ${project.status === "actif" ? "actif" : "archivé"}.`,
        action: { label: `Ouvrir ${project.domain}`, href: analyseHref(project.domain) },
      };
    }
    // Par défaut : on propose d'ouvrir l'analyse du projet.
    return {
      text: `J'ouvre l'analyse de ${project.domain} pour vous.`,
      action: { label: `Ouvrir ${project.domain}`, href: analyseHref(project.domain) },
    };
  }

  // 5. Navigation par mot-clé de route
  const route = ROUTES.find((r) => has(q, ...r.keys));
  if (route && (has(q, ...NAV_INTENT) || route.keys.some((k) => q === k))) {
    return {
      text: `Direction ${route.label}.`,
      action: { label: `Aller vers ${route.label}`, href: route.href },
    };
  }
  // Mot-clé de route seul (sans verbe) — on propose quand même.
  if (route) {
    return {
      text: `Vous cherchez ${route.label} ?`,
      action: { label: `Ouvrir ${route.label}`, href: route.href },
    };
  }

  // 6. Fallback
  return {
    text:
      "Je ne suis pas encore sûr de comprendre cette demande. Je gère pour l'instant la navigation et les questions sur vos projets.",
    suggestions: DEFAULT_SUGGESTIONS,
  };
}
