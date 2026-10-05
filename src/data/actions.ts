/**
 * Actions (opportunités à mener) — contrat de type + mock.
 *
 * Sorti de `src/components/analyse/OpportunitesView.tsx` pour le handoff back
 * (voir HANDOFF.md). Contrat = `Opportunity`. Aussi consommé par le Suivi.
 * La vraie requête ira dans `src/db/queries/actions.ts` avec fallback mock.
 */

import { type ActionOwner, type ActionPriorityLevel } from "@/components/ActionCard";
import { type Status } from "@/components/StatusPill";
import { type RiskInfo } from "@/data/risk";

export type ActionModule = "onpage" | "contenu" | "netlinking" | "technique" | "geo";

/** Owners alignés sur TEAM (/equipe) — mêmes seeds pravatar que le reste de l'app. */
export const OWNERS: Record<string, ActionOwner> = {
  bl: { id: "bl", name: "Barthélemy L.", initials: "BL", photoSeed: "barthelemy-l-seo" },
  sm: { id: "sm", name: "Sophie M.",     initials: "SM", photoSeed: "5" },
  tl: { id: "tl", name: "Thomas L.",     initials: "TL", photoSeed: "thomas-l-seo" },
  mp: { id: "mp", name: "Marie P.",      initials: "MP", photoSeed: "marie-p-seo" },
};

