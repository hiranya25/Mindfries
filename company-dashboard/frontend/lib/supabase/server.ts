import "server-only";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// Anon-key, session-aware client for Server Components/Actions. Used ONLY for
// auth (sign in/out, getUser()) — never to read/write companies, assessments
// or sessions directly. Those tables have no RLS and are convention-gated to
// the service-role client (lib/supabaseAdmin.ts) — see /ARCHITECTURE.md.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component render — safe to ignore since
            // proxy.ts refreshes the session on every request.
          }
        },
      },
    },
  );
}
