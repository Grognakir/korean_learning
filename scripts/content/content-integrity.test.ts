import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  assertNoAppContentImports,
  ContentValidationError,
  loadPhase2ContentGraph,
  PHASE_2_CONTENT_ROOT,
  validatePhase2Content,
  validateSourceManifest,
} from "./contentValidation";
import {
  assertLifecycleTransition,
  CANONICAL_SOURCE_KEYS,
  containsAbsoluteLocalPath,
  dictionaryEntryRecordSchema,
  exerciseRecordSchema,
  relativeDocumentRefSchema,
  sourceManifestSchema,
  sourceRecordSchema,
} from "./schemas";
import { assertContentGraphIntegrity } from "./validateGraph";

const tempRoots: string[] = [];

afterEach(() => {
  while (tempRoots.length > 0) {
    const root = tempRoots.pop();
    if (root) {
      rmSync(root, { force: true, recursive: true });
    }
  }
});

function createTempRoot(): string {
  const root = mkdtempSync(path.join(tmpdir(), "phase-2-content-"));
  tempRoots.push(root);
  return root;
}

const emptyCollection = {
  schemaVersion: "phase-2.v1",
  items: [],
} as const;

const fourSources = CANONICAL_SOURCE_KEYS.map((key) => ({
  id: `src.${key}`,
  key,
  title: `Canonical ${key}`,
  kind: "canonical-authoring" as const,
  documentRef: `docs/CURRICULUM_${key.replace("curriculum-", "").toUpperCase()}.md`,
  lineageKeys: [] as string[],
}));

function writeMinimalTree(root: string, overrides: Partial<Record<string, unknown>> = {}): void {
  const files: Record<string, unknown> = {
    "source-manifest.json": {
      schemaVersion: "phase-2.v1",
      sources: fourSources,
    },
    "units.json": emptyCollection,
    "grammar-topics.json": emptyCollection,
    "dictionary-entries.json": emptyCollection,
    "dictionary-unit-links.json": emptyCollection,
    "reading-passages.json": emptyCollection,
    "exercises-grammar.json": emptyCollection,
    "exercises-vocabulary.json": emptyCollection,
    "exercises-reading.json": emptyCollection,
    "provenance.json": emptyCollection,
    ...overrides,
  };

  for (const [name, value] of Object.entries(files)) {
    writeFileSync(
      path.join(root, name),
      typeof value === "string" ? value : `${JSON.stringify(value, null, 2)}\n`,
      "utf8",
    );
  }
}

