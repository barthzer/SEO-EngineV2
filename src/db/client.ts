/**
 * Drizzle client — pour Server Components, Server Actions, Route Handlers.
 *
 * ⚠️ Ne PAS importer dans un Client Component.
 *
 * Utilise le pooler Supabase (port 6543) en transaction mode — compatible serverless.
 * En local dev → Connection string "Transaction pooler" depuis le dashboard Supabase.
 *
 * Initialisation PARESSEUSE : on ne lit `DATABASE_URL` et on ne crée la
 * connexion qu'à la première utilisation réelle de `db`. Cela évite que le
 * simple import du module fasse échouer `next build` (collecte des pages)
 * lorsque la variable d'env n'est pas présente à la compilation.
 */

import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type DB = PostgresJsDatabase<typeof schema>;

let cached: DB | null = null;

function getDb(): DB {
  if (cached) return cached;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL manquant. Copie .env.example en .env.local et remplis-le depuis Supabase → Settings → Database → Connection string (Transaction pooler).",
    );
  }
  // `prepare: false` requis pour le pooler en transaction mode.
  const sql = postgres(connectionString, { prepare: false });
  cached = drizzle(sql, { schema });
  return cached;
}

/**
 * Proxy paresseux : se comporte exactement comme l'instance Drizzle, mais ne
 * l'initialise (et ne valide `DATABASE_URL`) qu'au premier accès.
 */
export const db = new Proxy({} as DB, {
  get(_target, prop) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(real)
      : value;
  },
});

export { schema };
