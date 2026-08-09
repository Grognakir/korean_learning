import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "../..");

const SKIP_DIR_NAMES = new Set([
  ".git",
  ".next",
  "node_modules",
  "coverage",
  "playwright-report",
  "test-results",
  "dist",
  ".temp",
]);

const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".mts",
  ".cts",
  ".json",
  ".md",
  ".yml",
  ".yaml",
  ".css",
  ".sql",
  ".env",
  ".toml",
  ".txt",
]);

const SECRET_PATTERNS: ReadonlyArray<{ readonly name: string; readonly pattern: RegExp }> = [
  {
    name: "aws-access-key",
    pattern: /AKIA[0-9A-Z]{16}/,
  },
  {
    name: "private-key-block",
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  },
  {
    name: "hardcoded-secret-assignment",
    pattern: /(?:api[_-]?key|secret|token|password)\s*[:=]\s*['"](?!env\()[^'"]{20,}['"]/i,
  },
  {
    name: "live-supabase-service-role",
    pattern: /SERVICE_ROLE_KEY\s*=\s*eyJ(?![^]*supabase-demo)/i,
  },
];

const ABSOLUTE_PATH_PATTERN = /(?:^|["'`=\s])(?:\/Users\/|\/home\/|[A-Za-z]:\\)/;

const ALLOWED_ABSOLUTE_PATH_FILES = new Set([
  "scripts/content/schemas.ts",
  "scripts/content/content-integrity.test.ts",
  "scripts/content/curriculum-seed.test.ts",
  "scripts/quality/scan-secrets.mts",
]);

type Finding = {
  readonly file: string;
  readonly rule: string;
  readonly line: number;
  readonly excerpt: string;
};

function shouldScanFile(filePath: string): boolean {
  const base = filePath.split("/").pop() ?? "";
  if (base === ".env" || base.startsWith(".env.")) {
    return !base.includes("example");
  }
  const dot = base.lastIndexOf(".");
  if (dot < 0) {
    return false;
  }
  return TEXT_EXTENSIONS.has(base.slice(dot));
}

function walk(directory: string, files: string[]): void {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (SKIP_DIR_NAMES.has(entry.name)) {
      continue;
    }
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
      continue;
    }
    if (entry.isFile() && shouldScanFile(fullPath)) {
      files.push(fullPath);
    }
  }
}

function scanFile(filePath: string): Finding[] {
  const relativePath = relative(ROOT, filePath).replaceAll("\\", "/");
  const findings: Finding[] = [];

  let content: string;
  try {
    content = readFileSync(filePath, "utf8");
  } catch {
    return findings;
  }

  if (statSync(filePath).size > 1_500_000) {
    return findings;
  }

  // Tracked real env files (not examples) are forbidden in the repo snapshot.
  if (
    (relativePath === ".env" || relativePath === ".env.production") &&
    content.trim().length > 0
  ) {
    findings.push({
      file: relativePath,
      rule: "tracked-env-file",
      line: 1,
      excerpt: "Tracked environment file must not be committed",
    });
  }

  const lines = content.split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    for (const rule of SECRET_PATTERNS) {
      if (rule.pattern.test(line)) {
        findings.push({
          file: relativePath,
          rule: rule.name,
          line: index + 1,
          excerpt: line.trim().slice(0, 160),
        });
      }
    }

    if (
      ABSOLUTE_PATH_PATTERN.test(line) &&
      !ALLOWED_ABSOLUTE_PATH_FILES.has(relativePath) &&
      !relativePath.startsWith("docs/") &&
      !relativePath.startsWith(".Codex/")
    ) {
      findings.push({
        file: relativePath,
        rule: "absolute-local-path",
        line: index + 1,
        excerpt: line.trim().slice(0, 160),
      });
    }
  }

  return findings;
}

function main(): void {
  const files: string[] = [];
  walk(ROOT, files);

  const findings = files.flatMap(scanFile);
  if (findings.length > 0) {
    console.error("Secret / private-path scan failed:");
    for (const finding of findings.slice(0, 50)) {
      console.error(`- [${finding.rule}] ${finding.file}:${finding.line} ${finding.excerpt}`);
    }
    if (findings.length > 50) {
      console.error(`… and ${findings.length - 50} more`);
    }
    process.exit(1);
  }

  console.log(`Secret / private-path scan passed (${files.length} files).`);
}

main();
