/**
 * Templates de Workflow — modèle de données (mock, MVP sans backend).
 *
 * Un template encapsule un process de production/optimisation de contenu :
 * métadonnées, contexte d'usage, type de page, squelette éditorial (Hn),
 * paramètres de génération, checklist GEO, et une séquence d'actions
 * exécutables (chaque action pouvant embarquer un prompt à variables).
 *
 * Le fichier reste pur (aucune dépendance React) — les icônes sont des clés
 * résolues côté UI (voir TEMPLATE_ICONS dans les composants).
 */

/* ── Énumérations ────────────────────────────────────────────────────── */

export type TemplateVisibility = "systeme" | "agence" | "equipe" | "perso";
export type TemplateContext = "from_scratch" | "from_url_analysis";
export type TemplatePageType =
  | "article"
  | "categorie"
  | "produit"
  | "landing"
  | "pilier"
  | "comparatif"
  | "guide"
  | "faq"
  | "generique";
export type TemplateTag =
  | "SEO"
  | "GEO"
  | "E-commerce"
  | "B2B"
  | "Éditorial"
  | "Technique"
  | "Popularité"
  | "Refresh"
  | "Cluster";
export type TemplateLLM = "gpt-4o" | "claude-sonnet" | "gemini" | "perplexity";

/* ── Sous-structures ─────────────────────────────────────────────────── */

export type HeadingLevel = "h1" | "h2" | "h3";
/** Un nœud du squelette éditorial (titre + description de ce qu'il doit contenir). */
export type HeadingNode = { id: string; level: HeadingLevel; title: string; hint: string };

/** Checklist GEO : ce qui doit être couvert pour la visibilité IA. */
export type GeoChecklist = {
  /** Entités à couvrir obligatoirement. */
  entities: string[];
  /** Sources à citer (autorité). */
  sources: string[];
  /** Questions à traiter en format answer-first. */
  questions: string[];
  /** Densité sémantique cible (0–100). */
  semanticDensity: number;
};

/** Paramètres de génération appliqués au contenu. */
export type GenerationParams = {
  tone: string;
  length: string;
  /** Nom du brand kit / brand voice à appliquer (optionnel). */
  brandVoice?: string;
  llm: TemplateLLM;
};

/** Une action séquencée du workflow. Peut embarquer un prompt paramétrable. */
export type WorkflowStep = {
  id: string;
  label: string;
  hint?: string;
  /** Prompt à variables — ex. "Réécris {url_source} en ciblant {entites_cibles}". */
  prompt?: string;
};

/* ── Template ────────────────────────────────────────────────────────── */

export type WorkflowTemplate = {
  id: string;
  name: string;
  description: string;
  /** Clé d'icône résolue côté UI (voir TEMPLATE_ICONS). */
  icon: string;
  tags: TemplateTag[];
  author: string;
  visibility: TemplateVisibility;
  /** Contextes d'usage — un template peut servir dans un seul ou les deux. */
  contexts: TemplateContext[];
  pageType: TemplatePageType;
  structure: HeadingNode[];
  params: GenerationParams;
  geo: GeoChecklist;
  /** Le workflow proprement dit : liste ordonnée d'actions. */
  steps: WorkflowStep[];
  /** Nombre d'utilisations (mock). */
  usageCount: number;
  /** Dernière mise à jour (ISO). */
  updatedAt: string;
  /** Version (templates système versionnés). */
  version: number;
  /** true si une nouvelle version système est dispo (template forké/perso). */
  updateAvailable?: boolean;
  /** Corps du prompt en Markdown — le cœur éditable du template (variables {…}). */
  content?: string;
};

/* ── Métadonnées d'affichage (labels + couleurs) ─────────────────────── */

export const VISIBILITY_META: Record<
  TemplateVisibility,
  { label: string; color: string }
