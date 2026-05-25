/**
 * Drizzle client — pour Server Components, Server Actions, Route Handlers.
 *
 * ⚠️ Ne PAS importer dans un Client Component.
 *
 * Utilise le pooler Supabase (port 6543) en transaction mode — compatible serverless.
 * En local dev → Connection string "Transaction pooler" depuis le dashboard Supabase.
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL manquant. Copie .env.example en .env.local et remplis-le depuis Supabase → Settings → Database → Connection string (Transaction pooler).",
  );
}

// `prepare: false` requis pour le pooler en transaction mode.
const sql = postgres(connectionString, { prepare: false });

export const db = drizzle(sql, { schema });

export { schema };
