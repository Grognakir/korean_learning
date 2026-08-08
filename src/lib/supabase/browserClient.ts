import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { parsePublicSupabaseEnv, type PublicSupabaseEnv } from "@/lib/validation/env";

/**
 * Browser Supabase client for Client Components / hooks only.
 * Uses the official `@supabase/ssr` cookie-backed browser pattern.
 */
export function createBrowserSupabaseClient(
  env: PublicSupabaseEnv = parsePublicSupabaseEnv(),
): SupabaseClient {
  return createBrowserClient(env.url, env.publishableKey);
}
