import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

export const PHASE_2_CONTENT_ROOT = path.join(process.cwd(), "content", "phase-2");
export const KNOWN_SCHEMA_VERSIONS: ReadonlySet<string> = new Set(["phase-2.v1"]);
export const SOURCE_MANIFEST_FILE = "source-manifest.json";

export class ContentValidationError extends Error {
  readonly code = "CONTENT_VALIDATION_FAILED" as const;

  constructor(message: string) {
    super(message);
    this.name = "ContentValidationError";
  }
}

export type SourceManifest = {
  readonly schemaVersion: string;
  readonly sources: readonly unknown[];
};

const FORBIDDEN_CONTENT_IMPORT =
  /(?:from\s+|import\s*\(\s*|require\s*\(\s*)['"](?:\.?\.?\/)*(?:content\/phase-2|@\/\.\.\/content\/phase-2)/;

export function loadJsonFile(filePath: string): unknown {
  const raw = readFileSync(filePath, "utf8");

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new ContentValidationError(`Invalid JSON: ${path.relative(process.cwd(), filePath)}`);
  }
}

export function validateSourceManifest(value: unknown, filePath: string): SourceManifest {
  const relativePath = path.relative(process.cwd(), filePath);

  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new ContentValidationError(`Source manifest must be an object: ${relativePath}`);
  }

  const record = value as Record<string, unknown>;
  const schemaVersion = record.schemaVersion;

  if (typeof schemaVersion !== "string" || schemaVersion.trim().length === 0) {
    throw new ContentValidationError(`Missing schemaVersion: ${relativePath}`);
  }

  if (!KNOWN_SCHEMA_VERSIONS.has(schemaVersion)) {
    throw new ContentValidationError(
      `Unknown schema version "${schemaVersion}" in ${relativePath}. Known: ${[
        ...KNOWN_SCHEMA_VERSIONS,
      ].join(", ")}`,
    );
  }

  if (!Array.isArray(record.sources)) {
    throw new ContentValidationError(`Source manifest "sources" must be an array: ${relativePath}`);
  }

  return {
    schemaVersion,
    sources: record.sources,
  };
}

export function validatePhase2Content(
  rootDirectory: string = PHASE_2_CONTENT_ROOT,
): SourceManifest {
  if (!existsSync(rootDirectory) || !statSync(rootDirectory).isDirectory()) {
    throw new ContentValidationError(
      `Missing content directory: ${path.relative(process.cwd(), rootDirectory)}`,
    );
  }

  const manifestPath = path.join(rootDirectory, SOURCE_MANIFEST_FILE);

  if (!existsSync(manifestPath)) {
    throw new ContentValidationError(
      `Missing ${SOURCE_MANIFEST_FILE} in ${path.relative(process.cwd(), rootDirectory)}`,
    );
  }

  return validateSourceManifest(loadJsonFile(manifestPath), manifestPath);
}

function collectSourceFiles(directory: string): string[] {
  if (!existsSync(directory)) {
    return [];
  }

  const entries = readdirSync(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") {
        continue;
      }

      files.push(...collectSourceFiles(fullPath));
      continue;
    }

    if (entry.isFile() && /\.(?:ts|tsx|js|jsx|mts|cts)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Canonical content/ must stay outside the Next.js app graph.
 * App code loads published content only through repositories.
 */
export function assertNoAppContentImports(
  sourceRoot: string = path.join(process.cwd(), "src"),
): void {
  const offenders: string[] = [];

  for (const filePath of collectSourceFiles(sourceRoot)) {
    const contents = readFileSync(filePath, "utf8");

    if (FORBIDDEN_CONTENT_IMPORT.test(contents)) {
      offenders.push(path.relative(process.cwd(), filePath));
    }
  }

  if (offenders.length > 0) {
    throw new ContentValidationError(
      `Forbidden content/phase-2 import in app graph:\n- ${offenders.join("\n- ")}`,
    );
  }
}
