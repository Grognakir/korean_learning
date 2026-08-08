import "server-only";

import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { NextRequest, NextResponse } from "next/server";

import type { Database } from "@/types/database";
import { parsePublicSupabaseEnv, type PublicSupabaseEnv } from "@/lib/validation/env";

export function createRouteHandlerSupabaseClient(
  request: NextRequest,
  response: NextResponse,
  env: PublicSupabaseEnv = parsePublicSupabaseEnv(),
): SupabaseClient<Database> {
  return createServerClient<Database>(env.url, env.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
        }
      },
    },
  });
}
