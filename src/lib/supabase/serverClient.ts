import "server-only";

import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { parsePublicSupabaseEnv, type PublicSupabaseEnv } from "@/lib/validation/env";

export type ServerCookieAdapter = CookieMethodsServer;

/**
 * Build a per-request server client with an explicit cookie adapter.
 * Prefer this in tests; production code uses {@link createServerSupabaseClient}.
 */
export function createServerSupabaseClientWithCookies(
  cookieMethods: ServerCookieAdapter,
  env: PublicSupabaseEnv = parsePublicSupabaseEnv(),
): SupabaseClient {
  return createServerClient(env.url, env.publishableKey, {
    cookies: cookieMethods,
  });
}

/**
 * Server Component / Route Handler / Server Action client.
 * Creates a new client per call — never reuse across requests.
 * Cookie writes from Server Components may fail; session refresh is handled in `src/proxy.ts`.
 */
export async function createServerSupabaseClient(
  env: PublicSupabaseEnv = parsePublicSupabaseEnv(),
): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createServerSupabaseClientWithCookies(
    {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component where cookies are read-only.
          // F1-I28 Proxy will refresh the session on the response.
        }
      },
    },
    env,
  );
}
