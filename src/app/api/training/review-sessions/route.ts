import type { NextRequest } from "next/server";

import { createReviewSessionRequestSchema } from "@/features/review/api/schemas";
import { createReviewSession } from "@/features/review/application/createReviewSession";
import { TrainingPersistenceError } from "@/features/training/application/errors";
import { trainingApiSuccessResponse } from "@/features/training/api/responses";
import { handleTrainingRoute } from "@/features/training/api/routeContext";

export async function POST(request: NextRequest) {
  return handleTrainingRoute(async ({ client, userId, request: routeRequest }) => {
    let raw: unknown = {};
    const text = await routeRequest.text();

    if (text.trim()) {
      try {
        raw = JSON.parse(text) as unknown;
      } catch {
        throw new TrainingPersistenceError(
          "VALIDATION_FAILED",
          "Request body must be valid JSON.",
          400,
        );
      }
    }

    const parsed = createReviewSessionRequestSchema.safeParse(raw);
    if (!parsed.success) {
      throw new TrainingPersistenceError(
        "VALIDATION_FAILED",
        "Invalid review session filters.",
        400,
      );
    }

    const session = await createReviewSession({
      client,
      userId,
      ...(parsed.data.skill === undefined ? {} : { skill: parsed.data.skill }),
      ...(parsed.data.unitSlug === undefined ? {} : { unitSlug: parsed.data.unitSlug }),
      ...(parsed.data.moduleId === undefined ? {} : { moduleId: parsed.data.moduleId }),
      ...(parsed.data.idempotencyKey === undefined
        ? {}
        : { idempotencyKey: parsed.data.idempotencyKey }),
    });

    return trainingApiSuccessResponse({ session }, 201);
  }, request);
}