> = {
  systeme: { label: "Système AWi", color: "var(--text-primary)" },
  agence: { label: "Agence", color: "#0EA5E9" },
  equipe: { label: "Équipe", color: "#10B981" },
  perso: { label: "Perso", color: "var(--text-muted)" },
};

export const TAG_META: Record<TemplateTag, { color: string }> = {
  SEO: { color: "var(--text-secondary)" },
  GEO: { color: "#8B5CF6" },
  "E-commerce": { color: "#F59E0B" },
  B2B: { color: "#0EA5E9" },
  Éditorial: { color: "#10B981" },
  Technique: { color: "#64748B" },
  Popularité: { color: "#EC4899" },
  Refresh: { color: "#06B6D4" },
  Cluster: { color: "#6366F1" },
};

export const PAGE_TYPE_LABEL: Record<TemplatePageType, string> = {
  article: "Article de blog",
  categorie: "Page catégorie",
  produit: "Fiche produit",
  landing: "Landing page",
  pilier: "Page pilier",
  comparatif: "Comparatif",
  guide: "Guide",
  faq: "FAQ",
  generique: "Tous types",
};

export const CONTEXT_LABEL: Record<TemplateContext, string> = {
  from_scratch: "Création from scratch",
  from_url_analysis: "Depuis une URL analysée",
};

export const LLM_LABEL: Record<TemplateLLM, string> = {
  "gpt-4o": "GPT-4o",
  "claude-sonnet": "Claude Sonnet",
  gemini: "Gemini",
  perplexity: "Perplexity",
};

/* ── Variables de template (résolues au moment de l'application) ─────── */

/** Registre des variables injectables dans les prompts + leur source. */
export const TEMPLATE_VARS: { key: string; label: string; source: string }[] = [
  { key: "keyword_principal", label: "Mot-clé principal", source: "Saisi / URL analysée" },
  { key: "url_source", label: "URL source", source: "URL analysée" },
  { key: "type_page", label: "Type de page", source: "Détecté sur l'URL" },
  { key: "brand_voice", label: "Brand voice", source: "Brand kit sélectionné" },
  { key: "entites_cibles", label: "Entités cibles", source: "Analyse sémantique" },
  { key: "gaps_semantiques", label: "Gaps sémantiques", source: "Analyse sémantique" },
  { key: "score_geo", label: "Score GEO actuel", source: "Visibilité IA" },
  { key: "prompts_cibles", label: "Prompts cibles", source: "Visibilité IA" },
  { key: "position_actuelle", label: "Position actuelle", source: "GSC / Ahrefs" },
  { key: "volume", label: "Volume de recherche", source: "Keywords Explorer" },
  { key: "concurrents", label: "Concurrents", source: "Benchmark" },
  { key: "annee", label: "Année", source: "Date du jour" },
];

/* ── Seed : templates système (v1) + exemples équipe/perso ───────────── */