export type Opportunity = {
  id: string;
  module: ActionModule;
  priority: ActionPriorityLevel;
  title: string;
  description: string;
  rationale: string;
  steps?: string[];
  time?: string;
  impact?: string;
  ownerKey?: keyof typeof OWNERS;
  deadline?: string;
  status: Status;
  /** Niveau de risque hérité de la recommandation d'origine (Cannibalisation, Audit
   *  technique…), voir `src/data/risk.ts`. Absent = réversible. */
  risk?: RiskInfo;
};

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "o1", module: "onpage", priority: "high", status: "todo",
    title: "Réécrire les balises title des 8 pages en page 2",
    description: "8 pages positionnées #11 à #20 avec un CTR sous la médiane. Une title plus incitative peut les faire basculer en page 1.",
    rationale: "Les pages en page 2 captent presque tout leur potentiel de trafic dès qu'elles passent en page 1. Agir sur la title est le levier le plus rapide et le moins coûteux pour déclencher ce basculement.",
    steps: ["Extraire les 8 requêtes cibles depuis la GSC", "Réécrire chaque title avec le mot-clé en tête et un bénéfice", "Vérifier la longueur (moins de 60 caractères) et l'unicité", "Redéployer et suivre la position sur 3 semaines"],
    time: "2 h", impact: "+8 à +12 positions estimées", ownerKey: "sm", deadline: "2026-07-08",
  },
  {
    id: "o2", module: "contenu", priority: "high", status: "todo",
    title: "Créer l'article \"ROI content marketing B2B\"",
    description: "Trou de couverture identifié par l'analyse EMC : forte demande, aucun contenu propriétaire. Les concurrents sont tous positionnés.",
    rationale: "La demande existe et aucun contenu propriétaire ne la capte aujourd'hui. Créer cette page nous positionne sur une requête à fort volume avant que les concurrents ne consolident leur avance.",
    time: "6 h", impact: "+1 200 visites/mois estimées", ownerKey: "mp", deadline: "2026-07-15",
  },
  {
    id: "o3", module: "technique", priority: "high", status: "in_progress",
    title: "Corriger les 87 pages en erreur 404 dans le sitemap",
    description: "Le sitemap déclare 87 URLs qui renvoient un 404. Gaspillage de budget de crawl et signal de qualité négatif.",
    rationale: "Chaque 404 déclarée dans le sitemap gaspille du budget de crawl et dégrade la confiance de Google dans le site. Le correctif est rapide, sans risque, et débloque le crawl des pages utiles.",
    time: "3 h", impact: "Budget de crawl récupéré", ownerKey: "tl", deadline: "2026-07-03",
  },
  {
    id: "o4", module: "netlinking", priority: "mid", status: "todo",
    title: "Acquérir 3 backlinks DR 50+ sur le cluster \"tarifs\"",
    description: "La page tarifs plafonne faute d'autorité entrante. Cibler 3 médias B2B pour un lien contextuel.",
    rationale: "La page tarifs convertit bien mais manque d'autorité pour ranker sur ses requêtes commerciales. Quelques liens contextuels de qualité suffisent souvent à débloquer sa progression.",
    time: "5 h", impact: "+3 RefDom haute autorité", ownerKey: "bl", deadline: "2026-07-22",
  },
  {
    id: "o5", module: "geo", priority: "high", status: "todo",
    title: "Optimiser la page \"comparatif\" pour les réponses IA",
    description: "La marque est absente des réponses ChatGPT et Perplexity sur la requête comparatif, alors que 3 concurrents y sont cités.",
    rationale: "Les réponses IA deviennent une source de trafic clé et la marque en est absente sur une requête commerciale à forte intention. Structurer la page pour la rendre citable capte ce nouveau canal.",
    steps: ["Structurer la page en questions/réponses explicites", "Ajouter un tableau comparatif balisé", "Intégrer des données chiffrées citables", "Re-tester les prompts cibles à J+15"],
    time: "4 h", impact: "Entrée dans le top 3 des citations", ownerKey: "sm", deadline: "2026-07-18",
  },
  {
    id: "o6", module: "onpage", priority: "mid", status: "in_progress",
    title: "Ajouter un maillage interne vers les 5 pages piliers",
    description: "Pages piliers sous-maillées (moins de 4 liens internes). Renforcer depuis les articles de blog à fort trafic.",
    rationale: "Le maillage interne concentre l'autorité sur les pages stratégiques. C'est une action à faible effort dont l'effet se cumule sur l'ensemble du cocon sémantique.",
    time: "2 h", impact: "Distribution du PageRank interne", ownerKey: "mp", deadline: "2026-07-10",
  },
  {
    id: "o7", module: "contenu", priority: "mid", status: "blocked_client",
    title: "Refondre la page \"À propos\" (E-E-A-T)",
    description: "Manque de signaux d'expertise et d'autorité. En attente des bios équipe et des certifications côté client.",
    rationale: "Les signaux E-E-A-T pèsent sur la confiance perçue par Google et par les moteurs IA, surtout sur un secteur concurrentiel où l'autorité fait la différence.",
    time: "3 h", impact: "Signaux E-E-A-T renforcés", ownerKey: "bl", deadline: "2026-07-25",
  },
  {
    id: "o8", module: "technique", priority: "mid", status: "todo",
    title: "Améliorer le LCP mobile sous 2,5 s",
    description: "LCP mobile à 3,8 s sur les templates produit. Précharger l'image hero et différer le JS non critique.",
    rationale: "Un LCP mobile élevé pénalise à la fois le classement et le taux de rebond. Le gain est mesurable, durable, et profite à toutes les pages partageant le template.",
    time: "4 h", impact: "Core Web Vitals au vert", ownerKey: "tl", deadline: "2026-07-30",
  },
  {
    id: "o9", module: "geo", priority: "mid", status: "todo",
    title: "Publier une FAQ balisée sur les 4 requêtes IA prioritaires",
    description: "Les moteurs IA privilégient les formats question/réponse. Couvrir 4 questions récurrentes non traitées aujourd'hui.",
    rationale: "Le format question/réponse est le plus repris par les moteurs IA. Couvrir les questions manquantes multiplie mécaniquement les occasions d'être cité.",
    time: "3 h", impact: "Nouvelles occasions de citation", ownerKey: "sm", deadline: "2026-08-05",
  },
  {
    id: "o10", module: "netlinking", priority: "low", status: "todo",
    title: "Nettoyer 18 backlinks toxiques (disavow)",
    description: "18 domaines DR inférieur à 10 à thématique douteuse repérés via Majestic. Fichier de désaveu à soumettre.",
    rationale: "Un profil de liens sain protège le site des filtres algorithmiques. Le nettoyage est préventif, peu coûteux, et évite une pénalité bien plus difficile à corriger.",
    time: "1 h", impact: "Profil de liens assaini", ownerKey: "bl", deadline: "2026-08-12",
  },
  {
    id: "o11", module: "contenu", priority: "low", status: "todo",
    title: "Mettre à jour les 12 articles obsolètes (> 18 mois)",
    description: "12 articles à trafic déclinant. Rafraîchir les données, les exemples et l'année cible pour relancer la pertinence.",
    rationale: "Rafraîchir un contenu existant coûte bien moins cher qu'en créer un nouveau et relance souvent un trafic en déclin en quelques semaines.",
    time: "5 h", impact: "Trafic historique préservé", ownerKey: "mp", deadline: "2026-08-20",
  },
  {
    id: "o12", module: "netlinking", priority: "high", status: "todo",
    title: "Décrocher un backlink presse sur Les Échos",
    description: "Les Échos lie 3 concurrents mais pas la marque. Cible presse à très forte autorité pour un lien contextuel.",
    rationale: "Un lien depuis un média de premier plan comme Les Échos apporte une autorité difficile à obtenir autrement et bénéficie à l'ensemble du domaine. C'est le levier le plus impactant du profil de liens.",
    steps: ["Identifier le desk économie / tech pertinent", "Préparer une donnée exclusive ou une tribune d'expert", "Pitcher l'angle GEO / IA générative", "Suivre la publication et la valeur du lien obtenu"],
    time: "2 sem", impact: "+1 RefDom très haute autorité", ownerKey: "bl", deadline: "2026-08-01",
  },
  {
    id: "o13", module: "technique", priority: "mid", status: "todo",
    title: "Rediriger /services/ vers /audit-seo/",
    description: "Cannibalisation sur « audit seo » : /services/ capte 9 % des clics en position 14 et dilue la page principale.",
    rationale: "Deux pages se disputent la même requête. Rediriger la page faible concentre les signaux sur /audit-seo/, qui est déjà en page 1.",
    steps: ["Vérifier les liens internes qui pointent vers /services/", "Mettre en place la 301 vers /audit-seo/", "Mettre à jour le maillage et le sitemap", "Suivre la position sur « audit seo » pendant 4 semaines"],
    time: "1 h", impact: "+8 clics / mois récupérés", ownerKey: "tl",
    risk: {
      level: "costly",
      undo: "La page redirigée disparaît pour Google. Revenir en arrière demande de retirer la 301 et d'attendre plusieurs semaines de recrawl : une partie du signal est perdue entre-temps.",
      evidence: "/services/ ne capte que 9 % des clics (position 14,2) et répond à la même intention que /audit-seo/.",
    },
  },
  {
    id: "o14", module: "technique", priority: "low", status: "todo",
    title: "Désindexer les 38 pages de tags sans trafic",
    description: "38 pages de tags n'ont reçu aucun clic en 12 mois. Elles consomment du budget de crawl et diluent la qualité perçue du site.",
    rationale: "Retirer de l'index les pages sans valeur recentre Google sur les contenus utiles. L'opération est massive : elle se décide en connaissance de cause.",
    time: "30 min", impact: "Budget de crawl recentré", ownerKey: "tl",
    risk: {
      level: "irreversible",
      undo: "38 pages sortent de l'index d'un coup. Les réindexer ne restaure ni leurs positions ni leur historique, et Google peut mettre des mois à les reprendre.",
      evidence: "Les 38 pages de tags n'ont reçu aucun clic et moins de 5 impressions chacune sur 12 mois (Search Console).",
    },
  },
];
