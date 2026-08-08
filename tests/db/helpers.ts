import { execSync } from "node:child_process";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

type LocalSupabaseEnv = {
  apiUrl: string;
  serviceRoleKey: string;
  dbUrl: string;
};

let cachedEnv: LocalSupabaseEnv | undefined;

export function getLocalSupabaseEnv(): LocalSupabaseEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const raw = execSync("pnpm exec supabase status -o env", {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  const env = Object.fromEntries(
    raw
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1).replace(/^"|"$/g, "")];
      }),
  ) as Record<string, string>;

  cachedEnv = {
    apiUrl: env.API_URL ?? "",
    serviceRoleKey: env.SERVICE_ROLE_KEY ?? "",
    dbUrl: env.DB_URL ?? "",
  };

  if (!cachedEnv.apiUrl || !cachedEnv.serviceRoleKey || !cachedEnv.dbUrl) {
    throw new Error("Local Supabase is not running. Start it with `pnpm supabase:start`.");
  }

  return cachedEnv;
}

export function createLocalAdminClient(): SupabaseClient<Database> {
  const { apiUrl, serviceRoleKey } = getLocalSupabaseEnv();
  return createClient<Database>(apiUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function countRows(
  client: SupabaseClient<Database>,
  table: keyof Database["public"]["Tables"],
): Promise<number> {
  const { count, error } = await client.from(table).select("*", { count: "exact", head: true });
  if (error) {
    throw error;
  }
  return count ?? 0;
}

export function runSql(sql: string): string {
  const containerId = execSync(
    "docker ps --filter name=supabase_db_ --format '{{.Names}}' | head -1",
    {
      encoding: "utf8",
    },
  ).trim();

  if (!containerId) {
    throw new Error("Local Supabase database container is not running.");
  }

  return execSync(
    `docker exec -i ${containerId} psql -U postgres -d postgres -v ON_ERROR_STOP=1 -t -A -c ${JSON.stringify(sql)}`,
    {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  ).trim();
}

export function expectSqlFailure(run: () => unknown): void {
  try {
    run();
    throw new Error("Expected SQL statement to fail.");
  } catch (error) {
    if (error instanceof Error && error.message === "Expected SQL statement to fail.") {
      throw error;
    }
  }
}