export const TEMPLATES: WorkflowTemplate[] = [
  /* 1 ─ Audit sémantique de fondation ─────────────────────────────── */
  {
    id: "sys-audit-semantique",
    name: "Audit sémantique de fondation",
    description:
      "Diagnostic complet d'une URL : couverture d'entités, intention, structure Hn, signaux GEO et plan d'action priorisé.",
    icon: "audit",
    tags: ["SEO", "Éditorial"],
    author: "Équipe AWi",
    visibility: "systeme",
    contexts: ["from_url_analysis"],
    pageType: "generique",
    structure: [
      { id: "h1", level: "h1", title: "Audit sémantique — {url_source}", hint: "Titre du rapport d'audit." },
      { id: "s1", level: "h2", title: "Couverture des entités", hint: "Entités attendues vs présentes, gaps prioritaires ({gaps_semantiques})." },
      { id: "s2", level: "h2", title: "Intention de recherche & SERP", hint: "Alignement du contenu avec l'intention dominante sur {keyword_principal}." },
      { id: "s3", level: "h2", title: "Structure Hn & maillage", hint: "Hiérarchie des titres, ancres internes manquantes." },
      { id: "s4", level: "h2", title: "Signaux GEO", hint: "Format answer-first, sources citées, présence en AI Overviews (score {score_geo})." },
      { id: "s5", level: "h2", title: "Plan d'action priorisé", hint: "Recommandations classées par impact / effort." },
    ],
    params: { tone: "Analytique, factuel", length: "Rapport structuré", llm: "claude-sonnet" },
    geo: {
      entities: [],
      sources: [],
      questions: [],
      semanticDensity: 0,
    },
    steps: [
      { id: "a1", label: "Scraper la page source", hint: "Récupère le contenu actuel de {url_source}." },
      { id: "a2", label: "Extraire les entités présentes vs cibles", prompt: "Compare les entités de {url_source} au guide YourTextGuru sur {keyword_principal} et liste les manquantes." },
      { id: "a3", label: "Identifier les gaps sémantiques prioritaires", hint: "Classe {gaps_semantiques} par impact." },
      { id: "a4", label: "Analyser la structure Hn et le maillage interne" },
      { id: "a5", label: "Évaluer les signaux GEO", hint: "Answer-first, sources, AI Overviews." },
      { id: "a6", label: "Générer le plan d'action priorisé", prompt: "Produis un plan d'action classé par impact/effort à partir des gaps identifiés." },
    ],
    usageCount: 142,
    updatedAt: "2026-06-18",
    version: 3,
  },

  /* 2 ─ Rewrite page catégorie e-commerce ─────────────────────────── */
  {
    id: "sys-rewrite-categorie",
    name: "Rewrite page catégorie e-commerce",
    description:
      "Transforme les recommandations d'analyse en un plan de réécriture orienté conversion : chapô, guide d'achat, FAQ answer-first, maillage.",
    icon: "cart",
    tags: ["SEO", "E-commerce", "Éditorial"],
    author: "Équipe AWi",
    visibility: "systeme",
    contexts: ["from_url_analysis"],
    pageType: "categorie",
    structure: [
      { id: "h1", level: "h1", title: "{keyword_principal}", hint: "H1 aligné sur l'intention transactionnelle." },
      { id: "s1", level: "h2", title: "Chapô éditorial", hint: "150–200 mots, répond à l'intention, place le mot-clé principal." },
      { id: "s2", level: "h2", title: "Guide d'achat", hint: "Critères de choix + réassurance." },
      { id: "s2a", level: "h3", title: "Critères de sélection", hint: "Ce qui distingue les produits de la catégorie." },
      { id: "s2b", level: "h3", title: "Erreurs à éviter", hint: "Points de vigilance côté acheteur." },
      { id: "s3", level: "h2", title: "FAQ", hint: "5–6 questions answer-first issues du People Also Ask." },
      { id: "s4", level: "h2", title: "Maillage interne", hint: "Liens vers sous-catégories et produits phares." },
    ],
    params: { tone: "Expert, orienté conversion", length: "800–1 200 mots", brandVoice: "Ton e-commerce", llm: "gpt-4o" },
    geo: {
      entities: ["Livraison", "Garantie", "Retour", "Guide des tailles", "Comparatif"],
      sources: ["Fiches produits internes", "Avis clients vérifiés"],
      questions: ["Comment choisir ?", "Quel est le meilleur rapport qualité/prix ?", "Quelles différences entre les gammes ?"],
      semanticDensity: 65,
    },
    steps: [
      { id: "a1", label: "Scraper la catégorie existante", hint: "{url_source}" },
      { id: "a2", label: "Extraire les entités manquantes vs concurrents", prompt: "Liste les entités absentes de {url_source} présentes chez {concurrents} sur {keyword_principal}." },
      { id: "a3", label: "Générer la nouvelle structure Hn" },
      { id: "a4", label: "Rédiger chapô + guide d'achat", prompt: "Rédige un chapô orienté conversion et un guide d'achat pour {keyword_principal} ({brand_voice})." },
      { id: "a5", label: "Générer la FAQ answer-first", prompt: "Génère 5 Q/R answer-first à partir du People Also Ask de {keyword_principal}." },
      { id: "a6", label: "Injecter le maillage interne" },
      { id: "a7", label: "Générer meta title / description" },
    ],
    usageCount: 98,
    updatedAt: "2026-06-24",
    version: 2,
  },

  /* 3 ─ Création de cluster thématique ────────────────────────────── */
  {
    id: "sys-cluster-thematique",
    name: "Création de cluster thématique",
    description:
      "Construit une page pilier et son maillage vers les articles satellites pour dominer un champ sémantique complet.",
    icon: "cluster",
    tags: ["SEO", "Cluster"],
    author: "Équipe AWi",
    visibility: "systeme",
    contexts: ["from_scratch"],
    pageType: "pilier",
    structure: [
      { id: "h1", level: "h1", title: "{keyword_principal} : le guide complet", hint: "H1 de la page pilier." },
      { id: "s1", level: "h2", title: "Définition & enjeux", hint: "Cadre le sujet, répond en answer-first." },
      { id: "s2", level: "h2", title: "Les sous-thématiques", hint: "Une section par article satellite du cluster." },
      { id: "s3", level: "h2", title: "Tableau de synthèse", hint: "Comparatif structuré, facilement extractible." },
      { id: "s4", level: "h2", title: "FAQ answer-first", hint: "Questions transversales du cluster." },
      { id: "s5", level: "h2", title: "Pour aller plus loin", hint: "Maillage vers les articles satellites." },
    ],
    params: { tone: "Pédagogique, autoritaire", length: "1 800–2 500 mots (pilier)", llm: "claude-sonnet" },
    geo: {
      entities: ["Définition", "Méthode", "Bénéfices", "Exemples", "Étapes"],
      sources: ["Études de référence", "Données sectorielles"],
      questions: ["Qu'est-ce que {keyword_principal} ?", "Comment ça marche ?", "Par où commencer ?"],
      semanticDensity: 70,
    },
    steps: [
      { id: "a1", label: "Rechercher le champ sémantique du cluster", prompt: "Cartographie le champ sémantique de {keyword_principal} et propose la page pilier + N articles satellites." },
      { id: "a2", label: "Définir pilier + articles satellites" },
      { id: "a3", label: "Générer la structure Hn du pilier" },
      { id: "a4", label: "Rédiger section par section" },
      { id: "a5", label: "Générer la FAQ answer-first" },
      { id: "a6", label: "Planifier le maillage pilier ↔ satellites" },
      { id: "a7", label: "Générer les meta de chaque page" },
    ],
    usageCount: 54,
    updatedAt: "2026-05-30",
    version: 1,
  },

  /* 4 ─ Refresh contenu décayé ────────────────────────────────────── */
  {
    id: "sys-refresh-decaye",
    name: "Refresh contenu décayé",
    description:
      "Réactualise un article en perte de trafic : diff vs top-cited pages, entités à ajouter, sections à réécrire, dates et sources.",
    icon: "refresh",
    tags: ["SEO", "Refresh", "Éditorial"],
    author: "Équipe AWi",
    visibility: "systeme",
    contexts: ["from_url_analysis"],
    pageType: "article",
    structure: [
      { id: "h1", level: "h1", title: "{keyword_principal} (mise à jour {annee})", hint: "H1 actualisé avec l'année." },
      { id: "s1", level: "h2", title: "Nouveautés {annee}", hint: "Ce qui a changé depuis la dernière version." },
      { id: "s2", level: "h2", title: "Sections à réécrire", hint: "Passages obsolètes détectés." },
      { id: "s3", level: "h2", title: "Entités à ajouter", hint: "{entites_cibles}" },
      { id: "s4", level: "h2", title: "FAQ actualisée", hint: "Questions récentes du People Also Ask." },
    ],
    params: { tone: "À jour, factuel", length: "Conserver ±10 % du volume", llm: "gpt-4o" },
    geo: {
      entities: [],
      sources: ["Données {annee}", "Sources primaires récentes"],
      questions: ["Qu'est-ce qui a changé en {annee} ?"],
      semanticDensity: 60,
    },
    steps: [
      { id: "a1", label: "Scraper la version actuelle", hint: "{url_source}" },
      { id: "a2", label: "Diff avec les top-cited pages", prompt: "Compare {url_source} aux pages les plus citées sur {keyword_principal} et liste les écarts." },
      { id: "a3", label: "Identifier les passages obsolètes" },
      { id: "a4", label: "Injecter les entités manquantes", hint: "{entites_cibles}" },
      { id: "a5", label: "Réécrire section par section" },
      { id: "a6", label: "Actualiser dates, chiffres et sources" },
      { id: "a7", label: "Regénérer les meta" },
    ],
    usageCount: 76,
    updatedAt: "2026-06-27",
    version: 2,
  },

  /* 5 ─ GEO uplift · AI Overviews ─────────────────────────────────── */
  {
    id: "sys-geo-uplift",
    name: "GEO uplift · AI Overviews",
    description:
      "Optimise une page pour être citée dans les réponses IA : réponse directe answer-first, preuves citables, format extractible.",
    icon: "sparkles",
    tags: ["GEO", "SEO"],
    author: "Équipe AWi",
    visibility: "systeme",
    contexts: ["from_scratch", "from_url_analysis"],
    pageType: "generique",
    structure: [
      { id: "h1", level: "h1", title: "{keyword_principal}", hint: "H1 clair, aligné sur le prompt cible." },
      { id: "s1", level: "h2", title: "Réponse directe", hint: "Answer-first en 40–60 mots, citable telle quelle." },
      { id: "s2", level: "h2", title: "Détails & preuves", hint: "Données chiffrées, sources autoritaires citées." },
      { id: "s3", level: "h2", title: "Questions associées", hint: "Réponds aux prompts où la page devrait être citée : {prompts_cibles}." },
      { id: "s4", level: "h2", title: "Tableau de synthèse", hint: "Format structuré facilement extractible par les LLM." },
    ],
    params: { tone: "Answer-first, citable", length: "Modulable", llm: "perplexity" },
    geo: {
      entities: [],
      sources: ["Sources primaires", "Données officielles"],
      questions: ["{prompts_cibles}"],
      semanticDensity: 75,
    },
    steps: [
      { id: "a1", label: "Analyser les prompts cibles", prompt: "Analyse les prompts où {url_source} devrait être citée : {prompts_cibles}." },
      { id: "a2", label: "Identifier le format de réponse attendu", hint: "AI Overviews, encadré, liste, tableau." },
      { id: "a3", label: "Rédiger la réponse directe answer-first" },
      { id: "a4", label: "Ajouter preuves + sources citables" },
      { id: "a5", label: "Structurer en tableau / liste extractible" },
      { id: "a6", label: "Vérifier la densité d'entités", hint: "{entites_cibles}" },
      { id: "a7", label: "Générer schema + meta" },
    ],
    usageCount: 63,
    updatedAt: "2026-06-29",
    version: 1,
  },

  /* ── Exemples Équipe / Perso (pour peupler la bibliothèque) ──────── */
  {
    id: "team-comparatif-b2b",
    name: "Comparatif SaaS B2B",
    description:
      "Article comparatif structuré pour un achat B2B considéré : critères, tableau, cas d'usage, verdict.",
    icon: "scale",
    tags: ["SEO", "B2B"],
    author: "Marie Lefèvre",
    visibility: "equipe",
    contexts: ["from_scratch"],
    pageType: "comparatif",
    structure: [
      { id: "h1", level: "h1", title: "{keyword_principal} : comparatif {annee}", hint: "H1 comparatif daté." },
      { id: "s1", level: "h2", title: "Critères de comparaison", hint: "Ce qui compte vraiment pour l'acheteur B2B." },
      { id: "s2", level: "h2", title: "Tableau comparatif", hint: "Format extractible, une ligne par solution." },
      { id: "s3", level: "h2", title: "Cas d'usage", hint: "Quelle solution pour quel besoin." },
      { id: "s4", level: "h2", title: "Verdict & recommandation", hint: "Réponse answer-first." },
    ],
    params: { tone: "Neutre, expert", length: "1 500–2 000 mots", llm: "claude-sonnet" },
    geo: {
      entities: ["Prix", "Intégrations", "Support", "Sécurité", "ROI"],
      sources: ["Avis G2 / Capterra", "Documentation officielle"],
      questions: ["Quelle est la meilleure solution ?", "Combien ça coûte ?"],
      semanticDensity: 68,
    },
    steps: [
      { id: "a1", label: "Sélectionner les solutions à comparer" },
      { id: "a2", label: "Définir les critères" },
      { id: "a3", label: "Générer le tableau comparatif" },
      { id: "a4", label: "Rédiger cas d'usage + verdict" },
      { id: "a5", label: "Générer les meta" },
    ],
    usageCount: 12,
    updatedAt: "2026-06-20",
    version: 1,
  },
  {
    id: "perso-fiche-produit",
    name: "Fiche produit optimisée",
    description:
      "Fiche produit e-commerce riche : bénéfices, caractéristiques, réassurance, FAQ answer-first.",
    icon: "package",
    tags: ["E-commerce", "SEO"],
    author: "Alex Smith",
    visibility: "perso",
    contexts: ["from_scratch", "from_url_analysis"],
    pageType: "produit",
    structure: [
      { id: "h1", level: "h1", title: "{keyword_principal}", hint: "Nom produit + bénéfice clé." },
      { id: "s1", level: "h2", title: "Bénéfices", hint: "Ce que le produit apporte, pas seulement ses specs." },
      { id: "s2", level: "h2", title: "Caractéristiques", hint: "Specs structurées." },
      { id: "s3", level: "h2", title: "FAQ", hint: "Questions d'achat answer-first." },
    ],
    params: { tone: "Vendeur, concret", length: "500–800 mots", llm: "gpt-4o" },
    geo: {
      entities: ["Matière", "Dimensions", "Entretien", "Livraison", "Garantie"],
      sources: ["Fiche technique fournisseur"],
      questions: ["Quelle taille choisir ?", "Comment l'entretenir ?"],
      semanticDensity: 55,
    },
    steps: [
      { id: "a1", label: "Extraire les caractéristiques produit" },
      { id: "a2", label: "Rédiger bénéfices + description" },
      { id: "a3", label: "Générer la FAQ answer-first" },
      { id: "a4", label: "Générer les meta" },
    ],
    usageCount: 7,
    updatedAt: "2026-06-15",
    version: 1,
    updateAvailable: true,
  },
];

/* ── Helpers ─────────────────────────────────────────────────────────── */

export function getTemplates(): WorkflowTemplate[] {
  return TEMPLATES;
}

export function getTemplate(id: string): WorkflowTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

/** Ordre de priorité d'affichage : système d'abord, puis agence/équipe/perso. */
export const VISIBILITY_ORDER: TemplateVisibility[] = ["systeme", "agence", "equipe", "perso"];

export function sortTemplates(list: WorkflowTemplate[]): WorkflowTemplate[] {
  return [...list].sort((a, b) => {
    const va = VISIBILITY_ORDER.indexOf(a.visibility);
    const vb = VISIBILITY_ORDER.indexOf(b.visibility);
    if (va !== vb) return va - vb;
    return b.usageCount - a.usageCount;
  });
}
