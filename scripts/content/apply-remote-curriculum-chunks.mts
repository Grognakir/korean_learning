import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const SRC = "/tmp/korean-learning-f2-i23/curriculum-upsert.sql";
const OUT = "/tmp/korean-learning-f2-i23/chunks";
const MAX = 350_000;

mkdirSync(OUT, { recursive: true });
let body = readFileSync(SRC, "utf8").trim();
if (body.startsWith("begin;")) body = body.slice("begin;".length).trim();
if (body.endsWith("commit;")) body = body.slice(0, -"commit;".length).trim();

const parts = body.split(/;\s*\n(?=(?:--|insert|delete|update|with)\b)/i);
const statements = parts
  .map((part) => {
    const trimmed = part.trim();
    if (!trimmed) return "";
    return trimmed.endsWith(";") ? trimmed : `${trimmed};`;
  })
  .filter(Boolean);

const chunks: string[] = [];
let current: string[] = [];
let size = 0;
for (const statement of statements) {
  const nextSize = size + statement.length + 1;
  if (current.length > 0 && nextSize > MAX) {
    chunks.push(current.join("\n\n"));
    current = [];
    size = 0;
  }
  current.push(statement);
  size += statement.length + 2;
}
if (current.length) chunks.push(current.join("\n\n"));

console.log(`statements=${statements.length} chunks=${chunks.length}`);
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
