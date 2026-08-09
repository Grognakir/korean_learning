import { z } from "zod";

import {
  ANSWER_REASON_CODES,
  TRAINING_SESSION_MODES,
  TRAINING_SESSION_SCHEMA_VERSION,
  TRAINING_SESSION_STATUSES,
} from "../domain";
import { exerciseTextSchema } from "@/lib/validation/exerciseSchema";

import { TRAINING_SESSION_STORAGE_VERSION } from "./types";

const isoDateTimeSchema = z.string().datetime({ offset: true });

const choiceSubmissionSchema = z.strictObject({
  exerciseId: z.uuid(),
  type: z.enum(["meaning-choice", "honorific-choice", "plain-choice", "single-choice"]),
  optionId: z.string().min(1),
});

const freeResponseSubmissionSchema = z.strictObject({
  exerciseId: z.uuid(),
  type: z.literal("free-response"),
  answer: z.string(),
});

const fillBlankSubmissionSchema = z.strictObject({
  exerciseId: z.uuid(),
  type: z.literal("fill-blank"),
  answers: z.array(
    z.strictObject({
      blankId: z.string().min(1),
      answer: z.string(),
    }),
  ),
});

const matchingSubmissionSchema = z.strictObject({
  exerciseId: z.uuid(),
  type: z.enum(["matching-translation", "matching-honorific"]),
  matches: z.array(
    z.strictObject({
      leftPairId: z.string().min(1),
      rightPairId: z.string(),
    }),
  ),
});

const answerSubmissionSchema = z.discriminatedUnion("type", [
  choiceSubmissionSchema,
  freeResponseSubmissionSchema,
  fillBlankSubmissionSchema,
  matchingSubmissionSchema,
]);

const correctAnswerSchema = z.discriminatedUnion("kind", [
  z.strictObject({
    kind: z.literal("choice"),
    optionId: z.string().min(1),
  }),
  z.strictObject({
    kind: z.literal("free-response"),
    answer: z.string().min(1),
  }),
  z.strictObject({
    kind: z.literal("fill-blank"),
    answers: z.array(
      z.strictObject({
        blankId: z.string().min(1),
        answer: z.string().min(1),
      }),
    ),
  }),
  z.strictObject({
    kind: z.literal("matching"),
    matches: z.array(
      z.strictObject({
        leftPairId: z.string().min(1),
        rightPairId: z.string().min(1),
      }),
    ),
  }),
]);

const evaluationBaseShape = {
  exerciseId: z.uuid(),
  isCorrect: z.boolean(),
  score: z.number(),
  maxScore: z.number(),
  scoreRatio: z.number(),
  reasonCode: z.enum(ANSWER_REASON_CODES),
  correctAnswer: correctAnswerSchema,
  explanation: exerciseTextSchema,
};

const choiceEvaluationSchema = z.strictObject({
  ...evaluationBaseShape,
  type: z.enum(["meaning-choice", "honorific-choice", "plain-choice", "single-choice"]),
  submission: choiceSubmissionSchema,
});

const freeResponseEvaluationSchema = z.strictObject({
  ...evaluationBaseShape,
  type: z.literal("free-response"),
  submission: freeResponseSubmissionSchema,
});

const fillBlankEvaluationSchema = z.strictObject({
  ...evaluationBaseShape,
  type: z.literal("fill-blank"),
  submission: fillBlankSubmissionSchema,
  itemResults: z.array(
    z.strictObject({
      blankId: z.string().min(1),
      isCorrect: z.boolean(),
      submittedAnswer: z.string(),
      canonicalAnswer: z.string(),
    }),
  ),
});

const matchingEvaluationSchema = z.strictObject({
  ...evaluationBaseShape,
  type: z.enum(["matching-translation", "matching-honorific"]),
  submission: matchingSubmissionSchema,
  itemResults: z.array(
    z.strictObject({
      leftPairId: z.string().min(1),
      rightPairId: z.string(),
      isCorrect: z.boolean(),
      correctRightPairId: z.string().min(1),
    }),
  ),
});

const answerEvaluationSchema = z.union([
  choiceEvaluationSchema,
  freeResponseEvaluationSchema,
  fillBlankEvaluationSchema,
  matchingEvaluationSchema,
]);

const attemptSnapshotSchema = z.strictObject({
  submissionId: z.string().min(1),
  exerciseId: z.uuid(),
  submittedAt: isoDateTimeSchema,
  submission: answerSubmissionSchema,
  evaluation: answerEvaluationSchema,
});

export const trainingSessionStateSchema = z.strictObject({
  schemaVersion: z.literal(TRAINING_SESSION_SCHEMA_VERSION),
  sessionId: z.string().min(1),
  moduleSlug: z.string().min(1),
  mode: z.enum(TRAINING_SESSION_MODES),
  seed: z.number().int(),
  status: z.enum(TRAINING_SESSION_STATUSES),
  queue: z.array(z.uuid()),
  currentIndex: z.number().int().nonnegative(),
  attempts: z.array(attemptSnapshotSchema),
  startedAt: isoDateTimeSchema,
  lastActivityAt: isoDateTimeSchema,
  completedAt: isoDateTimeSchema.nullable(),
  contentSnapshot: z.strictObject({
    contentVersion: z.string().min(1),
    exerciseIds: z.array(z.uuid()),
  }),
});

export const persistedTrainingSessionRecordSchema = z.strictObject({
  storageVersion: z.literal(TRAINING_SESSION_STORAGE_VERSION),
  savedAt: isoDateTimeSchema,
  expiresAt: isoDateTimeSchema,
  sessionState: trainingSessionStateSchema,
});
