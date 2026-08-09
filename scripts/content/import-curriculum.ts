import { execSync, spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";

import { buildCurriculumSeedSql } from "./curriculumSeedSql";

function printStats(stats: ReturnType<typeof buildCurriculumSeedSql>["stats"]): void {
  console.log(
    [
      `modules=${stats.modules}`,
      `grammarTopics=${stats.grammarTopics}`,
      `dictionaryEntries=${stats.dictionaryEntries}`,
      `dictionaryLinks=${stats.dictionaryLinks}`,
      `readingPassages=${stats.readingPassages}`,
      `exercises=${stats.exercises}`,
      `exerciseOptions=${stats.exerciseOptions}`,
      `provenance=${stats.provenance}`,
    ].join(" "),
  );
}

function applySqlTransaction(sql: string): void {
  const wrapped = `begin;\n${sql}\ncommit;\n`;
  const containerId = execSync(
    "docker ps --filter name=supabase_db_ --format '{{.Names}}' | head -1",
    { encoding: "utf8" },
  ).trim();

  if (!containerId) {
    throw new Error("Local Supabase database container is not running.");
  }

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
    throw new Error(result.stderr || result.stdout || "Curriculum import transaction failed");
  }
}

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const apply = args.has("--apply");
const writePath = [...args].find((arg) => arg.startsWith("--write="))?.slice("--write=".length);

if (!dryRun && !apply && !writePath) {
  console.error(
    "Usage: tsx scripts/content/import-curriculum.ts (--dry-run | --apply | --write=path)",
  );
  process.exit(1);
}

const { sql, stats } = buildCurriculumSeedSql(dryRun ? "insert" : "upsert");

if (dryRun) {
  console.log("Curriculum import dry-run (SQL body not printed; answers not logged).");
  printStats(stats);
  process.exit(0);
}

if (writePath) {
  const target = path.resolve(process.cwd(), writePath);
  writeFileSync(target, `begin;\n${sql}\ncommit;\n`, "utf8");
  console.log(`Wrote curriculum upsert SQL to ${path.relative(process.cwd(), target)}`);
  printStats(stats);
  process.exit(0);
}

try {
  applySqlTransaction(sql);
  console.log("Curriculum import applied in a single transaction.");
  printStats(stats);
} catch (error) {
  console.error(error instanceof Error ? error.message : "Curriculum import failed");
  process.exit(1);
}
