/**
 * Audit Éditorial / Sémantique — contrat de type + mock.
 *
 * Sorti de `src/components/AuditEditorialTab.tsx` pour le handoff back (voir HANDOFF.md).
 * Contrats = `Issue`, `TagData`. Vraie requête → `src/db/queries/audit-editorial.ts`.
 */

export type Dimension = "eeat" | "soseo" | "suropt" | "intent" | "hn" | "canib";
export type Severity  = "critique" | "important" | "moyen";

export type IssueUrl = { url: string; clicks?: number | null; impr: string; tag?: string };
export type Issue = {
  id: string; label: string; pages: number; visits: string | null;
  severity: Severity; dimension: Dimension;
  description: string; fix: string; urls?: IssueUrl[];
};

/* ── Issues ───────────────────────────────────────────────────────────── */

export const ISSUES: Issue[] = [
  /* ── CRITIQUE ── */
  {
    id: "toxic-cat", label: "Expressions sur-optimisées présentes",
    pages: 3, visits: "17", severity: "critique", dimension: "suropt",
    description: "3 pages avec 30 expressions sur-optimisées (10.0 par page en moyenne). Ratio jugé toxique par les algorithmes de pertinence sémantique de Google.",
    fix: "Réduire les occurrences des mots listés. Cibler une densité de 1.5–2× la médiane SERP par expression.",
    urls: [
      { url: "/agence-marketing-digital-tourisme-voyage/", clicks: 17,   impr: "54.1k", tag: "Top trafic" },
      { url: "/agence-marketing-digital-sante/",          clicks: null,  impr: "41k",   tag: "Top trafic" },
      { url: "/formation/formation-seo/",                 clicks: null,  impr: "6.4k",  tag: "Formation"  },
    ],
  },
  {
    id: "kw-absent", label: "Mot-clé cible absent",
    pages: 3, visits: "17", severity: "critique", dimension: "soseo",
    description: "3 pages avec mot-clé cible absent vs la médiane SERP — signal de pertinence à ajuster. Google attend au minimum une occurrence dans le title, le H1 et le premier paragraphe.",
    fix: "Intégrer le mot-clé cible en title + H1 + premier paragraphe avec une densité proche de la médiane SERP.",
    urls: [
      { url: "/agence-marketing-digital-tourisme-voyage/", clicks: 17,   impr: "54.1k", tag: "Top trafic" },
      { url: "/agence-marketing-digital-sante/",          clicks: null,  impr: "41k",   tag: "Top trafic" },
      { url: "/formation/formation-seo/",                 clicks: null,  impr: "6.4k",  tag: "Formation"  },
    ],
  },
  /* ── IMPORTANT ── */
  {
    id: "eeat-1", label: "Signaux E-E-A-T insuffisants",
    pages: 9, visits: "1,4k", severity: "important", dimension: "eeat",
    description: "9 pages avec 0.6/3 signaux E-E-A-T détectés en moyenne — risque Core Update élevé. Google valorise désormais la traçabilité auteur, la fraîcheur et la richesse multimédia.",
    fix: "Ajouter une byline auteur visible, une date de publication/MAJ, et enrichir avec chiffres + images (≥ 800 mots, ≥ 1 image / 1000 mots).",
    urls: [
      { url: "/",                                                         clicks: 1528, impr: "173.6k", tag: "Top trafic" },
      { url: "/agence-marketing-digital-tourisme-voyage/",                clicks: 17,   impr: "54.1k",  tag: "Top trafic" },
      { url: "/agence-marketing-digital-b2b/",                           clicks: 7,    impr: "75k",    tag: "Top trafic" },
      { url: "/analyse-de-logs-seo-10-bonnes-raisons-de-les-exploiter/", clicks: 4,    impr: "8.9k"  },
      { url: "/agence-seo-mirakl/",                                       clicks: 2,    impr: "9.6k"  },
      { url: "/seo-et-erreur-404-le-guide-pratique/",                     clicks: 2,    impr: "6.4k"  },
      { url: "/agence-marketing-digital-mode-pret-a-porter/",             clicks: null, impr: "8k",    tag: "Top trafic" },
      { url: "/agence-marketing-digital-sante/",                         clicks: null, impr: "41k",   tag: "Top trafic" },
      { url: "/seo-salesforce-commerce-cloud/",                          clicks: null, impr: "22.8k" },
    ],
  },
  {
    id: "toxic-long", label: "Expressions sur-optimisées présentes (long tail)",
    pages: 7, visits: "1,3k", severity: "important", dimension: "suropt",
    description: "7 pages avec 68 expressions sur-optimisées (9.7 par page en moyenne). Sur-optimisation lexicale détectable par les modèles BERT/MUM.",
    fix: "Réduire les occurrences des mots identifiés comme toxiques sur chaque URL impactée.",
  },
  {
    id: "soseo", label: "SOSEO inférieur à la moyenne top 3",
    pages: 3, visits: "1,3k", severity: "important", dimension: "soseo",
    description: "3 pages avec SOSEO inférieur à la moyenne top 3 de 25 points en moyenne — optimisation sémantique insuffisante.",
    fix: "Enrichir le champ lexical SERP (termes manquants YTG) pour rattraper les top 3.",
  },
  {
    id: "intent", label: "Type de page différent de l'intent SERP dominante",
    pages: 2, visits: "17", severity: "important", dimension: "intent",
    description: "2 pages avec un type qui ne correspond pas à l'intention SERP majoritaire — risque majeur de perte de ranking.",
    fix: "Refondre la page pour matcher l'intent SERP majoritaire (ex. commercial → informationnel ou inverse).",
    urls: [
      { url: "/agence-marketing-digital-tourisme-voyage/", clicks: 17,   impr: "54.1k", tag: "Top trafic" },
      { url: "/agence-marketing-digital-sante/",          clicks: null,  impr: "41k",   tag: "Top trafic" },
    ],
  },
  {
    id: "dseo-1", label: "DSEO trop élevé vs concurrents top 5",
    pages: 4, visits: "13", severity: "important", dimension: "suropt",
    description: "4 pages avec DSEO 7.4× au-dessus des top 5 — risque de sur-optimisation détecté par Google.",
    fix: "Réduire la densité des termes sur-optimisés (word_gaps.over_optimized).",
  },
  {
    id: "hn", label: "Structure Hn insuffisante",
    pages: 2, visits: "4", severity: "important", dimension: "hn",
    description: "2 pages présentent une hiérarchie Hn déséquilibrée : H2/H3 manquants ou mal articulés — lecture algorithmique dégradée.",
    fix: "Compléter avec H2 thématiques (≥ 4) et H3 imbriqués pour structurer le contenu.",
    urls: [
      { url: "/agence-seo-mirakl/",                   clicks: 2, impr: "9.6k" },
      { url: "/seo-et-erreur-404-le-guide-pratique/", clicks: 2, impr: "6.4k" },
    ],
  },
  /* ── MOYEN ── */
  {
    id: "dseo-2", label: "DSEO trop élevé vs concurrents top 5 (catégorie 2)",
    pages: 2, visits: "17", severity: "moyen", dimension: "suropt",
    description: "2 pages avec DSEO 1.1× au-dessus des top 5 — risque de sur-optimisation détecté par Google.",
    fix: "Réduire la densité des termes sur-optimisés.",
  },
  {
    id: "canib", label: "Cannibalisation SERP GSC",
    pages: 2, visits: "2", severity: "moyen", dimension: "canib",
    description: "2 requêtes avec cannibalisation medium — 2 clics/mois à risque entre deux pages se positionnant sur la même intention.",
    fix: "Arbitrer (merge 301, réassigner l'intent, ou supprimer) les pages en conflit — voir l'onglet Cannibalisation.",
  },
  {
    id: "serpmantics", label: "Score sémantique global Serpmantics faible",
    pages: 1, visits: "2", severity: "moyen", dimension: "soseo",
    description: "1 page avec un score Serpmantics moyen de 60/100 — contenu jugé faible vs concurrents.",
    fix: "Enrichir les sections faibles (structure_recommendations et expressions_add).",
  },
  {
    id: "kw-overdensity", label: "Mot-clé cible sur-densité",
    pages: 1, visits: "4", severity: "moyen", dimension: "soseo",
    description: "1 page avec mot-clé cible en sur-densité vs la médiane SERP — signal de pertinence à ajuster (paradoxalement perçu comme spam).",
    fix: "Intégrer le mot-clé avec une densité proche de la médiane SERP.",
  },
  {
    id: "toxic-low", label: "Expressions sur-optimisées (faible volume)",
    pages: 1, visits: "4", severity: "moyen", dimension: "suropt",
    description: "1 page avec 3 expressions sur-optimisées (3.0 par page en moyenne).",
    fix: "Réduire les occurrences des mots identifiés comme toxiques.",
  },
  {
    id: "eeat-2", label: "Signaux E-E-A-T insuffisants (catégorie 2)",
    pages: 2, visits: "2", severity: "moyen", dimension: "eeat",
    description: "2 pages avec 2.0/3 signaux E-E-A-T détectés en moyenne — risque Core Update modéré.",
    fix: "Ajouter une byline auteur visible, une date de publication/MAJ et enrichir avec chiffres + images.",
  },
];

