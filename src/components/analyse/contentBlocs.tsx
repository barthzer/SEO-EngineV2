import type { BlocDef } from "@/components/BlocCard";

/**
 * contentBlocs — les 4 blocs stratégiques de création de contenu.
 *
 * Source unique partagée entre la Vue d'ensemble (aperçu) et l'onglet
 * "Créer du contenu" (page dédiée). Paramétré par le domaine (pour les CTA)
 * et un handler `onNewBrief` (pour le bloc "Créer page from scratch").
 *
 * Chaque bloc porte une illustration complète (`/blocs/*.svg`).
 */
export function contentBlocs(domain: string, opts: { onNewBrief: () => void }): BlocDef[] {
  const d = encodeURIComponent(domain);
  return [
    {
      title: "Optimiser les pages existantes",
      description: "Scoring auto, priorisation, analyse d'optimisation",
      features: ["Analyse EMC par page", "Score sémantique", "Maillage interne", "Balises meta & titres", "Core Web Vitals"],
      illustration: "/blocs/optimiser.svg",
      cta: `/analyse/${d}?tab=briefs`,
    },
    {
      title: "Identifier les pages manquantes",
      description: "Moteur EMC : détecte thématiques non couvertes",
      features: ["Analyse concurrentielle", "Gaps de mots-clés", "Pages intermédiaires", "Cocon sémantique", "Intentions de recherche"],
      illustration: "/blocs/page-manquante.svg",
      cta: `/analyse/${d}?tab=recommandations`,
    },
    {
      title: "Créer une nouvelle page",
      description: "Mot-clé + type de page, filtre SERP automatique",
      features: ["Recherche de mots-clés", "Analyse IA complète", "Structure d'URL", "Maillage cible", "Calendrier éditorial"],
      illustration: "/blocs/from-scratch.svg",
      cta: `/analyse/${d}?tab=creation`,
    },
    {
      title: "Identifiez les actions GEO",
      description: "Optimisation pour les réponses IA à plus fort potentiel de visibilité",
      features: ["Optimisation réponses IA", "Structured data", "Signaux E-E-A-T", "Sources & citations", "Couverture thématique"],
      illustration: "/blocs/geo.svg",
      cta: `/analyse/${d}?tab=geo`,
    },
  ];
}
