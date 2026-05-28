/**
 * Mock token → projet pour le portail client C2.
 *
 * Le portail client expose à un client (Sephora, Doctolib, ...) une version
 * simplifiée de l'app : 5 vues, lecture seule, branding agence.
 *
 * En attendant la persistance Drizzle (B1b), on map des tokens hardcodés
 * vers des données projet client-facing. Les vrais tokens viendront de la
 * colonne `projects.client_share_token` du schema.
 */

export type SharedAction = {
  id: string;
  title: string;
  status: "livré" | "en cours" | "en attente";
  clientNarrative: string;
  owner: { name: string; photoSeed: string };
  date: string; // ISO
  evidenceUrl?: string;
  /** Mission confiée au client (inaccessible au consultant) — il pourra la
   *  marquer « fait » depuis le portail. */
  assignedToClient?: boolean;
};

export type SharedDeliverable = {
  id: string;
  type: "article" | "page" | "guide";
  title: string;
  url: string;
  targetKeyword: string;
  monthlyVolume: number;
  publishedAt: string; // ISO
  wordCount: number;
  owner: { name: string; photoSeed: string };
};

export type SharedReport = {
  id: string;
  month: string;        // "Mai 2026"
  publishedAt: string;  // ISO
  pages: number;        // nombre de pages du PDF
  fileSizeKb: number;
  pdfUrl?: string;      // url réelle si générée (sinon download = toast)
  summary: string;      // bref résumé du contenu
  highlights: string[]; // 3 points forts du mois
};

export type SharedConsultant = {
  name: string;
  role: string;
  email: string;
  phone: string;
  photoSeed: string;
};

export type SharedMeeting = {
  date: string;          // ISO
  topic: string;
};

export type SharedProject = {
  token: string;

  /** Branding de l'agence */
  agency: {
    name: string;
    accentColor: string;
    initials: string;
  };

  /** Identité client + projet */
  clientName: string;
  domain: string;
  period: string;
  intro: string;

  /** Maturité SEO */
  scoreTechnique: number;
  scoreContenu: number;
  scoreNetlinking: number;
  trafic: string;
  traficDir: "up" | "down" | "neutral";

  /** Données trafic enrichies pour le tableau de bord */
  traffic: {
    monthlyVisits: number;        // visites organiques ce mois
    monthlyDelta: number;         // delta vs mois précédent (visites ajoutées)
    history: number[];            // 6 derniers mois (du plus ancien au plus récent)
    historyLabels: string[];      // ["déc", "jan", ...]
  };

  /** KPIs business — ce qui parle vraiment au client (pas "actions livrées"). */
  businessMetrics: {
    /** Valeur monétaire du trafic ce mois — équivalent budget Ads. */
    trafficValue: {
      amountEur: number;
      deltaPct: number;   // ex. 12.4 pour +12,4%
    };
    /** Conversions attribuées au SEO — label custom selon vertical. */
    conversions: {
      count: number;
      /** Label personnalisé : "ventes", "leads", "RDV pris", etc. */
      label: string;
      deltaPct: number;
    };
    /** Mots-clés positionnés en page 1 de Google. */
    top10Keywords: {
      count: number;
      delta: number;  // delta brut (ex. +34)
    };
  };

  /** Top 5 pages performantes ce mois */
  topPages: {
    title: string;
    url: string;
    monthlyVisits: number;
    monthlyDelta: number;
  }[];

  /** Top mots-clés qui montent en position */
  risingKeywords: {
    keyword: string;
    positionBefore: number;
    positionAfter: number;
    monthlyVolume: number;
  }[];

  /** Stats globales */
  stats: {
    actionsLivrees: number;
    briefsPublies: number;
    impactClicsPotentiels?: number;
  };

  /** Sections */
  actionsDelivered: SharedAction[];
  actionsInProgress: SharedAction[];
  nextSteps: SharedAction[];
  deliverables: SharedDeliverable[];
  reports: SharedReport[];

  /** Consultant référent + agenda */
  consultant: SharedConsultant;
  upcomingMeetings: SharedMeeting[];
};

/* ─────────────────────────────────────────────────────────────────────
   MOCK DATA
   ───────────────────────────────────────────────────────────────────── */

const AGENCY = {
  name: "AWI Studio",
  accentColor: "#3D4FFF",
  initials: "AWI",
};

