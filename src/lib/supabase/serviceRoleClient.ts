import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";
import { parsePublicSupabaseEnv } from "@/lib/validation/env";

import { parseServerSupabaseEnv } from "./serverEnv";

export type ServiceRoleSupabaseClient = SupabaseClient<Database>;

export function createServiceRoleSupabaseClient(
  env: {
    readonly url: string;
    readonly secretKey: string;
  } = {
    url: parsePublicSupabaseEnv().url,
    secretKey: parseServerSupabaseEnv().secretKey,
  },
): ServiceRoleSupabaseClient {
  return createClient<Database>(env.url, env.secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
