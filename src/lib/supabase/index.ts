/**
 * Client-safe Supabase exports only.
 * Server factories: `@/lib/supabase/serverClient`, `@/lib/supabase/serverEnv`.
 */
export { createBrowserSupabaseClient } from "./browserClient";
export { checkSupabaseAuthHealth, type SupabaseHealthResult } from "./health";
