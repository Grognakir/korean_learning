import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/serverClient";

import type { AuthUser } from "../domain/types";

export async function getServerAuthUser(): Promise<AuthUser | null> {
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
