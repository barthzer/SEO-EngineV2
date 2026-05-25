import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Next.js charge .env.local en priorité — on fait pareil pour drizzle-kit
config({ path: ".env.local" });
config({ path: ".env" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL manquant dans .env.local");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  // Schemas Supabase à exclure du diff (gérés par Supabase)
  schemaFilter: ["public"],
  verbose: true,
  strict: true,
});
