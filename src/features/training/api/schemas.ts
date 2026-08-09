import { z } from "zod";

import { TRAINING_SESSION_MODES } from "../domain";

const semverSchema = z.string().regex(/^\d+\.\d+\.\d+$/);
const idempotencyKeySchema = z.string().trim().min(1).max(128);
const uuidSchema = z.uuid();

const choiceSubmissionSchema = z.strictObject({
  exerciseId: uuidSchema,
  type: z.enum(["meaning-choice", "honorific-choice", "plain-choice", "single-choice"]),
  optionId: z.string().min(1),
});

const freeResponseSubmissionSchema = z.strictObject({
  exerciseId: uuidSchema,
  type: z.literal("free-response"),
  answer: z.string(),
});

const fillBlankSubmissionSchema = z.strictObject({
  exerciseId: uuidSchema,
  type: z.literal("fill-blank"),
  answers: z.array(
    z.strictObject({
      blankId: z.string().min(1),
      answer: z.string(),
    }),
  ),
});

const matchingSubmissionSchema = z.strictObject({
  exerciseId: uuidSchema,
  type: z.enum(["matching-translation", "matching-honorific"]),
  matches: z.array(
    z.strictObject({
      leftPairId: z.string().min(1),
      rightPairId: z.string(),
    }),
  ),
});

export const answerSubmissionRequestSchema = z.discriminatedUnion("type", [
  choiceSubmissionSchema,
  freeResponseSubmissionSchema,
  fillBlankSubmissionSchema,
  matchingSubmissionSchema,
]);

export const startTrainingSessionRequestSchema = z.strictObject({
  moduleId: uuidSchema,
  mode: z.enum(TRAINING_SESSION_MODES),
  contentVersion: semverSchema,
  exerciseIds: z.array(uuidSchema).min(1),
  idempotencyKey: idempotencyKeySchema,
  randomSeed: z.string().trim().min(1).max(128),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
});

export const submitTrainingAttemptRequestSchema = z.strictObject({
  exerciseId: uuidSchema,
  contentVersion: semverSchema,
  idempotencyKey: idempotencyKeySchema,
  submission: answerSubmissionRequestSchema,
  durationMs: z.number().int().nonnegative().optional(),
});

export const completeTrainingSessionRequestSchema = z.strictObject({
  idempotencyKey: idempotencyKeySchema,
  completedAt: z.string().datetime({ offset: true }).optional(),
});

export const importGuestTrainingSessionRequestSchema = z.strictObject({
  guestSessionId: z.string().trim().min(1).max(128),
  moduleId: uuidSchema,
  mode: z.enum(TRAINING_SESSION_MODES),
  contentVersion: semverSchema,
  randomSeed: z.string().trim().min(1).max(128),
  exerciseIds: z.array(uuidSchema).min(1),
  attempts: z.array(
    z.strictObject({
      exerciseId: uuidSchema,
      idempotencyKey: idempotencyKeySchema,
      submission: answerSubmissionRequestSchema,
      submittedAt: z.string().datetime({ offset: true }),
      durationMs: z.number().int().nonnegative().optional(),
    }),
  ),
  startedAt: z.string().datetime({ offset: true }),
  completedAt: z.string().datetime({ offset: true }).nullable(),
});

export const trainingSessionResponseSchema = z.strictObject({
  sessionId: uuidSchema,
  moduleId: uuidSchema,
  moduleSlug: z.string().min(1),
  mode: z.enum(TRAINING_SESSION_MODES),
  contentVersion: semverSchema,
  status: z.enum(["active", "completed", "abandoned"]),
  currentIndex: z.number().int().nonnegative(),
  exerciseIds: z.array(uuidSchema),
  randomSeed: z.string().min(1),
  startedAt: z.string().datetime({ offset: true }),
  completedAt: z.string().datetime({ offset: true }).nullable(),
});

const evaluationResponseBase = {
  exerciseId: uuidSchema,
  isCorrect: z.boolean(),
  score: z.number(),
  maxScore: z.number(),
  scoreRatio: z.number(),
  reasonCode: z.string().min(1),
};

export const submitTrainingAttemptResponseSchema = z.strictObject({
  attemptId: uuidSchema,
  attemptNumber: z.number().int().positive(),
  evaluation: z.discriminatedUnion("type", [
    z.strictObject({
      ...evaluationResponseBase,
      type: z.enum(["meaning-choice", "honorific-choice", "plain-choice", "single-choice"]),
    }),
    z.strictObject({
      ...evaluationResponseBase,
      type: z.literal("free-response"),
    }),
    z.strictObject({
      ...evaluationResponseBase,
      type: z.literal("fill-blank"),
    }),
    z.strictObject({
      ...evaluationResponseBase,
      type: z.enum(["matching-translation", "matching-honorific"]),
    }),
  ]),
  session: trainingSessionResponseSchema,
});

export type StartTrainingSessionRequest = z.infer<typeof startTrainingSessionRequestSchema>;
export type SubmitTrainingAttemptRequest = z.infer<typeof submitTrainingAttemptRequestSchema>;
export type CompleteTrainingSessionRequest = z.infer<typeof completeTrainingSessionRequestSchema>;
export type ImportGuestTrainingSessionRequest = z.infer<
  typeof importGuestTrainingSessionRequestSchema
>;
export type TrainingSessionResponse = z.infer<typeof trainingSessionResponseSchema>;
export type SubmitTrainingAttemptResponse = z.infer<typeof submitTrainingAttemptResponseSchema>;
