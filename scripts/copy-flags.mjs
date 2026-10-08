/**
 * Copie les drapeaux ronds de `circle-flags` (npm) dans `public/flags/`,
 * où le composant DS `<Flag>` les sert (`/flags/{iso}.svg`).
 * Lancé automatiquement avant `dev` et `build`, et après `npm install`.
 */
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
let src;
try {
  src = join(dirname(require.resolve("circle-flags/package.json")), "flags");
} catch {
  console.warn("[copy-flags] circle-flags introuvable : lancez `npm install`.");
  process.exit(0);
}
const dest = join(process.cwd(), "public", "flags");
if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });
console.log(`[copy-flags] drapeaux copiés dans public/flags`);
