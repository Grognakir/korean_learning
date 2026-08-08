import type { PublicSupabaseEnv } from "@/lib/validation/env";

export type SupabaseHealthResult =
  { ok: true; latencyMs: number } | { ok: false; latencyMs: number; message: string };

/**
 * Safe connectivity probe: hits Auth health without reading tables or logging secrets.
 */
export async function checkSupabaseAuthHealth(
  env: PublicSupabaseEnv,
  fetchImpl: typeof fetch = fetch,
): Promise<SupabaseHealthResult> {
  const started = Date.now();
  const baseUrl = env.url.replace(/\/$/, "");

  try {
    const response = await fetchImpl(`${baseUrl}/auth/v1/health`, {
      method: "GET",
      headers: {
        apikey: env.publishableKey,
      },
    });
    const latencyMs = Date.now() - started;

    if (!response.ok) {
      return {
        ok: false,
        latencyMs,
        message: `Auth health returned HTTP ${response.status}`,
      };
    }

    return { ok: true, latencyMs };
  } catch (error) {
    return {
      ok: false,
      latencyMs: Date.now() - started,
      message: error instanceof Error ? error.message : "Unknown health error",
    };
  }
}
