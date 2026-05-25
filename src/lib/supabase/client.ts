/**
 * Supabase client côté browser — pour Client Components ("use client").
 * Utilisé pour l'auth (signIn, signOut, écouter la session).
 *
 * Pour les queries data, préférer les Server Actions qui passent par Drizzle.
 */

import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