const SOPHIE = { name: "Sophie M.", photoSeed: "5" };
const BARTH  = { name: "Barthélemy L.", photoSeed: "barthelemy-l-seo" };
const MARIE  = { name: "Marie P.", photoSeed: "marie-p-seo" };

const SHARED_PROJECTS: Record<string, SharedProject> = {
  "demo-sephora": {
    token: "demo-sephora",
    agency: AGENCY,
    clientName: "Sephora",
    domain: "sephora.fr",
    period: "Mai 2026",
    intro:
      "Voici l'avancement de votre stratégie SEO pour le mois de mai. " +
      "Nous avons concentré nos efforts sur l'optimisation des pages parfums " +
      "et la consolidation de votre maillage interne sur les catégories soin.",
    scoreTechnique: 91,
    scoreContenu: 88,
    scoreNetlinking: 94,
    trafic: "+18 %",
    traficDir: "up",
    traffic: {
      monthlyVisits: 287_420,
      monthlyDelta: 43_864,
      history: [218_300, 232_100, 226_800, 241_300, 243_556, 287_420],
      historyLabels: ["déc", "jan", "fév", "mar", "avr", "mai"],
    },
    businessMetrics: {
      trafficValue:    { amountEur: 142_580, deltaPct: 22.4 },
      conversions:     { count: 1_248, label: "ventes attribuées", deltaPct: 18.7 },
      top10Keywords:   { count: 487, delta: 34 },
    },
    topPages: [
      { title: "Routine peau mixte — guide complet",   url: "https://www.sephora.fr/conseils/routine-peau-mixte",      monthlyVisits: 18_240, monthlyDelta: 12_400 },
      { title: "Top parfums femmes 2026",              url: "https://www.sephora.fr/parfums/femme",                    monthlyVisits: 32_180, monthlyDelta: 4_320  },
      { title: "Soin anti-âge — page catégorie",       url: "https://www.sephora.fr/soin-visage/anti-age",             monthlyVisits: 12_640, monthlyDelta: 3_180  },
      { title: "Comment choisir son parfum",           url: "https://www.sephora.fr/conseils/choisir-parfum-peau",     monthlyVisits: 9_870,  monthlyDelta: 2_410  },
      { title: "Maquillage tendance été 2026",         url: "https://www.sephora.fr/maquillage/tendance-ete-2026",     monthlyVisits: 7_330,  monthlyDelta: 1_980  },
    ],
    risingKeywords: [
      { keyword: "routine peau mixte",        positionBefore: 14, positionAfter: 4, monthlyVolume: 12_100 },
      { keyword: "parfum femme oriental",     positionBefore: 22, positionAfter: 9, monthlyVolume: 8_100  },
      { keyword: "soin anti-âge bio",         positionBefore: 18, positionAfter: 7, monthlyVolume: 5_400  },
      { keyword: "tendance maquillage été",   positionBefore: 11, positionAfter: 3, monthlyVolume: 5_200  },
      { keyword: "meilleur fond de teint mat",positionBefore: 16, positionAfter: 6, monthlyVolume: 4_300  },
    ],
    stats: {
      actionsLivrees: 9,
      briefsPublies: 4,
      impactClicsPotentiels: 14_280,
    },
    actionsDelivered: [
      {
        id: "d1",
        title: "Optimisation des balises title sur 24 pages parfums",
        status: "livré",
        clientNarrative:
          "Nous avons réécrit les balises title des 24 fiches parfums principales " +
          "pour intégrer les requêtes longue traîne identifiées dans l'audit. " +
          "Premier impact attendu sur les positions sous 4 semaines.",
        owner: SOPHIE,
        date: "2026-05-14",
        evidenceUrl: "https://www.sephora.fr/marques/m1",
      },
      {
        id: "d2",
        title: "Refonte du maillage interne — catégorie soin visage",
        status: "livré",
        clientNarrative:
          "Ajout de 47 liens contextuels entre les pages soin pour renforcer " +
          "l'autorité thématique de la catégorie. Les pages piliers reçoivent " +
          "désormais 3× plus de jus SEO interne.",
        owner: BARTH,
        date: "2026-05-09",
      },
      {
        id: "d3",
        title: "Publication brief « routine peau mixte »",
        status: "livré",
        clientNarrative:
          "Article guide de 2 400 mots publié sur le blog, ciblant un volume " +
          "de 12 100 recherches mensuelles. Aujourd'hui positionné en page 2, " +
          "objectif top 3 sous 8 semaines.",
        owner: MARIE,
        date: "2026-05-21",
        evidenceUrl: "https://www.sephora.fr/conseils/routine-peau-mixte",
      },
      {
        id: "d4",
        title: "Audit Core Web Vitals — 12 pages catégories",
        status: "livré",
        clientNarrative:
          "Identification des pages avec LCP > 2,5s et plan de remédiation " +
          "transmis à votre équipe technique. 8 pages corrigées à date.",
        owner: BARTH,
        date: "2026-05-03",
      },
      {
        id: "d5",
        title: "Optimisation des balises h1 — top 50 pages",
        status: "livré",
        clientNarrative:
          "Réécriture des h1 sur les 50 pages générant le plus de trafic, " +
          "pour aligner intention de recherche et structure éditoriale.",
        owner: SOPHIE,
        date: "2026-05-18",
      },
    ],
    actionsInProgress: [
      {
        id: "p1",
        title: "Audit technique — Core Web Vitals mobile",
        status: "en cours",
        clientNarrative:
          "Crawl complet en cours sur les 1 248 URLs indexées pour identifier " +
          "les pages présentant un LCP ou un CLS dégradé sur mobile.",
        owner: BARTH,
        date: "2026-05-30",
      },
      {
        id: "p2",
        title: "Brief « parfum femme oriental » en rédaction",
        status: "en cours",
        clientNarrative:
          "Brief envoyé à notre rédactrice. Publication prévue début juin. " +
          "Cible un volume de 8 100 recherches/mois sur une intention transactionnelle.",
        owner: MARIE,
        date: "2026-06-05",
      },
      {
        id: "p3",
        title: "Plan de schemas.org — fiches produit",
        status: "en cours",
        clientNarrative:
          "Préparation du schéma JSON-LD Product pour vos 200 fiches " +
          "produits phares. Boost attendu sur le CTR via les rich snippets.",
        owner: BARTH,
        date: "2026-06-08",
      },
    ],
    nextSteps: [
      {
        id: "n1",
        title: "Campagne netlinking magazines beauté",
        status: "en attente",
        clientNarrative:
          "Démarrage en juin : 8 placements ciblés sur des médias DR > 70 " +
          "(elle.fr, marieclaire.fr, etc.) avec ancres thématisées parfums.",
        owner: BARTH,
        date: "2026-06-10",
      },
      {
        id: "n2",
        title: "Production de 4 nouveaux guides — catégories sous-exploitées",
        status: "en attente",
        clientNarrative:
          "4 guides éditoriaux longue traîne planifiés pour couvrir les " +
          "thématiques 'soin homme', 'maquillage mariée', 'parfum unisexe' " +
          "et 'cosmétique naturelle'.",
        owner: MARIE,
        date: "2026-06-15",
      },
      {
        id: "n3",
        title: "Poser la balise GA4 sur le tunnel de paiement",
        status: "en attente",
        clientNarrative:
          "Action de votre côté : l'accès au back-office checkout ne nous a pas " +
          "été transmis. Votre équipe technique doit installer le tag, puis " +
          "marquer cette mission comme « fait ».",
        owner: BARTH,
        date: "2026-06-05",
        assignedToClient: true,
      },
    ],
    deliverables: [
      {
        id: "dl1",
        type: "guide",
        title: "Routine peau mixte — le guide complet",
        url: "https://www.sephora.fr/conseils/routine-peau-mixte",
        targetKeyword: "routine peau mixte",
        monthlyVolume: 12_100,
        publishedAt: "2026-05-21",
        wordCount: 2_400,
        owner: MARIE,
      },
      {
        id: "dl2",
        type: "article",
        title: "Comment choisir son parfum selon sa peau",
        url: "https://www.sephora.fr/conseils/choisir-parfum-peau",
        targetKeyword: "choisir parfum",
        monthlyVolume: 6_700,
        publishedAt: "2026-05-12",
        wordCount: 1_850,
        owner: MARIE,
      },
      {
        id: "dl3",
        type: "page",
        title: "Page catégorie « soins anti-âge »",
        url: "https://www.sephora.fr/soin-visage/anti-age",
        targetKeyword: "soin anti-âge",
        monthlyVolume: 18_400,
        publishedAt: "2026-05-08",
        wordCount: 920,
        owner: SOPHIE,
      },
      {
        id: "dl4",
        type: "guide",
        title: "Maquillage été — palette tendance 2026",
        url: "https://www.sephora.fr/maquillage/tendance-ete-2026",
        targetKeyword: "tendance maquillage été",
        monthlyVolume: 5_200,
        publishedAt: "2026-05-02",
        wordCount: 1_980,
        owner: MARIE,
      },
    ],
    reports: [
      {
        id: "r1",
        month: "Mai 2026",
        publishedAt: "2026-05-30",
        pages: 14,
        fileSizeKb: 1820,
        summary:
          "Trafic +18% vs mois précédent, 9 actions livrées dont 4 publications " +
          "majeures. Position moyenne en hausse de 2,3 points sur le portefeuille suivi.",
        highlights: [
          "+3 142 clics organiques additionnels",
          "4 articles publiés totalisant 12 350 visites/mois cumulées",
          "Maturité netlinking à 94/100 (top 5 sectoriel)",
        ],
      },
      {
        id: "r2",
        month: "Avril 2026",
        publishedAt: "2026-04-30",
        pages: 13,
        fileSizeKb: 1640,
        summary:
          "Stabilisation du trafic après la mise à jour Google de mars. " +
          "Focus sur la consolidation des positions et la refonte des templates produits.",
        highlights: [
          "+8% de pages en top 10",
          "Refonte template produit terminée — déployée sur 1 200 fiches",
          "Linkbuilding : 23 nouveaux backlinks DR > 50",
        ],
      },
      {
        id: "r3",
        month: "Mars 2026",
        publishedAt: "2026-03-30",
        pages: 12,
        fileSizeKb: 1490,
        summary:
          "Démarrage de la collaboration. Audit complet + roadmap 6 mois validée.",
        highlights: [
          "Audit technique : 47 issues identifiées",
          "Audit éditorial : 18 pages prioritaires identifiées",
          "Roadmap 6 mois validée avec votre équipe",
        ],
      },
    ],
    consultant: {
      name: "Sophie Martin",
      role: "Consultante SEO senior · référente Sephora",
      email: "sophie@awi.com",
      phone: "+33 6 23 45 67 89",
      photoSeed: "5",
    },
    upcomingMeetings: [
      { date: "2026-05-26", topic: "Présentation rapport mensuel · 9h30" },
      { date: "2026-06-15", topic: "Sprint planning juin · 14h" },
    ],
  },

  "demo-doctolib": {
    token: "demo-doctolib",
    agency: AGENCY,
    clientName: "Doctolib",
    domain: "doctolib.fr",
    period: "Mai 2026",
    intro:
      "Mois compliqué : la chute de −3% sur le trafic global s'explique par " +
      "une refonte concurrente côté Maiia. Notre plan de reconquête est en " +
      "place — voici l'avancement.",
    scoreTechnique: 61,
    scoreContenu: 58,
    scoreNetlinking: 65,
    trafic: "−3 %",
    traficDir: "down",
    traffic: {
      monthlyVisits: 412_300,
      monthlyDelta: -12_750,
      history: [398_200, 418_900, 425_050, 432_700, 425_050, 412_300],
      historyLabels: ["déc", "jan", "fév", "mar", "avr", "mai"],
    },
    businessMetrics: {
      trafficValue:    { amountEur: 187_200, deltaPct: -4.2 },
      conversions:     { count: 8_470, label: "RDV pris", deltaPct: -1.8 },
      top10Keywords:   { count: 312, delta: 8 },
    },
    topPages: [
      { title: "Prendre rendez-vous médecin",       url: "https://www.doctolib.fr/guide/prendre-rdv-medecin", monthlyVisits: 47_820, monthlyDelta: 8_300 },
      { title: "Trouver un médecin généraliste",    url: "https://www.doctolib.fr/medecin-generaliste",       monthlyVisits: 38_140, monthlyDelta: -2_400 },
      { title: "RDV dermatologue rapide",            url: "https://www.doctolib.fr/dermatologue",              monthlyVisits: 22_590, monthlyDelta: 1_890 },
      { title: "Consultation kinésithérapeute",     url: "https://www.doctolib.fr/kinesitherapeute",          monthlyVisits: 18_320, monthlyDelta: -1_100 },
      { title: "Téléconsultation médicale",         url: "https://www.doctolib.fr/teleconsultation",          monthlyVisits: 14_780, monthlyDelta: 2_140 },
    ],
    risingKeywords: [
      { keyword: "prendre rendez-vous médecin",     positionBefore: 8,  positionAfter: 3, monthlyVolume: 27_800 },
      { keyword: "médecin disponible aujourd'hui",  positionBefore: 21, positionAfter: 11, monthlyVolume: 9_900 },
      { keyword: "RDV en ligne dermatologue",       positionBefore: 14, positionAfter: 7, monthlyVolume: 6_700 },
    ],
    stats: {
      actionsLivrees: 4,
      briefsPublies: 1,
    },
    actionsDelivered: [
      {
        id: "d1",
        title: "Refonte des balises title /rendez-vous",
        status: "livré",
        clientNarrative:
          "Nous avons reformulé les meta sur l'ensemble du tunnel " +
          "/rendez-vous pour récupérer les positions perdues face à Maiia.",
        owner: BARTH,
        date: "2026-05-11",
      },
      {
        id: "d2",
        title: "Audit complet — 1 248 URLs",
        status: "livré",
        clientNarrative:
          "Crawl exhaustif réalisé. 12 pages désindexées identifiées, " +
          "32 issues techniques priorisées par niveau d'impact.",
        owner: BARTH,
        date: "2026-05-04",
      },
    ],
    actionsInProgress: [
      {
        id: "p1",
        title: "Analyse des 12 pages désindexées",
        status: "en cours",
        clientNarrative:
          "Investigation en cours sur les pages disparues de l'index Google " +
          "depuis fin avril. Hypothèse : signaux de duplication sur les " +
          "fiches praticien similaires.",
        owner: BARTH,
        date: "2026-05-28",
      },
    ],
    nextSteps: [
      {
        id: "n1",
        title: "Plan de reconquête sur la specialité « médecin du sport »",
        status: "en attente",
        clientNarrative:
          "10 briefs prévus pour couvrir l'écosystème médecin du sport, " +
          "où nous avons identifié une opportunité de prise de positions " +
          "rapide (concurrence faible, volume cumulé 18 400 recherches/mois).",
        owner: MARIE,
        date: "2026-06-12",
      },
    ],
    deliverables: [
      {
        id: "dl1",
        type: "page",
        title: "Page guide « prendre rdv médecin »",
        url: "https://www.doctolib.fr/guide/prendre-rdv-medecin",
        targetKeyword: "prendre rendez-vous médecin",
        monthlyVolume: 27_800,
        publishedAt: "2026-05-18",
        wordCount: 1_650,
        owner: MARIE,
      },
    ],
    reports: [
      {
        id: "r1",
        month: "Mai 2026",
        publishedAt: "2026-05-30",
        pages: 11,
        fileSizeKb: 1380,
        summary:
          "Mois de transition. Trafic −3% suite à la refonte de Maiia. " +
          "Plan de reconquête établi et roadmap juin validée.",
        highlights: [
          "Audit complet livré (32 issues priorisées)",
          "12 pages désindexées identifiées",
          "Plan netlinking juin validé (8 placements ciblés)",
        ],
      },
      {
        id: "r2",
        month: "Avril 2026",
        publishedAt: "2026-04-30",
        pages: 10,
        fileSizeKb: 1280,
        summary:
          "Démarrage de la collaboration. Premier audit + setup tracking.",
        highlights: [
          "GSC + GA4 connectés",
          "Audit éditorial : 24 pages prioritaires",
          "Roadmap Q2/Q3 validée",
        ],
      },
    ],
    consultant: {
      name: "Barthélemy Leroy",
      role: "Lead SEO · référent Doctolib",
      email: "barthelemy@awi.com",
      phone: "+33 6 12 34 56 78",
      photoSeed: "barthelemy-l-seo",
    },
    upcomingMeetings: [
      { date: "2026-05-28", topic: "Steering trimestriel · 10h" },
    ],
  },
};

export function getSharedProject(token: string): SharedProject | null {
  return SHARED_PROJECTS[token] ?? null;
}
