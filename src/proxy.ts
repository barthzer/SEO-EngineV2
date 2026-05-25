/**
 * Proxy (anciennement middleware) — refresh automatique de la session Supabase
 * à chaque navigation. Indispensable pour que les Server Components voient un
 * user authentifié.
 *
 * Next 16 a renommé `middleware.ts` → `proxy.ts` (export `proxy` requis).
 * Doc Supabase : https://supabase.com/docs/guides/auth/server-side/nextjs
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Avant que Supabase ne soit configuré : no-op (laisse passer la requête).
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Trigger session refresh
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    // Match toutes les routes sauf assets statiques + API publiques
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
