import { execSync } from "node:child_process";

import { describe, expect, it } from "vitest";

import { countRows, createLocalAdminClient, expectSqlFailure, runSql } from "./helpers";

describe("database schema and seed", () => {
  const client = createLocalAdminClient();

  it("applies seed counts for the sample module", async () => {
    await expect(countRows(client, "learning_modules")).resolves.toBe(1);
    await expect(countRows(client, "grammar_topics")).resolves.toBe(2);
    await expect(countRows(client, "exercises")).resolves.toBe(14);
    await expect(countRows(client, "exercise_topics")).resolves.toBe(14);
    await expect(countRows(client, "content_reviews")).resolves.toBe(15);
  });

  it("rejects duplicate exercise logical_id + content_version", () => {
    expectSqlFailure(() =>
      runSql(`
        insert into public.exercises (
          id, logical_id, module_id, primary_topic_id, type, difficulty,
          prompt_ru, payload, explanation_ru, status, content_version, source
        )
        select
          gen_random_uuid(),
          logical_id,
          module_id,
          primary_topic_id,
          type,
          difficulty,
          prompt_ru,
          payload,
          explanation_ru,
          status,
          content_version,
          source
        from public.exercises
        limit 1;
      `),
    );
  });

  it("rejects invalid exercise lifecycle status", () => {
    expectSqlFailure(() =>
      runSql(`
        insert into public.exercises (
          id, logical_id, module_id, primary_topic_id, type, difficulty,
          prompt_ru, payload, explanation_ru, status, content_version, source
        ) values (
          gen_random_uuid(),
          'invalid-status-test',
          (select id from public.learning_modules limit 1),
          (select id from public.grammar_topics limit 1),
          'free-response',
          'easy',
          'test',
          '{}'::jsonb,
          'explanation',
          'not-a-status',
          '1.0.0',
          'manual'
        );
      `),
    );
  });

  it("rejects manual exercise with source_generation_id set", () => {
    expectSqlFailure(() =>
      runSql(`
        insert into public.exercises (
          id, logical_id, module_id, primary_topic_id, type, difficulty,
          prompt_ru, payload, explanation_ru, status, content_version, source,
          source_generation_id
        ) values (
          gen_random_uuid(),
          'invalid-source-test',
          (select id from public.learning_modules limit 1),
          (select id from public.grammar_topics limit 1),
          'free-response',
          'easy',
          'test',
          '{}'::jsonb,
          'explanation',
          'draft',
          '1.0.0',
          'manual',
          gen_random_uuid()
        );
      `),
    );
  });
});

describe("database reset repeatability", () => {
  it("matches seed counts after a second reset", async () => {
    runSql("select 1");
    execSync("pnpm exec supabase db reset", { cwd: process.cwd(), stdio: "inherit" });
    await expect(countRows(createLocalAdminClient(), "learning_modules")).resolves.toBe(1);
    await expect(countRows(createLocalAdminClient(), "exercises")).resolves.toBe(14);
  });
});
