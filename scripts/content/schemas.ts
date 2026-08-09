import { z } from "zod";

export const PHASE_2_SCHEMA_VERSION = "phase-2.v1" as const;

export const CANONICAL_SOURCE_KEYS = [
  "curriculum-topics",
  "curriculum-grammar",
  "curriculum-vocabulary",
  "curriculum-texts",
] as const;

export const LIFECYCLE_STATUSES = [
  "draft",
  "needs_review",
  "reviewed",
  "approved",
  "archived",
] as const;

export const LEARNING_SKILLS = ["grammar", "vocabulary", "reading"] as const;

export const CONFIDENCE_LEVELS = ["high", "medium", "low"] as const;

/** Stable dotted logical ids, e.g. unit.u01, grammar.u01.n01, dict.집.home. */
export const logicalIdSchema = z
  .string()
  .trim()
  .regex(
    /^[a-z][a-z0-9]*(?:\.[a-z0-9][a-z0-9_-]*)+$/,
    "logical_id must be a dotted stable identifier",
  );

export const contentVersionSchema = z
  .string()
  .trim()
  .regex(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/, "content_version must be semver");

export const lifecycleStatusSchema = z.enum(LIFECYCLE_STATUSES);
export const learningSkillSchema = z.enum(LEARNING_SKILLS);
export const confidenceSchema = z.enum(CONFIDENCE_LEVELS);

const absolutePathPattern = /^(?:[A-Za-z]:[\\/]|\/|~[\\/])/;

export function containsAbsoluteLocalPath(value: string): boolean {
  if (absolutePathPattern.test(value)) {
    return true;
  }

  return value.includes("\\Users\\") || value.includes("/Users/") || value.includes("/home/");
}

export const relativeDocumentRefSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => !containsAbsoluteLocalPath(value), {
    message: "Absolute local paths are forbidden",
  })
  .refine((value) => !value.includes(".."), {
    message: "Parent-directory segments are forbidden in document refs",
  });

export const locatorSchema = z.strictObject({
  kind: z.enum(["section", "heading", "line-range", "table-row", "block-id"]),
  value: z.string().trim().min(1),
});

export const sourceRefSchema = z.strictObject({
  sourceId: z.string().trim().min(1),
  locator: locatorSchema,
  confidence: confidenceSchema,
});

export const reviewMetadataSchema = z.strictObject({
  reviewedAt: z.string().datetime({ offset: true }).optional(),
  note: z.string().trim().min(1).optional(),
});

type ReviewMetadata = {
  reviewedAt?: string | undefined;
  note?: string | undefined;
};

type LifecycleEntity = {
  status: (typeof LIFECYCLE_STATUSES)[number];
  sourceRefs: readonly unknown[];
  review?: ReviewMetadata | undefined;
};

export const localizedTextSchema = z.strictObject({
  ko: z.string().trim().min(1),
  ru: z.string().trim().min(1),
});

const entityBaseFields = {
  logicalId: logicalIdSchema,
  contentVersion: contentVersionSchema,
  status: lifecycleStatusSchema,
  sourceRefs: z.array(sourceRefSchema).min(1),
  review: reviewMetadataSchema.optional(),
};

function refineLifecycle(entity: LifecycleEntity, context: z.RefinementCtx): void {
  if (entity.sourceRefs.length === 0) {
    context.addIssue({
      code: "custom",
      message: "Every entity requires at least one source ref",
      path: ["sourceRefs"],
    });
  }

  if (entity.status === "needs_review" && !entity.review?.note) {
    context.addIssue({
      code: "custom",
      message: "needs_review requires review.note",
      path: ["review", "note"],
    });
  }

  if (entity.status === "reviewed" || entity.status === "approved") {
    if (!entity.review?.reviewedAt) {
      context.addIssue({
        code: "custom",
        message: `${entity.status} requires review.reviewedAt`,
        path: ["review", "reviewedAt"],
      });
    }
  }

  if (entity.status === "approved" && !entity.review?.note) {
    context.addIssue({
      code: "custom",
      message: "approved requires review.note",
      path: ["review", "note"],
    });
  }
}

/** Allowed authoring status changes when previousStatus is present. */
export const LIFECYCLE_TRANSITIONS: Readonly<
  Record<(typeof LIFECYCLE_STATUSES)[number], readonly (typeof LIFECYCLE_STATUSES)[number][]>
> = {
  draft: ["needs_review", "reviewed", "archived"],
  needs_review: ["draft", "reviewed", "archived"],
  reviewed: ["needs_review", "approved", "archived"],
  approved: ["archived"],
  archived: [],
};

