import { randomUUID } from "node:crypto";

import type { SupabaseClient, User } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import { createLocalAdminClient, createLocalAnonClient, createLocalUserClient } from "./helpers";

export type TestAuthUser = {
  id: string;
  email: string;
  password: string;
  accessToken: string;
};

export async function createTestAuthUser(label: string): Promise<TestAuthUser> {
  const admin = createLocalAdminClient();
  const email = `${label}-${randomUUID()}@test.local`;
  const password = `Test-${randomUUID()}`;

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data.user) {
    throw error ?? new Error(`Failed to create test user ${label}.`);
  }

  const anon = createLocalAnonClient();
  const { data: sessionData, error: signInError } = await anon.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError || !sessionData.session?.access_token) {
    throw signInError ?? new Error(`Failed to sign in test user ${label}.`);
  }

  return {
    id: data.user.id,
    email,
    password,
    accessToken: sessionData.session.access_token,
  };
}

type PublicTable = keyof Database["public"]["Tables"];
type PublicView = keyof Database["public"]["Views"];

export async function expectSelectCount(
  client: SupabaseClient<Database>,
  relation: PublicTable | PublicView,
  expected: number,
): Promise<void> {
  const { count, error } = await client
    .from(relation as PublicTable)
    .select("*", { count: "exact", head: true });
  if (error) {
    throw error;
  }
  if (count !== expected) {
    throw new Error(
      `Expected ${String(expected)} rows from ${String(relation)}, got ${String(count)}.`,
    );
  }
}

export async function expectSelectDenied(
  client: SupabaseClient<Database>,
  relation: PublicTable | PublicView,
): Promise<void> {
  const { count, error } = await client
    .from(relation as PublicTable)
    .select("*", { count: "exact", head: true });
  if (!error && (count ?? 0) > 0) {
    throw new Error(`Expected ${String(relation)} access to be denied, but rows were returned.`);
  }
}

export async function expectMutationDenied(
  run: () => PromiseLike<{ error: { message: string } | null }>,
): Promise<void> {
  const { error } = await run();
  if (!error) {
    throw new Error("Expected mutation to be denied by RLS.");
  }
}

export function asUserClient(user: TestAuthUser): SupabaseClient<Database> {
  return createLocalUserClient(user.accessToken);
}

export function assertUser(user: User | null): asserts user is User {
  if (!user) {
    throw new Error("Expected authenticated user.");
  }
}