describe("phase-2 content contracts", () => {
  it("accepts the repository empty graph with four canonical sources", () => {
    const manifest = validatePhase2Content(PHASE_2_CONTENT_ROOT);

    expect(manifest.schemaVersion).toBe("phase-2.v1");
    expect(manifest.sources.map((source) => source.key).sort()).toEqual(
      [...CANONICAL_SOURCE_KEYS].sort(),
    );
    expect(manifest.sources.every((source) => !containsAbsoluteLocalPath(source.documentRef))).toBe(
      true,
    );
  });

  it("rejects invalid JSON in the source manifest", () => {
    const root = createTempRoot();
    writeMinimalTree(root, { "source-manifest.json": "{ not-json" });

    expect(() => validatePhase2Content(root)).toThrow(ContentValidationError);
    expect(() => validatePhase2Content(root)).toThrow(/Invalid JSON/);
  });

  it("rejects an unknown schema version", () => {
    expect(() =>
      validateSourceManifest(
        { schemaVersion: "phase-2.v0-unknown", sources: fourSources },
        "source-manifest.json",
      ),
    ).toThrow(/schemaVersion|Invalid/);
  });

  it("rejects a manifest missing any canonical source key", () => {
    const sources = fourSources.slice(0, 3);
    const result = sourceManifestSchema.safeParse({
      schemaVersion: "phase-2.v1",
      sources,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) =>
          /Missing required canonical source key/.test(issue.message),
        ),
      ).toBe(true);
    }
  });

  it("rejects absolute local paths in document refs", () => {
    const result = relativeDocumentRefSchema.safeParse("/Users/me/docs/CURRICULUM_TOPICS.md");
    expect(result.success).toBe(false);

    const sourceResult = sourceRecordSchema.safeParse({
      id: "src.curriculum-topics",
      key: "curriculum-topics",
      title: "Topics",
      kind: "canonical-authoring",
      documentRef: "/Users/me/secret/topics.md",
      lineageKeys: [],
    });
    expect(sourceResult.success).toBe(false);
  });

  it("rejects empty sourceRefs on entities", () => {
    const result = dictionaryEntryRecordSchema.safeParse({
      logicalId: "dict.jip.home",
      contentVersion: "1.0.0",
      status: "draft",
      sourceRefs: [],
      lemma: "집",
      senseKey: "home",
      gloss: { ko: "집", ru: "дом" },
      transliteration: null,
      level: null,
      pos: null,
    });

    expect(result.success).toBe(false);
  });

  it("rejects approved entities without review metadata", () => {
    const result = dictionaryEntryRecordSchema.safeParse({
      logicalId: "dict.jip.home",
      contentVersion: "1.0.0",
      status: "approved",
      sourceRefs: [
        {
          sourceId: "src.curriculum-vocabulary",
          locator: { kind: "heading", value: "집" },
          confidence: "high",
        },
      ],
      lemma: "집",
      senseKey: "home",
      gloss: { ko: "집", ru: "дом" },
      transliteration: null,
      level: null,
      pos: null,
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid lifecycle transitions", () => {
    expect(() => assertLifecycleTransition("approved", "draft")).toThrow(
      /Invalid lifecycle transition/,
    );
    expect(() => assertLifecycleTransition("draft", "needs_review")).not.toThrow();
  });

  it("rejects dictionary senses without senseKey and duplicate lemma/sense pairs", () => {
    const missingSense = dictionaryEntryRecordSchema.safeParse({
      logicalId: "dict.jip.missing",
      contentVersion: "1.0.0",
      status: "draft",
      sourceRefs: [
        {
          sourceId: "src.curriculum-vocabulary",
          locator: { kind: "heading", value: "집" },
          confidence: "medium",
        },
      ],
      lemma: "집",
      senseKey: "",
      gloss: { ko: "집", ru: "дом" },
      transliteration: null,
      level: null,
      pos: null,
    });
    expect(missingSense.success).toBe(false);

    const root = createTempRoot();
    writeMinimalTree(root, {
      "dictionary-entries.json": {
        schemaVersion: "phase-2.v1",
        items: [
          {
            logicalId: "dict.jip.home.a",
            contentVersion: "1.0.0",
            status: "draft",
            sourceRefs: [
              {
                sourceId: "src.curriculum-vocabulary",
                locator: { kind: "heading", value: "집" },
                confidence: "medium",
              },
            ],
            lemma: "집",
            senseKey: "home",
            gloss: { ko: "집", ru: "дом" },
            transliteration: null,
            level: null,
            pos: null,
          },
          {
            logicalId: "dict.jip.home.b",
            contentVersion: "1.0.0",
            status: "draft",
            sourceRefs: [
              {
                sourceId: "src.curriculum-vocabulary",
                locator: { kind: "heading", value: "집" },
                confidence: "medium",
              },
            ],
            lemma: "집",
            senseKey: "home",
            gloss: { ko: "집", ru: "дом" },
            transliteration: null,
            level: null,
            pos: null,
          },
        ],
      },
    });

    expect(() => validatePhase2Content(root)).toThrow(/duplicate lemma\/senseKey/);
  });

  it("rejects dangling cross-file references and duplicate logical ids", () => {
    const root = createTempRoot();
    writeMinimalTree(root, {
      "grammar-topics.json": {
        schemaVersion: "phase-2.v1",
        items: [
          {
            logicalId: "grammar.u01.n01",
            contentVersion: "1.0.0",
            status: "draft",
            sourceRefs: [
              {
                sourceId: "src.curriculum-grammar",
                locator: { kind: "section", value: "u01-1" },
                confidence: "high",
              },
            ],
            unitLogicalId: "unit.u01.missing",
            patternKo: "N입니다",
            category: "copula",
            usageKey: null,
            title: { ko: "N입니다", ru: "являться" },
          },
        ],
      },
    });

    expect(() => validatePhase2Content(root)).toThrow(/dangling unitLogicalId/);

    const duplicateRoot = createTempRoot();
    writeMinimalTree(duplicateRoot, {
      "units.json": {
        schemaVersion: "phase-2.v1",
        items: [
          {
            logicalId: "unit.u01.intro",
            contentVersion: "1.0.0",
            status: "draft",
            sourceRefs: [
              {
                sourceId: "src.curriculum-topics",
                locator: { kind: "section", value: "1" },
                confidence: "high",
              },
            ],
            unitNumber: 1,
            slug: "u01-intro",
            title: { ko: "인사", ru: "Приветствие" },
          },
          {
            logicalId: "unit.u01.intro",
            contentVersion: "1.0.0",
            status: "draft",
            sourceRefs: [
              {
                sourceId: "src.curriculum-topics",
                locator: { kind: "section", value: "1" },
                confidence: "high",
              },
            ],
            unitNumber: 1,
            slug: "u01-intro-dup",
            title: { ko: "인사", ru: "Приветствие" },
          },
        ],
      },
    });

    expect(() => validatePhase2Content(duplicateRoot)).toThrow(/duplicate logical id/);
  });

  it("rejects approved subjects without provenance records", () => {
    const root = createTempRoot();
    writeMinimalTree(root, {
      "units.json": {
        schemaVersion: "phase-2.v1",
        items: [
          {
            logicalId: "unit.u01.intro",
            contentVersion: "1.0.0",
            status: "approved",
            sourceRefs: [
              {
                sourceId: "src.curriculum-topics",
                locator: { kind: "section", value: "1" },
                confidence: "high",
              },
            ],
            review: {
              reviewedAt: "2026-08-09T00:00:00.000Z",
              note: "accepted",
            },
            unitNumber: 1,
            slug: "u01-intro",
            title: { ko: "인사", ru: "Приветствие" },
          },
        ],
      },
    });

    expect(() => validatePhase2Content(root)).toThrow(/missing provenance/);
  });

  it("rejects single-choice exercises without a unique correct option", () => {
    const result = exerciseRecordSchema.safeParse({
      logicalId: "ex.grammar.u01.n01.sc01",
      contentVersion: "1.0.0",
      status: "draft",
      sourceRefs: [
        {
          sourceId: "src.curriculum-grammar",
          locator: { kind: "section", value: "u01-1" },
          confidence: "high",
        },
      ],
      skill: "grammar",
      exerciseType: "single-choice",
      unitLogicalId: "unit.u01.intro",
      grammarTopicLogicalId: "grammar.u01.n01",
      readingPassageLogicalId: null,
      dictionaryEntryLogicalIds: [],
      prompt: { ko: "고르세요", ru: "Выберите" },
      explanation: { ko: "설명", ru: "Пояснение" },
      difficulty: "intro",
      options: [
        { id: "a", label: { ko: "A", ru: "A" } },
        { id: "b", label: { ko: "B", ru: "B" } },
      ],
      correctOptionId: "missing",
      acceptedAnswers: [],
    });

    expect(result.success).toBe(false);
  });

  it("passes the app-graph content import boundary for src/", () => {
    expect(() => assertNoAppContentImports()).not.toThrow();
  });

  it("fails when an app source file imports content/phase-2", () => {
    const root = createTempRoot();
    const appFile = path.join(root, "modules", "bad.ts");
    mkdirSync(path.dirname(appFile), { recursive: true });
    writeFileSync(
      appFile,
      'import manifest from "../../../content/phase-2/source-manifest.json";\nexport const value = manifest;\n',
      "utf8",
    );

    expect(() => assertNoAppContentImports(root)).toThrow(ContentValidationError);
    expect(() => assertNoAppContentImports(root)).toThrow(/Forbidden content\/phase-2 import/);
  });

  it("loads the repository graph and re-validates integrity", () => {
    const graph = loadPhase2ContentGraph(PHASE_2_CONTENT_ROOT);
    expect(() => assertContentGraphIntegrity(graph)).not.toThrow();
  });
});
