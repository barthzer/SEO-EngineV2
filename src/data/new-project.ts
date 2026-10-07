/**
 * Ajout d'un projet — contrats + mocks (handoff back).
 *
 * 1. Vérification du domaine (au clic sur « Continuer », jamais en direct) :
 *    le back suit les redirections et renvoie le domaine final. Si le domaine
 *    saisi redirige ailleurs (ex. .fr → .com), le front le signale et propose
 *    d'analyser le domaine final.
 * 2. Search Console (étape facultative) : après l'OAuth Google, le back liste
 *    les propriétés du compte ; le front présélectionne celle du domaine final.
 *
 * TODO(back) : remplacer les mocks par les appels réels (la version fonctionnelle
 * de l'étape Search Console tourne déjà sur le site de test).
 */

export type RedirectHop = { from: string; to: string; status: 301 | 302 | 307 | 308 };

export type DomainCheck =
  | {
      ok: true;
      /** Domaine tel que saisi, normalisé (sans protocole ni www ni slash). */
      input: string;
      /** Domaine atteint après toutes les redirections. */
      finalDomain: string;
      redirected: boolean;
      hops: RedirectHop[];
      /** Code HTTP final du domaine atteint. */
      status: number;
      https: boolean;
    }
  | { ok: false; input: string; reason: "unreachable" | "invalid" };

export type GscProperty = {
  /** Identifiant Search Console : `sc-domain:exemple.com` ou URL préfixe. */
  siteUrl: string;
  kind: "domain" | "prefix";
  permission: "owner" | "full" | "restricted";
};

/** Normalise une saisie : retire protocole, www, chemin et espaces. */
export function normalizeDomain(raw: string): string {
  return raw.trim().toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[/?#].*$/, "");
}

const DOMAIN_RE = /^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/;

/* Redirections connues du mock (domaine saisi → domaine final). */
const MOCK_REDIRECTS: Record<string, string> = {
  "aw-i.fr": "aw-i.com",
  "exemple.fr": "exemple.com",
  "globalsearch.fr": "globalsearch.io",
};

/** MOCK — vérifie un domaine (latence simulée). */
export async function checkDomain(raw: string): Promise<DomainCheck> {
  const input = normalizeDomain(raw);
  await new Promise((r) => setTimeout(r, 2200));
  if (!DOMAIN_RE.test(input)) return { ok: false, input, reason: "invalid" };
  if (input.startsWith("introuvable")) return { ok: false, input, reason: "unreachable" };
  const target = MOCK_REDIRECTS[input];
  if (target) {
    return {
      ok: true, input, finalDomain: target, redirected: true, status: 200, https: true,
      hops: [{ from: `https://${input}/`, to: `https://www.${target}/`, status: 301 }],
    };
  }
  return { ok: true, input, finalDomain: input, redirected: false, hops: [], status: 200, https: true };
}

/** MOCK — propriétés Search Console du compte Google connecté. */
export async function listGscProperties(finalDomain: string): Promise<GscProperty[]> {
  await new Promise((r) => setTimeout(r, 1400));
  return [
    { siteUrl: `sc-domain:${finalDomain}`, kind: "domain", permission: "owner" },
    { siteUrl: `https://www.${finalDomain}/`, kind: "prefix", permission: "full" },
    { siteUrl: "sc-domain:autre-client.fr", kind: "domain", permission: "restricted" },
  ];
}

/** Vrai si la propriété couvre le domaine du projet. */
export function propertyMatches(p: GscProperty, domain: string): boolean {
  const host = p.siteUrl.replace(/^sc-domain:/, "").replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
  return host === domain;
}
