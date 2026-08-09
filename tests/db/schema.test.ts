import { execSync } from "node:child_process";

import { describe, expect, it } from "vitest";

import { countRows, createLocalAdminClient, expectSqlFailure, runSql } from "./helpers";

describe("database schema and seed", () => {
  const client = createLocalAdminClient();

  it("applies seed counts for the sample module and curriculum import", async () => {
    await expect(countRows(client, "learning_modules")).resolves.toBe(17);
    await expect(countRows(client, "grammar_topics")).resolves.toBe(82);
    await expect(countRows(client, "exercises")).resolves.toBe(388);
    await expect(countRows(client, "dictionary_entries")).resolves.toBe(1091);
    await expect(countRows(client, "reading_passages")).resolves.toBe(179);
    await expect(countRows(client, "exercise_topics")).resolves.toBe(16);
    await expect(countRows(client, "content_reviews")).resolves.toBe(15);
    expect(
      runSql("select count(*)::text from public.exercises where learning_skill = 'reading';"),
    ).toBe("101");
    expect(
      runSql(
        "select count(*)::text from public.exercises where status = 'draft' and learning_skill = 'reading';",
      ),
    ).toBe("100");
  });

  it("rejects duplicate exercise logical_id + content_version", () => {
    expectSqlFailure(() =>
      runSql(`
        insert into public.exercises (
          id, logical_id, module_id, primary_topic_id, learning_skill, type, difficulty,
          prompt_ru, payload, explanation_ru, status, content_version, source
        )
        select
          gen_random_uuid(),
          logical_id,
          module_id,
          primary_topic_id,
          learning_skill,
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
          id, logical_id, module_id, primary_topic_id, learning_skill, type, difficulty,
          prompt_ru, payload, explanation_ru, status, content_version, source
        ) values (
          gen_random_uuid(),
          'invalid-status-test',
          (select id from public.learning_modules limit 1),
          (select id from public.grammar_topics limit 1),
          'grammar',
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
          id, logical_id, module_id, primary_topic_id, learning_skill, type, difficulty,
          prompt_ru, payload, explanation_ru, status, content_version, source,
          source_generation_id
        ) values (
          gen_random_uuid(),
          'invalid-source-test',
          (select id from public.learning_modules limit 1),
          (select id from public.grammar_topics limit 1),
          'grammar',
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

  it("backfills sample grammar topics and exercise skills", () => {
    const topics = runSql(
      "select logical_id || ':' || category from public.grammar_topics order by sort_order;",
    );
    expect(topics).toContain("grammar.sample.");
    expect(topics).toContain(":sample");

    expect(
      runSql("select count(*)::text from public.exercises where learning_skill = 'grammar';"),
    ).toBe("15");
    expect(
      runSql(
        "select count(*)::text from public.learning_modules where unit_number is not null and level = '1급';",
      ),
    ).toBe("16");

    expect(
      runSql(
        "select coalesce(unit_number::text, 'null') from public.learning_modules where slug = 'sample-module';",
      ),
    ).toBe("null");
  });

  it("rejects grammar exercises without a topic and reading without a passage", () => {
    expectSqlFailure(() =>
      runSql(`
        insert into public.exercises (
          id, logical_id, module_id, primary_topic_id, learning_skill, type, difficulty,
          prompt_ru, payload, explanation_ru, status, content_version, source
        ) values (
          gen_random_uuid(),
          'grammar-missing-topic',
          (select id from public.learning_modules limit 1),
          null,
          'grammar',
          'single-choice',
          'easy',
          'test',
          '{}'::jsonb,
          'explanation',
          'draft',
          '1.0.0',
          'manual'
        );
      `),
    );

    expectSqlFailure(() =>
      runSql(`
        insert into public.exercises (
          id, logical_id, module_id, primary_topic_id, reading_passage_id, learning_skill, type, difficulty,
          prompt_ru, payload, explanation_ru, status, content_version, source
        ) values (
          gen_random_uuid(),
          'reading-missing-passage',
          (select id from public.learning_modules limit 1),
          null,
          null,
          'reading',
          'single-choice',
          'easy',
          'test',
          '{}'::jsonb,
          'explanation',
          'draft',
          '1.0.0',
          'manual'
        );
      `),
    );
  });

  it("rejects vocabulary exercises without a dictionary target link", () => {
    expectSqlFailure(() =>
      runSql(`
        insert into public.exercises (
          id, logical_id, module_id, primary_topic_id, learning_skill, type, difficulty,
          prompt_ru, payload, explanation_ru, status, content_version, source
        ) values (
          gen_random_uuid(),
          'vocab-missing-link',
          (select id from public.learning_modules limit 1),
          null,
          'vocabulary',
          'meaning-choice',
          'easy',
          'test',
          '{}'::jsonb,
          'explanation',
          'draft',
          '1.0.0',
          'manual'
        );
      `),
    );
  });

  it("seeds four canonical content sources without private paths", () => {
    const sources = runSql(
      "select source_key, note from public.content_sources order by source_key;",
    );
    expect(sources).toMatch(/curriculum-grammar/);
    expect(sources).toMatch(/curriculum-texts/);
    expect(sources).toMatch(/curriculum-topics/);
    expect(sources).toMatch(/curriculum-vocabulary/);
    expect(sources).not.toMatch(/\/Users\//);
  });
});

describe("database reset repeatability", () => {
  it("matches seed counts after a second reset", async () => {
    runSql("select 1");
    execSync("node_modules/.bin/supabase db reset", { cwd: process.cwd(), stdio: "inherit" });
    await expect(countRows(createLocalAdminClient(), "learning_modules")).resolves.toBe(17);
    await expect(countRows(createLocalAdminClient(), "exercises")).resolves.toBe(388);
    await expect(countRows(createLocalAdminClient(), "dictionary_entries")).resolves.toBe(1091);
  });
});
