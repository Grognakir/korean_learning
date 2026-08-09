import "server-only";

import { cache } from "react";

import { createServerSupabaseClient } from "@/lib/supabase/serverClient";

import type { AuthUser } from "../domain/types";

async function readServerAuthUser(): Promise<AuthUser | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email ?? null,
    };
  } catch {
    return null;
  }
}

export const getServerAuthUser = cache(readServerAuthUser);
