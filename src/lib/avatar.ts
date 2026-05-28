/**
 * URL d'avatar pravatar.cc.
 *
 * - seed numérique ("5", "47"…) → `?img=N` : image FIXE et déterministe
 *   (utile pour épingler le genre/visage exact d'une personne).
 * - seed texte → `?u=seed` : image pseudo-aléatoire stable par seed.
 */
export function pravatarUrl(seed: string, px: number): string {
  return /^\d+$/.test(seed)
    ? `https://i.pravatar.cc/${px}?img=${seed}`
    : `https://i.pravatar.cc/${px}?u=${encodeURIComponent(seed)}`;
}