/* ── Tags ─────────────────────────────────────────────────────────────── */

export type TagData = {
  label: string; count: number; pct: number;
  visitsAtRisk: string; headlineEm: string; headlineTail: string;
  sub: string; score: number; grade: string;
  issues: string[];
  verdictBlocker: string; verdictOpp: string; verdictCov: string;
  dims: Record<Dimension, number>;
};

export const LOTS: Record<string, TagData> = {
  all: {
    label: "Tous les lots", count: 11, pct: 8,
    visitsAtRisk: "4,1k", headlineEm: "−4.1k visites/mois", headlineTail: "menacées\npar 9 signaux E-E-A-T faibles.",
    sub: "Neuf pages manquent de signaux d'expertise et d'autorité, mettant en danger 1 361 visites par mois. Priorité avant le prochain Core Update : enrichir le contenu et expliciter les sources.",
    score: 62, grade: "C",
    issues: ["toxic-cat","kw-absent","eeat-1","toxic-long","soseo","intent","dseo-1","hn","dseo-2","canib","serpmantics","kw-overdensity","toxic-low","eeat-2"],
    verdictBlocker: "9 pages sans signaux E-E-A-T explicites — risque direct de chute de trafic au prochain Core Update Google. Concerne 1,4k visites/mois.",
    verdictOpp: "Réduire la sur-optimisation lexicale sur les 3 pages catégorie : signal de pertinence ajusté — potentiel +20% de visibilité sur les requêtes commerciales.",
    verdictCov: "11 pages éditoriales analysées sur les 133 du site. Périmètre limité aux pages stratégiques importées dans Recommandation de page.",
    dims: { eeat: 35, soseo: 68, suropt: 42, intent: 82, hn: 75, canib: 88 },
  },
  "cat-jean": {
    label: "Catégorie Jean", count: 3, pct: 2,
    visitsAtRisk: "980", headlineEm: "−980 visites/mois", headlineTail: "à risque sur la\ncatégorie Jean.",
    sub: "Les 3 pages catégorie Jean cumulent 30 expressions sur-optimisées et un DSEO 7.4× au-dessus des concurrents top 5. Risque de sur-optimisation détecté par Google.",
    score: 48, grade: "D",
    issues: ["toxic-cat","kw-absent","dseo-1"],
    verdictBlocker: "30 expressions sur-optimisées détectées sur les 3 pages — densité jugée toxique par les modèles BERT/MUM.",
    verdictOpp: "Réintroduire le mot-clé cible en title, H1 et premier paragraphe sur les 3 pages — gain attendu : retour dans le top 10 SERP.",
    verdictCov: "3 pages catégorie Jean analysées · 100% du tag couvert.",
    dims: { eeat: 70, soseo: 30, suropt: 18, intent: 65, hn: 80, canib: 95 },
  },
  "top-trafic": {
    label: "Top pages trafic", count: 5, pct: 4,
    visitsAtRisk: "3,2k", headlineEm: "−3.2k visites/mois", headlineTail: "sur vos 5 pages\nles plus fortes.",
    sub: "Vos 5 pages top trafic sont aussi les plus à risque : 100% présentent des signaux E-E-A-T insuffisants, et 3 ont des expressions sur-optimisées. Priorité absolue.",
    score: 55, grade: "C",
    issues: ["toxic-cat","kw-absent","eeat-1","toxic-long","intent"],
    verdictBlocker: "5 pages à 1 528 + 17 + 7 + 0 + 0 clics/mois — toutes manquent d'auteur visible, date de MAJ et richesse multimédia.",
    verdictOpp: "Ajouter les 3 signaux E-E-A-T (auteur / date / images) sur ces 5 pages = +20% de visibilité estimée au prochain Core Update.",
    verdictCov: "5 pages top trafic · cumulent 73% du trafic SEO du site.",
    dims: { eeat: 22, soseo: 65, suropt: 50, intent: 70, hn: 85, canib: 92 },
  },
  "ymyl": {
    label: "Pages YMYL", count: 2, pct: 1.5,
    visitsAtRisk: "460", headlineEm: "−460 visites/mois", headlineTail: "sur le périmètre\nYour Money Your Life.",
    sub: "Les pages YMYL exigent une qualité E-E-A-T renforcée. Vos 2 pages n'ont aucune mention d'auteur ni source citée — un risque algorithmique élevé.",
    score: 38, grade: "D",
    issues: ["eeat-1","eeat-2","soseo"],
    verdictBlocker: "0 mention d'auteur sur les 2 pages YMYL — le facteur le plus pénalisant pour les sujets sensibles.",
    verdictOpp: "Ajouter une bio auteur experte + références scientifiques sur les 2 pages YMYL : priorité absolue.",
    verdictCov: "2 pages YMYL identifiées · 100% du tag couvert.",
    dims: { eeat: 18, soseo: 52, suropt: 88, intent: 90, hn: 65, canib: 100 },
  },
  "formation": {
    label: "Formation & services", count: 4, pct: 3,
    visitsAtRisk: "850", headlineEm: "−850 visites/mois", headlineTail: "sur le tag\nFormation & services.",
    sub: "4 pages formation présentent une sur-optimisation modérée et un SOSEO inférieur de 25 points au top 3 SERP. Le mot-clé cible est mal placé.",
    score: 64, grade: "C",
    issues: ["toxic-cat","kw-absent","soseo","toxic-low"],
    verdictBlocker: "SOSEO −25 points vs top 3 sur 3 des 4 pages formation — champ lexical SERP insuffisamment couvert.",
    verdictOpp: "Enrichir avec termes manquants YTG + intégrer le mot-clé cible en intro = retour potentiel dans le top 5.",
    verdictCov: "4 pages formation/services · 100% du tag couvert.",
    dims: { eeat: 65, soseo: 42, suropt: 55, intent: 88, hn: 80, canib: 100 },
  },
  "case-studies": {
    label: "Case studies", count: 3, pct: 2,
    visitsAtRisk: "120", headlineEm: "Périmètre case studies", headlineTail: "globalement sain.",
    sub: "Les 3 case studies sont en bonne santé éditoriale : structure Hn correcte, intent SERP aligné, mais 2 ont des problèmes de cannibalisation entre elles.",
    score: 78, grade: "B",
    issues: ["canib","hn"],
    verdictBlocker: "2 case studies en cannibalisation sur la même requête commerciale — clics dilués entre 2 URLs.",
    verdictOpp: "Merge 301 ou réassignation d'intent sur les 2 pages : voir l'onglet Cannibalisation.",
    verdictCov: "3 case studies · 100% du tag couvert.",
    dims: { eeat: 75, soseo: 80, suropt: 92, intent: 85, hn: 70, canib: 60 },
  },
};
