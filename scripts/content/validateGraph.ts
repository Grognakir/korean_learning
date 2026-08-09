import { z } from "zod";

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

export type Phase2ContentGraph = {
  readonly manifest: SourceManifest;
  readonly units: z.infer<typeof unitsFileSchema>;
  readonly grammarTopics: z.infer<typeof grammarTopicsFileSchema>;
  readonly dictionaryEntries: z.infer<typeof dictionaryEntriesFileSchema>;
  readonly dictionaryUnitLinks: z.infer<typeof dictionaryUnitLinksFileSchema>;
  readonly readingPassages: z.infer<typeof readingPassagesFileSchema>;
  readonly exercisesGrammar: z.infer<typeof exercisesFileSchema>;
  readonly exercisesVocabulary: z.infer<typeof exercisesFileSchema>;
  readonly exercisesReading: z.infer<typeof exercisesFileSchema>;
  readonly provenance: z.infer<typeof provenanceFileSchema>;
};

function formatZodError(error: z.ZodError, fileLabel: string): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "(root)";
      return `${fileLabel}: ${path}: ${issue.message}`;
    })
    .join("\n");
}

export function parseWithSchema<T>(schema: z.ZodType<T>, value: unknown, fileLabel: string): T {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new ContentValidationError(formatZodError(result.error, fileLabel));
  }

  return result.data;
}

function collectDuplicateLogicalIds(
  items: readonly { logicalId: string; contentVersion: string }[],
  fileLabel: string,
  issues: string[],
): Set<string> {
  const seen = new Set<string>();
  const ids = new Set<string>();

  for (const item of items) {
    const key = `${item.logicalId}@${item.contentVersion}`;
    if (seen.has(key)) {
      issues.push(`${fileLabel}: duplicate logical id/version ${key}`);
    }
    seen.add(key);
    ids.add(item.logicalId);
  }

  return ids;
}

