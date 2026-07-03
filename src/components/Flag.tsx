/**
 * Drapeau circulaire — norme DS unique (remplace les drapeaux emoji 🇫🇷 partout).
 *
 * S'appuie sur les SVG « circle-flags » vendorisés dans `/public/flags/{iso}.svg`
 * (cercle parfait, rendu net, aucune dépendance réseau). Accepte un code pays OU
 * un code langue (ex. "FR", "fr", "en", "UK") — la table normalise vers l'ISO du
 * fichier. Si le fichier manque, le drapeau est masqué proprement (onError).
 *
 * Pour ajouter un pays : déposer `public/flags/{iso}.svg` et, si besoin, mapper son
 * code applicatif vers l'ISO ci-dessous.
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