export function assertLifecycleTransition(
  from: (typeof LIFECYCLE_STATUSES)[number],
  to: (typeof LIFECYCLE_STATUSES)[number],
): void {
  if (from === to) {
    return;
  }

  if (!LIFECYCLE_TRANSITIONS[from].includes(to)) {
    throw new Error(`Invalid lifecycle transition: ${from} -> ${to}`);
  }
}

export const sourceRecordSchema = z
  .strictObject({
    id: z.string().trim().min(1),
    key: z.enum(CANONICAL_SOURCE_KEYS),
    title: z.string().trim().min(1),
    kind: z.literal("canonical-authoring"),
    documentRef: relativeDocumentRefSchema,
    lineageKeys: z.array(z.string().trim().min(1)).default([]),
  })
  .superRefine((source, context) => {
    if (containsAbsoluteLocalPath(source.documentRef)) {
      context.addIssue({
        code: "custom",
        message: "Absolute local paths are forbidden",
        path: ["documentRef"],
      });
    }

    for (const [index, lineageKey] of source.lineageKeys.entries()) {
      if (containsAbsoluteLocalPath(lineageKey)) {
        context.addIssue({
          code: "custom",
          message: "Absolute local paths are forbidden in lineageKeys",
          path: ["lineageKeys", index],
        });
      }
    }
  });

export const sourceManifestSchema = z
  .strictObject({
    schemaVersion: z.literal(PHASE_2_SCHEMA_VERSION),
    sources: z.array(sourceRecordSchema),
  })
  .superRefine((manifest, context) => {
    const keys = new Set<string>();
    const ids = new Set<string>();

    for (const [index, source] of manifest.sources.entries()) {
      if (ids.has(source.id)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate source id: ${source.id}`,
          path: ["sources", index, "id"],
        });
      }
      ids.add(source.id);

      if (keys.has(source.key)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate canonical source key: ${source.key}`,
          path: ["sources", index, "key"],
        });
      }
      keys.add(source.key);
    }

    for (const requiredKey of CANONICAL_SOURCE_KEYS) {
      if (!keys.has(requiredKey)) {
        context.addIssue({
          code: "custom",
          message: `Missing required canonical source key: ${requiredKey}`,
          path: ["sources"],
        });
      }
    }
  });

export const unitRecordSchema = z
  .strictObject({
    ...entityBaseFields,
    unitNumber: z.number().int().min(1).max(16),
    slug: z
      .string()
      .trim()
      .regex(/^u(0[1-9]|1[0-6])(?:-[a-z0-9]+)*$/),
    title: localizedTextSchema,
    summary: localizedTextSchema.optional(),
  })
  .superRefine(refineLifecycle);

export const grammarTopicRecordSchema = z
  .strictObject({
    ...entityBaseFields,
    unitLogicalId: logicalIdSchema,
    patternKo: z.string().trim().min(1),
    category: z.string().trim().min(1),
    usageKey: z.string().trim().min(1).nullable(),
    title: localizedTextSchema,
    summary: localizedTextSchema.optional(),
  })
  .superRefine(refineLifecycle);

export const dictionaryEntryRecordSchema = z
  .strictObject({
    ...entityBaseFields,
    lemma: z.string().trim().min(1),
    senseKey: z.string().trim().min(1),
    gloss: localizedTextSchema,
    transliteration: z.string().trim().min(1).nullable(),
    level: z.string().trim().min(1).nullable(),
    pos: z.string().trim().min(1).nullable(),
  })
  .superRefine(refineLifecycle);

export const dictionaryUnitLinkRecordSchema = z
  .strictObject({
    logicalId: logicalIdSchema,
    contentVersion: contentVersionSchema,
    entryLogicalId: logicalIdSchema,
    unitLogicalId: logicalIdSchema,
    role: z.enum(["primary", "secondary", "review"]),
    sortOrder: z.number().int().nonnegative(),
    status: lifecycleStatusSchema,
    sourceRefs: z.array(sourceRefSchema).min(1),
    review: reviewMetadataSchema.optional(),
  })
  .superRefine(refineLifecycle);

export const readingPassageRecordSchema = z
  .strictObject({
    ...entityBaseFields,
    unitLogicalId: logicalIdSchema,
    title: localizedTextSchema,
    bodyKo: z.string().trim().min(1),
    bodyRu: z.string().trim().min(1).nullable(),
  })
  .superRefine(refineLifecycle);

export const exerciseOptionSchema = z.strictObject({
  id: z.string().trim().min(1),
  label: localizedTextSchema,
});

