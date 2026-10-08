/**
 * Drapeau circulaire — norme DS unique (remplace les drapeaux emoji 🇫🇷 partout).
 *
 * S'appuie sur la bibliothèque npm `circle-flags` (tous les pays, cercle parfait) :
 * ses SVG sont copiés dans `/public/flags/{iso}.svg` par `scripts/copy-flags.mjs`
 * (avant `dev` et `build`, après `npm install`). Aucune dépendance réseau. Accepte un code pays OU
 * un code langue (ex. "FR", "fr", "en", "UK") — la table normalise vers l'ISO du
 * fichier. Si le fichier manque, le drapeau est masqué proprement (onError).
 *
 * Tous les codes ISO 3166-1 sont disponibles. Mapper ci-dessous seulement les codes
 * applicatifs qui diffèrent de l'ISO (langues, « uk »…).
 */

/** Code applicatif (pays ou langue) → code ISO du fichier SVG. */
const FLAG_ISO: Record<string, string> = {
  // Pays / régions
  fr: "fr", be: "be", ch: "ch", ca: "ca", us: "us", es: "es", de: "de", it: "it",
  uk: "gb", gb: "gb",
  // Langues (drapeau de référence)
  en: "gb",
};

export function Flag({ code, size = 18, className = "" }: { code: string; size?: number; className?: string }) {
  const iso = FLAG_ISO[code.toLowerCase()] ?? code.toLowerCase();
  return (
    <img
      src={`/flags/${iso}.svg`}
      alt=""
      width={size}
      height={size}
      className={`inline-block flex-shrink-0 rounded-full ${className}`}
      style={{ width: size, height: size }}
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }}
    />
  );
}
