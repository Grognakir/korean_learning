import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { ContentValidationError } from "./contentValidationError";
import {
  dictionaryEntriesFileSchema,
  dictionaryUnitLinksFileSchema,
  exercisesFileSchema,
  grammarTopicsFileSchema,
  provenanceFileSchema,
  readingPassagesFileSchema,
  sourceManifestSchema,
  unitsFileSchema,
  type SourceManifest,
} from "./schemas";
import {
  assertContentGraphIntegrity,
  parseWithSchema,
  type Phase2ContentGraph,
} from "./validateGraph";

export { ContentValidationError } from "./contentValidationError";
export { KNOWN_SCHEMA_VERSIONS, PHASE_2_SCHEMA_VERSION } from "./schemas";

export const PHASE_2_CONTENT_ROOT = path.join(process.cwd(), "content", "phase-2");
export const SOURCE_MANIFEST_FILE = "source-manifest.json";

const CONTENT_FILES = {
  units: "units.json",
  grammarTopics: "grammar-topics.json",
  dictionaryEntries: "dictionary-entries.json",
  dictionaryUnitLinks: "dictionary-unit-links.json",
  readingPassages: "reading-passages.json",
  exercisesGrammar: "exercises-grammar.json",
  exercisesVocabulary: "exercises-vocabulary.json",
  exercisesReading: "exercises-reading.json",
  provenance: "provenance.json",
} as const;

const FORBIDDEN_CONTENT_IMPORT =
  /(?:from\s+|import\s*\(\s*|require\s*\(\s*)['"](?:\.?\.?\/)*(?:content\/phase-2|@\/\.\.\/content\/phase-2)/;

export type { SourceManifest };

export function loadJsonFile(filePath: string): unknown {
  const raw = readFileSync(filePath, "utf8");

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new ContentValidationError(`Invalid JSON: ${path.relative(process.cwd(), filePath)}`);
  }
}

export function validateSourceManifest(value: unknown, filePath: string): SourceManifest {
  return parseWithSchema(sourceManifestSchema, value, path.relative(process.cwd(), filePath));
}

function requireFile(rootDirectory: string, fileName: string): string {
  const filePath = path.join(rootDirectory, fileName);

  if (!existsSync(filePath)) {
    throw new ContentValidationError(
      `Missing ${fileName} in ${path.relative(process.cwd(), rootDirectory)}`,
    );
  }

  return filePath;
}

export function loadPhase2ContentGraph(
  rootDirectory: string = PHASE_2_CONTENT_ROOT,
): Phase2ContentGraph {
  if (!existsSync(rootDirectory) || !statSync(rootDirectory).isDirectory()) {
    throw new ContentValidationError(
      `Missing content directory: ${path.relative(process.cwd(), rootDirectory)}`,
    );
  }

  const manifestPath = requireFile(rootDirectory, SOURCE_MANIFEST_FILE);
  const manifest = validateSourceManifest(loadJsonFile(manifestPath), manifestPath);

  return {
    manifest,
    units: parseWithSchema(
      unitsFileSchema,
      loadJsonFile(requireFile(rootDirectory, CONTENT_FILES.units)),
      CONTENT_FILES.units,
    ),
    grammarTopics: parseWithSchema(
      grammarTopicsFileSchema,
      loadJsonFile(requireFile(rootDirectory, CONTENT_FILES.grammarTopics)),
      CONTENT_FILES.grammarTopics,
    ),
    dictionaryEntries: parseWithSchema(
      dictionaryEntriesFileSchema,
      loadJsonFile(requireFile(rootDirectory, CONTENT_FILES.dictionaryEntries)),
      CONTENT_FILES.dictionaryEntries,
    ),
    dictionaryUnitLinks: parseWithSchema(
      dictionaryUnitLinksFileSchema,
      loadJsonFile(requireFile(rootDirectory, CONTENT_FILES.dictionaryUnitLinks)),
      CONTENT_FILES.dictionaryUnitLinks,
    ),
    readingPassages: parseWithSchema(
      readingPassagesFileSchema,
      loadJsonFile(requireFile(rootDirectory, CONTENT_FILES.readingPassages)),
      CONTENT_FILES.readingPassages,
    ),
    exercisesGrammar: parseWithSchema(
      exercisesFileSchema,
      loadJsonFile(requireFile(rootDirectory, CONTENT_FILES.exercisesGrammar)),
      CONTENT_FILES.exercisesGrammar,
    ),
    exercisesVocabulary: parseWithSchema(
      exercisesFileSchema,
      loadJsonFile(requireFile(rootDirectory, CONTENT_FILES.exercisesVocabulary)),
      CONTENT_FILES.exercisesVocabulary,
    ),
    exercisesReading: parseWithSchema(
      exercisesFileSchema,
      loadJsonFile(requireFile(rootDirectory, CONTENT_FILES.exercisesReading)),
      CONTENT_FILES.exercisesReading,
    ),
    provenance: parseWithSchema(
      provenanceFileSchema,
      loadJsonFile(requireFile(rootDirectory, CONTENT_FILES.provenance)),
      CONTENT_FILES.provenance,
    ),
  };
}

export function validatePhase2Content(
  rootDirectory: string = PHASE_2_CONTENT_ROOT,
): SourceManifest {
  const graph = loadPhase2ContentGraph(rootDirectory);
  assertContentGraphIntegrity(graph);
  return graph.manifest;
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
