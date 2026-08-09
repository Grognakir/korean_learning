import { spawnSync } from "node:child_process";
import { execSync } from "node:child_process";

import { describe, expect, it } from "vitest";

import { buildCurriculumSeedSql } from "../../scripts/content/curriculumSeedSql";
import { countRows, createLocalAdminClient, runSql } from "./helpers";

function applyUpsert(): void {
  const { sql } = buildCurriculumSeedSql("upsert");
  const wrapped = `begin;\n${sql}\ncommit;\n`;
  const containerId = execSync(
    "docker ps --filter name=supabase_db_ --format '{{.Names}}' | head -1",
    { encoding: "utf8" },
  ).trim();
  const result = spawnSync(
    "docker",
    [
      "exec",
      "-i",
      containerId,
      "psql",
      "-U",
      "postgres",
      "-d",
      "postgres",
      "-v",
      "ON_ERROR_STOP=1",
    ],
    { input: wrapped, encoding: "utf8" },
  );
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "upsert failed");
  }
}

describe("curriculum import idempotency", () => {
  it("keeps counts stable across two upserts and does not elevate draft reading status", () => {
    const beforeModules = runSql("select count(*)::text from public.learning_modules;");
    const beforeExercises = runSql("select count(*)::text from public.exercises;");
    const beforeDict = runSql("select count(*)::text from public.dictionary_entries;");

    applyUpsert();
    applyUpsert();

    expect(runSql("select count(*)::text from public.learning_modules;")).toBe(beforeModules);
    expect(runSql("select count(*)::text from public.exercises;")).toBe(beforeExercises);
    expect(runSql("select count(*)::text from public.dictionary_entries;")).toBe(beforeDict);
    expect(
      runSql(
        "select count(*)::text from public.exercises where learning_skill = 'reading' and status = 'draft' and module_id in (select id from public.learning_modules where unit_number is not null);",
      ),
    ).toBe("148");
    expect(
      runSql(
        "select count(*)::text from public.exercises where learning_skill = 'reading' and status = 'approved' and module_id in (select id from public.learning_modules where unit_number is not null);",
      ),
    ).toBe("0");
  });

  it("rolls back when a mid-transaction statement fails", async () => {
    const modulesBefore = await countRows(createLocalAdminClient(), "learning_modules");
    const containerId = execSync(
      "docker ps --filter name=supabase_db_ --format '{{.Names}}' | head -1",
      { encoding: "utf8" },
    ).trim();

    const result = spawnSync(
      "docker",
      [
        "exec",
        "-i",
        containerId,
        "psql",
        "-U",
        "postgres",
        "-d",
        "postgres",
        "-v",
        "ON_ERROR_STOP=1",
      ],
      {
        input: `
begin;
insert into public.learning_modules (
  id, slug, level, title_ko, title_ru, description_ru, status, content_version, sort_order, unit_number
) values (
  gen_random_uuid(), 'rollback-probe', '1급', 'ko', 'ru', 'desc', 'draft', '1.0.0', 99, null
);
insert into public.learning_modules (
  id, slug, level, title_ko, title_ru, description_ru, status, content_version, sort_order, unit_number
) values (
  gen_random_uuid(), 'rollback-probe', '1급', 'ko', 'ru', 'desc', 'draft', '1.0.0', 100, null
);
commit;
`,
        encoding: "utf8",
      },
    );

    expect(result.status).not.toBe(0);
    await expect(countRows(createLocalAdminClient(), "learning_modules")).resolves.toBe(
      modulesBefore,
    );
    expect(
      runSql("select count(*)::text from public.learning_modules where slug = 'rollback-probe';"),
    ).toBe("0");
  });
});
