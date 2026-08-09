import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  groupCurriculumStatements,
  packCurriculumGroups,
  splitCurriculumSql,
} from "./curriculumChunking";

const SRC = "/tmp/korean-learning-f2-i23/curriculum-upsert.sql";
const OUT = "/tmp/korean-learning-f2-i23/chunks";
const MAX = 350_000;

mkdirSync(OUT, { recursive: true });
const statements = splitCurriculumSql(readFileSync(SRC, "utf8"));
const groups = groupCurriculumStatements(statements);
const chunks = packCurriculumGroups(groups, MAX);

console.log(`statements=${statements.length} groups=${groups.length} chunks=${chunks.length}`);
const files: string[] = [];
for (const [index, chunk] of chunks.entries()) {
  const file = path.join(OUT, `chunk-${String(index + 1).padStart(2, "0")}.sql`);
  writeFileSync(file, `begin;\n${chunk}\ncommit;\n`, "utf8");
  files.push(file);
  console.log(`${path.basename(file)} bytes=${Buffer.byteLength(chunk)}`);
}

for (const file of files) {
  console.log(`Applying ${path.basename(file)}...`);
  const result = spawnSync("node_modules/.bin/supabase", ["db", "query", "--linked", "-f", file], {
    encoding: "utf8",
    cwd: process.cwd(),
  });
  if (result.status !== 0) {
    console.error(result.stdout);
    console.error(result.stderr);
    throw new Error(`Failed applying ${file}`);
  }
  console.log(`OK ${path.basename(file)}`);
}

console.log("All curriculum chunks applied.");