export const exerciseRecordSchema = z
  .strictObject({
    ...entityBaseFields,
    skill: learningSkillSchema,
    exerciseType: z.enum([
      "single-choice",
      "meaning-choice",
      "word-choice",
      "reverse-word-choice",
      "sentence-choice",
      "translation-matching",
      "word-matching",
      "fill-blank",
      "free-response",
    ]),
    unitLogicalId: logicalIdSchema,
    grammarTopicLogicalId: logicalIdSchema.nullable(),
    readingPassageLogicalId: logicalIdSchema.nullable(),
    dictionaryEntryLogicalIds: z.array(logicalIdSchema).default([]),
    prompt: localizedTextSchema,
    explanation: localizedTextSchema,
    difficulty: z.enum(["intro", "practice", "challenge"]),
    options: z.array(exerciseOptionSchema).default([]),
    correctOptionId: z.string().trim().min(1).nullable(),
    acceptedAnswers: z.array(z.string().trim().min(1)).default([]),
  })
  .superRefine((exercise, context) => {
    refineLifecycle(exercise, context);

    if (exercise.skill === "grammar" && !exercise.grammarTopicLogicalId) {
      context.addIssue({
        code: "custom",
        message: "grammar exercises require grammarTopicLogicalId",
        path: ["grammarTopicLogicalId"],
      });
    }

    if (exercise.skill === "reading" && !exercise.readingPassageLogicalId) {
      context.addIssue({
        code: "custom",
        message: "reading exercises require readingPassageLogicalId",
        path: ["readingPassageLogicalId"],
      });
    }

    if (exercise.skill === "vocabulary" && exercise.dictionaryEntryLogicalIds.length === 0) {
      context.addIssue({
        code: "custom",
        message: "vocabulary exercises require dictionaryEntryLogicalIds",
        path: ["dictionaryEntryLogicalIds"],
      });
    }

    if (exercise.exerciseType === "single-choice") {
      if (exercise.options.length < 2) {
        context.addIssue({
          code: "custom",
          message: "single-choice requires at least 2 options",
          path: ["options"],
        });
      }

      const optionIds = exercise.options.map((option) => option.id);
      if (new Set(optionIds).size !== optionIds.length) {
        context.addIssue({
          code: "custom",
          message: "single-choice options must have unique ids",
          path: ["options"],
        });
      }

      if (!exercise.correctOptionId || !optionIds.includes(exercise.correctOptionId)) {
        context.addIssue({
          code: "custom",
          message: "single-choice requires exactly one correctOptionId from options",
          path: ["correctOptionId"],
        });
      }
    }

    if (exercise.status === "approved" && (!exercise.explanation.ko || !exercise.explanation.ru)) {
      context.addIssue({
        code: "custom",
        message: "approved exercises require explanation",
        path: ["explanation"],
      });
    }
  });

export const provenanceRecordSchema = z.strictObject({
  logicalId: logicalIdSchema,
  subjectLogicalId: logicalIdSchema,
  contentVersion: contentVersionSchema,
  sourceRefs: z.array(sourceRefSchema).min(1),
  notes: z.string().trim().min(1).optional(),
});

function collectionSchema<T extends z.ZodType>(itemSchema: T) {
  return z.strictObject({
    schemaVersion: z.literal(PHASE_2_SCHEMA_VERSION),
    items: z.array(itemSchema),
  });
}

export const unitsFileSchema = collectionSchema(unitRecordSchema);
export const grammarTopicsFileSchema = collectionSchema(grammarTopicRecordSchema);
export const dictionaryEntriesFileSchema = collectionSchema(dictionaryEntryRecordSchema);
export const dictionaryUnitLinksFileSchema = collectionSchema(dictionaryUnitLinkRecordSchema);
export const readingPassagesFileSchema = collectionSchema(readingPassageRecordSchema);
export const exercisesFileSchema = collectionSchema(exerciseRecordSchema);
export const provenanceFileSchema = collectionSchema(provenanceRecordSchema);

export type SourceManifest = z.infer<typeof sourceManifestSchema>;
export type UnitRecord = z.infer<typeof unitRecordSchema>;
export type GrammarTopicRecord = z.infer<typeof grammarTopicRecordSchema>;
export type DictionaryEntryRecord = z.infer<typeof dictionaryEntryRecordSchema>;
export type ExerciseRecord = z.infer<typeof exerciseRecordSchema>;
export type ProvenanceRecord = z.infer<typeof provenanceRecordSchema>;

export const KNOWN_SCHEMA_VERSIONS: ReadonlySet<string> = new Set([PHASE_2_SCHEMA_VERSION]);
