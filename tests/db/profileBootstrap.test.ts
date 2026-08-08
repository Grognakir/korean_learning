import { randomUUID } from "node:crypto";

import { describe, expect, it } from "vitest";

import { createLocalAdminClient, runSql } from "./helpers";

describe("auth profile bootstrap", () => {
  it("creates a profile row once for a new auth user", async () => {
    const admin = createLocalAdminClient();
    const email = `bootstrap-${randomUUID()}@test.local`;

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: `Test-${randomUUID()}`,
      email_confirm: true,
    });

    expect(error).toBeNull();
    expect(data.user?.id).toBeTruthy();

    const userId = data.user!.id;
    expect(runSql(`select count(*)::text from public.profiles where user_id = '${userId}'`)).toBe(
      "1",
    );

    runSql(`update auth.users set updated_at = now() where id = '${userId}'`);

    expect(runSql(`select count(*)::text from public.profiles where user_id = '${userId}'`)).toBe(
      "1",
    );
  });
});