export function assertContentGraphIntegrity(graph: Phase2ContentGraph): void {
  const issues: string[] = [];
  const sourceIds = new Set(graph.manifest.sources.map((source) => source.id));

  const unitIds = collectDuplicateLogicalIds(graph.units.items, "units.json", issues);
  const grammarIds = collectDuplicateLogicalIds(
    graph.grammarTopics.items,
    "grammar-topics.json",
    issues,
  );
  const dictionaryIds = collectDuplicateLogicalIds(
    graph.dictionaryEntries.items,
    "dictionary-entries.json",
    issues,
  );
  collectDuplicateLogicalIds(graph.dictionaryUnitLinks.items, "dictionary-unit-links.json", issues);
  const passageIds = collectDuplicateLogicalIds(
    graph.readingPassages.items,
    "reading-passages.json",
    issues,
  );
  const exerciseIds = new Set<string>();

  for (const [fileLabel, file] of [
    ["exercises-grammar.json", graph.exercisesGrammar],
    ["exercises-vocabulary.json", graph.exercisesVocabulary],
    ["exercises-reading.json", graph.exercisesReading],
  ] as const) {
    for (const item of file.items) {
      const key = `${item.logicalId}@${item.contentVersion}`;
      if (exerciseIds.has(key)) {
        issues.push(`${fileLabel}: duplicate logical id/version ${key}`);
      }
      exerciseIds.add(key);
    }
  }

  collectDuplicateLogicalIds(graph.provenance.items, "provenance.json", issues);

  // Homonyms (same lemma, different senses) are allowed; same lemma+senseKey is not.
  const lemmaSenseKeys = new Set<string>();
  for (const entry of graph.dictionaryEntries.items) {
    if (!entry.senseKey.trim()) {
      issues.push(`dictionary-entries.json: ${entry.logicalId} missing senseKey`);
    }

    const key = `${entry.lemma}::${entry.senseKey}`;
    if (lemmaSenseKeys.has(key)) {
      issues.push(
        `dictionary-entries.json: duplicate lemma/senseKey pair ${entry.lemma}/${entry.senseKey}`,
      );
    }
    lemmaSenseKeys.add(key);
  }

  function assertSourceRefs(
    fileLabel: string,
    logicalId: string,
    sourceRefs: readonly { sourceId: string }[],
  ): void {
    if (sourceRefs.length === 0) {
      issues.push(`${fileLabel}: ${logicalId} has empty sourceRefs`);
      return;
    }

    for (const ref of sourceRefs) {
      if (!sourceIds.has(ref.sourceId)) {
        issues.push(`${fileLabel}: ${logicalId} dangling sourceRef "${ref.sourceId}"`);
      }
    }
  }

  for (const unit of graph.units.items) {
    assertSourceRefs("units.json", unit.logicalId, unit.sourceRefs);
  }

  for (const topic of graph.grammarTopics.items) {
    assertSourceRefs("grammar-topics.json", topic.logicalId, topic.sourceRefs);
    if (!unitIds.has(topic.unitLogicalId)) {
      issues.push(
        `grammar-topics.json: ${topic.logicalId} dangling unitLogicalId ${topic.unitLogicalId}`,
      );
    }
  }

  for (const entry of graph.dictionaryEntries.items) {
    assertSourceRefs("dictionary-entries.json", entry.logicalId, entry.sourceRefs);
  }

  for (const link of graph.dictionaryUnitLinks.items) {
    assertSourceRefs("dictionary-unit-links.json", link.logicalId, link.sourceRefs);
    if (!dictionaryIds.has(link.entryLogicalId)) {
      issues.push(
        `dictionary-unit-links.json: ${link.logicalId} dangling entryLogicalId ${link.entryLogicalId}`,
      );
    }
    if (!unitIds.has(link.unitLogicalId)) {
      issues.push(
        `dictionary-unit-links.json: ${link.logicalId} dangling unitLogicalId ${link.unitLogicalId}`,
      );
    }
  }

  for (const passage of graph.readingPassages.items) {
    assertSourceRefs("reading-passages.json", passage.logicalId, passage.sourceRefs);
    if (!unitIds.has(passage.unitLogicalId)) {
      issues.push(
        `reading-passages.json: ${passage.logicalId} dangling unitLogicalId ${passage.unitLogicalId}`,
      );
    }
  }

  const allExercises = [
    ...graph.exercisesGrammar.items.map((item) => ["exercises-grammar.json", item] as const),
    ...graph.exercisesVocabulary.items.map((item) => ["exercises-vocabulary.json", item] as const),
    ...graph.exercisesReading.items.map((item) => ["exercises-reading.json", item] as const),
  ];

  const approvedSubjects = new Set<string>();

  for (const [fileLabel, exercise] of allExercises) {
    assertSourceRefs(fileLabel, exercise.logicalId, exercise.sourceRefs);

    if (!unitIds.has(exercise.unitLogicalId)) {
      issues.push(
        `${fileLabel}: ${exercise.logicalId} dangling unitLogicalId ${exercise.unitLogicalId}`,
      );
    }

    if (exercise.grammarTopicLogicalId && !grammarIds.has(exercise.grammarTopicLogicalId)) {
      issues.push(
        `${fileLabel}: ${exercise.logicalId} dangling grammarTopicLogicalId ${exercise.grammarTopicLogicalId}`,
      );
    }

    if (exercise.readingPassageLogicalId && !passageIds.has(exercise.readingPassageLogicalId)) {
      issues.push(
        `${fileLabel}: ${exercise.logicalId} dangling readingPassageLogicalId ${exercise.readingPassageLogicalId}`,
      );
    }

    for (const entryId of exercise.dictionaryEntryLogicalIds) {
      if (!dictionaryIds.has(entryId)) {
        issues.push(
          `${fileLabel}: ${exercise.logicalId} dangling dictionaryEntryLogicalId ${entryId}`,
        );
      }
    }

    if (exercise.status === "approved") {
      approvedSubjects.add(exercise.logicalId);
    }
  }

  for (const unit of graph.units.items) {
    if (unit.status === "approved") {
      approvedSubjects.add(unit.logicalId);
    }
  }
  for (const topic of graph.grammarTopics.items) {
    if (topic.status === "approved") {
      approvedSubjects.add(topic.logicalId);
    }
  }
  for (const entry of graph.dictionaryEntries.items) {
    if (entry.status === "approved") {
      approvedSubjects.add(entry.logicalId);
    }
  }
  for (const passage of graph.readingPassages.items) {
    if (passage.status === "approved") {
      approvedSubjects.add(passage.logicalId);
    }
  }

  const provenanceSubjects = new Set(graph.provenance.items.map((item) => item.subjectLogicalId));

  for (const subject of approvedSubjects) {
    if (!provenanceSubjects.has(subject)) {
      issues.push(`provenance.json: approved subject missing provenance: ${subject}`);
    }
  }

  for (const record of graph.provenance.items) {
    assertSourceRefs("provenance.json", record.logicalId, record.sourceRefs);
  }

  if (issues.length > 0) {
    throw new ContentValidationError(issues.join("\n"));
  }
}

export { sourceManifestSchema };
