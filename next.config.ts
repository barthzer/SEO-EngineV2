import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Racine explicite : sans elle, Turbopack la devine en remontant jusqu'au premier
  // package-lock.json trouvé. Un lockfile égaré dans le dossier personnel lui faisait
  // surveiller tout le home, ce qui figeait le Mac au lancement du serveur.
  turbopack: { root: __dirname },
  // Pas de cache Turbopack sur disque en développement (comme awi-site) : il grossit
  // vite et, sur un MacBook Air 16 Go au disque presque plein, il figeait la machine
  // au démarrage. Recompilation à froid à chaque lancement, un peu plus lente mais sûre.
  experimental: { turbopackFileSystemCacheForDev: false },
};

export default nextConfig;
